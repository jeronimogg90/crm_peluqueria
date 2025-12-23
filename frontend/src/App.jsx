import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import ServicesPublic from './pages/ServicesPublic';
import Billing from './pages/Billing';
import Clients from './pages/Clients';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<ServicesPublic />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/reservar" element={<Booking />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/servicios" element={<Services />} />
          <Route path="/admin/facturacion" element={<Billing />} />
          <Route path="/admin/clientes" element={<Clients />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
