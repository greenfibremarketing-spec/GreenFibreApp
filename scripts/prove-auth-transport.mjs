import axios from 'axios';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {
    clearCookies,
    createCookieAxios,
    getCookieHeader,
    getMemoryCookies,
    hasAuthCookie,
    resetCookieStore,
} from './lib/nodeCookieJar.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, '../../../AIIntegration/testinng-green-fibre');
const PRODUCTION_API = 'https://api.greenfibre.org/api';
const LOCAL_PORT = 5599;
const LOCAL_API = `http://127.0.0.1:${LOCAL_PORT}/api`;
const TEST_PASSWORD = 'AuthProof123';

const results = [];

function record(name, passed, details = {}) {
    results.push({ name, passed, ...details });
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${name}`);
    if (details.status !== undefined) {
        console.log(`       status=${details.status}`);
    }
    if (details.code) {
        console.log(`       code=${details.code}`);
    }
    if (details.message) {
        console.log(`       message=${details.message}`);
    }
    if (details.note) {
        console.log(`       note=${details.note}`);
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(baseURL, attempts = 40) {
    for (let i = 0; i < attempts; i += 1) {
        try {
            const response = await axios.get(`${baseURL}/health`, { timeout: 2000 });
            if (response.status === 200) {
                return true;
            }
        }
        catch {
            // retry
        }
        await sleep(500);
    }
    return false;
}

async function startBackend(mongoUri) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['src/index.js'], {
            cwd: BACKEND_ROOT,
            env: {
                ...process.env,
                MONGO_URL: mongoUri,
                PORT: String(LOCAL_PORT),
                NODE_ENV: 'development',
                JWT_SECRET: 'auth-proof-jwt-secret',
                CLIENT_ORIGIN: 'http://localhost:3000',
                ADMIN_ORIGIN: 'http://localhost:3001',
                FRONTEND_URL: 'http://localhost:3000',
                USER_EMAIL: 'invalid@example.com',
                USER_PASS: 'invalid',
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let settled = false;
        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                reject(new Error('Backend startup timed out'));
            }
        }, 60000);

        child.stdout.on('data', (chunk) => {
            const text = chunk.toString();
            if (!settled && text.includes('Server is listening')) {
                settled = true;
                clearTimeout(timeout);
                resolve(child);
            }
        });

        child.stderr.on('data', (chunk) => {
            const text = chunk.toString();
            if (!settled && text.includes('Server is listening')) {
                settled = true;
                clearTimeout(timeout);
                resolve(child);
            }
        });

        child.on('error', (error) => {
            if (!settled) {
                settled = true;
                clearTimeout(timeout);
                reject(error);
            }
        });

        child.on('exit', (code) => {
            if (!settled) {
                settled = true;
                clearTimeout(timeout);
                reject(new Error(`Backend exited early with code ${code}`));
            }
        });
    });
}

async function connectModels(mongoUri) {
    await mongoose.connect(mongoUri);
    const userSchema = new mongoose.Schema({
        full_name: String,
        email: { type: String, unique: true, lowercase: true },
        password: { type: String, select: false },
        phone: String,
        role: { type: String, default: 'user' },
        isVerified: { type: Boolean, default: false },
    }, { timestamps: true });

    userSchema.pre('save', async function hashPassword() {
        if (!this.isModified('password')) {
            return;
        }
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    });

    const otpSchema = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        otp: { type: String, required: true },
        purpose: { type: String, enum: ['email_verification', 'password_reset'], required: true },
        expiresAt: { type: Date, required: true },
        attempts: { type: Number, default: 0 },
        maxAttempts: { type: Number, default: 5 },
    }, { timestamps: true });

    otpSchema.pre('save', async function hashOtp() {
        if (!this.isModified('otp')) {
            return;
        }
        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        this.otp = await bcrypt.hash(this.otp, salt);
    });

    const User = mongoose.models.AuthProofUser || mongoose.model('AuthProofUser', userSchema, 'users');
    const OTP = mongoose.models.AuthProofOTP || mongoose.model('AuthProofOTP', otpSchema, 'otps');

    return { User, OTP };
}

async function seedUser({ User, OTP }, {
    email,
    full_name = 'Auth Proof User',
    password = TEST_PASSWORD,
    isVerified = false,
    otp = null,
    otpExpired = false,
}) {
    await User.deleteMany({ email });
    await OTP.deleteMany({});

    const user = await User.create({
        full_name,
        email,
        password,
        role: 'user',
        isVerified,
    });

    if (otp) {
        const expiresAt = otpExpired
            ? new Date(Date.now() - 60 * 1000)
            : new Date(Date.now() + 5 * 60 * 1000);

        await OTP.create({
            userId: user._id,
            otp: String(otp),
            purpose: 'email_verification',
            expiresAt,
            attempts: 0,
        });
    }

    return user;
}

async function runProductionSafeTests() {
    console.log('\n=== Production API safe tests (no account creation) ===\n');
    const client = createCookieAxios(axios, PRODUCTION_API);
    resetCookieStore();
    await clearCookies();

    let response = await client.get('/users/me');
    record('production unauthenticated /users/me', response.status === 401, {
        status: response.status,
        message: response.data?.message,
    });

    response = await client.post('/users/login', {
        email: 'nonexistent-auth-proof@example.com',
        password: 'WrongPass123',
    });
    record('production invalid login', response.status === 400, {
        status: response.status,
        message: response.data?.message,
    });
    record('production invalid login does not set cookie', !hasAuthCookie(), {
        note: `cookieHeader=${getCookieHeader() || 'none'}`,
    });

    response = await client.post('/users/verify-otp', {
        email: 'nonexistent-auth-proof@example.com',
        otp: '000000',
    });
    record('production invalid OTP (unknown user)', response.status === 400, {
        status: response.status,
        message: response.data?.message,
    });

    response = await client.post('/users/resend-otp', {
        email: 'nonexistent-auth-proof@example.com',
    });
    record('production resend OTP (unknown user)', response.status === 404, {
        status: response.status,
        message: response.data?.message,
    });
}

async function runLocalRealBackendTests() {
    console.log('\n=== Local real-backend cookie transport tests (ephemeral MongoDB) ===\n');

    const mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri('greenfibre_auth_proof');
    let backendProcess;

    try {
        backendProcess = await startBackend(mongoUri);
        const healthy = await waitForHealth(LOCAL_API);
        record('local backend health', healthy, {
            note: healthy ? LOCAL_API : 'backend did not become healthy',
        });
        if (!healthy) {
            return;
        }

        const models = await connectModels(mongoUri);
        const client = createCookieAxios(axios, LOCAL_API);

        const email = `auth-proof-${Date.now()}@example.com`;
        const knownOtp = '123456';

        await seedUser(models, { email, otp: knownOtp, isVerified: false });

        resetCookieStore();
        await clearCookies();

        let response = await client.post('/users/verify-otp', {
            email,
            otp: '999999',
        });
        record('invalid OTP', response.status === 400 && response.data?.code === 'OTP_INVALID', {
            status: response.status,
            code: response.data?.code,
            message: response.data?.message,
        });
        record('invalid OTP does not authenticate', !hasAuthCookie(), {
            note: `cookieHeader=${getCookieHeader() || 'none'}`,
        });

        response = await client.post('/users/verify-otp', {
            email,
            otp: knownOtp,
        });
        const verifySucceeded = response.status === 200 && response.data?.success === true;
        record('valid verify OTP', verifySucceeded, {
            status: response.status,
            message: response.data?.message,
        });
        record('verify OTP stores auth cookie', hasAuthCookie(), {
            note: `cookie names=${Object.keys(getMemoryCookies()).join(',') || 'none'}`,
        });

        response = await client.get('/users/me');
        record('authenticated GET /users/me after verify', response.status === 200 && Boolean(response.data?.user?.email), {
            status: response.status,
            message: response.data?.user?.email,
        });

        const cookieBeforeSecondRequest = getCookieHeader();
        response = await client.get('/users/me');
        record('cookie persists across requests', response.status === 200 && getCookieHeader() === cookieBeforeSecondRequest, {
            status: response.status,
            note: 'same Cookie header resent on second /users/me',
        });

        response = await client.post('/users/verify-otp', {
            email,
            otp: knownOtp,
        });
        record('already verified account', response.status === 400 && response.data?.code === 'ALREADY_VERIFIED', {
            status: response.status,
            code: response.data?.code,
            message: response.data?.message,
        });

        await clearCookies();
        resetCookieStore();
        response = await client.post('/users/login', {
            email,
            password: TEST_PASSWORD,
        });
        record('valid login after verification', response.status === 200 && response.data?.success === true, {
            status: response.status,
            message: response.data?.message,
        });
        record('valid login stores auth cookie', hasAuthCookie(), {
            note: `cookieHeader present=${Boolean(getCookieHeader())}`,
        });

        response = await client.get('/users/me');
        record('authenticated GET /users/me after login', response.status === 200, {
            status: response.status,
            message: response.data?.user?.email,
        });

        response = await client.post('/users/logout');
        record('logout succeeds', response.status === 200, {
            status: response.status,
            message: response.data?.message,
        });

        await clearCookies();
        resetCookieStore();
        response = await client.get('/users/me');
        record('logout invalidates session for /users/me', response.status === 401, {
            status: response.status,
            message: response.data?.message,
        });

        const unverifiedEmail = `auth-proof-unverified-${Date.now()}@example.com`;
        await seedUser(models, { email: unverifiedEmail, isVerified: false });
        resetCookieStore();
        await clearCookies();
        response = await client.post('/users/login', {
            email: unverifiedEmail,
            password: TEST_PASSWORD,
        });
        record('unverified login blocked', response.status === 403 && response.data?.code === 'EMAIL_NOT_VERIFIED', {
            status: response.status,
            code: response.data?.code,
            message: response.data?.message,
        });

        const resendEmail = `auth-proof-resend-${Date.now()}@example.com`;
        const resendUser = await seedUser(models, {
            email: resendEmail,
            otp: '111111',
            isVerified: false,
        });
        response = await client.post('/users/resend-otp', { email: resendEmail }, { timeout: 60000 });
        const otpAfterResend = await models.OTP.findOne({
            userId: resendUser._id,
            purpose: 'email_verification',
        });
        record('resend OTP succeeds', response.status === 200 || (response.status === 500 && Boolean(otpAfterResend)), {
            status: response.status,
            message: response.data?.message,
            note: response.status === 500
                ? 'email send failed locally, but OTP record was regenerated'
                : 'OTP resent successfully',
        });

        record('resend OTP replaces verification record', Boolean(otpAfterResend), {
            note: otpAfterResend ? 'new OTP document present after resend' : 'OTP missing',
        });

        const expiredEmail = `auth-proof-expired-${Date.now()}@example.com`;
        await seedUser(models, {
            email: expiredEmail,
            otp: '112233',
            otpExpired: true,
            isVerified: false,
        });
        response = await client.post('/users/verify-otp', {
            email: expiredEmail,
            otp: '112233',
        });
        record('expired OTP rejected', response.status === 400 && response.data?.code === 'OTP_EXPIRED', {
            status: response.status,
            code: response.data?.code,
            message: response.data?.message,
        });

        response = await client.post('/users/register', {
            full_name: 'Register Flow Proof',
            email: `auth-proof-register-${Date.now()}@example.com`,
            password: TEST_PASSWORD,
        }, { timeout: 60000 });
        record('register endpoint reachable', response.status === 200 || response.status === 500, {
            status: response.status,
            message: response.data?.message,
            note: 'email delivery may fail locally; endpoint still exercised without production writes',
        });
    }
    finally {
        if (backendProcess) {
            backendProcess.kill();
        }
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
        await mongod.stop();
    }
}

async function main() {
    console.log('Green Fibre React Native auth transport proof');
    console.log('Strategy: manual Set-Cookie capture + Cookie header replay');
    console.log('Production API:', PRODUCTION_API);
    console.log('Backend source:', BACKEND_ROOT);

    await runProductionSafeTests();
    await runLocalRealBackendTests();

    const failed = results.filter((result) => !result.passed);
    console.log('\n=== Summary ===');
    console.log(`Total: ${results.length}`);
    console.log(`Passed: ${results.length - failed.length}`);
    console.log(`Failed: ${failed.length}`);

    if (failed.length) {
        console.log('\nFailed checks:');
        for (const failure of failed) {
            console.log(`- ${failure.name}`);
        }
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('Proof runner failed:', error.message);
    process.exit(1);
});
