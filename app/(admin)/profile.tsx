import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Alert, TextInput } from 'react-native';
import Card from '../../components/Card';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants/config';

const settings = [
  {
    id: '1',
    title: 'Edit Profile',
    icon: 'person',
    route: '/edit-profile',
  },
  {
    id: '2',
    title: 'Notifications',
    icon: 'notifications',
    route: '/notifications',
  },
];

const AdminProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${API_URL}/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const token = await AsyncStorage.getItem('token');
      const update: any = { name, email };
      if (password) update.password = password;
      const res = await axios.put(`${API_URL}/admin/profile`, update, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setEditMode(false);
      setPassword('');
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingPress = (route: string) => {
    router.push(route as any);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      router.replace('/(auth)/login' as any);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/images/applogo.jpeg')}
              style={styles.avatar}
            />
          </View>
          <View style={styles.profileDetails}>
            {editMode ? (
              <>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(text) => setName(text)}
                  placeholder="Name"
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  placeholder="Email"
                  autoCapitalize="none"
                />
                <Text style={styles.label}>New Password (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  placeholder="New Password"
                  secureTextEntry
                />
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => { setEditMode(false); setName(profile.name); setEmail(profile.email); setPassword(''); }}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
                {success ? <Text style={{ color: COLORS.success }}>{success}</Text> : null}
              </>
            ) : (
              <>
                <Text style={styles.name}>{profile.name}</Text>
                <Text style={styles.email}>{profile.email}</Text>
                <TouchableOpacity style={styles.editProfileBtn} onPress={() => setEditMode(true)}>
                  <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                  <Text style={{ color: COLORS.primary, marginLeft: 4 }}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Card variant="flat" style={styles.settingsCard}>
          {settings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              style={styles.settingItem}
              onPress={() => handleSettingPress(setting.route)}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Ionicons
                    name={setting.icon as any}
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.settingTitle}>{setting.title}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <Card variant="flat" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build Number</Text>
            <Text style={styles.infoValue}>2024031501</Text>
          </View>
        </Card>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  label: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
    marginBottom: 2,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 8,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
    marginBottom: 4,
    backgroundColor: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.body3.fontSize,
  },
  cancelButton: {
    backgroundColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: FONTS.body3.fontSize,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  header: {
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  profileDetails: {
    flex: 1,
  },
  name: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2,
  },
  email: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.textSecondary,
  },
  section: {
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: FONTS.h4.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.medium,
  },
  settingsCard: {
    padding: SIZES.medium,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  settingTitle: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
  },
  infoCard: {
    padding: SIZES.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
  },
  infoLabel: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.medium,
    margin: SIZES.medium,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    ...SHADOWS.light,
  },
  logoutText: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SIZES.base,
  },
});

export default AdminProfileScreen;