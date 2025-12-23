import { useState, useEffect } from 'react';
import api from '../config/api';
import ClientSearchInput from '../components/ClientSearchInput';
import './Booking.css';

function Booking() {
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    slotId: '',
    date: '',
    time: '',
    clientName: '',
    clientId: null,
    service: '',
    notes: ''
  });

  useEffect(() => {
    fetchAvailableSlots();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/slots');
      setSlots(response.data);
    } catch (error) {
      console.error('Error obteniendo slots:', error);
      setMessage({ type: 'error', text: 'Error al cargar los horarios disponibles' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClientSelect = (clientId) => {
    setFormData(prev => ({ ...prev, clientId }));
  };

  const handleClientNameChange = (clientName) => {
    setFormData(prev => ({ ...prev, clientName }));
  };

  const handleSlotSelect = (slot) => {
    setFormData(prev => ({
      ...prev,
      slotId: slot.id,
      date: slot.date,
      time: slot.time
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos
    if (!formData.slotId || !formData.clientName || !formData.service) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos obligatorios' });
      return;
    }

    try {
      setLoading(true);
      await api.post('/appointments', formData);
      
      setMessage({ 
        type: 'success', 
        text: '¡Cita creada exitosamente!' 
      });
      
      // Limpiar formulario
      setFormData({
        slotId: '',
        date: '',
        time: '',
        clientName: '',
        clientId: null,
        service: '',
        notes: ''
      });
      
      // Recargar slots disponibles
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error creando cita:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error al crear la cita. Por favor intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Agrupar slots por fecha
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="booking">
      <div className="booking-container">
        <h1>Crear Nueva Cita</h1>
        <p className="booking-subtitle">Selecciona un horario disponible y registra la cita</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        <div className="booking-content">
          <div className="slots-section">
            <h2>Horarios Disponibles</h2>
            {loading && <p>Cargando horarios...</p>}
            {!loading && Object.keys(slotsByDate).length === 0 && (
              <p>No hay horarios disponibles en este momento</p>
            )}
            <div className="slots-by-date">
              {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                <div key={date} className="date-group">
                  <h3>{new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</h3>
                  <div className="time-slots">
                    {dateSlots.map(slot => (
                      <button
                        key={slot.id}
                        className={`time-slot ${formData.slotId === slot.id ? 'selected' : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2>Datos de la Cita</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="clientName">Nombre de la Clienta *</label>
                <ClientSearchInput
                  value={formData.clientName}
                  onChange={handleClientNameChange}
                  onClientSelect={handleClientSelect}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="service">Servicio *</label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map(service => (
                    <option key={service.id} value={service.name}>
                      {service.name} - {service.price}€ ({service.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notas adicionales</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Cualquier detalle relevante..."
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !formData.slotId}
              >
                {loading ? 'Creando...' : 'Crear Cita'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Booking;
