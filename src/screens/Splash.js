import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';

const { width, height } = Dimensions.get('window');

const DESIGN_WIDTH = 487;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const DriverSplashScreen = ({ navigation }) => {
  // -----------------------------
  // ANIMATION VALUES
  // -----------------------------

  const topOpacity = useRef(new Animated.Value(0)).current;
  const topY = useRef(new Animated.Value(-15)).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(25)).current;

  const tagOpacity = useRef(new Animated.Value(0)).current;
  const tagY = useRef(new Animated.Value(20)).current;

  const statusOpacity = useRef(new Animated.Value(0)).current;
  const statusY = useRef(new Animated.Value(30)).current;

  const progressWidth = useRef(new Animated.Value(0)).current;

  const footerOpacity = useRef(new Animated.Value(0)).current;

  const floatingLogo = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(topOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.timing(topY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),

        Animated.timing(titleY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.timing(tagY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(statusOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),

        Animated.timing(statusY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 950,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),

      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle classic floating animation

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingLogo, {
          toValue: -5,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(floatingLogo, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const floatTimer = setTimeout(() => {
      floatLoop.start();
    }, 1800);

    // AUTO NAVIGATION -> bottom tabs (replace so "back" can't return to splash)
    const navigationTimer = setTimeout(() => {
      navigation.replace(ROUTES.MAIN_TABS);
    }, 4500);

    return () => {
      clearTimeout(floatTimer);
      floatLoop.stop();

      clearTimeout(navigationTimer);
    };
  }, []);

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAF9FF"
      />

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <View
        pointerEvents="none"
        style={styles.backgroundLayer}
      >
        <View style={styles.pinkGlow} />
        <View style={styles.greenGlow} />
        <View style={styles.blueGlow} />
      </View>

      <View style={styles.container}>
        {/* ======================================================
            TOP STATUS
        ====================================================== */}

        <Animated.View
          style={[
            styles.topRow,
            {
              opacity: topOpacity,
              transform: [{ translateY: topY }],
            },
          ]}
        >
          <View style={styles.fleetBadge}>
            <View style={styles.fleetDot} />

            <Text style={styles.fleetText}>
              FLEET CORE LIVE
            </Text>
          </View>

          <View style={styles.dispatchBadge}>
            <Text style={styles.lightning}>
              ⚡
            </Text>

            <Text style={styles.dispatchText}>
              5G Dispatch
            </Text>
          </View>
        </Animated.View>

        {/* ======================================================
            CENTER CONTENT
        ====================================================== */}

        <View style={styles.centerContent}>
          {/* LOGO */}

          <Animated.View
            style={[
              styles.logoArea,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { translateY: floatingLogo },
                ],
              },
            ]}
          >
            <View style={styles.logoCard}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.partnerBadge}>
              <Text style={styles.partnerBadgeText}>
                🚚 PARTNER FLEET
              </Text>
            </View>
          </Animated.View>

          {/* TITLE */}

          <Animated.View
            style={[
              styles.titleArea,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleY }],
              },
            ]}
          >
            <Text style={styles.mainTitle}>
              Patel’s Crazy Indian
            </Text>

            <Text style={styles.subTitle}>
              DRIVER PARTNER APP • THE FESTIVE TREAT
            </Text>

            <Text style={styles.subTitle}>
              EXPRESS
            </Text>
          </Animated.View>

          {/* TAGLINE */}

          <Animated.View
            style={[
              styles.taglinePill,
              {
                opacity: tagOpacity,
                transform: [{ translateY: tagY }],
              },
            ]}
          >
            <Text style={styles.taglineText}>
              Delivering Royal Flavors with Lightning Speed
            </Text>
          </Animated.View>

          {/* STATUS CARD */}

          <Animated.View
            style={[
              styles.statusCard,
              {
                opacity: statusOpacity,
                transform: [{ translateY: statusY }],
              },
            ]}
          >
            <View style={styles.statusTop}>
              <View style={styles.readyRow}>
                <Text style={styles.readyIcon}>
                  ↻
                </Text>

                <Text style={styles.readyText}>
                  Ready for Takeoff! Online.
                </Text>
              </View>

              <Text style={styles.statusPercent}>
                100%
              </Text>
            </View>

            {/* PROGRESS */}

            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressBarWidth,
                  },
                ]}
              />
            </View>

            {/* BOTTOM STATUS */}

            <View style={styles.statusBottom}>
              <View style={styles.statusBottomItem}>
                <Text style={styles.signalIcon}>
                  ◉
                </Text>

                <Text style={styles.statusBottomText}>
                  Low Latency Ping: 18ms
                </Text>
              </View>

              <View style={styles.statusBottomItem}>
                <Text style={styles.securityIcon}>
                  ⎈
                </Text>

                <Text style={styles.secureText}>
                  Secure TLS
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* FOOTER */}

          <Animated.View
            style={[
              styles.footerArea,
              {
                opacity: footerOpacity,
              },
            ]}
          >
            <View style={styles.versionBadge}>
              <Text style={styles.versionDot}>
                ●
              </Text>

              <Text style={styles.versionText}>
                v4.12.0 • Bangalore Hub
              </Text>
            </View>

            <Text style={styles.footerText}>
              ★ Fastest Restaurant Delivery Fleet ★
            </Text>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DriverSplashScreen;

const styles = StyleSheet.create({
  // ==========================================================
  // ROOT
  // ==========================================================

  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },

  container: {
    flex: 1,
    paddingHorizontal: rs(20),
  },

  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  pinkGlow: {
    position: 'absolute',

    width: width * 0.9,
    height: width * 0.9,

    borderRadius: width,

    backgroundColor: '#FFE6E9',

    right: -width * 0.4,
    top: -width * 0.18,

    opacity: 0.45,
  },

  greenGlow: {
    position: 'absolute',

    width: width * 0.85,
    height: width * 0.85,

    borderRadius: width,

    backgroundColor: '#DFFFF0',

    left: -width * 0.42,
    bottom: height * 0.08,

    opacity: 0.7,
  },

  blueGlow: {
    position: 'absolute',

    width: width * 0.75,
    height: width * 0.75,

    borderRadius: width,

    backgroundColor: '#EBF0FF',

    right: -width * 0.35,
    bottom: -width * 0.15,

    opacity: 0.5,
  },

  // ==========================================================
  // TOP
  // ==========================================================

  topRow: {
    width: '100%',

    marginTop: rs(20),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  fleetBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#EFF5FA',

    paddingHorizontal: rs(15),
    paddingVertical: rs(8),

    borderRadius: rs(22),

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,

    elevation: 2,
  },

  fleetDot: {
    width: rs(10),
    height: rs(10),

    borderRadius: rs(5),

    backgroundColor: '#55A984',

    marginRight: rs(7),
  },

  fleetText: {
    color: '#08753B',

    fontSize: fs(13),
    fontWeight: '800',

    letterSpacing: 0.3,
  },

  dispatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#DCE7FF',

    paddingHorizontal: rs(18),
    paddingVertical: rs(10),

    borderRadius: rs(24),
  },

  lightning: {
    color: '#D1001C',

    fontSize: fs(17),

    marginRight: rs(8),
  },

  dispatchText: {
    color: '#273044',

    fontSize: fs(14),
    fontWeight: '800',

    letterSpacing: 0.4,
  },

  // ==========================================================
  // CENTER
  // ==========================================================

  centerContent: {
    flex: 1,

    alignItems: 'center',

    paddingTop: rs(40),
  },

  // ==========================================================
  // LOGO
  // ==========================================================

  logoArea: {
    alignItems: 'center',
  },

  logoCard: {
    width: rs(280),
    height: rs(280),

    maxWidth: width * 0.62,
    maxHeight: width * 0.62,

    backgroundColor: '#FFFFFF',

    borderRadius: rs(18),

    alignItems: 'center',
    justifyContent: 'center',

    padding: rs(8),

    shadowColor: '#000',
    shadowOpacity: 0.13,

    shadowRadius: rs(12),

    shadowOffset: {
      width: 0,
      height: rs(8),
    },

    elevation: 8,
  },

  logo: {
    width: '95%',
    height: '95%',
  },

  partnerBadge: {
    marginTop: -rs(8),

    backgroundColor: '#D3252D',

    paddingHorizontal: rs(17),
    paddingVertical: rs(5),

    borderRadius: rs(7),

    zIndex: -1,
  },

  partnerBadgeText: {
    color: '#FFFFFF',

    fontSize: fs(12),
    fontWeight: '900',
  },

  // ==========================================================
  // TITLE
  // ==========================================================

  titleArea: {
    marginTop: rs(13),

    alignItems: 'center',
  },

  mainTitle: {
    color: '#182236',

    fontSize: fs(31),
    fontWeight: '900',

    textAlign: 'center',
  },

  subTitle: {
    color: '#CD001B',

    fontSize: fs(15),
    lineHeight: fs(20),

    fontWeight: '900',

    textAlign: 'center',

    letterSpacing: 0.6,
  },

  // ==========================================================
  // TAGLINE
  // ==========================================================

  taglinePill: {
    marginTop: rs(20),

    backgroundColor: '#DFE2FF',

    minHeight: rs(42),

    width: '86%',

    borderRadius: rs(25),

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: rs(14),
  },

  taglineText: {
    color: '#6B4B4A',

    fontSize: fs(13),
    fontWeight: '700',

    textAlign: 'center',
  },

  // ==========================================================
  // STATUS CARD
  // ==========================================================

  statusCard: {
    width: '100%',

    marginTop: rs(60),

    backgroundColor: '#FFFFFF',

    borderRadius: rs(15),

    paddingHorizontal: rs(16),
    paddingTop: rs(18),
    paddingBottom: rs(16),

    shadowColor: '#000',

    shadowOpacity: 0.1,

    shadowRadius: rs(9),

    shadowOffset: {
      width: 0,
      height: rs(5),
    },

    elevation: 6,
  },

  statusTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  readyIcon: {
    color: '#D1001C',

    fontSize: fs(22),

    marginRight: rs(5),

    fontWeight: '900',
  },

  readyText: {
    color: '#20283A',

    fontSize: fs(13),
    fontWeight: '800',
  },

  statusPercent: {
    color: '#D1001C',

    fontSize: fs(13),
    fontWeight: '900',
  },

  progressTrack: {
    width: '100%',

    height: rs(9),

    borderRadius: rs(5),

    backgroundColor: '#F8D4D5',

    overflow: 'hidden',

    marginTop: rs(14),
  },

  progressFill: {
    height: '100%',

    backgroundColor: '#E52631',

    borderRadius: rs(5),
  },

  statusBottom: {
    marginTop: rs(16),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  signalIcon: {
    color: '#299163',

    fontSize: fs(17),

    marginRight: rs(6),
  },

  securityIcon: {
    color: '#BA7B00',

    fontSize: fs(17),

    marginRight: rs(6),
  },

  statusBottomText: {
    color: '#745453',

    fontSize: fs(11),
    fontWeight: '800',
  },

  secureText: {
    color: '#07823E',

    fontSize: fs(11),
    fontWeight: '800',
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footerArea: {
    marginTop: rs(18),

    alignItems: 'center',
  },

  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F4ECEC',

    paddingHorizontal: rs(16),
    paddingVertical: rs(6),

    borderRadius: rs(18),
  },

  versionDot: {
    color: '#D1001C',

    fontSize: fs(10),

    marginRight: rs(5),
  },

  versionText: {
    color: '#725453',

    fontSize: fs(11),
    fontWeight: '800',

    letterSpacing: 0.4,
  },

  footerText: {
    marginTop: rs(9),

    color: '#8E7370',

    fontSize: fs(12),
    fontWeight: '500',

    textAlign: 'center',
  },
});