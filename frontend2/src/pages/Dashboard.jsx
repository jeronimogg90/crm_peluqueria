import { useState, useEffect } from 'react';
import api from '../config/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import CompletionModal from '../components/CompletionModal';
import AddAppointmentModal from '../components/AddAppointmentModal';
import EventTransferModal from '../components/EventTransferModal';
import { CalendarDays, CalendarRange, List, RefreshCw, ChevronLeft, ChevronRight, Plus, Check, X } from 'lucide-react';

// ─── helpers ───────────────────────────────────────────────────────────────────
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getMondayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
};

// ─── STATUS CONFIG ──────────────────────────────────────────────────────────────
const STATUS = {
  confirmed: { label: 'Confirmada', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completada', color: 'bg-emerald-100 text-emerald-700' },
};

// ─── MESSAGE BANNER ─────────────────────────────────────────────────────────────
function MessageBanner({ message, onClose }) {
  if (!message.text) return null;
  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50 border-red-200 text-red-800',
    info:    'bg-blue-50 border-blue-200 text-blue-800',
  };
  return (
    <div className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 text-sm ${colors[message.type] || colors.info}`}>
      <span>{message.text}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

// ─── APPOINTMENT CARD (compact) ─────────────────────────────────────────────────
function ApptChip({ apt, onClick }) {
  const s = STATUS[apt.status] || STATUS.confirmed;
  return (
    <div
      className={`text-xs px-1.5 py-0.5 rounded cursor-pointer truncate ${
        apt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      }`}
      onClick={e => { e.stopPropagation(); onClick(apt); }}
      title={`${apt.time} — ${apt.clientName}`}
    >
      {apt.time} {apt.clientName}
    </div>
  );
}

// ─── DAY OPTIONS MODAL ───────────────────────────────────────────────────────────
function DayOptionsModal({ selectedDate, onClose, onAddAppointment, onViewAppointments }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-stone-800 capitalize">
              {selectedDate.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {selectedDate.appointments.length} {selectedDate.appointments.length === 1 ? 'cita' : 'citas'}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>
        <div className="space-y-2">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors font-medium text-sm"
            onClick={onAddAppointment}
          >
            <Plus size={16} /> Añadir Cita
          </button>
          {selectedDate.appointments.length > 0 && (
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors font-medium text-sm"
              onClick={onViewAppointments}
            >
              <List size={16} /> Ver Citas ({selectedDate.appointments.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DAY APPOINTMENTS MODAL ──────────────────────────────────────────────────────
function DayAppointmentsModal({ selectedDate, services, onClose, onComplete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-stone-100 flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-stone-800 capitalize">
              {selectedDate.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <p className="text-xs text-stone-400">
              {selectedDate.appointments.length} {selectedDate.appointments.length === 1 ? 'cita' : 'citas'}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          {selectedDate.appointments.map(apt => {
            const s = STATUS[apt.status] || STATUS.confirmed;
            const service = services.find(sv => sv.id === apt.serviceId);
            return (
              <div key={apt.id} className="border border-stone-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-0.5 rounded-lg">{apt.time}</span>
                    <span className="font-semibold text-stone-800 text-sm">{apt.clientName}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                </div>
                <p className="text-xs text-stone-500">{service ? service.name : apt.service}</p>
                {apt.notes && <p className="text-xs text-stone-400 italic">{apt.notes}</p>}
                {apt.status === 'confirmed' && (
                  <Button
                    size="sm"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                    onClick={() => { onComplete(apt); onClose(); }}
                  >
                    <Check size={12} className="mr-1" /> Finalizar Cita
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── APPOINTMENT DETAIL MODAL (weekly) ──────────────────────────────────────────
function AppointmentDetailModal({ appointment, services, onClose, onComplete }) {
  const s = STATUS[appointment.status] || STATUS.confirmed;
  const service = services.find(sv => sv.id === appointment.serviceId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-stone-800">{appointment.clientName}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex gap-3">
            <span className="text-stone-400">Fecha:</span>
            <span className="capitalize font-medium">
              {new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-stone-400">Hora:</span>
            <span className="font-medium">{appointment.time}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-stone-400">Servicio:</span>
            <span className="font-medium">{service ? service.name : 'No encontrado'}</span>
          </div>
          {appointment.notes && (
            <div className="flex gap-3">
              <span className="text-stone-400">Notas:</span>
              <span className="italic">{appointment.notes}</span>
            </div>
          )}
          <div className="flex gap-3 items-center">
            <span className="text-stone-400">Estado:</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
          </div>
        </div>
        {appointment.status === 'confirmed' && (
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => { onComplete(appointment); onClose(); }}
          >
            <Check size={14} className="mr-1.5" /> Finalizar Cita
          </Button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════════
function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [workEvents, setWorkEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('monthly');

  // modals
  const [completionModal, setCompletionModal] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayOptions, setShowDayOptions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // calendar nav
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMondayOfWeek(new Date()));

  // ─── data fetching ────────────────────────────────────────────────────────────
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments');
      const mapped = response.data.map(apt => ({
        ...apt,
        clientName: apt.client_name,
        totalPagado: apt.total_pagado,
        completedAt: apt.completed_at,
        slotId: apt.slot_id,
        serviceId: apt.service_id,
        createdAt: apt.created_at,
      }));
      setAppointments(mapped);
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar las citas' });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const r = await api.get('/services');
      setServices(r.data);
    } catch { /* silent */ }
  };

  const fetchGoogleEvents = async () => {
    try {
      const r = await api.get('/google/events');
      setGoogleEvents(r.data.filter(e => !e.is_work_event));
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchGoogleEvents();

    const urlParams = new URLSearchParams(window.location.search);
    const googleAuth = urlParams.get('google_auth');
    if (googleAuth === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setMessage({ type: 'success', text: 'Autorización completada. Sincronizando...' });
      setTimeout(syncAfterAuth, 1000);
    } else if (googleAuth === 'error') {
      window.history.replaceState({}, document.title, window.location.pathname);
      setMessage({ type: 'error', text: 'Error en la autorización de Google Calendar.' });
    }
  }, []);

  const syncAfterAuth = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/google/sync');
      setMessage({ type: 'success', text: `Sincronización completada: ${response.data.workEvents} eventos de trabajo` });
      const workEventsRes = await api.get('/google/work-events');
      setWorkEvents(workEventsRes.data);
      await fetchGoogleEvents();
      if (workEventsRes.data.length > 0) setShowTransferModal(true);
    } catch {
      setMessage({ type: 'error', text: 'Error en sincronización automática.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleGoogleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/google/sync');
      setMessage({ type: 'success', text: `Sincronización completada: ${response.data.workEvents} eventos de trabajo, ${response.data.regularEvents} eventos regulares` });
      const workEventsRes = await api.get('/google/work-events');
      setWorkEvents(workEventsRes.data);
      await fetchGoogleEvents();
      if (workEventsRes.data.length > 0) setShowTransferModal(true);
    } catch (error) {
      if (error.response?.data?.needsAuth) {
        try {
          const authRes = await api.get('/google/auth-url');
          setMessage({ type: 'info', text: 'Abriendo ventana de autorización de Google Calendar...' });
          const w = 600, h = 700;
          const left = (window.screen.width / 2) - (w / 2);
          const top = (window.screen.height / 2) - (h / 2);
          window.open(authRes.data.url, 'Google Calendar Authorization', `width=${w},height=${h},top=${top},left=${left},resizable=yes`);
          setTimeout(() => setMessage({ type: 'info', text: 'Después de autorizar, vuelve a hacer clic en Sincronizar' }), 2000);
        } catch {
          setMessage({ type: 'error', text: 'Error al obtener URL de autorización de Google' });
        }
      } else {
        setMessage({ type: 'error', text: error.response?.data?.error || 'Error al sincronizar con Google Calendar' });
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleComplete = async (appointmentId, serviciosRealizados, paymentData, clientId = null) => {
    await api.patch(`/appointments/${appointmentId}/complete`, {
      serviciosRealizados,
      paymentMethod: paymentData.paymentMethod,
      cashReceived: paymentData.cashReceived,
      change: paymentData.change,
      clientId,
    });
    setMessage({ type: 'success', text: 'Cita finalizada y añadida a facturación' });
    fetchAppointments();
    setCompletionModal(null);
  };

  const handleTransferComplete = (msg) => {
    setMessage({ type: 'success', text: msg });
    setShowTransferModal(false);
    setWorkEvents([]);
    fetchAppointments();
    fetchGoogleEvents();
  };

  // ─── derived state ────────────────────────────────────────────────────────────
  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  const getApptsForDate = (date) => {
    const key = formatDateKey(date);
    return filteredAppointments.filter(a => a.date === key).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getGEventsForDate = (date) => {
    const key = formatDateKey(date);
    return googleEvents.filter(e => e.date === key).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // ─── MONTHLY ─────────────────────────────────────────────────────────────────
  const getMonthDays = (d) => {
    const year = d.getFullYear(), month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const daysFromPrev = startDow === 0 ? 6 : startDow - 1;
    const prevLastDay = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = daysFromPrev; i > 0; i--) {
      days.push({ date: new Date(year, month - 1, prevLastDay - i + 1), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const monthDays = getMonthDays(currentMonth);
  const todayKey = formatDateKey(new Date());

  // ─── WEEKLY ──────────────────────────────────────────────────────────────────
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + i);
    return d;
  });

  // ─── LIST ────────────────────────────────────────────────────────────────────
  const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
    if (!acc[apt.date]) acc[apt.date] = [];
    acc[apt.date].push(apt);
    return acc;
  }, {});
  const sortedDates = Object.keys(appointmentsByDate).sort();

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="p-4 md:p-6 space-y-5 min-h-screen bg-[#fdf9f7]">
      {/* Page title */}
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-800">Panel de Administración</h1>
        <p className="text-sm text-stone-400 mt-0.5">Gestiona las solicitudes de citas</p>
      </div>

      {/* Message */}
      <MessageBanner message={message} onClose={() => setMessage({ type: '', text: '' })} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-stone-700', bg: 'bg-white' },
          { label: 'Confirmadas', value: stats.confirmed, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Completadas', value: stats.completed, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl shadow-sm border border-stone-100 p-4 text-center`}>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        {/* View toggle */}
        <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1">
          {[
            { mode: 'monthly', icon: <CalendarDays size={14} />, label: 'Mes' },
            { mode: 'weekly',  icon: <CalendarRange size={14} />, label: 'Semana' },
            { mode: 'list',    icon: <List size={14} />,           label: 'Lista' },
          ].map(v => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === v.mode ? 'bg-rose-400 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {v.icon} {v.label}
            </button>
          ))}
          <button
            onClick={handleGoogleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Google Cal'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-1 bg-white border border-stone-200 rounded-xl p-1">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'confirmed', label: 'Confirmadas' },
            { value: 'completed', label: 'Completadas' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.value ? 'bg-stone-700 text-white' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-center text-stone-400 text-sm py-4">Cargando citas...</div>}

      {/* ═══ MONTHLY VIEW ═══════════════════════════════════════════════════════ */}
      {viewMode === 'monthly' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-stone-100 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="font-display font-semibold text-stone-800 capitalize">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="text-xs px-2 py-0.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50"
              >
                Hoy
              </button>
            </div>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-stone-100 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-stone-100">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-stone-400 uppercase tracking-wide">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {monthDays.map((dayInfo, i) => {
              const dayApts = getApptsForDate(dayInfo.date);
              const dayGE = getGEventsForDate(dayInfo.date);
              const isToday = formatDateKey(dayInfo.date) === todayKey;
              const hasItems = dayApts.length > 0 || dayGE.length > 0;

              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-[80px] p-1.5 border-b border-r border-stone-100 transition-colors',
                    dayInfo.isCurrentMonth ? 'bg-white' : 'bg-stone-50/50',
                    dayInfo.isCurrentMonth && hasItems && 'cursor-pointer hover:bg-rose-50/40',
                    dayInfo.isCurrentMonth && !hasItems && 'cursor-pointer hover:bg-stone-50',
                  )}
                  onClick={() => {
                    if (!dayInfo.isCurrentMonth) return;
                    setSelectedDate({ date: dayInfo.date, appointments: dayApts });
                    setShowDayOptions(true);
                  }}
                >
                  <div className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1',
                    isToday ? 'bg-rose-400 text-white' : dayInfo.isCurrentMonth ? 'text-stone-700' : 'text-stone-300'
                  )}>
                    {dayInfo.date.getDate()}
                  </div>

                  {/* Appointment chips */}
                  <div className="space-y-0.5">
                    {dayApts.slice(0, 3).map((apt, idx) => (
                      <ApptChip key={idx} apt={apt} onClick={(a) => {
                        setSelectedDate({ date: dayInfo.date, appointments: dayApts });
                        setShowDayOptions(false);
                      }} />
                    ))}
                    {dayApts.length > 3 && (
                      <div className="text-xs text-stone-400 pl-1">+{dayApts.length - 3} más</div>
                    )}
                  </div>

                  {/* Google event chips */}
                  <div className="space-y-0.5 mt-0.5">
                    {dayGE.slice(0, 2).map((evt, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 truncate"
                        title={`${evt.start_time} — ${evt.summary}`}
                      >
                        {evt.start_time} {evt.summary}
                      </div>
                    ))}
                    {dayGE.length > 2 && (
                      <div className="text-xs text-stone-400 pl-1">+{dayGE.length - 2} Google</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ WEEKLY VIEW ════════════════════════════════════════════════════════ */}
      {viewMode === 'weekly' && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {/* Week nav */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
            <button onClick={() => { const d = new Date(currentWeekStart); d.setDate(d.getDate() - 7); setCurrentWeekStart(d); }} className="p-1.5 hover:bg-stone-100 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <span className="font-display font-semibold text-stone-800 text-sm">
                {currentWeekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                {' — '}
                {weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <button
                onClick={() => setCurrentWeekStart(getMondayOfWeek(new Date()))}
                className="text-xs px-2 py-0.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50"
              >
                Hoy
              </button>
            </div>
            <button onClick={() => { const d = new Date(currentWeekStart); d.setDate(d.getDate() + 7); setCurrentWeekStart(d); }} className="p-1.5 hover:bg-stone-100 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Week columns */}
          <div className="grid grid-cols-7 divide-x divide-stone-100">
            {weekDays.map((day, idx) => {
              const dayApts = getApptsForDate(day);
              const dayGE = getGEventsForDate(day);
              const isToday = formatDateKey(day) === todayKey;
              return (
                <div key={idx} className={cn('min-h-[180px]', isToday && 'bg-rose-50/30')}>
                  <div className={cn(
                    'flex flex-col items-center py-2 border-b border-stone-100',
                    isToday && 'bg-rose-50'
                  )}>
                    <span className="text-xs text-stone-400 capitalize">
                      {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </span>
                    <span className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mt-0.5',
                      isToday ? 'bg-rose-400 text-white' : 'text-stone-700'
                    )}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="p-1.5 space-y-1">
                    {dayApts.map(apt => {
                      const service = services.find(s => s.id === apt.serviceId);
                      return (
                        <div
                          key={apt.id}
                          className={cn(
                            'text-xs p-1.5 rounded-lg cursor-pointer border',
                            apt.status === 'completed'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          )}
                          onClick={() => setSelectedAppointment(apt)}
                        >
                          <div className="font-semibold">{apt.time}</div>
                          <div className="truncate">{apt.clientName}</div>
                          {service && <div className="truncate text-[10px] opacity-70">{service.name}</div>}
                        </div>
                      );
                    })}
                    {dayGE.map(evt => (
                      <div key={evt.id} className="text-xs p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-800">
                        <div className="font-semibold">{evt.start_time}</div>
                        <div className="truncate">{evt.summary}</div>
                      </div>
                    ))}
                    {dayApts.length === 0 && dayGE.length === 0 && (
                      <p className="text-xs text-stone-300 text-center py-4">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ LIST VIEW ══════════════════════════════════════════════════════════ */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {sortedDates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center text-stone-400">
              No hay citas
            </div>
          ) : (
            sortedDates.map(date => {
              const dayApts = appointmentsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
              const dayGE = googleEvents.filter(e => e.start_date === date);
              return (
                <div key={date} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-stone-100">
                    <h3 className="font-semibold text-stone-700 capitalize text-sm">
                      {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <span className="text-xs text-stone-400">
                      {dayApts.length} cita{dayApts.length !== 1 ? 's' : ''}
                      {dayGE.length > 0 && ` · ${dayGE.length} Google`}
                    </span>
                  </div>
                  <div className="divide-y divide-stone-50">
                    {dayApts.map(apt => {
                      const s = STATUS[apt.status] || STATUS.confirmed;
                      const service = services.find(sv => sv.id === apt.serviceId);
                      return (
                        <div key={apt.id} className="flex items-center gap-4 px-5 py-3">
                          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-lg shrink-0">{apt.time}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-800 text-sm">{apt.clientName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">{service ? service.name : apt.service}</p>
                            {apt.notes && <p className="text-xs text-stone-300 italic mt-0.5">{apt.notes}</p>}
                          </div>
                          {apt.status === 'confirmed' && (
                            <Button
                              size="sm"
                              className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
                              onClick={() => setCompletionModal(apt)}
                            >
                              <Check size={12} className="mr-1" /> Finalizar
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    {dayGE.map(evt => (
                      <div key={evt.id} className="flex items-center gap-4 px-5 py-3 bg-blue-50/30">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg shrink-0">{evt.start_time}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-700 text-sm">{evt.summary}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Google</span>
                          </div>
                          {evt.description && <p className="text-xs text-stone-400 mt-0.5">{evt.description}</p>}
                          {evt.end_time && <p className="text-xs text-stone-300">{evt.start_time} — {evt.end_time}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ FAB — Add appointment ══════════════════════════════════════════════ */}
      <button
        onClick={() => { setSelectedDate(null); setShowAddModal(true); }}
        className="fixed bottom-6 right-6 w-12 h-12 bg-rose-400 hover:bg-rose-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="Nueva cita"
      >
        <Plus size={20} />
      </button>

      {/* ═══ MODALS ══════════════════════════════════════════════════════════════ */}

      {/* Day options */}
      {selectedDate && showDayOptions && (
        <DayOptionsModal
          selectedDate={selectedDate}
          onClose={() => { setShowDayOptions(false); setSelectedDate(null); }}
          onAddAppointment={() => { setShowDayOptions(false); setShowAddModal(true); }}
          onViewAppointments={() => setShowDayOptions(false)}
        />
      )}

      {/* Day appointments list */}
      {selectedDate && !showDayOptions && selectedDate.appointments.length > 0 && (
        <DayAppointmentsModal
          selectedDate={selectedDate}
          services={services}
          onClose={() => setSelectedDate(null)}
          onComplete={(apt) => setCompletionModal(apt)}
        />
      )}

      {/* Weekly appointment detail */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          services={services}
          onClose={() => setSelectedAppointment(null)}
          onComplete={(apt) => { setCompletionModal(apt); setSelectedAppointment(null); }}
        />
      )}

      {/* Add appointment */}
      {showAddModal && (
        <AddAppointmentModal
          onClose={() => { setShowAddModal(false); setSelectedDate(null); }}
          onSuccess={(msg) => { setMessage({ type: 'success', text: msg }); fetchAppointments(); }}
          preselectedDate={selectedDate ? formatDateKey(selectedDate.date) : ''}
        />
      )}

      {/* Complete appointment */}
      {completionModal && (
        <CompletionModal
          appointment={completionModal}
          services={services}
          onClose={() => setCompletionModal(null)}
          onComplete={handleComplete}
        />
      )}

      {/* Transfer Google events */}
      {showTransferModal && workEvents.length > 0 && (
        <EventTransferModal
          events={workEvents}
          services={services}
          onClose={() => { setShowTransferModal(false); setWorkEvents([]); }}
          onComplete={handleTransferComplete}
        />
      )}
    </div>
  );
}

export default Dashboard;
