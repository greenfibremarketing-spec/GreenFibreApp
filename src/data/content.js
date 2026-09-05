export const brand = {
    name: 'Green Fibre',
    tagline: 'Sustainability, Simplified',
    description: 'Eco-friendly products for conscious living. From sustainable home essentials to natural fibre solutions, we\'re here to make green living simple and accessible.',
    supportEmail: 'support@greenfibre.com',
    craftedBy: 'Aleczo Media Pvt. Ltd.',
    craftedByUrl: 'https://aleczo.com',
};
export const offerBarMessages = [
    'Free shipping on all orders',
    '100% Sustainable Products',
    'Carbon Neutral Delivery',
];
export const homeStats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '100+', label: 'Eco Products' },
    { value: '5 Years', label: 'Experience' },
];
export const aboutStats = [
    { value: '100k+', label: 'Happy Customers' },
    { value: '500+', label: 'Eco Products' },
    { value: '250k+', label: 'Trees Planted' },
    { value: '100%', label: 'Carbon Neutral' },
];
export const homeHero = {
    eyebrow: 'About Us',
    title: 'Sustainability, Simplified',
    paragraphs: [
        'At Green Fibre, we believe that sustainable living shouldn\'t be complicated. We\'re on a mission to make eco-friendly choices accessible, affordable, and beautiful.',
        'Every product in our collection is carefully curated to reduce environmental impact while enhancing your daily life. From biodegradable essentials to reusable innovations, we\'re here to help you build a greener future, one choice at a time.',
    ],
};
export const aboutContent = {
  heroTitle: "Building a Greener Future with Sustainable Solutions",

  heroSubtitle:
    "Green Fibre is committed to delivering innovative, eco-friendly, and biodegradable products that promote a cleaner, healthier, and more sustainable environment.",

  missionText:
    "Our mission is to reduce plastic pollution by providing high-quality, biodegradable, and environmentally responsible products that empower businesses and individuals to adopt sustainable practices.",

  values: [
    {
      title: "Sustainability",
      description:
        "We are dedicated to protecting the environment through eco-friendly and biodegradable solutions.",
    },
    {
      title: "Premium Quality",
      description:
        "Every product is manufactured with strict quality standards to ensure durability, reliability, and customer satisfaction.",
    },
    {
      title: "Innovation",
      description:
        "We continuously develop sustainable alternatives using advanced technology and environmentally conscious materials.",
    },
    {
      title: "Customer Commitment",
      description:
        "Our customers are at the heart of everything we do. We strive to deliver exceptional products and outstanding service.",
    },
  ],

  timeline: [
    {
      year: "2020",
      title: "The Beginning",
      description:
        "Green Fibre was founded with a simple mission: make sustainable living accessible to everyone.",
    },
    {
      year: "2021",
      title: "Growing Impact",
      description:
        "Reached 10,000+ customers and planted our first 50,000 trees through our reforestation program.",
    },
    {
      year: "2022",
      title: "Carbon Neutral",
      description:
        "Achieved carbon-neutral operations across our entire supply chain and delivery network.",
    },
    {
      year: "2023",
      title: "Expansion",
      description:
        "Expanded our product line to 500+ eco-friendly items and launched our zero-waste initiative.",
    },
    {
      year:"2024",
      title:"Community of 100k+",
      description:"Built a thriving community of conscious consumers making sustainable choices every day."
    },
   
  ],

  commitments: [
    "100% Eco-Friendly Products",
    "Biodegradable Solutions",
    "Sustainable Manufacturing",
    "Premium Quality Assurance",
    "Customer Satisfaction",
    "Responsible Environmental Practices",
  ],
};
// data/content.js
// data/content.js

// data/content.js

export const blogsContent = {
  title: "Our Blog",
  subtitle: "Insights, tutorials, and stories from our team",
  emptyMessage: "No articles available at the moment. Check back soon!",
  blogs: [
    {
      id: 1,
      title: "Getting Started with React Native",
      subtitle: "A beginner's guide to mobile development",
      excerpt: "Learn the fundamentals of React Native and build your first cross-platform app.",
      content:
        "React Native is a popular framework for building mobile apps using JavaScript and React. It allows you to create native-quality apps for iOS and Android from a single codebase.\n\nIn this guide, we'll cover the core concepts: components, state, props, navigation, and styling. You'll also learn how to set up your development environment and run your first app on a simulator or physical device.\n\nWe'll walk through building a simple to-do app, handling user input, managing state with hooks, and persisting data with AsyncStorage. By the end, you'll have a solid foundation to start your own React Native projects.",
      author: "Jane Doe",
      date: "July 7, 2026",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
      tags: ["React Native", "Mobile", "Beginner", "JavaScript"],
    },
    {
      id: 2,
      title: "Mastering Android Performance Optimization",
      subtitle: "Tips for smooth and efficient apps",
      excerpt: "Learn how to profile, optimize, and improve the performance of your Android applications.",
      content:
        "Performance is critical for user retention. Slow apps get uninstalled. In this deep dive, we'll explore the Android Profiler, identify memory leaks, optimize layouts, and reduce APK size.\n\nWe'll cover techniques like using `RecyclerView` for lists, optimizing image loading with Glide/Coil, and avoiding unnecessary object allocations. We'll also discuss the importance of background work with WorkManager and how to use `LiveData` and `Flow` effectively.\n\nFinally, we'll show you how to use Firebase Performance Monitoring to track real-world performance metrics and continuously improve your app.",
      author: "John Smith",
      date: "July 5, 2026",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=400&fit=crop",
      tags: ["Android", "Performance", "Optimization", "Kotlin"],
    },
    {
      id: 3,
      title: "State Management in React: Context vs Redux",
      subtitle: "Choosing the right tool for your project",
      excerpt: "A comprehensive comparison of React Context and Redux for managing application state.",
      content:
        "State management is a hot topic in React. With the introduction of hooks and Context API, many developers wonder if they still need Redux. This article will clarify the differences and help you decide.\n\nWe'll build a small e-commerce app using both approaches and compare code complexity, performance, and developer experience. You'll learn when to use Context for simple global state and when to reach for Redux (or Zustand) for complex, frequently-updated states.\n\nWe'll also discuss best practices for structuring your store, using middleware (like Redux Thunk), and handling side effects.",
      author: "Emily Johnson",
      date: "July 3, 2026",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
      tags: ["React", "State Management", "Redux", "Context"],
    },
    {
      id: 4,
      title: "Building a Custom Navigation Drawer in React Native",
      subtitle: "Enhance your app's UX with a branded drawer",
      excerpt: "Step-by-step guide to creating a fully customizable navigation drawer with animations.",
      content:
        "The default drawer from `@react-navigation/drawer` is great, but often you need a unique look. In this tutorial, we'll create a custom drawer component from scratch.\n\nWe'll use `react-native-gesture-handler` and `react-native-reanimated` to build smooth swipe gestures and animated transitions. You'll learn to customize the header, add profile sections, and integrate icons.\n\nWe'll also cover how to handle deep linking and navigation state persistence. By the end, you'll have a polished drawer that matches your brand identity.",
      author: "Michael Brown",
      date: "July 1, 2026",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop",
      tags: ["React Native", "Navigation", "UI/UX", "Animation"],
    },
    {
      id: 5,
      title: "Firebase Authentication for React Native Apps",
      subtitle: "Sign in with email, Google, and Facebook",
      excerpt: "Integrate Firebase Authentication quickly with our step-by-step guide.",
      content:
        "Firebase offers a robust authentication system that supports multiple providers. We'll set up email/password, Google Sign-In, and Facebook Login in a React Native app.\n\nYou'll learn to configure Firebase projects, install required packages, and handle user sessions securely. We'll also cover password reset, email verification, and linking multiple providers to one account.\n\nFinally, we'll show how to protect routes and manage user profiles using Firestore or Realtime Database.",
      author: "Sarah Wilson",
      date: "June 28, 2026",
      image: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=800&h=400&fit=crop",
      tags: ["Firebase", "Authentication", "React Native", "Security"],
    },
    {
      id: 6,
      title: "Efficient Image Caching in React Native",
      subtitle: "Improve load times and save bandwidth",
      excerpt: "Learn how to implement effective image caching strategies using libraries and custom solutions.",
      content:
        "Images are heavy. Without caching, your app will be slow and data-hungry. We'll explore `react-native-fast-image`, `expo-image`, and the built-in `Image` component with caching options.\n\nWe'll discuss cache policies (memory, disk, network), preloading, and placeholder strategies. You'll also learn to handle large image galleries with lazy loading and pagination.\n\nWe'll benchmark different approaches and provide recommendations based on use cases.",
      author: "David Lee",
      date: "June 25, 2026",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
      tags: ["React Native", "Images", "Performance", "Caching"],
    },
    {
      id: 7,
      title: "Testing React Native Apps with Jest and Detox",
      subtitle: "Write reliable tests for your mobile applications",
      excerpt: "Implement unit tests with Jest and end-to-end tests with Detox for robust QA.",
      content:
        "Testing is essential for maintaining quality. We'll set up Jest for unit testing components, reducers, and utility functions. Then we'll use Detox for end-to-end testing, simulating user interactions on real devices or emulators.\n\nYou'll learn to write testable code, mock dependencies, and run tests in CI/CD pipelines. We'll also cover snapshot testing and testing async operations. By the end, you'll have a comprehensive testing suite.",
      author: "Laura Green",
      date: "June 22, 2026",
      image: "https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=800&h=400&fit=crop",
      tags: ["Testing", "Jest", "Detox", "React Native"],
    },
    {
      id: 8,
      title: "Offline Support in React Native with Realm",
      subtitle: "Build a fully offline-first app",
      excerpt: "Use Realm Database to create a local-first application that syncs when online.",
      content:
        "Offline-first apps offer a seamless user experience even without internet. We'll integrate Realm Database in a React Native app, define schemas, and perform CRUD operations.\n\nYou'll learn to handle conflict resolution, sync with a remote server (using Realm Sync or custom logic), and manage data migrations. We'll also discuss offline authentication and caching strategies.\n\nThis guide will give you a powerful toolkit for building resilient mobile apps.",
      author: "Chris Martin",
      date: "June 20, 2026",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      tags: ["Realm", "Offline", "Database", "React Native"],
    },
    {
      id: 9,
      title: "Animating React Native Apps with Reanimated 2",
      subtitle: "Create smooth, gesture-driven animations",
      excerpt: "Dive into the new Reanimated 2 API for high-performance animations.",
      content:
        "Reanimated 2 brings a new declarative API that runs animations on the UI thread, ensuring 60fps. We'll cover shared values, worklets, and animated components.\n\nYou'll learn to build complex animations like drag-and-drop, pinch-to-zoom, and swipe-to-delete. We'll also combine gestures from `react-native-gesture-handler` to create interactive UIs.\n\nThis is a must-read for any developer looking to add polish to their app.",
      author: "Anna White",
      date: "June 18, 2026",
      image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=400&fit=crop",
      tags: ["Animations", "Reanimated", "React Native", "Gestures"],
    },
    {
      id: 10,
      title: "Deploying React Native Apps to the Play Store",
      subtitle: "A step-by-step guide to release your app",
      excerpt: "From signing keys to store listing – everything you need to publish on Google Play.",
      content:
        "Publishing an app can be daunting. We'll demystify the process: generating a signed APK/AAB, creating a Play Console account, setting up pricing and distribution, and filling out the store listing.\n\nWe'll also cover best practices for versioning, handling app updates, and using in-app updates. You'll learn how to prepare your app for production, including code obfuscation and reducing APK size.\n\nBy the end, your app will be ready for the world.",
      author: "Robert Taylor",
      date: "June 15, 2026",
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&h=400&fit=crop",
      tags: ["Deployment", "Android", "Play Store", "Release"],
    },
  ],
};
export const galleryContent = {
    title: 'Our Sustainable Gallery',
    subtitle: 'Explore moments, products, and collections inspired by sustainable living and eco-conscious craftsmanship.',
    emptyMessage: 'Gallery is currently empty.',
};
export const onboardingSlides = [
    {
        title: 'Sustainability, Simplified',
        description: 'Discover eco-friendly products that make sustainable living accessible, affordable, and beautiful.',
        imageKey: 'onboarding1',
    },
    {
        title: '100% Sustainable Products',
        description: 'Every product is carefully curated to reduce environmental impact while enhancing your daily life.',
        imageKey: 'onboarding2',
    },
    {
        title: 'Carbon Neutral Delivery',
        description: 'Free shipping on all orders with carbon-neutral delivery. One tree planted for every order.',
        imageKey: 'onboarding3',
    },
];
export const footerBadges = ['100% Sustainable', 'Carbon Neutral', 'Earth Friendly'];
export const productCategories = [
    { id: 'all', name: 'All Products', slug: 'all' },
    { id: 'home', name: 'Home Essentials', slug: 'home-essentials' },
    { id: 'fibre', name: 'Natural Fibre', slug: 'natural-fibre' },
    { id: 'reusable', name: 'Reusable Solutions', slug: 'reusable' },
    { id: 'garden', name: 'Garden Care', slug: 'garden-care' },
    { id: 'personal', name: 'Personal Care', slug: 'personal-care' },
];
