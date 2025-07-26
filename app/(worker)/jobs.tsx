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
  _id: string; // Add this line to fix the type error
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
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'Unknown' | 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled' | 'Worker Assigned';
  amount: number;
  phone: string;
}

type Style = StyleProp<ViewStyle | TextStyle>;

const WorkerJobsScreen = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Job['status'] | 'all'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [assignedBookings, setAssignedBookings] = useState<Job[]>([]);
  const [unassignedBookings, setUnassignedBookings] = useState<Job[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Job[]>([]);
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

  // Statuses as per backend
  const STATUS_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Worker Assigned', label: 'Assigned' },
    { key: 'Accepted', label: 'Accepted' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' },
  ];

  // Update filter logic to match backend status
  useEffect(() => {
    console.log('All jobs:', jobs.map(j => j.status));
    if (selectedStatus === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => {
        // Normalize both status and selectedStatus for robust matching
        const jobStatus = (job.status || '').toLowerCase().replace(/\s+/g, ' ').trim();
        const selected = (selectedStatus || '').toLowerCase().replace(/\s+/g, ' ').trim();
        return jobStatus === selected;
      }));
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
      const response = await axios.get(`${API_URL}/worker/bookings`, {
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
      const response = await axios.put(`${API_URL}/worker/bookings/${jobId}/accept`, {}, {
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
      const response = await axios.put(`${API_URL}/worker/bookings/${jobId}/reject`, {}, {
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
      const response = await axios.post(`${API_URL}/worker/jobs/${jobId}/start`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  const renderFilterDropdown = () => {
    if (!showFilterDropdown) return null;
    return (
      <View style={styles.dropdownOverlay}>
        <View style={styles.dropdownMenu}>
          {STATUS_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.dropdownItem,
                selectedStatus === option.key && styles.selectedDropdownItem
              ]}
              onPress={() => {
                setSelectedStatus(option.key as any);
                setShowFilterDropdown(false);
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                selectedStatus === option.key && styles.selectedDropdownItemText
              ]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.dropdownBackdrop} onPress={() => setShowFilterDropdown(false)} />
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
      <View style={styles.headerModern}>
        <Text style={styles.title}>My Jobs</Text>
        <TouchableOpacity onPress={() => setShowFilterDropdown((v: boolean) => !v)}>
          <Ionicons name="filter-outline" size={24} color={COLORS.primary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      {renderFilterDropdown()}
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
        {filteredJobs.map((job) => (
          <View key={job._id}>
            {renderJobCard(job)}
          </View>
        ))}
        {filteredJobs.length === 0 && (
          <Text style={styles.noJobs}>No jobs found</Text>
        )}
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
  headerModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBar: {
    backgroundColor: COLORS.background,
    marginBottom: SIZES.base,
  },
  filterPill: {
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.base,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: SIZES.base,
  },
  selectedFilterPill: {
    backgroundColor: COLORS.primary,
  },
  filterPillText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: FONTS.body2.fontSize,
  },
  selectedFilterPillText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    left: 16,
    zIndex: 10,
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 160,
    ...SHADOWS.medium,
    marginBottom: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  selectedDropdownItem: {
    backgroundColor: COLORS.primary + '15',
  },
  dropdownItemText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.body2.fontSize,
  },
  selectedDropdownItemText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
});

export default WorkerJobsScreen; 