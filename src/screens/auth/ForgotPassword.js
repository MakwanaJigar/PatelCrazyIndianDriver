import React, { useState } from 'react';
import { ROUTES } from '../../navigation/routes';
import { apiPost, firstFieldErrors } from '../../api/client';
import {
  AuthScreen,
  AuthHeader,
  AuthCard,
  AuthField,
  PrimaryButton,
  FormMessage,
  FooterLink,
  EMAIL_RE,
} from './components';

// ============================================================
// FORGOT PASSWORD
// POST /driver/forgot-password  { email }
// (the API also accepts { contact_number }, but /verify-otp needs
//  the email, so we ask for email here)
// -> sends a 6-digit OTP, then opens the OTP screen
// ============================================================

const ForgotPasswordScreen = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const value = email.trim();

    if (!value) {
      setErrors({ email: 'Email is required.' });
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setErrors({ email: 'Enter a valid email address.' });
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await apiPost('/driver/forgot-password', { email: value });

      navigation.navigate(ROUTES.OTP, {
        email: value,
        message: res.message,
      });
    } catch (e) {
      const fieldErrors = firstFieldErrors(e.errors);
      // e.g. "No active user found with the provided details."
      setErrors(
        Object.keys(fieldErrors).length ? fieldErrors : { form: e.message },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen onBack={() => navigation.goBack()}>
      <AuthHeader
        eyebrow="ACCOUNT RECOVERY"
        title="Forgot Password?"
        subtitle="Enter your registered email and we'll send you a 6-digit OTP to reset your password."
      />

      <AuthCard>
        <AuthField
          label="Registered Email"
          value={email}
          onChangeText={v => {
            setEmail(v);
            setErrors({});
          }}
          placeholder="rahul.driver@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          editable={!loading}
          returnKeyType="send"
          onSubmitEditing={handleSendOtp}
          error={errors.email}
        />

        <FormMessage error={errors.form || errors.contact_number} />

        <PrimaryButton
          title="Send OTP  →"
          onPress={handleSendOtp}
          loading={loading}
        />
      </AuthCard>

      <FooterLink
        text="Remembered your password?"
        linkText="Back to Login"
        onPress={() => navigation.goBack()}
      />
    </AuthScreen>
  );
};

export default ForgotPasswordScreen;
