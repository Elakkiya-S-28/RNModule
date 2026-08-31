import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../theme/themeStore';

interface Props {
  icon?: string;
  title: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ icon, title, message, style }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={[styles.container, style]}>
      {icon ? <Text style={[styles.icon, { color: c.textMuted }]}>{icon}</Text> : <EmptyIcon color={c.textMuted} />}
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text>
      ) : null}
    </View>
  );
}

function EmptyIcon({ color }: { color: string }) {
  return (
    <View style={[styles.iconCircle, { borderColor: color }]}>
      <Text style={{ color, fontSize: 28 }}>◔</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  icon: { fontSize: 40, marginBottom: 12 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 13, marginTop: 4, textAlign: 'center', lineHeight: 18 },
});

export default EmptyState;
