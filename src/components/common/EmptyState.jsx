import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';
export function EmptyState({ icon = 'leaf-outline', title, message, actionLabel, onAction, }) {
    return (<View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={48} color={colors.primary}/>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (<Button title={actionLabel} onPress={onAction} style={styles.button}/>)}
    </View>);
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xxxl,
    },
    iconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.primarySurface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        ...typography.h2,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        ...typography.body,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    button: { marginTop: spacing.md },
});
