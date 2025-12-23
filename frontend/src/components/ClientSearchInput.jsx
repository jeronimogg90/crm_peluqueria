import { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import './ClientSearchInput.css';

function ClientSearchInput({ value, onChange, onClientSelect, required = false }) {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClientData, setNewClientData] = useState({ nombre: '', apellidos: '' });
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    // Cerrar dropdown al hacer click fuera
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowCreateForm(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const fullName = `${client.nombre} ${client.apellidos}`.toLowerCase();
    const phone = client.telefono?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || phone.includes(searchLower);
  });

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setShowDropdown(true);
    setShowCreateForm(false);
    setSelectedClientId(null);
    onChange(newValue);
    onClientSelect?.(null);
  };

  const handleSelectClient = (client) => {
    const fullName = `${client.nombre} ${client.apellidos}`;
    setSearchTerm(fullName);
    setSelectedClientId(client.id);
    setShowDropdown(false);
    onChange(fullName);
    onClientSelect?.(client.id);
  };

  const handleCreateNewClient = async () => {
    if (!newClientData.nombre.trim() || !newClientData.apellidos.trim()) {
      alert('Nombre y apellidos son requeridos');
      return;
    }

    try {
      const response = await api.post('/clients', newClientData);
      const newClient = response.data.client;
      
      // Actualizar lista de clientes
      setClients([...clients, newClient]);
      
      // Seleccionar el nuevo cliente
      handleSelectClient(newClient);
      
      // Limpiar formulario
      setNewClientData({ nombre: '', apellidos: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creando cliente:', error);
      alert('Error al crear cliente');
    }
  };

  return (
    <div className="client-search-wrapper" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        placeholder="Buscar o crear cliente..."
        required={required}
        className={`client-search-input ${selectedClientId ? 'has-selection' : ''}`}
      />
      
      {selectedClientId && (
        <span className="selected-indicator">✓</span>
      )}

      {showDropdown && (
        <div className="client-dropdown">
          {filteredClients.length > 0 && (
            <div className="clients-list">
              {filteredClients.slice(0, 8).map(client => (
                <div
                  key={client.id}
                  className="client-option"
                  onClick={() => handleSelectClient(client)}
                >
                  <div className="client-option-info">
                    <strong>{client.nombre} {client.apellidos}</strong>
                    {client.telefono && <span className="client-phone">{client.telefono}</span>}
                  </div>
                  <div className="client-option-stats">
                    {client.totalCitas} citas
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredClients.length === 0 && searchTerm && (
            <div className="no-results">
              No se encontraron clientes
            </div>
          )}

          {!showCreateForm ? (
            <button
              type="button"
              className="btn-show-create"
              onClick={() => setShowCreateForm(true)}
            >
              ➕ Crear nuevo cliente
            </button>
          ) : (
            <div className="quick-create-form">
              <h4>Crear nuevo cliente</h4>
              <input
                type="text"
                placeholder="Nombre"
                value={newClientData.nombre}
                onChange={(e) => setNewClientData({ ...newClientData, nombre: e.target.value })}
                className="quick-input"
                autoFocus
              />
              <input
                type="text"
                placeholder="Apellidos"
                value={newClientData.apellidos}
                onChange={(e) => setNewClientData({ ...newClientData, apellidos: e.target.value })}
                className="quick-input"
              />
              <div className="quick-actions">
                <button
                  type="button"
                  className="btn-quick-cancel"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewClientData({ nombre: '', apellidos: '' });
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-quick-create"
                  onClick={handleCreateNewClient}
                >
                  Crear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientSearchInput;
