import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

interface WorkerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  services: string[];
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  isVerified: boolean;
  isAvailable: boolean;
}

const WorkerProfileScreen = () => {
  const [worker, setWorker] = React.useState<WorkerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { logout } = useAuth();

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Calling /api/worker/profile...'); // Log before API call
        const token = await AsyncStorage.getItem('token');
        console.log('TOKEN USED FOR PROFILE FETCH:', token);
        const url = `${API_URL}/worker/profile`;
        console.log('FETCHING PROFILE FROM:', url);
        const res = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.data) throw new Error('Failed to fetch profile');
        console.log('WORKER PROFILE API RESPONSE:', res.data); // Debug log
        setWorker(res.data);
        await AsyncStorage.setItem('worker', JSON.stringify(res.data));
      } catch (e: any) {
        console.log('PROFILE FETCH ERROR:', e);
        setWorker(null);
        setLoading(false);
        Alert.alert('Profile fetch error: ' + (e?.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditProfile = React.useCallback(() => {
    router.push('/(worker)/edit-profile' as any);
  }, []);

  const handleLogout = React.useCallback(async () => {
    console.log('Worker profile logout initiated');
    await logout();
    // AuthContext will handle the redirect to role selection
  }, [logout]);

  const renderContent = React.useCallback(() => {
    if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;
    if (!worker) return <View style={styles.container}><Text>No worker data found.</Text></View>;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: worker.isVerified ? COLORS.success : COLORS.error },
                ]}
              />
              <Text style={styles.statusText}>
                {worker.isVerified ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.service}>{worker.services?.join(', ') || 'No services'}</Text>
        </View>

        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push({
              pathname: "/(worker)/profile-dashboard"
            } as any)}
          >
            <Ionicons name="stats-chart-outline" size={24} color={COLORS.primary} />
            <Text style={styles.navButtonText}>Profile Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
            <Text style={styles.navButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Card variant="elevated" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.totalBookings}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.completedBookings}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.isAvailable ? 'Yes' : 'No'}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{worker.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{worker.phone}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="construct-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{worker.services?.join(', ') || 'No services'}</Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsAmount}>₹{worker.totalEarnings}</Text>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
          </View>
        </Card>

        <View style={styles.footer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    );
  }, [worker, loading, handleEditProfile, handleLogout]);

  return renderContent();
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  editButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    marginBottom: SIZES.medium,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.medium,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
    ...SHADOWS.small,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.base / 2,
  },
  statusText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  service: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  statsCard: {
    margin: SIZES.medium,
    padding: SIZES.medium,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.base / 2,
  },
  statLabel: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  section: {
    margin: SIZES.medium,
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  infoList: {
    gap: SIZES.medium,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base,
  },
  earningsContainer: {
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  earningsLabel: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SIZES.medium,
  },
  logoutButton: {
    width: '100%',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    gap: SIZES.base,
  },
  navButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.body3.fontSize,
    fontWeight: '500',
  },
});

export default WorkerProfileScreen; 