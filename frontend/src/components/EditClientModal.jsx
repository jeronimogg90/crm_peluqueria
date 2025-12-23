import { useState } from 'react';
import api from '../config/api';
import './EditClientModal.css';

function EditClientModal({ client, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: client.nombre || '',
    apellidos: client.apellidos || '',
    telefono: client.telefono || '',
    email: client.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.apellidos.trim()) {
      setError('Nombre y apellidos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await api.put(`/clients/${client.id}`, formData);
      
      onSuccess('Cliente actualizado correctamente');
      onClose();
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      setError(error.response?.data?.error || 'Error al actualizar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-client-modal-overlay" onClick={onClose}>
      <div className="edit-client-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>✏️ Editar Cliente</h2>
        <p className="modal-subtitle">Actualiza la información del cliente</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-client-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellidos">Apellidos *</label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 612345678"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: cliente@email.com"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Guardando...' : '✓ Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditClientModal;
