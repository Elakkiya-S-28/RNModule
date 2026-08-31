import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useThemeStore } from '../theme/themeStore';
import { initialsFromName } from '../util/format';

interface Props {
  name?: string;

  uri?: string | null;
  size?: number;
}

export function Avatar({ name, uri, size = 48 }: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const radius = size / 2;
  const dims = { width: size, height: size, borderRadius: radius };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[dims, styles.img]}
        accessibilityLabel={name ? `Avatar of ${name}` : 'Avatar'}
      />
    );
  }

  return (
    <View style={[dims, styles.fallback, { backgroundColor: c.primary }]}>
      <Text style={[styles.initials, { color: c.textInverse, fontSize: size * 0.4 }]}>
        {name ? initialsFromName(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { borderRadius: 999, backgroundColor: '#DDD' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '700' },
});

export default Avatar;
