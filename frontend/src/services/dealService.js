import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/deals`;

const getConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token')
  }
});

export const getDeals = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const createDeal = async (data) => {
  const res = await axios.post(API_URL, data, getConfig());
  return res.data;
};

export const updateDeal = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, getConfig());
  return res.data;
};

export const deleteDeal = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getConfig());
  return res.data;
};
