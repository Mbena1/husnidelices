import { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  X,
  Save,
  Check,
  ImagePlus,
  Upload,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { formatPrice, slugify } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import type { Product, Category } from '@/lib/types';
import { motion } from 'framer-motion';

const STORAGE_BUCKET = 'product-images';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

function AdminProducts() {
  const { settings } = useSettings();
  const currency = settings?.currency || 'FCFA';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select(
        '*, category:categories(*), product_images(*)'
      )
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error(
        'Erreur chargement produits :',
        error
      );
    }

    setProducts(
      (data as Product[]) || []
    );

    const { data: cats, error: categoriesError } =
      await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

    if (categoriesError) {
      console.error(
        'Erreur chargement catégories :',
        categoriesError
      );
    }

    setCategories(
      (cats as Category[]) || []
    );

    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit ?')) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        'Erreur suppression produit :',
        error
      );

      alert(
        'Impossible de supprimer le produit.'
      );

      return;
    }

    loadProducts();
  }

  async function toggleFeatured(product: Product) {
    const { error } = await supabase
      .from('products')
      .update({
        is_featured: !product.is_featured,
      })
      .eq('id', product.id);

    if (error) {
      console.error(error);
      return;
    }

    loadProducts();
  }

  async function toggleActive(product: Product) {
    const { error } = await supabase
      .from('products')
      .update({
        is_active: !product.is_active,
      })
      .eq('id', product.id);

    if (error) {
      console.error(error);
      return;
    }

    loadProducts();
  }

  return (
    <div>
      <AdminPageHeader
        title="Produits"
        action={
          <button
            onClick={() => setCreating(true)}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState
          title="Aucun produit"
          message="Ajoutez votre premier produit"
          actionLabel="Ajouter"
          actionLink="#"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-cream-200 overflow-hidden"
            >
              <div className="relative aspect-video bg-cream-100">
                {product.product_images?.[0] ? (
                  <img
                    src={
                      product.product_images[0].url
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-300">
                    <ImagePlus className="w-10 h-10" />
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-1">
                  {product.is_featured && (
                    <span className="badge bg-accent-400 text-primary-900">
                      <Star className="w-3 h-3 fill-current" />
                      Vedette
                    </span>
                  )}

                  {!product.is_active && (
                    <span className="badge bg-error-500 text-white">
                      Inactif
                    </span>
                  )}

                  {!product.is_available && (
                    <span className="badge bg-amber-100 text-amber-700">
                      Indispo
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <p className="text-xs text-primary-400 mb-1">
                  {product.category?.name ||
                    'Sans catégorie'}
                </p>

                <h3 className="font-medium text-primary-900 text-sm mb-1">
                  {product.name}
                </h3>

                <p className="font-display text-lg font-bold text-primary-900">
                  {formatPrice(
                    product.price,
                    currency
                  )}
                </p>

                {product.compare_at_price && (
                  <p className="text-xs text-primary-400 line-through">
                    {formatPrice(
                      product.compare_at_price,
                      currency
                    )}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-cream-100">
                  <button
                    onClick={() =>
                      setEditing(product)
                    }
                    className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      toggleFeatured(product)
                    }
                    className="p-1.5 rounded-lg hover:bg-cream-50"
                    title="Vedette"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        product.is_featured
                          ? 'fill-accent-400 text-accent-400'
                          : 'text-primary-400'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() =>
                      toggleActive(product)
                    }
                    className={`p-1.5 rounded-lg ${
                      product.is_active
                        ? 'text-success-500'
                        : 'text-primary-400'
                    } hover:bg-cream-50`}
                    title="Actif/Inactif"
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      deleteProduct(product.id)
                    }
                    className="p-1.5 rounded-lg text-error-500 hover:bg-error-500/10 ml-auto"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compare_at_price:
      product?.compare_at_price?.toString() || '',
    category_id:
      product?.category_id ||
      categories[0]?.id ||
      '',
    prep_time_hours:
      product?.prep_time_hours?.toString() ||
      '24',
    is_available:
      product?.is_available ?? true,
    is_featured:
      product?.is_featured ?? false,
    is_active:
      product?.is_active ?? true,
    stock:
      product?.stock?.toString() || '',
  });

  const [images, setImages] = useState<string[]>(
    product?.product_images?.map(
      (image) => image.url
    ) || []
  );

  const [newFiles, setNewFiles] = useState<File[]>(
    []
  );

  const [previews, setPreviews] = useState<string[]>(
    []
  );

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState('');

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      previews.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [previews]);

  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files || []
    );

    if (files.length === 0) {
      return;
    }

    setErrorMessage('');

    const validFiles: File[] = [];

    for (const file of files) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        setErrorMessage(
          'Format non accepté. Utilisez JPG, PNG ou WebP.'
        );
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setErrorMessage(
          `L'image "${file.name}" dépasse 5 Mo.`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    const newPreviewUrls =
      validFiles.map((file) =>
        URL.createObjectURL(file)
      );

    setNewFiles((prev) => [
      ...prev,
      ...validFiles,
    ]);

    setPreviews((prev) => [
      ...prev,
      ...newPreviewUrls,
    ]);

    event.target.value = '';
  }

  function removeExistingImage(index: number) {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  function removeNewImage(index: number) {
    const preview = previews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setNewFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setPreviews((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  async function uploadImages(
    productId: string
  ): Promise<string[]> {
    const uploadedUrls: string[] = [];

    if (newFiles.length === 0) {
      return uploadedUrls;
    }

    for (
      let i = 0;
      i < newFiles.length;
      i++
    ) {
      const file = newFiles[i];

      const extension =
        file.name.split('.').pop()?.toLowerCase() ||
        'jpg';

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `products/${productId}/${fileName}`;

      const { error: uploadError } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        console.error(
          'Erreur upload image :',
          uploadError
        );

        throw new Error(
          `Impossible d'envoyer l'image "${file.name}".`
        );
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          'Impossible de récupérer l’URL de l’image.'
        );
      }

      uploadedUrls.push(
        publicUrlData.publicUrl
      );

      setUploadProgress(
        Math.round(
          ((i + 1) / newFiles.length) * 100
        )
      );
    }

    return uploadedUrls;
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setErrorMessage(
        'Veuillez renseigner le nom du produit.'
      );
      return;
    }

    if (!form.price) {
      setErrorMessage(
        'Veuillez renseigner le prix du produit.'
      );
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setUploadProgress(0);

    try {
      let productId = product?.id;

      const slug = product
        ? product.slug
        : slugify(form.name) +
          '-' +
          Date.now().toString(36);

      const productData = {
        name: form.name,
        slug,
        description: form.description,
        price: parseInt(form.price) || 0,
        compare_at_price:
          form.compare_at_price
            ? parseInt(form.compare_at_price)
            : null,
        category_id:
          form.category_id || null,
        prep_time_hours:
          parseInt(form.prep_time_hours) || 24,
        is_available:
          form.is_available,
        is_featured:
          form.is_featured,
        is_active:
          form.is_active,
        stock: form.stock
          ? parseInt(form.stock)
          : null,
      };

      /*
       * 1. Création ou modification du produit
       */
      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) {
          throw error;
        }
      } else {
        const { data, error } =
          await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) {
          throw error;
        }

        productId = data?.id;
      }

      if (!productId) {
        throw new Error(
          'Impossible de récupérer l’identifiant du produit.'
        );
      }

      /*
       * 2. Upload des nouvelles images
       */
      const uploadedUrls =
        await uploadImages(productId);

      /*
       * 3. Toutes les images finales
       *
       * Images existantes conservées
       * +
       * nouvelles images uploadées
       */
      const finalImages = [
        ...images,
        ...uploadedUrls,
      ];

      /*
       * 4. Mise à jour de product_images
       */
      await supabase
        .from('product_images')
        .delete()
        .eq(
          'product_id',
          productId
        );

      if (finalImages.length > 0) {
        const imageRows =
          finalImages.map(
            (url, index) => ({
              product_id:
                productId,
              url,
              sort_order:
                index,
            })
          );

        const {
          error: imagesError,
        } = await supabase
          .from('product_images')
          .insert(imageRows);

        if (imagesError) {
          throw imagesError;
        }
      }

      /*
       * 5. Nettoyage
       */
      setNewFiles([]);
      setPreviews([]);

      setSaving(false);

      onSaved();
    } catch (error) {
      console.error(
        'Erreur enregistrement produit :',
        error
      );

      setSaving(false);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de l’enregistrement.'
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{
          scale: 0.9,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between p-6 border-b border-cream-200 sticky top-0 bg-white z-10">
          <h2 className="font-display text-xl font-bold text-primary-900">
            {product
              ? 'Modifier'
              : 'Ajouter'}{' '}
            un produit
          </h2>

          <button
            onClick={onClose}
            className="p-2 text-primary-400 hover:text-primary-800 rounded-lg hover:bg-cream-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Nom
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              className="input-field"
              placeholder="Ex : Gâteau chocolat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Description
            </label>

            <textarea
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              className="input-field resize-none"
              placeholder="Décrivez votre produit..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Prix (FCFA)
              </label>

              <input
                type="number"
                value={form.price}
                onChange={(event) =>
                  setForm({
                    ...form,
                    price:
                      event.target.value,
                  })
                }
                className="input-field"
                placeholder="15000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Ancien prix
              </label>

              <input
                type="number"
                value={
                  form.compare_at_price
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    compare_at_price:
                      event.target.value,
                  })
                }
                className="input-field"
                placeholder="18000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Catégorie
              </label>

              <select
                value={
                  form.category_id
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    category_id:
                      event.target.value,
                  })
                }
                className="input-field"
              >
                <option value="">
                  Sans catégorie
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Préparation (heures)
              </label>

              <input
                type="number"
                value={
                  form.prep_time_hours
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    prep_time_hours:
                      event.target.value,
                  })
                }
                className="input-field"
              />
            </div>
          </div>

          {/* =====================================================
              IMAGES
              ===================================================== */}

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Images du produit
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={saving}
              className="w-full border-2 border-dashed border-cream-300 hover:border-accent-400 rounded-2xl p-6 transition-all duration-200 hover:bg-cream-50 group"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-accent-50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ImagePlus className="w-6 h-6 text-accent-500" />
                </div>

                <p className="font-medium text-primary-800">
                  Ajouter des images
                </p>

                <p className="text-xs text-primary-400 mt-1">
                  JPG, PNG ou WebP · 5 Mo maximum
                </p>
              </div>
            </button>

            {(images.length > 0 ||
              previews.length > 0) && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map(
                  (url, index) => (
                    <div
                      key={`existing-${index}`}
                      className="relative aspect-square rounded-xl overflow-hidden bg-cream-100 group"
                    >
                      <img
                        src={url}
                        alt={`Image ${
                          index + 1
                        }`}
                        className="w-full h-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-primary-900/80 text-white text-[10px] px-2 py-1 rounded-full">
                          Principale
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingImage(
                            index
                          )
                        }
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 text-error-500 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-500 hover:text-white"
                        title="Retirer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}

                {previews.map(
                  (url, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative aspect-square rounded-xl overflow-hidden bg-cream-100 group ring-2 ring-accent-400"
                    >
                      <img
                        src={url}
                        alt={`Nouvelle image ${
                          index + 1
                        }`}
                        className="w-full h-full object-cover"
                      />

                      <span className="absolute bottom-2 left-2 bg-accent-500 text-white text-[10px] px-2 py-1 rounded-full">
                        Nouvelle
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeNewImage(
                            index
                          )
                        }
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 text-error-500 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-500 hover:text-white"
                        title="Retirer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="aspect-square rounded-xl border-2 border-dashed border-cream-300 hover:border-accent-400 flex flex-col items-center justify-center text-primary-400 hover:text-accent-500 transition-colors"
                >
                  <Plus className="w-6 h-6" />

                  <span className="text-xs mt-1">
                    Ajouter
                  </span>
                </button>
              </div>
            )}

            {images.length === 0 &&
              previews.length === 0 && (
                <p className="text-xs text-primary-400 mt-2 text-center">
                  La première image sera utilisée
                  comme image principale.
                </p>
              )}
          </div>

          {/* =====================================================
              OPTIONS
              ===================================================== */}

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={
                  form.is_available
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    is_available:
                      event.target.checked,
                  })
                }
                className="rounded text-accent-400"
              />

              <span className="text-primary-700">
                Disponible
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={
                  form.is_featured
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    is_featured:
                      event.target.checked,
                  })
                }
                className="rounded text-accent-400"
              />

              <span className="text-primary-700">
                Vedette
              </span>
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={
                  form.is_active
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    is_active:
                      event.target.checked,
                  })
                }
                className="rounded text-accent-400"
              />

              <span className="text-primary-700">
                Actif
              </span>
            </label>
          </div>

          {/* =====================================================
              SAVE
              ===================================================== */}

          <button
            onClick={handleSave}
            disabled={
              saving ||
              !form.name ||
              !form.price
            }
            className="btn-primary w-full"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                {newFiles.length > 0
                  ? `Upload ${uploadProgress}%`
                  : 'Enregistrement...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />

                Enregistrer
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AdminProducts;