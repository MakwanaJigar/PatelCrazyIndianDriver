import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ROUTES } from './routes';

import HomeScreen from '../screens/Home';
import OrdersScreen from '../screens/Orders';
import DeliveryDetailScreen from '../screens/DeliveryDetails';
import OrderHistory from '../screens/OrderHistory';
import ProfileScreen from '../screens/Profile';

// ============================================================
// BOTTOM TAB NAVIGATOR
// ------------------------------------------------------------
// The 5 main tabs of the app:
//
//   Home | Orders | Live Map | History | Profile
//
// Each screen already draws its own designed bottom bar, so the
// default React Navigation tab bar is hidden (tabBar={() => null}).
// The screen bars call navigation.navigate(ROUTES.X) to switch tabs.
// ============================================================

const Tab = createBottomTabNavigator();

const hideDefaultTabBar = () => null;

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.HOME}
      tabBar={hideDefaultTabBar}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Tab.Screen name={ROUTES.ORDERS} component={OrdersScreen} />
      <Tab.Screen name={ROUTES.LIVE_MAP} component={DeliveryDetailScreen} />
      <Tab.Screen name={ROUTES.HISTORY} component={OrderHistory} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
