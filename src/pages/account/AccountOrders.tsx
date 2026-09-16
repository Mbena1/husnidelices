import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Order } from '@/lib/types';
import { formatPrice, formatDate, formatDateTime, getStatusLabel, getStatusColor, ORDER_STATUS_FLOW } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { LoadingSpinner, EmptyState } from '@/components/States';

export function AccountOrders() {
  const { profile } = useAuth();
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!profile) return;
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setOrders(data as Order[] || []);
      setLoading(false);
    }
    loadOrders();
  }, [profile]);

  if (loading) return <LoadingSpinner />;

  if (orders.length === 0) {
    return (
      <EmptyState
        title="Aucune commande"
        message="Vous n'avez pas encore passé de commande"
        actionLabel="Voir la boutique"
        actionLink="/boutique"
      />
    );
  }

  const currentStepIndex = (status: string) => ORDER_STATUS_FLOW.indexOf(status);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold text-primary-900 mb-6">Mes commandes</h2>
      {orders.map(order => {
        const isExpanded = expandedId === order.id;
        const stepIndex = currentStepIndex(order.status);
        return (
          <div key={order.id} className="card overflow-hidden">
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-cream-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary-700" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-primary-900 text-sm">{order.order_number}</p>
                  <p className="text-xs text-primary-400">{formatDateTime(order.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                <span className="font-semibold text-primary-900 text-sm hidden sm:block">{formatPrice(order.total, currency)}</span>
                <Eye className="w-4 h-4 text-primary-400" />
              </div>
            </button>

            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-cream-200 p-4 space-y-4"
              >
                {/* Status timeline */}
                {order.status !== 'cancelled' && order.status !== 'refused' && (
                  <div className="flex items-center justify-between max-w-md">
                    {ORDER_STATUS_FLOW.map((status, i) => (
                      <div key={status} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            i <= stepIndex ? 'bg-accent-400 text-primary-900' : 'bg-cream-200 text-primary-400'
                          }`}>
                            {i + 1}
                          </div>
                          <span className={`text-xs mt-1 ${i <= stepIndex ? 'text-primary-700 font-medium' : 'text-primary-400'}`}>
                            {getStatusLabel(status)}
                          </span>
                        </div>
                        {i < ORDER_STATUS_FLOW.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 ${i < stepIndex ? 'bg-accent-400' : 'bg-cream-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Order items */}
                <div className="space-y-2">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-cream-50 rounded-lg">
                      {item.product_image && (
                        <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-900">{item.product_name}</p>
                        <p className="text-xs text-primary-400">{item.quantity} x {formatPrice(item.unit_price, currency)}</p>
                      </div>
                      <span className="font-semibold text-sm text-primary-900">{formatPrice(item.subtotal, currency)}</span>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-primary-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(order.subtotal, currency)}</span>
                  </div>
                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between text-primary-600">
                      <span>Livraison</span>
                      <span>{formatPrice(order.delivery_fee, currency)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-success-600">
                      <span>Réduction</span>
                      <span>-{formatPrice(order.discount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-primary-900 pt-2 border-t border-cream-200">
                    <span>Total</span>
                    <span>{formatPrice(order.total, currency)}</span>
                  </div>
                </div>

                {/* Delivery info */}
                <div className="text-sm space-y-1 text-primary-600">
                  <p><strong className="text-primary-900">Livraison:</strong> {order.delivery_method === 'delivery' ? 'Livraison' : 'Retrait sur place'}</p>
                  {order.desired_date && <p><strong className="text-primary-900">Date souhaitée:</strong> {formatDate(order.desired_date)}</p>}
                  {order.instructions && <p><strong className="text-primary-900">Instructions:</strong> {order.instructions}</p>}
                </div>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default AccountOrders;
