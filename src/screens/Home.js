import React, { useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';

const { width } = Dimensions.get('window');

const DESIGN_WIDTH = 452;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#E92025';
const GREEN = '#078B53';
const DARK = '#111827';
const MUTED = '#61708B';
const BORDER = '#DCE3EC';
const BG = '#F7F9FC';

const HomeScreen = ({ navigation }) => {
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-20)).current;

  const payoutOpacity = useRef(new Animated.Value(0)).current;
  const payoutY = useRef(new Animated.Value(25)).current;

  const onlineOpacity = useRef(new Animated.Value(0)).current;
  const onlineY = useRef(new Animated.Value(25)).current;

  const orderOpacity = useRef(new Animated.Value(0)).current;
  const orderScale = useRef(new Animated.Value(0.96)).current;

  const metricsOpacity = useRef(new Animated.Value(0)).current;
  const metricsY = useRef(new Animated.Value(25)).current;

  const codOpacity = useRef(new Animated.Value(0)).current;
  const codY = useRef(new Animated.Value(25)).current;

  const toolsOpacity = useRef(new Animated.Value(0)).current;
  const toolsY = useRef(new Animated.Value(25)).current;

  const mapOpacity = useRef(new Animated.Value(0)).current;
  const mapY = useRef(new Animated.Value(25)).current;

  const dutyPulse = useRef(new Animated.Value(1)).current;
  const orderPulse = useRef(new Animated.Value(1)).current;

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

      Animated.stagger(90, [
        Animated.parallel([
          Animated.timing(payoutOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(payoutY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(onlineOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(onlineY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(orderOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.spring(orderScale, {
            toValue: 1,
            friction: 7,
            tension: 60,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(metricsOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(metricsY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(codOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(codY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(toolsOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(toolsY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(mapOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(mapY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    const dutyLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dutyPulse, {
          toValue: 1.06,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dutyPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const orderLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(orderPulse, {
          toValue: 1.012,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orderPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const timer = setTimeout(() => {
      dutyLoop.start();
      orderLoop.start();
    }, 1500);

    return () => {
      clearTimeout(timer);
      dutyLoop.stop();
      orderLoop.stop();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.screen}>
        {/* =====================================================
            HEADER
        ===================================================== */}

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
                Home
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
              style={styles.profileImage}
            />
          </View>
        </Animated.View>

        {/* =====================================================
            MAIN SCROLL
        ===================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* =====================================================
              SHIFT PAYOUT
          ===================================================== */}

          <Animated.View
            style={[
              styles.card,
              {
                opacity: payoutOpacity,
                transform: [{ translateY: payoutY }],
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.smallTitleRow}>
                <Text style={styles.orangeIcon}>▣</Text>

                <Text style={styles.smallHeading}>
                  TODAY’S SHIFT PAYOUT
                </Text>
              </View>

              <View style={styles.autoBadge}>
                <View style={styles.autoDot} />

                <Text style={styles.autoText}>
                  Auto-Settled
                </Text>
              </View>
            </View>

            <View style={styles.earningRow}>
              <Text style={styles.payoutAmount}>
                ₹1,850
              </Text>

              <Text style={styles.payoutDecimal}>
                .50
              </Text>

              <View style={styles.growthBadge}>
                <Text style={styles.growthText}>
                  ↗ +18.4%
                </Text>
              </View>
            </View>

            <View style={styles.shiftStats}>
              <View style={styles.shiftStatBox}>
                <View style={styles.statIconRed}>
                  <Text style={styles.statIconText}>🏍</Text>
                </View>

                <View>
                  <Text style={styles.statBig}>
                    12
                  </Text>

                  <Text style={styles.statSmall}>
                    Trips Done
                  </Text>
                </View>
              </View>

              <View style={styles.shiftStatBox}>
                <View style={styles.statIconYellow}>
                  <Text style={styles.statIconText}>☆</Text>
                </View>

                <View>
                  <Text style={styles.statBig}>
                    4.92
                  </Text>

                  <Text style={styles.statSmall}>
                    Super Star
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* =====================================================
              ONLINE CARD
          ===================================================== */}

          <Animated.View
            style={[
              styles.onlineCard,
              {
                opacity: onlineOpacity,
                transform: [{ translateY: onlineY }],
              },
            ]}
          >
            <View style={styles.onlineLeft}>
              <View style={styles.onlineIconOuter}>
                <View style={styles.onlineIconInner}>
                  <Text style={styles.onlineIconText}>
                    ◎
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.onlineTitle}>
                  YOU ARE ONLINE
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.onlineSubtitle}
                >
                  Ready for fresh pickup broad...
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.pauseButton}
            >
              <Text style={styles.pauseText}>
                Pause
              </Text>

              <Text style={styles.powerText}>
                ⏻
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* =====================================================
              ORDER CARD
          ===================================================== */}

          <Animated.View
            style={[
              styles.orderCard,
              {
                opacity: orderOpacity,
                transform: [
                  { scale: orderScale },
                  { scale: orderPulse },
                ],
              },
            ]}
          >
            <View style={styles.orderTop}>
              <View style={styles.orderTopLeft}>
                <View style={styles.hotIconBox}>
                  <Text style={styles.hotIcon}>
                    ♨
                  </Text>
                </View>

                <View style={styles.orderHeaderText}>
                  <View style={styles.surgeRow}>
                    <View style={styles.surgeBadge}>
                      <Text style={styles.surgeBadgeText}>
                        HIGH SURGE 1.3X
                      </Text>
                    </View>

                    <Text style={styles.hotSpotText}>
                      HOT POT
                    </Text>
                  </View>

                  <Text style={styles.restaurantName}>
                    Patel’s Grand Palace
                  </Text>
                </View>
              </View>

              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>
                  39s
                </Text>
              </View>
            </View>

            {/* ORDER FOOD */}

            <View style={styles.foodBox}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.foodImage}
                resizeMode="cover"
              />

              <View style={styles.foodContent}>
                <Text style={styles.foodTitle}>
                  ▣ 2 Items (Signature Feast)
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.foodDescription}
                >
                  Murg Butter Handi + 3x Butter Garlic ...
                </Text>

                <Text style={styles.foodWarning}>
                  Contains Rich Gravy • Keep Upright
                </Text>
              </View>
            </View>

            {/* ORDER META */}

            <View style={styles.orderInfoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>
                  ✈ Drop Distance
                </Text>

                <Text style={styles.infoValue}>
                  3.2 km
                  <Text style={styles.infoMinor}>
                    {' '} (14 mins)
                  </Text>
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabelGreen}>
                  ₹ Net Payout
                </Text>

                <Text style={styles.infoValueGreen}>
                  ₹140.00
                </Text>
              </View>
            </View>

            {/* PICKUP */}

            <View style={styles.pickupBar}>
              <Text style={styles.pickupIcon}>
                ▥
              </Text>

              <Text
                numberOfLines={1}
                style={styles.pickupText}
              >
                Pick up at Sector 4 Food Hub, Kitchen Count...
              </Text>
            </View>

            {/* ACTIONS */}

            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.declineButton}
              >
                <Text style={styles.declineText}>
                  Decline
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.acceptButton}
              >
                <Text style={styles.acceptIcon}>
                  ✓
                </Text>

                <Text style={styles.acceptText}>
                  ACCEPT ORDER
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* =====================================================
              RELIABILITY
          ===================================================== */}

          <Animated.View
            style={{
              opacity: metricsOpacity,
              transform: [{ translateY: metricsY }],
            }}
          >
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeading}>
                DAILY RELIABILITY TARGETS
              </Text>

              <Text style={styles.liveText}>
                Live Metrics
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                icon="♧"
                iconBg="#E6F9F1"
                value="96%"
                label="Acceptance"
              />

              <MetricCard
                icon="◴"
                iconBg="#FFF5E3"
                value="98%"
                label="On-Time"
              />

              <MetricCard
                icon="▤"
                iconBg="#E5FAF0"
                value="₹300"
                label="Bonus Won"
                green
              />
            </View>
          </Animated.View>

          {/* =====================================================
              COD
          ===================================================== */}

          <Animated.View
            style={[
              styles.codCard,
              {
                opacity: codOpacity,
                transform: [{ translateY: codY }],
              },
            ]}
          >
            <View style={styles.codLeft}>
              <View style={styles.codIconBox}>
                <Text style={styles.codIcon}>
                  ▣
                </Text>
              </View>

              <View style={styles.codInfo}>
                <Text style={styles.codTitle}>
                  COD: ₹820.00
                  <Text style={styles.codDot}>
                    {' '}●
                  </Text>
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.codSubtitle}
                >
                  Deposit due before 11:30 PM cut...
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.depositButton}
              activeOpacity={0.8}
            >
              <Text style={styles.depositText}>
                Deposit
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* =====================================================
              TOOLS
          ===================================================== */}

          <Animated.View
            style={[
              styles.toolsRow,
              {
                opacity: toolsOpacity,
                transform: [{ translateY: toolsY }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.toolCard}
            >
              <View style={styles.hotZoneIcon}>
                <Text style={styles.hotZoneIconText}>
                  ♨
                </Text>
              </View>

              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>
                  Hot Zones
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.toolSubtitle}
                >
                  4 High Surge s...
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.toolCard}
            >
              <View style={styles.sosIcon}>
                <Text style={styles.sosIconText}>
                  SOS
                </Text>
              </View>

              <View style={styles.toolContent}>
                <Text style={styles.toolTitle}>
                  Quick SOS
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.sosSubtitle}
                >
                  Patel Support t...
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* =====================================================
              MAP / HEATMAP
          ===================================================== */}

          <Animated.View
            style={[
              styles.mapCard,
              {
                opacity: mapOpacity,
                transform: [{ translateY: mapY }],
              },
            ]}
          >
            <View style={styles.mapHeader}>
              <View style={styles.mapTitleRow}>
                <View style={styles.mapIconBox}>
                  <Text style={styles.mapIconText}>
                    ◎
                  </Text>
                </View>

                <Text style={styles.mapTitle}>
                  Surge Heatmap: Bandra{'\n'}West
                </Text>
              </View>

              <View style={styles.liveTrafficBadge}>
                <Text style={styles.liveTrafficText}>
                  Live{'\n'}Traffic
                </Text>
              </View>
            </View>

            <Image
              source={require('../assets/logo.png')}
              style={styles.mapImage}
              resizeMode="cover"
            />
          </Animated.View>
        </ScrollView>

        {/* =====================================================
            BOTTOM NAV
        ===================================================== */}

        <View style={styles.bottomNav}>
          <BottomNav
            icon="▦"
            label="Home"
            active
            onPress={() => navigation.navigate(ROUTES.HOME)}
          />

          <BottomNav
            icon="♧"
            label="Orders"
            onPress={() => navigation.navigate(ROUTES.ORDERS)}
          />

          <BottomNav
            icon="◎"
            label="Live Map"
            onPress={() => navigation.navigate(ROUTES.LIVE_MAP)}
          />

          <BottomNav
            icon="▣"
            label="History"
            onPress={() => navigation.navigate(ROUTES.HISTORY)}
          />

          <BottomNav
            icon="♙"
            label="Profile"
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const MetricCard = ({
  icon,
  iconBg,
  value,
  label,
  green,
}) => (
  <View style={styles.metricCard}>
    <View
      style={[
        styles.metricIcon,
        {
          backgroundColor: iconBg,
        },
      ]}
    >
      <Text
        style={[
          styles.metricIconText,
          green && {
            color: GREEN,
          },
        ]}
      >
        {icon}
      </Text>
    </View>

    <Text
      style={[
        styles.metricValue,
        green && styles.metricValueGreen,
      ]}
    >
      {value}
    </Text>

    <Text style={styles.metricLabel}>
      {label}
    </Text>
  </View>
);

const BottomNav = ({
  icon,
  label,
  active,
  onPress,
}) => (
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
        styles.navLabel,
        active && styles.navLabelActive,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default HomeScreen;

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
    paddingTop: rs(15),
    paddingBottom: rs(115),
  },

  // ======================================================
  // HEADER
  // ======================================================

  header: {
    height: rs(73),

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#E6E9EF',

    paddingHorizontal: rs(20),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brandArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandLogo: {
    width: rs(40),
    height: rs(40),

    marginRight: rs(10),
  },

  brandTitle: {
    color: DARK,

    fontSize: fs(19),
    fontWeight: '900',
  },

  brandSubtitle: {
    color: MUTED,

    fontSize: fs(13),
    marginTop: rs(2),
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#E9FFF4',

    paddingHorizontal: rs(14),
    paddingVertical: rs(11),

    borderRadius: rs(28),

    borderWidth: 1,
    borderColor: '#A9EBCB',

    marginRight: rs(10),
  },

  dutyDot: {
    width: rs(10),
    height: rs(10),

    borderRadius: rs(5),

    backgroundColor: GREEN,

    marginRight: rs(6),
  },

  dutyText: {
    color: '#183D32',

    fontSize: fs(12),
    fontWeight: '900',

    letterSpacing: 1.2,
  },

  profileImage: {
    width: rs(42),
    height: rs(42),

    borderRadius: rs(21),

    borderWidth: 1.5,
    borderColor: '#E1C5BA',
  },

  // ======================================================
  // COMMON
  // ======================================================

  card: {
    backgroundColor: '#FFFFFF',

    borderRadius: rs(14),

    borderWidth: 1,
    borderColor: BORDER,

    padding: rs(18),

    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,

    elevation: 2,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  orangeIcon: {
    color: '#F28B00',

    fontSize: fs(18),
    marginRight: rs(7),
  },

  smallHeading: {
    color: '#253047',

    fontSize: fs(12),
    fontWeight: '900',

    letterSpacing: 0.3,
  },

  autoBadge: {
    backgroundColor: '#F1F4F9',

    borderWidth: 1,
    borderColor: '#E1E6EF',

    borderRadius: rs(20),

    paddingHorizontal: rs(10),
    paddingVertical: rs(5),

    flexDirection: 'row',
    alignItems: 'center',
  },

  autoDot: {
    width: rs(7),
    height: rs(7),

    borderRadius: rs(4),

    backgroundColor: '#10B89A',

    marginRight: rs(6),
  },

  autoText: {
    color: '#40516D',

    fontSize: fs(10),
    fontWeight: '700',
  },

  earningRow: {
    marginTop: rs(14),

    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  payoutAmount: {
    color: '#0D1529',

    fontSize: fs(38),
    fontWeight: '900',
  },

  payoutDecimal: {
    color: '#60718D',

    fontSize: fs(21),
    fontWeight: '700',

    marginBottom: rs(5),
  },

  growthBadge: {
    marginLeft: 'auto',

    alignSelf: 'center',

    backgroundColor: '#E9FFF4',

    borderRadius: rs(9),

    borderWidth: 1,
    borderColor: '#A8EACA',

    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
  },

  growthText: {
    color: GREEN,

    fontSize: fs(14),
    fontWeight: '900',
  },

  shiftStats: {
    marginTop: rs(20),

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  shiftStatBox: {
    width: '48.5%',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    backgroundColor: '#F8FAFD',

    padding: rs(12),

    flexDirection: 'row',
    alignItems: 'center',
  },

  statIconRed: {
    width: rs(38),
    height: rs(38),

    borderRadius: rs(9),

    backgroundColor: '#FFE8E8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(12),
  },

  statIconYellow: {
    width: rs(38),
    height: rs(38),

    borderRadius: rs(9),

    backgroundColor: '#FFF1C7',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(12),
  },

  statIconText: {
    fontSize: fs(21),
  },

  statBig: {
    color: '#111827',

    fontSize: fs(19),
    fontWeight: '900',
  },

  statSmall: {
    color: MUTED,

    marginTop: rs(2),

    fontSize: fs(11),
    fontWeight: '600',
  },

  // ======================================================
  // ONLINE
  // ======================================================

  onlineCard: {
    marginTop: rs(16),

    backgroundColor: '#FFFFFF',

    minHeight: rs(82),

    borderRadius: rs(14),

    borderWidth: 1,
    borderColor: BORDER,

    paddingHorizontal: rs(16),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    elevation: 2,
  },

  onlineLeft: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  onlineIconOuter: {
    width: rs(52),
    height: rs(52),

    borderRadius: rs(26),

    backgroundColor: '#D9F8EC',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(14),
  },

  onlineIconInner: {
    width: rs(34),
    height: rs(34),

    borderRadius: rs(17),

    backgroundColor: '#00A66A',

    alignItems: 'center',
    justifyContent: 'center',
  },

  onlineIconText: {
    color: '#FFFFFF',

    fontSize: fs(18),
    fontWeight: '900',
  },

  onlineTitle: {
    color: DARK,

    fontSize: fs(17),
    fontWeight: '900',
  },

  onlineSubtitle: {
    maxWidth: rs(185),

    color: GREEN,

    fontSize: fs(11),
    fontWeight: '600',

    marginTop: rs(3),

    letterSpacing: 0.4,
  },

  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F1F5FA',

    paddingHorizontal: rs(14),
    paddingVertical: rs(12),

    borderRadius: rs(28),

    borderWidth: 1,
    borderColor: '#DDE4ED',
  },

  pauseText: {
    color: '#19233A',

    fontSize: fs(13),
    fontWeight: '800',

    marginRight: rs(8),
  },

  powerText: {
    color: '#19233A',
    fontSize: fs(22),
  },

  // ======================================================
  // ORDER
  // ======================================================

  orderCard: {
    marginTop: rs(16),

    backgroundColor: '#FFFFFF',

    borderRadius: rs(14),

    borderWidth: 2,
    borderColor: '#FFBABA',

    padding: rs(18),

    shadowColor: RED,
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 3,
  },

  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderTopLeft: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  hotIconBox: {
    width: rs(46),
    height: rs(46),

    borderRadius: rs(11),

    backgroundColor: RED,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(12),
  },

  hotIcon: {
    color: '#FFFFFF',

    fontSize: fs(23),
    fontWeight: '900',
  },

  orderHeaderText: {
    flex: 1,
  },

  surgeRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: rs(4),
  },

  surgeBadge: {
    backgroundColor: '#FFF0F0',

    borderWidth: 1,
    borderColor: '#FFB9B9',

    paddingHorizontal: rs(6),
    paddingVertical: rs(3),

    borderRadius: rs(4),
  },

  surgeBadgeText: {
    color: '#D81D24',

    fontSize: fs(10),
    fontWeight: '900',
  },

  hotSpotText: {
    color: '#C7451B',

    marginLeft: rs(8),

    fontSize: fs(10),
    fontWeight: '800',
  },

  restaurantName: {
    color: DARK,

    fontSize: fs(22),
    fontWeight: '900',
  },

  timerCircle: {
    width: rs(50),
    height: rs(50),

    borderRadius: rs(25),

    borderWidth: 4,
    borderColor: RED,

    alignItems: 'center',
    justifyContent: 'center',
  },

  timerText: {
    color: DARK,

    fontSize: fs(13),
    fontWeight: '900',
  },

  foodBox: {
    marginTop: rs(18),

    backgroundColor: '#F8FAFD',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(10),

    padding: rs(10),

    flexDirection: 'row',
    alignItems: 'center',
  },

  foodImage: {
    width: rs(74),
    height: rs(74),

    borderRadius: rs(8),

    marginRight: rs(12),
  },

  foodContent: {
    flex: 1,
  },

  foodTitle: {
    color: DARK,

    fontSize: fs(14),
    fontWeight: '900',
  },

  foodDescription: {
    color: '#33435E',

    fontSize: fs(12),

    marginTop: rs(6),
  },

  foodWarning: {
    color: '#C65124',

    fontSize: fs(10),
    fontWeight: '700',

    marginTop: rs(5),

    letterSpacing: 0.3,
  },

  orderInfoRow: {
    marginTop: rs(16),

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  infoBox: {
    width: '48.5%',

    minHeight: rs(77),

    backgroundColor: '#F8FAFD',

    borderRadius: rs(10),

    borderWidth: 1,
    borderColor: BORDER,

    padding: rs(13),
  },

  infoLabel: {
    color: '#667793',

    fontSize: fs(11),
    fontWeight: '700',
  },

  infoLabelGreen: {
    color: GREEN,

    fontSize: fs(11),
    fontWeight: '700',
  },

  infoValue: {
    color: DARK,

    fontSize: fs(20),
    fontWeight: '900',

    marginTop: rs(7),
  },

  infoMinor: {
    color: MUTED,

    fontSize: fs(11),
    fontWeight: '500',
  },

  infoValueGreen: {
    color: GREEN,

    fontSize: fs(20),
    fontWeight: '900',

    marginTop: rs(7),
  },

  pickupBar: {
    marginTop: rs(16),

    minHeight: rs(42),

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(8),

    backgroundColor: '#F8FAFD',

    paddingHorizontal: rs(13),

    flexDirection: 'row',
    alignItems: 'center',
  },

  pickupIcon: {
    color: RED,

    fontSize: fs(16),

    marginRight: rs(8),
  },

  pickupText: {
    flex: 1,

    color: '#263247',

    fontSize: fs(12),
    fontWeight: '600',
  },

  actionRow: {
    marginTop: rs(18),

    flexDirection: 'row',
  },

  declineButton: {
    width: '31%',

    height: rs(58),

    borderRadius: rs(11),

    backgroundColor: '#F6F8FC',

    borderWidth: 1,
    borderColor: '#DDE3EB',

    alignItems: 'center',
    justifyContent: 'center',
  },

  declineText: {
    color: '#162036',

    fontSize: fs(17),
    fontWeight: '900',
  },

  acceptButton: {
    marginLeft: rs(12),

    flex: 1,

    height: rs(58),

    borderRadius: rs(11),

    backgroundColor: RED,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: RED,
    shadowOpacity: 0.18,
    shadowRadius: 7,

    elevation: 4,
  },

  acceptIcon: {
    color: '#FFFFFF',

    fontSize: fs(18),
    fontWeight: '900',

    marginRight: rs(10),
  },

  acceptText: {
    color: '#FFFFFF',

    fontSize: fs(17),
    fontWeight: '900',
  },

  // ======================================================
  // METRICS
  // ======================================================

  sectionHeadingRow: {
    marginTop: rs(20),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionHeading: {
    color: DARK,

    fontSize: fs(14),
    fontWeight: '900',

    letterSpacing: 0.7,
  },

  liveText: {
    color: GREEN,

    fontSize: fs(11),
    fontWeight: '700',
  },

  metricsRow: {
    marginTop: rs(11),

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  metricCard: {
    width: '31.5%',

    minHeight: rs(110),

    backgroundColor: '#FFFFFF',

    borderRadius: rs(12),

    borderWidth: 1,
    borderColor: BORDER,

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 2,
  },

  metricIcon: {
    width: rs(38),
    height: rs(38),

    borderRadius: rs(19),

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: rs(7),
  },

  metricIconText: {
    color: '#009B67',

    fontSize: fs(20),
  },

  metricValue: {
    color: '#080D18',

    fontSize: fs(22),
    fontWeight: '900',
  },

  metricValueGreen: {
    color: GREEN,
  },

  metricLabel: {
    color: MUTED,

    fontSize: fs(10),
    fontWeight: '600',

    marginTop: rs(3),
  },

  // ======================================================
  // COD
  // ======================================================

  codCard: {
    marginTop: rs(16),

    minHeight: rs(80),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(13),

    paddingHorizontal: rs(15),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    elevation: 2,
  },

  codLeft: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  codIconBox: {
    width: rs(44),
    height: rs(44),

    borderRadius: rs(10),

    backgroundColor: '#FFFDF5',

    borderWidth: 1,
    borderColor: '#F1CE5A',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(12),
  },

  codIcon: {
    color: '#E19A00',

    fontSize: fs(20),
  },

  codInfo: {
    flex: 1,
  },

  codTitle: {
    color: DARK,

    fontSize: fs(17),
    fontWeight: '900',
  },

  codDot: {
    color: '#EBA200',

    fontSize: fs(10),
  },

  codSubtitle: {
    color: MUTED,

    fontSize: fs(11),

    marginTop: rs(4),
  },

  depositButton: {
    backgroundColor: '#101728',

    borderRadius: rs(10),

    paddingHorizontal: rs(17),
    paddingVertical: rs(14),

    marginLeft: rs(10),
  },

  depositText: {
    color: '#FFFFFF',

    fontSize: fs(13),
    fontWeight: '800',
  },

  // ======================================================
  // TOOLS
  // ======================================================

  toolsRow: {
    marginTop: rs(16),

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  toolCard: {
    width: '48.5%',

    minHeight: rs(85),

    backgroundColor: '#FFFFFF',

    borderRadius: rs(12),

    borderWidth: 1,
    borderColor: BORDER,

    paddingHorizontal: rs(14),

    flexDirection: 'row',
    alignItems: 'center',

    elevation: 2,
  },

  hotZoneIcon: {
    width: rs(40),
    height: rs(40),

    borderRadius: rs(9),

    backgroundColor: '#FFF8E8',

    borderWidth: 1,
    borderColor: '#F3CF66',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  hotZoneIconText: {
    color: '#E39800',

    fontSize: fs(21),
  },

  sosIcon: {
    width: rs(40),
    height: rs(40),

    borderRadius: rs(9),

    backgroundColor: '#FFF0F0',

    borderWidth: 1,
    borderColor: '#FFB5B5',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  sosIconText: {
    color: RED,

    fontSize: fs(11),
    fontWeight: '900',
  },

  toolContent: {
    flex: 1,
  },

  toolTitle: {
    color: DARK,

    fontSize: fs(17),
    fontWeight: '900',
  },

  toolSubtitle: {
    color: MUTED,

    fontSize: fs(10),
    marginTop: rs(3),
  },

  sosSubtitle: {
    color: '#D03636',

    fontSize: fs(10),
    marginTop: rs(3),
  },

  // ======================================================
  // MAP
  // ======================================================

  mapCard: {
    marginTop: rs(16),

    backgroundColor: '#FFFFFF',

    borderRadius: rs(13),

    borderWidth: 1,
    borderColor: BORDER,

    overflow: 'hidden',

    elevation: 2,
  },

  mapHeader: {
    minHeight: rs(82),

    paddingHorizontal: rs(14),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mapTitleRow: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  mapIconBox: {
    width: rs(28),
    height: rs(28),

    borderRadius: rs(14),

    backgroundColor: '#FFF1F1',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  mapIconText: {
    color: RED,

    fontSize: fs(15),
    fontWeight: '900',
  },

  mapTitle: {
    color: DARK,

    fontSize: fs(18),
    fontWeight: '900',

    lineHeight: fs(22),
  },

  liveTrafficBadge: {
    backgroundColor: '#F0F4F9',

    paddingHorizontal: rs(12),
    paddingVertical: rs(8),

    borderRadius: rs(22),

    borderWidth: 1,
    borderColor: BORDER,
  },

  liveTrafficText: {
    color: '#3C4B66',

    fontSize: fs(10),
    fontWeight: '600',

    textAlign: 'center',
  },

  mapImage: {
    width: '100%',
    height: rs(165),
  },

  // ======================================================
  // BOTTOM NAV
  // ======================================================

  bottomNav: {
    height: rs(82),

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E2E6EC',

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    paddingBottom: rs(4),

    elevation: 12,
  },

  navItem: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    color: '#61738E',

    fontSize: fs(21),
  },

  navIconActive: {
    color: RED,
  },

  navLabel: {
    color: '#61738E',

    fontSize: fs(10),
    fontWeight: '600',

    marginTop: rs(5),

    letterSpacing: 0.5,
  },

  navLabelActive: {
    color: RED,

    fontWeight: '800',
  },
});