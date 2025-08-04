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

interface CompletedService {
  _id: string;
  serviceTitle: string;
  customer: {
    name: string;
  };
  workerPayment: number;
  amount: number;
  completedAt: string;
  updatedAt: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const EarningsScreen = () => {
  const { t } = useLanguage();
  const [earnings, setEarnings] = React.useState<Earning[]>([]);
  const [completedServices, setCompletedServices] = React.useState<CompletedService[]>([]);
  const [totalEarnings, setTotalEarnings] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await AsyncStorage.getItem('token');
        console.log('Fetching earnings and completed services...');
        
        // Fetch detailed earnings history from dashboard API
        const dashboardResponse = await axios.get(`${API_URL}/worker/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Dashboard response:', dashboardResponse.data);
        
        // Use the earnings array from dashboard which contains daily earnings history
        const earningsData = dashboardResponse.data.stats?.earnings || [];
        console.log('Earnings data:', earningsData);
        
        // Sort earnings by date (newest first)
        const sortedEarnings = earningsData.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setEarnings(sortedEarnings);
        
        // Set total earnings (after commission deduction)
        setTotalEarnings(dashboardResponse.data.stats?.totalEarnings || 0);
        
        // Fetch completed services
        const completedServicesResponse = await axios.get(`${API_URL}/worker/completed-bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Completed services response:', completedServicesResponse.data);
        
        const servicesData = completedServicesResponse.data.bookings || [];
        const sortedServices = servicesData.sort((a: any, b: any) => 
          new Date(b.completedAt || b.updatedAt).getTime() - new Date(a.completedAt || a.updatedAt).getTime()
        );
        
        setCompletedServices(sortedServices);
        
      } catch (err: any) {
        console.error('Earnings fetch error:', err.response?.data || err.message);
        setError(t('worker.failed_to_fetch_earnings') + ': ' + (err.response?.data?.message || err.message));
        setEarnings([]);
        setCompletedServices([]);
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

  const formatAddress = (address: any) => {
    if (!address) return 'Address not available';
    return `${address.street || ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`.trim();
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
      {/* Total Earnings Summary */}
      {totalEarnings > 0 && (
        <View style={styles.summaryContainer}>
          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="wallet" size={24} color={COLORS.success} style={{ marginRight: 12 }} />
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryTitle}>{t('worker.total_earnings')}</Text>
                <Text style={styles.summarySubtitle}>{t('worker.after_commission_deduction')}</Text>
              </View>
              <Text style={styles.summaryAmount}>₹{totalEarnings}</Text>
            </View>
          </Card>
        </View>
      )}
      
      {/* Completed Services Section */}
      {completedServices.length > 0 && (
        <View style={styles.earningsList}>
          <Text style={styles.sectionTitle}>{t('worker.completed_services')}</Text>
          {completedServices.map((service, idx) => (
            <Card key={service._id || idx} variant="elevated" style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.serviceTitle || 'Service'}</Text>
                  <Text style={styles.customerName}>{t('worker.customer')}: {service.customer?.name || 'N/A'}</Text>
                </View>
                <View style={styles.serviceAmountContainer}>
                  <Text style={styles.serviceAmount}>₹{service.workerPayment || service.amount}</Text>
                  <Text style={styles.serviceAmountLabel}>{t('worker.after_commission')}</Text>
                </View>
              </View>
              <View style={styles.serviceDetails}>
                <View style={styles.serviceDetailRow}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.serviceDetailText}>{formatAddress(service.address)}</Text>
                </View>
                <View style={styles.serviceDetailRow}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.serviceDetailText}>
                    {formatDate(service.completedAt || service.updatedAt)}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
      
      {/* Daily Earnings Summary */}
      {earnings.length > 0 && (
        <View style={styles.earningsList}>
          <Text style={styles.sectionTitle}>{t('worker.daily_earnings_summary')}</Text>
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
      
      {earnings.length === 0 && completedServices.length === 0 && (
        <Text style={styles.noEarningsModern}>{t('worker.no_earnings_recorded')}</Text>
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
  summaryContainer: {
    paddingHorizontal: SIZES.medium,
    marginTop: SIZES.large,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SIZES.large,
    ...SHADOWS.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTextContainer: {
    flex: 1,
    marginLeft: SIZES.base,
  },
  summaryTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summarySubtitle: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryAmount: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '700',
    color: COLORS.success,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
    marginLeft: SIZES.base,
  },
  serviceCard: {
    marginBottom: SIZES.medium,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: SIZES.large,
    ...SHADOWS.medium,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  serviceInfo: {
    flex: 1,
    marginRight: SIZES.medium,
  },
  serviceTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  customerName: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  serviceAmountContainer: {
    alignItems: 'flex-end',
  },
  serviceAmount: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '700',
    color: COLORS.success,
  },
  serviceAmountLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  serviceDetails: {
    gap: SIZES.base,
  },
  serviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetailText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base,
    flex: 1,
  },
});

export default EarningsScreen; 