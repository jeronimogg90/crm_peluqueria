import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, TrendingDown, TrendingUp, Wallet, Filter } from 'lucide-react';
import api from '../config/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../lib/utils';

// ─── Constantes ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'suministros', label: 'Suministros', color: 'bg-blue-100 text-blue-700' },
  { value: 'equipo',      label: 'Equipo',      color: 'bg-purple-100 text-purple-700' },
  { value: 'efectivo',    label: 'Efectivo',    color: 'bg-amber-100 text-amber-700' },
  { value: 'otros',       label: 'Otros',       color: 'bg-stone-100 text-stone-600' },
];

const categoryMeta = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

const formatCurrency = (n) => `${parseFloat(n || 0).toFixed(2)}€`;
const formatDate = (str) => {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};
const toInputDate = (str) => (str ? str.substring(0, 10) : '');
const todayISO = () => new Date().toISOString().split('T')[0];

// ─── Modal de añadir / editar ──────────────────────────────────────────────────
function ExpenseModal({ expense, onClose, onSaved }) {
  const isEdit = !!expense?.id;
  const [form, setForm] = useState({
    date:     expense ? toInputDate(expense.date) : todayISO(),
    concept:  expense?.concept  || '',
    amount:   expense?.amount   != null ? String(expense.amount) : '',
    category: expense?.category || 'otros',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.concept.trim() || !form.amount || !form.category) {
      setError('Completa todos los campos');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/expenses/${expense.id}`, form);
      } else {
        await api.post('/expenses', form);
      }
      onSaved();
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-display font-semibold text-stone-800 text-lg">
            {isEdit ? 'Editar gasto' : 'Nuevo gasto'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
            />
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Concepto</label>
            <input
              type="text"
              placeholder="Ej: Tinte Loreal, Factura luz..."
              value={form.concept}
              onChange={e => set('concept', e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
            />
          </div>

          {/* Importe */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Importe (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1.5">Categoría</label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-rose-400 hover:bg-rose-500 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Guardar cambios' : 'Añadir gasto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <Card className="border-stone-100">
      <CardContent className="p-3 md:p-5 flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4">
        <div className={`w-8 h-8 md:w-11 md:h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div className="text-center md:text-left min-w-0">
          <p className="text-[10px] md:text-xs text-stone-400 font-medium leading-tight">{label}</p>
          <p className="text-base md:text-2xl font-bold text-stone-800 leading-tight truncate">{value}</p>
          {sub && <p className="text-[10px] text-stone-400 leading-tight">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function Expenses() {
  const [expenses, setExpenses]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [filterMonth, setFilterMonth]     = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [modal, setModal]         = useState(null); // null | 'new' | expense object
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [expRes, statsRes, billingStatsRes] = await Promise.all([
      api.get('/expenses').catch(() => ({ data: [] })),
      api.get('/expenses/stats').catch(() => ({ data: { totalGastado: 0, byCategory: {}, byMonth: {} } })),
      api.get('/billing/stats').catch(() => ({ data: { totalFacturado: 0 } })),
    ]);
    setExpenses(expRes.data ?? []);
    setStats({
      ...(statsRes.data ?? {}),
      totalIngresos: billingStatsRes.data?.totalFacturado ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Unique months from loaded expenses
  const uniqueMonths = [...new Set(expenses.map(e => e.date?.substring(0, 7)).filter(Boolean))].sort().reverse();

  // Filtered list
  const filtered = expenses.filter(e => {
    const monthOk = filterMonth === 'all' || e.date?.startsWith(filterMonth);
    const catOk   = filterCategory === 'all' || e.category === filterCategory;
    return monthOk && catOk;
  });

  const filteredTotal = filtered.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  const formatMonth = (m) => {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch {
      alert('Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setModal(null);
    load();
  };

  // Calcular siempre desde los datos cargados (no depender del endpoint /expenses/stats)
  const totalGastado  = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalIngresos = stats?.totalIngresos ?? 0;
  const balance       = totalIngresos - totalGastado;

  return (
    <div className="p-4 md:p-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-800">Gastos</h1>
          <p className="text-stone-500 mt-1">Control de gastos de la peluquería</p>
        </div>
        <Button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-white rounded-xl shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo gasto</span>
          <span className="sm:hidden">Añadir</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-5 mb-6">
            <StatCard
              icon={TrendingDown}
              label="Total gastado"
              value={formatCurrency(totalGastado)}
              color="text-rose-500 bg-rose-50"
            />
            <StatCard
              icon={TrendingUp}
              label="Total ingresos"
              value={formatCurrency(totalIngresos)}
              color="text-emerald-600 bg-emerald-50"
            />
            <StatCard
              icon={Wallet}
              label="Balance"
              value={formatCurrency(balance)}
              color={balance >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Mes */}
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-44 rounded-xl">
                <SelectValue placeholder="Todos los meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {uniqueMonths.map(m => (
                  <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Categoría */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Total filtrado */}
            {(filterMonth !== 'all' || filterCategory !== 'all') && (
              <span className="text-sm text-stone-500 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-rose-400" />
                <strong className="text-stone-800">{formatCurrency(filteredTotal)}</strong>
                <span>({filtered.length} gastos)</span>
              </span>
            )}
          </div>

          {/* Tabla */}
          <Card className="border-stone-100">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-sm">
                {expenses.length === 0
                  ? 'Aún no has añadido ningún gasto.'
                  : 'No hay gastos para este filtro.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Concepto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Importe</th>
                      <th className="px-4 py-3 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(expense => (
                      <tr key={expense.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors group">
                        <td className="px-4 py-3.5 text-stone-500 whitespace-nowrap">{formatDate(expense.date)}</td>
                        <td className="px-4 py-3.5 font-medium text-stone-800">{expense.concept}</td>
                        <td className="hidden sm:table-cell px-4 py-3.5">
                          <Badge className={cn('text-xs border-0', categoryMeta[expense.category]?.color ?? 'bg-stone-100 text-stone-600')}>
                            {categoryMeta[expense.category]?.label ?? expense.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-rose-500">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setModal(expense)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              disabled={deletingId === expense.id}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              {deletingId === expense.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : <Trash2 size={14} />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-stone-50">
                      <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-stone-600 sm:hidden">Total</td>
                      <td colSpan={3} className="hidden sm:table-cell px-4 py-3 text-sm font-semibold text-stone-600">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-stone-800">{formatCurrency(filteredTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Modal */}
      {modal && (
        <ExpenseModal
          expense={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
