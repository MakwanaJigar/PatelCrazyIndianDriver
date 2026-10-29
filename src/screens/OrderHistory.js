import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';
import AppHeader from '../components/AppHeader';
import { ORDER_STATUS, useOrders, loadOrders, itemCount } from '../data/orders';

// ============================================================
// ORDER HISTORY
// ------------------------------------------------------------
// The driver's delivered orders, newest first. Reads the shared
// orders store, so an order shows up here the moment it is marked
// delivered (and stays in sync with Home's auto-refresh).
// Tapping an order opens Order Details with its delivery photo.
// ============================================================

const DESIGN_WIDTH = 375;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#E51D26';
const DARK = '#101827';
const MUTED = '#60708B';
const BORDER = '#DCE3EB';
const BG = '#F7F9FC';

const DELIVERED = ORDER_STATUS.delivered;

const getInitials = name =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const OrderHistory = ({ navigation }) => {
  const orders = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  // Most recently delivered first (orders are kept in assignment order)
  const delivered = orders.filter(o => o.status === 'delivered').reverse();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders().catch(() => {});
    setRefreshing(false);
  };

  const openOrder = order =>
    navigation.navigate(ROUTES.ORDER_DETAILS, { orderId: order.id });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.screen}>
        <AppHeader />

        <FlatList
          data={delivered}
          keyExtractor={order => order.id}
          renderItem={({ item }) => (
            <DeliveredCard order={item} onPress={() => openOrder(item)} />
          )}
          contentContainerStyle={[
            styles.listContent,
            !delivered.length && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[RED]}
              tintColor={RED}
            />
          }
          ListHeaderComponent={
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.title}>Delivered Orders</Text>
                <Text style={styles.subtitle}>Orders you have delivered</Text>
              </View>

              <View style={styles.countChip}>
                <Text style={styles.countText}>{delivered.length}</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛵</Text>
              <Text style={styles.emptyTitle}>No deliveries yet</Text>
              <Text style={styles.emptyText}>
                Orders you mark as delivered will appear here.
              </Text>
            </View>
          }
        />

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
   DELIVERED ORDER CARD
============================================================ */

const DeliveredCard = ({ order, onPress }) => {
  const count = itemCount(order);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>{DELIVERED.icon}</Text>
          </View>

          <View>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderTime}>
              {order.deliveredAt
                ? `Delivered at ${order.deliveredAt}`
                : 'Delivered'}
            </Text>
          </View>
        </View>

        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{DELIVERED.label}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.customerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(order.customer)}</Text>
          </View>

          <View style={styles.customerInfo}>
            <Text numberOfLines={1} style={styles.customerName}>
              {order.customer}
            </Text>
            <Text numberOfLines={2} style={styles.address}>
              📍 {order.address || '—'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              🛍 {count} {count === 1 ? 'item' : 'items'}
            </Text>
          </View>

          <Text style={styles.detailsText}>Details ›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ============================================================
   BOTTOM NAV
============================================================ */

const BottomNav = ({ icon, title, active, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.navItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.navIcon, active && styles.navIconActive]}>
        {icon}
      </Text>

      <Text style={[styles.navText, active && styles.navTextActive]}>
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

  listContent: {
    paddingHorizontal: rs(15),
    paddingTop: rs(15),
    paddingBottom: rs(24),
  },

  listEmpty: {
    flexGrow: 1,
  },

  /* ==========================================================
     TITLE
  ========================================================== */

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(14),
  },

  title: {
    color: DARK,
    fontSize: fs(20),
    fontWeight: '800',
  },

  subtitle: {
    color: MUTED,
    fontSize: fs(12),
    marginTop: rs(2),
  },

  countChip: {
    minWidth: rs(34),
    height: rs(34),
    paddingHorizontal: rs(10),

    borderRadius: rs(17),
    backgroundColor: DELIVERED.bg,

    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: DELIVERED.color,
    fontSize: fs(15),
    fontWeight: '800',
  },

  /* ==========================================================
     CARD
  ========================================================== */

  card: {
    marginBottom: rs(12),

    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: DELIVERED.bg,

    overflow: 'hidden',
    elevation: 2,
  },

  cardHeader: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(10),

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: DELIVERED.bg,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardIcon: {
    width: rs(30),
    height: rs(30),
    marginRight: rs(10),

    borderRadius: rs(15),
    backgroundColor: DELIVERED.color,

    alignItems: 'center',
    justifyContent: 'center',
  },

  cardIconText: {
    color: '#FFFFFF',
    fontSize: fs(14),
    fontWeight: '900',
  },

  orderId: {
    color: DARK,
    fontSize: fs(15),
    fontWeight: '800',
  },

  orderTime: {
    color: MUTED,
    fontSize: fs(11),
    marginTop: rs(1),
  },

  statusPill: {
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),

    borderRadius: rs(12),
    backgroundColor: DELIVERED.color,
  },

  statusPillText: {
    color: '#FFFFFF',
    fontSize: fs(10),
    fontWeight: '800',
  },

  cardBody: {
    padding: rs(14),
  },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: rs(40),
    height: rs(40),
    marginRight: rs(12),

    borderRadius: rs(20),
    borderWidth: 1.5,
    borderColor: DELIVERED.color,

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: DELIVERED.color,
    fontSize: fs(13),
    fontWeight: '800',
  },

  customerInfo: {
    flex: 1,
  },

  customerName: {
    color: DARK,
    fontSize: fs(15),
    fontWeight: '700',
  },

  address: {
    color: MUTED,
    fontSize: fs(12),
    lineHeight: fs(17),
    marginTop: rs(2),
  },

  cardFooter: {
    marginTop: rs(12),
    paddingTop: rs(12),

    borderTopWidth: 1,
    borderTopColor: BORDER,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  chip: {
    paddingHorizontal: rs(10),
    paddingVertical: rs(5),

    borderRadius: rs(10),
    backgroundColor: '#F1F4F9',
  },

  chipText: {
    color: DARK,
    fontSize: fs(11),
    fontWeight: '600',
  },

  detailsText: {
    color: DELIVERED.color,
    fontSize: fs(13),
    fontWeight: '800',
  },

  /* ==========================================================
     EMPTY
  ========================================================== */

  empty: {
    flex: 1,
    paddingHorizontal: rs(30),

    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIcon: {
    fontSize: fs(42),
  },

  emptyTitle: {
    color: DARK,
    fontSize: fs(17),
    fontWeight: '800',
    marginTop: rs(10),
  },

  emptyText: {
    color: MUTED,
    fontSize: fs(13),
    lineHeight: fs(19),
    marginTop: rs(4),
    textAlign: 'center',
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
