import { useState } from 'react';
import { Button } from './ui/button';

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'tarjeta', label: 'Tarjeta', icon: '💳' },
  { id: 'bizum', label: 'Bizum', icon: '📱' },
  { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
];

function PaymentModal({ total, onClose, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);

  const change = paymentMethod === 'efectivo' && cashReceived
    ? Math.max(0, parseFloat(cashReceived) - total)
    : 0;

  const cashShort = paymentMethod === 'efectivo' && cashReceived && parseFloat(cashReceived) < total;

  const handleConfirm = async () => {
    if (!paymentMethod) { alert('Selecciona un método de pago'); return; }
    if (paymentMethod === 'efectivo' && (!cashReceived || parseFloat(cashReceived) < total)) {
      alert('El efectivo recibido debe ser mayor o igual al total');
      return;
    }
    setLoading(true);
    try {
      await onConfirm({
        paymentMethod,
        cashReceived: paymentMethod === 'efectivo' ? parseFloat(cashReceived) : null,
        change: paymentMethod === 'efectivo' ? change : null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-stone-800">Confirmar Pago</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
        </div>

        <div className="bg-rose-50 rounded-xl p-4 text-center">
          <p className="text-xs text-stone-500 mb-1">Total a cobrar</p>
          <p className="text-3xl font-bold text-rose-500">{total.toFixed(2)}€</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Método de pago</p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  paymentMethod === m.id
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-stone-200 text-stone-600 hover:border-rose-200 hover:bg-rose-50/50'
                }`}
              >
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>
        </div>

        {paymentMethod === 'efectivo' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Efectivo recibido</label>
            <input
              type="number"
              value={cashReceived}
              onChange={e => setCashReceived(e.target.value)}
              placeholder={`Mínimo ${total.toFixed(2)}€`}
              step="0.01"
              min={total}
              autoFocus
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            {cashReceived && !cashShort && (
              <div className="flex justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="text-sm text-stone-600">Cambio a devolver:</span>
                <span className="text-sm font-bold text-amber-700">{change.toFixed(2)}€</span>
              </div>
            )}
            {cashShort && (
              <p className="text-xs text-red-500">El efectivo recibido es menor que el total</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button
            className="flex-1 bg-rose-400 hover:bg-rose-500 text-white"
            onClick={handleConfirm}
            disabled={loading || !paymentMethod}
          >
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
