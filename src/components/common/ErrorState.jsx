// src/components/common/ErrorState.jsx
// Premium error state — warm botanical feel, never generic

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing } from '../../theme';
import { Button } from './Button';

export function ErrorState({
  message = 'We couldn\'t load this right now. It\'s not you — please try again.',
  onRetry,
  title = 'Something\'s not quite right',
}) {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.container}>
      {/* Wilting plant illustration feel */}
      <View style={styles.illustrationWrap}>
        <View style={styles.symbolBg}>
          <Text style={styles.symbol}>🥀</Text>
        </View>
        <View style={styles.decorLine} />
        <View style={[styles.decorDot, { left: '15%' }]} />
        <View style={[styles.decorDot, { right: '15%', top: 6 }]} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <Button
          title="Try again"
          onPress={onRetry}
          variant="outline"
          style={styles.button}
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
    backgroundColor: colors.terracottaLight,
    borderWidth: 1,
    borderColor: '#E8C8BE',
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
    backgroundColor: '#E8C8BE',
    opacity: 0.6,
  },
  decorDot: {
    position: 'absolute',
    top: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8C8BE',
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
  button: {
    marginTop: spacing.sm,
    borderColor: colors.terracotta,
  },
});
