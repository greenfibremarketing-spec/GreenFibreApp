// src/components/common/OfferBar.jsx
// Premium OfferBar — smooth opacity crossfade with standard RN Animated

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { offerBarMessages } from '../../data/content';
import { colors } from '../../theme';

const LEAF = '🌿';

export function OfferBar() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const timer = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted.current) return;
        setIndex((prev) => (prev + 1) % offerBarMessages.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);

    return () => {
      isMounted.current = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.leaf}>{LEAF}</Text>
        <Text style={styles.text} numberOfLines={1}>
          {offerBarMessages[index]}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryDark || '#122E1A',
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  leaf: {
    fontSize: 11,
  },
  text: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textOnDark || '#F7F5F0',
    letterSpacing: 0.3,
    opacity: 0.92,
  },
});
