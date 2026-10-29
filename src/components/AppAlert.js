import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { createScaler } from '../utils/responsive';

// ============================================================
// THEMED ALERT
// ------------------------------------------------------------
// Drop-in replacement for React Native's Alert.alert that uses
// the app's colors instead of the plain system dialog.
//
//   showAlert(title, message, buttons, options)
//
// Same arguments as Alert.alert. Extra options:
//   type -> 'success' | 'error' | 'warning' | 'info' | 'confirm'
//           (picks the icon + accent color; a destructive button
//            makes it 'confirm' when no type is given)
//
//   confirmAlert(title, message, options) -> Promise<boolean>
//
// <AppAlertHost /> is rendered once in AppNavigator. Alerts
// raised while one is open are queued and shown in order.
// ============================================================

const DESIGN_WIDTH = 412;
const { rs, fs } = createScaler(DESIGN_WIDTH);

const COLORS = {
  RED: '#E92025',
  GREEN: '#078B53',
  AMBER: '#B86E00',
  BLUE: '#2563EB',
  DARK: '#131B2E',
  MUTED: '#5C403C',
  BORDER: '#E6BDB8',
  CARD: '#FFFFFF',
};

const TYPES = {
  success: { icon: '✓', color: COLORS.GREEN, tint: '#E8F7EE' },
  error: { icon: '!', color: COLORS.RED, tint: '#FFDAD6' },
  warning: { icon: '!', color: COLORS.AMBER, tint: '#FFF1D6' },
  info: { icon: 'i', color: COLORS.BLUE, tint: '#E3ECFF' },
  confirm: { icon: '?', color: COLORS.RED, tint: '#FFDAD6' },
};

let enqueue = null;
const pending = [];

export const showAlert = (title, message, buttons, options = {}) => {
  const alert = { title, message, buttons, options };
  if (enqueue) {
    enqueue(alert);
  } else {
    // Host not mounted yet (e.g. very early push) - show once it is
    pending.push(alert);
  }
};

// Two-button question that resolves true (confirm) / false (cancel,
// back button or tap outside):
//   if (await confirmAlert('Title', 'Message', { confirmText: 'Allow' })) ...
export const confirmAlert = (
  title,
  message,
  { confirmText = 'OK', cancelText = 'Cancel', type = 'info' } = {},
) =>
  new Promise(resolve =>
    showAlert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, onPress: () => resolve(true) },
      ],
      { type },
    ),
  );

const resolveType = (buttons, options) => {
  if (options.type && TYPES[options.type]) {
    return options.type;
  }
  if (buttons.some(b => b.style === 'destructive')) {
    return 'confirm';
  }
  return 'info';
};

export const AppAlertHost = () => {
  const [queue, setQueue] = useState([]);
  const [visible, setVisible] = useState(false);
  const closing = useRef(false);

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    enqueue = alert => setQueue(q => [...q, alert]);
    if (pending.length) {
      setQueue(q => [...q, ...pending.splice(0)]);
    }
    return () => {
      enqueue = null;
    };
  }, []);

  const current = queue[0];

  useEffect(() => {
    if (!current) {
      return;
    }
    closing.current = false;
    fade.setValue(0);
    scale.setValue(0.9);
    setVisible(true);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [current, fade, scale]);

  // Animate out, then run the button's handler so navigation
  // doesn't fight with the closing modal
  const close = useCallback(
    onDone => {
      if (closing.current) {
        return;
      }
      closing.current = true;
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 140,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        setQueue(q => q.slice(1));
        onDone?.();
      });
    },
    [fade, scale],
  );

  if (!current) {
    return null;
  }

  const { title, message, options } = current;
  const buttons = current.buttons?.length ? current.buttons : [{ text: 'OK' }];
  const theme = TYPES[resolveType(buttons, options)];

  const cancelButton = buttons.find(b => b.style === 'cancel');
  // Only dismissable from outside when that can't skip a required action
  const cancelable =
    options.cancelable !== false &&
    (!current.buttons?.length || !!cancelButton);

  const dismiss = () => {
    if (cancelable) {
      close(cancelButton?.onPress || options.onDismiss);
    }
  };

  const stacked = buttons.length > 2;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />

        <Animated.View
          style={[styles.card, { opacity: fade, transform: [{ scale }] }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: theme.tint }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.color }]}>
              <Text style={styles.iconText}>{theme.icon}</Text>
            </View>
          </View>

          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={[styles.buttons, stacked && styles.buttonsStacked]}>
            {buttons.map((button, index) => {
              const isCancel = button.style === 'cancel';
              const filledColor =
                button.style === 'destructive' ? COLORS.RED : theme.color;

              return (
                <TouchableOpacity
                  key={`${button.text}-${index}`}
                  activeOpacity={0.85}
                  onPress={() => close(button.onPress)}
                  style={[
                    styles.button,
                    !stacked && styles.buttonFlex,
                    !stacked && index > 0 && styles.buttonGap,
                    stacked && index > 0 && styles.buttonStackGap,
                    isCancel
                      ? styles.buttonOutline
                      : { backgroundColor: filledColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isCancel && styles.buttonTextOutline,
                    ]}
                    numberOfLines={1}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: rs(28),

    backgroundColor: 'rgba(19, 27, 46, 0.55)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 380,
    paddingTop: rs(24),
    paddingHorizontal: rs(20),
    paddingBottom: rs(20),

    backgroundColor: COLORS.CARD,
    borderRadius: rs(22),

    alignItems: 'center',

    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  // ICON
  iconWrap: {
    width: rs(68),
    height: rs(68),
    borderRadius: rs(34),

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: rs(14),
  },

  iconCircle: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    color: '#FFFFFF',
    fontSize: fs(22),
    fontWeight: '900',
  },

  // TEXT
  title: {
    color: COLORS.DARK,
    fontSize: fs(19),
    fontWeight: '800',
    textAlign: 'center',
  },

  message: {
    color: COLORS.MUTED,
    fontSize: fs(14),
    lineHeight: fs(20),
    marginTop: rs(8),
    textAlign: 'center',
  },

  // BUTTONS
  buttons: {
    width: '100%',
    flexDirection: 'row',
    marginTop: rs(22),
  },

  buttonsStacked: {
    flexDirection: 'column',
  },

  button: {
    height: rs(50),
    paddingHorizontal: rs(12),

    borderRadius: rs(14),

    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonFlex: {
    flex: 1,
  },

  buttonGap: {
    marginLeft: rs(10),
  },

  buttonStackGap: {
    marginTop: rs(10),
  },

  buttonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: fs(15),
    fontWeight: '800',
  },

  buttonTextOutline: {
    color: COLORS.DARK,
  },
});
