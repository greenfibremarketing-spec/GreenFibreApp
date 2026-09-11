# Green Fibre Mobile App

Official React Native (Expo) mobile application for [Green Fibre](https://www.greenfibre.org/) — a sustainable, eco-friendly e-commerce platform with the mission **Sustainability, Simplified**.

## Tech Stack

- **Expo SDK 57** + **React Native 0.86** + **React 19**
- **React Navigation 7** — Native Stack, Bottom Tabs, Drawer
- **Redux Toolkit** + **redux-persist** + **AsyncStorage**
- **Axios** — Custom client with manual cookie-jar injection for cross-platform session persistence
- **Expo Image** — High-performance cached image rendering
- **React Native Reanimated 4** + **Gesture Handler 2** — 60fps micro-animations
- **Razorpay** — In-app checkout payment flow with server-side HMAC signature verification
- **EAS Build** — Automated cloud builds for Android APK (preview) and Google Play AAB (production)

## Project Structure

```
Green_fibre_application/
├── App.jsx                      # Root application with Redux Provider & PersistGate
├── index.js                     # Native entry point
├── app.json                     # Expo configuration & app identity
├── eas.json                     # EAS build & submission profiles
├── babel.config.js              # Babel preset & Reanimated plugin
├── android/                     # Prebuilt Android native project
│   ├── app/build.gradle         # Release signing & R8 minification config
│   ├── gradle.properties        # Hermes, New Architecture, Edge-to-Edge
│   └── app/proguard-rules.pro   # ProGuard / R8 keep rules
├── assets/                      # Brand icons, splash screens & adaptive icons
└── src/
    ├── api/
    │   ├── authClient.js        # Axios instance with cookie jar & auth interceptors
    │   ├── catalogClient.js     # Public catalog API client
    │   ├── cookieJar.js         # Persistent cookie management
    │   └── services/
    │       ├── greenFibreAuthService.js # Register, OTP, login, delete account
    │       ├── productService.js        # Live catalog & categories
    │       ├── cartService.js           # Server-side cart sync
    │       ├── orderService.js          # Order creation & tracking
    │       ├── razorpayService.js       # Razorpay order generation & verification
    │       ├── wishlistService.js       # Wishlist sync
    │       ├── blogService.js           # Articles & sustainability stories
    │       └── contactService.js        # Support & inquiries
    ├── components/
    │   ├── common/              # ScreenContainer, AppHeader, Button, CustomAlert
    │   ├── auth/                # AuthBootstrap & session initialization
    │   └── session/             # SessionSync
    ├── data/
    │   ├── content.js           # Website copy, values & badges
    │   ├── images.js            # Brand imagery assets
    │   └── legalContent.js      # Privacy Policy, Terms, Shipping, Refund policies
    ├── navigation/
    │   ├── RootNavigator.jsx    # Splash -> Auth / Main app stack
    │   ├── MainTabNavigator.jsx # Home, Shop, Sustainability, Orders, Profile
    │   └── DrawerNavigator.jsx  # About, Blogs, Gallery, Contact, Legal screens
    ├── screens/                 # 24 production-ready screens
    ├── store/                   # Redux store, slices, thunks, hooks
    └── theme/                   # Brand color tokens, typography & spacing
```

## Screen Inventory (24 Screens)

| # | Screen | Route Name | Description |
|---|--------|------------|-------------|
| 1 | Splash | `Splash` | Branded splash screen with animated launch |
| 2 | Onboarding | `Onboarding` | First-time user feature walkthrough |
| 3 | Home | Tab: `Home` | Featured categories, hero banners, curated collections |
| 4 | Shop | Tab: `Shop` | Dynamic catalog with search & filtering |
| 5 | Product Listing | `ProductListing` | Category-specific product grids |
| 6 | Product Details | `ProductDetails` | High-res gallery, specs, add-to-cart |
| 7 | Cart | `Cart` | Line item quantities, promo codes, price summary |
| 8 | Checkout | `Checkout` | Address form, PIN code lookup, payment selection |
| 9 | Razorpay Payment | `RazorpayPayment` | Secure WebView Razorpay checkout flow |
| 10 | Order Confirmation | `OrderConfirmation` | Real-time payment verification & receipt |
| 11 | My Orders | Tab: `Orders` | Order history with live delivery statuses |
| 12 | Track Order | `TrackOrder` | 4-stage visual order progress timeline |
| 13 | Sustainability | Tab: `Sustainability` | Eco-impact metrics & green initiatives |
| 14 | About Us | Drawer: `About` | Brand history, mission & values |
| 15 | Blogs | Drawer: `Blogs` | Articles & eco-living tips |
| 16 | Blog Details | `BlogDetails` | Full markdown article view |
| 17 | Gallery | Drawer: `Gallery` | Sustainable product showcase |
| 18 | Contact Us | Drawer: `Contact` | Support form with direct inquiry API |
| 19 | Login | `Login` | Email & password authentication |
| 20 | Register | `Register` | New user signup with phone & name |
| 21 | Verify OTP | `VerifyEmail` | 6-digit email OTP verification |
| 22 | Forgot Password | `ForgotPassword` | Password recovery via OTP |
| 23 | Reset Password | `ResetPassword` | New password submission |
| 24 | Profile | Tab: `Profile` | User stats, orders, wishlist, sign out, delete account |

## Authentication & Session Architecture

The application uses an enterprise-grade cookie jar strategy tailored for React Native:
- **Transport:** [`src/api/authClient.js`](file:///src/api/authClient.js) intercepts HTTP `Set-Cookie` headers and persists tokens securely in `AsyncStorage`.
- **Dual Verification:** Supports both HTTP-only session cookies and `Authorization: Bearer <token>` fallback headers.
- **Session Restoration:** [`src/components/auth/AuthBootstrap.jsx`](file:///src/components/auth/AuthBootstrap.jsx) validates stored session state against `/api/users/me` on every app launch.

## Google Play Compliance Features

1. **Account Deletion:** Built-in in-app account deletion under **Profile > Delete Account** with two-step confirmation, immediate local state wipe, and backend data purge request.
2. **Release Signing:** Configured in `android/app/build.gradle` to support EAS-managed keystores or production release credentials.
3. **Data Safety:** App collects only operational customer data (contact info, shipping address, order history). Payment card data is processed directly by Razorpay (PCI-DSS Level 1 compliant).
4. **Edge-to-Edge & Hermes:** Enabled by default for modern Android devices.
5. **R8 Minification:** Configured in `gradle.properties` and `proguard-rules.pro` for reduced bundle size.

## Build & Deployment Commands

```bash
# Install dependencies
npm install

# Start local development server
npx expo start

# Build standalone Android preview APK for internal testing
eas build --platform android --profile preview

# Build production Android App Bundle (AAB) for Google Play
eas build --platform android --profile production

# Submit directly to Google Play Internal Testing track
eas submit -p android
```
