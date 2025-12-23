import { useState, useEffect } from 'react';
import api from '../config/api';
import ClientSearchInput from './ClientSearchInput';
import './AddAppointmentModal.css';

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

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (preselectedDate) {
      setFormData(prev => ({ ...prev, date: preselectedDate }));
    }
  }, [preselectedDate]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientSelect = (clientId) => {
    setFormData(prev => ({ ...prev, clientId }));
  };

  const handleClientNameChange = (clientName) => {
    setFormData(prev => ({ ...prev, clientName }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Obtener el nombre del servicio seleccionado
      const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
      
      // Generar un slotId único basado en fecha y hora
      const slotId = `${formData.date}_${formData.time.replace(':', '')}`;
      
      await api.post('/appointments', {
        slotId: slotId,
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
      console.error('Error creando cita:', error);
      setError(error.response?.data?.error || 'Error al crear la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-appointment-modal-overlay" onClick={onClose}>
      <div className="add-appointment-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>➕ Nueva Cita</h2>
        <p className="modal-subtitle">Completa los datos para crear una nueva cita</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">📅 Fecha</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">🕐 Hora</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="clientName">👤 Nombre del Cliente</label>
            <ClientSearchInput
              value={formData.clientName}
              onChange={handleClientNameChange}
              onClientSelect={handleClientSelect}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="serviceId">💇‍♀️ Servicio</label>
            <select
              id="serviceId"
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Selecciona un servicio</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.price}€ ({service.duration})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">📝 Notas (opcional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Observaciones especiales..."
              rows="3"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Creando...' : '✓ Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAppointmentModal;
