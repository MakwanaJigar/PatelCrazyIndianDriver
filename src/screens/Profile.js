import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { showAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';
import AppHeader from '../components/AppHeader';
import { getSession, clearSession } from '../api/session';
import { apiPost } from '../api/client';
import { fetchProfile } from '../api/profile';

// ============================================================
// PROFILE
// ------------------------------------------------------------
// Shows the logged-in driver's details (same fields as the
// register payload). The saved session is shown instantly, then
// GET /driver/profile refreshes it whenever this tab comes into
// focus (e.g. back from Edit Profile) or on pull-to-refresh.
// ============================================================

const DESIGN_WIDTH = 412;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#EC2027';
const GREEN = '#079A68';
const DARK = '#111827';
const MUTED = '#64748B';
const BG = '#F7F9FC';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const show = value => (value == null || value === '' ? '—' : String(value));

// "2028-11-30" -> "30 Nov 2028"
const formatDate = value => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  if (!match) {
    return show(value);
  }
  const [, y, m, d] = match;
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};

const isExpired = value => {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date <= new Date();
};

const getInitials = driver =>
  [driver.first_name, driver.last_name]
    .filter(Boolean)
    .map(part => String(part)[0])
    .join('')
    .toUpperCase() || '?';

const ProfileScreen = ({ navigation }) => {
  const [driver, setDriver] = useState({});
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Profile lives inside the bottom tabs; reset the ROOT stack so
  // "back" can't return to the logged-in screens.
  const goToLogin = useCallback(() => {
    (navigation.getParent() ?? navigation).reset({
      index: 0,
      routes: [{ name: ROUTES.LOGIN }],
    });
  }, [navigation]);

  // GET /driver/profile. A 401 means the token is no longer valid,
  // so the driver is sent back to Login.
  const loadProfile = useCallback(
    async (isActive = () => true) => {
      try {
        const latest = await fetchProfile();
        if (isActive()) {
          setDriver(latest || {});
        }
      } catch (e) {
        if (e.status === 401) {
          await clearSession().catch(() => {});
          if (isActive()) {
            showAlert('Session expired', 'Please log in again.', [], {
              type: 'warning',
            });
            goToLogin();
          }
        } else {
          console.warn('Profile API failed:', e.message);
        }
      }
    },
    [goToLogin],
  );

  // Show the cached profile instantly, then refresh from the server
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSession().then(session => {
        if (active) {
          setDriver(session?.driver || {});
        }
      });
      loadProfile(() => active);
      return () => {
        active = false;
      };
    }, [loadProfile]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  // POST /driver/logout (Bearer token). The local session is cleared
  // even if the request fails, so the driver is never stuck logged in.
  const logout = async () => {
    setLoggingOut(true);

    try {
      const session = await getSession();
      await apiPost('/driver/logout', {}, { token: session?.token });
    } catch (e) {
      console.warn('Logout API failed:', e.message);
    }

    try {
      await clearSession();
    } catch (e) {
      console.warn('Could not clear session:', e);
    }

    setLoggingOut(false);
    goToLogin();
  };

  const handleLogout = () => {
    showAlert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const openEdit = () => navigation.navigate(ROUTES.EDIT_PROFILE);

  // ============================================================
  // ANIMATIONS
  // ============================================================

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;

  const profileOpacity = useRef(new Animated.Value(0)).current;
  const profileScale = useRef(new Animated.Value(0.94)).current;

  const sectionsOpacity = useRef(new Animated.Value(0)).current;
  const sectionsY = useRef(new Animated.Value(25)).current;

  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(headerY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(profileOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(profileScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(sectionsOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(sectionsY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fullName =
    [driver.first_name, driver.last_name].filter(Boolean).join(' ') || 'Driver';

  const address = [
    driver.street_line_1,
    driver.street_line_2,
    [driver.suburb, driver.postcode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

  const licenceExpired = isExpired(driver.license_expiry_date);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.screen}>
        {/* ====================================================
            HEADER
        ==================================================== */}

        <AppHeader
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerY }],
          }}
        />

        {/* ====================================================
            SCROLL
        ==================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[RED]}
              tintColor={RED}
            />
          }
        >
          {/* ====================================================
              PROFILE HERO
          ==================================================== */}

          <Animated.View
            style={[
              styles.heroCard,
              {
                opacity: profileOpacity,
                transform: [{ scale: profileScale }],
              },
            ]}
          >
            <View style={styles.heroCircleLarge} />
            <View style={styles.heroCircleSmall} />

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(driver)}</Text>
            </View>

            <Text numberOfLines={1} style={styles.heroName}>
              {fullName}
            </Text>

            <Text numberOfLines={1} style={styles.heroEmail}>
              {show(driver.email)}
            </Text>

            <View style={styles.heroChips}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>
                  🚗 {show(driver.vehicle_rego_number)}
                </Text>
              </View>

              <View style={styles.heroChip}>
                <View style={styles.activeDot} />
                <Text style={styles.heroChipText}>Active Driver</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.editButton}
              onPress={openEdit}
            >
              <Text style={styles.editButtonText}>✎ Edit Profile</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              opacity: sectionsOpacity,
              transform: [{ translateY: sectionsY }],
            }}
          >
            {/* ==================================================
                PERSONAL DETAILS
            ================================================== */}

            <Section
              icon="♙"
              iconBg="#FFE9E9"
              iconColor={RED}
              title="Personal Details"
            >
              <InfoRow label="First Name" value={show(driver.first_name)} />
              <InfoRow label="Last Name" value={show(driver.last_name)} />
              <InfoRow
                label="Contact Number"
                value={show(driver.contact_number)}
              />
              <InfoRow label="Email" value={show(driver.email)} last />
            </Section>

            {/* ==================================================
                ADDRESS
            ================================================== */}

            <Section
              icon="⌂"
              iconBg="#EBF0FF"
              iconColor="#2F5BD3"
              title="Address"
            >
              <InfoRow
                label="Street"
                value={show(
                  [driver.street_line_1, driver.street_line_2]
                    .filter(Boolean)
                    .join(', '),
                )}
              />
              <InfoRow label="Suburb" value={show(driver.suburb)} />
              <InfoRow label="Postcode" value={show(driver.postcode)} />
              <InfoRow label="Full Address" value={show(address)} last />
            </Section>

            {/* ==================================================
                LICENCE & VEHICLE
            ================================================== */}

            <Section
              icon="▣"
              iconBg="#E8FAF1"
              iconColor={GREEN}
              title="Licence & Vehicle"
              badge={
                driver.license_expiry_date
                  ? licenceExpired
                    ? { text: 'Licence Expired', color: RED, bg: '#FFE9E9' }
                    : { text: 'Licence Valid', color: GREEN, bg: '#E3F9EE' }
                  : null
              }
            >
              <InfoRow
                label="Licence Number"
                value={show(driver.license_number)}
              />
              <InfoRow
                label="Licence Expiry"
                value={formatDate(driver.license_expiry_date)}
                valueColor={licenceExpired ? RED : undefined}
              />
              <InfoRow
                label="Vehicle Rego"
                value={show(driver.vehicle_rego_number)}
                last
              />
            </Section>
          </Animated.View>

          {/* ====================================================
              LOG OUT
          ==================================================== */}

          <Animated.View style={{ opacity: footerOpacity }}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color={RED} />
              ) : (
                <>
                  <Text style={styles.logoutIcon}>⇥</Text>
                  <Text style={styles.logoutText}>Log Out</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.versionText}>Patel’s Driver App v1.0</Text>
          </Animated.View>
        </ScrollView>

        {/* ====================================================
            BOTTOM NAV
        ==================================================== */}

        <View style={styles.bottomNav}>
          <BottomNav
            icon="▦"
            title="Home"
            onPress={() => navigation.navigate(ROUTES.HOME)}
          />

          <BottomNav
            icon="▣"
            title="History"
            onPress={() => navigation.navigate(ROUTES.HISTORY)}
          />

          <BottomNav
            icon="♙"
            title="Profile"
            active
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ============================================================
   COMPONENTS
============================================================ */

const Section = ({ icon, iconBg, iconColor, title, badge, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionTopRow}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIcon, { backgroundColor: iconBg }]}>
          <Text style={[styles.sectionIconText, { color: iconColor }]}>
            {icon}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {badge ? (
        <View style={[styles.sectionBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.sectionBadgeText, { color: badge.color }]}>
            {badge.text}
          </Text>
        </View>
      ) : null}
    </View>

    <View style={styles.sectionBody}>{children}</View>
  </View>
);

const InfoRow = ({ label, value, valueColor, last }) => (
  <View style={[styles.infoRow, last && styles.infoRowLast]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      style={[styles.infoValue, valueColor && { color: valueColor }]}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

const BottomNav = ({ icon, title, active, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    style={styles.navItem}
    onPress={onPress}
  >
    <Text style={[styles.navIcon, active && styles.navIconActive]}>{icon}</Text>

    <Text style={[styles.navText, active && styles.navTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default ProfileScreen;

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    paddingHorizontal: rs(18),
    paddingTop: rs(18),
    paddingBottom: rs(40),
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    height: rs(72),

    backgroundColor: '#FFFFFF',

    borderBottomLeftRadius: rs(22),
    borderBottomRightRadius: rs(22),

    paddingHorizontal: rs(20),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
    zIndex: 1,
  },

  brandArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandLogo: {
    width: rs(42),
    height: rs(42),

    marginRight: rs(10),
  },

  brandTitle: {
    color: DARK,

    fontSize: fs(18),
    fontWeight: '900',
  },

  brandSubtitle: {
    color: MUTED,

    fontSize: fs(12),
    fontWeight: '600',

    marginTop: rs(1),
  },

  headerEditButton: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(8),

    borderRadius: rs(20),

    backgroundColor: '#FFF0F0',

    borderWidth: 1,
    borderColor: '#FFC9C9',
  },

  headerEditText: {
    color: RED,

    fontSize: fs(13),
    fontWeight: '800',
  },

  /* ==========================================================
     HERO
  ========================================================== */

  heroCard: {
    backgroundColor: RED,

    borderRadius: rs(22),

    paddingVertical: rs(24),
    paddingHorizontal: rs(20),

    alignItems: 'center',

    overflow: 'hidden',

    shadowColor: RED,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },

    elevation: 8,
  },

  heroCircleLarge: {
    position: 'absolute',
    top: -rs(70),
    right: -rs(50),

    width: rs(200),
    height: rs(200),

    borderRadius: rs(100),

    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  heroCircleSmall: {
    position: 'absolute',
    bottom: -rs(60),
    left: -rs(40),

    width: rs(140),
    height: rs(140),

    borderRadius: rs(70),

    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  avatar: {
    width: rs(86),
    height: rs(86),

    borderRadius: rs(43),

    backgroundColor: '#FFFFFF',

    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.45)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: RED,

    fontSize: fs(32),
    fontWeight: '900',
  },

  heroName: {
    color: '#FFFFFF',

    fontSize: fs(24),
    fontWeight: '900',

    marginTop: rs(12),
  },

  heroEmail: {
    color: 'rgba(255,255,255,0.9)',

    fontSize: fs(14),
    fontWeight: '600',

    marginTop: rs(3),
  },

  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',

    marginTop: rs(14),
  },

  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.18)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',

    borderRadius: rs(20),

    paddingHorizontal: rs(12),
    paddingVertical: rs(6),

    marginHorizontal: rs(4),
    marginBottom: rs(6),
  },

  heroChipText: {
    color: '#FFFFFF',

    fontSize: fs(12),
    fontWeight: '800',
  },

  activeDot: {
    width: rs(8),
    height: rs(8),

    borderRadius: rs(4),

    backgroundColor: '#5CF2B0',

    marginRight: rs(6),
  },

  editButton: {
    marginTop: rs(12),

    height: rs(46),

    paddingHorizontal: rs(28),

    borderRadius: rs(23),

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    color: RED,

    fontSize: fs(15),
    fontWeight: '900',
  },

  /* ==========================================================
     SECTIONS
  ========================================================== */

  sectionCard: {
    marginTop: rs(16),

    backgroundColor: '#FFFFFF',

    borderRadius: rs(16),

    padding: rs(16),

    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },

    elevation: 3,
  },

  sectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: rs(34),
    height: rs(34),

    borderRadius: rs(10),

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  sectionIconText: {
    fontSize: fs(16),
    fontWeight: '900',
  },

  sectionTitle: {
    color: DARK,

    fontSize: fs(16),
    fontWeight: '900',
  },

  sectionBadge: {
    paddingHorizontal: rs(10),
    paddingVertical: rs(5),

    borderRadius: rs(20),
  },

  sectionBadgeText: {
    fontSize: fs(11),
    fontWeight: '800',
  },

  sectionBody: {
    marginTop: rs(8),
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: rs(12),

    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },

  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: rs(2),
  },

  infoLabel: {
    color: MUTED,

    fontSize: fs(13),
    fontWeight: '600',

    marginRight: rs(12),
  },

  infoValue: {
    flex: 1,

    color: DARK,

    fontSize: fs(14),
    fontWeight: '800',

    textAlign: 'right',
  },

  /* ==========================================================
     LOGOUT
  ========================================================== */

  logoutButton: {
    height: rs(54),

    marginTop: rs(20),

    borderWidth: 1.5,
    borderColor: '#FFBABA',

    borderRadius: rs(14),

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutIcon: {
    color: RED,

    fontSize: fs(18),

    marginRight: rs(8),
  },

  logoutText: {
    color: RED,

    fontSize: fs(15),
    fontWeight: '800',
  },

  versionText: {
    color: '#8291A9',

    fontSize: fs(12),

    textAlign: 'center',

    marginTop: rs(18),
  },

  /* ==========================================================
     BOTTOM NAVIGATION
  ========================================================== */

  bottomNav: {
    height: rs(76),

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E3E8EF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    elevation: 12,
  },

  navItem: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    color: '#61738E',

    fontSize: fs(20),
  },

  navIconActive: {
    color: RED,
  },

  navText: {
    color: '#61738E',

    fontSize: fs(10),
    fontWeight: '600',

    marginTop: rs(4),
  },

  navTextActive: {
    color: RED,

    fontWeight: '800',
  },
});
