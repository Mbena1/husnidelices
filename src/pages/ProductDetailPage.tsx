import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, ShoppingCart, Minus, Plus, Calendar, Clock,
  Check, ChevronLeft, ChevronRight, Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ProductCard } from '@/components/ProductCard';
import { SectionReveal } from '@/components/Animations';

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { addItem } = useCart();
  const { profile } = useAuth();
  const currency = settings?.currency || 'FCFA';

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [desiredDate, setDesiredDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setSelectedImage(0);
      setQuantity(1);
      setAdded(false);

      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), product_images(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      setProduct(data as Product | null);

      if (data) {
        // Load related products from same category
        if (data.category_id) {
          const { data: related } = await supabase
            .from('products')
            .select('*, category:categories(*), product_images(*)')
            .eq('category_id', data.category_id)
            .eq('is_active', true)
            .neq('id', data.id)
            .limit(4);
          setRelatedProducts(related as Product[] || []);
        }

        // Check favorite
        if (profile) {
          const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', profile.id)
            .eq('product_id', data.id)
            .maybeSingle();
          setIsFavorite(!!fav);
        }
      }
      setLoading(false);
    }
    loadProduct();
  }, [slug, profile]);

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.product_images?.[0]?.url || null,
      prepTimeHours: product.prep_time_hours,
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  async function toggleFavorite() {
    if (!profile || !product) return;
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', profile.id).eq('product_id', product.id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ user_id: profile.id, product_id: product.id });
      setIsFavorite(true);
    }
  }

  if (loading) return <LoadingSpinner size="lg" />;

  if (!product) {
    return (
      <EmptyState
        title="Produit introuvable"
        message="Ce produit n'existe pas ou n'est plus disponible"
        actionLabel="Voir la boutique"
        actionLink="/boutique"
      />
    );
  }

  const images = product.product_images || [];
  const hasPromo = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + Math.ceil(product.prep_time_hours / 24));
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container-padding px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-cream-100 mb-4"
            >
              {images[selectedImage] && (
                <img
                  src={images[selectedImage].url}
                  alt={images[selectedImage].alt || product.name}
                  className="w-full h-full object-cover"
                />
              )}
              {hasPromo && (
                <div className="absolute top-4 left-4 badge bg-error-500 text-white text-sm">
                  <Tag className="w-3 h-3" />
                  -{discountPercent}%
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-primary-800 hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-primary-800 hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-accent-400' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.category && (
              <Link
                to={`/boutique?category=${product.category.slug}`}
                className="text-accent-600 text-sm font-medium uppercase tracking-wider hover:text-accent-700"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-900 mt-2 mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-3xl font-bold text-primary-900">
                {formatPrice(product.price, currency)}
              </span>
              {hasPromo && (
                <span className="text-lg text-primary-400 line-through">
                  {formatPrice(product.compare_at_price!, currency)}
                </span>
              )}
            </div>

            <p className="text-primary-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Info badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className={`badge ${product.is_available ? 'bg-success-500/10 text-success-600' : 'bg-error-500/10 text-error-500'}`}>
                {product.is_available ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {product.is_available ? 'Disponible' : 'Indisponible'}
              </div>
              <div className="badge bg-cream-200 text-primary-700">
                <Clock className="w-3 h-3" />
                Préparation: {product.prep_time_hours}h
              </div>
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-accent-50 text-accent-700">#{tag}</span>
              ))}
            </div>

            {/* Order controls */}
            <div className="bg-white rounded-2xl p-6 border border-cream-200 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-cream-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-primary-700 hover:bg-cream-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold text-primary-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-2 text-primary-700 hover:bg-cream-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {profile && (
                  <button
                    onClick={toggleFavorite}
                    className="flex items-center gap-2 text-primary-600 hover:text-error-500 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-error-500 text-error-500' : ''}`} />
                    <span className="text-sm">{isFavorite ? 'En favoris' : 'Ajouter aux favoris'}</span>
                  </button>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Date souhaitée
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={desiredDate}
                  onChange={e => setDesiredDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-700 mb-2 block">
                  Instructions particulières
                </label>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  rows={2}
                  placeholder="Ex: inscrire 'Joyeux Anniversaire' sur le gâteau..."
                  className="input-field resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.is_available}
                  className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Ajouté au panier
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Ajouter au panier
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <WhatsAppButton
                  message={`Bonjour, je suis intéressé(e) par "${product.name}" (${formatPrice(product.price, currency)}). ${desiredDate ? `Date souhaitée: ${desiredDate}.` : ''}`}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <SectionReveal className="mt-20">
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-8 text-center">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </SectionReveal>
        )}
      </div>
    </div>
  );
}
export default ProductDetailPage;
