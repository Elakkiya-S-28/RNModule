import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp, Pressable } from 'react-native';
import { useThemeStore } from '../theme/themeStore';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Optional title row shown at top. */
  title?: string;
}

/** Surface card used across all modules for consistent elevation/separators. */
export function Card({ children, style, onPress, title }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;

  const inner = (
    <>
      {title ? (
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      ) : null}
      {children}
    </>
  );

  const cardStyle = [
    styles.card,
    { backgroundColor: c.surface, borderColor: c.border },
    style,
  ];

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
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
});

export default Card;