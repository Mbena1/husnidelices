import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Cake, Sparkles, Award, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type {
  Product,
  Banner,
  Collection,
  GalleryItem,
} from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import {
  SectionReveal,
  StaggerGroup,
  StaggerItem,
} from '@/components/Animations';
import { LoadingSpinner } from '@/components/States';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';

export function HomePage() {
  const { settings } = useSettings();
  const { theme } = useTheme();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollY } = useScroll();

  const heroY = useTransform(scrollY, [0, 400], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          productsRes,
          bannersRes,
          collectionsRes,
          galleryRes,
        ] = await Promise.all([
          supabase
            .from('products')
            .select(
              '*, category:categories(*), product_images(*)'
            )
            .eq('is_featured', true)
            .eq('is_active', true)
            .order('sort_order')
            .limit(8),

          supabase
            .from('banners')
            .select('*')
            .eq('is_active', true)
            .order('sort_order')
            .limit(3),

          supabase
            .from('collections')
            .select('*')
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('sort_order')
            .limit(3),

          supabase
            .from('gallery')
            .select('*')
            .eq('is_active', true)
            .order('sort_order')
            .limit(6),
        ]);

        setFeaturedProducts(
          (productsRes.data as Product[]) || []
        );

        setBanners(
          (bannersRes.data as Banner[]) || []
        );

        setCollections(
          (collectionsRes.data as Collection[]) || []
        );

        setGalleryItems(
          (galleryRes.data as GalleryItem[]) || []
        );
      } catch (error) {
        console.error(
          'Erreur lors du chargement de la page d’accueil :',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /*
   * =========================================================
   * DONNÉES DU THÈME ACTIF
   * =========================================================
   */

  const heroTitle =
    theme?.hero_title ||
    settings?.hero_title ||
    "L'art de créer des moments inoubliables";

  const heroSubtitle =
    theme?.hero_subtitle ||
    settings?.hero_subtitle ||
    "Pâtisserie artisanale d'exception au Bénin";

  const heroImage =
    theme?.hero_image ||
    'https://images.pexels.com/photos/1682474/pexels-photo-1682474.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920';

  const bakeryName =
    settings?.bakery_name || 'Délices Dorés';

  const city =
    settings?.city || 'Cotonou';

  /*
   * =========================================================
   * COULEURS DYNAMIQUES
   * =========================================================
   *
   * Ces variables viennent directement du thème actif.
   * Cela permet aux thèmes Supabase de fonctionner aussi
   * sur les dégradés et les overlays.
   */

  const primaryColor =
    'var(--theme-primary, #3D2817)';

  const secondaryColor =
    'var(--theme-secondary, #C8A96A)';

  const accentColor =
    'var(--theme-accent, #D4AF37)';

  const textColor =
    'var(--theme-text, #2A1F14)';

  const backgroundColor =
    'var(--theme-background, #FAF6F0)';

  const buttonColor =
    'var(--theme-button, #3D2817)';

  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 z-0"
        >
          <img
            src={heroImage}
            alt="Pâtisserie d'exception"
            className="w-full h-full object-cover"
          />

          {/* Overlay dynamique du thème */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(
                to bottom,
                color-mix(in srgb, ${primaryColor} 70%, transparent),
                color-mix(in srgb, ${primaryColor} 40%, transparent),
                color-mix(in srgb, ${primaryColor} 80%, transparent)
              )`,
            }}
          />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full glass text-sm font-medium"
            style={{ color: accentColor }}
          >
            <Sparkles className="w-4 h-4" />

            {bakeryName} — {city}, Bénin
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.3,
            }}
            className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-balance"
            style={{
              color: '#FFFDF8',
            }}
          >
            {heroTitle}
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.5,
            }}
            className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto"
            style={{
              color: '#F8F1E7',
            }}
          >
            {heroSubtitle}
          </motion.p>

          {/* Boutons */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.7,
            }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/boutique"
              className="btn-accent text-base px-8 py-4"
            >
              Découvrir nos créations

              <ArrowRight className="w-5 h-5" />
            </Link>

            <WhatsAppButton
              message={`Bonjour, je souhaite commander une création chez ${bakeryName}.`}
              className="text-base px-8 py-4 glass"
              style={{
                color: '#FFFDF8',
              }}
            />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div
            className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5"
            style={{
              borderColor:
                'rgba(255,255,255,0.30)',
            }}
          >
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  'rgba(255,255,255,0.60)',
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          FEATURES BAR
          ===================================================== */}

      <section
        className="py-6"
        style={{
          backgroundColor: primaryColor,
          color: backgroundColor,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Award,
              title: 'Qualité artisanale',
              desc: 'Fait main avec passion',
            },
            {
              icon: Cake,
              title: 'Créations sur mesure',
              desc: 'Selon vos envies',
            },
            {
              icon: Heart,
              title: 'Au cœur du Bénin',
              desc: 'Cotonou & environs',
            },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: i * 0.1,
              }}
              className="flex items-center gap-4 justify-center sm:justify-start"
            >
              <feat.icon
                className="w-8 h-8 flex-shrink-0"
                style={{
                  color: accentColor,
                }}
              />

              <div>
                <p
                  className="font-semibold"
                  style={{
                    color: '#FFFDF8',
                  }}
                >
                  {feat.title}
                </p>

                <p
                  className="text-sm"
                  style={{
                    color: '#F0E6D8',
                  }}
                >
                  {feat.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =====================================================
          BANNERS
          ===================================================== */}

      {banners.length > 0 && (
        <section className="section-padding">
          <div className="container-padding">
            <StaggerGroup className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <StaggerItem key={banner.id}>
                  <div className="relative rounded-2xl overflow-hidden h-64 group">
                    {banner.image_url && (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}

                    {/* Overlay dynamique */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(
                          to right,
                          color-mix(in srgb, ${primaryColor} 80%, transparent),
                          color-mix(in srgb, ${primaryColor} 20%, transparent)
                        )`,
                      }}
                    />

                    <div className="relative z-10 h-full flex flex-col justify-center p-8">
                      <h3
                        className="font-display text-2xl font-bold mb-2"
                        style={{
                          color: '#FFFDF8',
                        }}
                      >
                        {banner.title}
                      </h3>

                      {banner.text && (
                        <p
                          className="mb-4 max-w-md"
                          style={{
                            color: '#F8F1E7',
                          }}
                        >
                          {banner.text}
                        </p>
                      )}

                      {banner.button_label &&
                        banner.button_link && (
                          <Link
                            to={banner.button_link}
                            className="inline-flex items-center gap-2 font-medium hover:opacity-80 transition-opacity"
                            style={{
                              color: accentColor,
                            }}
                          >
                            {banner.button_label}

                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* =====================================================
          PRODUITS VEDETTES
          ===================================================== */}

      <section
        className="section-padding"
        style={{
          backgroundColor,
        }}
      >
        <div className="container-padding">
          <SectionReveal className="text-center mb-12">
            <p
              className="font-medium uppercase tracking-wider text-sm mb-2"
              style={{
                color: accentColor,
              }}
            >
              Nos vedettes
            </p>

            <h2
              className="font-display text-3xl sm:text-4xl font-bold"
              style={{
                color: primaryColor,
              }}
            >
              Créations d'exception
            </h2>

            <p
              className="mt-4 max-w-2xl mx-auto"
              style={{
                color: primaryColor,
                opacity: 0.75,
              }}
            >
              Découvrez une sélection de nos pâtisseries les plus appréciées
            </p>
          </SectionReveal>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}

          <div className="text-center mt-12">
            <Link
              to="/boutique"
              className="btn-outline"
            >
              Voir toute la boutique

              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTIONS
          ===================================================== */}

      {collections.length > 0 && (
        <section className="section-padding">
          <div className="container-padding">
            <SectionReveal className="text-center mb-12">
              <p
                className="font-medium uppercase tracking-wider text-sm mb-2"
                style={{
                  color: accentColor,
                }}
              >
                Collections
              </p>

              <h2
                className="font-display text-3xl sm:text-4xl font-bold"
                style={{
                  color: primaryColor,
                }}
              >
                Nos collections saisonnières
              </h2>
            </SectionReveal>

            <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((col) => (
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

                    {/* Overlay dynamique */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(
                          to top,
                          color-mix(in srgb, ${primaryColor} 90%, transparent),
                          color-mix(in srgb, ${primaryColor} 30%, transparent),
                          transparent
                        )`,
                      }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3
                        className="font-display text-2xl font-bold mb-2"
                        style={{
                          color: '#FFFDF8',
                        }}
                      >
                        {col.title}
                      </h3>

                      {col.description && (
                        <p
                          className="text-sm line-clamp-2"
                          style={{
                            color: '#F8F1E7',
                          }}
                        >
                          {col.description}
                        </p>
                      )}

                      <span
                        className="inline-flex items-center gap-2 text-sm font-medium mt-3 group-hover:gap-3 transition-all"
                        style={{
                          color: accentColor,
                        }}
                      >
                        Découvrir

                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* =====================================================
          COMMANDE PERSONNALISÉE
          ===================================================== */}

      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              135deg,
              ${primaryColor},
              color-mix(in srgb, ${primaryColor} 80%, white)
            )`,
          }}
        />

        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl"
            style={{
              backgroundColor: accentColor,
            }}
          />

          <div
            className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl"
            style={{
              backgroundColor: secondaryColor,
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <SectionReveal>
            <Sparkles
              className="w-12 h-12 mx-auto mb-6"
              style={{
                color: accentColor,
              }}
            />

            <h2
              className="font-display text-3xl sm:text-5xl font-bold mb-6 text-balance"
              style={{
                color: '#FFFDF8',
              }}
            >
              Une création unique pour votre événement ?
            </h2>

            <p
              className="text-lg mb-8 max-w-2xl mx-auto"
              style={{
                color: '#F8F1E7',
              }}
            >
              Mariage, anniversaire, baptême ou événement professionnel —
              décrivez votre vision et nous la transformerons en une pièce
              d'exception.
            </p>

            <Link
              to="/commande-personnalisee"
              className="btn-accent text-base px-8 py-4"
            >
              <Cake className="w-5 h-5" />

              Créer ma commande personnalisée
            </Link>
          </SectionReveal>
        </div>
      </section>

      {/* =====================================================
          GALERIE
          ===================================================== */}

      {galleryItems.length > 0 && (
        <section
          className="section-padding"
          style={{
            backgroundColor,
          }}
        >
          <div className="container-padding">
            <SectionReveal className="text-center mb-12">
              <p
                className="font-medium uppercase tracking-wider text-sm mb-2"
                style={{
                  color: accentColor,
                }}
              >
                Galerie
              </p>

              <h2
                className="font-display text-3xl sm:text-4xl font-bold"
                style={{
                  color: primaryColor,
                }}
              >
                Nos dernières réalisations
              </h2>
            </SectionReveal>

            <div className="columns-2 md:columns-3 lg:columns-3 gap-4 space-y-4">
              {galleryItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: i * 0.05,
                    duration: 0.4,
                  }}
                  className="break-inside-avoid relative rounded-xl overflow-hidden group cursor-pointer"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay dynamique galerie */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                    style={{
                      background: `linear-gradient(
                        to top,
                        color-mix(in srgb, ${primaryColor} 80%, transparent),
                        transparent
                      )`,
                    }}
                  >
                    <div>
                      <h3
                        className="font-display text-lg font-semibold"
                        style={{
                          color: '#FFFDF8',
                        }}
                      >
                        {item.title}
                      </h3>

                      {item.description && (
                        <p
                          className="text-sm line-clamp-2"
                          style={{
                            color: '#F8F1E7',
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/galerie"
                className="btn-outline"
                style={{
                  borderColor: buttonColor,
                  color: buttonColor,
                }}
              >
                Voir toute la galerie

                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;