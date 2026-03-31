import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, Clock, User, MessageSquare, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import api from '../config/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';

const STEPS = ['Horario', 'Servicio', 'Tus datos', 'Confirmar'];

export default function Booking() {
  const [step, setStep] = useState(0);
  const [slots, setSlots] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState({
    slot: null,
    serviceId: null,
    serviceName: '',
    clientName: '',
    notes: '',
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get('/slots'), api.get('/services')])
      .then(([slotsRes, servicesRes]) => {
        setSlots(slotsRes.data.filter(s => s.available));
        setServices(servicesRes.data);
      })
      .catch(() => setError('Error cargando datos. Inténtalo de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const formatDate = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long'
    });

  const selectedService = services.find(s => s.id === selected.serviceId);

  const handleSubmit = async () => {
    if (!selected.slot || !selected.serviceId || !selected.clientName.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        slotId: selected.slot.id,
        date: selected.slot.date,
        time: selected.slot.time,
        clientName: selected.clientName,
        serviceId: selected.serviceId,
        service: selected.serviceName,
        notes: selected.notes,
      });
      setSuccess(true);
    } catch {
      setError('Error al crear la cita. Por favor inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fdf9f7] flex items-center justify-center pt-16">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-stone-800 mb-2">¡Cita confirmada!</h1>
            <p className="text-stone-500">
              Tu cita para el <strong>{formatDate(selected.slot.date)}</strong> a las <strong>{selected.slot.time}</strong> ha sido registrada correctamente.
            </p>
          </div>
          <Card className="text-left border-emerald-100">
            <CardContent className="p-5 space-y-3 text-sm">
              <Row icon={Calendar} label="Fecha" value={formatDate(selected.slot.date)} />
              <Row icon={Clock} label="Hora" value={selected.slot.time} />
              <Row icon={User} label="Nombre" value={selected.clientName} />
              <Row icon={MessageSquare} label="Servicio" value={selected.serviceName} />
            </CardContent>
          </Card>
          <Button
            className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 border-0 shadow-md"
            onClick={() => { setSuccess(false); setStep(0); setSelected({ slot: null, serviceId: null, serviceName: '', clientName: '', notes: '' }); }}
          >
            Hacer otra reserva
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf9f7]">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 pt-32 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="rose" className="mb-3 text-xs">Reservas online</Badge>
          <h1 className="text-4xl font-display font-bold text-stone-800 mb-3">Reserva tu cita</h1>
          <p className="text-stone-500">Rápido, fácil y sin esperas.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Steps */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                i < step ? "bg-emerald-500 text-white" :
                i === step ? "bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm" :
                "bg-stone-200 text-stone-400"
              )}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-sm hidden sm:block", i === step ? "font-medium text-stone-800" : "text-stone-400")}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn("flex-1 h-px mx-2 transition-colors", i < step ? "bg-emerald-200" : "bg-stone-200")} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Step 0: Horario */}
            {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-display font-semibold text-stone-800">Elige un horario</h2>
                {Object.keys(slotsByDate).length === 0 ? (
                  <p className="text-stone-400 text-center py-12">No hay horarios disponibles en este momento.</p>
                ) : (
                  Object.entries(slotsByDate).map(([date, dateSlots]) => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3 capitalize">
                        {formatDate(date)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dateSlots.map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => setSelected(p => ({ ...p, slot }))}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                              selected.slot?.id === slot.id
                                ? "bg-gradient-to-r from-rose-400 to-pink-500 text-white border-transparent shadow-sm"
                                : "bg-white border-stone-200 text-stone-700 hover:border-rose-300 hover:text-rose-500"
                            )}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
                <StepNav
                  onNext={() => setStep(1)}
                  nextDisabled={!selected.slot}
                  showBack={false}
                />
              </div>
            )}

            {/* Step 1: Servicio */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-display font-semibold text-stone-800">¿Qué servicio deseas?</h2>
                <div className="grid gap-3">
                  {services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelected(p => ({ ...p, serviceId: s.id, serviceName: s.name }))}
                      className={cn(
                        "flex items-center justify-between w-full p-4 rounded-xl border text-left transition-all",
                        selected.serviceId === s.id
                          ? "border-rose-300 bg-rose-50 shadow-sm"
                          : "border-stone-200 bg-white hover:border-rose-200 hover:bg-rose-50/50"
                      )}
                    >
                      <div>
                        <p className="font-medium text-stone-800 text-sm">{s.name}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{s.duration} min · {s.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-rose-500">{s.price}€</span>
                        {selected.serviceId === s.id && (
                          <CheckCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <StepNav onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!selected.serviceId} />
              </div>
            )}

            {/* Step 2: Datos */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-display font-semibold text-stone-800">Tus datos</h2>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Nombre completo *</Label>
                  <Input
                    id="clientName"
                    placeholder="Ana García"
                    value={selected.clientName}
                    onChange={e => setSelected(p => ({ ...p, clientName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    placeholder="Cualquier detalle relevante para tu cita..."
                    value={selected.notes}
                    onChange={e => setSelected(p => ({ ...p, notes: e.target.value }))}
                    className="resize-none"
                    rows={3}
                  />
                </div>
                <StepNav
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                  nextDisabled={!selected.clientName.trim()}
                />
              </div>
            )}

            {/* Step 3: Confirmar */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-display font-semibold text-stone-800">Confirma tu cita</h2>
                <Card className="border-stone-200">
                  <CardContent className="p-5 space-y-3 text-sm">
                    <Row icon={Calendar} label="Fecha" value={formatDate(selected.slot?.date)} />
                    <Row icon={Clock} label="Hora" value={selected.slot?.time} />
                    <Row icon={User} label="Nombre" value={selected.clientName} />
                    <Row icon={MessageSquare} label="Servicio" value={`${selected.serviceName} · ${selectedService?.price}€`} />
                    {selected.notes && <Row icon={MessageSquare} label="Notas" value={selected.notes} />}
                  </CardContent>
                </Card>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-full border-stone-200" onClick={() => setStep(2)}>
                    Volver
                  </Button>
                  <Button
                    className="flex-1 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 border-0 shadow-md hover:shadow-lg"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirmando...</> : 'Confirmar cita'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StepNav({ onBack, onNext, nextDisabled, showBack = true }) {
  return (
    <div className="flex gap-3 pt-2">
      {showBack && (
        <Button variant="outline" className="flex-1 rounded-full border-stone-200" onClick={onBack}>
          Volver
        </Button>
      )}
      <Button
        className={cn("rounded-full bg-gradient-to-r from-rose-400 to-pink-500 border-0 shadow-md hover:shadow-lg transition-all", showBack ? "flex-1" : "w-full")}
        onClick={onNext}
        disabled={nextDisabled}
      >
        Continuar
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-rose-500" />
      </div>
      <span className="text-stone-400 w-20 flex-shrink-0">{label}</span>
      <span className="font-medium text-stone-800">{value}</span>
    </div>
  );
}
