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
    View
} from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import { API_URL } from '../constants/config';
import axios from 'axios';

interface JobRequest {
  id: string;
  title: string;
  description: string;
  status: string;
}

// JobRequests will be loaded from worker data or fallback


const WorkerDashboardScreen = () => {
  const [available, setAvailable] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [earningsPeriod, setEarningsPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const fadeAnim = new Animated.Value(0);
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Fetching worker dashboard with token');
        const response = await axios.get(`${API_URL}/worker/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Worker dashboard response:', response.data);
        setWorker(response.data.worker);
        setJobRequests(response.data.jobs || []);
        if (response.data.worker) {
  await AsyncStorage.setItem('worker', JSON.stringify(response.data.worker));
}
      } catch (err: any) {
        console.error('Dashboard fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch dashboard');
        setWorker(null);
        setJobRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Loading...</Text></View>;
  if (!worker) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>No worker data found.</Text></View>;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const translations = {
    en: {
      greeting: 'Good Morning,',
      todayEarnings: "Today's Earnings",
      jobsCompleted: 'Jobs Completed',
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

  const handleJobAction = (jobId: string, action: 'start' | 'complete' | 'cancel' | 'view') => {
    switch (action) {
      case 'start':
        // TODO: Implement start job
        Alert.alert('Job Started', 'You have started the job');
        break;
      case 'complete':
        // TODO: Implement complete job
        Alert.alert('Job Completed', 'You have completed the job');
        break;
      case 'cancel':
        // TODO: Implement cancel job
        Alert.alert('Job Cancelled', 'You have cancelled the job');
        break;
      case 'view':
        if (!jobId || jobId === 'undefined') {
          Alert.alert('Invalid job', 'Cannot show details for an invalid job.');
          break;
        }
        router.push({
          pathname: "/(worker)/job-details/[id]",
          params: { id: jobId }
        } as any);
        break;
    }
  };

  const handleSupportCall = () => {
    Linking.openURL('tel:+911234567890');
  };

  const getEarningsAmount = () => {
    switch (earningsPeriod) {
      case 'daily':
        return '₹2,500';
      case 'weekly':
        return '₹15,000';
      case 'monthly':
        return '₹45,000';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primary + '80']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{t.greeting}</Text>
            <Text style={styles.name}>John Doe</Text>
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
            <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => router.push({
              pathname: "/(worker)/jobs"
            } as any)}>
              <Card variant="elevated" style={{flex: 1, overflow: 'hidden'}}>
                <LinearGradient
                  colors={[COLORS.success + '10', COLORS.success + '20']}
                  style={styles.statCardGradient}
                >
                  <Text style={[styles.statValue, { color: COLORS.success }]}>5</Text>
                  <Text style={styles.statLabel}>{t.jobsCompleted}</Text>
                </LinearGradient>
              </Card>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => router.push({
              pathname: "/feedback"
            } as any)}>
              <Card variant="elevated" style={{flex: 1, overflow: 'hidden'}}>
                <LinearGradient
                  colors={[COLORS.warning + '10', COLORS.warning + '20']}
                  style={styles.statCardGradient}
                >
                  <Text style={[styles.statValue, { color: COLORS.warning }]}>4.8</Text>
                  <Text style={styles.statLabel}>{t.rating}</Text>
                </LinearGradient>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.8} onPress={() => Alert.alert('Availability', 'Yahan aap apni availability dekh ya badal sakte hain.') }>
              <Card variant="elevated" style={{flex: 1, overflow: 'hidden'}}>
                <LinearGradient
                  colors={available ? [COLORS.primary + '10', COLORS.primary + '20'] : [COLORS.error + '10', COLORS.error + '20']}
                  style={styles.statCardGradient}
                >
                  <Button
                    title={available ? t.available : 'Not Available'}
                    variant={available ? 'primary' : 'outline'}
                    style={styles.availabilityButton}
                    onPress={() => setAvailable((prev) => !prev)}
                  />
                </LinearGradient>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.supportButtonContainer}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleSupportCall}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + '80']}
              style={styles.supportButtonGradient}
            >
              <Ionicons name="call-outline" size={24} color={COLORS.white} />
              <Text style={styles.supportButtonText}>{t.support}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t.jobRequests}</Text>
        {jobRequests.map((job) => (
          <Card key={job.id} variant="elevated" style={styles.jobCard}>
            <LinearGradient
              colors={[COLORS.white, COLORS.background]}
              style={styles.jobCardGradient}
            >
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.customerName}>{job.title}</Text>
                  <Text style={styles.serviceType}>{job.description}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  job.status === 'completed' && styles.statusBadgeCompleted,
                  job.status === 'in-progress' && styles.statusBadgeInProgress,
                ]}>
                  <Text style={[
                    styles.statusText,
                    job.status === 'completed' && styles.statusTextCompleted,
                    job.status === 'in-progress' && styles.statusTextInProgress,
                  ]}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.jobDetails}>
                <View style={styles.jobDetail}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.jobDetailText}>{job.description}</Text>
                </View>
                <View style={styles.jobDetail}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.jobDetailText}>{job.description}</Text>
                </View>
                <View style={styles.jobDetail}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.jobDetailText}>{job.description}</Text>
                </View>
                <View style={styles.jobDetail}>
                  <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.jobDetailText}>{job.description}</Text>
                </View>
              </View>
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsLabel}>Instructions:</Text>
                <Text style={styles.instructionsText}>{job.description}</Text>
              </View>
              <View style={styles.jobActions}>
                {job.status === 'new' && (
                  <>
                    <Button
                      title={t.start}
                      onPress={() => handleJobAction(job.id, 'start')}
                      variant="primary"
                      style={styles.actionButton}
                    />
                    <Button
                      title={t.cancel}
                      onPress={() => handleJobAction(job.id, 'cancel')}
                      variant="outline"
                      style={styles.actionButton}
                    />
                  </>
                )}
                {job.status === 'in-progress' && (
                  <Button
                    title={t.complete}
                    onPress={() => handleJobAction(job.id, 'complete')}
                    variant="primary"
                    style={styles.viewButton}
                  />
                )}
                {job.status === 'completed' && (
                  <Button
                    title={t.viewDetails}
                    onPress={() => handleJobAction(job.id, 'view')}
                    variant="outline"
                    style={styles.viewButton}
                  />
                )}
              </View>
            </LinearGradient>
          </Card>
        ))}
      </Animated.View>
    </ScrollView>
  );
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
  availabilityButton: {
    width: '100%',
  },
  supportButtonContainer: {
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  supportButton: {
    borderRadius: SIZES.base,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  supportButtonGradient: {
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
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  jobCard: {
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
    overflow: 'hidden',
  },
  jobCardGradient: {
    padding: SIZES.medium,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  customerName: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2,
  },
  serviceType: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
    backgroundColor: `${COLORS.warning}20`,
  },
  statusBadgeInProgress: {
    backgroundColor: `${COLORS.primary}20`,
  },
  statusBadgeCompleted: {
    backgroundColor: `${COLORS.success}20`,
  },
  statusText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.warning,
    fontWeight: '500',
  },
  statusTextInProgress: {
    color: COLORS.primary,
  },
  statusTextCompleted: {
    color: COLORS.success,
  },
  jobDetails: {
    gap: SIZES.base,
    marginBottom: SIZES.medium,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  jobDetailText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  instructionsContainer: {
    marginBottom: SIZES.medium,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
  },
  instructionsLabel: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2,
  },
  instructionsText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  jobActions: {
    flexDirection: 'row',
    gap: SIZES.base,
  },
  actionButton: {
    flex: 1,
  },
  viewButton: {
    flex: 1,
  },
});
export default WorkerDashboardScreen;
