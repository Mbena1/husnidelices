import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Star, X, Save, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import { formatPrice, slugify } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import type { Product, Category } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .order('created_at', { ascending: false });
    setProducts(data as Product[] || []);
    const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(cats as Category[] || []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  async function deleteProduct(id: string) {
    if (!confirm('Supprimer ce produit?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  }

  async function toggleFeatured(product: Product) {
    await supabase.from('products').update({ is_featured: !product.is_featured }).eq('id', product.id);
    loadProducts();
  }

  async function toggleActive(product: Product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    loadProducts();
  }

  return (
    <div>
      <AdminPageHeader
        title="Produits"
        action={
          <button onClick={() => setCreating(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <EmptyState title="Aucun produit" message="Ajoutez votre premier produit" actionLabel="Ajouter" actionLink="#" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
              <div className="relative aspect-video bg-cream-100">
                {product.product_images?.[0] && (
                  <img src={product.product_images[0].url} alt={product.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {product.is_featured && <span className="badge bg-accent-400 text-primary-900"><Star className="w-3 h-3 fill-current" /> Vedette</span>}
                  {!product.is_active && <span className="badge bg-error-500 text-white">Inactif</span>}
                  {!product.is_available && <span className="badge bg-amber-100 text-amber-700">Indispo</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-primary-400 mb-1">{product.category?.name || 'Sans catégorie'}</p>
                <h3 className="font-medium text-primary-900 text-sm mb-1">{product.name}</h3>
                <p className="font-display text-lg font-bold text-primary-900">{formatPrice(product.price, currency)}</p>
                {product.compare_at_price && (
                  <p className="text-xs text-primary-400 line-through">{formatPrice(product.compare_at_price, currency)}</p>
                )}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-cream-100">
                  <button onClick={() => setEditing(product)} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50" title="Modifier">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleFeatured(product)} className="p-1.5 rounded-lg hover:bg-cream-50" title="Vedette">
                    <Star className={`w-4 h-4 ${product.is_featured ? 'fill-accent-400 text-accent-400' : 'text-primary-400'}`} />
                  </button>
                  <button onClick={() => toggleActive(product)} className={`p-1.5 rounded-lg ${product.is_active ? 'text-success-500' : 'text-primary-400'} hover:bg-cream-50`} title="Actif/Inactif">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="p-1.5 rounded-lg text-error-500 hover:bg-error-500/10 ml-auto" title="Supprimer">
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
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); loadProducts(); }}
        />
      )}
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compare_at_price: product?.compare_at_price?.toString() || '',
    category_id: product?.category_id || categories[0]?.id || '',
    prep_time_hours: product?.prep_time_hours?.toString() || '24',
    is_available: product?.is_available ?? true,
    is_featured: product?.is_featured ?? false,
    is_active: product?.is_active ?? true,
    stock: product?.stock?.toString() || '',
  });
  const [images, setImages] = useState<string[]>(product?.product_images?.map(i => i.url) || []);
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const slug = slugify(form.name) + '-' + Date.now().toString(36);
    const productData = {
      name: form.name,
      slug,
      description: form.description,
      price: parseInt(form.price) || 0,
      compare_at_price: form.compare_at_price ? parseInt(form.compare_at_price) : null,
      category_id: form.category_id || null,
      prep_time_hours: parseInt(form.prep_time_hours) || 24,
      is_available: form.is_available,
      is_featured: form.is_featured,
      is_active: form.is_active,
      stock: form.stock ? parseInt(form.stock) : null,
    };

    let productId = product?.id;
    if (product) {
      await supabase.from('products').update(productData).eq('id', product.id);
    } else {
      const { data } = await supabase.from('products').insert(productData).select().single();
      productId = data?.id;
    }

    if (productId) {
      // Delete old images and insert new ones
      if (product) {
        await supabase.from('product_images').delete().eq('product_id', productId);
      }
      if (images.length > 0) {
        await supabase.from('product_images').insert(
          images.map((url, i) => ({ product_id: productId, url, sort_order: i }))
        );
      }
    }

    setSaving(false);
    onSaved();
  }

  function addImage() {
    if (imageUrl.trim()) {
      setImages(prev => [...prev, imageUrl.trim()]);
      setImageUrl('');
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-cream-200 sticky top-0 bg-white z-10">
          <h2 className="font-display text-xl font-bold text-primary-900">{product ? 'Modifier' : 'Ajouter'} un produit</h2>
          <button onClick={onClose} className="p-2 text-primary-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Nom</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Prix (FCFA)</label>
              <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Ancien prix (optionnel)</label>
              <input type="number" value={form.compare_at_price} onChange={e => setForm({ ...form, compare_at_price: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Catégorie</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-field">
                <option value="">Sans catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Préparation (heures)</label>
              <input type="number" value={form.prep_time_hours} onChange={e => setForm({ ...form, prep_time_hours: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Images (URLs)</label>
            <div className="flex gap-2 mb-2">
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="input-field text-sm" />
              <button type="button" onClick={addImage} className="btn-ghost text-sm">Ajouter</button>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-error-500/80 text-white opacity-0 group-hover:opacity-100 text-xs flex items-center justify-center">Retirer</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} className="rounded text-accent-400" />
              <span className="text-primary-700">Disponible</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="rounded text-accent-400" />
              <span className="text-primary-700">Vedette</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded text-accent-400" />
              <span className="text-primary-700">Actif</span>
            </label>
          </div>
          <button onClick={handleSave} disabled={saving || !form.name || !form.price} className="btn-primary w-full">
            <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
export default AdminProducts;
