import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Job {
  id: string;
  customer: string;
  service: string;
  address: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  amount: number;
}

const WorkerJobsScreen = () => {
  const [jobs, setJobs] = React.useState<Job[]>([]);

  const fetchJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${'https://digital-mistri.onrender.com'}/api/jobs/pending`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      setJobs([]);
    }
  };

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const handleJobPress = (jobId: string) => {
    if (!jobId) {
      alert('Invalid job. Cannot show details.');
      return;
    }
    router.push({
      pathname: '/job-details' as any,
      params: { id: jobId }
    });
  };


  const handleAccept = async (jobId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${'https://digital-mistri.onrender.com'}/api/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to accept job');
      // Refresh jobs
      fetchJobs();
    } catch (e) {
      alert('Failed to accept job');
    }
  };

  const handleReject = async (jobId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${'https://digital-mistri.onrender.com'}/api/jobs/${jobId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to reject job');
      // Refresh jobs
      fetchJobs();
    } catch (e) {
      alert('Failed to reject job');
    }
  };


  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'accepted':
        return COLORS.success;
      case 'completed':
        return COLORS.primary;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Jobs</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {jobs.map((job) => (
          <View key={job.id}>
            <Card variant="elevated" style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View>
                  <Text style={styles.customerName}>{job.customer}</Text>
                  <Text style={styles.serviceType}>{job.service}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(job.status)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(job.status) },
                    ]}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.jobDetails}>
                <View style={styles.jobDetail}>
                  <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.jobDetailText}>{job.address}</Text>
                </View>
                <View style={styles.jobDetail}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.jobDetailText}>{job.date}</Text>
                </View>
                <View style={styles.jobDetail}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.jobDetailText}>{job.time}</Text>
                </View>
              </View>

              <View style={styles.jobFooter}>
                <Text style={styles.amount}>₹{job.amount}</Text>
                <Button
                  title="View Details"
                  onPress={() => handleJobPress(job.id)}
                  variant="primary"
                  style={styles.viewButton}
                />
              </View>
            </Card>
            <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
              <Button title="Accept" onPress={() => handleAccept(job.id)} variant="primary" style={{ flex: 1 }} />
              <Button title="Reject" onPress={() => handleReject(job.id)} variant="secondary" style={{ flex: 1 }} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCard: {
    margin: SIZES.medium,
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
  },
  statusText: {
    fontSize: FONTS.body4.fontSize,
    fontWeight: '500',
  },
  jobDetails: {
    marginBottom: SIZES.medium,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  jobDetailText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base,
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.primary,
  },
  viewButton: {
    width: '40%',
  },
});

export default WorkerJobsScreen; 