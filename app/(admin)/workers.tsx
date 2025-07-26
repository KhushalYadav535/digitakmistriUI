import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import axios from 'axios';
import { API_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Worker {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  services: string[];
  stats: {
    totalBookings: number;
    completedBookings: number;
    totalEarnings: number;
  };
}

const AdminWorkersScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      console.log('Checking auth - Token exists:', !!token);
      console.log('Checking auth - User data exists:', !!userStr);
      
      if (!token || !userStr) {
        console.log('No token or user data found');
        router.replace('/(auth)/admin-login' as any);
        return null;
      }

      let user = null;
      if (userStr) {
        user = JSON.parse(userStr);
        console.log('User data:', user);
        console.log('User role:', user.role);
        if (user.role !== 'admin') {
          console.log('User is not admin');
          Alert.alert('Access Denied', 'You must be an admin to access this page');
          router.replace('/(auth)/admin-login' as any);
          return null;
        }
      }
      
      console.log('Auth check passed');
      return token;
    } catch (err) {
      console.error('Error checking auth:', err);
      router.replace('/(auth)/admin-login' as any);
      return null;
    }
  };

  const handleAuthError = async (error: any) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 401) {
        // Token expired or invalid
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          router.replace('/(auth)/login' as any);
          return;
        }

        // Try to refresh token or verify if user is still admin
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            // If user is admin but token is invalid, try to get a new token
            try {
              const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              await AsyncStorage.setItem('token', response.data.token);
              return response.data.token;
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
        }
        
        // If we get here, we need to log out
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/(auth)/admin-login' as any);
      } else if (status === 403) {
        Alert.alert('Access Denied', message || 'You must be an admin to access this page');
        router.replace('/(tabs)' as any);
      } else {
        setError(message || 'An error occurred');
      }
    } else {
      setError('An unexpected error occurred');
    }
    return null;
  };

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = await checkAuth();
      if (!token) return;

      console.log('Fetching workers with token');
      const response = await axios.get(`${API_URL}/admin/workers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Workers fetched successfully');
      console.log('Workers data:', response.data);
      console.log('Number of workers:', response.data.length);
      if (response.data.length > 0) {
        console.log('First worker _id:', response.data[0]._id);
        console.log('First worker structure:', Object.keys(response.data[0]));
      }
      setWorkers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching workers:', err);
      await handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleApprove = async (workerId: string) => {
    try {
      const token = await checkAuth();
      if (!token) return;

      await axios.put(
        `${API_URL}/admin/workers/${workerId}`,
        { isVerified: true },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      Alert.alert('Success', 'Worker approved successfully');
      fetchWorkers();
    } catch (err) {
      console.error('Error approving worker:', err);
      await handleAuthError(err);
    }
  };

  const handleReject = async (workerId: string) => {
    try {
      const token = await checkAuth();
      if (!token) return;

      await axios.delete(`${API_URL}/admin/workers/${workerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Alert.alert('Success', 'Worker rejected and removed');
      fetchWorkers();
    } catch (err) {
      console.error('Error rejecting worker:', err);
      await handleAuthError(err);
    }
  };

  const handleBlock = async (workerId: string) => {
    try {
      const token = await checkAuth();
      if (!token) return;

      await axios.put(
        `${API_URL}/admin/workers/${workerId}`,
        { isVerified: false },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      Alert.alert('Success', 'Worker blocked successfully');
      fetchWorkers();
    } catch (err) {
      console.error('Error blocking worker:', err);
      await handleAuthError(err);
    }
  };

  const handleWorkerPress = (workerId: string) => {
    console.log('=== WORKER PRESS DEBUG ===');
    console.log('Worker ID being passed:', workerId);
    console.log('Worker ID type:', typeof workerId);
    console.log('Worker ID length:', workerId?.length);
    
    if (!workerId) {
      console.error('Worker ID is undefined or empty!');
      return;
    }
    
    router.push({
      pathname: '/(admin)/worker-detail' as any,
      params: { id: workerId }
    });
  };

  // Show all workers, only filter by search query (not by status)
  const filteredWorkers = workers.filter((worker) =>
    (worker.name && worker.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (worker.services && worker.services.some(service => 
      service && service.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchWorkers}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.retryButton, {marginTop: 10, backgroundColor: COLORS.error}]} onPress={() => router.replace('/(auth)/admin-login' as any)}>
          <Text style={styles.retryButtonText}>Go to Admin Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Worker Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-worker' as any)}
        >
          <Ionicons name="add-circle" size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Add Worker</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search workers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'pending' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('pending')}
        >
          <Text style={[styles.filterText, selectedFilter === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'active' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('active')}
        >
          <Text style={[styles.filterText, selectedFilter === 'active' && styles.filterTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {filteredWorkers.map((worker) => (
          <TouchableOpacity
            key={worker._id}
            activeOpacity={0.85}
            onPress={() => handleWorkerPress(worker._id)}
          >
            <Card
              variant="elevated"
              style={styles.workerCard}
            >
              <View style={styles.workerHeader}>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <Text style={styles.workerService}>
                    {Array.isArray(worker.services) ? worker.services.join(', ') : ''}
                  </Text>
                </View>
                <View style={styles.workerStats}>
                  <Text style={styles.workerRating}>
                    {worker.stats.completedBookings} jobs
                  </Text>
                  <Text style={styles.workerJobs}>
                    ₹{worker.stats.totalEarnings}
                  </Text>
                </View>
              </View>

              <View style={styles.workerActions}>
                {!worker.isVerified ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleApprove(worker._id);
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleReject(worker._id);
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color={COLORS.white} />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.blockButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleBlock(worker._id);
                    }}
                  >
                    <Ionicons name="ban" size={20} color={COLORS.white} />
                    <Text style={styles.actionButtonText}>Block</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.body2.fontSize,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body2.fontSize,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  title: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
  },
  addButtonText: {
    color: COLORS.white,
    marginLeft: SIZES.base,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: SIZES.medium,
    padding: SIZES.base,
    borderRadius: SIZES.base,
    ...SHADOWS.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.base,
    fontSize: FONTS.body3.fontSize,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  filterButton: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    marginRight: SIZES.base,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  content: {
    padding: SIZES.medium,
  },
  workerCard: {
    marginBottom: SIZES.medium,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.medium,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  workerService: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginTop: SIZES.base / 2,
  },
  workerStats: {
    alignItems: 'flex-end',
  },
  workerRating: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  workerJobs: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginTop: SIZES.base / 2,
  },
  workerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SIZES.base,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  blockButton: {
    backgroundColor: COLORS.warning,
  },
  actionButtonText: {
    color: COLORS.white,
    marginLeft: SIZES.base,
    fontWeight: '500',
  },
});

export default AdminWorkersScreen;