import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Tag } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { settings } = useSettings();
  const { addItem } = useCart();
  const { profile } = useAuth();
  const currency = settings?.currency || 'FCFA';
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const primaryImage = product.product_images?.[0]?.url;
  const hasPromo = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  async function toggleFavorite() {
    if (!profile) return;
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', profile.id).eq('product_id', product.id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ user_id: profile.id, product_id: product.id });
      setIsFavorite(true);
    }
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: primaryImage || null,
      prepTimeHours: product.prep_time_hours,
    });
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="card card-hover overflow-hidden group"
    >
      <Link to={`/produit/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100 bg-[length:200%_100%] animate-shimmer" />
          )}
          {primaryImage && (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {hasPromo && (
            <div className="absolute top-3 left-3 badge bg-error-500 text-white">
              <Tag className="w-3 h-3" />
              -{discountPercent}%
            </div>
          )}

          {product.is_featured && (
            <div className="absolute top-3 right-3 badge bg-accent-400 text-primary-900">
              Vedette
            </div>
          )}

          {!product.is_available && (
            <div className="absolute inset-0 bg-primary-900/50 flex items-center justify-center">
              <span className="badge bg-cream-50 text-primary-800 text-sm">Indisponible</span>
            </div>
          )}

          {profile && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(); }}
              className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-primary-600 hover:text-error-500 transition-colors"
              aria-label="Ajouter aux favoris"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-error-500 text-error-500' : ''}`} />
            </button>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-primary-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-primary-500 line-clamp-2 mb-3 min-h-[2.5rem]">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-primary-900">
                {formatPrice(product.price, currency)}
              </span>
              {hasPromo && (
                <span className="text-sm text-primary-400 line-through">
                  {formatPrice(product.compare_at_price!, currency)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.is_available}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-800 text-cream-50 hover:bg-accent-400 hover:text-primary-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 active:scale-90"
              aria-label="Ajouter au panier"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
