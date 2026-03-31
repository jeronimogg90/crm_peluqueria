import { useState, useEffect } from 'react';
import { TrendingUp, CalendarCheck, BadgeEuro, BarChart3, Loader2, Clock } from 'lucide-react';
import api from '../config/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const paymentLabels = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  bizum: 'Bizum',
  transfer: 'Transferencia',
};

export default function Billing() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    Promise.all([api.get('/billing'), api.get('/billing/stats')])
      .then(([aptRes, statsRes]) => {
        const mapped = aptRes.data.map(a => ({
          ...a,
          clientName: a.client_name || a.clientName,
          totalPagado: a.total_pagado ?? a.totalPagado ?? 0,
          completedAt: a.completed_at || a.completedAt,
          paymentMethod: a.payment_method || a.paymentMethod,
        }));
        setAppointments(mapped);
        setStats(statsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const uniqueMonths = [...new Set(appointments.map(a => (a.completedAt || '').substring(0, 7)).filter(Boolean))].sort().reverse();

  const filtered = filterMonth === 'all'
    ? appointments
    : appointments.filter(a => (a.completedAt || '').startsWith(filterMonth));

  const filteredTotal = filtered.reduce((s, a) => s + (a.totalPagado || 0), 0);

  const formatDate = (str) => str ? new Date(str).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const formatMonth = (m) => { const [y, mo] = m.split('-'); return new Date(y, mo - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }); };

  return (
    <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-stone-800">Facturación</h1>
          <p className="text-stone-500 mt-1">Historial de citas completadas e ingresos</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <StatCard icon={CalendarCheck} label="Total citas" value={stats?.totalCitas ?? 0} color="text-rose-500 bg-rose-50" />
              <StatCard icon={BadgeEuro} label="Total facturado" value={`${(stats?.totalFacturado ?? 0).toFixed(2)}€`} color="text-emerald-600 bg-emerald-50" />
              <StatCard icon={BarChart3} label="Promedio por cita" value={`${(stats?.promedioPorCita ?? 0).toFixed(2)}€`} color="text-amber-600 bg-amber-50" />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-5">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-52 rounded-xl">
                  <SelectValue placeholder="Filtrar por mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los meses</SelectItem>
                  {uniqueMonths.map(m => (
                    <SelectItem key={m} value={m}>{formatMonth(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterMonth !== 'all' && (
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Total mes: <strong className="text-stone-800">{filteredTotal.toFixed(2)}€</strong></span>
                </div>
              )}
            </div>

            {/* Table */}
            <Card className="border-stone-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Clienta</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Servicio</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Pago</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-stone-400">
                          No hay citas completadas para este periodo.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(a => (
                        <tr key={a.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-stone-800">{a.clientName}</td>
                          <td className="px-5 py-3.5 text-stone-500">{a.service || '—'}</td>
                          <td className="px-5 py-3.5 text-stone-500">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-stone-300" />
                              {formatDate(a.completedAt)}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant="secondary" className="text-xs">
                              {paymentLabels[a.paymentMethod] || a.paymentMethod || '—'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold text-emerald-600">
                            {(a.totalPagado || 0).toFixed(2)}€
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filtered.length > 0 && (
                    <tfoot>
                      <tr className="bg-stone-50">
                        <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-stone-600">Total</td>
                        <td className="px-5 py-3 text-right font-bold text-stone-800">{filteredTotal.toFixed(2)}€</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </Card>
          </>
        )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="border-stone-100">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-stone-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-stone-800 leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
