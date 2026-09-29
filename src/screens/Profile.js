import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';

const { width } = Dimensions.get('window');

const DESIGN_WIDTH = 306;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#EC2027';
const GREEN = '#079A68';
const DARK = '#111827';
const MUTED = '#64748B';
const BORDER = '#DEE5ED';
const BG = '#F7F9FC';
const LIGHT_GREEN = '#E9FBF3';

const ProfileScreen = ({ navigation }) => {
  const [nightMode, setNightMode] = useState(true);
  const [language, setLanguage] = useState('English');

  // ============================================================
  // ANIMATIONS
  // ============================================================

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;

  const profileOpacity = useRef(new Animated.Value(0)).current;
  const profileScale = useRef(new Animated.Value(0.94)).current;

  const walletOpacity = useRef(new Animated.Value(0)).current;
  const walletY = useRef(new Animated.Value(25)).current;

  const honorOpacity = useRef(new Animated.Value(0)).current;
  const honorY = useRef(new Animated.Value(25)).current;

  const documentOpacity = useRef(new Animated.Value(0)).current;
  const documentY = useRef(new Animated.Value(25)).current;

  const gearOpacity = useRef(new Animated.Value(0)).current;
  const gearY = useRef(new Animated.Value(25)).current;

  const preferenceOpacity = useRef(new Animated.Value(0)).current;
  const preferenceY = useRef(new Animated.Value(25)).current;

  const footerOpacity = useRef(new Animated.Value(0)).current;

  const dutyPulse = useRef(new Animated.Value(1)).current;
  const withdrawScale = useRef(new Animated.Value(1)).current;

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

      Animated.stagger(80, [
        Animated.parallel([
          Animated.timing(walletOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),

          Animated.timing(walletY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(honorOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),

          Animated.timing(honorY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(documentOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),

          Animated.timing(documentY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(gearOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),

          Animated.timing(gearY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(preferenceOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),

          Animated.timing(preferenceY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),

      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    const dutyLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dutyPulse, {
          toValue: 1.05,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(dutyPulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const timer = setTimeout(() => {
      dutyLoop.start();
    }, 1300);

    return () => {
      clearTimeout(timer);
      dutyLoop.stop();
    };
  }, []);

  const pressWithdraw = () => {
    Animated.sequence([
      Animated.timing(withdrawScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),

      Animated.spring(withdrawScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    console.log('Withdraw Now');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.screen}>
        {/* ====================================================
            HEADER
        ==================================================== */}

        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerY }],
            },
          ]}
        >
          <View style={styles.brandArea}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />

            <View>
              <Text style={styles.brandTitle}>
                Patel’s Driver
              </Text>

              <Text style={styles.brandSubtitle}>
                Profile
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Animated.View
              style={[
                styles.dutyBadge,
                {
                  transform: [{ scale: dutyPulse }],
                },
              ]}
            >
              <View style={styles.dutyDot} />

              <Text style={styles.dutyText}>
                ON DUTY
              </Text>
            </Animated.View>

            <Image
              source={require('../assets/logo.png')}
              style={styles.headerProfile}
            />
          </View>
        </Animated.View>

        {/* ====================================================
            SCROLL
        ==================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ====================================================
              DRIVER PROFILE
          ==================================================== */}

          <Animated.View
            style={[
              styles.profileCard,
              {
                opacity: profileOpacity,
                transform: [{ scale: profileScale }],
              },
            ]}
          >
            <View style={styles.profileTop}>
              <View style={styles.profilePhotoWrapper}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.profilePhoto}
                />

                <View style={styles.verifiedMiniBadge}>
                  <Text style={styles.verifiedMiniText}>
                    ✓
                  </Text>
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.name}>
                  Rahul Verma
                </Text>

                <Text style={styles.captainId}>
                  #PCI-DRV-4091
                </Text>

                <View style={styles.ratingRow}>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingStar}>☆</Text>
                    <Text style={styles.ratingValue}>4.92</Text>
                  </View>

                  <Text style={styles.deliveryCount}>
                    • 1,240 deliveries
                  </Text>
                </View>
              </View>

              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>
                  ACTIVE
                </Text>
              </View>
            </View>

            <View style={styles.vehicleCard}>
              <View style={styles.vehicleIconBox}>
                <Text style={styles.vehicleIcon}>
                  🛵
                </Text>
              </View>

              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  Honda Activa 6G
                </Text>

                <Text style={styles.vehicleNumber}>
                  KA-03-EX-9921
                </Text>
              </View>

              <View style={styles.vehicleVerified}>
                <Text style={styles.vehicleVerifiedText}>
                  ◯ Verified
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ====================================================
              WALLET
          ==================================================== */}

          <Animated.View
            style={[
              styles.sectionCard,
              {
                opacity: walletOpacity,
                transform: [{ translateY: walletY }],
              },
            ]}
          >
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.walletIcon}>
                  <Text style={styles.walletIconText}>
                    ▣
                  </Text>
                </View>

                <Text style={styles.sectionSmallTitle}>
                  EARNINGS & WALLET
                </Text>
              </View>

              <View style={styles.instantBadge}>
                <Text style={styles.instantText}>
                  Instant Ready
                </Text>
              </View>
            </View>

            <View style={styles.walletHeader}>
              <View>
                <Text style={styles.balanceLabel}>
                  Withdrawable Balance
                </Text>

                <Text style={styles.balanceAmount}>
                  ₹3,420.00
                </Text>
              </View>

              <View style={styles.tipBadge}>
                <Text style={styles.tipText}>
                  ↗ +₹420 Tips
                </Text>
              </View>
            </View>

            <View style={styles.bankCard}>
              <View style={styles.bankIconBox}>
                <Text style={styles.bankIcon}>
                  ♜
                </Text>
              </View>

              <View style={styles.bankInfo}>
                <Text style={styles.bankTitle}>
                  HDFC Bank •••• 4892
                </Text>

                <Text style={styles.bankSubtitle}>
                  Primary UPI Payout
                </Text>
              </View>

              <Text style={styles.bankVerified}>
                ✓
              </Text>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: withdrawScale }],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.withdrawButton}
                onPress={pressWithdraw}
              >
                <Text style={styles.withdrawIcon}>
                  ▣
                </Text>

                <Text style={styles.withdrawText}>
                  Withdraw Now
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* ====================================================
              HONOR ROLL
          ==================================================== */}

          <Animated.View
            style={{
              opacity: honorOpacity,
              transform: [{ translateY: honorY }],
            }}
          >
            <View style={styles.honorTitleRow}>
              <Text style={styles.honorTitle}>
                Patel’s Honor Roll
              </Text>

              <View style={styles.tierBadge}>
                <Text style={styles.tierText}>
                  Tier Level 4
                </Text>
              </View>
            </View>

            <View style={styles.honorRow}>
              <HonorCard
                icon="ϟ"
                iconBackground="#FFE5E5"
                title="Fast"
                title2="Master"
                description={'Avg 18m\ndelivery'}
                red
              />

              <HonorCard
                icon="♙"
                iconBackground="#D9FAE9"
                title="100% Safe"
                description={'Zero hot\nspills'}
                green
              />

              <HonorCard
                icon="♛"
                iconBackground="#FFF2C8"
                title="Gold Tier"
                description={'Top 3%\npartner'}
                yellow
              />
            </View>
          </Animated.View>

          {/* ====================================================
              DOCUMENTS
          ==================================================== */}

          <Animated.View
            style={[
              styles.sectionCard,
              {
                opacity: documentOpacity,
                transform: [{ translateY: documentY }],
              },
            ]}
          >
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.greenSectionIcon}>
                  <Text style={styles.greenSectionIconText}>
                    ♙
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>
                  Document Verification
                </Text>
              </View>

              <View style={styles.allApprovedBadge}>
                <Text style={styles.allApprovedText}>
                  All Approved
                </Text>
              </View>
            </View>

            <DocumentRow
              icon="▤"
              title="Aadhaar Card"
              subtitle="•••• •••• 9812"
            />

            <DocumentRow
              icon="▣"
              title="Driving License"
              subtitle="DL-04201900388"
            />

            <DocumentRow
              icon="▱"
              title="Vehicle RC Book"
              subtitle="Valid until Nov 2028"
            />
          </Animated.View>

          {/* ====================================================
              DELIVERY GEAR
          ==================================================== */}

          <Animated.View
            style={[
              styles.sectionCard,
              {
                opacity: gearOpacity,
                transform: [{ translateY: gearY }],
              },
            ]}
          >
            <View style={styles.sectionTitleRow}>
              <View style={styles.yellowSectionIcon}>
                <Text style={styles.yellowSectionIconText}>
                  ♨
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                Delivery Gear & Shifts
              </Text>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingIconRed}>
                <Text style={styles.settingIconText}>
                  ♜
                </Text>
              </View>

              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  Hot Insulation Bag
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.settingSubtitle}
                >
                  Mandatory for Biryani & Curr...
                </Text>
              </View>

              <Text style={styles.greenCheck}>
                ☑
              </Text>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingIconBlue}>
                <Text style={styles.settingIconTextBlue}>
                  ◔
                </Text>
              </View>

              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>
                  Night Shift Mode
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.settingSubtitle}
                >
                  High surge rate (11PM - 4...
                </Text>
              </View>

              <Switch
                value={nightMode}
                onValueChange={setNightMode}
                trackColor={{
                  false: '#CBD5E1',
                  true: GREEN,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Animated.View>

          {/* ====================================================
              PREFERENCES
          ==================================================== */}

          <Animated.View
            style={[
              styles.sectionCard,
              {
                opacity: preferenceOpacity,
                transform: [{ translateY: preferenceY }],
              },
            ]}
          >
            <View style={styles.sectionTitleRow}>
              <View style={styles.preferenceIcon}>
                <Text style={styles.preferenceIconText}>
                  ☷
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                Preferences & Safety
              </Text>
            </View>

            {/* LANGUAGE */}

            <View style={styles.languageCard}>
              <View style={styles.languageTop}>
                <View style={styles.languageLabelRow}>
                  <Text style={styles.globeIcon}>
                    ◉
                  </Text>

                  <Text style={styles.languageTitle}>
                    App Language
                  </Text>
                </View>

                <Text style={styles.activeLanguage}>
                  Active: {language}
                </Text>
              </View>

              <View style={styles.languageButtons}>
                <LanguageButton
                  title="English"
                  active={language === 'English'}
                  onPress={() => setLanguage('English')}
                />

                <LanguageButton
                  title="हिन्दी"
                  active={language === 'हिन्दी'}
                  onPress={() => setLanguage('हिन्दी')}
                />

                <LanguageButton
                  title="ગુજરાતી"
                  active={language === 'ગુજરાતી'}
                  onPress={() => setLanguage('ગુજરાતી')}
                />
              </View>
            </View>

            {/* SAFETY */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.preferenceRow}
            >
              <View style={styles.sosCircle}>
                <Text style={styles.sosCircleText}>
                  *
                </Text>
              </View>

              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>
                  Safety Toolkit & SOS
                </Text>

                <Text style={styles.preferenceSubtitle}>
                  Patel Hotline & Highway Police
                </Text>
              </View>

              <Text style={styles.chevron}>
                ›
              </Text>
            </TouchableOpacity>

            {/* EMERGENCY */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.preferenceRow}
            >
              <View style={styles.contactCircle}>
                <Text style={styles.contactCircleText}>
                  ♙
                </Text>
              </View>

              <View style={styles.preferenceContent}>
                <Text style={styles.preferenceTitle}>
                  Emergency Contacts
                </Text>

                <Text style={styles.preferenceSubtitle}>
                  2 contacts configured
                </Text>
              </View>

              <Text style={styles.chevron}>
                ›
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ====================================================
              LOG OUT
          ==================================================== */}

          <Animated.View
            style={{
              opacity: footerOpacity,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutIcon}>
                ⇥
              </Text>

              <Text style={styles.logoutText}>
                Log Out of Driver Network
              </Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>
              Patel’s Delivery OS v4.12.0 • Bangalore Hub
            </Text>
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
            icon="♧"
            title="Orders"
            onPress={() => navigation.navigate(ROUTES.ORDERS)}
          />

          <BottomNav
            icon="◎"
            title="Live Map"
            onPress={() => navigation.navigate(ROUTES.LIVE_MAP)}
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

const HonorCard = ({
  icon,
  iconBackground,
  title,
  title2,
  description,
  red,
  green,
  yellow,
}) => {
  return (
    <View
      style={[
        styles.honorCard,
        red && styles.honorRed,
        green && styles.honorGreen,
        yellow && styles.honorYellow,
      ]}
    >
      <View
        style={[
          styles.honorIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Text style={styles.honorIconText}>
          {icon}
        </Text>
      </View>

      <Text style={styles.honorCardTitle}>
        {title}
      </Text>

      {!!title2 && (
        <Text style={styles.honorCardTitle}>
          {title2}
        </Text>
      )}

      <Text style={styles.honorDescription}>
        {description}
      </Text>
    </View>
  );
};

const DocumentRow = ({
  icon,
  title,
  subtitle,
}) => {
  return (
    <View style={styles.documentRow}>
      <View style={styles.documentIconBox}>
        <Text style={styles.documentIcon}>
          {icon}
        </Text>
      </View>

      <View style={styles.documentContent}>
        <Text style={styles.documentTitle}>
          {title}
        </Text>

        <Text style={styles.documentSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.documentVerified}>
        <Text style={styles.documentVerifiedText}>
          ◉ Verified
        </Text>
      </View>
    </View>
  );
};

const LanguageButton = ({
  title,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.languageButton,
        active && styles.languageButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.languageButtonText,
          active && styles.languageButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const BottomNav = ({
  icon,
  title,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.navItem}
      onPress={onPress}
    >
      <Text
        style={[
          styles.navIcon,
          active && styles.navIconActive,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navText,
          active && styles.navTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

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
    paddingHorizontal: rs(13),
    paddingTop: rs(13),
    paddingBottom: rs(100),
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    height: rs(51),

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#E7EAF0',

    paddingHorizontal: rs(16),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brandArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandLogo: {
    width: rs(34),
    height: rs(34),

    marginRight: rs(8),
  },

  brandTitle: {
    color: DARK,

    fontSize: fs(13),
    fontWeight: '900',
  },

  brandSubtitle: {
    color: '#64748B',

    fontSize: fs(11),

    marginTop: rs(1),
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: rs(11),
    paddingVertical: rs(8),

    borderRadius: rs(23),

    backgroundColor: '#E8FFF5',

    borderWidth: 1,
    borderColor: '#A7EBCB',

    marginRight: rs(10),
  },

  dutyDot: {
    width: rs(7),
    height: rs(7),

    borderRadius: rs(4),

    backgroundColor: GREEN,

    marginRight: rs(5),
  },

  dutyText: {
    color: '#174637',

    fontSize: fs(9),
    fontWeight: '900',

    letterSpacing: 0.7,
  },

  headerProfile: {
    width: rs(32),
    height: rs(32),

    borderRadius: rs(16),

    borderWidth: 1,
    borderColor: '#E7CBC2',
  },

  /* ==========================================================
     PROFILE CARD
  ========================================================== */

  profileCard: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(14),

    padding: rs(16),

    shadowColor: '#000000',
    shadowOpacity: 0.035,
    shadowRadius: 5,

    elevation: 2,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  profilePhotoWrapper: {
    position: 'relative',
  },

  profilePhoto: {
    width: rs(61),
    height: rs(61),

    borderRadius: rs(31),

    borderWidth: 1.5,
    borderColor: '#E8C7BC',
  },

  verifiedMiniBadge: {
    position: 'absolute',

    bottom: -1,
    right: -1,

    width: rs(21),
    height: rs(21),

    borderRadius: rs(11),

    backgroundColor: GREEN,

    borderWidth: 2,
    borderColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  verifiedMiniText: {
    color: '#FFFFFF',

    fontSize: fs(10),
    fontWeight: '900',
  },

  profileInfo: {
    flex: 1,

    marginLeft: rs(14),
  },

  name: {
    color: DARK,

    fontSize: fs(14),
    fontWeight: '900',
  },

  captainId: {
    color: '#E0051D',

    fontSize: fs(10),
    fontWeight: '800',

    marginTop: rs(4),

    letterSpacing: 0.3,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: rs(9),
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFF9E8',

    borderWidth: 1,
    borderColor: '#F5CE54',

    borderRadius: rs(12),

    paddingHorizontal: rs(7),
    paddingVertical: rs(4),
  },

  ratingStar: {
    color: '#E89800',

    fontSize: fs(11),
  },

  ratingValue: {
    color: DARK,

    fontSize: fs(10),
    fontWeight: '700',

    marginLeft: rs(3),
  },

  deliveryCount: {
    color: '#55637C',

    fontSize: fs(9),

    marginLeft: rs(5),
  },

  activeBadge: {
    backgroundColor: '#DDF9EA',

    paddingHorizontal: rs(8),
    paddingVertical: rs(5),

    borderRadius: rs(13),
  },

  activeText: {
    color: '#087A4A',

    fontSize: fs(9),
    fontWeight: '900',
  },

  vehicleCard: {
    marginTop: rs(14),

    borderWidth: 1,
    borderColor: BORDER,

    backgroundColor: '#F8FAFD',

    borderRadius: rs(10),

    minHeight: rs(59),

    paddingHorizontal: rs(12),

    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleIconBox: {
    width: rs(34),
    height: rs(34),

    borderRadius: rs(8),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  vehicleIcon: {
    fontSize: fs(17),
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleName: {
    color: DARK,

    fontSize: fs(10),
    fontWeight: '800',
  },

  vehicleNumber: {
    color: MUTED,

    fontSize: fs(9),

    marginTop: rs(3),
  },

  vehicleVerified: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(6),

    borderRadius: rs(13),

    backgroundColor: '#E8FFF5',

    borderWidth: 1,
    borderColor: '#A5EAC9',
  },

  vehicleVerifiedText: {
    color: '#087A4A',

    fontSize: fs(9),
    fontWeight: '700',
  },

  /* ==========================================================
     COMMON SECTION
  ========================================================== */

  sectionCard: {
    marginTop: rs(14),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(13),

    padding: rs(16),

    shadowColor: '#000',
    shadowOpacity: 0.025,
    shadowRadius: 4,

    elevation: 1,
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

  sectionTitle: {
    color: DARK,

    fontSize: fs(10),
    fontWeight: '800',
  },

  sectionSmallTitle: {
    color: '#243047',

    fontSize: fs(9),
    fontWeight: '900',

    letterSpacing: 0.8,
  },

  /* ==========================================================
     WALLET
  ========================================================== */

  walletIcon: {
    width: rs(21),
    height: rs(21),

    borderRadius: rs(6),

    backgroundColor: '#FFE9E9',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(7),
  },

  walletIconText: {
    color: RED,
    fontSize: fs(11),
  },

  instantBadge: {
    backgroundColor: '#E7FAF2',

    borderRadius: rs(14),

    paddingHorizontal: rs(8),
    paddingVertical: rs(4),

    borderWidth: 1,
    borderColor: '#BCEBD6',
  },

  instantText: {
    color: '#087D4C',

    fontSize: fs(8),
    fontWeight: '700',
  },

  walletHeader: {
    marginTop: rs(15),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  balanceLabel: {
    color: '#54627A',

    fontSize: fs(9),
  },

  balanceAmount: {
    marginTop: rs(3),

    color: DARK,

    fontSize: fs(26),
    fontWeight: '900',
  },

  tipBadge: {
    backgroundColor: '#E6FAF1',

    paddingHorizontal: rs(9),
    paddingVertical: rs(5),

    borderRadius: rs(13),
  },

  tipText: {
    color: GREEN,

    fontSize: fs(9),
    fontWeight: '700',
  },

  bankCard: {
    marginTop: rs(13),

    minHeight: rs(58),

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    backgroundColor: '#F8FAFD',

    paddingHorizontal: rs(11),

    flexDirection: 'row',
    alignItems: 'center',
  },

  bankIconBox: {
    width: rs(32),
    height: rs(32),

    borderRadius: rs(7),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(9),
  },

  bankIcon: {
    color: '#1C3657',

    fontSize: fs(15),
  },

  bankInfo: {
    flex: 1,
  },

  bankTitle: {
    color: DARK,

    fontSize: fs(9),
    fontWeight: '800',
  },

  bankSubtitle: {
    color: MUTED,

    fontSize: fs(8),

    marginTop: rs(3),
  },

  bankVerified: {
    color: GREEN,

    fontSize: fs(14),
  },

  withdrawButton: {
    marginTop: rs(12),

    height: rs(42),

    backgroundColor: RED,

    borderRadius: rs(8),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: RED,
    shadowOpacity: 0.18,
    shadowRadius: 5,

    elevation: 3,
  },

  withdrawIcon: {
    color: '#FFFFFF',

    marginRight: rs(7),

    fontSize: fs(12),
  },

  withdrawText: {
    color: '#FFFFFF',

    fontSize: fs(10),
    fontWeight: '900',
  },

  /* ==========================================================
     HONOR
  ========================================================== */

  honorTitleRow: {
    marginTop: rs(14),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: rs(3),
  },

  honorTitle: {
    color: DARK,

    fontSize: fs(9),
    fontWeight: '700',
  },

  tierBadge: {
    borderWidth: 1,
    borderColor: '#F0C856',

    backgroundColor: '#FFF8DF',

    borderRadius: rs(13),

    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
  },

  tierText: {
    color: '#985F00',

    fontSize: fs(8),
    fontWeight: '700',
  },

  honorRow: {
    marginTop: rs(8),

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  honorCard: {
    width: '31.5%',

    minHeight: rs(123),

    borderRadius: rs(9),

    alignItems: 'center',

    paddingTop: rs(10),
    paddingHorizontal: rs(4),

    backgroundColor: '#FFFFFF',
  },

  honorRed: {
    borderWidth: 1,
    borderColor: '#F7D1D1',
  },

  honorGreen: {
    borderWidth: 1,
    borderColor: '#BFEBD6',
  },

  honorYellow: {
    borderWidth: 1,
    borderColor: '#F1D887',
  },

  honorIcon: {
    width: rs(31),
    height: rs(31),

    borderRadius: rs(16),

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: rs(7),
  },

  honorIconText: {
    fontSize: fs(14),
  },

  honorCardTitle: {
    color: DARK,

    fontSize: fs(9),
    fontWeight: '800',

    textAlign: 'center',

    lineHeight: fs(12),
  },

  honorDescription: {
    color: '#42516B',

    fontSize: fs(8),

    textAlign: 'center',

    lineHeight: fs(13),

    marginTop: rs(8),
  },

  /* ==========================================================
     DOCUMENTS
  ========================================================== */

  greenSectionIcon: {
    width: rs(21),
    height: rs(21),

    borderRadius: rs(7),

    backgroundColor: '#E8FAF1',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(7),
  },

  greenSectionIconText: {
    color: GREEN,

    fontSize: fs(11),
  },

  allApprovedBadge: {
    backgroundColor: '#DFF9EC',

    paddingHorizontal: rs(8),
    paddingVertical: rs(5),

    borderRadius: rs(13),
  },

  allApprovedText: {
    color: '#087A4A',

    fontSize: fs(8),
    fontWeight: '700',
  },

  documentRow: {
    minHeight: rs(57),

    marginTop: rs(9),

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    backgroundColor: '#F8FAFD',

    paddingHorizontal: rs(10),

    flexDirection: 'row',
    alignItems: 'center',
  },

  documentIconBox: {
    width: rs(28),
    height: rs(28),

    borderRadius: rs(7),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E2E8F0',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(8),
  },

  documentIcon: {
    color: '#263D5A',

    fontSize: fs(12),
  },

  documentContent: {
    flex: 1,
  },

  documentTitle: {
    color: DARK,

    fontSize: fs(9),
    fontWeight: '800',
  },

  documentSubtitle: {
    color: MUTED,

    fontSize: fs(8),

    marginTop: rs(3),
  },

  documentVerified: {
    backgroundColor: '#E7FAF2',

    borderWidth: 1,
    borderColor: '#B3EBD1',

    paddingHorizontal: rs(8),
    paddingVertical: rs(5),

    borderRadius: rs(13),
  },

  documentVerifiedText: {
    color: '#087A4A',

    fontSize: fs(8),
    fontWeight: '700',
  },

  /* ==========================================================
     DELIVERY GEAR
  ========================================================== */

  yellowSectionIcon: {
    width: rs(21),
    height: rs(21),

    borderRadius: rs(7),

    backgroundColor: '#FFF6D8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(7),
  },

  yellowSectionIconText: {
    color: '#CA8300',

    fontSize: fs(11),
  },

  settingCard: {
    minHeight: rs(59),

    marginTop: rs(10),

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    backgroundColor: '#F8FAFD',

    paddingHorizontal: rs(10),

    flexDirection: 'row',
    alignItems: 'center',
  },

  settingIconRed: {
    width: rs(30),
    height: rs(30),

    borderRadius: rs(8),

    backgroundColor: '#FFE8E8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(9),
  },

  settingIconText: {
    color: RED,

    fontSize: fs(13),
  },

  settingIconBlue: {
    width: rs(30),
    height: rs(30),

    borderRadius: rs(8),

    backgroundColor: '#EBEFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(9),
  },

  settingIconTextBlue: {
    color: '#273EFF',

    fontSize: fs(14),
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    color: DARK,

    fontSize: fs(9),
    fontWeight: '800',
  },

  settingSubtitle: {
    color: MUTED,

    fontSize: fs(8),

    marginTop: rs(3),
  },

  greenCheck: {
    color: GREEN,

    fontSize: fs(15),
  },

  /* ==========================================================
     PREFERENCES
  ========================================================== */

  preferenceIcon: {
    width: rs(21),
    height: rs(21),

    borderRadius: rs(7),

    backgroundColor: '#EDF3F9',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(7),
  },

  preferenceIconText: {
    color: '#31445C',

    fontSize: fs(12),
  },

  languageCard: {
    marginTop: rs(10),

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    padding: rs(10),

    backgroundColor: '#F8FAFD',
  },

  languageTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  languageLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  globeIcon: {
    color: '#425979',

    fontSize: fs(12),

    marginRight: rs(6),
  },

  languageTitle: {
    color: DARK,

    fontSize: fs(9),
    fontWeight: '700',
  },

  activeLanguage: {
    color: '#20314B',

    fontSize: fs(8),
    fontWeight: '700',
  },

  languageButtons: {
    marginTop: rs(8),

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  languageButton: {
    width: '31%',

    height: rs(31),

    borderRadius: rs(5),

    borderWidth: 1,
    borderColor: '#D7DFE8',

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  languageButtonActive: {
    backgroundColor: RED,

    borderColor: RED,
  },

  languageButtonText: {
    color: '#394961',

    fontSize: fs(8),
    fontWeight: '700',
  },

  languageButtonTextActive: {
    color: '#FFFFFF',
  },

  preferenceRow: {
    minHeight: rs(59),

    marginTop: rs(10),

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    backgroundColor: '#F8FAFD',

    paddingHorizontal: rs(10),

    flexDirection: 'row',
    alignItems: 'center',
  },

  sosCircle: {
    width: rs(31),
    height: rs(31),

    borderRadius: rs(16),

    backgroundColor: '#FFE5E5',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(9),
  },

  sosCircleText: {
    color: RED,

    fontSize: fs(17),
    fontWeight: '900',
  },

  contactCircle: {
    width: rs(31),
    height: rs(31),

    borderRadius: rs(16),

    backgroundColor: '#EDF2F8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(9),
  },

  contactCircleText: {
    color: '#42546B',

    fontSize: fs(13),
  },

  preferenceContent: {
    flex: 1,
  },

  preferenceTitle: {
    color: DARK,

    fontSize: fs(9),
    fontWeight: '800',
  },

  preferenceSubtitle: {
    color: MUTED,

    fontSize: fs(8),

    marginTop: rs(3),
  },

  chevron: {
    color: '#8390A5',

    fontSize: fs(18),
  },

  /* ==========================================================
     LOGOUT
  ========================================================== */

  logoutButton: {
    height: rs(43),

    marginTop: rs(16),

    borderWidth: 1,
    borderColor: '#FFBABA',

    borderRadius: rs(9),

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutIcon: {
    color: RED,

    fontSize: fs(13),

    marginRight: rs(7),
  },

  logoutText: {
    color: RED,

    fontSize: fs(9),
    fontWeight: '700',
  },

  versionText: {
    color: '#8291A9',

    fontSize: fs(8),

    textAlign: 'center',

    marginTop: rs(20),
    marginBottom: rs(3),
  },

  /* ==========================================================
     BOTTOM NAVIGATION
  ========================================================== */

  bottomNav: {
    height: rs(66),

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

    fontSize: fs(15),
  },

  navIconActive: {
    color: RED,
  },

  navText: {
    color: '#61738E',

    fontSize: fs(6.8),

    marginTop: rs(4),
  },

  navTextActive: {
    color: RED,

    fontWeight: '800',
  },
});