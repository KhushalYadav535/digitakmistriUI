import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EarningsScreen = () => {
  const [earnings, setEarnings] = React.useState([]);

  React.useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${'https://digital-mistri.onrender.com'}/api/worker/earnings`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch earnings');
        const data = await res.json();
        setEarnings(data);
      } catch (e) {
        setEarnings([]);
      }
    };
    fetchEarnings();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Earnings Details</Text>
      {earnings.map((item, idx) => (
        <View key={idx} style={styles.earningRow}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.amount}>₹{item.amount}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  title: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: SIZES.large,
    color: COLORS.primary,
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  date: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});

export default EarningsScreen; 