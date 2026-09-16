import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Cake, Heart, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Order, CustomRequest, Product } from '@/lib/types';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { LoadingSpinner } from '@/components/States';

export function AccountDashboard() {
  const { profile } = useAuth();
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!profile) return;
      const [ordersRes, requestsRes, featuredRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('custom_requests').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(3),
        supabase.from('products').select('*, product_images(*)').eq('is_featured', true).eq('is_active', true).limit(4),
      ]);
      setOrders(ordersRes.data as Order[] || []);
      setRequests(requestsRes.data as CustomRequest[] || []);
      setFeatured(featuredRes.data as Product[] || []);
      setLoading(false);
    }
    loadData();
  }, [profile]);

  if (loading) return <LoadingSpinner />;

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Client';
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-chocolate rounded-2xl p-8 text-cream-50">
        <h2 className="font-display text-2xl font-bold mb-2">Bienvenue, {fullName}</h2>
        <p className="text-cream-200 text-sm">Gérez vos commandes et demandes personnalisées</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Commandes', value: orders.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
          { label: 'Demandes', value: requests.length, icon: Cake, color: 'bg-purple-50 text-purple-600' },
          { label: 'Total dépensé', value: formatPrice(totalSpent, currency), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
          { label: 'En cours', value: orders.filter(o => !['delivered', 'cancelled', 'refused'].includes(o.status)).length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-display font-bold text-primary-900">{stat.value}</p>
            <p className="text-xs text-primary-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-primary-900">Commandes récentes</h3>
          <Link to="/compte/commandes" className="text-sm text-accent-600 font-medium hover:text-accent-700 flex items-center gap-1">
            Tout voir <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-primary-400 text-sm py-6 text-center">Vous n'avez pas encore passé de commande</p>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                <div>
                  <p className="font-medium text-primary-900 text-sm">{order.order_number}</p>
                  <p className="text-xs text-primary-400">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                  <span className="font-semibold text-primary-900 text-sm">{formatPrice(order.total, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent requests */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-primary-900">Demandes personnalisées</h3>
          <Link to="/compte/demandes" className="text-sm text-accent-600 font-medium hover:text-accent-700 flex items-center gap-1">
            Tout voir <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {requests.length === 0 ? (
          <p className="text-primary-400 text-sm py-6 text-center">Aucune demande personnalisée</p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-cream-50 rounded-lg">
                <div>
                  <p className="font-medium text-primary-900 text-sm capitalize">{req.event_type}</p>
                  <p className="text-xs text-primary-400">{formatDate(req.created_at)}</p>
                </div>
                <span className={`badge ${getStatusColor(req.status)}`}>{getStatusLabel(req.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="font-display text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-accent-400" />
          Recommandé pour vous
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map(p => (
            <Link key={p.id} to={`/produit/${p.slug}`} className="card card-hover overflow-hidden group">
              <div className="aspect-square overflow-hidden bg-cream-100">
                {p.product_images?.[0] && (
                  <img src={p.product_images[0].url} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm text-primary-900 truncate">{p.name}</p>
                <p className="text-accent-600 font-semibold text-sm mt-1">{formatPrice(p.price, currency)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
export default AccountDashboard;
