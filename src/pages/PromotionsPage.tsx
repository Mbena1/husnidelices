import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Promotion, Product } from '@/lib/types';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { SectionReveal, StaggerGroup, StaggerItem } from '@/components/Animations';
import { ProductCard } from '@/components/ProductCard';
import { formatPrice } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

export function PromotionsPage() {
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [promoRes, productsRes] = await Promise.all([
        supabase.from('promotions').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('*, category:categories(*), product_images(*)')
          .eq('is_active', true)
          .not('compare_at_price', 'is', null)
          .order('sort_order'),
      ]);
      setPromotions(promoRes.data as Promotion[] || []);
      setPromoProducts(productsRes.data as Product[] || []);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-gradient-to-r from-error-500 to-accent-600 text-cream-50 py-16">
        <div className="container-padding px-4 sm:px-6 lg:px-8 text-center">
          <Tag className="w-12 h-12 mx-auto mb-4" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Promotions</h1>
          <p className="text-cream-100 text-lg max-w-2xl mx-auto">
            Profitez de nos offres spéciales du moment
          </p>
        </div>
      </div>

      <div className="container-padding px-4 sm:px-6 lg:px-8 py-12">
        {/* Active Promotions */}
        {promotions.length > 0 && (
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {promotions.map(promo => (
              <StaggerItem key={promo.id}>
                <div className="relative rounded-2xl overflow-hidden h-56 group">
                  {promo.banner_image && (
                    <img
                      src={promo.banner_image}
                      alt={promo.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-900/40" />
                  <div className="relative z-10 h-full flex flex-col justify-center p-8">
                    <div className="badge bg-accent-400 text-primary-900 mb-3 w-fit">
                      {promo.discount_type === 'percentage'
                        ? `-${promo.discount_value}%`
                        : `-${formatPrice(promo.discount_value, currency)}`}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-cream-50 mb-2">{promo.title}</h3>
                    {promo.description && <p className="text-cream-200 text-sm">{promo.description}</p>}
                    {promo.end_date && (
                      <p className="text-cream-300 text-xs mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Jusqu'au {new Date(promo.end_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        {/* Products on sale */}
        <SectionReveal className="mb-8">
          <h2 className="font-display text-2xl font-bold text-primary-900">
            Produits en promotion
          </h2>
        </SectionReveal>

        {loading ? (
          <LoadingSpinner />
        ) : promoProducts.length === 0 ? (
          <EmptyState
            title="Aucune promotion actuellement"
            message="Revenez bientôt pour profiter de nos prochaines offres"
            actionLabel="Voir la boutique"
            actionLink="/boutique"
          />
        ) : (
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {promoProducts.map(product => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        <div className="text-center mt-12">
          <Link to="/boutique" className="btn-outline">
            Voir tous les produits
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
export default PromotionsPage;
