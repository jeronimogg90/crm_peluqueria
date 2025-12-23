import { useState, useEffect } from 'react';
import api from '../config/api';
import EditClientModal from './EditClientModal';
import './ClientDetailModal.css';

function ClientDetailModal({ client, onClose, onUpdate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentClient, setCurrentClient] = useState(client);

  useEffect(() => {
    fetchHistory();
  }, [client.id]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/clients/${client.id}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error obteniendo historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = (message) => {
    // Recargar datos del cliente
    api.get(`/clients/${client.id}`).then(response => {
      setCurrentClient(response.data);
      if (onUpdate) {
        onUpdate();
      }
    });
  };

  // Agrupar citas por año y mes
  const groupedHistory = history.reduce((acc, appointment) => {
    const date = new Date(appointment.date + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    
    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    
    acc[year][month].push(appointment);
    return acc;
  }, {});

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleMonth = (yearMonth) => {
    setExpandedMonths(prev => ({ ...prev, [yearMonth]: !prev[yearMonth] }));
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      efectivo: '💵 Efectivo',
      tarjeta: '💳 Tarjeta',
      bizum: '📱 Bizum',
      transferencia: '🏦 Transferencia'
    };
    return methods[method] || method;
  };

  const totalGastado = history.reduce((sum, apt) => sum + (apt.totalPagado || 0), 0);
  const years = Object.keys(groupedHistory).sort((a, b) => b - a);

  return (
    <>
      <div className="client-detail-modal-overlay" onClick={onClose}>
        <div className="client-detail-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>✕</button>
          
          <div className="client-detail-header">
            <div className="client-avatar-large">
              {currentClient.nombre.charAt(0)}{currentClient.apellidos.charAt(0)}
            </div>
            <div className="client-detail-info">
              <h2>{currentClient.nombre} {currentClient.apellidos}</h2>
              {currentClient.telefono && <p>📞 {currentClient.telefono}</p>}
              {currentClient.email && <p>📧 {currentClient.email}</p>}
            </div>
            <button className="btn-edit-client" onClick={() => setShowEditModal(true)} title="Editar cliente">
              ✏️
            </button>
          </div>

        <div className="client-summary">
          <div className="summary-card">
            <span className="summary-value">{history.length}</span>
            <span className="summary-label">Citas Realizadas</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">{totalGastado.toFixed(2)}€</span>
            <span className="summary-label">Total Gastado</span>
          </div>
          <div className="summary-card">
            <span className="summary-value">
              {history.length > 0 ? (totalGastado / history.length).toFixed(2) : '0.00'}€
            </span>
            <span className="summary-label">Promedio por Cita</span>
          </div>
        </div>

        <h3 className="history-title">📅 Historial de Citas</h3>

        {loading && <p className="loading-history">Cargando historial...</p>}

        {!loading && history.length === 0 && (
          <p className="no-history">Este cliente aún no tiene citas completadas</p>
        )}

        {!loading && history.length > 0 && (
          <div className="history-accordion">
            {years.map(year => (
              <div key={year} className="year-section">
                <div 
                  className="year-header"
                  onClick={() => toggleYear(year)}
                >
                  <span className="year-title">📆 {year}</span>
                  <span className="expand-icon">{expandedYears[year] ? '▼' : '▶'}</span>
                </div>

                {expandedYears[year] && (
                  <div className="year-content">
                    {Object.keys(groupedHistory[year]).map(month => {
                      const monthKey = `${year}-${month}`;
                      const monthAppointments = groupedHistory[year][month];
                      const monthTotal = monthAppointments.reduce((sum, apt) => sum + apt.totalPagado, 0);

                      return (
                        <div key={monthKey} className="month-section">
                          <div 
                            className="month-header"
                            onClick={() => toggleMonth(monthKey)}
                          >
                            <span className="month-title">
                              {month.charAt(0).toUpperCase() + month.slice(1)} 
                              <span className="month-count">({monthAppointments.length} citas - {monthTotal.toFixed(2)}€)</span>
                            </span>
                            <span className="expand-icon">{expandedMonths[monthKey] ? '▼' : '▶'}</span>
                          </div>

                          {expandedMonths[monthKey] && (
                            <div className="month-content">
                              {monthAppointments.map(appointment => {
                                const date = new Date(appointment.date + 'T00:00:00');
                                const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
                                const day = date.getDate();

                                return (
                                  <div key={appointment.id} className="appointment-item">
                                    <div className="appointment-date">
                                      <strong>{dayName.charAt(0).toUpperCase() + dayName.slice(1)} {day}</strong>
                                      <span className="appointment-time">{appointment.time}</span>
                                    </div>
                                    <div className="appointment-details">
                                      <p className="services">💇‍♀️ {appointment.servicios || 'Sin especificar'}</p>
                                      {appointment.notes && (
                                        <p className="notes">📝 {appointment.notes}</p>
                                      )}
                                      <div className="appointment-footer">
                                        <span className="total">Total: <strong>{appointment.totalPagado.toFixed(2)}€</strong></span>
                                        {appointment.paymentMethod && (
                                          <span className="payment">{formatPaymentMethod(appointment.paymentMethod)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {showEditModal && (
      <EditClientModal
        client={currentClient}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
      />
    )}
    </>
  );
}

export default ClientDetailModal;
