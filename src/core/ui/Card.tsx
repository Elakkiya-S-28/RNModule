import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp, Pressable } from 'react-native';
import { useThemeStore } from '../theme/themeStore';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;

  title?: string;
}

export function Card({ children, style, onPress, title }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const surfaceStyle =
    theme.mode === 'dark'
      ? { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }
      : { backgroundColor: c.surface, ...theme.shadow.card, shadowColor: c.shadowPrimary };

  const inner = (
    <>
      {title ? (
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      ) : null}
      {children}
    </>
  );

  const cardStyle = [styles.card, surfaceStyle, style];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.92 }]}
      >
        {inner}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
});

export default Card;
