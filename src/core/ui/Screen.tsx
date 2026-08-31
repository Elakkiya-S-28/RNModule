import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../theme/themeStore';
import { type as fontType } from '../theme/fonts';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  safeTop?: boolean;
  safeBottom?: boolean;
  testID?: string;
}

export function Screen({
  children,
  style,
  padded = true,
  safeTop = true,
  safeBottom = true,
  testID,
}: Props) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <SafeAreaView
      testID={testID}
      edges={safeTop && safeBottom ? undefined : safeTop ? ['top'] : safeBottom ? ['bottom'] : []}
      style={[
        styles.container,
        { backgroundColor: c.background },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, right, onBack }: HeaderProps) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>
        {title ? <Text style={[styles.title, { color: c.text }]}>{title}</Text> : null}
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
          <Text style={{ color: c.primary }}>Back</Text>
        </Pressable>
      ) : null}
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
  title: { ...fontType.screenTitle },
  subtitle: { ...fontType.caption, marginTop: 2 },
});

export default Screen;
