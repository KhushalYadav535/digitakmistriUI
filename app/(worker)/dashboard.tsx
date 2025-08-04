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
import { API_URL } from '../constants/config';
import { useLanguage } from '../context/LanguageContext';

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
  totalRatings?: number;
  averageRating?: number;
  ratingBreakdown?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
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
  completedBookings: any[];
  stats: {
    totalBookings: number;
    completedBookings: number;
    totalEarnings: number;
    earnings: Earnings[];
    totalRatings?: number;
    averageRating?: number;
    ratingBreakdown?: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';

// JobRequests will be loaded from worker data or fallback


const WorkerDashboardScreen = () => {
  const { t, language, changeLanguage } = useLanguage();
  const [available, setAvailable] = useState(false);
  const [earningsPeriod, setEarningsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [assignedBookings, setAssignedBookings] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { execute: fetchDashboard, loading, error } = useApi(async () => {
    try {
      console.log('=== WORKER DASHBOARD API CALL ===');
      const token = await AsyncStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Test direct API call without useApi hook
      console.log('Making direct API call to /worker/dashboard');
      const response = await fetch(`${API_URL}/worker/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Dashboard response received');
      console.log('Response data:', data);
      
      setWorker(data);
      setAvailable(data.isAvailable || false);
      setAssignedBookings(data.assignedBookings || []);
      setCompletedBookings(data.completedBookings || []);
      return data;
    } catch (err: any) {
      console.error('=== WORKER DASHBOARD ERROR ===');
      console.error('Error type:', typeof err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      throw err;
    }
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

  const handleJobAction = async (jobId: string, action: 'start' | 'cancel' | 'view') => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      switch (action) {
        case 'start':
          await apiClient.post(`/worker/jobs/${jobId}/start`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          Alert.alert(t('success'), t('worker.job_started_successfully'));
          break;
        case 'cancel':
          await apiClient.post(`/worker/jobs/${jobId}/cancel`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          Alert.alert(t('success'), t('worker.job_cancelled_successfully'));
          break;
        case 'view':
          if (!jobId) {
            Alert.alert(t('error'), t('worker.invalid_job_id'));
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
      const errorMessage = action === 'start' ? t('worker.failed_to_start_job') : 
                          action === 'cancel' ? t('worker.failed_to_cancel_job') : 
                          err.message || `Failed to ${action} job`;
      Alert.alert(t('error'), errorMessage);
    }
  };

  const handleSupportCall = () => {
    Linking.openURL('tel:+916307044134');
  };

  const getEarningsAmount = () => {
    if (!worker?.stats) return '₹0';
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Filter earnings based on the selected period
    const earnings = worker?.stats.earnings || [];
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
    if (availabilityLoading) return; // Prevent multiple rapid clicks
    
    try {
      setAvailabilityLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(t('error'), t('worker.authentication_token_not_found'));
        return;
      }

      const newStatus = !available;
      console.log('Toggling availability to:', newStatus);
      
      const response = await fetch(`${API_URL}/worker/availability`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Availability update failed:', response.status, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Availability updated successfully:', result);
      setAvailable(newStatus);
      
      // Show success feedback
      Alert.alert(t('success'), newStatus ? t('worker.availability_updated') : t('worker.availability_updated_unavailable'));
    } catch (err: any) {
      console.error('Failed to update availability:', err);
      Alert.alert(t('error'), `${t('worker.failed_to_update_availability')}: ${err.message}`);
    } finally {
      setAvailabilityLoading(false);
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

  if (!worker) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>{t('worker.no_worker_data')}</Text></View>;

  const renderJobActions = (job: any) => (
    <View style={styles.actionButtons}>
      {job.status === 'Worker Assigned' && (
        <Button
          title={t('worker.start')}
          onPress={() => handleJobAction(job._id, 'start')}
          variant="success"
        />
      )}
      {['Worker Assigned', 'Accepted', 'In Progress'].includes(job.status) && (
        <Button
          title={t('worker.cancel')}
          onPress={() => handleJobAction(job._id, 'cancel')}
          variant="danger"
        />
      )}
      {job.status !== 'Completed' && (
        <Button
          title={t('worker.view_details')}
          onPress={() => handleJobAction(job._id, 'view')}
          variant="primary"
        />
      )}
      {job.status === 'Completed' && (
        <Button
          title={t('worker.view_details')}
          onPress={() => handleJobAction(job._id, 'view')}
          variant="secondary"
        />
      )}
    </View>
  );

  const renderJobCard = (job: any) => {
    console.log('Rendering job card:', job);
    
    const formatAddress = (address: any) => {
      if (typeof address === 'string') return address;
      if (address && typeof address === 'object') {
        return `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
      }
      return t('worker.address_not_available');
    };

    return (
      <Card key={job._id} style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{job.serviceTitle || job.serviceType || job.service || t('worker.unknown_service')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(job.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
              {job.status}
            </Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
                  <Text style={styles.customerName}>
          {t('worker.customer_label')}: {job.customer?.name || 'N/A'}
        </Text>
        <Text style={styles.jobAddress}>
          {t('worker.address_label')}: {formatAddress(job.address)}
        </Text>
          <Text style={styles.jobDateTime}>
            {new Date(job.bookingDate || job.createdAt).toLocaleDateString()} at {job.bookingTime || 'N/A'}
          </Text>
        </View>

        <View style={styles.jobActions}>
          {renderJobActions(job)}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: SIZES.medium, color: COLORS.textSecondary }}>
          {t('worker.loading_dashboard')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.error, textAlign: 'center', marginHorizontal: SIZES.medium }}>
          {error}
        </Text>
        <TouchableOpacity 
          style={{ marginTop: SIZES.medium, padding: SIZES.medium, backgroundColor: COLORS.primary, borderRadius: SIZES.base }}
          onPress={fetchDashboard}
        >
          <Text style={{ color: COLORS.white }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            <Text style={styles.greeting}>{t('hello')}</Text>
            <Text style={styles.name}>{worker?.name || t('worker_role')}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => changeLanguage(language === 'en' ? 'hi' : 'en')}
            >
              <Text style={styles.languageText}>{language === 'en' ? 'HI' : 'EN'}</Text>
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
                  <Text style={styles.statValue}>{`₹${worker?.stats?.totalEarnings || 0}`}</Text>
                  <Text style={styles.statLabel}>{t('worker.total_earnings')}</Text>
                  <Text style={styles.statSubLabel}>{t('worker.after_commission_deduction')}</Text>
                </LinearGradient>
              </Card>
            </TouchableOpacity>

            <Card variant="elevated" style={styles.statCard}>
              <LinearGradient
                colors={[COLORS.success + '10', COLORS.success + '20']}
                style={styles.statCardGradient}
              >
                <Text style={styles.statValue}>{worker?.stats?.completedBookings || 0}</Text>
                <Text style={styles.statLabel}>{t('worker.jobs_completed')}</Text>
              </LinearGradient>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card variant="elevated" style={styles.statCard}>
              <LinearGradient
                colors={[COLORS.warning + '10', COLORS.warning + '20']}
                style={styles.statCardGradient}
              >
                <Text style={styles.statValue}>{worker?.stats?.totalBookings || 0}</Text>
                <Text style={styles.statLabel}>{t('worker.total_bookings')}</Text>
              </LinearGradient>
            </Card>

            <TouchableOpacity 
              style={[styles.statCard, availabilityLoading && styles.disabledCard]} 
              activeOpacity={0.8}
              onPress={toggleAvailability}
              disabled={availabilityLoading}
            >
              <Card variant="elevated" style={{flex: 1, overflow: 'hidden'}}>
                <LinearGradient
                  colors={[available ? COLORS.success + '10' : COLORS.error + '10', 
                          available ? COLORS.success + '20' : COLORS.error + '20']}
                  style={styles.statCardGradient}
                >
                  {availabilityLoading ? (
                    <ActivityIndicator size="small" color={available ? COLORS.success : COLORS.error} />
                  ) : (
                    <Text style={styles.statValue}>{available ? t('yes') : t('no')}</Text>
                  )}
                  <Text style={styles.statLabel}>{t('worker.available')}</Text>
                </LinearGradient>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {worker?.services && worker.services.length > 0 && (
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

        {/* Ratings Section */}
        {worker?.stats?.totalRatings && worker.stats.totalRatings > 0 && (
          <View style={styles.ratingsSection}>
            <View style={styles.ratingsHeader}>
              <Text style={styles.sectionTitle}>
                {t('worker.your_ratings')}
              </Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/(worker)/ratings' as any)}
              >
                <Text style={styles.viewAllText}>{t('worker.view_all')}</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Card variant="elevated" style={styles.ratingCard}>
              <View style={styles.ratingHeader}>
                <View style={styles.ratingInfo}>
                  <Text style={styles.ratingValue}>
                    {worker.stats.averageRating?.toFixed(1) || '0.0'}
                  </Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(worker.stats.averageRating || 0) ? 'star' : 'star-outline'}
                        size={20}
                        color={COLORS.warning}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingCount}>
                    {worker.stats.totalRatings} {t('worker.ratings')}
                  </Text>
                </View>
                <View style={styles.ratingBreakdown}>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <View key={rating} style={styles.ratingBar}>
                      <Text style={styles.ratingLabel}>{rating}★</Text>
                      <View style={styles.ratingBarContainer}>
                        <View 
                          style={[
                            styles.ratingBarFill, 
                            { 
                              width: `${(worker.stats.ratingBreakdown?.[rating as keyof typeof worker.stats.ratingBreakdown] || 0) / (worker.stats.totalRatings || 1) * 100}%` 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.ratingCount}>{worker.stats.ratingBreakdown?.[rating as keyof typeof worker.stats.ratingBreakdown] || 0}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.jobRequestsSection}>
          <Text style={styles.sectionTitle}>
            {t('worker.active_jobs')}
          </Text>
          {assignedBookings && assignedBookings.length > 0 ? (
            assignedBookings.map(job => renderJobCard(job))
          ) : (
            <Text style={styles.noJobsText}>
              {t('worker.no_active_jobs')}
            </Text>
          )}
        </View>

        <View style={styles.jobRequestsSection}>
          <Text style={styles.sectionTitle}>
            {t('worker.completed_jobs')} ({completedBookings?.length || 0})
          </Text>
          {completedBookings && completedBookings.length > 0 ? (
            completedBookings.map(job => renderJobCard(job))
          ) : (
            <Text style={styles.noJobsText}>
              {t('worker.no_completed_jobs')}
            </Text>
          )}
        </View>

        <View style={styles.supportContainer}>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={handleSupportCall}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Ionicons name="call" size={24} color={COLORS.white} />
            <Text style={styles.supportButtonText}>{t('worker.support')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return '#FF9800';
    case 'Worker Assigned':
      return '#2196F3';
    case 'Accepted':
      return '#4CAF50';
    case 'In Progress':
      return '#FF9800';
    case 'Completed':
      return '#4CAF50';
    case 'Cancelled':
      return '#F44336';
    case 'Rejected':
      return '#F44336';
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
  statSubLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    opacity: 0.8,
    marginTop: 2,
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
  supportContainer: {
    paddingHorizontal: SIZES.medium,
    marginVertical: SIZES.medium,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.medium,
    gap: SIZES.base,
    borderRadius: SIZES.base,
    overflow: 'hidden',
    ...SHADOWS.medium,
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
  ratingsSection: {
    marginVertical: 10,
    padding: 15,
  },
  ratingCard: {
    padding: SIZES.medium,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingInfo: {
    alignItems: 'center',
    flex: 1,
  },
  ratingValue: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.base,
  },
  ratingCount: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  ratingBreakdown: {
    flex: 1,
    marginLeft: SIZES.medium,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  ratingLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    width: 30,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginHorizontal: SIZES.base,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 4,
  },
  ratingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.primary,
    fontWeight: '600',
  },
  disabledCard: {
    opacity: 0.6,
  },
});
export default WorkerDashboardScreen;
