import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import CreateClientModal from '../components/CreateClientModal';
import ClientDetailModal from '../components/ClientDetailModal';
import './Clients.css';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      setMessage({ type: 'error', text: 'Error al cargar clientes' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (clientData) => {
    try {
      await api.post('/clients', clientData);
      setMessage({ type: 'success', text: 'Cliente creado exitosamente' });
      fetchClients();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${client.nombre} ${client.apellidos}`.toLowerCase();
    const phone = client.telefono?.toLowerCase() || '';
    const email = client.email?.toLowerCase() || '';
    
    return fullName.includes(searchLower) || 
           phone.includes(searchLower) || 
           email.includes(searchLower);
  });

  return (
    <div className="clients-page">
      <div className="clients-container">
        <div className="dashboard-nav">
          <Link to="/admin" className="nav-item">
            📋 Citas
          </Link>
          <Link to="/admin/servicios" className="nav-item">
            💼 Servicios
          </Link>
          <Link to="/admin/facturacion" className="nav-item">
            💰 Facturación
          </Link>
          <Link to="/admin/clientes" className="nav-item active">
            👥 Clientes
          </Link>
        </div>

        <h1>Gestión de Clientes</h1>
        <p className="page-subtitle">Administra tu cartera de clientes</p>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        <div className="clients-header">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="btn-create-client"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Nuevo Cliente
          </button>
        </div>

        {loading && <p className="loading">Cargando clientes...</p>}

        {!loading && filteredClients.length === 0 && (
          <div className="no-clients">
            <p>No hay clientes {searchTerm ? 'que coincidan con la búsqueda' : 'registrados'}</p>
          </div>
        )}

        {!loading && filteredClients.length > 0 && (
          <div className="clients-grid">
            {filteredClients.map(client => (
              <div 
                key={client.id} 
                className="client-card"
                onClick={() => setSelectedClient(client)}
              >
                <div className="client-avatar">
                  {client.nombre.charAt(0)}{client.apellidos.charAt(0)}
                </div>
                <div className="client-info">
                  <h3 className="client-name">{client.nombre} {client.apellidos}</h3>
                  {client.telefono && (
                    <p className="client-contact">📞 {client.telefono}</p>
                  )}
                  {client.email && (
                    <p className="client-contact">📧 {client.email}</p>
                  )}
                  <div className="client-stats">
                    <span className="stat">
                      <strong>{client.totalCitas}</strong> citas
                    </span>
                    <span className="stat">
                      <strong>{client.totalGastado.toFixed(2)}€</strong> gastado
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClient}
        />
      )}

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onUpdate={fetchClients}
        />
      )}
    </div>
  );
}

export default Clients;
