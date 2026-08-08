import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/leads`;

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  };
};

export const getLeads = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const createLead = async (leadData) => {
  const res = await axios.post(API_URL, leadData, getConfig());
  return res.data;
};

export const updateLead = async (id, leadData) => {
  const res = await axios.put(`${API_URL}/${id}`, leadData, getConfig());
  return res.data;
};

export const deleteLead = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getConfig());
  return res.data;
};

export const convertLead = async (id, dealValue = 0) => {
  const res = await axios.post(`${API_URL}/${id}/convert`, { value: dealValue }, getConfig());
  return res.data;
};

export const addNote = async (id, content) => {
  const res = await axios.post(`${API_URL}/${id}/notes`, { content }, getConfig());
  return res.data;
};
