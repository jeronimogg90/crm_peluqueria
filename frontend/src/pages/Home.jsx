import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Bienvenida a Nuestro Salón de Belleza</h1>
          <p className="hero-subtitle">
            Especialistas en Peluquería, Estética y Diseño de Uñas
          </p>
          <div className="hero-buttons">
            <Link to="/reservar" className="btn btn-primary">Reservar Cita</Link>
            <Link to="/galeria" className="btn btn-secondary">Ver Galería</Link>
            <Link to="/admin" className="btn btn-admin">Administración</Link>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">💇‍♀️</div>
              <h3>Peluquería</h3>
              <p>Cortes, tintes, mechas y tratamientos capilares profesionales</p>
            </div>
            <div className="service-card">
              <div className="service-icon">✨</div>
              <h3>Estética</h3>
              <p>Tratamientos faciales, depilación y cuidado de la piel</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💅</div>
              <h3>Manicura y Pedicura</h3>
              <p>Diseño de uñas, esmaltado permanente y nail art</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>¿Lista para tu transformación?</h2>
          <p>Reserva tu cita ahora y déjate mimar por nuestras profesionales</p>
          <Link to="/reservar" className="btn btn-primary">Reservar Ahora</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
