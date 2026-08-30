import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { ConsultationsNavigator } from '../../modules/consultations/src/navigation/ConsultationsNavigator';
import { ShopNavigator } from '../../modules/shop/src/navigation/ShopNavigator';
import { HealthNavigator } from '../../modules/health/src/navigation/HealthNavigator';
import { useThemeStore } from '../../core/theme/themeStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Consultations: '🩺',
  Shop: '🛍️',
  Health: '📁',
};

/**
 * Root bottom tab navigator — hosts the three independent modules.
 * Tab bar colours come from the active theme (dark-mode aware).
 */
export function MainTabs() {
  const theme = useThemeStore(s => s.theme);
  const c = theme.colors;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.tabBarActive,
        tabBarInactiveTintColor: c.tabBarInactive,
        tabBarStyle: { backgroundColor: c.tabBarBg, borderTopColor: c.border },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.6 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        lazy: true,
      })}
    >
      <Tab.Screen
        name="Consultations"
        component={ConsultationsNavigator}
        options={{ tabBarLabel: 'Consult' }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopNavigator}
        options={{ tabBarLabel: 'Shop' }}
      />
      <Tab.Screen
        name="Health"
        component={HealthNavigator}
        options={{ tabBarLabel: 'Health' }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;