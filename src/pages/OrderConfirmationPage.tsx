import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Order } from '@/lib/types';
import { formatPrice, formatDate, getStatusLabel } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { LoadingSpinner } from '@/components/States';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export function OrderConfirmationPage() {
  const { id } = useParams();
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .maybeSingle();
      setOrder(data as Order | null);
      setLoading(false);
    }
    loadOrder();
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="min-h-screen bg-cream-50 pt-20 pb-12 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="card p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-success-500" />
          </motion.div>

          <h1 className="font-display text-2xl font-bold text-primary-900 mb-2">Commande confirmée!</h1>
          <p className="text-primary-500 text-sm mb-6">
            Merci pour votre commande. Nous vous contacterons bientôt pour confirmer les détails.
          </p>

          {order && (
            <div className="bg-cream-50 rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">N° de commande</span>
                <span className="font-medium text-primary-900">{order.order_number}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Statut</span>
                <span className="font-medium text-primary-900">{getStatusLabel(order.status)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Date souhaitée</span>
                <span className="font-medium text-primary-900">{formatDate(order.desired_date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-500">Mode</span>
                <span className="font-medium text-primary-900">{order.delivery_method === 'delivery' ? 'Livraison' : 'Retrait'}</span>
              </div>
              <div className="flex justify-between font-display text-lg font-bold text-primary-900 pt-2 border-t border-cream-200">
                <span>Total</span>
                <span>{formatPrice(order.total, currency)}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/compte/commandes" className="btn-primary">
              <Package className="w-5 h-5" />
              Suivre ma commande
            </Link>
            <WhatsAppButton
              message={order ? `Bonjour, je viens de passer la commande ${order.order_number} d'un montant de ${formatPrice(order.total, currency)}.` : ''}
              className="flex-1"
            />
          </div>

          <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary-400 hover:text-primary-700 mt-6">
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
export default OrderConfirmationPage;
