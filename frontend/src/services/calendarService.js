import axios from 'axios';

const API_URL = 'http://localhost:5000/api/calendar';

const getConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token')
  }
});

export const getCalendarEvents = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};
