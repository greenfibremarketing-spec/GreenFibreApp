import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { colors, spacing, shadows } from "../../theme";
const { width } = Dimensions.get("window");
function SkeletonBox({ width: w, height, style }) {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [shimmer]);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 0.8]),
  }));
  return (
    <Animated.View
      style={[styles.box, { width: w, height }, animatedStyle, style]}
    />
  );
}
export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonBox width="100%" height={160} style={styles.imageSkeleton} />
      <SkeletonBox width="80%" height={14} style={{ marginTop: spacing.md }} />
      <SkeletonBox width="50%" height={12} style={{ marginTop: spacing.sm }} />
      <SkeletonBox width="40%" height={16} style={{ marginTop: spacing.md }} />
    </View>
  );
}
export function ProductGridSkeleton({ count = 4 }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}
export function ListSkeleton({ count = 3 }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <SkeletonBox width={60} height={60} style={{ borderRadius: 12 }} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <SkeletonBox width="70%" height={14} />
            <SkeletonBox
              width="40%"
              height={12}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
export function HeroSkeleton() {
  return (
    <View style={styles.hero}>
      <SkeletonBox
        width={width - 32}
        height={280}
        style={{ borderRadius: spacing.cardRadius }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.borderLight,
    borderRadius: 8,
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.soft,
  },
  imageSkeleton: { borderRadius: 12 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: spacing.screen,
  },
  list: { padding: spacing.screen },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: spacing.cardRadius,
    ...shadows.soft,
  },
  hero: { padding: spacing.screen },
});
