// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Linking,
//   Animated,
//   Switch,
//   Dimensions,
//   Alert,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import { Image } from "expo-image";
// import {
//   createDrawerNavigator,
//   DrawerContentScrollView,
//   DrawerItemList,
// } from "@react-navigation/drawer";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { brand, footerBadges } from "../data/content";
// import { images } from "../data/images";
// import { colors, spacing, typography } from "../theme";
// import { MainTabNavigator } from "./MainTabNavigator";
// import { AboutScreen } from "../screens/AboutScreen";
// import { BlogsScreen } from "../screens/BlogsScreen";
// import { GalleryScreen } from "../screens/GalleryScreen";
// import { ContactScreen } from "../screens/ContactScreen";
// import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
// import { TermsScreen } from "../screens/TermsScreen";
// import { ShippingPolicyScreen } from "../screens/ShippingPolicyScreen";
// import { RefundPolicyScreen } from "../screens/RefundPolicyScreen";
// import { useAppSelector, useAppDispatch } from "../store/hooks";
// import { logout } from "../store/slices/authSlice";
// import { WishlistScreen } from "../screens/WishlistScreen";

// const { width, height } = Dimensions.get("window");
// const Drawer = createDrawerNavigator();

// // FNP Brand Colors
// const fnpColors = {
//   primary: "#E91E63",
//   primaryLight: "#E8F5E9",
//   primaryDark: "#C2185B",
//   gold: "#FFD700",
//   goldLight: "#FFF8E1",
//   white: "#FFFFFF",
//   text: "#1A1A1A",
//   textSecondary: "#666666",
//   textMuted: "#999999",
//   borderLight: "#E8E8E8",
//   shadow: "#00000010",
//   success: "#4CAF50",
//   warning: "#FF9800",
//   danger: "#F44336",
// };

// function CustomDrawerContent({ ...props }) {
//   const { navigation } = props;
//   const dispatch = useAppDispatch();

//   const user = useAppSelector((state) => state.auth.user);
//   const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [isOrdersExpanded, setIsOrdersExpanded] = useState(false);
//   const [ordersAnimate] = useState(new Animated.Value(0));

//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(20)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const toggleOrders = () => {
//     setIsOrdersExpanded(!isOrdersExpanded);
//     Animated.timing(ordersAnimate, {
//       toValue: isOrdersExpanded ? 0 : 1,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   };

//   const quickActions = [
//     {
//       icon: "call-outline",
//       label: "Call",
//       color: fnpColors.primary,
//       badge: "24/7",
//       action: () => Linking.openURL("tel:+919876543210"),
//     },
//     {
//       icon: "logo-whatsapp",
//       label: "WhatsApp",
//       color: "#25D366",
//       badge: "Chat",
//       action: () => Linking.openURL("whatsapp://send?phone=+919876543210"),
//     },
//     {
//       icon: "mail-outline",
//       label: "Email",
//       color: "#FF6F00",
//       badge: "Support",
//       action: () => Linking.openURL("mailto:support@fnp.com"),
//     },
//     {
//       icon: "chatbubble-outline",
//       label: "Live Chat",
//       color: "#2196F3",
//       badge: "Online",
//       action: () => navigation.navigate("Contact"),
//     },
//   ];

//   const goToProfile = () => {
//     if (isAuthenticated) {
//       navigation.navigate("Tabs", { screen: "Profile" });
//     } else {
//       navigation.navigate("Login");
//     }
//   };

//   const handleLogout = () => {
//     Alert.alert(
//       "Logout",
//       "Are you sure you want to logout?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Logout",
//           style: "destructive",
//           onPress: () => {
//             dispatch(logout());
//             navigation.closeDrawer();
//           },
//         },
//       ],
//       { cancelable: true },
//     );
//   };

//   const goToLogin = () => {
//     navigation.closeDrawer();
//     navigation.navigate("Login");
//   };

//   const navigateToWishlist = () => {
//     navigation.closeDrawer();
//     if (isAuthenticated) {
//       navigation.navigate("Wishlist");
//     } else {
//       navigation.navigate("Login");
//     }
//   };

//   const goToSignup = () => {
//     navigation.closeDrawer();
//     navigation.navigate("Register");
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <DrawerContentScrollView
//         {...props}
//         contentContainerStyle={styles.drawerContent}
//         showsVerticalScrollIndicator={false}
//         bounces={false}
//       >
//         <Animated.View
//           style={{
//             opacity: fadeAnim,
//             transform: [{ translateY: slideAnim }],
//             flex: 1,
//           }}
//         >
//           {/* ===== HEADER WITH GRADIENT ===== */}
//           <LinearGradient
//             colors={[fnpColors.primary, fnpColors.primaryDark]}
//             style={styles.drawerHeader}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           >
//             <View style={styles.drawerHeaderContent}>
//               <View style={styles.drawerLogoContainer}>
//                 <Image
//                   source={{
//                     uri:
//                       images.logo ||
//                       "https://via.placeholder.com/120x40/FFFFFF/FFFFFF?text=Logo",
//                   }}
//                   style={styles.drawerLogo}
//                   contentFit="contain"
//                 />
//                 <View style={styles.drawerBrandBadge}>
//                   <Text style={styles.drawerBrandText}>Premium</Text>
//                 </View>
//               </View>
//               <Text style={styles.drawerTagline}>🌱 Sustainable Living</Text>
//             </View>
//           </LinearGradient>

//           {/* ===== USER PROFILE SECTION ===== */}
//           {isAuthenticated ? (
//             <TouchableOpacity
//               style={styles.userSection}
//               onPress={goToProfile}
//               activeOpacity={0.8}
//             >
//               <View style={styles.userAvatarContainer}>
//                 <Image
//                   source={{
//                     uri:
//                       user?.avatar ||
//                       "https://via.placeholder.com/100/FFFFFF/FFFFFF?text=User",
//                   }}
//                   style={styles.userAvatar}
//                   contentFit="cover"
//                 />
//                 <View style={styles.onlineDot} />
//                 <View style={styles.membershipBadge}>
//                   <Text style={styles.membershipText}>
//                     {user?.membership || "Gold"}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.userInfo}>
//                 <Text style={styles.userName}>{user?.name || "User"}</Text>
//                 <Text style={styles.userEmail}>
//                   {user?.email || "user@email.com"}
//                 </Text>
//                 <View style={styles.pointsRow}>
//                   <Ionicons name="star" size={14} color={fnpColors.gold} />
//                   <Text style={styles.pointsText}>
//                     {user?.points || 0} points
//                   </Text>
//                 </View>
//               </View>
//               <TouchableOpacity
//                 style={styles.logoutButton}
//                 onPress={handleLogout}
//               >
//                 <Ionicons
//                   name="log-out-outline"
//                   size={20}
//                   color={fnpColors.danger}
//                 />
//               </TouchableOpacity>
//             </TouchableOpacity>
//           ) : (
//             <View style={styles.authSection}>
//               <View style={styles.authAvatarContainer}>
//                 <View style={styles.authAvatarPlaceholder}>
//                   <Ionicons
//                     name="person-outline"
//                     size={40}
//                     color={fnpColors.white}
//                   />
//                 </View>
//               </View>
//               <Text style={styles.authTitle}>Welcome!</Text>
//               <Text style={styles.authSubtitle}>
//                 Sign in to access your account
//               </Text>
//               <View style={styles.authButtons}>
//                 <TouchableOpacity
//                   style={[styles.authButton, styles.loginButton]}
//                   onPress={goToLogin}
//                 >
//                   <Text style={styles.authButtonText}>Login</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={[styles.authButton, styles.signupButton]}
//                   onPress={goToSignup}
//                 >
//                   <Text
//                     style={[styles.authButtonText, styles.signupButtonText]}
//                   >
//                     Sign Up
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {/* ===== SEARCH BAR ===== */}
//           <TouchableOpacity
//             style={styles.searchBar}
//             onPress={() => Alert.alert("Search", "Open search functionality")}
//             activeOpacity={0.7}
//           >
//             <Ionicons
//               name="search-outline"
//               size={20}
//               color={fnpColors.textMuted}
//             />
//             <Text style={styles.searchPlaceholder}>Search products...</Text>
//             <Ionicons
//               name="mic-outline"
//               size={20}
//               color={fnpColors.primary}
//               style={styles.micIcon}
//             />
//           </TouchableOpacity>

//           {/* ===== NOTIFICATION BAR ===== */}
//           <TouchableOpacity
//             style={styles.notificationBar}
//             onPress={() =>
//               Alert.alert(
//                 "Notifications",
//                 `You have ${user?.notifications || 0} new notifications`,
//               )
//             }
//             activeOpacity={0.7}
//           >
//             <View style={styles.notificationLeft}>
//               <View style={styles.notificationIconWrap}>
//                 <Ionicons
//                   name="notifications-outline"
//                   size={20}
//                   color={fnpColors.primary}
//                 />
//                 {(user?.notifications || 0) > 0 && (
//                   <View style={styles.notificationBadge}>
//                     <Text style={styles.notificationBadgeText}>
//                       {user?.notifications || 0}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//               <Text style={styles.notificationText}>
//                 You have {user?.notifications || 0} new updates
//               </Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={18}
//               color={fnpColors.textMuted}
//             />
//           </TouchableOpacity>

//           {/* ===== QUICK ACTIONS ===== */}
//           <View style={styles.quickActionsContainer}>
//             {quickActions.map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.quickAction,
//                   { backgroundColor: item.color + "12" },
//                 ]}
//                 onPress={item.action}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.quickActionIcon}>
//                   <Ionicons name={item.icon} size={22} color={item.color} />
//                   {item.badge && (
//                     <View
//                       style={[
//                         styles.quickActionBadge,
//                         { backgroundColor: item.color },
//                       ]}
//                     >
//                       <Text style={styles.quickActionBadgeText}>
//                         {item.badge}
//                       </Text>
//                     </View>
//                   )}
//                 </View>
//                 <Text style={[styles.quickActionLabel, { color: item.color }]}>
//                   {item.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* ===== RECENT ORDERS (Expandable) ===== */}
//           {isAuthenticated && user?.orders && user.orders.length > 0 && (
//             <>
//               <TouchableOpacity
//                 style={styles.expandableHeader}
//                 onPress={toggleOrders}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.expandableLeft}>
//                   <Ionicons
//                     name="receipt-outline"
//                     size={20}
//                     color={fnpColors.primary}
//                   />
//                   <Text style={styles.expandableTitle}>Recent Orders</Text>
//                   <View style={styles.orderCountBadge}>
//                     <Text style={styles.orderCountText}>
//                       {user.orders.length}
//                     </Text>
//                   </View>
//                 </View>
//                 <Animated.View
//                   style={{
//                     transform: [
//                       {
//                         rotate: ordersAnimate.interpolate({
//                           inputRange: [0, 1],
//                           outputRange: ["0deg", "180deg"],
//                         }),
//                       },
//                     ],
//                   }}
//                 >
//                   <Ionicons
//                     name="chevron-down"
//                     size={20}
//                     color={fnpColors.textSecondary}
//                   />
//                 </Animated.View>
//               </TouchableOpacity>

//               <Animated.View
//                 style={[
//                   styles.expandableContent,
//                   {
//                     maxHeight: ordersAnimate.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [0, 150],
//                     }),
//                   },
//                 ]}
//               >
//                 {user.orders.map((order, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     style={styles.orderItem}
//                     onPress={() =>
//                       Alert.alert("Order Details", `Order ${order.id}`)
//                     }
//                     activeOpacity={0.7}
//                   >
//                     <View style={styles.orderIcon}>
//                       <Ionicons
//                         name={order.icon || "checkmark-circle"}
//                         size={16}
//                         color={
//                           order.status === "Delivered"
//                             ? fnpColors.success
//                             : fnpColors.warning
//                         }
//                       />
//                     </View>
//                     <View style={styles.orderInfo}>
//                       <Text style={styles.orderId}>{order.id}</Text>
//                       <Text style={styles.orderStatus}>{order.status}</Text>
//                     </View>
//                     <Text style={styles.orderDate}>{order.date}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </Animated.View>
//             </>
//           )}

//           {/* ===== DIVIDER ===== */}
//           <View style={styles.divider} />

//           {/* ===== DRAWER ITEMS ===== */}
//           <View style={styles.drawerItemsContainer}>
//             <DrawerItemList {...props} />
//           </View>

//           {/* ===== DIVIDER ===== */}
//           <View style={styles.divider} />

//           {/* ===== ADDITIONAL QUICK LINKS ===== */}
//           <View style={styles.additionalLinks}>
//             <Text style={styles.additionalLinksTitle}>Quick Access</Text>

//             <TouchableOpacity
//               style={styles.additionalLink}
//               onPress={() => {
//                 navigation.closeDrawer();
//                 navigation.navigate("Gallery");
//               }}
//             >
//               <Ionicons
//                 name="images-outline"
//                 size={20}
//                 color={fnpColors.primary}
//               />
//               <Text style={styles.additionalLinkText}>Gallery</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.additionalLink}
//               onPress={navigateToWishlist}
//             >
//               <Ionicons
//                 name="heart-outline"
//                 size={20}
//                 color={fnpColors.primary}
//               />
//               <Text style={styles.additionalLinkText}>My Wishlist</Text>
//               {isAuthenticated && user?.wishlistItems > 0 && (
//                 <View style={styles.additionalLinkBadge}>
//                   <Text style={styles.additionalLinkBadgeText}>
//                     {user.wishlistItems}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.additionalLink}
//               onPress={() => {
//                 navigation.closeDrawer();
//                 if (isAuthenticated) {
//                   navigation.navigate("Cart");
//                 } else {
//                   navigation.navigate("Login");
//                 }
//               }}
//             >
//               <Ionicons
//                 name="cart-outline"
//                 size={20}
//                 color={fnpColors.primary}
//               />
//               <Text style={styles.additionalLinkText}>My Cart</Text>
//               {isAuthenticated && user?.cartItems > 0 && (
//                 <View style={styles.additionalLinkBadge}>
//                   <Text style={styles.additionalLinkBadgeText}>
//                     {user.cartItems}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.additionalLink}
//               onPress={() => {
//                 navigation.closeDrawer();
//                 navigation.navigate("Blogs");
//               }}
//             >
//               <Ionicons
//                 name="newspaper-outline"
//                 size={20}
//                 color={fnpColors.primary}
//               />
//               <Text style={styles.additionalLinkText}>Blogs & Articles</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.additionalLink}
//               onPress={goToProfile}
//             >
//               <Ionicons
//                 name="person-outline"
//                 size={20}
//                 color={fnpColors.primary}
//               />
//               <Text style={styles.additionalLinkText}>
//                 {isAuthenticated ? "My Profile" : "Login"}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* ===== DIVIDER ===== */}
//           <View style={styles.divider} />

//           {/* ===== DARK MODE TOGGLE ===== */}
//           <View style={styles.toggleSection}>
//             <View style={styles.toggleLeft}>
//               <Ionicons
//                 name="moon-outline"
//                 size={20}
//                 color={fnpColors.textSecondary}
//               />
//               <Text style={styles.toggleLabel}>Dark Mode</Text>
//             </View>
//             <Switch
//               value={isDarkMode}
//               onValueChange={setIsDarkMode}
//               trackColor={{ false: "#E8E8E8", true: fnpColors.primary }}
//               thumbColor={isDarkMode ? fnpColors.white : fnpColors.white}
//             />
//           </View>

//           {/* ===== DRAWER FOOTER ===== */}
//           <View style={styles.drawerFooter}>
//             <View style={styles.footerBadges}>
//               {footerBadges.map((badge, i) => (
//                 <View key={i} style={styles.badgeRow}>
//                   <Ionicons name="leaf" size={14} color={fnpColors.success} />
//                   <Text style={styles.badgeText}>{badge}</Text>
//                 </View>
//               ))}
//             </View>

//             <View style={styles.socialLinks}>
//               <Text style={styles.socialTitle}>Follow Us</Text>
//               <View style={styles.socialIcons}>
//                 {[
//                   { icon: "logo-instagram", color: "#E4405F" },
//                   { icon: "logo-facebook", color: "#1877F2" },
//                   { icon: "logo-youtube", color: "#FF0000" },
//                   { icon: "logo-twitter", color: "#1DA1F2" },
//                 ].map((item, i) => (
//                   <TouchableOpacity
//                     key={i}
//                     style={styles.socialIcon}
//                     onPress={() =>
//                       Alert.alert(
//                         "Social",
//                         `Follow us on ${item.icon.replace("logo-", "")}`,
//                       )
//                     }
//                     activeOpacity={0.7}
//                   >
//                     <Ionicons name={item.icon} size={22} color={item.color} />
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>

//             <Text style={styles.copyright}>
//               © 2026 {brand.name || "Green Fibre"}
//             </Text>

//             <View style={styles.versionInfo}>
//               <Text style={styles.versionText}>Version 2.4.1</Text>
//               <View style={styles.versionDot} />
//               <Text style={styles.versionText}>Made with ❤️</Text>
//             </View>
//           </View>
//         </Animated.View>
//       </DrawerContentScrollView>
//     </SafeAreaView>
//   );
// }

// export function DrawerNavigator() {
//   return (
//     <Drawer.Navigator
//       drawerContent={(props) => <CustomDrawerContent {...props} />}
//       screenOptions={{
//         headerShown: false,
//         drawerActiveTintColor: fnpColors.primary,
//         drawerInactiveTintColor: fnpColors.textSecondary,
//         drawerActiveBackgroundColor: fnpColors.primaryLight,
//         drawerLabelStyle: {
//           fontSize: 15,
//           fontWeight: "500",
//           marginLeft: -8,
//         },
//         drawerStyle: {
//           backgroundColor: fnpColors.white,
//           width: Math.min(width * 0.85, 340), // Responsive width
//         },
//         drawerItemStyle: {
//           borderRadius: 12,
//           marginHorizontal: 12,
//           marginVertical: 2,
//         },
//         swipeEdgeWidth: width * 0.3,
//         swipeMinDistance: 30,
//       }}
//     >
//       <Drawer.Screen
//         name="Tabs"
//         component={MainTabNavigator}
//         options={{
//           drawerLabel: "Home",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="home-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="About"
//         component={AboutScreen}
//         options={{
//           drawerLabel: "About Us",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons
//               name="information-circle-outline"
//               size={size}
//               color={color}
//             />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="Blogs"
//         component={BlogsScreen}
//         options={{
//           drawerLabel: "Blogs",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="newspaper-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="Wishlist"
//         component={WishlistScreen}
//         options={{
//           drawerLabel: "Wishlist",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="heart-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="Gallery"
//         component={GalleryScreen}
//         options={{
//           drawerLabel: "Gallery",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="images-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="Contact"
//         component={ContactScreen}
//         options={{
//           drawerLabel: "Contact Us",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="mail-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="PrivacyPolicy"
//         component={PrivacyPolicyScreen}
//         options={{
//           drawerLabel: "Privacy Policy",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="shield-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="Terms"
//         component={TermsScreen}
//         options={{
//           drawerLabel: "Terms & Conditions",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="document-text-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="ShippingPolicy"
//         component={ShippingPolicyScreen}
//         options={{
//           drawerLabel: "Shipping Policy",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons name="car-outline" size={size} color={color} />
//           ),
//         }}
//       />

//       <Drawer.Screen
//         name="RefundPolicy"
//         component={RefundPolicyScreen}
//         options={{
//           drawerLabel: "Refund Policy",
//           drawerIcon: ({ color, size }) => (
//             <Ionicons
//               name="return-down-back-outline"
//               size={size}
//               color={color}
//             />
//           ),
//         }}
//       />
//     </Drawer.Navigator>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: fnpColors.white,
//   },
//   drawerContent: {
//     flexGrow: 1,
//     backgroundColor: fnpColors.white,
//     paddingBottom: 20,
//   },

//   // ===== DRAWER HEADER =====
//   drawerHeader: {
//     paddingTop: 20,
//     paddingBottom: 16,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 0,
//     borderBottomRightRadius: 0,
//   },
//   drawerHeaderContent: {
//     alignItems: "center",
//   },
//   drawerLogoContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   drawerLogo: {
//     width: 100,
//     height: 32,
//   },
//   drawerBrandBadge: {
//     backgroundColor: "rgba(255,255,255,0.2)",
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//     marginLeft: 8,
//   },
//   drawerBrandText: {
//     color: fnpColors.white,
//     fontSize: 9,
//     fontWeight: "700",
//     textTransform: "uppercase",
//   },
//   drawerTagline: {
//     color: "rgba(255,255,255,0.85)",
//     fontSize: 11,
//     fontWeight: "500",
//   },

//   // ===== USER SECTION (Authenticated) =====
//   userSection: {
//     flexDirection: "row",
//     padding: 14,
//     paddingTop: 16,
//     backgroundColor: fnpColors.primaryLight,
//     marginBottom: 6,
//     alignItems: "center",
//   },
//   userAvatarContainer: {
//     position: "relative",
//     marginRight: 12,
//   },
//   userAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: fnpColors.white,
//   },
//   onlineDot: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: fnpColors.success,
//     borderWidth: 2,
//     borderColor: fnpColors.white,
//   },
//   membershipBadge: {
//     position: "absolute",
//     top: -4,
//     right: -4,
//     backgroundColor: fnpColors.gold,
//     paddingHorizontal: 5,
//     paddingVertical: 1,
//     borderRadius: 6,
//   },
//   membershipText: {
//     fontSize: 7,
//     fontWeight: "700",
//     color: fnpColors.white,
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: fnpColors.text,
//   },
//   userEmail: {
//     fontSize: 11,
//     color: fnpColors.textMuted,
//     marginTop: 1,
//   },
//   pointsRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 2,
//     gap: 4,
//   },
//   pointsText: {
//     fontSize: 11,
//     color: fnpColors.textSecondary,
//     fontWeight: "500",
//   },
//   logoutButton: {
//     padding: 6,
//     marginLeft: 2,
//   },

//   // ===== AUTH SECTION (Not Authenticated) =====
//   authSection: {
//     padding: 16,
//     backgroundColor: fnpColors.primaryLight,
//     marginBottom: 6,
//     alignItems: "center",
//   },
//   authAvatarContainer: {
//     marginBottom: 8,
//   },
//   authAvatarPlaceholder: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: fnpColors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   authTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: fnpColors.text,
//     marginBottom: 2,
//   },
//   authSubtitle: {
//     fontSize: 12,
//     color: fnpColors.textSecondary,
//     marginBottom: 12,
//   },
//   authButtons: {
//     flexDirection: "row",
//     gap: 10,
//     width: "100%",
//   },
//   authButton: {
//     flex: 1,
//     paddingVertical: 8,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   loginButton: {
//     backgroundColor: fnpColors.primary,
//   },
//   signupButton: {
//     backgroundColor: "transparent",
//     borderWidth: 2,
//     borderColor: fnpColors.primary,
//   },
//   authButtonText: {
//     color: fnpColors.white,
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   signupButtonText: {
//     color: fnpColors.primary,
//   },

//   // ===== SEARCH BAR =====
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F5F5F5",
//     borderRadius: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     marginHorizontal: 14,
//     marginBottom: 6,
//     gap: 8,
//   },
//   searchPlaceholder: {
//     flex: 1,
//     fontSize: 13,
//     color: fnpColors.textMuted,
//   },
//   micIcon: {
//     marginLeft: 2,
//   },

//   // ===== NOTIFICATION BAR =====
//   notificationBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     marginHorizontal: 14,
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     marginBottom: 6,
//   },
//   notificationLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   notificationIconWrap: {
//     position: "relative",
//   },
//   notificationBadge: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     backgroundColor: fnpColors.danger,
//     borderRadius: 6,
//     minWidth: 14,
//     height: 14,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 3,
//   },
//   notificationBadgeText: {
//     fontSize: 8,
//     fontWeight: "700",
//     color: fnpColors.white,
//   },
//   notificationText: {
//     fontSize: 12,
//     color: fnpColors.textSecondary,
//   },

//   // ===== QUICK ACTIONS =====
//   quickActionsContainer: {
//     flexDirection: "row",
//     paddingHorizontal: 14,
//     gap: 6,
//     marginBottom: 10,
//   },
//   quickAction: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 6,
//     borderRadius: 10,
//     backgroundColor: "#F8F9FA",
//   },
//   quickActionIcon: {
//     position: "relative",
//   },
//   quickActionBadge: {
//     position: "absolute",
//     top: -4,
//     right: -8,
//     paddingHorizontal: 3,
//     paddingVertical: 1,
//     borderRadius: 4,
//   },
//   quickActionBadgeText: {
//     fontSize: 6,
//     fontWeight: "700",
//     color: fnpColors.white,
//   },
//   quickActionLabel: {
//     fontSize: 9,
//     fontWeight: "600",
//     marginTop: 1,
//   },

//   // ===== EXPANDABLE ORDERS =====
//   expandableHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     marginHorizontal: 14,
//     backgroundColor: "#F8F9FA",
//     borderRadius: 10,
//     marginBottom: 2,
//   },
//   expandableLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   expandableTitle: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: fnpColors.text,
//   },
//   orderCountBadge: {
//     backgroundColor: fnpColors.primary,
//     borderRadius: 8,
//     paddingHorizontal: 5,
//     paddingVertical: 1,
//     marginLeft: 2,
//   },
//   orderCountText: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: fnpColors.white,
//   },
//   expandableContent: {
//     overflow: "hidden",
//     marginHorizontal: 14,
//   },
//   orderItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: fnpColors.borderLight,
//   },
//   orderIcon: {
//     marginRight: 6,
//   },
//   orderInfo: {
//     flex: 1,
//   },
//   orderId: {
//     fontSize: 12,
//     fontWeight: "500",
//     color: fnpColors.text,
//   },
//   orderStatus: {
//     fontSize: 10,
//     color: fnpColors.textMuted,
//   },
//   orderDate: {
//     fontSize: 10,
//     color: fnpColors.textMuted,
//   },

//   // ===== DIVIDER =====
//   divider: {
//     height: 1,
//     backgroundColor: fnpColors.borderLight,
//     marginVertical: 6,
//     marginHorizontal: 14,
//   },

//   // ===== DRAWER ITEMS =====
//   drawerItemsContainer: {
//     flex: 1,
//   },

//   // ===== ADDITIONAL LINKS =====
//   additionalLinks: {
//     paddingHorizontal: 14,
//     marginVertical: 4,
//   },
//   additionalLinksTitle: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: fnpColors.textMuted,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     marginBottom: 4,
//   },
//   additionalLink: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 2,
//     gap: 14,
//   },
//   additionalLinkText: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: "500",
//     color: fnpColors.text,
//   },
//   additionalLinkBadge: {
//     backgroundColor: fnpColors.primary,
//     borderRadius: 8,
//     paddingHorizontal: 6,
//     paddingVertical: 1,
//   },
//   additionalLinkBadgeText: {
//     color: fnpColors.white,
//     fontSize: 10,
//     fontWeight: "600",
//   },

//   // ===== TOGGLE =====
//   toggleSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     marginHorizontal: 14,
//   },
//   toggleLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//   },
//   toggleLabel: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: fnpColors.text,
//   },

//   // ===== FOOTER =====
//   drawerFooter: {
//     padding: 20,
//     paddingTop: 12,
//   },
//   footerBadges: {
//     marginBottom: 12,
//   },
//   badgeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginBottom: 2,
//   },
//   badgeText: {
//     fontSize: 11,
//     color: fnpColors.textMuted,
//   },
//   socialLinks: {
//     marginBottom: 12,
//   },
//   socialTitle: {
//     fontSize: 11,
//     color: fnpColors.textMuted,
//     marginBottom: 6,
//     fontWeight: "600",
//   },
//   socialIcons: {
//     flexDirection: "row",
//     gap: 14,
//   },
//   socialIcon: {
//     padding: 2,
//   },
//   copyright: {
//     fontSize: 10,
//     color: fnpColors.textMuted,
//     textAlign: "center",
//     marginTop: 6,
//   },
//   versionInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 6,
//     gap: 6,
//   },
//   versionText: {
//     fontSize: 9,
//     color: fnpColors.textMuted,
//   },
//   versionDot: {
//     width: 2,
//     height: 2,
//     borderRadius: 1,
//     backgroundColor: fnpColors.textMuted,
//   },
// });
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
  Alert,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { brand, footerBadges } from "../data/content";
import { images } from "../data/images";
import { colors, spacing, typography } from "../theme";
import { MainTabNavigator } from "./MainTabNavigator";
import { AboutScreen } from "../screens/AboutScreen";
import { BlogsScreen } from "../screens/BlogsScreen";
import { GalleryScreen } from "../screens/GalleryScreen";
import { ContactScreen } from "../screens/ContactScreen";
import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
import { TermsScreen } from "../screens/TermsScreen";
import { ShippingPolicyScreen } from "../screens/ShippingPolicyScreen";
import { RefundPolicyScreen } from "../screens/RefundPolicyScreen";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { WishlistScreen } from "../screens/WishlistScreen";

const { width, height } = Dimensions.get("window");
const Drawer = createDrawerNavigator();

// Premium Green Fibre Brand Colors — Cream & Forest Green
const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  primarySurface: "#F0F7F1",
  gold: "#D4A843",
  goldLight: "#FBF5E6",
  white: "#FFFFFF",
  cream: "#FAF7F2",
  creamDark: "#F0EBE3",
  creamAccent: "#EDE8DF",
  text: "#2C2C2C",
  textSecondary: "#6B6B6B",
  textMuted: "#9E9E9E",
  borderLight: "#E8E3DA",
  shadow: "rgba(43, 30, 10, 0.06)",
  success: "#388E3C",
  warning: "#E6A817",
  danger: "#C62828",
  earth: "#8B7355",
};

function CustomDrawerContent({ ...props }) {
  const { navigation } = props;
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [isOrdersExpanded, setIsOrdersExpanded] = useState(false);
  const [ordersAnimate] = useState(new Animated.Value(0));

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleOrders = () => {
    setIsOrdersExpanded(!isOrdersExpanded);
    Animated.timing(ordersAnimate, {
      toValue: isOrdersExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Quick actions - only essential ones
  const quickActions = [
    {
      icon: "call-outline",
      label: "Call",
      color: fnpColors.primary,
      badge: "24/7",
      action: () => Linking.openURL("tel:+919876543210"),
    },
    {
      icon: "logo-whatsapp",
      label: "WhatsApp",
      color: "#25D366",
      badge: "Chat",
      action: () => Linking.openURL("whatsapp://send?phone=+919876543210"),
    },
    {
      icon: "mail-outline",
      label: "Email",
      color: "#FF6F00",
      badge: "Support",
      action: () => Linking.openURL("mailto:support@fnp.com"),
    },
    {
      icon: "chatbubble-outline",
      label: "Live Chat",
      color: "#2196F3",
      badge: "Online",
      action: () => navigation.navigate("Contact"),
    },
  ];

  const goToProfile = () => {
    if (isAuthenticated) {
      navigation.navigate("Tabs", { screen: "Profile" });
    } else {
      navigation.navigate("Login");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            dispatch(logout());
            navigation.closeDrawer();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const goToLogin = () => {
    navigation.closeDrawer();
    navigation.navigate("Login");
  };

  const goToSignup = () => {
    navigation.closeDrawer();
    navigation.navigate("Register");
  };

  // Navigate to screens
  const navigateTo = (screen) => {
    navigation.closeDrawer();
    navigation.navigate(screen);
  };

  const navigateToProtected = (screen) => {
    navigation.closeDrawer();
    if (isAuthenticated) {
      navigation.navigate(screen);
    } else {
      navigation.navigate("Login");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            flex: 1,
          }}
        >
          {/* ===== HEADER WITH GRADIENT ===== */}
          <LinearGradient
            colors={[fnpColors.primary, fnpColors.primaryDark]}
            style={styles.drawerHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.drawerHeaderContent}>
              <View style={styles.drawerLogoContainer}>
                <Image
                  source={{
                    uri:
                      images.logo ||
                      "https://www.greenfibre.org/logo-main.png",
                  }}
                  style={styles.drawerLogo}
                  contentFit="contain"
                />
                <View style={styles.drawerBrandBadge}>
                  <Text style={styles.drawerBrandText}>Premium</Text>
                </View>
              </View>
              <Text style={styles.drawerTagline}>🌱 Sustainable Living</Text>
            </View>
          </LinearGradient>

          {/* ===== USER PROFILE SECTION ===== */}
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.userSection}
              onPress={goToProfile}
              activeOpacity={0.8}
            >
              <View style={styles.userAvatarContainer}>
                <Image
                  source={{
                    uri:
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
                  }}
                  style={styles.userAvatar}
                  contentFit="cover"
                />
                <View style={styles.onlineDot} />
                <View style={styles.membershipBadge}>
                  <Text style={styles.membershipText}>
                    {user?.membership || "Gold"}
                  </Text>
                </View>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || "User"}</Text>
                <Text style={styles.userEmail}>
                  {user?.email || "user@email.com"}
                </Text>
                <View style={styles.pointsRow}>
                  <Ionicons name="star" size={14} color={fnpColors.gold} />
                  <Text style={styles.pointsText}>
                    {user?.points || 0} points
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={fnpColors.danger}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <View style={styles.authSection}>
              <View style={styles.authAvatarContainer}>
                <View style={styles.authAvatarPlaceholder}>
                  <Ionicons
                    name="person-outline"
                    size={40}
                    color={fnpColors.white}
                  />
                </View>
              </View>
              <Text style={styles.authTitle}>Welcome!</Text>
              <Text style={styles.authSubtitle}>
                Sign in to access your account
              </Text>
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={[styles.authButton, styles.loginButton]}
                  onPress={goToLogin}
                >
                  <Text style={styles.authButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.authButton, styles.signupButton]}
                  onPress={goToSignup}
                >
                  <Text
                    style={[styles.authButtonText, styles.signupButtonText]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ===== SEARCH BAR ===== */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => Alert.alert("Search", "Open search functionality")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={fnpColors.textMuted}
            />
            <Text style={styles.searchPlaceholder}>Search products...</Text>
            <Ionicons
              name="mic-outline"
              size={20}
              color={fnpColors.primary}
              style={styles.micIcon}
            />
          </TouchableOpacity>

          {/* ===== NOTIFICATION BAR ===== */}
          <TouchableOpacity
            style={styles.notificationBar}
            onPress={() =>
              Alert.alert(
                "Notifications",
                `You have ${user?.notifications || 0} new notifications`,
              )
            }
            activeOpacity={0.7}
          >
            <View style={styles.notificationLeft}>
              <View style={styles.notificationIconWrap}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={fnpColors.primary}
                />
                {(user?.notifications || 0) > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {user?.notifications || 0}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.notificationText}>
                You have {user?.notifications || 0} new updates
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={fnpColors.textMuted}
            />
          </TouchableOpacity>

          {/* ===== QUICK ACTIONS ===== */}
          <View style={styles.quickActionsContainer}>
            {quickActions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickAction,
                  { backgroundColor: item.color + "12" },
                ]}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                  {item.badge && (
                    <View
                      style={[
                        styles.quickActionBadge,
                        { backgroundColor: item.color },
                      ]}
                    >
                      <Text style={styles.quickActionBadgeText}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.quickActionLabel, { color: item.color }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ===== RECENT ORDERS (Expandable) ===== */}
          {isAuthenticated && user?.orders && user.orders.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.expandableHeader}
                onPress={toggleOrders}
                activeOpacity={0.7}
              >
                <View style={styles.expandableLeft}>
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color={fnpColors.primary}
                  />
                  <Text style={styles.expandableTitle}>Recent Orders</Text>
                  <View style={styles.orderCountBadge}>
                    <Text style={styles.orderCountText}>
                      {user.orders.length}
                    </Text>
                  </View>
                </View>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: ordersAnimate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={fnpColors.textSecondary}
                  />
                </Animated.View>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.expandableContent,
                  {
                    maxHeight: ordersAnimate.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 150],
                    }),
                  },
                ]}
              >
                {user.orders.map((order, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.orderItem}
                    onPress={() =>
                      Alert.alert("Order Details", `Order ${order.id}`)
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.orderIcon}>
                      <Ionicons
                        name={order.icon || "checkmark-circle"}
                        size={16}
                        color={
                          order.status === "Delivered"
                            ? fnpColors.success
                            : fnpColors.warning
                        }
                      />
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.orderStatus}>{order.status}</Text>
                    </View>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </>
          )}

          {/* ===== DIVIDER ===== */}
          <View style={styles.divider} />

          {/* ===== DRAWER ITEMS (Navigation) ===== */}
          <View style={styles.drawerItemsContainer}>
            <DrawerItemList {...props} />
          </View>

          {/* ===== DIVIDER ===== */}
          <View style={styles.divider} />

          {/* ===== DIVIDER ===== */}
          <View style={styles.divider} />

          {/* ===== DRAWER FOOTER ===== */}
          <View style={styles.drawerFooter}>
            {/* Footer Badges */}
            <View style={styles.footerBadges}>
              {footerBadges.map((badge, i) => (
                <View key={i} style={styles.badgeRow}>
                  <Ionicons name="leaf" size={14} color={fnpColors.success} />
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>

            {/* ===== FOLLOW US - Social Links ===== */}
            <View style={styles.socialLinks}>
              <Text style={styles.socialTitle}>Follow Us</Text>
              <View style={styles.socialIcons}>
                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL("https://www.instagram.com/")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL("https://www.facebook.com/")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL("https://www.youtube.com/")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-youtube" size={24} color="#FF0000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL("https://twitter.com/")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Copyright */}
            <Text style={styles.copyright}>
              © 2026 {brand.name || "Green Fibre"}
            </Text>

            {/* Version Info */}
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>Version 2.4.1</Text>
              <View style={styles.versionDot} />
              <Text style={styles.versionText}>Made with ❤️</Text>
            </View>
          </View>
        </Animated.View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: fnpColors.primary,
        drawerInactiveTintColor: fnpColors.textSecondary,
        drawerActiveBackgroundColor: fnpColors.primaryLight,
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "500",
          marginLeft: -8,
          letterSpacing: 0.2,
        },
        drawerStyle: {
          backgroundColor: fnpColors.cream,
          width: Math.min(width * 0.85, 340),
        },
        drawerItemStyle: {
          borderRadius: 14,
          marginHorizontal: 12,
          marginVertical: 3,
        },
        swipeEdgeWidth: width * 0.3,
        swipeMinDistance: 30,
      }}
    >
      {/* Main Screens */}
      <Drawer.Screen
        name="Tabs"
        component={MainTabNavigator}
        options={{
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          drawerLabel: "My Wishlist",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{
          drawerLabel: "About Us",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="information-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Blogs"
        component={BlogsScreen}
        options={{
          drawerLabel: "Blogs",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          drawerLabel: "Gallery",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="images-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          drawerLabel: "Contact Us",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Policy Screens */}
      <Drawer.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          drawerLabel: "Privacy Policy",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          drawerLabel: "Terms & Conditions",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="ShippingPolicy"
        component={ShippingPolicyScreen}
        options={{
          drawerLabel: "Shipping Policy",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="RefundPolicy"
        component={RefundPolicyScreen}
        options={{
          drawerLabel: "Refund Policy",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="return-down-back-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: fnpColors.cream,
  },
  drawerContent: {
    flexGrow: 1,
    backgroundColor: fnpColors.cream,
    paddingBottom: 20,
  },

  // ===== DRAWER HEADER =====
  drawerHeader: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  drawerHeaderContent: {
    alignItems: "center",
  },
  drawerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  drawerLogo: {
    width: 110,
    height: 36,
  },
  drawerBrandBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  drawerBrandText: {
    color: fnpColors.white,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  drawerTagline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // ===== USER SECTION (Authenticated) =====
  userSection: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 18,
    backgroundColor: fnpColors.creamDark,
    marginBottom: 8,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  userAvatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: fnpColors.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: fnpColors.success,
    borderWidth: 2,
    borderColor: fnpColors.creamDark,
  },
  membershipBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: fnpColors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  membershipText: {
    fontSize: 7,
    fontWeight: "700",
    color: fnpColors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: fnpColors.text,
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 11,
    color: fnpColors.textMuted,
    marginTop: 2,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    color: fnpColors.primary,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 8,
    marginLeft: 4,
    backgroundColor: "rgba(198, 40, 40, 0.08)",
    borderRadius: 10,
  },

  // ===== AUTH SECTION (Not Authenticated) =====
  authSection: {
    padding: 20,
    backgroundColor: fnpColors.creamDark,
    marginBottom: 8,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  authAvatarContainer: {
    marginBottom: 10,
  },
  authAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: fnpColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  authTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  authSubtitle: {
    fontSize: 13,
    color: fnpColors.textSecondary,
    marginBottom: 14,
  },
  authButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  authButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: fnpColors.primary,
  },
  signupButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: fnpColors.primary,
  },
  authButtonText: {
    color: fnpColors.white,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  signupButtonText: {
    color: fnpColors.primary,
  },

  // ===== SEARCH BAR =====
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: fnpColors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: fnpColors.textMuted,
  },
  micIcon: {
    marginLeft: 2,
  },

  // ===== NOTIFICATION BAR =====
  notificationBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 14,
    backgroundColor: fnpColors.primarySurface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.1)",
  },
  notificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notificationIconWrap: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: fnpColors.danger,
    borderRadius: 6,
    minWidth: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: fnpColors.white,
  },
  notificationText: {
    fontSize: 12,
    color: fnpColors.textSecondary,
  },

  // ===== QUICK ACTIONS =====
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: fnpColors.white,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  quickActionIcon: {
    position: "relative",
  },
  quickActionBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  quickActionBadgeText: {
    fontSize: 6,
    fontWeight: "700",
    color: fnpColors.white,
  },
  quickActionLabel: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
  },

  // ===== EXPANDABLE ORDERS =====
  expandableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 14,
    backgroundColor: fnpColors.white,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  expandableLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  expandableTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: fnpColors.text,
  },
  orderCountBadge: {
    backgroundColor: fnpColors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  orderCountText: {
    fontSize: 9,
    fontWeight: "700",
    color: fnpColors.white,
  },
  expandableContent: {
    overflow: "hidden",
    marginHorizontal: 14,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: fnpColors.borderLight,
  },
  orderIcon: {
    marginRight: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 13,
    fontWeight: "500",
    color: fnpColors.text,
  },
  orderStatus: {
    fontSize: 10,
    color: fnpColors.textMuted,
    marginTop: 1,
  },
  orderDate: {
    fontSize: 10,
    color: fnpColors.textMuted,
  },

  // ===== DIVIDER =====
  divider: {
    height: 1,
    backgroundColor: fnpColors.borderLight,
    marginVertical: 8,
    marginHorizontal: 18,
  },

  // ===== DRAWER ITEMS =====
  drawerItemsContainer: {
    flex: 1,
    paddingTop: 4,
  },

  // ===== FOOTER =====
  drawerFooter: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: fnpColors.creamDark,
    marginHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  footerBadges: {
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    color: fnpColors.textSecondary,
    fontWeight: "500",
  },
  socialLinks: {
    marginBottom: 14,
  },
  socialTitle: {
    fontSize: 12,
    color: fnpColors.text,
    marginBottom: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  socialIcons: {
    flexDirection: "row",
    gap: 16,
  },
  socialIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: fnpColors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  copyright: {
    fontSize: 10,
    color: fnpColors.textMuted,
    textAlign: "center",
    marginTop: 10,
  },
  versionInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    gap: 6,
  },
  versionText: {
    fontSize: 9,
    color: fnpColors.textMuted,
  },
  versionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: fnpColors.textMuted,
  },
});
