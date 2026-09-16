import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { GALLERY_CATEGORIES, formatDate } from '@/lib/utils';
import type { GalleryItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image_url: '', category: 'autre', event_date: '' });

  async function loadGallery() {
    setLoading(true);
    const { data } = await supabase.from('gallery').select('*').order('sort_order');
    setItems(data as GalleryItem[] || []);
    setLoading(false);
  }

  useEffect(() => { loadGallery(); }, []);

  async function save() {
    if (!form.title || !form.image_url) return;
    await supabase.from('gallery').insert({
      title: form.title,
      description: form.description || null,
      image_url: form.image_url,
      category: form.category,
      event_date: form.event_date || null,
      is_active: true,
    });
    setCreating(false);
    setForm({ title: '', description: '', image_url: '', category: 'autre', event_date: '' });
    loadGallery();
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette photo?')) return;
    await supabase.from('gallery').delete().eq('id', id);
    loadGallery();
  }

  return (
    <div>
      <AdminPageHeader title="Galerie" action={<button onClick={() => setCreating(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Ajouter</button>} />
      {loading ? <LoadingSpinner /> : items.length === 0 ? (
        <EmptyState title="Galerie vide" message="Ajoutez vos plus belles réalisations" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative rounded-xl overflow-hidden group aspect-square bg-cream-100">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                <h3 className="font-display text-sm font-semibold text-cream-50">{item.title}</h3>
                <button onClick={() => remove(item.id)} className="w-8 h-8 rounded-full bg-error-500 text-white flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
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
                <h2 className="font-display text-xl font-bold text-primary-900">Ajouter une photo</h2>
                <button onClick={() => setCreating(false)} className="p-2 text-primary-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Titre</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">URL de l'image</label><input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://..." /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Catégorie</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">{GALLERY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Date de l'événement</label><input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className="input-field" /></div>
                <button onClick={save} className="btn-primary w-full"><Save className="w-4 h-4" /> Enregistrer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AdminGallery;
