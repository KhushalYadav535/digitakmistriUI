import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { COLORS, FONTS, SHADOWS, SIZES } from '../constants/theme';

interface NearbyShopProps {
    name: string;
    phone: string;
    address: string;
    description: string;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

const NearbyShop: React.FC<NearbyShopProps> = ({
    name,
    phone,
    address,
    description,
    isAdmin,
    onEdit,
    onDelete,
}) => {
    const { t } = useTranslation();
    const handleCall = () => {
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.name}>{t('name')}: {name}</Text>
                <Text style={styles.address}>{t('address')}: {address}</Text>
                <Text style={styles.description}>{t('description')}: {description}</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.callButton}
                    onPress={handleCall}
                >
                    <Ionicons name="call" size={20} color={COLORS.white} />
                    <Text style={styles.callButtonText}>{t('call')}</Text>
                </TouchableOpacity>

                {isAdmin && (
                    <View style={styles.adminActions}>
                        <TouchableOpacity
                            style={[styles.adminButton, styles.editButton]}
                            onPress={onEdit}
                        >
                            <Ionicons name="pencil" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.adminButton, styles.deleteButton]}
                            onPress={onDelete}
                        >
                            <Ionicons name="trash" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.base,
        padding: SIZES.medium,
        marginBottom: SIZES.medium,
        ...SHADOWS.small,
    } as ViewStyle,
    content: {
        marginBottom: SIZES.medium,
    } as ViewStyle,
    name: {
        ...FONTS.h3,
        color: COLORS.textPrimary,
        marginBottom: SIZES.base,
    } as TextStyle,
    address: {
        ...FONTS.body3,
        color: COLORS.textSecondary,
        marginBottom: SIZES.base,
    } as TextStyle,
    description: {
        ...FONTS.body3,
        color: COLORS.textSecondary,
    } as TextStyle,
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    } as ViewStyle,
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.medium,
        paddingVertical: SIZES.base,
        borderRadius: SIZES.base,
    } as ViewStyle,
    callButtonText: {
        color: COLORS.white,
        marginLeft: SIZES.base,
        fontWeight: '500',
    } as TextStyle,
    adminActions: {
        flexDirection: 'row',
        gap: SIZES.base,
    } as ViewStyle,
    adminButton: {
        width: 40,
        height: 40,
        borderRadius: SIZES.base,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    editButton: {
        backgroundColor: COLORS.info,
    } as ViewStyle,
    deleteButton: {
        backgroundColor: COLORS.error,
    } as ViewStyle,
});

export default NearbyShop; 