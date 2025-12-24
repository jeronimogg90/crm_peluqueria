import axios from 'axios';

// Configuración de la URL base de la API
// En producción usa la variable de entorno VITE_API_URL
// En desarrollo usa localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
