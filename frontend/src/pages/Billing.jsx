import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import './Billing.css';

function Billing() {
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [modalServices, setModalServices] = useState([]);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, statsRes, servicesRes] = await Promise.all([
        api.get('/billing'),
        api.get('/billing/stats'),
        api.get('/services')
      ]);
      
      // Transformar datos de snake_case a camelCase
      const transformedAppointments = appointmentsRes.data.map(apt => ({
        ...apt,
        clientName: apt.client_name,
        totalPagado: apt.total_pagado,
        completedAt: apt.completed_at,
        slotId: apt.slot_id,
        serviceId: apt.service_id,
        createdAt: apt.created_at
      }));
      
      setCompletedAppointments(transformedAppointments);
      setStats(statsRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error obteniendo facturación:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = filterMonth === 'all' 
    ? completedAppointments 
    : completedAppointments.filter(apt => apt.completedAt.substring(0, 7) === filterMonth);

  const totalFiltered = filteredAppointments.reduce((sum, apt) => sum + apt.totalPagado, 0);

  // Obtener meses únicos
  const uniqueMonths = [...new Set(completedAppointments.map(apt => apt.completedAt.substring(0, 7)))].sort().reverse();

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="billing">
      <div className="billing-container">
        <div className="dashboard-nav">
          <Link to="/admin" className="nav-item">
            📋 Citas
          </Link>
          <Link to="/admin/servicios" className="nav-item">
            💼 Servicios
          </Link>
          <Link to="/admin/facturacion" className="nav-item active">
            💰 Facturación
          </Link>
        </div>

        <h1>Facturación</h1>
        <p className="billing-subtitle">Historial de citas completadas e ingresos</p>

        {loading ? (
          <p className="loading">Cargando...</p>
        ) : (
          <>
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalCitas}</div>
                  <div className="stat-label">Citas Completadas</div>
                </div>
                <div className="stat-card money">
                  <div className="stat-number">{stats.totalFacturado.toFixed(2)}€</div>
                  <div className="stat-label">Total Facturado</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{totalFiltered.toFixed(2)}€</div>
                  <div className="stat-label">Total Filtrado</div>
                </div>
              </div>
            )}

            <div className="billing-filters">
              <button 
                className={`filter-btn ${filterMonth === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMonth('all')}
              >
                Todos
              </button>
              {uniqueMonths.map(month => (
                <button 
                  key={month}
                  className={`filter-btn ${filterMonth === month ? 'active' : ''}`}
                  onClick={() => setFilterMonth(month)}
                >
                  {formatMonth(month)}
                </button>
              ))}
            </div>

            <div className="billing-table-container">
              <table className="billing-table">
                <thead>
                  <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Servicios Realizados</th>
                      <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-data">No hay citas completadas</td>
                    </tr>
                  ) : (
                    filteredAppointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td>
                          <div className="date-cell">
                            <div className="date-main">{new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES')}</div>
                            <div className="time-under-date">{appointment.time}</div>
                          </div>
                        </td>
                        <td><strong>{appointment.clientName}</strong></td>
                        <td>
                          <button className="btn-view-services" onClick={() => {
                            const names = appointment.serviciosRealizados.map(id => {
                              const s = services.find(x => x.id === id);
                              return s ? s.name : `Servicio ${id}`;
                            });
                            setModalServices(names);
                            setShowServicesModal(true);
                          }}>Ver servicios</button>
                        </td>
                        <td className="price-cell">
                          <strong>{appointment.totalPagado.toFixed(2)}€</strong>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan="3"><strong>TOTAL</strong></td>
                    <td className="price-cell">
                      <strong>{totalFiltered.toFixed(2)}€</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {showServicesModal && (
              <div className="services-modal" onClick={() => setShowServicesModal(false)}>
                <div className="services-modal-content" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setShowServicesModal(false)} aria-label="Cerrar">✕</button>
                  <h3>Servicios realizados</h3>
                  <ul className="services-list-modal">
                    {modalServices.map((name, idx) => <li key={idx}>{name}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Billing;
