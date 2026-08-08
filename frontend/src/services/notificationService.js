import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/notifications`;

const getConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token')
  }
});

export const getNotifications = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await axios.put(`${API_URL}/${id}/read`, {}, getConfig());
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await axios.put(`${API_URL}/read-all`, {}, getConfig());
  return res.data;
};

export const simulateAlert = async (data) => {
  const res = await axios.post(`${API_URL}/simulate`, data, getConfig());
  return res.data;
};
