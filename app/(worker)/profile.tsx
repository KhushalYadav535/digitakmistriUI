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
import { LinearGradient } from 'expo-linear-gradient';

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
        {/* Gradient Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitleGradient}>Profile</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Ionicons name="create-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/images/applogo.png')}
              style={styles.avatar}
            />
            <View style={styles.statusBadgeModern}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: worker.isVerified ? COLORS.success : COLORS.error },
                ]}
              />
              <Text style={styles.statusTextModern}>
                {worker.isVerified ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <Text style={styles.nameModern}>{worker.name}</Text>
          <Text style={styles.serviceModern}>{worker.services?.join(', ') || 'No services'}</Text>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtonsModern}>
          <TouchableOpacity 
            style={styles.navButtonModern}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
            <Text style={styles.navButtonTextModern}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <Card variant="elevated" style={styles.statsCardModern}>
          <View style={styles.statsRowModern}>
            <View style={styles.statItemModern}>
              <Text style={styles.statValueModern}>{worker.totalBookings}</Text>
              <Text style={styles.statLabelModern}>Total Jobs</Text>
            </View>
            <View style={styles.statDividerModern} />
            <View style={styles.statItemModern}>
              <Text style={styles.statValueModern}>{worker.completedBookings}</Text>
              <Text style={styles.statLabelModern}>Completed</Text>
            </View>
            <View style={styles.statDividerModern} />
            <View style={styles.statItemModern}>
              <Text style={styles.statValueModern}>{worker.isAvailable ? 'Yes' : 'No'}</Text>
              <Text style={styles.statLabelModern}>Available</Text>
            </View>
          </View>
        </Card>

        {/* Personal Info Card */}
        <Card variant="elevated" style={styles.sectionModern}>
          <Text style={styles.sectionTitleModern}>Personal Information</Text>
          <View style={styles.infoListModern}>
            <View style={styles.infoItemModern}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoTextModern}>{worker.email}</Text>
            </View>
            <View style={styles.infoItemModern}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoTextModern}>{worker.phone}</Text>
            </View>
            <View style={styles.infoItemModern}>
              <Ionicons name="construct-outline" size={20} color={COLORS.primary} />
              <Text style={styles.infoTextModern}>{worker.services?.join(', ') || 'No services'}</Text>
            </View>
          </View>
        </Card>

        {/* Earnings Card */}
        <Card variant="elevated" style={styles.sectionModern}>
          <Text style={styles.sectionTitleModern}>Earnings</Text>
          <View style={styles.earningsContainerModern}>
            <Text style={styles.earningsAmountModern}>₹{worker.totalEarnings}</Text>
            <Text style={styles.earningsLabelModern}>Total Earnings</Text>
          </View>
        </Card>

        {/* Logout Button */}
        <View style={styles.footerModern}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButtonModern}
            textStyle={styles.logoutButtonTextModern}
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
  gradientHeader: {
    height: 120,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: -32,
    zIndex: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.medium,
    marginTop: 32,
  },
  headerTitleGradient: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: SIZES.large,
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.medium,
    marginTop: -60,
    borderRadius: 24,
    ...SHADOWS.medium,
    zIndex: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SIZES.medium,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  statusBadgeModern: {
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
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  statusTextModern: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.primary,
    fontWeight: '600',
  },
  nameModern: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2,
    marginTop: SIZES.base,
  },
  serviceModern: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base,
  },
  navigationButtonsModern: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SIZES.medium,
    gap: SIZES.medium,
  },
  navButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SIZES.large,
    borderRadius: 16,
    gap: SIZES.base,
    ...SHADOWS.small,
  },
  navButtonTextModern: {
    color: COLORS.primary,
    fontSize: FONTS.body2.fontSize,
    fontWeight: '600',
  },
  statsCardModern: {
    margin: SIZES.medium,
    padding: SIZES.large,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  statsRowModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItemModern: {
    flex: 1,
    alignItems: 'center',
  },
  statDividerModern: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.medium,
  },
  statValueModern: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SIZES.base / 2,
  },
  statLabelModern: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sectionModern: {
    margin: SIZES.medium,
    padding: SIZES.large,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  sectionTitleModern: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  infoListModern: {
    gap: SIZES.medium,
  },
  infoItemModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  infoTextModern: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textPrimary,
    marginLeft: SIZES.base,
    fontWeight: '500',
  },
  earningsContainerModern: {
    alignItems: 'center',
  },
  earningsAmountModern: {
    fontSize: FONTS.h2.fontSize,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: SIZES.base,
  },
  earningsLabelModern: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  footerModern: {
    padding: SIZES.large,
    alignItems: 'center',
  },
  logoutButtonModern: {
    width: '80%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  logoutButtonTextModern: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: FONTS.body2.fontSize,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.base / 2,
  },
});

export default WorkerProfileScreen; 