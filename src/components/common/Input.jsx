import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
export function Input({ label, error, icon, containerStyle, required, ...props }) {
    return (<View style={[styles.container, containerStyle]}>
      {label && (<Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>)}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={20} color={colors.textLight} style={styles.icon}/>}
        <TextInput style={[styles.input, icon ? styles.inputWithIcon : undefined]} placeholderTextColor={colors.textLight} {...props}/>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>);
}
const styles = StyleSheet.create({
    container: { marginBottom: spacing.lg },
    label: {
        ...typography.bodySmall,
        fontWeight: '500',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    required: { color: colors.error },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.buttonRadius,
        backgroundColor: colors.white,
        paddingHorizontal: spacing.lg,
    },
    inputError: { borderColor: colors.error },
    icon: { marginRight: spacing.sm },
    input: {
        flex: 1,
        ...typography.body,
        color: colors.text,
        paddingVertical: spacing.md + 2,
    },
    inputWithIcon: { paddingLeft: 0 },
    error: {
        ...typography.bodySmall,
        color: colors.error,
        marginTop: spacing.xs,
    },
});
