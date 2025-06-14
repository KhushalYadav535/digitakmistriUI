import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Button, FlatList, Alert, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: string;
}

interface Booking {
  _id: string;
  service: Service;
  subService: string;
  bookingDate: string;
  bookingTime: string;
  address: Address;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  totalAmount: number;
}

const services = [
  {
    id: 'plumber',
    name: 'Plumber',
    icon: <MaterialIcons name="plumbing" size={20} color={COLORS.primary} />,
    subServices: [
      'Basin Set Fitting/Repair',
      'Flush Tank Service',
      'Wiring Related Repair',
      'Toti Installation',
    ],
  },
  {
    id: 'electrician',
    name: 'Electrician',
    icon: <MaterialIcons name="electrical-services" size={20} color={COLORS.primary} />,
    subServices: [
      'Fan Installation',
      'Fan Servicing',
      'Fan Capacitor Change',
      'Holder/Button/Socket Change',
    ],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: <MaterialIcons name="devices-other" size={20} color={COLORS.primary} />,
    subServices: [
      'AC Installation',
      'AC Service',
      'AC Gas Charging',
      'Washing Machine',
      'Gas Geyser',
      'LED TV Repairing',
      'DTH Set',
      'Inverter Set Kaam',
    ],
  },
  {
    id: 'handpump',
    name: 'Handpump',
    icon: <MaterialIcons name="build" size={20} color={COLORS.primary} />,
    subServices: [
      'Handpump Installation',
      'Handpump Repair',
    ],
  },
];

const mockBookings = [
  {
    id: '1',
    service: 'Plumber',
    subService: 'Basin Set Fitting/Repair',
    date: '2024-06-10',
    time: '10:00 AM',
    address: '123 Main St',
    status: 'Confirmed',
  },
  {
    id: '2',
    service: 'Electronics',
    subService: 'AC Installation',
    date: '2024-06-12',
    time: '2:00 PM',
    address: '456 Park Ave',
    status: 'Pending',
  },
];

const statusColors = {
  pending: '#FFA726',
  accepted: '#43A047',
  rejected: '#E53935',
  completed: '#43A047',
  cancelled: '#E53935'
};

// Use your computer's IP address instead of localhost when running on a physical device
const API_URL = 'https://digital-mistri.onrender.com/api';

const BookingsScreen = () => {
  const [tab, setTab] = useState('book');
  const [selectedService, setSelectedService] = useState(services[0].id);
  const [selectedSubService, setSelectedSubService] = useState(services[0].subServices[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's bookings
  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to view bookings');
        return;
      }

      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings');
    }
  };

  useEffect(() => {
    if (tab === 'my') {
      fetchBookings();
    }
  }, [tab]);

  const handleBook = async () => {
    if (!date || !time || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to book a service');
        return;
      }

      const serviceObj = services.find(s => s.id === selectedService);
      const bookingData = {
        service: serviceObj?.name,
        subService: selectedSubService,
        bookingDate: date,
        bookingTime: time,
        address: {
          street: address,
          city: 'Your City',
          state: 'Your State',
          pincode: 'Your Pincode'
        },
        totalAmount: 750,
      };

      const response = await axios.post(`${API_URL}/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Booking created successfully!');
      setDate('');
      setTime('');
      setAddress('');
      
      if (tab === 'my') {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'book' && styles.activeTab]} onPress={() => setTab('book')}>
          <Text style={[styles.tabText, tab === 'book' && styles.activeTabText]}>Book a Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'my' && styles.activeTab]} onPress={() => setTab('my')}>
          <Text style={[styles.tabText, tab === 'my' && styles.activeTabText]}>My Bookings</Text>
        </TouchableOpacity>
      </View>
      {tab === 'book' ? (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Book a Service</Text>
            <Text style={styles.label}>Select Service</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {services.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.chip, selectedService === service.id && styles.chipSelected]}
                  onPress={() => {
                    setSelectedService(service.id);
                    setSelectedSubService(service.subServices[0]);
                  }}
                >
                  {service.icon}
                  <Text style={[styles.chipText, selectedService === service.id && styles.chipTextSelected]}>{service.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Select Sub-Service</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {services.find(s => s.id === selectedService)?.subServices.map(sub => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.chip, selectedSubService === sub && styles.chipSelected]}
                  onPress={() => setSelectedSubService(sub)}
                >
                  <Text style={[styles.chipText, selectedSubService === sub && styles.chipTextSelected]}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              placeholderTextColor="#aaa"
            />
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10:00 AM"
              value={time}
              onChangeText={setTime}
              placeholderTextColor="#aaa"
            />
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleBook}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.buttonText}>Booking...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.buttonText}>Book Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color={COLORS.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No bookings yet. Book your first service!</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={item => item._id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.bookingCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="construct" size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.bookingService}>{item.service.name} - {item.subService}</Text>
                </View>
                <Text style={styles.bookingInfo}>
                  <Ionicons name="calendar" size={16} color={COLORS.textSecondary} />  {new Date(item.bookingDate).toLocaleDateString()}   
                  <Ionicons name="time" size={16} color={COLORS.textSecondary} />  {item.bookingTime}
                </Text>
                <Text style={styles.bookingInfo}>
                  <Ionicons name="location" size={16} color={COLORS.textSecondary} />  {item.address.street}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] || COLORS.primary }]}>
                  <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
              </View>
            )}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  tab: { flex: 1, padding: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 16, color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 15, fontWeight: 'bold', marginTop: 16, marginBottom: 6, color: COLORS.textPrimary },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F1F1', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 10, marginBottom: 8 },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.textPrimary, fontSize: 15, marginLeft: 5 },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 16, backgroundColor: '#F7F8FA', fontSize: 15 },
  button: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  bookingCard: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
  bookingService: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  bookingInfo: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2, marginBottom: 2 },
  statusBadge: { alignSelf: 'flex-end', marginTop: 8, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  statusBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, marginTop: 8, textAlign: 'center' },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default BookingsScreen;