import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

export const fetchDashboardOverview = async () => {
  const token = await AsyncStorage.getItem('token');
  const res = await axios.get(`${API_URL}/admin/analytics/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const fetchWorkers = async () => {
  const token = await AsyncStorage.getItem('token');
  const res = await axios.get(`${API_URL}/admin/workers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Default export for Expo Router compatibility
const dashboardApi = {
  fetchDashboardOverview,
  fetchWorkers,
};

export default dashboardApi;
