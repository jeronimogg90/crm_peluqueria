import axios from 'axios';

// En producción, el backend sirve el frontend, así que usamos rutas relativas
// En desarrollo, usamos localhost:3000
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // Producción: backend y frontend en el mismo servidor
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
