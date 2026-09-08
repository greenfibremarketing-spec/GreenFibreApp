// src/components/common/EmptyState.jsx
// Premium empty state — botanical line illustration, warm specific copy
// Each context gets a unique illustration symbol + warm sentence

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing } from '../../theme';
import { Button } from './Button';

// Context-aware botanical symbols (line-art style via unicode / emoji)
const contextMap = {
  cart: {
    symbol: '🛍',
    title: 'Your basket is empty',
    message: "Add a few sustainable pieces you love \u2014 they'll wait here for you.",
  },

  wishlist: {
    symbol: '🌿',
    title: 'Your wishlist is empty',
    message: 'Save pieces you\'re drawn to and come back when you\'re ready.',
  },
  orders: {
    symbol: '📦',
    title: 'No orders yet',
    message: 'Your first Green Fibre order will appear here once placed.',
  },
  search: {
    symbol: '🔍',
    title: 'Nothing found',
    message: 'Try a broader term or browse the collection directly.',
  },
  products: {
    symbol: '🌱',
    title: 'Collection coming soon',
    message: 'We\'re curating something special for this category.',
  },
  default: {
    symbol: '🍃',
    title: 'Nothing here yet',
    message: 'This space is empty — explore other parts of the store.',
  },
};

export function EmptyState({
  context = 'default',
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) {
  const ctx = contextMap[context] || contextMap.default;
  const displayTitle = title || ctx.title;
  const displayMessage = message || ctx.message;
  const displaySymbol = ctx.symbol;

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.container}>
      {/* Botanical illustration placeholder */}
      <View style={styles.illustrationWrap}>
        <View style={styles.symbolBg}>
          <Text style={styles.symbol}>{displaySymbol}</Text>
        </View>
        {/* Decorative line elements */}
        <View style={styles.decorLine} />
        <View style={[styles.decorDot, { left: '20%' }]} />
        <View style={[styles.decorDot, { right: '20%', top: 8 }]} />
      </View>

      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.message}>{displayMessage}</Text>

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.button}
          size="md"
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.background,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    position: 'relative',
    width: 120,
    height: 120,
  },
  symbolBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 36,
  },
  decorLine: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 1,
    backgroundColor: colors.primaryMuted,
    opacity: 0.6,
  },
  decorDot: {
    position: 'absolute',
    top: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryMuted,
    opacity: 0.5,
  },
  title: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    lineHeight: 30,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: spacing.xl,
  },
  button: { marginTop: spacing.sm },
});
