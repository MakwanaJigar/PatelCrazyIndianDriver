import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// SESSION STORAGE
// ------------------------------------------------------------
// Keeps the logged-in driver's token + profile on the device so
// Splash can skip Login on the next launch.
// ============================================================

const SESSION_KEY = '@crazyindian/driver_session';

export const saveSession = async session => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = async () => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// Merge updated profile fields into the saved driver object
export const updateSessionDriver = async changes => {
  const session = (await getSession()) || {};
  const next = {
    ...session,
    driver: { ...(session.driver || {}), ...changes },
  };
  await saveSession(next);
  return next;
};

export const clearSession = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};
