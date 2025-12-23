import { useState } from 'react';
import './CreateClientModal.css';

function CreateClientModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim() || !formData.apellidos.trim()) {
      setError('Nombre y apellidos son requeridos');
      return;
    }

    try {
      setLoading(true);
      await onCreate(formData);
    } catch (error) {
      setError(error.response?.data?.error || 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-client-modal-overlay" onClick={onClose}>
      <div className="create-client-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>👤 Nuevo Cliente</h2>
        <p className="modal-subtitle">Registra un nuevo cliente en el sistema</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: María"
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
              placeholder="Ej: García López"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">📞 Teléfono (opcional)</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 612 345 678"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">📧 Email (opcional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: maria@ejemplo.com"
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Creando...' : '✓ Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateClientModal;
