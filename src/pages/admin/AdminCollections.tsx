import { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Save,
  ImagePlus,
  Loader2,
  FolderTree,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import type { Collection } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_BUCKET = 'collection-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
  });

  async function loadCollections() {
    setLoading(true);

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Erreur chargement collections:', error);
      setError('Impossible de charger les collections.');
    } else {
      setCollections((data as Collection[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCollections();
  }, []);

  function resetForm() {
    setForm({
      title: '',
      description: '',
      image_url: '',
    });

    setError('');
  }

  function closeModal() {
    if (saving || uploading) return;

    setCreating(false);
    resetForm();
  }

  async function handleImageSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Format non accepté. Utilisez JPG, PNG ou WebP.'
      );

      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('L’image ne doit pas dépasser 5 Mo.');

      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split('.').pop()?.toLowerCase() || 'jpg';

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `collections/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error(
          'Erreur upload collection:',
          uploadError
        );

        throw new Error(
          uploadError.message ||
            'Impossible d’envoyer l’image.'
        );
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error(
          'Impossible de récupérer l’URL de l’image.'
        );
      }

      setForm(prev => ({
        ...prev,
        image_url: data.publicUrl,
      }));
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue pendant l’envoi.'
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function removeSelectedImage() {
    if (!form.image_url) return;

    try {
      const url = new URL(form.image_url);
      const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

      const index = url.pathname.indexOf(marker);

      if (index !== -1) {
        const filePath = decodeURIComponent(
          url.pathname.substring(index + marker.length)
        );

        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);
      }
    } catch (err) {
      console.warn(
        'Impossible de supprimer le fichier Storage:',
        err
      );
    }

    setForm(prev => ({
      ...prev,
      image_url: '',
    }));
  }

  async function save() {
    if (!form.title.trim()) {
      setError('Le titre de la collection est obligatoire.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('collections')
        .insert({
          title: form.title.trim(),
          description: form.description.trim() || null,
          image_url: form.image_url || null,
          is_active: true,
          is_featured: false,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setCreating(false);
      resetForm();
      await loadCollections();
    } catch (err) {
      console.error('Erreur création collection:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de créer la collection.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette collection ?')) return;

    const collection = collections.find(
      item => item.id === id
    );

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        'Erreur suppression collection:',
        error
      );
      alert('Impossible de supprimer cette collection.');
      return;
    }

    if (collection?.image_url) {
      try {
        const url = new URL(collection.image_url);

        const marker =
          `/storage/v1/object/public/${STORAGE_BUCKET}/`;

        const index = url.pathname.indexOf(marker);

        if (index !== -1) {
          const filePath = decodeURIComponent(
            url.pathname.substring(
              index + marker.length
            )
          );

          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);
        }
      } catch (err) {
        console.warn(
          'Impossible de supprimer l’image Storage:',
          err
        );
      }
    }

    await loadCollections();
  }

  async function toggleFeatured(col: Collection) {
    const { error } = await supabase
      .from('collections')
      .update({
        is_featured: !col.is_featured,
      })
      .eq('id', col.id);

    if (error) {
      console.error(
        'Erreur modification vedette:',
        error
      );
      alert('Impossible de modifier le statut.');
      return;
    }

    await loadCollections();
  }

  return (
    <div>
      <AdminPageHeader
        title="Collections"
        action={
          <button
            onClick={() => {
              resetForm();
              setCreating(true);
            }}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : collections.length === 0 ? (
        <EmptyState
          title="Aucune collection"
          message="Créez votre première collection"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(col => (
            <div
              key={col.id}
              className="bg-white rounded-2xl border border-cream-200 overflow-hidden"
            >
              {col.image_url ? (
                <div className="aspect-video bg-cream-100">
                  <img
                    src={col.image_url}
                    alt={col.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-cream-100 flex items-center justify-center">
                  <FolderTree className="w-10 h-10 text-primary-300" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-2 gap-3">
                  <h3 className="font-medium text-primary-900">
                    {col.title}
                  </h3>

                  {col.is_featured && (
                    <span className="badge bg-accent-400 text-primary-900 shrink-0">
                      Vedette
                    </span>
                  )}
                </div>

                {col.description && (
                  <p className="text-sm text-primary-500 line-clamp-2 mb-3">
                    {col.description}
                  </p>
                )}

                <div className="flex gap-2 pt-3 border-t border-cream-100">
                  <button
                    onClick={() =>
                      toggleFeatured(col)
                    }
                    className="btn-ghost text-sm flex-1"
                  >
                    {col.is_featured
                      ? 'Retirer vedette'
                      : 'Mettre en vedette'}
                  </button>

                  <button
                    onClick={() => remove(col.id)}
                    className="p-2 rounded-lg text-error-500 hover:bg-error-500/10"
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

      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <div>
                  <h2 className="font-display text-xl font-bold text-primary-900">
                    Nouvelle collection
                  </h2>

                  <p className="text-sm text-primary-500 mt-1">
                    Ajoutez une collection à votre boutique
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  disabled={saving || uploading}
                  className="p-2 text-primary-400 hover:text-primary-700 rounded-lg hover:bg-cream-100 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Titre
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={e =>
                      setForm({
                        ...form,
                        title: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="Ex. Collections de Noël"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    className="input-field resize-none"
                    placeholder="Décrivez cette collection..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Image de la collection
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {form.image_url ? (
                    <div className="relative rounded-2xl overflow-hidden border border-cream-200 bg-cream-50">
                      <div className="aspect-video">
                        <img
                          src={form.image_url}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        disabled={uploading || saving}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center text-error-500 hover:bg-white disabled:opacity-50"
                        title="Supprimer l'image"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="p-3 flex items-center justify-between">
                        <span className="text-sm text-primary-600">
                          Image sélectionnée
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={uploading || saving}
                          className="text-sm font-medium text-primary-700 hover:text-primary-900"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={uploading || saving}
                      className="w-full aspect-video rounded-2xl border-2 border-dashed border-cream-300 bg-cream-50 hover:bg-cream-100 hover:border-primary-300 transition-all flex flex-col items-center justify-center gap-3 group disabled:opacity-60"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />

                          <div className="text-center">
                            <p className="text-sm font-medium text-primary-700">
                              Envoi de l’image...
                            </p>

                            <p className="text-xs text-primary-400 mt-1">
                              Veuillez patienter
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <ImagePlus className="w-6 h-6 text-primary-700" />
                          </div>

                          <div className="text-center">
                            <p className="text-sm font-semibold text-primary-800">
                              Ajouter une image
                            </p>

                            <p className="text-xs text-primary-400 mt-1">
                              Cliquez pour choisir une photo
                            </p>

                            <p className="text-xs text-primary-400 mt-1">
                              JPG, PNG ou WebP · 5 Mo max.
                            </p>
                          </div>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-error-500/10 border border-error-500/20 px-4 py-3">
                    <p className="text-sm text-error-600">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  onClick={save}
                  disabled={
                    saving ||
                    uploading ||
                    !form.title.trim()
                  }
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Créer la collection
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminCollections;