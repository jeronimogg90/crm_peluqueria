import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import PaymentModal from './PaymentModal';
import ClientSearchInput from './ClientSearchInput';

function CompletionModal({ appointment, services, onClose, onComplete }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [clientName, setClientName] = useState(appointment.clientName || '');
  const [clientId, setClientId] = useState(appointment.client_id || null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const total = selectedServices.reduce((sum, id) => {
    const s = services.find(sv => sv.id === id);
    return sum + (s ? s.price : 0);
  }, 0);

  const handleSubmit = () => {
    if (selectedServices.length === 0) { alert('Selecciona al menos un servicio'); return; }
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (paymentData) => {
    try {
      setLoading(true);
      await onComplete(appointment.id, selectedServices, paymentData, clientId);
      setShowPaymentModal(false);
      onClose();
    } catch {
      alert('Error al completar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-stone-800">Finalizar Cita</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">&times;</button>
          </div>

          {/* Client info */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-2 text-sm">
            {!appointment.client_id ? (
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Cliente</label>
                <ClientSearchInput
                  value={clientName}
                  onChange={setClientName}
                  onClientSelect={setClientId}
                  required
                />
                <p className="text-xs text-stone-400 mt-1">Asocia esta cita a un cliente existente o crea uno nuevo</p>
              </div>
            ) : (
              <div className="flex gap-4">
                <div>
                  <span className="text-stone-400">Cliente: </span>
                  <span className="font-medium text-stone-700">{appointment.clientName}</span>
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <div><span className="text-stone-400">Fecha: </span><span className="font-medium text-stone-700">{new Date(appointment.date + 'T00:00:00').toLocaleDateString('es-ES')}</span></div>
              <div><span className="text-stone-400">Hora: </span><span className="font-medium text-stone-700">{appointment.time}</span></div>
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Servicios realizados</p>
            <div className="space-y-2">
              {services.map(service => (
                <label
                  key={service.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedServices.includes(service.id)
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-stone-200 hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="accent-rose-400 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-stone-700">{service.name}</span>
                    {service.category && (
                      <Badge variant="secondary" className="text-xs">{service.category}</Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-rose-500">{service.price}€</span>
                </label>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-rose-50 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-stone-700">Total a pagar</span>
            <span className="text-xl font-bold text-rose-500">{total.toFixed(2)}€</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button
              className="flex-1 bg-rose-400 hover:bg-rose-500 text-white"
              onClick={handleSubmit}
              disabled={loading || selectedServices.length === 0}
            >
              Continuar al Pago →
            </Button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          total={total}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </>
  );
}

export default CompletionModal;
