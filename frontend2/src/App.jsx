import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import ServicesPublic from './pages/ServicesPublic';
import Gallery from './pages/Gallery';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Billing from './pages/Billing';
import Clients from './pages/Clients';
import Expenses from './pages/Expenses';
import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/servicios" element={<ServicesPublic />} />
        <Route path="/galeria" element={<Gallery />} />
        <Route path="/reservar" element={<Booking />} />
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/servicios" element={<AdminLayout><Services /></AdminLayout>} />
        <Route path="/admin/facturacion" element={<AdminLayout><Billing /></AdminLayout>} />
        <Route path="/admin/clientes" element={<AdminLayout><Clients /></AdminLayout>} />
        <Route path="/admin/gastos" element={<AdminLayout><Expenses /></AdminLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
