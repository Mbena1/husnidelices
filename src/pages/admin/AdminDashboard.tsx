import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, Package, Users, Cake, Tag, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader, StatCard, StatusBadge } from '@/components/AdminUI';
import { LoadingSpinner } from '@/components/States';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

interface DashboardStats {
  todayOrders: number;
  pendingOrders: number;
  customRequests: number;
  totalProducts: number;
  totalCustomers: number;
  activePromos: number;
  totalRevenue: number;
  recentOrders: any[];
  last7Days: { date: string; count: number }[];
}

function AdminDashboard() {
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const today = new Date().toISOString().split('T')[0];

      const [ordersRes, pendingRes, reqRes, productsRes, customersRes, promosRes, recentRes] = await Promise.all([
        supabase.from('orders').select('id, total, created_at').gte('created_at', today),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('custom_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('promotions').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const todayOrders = ordersRes.data || [];
      const totalRevenue = todayOrders.reduce((sum: number, o: any) => sum + o.total, 0);

      // Last 7 days chart data
      const last7Days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = todayOrders.filter((o: any) => o.created_at.startsWith(dateStr)).length;
        last7Days.push({ date: dateStr, count });
      }

      setStats({
        todayOrders: todayOrders.length,
        pendingOrders: pendingRes.count || 0,
        customRequests: reqRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalCustomers: customersRes.count || 0,
        activePromos: promosRes.count || 0,
        totalRevenue,
        recentOrders: recentRes.data || [],
        last7Days,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const maxDayCount = Math.max(...stats!.last7Days.map(d => d.count), 1);

  return (
    <div>
      <AdminPageHeader title="Dashboard" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Commandes aujourd'hui" value={stats!.todayOrders} icon={ShoppingCart} color="bg-blue-50 text-blue-600" />
        <StatCard label="En attente" value={stats!.pendingOrders} icon={Clock} color="bg-amber-50 text-amber-600" />
        <StatCard label="Demandes personnalisées" value={stats!.customRequests} icon={Cake} color="bg-purple-50 text-purple-600" />
        <StatCard label="CA aujourd'hui" value={formatPrice(stats!.totalRevenue, currency)} icon={DollarSign} color="bg-green-50 text-green-600" />
        <StatCard label="Produits actifs" value={stats!.totalProducts} icon={Package} color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Clients" value={stats!.totalCustomers} icon={Users} color="bg-pink-50 text-pink-600" />
        <StatCard label="Promotions actives" value={stats!.activePromos} icon={Tag} color="bg-orange-50 text-orange-600" />
        <StatCard label="Voir les commandes" value="→" icon={TrendingUp} color="bg-teal-50 text-teal-600" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-cream-200 mb-8">
        <h2 className="font-display text-lg font-semibold text-primary-900 mb-6">Commandes des 7 derniers jours</h2>
        <div className="flex items-end justify-between gap-2 h-40">
          {stats!.last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-cream-100 rounded-t-lg relative" style={{ height: '100%' }}>
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-primary-800 to-accent-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(day.count / maxDayCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-primary-400">
                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
              </span>
              <span className="text-xs font-semibold text-primary-700">{day.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <div className="p-6 border-b border-cream-200 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-primary-900">Commandes récentes</h2>
          <Link to="/admin/commandes" className="text-sm text-accent-600 font-medium hover:text-accent-700">
            Tout voir →
          </Link>
        </div>
        {stats!.recentOrders.length === 0 ? (
          <p className="p-8 text-center text-primary-400 text-sm">Aucune commande pour le moment</p>
        ) : (
          <div className="divide-y divide-cream-100">
            {stats!.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-cream-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="font-medium text-primary-900 text-sm">{order.order_number}</p>
                    <p className="text-xs text-primary-400">{order.customer_name} • {formatDateTime(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold text-primary-900 text-sm">{formatPrice(order.total, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;
