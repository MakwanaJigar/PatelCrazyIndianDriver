import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootStackNavigator from './RootStackNavigator';

// ============================================================
// APP NAVIGATOR (entry point of all navigation)
// ------------------------------------------------------------
//   SafeAreaProvider      -> makes <SafeAreaView> work on
//                            Android + iOS (notch, status bar,
//                            gesture bar)
//   NavigationContainer   -> holds navigation state
//   RootStackNavigator    -> Splash -> MainTabs
//     BottomTabNavigator  -> Home / Orders / Live Map /
//                            History / Profile
// ============================================================

const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootStackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default AppNavigator;
