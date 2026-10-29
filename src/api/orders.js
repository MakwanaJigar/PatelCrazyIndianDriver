import { apiGet, apiPost } from './client';
import { getSession } from './session';

// ============================================================
// DRIVER ORDERS API
// ------------------------------------------------------------
//   GET  /driver/orders/assigned     (Bearer token)
//   POST /driver/orders/{id}/status  (Bearer token, multipart)
//
// The response shape isn't documented yet, so the list is looked
// up in the usual Laravel places and every order is normalised to
// the shape the orders store / screens use:
//   { id, customer, phone, address, time, distance, status,
//     deliveredAt, items: [{ name, qty }], notes }
// ============================================================

const extractList = res => {
  const data = res.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.orders)) {
    return data.orders;
  }
  // Laravel paginator: { data: { data: [...], current_page, ... } }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(res.orders)) {
    return res.orders;
  }
  return [];
};

// Server status -> one of the ORDER_STATUS keys in data/orders.js
const normalizeStatus = raw => {
  const s = String(raw || '').toLowerCase();
  if (['delivered', 'completed', 'complete'].includes(s)) {
    return 'delivered';
  }
  if (/ready|dispatch|picked|out_for_delivery|on_the_way/.test(s)) {
    return 'ready';
  }
  return 'pending';
};

// "2026-10-19 12:20:00" / ISO -> "12:20 PM"; plain "12:20 PM" kept as is
const formatTime = value => {
  if (!value) {
    return '';
  }
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};

const formatDistance = value => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return typeof value === 'number' ? `${value} km` : String(value);
};

const toCoord = value => {
  const n = Number(value);
  return value !== null && value !== '' && Number.isFinite(n) ? n : undefined;
};

const normalizeItems = list =>
  (Array.isArray(list) ? list : []).map(item => ({
    name:
      item.name ||
      item.item_name ||
      item.product_name ||
      item.product?.name ||
      item.menu_item?.name ||
      'Item',
    qty: Number(item.qty ?? item.quantity ?? 1) || 1,
  }));

const normalize = (item, index) => {
  const customer =
    item.customer && typeof item.customer === 'object' ? item.customer : {};
  const address =
    item.delivery_address ||
    item.address ||
    item.shipping_address ||
    customer.address ||
    '';
  const number = item.order_number || item.order_no || item.id || index;

  return {
    id: String(number).startsWith('#') ? String(number) : `#${number}`,
    // Server id, for follow-up calls like marking the order delivered
    orderId: item.id ?? number,
    customer:
      item.customer_name ||
      customer.name ||
      (typeof item.customer === 'string' ? item.customer : '') ||
      item.name ||
      'Customer',
    phone:
      item.customer_phone || customer.phone || item.phone || item.mobile || '',
    address:
      typeof address === 'object'
        ? [address.line1, address.line2, address.city, address.postcode]
            .filter(Boolean)
            .join(', ')
        : String(address),
    time: formatTime(
      item.delivery_time || item.time || item.assigned_at || item.created_at,
    ),
    distance: formatDistance(item.distance_km ?? item.distance),
    status: normalizeStatus(item.status || item.order_status),
    deliveredAt: item.delivered_at ? formatTime(item.delivered_at) : undefined,
    items: normalizeItems(item.items || item.order_items || item.products),
    notes: item.notes || item.delivery_notes || item.instructions || '',
    // Delivery coordinates, used by Smart Route when the server sends
    // them (otherwise it looks the address up)
    lat: toCoord(
      item.delivery_lat ??
        item.latitude ??
        item.lat ??
        (typeof address === 'object' ? address.latitude ?? address.lat : null),
    ),
    lng: toCoord(
      item.delivery_lng ??
        item.longitude ??
        item.lng ??
        (typeof address === 'object'
          ? address.longitude ?? address.lng
          : null),
    ),
  };
};

export const fetchAssignedOrders = async () => {
  const session = await getSession();
  const res = await apiGet('/driver/orders/assigned', {
    token: session?.token,
  });
  return extractList(res).map(normalize);
};

// Field the proof-of-delivery photo is uploaded under
const PHOTO_FIELD = 'delivery_photo';

// Update an order's status on the server, e.g. 'delivered' with the
// proof-of-delivery photo (an asset from react-native-image-picker).
// `orderId` is the server id (order.orderId), not the "#..." label.
export const updateOrderStatus = async (orderId, status, photo) => {
  const session = await getSession();
  const form = new FormData();
  form.append('status', status);
  if (photo?.uri) {
    form.append(PHOTO_FIELD, {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.fileName || `delivery-${orderId}.jpg`,
    });
  }
  return apiPost(`/driver/orders/${encodeURIComponent(orderId)}/status`, form, {
    token: session?.token,
  });
};
