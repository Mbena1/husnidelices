import { useEffect, useState } from 'react';
import { Plus, Trash2, Cake, Eye, MessageCircle, X, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader, StatusBadge } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { formatPrice, formatDate, getStatusLabel } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import type { CustomRequest } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

function AdminRequests() {
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomRequest | null>(null);
  const [response, setResponse] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');

  async function loadRequests() {
    setLoading(true);
    const { data } = await supabase
      .from('custom_requests')
      .select('*, custom_request_images(*)')
      .order('created_at', { ascending: false });
    setRequests(data as CustomRequest[] || []);
    setLoading(false);
  }

  useEffect(() => { loadRequests(); }, []);

  async function updateStatus(id: string, status: string) {
    const updateData: any = { status };
    if (response) updateData.admin_response = response;
    if (proposedPrice) updateData.proposed_price = parseInt(proposedPrice);

    await supabase.from('custom_requests').update(updateData).eq('id', id);

    const req = requests.find(r => r.id === id);
    if (req?.user_id) {
      await supabase.from('notifications').insert({
        user_id: req.user_id,
        title: 'Réponse à votre demande',
        message: `Votre demande ${req.event_type} a été mise à jour: ${getStatusLabel(status)}`,
        type: 'custom_request',
        link: '/compte/demandes',
      });
    }

    loadRequests();
    setSelected(null);
    setResponse('');
    setProposedPrice('');
  }

  return (
    <div>
      <AdminPageHeader title="Demandes personnalisées" />
      {loading ? (
        <LoadingSpinner />
      ) : requests.length === 0 ? (
        <EmptyState title="Aucune demande" message="Aucune demande personnalisée pour le moment" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-cream-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cake className="w-5 h-5 text-primary-600" />
                  <span className="font-medium text-primary-900 capitalize">{req.event_type}</span>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm text-primary-600 line-clamp-2 mb-2">{req.description}</p>
              <p className="text-xs text-primary-400 mb-3">{formatDate(req.created_at)}</p>
              {req.custom_request_images && req.custom_request_images.length > 0 && (
                <div className="flex gap-1 mb-3">
                  {req.custom_request_images.slice(0, 3).map(img => (
                    <img key={img.id} src={img.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-3 border-t border-cream-100">
                <button onClick={() => { setSelected(req); setResponse(req.admin_response || ''); setProposedPrice(req.proposed_price?.toString() || ''); }} className="btn-ghost text-sm flex-1">
                  <Eye className="w-4 h-4" /> Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h2 className="font-display text-xl font-bold text-primary-900 capitalize">Demande: {selected.event_type}</h2>
                <button onClick={() => setSelected(null)} className="p-2 text-primary-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selected.desired_date && <div><p className="text-primary-400">Date</p><p className="font-medium text-primary-900">{formatDate(selected.desired_date)}</p></div>}
                  {selected.servings && <div><p className="text-primary-400">Personnes</p><p className="font-medium text-primary-900">{selected.servings}</p></div>}
                  {selected.budget && <div><p className="text-primary-400">Budget</p><p className="font-medium text-primary-900">{formatPrice(selected.budget, currency)}</p></div>}
                  {selected.flavor && <div><p className="text-primary-400">Parfum</p><p className="font-medium text-primary-900">{selected.flavor}</p></div>}
                  {selected.color_theme && <div><p className="text-primary-400">Couleurs</p><p className="font-medium text-primary-900">{selected.color_theme}</p></div>}
                  {selected.size && <div><p className="text-primary-400">Taille</p><p className="font-medium text-primary-900">{selected.size}</p></div>}
                </div>
                <div>
                  <p className="text-sm text-primary-400 mb-1">Description</p>
                  <p className="text-sm text-primary-700 bg-cream-50 rounded-lg p-3">{selected.description}</p>
                </div>
                {selected.custom_request_images && selected.custom_request_images.length > 0 && (
                  <div>
                    <p className="text-sm text-primary-400 mb-2">Photos d'inspiration</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.custom_request_images.map(img => (
                        <img key={img.id} src={img.url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t border-cream-200 pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Réponse au client</label>
                    <textarea rows={3} value={response} onChange={e => setResponse(e.target.value)} className="input-field resize-none" placeholder="Votre réponse..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Prix proposé (FCFA)</label>
                    <input type="number" value={proposedPrice} onChange={e => setProposedPrice(e.target.value)} className="input-field" placeholder="Ex: 45000" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['reviewing', 'quoted', 'accepted', 'declined'].map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 ${selected.status === s ? 'border-accent-400 bg-accent-50' : 'border-cream-300 text-primary-600 hover:border-primary-300'}`}>
                        {getStatusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AdminRequests;
