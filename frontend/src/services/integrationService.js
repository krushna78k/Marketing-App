import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/integrations`;

const getConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token')
  }
});

export const getIntegrations = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const updateIntegrations = async (data) => {
  const res = await axios.post(API_URL, data, getConfig());
  return res.data;
};
