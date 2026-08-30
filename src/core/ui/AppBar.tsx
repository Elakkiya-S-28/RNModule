import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../theme/themeStore';

interface Props {
  title: string;
  subtitle?: string;
  /** Optional left accessory (usually a back button). */
  onBack?: () => void;
  right?: React.ReactNode;
}

/** Top app bar with back affordance + right slot. */
export function AppBar({ title, subtitle, onBack, right }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: c.background, paddingTop: insets.top + 6 },
      ]}
    >
      <View style={styles.inner}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
            style={({ pressed }) => [styles.backBtn, { backgroundColor: c.surface, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.backIcon, { color: c.text }]}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtnSpacer} />
        )}
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={[styles.subtitle, { color: c.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 8 },
  inner: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  backBtnSpacer: { width: 38, marginRight: 10 },
  backIcon: { fontSize: 30, lineHeight: 34, fontWeight: '600', marginTop: -3 },
  titleWrap: { flex: 1 },
  title: { fontSize: 19, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 1 },
  right: { marginLeft: 10 },
});

export default AppBar;