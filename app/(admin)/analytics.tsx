import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

const AdminAnalyticsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revenueData, setRevenueData] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [serviceStats, setServiceStats] = useState<any[]>([]);
  const [topWorkers, setTopWorkers] = useState<any[]>([]);
  const [newWorkers, setNewWorkers] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalWorkers: 0,
    totalActiveJobs: 0,
    totalEarnings: 0,
    newRequests: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('token');
        
        const res = await axios.get(`${API_URL}/admin/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;

        setRevenueData({
          daily: data.revenue?.daily || 0,
          weekly: data.revenue?.weekly || 0,
          monthly: data.revenue?.monthly || 0,
        });
        setServiceStats(data.services || []);
        setTopWorkers(data.topWorkers || []);
        setNewWorkers(data.newWorkers || []);
        
        // Set dashboard stats from the overview data
        setDashboardStats({
          totalWorkers: data.totalWorkers || 0,
          totalActiveJobs: data.activeJobs || 0,
          totalEarnings: data.totalEarnings || 0,
          newRequests: data.newRequests || 0
        });

        console.log('Analytics Data:', data); // Debug log
      } catch (err: any) {
        console.error('Analytics error:', err.response?.data || err.message);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleCardPress = (type: string) => {
    // TODO: Navigate to detailed view based on card type
    console.log(`Navigate to ${type} details`);
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Dashboard</Text>
      </View>

      <View style={styles.dashboardStats}>
        <TouchableOpacity onPress={() => handleCardPress('workers')}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{dashboardStats.totalWorkers}</Text>
            <Text style={styles.statLabel}>Total Workers</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleCardPress('activeJobs')}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="briefcase" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{dashboardStats.totalActiveJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <View style={styles.dashboardStats}>
        <TouchableOpacity onPress={() => handleCardPress('earnings')}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash" size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.statValue}>₹{dashboardStats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleCardPress('requests')}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="notifications" size={24} color={COLORS.error} />
            </View>
            <Text style={styles.statValue}>{dashboardStats.newRequests}</Text>
            <Text style={styles.statLabel}>New Requests</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <View style={styles.revenueSection}>
        <Text style={styles.sectionTitle}>Revenue Overview</Text>
        <View style={styles.revenueCards}>
          <Card key="daily" variant="elevated" style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Daily Revenue</Text>
            <Text style={styles.revenueValue}>₹{revenueData.daily}</Text>
          </Card>
          <Card key="weekly" variant="elevated" style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Weekly Revenue</Text>
            <Text style={styles.revenueValue}>₹{revenueData.weekly}</Text>
          </Card>
          <Card key="monthly" variant="elevated" style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Monthly Revenue</Text>
            <Text style={styles.revenueValue}>₹{revenueData.monthly}</Text>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Performance</Text>
        {serviceStats.map((service, idx) => (
          <Card key={service.id || service._id || idx} variant="elevated" style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceRevenue}>{service.revenue}</Text>
            </View>
            <View style={styles.serviceStats}>
              <View style={styles.statItem}>
                <Ionicons name="briefcase" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{service.totalJobs} Total Jobs</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color={COLORS.success} />
                <Text style={styles.statText}>{service.activeJobs} Active Jobs</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Worker Performance</Text>
        <Card variant="elevated" style={styles.workerCard}>
          <Text style={styles.workerCardTitle}>Top Performing Workers</Text>
          {topWorkers.map((worker, idx) => (
            <View key={worker.id || worker._id || idx} style={styles.workerItem}>
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <Text style={styles.workerJobs}>{worker.jobs} jobs completed</Text>
              </View>
              <View style={styles.workerRating}>
                <Ionicons name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>{worker.rating}</Text>
              </View>
            </View>
          ))}
        </Card>
        <Card variant="elevated" style={styles.workerCard}>
          <Text style={styles.workerCardTitle}>New Workers</Text>
          {newWorkers.map((worker, idx) => (
            <View key={worker.id || worker._id || idx} style={styles.workerItem}>
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{worker.name}</Text>
                <Text style={styles.workerJobs}>{worker.jobs} jobs completed</Text>
              </View>
              <View style={styles.workerRating}>
                <Ionicons name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>{worker.rating}</Text>
              </View>
            </View>
          ))}
        </Card>
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
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  title: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  revenueSection: {
    padding: SIZES.medium,
  },
  section: {
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  revenueCards: {
    flexDirection: 'row',
    gap: SIZES.medium,
  },
  revenueCard: {
    flex: 1,
    padding: SIZES.medium,
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  revenueValue: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.primary,
  },
  serviceCard: {
    marginBottom: SIZES.medium,
    padding: SIZES.medium,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  serviceName: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  serviceRevenue: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.primary,
  },
  serviceStats: {
    flexDirection: 'row',
    gap: SIZES.medium,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base,
  },
  workerCard: {
    marginBottom: SIZES.medium,
    padding: SIZES.medium,
  },
  workerCardTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  workerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  workerJobs: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  workerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.warning,
    marginLeft: SIZES.base,
  },
  dashboardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.medium,
    gap: SIZES.medium,
  },
  statCard: {
    flex: 1,
    padding: SIZES.medium,
    alignItems: 'center',
    minWidth: 150,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  statValue: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  statLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default AdminAnalyticsScreen; 