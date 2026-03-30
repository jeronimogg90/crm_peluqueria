import express from 'express';
import {
  getAllClients,
  getClientById,
  getClientHistory,
  createClient,
  updateClient
} from '../data/db.js';

const router = express.Router();

router.get('/clients', async (req, res) => {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error obteniendo clientes' });
  }
});

router.get('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await getClientById(id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error obteniendo cliente' });
  }
});

router.get('/clients/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await getClientHistory(id);
    res.json(history);
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error obteniendo historial del cliente' });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const { nombre, apellidos, telefono, email } = req.body;
    if (!nombre || !apellidos) {
      return res.status(400).json({ error: 'Nombre y apellidos son requeridos' });
    }
    const client = await createClient({ nombre, apellidos, telefono, email });
    res.status(201).json({ message: 'Cliente creado exitosamente', client });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: 'Error creando cliente' });
  }
});

router.put('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, telefono, email } = req.body;
    if (!nombre || !apellidos) {
      return res.status(400).json({ error: 'Nombre y apellidos son requeridos' });
    }
    const client = await updateClient(id, { nombre, apellidos, telefono, email });
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado exitosamente', client });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: 'Error actualizando cliente' });
  }
});

export default router;
