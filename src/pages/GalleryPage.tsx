import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { GalleryItem } from '@/lib/types';
import { GALLERY_CATEGORIES } from '@/lib/utils';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { SectionReveal } from '@/components/Animations';

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadGallery() {
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      setItems(data as GalleryItem[] || []);
      setLoading(false);
    }
    loadGallery();
  }, []);

  const filtered = selectedCategory
    ? items.filter(i => i.category === selectedCategory)
    : items;

  function navigateLightbox(dir: number) {
    if (lightboxIndex === null) return;
    const next = (lightboxIndex + dir + filtered.length) % filtered.length;
    setLightboxIndex(next);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-primary-900 text-cream-50 py-16">
        <div className="container-padding px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Galerie</h1>
          <p className="text-cream-200 text-lg max-w-2xl mx-auto">
            Découvrez nos plus belles réalisations
          </p>
        </div>
      </div>

      <div className="container-padding px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedCategory ? 'bg-primary-800 text-cream-50' : 'bg-white text-primary-600 hover:bg-primary-50 border border-cream-300'
            }`}
          >
            Tout
          </button>
          {GALLERY_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.value ? 'bg-primary-800 text-cream-50' : 'bg-white text-primary-600 hover:bg-primary-50 border border-cream-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Aucune réalisation"
            message="Aucune photo dans cette catégorie pour le moment"
          />
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid relative rounded-xl overflow-hidden group cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-cream-50">{item.title}</h3>
                    {item.description && (
                      <p className="text-cream-200 text-sm line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filtered[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary-900/95 flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-6 right-6 text-cream-50 hover:text-accent-300"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <button
              className="absolute left-4 text-cream-50 hover:text-accent-300"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <motion.img
              key={filtered[lightboxIndex].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={filtered[lightboxIndex].image_url}
              alt={filtered[lightboxIndex].title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 text-cream-50 hover:text-accent-300"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            >
              <ChevronRight className="w-10 h-10" />
            </button>
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <h3 className="font-display text-xl text-cream-50">{filtered[lightboxIndex].title}</h3>
              {filtered[lightboxIndex].description && (
                <p className="text-cream-300 text-sm mt-1">{filtered[lightboxIndex].description}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default GalleryPage;
