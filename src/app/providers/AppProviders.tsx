import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme as NavDarkTheme,
} from '@react-navigation/native';
import { useThemeStore } from '../../core/theme/themeStore';
import { useConnectivityStore, useIsOnline } from '../../core/api/connectivity';
import { flushOfflineQueue } from '../../core/api';
import { mockTransport } from '../../core/db/mockServer';
import { notifySync } from '../../modules/consultations/src/services/consultationApi';
import { RootStackParamList } from '../navigation/types';
import { MainTabs } from '../navigation/MainTabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * App-wide provider chain:
 *  - Theme store hydration (light/dark).
 *  - Connectivity subscription + automatic offline-queue sync on reconnect
 *    and on app foreground (Background Synchronisation bonus feature).
 *
 * Wrapped as a component so it can live below the NavigationContainer.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore(s => s.theme);
  const online = useIsOnline();

  // Hydrate connectivity listener once.
  useEffect(() => {
    const unsub = useConnectivityStore.getState().initialize();
    return unsub;
  }, []);

  // Auto-sync when we become online or the app returns to foreground.
  useEffect(() => {
    if (!online) return;
    const timer = setTimeout(() => {
      flushOfflineQueue(mockTransport).then(res => {
        if (res.flushed > 0 || res.remaining > 0) notifySync();
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [online]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        useConnectivityStore.getState().connect();
        flushOfflineQueue(mockTransport).then(() => notifySync());
      }
    });
    return () => sub.remove();
  }, []);

  const navTheme = {
    ...(theme.mode === 'dark' ? NavDarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === 'dark' ? NavDarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />
      </RootStack.Navigator>
      {children}
    </NavigationContainer>
  );
}

export default AppProviders;