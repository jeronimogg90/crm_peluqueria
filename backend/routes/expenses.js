import express from 'express';
import {
  getExpenses,
  getExpensesStats,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../data/db.js';

const router = express.Router();

// GET /api/expenses?month=YYYY-MM
router.get('/expenses', async (req, res) => {
  try {
    const { month } = req.query;
    const data = await getExpenses({ month });
    res.json(data);
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    res.status(500).json({ error: 'Error obteniendo gastos' });
  }
});

// GET /api/expenses/stats
router.get('/expenses/stats', async (req, res) => {
  try {
    const stats = await getExpensesStats();
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas de gastos:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

// POST /api/expenses
router.post('/expenses', async (req, res) => {
  try {
    const { date, concept, amount, category } = req.body;
    if (!date || !concept || amount === undefined || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos: date, concept, amount, category' });
    }
    const expense = await createExpense({ date, concept, amount: parseFloat(amount), category });
    res.status(201).json({ message: 'Gasto creado correctamente', expense });
  } catch (error) {
    console.error('Error creando gasto:', error);
    res.status(500).json({ error: 'Error creando el gasto' });
  }
});

// PUT /api/expenses/:id
router.put('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, concept, amount, category } = req.body;
    if (!date || !concept || amount === undefined || !category) {
      return res.status(400).json({ error: 'Faltan campos requeridos: date, concept, amount, category' });
    }
    const expense = await updateExpense(id, { date, concept, amount: parseFloat(amount), category });
    if (!expense) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ message: 'Gasto actualizado correctamente', expense });
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    res.status(500).json({ error: 'Error actualizando el gasto' });
  }
});

// DELETE /api/expenses/:id
router.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteExpense(id);
    res.json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    res.status(500).json({ error: 'Error eliminando el gasto' });
  }
});

export default router;
