import express from 'express';
import {
  getServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../data/db.js';

const router = express.Router();

// Obtener todos los servicios activos (para clientes)
router.get('/services', (req, res) => {
  try {
    const activeServices = getServices();
    res.json(activeServices);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

// Obtener todos los servicios incluyendo inactivos (para dashboard)
router.get('/services/all', (req, res) => {
  try {
    const allServices = getAllServices();
    res.json(allServices);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

// Obtener un servicio por ID
router.get('/services/:id', (req, res) => {
  try {
    const service = getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo servicio' });
  }
});

// Crear un nuevo servicio
router.post('/services', (req, res) => {
  try {
    const { name, category, price, duration, description } = req.body;
    
    if (!name || !category || !price || !duration) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const newService = createService({
      name,
      category,
      price: parseFloat(price),
      duration: parseInt(duration),
      description: description || ''
    });
    
    res.status(201).json({
      message: 'Servicio creado exitosamente',
      service: newService
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creando servicio' });
  }
});

// Actualizar un servicio
router.put('/services/:id', (req, res) => {
  try {
    const { name, category, price, duration, description, active } = req.body;
    
    const updatedService = updateService(req.params.id, {
      name,
      category,
      price: price ? parseFloat(price) : undefined,
      duration: duration ? parseInt(duration) : undefined,
      description,
      active
    });
    
    if (!updatedService) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    res.json({
      message: 'Servicio actualizado exitosamente',
      service: updatedService
    });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando servicio' });
  }
});

// Eliminar un servicio (desactivar)
router.delete('/services/:id', (req, res) => {
  try {
    const deleted = deleteService(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando servicio' });
  }
});

export default router;
