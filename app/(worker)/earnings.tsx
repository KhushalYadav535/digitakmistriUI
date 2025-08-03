import React from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import { SHADOWS } from '../../constants/theme';
import { useLanguage } from '../context/LanguageContext';

interface Earning {
  date: string;
  amount: number;
}

const EarningsScreen = () => {
  const { t } = useLanguage();
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
        const response = await axios.get(`${API_URL}/worker/earnings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Earnings response:', response.data);
        
        // Convert earnings data to the expected format
        const earningsData = response.data;
        const earningsArray = [];
        
        if (earningsData.daily > 0) {
          earningsArray.push({ date: new Date().toISOString().split('T')[0], amount: earningsData.daily });
        }
        if (earningsData.weekly > 0) {
          earningsArray.push({ date: new Date().toISOString().split('T')[0], amount: earningsData.weekly });
        }
        if (earningsData.monthly > 0) {
          earningsArray.push({ date: new Date().toISOString().split('T')[0], amount: earningsData.monthly });
        }
        
        setEarnings(earningsArray);
      } catch (err: any) {
        console.error('Earnings fetch error:', err.response?.data || err.message);
        setError(t('worker.failed_to_fetch_earnings') + ': ' + (err.response?.data?.message || err.message));
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
      {/* Gradient Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <Ionicons name="wallet-outline" size={32} color={COLORS.white} style={{ marginRight: 12 }} />
          <Text style={styles.titleModern}>{t('worker.earnings_history')}</Text>
        </View>
      </LinearGradient>
      {earnings.length === 0 ? (
        <Text style={styles.noEarningsModern}>{t('worker.no_earnings_recorded')}</Text>
      ) : (
        <View style={styles.earningsList}>
          {earnings.map((item, idx) => (
            <Card key={idx} variant="elevated" style={styles.earningCard}>
              <View style={styles.earningRowModern}>
                <View style={styles.earningDateIcon}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.dateModern}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.earningAmountContainer}>
                  <Ionicons name="cash-outline" size={20} color={COLORS.success} style={{ marginRight: 4 }} />
                  <Text style={styles.amountModern}>₹{item.amount}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientHeader: {
    height: 100,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: -24,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SIZES.xxlarge,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  titleModern: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  noEarningsModern: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.xxlarge,
    marginBottom: SIZES.large,
  },
  earningsList: {
    marginTop: SIZES.large,
    paddingHorizontal: SIZES.medium,
  },
  earningCard: {
    marginBottom: SIZES.medium,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: SIZES.large,
    ...SHADOWS.medium,
  },
  earningRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earningDateIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: 12,
  },
  dateModern: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  amountModern: {
    fontSize: FONTS.h3.fontSize,
    color: COLORS.success,
    fontWeight: '700',
    marginLeft: 2,
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
});

export default EarningsScreen; 