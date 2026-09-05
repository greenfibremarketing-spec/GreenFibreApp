import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
export function SectionHeader({ eyebrow, title, subtitle, actionLabel, onAction }) {
    return (<View style={styles.container}>
      <View style={styles.textWrap}>
        {eyebrow && (<View style={styles.eyebrowRow}>
            <Ionicons name="leaf" size={14} color={colors.primary}/>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
          </View>)}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionLabel && onAction && (<TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary}/>
        </TouchableOpacity>)}
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.screen,
        marginBottom: spacing.lg,
    },
    textWrap: { flex: 1 },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
    eyebrow: {
        ...typography.caption,
        color: colors.primary,
        fontSize: 11,
    },
    title: {
        ...typography.h2,
        color: colors.text,
    },
    subtitle: {
        ...typography.body,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
    },
});
