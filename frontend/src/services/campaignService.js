import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/campaigns`;

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  };
};

export const getCampaigns = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const createCampaign = async (campaignData) => {
  const res = await axios.post(API_URL, campaignData, getConfig());
  return res.data;
};

export const updateCampaign = async (id, campaignData) => {
  const res = await axios.put(`${API_URL}/${id}`, campaignData, getConfig());
  return res.data;
};

export const deleteCampaign = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getConfig());
  return res.data;
};
