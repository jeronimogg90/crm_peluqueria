import { useState, useEffect } from 'react';
import { Plus, Search, User, Phone, Mail, CalendarDays, BadgeEuro, Pencil, X, Loader2, Check } from 'lucide-react';
import api from '../config/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';

const emptyForm = { nombre: '', apellidos: '', telefono: '', email: '' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | { type:'edit', client } | { type:'detail', client }
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchClients = () => {
    setLoading(true);
    api.get('/clients').then(r => setClients(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || `${c.nombre} ${c.apellidos}`.toLowerCase().includes(q) || (c.telefono || '').includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  const openDetail = async (client) => {
    setModal({ type: 'detail', client });
    setHistoryLoading(true);
    api.get(`/clients/${client.id}/history`)
      .then(r => setHistory(r.data))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  };

  const openEdit = (client) => {
    setForm({ nombre: client.nombre, apellidos: client.apellidos, telefono: client.telefono || '', email: client.email || '' });
    setModal({ type: 'edit', client });
  };

  const openCreate = () => { setForm(emptyForm); setModal('create'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/clients', form);
      } else {
        await api.put(`/clients/${modal.client.id}`, form);
      }
      setModal(null);
      fetchClients();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const formatDate = (s) => s ? new Date(s).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
    <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-stone-800">Clientes</h1>
            <p className="text-stone-500 mt-1">{clients.length} clientes registradas</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 border-0 shadow-sm">
            <Plus className="w-4 h-4" />
            Nueva clienta
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            className="pl-9 rounded-xl"
            placeholder="Buscar por nombre, teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(client => (
              <Card
                key={client.id}
                className="border-stone-100 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 group"
                onClick={() => openDetail(client)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-rose-500 text-sm">
                        {(client.nombre?.[0] || '') + (client.apellidos?.[0] || '')}
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-500 transition-all"
                      onClick={e => { e.stopPropagation(); openEdit(client); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="font-semibold text-stone-800 text-sm">{client.nombre} {client.apellidos}</p>
                  {client.telefono && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-400">
                      <Phone className="w-3 h-3" />
                      {client.telefono}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-400 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-stone-300">
                    <CalendarDays className="w-3 h-3" />
                    <span>Desde {formatDate(client.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-stone-400">
                No se encontraron clientes.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Dialog open={modal?.type === 'detail'} onOpenChange={() => setModal(null)}>
        {modal?.type === 'detail' && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center">
                  <span className="font-semibold text-rose-500 text-sm">
                    {(modal.client.nombre?.[0] || '') + (modal.client.apellidos?.[0] || '')}
                  </span>
                </div>
                {modal.client.nombre} {modal.client.apellidos}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-1 text-sm">
              {modal.client.telefono && <InfoRow icon={Phone} value={modal.client.telefono} />}
              {modal.client.email && <InfoRow icon={Mail} value={modal.client.email} />}
              <InfoRow icon={CalendarDays} value={`Cliente desde ${formatDate(modal.client.created_at)}`} />
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Historial de citas</p>
              {historyLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-rose-400 animate-spin" /></div>
              ) : history.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-4">Sin historial de citas.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {history.map(apt => (
                    <div key={apt.id} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2.5 text-sm">
                      <div>
                        <p className="font-medium text-stone-700">{apt.service || 'Sin servicio'}</p>
                        <p className="text-xs text-stone-400">{formatDate(apt.date)} · {apt.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.total_pagado > 0 && <span className="text-emerald-600 font-semibold text-sm">{apt.total_pagado}€</span>}
                        <Badge variant={apt.status === 'completed' ? 'success' : 'secondary'} className="text-xs">
                          {apt.status === 'completed' ? 'Completada' : 'Confirmada'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => { setModal(null); openEdit(modal.client); }}>
                <Pencil className="w-3.5 h-3.5" /> Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Create / Edit modal */}
      <Dialog open={modal === 'create' || modal?.type === 'edit'} onOpenChange={() => setModal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{modal === 'create' ? 'Nueva clienta' : 'Editar clienta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre *"><Input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ana" /></Field>
              <Field label="Apellidos *"><Input value={form.apellidos} onChange={e => setForm(p => ({ ...p, apellidos: e.target.value }))} placeholder="García" /></Field>
            </div>
            <Field label="Teléfono"><Input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="600 000 000" /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="ana@email.com" /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setModal(null)}>Cancelar</Button>
            <Button className="rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 border-0" onClick={handleSave} disabled={saving || !form.nombre || !form.apellidos}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {modal === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-2 text-stone-600">
      <Icon className="w-4 h-4 text-stone-400" />
      <span>{value}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
