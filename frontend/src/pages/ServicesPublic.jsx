import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import './ServicesPublic.css';

function ServicesPublic() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Todos', 'Peluquería', 'Uñas', 'Estética'];

  const filteredServices = selectedCategory === 'Todos' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  // Agrupar servicios por categoría
  const servicesByCategory = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  return (
    <div className="services-public">
      <div className="services-hero">
        <h1>Nuestros Servicios</h1>
        <p>Descubre nuestra amplia gama de tratamientos de belleza</p>
      </div>

      <div className="services-container">
        <div className="services-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="loading">Cargando servicios...</p>
        ) : (
          <div className="categories-list">
            {selectedCategory === 'Todos' ? (
              Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                <div key={category} className="category-section">
                  <h2 className="category-title">{category}</h2>
                  <div className="services-grid">
                    {categoryServices.map(service => (
                      <div key={service.id} className="service-card">
                        <div className="service-header">
                          <h3>{service.name}</h3>
                          <span className="service-price">{service.price}€</span>
                        </div>
                        <p className="service-duration">⏱️ {service.duration} minutos</p>
                        <p className="service-description">{service.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="category-section">
                <div className="services-grid">
                  {filteredServices.map(service => (
                    <div key={service.id} className="service-card">
                      <div className="service-header">
                        <h3>{service.name}</h3>
                        <span className="service-price">{service.price}€</span>
                      </div>
                      <p className="service-duration">⏱️ {service.duration} minutos</p>
                      <p className="service-description">{service.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="cta-section">
          <h2>¿Lista para reservar?</h2>
          <p>Agenda tu cita y disfruta de nuestros servicios profesionales</p>
          <Link to="/reservar" className="btn-cta">Reservar Cita Ahora</Link>
        </div>
      </div>
    </div>
  );
}

export default ServicesPublic;
