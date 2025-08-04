import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import { API_URL } from '../../constants/config';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useLanguage } from '../../context/LanguageContext';

interface JobDetails {
  id: string;
  service: string;
  status: string;
  customer: {
    name: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  date: string;
  time: string;
  amount: number;
  workerPayment?: number;
  worker?: any; // Added to fix type error
}

const JobDetailsScreen = () => {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>("idle");
  const [paymentMessage, setPaymentMessage] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  useEffect(() => {
    // Connect to Socket.IO server once
    const socket = io(API_URL.replace(/\/api.*/, ''));
    socketRef.current = socket;

    socket.on('connect', () => {
      // console.log('Connected to socket.io server');
    });
    socket.on('payment-status', (data) => {
      if (data && data.jobId == id) {
        setPaymentStatus(data.status);
        setPaymentMessage(data.message || '');
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleDemoPayment = async () => {
    setPaymentStatus('processing');
    setPaymentMessage('Processing payment...');
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId'); // Adjust if you store differently
      const response = await axios.post(`${API_URL}/fake-payment/start`, {
        jobId: id,
        userId: userId || 'demo-user',
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Wait for real-time status from socket.io
    } catch (err: any) {
      setPaymentStatus('error');
      setPaymentMessage('Payment initiation failed');
    }
  };

  const normalizeJob = (data: any) => ({
    ...data,
    service: data.service || data.serviceTitle || data.serviceType || '',
    date: data.date || data.bookingDate || '',
    time: data.time || data.bookingTime || '',
    status: typeof data.status === 'string' ? data.status.toLowerCase() : '',
    amount: data.amount || 0,
    workerPayment: data.workerPayment || data.amount || 0,
    customer: data.customer || { name: '', phone: '' },
    address: data.address || { street: '', city: '', state: '', pincode: '' }
  });

  const fetchJobDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      let response;
      try {
        response = await axios.get(`${API_URL}/worker/bookings/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setJob(normalizeJob(response.data));
        setError(null);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          try {
            response = await axios.get(`${API_URL}/worker/unassigned-bookings/${id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            setJob(normalizeJob(response.data));
            setError(null);
          } catch (unassignedErr: any) {
            setError(unassignedErr.response?.data?.message || 'Failed to fetch job details');
          }
        } else {
          setError(err.response?.data?.message || 'Failed to fetch job details');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleAccept = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}/worker/bookings/${id}/accept`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Accept job response:', response.data);
      // Refresh job details after accepting
      await fetchJobDetails();
      Alert.alert('Success', 'Job accepted successfully');
    } catch (err: any) {
      console.error('Accept job error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to accept job');
    }
  };


  const handleReject = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/worker/bookings/${id}/reject`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      Alert.alert('Success', 'Job rejected successfully');
      // Navigate back to jobs list after a short delay
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err: any) {
      console.error('Reject job error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to reject job');
    }
  };


  const handleJobAction = async (action: 'start' | 'cancel') => {
    try {
      const token = await AsyncStorage.getItem('token');
      let endpoint = '';

      switch (action) {
        case 'start':
          endpoint = `/worker/jobs/${id}/start`;
          break;
        case 'cancel':
          endpoint = `/worker/jobs/${id}/cancel`;
          break;
      }

      const response = await axios.post(`${API_URL}${endpoint}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log(`${action} job response:`, response.data);
      await fetchJobDetails(); // Refresh job details
      Alert.alert('Success', `Job ${action}ed successfully`);
    } catch (err: any) {
      console.error(`${action} job error:`, err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || `Failed to ${action} job`);
    }
  };

  // Request OTP from backend
  const handleRequestCompletion = async () => {
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}/bookings/${id}/request-completion`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Handle different response formats
      if (response.data.emailConfigured === false) {
        // Email not configured - show OTP in success message
        setOtpSuccess(`OTP generated: ${response.data.otp}. Email not configured.`);
        console.log('Generated OTP:', response.data.otp);
      } else {
        // Email configured and sent
        setOtpSuccess('OTP sent to customer email.');
      }
    } catch (err: any) {
      console.error('Request completion error:', err.response?.data || err.message);
      setOtpError(err.response?.data?.message || 'Failed to request completion');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and complete booking
  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}/bookings/${id}/verify-completion`, { otp }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOtpSuccess('Job completed successfully!');
      setJob(response.data); // Update job status
      setTimeout(() => {
        setOtpModalVisible(false);
        setOtp('');
        setOtpSuccess('');
        // Navigate to worker dashboard after completion
        router.replace('/(worker)/dashboard');
      }, 1200);
      Alert.alert('Success', 'Job completed successfully!');
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return COLORS.textSecondary;
    
    switch (status.toLowerCase()) {
      case 'pending':
        return COLORS.warning;
      case 'accepted':
        return COLORS.primary;
      case 'in_progress':
        return COLORS.info;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  if (loading) return <View style={styles.container}><Text>{t('loading')}</Text></View>;
  if (error) return <View style={styles.container}><Text>{error}</Text></View>;
  if (!job) return <View style={styles.container}><Text>{t('worker.job_not_found')}</Text></View>;

  // Normalize status for UI logic
  const normalizedStatus = (job && typeof job.status === 'string' ? job.status : '').toLowerCase().replace(/\s+/g, '_');
  console.log('Job status:', job.status, 'Job object:', job);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('worker.job_details')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('worker.service_details')}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('worker.service_type')}:</Text>
            <Text style={styles.value}>{job.service}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('worker.status')}:</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(job.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' ') : t('worker.unknown')}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('worker.amount')}:</Text>
            <Text style={styles.value}>₹{job.workerPayment || job.amount}</Text>
          </View>

        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('worker.customer_details')}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('worker.name')}:</Text>
            <Text style={styles.value}>{job.customer?.name || '-'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('worker.phone')}:</Text>
            <Text style={styles.value}>{job.customer?.phone || '-'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('worker.job_details_section')}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('worker.address')}:</Text>
            <Text style={styles.value}>
              {job.address?.street || ''}, {job.address?.city || ''}, {job.address?.state || ''} - {job.address?.pincode || ''}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('worker.date')}:</Text>
            <Text style={styles.value}>{job.date ? new Date(job.date).toLocaleDateString() : ''}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('worker.time')}:</Text>
            <Text style={styles.value}>{job.time}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {normalizedStatus === 'completed' && (
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <Text style={{ color: COLORS.success, fontWeight: 'bold', fontSize: 18 }}>Job is completed.</Text>
            </View>
          )}
          {(normalizedStatus === 'pending' || !job.worker) && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAccept}
                disabled={normalizedStatus === 'completed'}
              >
                <Text style={styles.actionButtonText}>Accept Job</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={normalizedStatus === 'completed'}
              >
                <Text style={styles.actionButtonText}>Reject Job</Text>
              </TouchableOpacity>
            </>
          )}
          {!!(['accepted', 'worker_assigned', 'in_progress'].includes(normalizedStatus)) && (
            <>
              {['accepted', 'worker_assigned'].includes(normalizedStatus) && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.startButton]}
                  onPress={() => handleJobAction('start')}
                  disabled={normalizedStatus === 'completed'}
                >
                  <Text style={styles.actionButtonText}>Start Job</Text>
                </TouchableOpacity>
              )}
              {normalizedStatus === 'in_progress' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={async () => {
                    setOtpModalVisible(true);
                    await handleRequestCompletion();
                  }}
                  disabled={otpLoading}
                >
                  <Text style={styles.actionButtonText}>{otpLoading ? 'Requesting...' : 'Request Completion'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleJobAction('cancel')}
                disabled={normalizedStatus === 'completed'}
              >
                <Text style={styles.actionButtonText}>Cancel Job</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <Modal
        visible={otpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008' }}>
          <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Enter OTP</Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }}
            />
            {otpError ? <Text style={{ color: 'red', marginBottom: 8 }}>{otpError}</Text> : null}
            {otpSuccess ? <Text style={{ color: 'green', marginBottom: 8 }}>{otpSuccess}</Text> : null}
            <TouchableOpacity
              style={{ backgroundColor: COLORS.success, padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
              onPress={handleVerifyOtp}
              disabled={otpLoading || !otp}
            >
              {otpLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Verify OTP & Complete</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOtpModalVisible(false)} style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.error }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  acceptButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
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