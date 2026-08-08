import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  };
};

export const getUsers = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const createUser = async (userData) => {
  const res = await axios.post(API_URL, userData, getConfig());
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await axios.put(`${API_URL}/${id}`, userData, getConfig());
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getConfig());
  return res.data;
};

export const getActivityLogs = async () => {
  const res = await axios.get(`${API_URL}/activity`, getConfig());
  return res.data;
};
