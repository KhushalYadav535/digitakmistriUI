import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
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
          daily: data.revenue.daily,
          weekly: data.revenue.weekly,
          monthly: data.revenue.monthly,
        });
        setServiceStats(data.services);
        setTopWorkers(data.topWorkers);
        setNewWorkers(data.newWorkers);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

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

      <View style={styles.revenueSection}>
        <Text style={styles.sectionTitle}>Revenue Overview</Text>
        <View style={styles.revenueCards}>
          <Card variant="elevated" style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Daily Revenue</Text>
            <Text style={styles.revenueValue}>{revenueData.daily}</Text>
          </Card>
          <Card variant="elevated" style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Weekly Revenue</Text>
            <Text style={styles.revenueValue}>{revenueData.weekly}</Text>
          </Card>
          <Card variant="elevated" style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Monthly Revenue</Text>
            <Text style={styles.revenueValue}>{revenueData.monthly}</Text>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Performance</Text>
        {serviceStats.map((service) => (
          <Card key={service.id} variant="elevated" style={styles.serviceCard}>
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
          {topWorkers.map((worker, index) => (
            <View key={index} style={styles.workerItem}>
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
          {newWorkers.map((worker, index) => (
            <View key={index} style={styles.workerItem}>
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
});

export default AdminAnalyticsScreen; 