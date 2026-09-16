import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save, Tag, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { formatDate } from '@/lib/utils';
import type { Promotion } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discount_type: 'percentage', discount_value: '', end_date: '' });

  async function loadPromotions() {
    setLoading(true);
    const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    setPromotions(data as Promotion[] || []);
    setLoading(false);
  }

  useEffect(() => { loadPromotions(); }, []);

  async function save() {
    if (!form.title || !form.discount_value) return;
    await supabase.from('promotions').insert({
      title: form.title,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseInt(form.discount_value),
      end_date: form.end_date || null,
      is_active: true,
      start_date: new Date().toISOString(),
    });
    setCreating(false);
    setForm({ title: '', description: '', discount_type: 'percentage', discount_value: '', end_date: '' });
    loadPromotions();
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette promotion?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    loadPromotions();
  }

  async function toggleActive(promo: Promotion) {
    await supabase.from('promotions').update({ is_active: !promo.is_active }).eq('id', promo.id);
    loadPromotions();
  }

  return (
    <div>
      <AdminPageHeader title="Promotions" action={<button onClick={() => setCreating(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Ajouter</button>} />
      {loading ? <LoadingSpinner /> : promotions.length === 0 ? (
        <EmptyState title="Aucune promotion" message="Créez votre première promotion" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white rounded-2xl border border-cream-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center"><Tag className="w-5 h-5 text-accent-600" /></div>
                  <div>
                    <h3 className="font-medium text-primary-900">{promo.title}</h3>
                    <p className="text-xs text-primary-400">{promo.discount_type === 'percentage' ? `-${promo.discount_value}%` : `-${promo.discount_value} FCFA`}</p>
                  </div>
                </div>
                <span className={`badge ${promo.is_active ? 'bg-success-500/10 text-success-600' : 'bg-cream-200 text-primary-400'}`}>{promo.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              {promo.description && <p className="text-sm text-primary-500 mb-3">{promo.description}</p>}
              {promo.end_date && <p className="text-xs text-primary-400 flex items-center gap-1 mb-3"><Calendar className="w-3 h-3" />Jusqu'au {formatDate(promo.end_date)}</p>}
              <div className="flex gap-2 pt-3 border-t border-cream-100">
                <button onClick={() => toggleActive(promo)} className="btn-ghost text-sm flex-1">{promo.is_active ? 'Désactiver' : 'Activer'}</button>
                <button onClick={() => remove(promo.id)} className="p-2 rounded-lg text-error-500 hover:bg-error-500/10"><Trash2 className="w-4 h-4" /></button>
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
                <h2 className="font-display text-xl font-bold text-primary-900">Nouvelle promotion</h2>
                <button onClick={() => setCreating(false)} className="p-2 text-primary-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Titre</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-primary-700 mb-1">Type</label><select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value })} className="input-field"><option value="percentage">Pourcentage</option><option value="fixed">Montant fixe</option></select></div>
                  <div><label className="block text-sm font-medium text-primary-700 mb-1">Valeur</label><input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} className="input-field" /></div>
                </div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Date de fin</label><input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="input-field" /></div>
                <button onClick={save} className="btn-primary w-full"><Save className="w-4 h-4" /> Créer la promotion</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AdminPromotions;
