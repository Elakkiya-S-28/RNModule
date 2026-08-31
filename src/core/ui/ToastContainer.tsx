import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, ToastKind } from '../toast';
import { useThemeStore } from '../theme/themeStore';

const kindColors: Record<ToastKind, string> = {
  success: 'success',
  error: 'danger',
  info: 'info',
  warning: 'warning',
};

const kindIcons: Record<ToastKind, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '!',
};

export function ToastContainer() {
  const sw = useSafeAreaInsets();
  const toasts = useToastStore(s => s.toasts);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingTop: sw.top + 8 }]}
      accessibilityLiveRegion="polite"
    >
      {toasts.map(t => (
        <ToastCard key={t.id} kind={t.kind} title={t.title} message={t.message} />
      ))}
    </View>
  );
}

function ToastCard({
  kind,
  title,
  message,
}: {
  kind: ToastKind;
  title?: string;
  message: string;
}) {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  const colorKey = kindColors[kind];
  const color = (c as unknown as Record<string, string>)[colorKey];
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: c.surface,
          borderColor: color,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
            { scale: anim },
          ],
          opacity: anim,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${color}22` }]}>
        <Text style={{ color, fontSize: 16, fontWeight: '700' }}>{kindIcons[kind]}</Text>
      </View>
      <View style={styles.body}>
        {title ? <Text style={[styles.title, { color: c.text }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: c.textSecondary }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  icon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700' },
  message: { fontSize: 13, marginTop: 1 },
});

export default ToastContainer;
