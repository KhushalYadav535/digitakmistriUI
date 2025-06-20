import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Alert,
    Animated,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import { apiClient } from '../utils/api';
import { useApi } from '../hooks/useApi';

interface JobRequest {
  _id: string;
  service: string;
  customer: {
    name: string;
    phone: string;
  };
  status: string;
  details: any;
  createdAt: string;
}

interface Earnings {
  date: string;
  amount: number;
}

interface WorkerStats {
  earnings: Earnings[];
  totalEarnings: number;
  completedBookings: number;
  totalBookings: number;
}

interface Worker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  services: string[];
  isAvailable: boolean;
  assignedBookings: any[];
  stats: {
    totalBookings: number;
    completedBookings: number;
    totalEarnings: number;
    earnings: Earnings[];
  };
}

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';

// JobRequests will be loaded from worker data or fallback


const WorkerDashboardScreen = () => {
  const [available, setAvailable] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [earningsPeriod, setEarningsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [worker, setWorker] = useState<Worker | null>(null);
  const [assignedBookings, setAssignedBookings] = useState<any[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { execute: fetchDashboard, loading, error } = useApi(async () => {
    const token = await AsyncStorage.getItem('token');
    const response = await apiClient.get<Worker>('/worker/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setWorker(response);
    setAvailable(response.isAvailable || false);
    setAssignedBookings(response.assignedBookings || []);
    return response;
  });

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchDashboard();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleJobAction = async (jobId: string, action: 'start' | 'complete' | 'cancel' | 'view') => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      switch (action) {
        case 'start':
          await apiClient.post(`/worker/jobs/${jobId}/start`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          Alert.alert('Success', 'Job started successfully');
          break;
        case 'complete':
          await apiClient.post(`/worker/jobs/${jobId}/complete`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          Alert.alert('Success', 'Job completed successfully');
          break;
        case 'cancel':
          await apiClient.post(`/worker/jobs/${jobId}/cancel`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          Alert.alert('Success', 'Job cancelled successfully');
          break;
        case 'view':
          if (!jobId) {
            Alert.alert('Error', 'Invalid job ID');
            return;
          }
          router.push({
            pathname: "/(worker)/job-details/[id]" as any,
            params: { id: jobId }
          });
          break;
      }
      
      // Refresh dashboard data after action
      await fetchDashboard();
      
    } catch (err: any) {
      console.error('Job action error:', err);
      Alert.alert('Error', err.message || `Failed to ${action} job`);
    }
  };

  const handleSupportCall = () => {
    Linking.openURL('tel:+911234567890');
  };

  const getEarningsAmount = () => {
    if (!worker?.stats) return '₹0';
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Filter earnings based on the selected period
    const earnings = worker.stats.earnings || [];
    let periodEarnings = 0;
    
    switch (earningsPeriod) {
      case 'daily':
        periodEarnings = earnings
          .filter((e: Earnings) => new Date(e.date) >= startOfDay)
          .reduce((sum: number, e: Earnings) => sum + (e.amount || 0), 0);
        break;
      case 'weekly':
        periodEarnings = earnings
          .filter((e: Earnings) => new Date(e.date) >= startOfWeek)
          .reduce((sum: number, e: Earnings) => sum + (e.amount || 0), 0);
        break;
      case 'monthly':
        periodEarnings = earnings
          .filter((e: Earnings) => new Date(e.date) >= startOfMonth)
          .reduce((sum: number, e: Earnings) => sum + (e.amount || 0), 0);
        break;
    }
    
    return `₹${periodEarnings}`;
  };

  const toggleAvailability = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const newStatus = !available;
      await apiClient.put('/worker/availability', 
        { isAvailable: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setAvailable(newStatus);
    } catch (err: any) {
      console.error('Failed to update availability:', err);
      Alert.alert('Error', 'Failed to update availability status');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchDashboard()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!worker) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>No worker data found.</Text></View>;

  const translations = {
    en: {
      greeting: 'Good Morning,',
      todayEarnings: "Today's Earnings",
      jobsCompleted: 'Jobs Completed',
      totalBookings: 'Total Bookings',
      rating: 'Rating',
      available: 'Available',
      jobRequests: 'Job Requests',
      accept: 'Accept',
      reject: 'Reject',
      viewDetails: 'View Details',
      start: 'Start',
      complete: 'Complete',
      cancel: 'Cancel',
      support: 'Support',
      language: 'भाषा बदलें',
      earnings: {
        daily: 'Daily Earnings',
        weekly: 'Weekly Earnings',
        monthly: 'Monthly Earnings',
      },
    },
    hi: {
      greeting: 'सुप्रभात,',
      todayEarnings: 'आज की कमाई',
      jobsCompleted: 'पूरे किए गए काम',
      totalBookings: 'कुल बुकिंग',
      rating: 'रेटिंग',
      available: 'उपलब्ध',
      jobRequests: 'काम के अनुरोध',
      accept: 'स्वीकार करें',
      reject: 'अस्वीकार करें',
      viewDetails: 'विवरण देखें',
      start: 'शुरू करें',
      complete: 'पूरा करें',
      cancel: 'रद्द करें',
      support: 'सहायता',
      language: 'Change Language',
      earnings: {
        daily: 'दैनिक कमाई',
        weekly: 'साप्ताहिक कमाई',
        monthly: 'मासिक कमाई',
      },
    },
  };

  const t = translations[language];

  const renderJobActions = (job: any) => (
    <View style={styles.actionButtons}>
      {job.status === 'pending' && (
        <Button
          title="Start"
          onPress={() => handleJobAction(job._id, 'start')}
          variant="success"
        />
      )}
      {job.status === 'in_progress' && (
        <Button
          title="Complete"
          onPress={() => handleJobAction(job._id, 'complete')}
          variant="success"
        />
      )}
      {['pending', 'in_progress'].includes(job.status) && (
        <Button
          title="Cancel"
          onPress={() => handleJobAction(job._id, 'cancel')}
          variant="danger"
        />
      )}
    </View>
  );

  const renderJobCard = (job: any) => {
    const formatAddress = (address: any) => {
      if (typeof address === 'string') return address;
      if (address && typeof address === 'object') {
        return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
      }
      return 'Address not available';
    };

    return (
      <Card key={job._id} style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{job.serviceTitle || job.service}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(job.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
              {job.status}
            </Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          <Text style={styles.customerName}>
            Customer: {job.customer?.name || 'N/A'}
          </Text>
          <Text style={styles.jobAddress}>
            Address: {formatAddress(job.address)}
          </Text>
          <Text style={styles.jobDateTime}>
            {new Date(job.bookingDate).toLocaleDateString()} at {job.bookingTime}
          </Text>
        </View>

        <View style={styles.jobActions}>
          {renderJobActions(job)}
        </View>
      </Card>
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{t.greeting}</Text>
            <Text style={styles.name}>{worker.name}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            >
              <Text style={styles.languageText}>{t.language}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push({
                pathname: "/(worker)/profile"
              } as any)}
            >
              <Ionicons name="person-circle-outline" size={40} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => router.push({
              pathname: "/(worker)/earnings"
            } as any)}>
              <Card variant="elevated" style={{flex: 1, overflow: 'hidden'}}>
                <LinearGradient
                  colors={[COLORS.primary + '10', COLORS.primary + '20']}
                  style={styles.statCardGradient}
                >
                  <Text style={styles.statValue}>{getEarningsAmount()}</Text>
                  <Text style={styles.statLabel}>{t.earnings[earningsPeriod]}</Text>
                  <View style={styles.earningsPeriodSelector}>
                    <TouchableOpacity
                      style={[styles.periodButton, earningsPeriod === 'daily' && styles.activePeriod]}
                      onPress={() => setEarningsPeriod('daily')}
                    >
                      <Text style={[styles.periodText, earningsPeriod === 'daily' && styles.activePeriodText]}>D</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodButton, earningsPeriod === 'weekly' && styles.activePeriod]}
                      onPress={() => setEarningsPeriod('weekly')}
                    >
                      <Text style={[styles.periodText, earningsPeriod === 'weekly' && styles.activePeriodText]}>W</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodButton, earningsPeriod === 'monthly' && styles.activePeriod]}
                      onPress={() => setEarningsPeriod('monthly')}
                    >
                      <Text style={[styles.periodText, earningsPeriod === 'monthly' && styles.activePeriodText]}>M</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </Card>
            </TouchableOpacity>

            <Card variant="elevated" style={styles.statCard}>
              <LinearGradient
                colors={[COLORS.success + '10', COLORS.success + '20']}
                style={styles.statCardGradient}
              >
                <Text style={styles.statValue}>{worker.stats?.completedBookings || 0}</Text>
                <Text style={styles.statLabel}>{t.jobsCompleted}</Text>
              </LinearGradient>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card variant="elevated" style={styles.statCard}>
              <LinearGradient
                colors={[COLORS.warning + '10', COLORS.warning + '20']}
                style={styles.statCardGradient}
              >
                <Text style={styles.statValue}>{worker.stats?.totalBookings || 0}</Text>
                <Text style={styles.statLabel}>{t.totalBookings}</Text>
              </LinearGradient>
            </Card>

            <TouchableOpacity 
              style={styles.statCard} 
              activeOpacity={0.8}
              onPress={toggleAvailability}
            >
              <Card variant="elevated" style={{flex: 1, overflow: 'hidden'}}>
                <LinearGradient
                  colors={[available ? COLORS.success + '10' : COLORS.error + '10', 
                          available ? COLORS.success + '20' : COLORS.error + '20']}
                  style={styles.statCardGradient}
                >
                  <Text style={styles.statValue}>{available ? 'Yes' : 'No'}</Text>
                  <Text style={styles.statLabel}>{t.available}</Text>
                </LinearGradient>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {worker.services && worker.services.length > 0 && (
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Your Services</Text>
            <View style={styles.servicesList}>
              {worker.services.map((service: string, index: number) => (
                <Card key={index} variant="elevated" style={styles.serviceCard}>
                  <Text style={styles.serviceName}>{service}</Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        <View style={styles.jobRequestsSection}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? translations.en.jobRequests : translations.hi.jobRequests}
          </Text>
          {assignedBookings.length > 0 ? (
            assignedBookings.map(job => renderJobCard(job))
          ) : (
            <Text style={styles.noJobsText}>
              {language === 'en' ? 'No job requests at the moment' : 'फिलहाल कोई काम का अनुरोध नहीं है'}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.supportButton}
          onPress={handleSupportCall}
        >
          <Ionicons name="call" size={24} color={COLORS.white} />
          <Text style={styles.supportButtonText}>{t.support}</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Worker Assigned':
      return '#2196F3';
    case 'Accepted':
      return '#4CAF50';
    case 'In Progress':
      return '#FF9800';
    default:
      return '#757575';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SIZES.xxlarge,
    paddingBottom: SIZES.large,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  greeting: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.white,
    opacity: 0.8,
  },
  name: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.white,
  },
  languageButton: {
    padding: SIZES.base,
    backgroundColor: COLORS.white + '20',
    borderRadius: SIZES.base,
  },
  languageText: {
    color: COLORS.white,
    fontSize: FONTS.body4.fontSize,
  },
  profileButton: {
    padding: SIZES.base,
  },
  content: {
    marginTop: -SIZES.large,
    borderTopLeftRadius: SIZES.large,
    borderTopRightRadius: SIZES.large,
    backgroundColor: COLORS.background,
    paddingTop: SIZES.large,
  },
  statsGrid: {
    gap: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  statCard: {
    flex: 1,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  statLabel: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  earningsPeriodSelector: {
    flexDirection: 'row',
    marginTop: SIZES.base,
    gap: SIZES.base,
  },
  periodButton: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.white,
  },
  activePeriod: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  activePeriodText: {
    color: COLORS.white,
  },
  servicesSection: {
    marginVertical: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  servicesList: {
    gap: SIZES.medium,
  },
  serviceCard: {
    padding: SIZES.medium,
  },
  serviceName: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
  },
  jobRequestsSection: {
    marginVertical: 10,
    padding: 15,
  },
  jobCard: {
    marginBottom: 10,
    padding: 15,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    padding: SIZES.base,
    borderRadius: SIZES.base,
  },
  statusText: {
    fontSize: FONTS.body4.fontSize,
    fontWeight: '600',
  },
  jobDetails: {
    marginBottom: 10,
  },
  customerName: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '500',
  },
  jobAddress: {
    fontSize: FONTS.body3.fontSize,
    color: '#666',
  },
  jobDateTime: {
    fontSize: FONTS.body3.fontSize,
    color: '#666',
  },
  jobActions: {
    flexDirection: 'row',
    gap: SIZES.base,
  },
  supportButton: {
    borderRadius: SIZES.base,
    overflow: 'hidden',
    ...SHADOWS.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.medium,
    gap: SIZES.base,
  },
  supportButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
  },
  noJobsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.primary,
    marginTop: 20,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.base,
  },
});
export default WorkerDashboardScreen;
