import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import RouteMap, { startRouteNavigation } from '../components/RouteMap';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';
import {
  useOrders,
  itemCount,
  PICKUP_LOCATION,
  PICKUP_ADDRESS,
} from '../data/orders';
import { useSmartRoute } from '../data/useSmartRoute';
import { formatKm, formatMin } from '../utils/smartRoute';

// ============================================================
// SMART ROUTE
// ------------------------------------------------------------
// Every pending order as one route from the pickup, nearest stop
// first, then the stop nearest to that one, and so on (see
// utils/smartRoute.js).
//
//   map of the route | "Start Navigation" (Google Maps, all stops)
//   numbered stop list -> tap opens Order Details
//
// Opened from the Smart Route card on Home ("View full route").
// Planning lives in data/useSmartRoute.js.
// ============================================================

const DESIGN_WIDTH = 452;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#E92025';
const GREEN = '#078B53';
const DARK = '#111827';
const MUTED = '#61708B';
const BORDER = '#DCE3EC';
const BG = '#F7F9FC';

const SmartRouteScreen = ({ navigation }) => {
  const orders = useOrders();
  const pendingOrders = useMemo(
    () => orders.filter(o => o.status !== 'delivered'),
    [orders],
  );
  const { phase, progress, start, route, plan } =
    useSmartRoute(pendingOrders);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await plan();
    setRefreshing(false);
  };

  const stops = route?.stops ?? [];

  const openOrder = order =>
    navigation.navigate(ROUTES.ORDER_DETAILS, { orderId: order.id });

  const subtitle =
    phase === 'ready' && stops.length
      ? `${stops.length} stop${stops.length === 1 ? '' : 's'} · ${formatKm(
          route.totalKm,
        )}${route.totalMin != null ? ` · ~${formatMin(route.totalMin)}` : ''}`
      : 'Nearest delivery first';

  const renderBody = () => {
    if (pendingOrders.length === 0) {
      return (
        <Message
          icon="🎉"
          title="No pending deliveries"
          text="New orders assigned to you will be added to your route."
        />
      );
    }

    if (phase !== 'ready') {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={RED} size="large" />
          <Text style={styles.loadingTitle}>
            Planning the shortest route…
          </Text>
          {phase === 'geocoding' && progress.total ? (
            <Text style={styles.loadingText}>
              Locating address {progress.done} of {progress.total}
            </Text>
          ) : null}
        </View>
      );
    }

    return (
      <>
        {start && stops.length ? (
          <View style={styles.mapCard}>
            <RouteMap start={start} stops={stops} path={route.path} />
          </View>
        ) : null}

        {stops.length ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.navButton}
            onPress={() => startRouteNavigation(stops)}
          >
            <Text style={styles.navButtonText}>➤  Start Navigation</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.sectionHeading}>Delivery Order</Text>

        <View style={styles.startRow}>
          <View style={[styles.stopBadge, styles.startBadge]}>
            <Text style={styles.stopBadgeText}>P</Text>
          </View>
          <View style={styles.startTextCol}>
            <Text style={styles.startTitle}>Pickup · {PICKUP_LOCATION}</Text>
            <Text style={styles.startText}>{PICKUP_ADDRESS}</Text>
          </View>
        </View>

        {stops.map((stop, index) => (
          <StopCard
            key={stop.order.id}
            stop={stop}
            number={index + 1}
            isLast={index === stops.length - 1}
            onPress={() => openOrder(stop.order)}
            onNavigate={() => startRouteNavigation(stops.slice(index))}
          />
        ))}

        {route.unlocated.length ? (
          <>
            <Text style={styles.sectionHeading}>Address not found</Text>
            <Text style={styles.unlocatedHint}>
              These couldn't be placed on the map, so they're not in the
              route. Open the order to navigate by address.
            </Text>
            {route.unlocated.map(order => (
              <TouchableOpacity
                key={order.id}
                activeOpacity={0.85}
                style={styles.unlocatedCard}
                onPress={() => openOrder(order)}
              >
                <Text style={styles.stopCustomer}>
                  {order.customer} · {order.id}
                </Text>
                <Text numberOfLines={2} style={styles.stopAddress}>
                  {order.address || 'No address'}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        ) : null}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader
        onBack={() => navigation.goBack()}
        title="Smart Route"
        subtitle={subtitle}
      />

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
        {renderBody()}
      </ScrollView>
    </SafeAreaView>
  );
};

const StopCard = ({ stop, number, isLast, onPress, onNavigate }) => {
  const { order } = stop;
  const items = itemCount(order);

  return (
    <View style={styles.stopRow}>
      <View style={styles.timeline}>
        <View style={styles.stopBadge}>
          <Text style={styles.stopBadgeText}>{number}</Text>
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.stopCard}
        onPress={onPress}
      >
        <View style={styles.stopTopRow}>
          <Text numberOfLines={1} style={styles.stopCustomer}>
            {order.customer}
          </Text>
          <Text style={styles.stopId}>{order.id}</Text>
        </View>

        <Text numberOfLines={2} style={styles.stopAddress}>
          {order.address}
        </Text>

        <View style={styles.stopBottomRow}>
          <Text style={styles.stopMeta}>
            {formatKm(stop.legKm)}
            {stop.legMin != null ? ` · ${formatMin(stop.legMin)}` : ''} from{' '}
            {number === 1 ? 'pickup' : 'previous'}
            {items ? `  ·  ${items} item${items === 1 ? '' : 's'}` : ''}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.goButton}
            onPress={onNavigate}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.goButtonText}>Go ➤</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const Message = ({ icon, title, text, action, onAction }) => (
  <View style={styles.message}>
    <Text style={styles.messageIcon}>{icon}</Text>
    <Text style={styles.messageTitle}>{title}</Text>
    {text ? <Text style={styles.messageText}>{text}</Text> : null}
    {action ? (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.messageButton}
        onPress={onAction}
      >
        <Text style={styles.messageButtonText}>{action}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export default SmartRouteScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    padding: rs(20),
    paddingBottom: rs(40),
  },

  loading: {
    alignItems: 'center',
    paddingVertical: rs(60),
  },

  loadingTitle: {
    marginTop: rs(16),

    color: DARK,

    fontSize: fs(16),
    fontWeight: '800',
  },

  loadingText: {
    marginTop: rs(6),

    color: MUTED,

    fontSize: fs(13),
    fontWeight: '600',
  },

  mapCard: {
    height: rs(240),

    borderRadius: rs(18),
    overflow: 'hidden',

    borderWidth: 1,
    borderColor: BORDER,

    backgroundColor: '#E8EDF3',
  },

  navButton: {
    marginTop: rs(14),

    height: rs(52),

    borderRadius: rs(14),

    backgroundColor: RED,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  navButtonText: {
    color: '#FFFFFF',

    fontSize: fs(16),
    fontWeight: '900',
  },

  sectionHeading: {
    marginTop: rs(24),
    marginBottom: rs(12),

    color: DARK,

    fontSize: fs(18),
    fontWeight: '900',
  },

  startRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: rs(10),
  },

  startBadge: {
    backgroundColor: GREEN,
  },

  startTextCol: {
    flex: 1,
    marginLeft: rs(12),
  },

  startTitle: {
    color: DARK,

    fontSize: fs(14),
    fontWeight: '900',
  },

  startText: {
    marginTop: rs(2),

    color: MUTED,

    fontSize: fs(12),
    fontWeight: '700',
  },

  stopRow: {
    flexDirection: 'row',
  },

  timeline: {
    width: rs(30),
    alignItems: 'center',
  },

  timelineLine: {
    flex: 1,
    width: 2,

    marginVertical: rs(4),

    backgroundColor: '#F3B9BB',
  },

  stopBadge: {
    width: rs(30),
    height: rs(30),

    borderRadius: rs(15),

    backgroundColor: RED,

    alignItems: 'center',
    justifyContent: 'center',
  },

  stopBadgeText: {
    color: '#FFFFFF',

    fontSize: fs(13),
    fontWeight: '900',
  },

  stopCard: {
    flex: 1,

    marginLeft: rs(12),
    marginBottom: rs(12),

    padding: rs(14),

    borderRadius: rs(16),

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: BORDER,
  },

  stopTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stopCustomer: {
    flexShrink: 1,

    color: DARK,

    fontSize: fs(15),
    fontWeight: '900',
  },

  stopId: {
    marginLeft: rs(8),

    color: MUTED,

    fontSize: fs(12),
    fontWeight: '700',
  },

  stopAddress: {
    marginTop: rs(4),

    color: MUTED,

    fontSize: fs(13),
    fontWeight: '600',
    lineHeight: fs(18),
  },

  stopBottomRow: {
    marginTop: rs(10),

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stopMeta: {
    flexShrink: 1,

    color: DARK,

    fontSize: fs(12),
    fontWeight: '800',
  },

  goButton: {
    marginLeft: rs(8),

    paddingHorizontal: rs(14),
    paddingVertical: rs(6),

    borderRadius: rs(10),

    backgroundColor: '#FFE8E8',
  },

  goButtonText: {
    color: RED,

    fontSize: fs(13),
    fontWeight: '900',
  },

  unlocatedHint: {
    marginTop: -rs(6),
    marginBottom: rs(10),

    color: MUTED,

    fontSize: fs(12),
    fontWeight: '600',
  },

  unlocatedCard: {
    marginBottom: rs(10),

    padding: rs(14),

    borderRadius: rs(16),

    backgroundColor: '#FFF5E3',

    borderWidth: 1,
    borderColor: '#F5DDB0',
  },

  message: {
    alignItems: 'center',
    paddingVertical: rs(60),
    paddingHorizontal: rs(20),
  },

  messageIcon: {
    fontSize: fs(40),
  },

  messageTitle: {
    marginTop: rs(12),

    color: DARK,

    fontSize: fs(17),
    fontWeight: '900',
    textAlign: 'center',
  },

  messageText: {
    marginTop: rs(6),

    color: MUTED,

    fontSize: fs(13),
    fontWeight: '600',
    textAlign: 'center',
  },

  messageButton: {
    marginTop: rs(18),

    paddingHorizontal: rs(24),
    paddingVertical: rs(12),

    borderRadius: rs(12),

    backgroundColor: RED,
  },

  messageButtonText: {
    color: '#FFFFFF',

    fontSize: fs(14),
    fontWeight: '900',
  },
});
