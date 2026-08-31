import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { ConsultationsNavigator } from '../../modules/consultations/src/navigation/ConsultationsNavigator';
import { ShopNavigator } from '../../modules/shop/src/navigation/ShopNavigator';
import { HealthNavigator } from '../../modules/health/src/navigation/HealthNavigator';
import { useThemeStore } from '../../core/theme/themeStore';
import { AppIcon, AppIconName } from '../../core/ui/AppIcon';
import { type as fontType } from '../../core/theme/fonts';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, AppIconName> = {
  Consultations: 'calendar',
  Shop: 'bagHandle',
  Health: 'pulse',
};

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
        tabBarLabelStyle: { ...fontType.label, fontSize: 11 },
        tabBarIconStyle: { marginTop: 2 },
        tabBarIcon: ({ focused }) => (
          <AppIcon
            name={TAB_ICONS[route.name]}
            size={20}
            color={focused ? 'tabBarActive' : 'tabBarInactive'}
          />
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
