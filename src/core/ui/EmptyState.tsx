import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../theme/themeStore';
import { AppIcon, AppIconName } from './AppIcon';

type EmptyStateIcon = AppIconName | string;

interface Props {
  icon?: EmptyStateIcon;
  title: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
}

/** Legacy text glyphs kept so existing string props keep rendering an icon. */
const LEGACY_GLYPH_ICONS: Partial<Record<string, AppIconName>> = {
  medkit: 'medkit',
  cart: 'cart',
  heart: 'heart',
  heartOutline: 'heartOutline',
  calendar: 'calendar',
  search: 'search',
  filter: 'filter',
  leaf: 'leaf',
};

const isVectorIconName = (icon: EmptyStateIcon): icon is AppIconName =>
  Object.prototype.hasOwnProperty.call(LEGACY_GLYPH_ICONS, icon) ||
  !/[\u2190-\u2BFF\u{1F000}-\u{1FAFF}\u{FE0F}]/u.test(icon);

export function EmptyState({ icon, title, message, style }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={[styles.container, style]}>
      {icon ? (
        /^\s*$/.test(icon) ? null : (
          <View style={styles.iconWrap}>
            <AppIcon
              name={LEGACY_GLYPH_ICONS[icon] ?? (isVectorIconName(icon) ? icon : 'albumsOutline')}
              size={40}
              color="textMuted"
            />
          </View>
        )
      ) : (
        <View style={[styles.iconCircle, { borderColor: c.textMuted }]}>
          <AppIcon name="albumsOutline" size={28} color="textMuted" />
        </View>
      )}
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  iconWrap: { height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
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
