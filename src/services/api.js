import axios from 'axios';

const API_URL = 'http://172.17.231.104:3001/api';

export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);

export async function registerFace(matricula, image) {
  const formData = new FormData();
  formData.append('face', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.name || 'face.jpg',
  });
  return axios.post(`${API_URL}/users/${matricula}/register-face`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const verifyFace = (matricula, image) => {
  const formData = new FormData();
  formData.append('face', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || image.name || 'face.jpg',
  });
  return axios.post(`${API_URL}/users/${matricula}/verify-face`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const identifyFace = (image) => {
  const formData = new FormData();
  formData.append('face', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || image.name || 'face.jpg',
  });
  return axios.post(`${API_URL}/users/identify-face`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};