import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../theme/themeStore';

interface Props {
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/** Centered loading state with optional label. */
export function Spinner({ label, style }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={c.primary} />
      {label ? <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  label: { marginTop: 12, fontSize: 14 },
});

export default Spinner;