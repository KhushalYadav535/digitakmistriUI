import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';
import { useTranslation } from 'react-i18next';

const roles = [
  {
    id: 'admin',
    title: 'admin',
    description: 'role_admin_desc',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'customer',
    title: 'customer',
    description: 'role_customer_desc',
    icon: 'person-outline',
  },
  {
    id: 'worker',
    title: 'worker',
    description: 'role_worker_desc',
    icon: 'construct-outline',
  },
];

const RoleSelectionScreen = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const { t } = useTranslation();

  const handleContinue = () => {
    if (selectedRole) {
      if (selectedRole === 'admin') {
        router.push('/(auth)/admin-login' as any);
      } else if (selectedRole === 'worker') {
        router.push('/(auth)/worker-login' as any);
      } else {
        router.push('/(auth)/login' as any);
      }
    }
  };

  const handleRoleSelect = (roleKey: string) => {
    setSelectedRole(roleKey);
    if (roleKey === 'admin') {
      router.push('/(auth)/admin-login' as any);
    } else if (roleKey === 'worker') {
      router.push('/(auth)/worker-login' as any);
    } else {
      router.push('/(auth)/login' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/applogo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>{t('role_selection_title')}</Text>
        <Text style={styles.subtitle}>{t('role_selection_subtitle')}</Text>
      </View>

      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.id && styles.selectedRole,
            ]}
            onPress={() => setSelectedRole(role.id)}
          >
            <View style={styles.roleIconContainer}>
              <Ionicons
                name={role.icon as any}
                size={32}
                color={selectedRole === role.id ? COLORS.primary : COLORS.textSecondary}
              />
            </View>
            <View style={styles.roleInfo}>
              <Text
                style={[
                  styles.roleTitle,
                  selectedRole === role.id && styles.selectedRoleText,
                ]}
              >
                {t(role.title)}
              </Text>
              <Text style={styles.roleDescription}>{t(role.description)}</Text>
            </View>
            {selectedRole === role.id && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={COLORS.primary}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            !selectedRole && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons
            name="arrow-forward"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.medium,
  },
  header: {
    alignItems: 'center',
    marginTop: SIZES.xxlarge,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: SIZES.medium,
    borderRadius: SIZES.base,
  },
  title: {
    fontSize: FONTS.h1.fontSize,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: FONTS.body2.fontSize,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  rolesContainer: {
    marginTop: SIZES.xxlarge,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.medium,
    ...SHADOWS.small,
  },
  selectedRole: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.base / 2,
  },
  selectedRoleText: {
    color: COLORS.primary,
  },
  roleDescription: {
    fontSize: FONTS.body3.fontSize,
    color: COLORS.textSecondary,
  },
  checkIcon: {
    marginLeft: SIZES.base,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: SIZES.medium,
  },
  button: {
    backgroundColor: COLORS.primary, // Changed from COLORS.white to COLORS.primary (blue)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    marginBottom: SIZES.small,
    ...SHADOWS.small,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white, // Changed from COLORS.textPrimary to COLORS.white for contrast
    fontSize: FONTS.h3.fontSize,
    fontWeight: '600',
    marginLeft: SIZES.base,
  },
  buttonIcon: {
    marginRight: SIZES.base,
  },
});

export default RoleSelectionScreen;