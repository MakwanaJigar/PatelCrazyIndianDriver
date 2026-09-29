import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createScaler } from '../utils/responsive';
import { ROUTES } from '../navigation/routes';

// Placeholder until the "orders_dispatches" design is built.

const { rs, fs } = createScaler(375);

const RED = '#E92025';
const DARK = '#111827';
const MUTED = '#61708B';

const OrdersScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>This screen is coming soon.</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() => navigation.navigate(ROUTES.HOME)}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: rs(24),
  },

  title: {
    color: DARK,
    fontSize: fs(24),
    fontWeight: '900',
  },

  subtitle: {
    color: MUTED,
    fontSize: fs(14),
    marginTop: rs(8),
  },

  button: {
    marginTop: rs(24),
    paddingHorizontal: rs(24),
    paddingVertical: rs(12),
    borderRadius: rs(12),
    backgroundColor: RED,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: fs(14),
    fontWeight: '800',
  },
});
