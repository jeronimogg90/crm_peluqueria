import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Scissors, Sparkles, Heart, Check, X } from 'lucide-react';
import api from '../config/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';

const categoryConfig = {
  'Peluquería': { color: 'rose', icon: Scissors },
  'Uñas':       { color: 'pink', icon: Heart },
  'Estética':   { color: 'warning', icon: Sparkles },
};

const emptyForm = { name: '', category: 'Peluquería', price: '', duration: '', description: '', active: true };

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchServices = () => {
    setLoading(true);
    api.get('/services/all').then(r => setServices(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit = (s) => {
    setForm({ name: s.name, category: s.category, price: s.price, duration: s.duration, description: s.description || '', active: s.active });
    setModal({ type: 'edit', id: s.id });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/services', form);
      } else {
        await api.put(`/services/${modal.id}`, form);
      }
      setModal(null);
      fetchServices();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/services/${id}`).catch(console.error);
    setDeleteId(null);
    fetchServices();
  };

  const grouped = Object.keys(categoryConfig).reduce((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat);
    return acc;
  }, {});

  return (
    <>
    <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-stone-800">Servicios</h1>
            <p className="text-stone-500 mt-1">{services.length} servicios registrados</p>
          </div>
          <Button onClick={openCreate} className="rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 border-0 shadow-sm">
            <Plus className="w-4 h-4" />
            Nuevo servicio
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([cat, items]) => {
              if (!items.length) return null;
              const cfg = categoryConfig[cat];
              const Icon = cfg.icon;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-4 h-4 text-stone-400" />
                    <h2 className="font-semibold text-stone-700">{cat}</h2>
                    <span className="text-xs text-stone-400">({items.length})</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(s => (
                      <Card key={s.id} className={`border-stone-100 ${!s.active ? 'opacity-50' : ''}`}>
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-stone-800 text-sm">{s.name}</p>
                              <Badge variant={cfg.color} className="mt-1 text-xs">{s.category}</Badge>
                            </div>
                            <p className="font-bold text-rose-500 text-lg">{s.price}€</p>
                          </div>
                          {s.description && <p className="text-xs text-stone-500 leading-relaxed">{s.description}</p>}
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-stone-400">{s.duration} min</span>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="w-7 h-7 text-stone-400 hover:text-rose-500" onClick={() => openEdit(s)}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="w-7 h-7 text-stone-400 hover:text-red-500" onClick={() => setDeleteId(s.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>

      {/* Create/Edit modal */}
      <Dialog open={modal !== null} onOpenChange={() => setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{modal === 'create' ? 'Nuevo servicio' : 'Editar servicio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Nombre *">
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Corte de pelo" />
            </Field>
            <Field label="Categoría *">
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryConfig).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Precio (€) *">
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="25" />
              </Field>
              <Field label="Duración (min) *">
                <Input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="45" />
              </Field>
            </div>
            <Field label="Descripción">
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción del servicio..." rows={2} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setModal(null)}>Cancelar</Button>
            <Button className="rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 border-0" onClick={handleSave} disabled={saving || !form.name || !form.price || !form.duration}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {modal === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar servicio?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-500">Esta acción desactivará el servicio. No podrá deshacerse.</p>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button className="rounded-xl bg-red-500 hover:bg-red-600 border-0" onClick={() => handleDelete(deleteId)}>
              <Trash2 className="w-4 h-4" /> Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
