import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from './routes';
import BottomTabNavigator from './BottomTabNavigator';

import DriverSplashScreen from '../screens/Splash';
import LoginScreen from '../screens/auth/Login';
import RegisterScreen from '../screens/auth/Register';
import ForgotPasswordScreen from '../screens/auth/ForgotPassword';
import OtpScreen from '../screens/auth/Otp';
import ResetPasswordScreen from '../screens/auth/ResetPassword';
import EditProfileScreen from '../screens/EditProfile';
import OrderDetailsScreen from '../screens/OrderDetails';
import NotificationsScreen from '../screens/Notifications';
import SmartRouteScreen from '../screens/SmartRoute';

// ============================================================
// ROOT STACK NAVIGATOR
// ------------------------------------------------------------
// Top level of the app. Flow:
//
//   Splash --(saved session)--> MainTabs (bottom tabs)
//   Splash --(no session)-----> Login <--> Register
//   Login  --(replace)--------> MainTabs
//   Login  -> ForgotPassword -> Otp --(replace)--> ResetPassword
//          --(reset)--> Login
//   Profile "Log Out" --(reset)--> Login
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
        name={ROUTES.LOGIN}
        component={LoginScreen}
        options={{ animation: 'fade' }}
      />

      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />

      <Stack.Screen
        name={ROUTES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
      />

      <Stack.Screen name={ROUTES.OTP} component={OtpScreen} />

      <Stack.Screen
        name={ROUTES.RESET_PASSWORD}
        component={ResetPasswordScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name={ROUTES.MAIN_TABS}
        component={BottomTabNavigator}
        options={{ animation: 'fade' }}
      />

      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />

      <Stack.Screen
        name={ROUTES.ORDER_DETAILS}
        component={OrderDetailsScreen}
      />

      <Stack.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
      />

      <Stack.Screen name={ROUTES.SMART_ROUTE} component={SmartRouteScreen} />
    </Stack.Navigator>
  );
};

export default RootStackNavigator;
