import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { API_URL } from '../constants/config';

interface WorkerRating {
  workerId: string;
  workerName: string;
  workerEmail: string;
  workerPhone: string;
  isVerified: boolean;
  isAvailable: boolean;
  services: string[];
  stats: {
    totalRatings: number;
    averageRating: number;
    ratingBreakdown: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    reviewCount: number;
    totalBookings: number;
    completedBookings: number;
    totalEarnings: number;
  };
  recentReviews: any[];
  allRatings: any[];
}

interface WorkerRatingsData {
  totalWorkers: number;
  workers: WorkerRating[];
}

const AdminWorkerRatingsScreen = () => {
  const [ratingsData, setRatingsData] = useState<WorkerRatingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<WorkerRating | null>(null);

  const fetchWorkerRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== ADMIN WORKER RATINGS API CALL ===');
      const token = await AsyncStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = `${API_URL}/admin/worker-ratings`;
      console.log('Making API call to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Worker ratings data received:', data);
      setRatingsData(data);
    } catch (err: any) {
      console.error('Error fetching worker ratings:', err);
      setError(err.message || 'Failed to fetch worker ratings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchWorkerRatings();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        console.log('Admin auth check - Token exists:', !!token);
        console.log('Admin auth check - User exists:', !!userStr);
        
        if (!token || !userStr) {
          setError('Please login as admin first');
          return;
        }
        
        const user = JSON.parse(userStr);
        console.log('Admin user:', user);
        
        fetchWorkerRatings();
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication error');
      }
    };
    
    checkAuthAndFetch();
  }, []);

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={COLORS.warning}
          />
        ))}
      </View>
    );
  };

  const renderWorkerCard = ({ item }: { item: WorkerRating }) => (
    <Card style={styles.workerCard}>
      <View style={styles.workerHeader}>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{item.workerName}</Text>
          <Text style={styles.workerEmail}>{item.workerEmail}</Text>
          <Text style={styles.workerPhone}>{item.workerPhone}</Text>
          <View style={styles.workerStatus}>
            <View style={[styles.statusBadge, { backgroundColor: item.isVerified ? COLORS.success + '20' : COLORS.error + '20' }]}>
              <Text style={[styles.statusText, { color: item.isVerified ? COLORS.success : COLORS.error }]}>
                {item.isVerified ? 'Verified' : 'Unverified'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.isAvailable ? COLORS.success + '20' : COLORS.error + '20' }]}>
              <Text style={[styles.statusText, { color: item.isAvailable ? COLORS.success : COLORS.error }]}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.ratingInfo}>
          <Text style={styles.ratingValue}>
            {item.stats.averageRating.toFixed(1)}
          </Text>
          {renderStars(Math.round(item.stats.averageRating))}
          <Text style={styles.ratingCount}>
            {item.stats.totalRatings} ratings
          </Text>
        </View>
      </View>

      <View style={styles.workerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Bookings</Text>
          <Text style={styles.statValue}>{item.stats.totalBookings}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={styles.statValue}>{item.stats.completedBookings}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Earnings</Text>
          <Text style={styles.statValue}>₹{item.stats.totalEarnings}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Reviews</Text>
          <Text style={styles.statValue}>{item.stats.reviewCount}</Text>
        </View>
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.servicesLabel}>Services:</Text>
        <View style={styles.servicesList}>
          {item.services.map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() => setSelectedWorker(item)}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </Card>
  );

  const renderWorkerDetails = (worker: WorkerRating) => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{worker.workerName}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedWorker(null)}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Contact Information</Text>
            <Text style={styles.detailText}>Email: {worker.workerEmail}</Text>
            <Text style={styles.detailText}>Phone: {worker.workerPhone}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Rating Summary</Text>
            <View style={styles.ratingSummary}>
              <Text style={styles.overallRating}>{worker.stats.averageRating.toFixed(1)}</Text>
              {renderStars(Math.round(worker.stats.averageRating), 20)}
              <Text style={styles.totalRatings}>{worker.stats.totalRatings} total ratings</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Rating Breakdown</Text>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{rating}★</Text>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[
                      styles.breakdownBarFill, 
                      { 
                        width: `${(worker.stats.ratingBreakdown[rating as keyof typeof worker.stats.ratingBreakdown] || 0) / worker.stats.totalRatings * 100}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.breakdownCount}>
                  {worker.stats.ratingBreakdown[rating as keyof typeof worker.stats.ratingBreakdown] || 0}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Performance Stats</Text>
            <View style={styles.performanceStats}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Total Bookings</Text>
                <Text style={styles.performanceValue}>{worker.stats.totalBookings}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Completed Jobs</Text>
                <Text style={styles.performanceValue}>{worker.stats.completedBookings}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Completion Rate</Text>
                <Text style={styles.performanceValue}>
                  {worker.stats.totalBookings > 0 
                    ? `${((worker.stats.completedBookings / worker.stats.totalBookings) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceLabel}>Total Earnings</Text>
                <Text style={styles.performanceValue}>₹{worker.stats.totalEarnings}</Text>
              </View>
            </View>
          </View>

          {worker.recentReviews.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Recent Reviews</Text>
              {worker.recentReviews.map((review, index) => (
                <Card key={index} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewService}>{review.serviceTitle}</Text>
                    <View style={styles.reviewRating}>
                      {renderStars(review.rating, 14)}
                      <Text style={styles.reviewRatingText}>{review.rating}/5</Text>
                    </View>
                  </View>
                  {review.review && (
                    <Text style={styles.reviewText}>"{review.review}"</Text>
                  )}
                  <Text style={styles.reviewCustomer}>- {review.customerName}</Text>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading worker ratings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              fetchWorkerRatings();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/admin-login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Ratings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Summary Stats */}
      {ratingsData && (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Statistics</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{ratingsData.totalWorkers}</Text>
              <Text style={styles.summaryLabel}>Total Workers</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {ratingsData.workers.filter(w => w.stats.totalRatings > 0).length}
              </Text>
              <Text style={styles.summaryLabel}>Rated Workers</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {ratingsData.workers.length > 0 
                  ? (ratingsData.workers.reduce((sum, w) => sum + w.stats.averageRating, 0) / ratingsData.workers.filter(w => w.stats.totalRatings > 0).length).toFixed(1)
                  : '0.0'
                }
              </Text>
              <Text style={styles.summaryLabel}>Avg Rating</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Workers List */}
      <FlatList
        data={ratingsData?.workers || []}
        renderItem={renderWorkerCard}
        keyExtractor={(item) => item.workerId}
        style={styles.workersList}
        contentContainerStyle={styles.workersListContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Workers Found</Text>
            <Text style={styles.emptyText}>
              There are no workers with ratings yet.
            </Text>
          </View>
        }
      />

      {/* Worker Details Modal */}
      {selectedWorker && renderWorkerDetails(selectedWorker)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
  },
  summaryTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    marginBottom: 15,
    color: COLORS.text,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  workersList: {
    flex: 1,
  },
  workersListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  workerCard: {
    marginBottom: 15,
    padding: 15,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  workerEmail: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  workerPhone: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  workerStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONTS.body4.fontSize,
    fontWeight: '600',
  },
  ratingInfo: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  workerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
    color: COLORS.text,
  },
  servicesContainer: {
    marginBottom: 15,
  },
  servicesLabel: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  serviceText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.primary,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  viewDetailsText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.primary,
    fontWeight: '600',
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
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    marginBottom: 10,
    color: COLORS.text,
  },
  detailText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  ratingSummary: {
    alignItems: 'center',
    marginBottom: 15,
  },
  overallRating: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  totalRatings: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    width: 30,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 4,
  },
  breakdownCount: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  performanceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  performanceItem: {
    flex: 1,
    minWidth: '45%',
  },
  performanceLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewCard: {
    marginBottom: 10,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewService: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.primary,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  reviewCustomer: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    marginTop: 20,
  },
  errorText: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.error,
    marginTop: 20,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
  },
});

export default AdminWorkerRatingsScreen; 