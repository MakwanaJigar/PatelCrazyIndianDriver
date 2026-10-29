import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  PanResponder,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '../components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import { createScaler } from '../utils/responsive';
import AppHeader from '../components/AppHeader';
import { openInMaps, startRouteNavigation } from '../components/RouteMap';
import {
  ORDER_STATUS,
  PICKUP_LOCATION,
  useOrder,
  useOrders,
  itemCount,
  markDelivered,
} from '../data/orders';
import { useSmartRoute } from '../data/useSmartRoute';

// ============================================================
// ORDER DETAILS
// ------------------------------------------------------------
// Everything about one order (customer, route, items, notes,
// progress) plus proof of delivery. "Navigate" opens Google Maps
// with every pending delivery as a stop, nearest first (the Smart
// Route), not just this order.
//
// Proof of delivery:
//
//   1. Driver takes a photo with the CAMERA (no gallery option)
//   2. Driver slides "Slide to mark delivered"
//   3. Order is marked delivered with the photo attached
//
// Opened with navigation.navigate(ROUTES.ORDER_DETAILS, { orderId })
// ============================================================

const DESIGN_WIDTH = 412;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const RED = '#E92025';
const GREEN = '#078B53';
const DARK = '#111827';
const MUTED = '#61708B';
const BG = '#F7F9FC';

const KNOB_SIZE = rs(56);
const SLIDER_PADDING = rs(4);

const getInitials = name =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const OrderDetailsScreen = ({ navigation, route }) => {
  const order = useOrder(route.params?.orderId);
  const orders = useOrders();
  const pendingOrders = useMemo(
    () => orders.filter(o => o.status !== 'delivered'),
    [orders],
  );
  const smartRoute = useSmartRoute(pendingOrders);

  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Order not found</Text>
          <TouchableOpacity
            style={styles.notFoundButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = ORDER_STATUS[order.status];
  const isDelivered = order.status === 'delivered';
  const isReady = order.status === 'ready';

  // Camera only - launchCamera never offers the photo library
  const takePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.7,
        maxWidth: 1600,
        maxHeight: 1600,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode === 'permission') {
        showAlert(
          'Camera access needed',
          'Allow camera access in your phone settings to take the delivery photo.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
          { type: 'warning' },
        );
        return;
      }

      if (result.errorCode) {
        showAlert(
          'Camera unavailable',
          result.errorCode === 'camera_unavailable'
            ? 'No camera was found on this device.'
            : result.errorMessage || 'Could not open the camera.',
          [],
          { type: 'error' },
        );
        return;
      }

      const asset = result.assets?.[0];
      if (asset?.uri) {
        setPhoto(asset);
      }
    } catch (e) {
      // Usually means the app was not rebuilt after installing
      // react-native-image-picker, so its native module is missing.
      console.warn('launchCamera failed:', e);
      showAlert(
        'Camera error',
        'Could not open the camera. Please make sure the app is up to date and try again.',
        [],
        { type: 'error' },
      );
    }
  };

  const confirmDelivery = async () => {
    setSubmitting(true);
    try {
      await markDelivered(order.id, photo);
      showAlert(
        'Order delivered',
        `${order.id} has been marked as delivered successfully.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }],
        { type: 'success' },
      );
    } catch (e) {
      showAlert(
        'Could not mark delivered',
        e.message || 'Please try again.',
        [],
        { type: 'error' },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const callCustomer = () =>
    Linking.openURL(`tel:${order.phone.replace(/\s/g, '')}`).catch(() =>
      showAlert(
        'Unable to call',
        'Calling is not supported on this device.',
        [],
        { type: 'error' },
      ),
    );

  // All pending deliveries as stops, nearest first. Falls back to
  // this address alone if the route isn't planned yet, the order is
  // delivered, or its address couldn't be placed on the map.
  const openMaps = () => {
    const stops = smartRoute.route?.stops ?? [];
    if (!isDelivered && stops.some(s => s.order.id === order.id)) {
      startRouteNavigation(stops);
      return;
    }
    openInMaps(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        order.address,
      )}`,
    );
  };

  const deliveredPhotoUri = order.deliveryPhoto;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ====================================================
          HEADER
      ==================================================== */}

      <AppHeader
        onBack={() => navigation.goBack()}
        title="Order Details"
        subtitle={order.id}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ====================================================
            STATUS HERO
        ==================================================== */}

        <View style={[styles.statusHero, { backgroundColor: status.color }]}>
          <View style={styles.heroCircleLarge} />

          <View style={styles.statusHeroIcon}>
            <Text style={[styles.statusHeroIconText, { color: status.color }]}>
              {status.icon}
            </Text>
          </View>

          <View style={styles.statusHeroText}>
            <Text style={styles.statusHeroLabel}>ORDER STATUS</Text>
            <Text style={styles.statusHeroValue}>{status.label}</Text>
            <Text style={styles.statusHeroMeta}>
              {isDelivered && order.deliveredAt
                ? `Delivered at ${order.deliveredAt}`
                : `Placed at ${order.time} • ${order.distance}`}
            </Text>
          </View>
        </View>

        {/* ====================================================
            CUSTOMER
        ==================================================== */}

        <Card title="Customer" icon="♙">
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(order.customer)}
              </Text>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{order.customer}</Text>
              <Text style={styles.customerPhone}>{order.phone}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.callButton]}
              onPress={callCustomer}
            >
              <Text style={styles.callButtonText}>✆ Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.actionButton, styles.navigateButton]}
              onPress={openMaps}
            >
              <Text style={styles.navigateButtonText}>➤ Navigate</Text>
            </TouchableOpacity>
          </View>

          {order.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>DELIVERY NOTE</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          ) : null}
        </Card>

        {/* ====================================================
            ROUTE
        ==================================================== */}

        <Card title="Route" icon="◎" right={order.distance}>
          <View style={styles.routeStop}>
            <View style={styles.routeMarkerCol}>
              <View style={[styles.routeDot, styles.routeDotPickup]} />
              <View style={styles.routeLine} />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routeLabel}>PICKUP</Text>
              <Text style={styles.routeValue}>{PICKUP_LOCATION}</Text>
            </View>
          </View>

          <View style={styles.routeStop}>
            <View style={styles.routeMarkerCol}>
              <View style={[styles.routeDot, styles.routeDotDrop]} />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routeLabel}>DROP</Text>
              <Text style={styles.routeValue}>{order.address}</Text>
            </View>
          </View>
        </Card>

        {/* ====================================================
            ITEMS
        ==================================================== */}

        <Card
          title="Items"
          icon="🛍"
          right={`${itemCount(order)} ${
            itemCount(order) === 1 ? 'item' : 'items'
          }`}
        >
          {order.items.map((item, index) => (
            <View
              key={`${item.name}-${index}`}
              style={[
                styles.itemRow,
                index === order.items.length - 1 && styles.itemRowLast,
              ]}
            >
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{item.qty}×</Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
          ))}
        </Card>

        {/* ====================================================
            PROGRESS
        ==================================================== */}

        <Card title="Progress" icon="◴">
          <TimelineStep title="Order placed" subtitle={order.time} done />
          <TimelineStep
            title="Ready for dispatch"
            subtitle={order.status === 'pending' ? 'Being prepared' : 'Packed'}
            done={order.status !== 'pending'}
          />
          <TimelineStep
            title="Delivered"
            subtitle={isDelivered ? order.deliveredAt : 'Awaiting delivery'}
            done={isDelivered}
            last
          />
        </Card>

        {/* ====================================================
            PROOF OF DELIVERY
        ==================================================== */}

        <Card title="Proof of Delivery" icon="📷">
          {isDelivered ? (
            deliveredPhotoUri ? (
              <Image source={{ uri: deliveredPhotoUri }} style={styles.photo} />
            ) : (
              <View style={styles.deliveredBox}>
                <Text style={styles.deliveredBoxText}>
                  ✓ Delivered at {order.deliveredAt}
                </Text>
              </View>
            )
          ) : !isReady ? (
            <View style={styles.lockedBox}>
              <Text style={styles.lockedTitle}>Order is being prepared</Text>
              <Text style={styles.lockedText}>
                You can take the delivery photo once the order is ready for
                dispatch.
              </Text>
            </View>
          ) : photo ? (
            <View>
              <Image source={{ uri: photo.uri }} style={styles.photo} />

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.retakeButton}
                onPress={takePhoto}
                disabled={submitting}
              >
                <Text style={styles.retakeText}>↻ Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.cameraButton}
              onPress={takePhoto}
            >
              <View style={styles.cameraIconCircle}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
              <Text style={styles.cameraTitle}>Take Delivery Photo</Text>
              <Text style={styles.cameraSubtitle}>
                Photograph the order at the customer's door
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </ScrollView>

      {/* ====================================================
          SLIDE TO DELIVER
      ==================================================== */}

      {isReady ? (
        <View style={styles.footer}>
          {submitting ? (
            <View style={[styles.sliderTrack, styles.sliderSubmitting]}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.sliderSubmittingText}>
                Marking delivered...
              </Text>
            </View>
          ) : (
            <SlideToConfirm
              key={photo ? photo.uri : 'locked'}
              disabled={!photo}
              label={
                photo ? 'Slide to mark delivered' : 'Take a photo to unlock'
              }
              onComplete={confirmDelivery}
            />
          )}
        </View>
      ) : null}
    </SafeAreaView>
  );
};

/* ============================================================
   COMPONENTS
============================================================ */

const Card = ({ title, icon, right, children }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleRow}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>

      {right ? <Text style={styles.cardRight}>{right}</Text> : null}
    </View>

    {children}
  </View>
);

const TimelineStep = ({ title, subtitle, done, last }) => (
  <View style={styles.timelineStep}>
    <View style={styles.timelineMarkerCol}>
      <View style={[styles.timelineDot, done && styles.timelineDotDone]}>
        {done ? <Text style={styles.timelineCheck}>✓</Text> : null}
      </View>
      {!last ? (
        <View style={[styles.timelineLine, done && styles.timelineLineDone]} />
      ) : null}
    </View>

    <View style={styles.timelineTextCol}>
      <Text style={[styles.timelineTitle, !done && styles.timelineTitleTodo]}>
        {title}
      </Text>
      <Text style={styles.timelineSubtitle}>{subtitle}</Text>
    </View>
  </View>
);

// Drag the knob to the end to confirm. Springs back if released early.
const SlideToConfirm = ({ label, disabled, onComplete }) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const maxX = Math.max(trackWidth - KNOB_SIZE - SLIDER_PADDING * 2, 0);

  // Keep the latest values for the PanResponder callbacks
  const stateRef = useRef({});
  stateRef.current = { maxX, disabled, onComplete };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !stateRef.current.disabled,
      onMoveShouldSetPanResponder: () => !stateRef.current.disabled,
      onPanResponderTerminationRequest: () => false,

      onPanResponderMove: (_, g) => {
        const x = Math.min(Math.max(g.dx, 0), stateRef.current.maxX);
        translateX.setValue(x);
      },

      onPanResponderRelease: (_, g) => {
        const { maxX: max, onComplete: done } = stateRef.current;
        if (max > 0 && g.dx >= max * 0.85) {
          Animated.timing(translateX, {
            toValue: max,
            duration: 120,
            useNativeDriver: true,
          }).start(() => done());
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const labelOpacity = translateX.interpolate({
    inputRange: [0, Math.max(maxX * 0.6, 1)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // A full-length fill that slides in behind the knob (transform only,
  // so it can run on the native driver like the knob itself)
  const fillTranslate = Animated.add(translateX, -maxX);

  return (
    <View
      style={[styles.sliderTrack, disabled && styles.sliderTrackDisabled]}
      onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {!disabled ? (
        <Animated.View
          style={[
            styles.sliderFill,
            {
              width: maxX + KNOB_SIZE,
              transform: [{ translateX: fillTranslate }],
            },
          ]}
        />
      ) : null}

      <Animated.Text
        style={[
          styles.sliderLabel,
          disabled && styles.sliderLabelDisabled,
          { opacity: labelOpacity },
        ]}
      >
        {disabled ? '🔒 ' : ''}
        {label}
        {disabled ? '' : '  »'}
      </Animated.Text>

      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.sliderKnob,
          disabled && styles.sliderKnobDisabled,
          { transform: [{ translateX }] },
        ]}
      >
        <Text
          style={[
            styles.sliderKnobText,
            disabled && styles.sliderKnobTextDisabled,
          ]}
        >
          ➜
        </Text>
      </Animated.View>
    </View>
  );
};

export default OrderDetailsScreen;

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollContent: {
    padding: rs(18),
    paddingBottom: rs(30),
  },

  /* HEADER */

  header: {
    height: rs(68),

    backgroundColor: '#FFFFFF',

    borderBottomLeftRadius: rs(22),
    borderBottomRightRadius: rs(22),

    paddingHorizontal: rs(14),

    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
    zIndex: 1,
  },

  backButton: {
    width: rs(42),
    height: rs(42),

    borderRadius: rs(21),

    backgroundColor: '#F1F4F9',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(12),
  },

  backText: {
    color: DARK,

    fontSize: fs(22),
    fontWeight: '700',
  },

  headerTitles: {
    flex: 1,
  },

  headerTitle: {
    color: DARK,

    fontSize: fs(19),
    fontWeight: '900',
  },

  headerSubtitle: {
    color: RED,

    fontSize: fs(13),
    fontWeight: '800',

    marginTop: rs(1),
  },

  /* STATUS HERO */

  statusHero: {
    borderRadius: rs(20),

    padding: rs(18),

    flexDirection: 'row',
    alignItems: 'center',

    overflow: 'hidden',

    elevation: 6,
  },

  heroCircleLarge: {
    position: 'absolute',
    top: -rs(60),
    right: -rs(40),

    width: rs(170),
    height: rs(170),

    borderRadius: rs(85),

    backgroundColor: 'rgba(255,255,255,0.12)',
  },

  statusHeroIcon: {
    width: rs(54),
    height: rs(54),

    borderRadius: rs(27),

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(14),
  },

  statusHeroIconText: {
    fontSize: fs(24),
    fontWeight: '900',
  },

  statusHeroText: {
    flex: 1,
  },

  statusHeroLabel: {
    color: 'rgba(255,255,255,0.85)',

    fontSize: fs(11),
    fontWeight: '800',

    letterSpacing: 1,
  },

  statusHeroValue: {
    color: '#FFFFFF',

    fontSize: fs(22),
    fontWeight: '900',

    marginTop: rs(2),
  },

  statusHeroMeta: {
    color: 'rgba(255,255,255,0.92)',

    fontSize: fs(12),
    fontWeight: '700',

    marginTop: rs(3),
  },

  /* CARD */

  card: {
    marginTop: rs(14),

    backgroundColor: '#FFFFFF',

    borderRadius: rs(18),

    padding: rs(16),

    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },

    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: rs(12),
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardIcon: {
    width: rs(32),
    height: rs(32),

    borderRadius: rs(10),

    backgroundColor: '#FFF0F0',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(10),
  },

  cardIconText: {
    color: RED,

    fontSize: fs(15),
    fontWeight: '900',
  },

  cardTitle: {
    color: DARK,

    fontSize: fs(16),
    fontWeight: '900',
  },

  cardRight: {
    color: MUTED,

    fontSize: fs(13),
    fontWeight: '800',
  },

  /* CUSTOMER */

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: rs(52),
    height: rs(52),

    borderRadius: rs(26),

    backgroundColor: '#FFF0F0',

    borderWidth: 2,
    borderColor: RED,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(12),
  },

  avatarText: {
    color: RED,

    fontSize: fs(17),
    fontWeight: '900',
  },

  customerInfo: {
    flex: 1,
  },

  customerName: {
    color: DARK,

    fontSize: fs(18),
    fontWeight: '900',
  },

  customerPhone: {
    color: MUTED,

    fontSize: fs(14),
    fontWeight: '600',

    marginTop: rs(2),
  },

  actionRow: {
    flexDirection: 'row',

    marginTop: rs(14),
  },

  actionButton: {
    flex: 1,

    height: rs(46),

    borderRadius: rs(12),

    alignItems: 'center',
    justifyContent: 'center',
  },

  callButton: {
    backgroundColor: '#E6F9F1',

    borderWidth: 1,
    borderColor: '#A9EBCB',

    marginRight: rs(10),
  },

  callButtonText: {
    color: GREEN,

    fontSize: fs(15),
    fontWeight: '900',
  },

  navigateButton: {
    backgroundColor: '#EBF0FF',

    borderWidth: 1,
    borderColor: '#C3D1FA',
  },

  navigateButtonText: {
    color: '#2F5BD3',

    fontSize: fs(15),
    fontWeight: '900',
  },

  notesBox: {
    marginTop: rs(14),

    backgroundColor: '#FFF8E8',

    borderLeftWidth: 4,
    borderLeftColor: '#E39800',

    borderRadius: rs(10),

    padding: rs(12),
  },

  notesLabel: {
    color: '#A86B00',

    fontSize: fs(10),
    fontWeight: '900',

    letterSpacing: 1,
  },

  notesText: {
    color: '#4A3A1A',

    fontSize: fs(14),
    fontWeight: '600',

    marginTop: rs(3),
  },

  /* ROUTE */

  routeStop: {
    flexDirection: 'row',
  },

  routeMarkerCol: {
    width: rs(18),

    alignItems: 'center',

    marginRight: rs(10),
  },

  routeDot: {
    width: rs(14),
    height: rs(14),

    borderRadius: rs(7),

    marginTop: rs(3),
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

    paddingBottom: rs(12),
  },

  routeLabel: {
    color: MUTED,

    fontSize: fs(10),
    fontWeight: '800',

    letterSpacing: 1,
  },

  routeValue: {
    color: DARK,

    fontSize: fs(14),
    fontWeight: '700',

    marginTop: rs(2),
  },

  /* ITEMS */

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: rs(10),

    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },

  itemRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  qtyBadge: {
    minWidth: rs(38),

    paddingVertical: rs(5),

    borderRadius: rs(8),

    backgroundColor: '#F1F4F9',

    alignItems: 'center',

    marginRight: rs(12),
  },

  qtyText: {
    color: RED,

    fontSize: fs(13),
    fontWeight: '900',
  },

  itemName: {
    flex: 1,

    color: DARK,

    fontSize: fs(14),
    fontWeight: '700',
  },

  /* TIMELINE */

  timelineStep: {
    flexDirection: 'row',
  },

  timelineMarkerCol: {
    width: rs(24),

    alignItems: 'center',

    marginRight: rs(12),
  },

  timelineDot: {
    width: rs(24),
    height: rs(24),

    borderRadius: rs(12),

    backgroundColor: '#FFFFFF',

    borderWidth: 2,
    borderColor: '#C9D2DE',

    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineDotDone: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  timelineCheck: {
    color: '#FFFFFF',

    fontSize: fs(12),
    fontWeight: '900',
  },

  timelineLine: {
    flex: 1,

    width: 2,

    minHeight: rs(18),

    backgroundColor: '#DCE3EC',

    marginVertical: rs(2),
  },

  timelineLineDone: {
    backgroundColor: GREEN,
  },

  timelineTextCol: {
    flex: 1,

    paddingBottom: rs(14),
  },

  timelineTitle: {
    color: DARK,

    fontSize: fs(14),
    fontWeight: '800',
  },

  timelineTitleTodo: {
    color: '#8A97AB',
  },

  timelineSubtitle: {
    color: MUTED,

    fontSize: fs(12),

    marginTop: rs(2),
  },

  /* PROOF OF DELIVERY */

  cameraButton: {
    borderWidth: 2,
    borderColor: '#FFB5B5',
    borderStyle: 'dashed',

    borderRadius: rs(16),

    backgroundColor: '#FFF7F7',

    paddingVertical: rs(26),

    alignItems: 'center',
  },

  cameraIconCircle: {
    width: rs(64),
    height: rs(64),

    borderRadius: rs(32),

    backgroundColor: RED,

    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraIcon: {
    fontSize: fs(28),
  },

  cameraTitle: {
    color: DARK,

    fontSize: fs(16),
    fontWeight: '900',

    marginTop: rs(12),
  },

  cameraSubtitle: {
    color: MUTED,

    fontSize: fs(12),

    marginTop: rs(3),
  },

  photo: {
    width: '100%',
    height: rs(240),

    borderRadius: rs(14),

    backgroundColor: '#EEF1F5',
  },

  retakeButton: {
    marginTop: rs(10),

    height: rs(44),

    borderRadius: rs(12),

    borderWidth: 1.5,
    borderColor: RED,

    alignItems: 'center',
    justifyContent: 'center',
  },

  retakeText: {
    color: RED,

    fontSize: fs(14),
    fontWeight: '900',
  },

  lockedBox: {
    backgroundColor: '#FFF8E8',

    borderRadius: rs(12),

    padding: rs(14),
  },

  lockedTitle: {
    color: '#A86B00',

    fontSize: fs(14),
    fontWeight: '900',
  },

  lockedText: {
    color: '#5C4A26',

    fontSize: fs(13),
    lineHeight: fs(18),

    marginTop: rs(3),
  },

  deliveredBox: {
    backgroundColor: '#E6F9F1',

    borderRadius: rs(12),

    padding: rs(14),

    alignItems: 'center',
  },

  deliveredBoxText: {
    color: GREEN,

    fontSize: fs(14),
    fontWeight: '900',
  },

  /* FOOTER / SLIDER */

  footer: {
    backgroundColor: '#FFFFFF',

    paddingHorizontal: rs(18),
    paddingTop: rs(12),
    paddingBottom: rs(14),

    borderTopLeftRadius: rs(22),
    borderTopRightRadius: rs(22),

    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },

    elevation: 12,
  },

  sliderTrack: {
    height: KNOB_SIZE + SLIDER_PADDING * 2,

    borderRadius: (KNOB_SIZE + SLIDER_PADDING * 2) / 2,

    backgroundColor: GREEN,

    padding: SLIDER_PADDING,

    justifyContent: 'center',

    overflow: 'hidden',
  },

  sliderTrackDisabled: {
    backgroundColor: '#E4E8EF',
  },

  sliderSubmitting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sliderSubmittingText: {
    color: '#FFFFFF',

    fontSize: fs(15),
    fontWeight: '900',

    marginLeft: rs(10),
  },

  sliderFill: {
    position: 'absolute',
    left: SLIDER_PADDING,
    top: SLIDER_PADDING,
    bottom: SLIDER_PADDING,

    borderRadius: KNOB_SIZE / 2,

    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  sliderLabel: {
    position: 'absolute',
    left: KNOB_SIZE + SLIDER_PADDING,
    right: 0,

    color: '#FFFFFF',

    fontSize: fs(15),
    fontWeight: '900',

    textAlign: 'center',

    letterSpacing: 0.3,
  },

  sliderLabelDisabled: {
    color: '#8A97AB',
  },

  sliderKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,

    borderRadius: KNOB_SIZE / 2,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 4,
  },

  sliderKnobDisabled: {
    backgroundColor: '#F7F9FC',
  },

  sliderKnobText: {
    color: GREEN,

    fontSize: fs(22),
    fontWeight: '900',
  },

  sliderKnobTextDisabled: {
    color: '#B4BECC',
  },

  /* NOT FOUND */

  notFound: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    padding: rs(24),
  },

  notFoundTitle: {
    color: DARK,

    fontSize: fs(20),
    fontWeight: '900',
  },

  notFoundButton: {
    marginTop: rs(16),

    paddingHorizontal: rs(24),
    paddingVertical: rs(12),

    borderRadius: rs(12),

    backgroundColor: RED,
  },

  notFoundButtonText: {
    color: '#FFFFFF',

    fontSize: fs(14),
    fontWeight: '800',
  },
});
