import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { StaggerGroup, StaggerItem } from '@/components/Animations';
import { motion, AnimatePresence } from 'framer-motion';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'featured';
  const filterPromo = searchParams.get('promo') === 'true';
  const filterAvailable = searchParams.get('available') !== 'false';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*), product_images(*)')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
      ]);
      setProducts(productsRes.data as Product[] || []);
      setCategories(categoriesRes.data as Category[] || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category?.slug === selectedCategory);
    }

    if (filterPromo) {
      result = result.filter(p => p.compare_at_price && p.compare_at_price > p.price);
    }

    if (filterAvailable) {
      result = result.filter(p => p.is_available);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy, filterPromo, filterAvailable]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-primary-900 text-cream-50 py-16">
        <div className="container-padding px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Notre Boutique</h1>
          <p className="text-cream-200 text-lg max-w-2xl mx-auto">
            Découvrez l'ensemble de nos créations pâtissières
          </p>
        </div>
      </div>

      <div className="container-padding px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => updateParam('q', e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={e => updateParam('sort', e.target.value)}
              className="px-4 py-3 bg-white border border-cream-300 rounded-xl text-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-400 cursor-pointer"
            >
              <option value="featured">Vedettes d'abord</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-white border border-cream-300 rounded-xl text-primary-700 hover:bg-primary-50 flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="lg:w-64 flex-shrink-0 overflow-hidden"
              >
                <div className="bg-white rounded-2xl p-6 border border-cream-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-semibold text-primary-900">Filtres</h3>
                    <button onClick={() => setShowFilters(false)} className="p-1 text-primary-400 hover:text-primary-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-primary-700 mb-3">Catégories</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => updateParam('category', '')}
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            !selectedCategory ? 'bg-primary-800 text-cream-50' : 'text-primary-600 hover:bg-primary-50'
                          }`}
                        >
                          Toutes
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => updateParam('category', cat.slug)}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedCategory === cat.slug ? 'bg-primary-800 text-cream-50' : 'text-primary-600 hover:bg-primary-50'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-primary-700 mb-3">Disponibilité</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterAvailable}
                          onChange={e => updateParam('available', e.target.checked ? '' : 'false')}
                          className="w-4 h-4 rounded text-accent-400 focus:ring-accent-400"
                        />
                        <span className="text-sm text-primary-600">Disponible uniquement</span>
                      </label>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-primary-700 mb-3">Promotions</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterPromo}
                          onChange={e => updateParam('promo', e.target.checked ? 'true' : '')}
                          className="w-4 h-4 rounded text-accent-400 focus:ring-accent-400"
                        />
                        <span className="text-sm text-primary-600">En promotion</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            <p className="text-sm text-primary-500 mb-6">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            </p>

            {loading ? (
              <LoadingSpinner />
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                title="Aucun produit trouvé"
                message="Essayez de modifier vos critères de recherche ou de filtrage"
                actionLabel="Voir tous les produits"
                actionLink="/boutique"
              />
            ) : (
              <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <StaggerItem key={product.id}>
                    <ProductCard product={product} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default ShopPage;
