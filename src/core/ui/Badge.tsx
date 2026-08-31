import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../theme/themeStore';

type BadgeTone = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface Props {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}

const toneMap: Record<BadgeTone, string> = {
  primary: 'primary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  neutral: 'textMuted',
};

export function Badge({ label, tone = 'neutral', style, small = false }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const colorKey = toneMap[tone];
  const color = (c as unknown as Record<string, string>)[colorKey];

  return (
    <View
      style={[
        styles.badge,
        small && styles.small,
        { backgroundColor: tone === 'neutral' ? c.surfaceAlt : `${color}22`, borderColor: `${color}44` },
        style,
      ]}
    >
      <Text style={[styles.text, small && styles.smallText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  small: { paddingHorizontal: 7, paddingVertical: 1 },
  text: { fontSize: 12, fontWeight: '600' },
  smallText: { fontSize: 10.5 },
});

export default Badge;
