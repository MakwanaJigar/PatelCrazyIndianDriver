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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';

const { width } = Dimensions.get('window');

const DESIGN_WIDTH = 375;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#E51D26';
const DARK = '#101827';
const GREEN = '#009A62';
const MUTED = '#60708B';
const BORDER = '#DCE3EB';
const BG = '#F7F9FC';
const ORANGE = '#EF8A00';

const OrderHistory = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Today');

  // ============================================================
  // ANIMATION VALUES
  // ============================================================

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-15)).current;

  const ledgerOpacity = useRef(new Animated.Value(0)).current;
  const ledgerScale = useRef(new Animated.Value(0.96)).current;

  const filterOpacity = useRef(new Animated.Value(0)).current;
  const filterY = useRef(new Animated.Value(15)).current;

  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const summaryY = useRef(new Animated.Value(20)).current;

  const velocityOpacity = useRef(new Animated.Value(0)).current;
  const velocityY = useRef(new Animated.Value(20)).current;

  const manifestOpacity = useRef(new Animated.Value(0)).current;
  const manifestY = useRef(new Animated.Value(20)).current;

  const footerOpacity = useRef(new Animated.Value(0)).current;

  const progressValue = useRef(new Animated.Value(0)).current;

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
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(ledgerOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.spring(ledgerScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(filterOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(filterY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(summaryOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.timing(summaryY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(velocityOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.timing(velocityY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(manifestOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),

        Animated.timing(manifestY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressValue, {
      toValue: 1,
      duration: 1300,
      delay: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '97%'],
  });

  const filters = ['Today', 'This Week', 'Month', 'Custom'];

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
                History & Earnings
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.dutyBadge}>
              <View style={styles.dutyDot} />

              <Text style={styles.dutyText}>
                ON DUTY
              </Text>
            </View>

            <Image
              source={require('../assets/logo.png')}
              style={styles.profileImage}
            />
          </View>
        </Animated.View>

        {/* =====================================================
            SCROLL
        ===================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* =====================================================
              LEDGER
          ===================================================== */}

          <Animated.View
            style={[
              styles.ledgerCard,
              {
                opacity: ledgerOpacity,
                transform: [{ scale: ledgerScale }],
              },
            ]}
          >
            <View style={styles.ledgerIconBox}>
              <Text style={styles.ledgerIcon}>
                ☆
              </Text>
            </View>

            <View style={styles.ledgerContent}>
              <View style={styles.ledgerTitleRow}>
                <Text style={styles.ledgerTitle}>
                  Captain’s Ledger
                </Text>

                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>
                    TIER 1
                  </Text>
                </View>
              </View>

              <Text style={styles.ledgerSubtitle}>
                Diwali Super Streak • 99.4% On-Time
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.downloadButton}
            >
              <Text style={styles.downloadIcon}>
                ↓
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* =====================================================
              FILTERS
          ===================================================== */}

          <Animated.View
            style={[
              styles.filterRow,
              {
                opacity: filterOpacity,
                transform: [{ translateY: filterY }],
              },
            ]}
          >
            {filters.map(item => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(item)}
                style={[
                  styles.filterButton,
                  selectedFilter === item &&
                    styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterIcon,
                    selectedFilter === item &&
                      styles.filterIconActive,
                  ]}
                >
                  {item === 'Today'
                    ? '▣'
                    : item === 'Custom'
                    ? '☷'
                    : ''}
                </Text>

                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === item &&
                      styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* =====================================================
              SUMMARY GRID
          ===================================================== */}

          <Animated.View
            style={[
              styles.summaryGrid,
              {
                opacity: summaryOpacity,
                transform: [{ translateY: summaryY }],
              },
            ]}
          >
            <SummaryCard
              label="COMPLETED"
              icon="♨"
              iconBg="#FFF0F0"
              value="148"
              footer="↗ +18% vs last wk"
              footerGreen
            />

            <SummaryCard
              label="GROSS PAYOUT"
              icon="₹"
              iconBg="#FFF8EA"
              value="₹24,650"
              footer="Daily avg: ₹1,643"
            />

            <SummaryCard
              label="PURE TIPS"
              icon="♡"
              iconBg="#E8FAF2"
              value="₹2,400"
              valueGreen
              footer="◉ 100% kept by you"
              footerGreen
            />

            <SummaryCard
              label="DISTANCE"
              icon="➤"
              iconBg="#EAF7FF"
              value="482"
              suffix="km"
              footer="Avg ₹51.1 / km"
            />
          </Animated.View>

          {/* =====================================================
              PEAK SHIFT VELOCITY
          ===================================================== */}

          <Animated.View
            style={[
              styles.velocityCard,
              {
                opacity: velocityOpacity,
                transform: [{ translateY: velocityY }],
              },
            ]}
          >
            <View style={styles.velocityHeader}>
              <View style={styles.velocityTitleRow}>
                <Text style={styles.velocityIcon}>
                  ϟ
                </Text>

                <Text style={styles.velocityTitle}>
                  PEAK SHIFT VELOCITY
                </Text>
              </View>

              <Text style={styles.targetText}>
                Target: ₹25,000
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressWidth,
                  },
                ]}
              />
            </View>

            <View style={styles.velocityBottom}>
              <Text style={styles.velocitySubtitle}>
                Only ₹350 away from Festive Bonus
              </Text>

              <Text style={styles.extraText}>
                +₹1,200 Extra
              </Text>
            </View>
          </Animated.View>

          {/* =====================================================
              TRIP MANIFEST HEADER
          ===================================================== */}

          <Animated.View
            style={{
              opacity: manifestOpacity,
              transform: [{ translateY: manifestY }],
            }}
          >
            <View style={styles.manifestHeadingRow}>
              <View style={styles.manifestHeadingLeft}>
                <View style={styles.redDot} />

                <Text style={styles.manifestHeading}>
                  Trip Manifest
                </Text>
              </View>

              <View style={styles.ordersTodayBadge}>
                <Text style={styles.ordersTodayText}>
                  3 Orders Today
                </Text>
              </View>
            </View>

            {/* =====================================================
                TRIP 1
            ===================================================== */}

            <TripCard
              orderId="#PCI-8930"
              time="Today, 7:45 PM"
              rating="☆ 5.0"
              amount="₹165"
              amountSub="incl. ₹30 tip"
              restaurant="Patel's Spicy Tandoor"
              location="Indiranagar 100ft Rd • 4.1 km"
              duration="18 mins"
              item="Butter Chicken, 3 Naan"
              review={'☺ "Super fast delivery"'}
              reviewType="green"
            />

            {/* =====================================================
                TRIP 2
            ===================================================== */}

            <TripCard
              orderId="#PCI-8922"
              time="Today, 6:15 PM"
              rating="☆ 5.0"
              amount="₹120"
              amountSub="Standard Rate"
              restaurant="Patel's Biryani Express"
              location="Koramangala 4th Block • 2.8 km"
              duration="14 mins"
              item="1x Dum Biryani Handi (Sealed)"
              review={'♧ "Polite driver"'}
              reviewType="green"
            />

            {/* =====================================================
                TRIP 3
            ===================================================== */}

            <TripCard
              orderId="#PCI-8911"
              time="Today, 4:50 PM"
              rating="ϟ 1.5x Surge"
              ratingSurge
              amount="₹195"
              amountOrange
              amountSub="☆ 5.0"
              restaurant="Spice Hotel Kitchen"
              location="HSR Sector 2 • 5.6 km"
              duration="24 mins"
              item="♨ Hot Gravy Sealed Pot"
              review={'☆ "Handled with extreme care"'}
              reviewType="yellow"
            />

            {/* =====================================================
                YESTERDAY
            ===================================================== */}

            <View style={styles.yesterdayCard}>
              <View style={styles.yesterdayLeft}>
                <View style={styles.yesterdayIcon}>
                  <Text style={styles.yesterdayIconText}>
                    ↺
                  </Text>
                </View>

                <View>
                  <Text style={styles.yesterdayTitle}>
                    Yesterday
                  </Text>

                  <Text style={styles.yesterdaySubtitle}>
                    11 Completed Trips • 41.2 km
                  </Text>
                </View>
              </View>

              <View style={styles.yesterdayRight}>
                <Text style={styles.yesterdayAmount}>
                  ₹1,740
                </Text>

                <Text style={styles.yesterdayTips}>
                  ₹180 Tips
                </Text>
              </View>

              <Text style={styles.downArrow}>
                ⌄
              </Text>
            </View>

            {/* =====================================================
                DEDUCTIONS
            ===================================================== */}

            <View style={styles.deductionCard}>
              <View style={styles.deductionIcon}>
                <Text style={styles.deductionIconText}>
                  ♨
                </Text>
              </View>

              <View style={styles.deductionContent}>
                <Text style={styles.deductionTitle}>
                  Fuel & Maintenance Deductions
                </Text>

                <Text style={styles.deductionSubtitle}>
                  Tax-exempt business ledger verified
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.viewButton}
              >
                <Text style={styles.viewText}>
                  View
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: footerOpacity,
              height: rs(5),
            }}
          />
        </ScrollView>

        {/* =====================================================
            BOTTOM NAV
        ===================================================== */}

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
            active
            onPress={() => navigation.navigate(ROUTES.HISTORY)}
          />

          <BottomNav
            icon="♙"
            title="Profile"
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ============================================================
   SUMMARY CARD
============================================================ */

const SummaryCard = ({
  label,
  icon,
  iconBg,
  value,
  suffix,
  footer,
  footerGreen,
  valueGreen,
}) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryTop}>
        <Text style={styles.summaryLabel}>
          {label}
        </Text>

        <View
          style={[
            styles.summaryIconBox,
            {
              backgroundColor: iconBg,
            },
          ]}
        >
          <Text style={styles.summaryIconText}>
            {icon}
          </Text>
        </View>
      </View>

      <View style={styles.summaryValueRow}>
        <Text
          style={[
            styles.summaryValue,
            valueGreen && styles.summaryValueGreen,
          ]}
        >
          {value}
        </Text>

        {!!suffix && (
          <Text style={styles.summarySuffix}>
            {suffix}
          </Text>
        )}
      </View>

      <Text
        style={[
          styles.summaryFooter,
          footerGreen && styles.summaryFooterGreen,
        ]}
      >
        {footer}
      </Text>
    </View>
  );
};

/* ============================================================
   TRIP CARD
============================================================ */

const TripCard = ({
  orderId,
  time,
  rating,
  ratingSurge,
  amount,
  amountOrange,
  amountSub,
  restaurant,
  location,
  duration,
  item,
  review,
  reviewType,
}) => {
  const cardScale = useRef(
    new Animated.Value(1),
  ).current;

  const pressIn = () => {
    Animated.timing(cardScale, {
      toValue: 0.985,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: cardScale }],
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.tripCard}
      >
        {/* TOP */}

        <View style={styles.tripTopRow}>
          <View style={styles.tripIdArea}>
            <Text style={styles.tripId}>
              {orderId}
            </Text>

            <Text style={styles.tripTime}>
              {time}
            </Text>

            <View
              style={[
                styles.tripRatingBadge,
                ratingSurge &&
                  styles.tripRatingSurge,
              ]}
            >
              <Text
                style={[
                  styles.tripRatingText,
                  ratingSurge &&
                    styles.tripRatingTextSurge,
                ]}
              >
                {rating}
              </Text>
            </View>
          </View>

          <View style={styles.amountArea}>
            <Text
              style={[
                styles.tripAmount,
                amountOrange &&
                  styles.tripAmountOrange,
              ]}
            >
              {amount}
            </Text>

            <Text
              style={[
                styles.amountSubtitle,
                amountOrange &&
                  styles.amountSubtitleGreen,
              ]}
            >
              {amountSub}
            </Text>
          </View>
        </View>

        {/* RESTAURANT */}

        <View style={styles.tripRestaurantRow}>
          <Text style={styles.restaurantIcon}>
            ▥
          </Text>

          <Text style={styles.tripRestaurant}>
            {restaurant}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>
            ◉
          </Text>

          <Text style={styles.tripLocation}>
            {location}
          </Text>
        </View>

        {/* TAGS */}

        <View style={styles.tripTags}>
          <View style={styles.tripTag}>
            <Text style={styles.tripTagIcon}>
              ◴
            </Text>

            <Text style={styles.tripTagText}>
              {duration}
            </Text>
          </View>

          <View style={styles.tripTagLarge}>
            <Text style={styles.tripTagIcon}>
              ▤
            </Text>

            <Text
              numberOfLines={1}
              style={styles.tripTagText}
            >
              {item}
            </Text>
          </View>
        </View>

        {/* REVIEW */}

        <View
          style={[
            styles.reviewBadge,
            reviewType === 'yellow'
              ? styles.reviewYellow
              : styles.reviewGreen,
          ]}
        >
          <Text
            style={[
              styles.reviewText,
              reviewType === 'yellow'
                ? styles.reviewTextYellow
                : styles.reviewTextGreen,
            ]}
          >
            {review}
          </Text>
        </View>

        {/* FOOTER */}

        <View style={styles.tripDivider} />

        <View style={styles.tripFooter}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.breakdownButton}
          >
            <Text style={styles.breakdownText}>
              Receipt Breakdown
            </Text>

            <Text style={styles.smallArrow}>
              ⌄
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.helpButton}
          >
            <Text style={styles.helpIcon}>
              ♧
            </Text>

            <Text style={styles.helpText}>
              Dispute / Help
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/* ============================================================
   BOTTOM NAV
============================================================ */

const BottomNav = ({
  icon,
  title,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.navItem}
      activeOpacity={0.7}
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

export default OrderHistory;

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
    paddingHorizontal: rs(15),
    paddingTop: rs(15),
    paddingBottom: rs(95),
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    height: rs(62),

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF0',

    paddingHorizontal: rs(18),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandLogo: {
    width: rs(40),
    height: rs(40),

    marginRight: rs(9),
  },

  brandTitle: {
    color: DARK,

    fontSize: fs(15),
    fontWeight: '900',
  },

  brandSubtitle: {
    color: MUTED,

    fontSize: fs(10),

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

    borderWidth: 1,
    borderColor: '#A6EAC8',

    borderRadius: rs(24),

    paddingHorizontal: rs(13),
    paddingVertical: rs(9),

    marginRight: rs(10),
  },

  dutyDot: {
    width: rs(8),
    height: rs(8),

    borderRadius: rs(4),

    backgroundColor: '#08A76A',

    marginRight: rs(6),
  },

  dutyText: {
    color: '#164738',

    fontSize: fs(10),
    fontWeight: '900',

    letterSpacing: 0.8,
  },

  profileImage: {
    width: rs(38),
    height: rs(38),

    borderRadius: rs(19),

    borderWidth: 1.3,
    borderColor: '#E4C8BF',
  },

  /* ==========================================================
     LEDGER
  ========================================================== */

  ledgerCard: {
    minHeight: rs(78),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(13),

    paddingHorizontal: rs(14),

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 2,
  },

  ledgerIconBox: {
    width: rs(45),
    height: rs(45),

    borderRadius: rs(10),

    backgroundColor: '#FFFDF4',

    borderWidth: 1,
    borderColor: '#F4CE62',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(12),
  },

  ledgerIcon: {
    color: '#E99100',

    fontSize: fs(23),
  },

  ledgerContent: {
    flex: 1,
  },

  ledgerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ledgerTitle: {
    color: DARK,

    fontSize: fs(15),
    fontWeight: '900',
  },

  tierBadge: {
    marginLeft: rs(9),

    paddingHorizontal: rs(8),
    paddingVertical: rs(4),

    borderRadius: rs(12),

    backgroundColor: '#E3F9EC',
  },

  tierText: {
    color: '#087E4C',

    fontSize: fs(8),
    fontWeight: '900',
  },

  ledgerSubtitle: {
    color: MUTED,

    fontSize: fs(9),

    marginTop: rs(5),
  },

  downloadButton: {
    width: rs(39),
    height: rs(39),

    borderRadius: rs(20),

    backgroundColor: '#EEF3F8',

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: rs(10),
  },

  downloadIcon: {
    color: '#26384F',

    fontSize: fs(20),
    fontWeight: '700',
  },

  /* ==========================================================
     FILTER
  ========================================================== */

  filterRow: {
    marginTop: rs(15),

    flexDirection: 'row',
    alignItems: 'center',

    gap: rs(7),
  },

  filterButton: {
    minHeight: rs(38),

    paddingHorizontal: rs(14),

    borderRadius: rs(20),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: RED,
    borderColor: RED,
  },

  filterIcon: {
    fontSize: fs(11),

    color: '#44546A',

    marginRight: rs(5),
  },

  filterIconActive: {
    color: '#FFFFFF',
  },

  filterText: {
    color: '#263249',

    fontSize: fs(10),
    fontWeight: '700',
  },

  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  /* ==========================================================
     SUMMARY
  ========================================================== */

  summaryGrid: {
    marginTop: rs(15),

    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',
  },

  summaryCard: {
    width: '48.5%',

    minHeight: rs(120),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(12),

    padding: rs(13),

    marginBottom: rs(12),

    shadowColor: '#000',
    shadowOpacity: 0.035,
    shadowRadius: 4,

    elevation: 2,
  },

  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  summaryLabel: {
    color: '#60708A',

    fontSize: fs(8),
    fontWeight: '800',

    letterSpacing: 0.5,
  },

  summaryIconBox: {
    width: rs(31),
    height: rs(31),

    borderRadius: rs(16),

    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryIconText: {
    color: RED,

    fontSize: fs(14),
    fontWeight: '700',
  },

  summaryValueRow: {
    marginTop: rs(10),

    flexDirection: 'row',
    alignItems: 'baseline',
  },

  summaryValue: {
    color: DARK,

    fontSize: fs(24),
    fontWeight: '900',
  },

  summaryValueGreen: {
    color: GREEN,
  },

  summarySuffix: {
    color: '#5C6B83',

    fontSize: fs(10),
    fontWeight: '700',

    marginLeft: rs(4),
  },

  summaryFooter: {
    color: MUTED,

    fontSize: fs(8),

    marginTop: rs(7),
  },

  summaryFooterGreen: {
    color: GREEN,
    fontWeight: '700',
  },

  /* ==========================================================
     VELOCITY
  ========================================================== */

  velocityCard: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(12),

    padding: rs(14),

    marginBottom: rs(17),

    elevation: 2,
  },

  velocityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  velocityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  velocityIcon: {
    color: '#FF9700',

    fontSize: fs(17),
    fontWeight: '900',

    marginRight: rs(7),
  },

  velocityTitle: {
    color: DARK,

    fontSize: fs(10),
    fontWeight: '900',

    letterSpacing: 0.5,
  },

  targetText: {
    color: '#43526B',

    fontSize: fs(9),
    fontWeight: '700',
  },

  progressTrack: {
    marginTop: rs(12),

    height: rs(8),

    borderRadius: rs(5),

    backgroundColor: '#F2D7D7',

    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',

    borderRadius: rs(5),

    backgroundColor: RED,

    borderLeftWidth: rs(5),
    borderLeftColor: '#FF9500',
  },

  velocityBottom: {
    marginTop: rs(9),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  velocitySubtitle: {
    color: '#66758E',

    fontSize: fs(9),
  },

  extraText: {
    color: RED,

    fontSize: fs(9),
    fontWeight: '800',
  },

  /* ==========================================================
     MANIFEST HEADER
  ========================================================== */

  manifestHeadingRow: {
    marginBottom: rs(11),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  manifestHeadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  redDot: {
    width: rs(9),
    height: rs(9),

    borderRadius: rs(5),

    backgroundColor: RED,

    marginRight: rs(8),
  },

  manifestHeading: {
    color: DARK,

    fontSize: fs(17),
    fontWeight: '900',
  },

  ordersTodayBadge: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(16),

    paddingHorizontal: rs(11),
    paddingVertical: rs(5),
  },

  ordersTodayText: {
    color: '#34435B',

    fontSize: fs(9),
  },

  /* ==========================================================
     TRIP
  ========================================================== */

  tripCard: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(12),

    padding: rs(15),

    marginBottom: rs(13),

    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,

    elevation: 2,
  },

  tripTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  tripIdArea: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  tripId: {
    color: DARK,

    fontSize: fs(12),
    fontWeight: '900',

    marginRight: rs(6),
  },

  tripTime: {
    color: '#60708C',

    fontSize: fs(9),

    marginRight: rs(7),
  },

  tripRatingBadge: {
    paddingHorizontal: rs(7),
    paddingVertical: rs(3),

    borderRadius: rs(10),

    backgroundColor: '#E7FAF2',

    borderWidth: 1,
    borderColor: '#A8EBCB',
  },

  tripRatingSurge: {
    backgroundColor: '#FFF3D8',
    borderColor: '#F4D48A',
  },

  tripRatingText: {
    color: '#06804C',

    fontSize: fs(8),
    fontWeight: '700',
  },

  tripRatingTextSurge: {
    color: '#B35B00',
  },

  amountArea: {
    alignItems: 'flex-end',

    marginLeft: rs(10),
  },

  tripAmount: {
    color: DARK,

    fontSize: fs(17),
    fontWeight: '900',
  },

  tripAmountOrange: {
    color: '#D94C08',
  },

  amountSubtitle: {
    color: GREEN,

    fontSize: fs(8),
    fontWeight: '700',

    marginTop: rs(3),
  },

  amountSubtitleGreen: {
    color: GREEN,
  },

  tripRestaurantRow: {
    marginTop: rs(12),

    flexDirection: 'row',
    alignItems: 'center',
  },

  restaurantIcon: {
    color: RED,

    fontSize: fs(13),

    marginRight: rs(7),
  },

  tripRestaurant: {
    color: DARK,

    fontSize: fs(11),
    fontWeight: '800',
  },

  locationRow: {
    marginTop: rs(6),

    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    color: '#00A16B',

    fontSize: fs(11),

    marginRight: rs(7),
  },

  tripLocation: {
    color: '#61718B',

    fontSize: fs(9),
  },

  tripTags: {
    marginTop: rs(11),

    flexDirection: 'row',
    alignItems: 'center',
  },

  tripTag: {
    backgroundColor: '#F5F8FB',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(7),

    paddingHorizontal: rs(8),
    paddingVertical: rs(5),

    flexDirection: 'row',
    alignItems: 'center',

    marginRight: rs(6),
  },

  tripTagLarge: {
    flex: 1,

    backgroundColor: '#F5F8FB',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(7),

    paddingHorizontal: rs(8),
    paddingVertical: rs(5),

    flexDirection: 'row',
    alignItems: 'center',
  },

  tripTagIcon: {
    color: '#596C86',

    fontSize: fs(9),

    marginRight: rs(5),
  },

  tripTagText: {
    color: '#26364E',

    fontSize: fs(8),
  },

  reviewBadge: {
    marginTop: rs(9),

    alignSelf: 'flex-start',

    paddingHorizontal: rs(9),
    paddingVertical: rs(5),

    borderRadius: rs(6),

    borderWidth: 1,
  },

  reviewGreen: {
    backgroundColor: '#E9FFF4',
    borderColor: '#9FE9C7',
  },

  reviewYellow: {
    backgroundColor: '#FFF8E8',
    borderColor: '#F1CB64',
  },

  reviewText: {
    fontSize: fs(8),
    fontWeight: '600',
  },

  reviewTextGreen: {
    color: '#087A4A',
  },

  reviewTextYellow: {
    color: '#B46100',
  },

  tripDivider: {
    height: 1,

    backgroundColor: '#EDF0F4',

    marginTop: rs(12),
    marginBottom: rs(9),
  },

  tripFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  breakdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  breakdownText: {
    color: '#24344B',

    fontSize: fs(8),
  },

  smallArrow: {
    color: '#52657E',

    fontSize: fs(12),

    marginLeft: rs(6),
  },

  helpButton: {
    backgroundColor: '#F2F5F8',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(7),

    paddingHorizontal: rs(8),
    paddingVertical: rs(6),

    flexDirection: 'row',
    alignItems: 'center',
  },

  helpIcon: {
    color: '#4D6079',

    fontSize: fs(9),

    marginRight: rs(5),
  },

  helpText: {
    color: '#33445D',

    fontSize: fs(8),
  },

  /* ==========================================================
     YESTERDAY
  ========================================================== */

  yesterdayCard: {
    minHeight: rs(70),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(12),

    paddingHorizontal: rs(14),

    flexDirection: 'row',
    alignItems: 'center',

    marginTop: rs(4),
    marginBottom: rs(12),

    elevation: 2,
  },

  yesterdayLeft: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  yesterdayIcon: {
    width: rs(36),
    height: rs(36),

    borderRadius: rs(9),

    backgroundColor: '#F5F8FC',

    borderWidth: 1,
    borderColor: BORDER,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(11),
  },

  yesterdayIconText: {
    color: '#253850',

    fontSize: fs(16),
  },

  yesterdayTitle: {
    color: DARK,

    fontSize: fs(11),
    fontWeight: '800',
  },

  yesterdaySubtitle: {
    color: MUTED,

    fontSize: fs(8),

    marginTop: rs(3),
  },

  yesterdayRight: {
    alignItems: 'flex-end',
  },

  yesterdayAmount: {
    color: DARK,

    fontSize: fs(12),
    fontWeight: '900',
  },

  yesterdayTips: {
    color: GREEN,

    fontSize: fs(8),
    fontWeight: '700',

    marginTop: rs(3),
  },

  downArrow: {
    color: '#7890AC',

    fontSize: fs(14),

    marginLeft: rs(10),
  },

  /* ==========================================================
     DEDUCTIONS
  ========================================================== */

  deductionCard: {
    minHeight: rs(70),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    borderRadius: rs(12),

    paddingHorizontal: rs(14),

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: rs(18),

    elevation: 2,
  },

  deductionIcon: {
    width: rs(39),
    height: rs(39),

    borderRadius: rs(20),

    backgroundColor: '#FFF0F0',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(11),
  },

  deductionIconText: {
    color: RED,

    fontSize: fs(17),
  },

  deductionContent: {
    flex: 1,
  },

  deductionTitle: {
    color: DARK,

    fontSize: fs(10),
    fontWeight: '800',
  },

  deductionSubtitle: {
    color: MUTED,

    fontSize: fs(8),

    marginTop: rs(4),
  },

  viewButton: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(11),

    borderRadius: rs(18),

    backgroundColor: '#F1F4F8',

    borderWidth: 1,
    borderColor: BORDER,
  },

  viewText: {
    color: '#22334B',

    fontSize: fs(9),
    fontWeight: '700',
  },

  /* ==========================================================
     BOTTOM NAV
  ========================================================== */

  bottomNav: {
    height: rs(68),

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
    color: '#5E708A',

    fontSize: fs(17),
  },

  navIconActive: {
    color: RED,
  },

  navText: {
    color: '#60718C',

    fontSize: fs(7),

    marginTop: rs(4),
  },

  navTextActive: {
    color: RED,

    fontWeight: '800',
  },
});