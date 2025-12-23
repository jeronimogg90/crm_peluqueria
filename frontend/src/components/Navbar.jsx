import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ✨ Salón de Belleza
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">Inicio</Link>
          </li>
          <li>
            <Link to="/servicios" className="navbar-link">Servicios</Link>
          </li>
          <li>
            <Link to="/galeria" className="navbar-link">Galería</Link>
          </li>
          <li>
            <Link to="/reservar" className="navbar-link navbar-link-cta">Reservar Cita</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
