import { useState } from 'react';
import './PaymentModal.css';

function PaymentModal({ total, onClose, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'efectivo', name: '💵 Efectivo', icon: '💵' },
    { id: 'tarjeta', name: '💳 Tarjeta', icon: '💳' },
    { id: 'bizum', name: '📱 Bizum', icon: '📱' },
    { id: 'transferencia', name: '🏦 Transferencia', icon: '🏦' }
  ];

  const calculateChange = () => {
    if (paymentMethod === 'efectivo' && cashReceived) {
      const change = parseFloat(cashReceived) - total;
      return change >= 0 ? change : 0;
    }
    return 0;
  };

  const handleConfirm = async () => {
    if (!paymentMethod) {
      alert('Selecciona un método de pago');
      return;
    }

    if (paymentMethod === 'efectivo' && (!cashReceived || parseFloat(cashReceived) < total)) {
      alert('El efectivo recibido debe ser mayor o igual al total');
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        paymentMethod,
        cashReceived: paymentMethod === 'efectivo' ? parseFloat(cashReceived) : null,
        change: paymentMethod === 'efectivo' ? calculateChange() : null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>💰 Confirmar Pago</h2>
        <p className="modal-subtitle">Registra el método de pago utilizado</p>

        <div className="total-display">
          <span className="total-label">Total a cobrar:</span>
          <span className="total-amount">{total.toFixed(2)}€</span>
        </div>

        <div className="payment-methods">
          <label className="section-label">Método de pago:</label>
          <div className="payment-methods-grid">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                type="button"
                className={`payment-method-btn ${paymentMethod === method.id ? 'active' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
              >
                <span className="method-icon">{method.icon}</span>
                <span className="method-name">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'efectivo' && (
          <div className="cash-section">
            <div className="form-group">
              <label htmlFor="cashReceived">💵 Efectivo recibido:</label>
              <input
                type="number"
                id="cashReceived"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="Ej: 50"
                step="0.01"
                min={total}
                className="form-input"
                autoFocus
              />
            </div>

            {cashReceived && parseFloat(cashReceived) >= total && (
              <div className="change-display">
                <span className="change-label">💸 Cambio a devolver:</span>
                <span className="change-amount">{calculateChange().toFixed(2)}€</span>
              </div>
            )}

            {cashReceived && parseFloat(cashReceived) < total && (
              <div className="error-display">
                ⚠️ El efectivo recibido es menor que el total
              </div>
            )}
          </div>
        )}

        <div className="payment-actions">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            disabled={loading || !paymentMethod}
            className="btn-confirm"
          >
            {loading ? 'Procesando...' : '✓ Confirmar Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
