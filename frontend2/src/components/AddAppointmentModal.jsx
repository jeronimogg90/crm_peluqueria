import { useState, useEffect } from 'react';
import api from '../config/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ClientSearchInput from './ClientSearchInput';

function AddAppointmentModal({ onClose, onSuccess, preselectedDate }) {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    date: preselectedDate || '',
    time: '',
    clientName: '',
    clientId: null,
    serviceId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchServices(); }, []);

  useEffect(() => {
    if (preselectedDate) setFormData(prev => ({ ...prev, date: preselectedDate }));
  }, [preselectedDate]);

  const fetchServices = async () => {
    try {
      const r = await api.get('/services');
      setServices(r.data);
    } catch { /* silent */ }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
      const slotId = `${formData.date}_${formData.time.replace(':', '')}`;
      await api.post('/appointments', {
        slotId,
        date: formData.date,
        time: formData.time,
        clientName: formData.clientName,
        clientId: formData.clientId,
        serviceId: parseInt(formData.serviceId),
        service: selectedService?.name || '',
        notes: formData.notes,
        status: 'confirmed'
      });
      onSuccess('Cita creada exitosamente');
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-800">Nueva Cita</h2>
            <p className="text-xs text-stone-400 mt-0.5">Completa los datos para crear una nueva cita</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date">Fecha</Label>
              <Input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="time">Hora</Label>
              <Input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Cliente</Label>
            <ClientSearchInput
              value={formData.clientName}
              onChange={name => setFormData(prev => ({ ...prev, clientName: name }))}
              onClientSelect={id => setFormData(prev => ({ ...prev, clientId: id }))}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="serviceId">Servicio</Label>
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
                <option key={s.id} value={s.id}>{s.name} — {s.price}€ ({s.duration})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observaciones especiales..."
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="flex-1 bg-rose-400 hover:bg-rose-500 text-white" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Cita'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAppointmentModal;
