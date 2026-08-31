import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../theme/themeStore';
import { type as fontType } from '../theme/fonts';
import { APP_NAME } from './AppBar';

interface Props {
  right?: React.ReactNode;
}

export function AppHeader({ right }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <View style={[styles.brandDot, { backgroundColor: c.accent }]}>
          <Text style={[styles.brandGlyph, { color: c.textInverse }]}>अ</Text>
        </View>
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={[styles.title, { color: c.text }]}>
            {APP_NAME}
          </Text>
          <Text numberOfLines={1} style={[styles.subtitle, { color: c.textSecondary }]}>
            Ayurveda · Wellness · Health
          </Text>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  brandDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandGlyph: { ...fontType.stat, fontSize: 18 },
  titleWrap: { flex: 1 },
  title: { ...fontType.appTitle },
  subtitle: { ...fontType.caption, marginTop: 1 },
  right: { marginLeft: 10, flexDirection: 'row', alignItems: 'center' },
});

export default AppHeader;
