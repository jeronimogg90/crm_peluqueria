import { useState, useEffect } from 'react';
import api from '../config/api';
import { Button } from './ui/button';
import { Label } from './ui/label';
import ClientSearchInput from './ClientSearchInput';

function EventTransferModal({ events, onClose, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ clientName: '', clientId: null, serviceId: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const currentEvent = events[currentIndex];

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    if (currentEvent) {
      setFormData({
        clientName: extractClientName(currentEvent.summary),
        clientId: null,
        serviceId: '',
        notes: currentEvent.description || ''
      });
    }
  }, [currentIndex, currentEvent]);

  const fetchServices = async () => {
    try {
      const r = await api.get('/services');
      setServices(r.data);
    } catch { /* silent */ }
  };

  const extractClientName = (summary) => {
    const parts = summary.split('-');
    return parts.length > 1 ? parts[parts.length - 1].trim() : summary;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const advanceOrClose = (msg) => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      onComplete(msg);
      onClose();
    }
  };

  const handleConvert = async () => {
    if (!formData.clientName.trim() || !formData.serviceId) {
      alert('Completa el nombre del cliente y el servicio');
      return;
    }
    try {
      setLoading(true);
      const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
      const slotId = `${currentEvent.date}_${currentEvent.start_time.replace(':', '')}`;
      const aptRes = await api.post('/appointments', {
        slotId,
        date: currentEvent.date,
        time: currentEvent.start_time,
        clientName: formData.clientName,
        clientId: formData.clientId,
        serviceId: parseInt(formData.serviceId),
        service: selectedService?.name || '',
        notes: formData.notes,
        status: 'confirmed'
      });
      await api.patch(`/google/events/${currentEvent.id}/convert`, {
        appointmentId: aptRes.data.appointment.id
      });
      advanceOrClose('Todos los eventos convertidos exitosamente');
    } catch {
      alert('Error al convertir el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await api.delete(`/google/events/${currentEvent.id}`);
      advanceOrClose('Conversión completada');
    } catch {
      alert('Error al descartar el evento');
    }
  };

  if (!currentEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-800">Convertir Eventos de Google Calendar</h2>
            <p className="text-xs text-stone-400 mt-0.5">Evento {currentIndex + 1} de {events.length}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-stone-100">
          <div
            className="h-full bg-rose-400 transition-all"
            style={{ width: `${((currentIndex + 1) / events.length) * 100}%` }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-0 divide-x divide-stone-100">
          {/* Left: Google Event */}
          <div className="p-6 space-y-3">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Evento de Google Calendar</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-stone-800 text-sm">{currentEvent.summary}</h3>
                <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Google</span>
              </div>
              <div className="space-y-1 text-sm text-stone-600">
                <p>
                  <span className="text-stone-400">Fecha: </span>
                  {new Date(currentEvent.date + 'T00:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
                <p>
                  <span className="text-stone-400">Horario: </span>
                  {currentEvent.start_time} — {currentEvent.end_time}
                </p>
                {currentEvent.location && (
                  <p><span className="text-stone-400">Ubicación: </span>{currentEvent.location}</p>
                )}
                {currentEvent.description && (
                  <p><span className="text-stone-400">Descripción: </span>{currentEvent.description}</p>
                )}
                {currentEvent.attendees && (
                  <p><span className="text-stone-400">Asistentes: </span>{currentEvent.attendees}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Appointment form */}
          <div className="p-6 space-y-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Crear Cita en el Sistema</p>

            <div className="space-y-1">
              <Label>Cliente *</Label>
              <ClientSearchInput
                value={formData.clientName}
                onChange={name => setFormData(prev => ({ ...prev, clientName: name }))}
                onClientSelect={id => setFormData(prev => ({ ...prev, clientId: id }))}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="serviceId">Servicio *</Label>
              <select
                id="serviceId"
                name="serviceId"
                value={formData.serviceId}
                onChange={handleChange}
                required
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <option value="">Selecciona un servicio</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.price}€ ({s.duration} min)</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes">Notas</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Observaciones adicionales..."
                rows={4}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              />
            </div>

            <div className="flex gap-3 text-sm bg-stone-50 rounded-xl px-3 py-2">
              <span><span className="text-stone-400">Fecha: </span><span className="font-medium">{new Date(currentEvent.date + 'T00:00:00').toLocaleDateString('es-ES')}</span></span>
              <span><span className="text-stone-400">Hora: </span><span className="font-medium">{currentEvent.start_time}</span></span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-stone-100">
          <Button variant="outline" onClick={handleSkip} disabled={loading}>
            Saltar este evento
          </Button>
          <Button
            className="bg-rose-400 hover:bg-rose-500 text-white"
            onClick={handleConvert}
            disabled={loading}
          >
            {loading ? 'Convirtiendo...' : 'Convertir a Cita'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EventTransferModal;
