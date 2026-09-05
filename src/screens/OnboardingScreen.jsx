// import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { onboardingSlides } from "../data/content";
import { placeholders } from "../data/images";
import { colors, spacing, typography, shadows } from "../theme";
import { Button } from "../components/common/Button";
import { useAppDispatch } from "../store/hooks";
import { setHasSeenOnboarding } from "../store/slices/uiSlice";
import { useState, useRef } from "react";
const { width, height } = Dimensions.get("window");

// Premium Green Fibre Brand Colors
const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  gold: "#D4A843",
  goldLight: "#FBF5E6",
  white: "#FFFFFF",
  text: "#2C2C2C",
  textSecondary: "#6B6B6B",
  textMuted: "#9E9E9E",
  borderLight: "#E8E3DA",
  success: "#388E3C",
  danger: "#C62828",
  warning: "#E6A817",
  cream: "#FAF7F2",
};

// Image mapping
const imageMap = {
  onboarding1:
    placeholders.onboarding1 ||
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
  onboarding2:
    placeholders.onboarding2 ||
    "https://thumbs.dreamstime.com/b/beautiful-rain-forest-ang-ka-nature-trail-doi-inthanon-national-park-thailand-36703721.jpghttps://thumbs.dreamstime.com/b/beautiful-rain-forest-ang-ka-nature-trail-doi-inthanon-national-park-thailand-36703721.jpg",
  onboarding3:
    placeholders.onboarding3 ||
    "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800",
};

// Fallback slides if onboardingSlides is empty
const defaultSlides = [
  {
    id: "1",
    title: "🌿 Sustainable Living",
    description:
      "Discover eco-friendly products that help you live a greener, more sustainable life.",
    imageKey: "onboarding1",
  },
  {
    id: "2",
    title: "🎁 Perfect Gifts",
    description:
      "Find the perfect sustainable gifts for your loved ones, made with care and love.",
    imageKey: "onboarding2",
  },
  {
    id: "3",
    title: "🌍 Join the Movement",
    description:
      "Be part of a growing community making a positive impact on our planet.",
    imageKey: "onboarding3",
  },
];

export function OnboardingScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const slides =
    onboardingSlides?.length > 0 ? onboardingSlides : defaultSlides;

  // Animation values
  const dotScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const finish = () => {
    dispatch(setHasSeenOnboarding(true));
    navigation.replace("Main");
  };

  const next = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      finish();
    }
  };

  const skip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    finish();
  };

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Render slide item
  const renderSlide = ({ item, index }) => (
    <Animated.View entering={FadeInRight.duration(400)} style={styles.slide}>
      {/* Image Section */}
      <View style={styles.imageWrap}>
        <Image
          source={{
            uri:
              imageMap[item.imageKey] ||
              item.image ||
              "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
          }}
          style={styles.image}
          contentFit="cover"
          transition={600}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)"]}
          style={styles.imageOverlay}
        />

        {/* Slide Counter */}
        <View style={styles.slideCounter}>
          <Text style={styles.slideCounterText}>
            {index + 1} / {slides.length}
          </Text>
        </View>
      </View>

      {/* Text Content */}
      <View style={styles.textContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[fnpColors.primaryLight, "#C8E6C9"]}
            style={styles.iconGradient}
          >
            <Ionicons
              name={
                index === 0
                  ? "leaf-outline"
                  : index === 1
                    ? "gift-outline"
                    : "people-outline"
              }
              size={32}
              color={fnpColors.primary}
            />
          </LinearGradient>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          {index === 0 && (
            <>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={fnpColors.primary}
                />
                <Text style={styles.featureText}>100% Eco-Friendly</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={fnpColors.primary}
                />
                <Text style={styles.featureText}>Sustainable Products</Text>
              </View>
            </>
          )}
          {index === 1 && (
            <>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={fnpColors.primary}
                />
                <Text style={styles.featureText}>Handpicked Gifts</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={fnpColors.primary}
                />
                <Text style={styles.featureText}>Premium Quality</Text>
              </View>
            </>
          )}
          {index === 2 && (
            <>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={fnpColors.primary}
                />
                <Text style={styles.featureText}>Carbon Neutral Delivery</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={fnpColors.primary}
                />
                <Text style={styles.featureText}>Community Impact</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={skip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipBtnText}>Skip</Text>
        <Ionicons name="arrow-forward" size={16} color={fnpColors.textMuted} />
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderSlide}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index: i,
                  animated: true,
                });
              }}
              activeOpacity={0.7}
            >
              <View
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {currentIndex < slides.length - 1 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={skip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          <Animated.View style={[styles.nextBtnWrapper, animatedButtonStyle]}>
            <TouchableOpacity
              style={styles.nextBtn}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={next}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[fnpColors.primary, fnpColors.primaryDark]}
                style={styles.nextBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.nextBtnText}>
                  {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                </Text>
                <Ionicons
                  name={
                    currentIndex === slides.length - 1
                      ? "checkmark"
                      : "arrow-forward"
                  }
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fnpColors.white,
  },

  // ===== SKIP BUTTON =====
  skipBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
  },
  skipBtnText: {
    fontSize: 14,
    color: fnpColors.textMuted,
    fontWeight: "600",
  },

  // ===== SLIDE =====
  slide: {
    width,
    flex: 1,
  },

  // ===== IMAGE =====
  imageWrap: {
    height: height * 0.5,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    position: "relative",
    ...shadows.medium,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  slideCounter: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slideCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  // ===== TEXT CONTENT =====
  textContent: {
    flex: 1,
    padding: spacing.xxxl,
    paddingTop: spacing.xl,
    alignItems: "center",
    backgroundColor: fnpColors.white,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.hero,
    color: fnpColors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
    fontSize: 26,
    fontWeight: "900",
  },
  description: {
    ...typography.body,
    color: fnpColors.textMuted,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  featuresContainer: {
    width: "100%",
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  featureText: {
    ...typography.bodySmall,
    color: fnpColors.textSecondary,
    fontWeight: "500",
  },

  // ===== FOOTER =====
  footer: {
    paddingHorizontal: spacing.screen,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.xxxl,
    backgroundColor: fnpColors.white,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: fnpColors.borderLight,
    transition: "all 0.3s",
  },
  dotActive: {
    width: 28,
    backgroundColor: fnpColors.primary,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    color: fnpColors.textMuted,
    fontWeight: "600",
  },
  nextBtnWrapper: {
    flex: 1,
    marginLeft: spacing.md,
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.medium,
  },
  nextBtn: {
    width: "100%",
  },
  nextBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
// import React, { useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   FlatList,
//   TouchableOpacity,
//   StatusBar,
//   Platform,
//   Animated,
// } from "react-native";
// import { Image } from "expo-image";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import * as Haptics from "expo-haptics";
// import Reanimated, {
//   FadeInRight,
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   withDelay,
//   useDerivedValue,
//   interpolate,
//   Extrapolate,
// } from "react-native-reanimated";
// import { onboardingSlides } from "../data/content";
// import { placeholders } from "../data/images";
// import { colors, spacing, typography, shadows } from "../theme";
// import { Button } from "../components/common/Button";
// import { useAppDispatch } from "../store/hooks";
// import { setHasSeenOnboarding } from "../store/slices/uiSlice";

// const { width, height } = Dimensions.get("window");

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
//   success: "#4CAF50",
//   danger: "#F44336",
//   warning: "#FF9800",
//   cream: "#FFF8F0",
//   background: "#FAFAFA",
// };

// // High-quality, reliable image URLs (Unsplash - no encryption issues)
// const imageMap = {
//   onboarding1:
//     "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&auto=format",
//   onboarding2:
//     "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&h=600&fit=crop&auto=format",
//   onboarding3:
//     "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop&auto=format",
//   fallback:
//     "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&auto=format",
// };

// // Fallback slides if onboardingSlides is empty
// const defaultSlides = [
//   {
//     id: "1",
//     title: "🌿 Sustainable Living",
//     description:
//       "Discover eco-friendly products that help you live a greener, more sustainable life.",
//     imageKey: "onboarding1",
//     icon: "leaf-outline",
//   },
//   {
//     id: "2",
//     title: "🎁 Perfect Gifts",
//     description:
//       "Find the perfect sustainable gifts for your loved ones, made with care and love.",
//     imageKey: "onboarding2",
//     icon: "gift-outline",
//   },
//   {
//     id: "3",
//     title: "🌍 Join the Movement",
//     description:
//       "Be part of a growing community making a positive impact on our planet.",
//     imageKey: "onboarding3",
//     icon: "people-outline",
//   },
// ];

// const ReanimatedFlatList = Reanimated.createAnimatedComponent(FlatList);

// export function OnboardingScreen({ navigation }) {
//   const dispatch = useAppDispatch();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const flatListRef = useRef(null);
//   const scrollX = useRef(new Animated.Value(0)).current;

//   // Shared values for animations
//   const dotScale = useSharedValue(1);
//   const buttonScale = useSharedValue(1);
//   const heartScale = useSharedValue(0);
//   const titleTranslateY = useSharedValue(50);
//   const titleOpacity = useSharedValue(0);

//   const slides =
//     onboardingSlides?.length > 0 ? onboardingSlides : defaultSlides;

//   // Animate heart icon on mount
//   React.useEffect(() => {
//     heartScale.value = withSpring(1, {
//       damping: 8,
//       stiffness: 100,
//     });
//     titleTranslateY.value = withSpring(0, { damping: 12 });
//     titleOpacity.value = withTiming(1, { duration: 600 });
//   }, []);

//   const finish = () => {
//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     dispatch(setHasSeenOnboarding(true));
//     navigation.replace("Main");
//   };

//   const next = () => {
//     if (currentIndex < slides.length - 1) {
//       flatListRef.current?.scrollToIndex({
//         index: currentIndex + 1,
//         animated: true,
//       });
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     } else {
//       finish();
//     }
//   };

//   const skip = () => {
//     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     finish();
//   };

//   const onScroll = (e) => {
//     const offsetX = e.nativeEvent.contentOffset.x;
//     scrollX.setValue(offsetX);
//     const index = Math.round(offsetX / width);
//     if (index !== currentIndex) {
//       setCurrentIndex(index);
//       // Haptic feedback on slide change
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//   };

//   const handlePressIn = () => {
//     buttonScale.value = withSpring(0.95, { damping: 12 });
//   };

//   const handlePressOut = () => {
//     buttonScale.value = withSpring(1, { damping: 12 });
//   };

//   const animatedButtonStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: buttonScale.value }],
//   }));

//   const animatedHeartStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: heartScale.value }],
//   }));

//   const animatedTitleStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: titleTranslateY.value }],
//     opacity: titleOpacity.value,
//   }));

//   // Get image source with fallback
//   const getImageSource = (item) => {
//     if (item.image) return item.image;
//     if (item.imageKey && imageMap[item.imageKey])
//       return imageMap[item.imageKey];
//     if (item.imageUrl) return item.imageUrl;
//     return imageMap.fallback;
//   };

//   // Render slide item
//   const renderSlide = ({ item, index }) => {
//     const inputRange = [
//       (index - 1) * width,
//       index * width,
//       (index + 1) * width,
//     ];

//     const imageScale = scrollX.interpolate({
//       inputRange,
//       outputRange: [1.1, 1, 1.1],
//       extrapolate: "clamp",
//     });

//     const imageTranslateX = scrollX.interpolate({
//       inputRange,
//       outputRange: [50, 0, -50],
//       extrapolate: "clamp",
//     });

//     const textTranslateY = scrollX.interpolate({
//       inputRange,
//       outputRange: [30, 0, 30],
//       extrapolate: "clamp",
//     });

//     const textOpacity = scrollX.interpolate({
//       inputRange,
//       outputRange: [0.6, 1, 0.6],
//       extrapolate: "clamp",
//     });

//     const imageSource = getImageSource(item);

//     return (
//       <View style={styles.slide}>
//         {/* Image Section */}
//         <Animated.View
//           style={[
//             styles.imageWrap,
//             {
//               transform: [
//                 { scale: imageScale },
//                 { translateX: imageTranslateX },
//               ],
//             },
//           ]}
//         >
//           <Image
//             source={{ uri: imageSource }}
//             style={styles.image}
//             contentFit="cover"
//             transition={800}
//             placeholder={
//               placeholders.onboarding1 ||
//               "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&auto=format"
//             }
//             placeholderContentFit="cover"
//           />
//           <LinearGradient
//             colors={["transparent", "rgba(233, 30, 99, 0.15)"]}
//             style={styles.imageOverlay}
//           />

//           {/* Slide Counter with Animation */}
//           <Animated.View style={[styles.slideCounter, animatedHeartStyle]}>
//             <View style={styles.slideCounterInner}>
//               <Ionicons
//                 name={item.icon || "heart-outline"}
//                 size={16}
//                 color={fnpColors.white}
//               />
//               <Text style={styles.slideCounterText}>
//                 {index + 1} / {slides.length}
//               </Text>
//             </View>
//           </Animated.View>
//         </Animated.View>

//         {/* Text Content */}
//         <Animated.View
//           style={[
//             styles.textContent,
//             {
//               transform: [{ translateY: textTranslateY }],
//               opacity: textOpacity,
//             },
//           ]}
//         >
//           <View style={styles.iconContainer}>
//             <LinearGradient
//               colors={[fnpColors.primaryLight, "#C8E6C9"]}
//               style={styles.iconGradient}
//             >
//               <Ionicons
//                 name={
//                   item.icon ||
//                   (index === 0
//                     ? "leaf-outline"
//                     : index === 1
//                       ? "gift-outline"
//                       : "people-outline")
//                 }
//                 size={32}
//                 color={fnpColors.primary}
//               />
//             </LinearGradient>
//           </View>
//           <Text style={styles.title}>{item.title}</Text>
//           <Text style={styles.description}>{item.description}</Text>

//           {/* Feature Highlights */}
//           <View style={styles.featuresContainer}>
//             {index === 0 && (
//               <>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>100% Eco-Friendly</Text>
//                 </View>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>Sustainable Products</Text>
//                 </View>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>Carbon Neutral</Text>
//                 </View>
//               </>
//             )}
//             {index === 1 && (
//               <>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>Handpicked Gifts</Text>
//                 </View>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>Premium Quality</Text>
//                 </View>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>Eco-Friendly Packaging</Text>
//                 </View>
//               </>
//             )}
//             {index === 2 && (
//               <>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>Community Impact</Text>
//                 </View>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>Local Artisans</Text>
//                 </View>
//                 <View style={styles.featureItem}>
//                   <View style={styles.featureIcon}>
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={18}
//                       color={fnpColors.primary}
//                     />
//                   </View>
//                   <Text style={styles.featureText}>Sustainable Future</Text>
//                 </View>
//               </>
//             )}
//           </View>
//         </Animated.View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

//       {/* Skip Button */}
//       <TouchableOpacity
//         style={styles.skipBtn}
//         onPress={skip}
//         activeOpacity={0.7}
//       >
//         <Text style={styles.skipBtnText}>Skip</Text>
//         <Ionicons name="arrow-forward" size={16} color={fnpColors.textMuted} />
//       </TouchableOpacity>

//       {/* Slides */}
//       <Animated.FlatList
//         ref={flatListRef}
//         data={slides}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onScroll={onScroll}
//         keyExtractor={(item, index) => item.id || String(index)}
//         renderItem={renderSlide}
//         scrollEventThrottle={16}
//         bounces={false}
//         onScrollBeginDrag={() => {
//           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         }}
//       />

//       {/* Footer */}
//       <View style={styles.footer}>
//         {/* Pagination Dots with Animation */}
//         <View style={styles.dots}>
//           {slides.map((_, i) => {
//             const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
//             const dotScale = scrollX.interpolate({
//               inputRange,
//               outputRange: [0.8, 1.2, 0.8],
//               extrapolate: "clamp",
//             });
//             const dotOpacity = scrollX.interpolate({
//               inputRange,
//               outputRange: [0.3, 1, 0.3],
//               extrapolate: "clamp",
//             });

//             return (
//               <TouchableOpacity
//                 key={i}
//                 onPress={() => {
//                   flatListRef.current?.scrollToIndex({
//                     index: i,
//                     animated: true,
//                   });
//                   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//                 }}
//                 activeOpacity={0.7}
//               >
//                 <Animated.View
//                   style={[
//                     styles.dot,
//                     i === currentIndex && styles.dotActive,
//                     {
//                       transform: [{ scale: dotScale }],
//                       opacity: dotOpacity,
//                     },
//                   ]}
//                 />
//               </TouchableOpacity>
//             );
//           })}
//         </View>

//         {/* Buttons */}
//         <View style={styles.buttons}>
//           {currentIndex < slides.length - 1 && (
//             <TouchableOpacity
//               style={styles.skipButton}
//               onPress={skip}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.skipText}>Skip</Text>
//             </TouchableOpacity>
//           )}

//           <Reanimated.View style={[styles.nextBtnWrapper, animatedButtonStyle]}>
//             <TouchableOpacity
//               style={styles.nextBtn}
//               onPressIn={handlePressIn}
//               onPressOut={handlePressOut}
//               onPress={next}
//               activeOpacity={0.9}
//             >
//               <LinearGradient
//                 colors={[fnpColors.primary, fnpColors.primaryDark]}
//                 style={styles.nextBtnGradient}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//               >
//                 <Text style={styles.nextBtnText}>
//                   {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
//                 </Text>
//                 <Ionicons
//                   name={
//                     currentIndex === slides.length - 1
//                       ? "checkmark"
//                       : "arrow-forward"
//                   }
//                   size={20}
//                   color="#FFFFFF"
//                 />
//               </LinearGradient>
//             </TouchableOpacity>
//           </Reanimated.View>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: fnpColors.background,
//   },

//   // ===== SKIP BUTTON =====
//   skipBtn: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 50 : 30,
//     right: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     zIndex: 10,
//     padding: 10,
//     backgroundColor: "rgba(255,255,255,0.9)",
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   skipBtnText: {
//     fontSize: 14,
//     color: fnpColors.textMuted,
//     fontWeight: "600",
//   },

//   // ===== SLIDE =====
//   slide: {
//     width,
//     flex: 1,
//   },

//   // ===== IMAGE =====
//   imageWrap: {
//     height: height * 0.5,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     overflow: "hidden",
//     position: "relative",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//   },
//   imageOverlay: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: "30%",
//   },
//   slideCounter: {
//     position: "absolute",
//     top: 20,
//     right: 20,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     backdropFilter: "blur(10px)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   slideCounterInner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   slideCounterText: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   // ===== TEXT CONTENT =====
//   textContent: {
//     flex: 1,
//     padding: spacing.xxxl,
//     paddingTop: spacing.xl,
//     alignItems: "center",
//     backgroundColor: fnpColors.background,
//   },
//   iconContainer: {
//     marginBottom: spacing.md,
//     marginTop: -20,
//     shadowColor: fnpColors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   iconGradient: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 3,
//     borderColor: fnpColors.white,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: fnpColors.text,
//     textAlign: "center",
//     marginBottom: spacing.sm,
//     letterSpacing: -0.5,
//   },
//   description: {
//     fontSize: 16,
//     color: fnpColors.textSecondary,
//     textAlign: "center",
//     lineHeight: 26,
//     marginBottom: spacing.md,
//     paddingHorizontal: 10,
//   },
//   featuresContainer: {
//     width: "100%",
//     gap: 10,
//     marginTop: 8,
//   },
//   featureItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     backgroundColor: fnpColors.white,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   featureIcon: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: fnpColors.primaryLight,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   featureText: {
//     fontSize: 14,
//     color: fnpColors.textSecondary,
//     fontWeight: "500",
//   },

//   // ===== FOOTER =====
//   footer: {
//     paddingHorizontal: spacing.screen,
//     paddingBottom: Platform.OS === "ios" ? 34 : spacing.xxxl,
//     backgroundColor: fnpColors.background,
//     borderTopWidth: 1,
//     borderTopColor: "rgba(0,0,0,0.05)",
//   },
//   dots: {
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: spacing.sm,
//     marginBottom: spacing.lg,
//   },
//   dot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: fnpColors.borderLight,
//     transition: "all 0.3s",
//   },
//   dotActive: {
//     width: 32,
//     backgroundColor: fnpColors.primary,
//   },
//   buttons: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   skipButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   skipText: {
//     fontSize: 15,
//     color: fnpColors.textMuted,
//     fontWeight: "600",
//   },
//   nextBtnWrapper: {
//     flex: 1,
//     marginLeft: spacing.md,
//     borderRadius: 16,
//     overflow: "hidden",
//     shadowColor: fnpColors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   nextBtn: {
//     width: "100%",
//   },
//   nextBtnGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//   },
//   nextBtnText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
// });
