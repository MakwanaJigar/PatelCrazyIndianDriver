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
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { clearSession } from '../api/session';
import { subscribeToPushes } from '../notifications/push';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';
import AppHeader from '../components/AppHeader';
import RouteMap, { startRouteNavigation } from '../components/RouteMap';
import { useSmartRoute } from '../data/useSmartRoute';
import { formatKm } from '../utils/smartRoute';
import {
  ORDER_STATUS,
  PICKUP_LOCATION,
  useOrders,
  loadOrders,
  useOrdersAutoRefresh,
  countByStatus,
  itemCount,
} from '../data/orders';

const { width } = Dimensions.get('window');

const DESIGN_WIDTH = 452;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const ADELAIDE_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d418336.6396460062!2d138.2815079343055!3d-35.0003213760432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab735c7c526b33f%3A0x4033654628ec640!2sAdelaide%20SA%2C%20Australia!5e0!3m2!1sen!2sin!4v1791801116916!5m2!1sen!2sin';

const ADELAIDE_MAP_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
      iframe { border: 0; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <iframe
      src="${ADELAIDE_MAP_EMBED_URL}"
      allowfullscreen=""
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>
  </body>
</html>
`;

const RED = '#E92025';
const GREEN = '#078B53';
const DARK = '#111827';
const MUTED = '#61708B';
const BORDER = '#DCE3EC';
const BG = '#F7F9FC';

// e.g. "Tue, 13 Oct"
const getTodayLabel = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
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
  const d = new Date();
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
};

const HomeScreen = ({ navigation }) => {
  // Assigned orders from GET /driver/orders/assigned
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // silent: background auto-refresh, keeps the current list on errors
  const refreshOrders = useCallback(
    async ({ silent } = {}) => {
      try {
        await loadOrders();
        setOrdersError(null);
      } catch (e) {
        if (e.status === 401) {
          await clearSession().catch(() => {});
          showAlert('Session expired', 'Please log in again.', [], {
            type: 'warning',
          });
          navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
          return;
        }
        if (!silent) {
          setOrdersError(e.message);
        }
      } finally {
        setOrdersLoading(false);
      }
    },
    [navigation],
  );

  useFocusEffect(
    useCallback(() => {
      refreshOrders();
    }, [refreshOrders]),
  );

  // A push (e.g. a new dispatch) may mean a newly assigned order
  useEffect(() => subscribeToPushes(() => refreshOrders()), [refreshOrders]);

  // Home stays mounted under the other tabs / Order Details, so this
  // keeps every screen that reads the orders store up to date
  useOrdersAutoRefresh(() => refreshOrders({ silent: true }));

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

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

  const orders = useOrders();

  const totalCount = orders.length;
  const deliveredCount = countByStatus(orders, 'delivered');

  // Delivered orders move out of the pending list into their own
  const pendingOrders = orders.filter(o => o.status !== 'delivered');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  // Smart Route: from the pickup, pending orders nearest first, then
  // nearest to that one, ... (see data/useSmartRoute.js). Until the route is ready,
  // or for orders it couldn't place, the server's order is kept.
  const smartRoute = useSmartRoute(pendingOrders);
  const routeStops = smartRoute.route?.stops ?? [];
  const stopById = {};
  routeStops.forEach((stop, i) => {
    stopById[stop.order.id] = { number: i + 1, legKm: stop.legKm };
  });
  const routedPending = [
    ...routeStops
      .map(stop => pendingOrders.find(o => o.id === stop.order.id))
      .filter(Boolean),
    ...pendingOrders.filter(o => !stopById[o.id]),
  ];
  const deliveredPercent = totalCount
    ? Math.round((deliveredCount / totalCount) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.screen}>
        {/* =====================================================
            HEADER
        ===================================================== */}

        <AppHeader
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerY }],
          }}
        />

        {/* =====================================================
            MAIN SCROLL
        ===================================================== */}

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
          {/* =====================================================
              TODAY'S SUMMARY
          ===================================================== */}

          <Animated.View
            style={{
              opacity: payoutOpacity,
              transform: [{ translateY: payoutY }],
            }}
          >
            {/* HERO: total orders + delivery progress */}

            <View style={styles.heroCard}>
              <View style={styles.heroCircleLarge} />
              <View style={styles.heroCircleSmall} />

              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.heroLabel}>TODAY'S TOTAL ORDERS</Text>
                  <Text style={styles.heroValue}>{totalCount}</Text>
                </View>

                <View style={styles.heroDateChip}>
                  <Text style={styles.heroDateText}>{getTodayLabel()}</Text>
                </View>
              </View>

              <View style={styles.heroProgressTrack}>
                <View
                  style={[
                    styles.heroProgressFill,
                    { width: `${deliveredPercent}%` },
                  ]}
                />
              </View>

              <View style={styles.heroBottomRow}>
                <Text style={styles.heroProgressText}>
                  {deliveredCount} of {totalCount} delivered
                </Text>

                <Text style={styles.heroPercentText}>{deliveredPercent}%</Text>
              </View>
            </View>

            {/* STATUS BREAKDOWN */}

            <View style={styles.statusGrid}>
              <StatusCard
                icon="✓"
                status={ORDER_STATUS.delivered}
                value={deliveredCount}
                label="Delivered"
              />

              <StatusCard
                icon="◴"
                status={ORDER_STATUS.pending}
                value={countByStatus(orders, 'pending')}
                label="Pending"
              />

              <StatusCard
                icon="➤"
                status={ORDER_STATUS.ready}
                value={countByStatus(orders, 'ready')}
                label={'Ready for\nDispatch'}
              />
            </View>
          </Animated.View>

          {/* =====================================================
              TODAY'S ORDERS
          ===================================================== */}

          <Animated.View
            style={{
              opacity: onlineOpacity,
              transform: [{ translateY: onlineY }],
            }}
          >
            {pendingOrders.length ? (
              <SmartRouteCard
                smartRoute={smartRoute}
                onOpen={() => navigation.navigate(ROUTES.SMART_ROUTE)}
              />
            ) : null}

            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeading}>Pending Orders</Text>

                <View style={styles.countChip}>
                  <Text style={styles.countChipText}>
                    {pendingOrders.length}
                  </Text>
                </View>
              </View>

              {routeStops.length ? (
                <Text style={styles.routeOrderHint}>Nearest first</Text>
              ) : null}
            </View>

            <View style={styles.ordersList}>
              {totalCount === 0 ? (
                ordersLoading ? (
                  <ActivityIndicator color={RED} style={styles.ordersLoader} />
                ) : (
                  <View style={styles.ordersEmpty}>
                    <Text style={styles.ordersEmptyIcon}>
                      {ordersError ? '⚠' : '🛵'}
                    </Text>
                    <Text style={styles.ordersEmptyTitle}>
                      {ordersError
                        ? 'Could not load orders'
                        : 'No orders assigned yet'}
                    </Text>
                    <Text style={styles.ordersEmptyText}>
                      {ordersError ||
                        'New orders assigned to you will show up here.'}
                    </Text>
                    {ordersError ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.ordersRetryButton}
                        onPress={onRefresh}
                      >
                        <Text style={styles.ordersRetryText}>Try Again</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )
              ) : pendingOrders.length === 0 ? (
                <View style={styles.ordersEmpty}>
                  <Text style={styles.ordersEmptyIcon}>🎉</Text>
                  <Text style={styles.ordersEmptyTitle}>
                    All orders delivered
                  </Text>
                  <Text style={styles.ordersEmptyText}>
                    Great job! New orders assigned to you will show up here.
                  </Text>
                </View>
              ) : null}

              {routedPending.map(order => (
                <TodayOrderCard
                  key={order.id}
                  order={order}
                  stop={stopById[order.id]}
                  onPress={() =>
                    navigation.navigate(ROUTES.ORDER_DETAILS, {
                      orderId: order.id,
                    })
                  }
                />
              ))}
            </View>

            {/* DELIVERED SUCCESSFULLY */}

            {deliveredOrders.length > 0 ? (
              <>
                <View style={styles.sectionHeadingRow}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionHeading}>
                      Delivered Successfully
                    </Text>

                    <View style={[styles.countChip, styles.countChipGreen]}>
                      <Text
                        style={[
                          styles.countChipText,
                          styles.countChipTextGreen,
                        ]}
                      >
                        {deliveredOrders.length}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.ordersList}>
                  {deliveredOrders.map(order => (
                    <TodayOrderCard
                      key={order.id}
                      order={order}
                      onPress={() =>
                        navigation.navigate(ROUTES.ORDER_DETAILS, {
                          orderId: order.id,
                        })
                      }
                    />
                  ))}
                </View>
              </>
            ) : null}
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

const StatusCard = ({ icon, status, value, label }) => (
  <View style={styles.statusCard}>
    <View style={[styles.statusAccent, { backgroundColor: status.color }]} />

    <View style={[styles.statusIcon, { backgroundColor: status.bg }]}>
      <Text style={[styles.statusIconText, { color: status.color }]}>
        {icon}
      </Text>
    </View>

    <Text style={styles.statusValue}>{value}</Text>

    <Text numberOfLines={2} style={styles.statusLabel}>
      {label}
    </Text>
  </View>
);

const getInitials = name =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Map + "Start Navigation" for the smart route through every
// pending order; "Full route" opens the Smart Route screen
const SmartRouteCard = ({ smartRoute, onOpen }) => {
  const { phase, progress, start, route } = smartRoute;
  const stops = route?.stops ?? [];
  const ready = phase === 'ready' && stops.length > 0;

  let status;
  if (phase === 'geocoding') {
    status = progress.total
      ? `Locating address ${progress.done} of ${progress.total}…`
      : 'Planning the shortest route…';
  } else if (!stops.length) {
    status = "Couldn't find these addresses on the map.";
  } else {
    status = `From ${PICKUP_LOCATION} · ${stops.length} stop${
      stops.length === 1 ? '' : 's'
    } · ${formatKm(route.totalKm)}`;
  }

  return (
    <View style={styles.smartRouteCard}>
      <View style={styles.smartRouteTop}>
        <View style={styles.smartRouteTitleCol}>
          <Text style={styles.smartRouteTitle}>🧭 Smart Route</Text>
          <Text numberOfLines={2} style={styles.smartRouteStatus}>
            {status}
          </Text>
        </View>

        {ready ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpen}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.smartRouteLink}>Full route ›</Text>
          </TouchableOpacity>
        ) : phase === 'geocoding' ? (
          <ActivityIndicator color={RED} />
        ) : null}
      </View>

      {ready ? (
        <>
          <View style={styles.smartRouteMap}>
            <RouteMap start={start} stops={stops} path={route.path} />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.smartRouteButton}
            onPress={() => startRouteNavigation(stops)}
          >
            <Text style={styles.smartRouteButtonText}>➤ Start Navigation</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};

const TodayOrderCard = ({ order, stop, onPress }) => {
  const status = ORDER_STATUS[order.status];
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.timing(scale, {
      toValue: 0.98,
      duration: 90,
      useNativeDriver: true,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View
      style={[
        styles.todayOrderCard,
        { borderColor: status.bg, transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        {/* HEADER: order id, time, status */}
        <View style={[styles.orderCardHeader, { backgroundColor: status.bg }]}>
          <View style={styles.orderCardHeaderLeft}>
            <View
              style={[styles.orderCardIcon, { backgroundColor: status.color }]}
            >
              <Text style={styles.orderCardIconText}>
                {stop ? stop.number : status.icon}
              </Text>
            </View>

            <View>
              <Text style={styles.orderCardId}>{order.id}</Text>
              <Text style={styles.orderCardTime}>🕒 {order.time}</Text>
            </View>
          </View>

          <View style={[styles.statusPill, { backgroundColor: status.color }]}>
            <Text style={styles.statusPillText}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.orderCardBody}>
          {/* CUSTOMER */}
          <View style={styles.customerRow}>
            <View style={[styles.avatar, { borderColor: status.color }]}>
              <Text style={[styles.avatarText, { color: status.color }]}>
                {getInitials(order.customer)}
              </Text>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerLabel}>CUSTOMER</Text>
              <Text numberOfLines={1} style={styles.customerName}>
                {order.customer}
              </Text>
            </View>
          </View>

          {/* ROUTE: pickup -> drop */}
          <View style={styles.routeBox}>
            <View style={styles.routeStop}>
              <View style={styles.routeMarkerCol}>
                <View style={[styles.routeDot, styles.routeDotPickup]} />
                <View style={styles.routeLine} />
              </View>

              <View style={styles.routeTextCol}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text numberOfLines={1} style={styles.routeValue}>
                  {PICKUP_LOCATION}
                </Text>
              </View>
            </View>

            <View style={styles.routeStop}>
              <View style={styles.routeMarkerCol}>
                <View style={[styles.routeDot, styles.routeDotDrop]} />
              </View>

              <View style={styles.routeTextCol}>
                <Text style={styles.routeLabel}>DROP</Text>
                <Text numberOfLines={1} style={styles.routeValue}>
                  {order.address}
                </Text>
              </View>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.orderCardFooter}>
            <View style={styles.footerChips}>
              <View style={styles.footerChip}>
                <Text style={styles.footerChipText}>
                  🛍 {itemCount(order)}{' '}
                  {itemCount(order) === 1 ? 'item' : 'items'}
                </Text>
              </View>

              <View style={styles.footerChip}>
                <Text style={styles.footerChipText}>
                  {stop
                    ? `➤ Stop ${stop.number} · ${formatKm(stop.legKm)}`
                    : `➤ ${order.distance}`}
                </Text>
              </View>
            </View>

            <View
              style={[styles.detailsButton, { backgroundColor: status.color }]}
            >
              <Text style={styles.detailsButtonText}>Details ›</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MetricCard = ({ icon, iconBg, value, label, green }) => (
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

    <Text style={[styles.metricValue, green && styles.metricValueGreen]}>
      {value}
    </Text>

    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const BottomNav = ({ icon, label, active, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    style={styles.navItem}
    onPress={onPress}
  >
    <Text style={[styles.navIcon, active && styles.navIconActive]}>{icon}</Text>

    <Text style={[styles.navLabel, active && styles.navLabelActive]}>
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
  // HERO (TODAY'S TOTAL)
  // ======================================================

  heroCard: {
    backgroundColor: RED,

    borderRadius: rs(20),

    padding: rs(20),

    overflow: 'hidden',

    shadowColor: RED,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },

    elevation: 8,
  },

  heroCircleLarge: {
    position: 'absolute',
    top: -rs(60),
    right: -rs(40),

    width: rs(180),
    height: rs(180),

    borderRadius: rs(90),

    backgroundColor: 'rgba(255,255,255,0.10)',
  },

  heroCircleSmall: {
    position: 'absolute',
    bottom: -rs(50),
    left: -rs(30),

    width: rs(120),
    height: rs(120),

    borderRadius: rs(60),

    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  heroLabel: {
    color: 'rgba(255,255,255,0.85)',

    fontSize: fs(12),
    fontWeight: '800',

    letterSpacing: 1,
  },

  heroValue: {
    color: '#FFFFFF',

    fontSize: fs(46),
    fontWeight: '900',

    marginTop: rs(2),
  },

  heroDateChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',

    borderRadius: rs(20),

    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
  },

  heroDateText: {
    color: '#FFFFFF',

    fontSize: fs(12),
    fontWeight: '800',
  },

  heroProgressTrack: {
    marginTop: rs(12),

    height: rs(8),

    borderRadius: rs(4),

    backgroundColor: 'rgba(255,255,255,0.25)',

    overflow: 'hidden',
  },

  heroProgressFill: {
    height: '100%',

    borderRadius: rs(4),

    backgroundColor: '#FFFFFF',
  },

  heroBottomRow: {
    marginTop: rs(9),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroProgressText: {
    color: 'rgba(255,255,255,0.92)',

    fontSize: fs(13),
    fontWeight: '700',
  },

  heroPercentText: {
    color: '#FFFFFF',

    fontSize: fs(14),
    fontWeight: '900',
  },

  // ======================================================
  // STATUS BREAKDOWN
  // ======================================================

  statusGrid: {
    marginTop: rs(14),

    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusCard: {
    width: '31.5%',

    backgroundColor: '#FFFFFF',

    borderRadius: rs(14),

    paddingTop: rs(16),
    paddingBottom: rs(14),
    paddingHorizontal: rs(12),

    overflow: 'hidden',

    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },

    elevation: 3,
  },

  statusAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,

    height: rs(4),
  },

  statusIcon: {
    width: rs(36),
    height: rs(36),

    borderRadius: rs(18),

    alignItems: 'center',
    justifyContent: 'center',
  },

  statusIconText: {
    fontSize: fs(16),
    fontWeight: '900',
  },

  statusValue: {
    color: DARK,

    fontSize: fs(26),
    fontWeight: '900',

    marginTop: rs(10),
  },

  statusLabel: {
    color: MUTED,

    fontSize: fs(11),
    fontWeight: '700',
    lineHeight: fs(14),

    marginTop: rs(2),
  },

  // ======================================================
  // TODAY'S ORDERS
  // ======================================================

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  countChip: {
    marginLeft: rs(8),

    minWidth: rs(24),

    paddingHorizontal: rs(7),
    paddingVertical: rs(2),

    borderRadius: rs(12),

    backgroundColor: '#FFE8E8',

    alignItems: 'center',
  },

  countChipText: {
    color: RED,

    fontSize: fs(12),
    fontWeight: '900',
  },

  routeOrderHint: {
    color: MUTED,

    fontSize: fs(12),
    fontWeight: '700',
  },

  smartRouteCard: {
    marginTop: rs(24),

    padding: rs(16),

    borderRadius: rs(20),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },

    elevation: 2,
  },

  smartRouteTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smartRouteTitleCol: {
    flex: 1,
    marginRight: rs(10),
  },

  smartRouteTitle: {
    color: DARK,

    fontSize: fs(17),
    fontWeight: '900',
  },

  smartRouteStatus: {
    marginTop: rs(3),

    color: MUTED,

    fontSize: fs(12),
    fontWeight: '700',
  },

  smartRouteLink: {
    color: RED,

    fontSize: fs(13),
    fontWeight: '900',
  },

  smartRouteMap: {
    height: rs(190),

    marginTop: rs(12),

    borderRadius: rs(14),
    overflow: 'hidden',

    backgroundColor: '#E8EDF3',
  },

  smartRouteButton: {
    marginTop: rs(12),

    height: rs(48),

    borderRadius: rs(14),

    backgroundColor: RED,

    alignItems: 'center',
    justifyContent: 'center',
  },

  smartRouteButtonText: {
    color: '#FFFFFF',

    fontSize: fs(15),
    fontWeight: '900',
  },

  countChipGreen: {
    backgroundColor: ORDER_STATUS.delivered.bg,
  },

  countChipTextGreen: {
    color: ORDER_STATUS.delivered.color,
  },

  ordersList: {
    marginTop: rs(12),
  },

  ordersLoader: {
    marginVertical: rs(28),
  },

  ordersEmpty: {
    alignItems: 'center',
    paddingVertical: rs(28),
    paddingHorizontal: rs(20),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(18),
    borderWidth: 1.5,
    borderColor: BORDER,
  },

  ordersEmptyIcon: {
    fontSize: fs(30),
  },

  ordersEmptyTitle: {
    marginTop: rs(8),
    color: DARK,
    fontSize: fs(16),
    fontWeight: '900',
  },

  ordersEmptyText: {
    marginTop: rs(4),
    color: MUTED,
    fontSize: fs(13),
    textAlign: 'center',
  },

  ordersRetryButton: {
    marginTop: rs(14),
    paddingHorizontal: rs(22),
    paddingVertical: rs(10),
    borderRadius: rs(12),
    backgroundColor: RED,
  },

  ordersRetryText: {
    color: '#FFFFFF',
    fontSize: fs(14),
    fontWeight: '800',
  },

  todayOrderCard: {
    backgroundColor: '#FFFFFF',

    borderRadius: rs(18),

    borderWidth: 1.5,

    marginBottom: rs(14),

    overflow: 'hidden',

    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },

    elevation: 4,
  },

  orderCardHeader: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(12),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderCardHeaderLeft: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  orderCardIcon: {
    width: rs(36),
    height: rs(36),

    borderRadius: rs(11),

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  orderCardIconText: {
    color: '#FFFFFF',

    fontSize: fs(16),
    fontWeight: '900',
  },

  orderCardId: {
    color: DARK,

    fontSize: fs(16),
    fontWeight: '900',

    letterSpacing: 0.3,
  },

  orderCardTime: {
    color: '#44546A',

    fontSize: fs(11),
    fontWeight: '700',

    marginTop: rs(2),
  },

  statusPill: {
    paddingHorizontal: rs(11),
    paddingVertical: rs(6),

    borderRadius: rs(20),

    marginLeft: rs(8),
  },

  statusPillText: {
    color: '#FFFFFF',

    fontSize: fs(11),
    fontWeight: '900',

    letterSpacing: 0.3,
  },

  orderCardBody: {
    padding: rs(14),
  },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: rs(46),
    height: rs(46),

    borderRadius: rs(23),

    borderWidth: 2,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(12),
  },

  avatarText: {
    fontSize: fs(15),
    fontWeight: '900',
  },

  customerInfo: {
    flex: 1,
  },

  customerLabel: {
    color: MUTED,

    fontSize: fs(10),
    fontWeight: '800',

    letterSpacing: 1,
  },

  customerName: {
    color: DARK,

    fontSize: fs(17),
    fontWeight: '900',

    marginTop: rs(2),
  },

  routeBox: {
    marginTop: rs(14),

    backgroundColor: '#F7F9FC',

    borderRadius: rs(12),

    paddingHorizontal: rs(12),
    paddingVertical: rs(10),
  },

  routeStop: {
    flexDirection: 'row',
  },

  routeMarkerCol: {
    width: rs(16),

    alignItems: 'center',

    marginRight: rs(10),
  },

  routeDot: {
    width: rs(12),
    height: rs(12),

    borderRadius: rs(6),

    marginTop: rs(4),
  },

  routeDotPickup: {
    backgroundColor: '#FFFFFF',

    borderWidth: 3,
    borderColor: RED,
  },

  routeDotDrop: {
    backgroundColor: GREEN,
  },

  routeLine: {
    flex: 1,

    width: 0,

    borderLeftWidth: 2,
    borderLeftColor: '#C9D2DE',
    borderStyle: 'dashed',

    marginVertical: rs(3),
  },

  routeTextCol: {
    flex: 1,

    paddingBottom: rs(8),
  },

  routeLabel: {
    color: MUTED,

    fontSize: fs(10),
    fontWeight: '800',

    letterSpacing: 1,
  },

  routeValue: {
    color: '#1F2A3D',

    fontSize: fs(13),
    fontWeight: '700',

    marginTop: rs(2),
  },

  orderCardFooter: {
    marginTop: rs(12),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerChips: {
    flex: 1,

    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  footerChip: {
    backgroundColor: '#F1F4F9',

    borderWidth: 1,
    borderColor: '#E1E6EF',

    borderRadius: rs(20),

    paddingHorizontal: rs(10),
    paddingVertical: rs(6),

    marginRight: rs(6),
  },

  footerChipText: {
    color: '#33435E',

    fontSize: fs(12),
    fontWeight: '700',
  },

  detailsButton: {
    paddingHorizontal: rs(16),
    paddingVertical: rs(9),

    borderRadius: rs(12),
  },

  detailsButtonText: {
    color: '#FFFFFF',

    fontSize: fs(13),
    fontWeight: '900',
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
    marginTop: rs(24),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionHeading: {
    color: DARK,

    fontSize: fs(18),
    fontWeight: '900',
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
    height: rs(240),
  },

  mapWebView: {
    flex: 1,
    backgroundColor: 'transparent',
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
