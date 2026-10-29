import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootStackNavigator from './RootStackNavigator';
import { navigationRef } from './navigationRef';
import { initPushNotifications } from '../notifications/push';
import { AppAlertHost } from '../components/AppAlert';

// ============================================================
// APP NAVIGATOR (entry point of all navigation)
// ------------------------------------------------------------
//   SafeAreaProvider      -> makes <SafeAreaView> work on
//                            Android + iOS (notch, status bar,
//                            gesture bar)
//   NavigationContainer   -> holds navigation state
//   AppAlertHost          -> themed popups (showAlert)
//   RootStackNavigator    -> Splash -> MainTabs
//     BottomTabNavigator  -> Home / History / Profile
// ============================================================

const AppNavigator = () => {
  // Notification permission + foreground / tap handlers
  useEffect(() => initPushNotifications(navigationRef), []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <RootStackNavigator />
      </NavigationContainer>
      <AppAlertHost />
    </SafeAreaProvider>
  );
};

export default AppNavigator;
