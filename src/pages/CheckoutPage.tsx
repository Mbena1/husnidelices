import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ShoppingBag, Truck, Store, Calendar, Clock, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, generateOrderNumber } from '@/lib/utils';

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { profile } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const currency = settings?.currency || 'FCFA';
  const deliveryFee = settings?.delivery_fee || 0;

  const [form, setForm] = useState({
    customer_name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' '),
    customer_phone: profile?.phone || '',
    customer_email: profile?.email || '',
    delivery_address: profile?.address || '',
    delivery_city: profile?.city || '',
    delivery_method: 'pickup' as 'pickup' | 'delivery',
    desired_date: '',
    desired_time: '',
    instructions: '',
    promo_code: '',
  });
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const deliveryTotal = form.delivery_method === 'delivery' ? deliveryFee : 0;
  const total = subtotal - promoDiscount + deliveryTotal;

  async function applyPromo() {
    if (!form.promo_code) return;
    setPromoError('');
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', form.promo_code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (!data) {
      setPromoError('Code promo invalide');
      setPromoDiscount(0);
      return;
    }
    if (data.max_uses && data.used_count >= data.max_uses) {
      setPromoError('Ce code promo a atteint sa limite d\'utilisation');
      return;
    }
    const discount = data.discount_type === 'percentage'
      ? Math.round(subtotal * data.discount_value / 100)
      : data.discount_value;
    setPromoDiscount(Math.min(discount, subtotal));
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) {
      navigate('/connexion');
      return;
    }
    if (items.length === 0) return;

    setPlacing(true);
    setError('');

    const orderNumber = generateOrderNumber();
    const orderData = {
      order_number: orderNumber,
      user_id: profile.id,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email || null,
      delivery_address: form.delivery_method === 'delivery' ? form.delivery_address : null,
      delivery_city: form.delivery_method === 'delivery' ? form.delivery_city : null,
      delivery_method: form.delivery_method,
      delivery_fee: deliveryTotal,
      desired_date: form.desired_date || null,
      desired_time: form.desired_time || null,
      instructions: form.instructions || null,
      subtotal,
      discount: promoDiscount,
      total,
      promo_code: promoDiscount > 0 ? form.promo_code : null,
      status: 'pending',
      payment_method: 'cash_on_delivery',
      payment_status: 'pending',
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError || !order) {
      setError('Erreur lors de la création de la commande. Veuillez réessayer.');
      setPlacing(false);
      return;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_image: item.image,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    await supabase.from('order_items').insert(orderItems);

    // Send notification to admin
    await supabase.from('notifications').insert({
      is_admin_target: true,
      title: 'Nouvelle commande',
      message: `Commande ${orderNumber} reçue de ${form.customer_name}`,
      type: 'order',
      link: `/admin/commandes`,
    });

    clearCart();
    setPlacing(false);
    navigate(`/commande-confirmation/${order.id}`);
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-primary-300 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-primary-900 mb-2">Votre panier est vide</h1>
          <p className="text-primary-500 mb-6">Ajoutez des produits avant de passer commande</p>
          <Link to="/boutique" className="btn-primary">Voir la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20 pb-12">
      <div className="container-padding px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-primary-900 mb-8">Finaliser ma commande</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Informations de contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    required
                    value={form.customer_phone}
                    onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                    className="input-field"
                    placeholder="+229 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Email (optionnel)</label>
                  <input
                    type="email"
                    value={form.customer_email}
                    onChange={e => setForm({ ...form, customer_email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Delivery method */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Mode de récupération</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, delivery_method: 'pickup' })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.delivery_method === 'pickup' ? 'border-accent-400 bg-accent-50' : 'border-cream-300 bg-white'
                  }`}
                >
                  <Store className="w-6 h-6 text-primary-700 mb-2" />
                  <p className="font-medium text-primary-900 text-sm">Retrait sur place</p>
                  <p className="text-xs text-primary-400">Gratuit</p>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, delivery_method: 'delivery' })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.delivery_method === 'delivery' ? 'border-accent-400 bg-accent-50' : 'border-cream-300 bg-white'
                  }`}
                >
                  <Truck className="w-6 h-6 text-primary-700 mb-2" />
                  <p className="font-medium text-primary-900 text-sm">Livraison</p>
                  <p className="text-xs text-primary-400">{formatPrice(deliveryFee, currency)}</p>
                </button>
              </div>

              {form.delivery_method === 'delivery' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 mb-1">Adresse de livraison</label>
                    <input
                      type="text"
                      required={form.delivery_method === 'delivery'}
                      value={form.delivery_address}
                      onChange={e => setForm({ ...form, delivery_address: e.target.value })}
                      className="input-field"
                      placeholder="Votre adresse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Ville</label>
                    <input
                      type="text"
                      required={form.delivery_method === 'delivery'}
                      value={form.delivery_city}
                      onChange={e => setForm({ ...form, delivery_city: e.target.value })}
                      className="input-field"
                      placeholder="Cotonou"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Date & instructions */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Date et instructions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-1">
                    <Calendar className="w-4 h-4" /> Date souhaitée
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.desired_date}
                    onChange={e => setForm({ ...form, desired_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-1">
                    <Clock className="w-4 h-4" /> Heure souhaitée
                  </label>
                  <input
                    type="time"
                    value={form.desired_time}
                    onChange={e => setForm({ ...form, desired_time: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-primary-700 mb-1">Instructions particulières</label>
                  <textarea
                    rows={3}
                    value={form.instructions}
                    onChange={e => setForm({ ...form, instructions: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Ex: inscription sur le gâteau, allergies..."
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Mode de paiement</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-accent-400 bg-accent-50 cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="text-accent-400" />
                  <span className="text-sm font-medium text-primary-900">Paiement à la livraison / retrait</span>
                </label>
                <div className="p-3 rounded-xl border-2 border-cream-200 bg-cream-50 text-sm text-primary-400">
                  Mobile Money et autres méthodes de paiement seront disponibles prochainement
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary-900 truncate">{item.name}</p>
                      <p className="text-xs text-primary-400">{item.quantity} x {formatPrice(item.price, currency)}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary-900">{formatPrice(item.price * item.quantity, currency)}</span>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="border-t border-cream-200 pt-4 mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input
                      type="text"
                      value={form.promo_code}
                      onChange={e => setForm({ ...form, promo_code: e.target.value })}
                      placeholder="Code promo"
                      className="input-field pl-9 text-sm py-2"
                    />
                  </div>
                  <button type="button" onClick={applyPromo} className="btn-ghost text-sm">
                    Appliquer
                  </button>
                </div>
                {promoError && <p className="text-xs text-error-500 mt-1">{promoError}</p>}
                {promoDiscount > 0 && <p className="text-xs text-success-600 mt-1">Réduction appliquée!</p>}
              </div>

              <div className="space-y-2 text-sm border-t border-cream-200 pt-4">
                <div className="flex justify-between text-primary-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-success-600">
                    <span>Réduction</span>
                    <span>-{formatPrice(promoDiscount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-primary-600">
                  <span>Livraison</span>
                  <span>{deliveryTotal > 0 ? formatPrice(deliveryTotal, currency) : 'Gratuit'}</span>
                </div>
                <div className="flex justify-between font-display text-lg font-bold text-primary-900 pt-2 border-t border-cream-200">
                  <span>Total</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              </div>

              {error && <p className="text-sm text-error-500 mt-4">{error}</p>}

              <button type="submit" disabled={placing} className="btn-primary w-full mt-6">
                {placing ? 'Traitement...' : 'Confirmer la commande'}
                {!placing && <Check className="w-5 h-5" />}
              </button>

              {!profile && (
                <p className="text-xs text-error-500 mt-3 text-center">
                  Vous devez être connecté pour passer commande
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CheckoutPage;
