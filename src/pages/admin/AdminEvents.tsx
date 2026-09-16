import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save, Calendar, Play, Pause } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { formatDate } from '@/lib/utils';
import type { Event, Theme } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', theme_id: '', start_date: '', end_date: '' });

  async function loadEvents() {
    setLoading(true);
    const [evRes, thRes] = await Promise.all([
      supabase.from('events').select('*, theme:themes(*)').order('start_date'),
      supabase.from('themes').select('*').order('name'),
    ]);
    setEvents(evRes.data as Event[] || []);
    setThemes(thRes.data as Theme[] || []);
    setLoading(false);
  }

  useEffect(() => { loadEvents(); }, []);

  async function save() {
    if (!form.name || !form.start_date || !form.end_date) return;
    await supabase.from('events').insert({
      name: form.name,
      description: form.description || null,
      theme_id: form.theme_id || null,
      start_date: form.start_date,
      end_date: form.end_date,
      is_active: true,
      is_recurring: false,
    });
    setCreating(false);
    setForm({ name: '', description: '', theme_id: '', start_date: '', end_date: '' });
    loadEvents();
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cet événement?')) return;
    await supabase.from('events').delete().eq('id', id);
    loadEvents();
  }

  async function toggleActive(event: Event) {
    await supabase.from('events').update({ is_active: !event.is_active }).eq('id', event.id);
    loadEvents();
  }

  return (
    <div>
      <AdminPageHeader title="Événements" action={<button onClick={() => setCreating(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Ajouter</button>} />
      {loading ? <LoadingSpinner /> : events.length === 0 ? (
        <EmptyState title="Aucun événement" message="Créez votre premier événement" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-2xl border border-cream-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent-600" />
                  <h3 className="font-medium text-primary-900">{event.name}</h3>
                </div>
                <span className={`badge ${event.is_active ? 'bg-success-500/10 text-success-600' : 'bg-cream-200 text-primary-400'}`}>{event.is_active ? 'Actif' : 'Inactif'}</span>
              </div>
              {event.description && <p className="text-sm text-primary-500 mb-2">{event.description}</p>}
              <p className="text-xs text-primary-400 mb-2">{formatDate(event.start_date)} → {formatDate(event.end_date)}</p>
              {event.theme && <p className="text-xs text-accent-600">Thème: {event.theme.name}</p>}
              <div className="flex gap-2 pt-3 border-t border-cream-100">
                <button onClick={() => toggleActive(event)} className="btn-ghost text-sm flex-1">{event.is_active ? <><Pause className="w-4 h-4" /> Désactiver</> : <><Play className="w-4 h-4" /> Activer</>}</button>
                <button onClick={() => remove(event.id)} className="p-2 rounded-lg text-error-500 hover:bg-error-500/10"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm" onClick={() => setCreating(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h2 className="font-display text-xl font-bold text-primary-900">Nouvel événement</h2>
                <button onClick={() => setCreating(false)} className="p-2 text-primary-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Nom</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Thème associé</label><select value={form.theme_id} onChange={e => setForm({ ...form, theme_id: e.target.value })} className="input-field"><option value="">Aucun</option>{themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-primary-700 mb-1">Date de début</label><input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="input-field" /></div>
                  <div><label className="block text-sm font-medium text-primary-700 mb-1">Date de fin</label><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="input-field" /></div>
                </div>
                <button onClick={save} className="btn-primary w-full"><Save className="w-4 h-4" /> Créer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AdminEvents;
