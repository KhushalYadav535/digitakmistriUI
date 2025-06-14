import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import { API_URL } from '../../constants/config';
import axios from 'axios';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
  service: string;
  address: string;
  date: string;
  time: string;
  amount: number;
}

const JobDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Fetching job details for:', id);
        if (!id || id === 'undefined') {
          setError('Job ID is missing. Cannot fetch job details.');
          setLoading(false);
          return;
        }
        const response = await axios.get(`${API_URL}/jobs/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Job details response:', response.data);
        setJob(response.data);
      } catch (err: any) {
        console.error('Job details fetch error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to fetch job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  const handleJobAction = async (action: 'start' | 'complete' | 'cancel') => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${API_URL}/jobs/${id}/${action}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`${action} job response:`, response.data);
      setJob(response.data);
      Alert.alert('Success', `Job ${action}ed successfully`);
    } catch (err: any) {
      console.error(`${action} job error:`, err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || `Failed to ${action} job`);
    }
  };

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;
  if (error) return <View style={styles.container}><Text>{error}</Text></View>;
  if (!job) return <View style={styles.container}><Text>Job not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Service Type:</Text>
            <Text style={styles.value}>{job.service}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(job.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>₹{job.amount}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{job.customer.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{job.customer.phone}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{job.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{job.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{job.time}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {job.status === 'accepted' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleJobAction('start')}
            >
              <Text style={styles.actionButtonText}>Start Job</Text>
            </TouchableOpacity>
          )}
          {job.status === 'in-progress' && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleJobAction('complete')}
            >
              <Text style={styles.actionButtonText}>Complete Job</Text>
            </TouchableOpacity>
          )}
          {(job.status === 'accepted' || job.status === 'in-progress') && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleJobAction('cancel')}
            >
              <Text style={styles.actionButtonText}>Cancel Job</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return COLORS.success;
    case 'in-progress':
      return COLORS.warning;
    case 'cancelled':
      return COLORS.error;
    default:
      return COLORS.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    marginRight: SIZES.medium,
  },
  headerTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    padding: SIZES.medium,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  label: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: SIZES.base,
  },
  statusBadge: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
  },
  statusText: {
    fontSize: FONTS.body4.fontSize,
    fontWeight: '500',
  },
  actions: {
    marginTop: SIZES.large,
  },
  actionButton: {
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  startButton: {
    backgroundColor: COLORS.primary,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
  },
});

export default JobDetailsScreen; 