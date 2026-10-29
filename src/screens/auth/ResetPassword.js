import React, { useState } from 'react';
import { showAlert } from '../../components/AppAlert';
import { ROUTES } from '../../navigation/routes';
import { apiPost, firstFieldErrors } from '../../api/client';
import {
  AuthScreen,
  AuthHeader,
  AuthCard,
  AuthField,
  PrimaryButton,
  FormMessage,
} from './components';

// ============================================================
// RESET PASSWORD
// POST /driver/reset-password  { email, password, confirm_password }
// Only works after /verify-otp succeeded for this email.
// ============================================================

const ResetPasswordScreen = ({ navigation, route }) => {
  const email = route.params?.email ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const goToLogin = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.LOGIN, params: { email } }],
    });

  const validate = () => {
    const next = {};
    if (!password) {
      next.password = 'Password is required.';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      next.confirm_password = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      next.confirm_password = 'Passwords do not match.';
    }
    return next;
  };

  const handleReset = async () => {
    const localErrors = validate();
    setErrors(localErrors);
    if (Object.keys(localErrors).length) {
      return;
    }

    setLoading(true);
    try {
      const res = await apiPost('/driver/reset-password', {
        email,
        password,
        confirm_password: confirmPassword,
      });

      showAlert(
        'Password updated',
        res.message || 'Your password has been reset. Please log in.',
        [{ text: 'Log In', onPress: goToLogin }],
        { cancelable: false, type: 'success' },
      );
    } catch (e) {
      const fieldErrors = firstFieldErrors(e.errors);
      // e.g. "Please verify your 6-digit OTP first, or request a new OTP..."
      setErrors(
        Object.keys(fieldErrors).length ? fieldErrors : { form: e.message },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen onBack={goToLogin}>
      <AuthHeader
        eyebrow="ACCOUNT RECOVERY"
        title="Reset Password"
        subtitle={`Create a new password for\n${email}`}
      />

      <AuthCard>
        <AuthField
          label="New Password"
          secure
          value={password}
          onChangeText={v => {
            setPassword(v);
            setErrors(prev => ({
              ...prev,
              password: undefined,
              form: undefined,
            }));
          }}
          placeholder="Minimum 6 characters"
          autoCapitalize="none"
          textContentType="newPassword"
          editable={!loading}
          error={errors.password}
        />

        <AuthField
          label="Confirm New Password"
          secure
          value={confirmPassword}
          onChangeText={v => {
            setConfirmPassword(v);
            setErrors(prev => ({
              ...prev,
              confirm_password: undefined,
              form: undefined,
            }));
          }}
          placeholder="Re-enter new password"
          autoCapitalize="none"
          textContentType="newPassword"
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={handleReset}
          error={errors.confirm_password}
        />

        <FormMessage error={errors.form || errors.email} />

        <PrimaryButton
          title="Update Password  →"
          onPress={handleReset}
          loading={loading}
        />
      </AuthCard>
    </AuthScreen>
  );
};

export default ResetPasswordScreen;
