import { useEffect, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner, EmptyState } from '@/components/States';

export function AccountFavorites() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!profile) return;
      const { data } = await supabase
        .from('favorites')
        .select('product:products(*, category:categories(*), product_images(*))')
        .eq('user_id', profile.id);
      const prods = (data || []).map((f: any) => f.product).filter(Boolean) as Product[];
      setProducts(prods);
      setLoading(false);
    }
    loadFavorites();
  }, [profile]);

  async function removeFavorite(productId: string) {
    if (!profile) return;
    await supabase.from('favorites').delete().eq('user_id', profile.id).eq('product_id', productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  }

  if (loading) return <LoadingSpinner />;

  if (products.length === 0) {
    return (
      <EmptyState
        title="Aucun favori"
        message="Ajoutez des produits à vos favoris en cliquant sur le cœur"
        actionLabel="Voir la boutique"
        actionLink="/boutique"
      />
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary-900 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-error-500" />
        Mes favoris
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="relative group">
            <ProductCard product={p} />
            <button
              onClick={() => removeFavorite(p.id)}
              className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-error-500 hover:bg-error-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
              aria-label="Retirer des favoris"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default AccountFavorites;
