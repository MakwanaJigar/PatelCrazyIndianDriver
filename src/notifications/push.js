import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert, confirmAlert } from '../components/AppAlert';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  hasPermission,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { ROUTES } from '../navigation/routes';
import { getSession } from '../api/session';

// ============================================================
// PUSH NOTIFICATIONS (Firebase Cloud Messaging)
// ------------------------------------------------------------
//   getFcmToken()          -> device token, sent with /driver/login
//   initPushNotifications  -> permission + foreground / tap
//                             handlers (called once from AppNavigator)
//   getLaunchNotification  -> notification that cold-started the
//                             app (Splash opens Notifications for it)
//   subscribeToPushes(cb)  -> screens refresh when a push arrives
//
// While the app is in the background / closed, Android shows
// notification messages itself; tapping one opens Notifications.
// ============================================================

const messaging = () => getMessaging(getApp());

const listeners = new Set();

export const subscribeToPushes = callback => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const notifyListeners = message => listeners.forEach(cb => cb(message));

const NOTIFICATIONS_BLOCKED_KEY = '@crazyindian/notifications_blocked';

// Themed explanation shown before the (unstyleable) system prompt
const askBeforeSystemPrompt = () =>
  confirmAlert(
    'Stay on top of new orders',
    'Allow notifications so we can alert you the moment a new delivery is assigned to you.',
    { confirmText: 'Allow', cancelText: 'Not now', type: 'info' },
  );

// Android 13+ needs the runtime POST_NOTIFICATIONS permission
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version < 33) {
        return true;
      }
      const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
      if (await PermissionsAndroid.check(permission)) {
        return true;
      }
      // Blocked for good - the system won't ask again, so neither do we
      if (await AsyncStorage.getItem(NOTIFICATIONS_BLOCKED_KEY)) {
        return false;
      }
      if (!(await askBeforeSystemPrompt())) {
        return false;
      }
      const result = await PermissionsAndroid.request(permission);
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        await AsyncStorage.setItem(NOTIFICATIONS_BLOCKED_KEY, '1');
      }
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }

    // iOS only shows its prompt once, so explain first
    const current = await hasPermission(messaging());
    if (current === AuthorizationStatus.NOT_DETERMINED) {
      if (!(await askBeforeSystemPrompt())) {
        return false;
      }
    }

    const status = await requestPermission(messaging());
    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  } catch (e) {
    console.warn('Notification permission failed:', e);
    return false;
  }
};

// FCM token for this device, or null if Firebase isn't reachable.
// Never throws and gives up after a few seconds so login isn't blocked.
export const getFcmToken = async () => {
  try {
    return await Promise.race([
      getToken(messaging()),
      new Promise(resolve => setTimeout(() => resolve(null), 8000)),
    ]);
  } catch (e) {
    console.warn('Could not get FCM token:', e);
    return null;
  }
};

// Must be registered at module scope (index.js), before the app renders.
// Notification messages are displayed by Android itself; this only
// stops "No background message handler" warnings for data messages.
export const registerBackgroundHandler = () => {
  setBackgroundMessageHandler(messaging(), async () => {});
};

export const getLaunchNotification = async () => {
  try {
    return await getInitialNotification(messaging());
  } catch (e) {
    return null;
  }
};

const openNotifications = async navigationRef => {
  const session = await getSession();
  if (session?.token && navigationRef.isReady()) {
    navigationRef.navigate(ROUTES.NOTIFICATIONS);
  }
};

// Returns an unsubscribe function
export const initPushNotifications = navigationRef => {
  requestNotificationPermission();

  // App open: Android won't show the notification, so show an alert
  const unsubscribeForeground = onMessage(messaging(), async message => {
    notifyListeners(message);

    const { title, body } = message.notification || {};
    if (title || body) {
      showAlert(
        title || 'New notification',
        body || '',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'View', onPress: () => openNotifications(navigationRef) },
        ],
        { type: 'info' },
      );
    }
  });

  // App in background: driver tapped the notification
  const unsubscribeOpened = onNotificationOpenedApp(messaging(), message => {
    notifyListeners(message);
    openNotifications(navigationRef);
  });

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
  };
};
