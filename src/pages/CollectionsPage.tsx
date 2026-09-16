import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Collection, Product } from '@/lib/types';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { SectionReveal, StaggerGroup, StaggerItem } from '@/components/Animations';
import { ProductCard } from '@/components/ProductCard';

export function CollectionsPage() {
  const { id } = useParams();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setCollections(data as Collection[] || []);
      setLoading(false);
    }
    loadCollections();
  }, []);

  useEffect(() => {
    async function loadCollectionDetail() {
      if (!id) {
        setSelectedCollection(null);
        setProducts([]);
        return;
      }
      setLoading(true);
      const { data: col } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setSelectedCollection(col as Collection | null);

      const { data: cp } = await supabase
        .from('collection_products')
        .select('product:products(*, category:categories(*), product_images(*))')
        .eq('collection_id', id)
        .order('sort_order');

      const prods = (cp || []).map((c: any) => c.product).filter(Boolean) as Product[];
      setProducts(prods);
      setLoading(false);
    }
    loadCollectionDetail();
  }, [id]);

  if (id) {
    return (
      <div className="min-h-screen bg-cream-50">
        {selectedCollection?.image_url && (
          <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
            <img
              src={selectedCollection.image_url}
              alt={selectedCollection.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 to-primary-900/50" />
            <div className="relative z-10 h-full flex items-end pb-12">
              <div className="container-padding px-4 sm:px-6 lg:px-8">
                <Link to="/collections" className="inline-flex items-center gap-2 text-cream-200 hover:text-accent-300 mb-4 text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Toutes les collections
                </Link>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream-50">{selectedCollection.title}</h1>
                {selectedCollection.description && (
                  <p className="text-cream-200 mt-3 max-w-2xl">{selectedCollection.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="container-padding px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <EmptyState title="Aucun produit" message="Cette collection ne contient pas encore de produits" />
          ) : (
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-primary-900 text-cream-50 py-16">
        <div className="container-padding px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Collections</h1>
          <p className="text-cream-200 text-lg max-w-2xl mx-auto">
            Découvrez nos collections thématiques et saisonnières
          </p>
        </div>
      </div>

      <div className="container-padding px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <LoadingSpinner />
        ) : collections.length === 0 ? (
          <EmptyState title="Aucune collection" message="Aucune collection disponible pour le moment" />
        ) : (
          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map(col => (
              <StaggerItem key={col.id}>
                <Link
                  to={`/collections/${col.id}`}
                  className="block relative rounded-2xl overflow-hidden h-80 group"
                >
                  {col.image_url && (
                    <img
                      src={col.image_url}
                      alt={col.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl font-bold text-cream-50 mb-2">{col.title}</h3>
                    {col.description && (
                      <p className="text-cream-200 text-sm line-clamp-2">{col.description}</p>
                    )}
                    <span className="inline-flex items-center gap-2 text-accent-300 text-sm font-medium mt-3 group-hover:gap-3 transition-all">
                      Découvrir <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </div>
    </div>
  );
}
export default CollectionsPage;
