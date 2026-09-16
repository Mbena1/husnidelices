import { useEffect, useState } from 'react';
import { Eye, Phone, MessageCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader, StatusBadge } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { formatPrice, formatDateTime, ORDER_STATUSES, getStatusLabel } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import type { Order } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings as useSiteSettings } from '@/contexts/SettingsContext';

function AdminOrders() {
  const { settings } = useSiteSettings();
  const currency = settings?.currency || 'FCFA';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function loadOrders() {
    setLoading(true);
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (filterStatus) query = query.eq('status', filterStatus);
    const { data } = await query;
    setOrders(data as Order[] || []);
    setLoading(false);
  }

  useEffect(() => { loadOrders(); }, [filterStatus]);

  async function updateStatus(orderId: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', orderId);

    const order = orders.find(o => o.id === orderId);
    if (order && order.user_id) {
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        title: 'Mise à jour de commande',
        message: `Votre commande ${order.order_number} est maintenant: ${getStatusLabel(status)}`,
        type: 'order',
        link: '/compte/commandes',
      });
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: status as any });
    }
  }

  return (
    <div>
      <AdminPageHeader title="Commandes" />

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!filterStatus ? 'bg-primary-800 text-cream-50' : 'bg-white border border-cream-300 text-primary-600'}`}
        >
          Toutes
        </button>
        {ORDER_STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterStatus === s ? 'bg-primary-800 text-cream-50' : 'bg-white border border-cream-300 text-primary-600'}`}
          >
            {getStatusLabel(s)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <EmptyState title="Aucune commande" message="Aucune commande dans cette catégorie" />
      ) : (
        <div className="bg-white rounded-2xl border border-cream-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-primary-500 text-xs uppercase">
              <tr>
                <th className="text-left p-4">N° Commande</th>
                <th className="text-left p-4">Client</th>
                <th className="text-left p-4 hidden sm:table-cell">Téléphone</th>
                <th className="text-left p-4 hidden md:table-cell">Date</th>
                <th className="text-left p-4">Montant</th>
                <th className="text-left p-4">Statut</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-cream-50">
                  <td className="p-4 font-medium text-primary-900">{order.order_number}</td>
                  <td className="p-4 text-primary-700">{order.customer_name}</td>
                  <td className="p-4 text-primary-600 hidden sm:table-cell">{order.customer_phone}</td>
                  <td className="p-4 text-primary-500 hidden md:table-cell">{formatDateTime(order.created_at)}</td>
                  <td className="p-4 font-semibold text-primary-900">{formatPrice(order.total, currency)}</td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50">
                        <Eye className="w-4 h-4" />
                      </button>
                      <a href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-[#25D366] hover:bg-green-50">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <h2 className="font-display text-xl font-bold text-primary-900">Commande {selectedOrder.order_number}</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-primary-400 hover:text-primary-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-primary-400">Client</p><p className="font-medium text-primary-900">{selectedOrder.customer_name}</p></div>
                  <div><p className="text-primary-400">Téléphone</p><p className="font-medium text-primary-900">{selectedOrder.customer_phone}</p></div>
                  <div><p className="text-primary-400">Date</p><p className="font-medium text-primary-900">{formatDateTime(selectedOrder.created_at)}</p></div>
                  <div><p className="text-primary-400">Mode</p><p className="font-medium text-primary-900">{selectedOrder.delivery_method === 'delivery' ? 'Livraison' : 'Retrait'}</p></div>
                  {selectedOrder.delivery_address && <div className="col-span-2"><p className="text-primary-400">Adresse</p><p className="font-medium text-primary-900">{selectedOrder.delivery_address}, {selectedOrder.delivery_city}</p></div>}
                  {selectedOrder.desired_date && <div><p className="text-primary-400">Date souhaitée</p><p className="font-medium text-primary-900">{selectedOrder.desired_date}</p></div>}
                  {selectedOrder.desired_time && <div><p className="text-primary-400">Heure</p><p className="font-medium text-primary-900">{selectedOrder.desired_time}</p></div>}
                  {selectedOrder.instructions && <div className="col-span-2"><p className="text-primary-400">Instructions</p><p className="font-medium text-primary-900">{selectedOrder.instructions}</p></div>}
                </div>

                <div className="border-t border-cream-200 pt-4">
                  <p className="text-sm font-medium text-primary-700 mb-2">Articles</p>
                  {selectedOrder.order_items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-2">
                      <span className="text-primary-700">{item.product_name} x{item.quantity}</span>
                      <span className="font-medium text-primary-900">{formatPrice(item.subtotal, currency)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cream-200 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-primary-600"><span>Sous-total</span><span>{formatPrice(selectedOrder.subtotal, currency)}</span></div>
                  {selectedOrder.delivery_fee > 0 && <div className="flex justify-between text-primary-600"><span>Livraison</span><span>{formatPrice(selectedOrder.delivery_fee, currency)}</span></div>}
                  {selectedOrder.discount > 0 && <div className="flex justify-between text-success-600"><span>Réduction</span><span>-{formatPrice(selectedOrder.discount, currency)}</span></div>}
                  <div className="flex justify-between font-display text-lg font-bold text-primary-900"><span>Total</span><span>{formatPrice(selectedOrder.total, currency)}</span></div>
                </div>

                {/* Status changer */}
                <div className="border-t border-cream-200 pt-4">
                  <p className="text-sm font-medium text-primary-700 mb-2">Changer le statut</p>
                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedOrder.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                          selectedOrder.status === s ? 'border-accent-400 bg-accent-50 text-primary-900' : 'border-cream-300 text-primary-600 hover:border-primary-300'
                        }`}
                      >
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
export default AdminOrders;
