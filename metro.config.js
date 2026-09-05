const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.maxWorkers = Number(process.env.METRO_MAX_WORKERS || 2);

module.exports = config;
