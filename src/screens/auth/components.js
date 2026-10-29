import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createScaler } from '../../utils/responsive';

// ============================================================
// SHARED AUTH UI
// ------------------------------------------------------------
// Building blocks used by Login / Register / Forgot Password /
// OTP / Reset Password so every auth screen looks the same.
// ============================================================

const DESIGN_WIDTH = 412;
export const { rs, fs } = createScaler(DESIGN_WIDTH);

export const COLORS = {
  RED: '#E92025',
  GREEN: '#078B53',
  DARK: '#131B2E',
  MUTED: '#5C403C',
  BORDER: '#E6BDB8',
  SURFACE: '#FAF8FF',
  ERROR: '#BA1A1A',
  PLACEHOLDER: '#9A8A88',
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Screen shell: safe area + keyboard handling + scroll + optional back.
// `centered` vertically centers the content when it fits on screen.
// `header` replaces the plain back arrow (e.g. the app's AppHeader)
export const AuthScreen = ({
  children,
  onBack,
  header,
  scrollRef,
  centered,
}) => {
  const keyboardHeight = useKeyboardHeight();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.SURFACE} />

      {header ? (
        header
      ) : onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      ) : null}

      {/* Edge-to-edge is enabled on Android, so the window no longer resizes
          for the keyboard (adjustResize is ignored). Instead of shrinking the
          ScrollView (KeyboardAvoidingView), extend its content by the keyboard
          height so everything above the keyboard can still be scrolled to. */}
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          centered && styles.centered,
          keyboardHeight > 0 && {
            paddingBottom: styles.content.paddingBottom + keyboardHeight,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === 'ios' ? 'interactive' : 'on-drag'
        }
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

// Current on-screen keyboard height (0 when hidden)
const useKeyboardHeight = () => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e =>
      setHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
};

// Centered logo + eyebrow / title / subtitle
export const AuthHeader = ({ eyebrow, title, subtitle }) => (
  <View style={styles.header}>
    <Image
      source={require('../../assets/logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
    {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
    {title ? <Text style={styles.title}>{title}</Text> : null}
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

export const AuthCard = ({ children }) => (
  <View style={styles.card}>{children}</View>
);

// Label + input + error. `secure` adds a Show/Hide toggle.
export const AuthField = ({ label, required, error, secure, ...props }) => {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.star}> *</Text> : null}
        </Text>
      ) : null}

      <View style={[styles.inputWrap, error && styles.inputError]}>
        <TextInput
          placeholderTextColor={COLORS.PLACEHOLDER}
          secureTextEntry={secure && hidden}
          style={styles.input}
          {...props}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden(v => !v)}>
            <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export const PrimaryButton = ({ title, onPress, loading, disabled }) => (
  <TouchableOpacity
    style={[styles.button, (loading || disabled) && styles.buttonDisabled]}
    onPress={onPress}
    disabled={loading || disabled}
    activeOpacity={0.85}
  >
    {loading ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text style={styles.buttonText}>{title}</Text>
    )}
  </TouchableOpacity>
);

// Red error / green success box for messages without a field
export const FormMessage = ({ error, success }) => {
  if (!error && !success) {
    return null;
  }
  return (
    <View style={[styles.message, success && !error && styles.messageOk]}>
      <Text style={[styles.messageText, success && !error && styles.okText]}>
        {error || success}
      </Text>
    </View>
  );
};

// "Question? Link" row
export const FooterLink = ({ text, linkText, onPress }) => (
  <View style={styles.footer}>
    <Text style={styles.muted}>{text}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.link}> {linkText}</Text>
    </TouchableOpacity>
  </View>
);

export const authStyles = StyleSheet.create({
  sectionTitle: {
    color: COLORS.DARK,
    fontSize: fs(16),
    fontWeight: '800',
    marginTop: rs(18),
    marginBottom: rs(10),
  },

  row: {
    flexDirection: 'row',
    marginHorizontal: -rs(6),
  },

  half: {
    flex: 1,
    paddingHorizontal: rs(6),
  },

  link: {
    color: COLORS.RED,
    fontSize: fs(13),
    fontWeight: '800',
  },

  muted: {
    color: COLORS.MUTED,
    fontSize: fs(13),
  },

  checkbox: {
    width: rs(20),
    height: rs(20),

    borderRadius: rs(5),
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: rs(8),
  },

  checkboxOn: {
    backgroundColor: COLORS.RED,
    borderColor: COLORS.RED,
  },

  checkMark: {
    color: '#FFFFFF',
    fontSize: fs(12),
    fontWeight: '900',
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },

  flex: {
    flex: 1,
  },

  content: {
    padding: rs(20),
    paddingBottom: rs(40),
  },

  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  backBtn: {
    width: rs(44),
    height: rs(44),
    marginLeft: rs(8),

    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    color: COLORS.DARK,
    fontSize: fs(24),
    fontWeight: '700',
  },

  // HEADER
  header: {
    alignItems: 'center',
    marginTop: rs(8),
  },

  logo: {
    width: rs(150),
    height: rs(112),
  },

  eyebrow: {
    color: COLORS.RED,
    fontSize: fs(12),
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: rs(18),
  },

  title: {
    color: COLORS.DARK,
    fontSize: fs(28),
    fontWeight: '800',
    marginTop: rs(4),
    textAlign: 'center',
  },

  subtitle: {
    color: COLORS.MUTED,
    fontSize: fs(15),
    lineHeight: fs(21),
    marginTop: rs(6),
    textAlign: 'center',
  },

  // CARD
  card: {
    marginTop: rs(24),
    padding: rs(18),

    backgroundColor: '#FFFFFF',
    borderRadius: rs(18),

    borderWidth: 1,
    borderColor: '#F1E4E2',

    elevation: 2,
  },

  // FIELD
  field: {
    marginBottom: rs(14),
  },

  label: {
    color: COLORS.MUTED,
    fontSize: fs(13),
    fontWeight: '700',
    marginBottom: rs(6),
  },

  star: {
    color: COLORS.RED,
  },

  inputWrap: {
    height: rs(52),
    paddingHorizontal: rs(14),

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },

  inputError: {
    borderColor: COLORS.ERROR,
    backgroundColor: '#FFF6F5',
  },

  input: {
    flex: 1,
    height: '100%',
    padding: 0,

    color: COLORS.DARK,
    fontSize: fs(15),
  },

  toggle: {
    color: COLORS.RED,
    fontSize: fs(13),
    fontWeight: '700',
    paddingLeft: rs(10),
  },

  errorText: {
    color: COLORS.ERROR,
    fontSize: fs(12),
    marginTop: rs(4),
  },

  // BUTTON
  button: {
    height: rs(56),
    marginTop: rs(18),

    borderRadius: rs(14),
    backgroundColor: COLORS.RED,

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: fs(16),
    fontWeight: '800',
  },

  // MESSAGE
  message: {
    marginTop: rs(12),
    padding: rs(10),

    borderRadius: rs(10),
    backgroundColor: '#FFDAD6',
  },

  messageOk: {
    backgroundColor: '#E8F7EE',
  },

  messageText: {
    color: '#93000A',
    fontSize: fs(13),
    fontWeight: '600',
    textAlign: 'center',
  },

  okText: {
    color: COLORS.GREEN,
  },

  // FOOTER
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rs(22),
  },

  muted: {
    color: COLORS.MUTED,
    fontSize: fs(13),
  },

  link: {
    color: COLORS.RED,
    fontSize: fs(13),
    fontWeight: '800',
  },
});
