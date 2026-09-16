import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save, FolderTree } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import type { Collection } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image_url: '' });

  async function loadCollections() {
    setLoading(true);
    const { data } = await supabase.from('collections').select('*').order('sort_order');
    setCollections(data as Collection[] || []);
    setLoading(false);
  }

  useEffect(() => { loadCollections(); }, []);

  async function save() {
    if (!form.title) return;
    await supabase.from('collections').insert({
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      is_active: true,
      is_featured: false,
    });
    setCreating(false);
    setForm({ title: '', description: '', image_url: '' });
    loadCollections();
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette collection?')) return;
    await supabase.from('collections').delete().eq('id', id);
    loadCollections();
  }

  async function toggleFeatured(col: Collection) {
    await supabase.from('collections').update({ is_featured: !col.is_featured }).eq('id', col.id);
    loadCollections();
  }

  return (
    <div>
      <AdminPageHeader title="Collections" action={<button onClick={() => setCreating(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Ajouter</button>} />
      {loading ? <LoadingSpinner /> : collections.length === 0 ? (
        <EmptyState title="Aucune collection" message="Créez votre première collection" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(col => (
            <div key={col.id} className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
              {col.image_url && <div className="aspect-video bg-cream-100"><img src={col.image_url} alt={col.title} className="w-full h-full object-cover" /></div>}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-primary-900">{col.title}</h3>
                  {col.is_featured && <span className="badge bg-accent-400 text-primary-900">Vedette</span>}
                </div>
                {col.description && <p className="text-sm text-primary-500 line-clamp-2 mb-3">{col.description}</p>}
                <div className="flex gap-2 pt-3 border-t border-cream-100">
                  <button onClick={() => toggleFeatured(col)} className="btn-ghost text-sm flex-1">{col.is_featured ? 'Retirer vedette' : 'Mettre en vedette'}</button>
                  <button onClick={() => remove(col.id)} className="p-2 rounded-lg text-error-500 hover:bg-error-500/10"><Trash2 className="w-4 h-4" /></button>
                </div>
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
                <h2 className="font-display text-xl font-bold text-primary-900">Nouvelle collection</h2>
                <button onClick={() => setCreating(false)} className="p-2 text-primary-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Titre</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">URL de l'image</label><input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://..." /></div>
                <button onClick={save} className="btn-primary w-full"><Save className="w-4 h-4" /> Créer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AdminCollections;
