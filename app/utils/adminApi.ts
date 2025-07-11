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

export const fetchRevenueAnalytics = async (period = 'month') => {
  const token = await AsyncStorage.getItem('token');
  const res = await axios.get(`${API_URL}/admin/analytics/revenue?period=${period}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const fetchWorkerPerformance = async () => {
  const token = await AsyncStorage.getItem('token');
  const res = await axios.get(`${API_URL}/admin/analytics/worker-performance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const fetchCustomerStats = async () => {
  const token = await AsyncStorage.getItem('token');
  const res = await axios.get(`${API_URL}/admin/analytics/customer-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const fetchServiceStats = async () => {
  const token = await AsyncStorage.getItem('token');
  const res = await axios.get(`${API_URL}/admin/analytics/service-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Default export for compatibility
const adminApi = {
  fetchDashboardOverview,
  fetchWorkers,
  fetchRevenueAnalytics,
  fetchWorkerPerformance,
  fetchCustomerStats,
  fetchServiceStats,
};

export default adminApi; 