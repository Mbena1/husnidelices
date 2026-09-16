import { useEffect, useState } from 'react';
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { formatDate, formatPrice } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import type { Profile, Order } from '@/lib/types';

function AdminClients() {
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';
  const [clients, setClients] = useState<(Profile & { order_count?: number; total_spent?: number; last_order?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (!profiles) { setLoading(false); return; }

      const enriched = await Promise.all(
        (profiles as Profile[]).map(async p => {
          const { data: orders } = await supabase
            .from('orders')
            .select('total, created_at')
            .eq('user_id', p.id)
            .order('created_at', { ascending: false });
          return {
            ...p,
            order_count: orders?.length || 0,
            total_spent: orders?.reduce((sum, o) => sum + o.total, 0) || 0,
            last_order: orders?.[0]?.created_at || null,
          };
        })
      );
      setClients(enriched);
      setLoading(false);
    }
    loadClients();
  }, []);

  return (
    <div>
      <AdminPageHeader title="Clients" />
      {loading ? <LoadingSpinner /> : clients.length === 0 ? (
        <EmptyState title="Aucun client" message="Les clients apparaîtront ici après inscription" />
      ) : (
        <div className="bg-white rounded-2xl border border-cream-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-primary-500 text-xs uppercase">
              <tr>
                <th className="text-left p-4">Nom</th>
                <th className="text-left p-4 hidden sm:table-cell">Email</th>
                <th className="text-left p-4 hidden md:table-cell">Téléphone</th>
                <th className="text-left p-4 hidden lg:table-cell">Inscription</th>
                <th className="text-left p-4">Commandes</th>
                <th className="text-left p-4">Total dépensé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-cream-50">
                  <td className="p-4">
                    <p className="font-medium text-primary-900">
                      {[client.first_name, client.last_name].filter(Boolean).join(' ') || '—'}
                    </p>
                  </td>
                  <td className="p-4 text-primary-600 hidden sm:table-cell">{client.email}</td>
                  <td className="p-4 text-primary-600 hidden md:table-cell">{client.phone || '—'}</td>
                  <td className="p-4 text-primary-500 hidden lg:table-cell">{formatDate(client.created_at)}</td>
                  <td className="p-4"><span className="badge bg-blue-50 text-blue-600">{client.order_count}</span></td>
                  <td className="p-4 font-semibold text-primary-900">{formatPrice(client.total_spent || 0, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default AdminClients;
