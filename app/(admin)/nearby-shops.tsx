import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
import Button from '../../components/Button';
import NearbyShop from '../components/NearbyShop';
import { COLORS, FONTS, SHADOWS, SIZES } from '../../constants/theme';
import { API_URL } from '../constants/config';
import axios from 'axios';

interface Shop {
    _id: string;
    name: string;
    phone: string;
    address: string;
    owner: string;
}

const AdminNearbyShopsScreen = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        description: '',
    });

    const handleAddShop = async () => {
        if (!formData.name || !formData.phone || !formData.address) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        try {
            // TODO: Replace with actual admin token retrieval logic
            const token = await AsyncStorage.getItem('token');
            const response = await axios.post(`${API_URL}/shops`, {
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                owner: 'admin', // Replace with actual admin identifier
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShops([...shops, response.data]);
            setFormData({
                name: '',
                phone: '',
                address: '',
                description: '',
            });
            setEditingShop(null);
            setShowAddModal(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to add shop');
        }
    };

    // Fetch shops from backend on mount
    React.useEffect(() => {
        const fetchShops = async () => {
            try {
                const response = await axios.get(`${API_URL}/shops`);
                setShops(response.data);
            } catch (error) {
                setShops([]);
            }
        };
        fetchShops();
    }, []);

    const handleEditShop = (shop: Shop) => {
        setEditingShop(shop);
        setFormData({
            name: shop.name,
            phone: shop.phone,
            address: shop.address,
            description: shop.description,
        });
        setShowAddModal(true);
    };

    const handleDeleteShop = (shopId: string) => {
        Alert.alert(
            'Delete Shop',
            'Are you sure you want to delete this shop?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setShops(shops.filter(shop => shop.id !== shopId));
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Nearby Shops</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEditingShop(null);
                        setFormData({
                            name: '',
                            phone: '',
                            address: '',
                            description: '',
                        });
                        setShowAddModal(true);
                    }}
                >
                    <Ionicons name="add-circle" size={24} color={COLORS.white} />
                    <Text style={styles.addButtonText}>Add Shop</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {shops.map((shop) => (
                    <NearbyShop
                        key={shop.id}
                        name={shop.name}
                        phone={shop.phone}
                        address={shop.address}
                        description={shop.description}
                        isAdmin
                        onEdit={() => handleEditShop(shop)}
                        onDelete={() => handleDeleteShop(shop.id)}
                    />
                ))}
            </View>

            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>
                            {editingShop ? 'Edit Shop' : 'Add New Shop'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Shop Name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Address"
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Description"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={4}
                        />
                        <View style={styles.modalActions}>
                            <Button
                                title="Cancel"
                                onPress={() => setShowAddModal(false)}
                                variant="outline"
                                style={styles.modalButton}
                            />
                            <Button
                                title={editingShop ? 'Save Changes' : 'Add Shop'}
                                onPress={handleAddShop}
                                style={styles.modalButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    } as ViewStyle,
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.medium,
        backgroundColor: COLORS.white,
        ...SHADOWS.small,
    } as ViewStyle,
    title: {
        ...FONTS.h3,
        color: COLORS.textPrimary,
    } as TextStyle,
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.medium,
        paddingVertical: SIZES.base,
        borderRadius: SIZES.base,
    } as ViewStyle,
    addButtonText: {
        color: COLORS.white,
        marginLeft: SIZES.base,
        fontWeight: '500',
    } as TextStyle,
    content: {
        padding: SIZES.medium,
    } as ViewStyle,
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    modal: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.base,
        padding: SIZES.medium,
        width: '90%',
        maxWidth: 500,
    } as ViewStyle,
    modalTitle: {
        ...FONTS.h3,
        color: COLORS.textPrimary,
        marginBottom: SIZES.medium,
    } as TextStyle,
    input: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.base,
        padding: SIZES.base,
        marginBottom: SIZES.medium,
        ...FONTS.body3,
    } as TextStyle,
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    } as TextStyle,
    modalActions: {
        flexDirection: 'row',
        gap: SIZES.base,
    } as ViewStyle,
    modalButton: {
        flex: 1,
    } as ViewStyle,
});

export default AdminNearbyShopsScreen; 