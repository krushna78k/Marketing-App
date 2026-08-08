import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks`;

const getConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token')
  }
});

export const getTasks = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const createTask = async (data) => {
  const res = await axios.post(API_URL, data, getConfig());
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data, getConfig());
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getConfig());
  return res.data;
};

export const addTaskComment = async (id, text) => {
  const res = await axios.post(`${API_URL}/${id}/comments`, { text }, getConfig());
  return res.data;
};

export const addTaskAttachment = async (id, url, name) => {
  const res = await axios.post(`${API_URL}/${id}/attachments`, { url, name }, getConfig());
  return res.data;
};
