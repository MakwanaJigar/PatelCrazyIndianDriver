import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ROUTES } from '../../navigation/routes';
import { apiPost, firstFieldErrors } from '../../api/client';
import { saveSession } from '../../api/session';
import { getFcmToken } from '../../notifications/push';
import {
  AuthScreen,
  AuthHeader,
  AuthCard,
  AuthField,
  PrimaryButton,
  FormMessage,
  FooterLink,
  authStyles,
  rs,
  fs,
  COLORS,
  EMAIL_RE,
} from './components';

// ============================================================
// LOGIN
// POST /driver/login  { email, password, fcm_token }
// fcm_token lets the backend send push notifications to this
// device (null if Firebase couldn't provide one).
// ============================================================

// The success response shape isn't documented yet, so look for the
// token / driver object in the usual Laravel places.
const parseLoginResponse = res => {
  const data = res.data || {};
  return {
    token:
      res.token || res.access_token || data.token || data.access_token || null,
    driver: data.driver || data.user || res.driver || res.user || data,
  };
};

const LoginScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) {
      next.email = 'Email is required.';
    } else if (!EMAIL_RE.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!password) {
      next.password = 'Password is required.';
    }
    return next;
  };

  const handleLogin = async () => {
    const localErrors = validate();
    setErrors(localErrors);
    if (Object.keys(localErrors).length) {
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost('/driver/login', {
        email: email.trim(),
        password,
        fcm_token: await getFcmToken(),
      });

      if (rememberMe) {
        try {
          await saveSession(parseLoginResponse(res));
        } catch (storageError) {
          // Login itself succeeded - don't block the driver if the
          // device storage fails; they'll just need to log in again.
          console.warn('Could not save session:', storageError);
        }
      }

      navigation.replace(ROUTES.MAIN_TABS);
    } catch (e) {
      const fieldErrors = firstFieldErrors(e.errors);
      // e.g. "Invalid Email ID or Password." has no per-field errors
      setErrors(
        Object.keys(fieldErrors).length ? fieldErrors : { form: e.message },
      );
    } finally {
      setLoading(false);
    }
  };

  const clearError = key => {
    if (errors[key] || errors.form) {
      setErrors(prev => ({ ...prev, [key]: undefined, form: undefined }));
    }
  };

  return (
    <AuthScreen centered>
      <AuthHeader
        eyebrow="DRIVER PORTAL"
        subtitle="Log in to start your delivery shift"
      />

      <AuthCard>
        <AuthField
          label="Registered Email"
          value={email}
          onChangeText={v => {
            setEmail(v);
            clearError('email');
          }}
          placeholder="rahul.driver@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          editable={!loading}
          error={errors.email}
        />

        <AuthField
          label="Password"
          secure
          value={password}
          onChangeText={v => {
            setPassword(v);
            clearError('password');
          }}
          placeholder="Enter your password"
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          editable={!loading}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          error={errors.password}
        />

        {/* REMEMBER ME & FORGOT */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            activeOpacity={0.8}
            onPress={() => setRememberMe(v => !v)}
          >
            <View
              style={[authStyles.checkbox, rememberMe && authStyles.checkboxOn]}
            >
              {rememberMe ? <Text style={authStyles.checkMark}>✓</Text> : null}
            </View>
            <Text style={styles.rememberText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(ROUTES.FORGOT_PASSWORD, {
                email: email.trim(),
              })
            }
          >
            <Text style={authStyles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <FormMessage error={errors.form} />

        <PrimaryButton
          title="Sign In to Drive  →"
          onPress={handleLogin}
          loading={loading}
        />
      </AuthCard>

      <FooterLink
        text="New to the fleet?"
        linkText="Register as a driver"
        onPress={() => navigation.navigate(ROUTES.REGISTER)}
      />
    </AuthScreen>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rs(4),
  },

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rememberText: {
    color: COLORS.DARK,
    fontSize: fs(13),
    fontWeight: '600',
  },
});
