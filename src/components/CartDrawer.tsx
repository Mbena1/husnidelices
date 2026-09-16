import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm" onClick={closeCart} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-cream-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-700" />
                <h2 className="font-display text-xl font-bold text-primary-900">Mon panier</h2>
              </div>
              <button onClick={closeCart} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-primary-400" />
                </div>
                <p className="text-primary-600 font-medium mb-2">Votre panier est vide</p>
                <p className="text-primary-400 text-sm text-center mb-6">
                  Découvrez nos créations et ajoutez vos favoris
                </p>
                <Link to="/boutique" onClick={closeCart} className="btn-primary">
                  Voir la boutique
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map(item => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 bg-white rounded-xl p-3 border border-cream-200"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-primary-900 truncate">{item.name}</h3>
                        <p className="text-accent-600 font-semibold text-sm mt-1">
                          {formatPrice(item.price, currency)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-cream-200 text-primary-700 hover:bg-cream-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-medium text-sm text-primary-900 w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-cream-200 text-primary-700 hover:bg-cream-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-error-500 hover:bg-error-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-cream-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600">Sous-total</span>
                    <span className="font-display text-xl font-bold text-primary-900">
                      {formatPrice(subtotal, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-primary-400">
                    Frais de livraison calculés à la commande
                  </p>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="btn-primary w-full"
                  >
                    Passer la commande
                  </Link>
                  <button
                    onClick={closeCart}
                    className="btn-ghost w-full"
                  >
                    Continuer mes achats
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
