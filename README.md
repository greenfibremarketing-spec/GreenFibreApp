# Green Fibre Mobile App

React Native (Expo) mobile app recreating [greenfibre.org](https://www.greenfibre.org/) — an eco-friendly e-commerce brand with the tagline **Sustainability, Simplified**.

## Tech Stack

- **Expo** (~SDK 57) + **React Native**
- **React Navigation** — Stack, Bottom Tabs, Drawer
- **Redux Toolkit** + **redux-persist** + **AsyncStorage**
- **Axios** — API client (ready for backend)
- **Expo Image** — optimized image loading
- **React Native Reanimated** + **Gesture Handler** — animations
- **Expo Video** — included (no videos on website currently)

## Project Structure

```
green-fibre-app/
├── App.tsx                      # Root app with Redux Provider
├── index.ts                     # Entry point (gesture handler)
├── babel.config.js              # Reanimated plugin
├── app.json                     # Expo config
├── assets/                      # App icons & splash
└── src/
    ├── api/
    │   ├── client.ts            # Axios instance with auth interceptor
    │   └── services/
    │       ├── authService.ts
    │       ├── contactService.ts
    │       ├── orderService.ts
    │       └── productService.ts
    ├── components/common/
    │   ├── AppHeader.tsx        # Logo + cart + drawer menu
    │   ├── Button.tsx
    │   ├── EmptyState.tsx
    │   ├── ErrorState.tsx
    │   ├── Input.tsx
    │   ├── LegalPageView.tsx
    │   ├── LoadingSkeleton.tsx
    │   ├── OfferBar.tsx         # Scrolling promo bar
    │   ├── ProductCard.tsx
    │   ├── ScreenContainer.tsx
    │   ├── SectionHeader.tsx
    │   └── StatCard.tsx
    ├── data/
    │   ├── content.ts           # All website copy & stats
    │   ├── images.ts            # Image URLs from greenfibre.org
    │   ├── legalContent.ts      # Privacy, Terms, Shipping, Refund
    │   └── mockProducts.ts      # 8 eco-friendly mock products
    ├── navigation/
    │   ├── DrawerNavigator.tsx  # Company & legal pages
    │   ├── MainTabNavigator.tsx # Home, Shop, Impact, Orders, Profile
    │   └── RootNavigator.tsx    # Splash → Onboarding → Main stack
    ├── screens/                 # All 24 screens
    │   ├── SplashScreen.tsx
    │   ├── OnboardingScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── ShopScreen.tsx
    │   ├── ProductListingScreen.tsx
    │   ├── ProductDetailsScreen.tsx
    │   ├── CartScreen.tsx
    │   ├── CheckoutScreen.tsx
    │   ├── AboutScreen.tsx
    │   ├── SustainabilityScreen.tsx
    │   ├── BlogsScreen.tsx
    │   ├── BlogDetailsScreen.tsx
    │   ├── GalleryScreen.tsx
    │   ├── ContactScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── ForgotPasswordScreen.tsx
    │   ├── MyOrdersScreen.tsx
    │   ├── TrackOrderScreen.tsx
    │   ├── PrivacyPolicyScreen.tsx
    │   ├── TermsScreen.tsx
    │   ├── ShippingPolicyScreen.tsx
    │   ├── RefundPolicyScreen.tsx
    │   └── ProfileScreen.tsx
    ├── store/
    │   ├── index.ts             # Store + persist config
    │   ├── hooks.ts
    │   └── slices/
    │       ├── authSlice.ts
    │       ├── cartSlice.ts
    │       ├── ordersSlice.ts
    │       ├── productsSlice.ts
    │       ├── uiSlice.ts
    │       └── wishlistSlice.ts
    ├── theme/
    │   ├── colors.ts            # Green, cream, earth tones
    │   ├── spacing.ts
    │   └── typography.ts
    ├── types/index.ts
    └── utils/helpers.ts
```

## Screens (24)

| # | Screen | Route |
|---|--------|-------|
| 1 | Splash | Stack: `Splash` |
| 2 | Onboarding | Stack: `Onboarding` |
| 3 | Home | Tab: `Home` |
| 4 | Shop | Tab: `Shop` |
| 5 | Product Listing | Stack: `ProductListing` |
| 6 | Product Details | Stack: `ProductDetails` |
| 7 | Cart | Stack: `Cart` |
| 8 | Checkout | Stack: `Checkout` |
| 9 | About | Drawer: `About` |
| 10 | Sustainability | Tab: `Sustainability` |
| 11 | Blogs | Drawer: `Blogs` |
| 12 | Blog Details | Stack: `BlogDetails` |
| 13 | Gallery | Drawer: `Gallery` |
| 14 | Contact | Drawer: `Contact` |
| 15 | Login | Stack: `Login` |
| 16 | Register | Stack: `Register` |
| 17 | Forgot Password | Stack: `ForgotPassword` |
| 18 | My Orders | Tab: `Orders` |
| 19 | Track Order | Stack: `TrackOrder` |
| 20 | Privacy Policy | Drawer: `PrivacyPolicy` |
| 21 | Terms & Conditions | Drawer: `Terms` |
| 22 | Shipping Policy | Drawer: `ShippingPolicy` |
| 23 | Refund Policy | Drawer: `RefundPolicy` |
| 24 | Profile | Tab: `Profile` |

## Navigation

- **Bottom Tabs:** Home, Shop, Impact (Sustainability), Orders, Profile
- **Drawer:** About, Blogs, Gallery, Contact, Legal pages
- **Stack modals:** Cart, Login, Register, Product Details, Checkout

## Getting Started

```bash
cd C:\Users\PERFECT\Projects\green-fibre-app
npm install
npm start
```

Then press `a` for Android or scan QR with Expo Go.

## Mock Auth

Any email + password (6+ chars) will sign in. Registration creates a local session persisted via AsyncStorage.

## Backend Integration

Update `src/api/client.ts` `BASE_URL` when the Green Fibre API is available. Service layer in `src/api/services/` is ready to swap mock implementations for real API calls.

## Brand Colors

| Token | Hex |
|-------|-----|
| Primary | `#16a34a` |
| Primary Dark | `#15803d` |
| Cream | `#faf8f5` |
| Earth | `#8b7355` |

## Images

Actual website images used from `https://www.greenfibre.org/`:
- `logo-main.png`
- `greenfiber-logo.png`
- `home-about.jpg`

Product/placeholder images use Unsplash eco-themed photos where the website had no product catalog.
