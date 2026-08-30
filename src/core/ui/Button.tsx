import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useThemeStore } from '../theme/themeStore';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const variantColors: Record<
  ButtonVariant,
  { background: string; text: string; border?: string }
> = {
  primary: { background: 'primary', text: 'textInverse' },
  secondary: { background: 'accent', text: 'textInverse' },
  outline: { background: 'transparent', text: 'primary', border: 'primary' },
  ghost: { background: 'transparent', text: 'primary' },
  danger: { background: 'danger', text: 'textInverse' },
};

/** Reusable button honouring the active theme. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  testID,
}: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const v = variantColors[variant];

  const backgroundColor =
    v.background === 'transparent'
      ? 'transparent'
      : (c as unknown as Record<string, string>)[v.background];
  const textColor =
    v.text === 'textInverse'
      ? c.textInverse
      : (c as unknown as Record<string, string>)[v.text];
  const borderColor = v.border
    ? (c as unknown as Record<string, string>)[v.border]
    : undefined;

  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        {
          backgroundColor,
          borderColor,
          borderWidth: borderColor ? 1 : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    minHeight: 46,
  },
  fullWidth: { width: '100%' },
  label: { fontSize: 15, fontWeight: '600' },
});

export default Button;