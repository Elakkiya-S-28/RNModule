
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from './src/core/theme/themeStore';
import { ErrorBoundary } from './src/core/error/ErrorBoundary';
import { ToastContainer } from './src/core/ui/ToastContainer';
import { AppProviders } from './src/app/providers/AppProviders';
import { useIsOnline } from './src/core/api/connectivity';

function App() {
  const sysScheme = useColorScheme();
  const setMode = useThemeStore(s => s.setMode);

  useEffect(() => {
    setMode(sysScheme === 'dark' ? 'dark' : 'light');
  }, [sysScheme, setMode]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProviders>
          <ThemedStatusBar />
          <OfflineBanner />
          <ToastContainer />
        </AppProviders>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function ThemedStatusBar() {
  const isDark = useThemeStore(s => s.isDark);
  return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />;
}

function OfflineBanner() {
  const online = useIsOnline();
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  if (online) return null;
  return (
    <View style={[styles.banner, { backgroundColor: c.offlineBg }]}>
      <Text style={{ color: c.text, fontSize: 12, fontWeight: '600' }}>
        📡 Offline — you can continue browsing. Changes will sync when you're back online.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
});

export default App;
