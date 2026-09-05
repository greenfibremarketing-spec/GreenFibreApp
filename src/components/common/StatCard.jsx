import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../theme';
export function StatCard({ value, label, subtitle, icon, compact }) {
    return (<View style={[styles.card, compact && styles.compact]}>
      {icon && (<View style={styles.iconWrap}>
          <Ionicons name={icon} size={compact ? 20 : 24} color={colors.primary}/>
        </View>)}
      <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>);
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: spacing.cardRadius,
        padding: spacing.lg,
        alignItems: 'center',
        flex: 1,
        ...shadows.soft,
    },
    compact: { padding: spacing.md },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    value: {
        ...typography.stat,
        color: colors.text,
        marginBottom: 2,
    },
    valueCompact: { fontSize: 20 },
    label: {
        ...typography.bodySmall,
        color: colors.textMuted,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.bodySmall,
        color: colors.textLight,
        textAlign: 'center',
        marginTop: 2,
        fontSize: 10,
    },
});
