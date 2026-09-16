import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cake, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { CustomRequest } from '@/lib/types';
import { formatDate, getStatusLabel, getStatusColor, formatPrice } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { LoadingSpinner, EmptyState } from '@/components/States';

export function AccountRequests() {
  const { profile } = useAuth();
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      if (!profile) return;
      const { data } = await supabase
        .from('custom_requests')
        .select('*, custom_request_images(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setRequests(data as CustomRequest[] || []);
      setLoading(false);
    }
    loadRequests();
  }, [profile]);

  if (loading) return <LoadingSpinner />;

  if (requests.length === 0) {
    return (
      <EmptyState
        title="Aucune demande personnalisée"
        message="Créez votre première commande personnalisée pour un gâteau unique"
        actionLabel="Créer une demande"
        actionLink="/commande-personnalisee"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-primary-900">Mes demandes personnalisées</h2>
        <Link to="/commande-personnalisee" className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </Link>
      </div>

      {requests.map(req => (
        <div key={req.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Cake className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <p className="font-medium text-primary-900 capitalize">{req.event_type}</p>
                <p className="text-xs text-primary-400">{formatDate(req.created_at)}</p>
              </div>
            </div>
            <span className={`badge ${getStatusColor(req.status)}`}>{getStatusLabel(req.status)}</span>
          </div>

          <p className="text-sm text-primary-600 mb-3">{req.description}</p>

          {req.custom_request_images && req.custom_request_images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {req.custom_request_images.map(img => (
                <img key={img.id} src={img.url} alt="Inspiration" className="w-16 h-16 rounded-lg object-cover" />
              ))}
            </div>
          )}

          {req.admin_response && (
            <div className="p-3 bg-accent-50 rounded-lg border border-accent-200 mt-3">
              <p className="text-xs font-medium text-accent-700 mb-1">Réponse de la pâtissière:</p>
              <p className="text-sm text-primary-700">{req.admin_response}</p>
              {req.proposed_price && (
                <p className="text-sm font-semibold text-accent-700 mt-2">
                  Prix proposé: {formatPrice(req.proposed_price, currency)}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-xs text-primary-500 mt-3">
            {req.desired_date && <span>Date: {formatDate(req.desired_date)}</span>}
            {req.servings && <span>Personnes: {req.servings}</span>}
            {req.budget && <span>Budget: {formatPrice(req.budget, currency)}</span>}
            {req.flavor && <span>Parfum: {req.flavor}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
export default AccountRequests;
