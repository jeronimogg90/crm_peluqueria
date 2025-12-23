import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import CompletionModal from '../components/CompletionModal';
import AddAppointmentModal from '../components/AddAppointmentModal';
import EventTransferModal from '../components/EventTransferModal';
import './Dashboard.css';

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
  const [completionModal, setCompletionModal] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayOptions, setShowDayOptions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  useEffect(() => {
    fetchAppointments();
    fetchServices();
    fetchGoogleEvents();
    
    // Verificar si volvió de la autorización de Google
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuth = urlParams.get('google_auth');
    
    if (googleAuth === 'success') {
      setMessage({ 
        type: 'success', 
        text: 'Autorización completada. Sincronizando...' 
      });
      // Limpiar parámetro de la URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Intentar sincronizar automáticamente después de autorización
      const syncAfterAuth = async () => {
        try {
          setSyncing(true);
          const response = await api.post('/google/sync');
          
          setMessage({ 
            type: 'success', 
            text: `Sincronización completada: ${response.data.workEvents} eventos de trabajo, ${response.data.regularEvents} eventos regulares`
          });
          
          // Obtener eventos de trabajo pendientes
          const workEventsResponse = await api.get('/google/work-events');
          setWorkEvents(workEventsResponse.data);
          
          // Actualizar eventos regulares
          await fetchGoogleEvents();
          
          // Si hay eventos de trabajo, mostrar modal de conversión
          if (workEventsResponse.data.length > 0) {
            setShowTransferModal(true);
          }
        } catch (error) {
          console.error('Error en sincronización automática:', error);
          setMessage({ 
            type: 'error', 
            text: 'Error en sincronización. Intenta hacer clic en el botón de sincronización.'
          });
        } finally {
          setSyncing(false);
        }
      };
      
      setTimeout(syncAfterAuth, 1000);
    } else if (googleAuth === 'error') {
      setMessage({ 
        type: 'error', 
        text: 'Error en la autorización de Google Calendar. Inténtalo de nuevo.' 
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments');
      
      // Transformar datos de snake_case a camelCase
      const transformedAppointments = response.data.map(apt => ({
        ...apt,
        clientName: apt.client_name,
        totalPagado: apt.total_pagado,
        completedAt: apt.completed_at,
        slotId: apt.slot_id,
        serviceId: apt.service_id,
        createdAt: apt.created_at
      }));
      
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error obteniendo citas:', error);
      setMessage({ type: 'error', text: 'Error al cargar las citas' });
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
    }
  };

  const fetchGoogleEvents = async () => {
    try {
      const response = await api.get('/google/events');
      setGoogleEvents(response.data.filter(e => !e.is_work_event));
    } catch (error) {
      console.error('Error obteniendo eventos de Google:', error);
    }
  };

  const handleGoogleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/google/sync');
      
      setMessage({ 
        type: 'success', 
        text: `Sincronización completada: ${response.data.workEvents} eventos de trabajo, ${response.data.regularEvents} eventos regulares`
      });
      
      // Obtener eventos de trabajo pendientes
      const workEventsResponse = await api.get('/google/work-events');
      setWorkEvents(workEventsResponse.data);
      
      // Actualizar eventos regulares
      await fetchGoogleEvents();
      
      // Si hay eventos de trabajo, mostrar modal de conversión
      if (workEventsResponse.data.length > 0) {
        setShowTransferModal(true);
      }
    } catch (error) {
      console.error('Error sincronizando con Google Calendar:', error);
      
      if (error.response?.data?.needsAuth) {
        try {
          // Necesita autenticación
          const authResponse = await api.get('/google/auth-url');
          
          setMessage({ 
            type: 'info', 
            text: 'Abriendo ventana de autorización de Google Calendar...'
          });
          
          // Abrir ventana de autorización
          const width = 600;
          const height = 700;
          const left = (window.screen.width / 2) - (width / 2);
          const top = (window.screen.height / 2) - (height / 2);
          
          window.open(
            authResponse.data.url, 
            'Google Calendar Authorization',
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
          );
          
          // Actualizar mensaje
          setTimeout(() => {
            setMessage({ 
              type: 'info', 
              text: 'Después de autorizar, vuelve a hacer clic en Sincronizar'
            });
          }, 2000);
        } catch (authError) {
          console.error('Error obteniendo URL de autorización:', authError);
          setMessage({ 
            type: 'error', 
            text: 'Error al obtener URL de autorización de Google' 
          });
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.error || 'Error al sincronizar con Google Calendar' 
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleTransferComplete = (message) => {
    setMessage({ type: 'success', text: message });
    setShowTransferModal(false);
    setWorkEvents([]);
    fetchAppointments();
    fetchGoogleEvents();
  };

  const handleComplete = async (appointmentId, serviciosRealizados, paymentData, clientId = null) => {
    try {
      await api.patch(`/appointments/${appointmentId}/complete`, { 
        serviciosRealizados,
        paymentMethod: paymentData.paymentMethod,
        cashReceived: paymentData.cashReceived,
        change: paymentData.change,
        clientId: clientId
      });
      setMessage({ type: 'success', text: 'Cita finalizada y añadida a facturación' });
      fetchAppointments();
      setCompletionModal(null);
    } catch (error) {
      console.error('Error completando cita:', error);
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { text: 'Confirmada', class: 'status-confirmed' },
      completed: { text: 'Completada', class: 'status-completed' }
    };
    return badges[status] || badges.confirmed;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length
  };

  const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
    if (!acc[apt.date]) {
      acc[apt.date] = [];
    }
    acc[apt.date].push(apt);
    return acc;
  }, {});

  const sortedDates = Object.keys(appointmentsByDate).sort();

  // Funciones para navegación semanal
  const getWeekDays = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAppointmentsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return filteredAppointments.filter(apt => apt.date === dateKey).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getGoogleEventsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return googleEvents.filter(evt => evt.date === dateKey).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Funciones para vista mensual
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior para completar la primera semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const daysFromPrevMonth = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = new Date(year, month - 1, prevMonthLastDay - i + 1);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }
    
    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const monthDays = getDaysInMonth(currentMonth);

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-nav">
          <Link to="/admin" className="nav-item active">
            📋 Citas
          </Link>
          <Link to="/admin/servicios" className="nav-item">
            💼 Servicios
          </Link>
          <Link to="/admin/facturacion" className="nav-item">
            💰 Facturación
          </Link>
          <Link to="/admin/clientes" className="nav-item">
            👥 Clientes
          </Link>
        </div>

        <h1>Panel de Administración</h1>
        <p className="dashboard-subtitle">Gestiona las solicitudes de citas</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Citas</div>
          </div>
          <div className="stat-card confirmed">
            <div className="stat-number">{stats.confirmed}</div>
            <div className="stat-label">Confirmadas</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completadas</div>
          </div>
        </div>
        <div className="controls-bar">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              📅 Calendario
            </button>
            <button 
              className={`view-btn ${viewMode === 'weekly' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly')}
            >
              📆 Semanal
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Lista Detallada
            </button>
            <button 
              className="view-btn sync-btn"
              onClick={handleGoogleSync}
              disabled={syncing}
            >
              {syncing ? '🔄 Sincronizando...' : '🔄 Sincronizar Google Calendar'}
            </button>
          </div>

          <div className="filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button 
              className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmadas
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completadas
            </button>
          </div>
        </div>

        {loading && <p className="loading">Cargando...</p>}

        {viewMode === 'monthly' ? (
          <div className="monthly-calendar-view">
            <div className="month-navigation">
              <button className="nav-btn" onClick={goToPreviousMonth}>
                ← Mes Anterior
              </button>
              <h2 className="month-title">
                {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <button className="nav-btn" onClick={goToNextMonth}>
                Mes Siguiente →
              </button>
            </div>

            <div className="month-grid">
              <div className="month-header">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, idx) => (
                  <div key={idx} className="month-day-name">{day}</div>
                ))}
              </div>
              <div className="month-days">
                {monthDays.map((dayInfo, index) => {
                  const dayAppointments = getAppointmentsForDate(dayInfo.date);
                  const dayGoogleEvents = getGoogleEventsForDate(dayInfo.date);
                  const isToday = formatDateKey(dayInfo.date) === formatDateKey(new Date());
                  
                  return (
                    <div
                      key={index}
                      className={`month-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${(dayAppointments.length > 0 || dayGoogleEvents.length > 0) ? 'has-appointments' : ''}`}
                      onClick={() => {
                        if (dayInfo.isCurrentMonth) {
                          setSelectedDate({ date: dayInfo.date, appointments: dayAppointments });
                          setShowDayOptions(true);
                        }
                      }}
                    >
                      <div className="day-number">{dayInfo.date.getDate()}</div>
                      {dayAppointments.length > 0 && (
                        <div className="appointments-list-inline">
                          {dayAppointments.slice(0, 3).map((apt, idx) => (
                            <div key={idx} className="appointment-inline">
                              <span className="apt-time">{apt.time}</span> - <span className="apt-name">{apt.clientName}</span>
                            </div>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className="more-appointments">
                              +{dayAppointments.length - 3} más citas
                            </div>
                          )}
                        </div>
                      )}
                      {dayGoogleEvents.length > 0 && (
                        <div className="google-events-list-inline">
                          {dayGoogleEvents.slice(0, 2).map((event, idx) => (
                            <div key={idx} className="google-event-inline" data-calendar-type={event.calendar_type || 'casa'}>
                              <span className="event-time">{event.start_time}</span> - <span className="event-summary">{event.summary}</span>
                            </div>
                          ))}
                          {dayGoogleEvents.length > 2 && (
                            <div className="more-google-events">
                              +{dayGoogleEvents.length - 2} eventos Google
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDate && showDayOptions && (
              <div className="day-modal" onClick={() => { setShowDayOptions(false); setSelectedDate(null); }}>
                <div className="day-modal-content day-options-modal" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => { setShowDayOptions(false); setSelectedDate(null); }}>✕</button>
                  
                  <h2>
                    {selectedDate.date.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h2>
                  <p className="modal-subtitle">{selectedDate.appointments.length} {selectedDate.appointments.length === 1 ? 'cita' : 'citas'}</p>
                  
                  <div className="day-options-buttons">
                    <button
                      className="day-option-btn btn-add"
                      onClick={() => {
                        setShowDayOptions(false);
                        setShowAddModal(true);
                      }}
                    >
                      <span className="btn-icon">➕</span>
                      <span className="btn-text">Añadir Cita</span>
                    </button>
                    {selectedDate.appointments.length > 0 && (
                      <button 
                        className="day-option-btn btn-view"
                        onClick={() => setShowDayOptions(false)}
                      >
                        <span className="btn-icon">👁️</span>
                        <span className="btn-text">Ver Citas ({selectedDate.appointments.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {selectedDate && !showDayOptions && selectedDate.appointments.length > 0 && (
              <div className="day-modal" onClick={() => setSelectedDate(null)}>
                <div className="day-modal-content" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setSelectedDate(null)}>✕</button>
                  
                  <h2>
                    {selectedDate.date.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h2>
                  <p className="modal-subtitle">{selectedDate.appointments.length} {selectedDate.appointments.length === 1 ? 'cita' : 'citas'}</p>

                  <div className="day-appointments-list">
                    {selectedDate.appointments.map(apt => {
                      const statusInfo = getStatusBadge(apt.status);
                      const service = services.find(s => s.id === apt.serviceId);
                      
                      return (
                        <div key={apt.id} className="day-appointment-card">
                          <div className="appointment-time-badge">{apt.time}</div>
                          
                          <div className="appointment-info">
                            <div className="appointment-client">
                              <strong>{apt.clientName}</strong>
                              <span className={`status-badge ${statusInfo.class}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            
                            <div className="appointment-service">
                              💇‍♀️ {service ? service.name : apt.service}
                            </div>
                            
                            {apt.notes && (
                              <div className="appointment-notes">
                                📝 {apt.notes}
                              </div>
                            )}
                          </div>

                          {apt.status === 'confirmed' && (
                            <div className="appointment-actions-compact">
                              <button 
                                className="btn-complete-compact"
                                onClick={() => {
                                  setCompletionModal(apt);
                                  setSelectedDate(null);
                                }}
                                title="Finalizar Cita"
                              >
                                ✓
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'weekly' ? (
          <div className="week-calendar-view">
            <div className="week-navigation">
              <button className="nav-btn" onClick={goToPreviousWeek}>
                ← Semana Anterior
              </button>
              <button className="nav-btn today-btn" onClick={goToCurrentWeek}>
                Hoy
              </button>
              <button className="nav-btn" onClick={goToNextWeek}>
                Semana Siguiente →
              </button>
            </div>

            <div className="week-grid">
              {weekDays.map((day, index) => {
                const dayAppointments = getAppointmentsForDate(day);
                const dayGoogleEvents = getGoogleEventsForDate(day);
                const isToday = formatDateKey(day) === formatDateKey(new Date());
                
                return (
                  <div key={index} className={`week-day ${isToday ? 'today' : ''}`}>
                    <div className="week-day-header">
                      <div className="day-name">
                        {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                      </div>
                      <div className="day-number">
                        {day.getDate()}
                      </div>
                    </div>
                    
                    <div className="week-day-appointments">
                      {dayAppointments.length === 0 && dayGoogleEvents.length === 0 ? (
                        <p className="no-appointments-day">Sin citas</p>
                      ) : (
                        <>
                          {dayAppointments.map(apt => {
                            const service = services.find(s => s.id === apt.serviceId);
                            return (
                              <div 
                                key={apt.id} 
                                className={`week-appointment-card ${apt.status}`}
                                onClick={() => setSelectedAppointment(apt)}
                              >
                                <div className="week-appointment-time">
                                  {apt.time}
                                </div>
                                <div className="week-appointment-client">
                                  {apt.clientName}
                                </div>
                                <div className="week-appointment-service">
                                  {service ? service.name : 'Servicio no encontrado'}
                                </div>
                              </div>
                            );
                          })}
                          {dayGoogleEvents.map(event => (
                            <div 
                              key={event.id} 
                              className="week-google-event-card"
                              data-calendar-type={event.calendar_type || 'casa'}
                              title={event.description || event.summary}
                            >
                              <div className="week-event-time">
                                📅 {event.start_time}
                              </div>
                              <div className="week-event-summary">
                                {event.summary}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedAppointment && (
              <div className="appointment-modal" onClick={() => setSelectedAppointment(null)}>
                <div className="appointment-modal-content" onClick={e => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setSelectedAppointment(null)}>✕</button>
                  
                  <div className="modal-header">
                    <h2>{selectedAppointment.clientName}</h2>
                    <div className="modal-date-time">
                      <span>📅 {new Date(selectedAppointment.date + 'T00:00:00').toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long'
                      })}</span>
                      <span>🕐 {selectedAppointment.time}</span>
                    </div>
                  </div>
                  
                  <div className="modal-body">
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Servicio</span>
                      <span className="modal-detail-value">
                        {services.find(s => s.id === selectedAppointment.serviceId)?.name || 'Servicio no encontrado'}
                      </span>
                    </div>
                    
                    {selectedAppointment.notes && (
                      <div className="modal-detail-row">
                        <span className="modal-detail-label">Notas</span>
                        <div className="modal-notes">
                          {selectedAppointment.notes}
                        </div>
                      </div>
                    )}
                    
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Estado</span>
                      <span className={`status-badge ${getStatusBadge(selectedAppointment.status).class}`}>
                        {getStatusBadge(selectedAppointment.status).text}
                      </span>
                    </div>
                  </div>
                  
                  {selectedAppointment.status === 'confirmed' && (
                    <div className="modal-actions">
                      <button 
                        className="modal-btn modal-btn-complete"
                        onClick={() => {
                          setCompletionModal(selectedAppointment);
                          setSelectedAppointment(null);
                        }}
                      >
                        ✓ Finalizar Cita
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="calendar-view">
            {sortedDates.length === 0 ? (
              <p className="no-appointments">No hay citas {filter !== 'all' ? filter + 's' : ''}</p>
            ) : (
              sortedDates.map(date => {
                const dayAppointments = appointmentsByDate[date].sort((a, b) => 
                  a.time.localeCompare(b.time)
                );
                
                // Get Google events for this date
                const dayGoogleEvents = googleEvents.filter(event => event.start_date === date);
                
                return (
                  <div key={date} className="calendar-day">
                    <div className="calendar-day-header">
                      <h3>
                        {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <span className="appointments-count">
                        {dayAppointments.length} {dayAppointments.length === 1 ? 'cita' : 'citas'}
                        {dayGoogleEvents.length > 0 && ` • ${dayGoogleEvents.length} eventos Google`}
                      </span>
                    </div>
                    
                    <div className="calendar-day-appointments">
                      {dayAppointments.map(appointment => {
                        const statusInfo = getStatusBadge(appointment.status);
                        const service = services.find(s => s.id === appointment.serviceId);
                        return (
                          <div key={appointment.id} className="calendar-appointment">
                            <div className="appointment-time-badge">{appointment.time}</div>
                            
                            <div className="appointment-info">
                              <div className="appointment-client">
                                <strong>{appointment.clientName}</strong>
                                <span className={`status-badge ${statusInfo.class}`}>
                                  {statusInfo.text}
                                </span>
                              </div>
                              
                              <div className="appointment-service">
                                💇‍♀️ {service ? service.name : appointment.service}
                              </div>
                              
                              {appointment.notes && (
                                <div className="appointment-notes">
                                  📝 {appointment.notes}
                                </div>
                              )}
                            </div>

                            {appointment.status === 'confirmed' && (
                              <div className="appointment-actions-compact">
                                <button 
                                  className="btn-complete-compact"
                                  onClick={() => setCompletionModal(appointment)}
                                  disabled={loading}
                                  title="Finalizar Cita"
                                >
                                  ✓
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {dayGoogleEvents.map(event => (
                        <div key={event.id} className="google-event-card" data-calendar-type={event.calendar_type || 'casa'}>
                          <div className="event-time-badge">📅 {event.start_time}</div>
                          
                          <div className="event-info">
                            <div className="event-summary">
                              <strong>{event.summary}</strong>
                              <span className="event-source-badge">Google Calendar</span>
                            </div>
                            
                            {event.description && (
                              <div className="event-description">
                                📝 {event.description}
                              </div>
                            )}
                            
                            {event.end_time && (
                              <div className="event-duration">
                                🕐 {event.start_time} - {event.end_time}
                              </div>
                            )}
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
      </div>
      
      {showAddModal && (
        <AddAppointmentModal
          onClose={() => {
            setShowAddModal(false);
            setSelectedDate(null);
          }}
          onSuccess={(msg) => {
            setMessage({ type: 'success', text: msg });
            fetchAppointments();
          }}
          preselectedDate={selectedDate ? formatDateKey(selectedDate.date) : ''}
        />
      )}
      
      {completionModal && (
        <CompletionModal
          appointment={completionModal}
          services={services}
          onClose={() => setCompletionModal(null)}
          onComplete={handleComplete}
        />
      )}

      {showTransferModal && workEvents.length > 0 && (
        <EventTransferModal
          events={workEvents}
          services={services}
          onClose={() => {
            setShowTransferModal(false);
            setWorkEvents([]);
          }}
          onComplete={handleTransferComplete}
        />
      )}
    </div>
  );
}

export default Dashboard;
