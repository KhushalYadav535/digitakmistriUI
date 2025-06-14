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
        setJobs(res.data);
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
        <Card key={job._id} variant="elevated" style={styles.jobCard}>
          <Text style={styles.label}>Service: <Text style={styles.value}>{job.service}</Text></Text>
          <Text style={styles.label}>Customer: <Text style={styles.value}>{job.customer?.name || job.customer}</Text></Text>
          <Text style={styles.label}>Assigned Worker: <Text style={styles.value}>{job.assignedWorker?.name || '-'}</Text></Text>
          <Text style={styles.label}>Status: <Text style={styles.value}>{job.status}</Text></Text>
          <Text style={styles.label}>Details: <Text style={styles.value}>{job.details || '-'}</Text></Text>
          <Text style={styles.label}>Created At: <Text style={styles.value}>{new Date(job.createdAt).toLocaleString()}</Text></Text>
          {job.acceptedAt && <Text style={styles.label}>Accepted At: <Text style={styles.value}>{new Date(job.acceptedAt).toLocaleString()}</Text></Text>}
        </Card>
      ))}
      {!loading && jobs.length === 0 && <Text style={styles.noJobs}>No jobs found.</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.medium },
  header: { fontSize: FONTS.h2.fontSize, fontWeight: 'bold', marginBottom: SIZES.medium, color: COLORS.primary },
  jobCard: { marginBottom: SIZES.medium, padding: SIZES.medium },
  label: { fontWeight: 'bold', color: COLORS.textSecondary, marginBottom: 2 },
  value: { fontWeight: 'normal', color: COLORS.textPrimary },
  noJobs: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
});

export default AdminJobsScreen;
