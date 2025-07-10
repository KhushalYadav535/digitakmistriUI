import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { router } from 'expo-router';
import { API_URL } from '../constants/config';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'notifications', title: 'Notifications', icon: 'notifications', route: '/notifications' },
  { id: 'edit', title: 'Edit Profile', icon: 'pencil', route: '/edit-profile' },
  { id: 'change', title: 'Change Password', icon: 'lock-closed', route: '/change-password' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle', route: '/help-support' },
  { id: 'logout', title: 'Logout', icon: 'log-out', route: null },
];

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [customerStats, setCustomerStats] = useState({
    totalBookings: 0,
    averageRating: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const { logout, token, user: authUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (authUser) {
          setUser(authUser);
          
          // Fetch detailed customer profile from backend
          if (token) {
            const response = await fetch(`${API_URL}/customer/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const customerData = await response.json();
              setUser(customerData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [token, authUser]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        if (!token || !authUser || !authUser.id) return;

        const response = await fetch(`${API_URL}/notifications/customer/${authUser.id}/count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
  }, [token, authUser]);

  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        if (!token || !authUser || !authUser.id) return;

        // Fetch customer statistics
        const response = await fetch(`${API_URL}/customer/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const stats = await response.json();
          setCustomerStats({
            totalBookings: stats.totalBookings || 0,
            averageRating: stats.averageRating || 0,
            totalSpent: stats.totalSpent || 0
          });
        }
      } catch (error) {
        console.error('Error fetching customer stats:', error);
      }
    };

    fetchCustomerStats();
  }, [token, authUser]);

  const handleLogout = async () => {
    try {
      console.log('Customer profile logout initiated');
      await logout();
      // AuthContext will handle the redirect to role selection
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleMenuItemPress = (item: any) => {
    if (item.id === 'logout') {
      handleLogout();
    } else if (item.route) {
      router.push(item.route);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' }}>
        <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F7F8FA' }} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBg} />
      <View style={styles.profileCard}>
        <Image
          source={{ uri: user?.profileImage || 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{user?.name || 'Your Name'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'your@email.com'}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile' as any)}>
          <Ionicons name="pencil" size={18} color={COLORS.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{customerStats.totalBookings}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{customerStats.averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₹{customerStats.totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
      </View>
      <View style={styles.emergencyContactCard}>
        <Text style={styles.emergencyTitle}>Emergency Contact</Text>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={20} color={COLORS.primary} />
          <Text style={styles.contactText}>6307044134</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
          <Text style={styles.contactText}>digitalmistri33@gmail.com</Text>
        </View>
      </View>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, item.id === 'logout' && styles.logoutItem]}
            onPress={() => handleMenuItemPress(item)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color={item.id === 'logout' ? '#FF3B30' : COLORS.primary} 
              />
              <Text style={[styles.menuItemText, item.id === 'logout' && styles.logoutText]}>
                {item.title}
              </Text>
              {item.id === 'notifications' && notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerBg: {
    height: 120,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 40,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: -60,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  userEmail: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuContainer: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 14,
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF3B30',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emergencyContactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default ProfileScreen;