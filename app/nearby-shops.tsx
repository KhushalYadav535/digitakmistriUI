import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
    Modal,
    RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from './constants/config';
import { COLORS, FONTS, SIZES } from './constants/theme';
import { getImageUrl } from './utils/imageUtils';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

interface Shop {
    _id: string;
    name: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    description: string;
    images: string[];
    rating: number;
    reviews: {
        user: string;
        rating: number;
        comment: string;
        createdAt: string;
    }[];
}

const NearbyShopsScreen = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        },
        description: '',
        services: ['Plumber'] as string[],
        workingHours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '09:00', close: '18:00' },
            sunday: { open: '09:00', close: '18:00' }
        },
        images: [] as string[]
    });
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        checkUserRole();
        getLocation();
    }, []);

    useEffect(() => {
        if (location) {
            loadShops();
        }
    }, [location]);

    const checkUserRole = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const { role } = JSON.parse(userData);
                setIsAdmin(role === 'admin');
            }
        } catch (err) {
            console.error('Error checking user role:', err);
        }
    };

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to find nearby shops');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        } catch (err) {
            console.error('Error getting location:', err);
            Alert.alert('Error', 'Failed to get location');
        }
    };

    const loadShops = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/nearby-shop?latitude=${location?.latitude}&longitude=${location?.longitude}&radius=5000`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShops(response.data);
        } catch (err) {
            console.error('Error loading shops:', err);
            Alert.alert('Error', 'Failed to load shops');
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, result.assets[0].uri]
                }));
            }
        } catch (err) {
            console.error('Error picking image:', err);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleAddShop = async () => {
        try {
            if (!location) {
                Alert.alert('Error', 'Location is required');
                return;
            }

            // Comprehensive validation of all required fields
            const validationErrors = [];
            
            if (!formData.name?.trim()) validationErrors.push('Shop name is required');
            if (!formData.description?.trim()) validationErrors.push('Description is required');
            if (!formData.phone?.trim()) validationErrors.push('Phone number is required');
            if (!formData.email?.trim()) validationErrors.push('Email is required');
            
            // Address validation
            if (!formData.address?.street?.trim()) validationErrors.push('Street address is required');
            if (!formData.address?.city?.trim()) validationErrors.push('City is required');
            if (!formData.address?.state?.trim()) validationErrors.push('State is required');
            if (!formData.address?.pincode?.trim()) validationErrors.push('Pincode is required');
            
            // Services validation
            if (!formData.services?.length) validationErrors.push('At least one service is required');

            if (validationErrors.length > 0) {
                Alert.alert('Validation Error', validationErrors.join('\n'));
                return;
            }

            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Error', 'Authentication required');
                return;
            }

            // Ensure all required fields are present and properly formatted
            const requestData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                address: {
                    street: formData.address.street.trim(),
                    city: formData.address.city.trim(),
                    state: formData.address.state.trim(),
                    pincode: formData.address.pincode.trim()
                },
                location: {
                    type: 'Point',
                    coordinates: [Number(location.longitude), Number(location.latitude)]
                },
                services: formData.services,
                workingHours: formData.workingHours || {
                    monday: { open: '09:00', close: '18:00' },
                    tuesday: { open: '09:00', close: '18:00' },
                    wednesday: { open: '09:00', close: '18:00' },
                    thursday: { open: '09:00', close: '18:00' },
                    friday: { open: '09:00', close: '18:00' },
                    saturday: { open: '09:00', close: '18:00' },
                    sunday: { open: '09:00', close: '18:00' }
                },
                images: formData.images || []
            };

            // Log the complete request data
            console.log('=== Shop Creation Request ===');
            console.log('URL:', `${API_URL}/nearby-shops`);
            console.log('Request Data:', JSON.stringify(requestData, null, 2));
            console.log('Token:', token ? 'Present' : 'Missing');

            const response = await axios.post(
                `${API_URL}/nearby-shops`,
                requestData,
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            if (response.status === 201) {
                Alert.alert('Success', 'Shop added successfully');
                setShowAddModal(false);
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        pincode: ''
                    },
                    description: '',
                    services: ['Plumber'],
                    workingHours: {
                        monday: { open: '09:00', close: '18:00' },
                        tuesday: { open: '09:00', close: '18:00' },
                        wednesday: { open: '09:00', close: '18:00' },
                        thursday: { open: '09:00', close: '18:00' },
                        friday: { open: '09:00', close: '18:00' },
                        saturday: { open: '09:00', close: '18:00' },
                        sunday: { open: '09:00', close: '18:00' }
                    },
                    images: []
                });
                loadShops();
            }
        } catch (err: any) {
            console.error('=== Shop Creation Error ===');
            console.error('Error:', err);
            if (err.response) {
                console.error('Response Status:', err.response.status);
                console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
                console.error('Response Headers:', JSON.stringify(err.response.headers, null, 2));
                
                // Show more detailed error message
                const errorMessage = err.response.data.message || 
                    (err.response.data.error ? JSON.stringify(err.response.data.error) : 'Failed to add shop');
                Alert.alert('Error', errorMessage);
            } else if (err.request) {
                console.error('Request Error:', err.request);
                Alert.alert('Error', 'No response received from server. Please check your internet connection.');
            } else {
                console.error('Error Details:', err.message);
                Alert.alert('Error', 'Failed to add shop: ' + err.message);
            }
        }
    };

    const handleDeleteShop = async (shopId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${API_URL}/nearby-shop/${shopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Shop deleted successfully');
            loadShops();
        } catch (err) {
            console.error('Error deleting shop:', err);
            Alert.alert('Error', 'Failed to delete shop');
        }
    };

    const handleCall = (phone: string) => {
        Alert.alert('Call', `Would you like to call ${phone}?`);
    };

    const handleDirections = (shop: Shop) => {
        Alert.alert('Directions', `Would you like to get directions to ${shop.name}?`);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await getLocation();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Finding nearby shops...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Nearby Shops</Text>
                {isAdmin && (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Ionicons name="add" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {shops.map((shop) => (
                    <View key={shop._id} style={styles.shopCard}>
                        {shop.images.length > 0 && (
                            <Image
                                source={{ uri: getImageUrl(shop.images[0]) }}
                                style={styles.shopImage}
                            />
                        )}
                        <View style={styles.shopInfo}>
                            <Text style={styles.shopName}>{shop.name}</Text>
                            <Text style={styles.shopDescription}>{shop.description}</Text>
                            <Text style={styles.shopAddress}>
                                {`${shop.address.street}, ${shop.address.city}, ${shop.address.state} - ${shop.address.pincode}`}
                            </Text>
                            <View style={styles.shopActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.callButton]}
                                    onPress={() => handleCall(shop.phone)}
                                >
                                    <Ionicons name="call" size={20} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.directionsButton]}
                                    onPress={() => handleDirections(shop)}
                                >
                                    <Ionicons name="navigate" size={20} color={COLORS.white} />
                                    <Text style={styles.actionButtonText}>Directions</Text>
                                </TouchableOpacity>
                                {isAdmin && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={() => handleDeleteShop(shop._id)}
                                    >
                                        <Ionicons name="trash" size={20} color={COLORS.white} />
                                        <Text style={styles.actionButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Modal
                visible={showAddModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Add New Shop</Text>
                        <ScrollView style={styles.modalContent}>
                            <TextInput
                                style={styles.input}
                                placeholder="Shop Name"
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                                keyboardType="phone-pad"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={formData.email}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Street"
                                value={formData.address.street}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, street: text }
                                }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                value={formData.address.city}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, city: text }
                                }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="State"
                                value={formData.address.state}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, state: text }
                                }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Pincode"
                                value={formData.address.pincode}
                                onChangeText={(text) => setFormData(prev => ({
                                    ...prev,
                                    address: { ...prev.address, pincode: text }
                                }))}
                                keyboardType="numeric"
                            />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Description"
                                value={formData.description}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                multiline
                                numberOfLines={4}
                            />
                            <TouchableOpacity
                                style={styles.imageButton}
                                onPress={handleImagePick}
                            >
                                <Text style={styles.imageButtonText}>Add Images</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleAddShop}
                            >
                                <Text style={styles.submitButtonText}>Add Shop</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowAddModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
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
        padding: SIZES.medium,
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    backButton: {
        marginRight: SIZES.medium,
    },
    title: {
        ...FONTS.h3,
        color: COLORS.textPrimary,
        flex: 1,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: SIZES.medium,
    },
    shopCard: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.medium,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    shopImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    shopInfo: {
        padding: SIZES.medium,
    },
    shopName: {
        fontSize: FONTS.h4.fontSize,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.base,
    },
    shopDescription: {
        fontSize: FONTS.body3.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SIZES.base,
    },
    shopAddress: {
        fontSize: FONTS.body3.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SIZES.base,
    },
    shopActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SIZES.base,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SIZES.medium,
        paddingVertical: SIZES.base,
        borderRadius: SIZES.radius,
        flex: 1,
        marginHorizontal: SIZES.base,
    },
    callButton: {
        backgroundColor: COLORS.primary,
    },
    directionsButton: {
        backgroundColor: COLORS.secondary,
    },
    deleteButton: {
        backgroundColor: COLORS.error,
    },
    actionButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        marginLeft: SIZES.base,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        width: '90%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    modalTitle: {
        ...FONTS.h3,
        color: COLORS.textPrimary,
        padding: SIZES.medium,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalContent: {
        padding: SIZES.medium,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        padding: SIZES.base,
        marginBottom: SIZES.base,
        ...FONTS.body3,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 10
    },
    imageButton: {
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center'
    },
    imageButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600'
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center'
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600'
    },
    cancelButton: {
        backgroundColor: COLORS.error,
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center'
    },
    cancelButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SIZES.medium,
        color: COLORS.textSecondary,
    },
});

export default NearbyShopsScreen; 