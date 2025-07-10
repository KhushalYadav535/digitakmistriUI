import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
import axios from 'axios';

interface Job {
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  service: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'Unknown';
  amount: number;
  phone: string;
}

type Style = StyleProp<ViewStyle | TextStyle>;

const WorkerJobsScreen = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Job['status'] | 'all'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [assignedBookings, setAssignedBookings] = useState<Job[]>([]);
  const [unassignedBookings, setUnassignedBookings] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching assigned bookings...');
      const response = await axios.get(`${API_URL}/worker/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Assigned bookings response:', response.data);

      console.log('Fetching unassigned bookings...');
      const unassignedResponse = await axios.get(`${API_URL}/worker/unassigned-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Unassigned bookings response:', unassignedResponse.data);

      setAssignedBookings(response.data);
      setUnassignedBookings(unassignedResponse.data);
      setJobs([...response.data, ...unassignedResponse.data]);
    } catch (err: any) {
      console.error('Error fetching jobs:', err.response?.data || err.message);
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
      }
      setError('Failed to fetch jobs: ' + (err.response?.status || err.message));
    }
  };

  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchJobs();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.status === selectedStatus));
    }
  }, [selectedStatus, jobs]);

  const handleJobPress = (jobId: string) => {
    if (!jobId) {
      alert('Invalid job. Cannot show details.');
      return;
    }
    router.push({
      pathname: "/(worker)/job-details/[id]" as any,
      params: { id: jobId }
    });
  };

  const fetchAssignedBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching assigned bookings...');
      const response = await axios.get(`${API_URL}/booking/worker`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Assigned bookings response:', response.data);
      setAssignedBookings(response.data);
    } catch (err: any) {
      console.error('Assigned bookings fetch failed:', err.response?.data || err.message);
      setError('Failed to fetch assigned bookings: ' + (err.response?.status || err.message));
    }
  };

  const fetchUnassignedBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Fetching unassigned bookings...');
      const response = await axios.get(`${API_URL}/worker/unassigned-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Unassigned bookings response:', response.data);
      setUnassignedBookings(response.data);
    } catch (err: any) {
      console.error('Unassigned bookings fetch failed:', err.response?.data || err.message);
      setError('Failed to fetch unassigned bookings: ' + (err.response?.status || err.message));
    }
  };

  const handleAccept = async (jobId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Accepting job:', jobId);
      const response = await axios.put(`${API_URL}/worker/accept-booking/${jobId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Accept job response:', response.data);
      Alert.alert('Success', 'Job accepted successfully');
      fetchJobs();
    } catch (err: any) {
      console.error('Accept job error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to accept job');
    }
  };

  const handleReject = async (jobId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Rejecting job:', jobId);
      const response = await axios.post(`${API_URL}/booking/${jobId}/reject`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Reject job response:', response.data);
      Alert.alert('Success', 'Job rejected successfully');
      fetchJobs();
    } catch (err: any) {
      console.error('Reject job error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to reject job');
    }
  };

  const handleStart = async (jobId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Starting job:', jobId);
      const response = await axios.put(`${API_URL}/booking/${jobId}/status`, 
        { status: 'In Progress' },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Start job response:', response.data);
      Alert.alert('Success', 'Job started successfully');
      fetchJobs();
    } catch (err: any) {
      console.error('Start job error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to start job');
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'accepted':
        return COLORS.success;
      case 'in_progress':
        return COLORS.primary;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderFilterModal = () => {
    if (!showFilterModal) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Jobs</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedStatus === 'all' && styles.selectedFilter
              ]}
              onPress={() => {
                setSelectedStatus('all');
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedStatus === 'all' && styles.selectedFilterText
                ]}
              >
                All Jobs
              </Text>
            </TouchableOpacity>

            {(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  selectedStatus === status && styles.selectedFilter
                ]}
                onPress={() => {
                  setSelectedStatus(status);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedStatus === status && styles.selectedFilterText
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderJobCard = (job: Job) => {
    const address = job.address || {};
    const normalizedStatus = job.status.toLowerCase().replace('_', ' ');
    return (
      <Card key={job._id} variant="elevated" style={Array.isArray(styles.jobCard) ? styles.jobCard : [styles.jobCard]}>
        <View style={styles.jobHeader}>
          <View style={styles.jobInfo}>
            <Text style={styles.serviceTitle}>{job.service || job.serviceTitle}</Text>
            <Text style={styles.customerName}>{job.customer?.name || 'Customer'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
            <Text style={styles.statusText}>{job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' ')}</Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {address.street ? `${address.street}, ${address.city}, ${address.state} - ${address.pincode}` : 'Address not available'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {job.date ? new Date(job.date).toLocaleDateString() : 'Date not available'} at {job.time || 'Time not available'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>₹{job.amount || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.jobActions}>
          {normalizedStatus === 'pending' && (
            <>
              <Button
                title="Accept"
                onPress={() => handleAccept(job._id)}
                variant="primary"
                style={styles.actionButton}
              />
              <Button
                title="Reject"
                onPress={() => handleReject(job._id)}
                variant="outline"
                style={styles.actionButton}
              />
            </>
          )}
          {normalizedStatus === 'accepted' && (
            <Button
              title="Start Job"
              onPress={() => handleStart(job._id)}
              variant="primary"
              style={styles.actionButton}
            />
          )}
          <Button
            title="View Details"
            onPress={() => handleJobPress(job._id)}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
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
        <View style={styles.header}>
          <Text style={styles.title}>My Jobs</Text>
          <TouchableOpacity 
            style={styles.filterContainer}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {filteredJobs.map((job) => (
          <View key={job._id}>
            {renderJobCard(job)}
          </View>
        ))}
        {filteredJobs.length === 0 && (
          <Text style={styles.noJobs}>No jobs found</Text>
        )}
      </ScrollView>
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  filterContainer: {
    marginTop: SIZES.base,
  },
  filterOptions: {
    flexDirection: 'row',
    paddingVertical: SIZES.base,
  },
  filterOption: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    marginRight: SIZES.base,
    backgroundColor: COLORS.lightGray,
  },
  selectedFilter: {
    backgroundColor: COLORS.primary,
  },
  filterOptionText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  selectedFilterText: {
    color: COLORS.white,
  },
  jobCard: {
    margin: SIZES.base,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  jobInfo: {
    flex: 1,
  },
  serviceTitle: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
  },
  customerName: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
  },
  statusText: {
    ...FONTS.body4,
    color: COLORS.white,
  },
  jobDetails: {
    marginTop: SIZES.base,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  detailText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SIZES.base / 2,
  },
  noJobs: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.medium * 2,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.medium,
    padding: SIZES.medium,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SIZES.base,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
});

export default WorkerJobsScreen; 