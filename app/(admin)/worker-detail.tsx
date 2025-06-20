import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import axios from 'axios';
import { API_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkerDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('=== WORKER DETAIL DEBUG ===');
        console.log('Worker ID:', id);
        console.log('API_URL:', API_URL);
        
        if (!id) {
          setError('Worker ID is missing');
          setLoading(false);
          return;
        }
        
        const token = await AsyncStorage.getItem('token');
        console.log('Token exists:', !!token);
        console.log('Token length:', token?.length);
        
        if (!token) {
          setError('Authentication failed. Please login again.');
          setLoading(false);
          return;
        }
        
        const apiUrl = `${API_URL}/admin/workers/${id}`;
        console.log('Making request to:', apiUrl);
        
        // Add timeout to prevent infinite loading
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        });
        console.log('Worker data received:', res.data);
        setWorker(res.data);
      } catch (err: any) {
        console.error('=== WORKER DETAIL ERROR ===');
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);
        console.error('Error code:', err.code);
        console.error('Error response status:', err.response?.status);
        console.error('Error response data:', err.response?.data);
        
        let errorMessage = 'Failed to load worker details';
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Worker not found';
        } else if (err.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (err.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your connection.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log('=== WORKER DETAIL LOADING COMPLETE ===');
      }
    };
    fetchWorker();
  }, [id]);

  const handleRetry = () => {
    setError('');
    setLoading(true);
    // Re-fetch worker data
    const fetchWorker = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const apiUrl = `${API_URL}/admin/workers/${id}`;
        const res = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        setWorker(res.data);
      } catch (err: any) {
        setError('Failed to load worker details');
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: COLORS.error, marginBottom: 20, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: COLORS.primary, 
            padding: 12, 
            borderRadius: 8,
            paddingHorizontal: 20,
            marginBottom: 10
          }} 
          onPress={handleRetry}
        >
          <Text style={{ color: COLORS.white, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
        {error.includes('Authentication failed') && (
          <TouchableOpacity 
            style={{ 
              backgroundColor: COLORS.error, 
              padding: 12, 
              borderRadius: 8,
              paddingHorizontal: 20
            }} 
            onPress={() => router.replace('/(auth)/admin-login' as any)}
          >
            <Text style={{ color: COLORS.white, fontWeight: '600' }}>Go to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  if (!worker) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Worker Details</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>
      </View>
      <Card variant="elevated" style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{worker.name}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{worker.email}</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{worker.phone || '-'}</Text>
        <Text style={styles.label}>Verified</Text>
        <Text style={styles.value}>{worker.isVerified ? 'Yes' : 'No'}</Text>
        <Text style={styles.label}>Services</Text>
        <Text style={styles.value}>{Array.isArray(worker.services) ? worker.services.join(', ') : '-'}</Text>
        <Text style={styles.label}>Total Bookings</Text>
        <Text style={styles.value}>{worker.stats?.totalBookings ?? '-'}</Text>
        <Text style={styles.label}>Completed Bookings</Text>
        <Text style={styles.value}>{worker.stats?.completedBookings ?? '-'}</Text>
        <Text style={styles.label}>Total Earnings</Text>
        <Text style={styles.value}>{worker.stats?.totalEarnings ?? '-'}</Text>
      </Card>
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
    justifyContent: 'space-between',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  title: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  card: {
    margin: SIZES.medium,
    padding: SIZES.medium,
  },
  label: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  value: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 2,
  },
});

export default WorkerDetailScreen;
