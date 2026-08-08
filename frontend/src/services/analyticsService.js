import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics';

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  };
};

export const getDashboardData = async () => {
  const res = await axios.get(`${API_URL}/dashboard`, getConfig());
  return res.data;
};
