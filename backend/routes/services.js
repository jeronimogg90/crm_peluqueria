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

router.get('/services', async (req, res) => {
  try {
    const activeServices = await getServices();
    res.json(activeServices);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

router.get('/services/all', async (req, res) => {
  try {
    const allServices = await getAllServices();
    res.json(allServices);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

router.get('/services/:id', async (req, res) => {
  try {
    const service = await getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(service);
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    res.status(500).json({ error: 'Error obteniendo servicio' });
  }
});

router.post('/services', async (req, res) => {
  try {
    const { name, category, price, duration, description } = req.body;
    if (!name || !category || !price || !duration) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const newService = await createService({
      name,
      category,
      price: parseFloat(price),
      duration: parseInt(duration),
      description: description || ''
    });
    res.status(201).json({ message: 'Servicio creado exitosamente', service: newService });
  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: 'Error creando servicio' });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    const { name, category, price, duration, description, active } = req.body;
    const updatedService = await updateService(req.params.id, {
      name, category,
      price: price ? parseFloat(price) : undefined,
      duration: duration ? parseInt(duration) : undefined,
      description, active
    });
    if (!updatedService) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json({ message: 'Servicio actualizado exitosamente', service: updatedService });
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ error: 'Error actualizando servicio' });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    const deleted = await deleteService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: 'Error eliminando servicio' });
  }
});

export default router;
