// src/components/common/LoadingSkeleton.jsx
// Premium shimmer skeleton — slow (2200ms), warm cream tones, subtle opacity

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

// Warm cream shimmer box — slow, premium
function SkeletonBox({ width: w, height, style, rounded = false }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2200 }),
      -1,
      true,
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.6]),
  }));

  return (
    <Animated.View
      style={[
        styles.box,
        { width: w, height, borderRadius: rounded ? Math.min(Number(height) / 2, 20) : 10 },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonBox width="100%" height={160} style={styles.imageSkeleton} />
      <View style={styles.cardInfo}>
        <SkeletonBox width="55%" height={9} />
        <SkeletonBox width="85%" height={13} style={{ marginTop: 8 }} />
        <SkeletonBox width="60%" height={11} style={{ marginTop: 6 }} />
        <SkeletonBox width="40%" height={16} style={{ marginTop: 10 }} />
      </View>
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
          <SkeletonBox width={68} height={68} style={{ borderRadius: 12 }} />
          <View style={{ flex: 1, marginLeft: spacing.md, gap: 8 }}>
            <SkeletonBox width="75%" height={13} />
            <SkeletonBox width="45%" height={11} />
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
        height={300}
        style={{ borderRadius: 20 }}
      />
    </View>
  );
}

export function BlogCardSkeleton({ count = 3 }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.blogItem}>
          <SkeletonBox width={80} height={80} style={{ borderRadius: 12 }} />
          <View style={{ flex: 1, marginLeft: spacing.md, gap: 8 }}>
            <SkeletonBox width="35%" height={9} />
            <SkeletonBox width="90%" height={14} />
            <SkeletonBox width="55%" height={11} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    // Warm cream tone — not the cold grey default
    backgroundColor: colors.surfaceWarm,
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    ...shadows.soft,
  },
  imageSkeleton: {
    borderRadius: 0,
    backgroundColor: colors.surfaceWarm,
  },
  cardInfo: {
    padding: 14,
    gap: 0,
  },
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
    borderRadius: 14,
    ...shadows.soft,
  },
  blogItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hero: { padding: spacing.screen },
});
