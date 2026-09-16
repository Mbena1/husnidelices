import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Save, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');

  async function loadCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data as Category[] || []);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); }, []);

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setName(''); setDescription(''); setIcon('');
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setCreating(false);
    setName(cat.name); setDescription(cat.description || ''); setIcon(cat.icon || '');
  }

  async function save() {
    if (!name) return;
    if (editing) {
      await supabase.from('categories').update({ name, description, icon }).eq('id', editing.id);
    } else {
      await supabase.from('categories').insert({ name, slug: slugify(name) + '-' + Date.now().toString(36), description, icon });
    }
    setEditing(null); setCreating(false);
    loadCategories();
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette catégorie?')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  }

  return (
    <div>
      <AdminPageHeader title="Catégories" action={<button onClick={openCreate} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Ajouter</button>} />
      {loading ? <LoadingSpinner /> : categories.length === 0 ? (
        <EmptyState title="Aucune catégorie" message="Ajoutez votre première catégorie" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-cream-200 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-primary-900">{cat.name}</h3>
                {cat.description && <p className="text-sm text-primary-400">{cat.description}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-2 rounded-lg text-primary-600 hover:bg-primary-50"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => remove(cat.id)} className="p-2 rounded-lg text-error-500 hover:bg-error-500/10"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {(editing || creating) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm" onClick={() => { setEditing(null); setCreating(false); }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h2 className="font-display text-xl font-bold text-primary-900">{editing ? 'Modifier' : 'Ajouter'} une catégorie</h2>
                <button onClick={() => { setEditing(null); setCreating(false); }} className="p-2 text-primary-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Nom</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Description</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Icône (nom Lucide)</label><input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="input-field" placeholder="Ex: cake, cookie..." /></div>
                <button onClick={save} className="btn-primary w-full"><Save className="w-4 h-4" /> Enregistrer</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AdminCategories;
