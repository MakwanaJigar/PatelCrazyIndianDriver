import { useEffect, useRef, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAssignedOrders, updateOrderStatus } from '../api/orders';

// ============================================================
// ORDERS STORE
// ------------------------------------------------------------
// Today's orders for the logged-in driver, shared by Home and
// Order Details. Screens read them with useOrders() / useOrder()
// and re-render automatically when an order changes (e.g. it is
// marked delivered).
//
// Loaded from GET /driver/orders/assigned via loadOrders().
// useOrdersAutoRefresh() keeps it in sync while the app is open,
// so newly assigned / delivered orders show up without a manual
// pull-to-refresh.
// No prices are kept here: drivers never see order amounts.
// ============================================================

// Status -> label, icon + colours
export const ORDER_STATUS = {
  delivered: {
    label: 'Delivered',
    icon: '✓',
    color: '#078B53',
    bg: '#E6F9F1',
  },
  pending: { label: 'Pending', icon: '◴', color: '#C77700', bg: '#FFF5E3' },
  ready: {
    label: 'Ready for Dispatch',
    icon: '➤',
    color: '#2F5BD3',
    bg: '#EBF0FF',
  },
};

// Where every order is collected from
export const PICKUP_LOCATION = 'Patel’s Kitchen';
export const PICKUP_ADDRESS = '420 Grand Junction Road, Clearview SA 5085';
// Map position of PICKUP_ADDRESS (Grand Junction Rd, Clearview, from
// OpenStreetMap). Smart Route starts here. Replace with the exact pin
// from Google Maps if it ever needs to be more precise.
export const PICKUP_POSITION = { lat: -34.8475089, lng: 138.613348 };

let orders = [];
const listeners = new Set();

const subscribe = listener => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getOrders = () => orders;

const emit = () => listeners.forEach(listener => listener());

// ------------------------------------------------------------
// Orders delivered on this phone, saved per day so a reload of
// /driver/orders/assigned (or an app restart) can't put them
// back in the pending list, even if the server doesn't know yet
// or drops delivered orders from the response.
//   { date: 'YYYY-MM-DD', orders: { [id]: deliveredOrder } }
// ------------------------------------------------------------
const DELIVERED_KEY = '@crazyindian/delivered_orders';

const todayKey = () => new Date().toISOString().slice(0, 10);

const getDeliveredToday = async () => {
  try {
    const saved = JSON.parse(await AsyncStorage.getItem(DELIVERED_KEY));
    return saved?.date === todayKey() ? saved.orders || {} : {};
  } catch (e) {
    return {};
  }
};

const saveDelivered = async order => {
  const delivered = await getDeliveredToday();
  delivered[order.id] = order;
  await AsyncStorage.setItem(
    DELIVERED_KEY,
    JSON.stringify({ date: todayKey(), orders: delivered }),
  );
};

// Delivered in this app session. Updated synchronously by
// markDelivered so a reload that was already in flight can't
// briefly put the order back in the pending list.
const deliveredNow = {};

const fetchAndMerge = async () => {
  const fresh = await fetchAssignedOrders();
  const delivered = { ...(await getDeliveredToday()), ...deliveredNow };

  const merged = fresh.map(o =>
    delivered[o.id] && o.status !== 'delivered'
      ? { ...o, ...delivered[o.id], status: 'delivered' }
      : o,
  );
  // Keep delivered orders the server no longer returns
  Object.values(delivered).forEach(o => {
    if (!merged.some(m => m.id === o.id)) {
      merged.push(o);
    }
  });

  orders = merged;
  emit();
  return orders;
};

let inFlight = null;

// Fetch the driver's assigned orders and update every screen.
// Calls made while a fetch is running share it.
// Throws the ApiError so the caller can show it / handle 401.
export const loadOrders = () => {
  if (!inFlight) {
    inFlight = fetchAndMerge().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
};

const AUTO_REFRESH_MS = 20000;

// Calls refresh() every AUTO_REFRESH_MS while the app is in the
// foreground, and straight away when the driver comes back to it
// (an order may have been assigned while the phone was locked).
export const useOrdersAutoRefresh = refresh => {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    let timer = null;

    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => refreshRef.current(), AUTO_REFRESH_MS);
    };

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshRef.current();
        start();
      } else {
        clearInterval(timer);
      }
    });

    if (AppState.currentState === 'active') {
      start();
    }

    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
};

export const useOrders = () => useSyncExternalStore(subscribe, getOrders);

export const useOrder = id =>
  useSyncExternalStore(subscribe, () => orders.find(o => o.id === id));

export const countByStatus = (list, status) =>
  list.filter(o => o.status === status).length;

export const itemCount = order =>
  order.items.reduce((sum, item) => sum + item.qty, 0);

const formatTime = date => {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};

// Mark an order delivered with its proof-of-delivery photo.
// The server is updated first (POST /driver/orders/{id}/status);
// if that fails the ApiError is thrown and nothing changes here.
export const markDelivered = async (id, photo) => {
  const order = orders.find(o => o.id === id);
  if (!order) {
    return;
  }
  await updateOrderStatus(order.orderId ?? id, 'delivered', photo);

  const delivered = {
    ...order,
    status: 'delivered',
    deliveryPhoto: photo?.uri,
    deliveredAt: formatTime(new Date()),
  };
  deliveredNow[id] = delivered;
  orders = orders.map(o => (o.id === id ? delivered : o));
  emit();
  await saveDelivered(delivered);

  // Pick up anything else the server changed (e.g. a new assignment)
  loadOrders().catch(() => {});
};
