import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { showAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';
import { clearSession } from '../api/session';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notifications';
import { subscribeToPushes } from '../notifications/push';
import AppHeader from '../components/AppHeader';

// ============================================================
// NOTIFICATIONS
// ------------------------------------------------------------
// GET /driver/notifications. Reloads on focus, on pull-to-refresh
// and whenever a push notification arrives while it's open.
// Tapping a card opens it in a popup and marks it read; the bar
// above the list marks everything read. Read state is updated
// locally straight away, the API call runs in the background.
// ============================================================

const DESIGN_WIDTH = 412;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#EC2027';
const DARK = '#111827';
const MUTED = '#64748B';
const BG = '#F7F9FC';

// "2026-10-14T09:30:00Z" -> "5 min ago" / "3 h ago" / "12 Oct 2026"
const timeAgo = value => {
  const date = new Date(value);
  if (!value || isNaN(date.getTime())) {
    return '';
  }
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  if (minutes < 60 * 24) {
    return `${Math.floor(minutes / 60)} h ago`;
  }
  if (minutes < 60 * 24 * 7) {
    return `${Math.floor(minutes / (60 * 24))} d ago`;
  }
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// "2026-10-14T09:30:00Z" -> "14 Oct 2026, 7:30 pm"
const fullDate = value => {
  const date = new Date(value);
  if (!value || isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const NotificationsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await fetchNotifications());
      setError(null);
    } catch (e) {
      if (e.status === 401) {
        await clearSession().catch(() => {});
        showAlert('Session expired', 'Please log in again.', [], {
          type: 'warning',
        });
        navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
        return;
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => subscribeToPushes(() => load()), [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const [selected, setSelected] = useState(null);
  const unreadCount = items.filter(item => !item.read).length;

  const openItem = item => {
    setSelected(item);
    if (!item.read) {
      setItems(list =>
        list.map(n => (n.id === item.id ? { ...n, read: true } : n)),
      );
      markNotificationRead(item.id).catch(() => {});
    }
  };

  const markAllRead = () => {
    if (!unreadCount) {
      return;
    }
    setItems(list => list.map(n => ({ ...n, read: true })));
    markAllNotificationsRead().catch(() => {});
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openItem(item)}
      style={[styles.card, !item.read && styles.cardUnread]}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>🔔</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {!item.read ? <View style={styles.unreadDot} /> : null}
        </View>

        {item.body ? (
          <Text style={styles.cardText} numberOfLines={2}>
            {item.body}
          </Text>
        ) : null}

        {item.createdAt ? (
          <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () =>
    loading ? (
      <ActivityIndicator color={RED} style={styles.loader} />
    ) : (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>{error ? '⚠' : '🔕'}</Text>
        <Text style={styles.emptyTitle}>
          {error ? 'Could not load notifications' : 'No notifications yet'}
        </Text>
        <Text style={styles.emptyText}>
          {error || 'New dispatches and updates will show up here.'}
        </Text>
        {error ? (
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <AppHeader onBack={() => navigation.goBack()} title="Notifications" />

      {items.length ? (
        <View style={styles.toolbar}>
          <Text style={styles.toolbarText}>
            {unreadCount ? `${unreadCount} unread` : 'All caught up'}
          </Text>
          <TouchableOpacity
            onPress={markAllRead}
            disabled={!unreadCount}
            activeOpacity={0.85}
            style={[styles.markAllButton, !unreadCount && styles.disabled]}
          >
            <Text style={styles.markAllText}>✓ Mark all as read</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        style={styles.list}
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[RED]}
            tintColor={RED}
          />
        }
      />

      <Modal
        transparent
        visible={!!selected}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelected(null)}
          />

          {selected ? (
            <View style={styles.modalCard}>
              <View style={styles.modalIconWrap}>
                <View style={styles.modalIconCircle}>
                  <Text style={styles.modalIcon}>🔔</Text>
                </View>
              </View>

              <Text style={styles.modalTitle}>{selected.title}</Text>

              {selected.createdAt ? (
                <Text style={styles.modalTime}>
                  {fullDate(selected.createdAt)}
                </Text>
              ) : null}

              {selected.body ? (
                <ScrollView
                  style={styles.modalBodyScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.modalBody}>{selected.body}</Text>
                </ScrollView>
              ) : null}

              <TouchableOpacity
                style={styles.modalButton}
                activeOpacity={0.85}
                onPress={() => setSelected(null)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: rs(64),
    paddingHorizontal: rs(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },

  backButton: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: '#F1F4F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(12),
  },

  backText: {
    color: DARK,
    fontSize: fs(20),
    fontWeight: '700',
  },

  headerTitle: {
    color: DARK,
    fontSize: fs(20),
    fontWeight: '900',
  },

  list: {
    flex: 1,
    backgroundColor: BG,
  },

  // MARK ALL BAR
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: rs(10),
    backgroundColor: BG,
  },

  toolbarText: {
    color: MUTED,
    fontSize: fs(13),
    fontWeight: '700',
  },

  markAllButton: {
    height: rs(36),
    paddingHorizontal: rs(14),
    borderRadius: rs(18),
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabled: {
    opacity: 0.45,
  },

  markAllText: {
    color: '#FFFFFF',
    fontSize: fs(13),
    fontWeight: '800',
  },

  // DETAIL POPUP (same look as AppAlert)
  backdrop: {
    flex: 1,
    padding: rs(28),
    backgroundColor: 'rgba(19, 27, 46, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    paddingTop: rs(24),
    paddingHorizontal: rs(20),
    paddingBottom: rs(20),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(22),
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  modalIconWrap: {
    width: rs(68),
    height: rs(68),
    borderRadius: rs(34),
    backgroundColor: '#FFE9E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rs(14),
  },

  modalIconCircle: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalIcon: {
    fontSize: fs(20),
  },

  modalTitle: {
    color: DARK,
    fontSize: fs(19),
    fontWeight: '800',
    textAlign: 'center',
  },

  modalTime: {
    color: '#8291A9',
    fontSize: fs(12),
    fontWeight: '600',
    marginTop: rs(4),
  },

  modalBodyScroll: {
    alignSelf: 'stretch',
    flexGrow: 0,
    marginTop: rs(12),
  },

  modalBody: {
    color: MUTED,
    fontSize: fs(14),
    lineHeight: fs(21),
    textAlign: 'center',
  },

  modalButton: {
    alignSelf: 'stretch',
    height: rs(50),
    marginTop: rs(22),
    borderRadius: rs(14),
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontSize: fs(15),
    fontWeight: '800',
  },

  listContent: {
    flexGrow: 1,
    padding: rs(16),
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    padding: rs(14),
    marginBottom: rs(12),
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: RED,
  },

  iconWrap: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(12),
    backgroundColor: '#FFE9E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(12),
  },

  icon: {
    fontSize: fs(18),
  },

  cardBody: {
    flex: 1,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  cardTitle: {
    flex: 1,
    color: DARK,
    fontSize: fs(15),
    fontWeight: '800',
  },

  unreadDot: {
    width: rs(9),
    height: rs(9),
    borderRadius: rs(5),
    backgroundColor: RED,
    marginLeft: rs(8),
    marginTop: rs(5),
  },

  cardText: {
    color: MUTED,
    fontSize: fs(13),
    lineHeight: fs(19),
    marginTop: rs(4),
  },

  cardTime: {
    color: '#8291A9',
    fontSize: fs(11),
    fontWeight: '600',
    marginTop: rs(8),
  },

  loader: {
    marginTop: rs(80),
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(30),
  },

  emptyIcon: {
    fontSize: fs(40),
  },

  emptyTitle: {
    color: DARK,
    fontSize: fs(17),
    fontWeight: '900',
    marginTop: rs(12),
    textAlign: 'center',
  },

  emptyText: {
    color: MUTED,
    fontSize: fs(13),
    lineHeight: fs(19),
    marginTop: rs(6),
    textAlign: 'center',
  },

  retryButton: {
    marginTop: rs(16),
    paddingHorizontal: rs(24),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: fs(14),
    fontWeight: '800',
  },
});
