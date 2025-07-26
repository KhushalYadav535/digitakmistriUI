import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { fetchDashboardOverview, fetchWorkers } from '../utils/adminApi';

interface Worker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  services: string[];
  stats: {
    totalBookings: number;
    completedBookings: number;
    totalEarnings: number;
  };
}

const AdminDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState<any>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const overviewData = await fetchDashboardOverview();
        console.log('=== DASHBOARD OVERVIEW DEBUG ===');
        console.log('Overview data:', overviewData);
        console.log('Top workers:', overviewData?.topWorkers);
        console.log('New workers:', overviewData?.newWorkers);
        if (overviewData?.topWorkers) {
          overviewData.topWorkers.forEach((worker: any, index: number) => {
            console.log(`Top worker ${index}:`, {
              _id: worker._id,
              name: worker.name,
              hasId: !!worker._id
            });
          });
        }
        if (overviewData?.newWorkers) {
          overviewData.newWorkers.forEach((worker: any, index: number) => {
            console.log(`New worker ${index}:`, {
              _id: worker._id,
              name: worker.name,
              hasId: !!worker._id
            });
          });
        }
        setOverview(overviewData);
        const workersData = await fetchWorkers();
        setWorkers(workersData);
      } catch (err: any) {
        setError('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_worker':
        return 'person-add';
      case 'job_completed':
        return 'checkmark-circle';
      case 'payment_received':
        return 'cash';
      default:
        return 'notifications';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'new_worker':
        return COLORS.primary;
      case 'job_completed':
        return COLORS.success;
      case 'payment_received':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <Text style={{ color: COLORS.error, fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  // Stats Cards
  const stats = [
    {
      id: 'totalWorkers',
      title: 'Total Workers',
      value: overview?.totalWorkers ?? '-',
      icon: 'people',
      color: COLORS.primary,
      onPress: () => router.push('/(admin)/workers'),
    },
    {
      id: 'activeJobs',
      title: 'Active Jobs',
      value: overview?.activeJobs ?? '-',
      icon: 'briefcase',
      color: COLORS.success,
      onPress: () => {},
    },
    {
      id: 'totalEarnings',
      title: 'Total Earnings',
      value: overview?.revenue?.monthly ? `₹${overview.revenue.monthly}` : '-',
      icon: 'cash',
      color: COLORS.warning,
      onPress: () => {},
    },
    {
      id: 'newRequests',
      title: 'New Requests',
      value: overview?.newRequests ?? '-',
      icon: 'notifications',
      color: COLORS.error,
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Admin</Text>
          <Text style={styles.subtitle}>Welcome to your dashboard</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/(admin)/profile')}
        >
          <Ionicons name="person-circle" size={40} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <TouchableOpacity key={stat.id} onPress={stat.onPress} activeOpacity={0.85}>
            <Card variant="flat" style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Workers</Text>
        </View>
        {overview?.topWorkers && overview.topWorkers.length > 0 ? (
          overview.topWorkers.map((worker: Worker) => (
            <TouchableOpacity
              key={worker._id || worker.email || worker.name}
              onPress={() => {
                console.log('=== TOP WORKER CLICK DEBUG ===');
                console.log('Worker object:', worker);
                console.log('Worker _id:', worker._id);
                console.log('Worker _id type:', typeof worker._id);
                console.log('Worker _id length:', worker._id?.length);
                
                if (!worker._id) {
                  console.error('Top Worker ID is missing!');
                  Alert.alert('Error', 'Worker ID is missing. Cannot open details.');
                  return;
                }
                console.log('Navigating to worker detail with ID:', worker._id);
                router.push({ pathname: '/(admin)/worker-detail', params: { id: worker._id } }) as any;
              }}
              activeOpacity={0.85}
            >
              <Card variant="elevated" style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons name="person" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>{worker.name}</Text>
                    <Text style={styles.activitySubtitle}>{worker.email}</Text>
                  </View>
                  <Text style={styles.activityTime}>{worker.stats?.completedBookings ?? 0} jobs</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: COLORS.textSecondary, marginLeft: 8 }}>No data available</Text>
        )}
      </View>

      {/* New Workers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Workers</Text>
        </View>
        {overview?.newWorkers && overview.newWorkers.length > 0 ? (
          overview.newWorkers.map((worker: Worker) => (
            <TouchableOpacity
              key={worker._id || worker.email || worker.name}
              onPress={() => {
                console.log('=== NEW WORKER CLICK DEBUG ===');
                console.log('Worker object:', worker);
                console.log('Worker _id:', worker._id);
                console.log('Worker _id type:', typeof worker._id);
                console.log('Worker _id length:', worker._id?.length);
                
                if (!worker._id) {
                  console.error('New Worker ID is missing!');
                  Alert.alert('Error', 'Worker ID is missing. Cannot open details.');
                  return;
                }
                console.log('Navigating to worker detail with ID:', worker._id);
                router.push({ pathname: '/(admin)/worker-detail', params: { id: worker._id } }) as any;
              }}
              activeOpacity={0.85}
            >
              <Card variant="elevated" style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityIconContainer}>
                    <Ionicons name="person-add" size={20} color={COLORS.success} />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>{worker.name}</Text>
                    <Text style={styles.activitySubtitle}>{worker.email}</Text>
                  </View>
                  <Text style={styles.activityTime}>{worker.stats?.completedBookings ?? 0} jobs</Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: COLORS.textSecondary, marginLeft: 8 }}>No data available</Text>
        )}
      </View>

      {/* Service Analytics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Analytics</Text>
        {overview?.services && overview.services.length > 0 ? (
          overview.services.map((service: any) => (
            <Card key={service.name || service._id} variant="elevated" style={styles.statCard}>
              <Text style={styles.statValue}>{service.name}: {service.count}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </Card>
          ))
        ) : (
          <Text style={{ color: COLORS.textSecondary, marginLeft: 8 }}>No data available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  greeting: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  profileButton: {
    padding: SIZES.base,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SIZES.medium,
    gap: SIZES.medium,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SIZES.medium,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  statValue: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2,
  },
  statTitle: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  section: {
    padding: SIZES.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.primary,
  },
  activityCard: {
    marginBottom: SIZES.medium,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2,
  },
  activitySubtitle: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  activityTime: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  statLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
});
export default AdminDashboardScreen;
