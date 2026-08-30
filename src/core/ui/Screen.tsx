import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../theme/themeStore';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  testID?: string;
}

/** Consistent screen container applying theme background + safe padding. */
export function Screen({ children, style, padded = true, testID }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: c.background },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: HeaderProps) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: { flexShrink: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
});

export default Screen;