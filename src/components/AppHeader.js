import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchNotifications } from '../api/notifications';
import { getSession } from '../api/session';
import { subscribeToPushes } from '../notifications/push';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';

// ============================================================
// APP HEADER
// ------------------------------------------------------------
// The Home header, shared by every logged-in screen:
//   logo + greeting | 🔔 (red dot when unread) | driver initials
//
//   <AppHeader />                              tab screens
//   <AppHeader onBack={goBack} title="..." />  pushed screens
//
// `onBack` adds a back arrow before the logo; `title` /
// `subtitle` add a slim page-title bar under the header.
// `style` is applied to the Animated.View (entry animations).
// ============================================================

const DESIGN_WIDTH = 452;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#E92025';
const GREEN = '#078B53';
const DARK = '#111827';
const MUTED = '#61708B';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good Morning';
  }
  if (hour < 17) {
    return 'Good Afternoon';
  }
  return 'Good Evening';
};

// "John" + "Smith" -> "JS"
const getInitials = (driver = {}) =>
  [driver.first_name, driver.last_name]
    .filter(Boolean)
    .map(part => String(part).trim()[0])
    .join('')
    .toUpperCase() || '?';

const AppHeader = ({ onBack, title, subtitle, style }) => {
  const navigation = useNavigation();

  // Red dot on the bell when GET /driver/notifications has unread items
  const [hasUnread, setHasUnread] = useState(false);

  const checkUnread = useCallback(() => {
    fetchNotifications()
      .then(list => setHasUnread(list.some(item => !item.read)))
      .catch(() => {});
  }, []);

  useFocusEffect(checkUnread);

  // Driver's initials from the saved session; re-read on focus so a
  // name changed in Edit Profile shows straight away
  const [initials, setInitials] = useState('');

  useFocusEffect(
    useCallback(() => {
      getSession().then(session => setInitials(getInitials(session?.driver)));
    }, []),
  );

  useEffect(() => subscribeToPushes(checkUnread), [checkUnread]);

  // Profile is a tab inside MAIN_TABS, so pushed screens reach it
  // through the tab navigator
  const openProfile = () =>
    navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.PROFILE });

  return (
    <Animated.View style={[styles.wrap, style]}>
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.brandArea}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />

          <View style={styles.brandText}>
            <Text numberOfLines={1} style={styles.brandSubtitle}>
              {getGreeting()} 👋
            </Text>

            <Text numberOfLines={1} style={styles.brandTitle}>
              Captain
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.bellButton}
            onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {hasUnread ? <View style={styles.bellDot} /> : null}
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={openProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      {title ? (
        <View style={styles.titleBar}>
          <Text numberOfLines={1} style={styles.pageTitle}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.pageSubtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',

    borderBottomLeftRadius: rs(22),
    borderBottomRightRadius: rs(22),

    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
    zIndex: 1,
  },

  header: {
    height: rs(76),

    paddingHorizontal: rs(20),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    width: rs(38),
    height: rs(38),

    borderRadius: rs(19),

    backgroundColor: '#F1F4F9',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  backText: {
    color: DARK,

    fontSize: fs(20),
    fontWeight: '700',
  },

  brandArea: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  brandText: {
    flex: 1,
  },

  brandLogo: {
    width: rs(44),
    height: rs(44),

    marginRight: rs(10),
  },

  brandTitle: {
    color: DARK,

    fontSize: fs(20),
    fontWeight: '900',

    marginTop: rs(1),
  },

  brandSubtitle: {
    color: MUTED,

    fontSize: fs(12),
    fontWeight: '600',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bellButton: {
    width: rs(42),
    height: rs(42),

    borderRadius: rs(21),

    backgroundColor: '#F1F4F9',

    borderWidth: 1,
    borderColor: '#E1E6EF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  bellIcon: {
    fontSize: fs(18),
  },

  bellDot: {
    position: 'absolute',
    top: rs(9),
    right: rs(10),

    width: rs(9),
    height: rs(9),

    borderRadius: rs(5),

    backgroundColor: RED,

    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  avatar: {
    width: rs(42),
    height: rs(42),

    borderRadius: rs(21),

    borderWidth: 2,
    borderColor: RED,

    backgroundColor: '#FFE8E8',

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: RED,

    fontSize: fs(15),
    fontWeight: '900',
  },

  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,

    width: rs(12),
    height: rs(12),

    borderRadius: rs(6),

    backgroundColor: GREEN,

    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  titleBar: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(14),

    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',

    paddingTop: rs(10),
  },

  pageTitle: {
    color: DARK,

    fontSize: fs(18),
    fontWeight: '900',
  },

  pageSubtitle: {
    marginTop: rs(2),

    color: MUTED,

    fontSize: fs(12),
    fontWeight: '700',
  },
});
