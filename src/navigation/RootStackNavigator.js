import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from './routes';
import BottomTabNavigator from './BottomTabNavigator';

import DriverSplashScreen from '../screens/Splash';

// ============================================================
// ROOT STACK NAVIGATOR
// ------------------------------------------------------------
// Top level of the app. Flow:
//
//   Splash  --(replace)-->  MainTabs (bottom tabs)
//
// Add full-screen pages that should open ON TOP of the tabs
// here (e.g. Notifications, Order detail), and push them with
// navigation.navigate(ROUTES.X).
//
// Later, Login / Register / OTP screens can go in their own
// AuthStackNavigator and be added here the same way.
// ============================================================

const Stack = createNativeStackNavigator();

const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.SPLASH}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={ROUTES.SPLASH}
        component={DriverSplashScreen}
        options={{ animation: 'fade' }}
      />

      <Stack.Screen
        name={ROUTES.MAIN_TABS}
        component={BottomTabNavigator}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};

export default RootStackNavigator;
