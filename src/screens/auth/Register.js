import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { showAlert } from '../../components/AppAlert';
import { ROUTES } from '../../navigation/routes';
import { apiPost, firstFieldErrors } from '../../api/client';
import {
  AuthScreen,
  AuthHeader,
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
// REGISTER
// POST /driver/register
// Required: first_name, last_name, contact_number, email,
// street_line_1, suburb, postcode, password, confirm_password,
// license_number, license_expiry_date (YYYY-MM-DD, future),
// vehicle_rego_number. Optional: street_line_2.
// ============================================================

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  contact_number: '',
  email: '',
  street_line_1: '',
  street_line_2: '',
  suburb: '',
  postcode: '',
  license_number: '',
  license_expiry_date: '',
  vehicle_rego_number: '',
  password: '',
  confirm_password: '',
};

const REQUIRED = Object.keys(EMPTY_FORM).filter(k => k !== 'street_line_2');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Mirrors the server rules so most mistakes are caught before the
// request; the server's own errors are still shown if it rejects.
const validate = form => {
  const errors = {};

  REQUIRED.forEach(key => {
    if (!form[key].trim()) {
      errors[key] = 'This field is required.';
    }
  });

  if (form.email && !EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (form.license_expiry_date) {
    const date = new Date(form.license_expiry_date);
    if (!DATE_RE.test(form.license_expiry_date) || isNaN(date.getTime())) {
      errors.license_expiry_date = 'Use the format YYYY-MM-DD.';
    } else if (date <= new Date()) {
      errors.license_expiry_date = 'Licence must not be expired.';
    }
  }

  if (form.password && form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (form.confirm_password && form.confirm_password !== form.password) {
    errors.confirm_password = 'Passwords do not match.';
  }

  return errors;
};

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  // popTo returns to the Login already in the stack (or adds one)
  const goToLogin = params => navigation.popTo(ROUTES.LOGIN, params);

  const handleSubmit = async () => {
    const localErrors = validate(form);
    if (!agreed) {
      localErrors.form =
        'Please accept the Driver Partner Agreement to continue.';
    }
    setErrors(localErrors);

    if (Object.keys(localErrors).length) {
      if (Object.keys(localErrors).some(k => k !== 'form')) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()]),
    );
    if (!payload.street_line_2) {
      delete payload.street_line_2;
    }

    setLoading(true);
    try {
      const res = await apiPost('/driver/register', payload);

      showAlert(
        'Registration successful',
        res.message ||
          'Your driver account has been created. Please log in to continue.',
        [
          {
            text: 'Log In',
            onPress: () => goToLogin({ email: payload.email }),
          },
        ],
        { cancelable: false, type: 'success' },
      );
    } catch (e) {
      const fieldErrors = firstFieldErrors(e.errors);
      setErrors({ ...fieldErrors, form: e.message });
      if (Object.keys(fieldErrors).length) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    } finally {
      setLoading(false);
    }
  };

  // Shorthand for a form-bound field
  const field = (key, label, props = {}) => (
    <AuthField
      label={label}
      required={REQUIRED.includes(key)}
      value={form[key]}
      onChangeText={value => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key] || errors.form) {
          setErrors(prev => ({ ...prev, [key]: undefined, form: undefined }));
        }
      }}
      editable={!loading}
      error={errors[key]}
      {...props}
    />
  );

  return (
    <AuthScreen onBack={() => goToLogin()} scrollRef={scrollRef}>
      <AuthHeader
        eyebrow="JOIN THE FLEET"
        title="Driver Registration"
        subtitle="Join our restaurant's delivery team and start delivering today."
      />

      {/* PERSONAL */}
      <Text style={authStyles.sectionTitle}>Personal Details</Text>

      <View style={authStyles.row}>
        <View style={authStyles.half}>
          {field('first_name', 'First Name', {
            placeholder: 'Rahul',
            autoCapitalize: 'words',
          })}
        </View>
        <View style={authStyles.half}>
          {field('last_name', 'Last Name', {
            placeholder: 'Verma',
            autoCapitalize: 'words',
          })}
        </View>
      </View>

      {field('contact_number', 'Contact Number', {
        placeholder: '0412 345 678',
        keyboardType: 'phone-pad',
      })}

      {field('email', 'Email Address', {
        placeholder: 'rahul.driver@gmail.com',
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        autoCorrect: false,
      })}

      {/* ADDRESS */}
      <Text style={authStyles.sectionTitle}>Address</Text>

      {field('street_line_1', 'Street Line 1', {
        placeholder: '12 King William St',
      })}

      {field('street_line_2', 'Street Line 2 (Optional)', {
        placeholder: 'Unit / Apartment',
      })}

      <View style={authStyles.row}>
        <View style={authStyles.half}>
          {field('suburb', 'Suburb', {
            placeholder: 'Adelaide',
            autoCapitalize: 'words',
          })}
        </View>
        <View style={authStyles.half}>
          {field('postcode', 'Postcode', {
            placeholder: '5000',
            keyboardType: 'number-pad',
            maxLength: 4,
          })}
        </View>
      </View>

      {/* LICENCE & VEHICLE */}
      <Text style={authStyles.sectionTitle}>Licence & Vehicle</Text>

      {field('license_number', 'Driver Licence Number', {
        placeholder: 'e.g. SA1234567',
        autoCapitalize: 'characters',
      })}

      {field('license_expiry_date', 'Licence Expiry Date', {
        placeholder: 'YYYY-MM-DD',
        keyboardType: 'numbers-and-punctuation',
        maxLength: 10,
      })}

      {field('vehicle_rego_number', 'Vehicle Rego Number', {
        placeholder: 'e.g. S123ABC',
        autoCapitalize: 'characters',
      })}

      {/* SECURITY */}
      <Text style={authStyles.sectionTitle}>Account Security</Text>

      {field('password', 'Password', {
        secure: true,
        placeholder: 'Minimum 6 characters',
        autoCapitalize: 'none',
      })}

      {field('confirm_password', 'Confirm Password', {
        secure: true,
        placeholder: 'Re-enter password',
        autoCapitalize: 'none',
      })}

      {/* AGREEMENT */}
      <TouchableOpacity
        style={styles.agreeRow}
        activeOpacity={0.8}
        onPress={() => {
          setAgreed(v => !v);
          setErrors(prev => ({ ...prev, form: undefined }));
        }}
      >
        <View style={[authStyles.checkbox, agreed && authStyles.checkboxOn]}>
          {agreed ? <Text style={authStyles.checkMark}>✓</Text> : null}
        </View>
        <Text style={styles.agreeText}>
          I agree to the{' '}
          <Text style={authStyles.link}>Driver Partner Agreement</Text>, Safety
          Guidelines, and consent to receive order alerts & incentive
          notifications.
        </Text>
      </TouchableOpacity>

      <FormMessage error={errors.form} />

      <PrimaryButton
        title="Register  →"
        onPress={handleSubmit}
        loading={loading}
      />

      <FooterLink
        text="Already registered as a partner?"
        linkText="Login here"
        onPress={() => goToLogin()}
      />
    </AuthScreen>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: rs(10),
  },

  agreeText: {
    flex: 1,
    color: COLORS.MUTED,
    fontSize: fs(13),
    lineHeight: fs(19),
  },
});
