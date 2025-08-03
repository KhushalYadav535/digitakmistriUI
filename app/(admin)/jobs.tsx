import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Job {
  _id: string;
  service: string;
  customer: any;
  assignedWorker: any;
  status: string;
  details?: string;
  createdAt: string;
  acceptedAt?: string;
  booking?: any;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#FFA500', // orange
  Accepted: '#4CAF50', // green
  'In Progress': '#2196F3', // blue
  Completed: '#1976D2', // darker blue
  Rejected: '#F44336', // red
  Cancelled: '#F44336', // red
};

function getStatusColor(status: string) {
  return STATUS_COLORS[status] || '#AAA';
}

const AdminJobsScreen = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${'https://digital-mistri.onrender.com'}/api/jobs/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort jobs by creation date (newest first)
        const sortedJobs = res.data.sort((a: Job, b: Job) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
        
        setJobs(sortedJobs);
      } catch (e) {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>All Bookings / Jobs</Text>
      {loading && <ActivityIndicator color={COLORS.primary} size="large" style={{marginTop: 20}} />}
      {jobs.map(job => (
        <View key={job._id} style={[styles.cleanCard, { borderLeftColor: COLORS.primary }]}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Service: <Text style={styles.value}>{job.service}</Text></Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
              <Text style={styles.statusText}>{job.status}</Text>
            </View>
          </View>
          <Text style={styles.label}>Customer: <Text style={styles.value}>{job.customer?.name || job.customer}</Text></Text>
          <Text style={styles.label}>Assigned Worker: <Text style={styles.value}>{
            job.assignedWorker
              ? (typeof job.assignedWorker === 'object' && (job.assignedWorker as any).name
                  ? (job.assignedWorker as any).name
                  : typeof job.assignedWorker === 'string'
                    ? job.assignedWorker
                    : '-')
              : '-'
          }</Text></Text>
          {/* Details section */}
          {job.details && typeof job.details === 'object' ? (
            <>
              <Text style={styles.label}>Service Title: <Text style={styles.value}>{(job.details as any).serviceTitle || '-'}</Text></Text>
              <Text style={styles.label}>Date: <Text style={styles.value}>{(job.details as any).date || '-'}</Text></Text>
              <Text style={styles.label}>Time: <Text style={styles.value}>{(job.details as any).time || '-'}</Text></Text>
              <Text style={styles.label}>Address: <Text style={styles.value}>{(job.details as any).address ? `${(job.details as any).address.street}, ${(job.details as any).address.city}, ${(job.details as any).address.state} - ${(job.details as any).address.pincode}` : '-'}</Text></Text>
              <Text style={styles.label}>Phone: <Text style={styles.value}>{(job.details as any).phone || '-'}</Text></Text>
            </>
          ) : (
            <Text style={styles.label}>Details: <Text style={styles.value}>{job.details || '-'}</Text></Text>
          )}
          {job.booking && (
            <>
              <Text style={styles.label}>Booking Date: <Text style={styles.value}>{job.booking.bookingDate ? new Date(job.booking.bookingDate).toLocaleDateString() : '-'}</Text></Text>
              <Text style={styles.label}>Booking Time: <Text style={styles.value}>{job.booking.bookingTime || '-'}</Text></Text>
              <Text style={styles.label}>Amount: <Text style={styles.amountValue}>
                ₹{(job.booking && job.booking.amount)
                  ? job.booking.amount
                  : (job.details && typeof job.details === 'object' && (job.details as any).amount ? (job.details as any).amount : '-')}
              </Text></Text>
            </>
          )}
          <Text style={styles.label}>Created At: <Text style={styles.value}>{new Date(job.createdAt).toLocaleString()}</Text></Text>
          {job.acceptedAt && <Text style={styles.label}>Accepted At: <Text style={styles.value}>{new Date(job.acceptedAt).toLocaleString()}</Text></Text>}
        </View>
      ))}
      {!loading && jobs.length === 0 && <Text style={styles.noJobs}>No jobs found.</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7', padding: SIZES.medium },
  header: { fontSize: FONTS.h2.fontSize, fontWeight: 'bold', marginBottom: SIZES.medium, color: COLORS.primary },
  cleanCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: SIZES.medium,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    minWidth: 70,
  },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  label: { fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 2, fontSize: 15 },
  value: { fontWeight: 'normal', color: COLORS.textPrimary, fontSize: 15 },
  amountValue: { fontWeight: 'bold', color: '#388E3C', fontSize: 15 },
  noJobs: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 16 },
});

export default AdminJobsScreen;
