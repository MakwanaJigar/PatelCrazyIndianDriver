import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { showAlert } from '../components/AppAlert';
import { firstFieldErrors } from '../api/client';
import { getSession } from '../api/session';
import { updateProfile } from '../api/profile';
import AppHeader from '../components/AppHeader';
import {
  AuthScreen,
  AuthField,
  PrimaryButton,
  FormMessage,
  authStyles,
  rs,
  fs,
  COLORS,
  EMAIL_RE,
} from './auth/components';

// ============================================================
// EDIT PROFILE
// ------------------------------------------------------------
// Same fields as the register payload (minus the passwords).
// POST /driver/profile/edit (Bearer token); on success the saved
// session is updated so Profile shows the changes straight away.
// ============================================================

const FIELDS = [
  'first_name',
  'last_name',
  'contact_number',
  'email',
  'street_line_1',
  'street_line_2',
  'suburb',
  'postcode',
  'license_number',
  'license_expiry_date',
  'vehicle_rego_number',
];

const OPTIONAL = ['street_line_2'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const validate = form => {
  const errors = {};

  FIELDS.forEach(key => {
    if (!OPTIONAL.includes(key) && !form[key].trim()) {
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

  return errors;
};

// Driver object from the session -> form strings
const toForm = (driver = {}) =>
  Object.fromEntries(
    FIELDS.map(key => [key, driver[key] == null ? '' : String(driver[key])]),
  );

const EditProfileScreen = ({ navigation }) => {
  const [form, setForm] = useState(toForm());
  const [errors, setErrors] = useState({});
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    getSession().then(session => {
      setForm(toForm(session?.driver));
      setReady(true);
    });
  }, []);

  const handleSave = async () => {
    const localErrors = validate(form);
    setErrors(localErrors);
    if (Object.keys(localErrors).length) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()]),
    );

    setSaving(true);
    try {
      const { message } = await updateProfile(payload);

      showAlert(
        'Profile updated',
        message || 'Your details have been saved.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
        { type: 'success' },
      );
    } catch (e) {
      const fieldErrors = firstFieldErrors(e.errors);
      setErrors({ ...fieldErrors, form: e.message });
      if (Object.keys(fieldErrors).length) {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (key, label, props = {}) => (
    <AuthField
      label={label}
      required={!OPTIONAL.includes(key)}
      value={form[key]}
      onChangeText={value => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key] || errors.form) {
          setErrors(prev => ({ ...prev, [key]: undefined, form: undefined }));
        }
      }}
      editable={!saving}
      error={errors[key]}
      {...props}
    />
  );

  const header = <AppHeader onBack={() => navigation.goBack()} />;

  if (!ready) {
    return (
      <AuthScreen header={header}>
        <ActivityIndicator color={COLORS.RED} style={styles.loader} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen header={header} scrollRef={scrollRef}>
      <Text style={styles.title}>Edit Profile</Text>
      <Text style={styles.subtitle}>
        Keep your contact, address and licence details up to date.
      </Text>

      {/* PERSONAL */}
      <Text style={authStyles.sectionTitle}>Personal Details</Text>

      <View style={authStyles.row}>
        <View style={authStyles.half}>
          {field('first_name', 'First Name', {
            placeholder: 'John',
            autoCapitalize: 'words',
          })}
        </View>
        <View style={authStyles.half}>
          {field('last_name', 'Last Name', {
            placeholder: 'Smith',
            autoCapitalize: 'words',
          })}
        </View>
      </View>

      {field('contact_number', 'Contact Number', {
        placeholder: '+61 434 567 890',
        keyboardType: 'phone-pad',
      })}

      {field('email', 'Email Address', {
        placeholder: 'john.driver@example.com.au',
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        autoCorrect: false,
      })}

      {/* ADDRESS */}
      <Text style={authStyles.sectionTitle}>Address</Text>

      {field('street_line_1', 'Street Line 1', {
        placeholder: "88 O'Connell Street",
      })}

      {field('street_line_2', 'Street Line 2 (Optional)', {
        placeholder: 'Unit / Apartment',
      })}

      <View style={authStyles.row}>
        <View style={authStyles.half}>
          {field('suburb', 'Suburb', {
            placeholder: 'North Adelaide',
            autoCapitalize: 'words',
          })}
        </View>
        <View style={authStyles.half}>
          {field('postcode', 'Postcode', {
            placeholder: '5006',
            keyboardType: 'number-pad',
            maxLength: 4,
          })}
        </View>
      </View>

      {/* LICENCE & VEHICLE */}
      <Text style={authStyles.sectionTitle}>Licence & Vehicle</Text>

      {field('license_number', 'Driver Licence Number', {
        placeholder: 'DL-4891707-SA',
        autoCapitalize: 'characters',
      })}

      {field('license_expiry_date', 'Licence Expiry Date', {
        placeholder: 'YYYY-MM-DD',
        keyboardType: 'numbers-and-punctuation',
        maxLength: 10,
      })}

      {field('vehicle_rego_number', 'Vehicle Rego Number', {
        placeholder: 'SA-PCI-712',
        autoCapitalize: 'characters',
      })}

      <FormMessage error={errors.form} />

      <PrimaryButton
        title="Save Changes"
        onPress={handleSave}
        loading={saving}
      />
    </AuthScreen>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  loader: {
    marginTop: rs(80),
  },

  title: {
    color: COLORS.DARK,
    fontSize: fs(26),
    fontWeight: '800',
  },

  subtitle: {
    color: COLORS.MUTED,
    fontSize: fs(14),
    lineHeight: fs(20),
    marginTop: rs(4),
  },
});
