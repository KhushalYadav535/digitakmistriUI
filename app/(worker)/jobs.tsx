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
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

interface Job {
  _id: string;
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  service: string;
  serviceType?: string;
  serviceTitle?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  date?: string;
  bookingDate?: string;
  time?: string;
  bookingTime?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'Unknown' | 'Pending' | 'Confirmed' | 'Worker Assigned' | 'Accepted' | 'Rejected' | 'In Progress' | 'Completed' | 'Cancelled';
  amount: number;
  workerPayment?: number;
  phone: string;
}

const WorkerJobsScreen = () => {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Job['status'] | 'all'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [assignedBookings, setAssignedBookings] = useState<Job[]>([]);
  const [unassignedBookings, setUnassignedBookings] = useState<Job[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
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

      // Fetch completed bookings separately
      console.log('Fetching completed bookings...');
      const completedResponse = await axios.get(`${API_URL}/worker/completed-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Completed bookings response:', completedResponse.data);
      
      console.log('=== DEBUG: Job Status Analysis ===');
      console.log('Assigned bookings statuses:', response.data.map((job: any) => job.status));
      console.log('Unassigned bookings statuses:', unassignedResponse.data.map((job: any) => job.status));
      console.log('Completed bookings statuses:', completedResponse.data.bookings?.map((job: any) => job.status) || []);
      
      setAssignedBookings(response.data);
      setUnassignedBookings(unassignedResponse.data);
      setCompletedBookings(completedResponse.data.bookings || []);
      
      // Combine all jobs
      const allJobs = [...response.data, ...unassignedResponse.data, ...(completedResponse.data.bookings || [])];
      setJobs(allJobs);
      
    } catch (err: any) {
      console.error('Error fetching jobs:', err.response?.data || err.message);
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
      }
      setError('Failed to fetch jobs: ' + (err.response?.status || err.message));
    } finally {
      setLoading(false);
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

  // Statuses as per backend Booking model
  const STATUS_OPTIONS = [
    { key: 'all', label: t('worker.all_jobs') },
    { key: 'Pending', label: t('worker.pending') },
    { key: 'Confirmed', label: t('worker.confirmed') },
    { key: 'Worker Assigned', label: t('worker.worker_assigned') },
    { key: 'Accepted', label: t('worker.accepted') },
    { key: 'Rejected', label: t('worker.rejected') },
    { key: 'In Progress', label: t('worker.in_progress') },
    { key: 'Completed', label: t('worker.completed') },
    { key: 'Cancelled', label: t('worker.cancelled') },
  ];

  // Update filter logic to match backend status
  useEffect(() => {
    console.log('=== FILTER DEBUG ===');
    console.log('Selected status:', selectedStatus);
    console.log('Total jobs count:', jobs.length);
    console.log('All jobs with statuses:', jobs.map(j => ({ 
      id: j._id, 
      status: j.status,
      statusType: typeof j.status,
      serviceTitle: j.serviceTitle || j.serviceType || j.service
    })));
    
    if (selectedStatus === 'all') {
      console.log('Showing all jobs');
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => {
        const jobStatus = (job.status || '').toString().trim();
        const selectedStatusTrimmed = selectedStatus.toString().trim();
        const matches = jobStatus === selectedStatusTrimmed;
        console.log(`Job ${job._id}: status="${jobStatus}" (${typeof jobStatus}) vs selected="${selectedStatusTrimmed}" (${typeof selectedStatusTrimmed}) -> ${matches}`);
        return matches;
      });
      console.log('Filtered jobs count:', filtered.length);
      console.log('Filtered jobs:', filtered.map(j => ({ id: j._id, status: j.status })));
      setFilteredJobs(filtered);
    }
  }, [selectedStatus, jobs]);



  const handleJobPress = (jobId: string) => {
    if (!jobId) {
      alert(t('worker.invalid_job_message'));
      return;
    }
    router.push({
      pathname: "/(worker)/job-details/[id]" as any,
      params: { id: jobId }
    });
  };

  const handleAccept = async (jobId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Accepting job:', jobId);
      const response = await axios.put(`${API_URL}/worker/bookings/${jobId}/accept`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Accept job response:', response.data);
      Alert.alert(t('success'), t('worker.job_accepted_successfully'));
      fetchJobs();
    } catch (err: any) {
      console.error('Accept job error:', err.response?.data || err.message);
      Alert.alert(t('error'), err.response?.data?.message || t('worker.failed_to_accept_job'));
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
      Alert.alert(t('success'), t('worker.job_rejected_successfully'));
      fetchJobs();
    } catch (err: any) {
      console.error('Reject job error:', err.response?.data || err.message);
      Alert.alert(t('error'), err.response?.data?.message || t('worker.failed_to_reject_job'));
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
      Alert.alert(t('success'), t('worker.job_started_successfully'));
      fetchJobs();
    } catch (err: any) {
      console.error('Start job error:', err.response?.data || err.message);
      Alert.alert(t('error'), err.response?.data?.message || t('worker.failed_to_start_job'));
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'Pending':
        return COLORS.warning;
      case 'Confirmed':
        return COLORS.info;
      case 'Worker Assigned':
        return COLORS.primary;
      case 'Accepted':
        return COLORS.success;
      case 'Rejected':
        return COLORS.error;
      case 'In Progress':
        return COLORS.warning;
      case 'Completed':
        return COLORS.success;
      case 'Cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderFilterDropdown = () => {
    if (!showFilterDropdown) return null;
    console.log('Rendering dropdown with options:', STATUS_OPTIONS.map(opt => opt.key));
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
                console.log('Dropdown selected:', option.key, 'label:', option.label);
                console.log('Setting selectedStatus to:', option.key);
                setSelectedStatus(option.key as any);
                console.log('Dropdown will close now');
                setShowFilterDropdown(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dropdownItemText,
                selectedStatus === option.key && styles.selectedDropdownItemText
              ]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity 
          style={styles.dropdownBackdrop} 
          onPress={() => {
            console.log('Backdrop pressed, closing dropdown');
            setShowFilterDropdown(false);
          }} 
        />
      </View>
    );
  };

  const renderJobCard = (job: Job) => {
    const address = job.address || {};
    const serviceTitle = job.serviceTitle || job.serviceType || job.service || 'Unknown Service';
    const bookingDate = job.bookingDate || job.date;
    const bookingTime = job.bookingTime || job.time;
    
    return (
      <Card key={job._id} variant="elevated" style={Array.isArray(styles.jobCard) ? styles.jobCard : [styles.jobCard]}>
        <View style={styles.jobHeader}>
          <View style={styles.jobInfo}>
            <Text style={styles.serviceTitle}>{serviceTitle}</Text>
            <Text style={styles.customerName}>{job.customer?.name || t('worker.customer')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
            <Text style={styles.statusText}>{job.status}</Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {address.street ? `${address.street}, ${address.city}, ${address.state} - ${address.pincode}` : t('worker.address_not_available')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {bookingDate ? new Date(bookingDate).toLocaleDateString() : t('worker.date_not_available')} at {bookingTime || t('worker.time_not_available')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>₹{job.workerPayment || job.amount || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.jobActions}>
          {job.status === 'Pending' && (
            <>
              <Button
                title={t('worker.accept')}
                onPress={() => handleAccept(job._id)}
                variant="primary"
                style={styles.actionButton}
              />
              <Button
                title={t('worker.reject')}
                onPress={() => handleReject(job._id)}
                variant="outline"
                style={styles.actionButton}
              />
            </>
          )}
          {job.status === 'Accepted' && (
            <Button
              title={t('worker.start_job_button')}
              onPress={() => handleStart(job._id)}
              variant="primary"
              style={styles.actionButton}
            />
          )}
          <Button
            title={t('worker.view_details_button')}
            onPress={() => handleJobPress(job._id)}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerModern}>
          <Text style={styles.title}>{t('worker.my_jobs')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('worker.loading_jobs')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerModern}>
        <Text style={styles.title}>{t('worker.my_jobs')}</Text>
        <TouchableOpacity onPress={() => setShowFilterDropdown((v: boolean) => !v)}>
          <Ionicons name="filter-outline" size={24} color={COLORS.primary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      
      {/* Filter Status Display */}
      <View style={styles.filterStatusContainer}>
        <Text style={styles.filterStatusText}>
          {t('filter')}: {STATUS_OPTIONS.find(opt => opt.key === selectedStatus)?.label || t('worker.all_jobs')}
        </Text>
        <Text style={styles.filterCountText}>
          {filteredJobs.length} {t('of')} {jobs.length} {t('worker.jobs')}
        </Text>
      </View>
      

      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchJobs}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      )}
      
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
        {filteredJobs.length === 0 && !loading && (
          <View style={styles.noJobsContainer}>
            <Text style={styles.noJobs}>{t('worker.no_jobs_found')}</Text>
            <Text style={styles.noJobsSubtext}>
              {selectedStatus === 'all' ? t('worker.no_jobs_yet') : `${t('worker.no_jobs_with_status')} "${STATUS_OPTIONS.find(opt => opt.key === selectedStatus)?.label}"`}
            </Text>
          </View>
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
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
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
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    shadowColor: COLORS.black,
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
    borderRadius: SIZES.base,
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
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 160,
    ...SHADOWS.medium,
    marginBottom: 8,
    zIndex: 1001,
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.01)',
    zIndex: 999,
  },
  filterStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterStatusText: {
    ...FONTS.body3,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  filterCountText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  noJobsContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.medium * 2,
  },
  noJobsSubtext: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.base,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  loadingText: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: FONTS.h2.fontWeight,
    color: COLORS.textPrimary,
  },
  errorContainer: {
    padding: SIZES.medium,
    backgroundColor: COLORS.error + '20',
    borderRadius: SIZES.base,
    marginHorizontal: SIZES.medium,
    marginBottom: SIZES.base,
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: FONTS.body2.fontWeight,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  retryButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.large,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.base,
  },
  retryButtonText: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: FONTS.body2.fontWeight,
    color: COLORS.white,
  },
});

export default WorkerJobsScreen; 