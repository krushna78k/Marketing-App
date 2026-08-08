import axios from 'axios';

const API_URL = 'http://localhost:5000/api/files';

const getConfig = () => ({
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': localStorage.getItem('token')
  }
});

const getMultipartConfig = () => ({
  headers: {
    'Content-Type': 'multipart/form-data',
    'x-auth-token': localStorage.getItem('token')
  }
});

export const getFiles = async () => {
  const res = await axios.get(API_URL, getConfig());
  return res.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${API_URL}/upload`, formData, getMultipartConfig());
  return res.data;
};

export const deleteFile = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getConfig());
  return res.data;
};
