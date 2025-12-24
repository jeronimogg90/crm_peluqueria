import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import './Services.css';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Peluquería',
    price: '',
    duration: '',
    description: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services/all');
      setServices(response.data);
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
      setMessage({ type: 'error', text: 'Error al cargar los servicios' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
        setMessage({ type: 'success', text: 'Servicio actualizado exitosamente' });
      } else {
        await api.post('/services', formData);
        setMessage({ type: 'success', text: 'Servicio creado exitosamente' });
      }
      
      setFormData({
        name: '',
        category: 'Peluquería',
        price: '',
        duration: '',
        description: ''
      });
      setEditingService(null);
      setShowForm(false);
      fetchServices();
    } catch (error) {
      console.error('Error guardando servicio:', error);
      setMessage({ type: 'error', text: 'Error al guardar el servicio' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      price: service.price,
      duration: service.duration,
      description: service.description
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás segura de eliminar este servicio?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/services/${id}`);
      setMessage({ type: 'success', text: 'Servicio eliminado exitosamente' });
      fetchServices();
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      setMessage({ type: 'error', text: 'Error al eliminar el servicio' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: 'Peluquería',
      price: '',
      duration: '',
      description: ''
    });
    setEditingService(null);
    setShowForm(false);
  };

  // Agrupar servicios por categoría
  const servicesByCategory = services.filter(s => s.active).reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  return (
    <div className="services-admin">
      <div className="services-container">
        <div className="dashboard-nav">
          <Link to="/admin" className="nav-item">
            📋 Citas
          </Link>
          <Link to="/admin/servicios" className="nav-item active">
            💼 Servicios
          </Link>
          <Link to="/admin/facturacion" className="nav-item">
            💰 Facturación
          </Link>
        </div>

        <h1>Gestión de Servicios</h1>
        <p className="services-subtitle">Administra tus servicios y precios</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        <div className="services-header">
          <button 
            className="btn-add-service"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancelar' : '+ Nuevo Servicio'}
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                <button className="modal-close" onClick={handleCancel}>✕ Cancelar</button>
              </div>
              <form onSubmit={handleSubmit} className="service-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nombre del Servicio *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Categoría *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Peluquería">Peluquería</option>
                      <option value="Uñas">Uñas</option>
                      <option value="Estética">Estética</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Precio (€) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration">Duración (minutos) *</label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      min="5"
                      step="5"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe el servicio..."
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Servicio'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={handleCancel}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && <p className="loading">Cargando...</p>}

        <div className="services-list">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <div key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <div className="services-grid">
                {categoryServices.map(service => (
                  <div key={service.id} className="service-card">
                    <div className="service-card-header">
                      <h3>{service.name}</h3>
                      <span className="service-price">{service.price}€</span>
                    </div>
                    <div className="service-card-body">
                      <p className="service-duration">⏱️ {service.duration} min</p>
                      <p className="service-description">{service.description}</p>
                    </div>
                    <div className="service-card-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(service)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(service.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;
