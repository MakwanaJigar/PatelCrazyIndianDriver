import { apiGet, apiPost } from './client';
import { getSession } from './session';

// ============================================================
// DRIVER NOTIFICATIONS API
// ------------------------------------------------------------
//   GET  /driver/notifications            (Bearer token)
//   POST /driver/notifications/{id}/read  mark one as read
//   POST /driver/notifications/read-all   mark all as read
//
// The response shape isn't documented yet, so the list is looked
// up in the usual Laravel places and every item is normalised to
//   { id, title, body, createdAt, read }
// ============================================================

const extractList = res => {
  const data = res.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.notifications)) {
    return data.notifications;
  }
  // Laravel paginator: { data: { data: [...], current_page, ... } }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(res.notifications)) {
    return res.notifications;
  }
  return [];
};

// Laravel database notifications keep title/body inside `data`
const normalize = (item, index) => {
  const payload = item.data && typeof item.data === 'object' ? item.data : {};
  return {
    id: String(item.id ?? index),
    title: item.title || payload.title || 'Notification',
    body:
      item.body ||
      item.message ||
      item.description ||
      payload.body ||
      payload.message ||
      '',
    createdAt: item.created_at || item.sent_at || null,
    read: Boolean(item.is_read ?? item.read ?? item.read_at),
  };
};

export const fetchNotifications = async () => {
  const session = await getSession();
  const res = await apiGet('/driver/notifications', { token: session?.token });
  return extractList(res).map(normalize);
};

export const markNotificationRead = async id => {
  const session = await getSession();
  return apiPost(
    `/driver/notifications/${id}/read`,
    {},
    { token: session?.token },
  );
};

export const markAllNotificationsRead = async () => {
  const session = await getSession();
  return apiPost(
    '/driver/notifications/read-all',
    {},
    { token: session?.token },
  );
};
