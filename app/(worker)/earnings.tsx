import React from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
import axios from 'axios';

interface Earning {
  date: string;
  amount: number;
}

const EarningsScreen = () => {
  const [earnings, setEarnings] = React.useState<Earning[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await AsyncStorage.getItem('token');
        console.log('Fetching earnings...');
        const response = await axios.get(`${API_URL}/worker/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Earnings response:', response.data);
        
        if (response.data?.stats?.earnings) {
          // Sort earnings by date in descending order
          const sortedEarnings = response.data.stats.earnings.sort((a: Earning, b: Earning) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setEarnings(sortedEarnings);
        } else {
          setEarnings([]);
        }
      } catch (err: any) {
        console.error('Earnings fetch error:', err.response?.data || err.message);
        setError('Failed to fetch earnings: ' + (err.response?.data?.message || err.message));
        setEarnings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Earnings History</Text>
      {earnings.length === 0 ? (
        <Text style={styles.noEarnings}>No earnings recorded yet</Text>
      ) : (
        earnings.map((item, idx) => (
          <View key={idx} style={styles.earningRow}>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
            <Text style={styles.amount}>₹{item.amount}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.body3.fontSize,
    textAlign: 'center',
  },
  title: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: SIZES.large,
    color: COLORS.primary,
  },
  noEarnings: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.large,
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