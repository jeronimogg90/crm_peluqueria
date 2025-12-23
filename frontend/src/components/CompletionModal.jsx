import { useState } from 'react';
import PaymentModal from './PaymentModal';
import ClientSearchInput from './ClientSearchInput';
import './CompletionModal.css';

function CompletionModal({ appointment, services, onClose, onComplete }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [clientName, setClientName] = useState(appointment.clientName || '');
  const [clientId, setClientId] = useState(appointment.client_id || null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
  };
  
  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      alert('Por favor selecciona al menos un servicio');
      return;
    }

    // Abrir modal de pago en lugar de finalizar directamente
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData) => {
    try {
      setLoading(true);
      await onComplete(appointment.id, selectedServices, paymentData, clientId);
      setShowPaymentModal(false);
      onClose();
    } catch (error) {
      console.error('Error completando cita:', error);
      alert('Error al completar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (selectedClientId) => {
    setClientId(selectedClientId);
  };

  const handleClientNameChange = (name) => {
    setClientName(name);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          
          <h2>Finalizar Cita</h2>
          <div className="appointment-info">
            {!appointment.client_id ? (
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label><strong>👤 Cliente:</strong></label>
                <ClientSearchInput
                  value={clientName}
                  onChange={handleClientNameChange}
                  onClientSelect={handleClientSelect}
                  required
                />
                <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
                  Asocia esta cita a un cliente existente o crea uno nuevo
                </small>
              </div>
            ) : (
              <p><strong>Cliente:</strong> {appointment.clientName}</p>
            )}
            <p><strong>Fecha:</strong> {new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES')}</p>
            <p><strong>Hora:</strong> {appointment.time}</p>
          </div>

          <h3>Servicios Realizados</h3>
          <div className="services-selection">
            {services.map(service => (
              <label key={service.id} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.id)}
                  onChange={() => handleServiceToggle(service.id)}
                />
                <span className="service-info">
                  <span className="service-name">{service.name}</span>
                  <span className="service-price">{service.price}€</span>
                </span>
              </label>
            ))}
          </div>

          <div className="total-section">
            <h3>Total a Pagar: <span className="total-amount">{calculateTotal().toFixed(2)}€</span></h3>
          </div>

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button 
              className="btn-confirm" 
              onClick={handleSubmit}
              disabled={loading || selectedServices.length === 0}
            >
              Continuar al Pago →
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          total={calculateTotal()}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </>
  );
}

export default CompletionModal;

