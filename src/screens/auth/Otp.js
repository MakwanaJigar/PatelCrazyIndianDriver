import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ROUTES } from '../../navigation/routes';
import { apiPost } from '../../api/client';
import {
  AuthScreen,
  AuthHeader,
  AuthCard,
  PrimaryButton,
  FormMessage,
  authStyles,
  rs,
  fs,
  COLORS,
} from './components';

// ============================================================
// OTP VERIFICATION
// POST /driver/verify-otp       { email, otp }   -> Reset Password
// POST /driver/forgot-password  { email }        -> resend OTP
// ============================================================

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

const OtpScreen = ({ navigation, route }) => {
  const email = route.params?.email ?? '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(
    route.params?.message || `We sent a 6-digit code to ${email}`,
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  const inputRef = useRef(null);

  // Resend countdown
  useEffect(() => {
    if (seconds <= 0) {
      return;
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleVerify = async (code = otp) => {
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await apiPost('/driver/verify-otp', { email, otp: code });

      navigation.replace(ROUTES.RESET_PASSWORD, { email });
    } catch (e) {
      // e.g. "Invalid OTP code entered."
      setError(e.message);
      setOtp('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      const res = await apiPost('/driver/forgot-password', { email });
      setInfo(res.message || `A new code was sent to ${email}`);
      setOtp('');
      setSeconds(RESEND_SECONDS);
    } catch (e) {
      setError(e.message);
    } finally {
      setResending(false);
    }
  };

  const onChangeOtp = value => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
    setError('');
    if (digits.length === OTP_LENGTH) {
      handleVerify(digits);
    }
  };

  return (
    <AuthScreen onBack={() => navigation.goBack()}>
      <AuthHeader
        eyebrow="VERIFICATION"
        title="Enter OTP"
        subtitle={`Enter the 6-digit code sent to\n${email}`}
      />

      <AuthCard>
        {/* One hidden input drives the 6 visible boxes */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.boxRow}
          onPress={() => inputRef.current?.focus()}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, i) => {
            const active = i === otp.length && !loading;
            return (
              <View
                key={i}
                style={[
                  styles.box,
                  otp[i] && styles.boxFilled,
                  active && styles.boxActive,
                  error && styles.boxError,
                ]}
              >
                <Text style={styles.boxText}>{otp[i] || ''}</Text>
              </View>
            );
          })}
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={onChangeOtp}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={OTP_LENGTH}
          autoFocus
          editable={!loading}
          style={styles.hiddenInput}
        />

        <FormMessage error={error} success={info} />

        <PrimaryButton
          title="Verify OTP  →"
          onPress={() => handleVerify()}
          loading={loading}
        />

        <View style={styles.resendRow}>
          <Text style={authStyles.muted}>Didn't get the code?</Text>
          {seconds > 0 ? (
            <Text style={styles.timer}> Resend in {seconds}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={authStyles.link}>
                {resending ? ' Sending...' : ' Resend OTP'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </AuthCard>
    </AuthScreen>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  box: {
    width: rs(46),
    height: rs(56),

    borderRadius: rs(12),
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  boxFilled: {
    borderColor: COLORS.DARK,
  },

  boxActive: {
    borderColor: COLORS.RED,
    borderWidth: 2,
  },

  boxError: {
    borderColor: COLORS.ERROR,
    backgroundColor: '#FFF6F5',
  },

  boxText: {
    color: COLORS.DARK,
    fontSize: fs(22),
    fontWeight: '800',
  },

  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: rs(16),
  },

  timer: {
    color: COLORS.DARK,
    fontSize: fs(13),
    fontWeight: '700',
  },
});
