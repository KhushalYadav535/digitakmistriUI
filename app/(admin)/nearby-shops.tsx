import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
    Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../constants/config';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { getImageUrl } from '../utils/imageUtils';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

interface Shop {
    _id: string;
    name: string;
    description: string;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    phone: string;
    email: string;
    services: string[];
    rating: number;
    reviews: any[];
    workingHours: {
        monday: { open: string; close: string };
        tuesday: { open: string; close: string };
        wednesday: { open: string; close: string };
        thursday: { open: string; close: string };
        friday: { open: string; close: string };
        saturday: { open: string; close: string };
        sunday: { open: string; close: string };
    };
    images: string[];
}

const NearbyShopsScreen = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        },
        phone: '',
        email: '',
        services: [''],
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

    useEffect(() => {
        loadShops();
        getLocation();
    }, []);

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to add shops');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        } catch (err) {
            console.error('Error getting location:', err);
            Alert.alert('Error', 'Failed to get location');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const loadShops = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${API_URL}/nearby-shops`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShops(response.data);
        } catch (err) {
            console.error('Error loading shops:', err);
            setError('Failed to load shops');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!location) {
                Alert.alert('Error', 'Location is required');
                return;
            }

            const token = await AsyncStorage.getItem('token');
            const requestData = new FormData();

            requestData.append('name', formData.name.trim());
            requestData.append('description', formData.description.trim());
            requestData.append('phone', formData.phone.trim());
            requestData.append('email', formData.email.trim());
            
            // Stringify complex objects
            requestData.append('address', JSON.stringify(formData.address));
            requestData.append('location', JSON.stringify({
                type: 'Point',
                coordinates: [location.coords.longitude, location.coords.latitude]
            }));
            requestData.append('services', JSON.stringify(formData.services));
            requestData.append('workingHours', JSON.stringify(formData.workingHours));

            if (image) {
                const uriParts = image.split('.');
                const fileType = uriParts[uriParts.length - 1];
                requestData.append('image', {
                    uri: image,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                } as any);
            }

            // Log the complete request data
            console.log('=== Shop Creation Request ===');
            console.log('URL:', `${API_URL}/nearby-shops`);
            
            const response = await axios.post(
                `${API_URL}/nearby-shops`,
                requestData,
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    } 
                }
            );

            if (response.status === 201) {
                Alert.alert('Success', 'Shop added successfully');
                setShowAddForm(false);
                setFormData({
                    name: '',
                    description: '',
                    address: {
                        street: '',
                        city: '',
                        state: '',
                        pincode: ''
                    },
                    phone: '',
                    email: '',
                    services: [''],
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
                setImage(null);
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

    const handleDelete = async (shopId: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${API_URL}/nearby-shops/${shopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Shop deleted successfully');
            loadShops();
        } catch (err) {
            console.error('Error deleting shop:', err);
            Alert.alert('Error', 'Failed to delete shop');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading shops...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Nearby Shops</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddForm(!showAddForm)}
                >
                    <Ionicons
                        name={showAddForm ? 'close' : 'add'}
                        size={24}
                        color={COLORS.white}
                    />
                </TouchableOpacity>
            </View>

            {showAddForm && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showAddForm}
                    onRequestClose={() => setShowAddForm(false)}
                >
                    <View style={styles.modalContainer}>
                        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                            <Text style={styles.formTitle}>Add New Shop</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Shop Name"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                            />
                            
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                <Ionicons name="camera" size={24} color={COLORS.primary} />
                                <Text style={styles.imagePickerText}>Select Shop Image</Text>
                            </TouchableOpacity>

                            {image && <Image source={{ uri: image }} style={styles.previewImage} />}

                            <TextInput
                                style={styles.input}
                                placeholder="Description"
                                value={formData.description}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                multiline
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
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone"
                                value={formData.phone}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={formData.email}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                            />
                            <View style={styles.servicesContainer}>
                                <Text style={styles.servicesLabel}>Services</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Services (comma-separated)"
                                    value={formData.services.join(', ')}
                                    onChangeText={(text) => setFormData({ ...formData, services: text.split(',').map(s => s.trim()) })}
                                />
                            </View>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                <Text style={styles.submitButtonText}>Add Shop</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Modal>
            )}

            <ScrollView style={styles.shopsList}>
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
                            <Text style={styles.shopAddress}>
                                {`${shop.address.street}, ${shop.address.city}, ${shop.address.state} - ${shop.address.pincode}`}
                            </Text>
                            <Text style={styles.shopPhone}>{shop.phone}</Text>
                            <View style={styles.shopActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => handleDelete(shop._id)}
                                >
                                    <Text style={styles.actionButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.medium,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: FONTS.h2.fontSize,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    formContainer: {
        backgroundColor: COLORS.white,
        padding: SIZES.medium,
        borderRadius: SIZES.radius,
        width: '80%',
        maxHeight: '80%',
    },
    formTitle: {
        fontSize: FONTS.h3.fontSize,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.medium,
    },
    input: {
        backgroundColor: COLORS.lightGray,
        padding: SIZES.medium,
        borderRadius: SIZES.base,
        marginBottom: SIZES.medium,
    },
    servicesContainer: {
        marginBottom: SIZES.medium,
    },
    servicesLabel: {
        fontSize: FONTS.body3.fontSize,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SIZES.base,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SIZES.medium,
        borderRadius: SIZES.base,
        alignItems: 'center',
        marginTop: SIZES.large,
        marginBottom: SIZES.large,
        ...SHADOWS.medium
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: FONTS.h3.fontSize,
        fontWeight: 'bold'
    },
    shopsList: {
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
    shopAddress: {
        fontSize: FONTS.body3.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SIZES.base,
    },
    shopPhone: {
        fontSize: FONTS.body3.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SIZES.base,
    },
    shopActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SIZES.base,
    },
    actionButton: {
        paddingHorizontal: SIZES.medium,
        paddingVertical: SIZES.base,
        borderRadius: SIZES.radius,
        marginLeft: SIZES.base,
    },
    deleteButton: {
        backgroundColor: COLORS.error,
    },
    actionButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
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
    imagePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lightGray,
        padding: SIZES.medium,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.medium,
    },
    imagePickerText: {
        marginLeft: SIZES.base,
        color: COLORS.primary,
        ...FONTS.body3,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: SIZES.radius,
        marginBottom: SIZES.medium,
    },
});

export default NearbyShopsScreen; 