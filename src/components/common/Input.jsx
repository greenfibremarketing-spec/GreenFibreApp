// src/components/common/Input.jsx
// Premium input — focus state animation, overline label, 14px border-radius

import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

export function Input({
  label,
  error,
  icon,
  containerStyle,
  required,
  hint,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onBlur?.();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border, colors.primary],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <Animated.View style={[styles.inputWrap, { borderColor }]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.textLight}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon ? styles.inputWithIcon : undefined]}
          placeholderTextColor={colors.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  required: { color: colors.error },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.text,
    paddingVertical: 14,
  },
  inputWithIcon: { paddingLeft: 0 },
  hint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 6,
  },
  error: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
  },
});
