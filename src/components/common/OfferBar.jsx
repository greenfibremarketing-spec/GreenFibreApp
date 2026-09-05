import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { offerBarMessages } from '../../data/content';
import { colors, spacing, typography } from '../../theme';
const icons = ['car-outline', 'leaf-outline', 'refresh-outline'];
export function OfferBar() {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % offerBarMessages.length);
        }, 3500);
        return () => clearInterval(timer);
    }, []);
    return (<View style={styles.container}>
      <Animated.View key={index} entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name={icons[index]} size={12} color={colors.white}/>
        </View>
        <Text style={styles.text}>{offerBarMessages[index]}</Text>
      </Animated.View>
    </View>);
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.primaryDark,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconWrap: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        ...typography.bodySmall,
        color: colors.white,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
});
