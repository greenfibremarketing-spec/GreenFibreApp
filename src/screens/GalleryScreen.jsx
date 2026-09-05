// import React, { useMemo, useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Pressable,
//   Modal,
//   Image,
//   Dimensions,
//   StatusBar,
//   TouchableOpacity,
//   Platform,
//   Animated,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import * as Haptics from "expo-haptics";

// import { galleryContent } from "../data/content";
// import { ScreenContainer } from "../components/common/ScreenContainer";
// import { SectionHeader } from "../components/common/SectionHeader";
// import { EmptyState } from "../components/common/EmptyState";
// import { colors, spacing, typography, shadows } from "../theme";
// import { useAppSelector } from "../store/hooks";

// const { width, height } = Dimensions.get("window");
// const HORIZONTAL_PADDING = 16;
// const GAP = 12;
// const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - GAP) / 2;

// // FNP-Inspired Color Palette
// const FNP_COLORS = {
//   primary: "#2E7D32",
//   primaryLight: "#E8F5E9",
//   primaryDark: "#1B5E20",
//   accent: "#FFD700",
//   gold: "#F57F17",
//   surface: "#FFFFFF",
//   text: "#1A1A1A",
//   textSecondary: "#666666",
//   textLight: "#999999",
//   border: "#F0F0F0",
//   shadow: "rgba(0,0,0,0.08)",
// };

// const getImageSource = (image) => {
//   if (!image) return null;
//   if (typeof image === "string") return { uri: image };
//   return image;
// };

// // ✅ NEW: Gallery Card Component (moved outside)
// const GalleryCard = React.memo(({ item, index, onPress }) => {
//   const imageSource = getImageSource(item.image);
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 400,
//       delay: index * 60,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.97,
//       friction: 5,
//       tension: 50,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       friction: 5,
//       tension: 50,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePress = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     onPress(item);
//   };

//   return (
//     <Animated.View
//       style={[
//         styles.cardWrapper,
//         {
//           opacity: fadeAnim,
//           transform: [{ scale: scaleAnim }],
//         },
//       ]}
//     >
//       <Pressable
//         android_ripple={{ color: "#E8F5E9", borderless: false, radius: 18 }}
//         style={styles.card}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         onPress={handlePress}
//       >
//         {/* Image Container */}
//         <View style={styles.imageContainer}>
//           {imageSource ? (
//             <Image source={imageSource} style={styles.image} />
//           ) : (
//             <View style={styles.noImageBox}>
//               <Ionicons name="image-outline" size={34} color="#CCC" />
//               <Text style={styles.noImageText}>No Image</Text>
//             </View>
//           )}

//           {/* FNP-Style Badges */}
//           {item.isNew && (
//             <View style={styles.newBadge}>
//               <Text style={styles.badgeText}>NEW</Text>
//             </View>
//           )}

//           {item.rating && item.rating > 4.5 && (
//             <View style={styles.ratingBadge}>
//               <Ionicons name="star" size={12} color="#FFD700" />
//               <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
//             </View>
//           )}

//           {/* FNP-Style Quick Action Button */}
//           <TouchableOpacity
//             style={styles.quickActionBtn}
//             activeOpacity={0.7}
//             onPress={(e) => {
//               e.stopPropagation();
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//               // Quick action - you can add to cart or wishlist
//             }}
//           >
//             <Ionicons name="heart-outline" size={16} color="#1A1A1A" />
//           </TouchableOpacity>
//         </View>

//         {/* FNP-Style Info Box */}
//         <View style={styles.infoBox}>
//           <Text style={styles.title} numberOfLines={1}>
//             {item.title}
//           </Text>

//           <View style={styles.priceRow}>
//             {item.price ? (
//               <Text style={styles.price}>₹{item.price}</Text>
//             ) : null}
//             {item.rating && (
//               <View style={styles.miniRating}>
//                 <Ionicons name="star" size={10} color="#FFD700" />
//                 <Text style={styles.miniRatingText}>
//                   {item.rating.toFixed(1)}
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* FNP-Style Category Tag */}
//           {item.category && item.category !== "Uncategorized" && (
//             <View style={styles.categoryTag}>
//               <Text style={styles.categoryTagText}>{item.category}</Text>
//             </View>
//           )}
//         </View>
//       </Pressable>
//     </Animated.View>
//   );
// });

// // ✅ NEW: Category Chip Component
// const CategoryChip = React.memo(({ category, isActive, onPress }) => {
//   return (
//     <TouchableOpacity
//       style={[styles.categoryChip, isActive && styles.categoryChipActive]}
//       activeOpacity={0.7}
//       onPress={() => {
//         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         onPress(category);
//       }}
//     >
//       <Text
//         style={[
//           styles.categoryChipText,
//           isActive && styles.categoryChipTextActive,
//         ]}
//       >
//         {category}
//       </Text>
//       {isActive && <View style={styles.categoryChipDot} />}
//     </TouchableOpacity>
//   );
// });

// export function GalleryScreen() {
//   const navigation = useNavigation();
//   const products = useAppSelector((s) => s.products.products);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // FNP-Inspired Categories with Icons
//   const categories = useMemo(() => {
//     const allItems =
//       products?.map((item, index) => ({
//         id: item._id || item.id || String(index),
//         title: item.name || `Product ${index + 1}`,
//         image: item.image || item.imageUrl || item.photo,
//         price: item.price,
//         category: item.category || "Uncategorized",
//         rating: item.rating || 4 + Math.random() * 0.9,
//         isNew: Math.random() > 0.7,
//       })) || [];

//     // Extract unique categories
//     const uniqueCats = [
//       "All",
//       ...new Set(allItems.map((item) => item.category).filter(Boolean)),
//     ];
//     return { items: allItems, categories: uniqueCats };
//   }, [products]);

//   const filteredItems = useMemo(() => {
//     if (selectedCategory === "All") return categories.items;
//     return categories.items.filter(
//       (item) => item.category === selectedCategory,
//     );
//   }, [categories.items, selectedCategory]);

//   // FNP-Style Animation for modal open
//   const openModal = (item) => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     setSelectedImage(item);
//     Animated.parallel([
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 8,
//         tension: 40,
//         useNativeDriver: true,
//       }),
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const closeModal = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start(() => setSelectedImage(null));
//   };

//   // Handle category selection
//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//   };

//   return (
//     <ScreenContainer
//       onMenuPress={() => navigation.openDrawer()}
//       headerTitle="Gallery"
//     >
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

//       {/* FNP-Style Enhanced Header */}
//       <View style={styles.headerWrapper}>
//         <SectionHeader
//           title={galleryContent.title}
//           subtitle={galleryContent.subtitle}
//         />

//         {/* FNP-Style Category Filter Chips */}
//         {categories.categories.length > 1 && (
//           <View style={styles.categoryFilterWrapper}>
//             <FlatList
//               data={categories.categories}
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               keyExtractor={(item) => item}
//               contentContainerStyle={styles.categoryFilterList}
//               renderItem={({ item }) => (
//                 <CategoryChip
//                   category={item}
//                   isActive={item === selectedCategory}
//                   onPress={handleCategorySelect}
//                 />
//               )}
//             />
//           </View>
//         )}
//       </View>

//       {/* Gallery Grid */}
//       {filteredItems.length === 0 ? (
//         <EmptyState
//           icon="images-outline"
//           title="No Items Found"
//           message={galleryContent.emptyMessage}
//         />
//       ) : (
//         <FlatList
//           data={filteredItems}
//           keyExtractor={(item) => item.id.toString()}
//           numColumns={2}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//           columnWrapperStyle={styles.row}
//           renderItem={({ item, index }) => (
//             <GalleryCard item={item} index={index} onPress={openModal} />
//           )}
//         />
//       )}

//       {/* FNP-Style Premium Modal */}
//       {selectedImage && (
//         <Modal
//           visible={!!selectedImage}
//           transparent
//           animationType="fade"
//           statusBarTranslucent
//           onRequestClose={closeModal}
//         >
//           <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
//             <LinearGradient
//               colors={["rgba(0,0,0,0.95)", "rgba(0,0,0,0.85)"]}
//               style={styles.modalGradient}
//             >
//               {/* FNP-Style Close Button */}
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={closeModal}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.closeButtonInner}>
//                   <Ionicons name="close" size={24} color="#FFFFFF" />
//                 </View>
//               </TouchableOpacity>

//               {/* FNP-Style Share Button */}
//               <TouchableOpacity
//                 style={styles.shareButton}
//                 onPress={() => {
//                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//                   // Share functionality
//                 }}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.shareButtonInner}>
//                   <Ionicons name="share-outline" size={22} color="#FFFFFF" />
//                 </View>
//               </TouchableOpacity>

//               {/* FNP-Style Image Preview */}
//               <Animated.View
//                 style={[
//                   styles.previewBox,
//                   {
//                     transform: [{ scale: scaleAnim }],
//                   },
//                 ]}
//               >
//                 <View style={styles.previewImageWrapper}>
//                   <Image
//                     source={getImageSource(selectedImage.image)}
//                     style={styles.previewImage}
//                     resizeMode="contain"
//                   />

//                   {/* FNP-Style Image Counter */}
//                   <View style={styles.imageCounter}>
//                     <Ionicons name="image-outline" size={14} color="#FFFFFF" />
//                     <Text style={styles.imageCounterText}>
//                       1 / {filteredItems.length}
//                     </Text>
//                   </View>
//                 </View>

//                 {/* FNP-Style Preview Info */}
//                 <View style={styles.previewInfo}>
//                   <Text style={styles.previewTitle} numberOfLines={2}>
//                     {selectedImage.title}
//                   </Text>

//                   <View style={styles.previewDetails}>
//                     {selectedImage.price ? (
//                       <Text style={styles.previewPrice}>
//                         ₹{selectedImage.price}
//                       </Text>
//                     ) : null}

//                     {selectedImage.rating && (
//                       <View style={styles.previewRating}>
//                         <Ionicons name="star" size={16} color="#FFD700" />
//                         <Text style={styles.previewRatingText}>
//                           {selectedImage.rating.toFixed(1)}
//                         </Text>
//                       </View>
//                     )}
//                   </View>

//                   {selectedImage.category &&
//                     selectedImage.category !== "Uncategorized" && (
//                       <View style={styles.previewCategory}>
//                         <Text style={styles.previewCategoryText}>
//                           {selectedImage.category}
//                         </Text>
//                       </View>
//                     )}

//                   {/* FNP-Style Action Buttons */}
//                   <View style={styles.previewActions}>
//                     <TouchableOpacity
//                       style={styles.previewActionBtn}
//                       activeOpacity={0.7}
//                       onPress={() => {
//                         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//                         // View product
//                       }}
//                     >
//                       <LinearGradient
//                         colors={["#2E7D32", "#1B5E20"]}
//                         style={styles.previewActionGradient}
//                       >
//                         <Text style={styles.previewActionText}>
//                           View Product
//                         </Text>
//                         <Ionicons
//                           name="arrow-forward"
//                           size={18}
//                           color="#FFFFFF"
//                         />
//                       </LinearGradient>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={[
//                         styles.previewActionBtn,
//                         styles.previewActionSecondary,
//                       ]}
//                       activeOpacity={0.7}
//                       onPress={() => {
//                         Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                         // Add to wishlist
//                       }}
//                     >
//                       <View style={styles.previewActionSecondaryInner}>
//                         <Ionicons
//                           name="heart-outline"
//                           size={20}
//                           color="#1A1A1A"
//                         />
//                         <Text style={styles.previewActionSecondaryText}>
//                           Wishlist
//                         </Text>
//                       </View>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </Animated.View>
//             </LinearGradient>
//           </Animated.View>
//         </Modal>
//       )}
//     </ScreenContainer>
//   );
// }

// const styles = StyleSheet.create({
//   // 🏷️ Header Styles
//   headerWrapper: {
//     paddingBottom: 8,
//   },

//   // 🎯 Category Filter Chips (FNP Style)
//   categoryFilterWrapper: {
//     paddingVertical: 8,
//     paddingHorizontal: HORIZONTAL_PADDING,
//   },
//   categoryFilterList: {
//     gap: 10,
//     paddingRight: HORIZONTAL_PADDING,
//   },
//   categoryChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: "#F5F5F5",
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   categoryChipActive: {
//     backgroundColor: "#E8F5E9",
//     borderColor: "#2E7D32",
//     borderWidth: 2,
//   },
//   categoryChipText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#666666",
//   },
//   categoryChipTextActive: {
//     color: "#2E7D32",
//     fontWeight: "700",
//   },
//   categoryChipDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: "#2E7D32",
//     marginLeft: 4,
//   },

//   // 📸 Gallery Grid Styles
//   listContent: {
//     paddingHorizontal: HORIZONTAL_PADDING,
//     paddingBottom: 100,
//   },
//   row: {
//     gap: GAP,
//     marginBottom: GAP,
//   },
//   cardWrapper: {
//     width: CARD_WIDTH,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     overflow: "hidden",
//     boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
//     borderWidth: 1,
//     borderColor: "#F0F0F0",
//   },
//   imageContainer: {
//     position: "relative",
//     width: "100%",
//     height: CARD_WIDTH * 1.2,
//     backgroundColor: "#F8F8F8",
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//   },
//   noImageBox: {
//     width: "100%",
//     height: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F5F5F5",
//   },
//   noImageText: {
//     marginTop: 6,
//     color: "#999",
//     fontSize: 12,
//     fontWeight: "500",
//   },

//   // 🏷️ FNP-Style Badges
//   newBadge: {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     backgroundColor: "#2E7D32",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 8,
//   },
//   badgeText: {
//     color: "#FFFFFF",
//     fontSize: 8,
//     fontWeight: "900",
//     letterSpacing: 0.5,
//   },
//   ratingBadge: {
//     position: "absolute",
//     top: 10,
//     left: 10,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//   },
//   ratingText: {
//     color: "#FFFFFF",
//     fontSize: 10,
//     fontWeight: "700",
//   },
//   quickActionBtn: {
//     position: "absolute",
//     bottom: 10,
//     right: 10,
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "rgba(255,255,255,0.95)",
//     alignItems: "center",
//     justifyContent: "center",
//     boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
//   },

//   // 📝 Info Box Styles
//   infoBox: {
//     padding: 12,
//     backgroundColor: "#FFFFFF",
//   },
//   title: {
//     color: "#1A1A1A",
//     fontSize: 13,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   priceRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 4,
//   },
//   price: {
//     color: "#2E7D32",
//     fontSize: 14,
//     fontWeight: "800",
//   },
//   miniRating: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 2,
//     backgroundColor: "#FFF8E1",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   miniRatingText: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: "#F57F17",
//   },
//   categoryTag: {
//     alignSelf: "flex-start",
//     backgroundColor: "#F5F5F5",
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   categoryTagText: {
//     fontSize: 8,
//     color: "#999",
//     fontWeight: "600",
//     textTransform: "uppercase",
//   },

//   // 🎨 FNP-Style Premium Modal
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalGradient: {
//     flex: 1,
//     width: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   closeButton: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 50 : 40,
//     right: 20,
//     zIndex: 20,
//   },
//   closeButtonInner: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   shareButton: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 50 : 40,
//     right: 76,
//     zIndex: 20,
//   },
//   shareButtonInner: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   previewBox: {
//     width: "100%",
//     maxWidth: 500,
//     alignItems: "center",
//   },
//   previewImageWrapper: {
//     width: "100%",
//     height: height * 0.5,
//     borderRadius: 20,
//     overflow: "hidden",
//     backgroundColor: "rgba(255,255,255,0.05)",
//     position: "relative",
//   },
//   previewImage: {
//     width: "100%",
//     height: "100%",
//   },
//   imageCounter: {
//     position: "absolute",
//     bottom: 12,
//     right: 12,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   imageCounterText: {
//     color: "#FFFFFF",
//     fontSize: 11,
//     fontWeight: "600",
//   },

//   // 📝 Preview Info Styles
//   previewInfo: {
//     width: "100%",
//     marginTop: 20,
//     paddingHorizontal: 4,
//   },
//   previewTitle: {
//     color: "#FFFFFF",
//     fontSize: 20,
//     fontWeight: "800",
//     textAlign: "center",
//   },
//   previewDetails: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 16,
//     marginTop: 8,
//   },
//   previewPrice: {
//     color: "#81C784",
//     fontSize: 18,
//     fontWeight: "800",
//   },
//   previewRating: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor: "rgba(255,215,0,0.15)",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   previewRatingText: {
//     color: "#FFD700",
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   previewCategory: {
//     alignSelf: "center",
//     marginTop: 8,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   previewCategoryText: {
//     color: "rgba(255,255,255,0.7)",
//     fontSize: 11,
//     fontWeight: "600",
//     textTransform: "uppercase",
//   },

//   // 🎯 Action Buttons
//   previewActions: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 16,
//     width: "100%",
//     paddingHorizontal: 4,
//   },
//   previewActionBtn: {
//     flex: 1,
//     height: 52,
//     borderRadius: 14,
//     overflow: "hidden",
//   },
//   previewActionGradient: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//   },
//   previewActionText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "800",
//   },
//   previewActionSecondary: {
//     flex: 0.5,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#E8E8E8",
//   },
//   previewActionSecondaryInner: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//   },
//   previewActionSecondaryText: {
//     color: "#1A1A1A",
//     fontSize: 13,
//     fontWeight: "700",
//   },
// });

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { galleryContent } from "../data/content";
import { SectionHeader } from "../components/common/SectionHeader";
import { EmptyState } from "../components/common/EmptyState";
import { colors, spacing, typography, shadows } from "../theme";
import { useAppSelector } from "../store/hooks";

const { width, height } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - GAP) / 2;

// Color Palette
const COLORS = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  accent: "#FFD700",
  gold: "#F57F17",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#F0F0F0",
  shadow: "rgba(0,0,0,0.08)",
};

const getImageSource = (image) => {
  if (!image) return null;
  if (typeof image === "string") return { uri: image };
  return image;
};

// Gallery Card Component
const GalleryCard = React.memo(({ item, index, onPress }) => {
  const imageSource = getImageSource(item.image);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(item);
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        android_ripple={{ color: "#E8F5E9", borderless: false, radius: 18 }}
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} />
          ) : (
            <View style={styles.noImageBox}>
              <Ionicons name="image-outline" size={34} color="#CCC" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}

          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}

          {item.rating && item.rating > 4.5 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="heart-outline" size={16} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.priceRow}>
            {item.price ? (
              <Text style={styles.price}>₹{item.price}</Text>
            ) : null}
            {item.rating && (
              <View style={styles.miniRating}>
                <Ionicons name="star" size={10} color="#FFD700" />
                <Text style={styles.miniRatingText}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {item.category && item.category !== "Uncategorized" && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

// Category Chip Component
const CategoryChip = React.memo(({ category, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
      activeOpacity={0.7}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(category);
      }}
    >
      <Text
        style={[
          styles.categoryChipText,
          isActive && styles.categoryChipTextActive,
        ]}
      >
        {category}
      </Text>
      {isActive && <View style={styles.categoryChipDot} />}
    </TouchableOpacity>
  );
});

export function GalleryScreen() {
  const navigation = useNavigation();
  const products = useAppSelector((s) => s.products.products);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Process products data
  const categories = useMemo(() => {
    const allItems =
      products?.map((item, index) => ({
        id: item._id || item.id || String(index),
        title: item.name || `Product ${index + 1}`,
        image: item.image || item.imageUrl || item.photo,
        price: item.price,
        category: item.category || "Uncategorized",
        rating: item.rating || 4 + Math.random() * 0.9,
        isNew: Math.random() > 0.7,
      })) || [];

    const uniqueCats = [
      "All",
      ...new Set(allItems.map((item) => item.category).filter(Boolean)),
    ];
    return { items: allItems, categories: uniqueCats };
  }, [products]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return categories.items;
    return categories.items.filter(
      (item) => item.category === selectedCategory,
    );
  }, [categories.items, selectedCategory]);

  const openModal = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImage(item);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedImage(null));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Render Header Component
  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <SectionHeader
        title={galleryContent.title}
        subtitle={galleryContent.subtitle}
      />

      {categories.categories.length > 1 && (
        <View style={styles.categoryFilterWrapper}>
          <FlatList
            data={categories.categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryFilterList}
            renderItem={({ item }) => (
              <CategoryChip
                category={item}
                isActive={item === selectedCategory}
                onPress={handleCategorySelect}
              />
            )}
          />
        </View>
      )}
    </View>
  );

  // Render Empty State
  const renderEmpty = () => (
    <EmptyState
      icon="images-outline"
      title="No Items Found"
      message={galleryContent.emptyMessage}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={28} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gallery</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Main FlatList - No nested ScrollView */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item, index }) => (
          <GalleryCard item={item} index={index} onPress={openModal} />
        )}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        updateCellsBatchingPeriod={50}
      />

      {/* Modal */}
      {selectedImage && (
        <Modal
          visible={!!selectedImage}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closeModal}
        >
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={["rgba(0,0,0,0.95)", "rgba(0,0,0,0.85)"]}
              style={styles.modalGradient}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <View style={styles.closeButtonInner}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.shareButtonInner}>
                  <Ionicons name="share-outline" size={22} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.previewBox,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View style={styles.previewImageWrapper}>
                  <Image
                    source={getImageSource(selectedImage.image)}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />

                  <View style={styles.imageCounter}>
                    <Ionicons name="image-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.imageCounterText}>
                      1 / {filteredItems.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.previewInfo}>
                  <Text style={styles.previewTitle} numberOfLines={2}>
                    {selectedImage.title}
                  </Text>

                  <View style={styles.previewDetails}>
                    {selectedImage.price ? (
                      <Text style={styles.previewPrice}>
                        ₹{selectedImage.price}
                      </Text>
                    ) : null}

                    {selectedImage.rating && (
                      <View style={styles.previewRating}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.previewRatingText}>
                          {selectedImage.rating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {selectedImage.category &&
                    selectedImage.category !== "Uncategorized" && (
                      <View style={styles.previewCategory}>
                        <Text style={styles.previewCategoryText}>
                          {selectedImage.category}
                        </Text>
                      </View>
                    )}

                  <View style={styles.previewActions}>
                    <TouchableOpacity
                      style={styles.previewActionBtn}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        navigation.navigate("ProductDetails", {
                          productId: selectedImage.id,
                        });
                      }}
                    >
                      <LinearGradient
                        colors={["#2E7D32", "#1B5E20"]}
                        style={styles.previewActionGradient}
                      >
                        <Text style={styles.previewActionText}>
                          View Product
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#FFFFFF"
                        />
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.previewActionBtn,
                        styles.previewActionSecondary,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <View style={styles.previewActionSecondaryInner}>
                        <Ionicons
                          name="heart-outline"
                          size={20}
                          color="#1A1A1A"
                        />
                        <Text style={styles.previewActionSecondaryText}>
                          Wishlist
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Custom Header
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 12 : 16,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerRight: {
    width: 36,
  },

  // Header Wrapper
  headerWrapper: {
    paddingBottom: 8,
  },

  // Category Filter Chips
  categoryFilterWrapper: {
    paddingVertical: 8,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  categoryFilterList: {
    gap: 10,
    paddingRight: HORIZONTAL_PADDING,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#2E7D32",
    borderWidth: 2,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
  },
  categoryChipTextActive: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  categoryChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2E7D32",
    marginLeft: 4,
  },

  // Gallery Grid
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 100,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "rgba(0,0,0,0.08)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: CARD_WIDTH * 1.2,
    backgroundColor: "#F8F8F8",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImageBox: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  noImageText: {
    marginTop: 6,
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  quickActionBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBox: {
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  title: {
    color: "#1A1A1A",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  price: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "800",
  },
  miniRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniRatingText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#F57F17",
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 8,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 20,
    zIndex: 20,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  shareButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    right: 76,
    zIndex: 20,
  },
  shareButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  previewBox: {
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
  },
  previewImageWrapper: {
    width: "100%",
    height: height * 0.5,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageCounter: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  previewInfo: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 4,
  },
  previewTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  previewDetails: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  previewPrice: {
    color: "#81C784",
    fontSize: 18,
    fontWeight: "800",
  },
  previewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewRatingText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "700",
  },
  previewCategory: {
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewCategoryText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  previewActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
    paddingHorizontal: 4,
  },
  previewActionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
  },
  previewActionGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  previewActionSecondary: {
    flex: 0.5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  previewActionSecondaryInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  previewActionSecondaryText: {
    color: "#1A1A1A",
    fontSize: 13,
    fontWeight: "700",
  },
});
