import { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

function ClientSearchInput({ value, onChange, onClientSelect, required = false }) {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClientData, setNewClientData] = useState({ nombre: '', apellidos: '' });
  const wrapperRef = useRef(null);

  useEffect(() => { fetchClients(); }, []);

  useEffect(() => { setSearchTerm(value || ''); }, [value]);

  useEffect(() => {
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
      setClients([...clients, newClient]);
      handleSelectClient(newClient);
      setNewClientData({ nombre: '', apellidos: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creando cliente:', error);
      alert('Error al crear cliente');
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder="Buscar o crear cliente..."
          required={required}
          className={cn(selectedClientId && 'border-rose-400 pr-8')}
        />
        {selectedClientId && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-500 text-sm font-semibold">✓</span>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {filteredClients.length > 0 && (
            <div>
              {filteredClients.slice(0, 8).map(client => (
                <div
                  key={client.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-rose-50 cursor-pointer text-sm border-b border-stone-100 last:border-0"
                  onClick={() => handleSelectClient(client)}
                >
                  <div>
                    <div className="font-medium text-stone-800">{client.nombre} {client.apellidos}</div>
                    {client.telefono && <div className="text-stone-400 text-xs">{client.telefono}</div>}
                  </div>
                  <span className="text-xs text-stone-400">{client.totalCitas} citas</span>
                </div>
              ))}
            </div>
          )}

          {filteredClients.length === 0 && searchTerm && (
            <div className="px-3 py-2 text-sm text-stone-400">No se encontraron clientes</div>
          )}

          {!showCreateForm ? (
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 font-medium border-t border-stone-100"
              onClick={() => setShowCreateForm(true)}
            >
              + Crear nuevo cliente
            </button>
          ) : (
            <div className="p-3 border-t border-stone-100 space-y-2">
              <p className="text-xs font-semibold text-stone-600">Crear nuevo cliente</p>
              <Input
                type="text"
                placeholder="Nombre"
                value={newClientData.nombre}
                onChange={(e) => setNewClientData({ ...newClientData, nombre: e.target.value })}
                className="text-sm"
                autoFocus
              />
              <Input
                type="text"
                placeholder="Apellidos"
                value={newClientData.apellidos}
                onChange={(e) => setNewClientData({ ...newClientData, apellidos: e.target.value })}
                className="text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 text-xs py-1.5 rounded border border-stone-200 text-stone-600 hover:bg-stone-50"
                  onClick={() => { setShowCreateForm(false); setNewClientData({ nombre: '', apellidos: '' }); }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="flex-1 text-xs py-1.5 rounded bg-rose-400 text-white hover:bg-rose-500"
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
