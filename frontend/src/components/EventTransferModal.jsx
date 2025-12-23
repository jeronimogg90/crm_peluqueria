import { useState, useEffect } from 'react';
import api from '../config/api';
import ClientSearchInput from './ClientSearchInput';
import './EventTransferModal.css';

function EventTransferModal({ events, onClose, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    clientName: '',
    clientId: null,
    serviceId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const currentEvent = events[currentIndex];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (currentEvent) {
      // Pre-rellenar formulario con datos del evento
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
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
    }
  };

  const extractClientName = (summary) => {
    // Intentar extraer nombre del cliente del título
    // Ej: "Cita - María García" -> "María García"
    const parts = summary.split('-');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    return summary;
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

  const handleConvert = async () => {
    if (!formData.clientName.trim() || !formData.serviceId) {
      alert('Por favor completa el nombre del cliente y el servicio');
      return;
    }

    try {
      setLoading(true);
      
      const selectedService = services.find(s => s.id === parseInt(formData.serviceId));
      const slotId = `${currentEvent.date}_${currentEvent.start_time.replace(':', '')}`;
      
      // Crear cita
      const appointmentResponse = await api.post('/appointments', {
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
      
      // Marcar evento como convertido
      await api.patch(`/google/events/${currentEvent.id}/convert`, {
        appointmentId: appointmentResponse.data.appointment.id
      });
      
      // Ir al siguiente evento o cerrar
      if (currentIndex < events.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete('Todos los eventos convertidos exitosamente');
        onClose();
      }
    } catch (error) {
      console.error('Error convirtiendo evento:', error);
      alert('Error al convertir el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Descartar evento (eliminar sin convertir)
      await api.delete(`/google/events/${currentEvent.id}`);
      
      if (currentIndex < events.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onComplete('Conversión completada');
        onClose();
      }
    } catch (error) {
      console.error('Error descartando evento:', error);
      alert('Error al descartar el evento');
    }
  };

  if (!currentEvent) {
    return null;
  }

  return (
    <div className="event-transfer-modal-overlay">
      <div className="event-transfer-modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="transfer-header">
          <h2>Convertir Eventos de Google Calendar</h2>
          <div className="progress-indicator">
            Evento {currentIndex + 1} de {events.length}
          </div>
        </div>

        <div className="transfer-body">
          {/* Panel Izquierdo: Evento de Google */}
          <div className="google-event-panel">
            <h3>📅 Evento de Google Calendar</h3>
            
            <div className="event-card">
              <div className="event-header">
                <h4>{currentEvent.summary}</h4>
                <span className="event-badge">Google Calendar</span>
              </div>
              
              <div className="event-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Fecha:</span>
                  <span className="detail-value">
                    {new Date(currentEvent.date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">🕐 Horario:</span>
                  <span className="detail-value">
                    {currentEvent.start_time} - {currentEvent.end_time}
                  </span>
                </div>
                
                {currentEvent.location && (
                  <div className="detail-row">
                    <span className="detail-label">📍 Ubicación:</span>
                    <span className="detail-value">{currentEvent.location}</span>
                  </div>
                )}
                
                {currentEvent.description && (
                  <div className="detail-row">
                    <span className="detail-label">📝 Descripción:</span>
                    <span className="detail-value">{currentEvent.description}</span>
                  </div>
                )}
                
                {currentEvent.attendees && (
                  <div className="detail-row">
                    <span className="detail-label">👥 Asistentes:</span>
                    <span className="detail-value">{currentEvent.attendees}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Derecho: Formulario de Cita */}
          <div className="appointment-form-panel">
            <h3>➕ Crear Cita en el Sistema</h3>
            
            <form className="conversion-form">
              <div className="form-group">
                <label>👤 Cliente *</label>
                <ClientSearchInput
                  value={formData.clientName}
                  onChange={handleClientNameChange}
                  onClientSelect={handleClientSelect}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="serviceId">💇‍♀️ Servicio *</label>
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
                      {service.name} - {service.price}€ ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">📝 Notas</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observaciones adicionales..."
                  rows="4"
                  className="form-input"
                />
              </div>

              <div className="form-info">
                <div className="info-item">
                  <strong>Fecha:</strong> {new Date(currentEvent.date + 'T00:00:00').toLocaleDateString('es-ES')}
                </div>
                <div className="info-item">
                  <strong>Hora:</strong> {currentEvent.start_time}
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="transfer-footer">
          <button 
            type="button" 
            onClick={handleSkip}
            className="btn-skip"
            disabled={loading}
          >
            ⏭️ Saltar este Evento
          </button>
          <button 
            type="button"
            onClick={handleConvert}
            className="btn-convert"
            disabled={loading}
          >
            {loading ? 'Convirtiendo...' : '✓ Convertir a Cita'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventTransferModal;
