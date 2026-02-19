import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { radius, shadows, spacing } from '../../theme/spacing';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: {
      backgroundColor: colors.brand[600],
      ...shadows.button,
    },
    text: { color: colors.text.inverse },
  },
  secondary: {
    container: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1.5,
      borderColor: colors.brand[600],
    },
    text: { color: colors.brand[600] },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.brand[400] },
  },
  danger: {
    container: { backgroundColor: colors.error.default },
    text: { color: colors.text.inverse },
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const vs = variantStyles[variant];
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        vs.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.brand[600]}
        />
      ) : (
        <Text style={[styles.text, vs.text, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.55 },
  text: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
});