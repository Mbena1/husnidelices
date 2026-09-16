import { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Save,
  ImagePlus,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import {
  LoadingSpinner,
  EmptyState,
} from '@/components/States';
import {
  GALLERY_CATEGORIES,
} from '@/lib/utils';
import type { GalleryItem } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_BUCKET = 'gallery-images';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'autre',
    event_date: '',
  });

  async function loadGallery() {
    setLoading(true);

    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error(
        'Erreur chargement galerie :',
        error
      );
    }

    setItems(
      (data as GalleryItem[]) || []
    );

    setLoading(false);
  }

  useEffect(() => {
    loadGallery();
  }, []);

  async function remove(id: string) {
    if (!confirm('Supprimer cette photo ?')) {
      return;
    }

    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        'Erreur suppression photo :',
        error
      );

      alert(
        'Impossible de supprimer cette photo.'
      );

      return;
    }

    loadGallery();
  }

  function openCreate() {
    setForm({
      title: '',
      description: '',
      category: 'autre',
      event_date: '',
    });

    setCreating(true);
  }

  return (
    <div>
      <AdminPageHeader
        title="Galerie"
        action={
          <button
            onClick={openCreate}
            className="btn-primary text-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="Galerie vide"
          message="Ajoutez vos plus belles réalisations"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden group aspect-square bg-cream-100"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                <h3 className="font-display text-sm font-semibold text-cream-50">
                  {item.title}
                </h3>

                <button
                  onClick={() =>
                    remove(item.id)
                  }
                  className="w-8 h-8 rounded-full bg-error-500 text-white flex items-center justify-center hover:scale-105 transition-transform"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {creating && (
          <GalleryForm
            form={form}
            setForm={setForm}
            onClose={() =>
              setCreating(false)
            }
            onSaved={() => {
              setCreating(false);
              loadGallery();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GalleryForm({
  form,
  setForm,
  onClose,
  onSaved,
}: {
  form: {
    title: string;
    description: string;
    category: string;
    event_date: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      category: string;
      event_date: string;
    }>
  >;
  onClose: () => void;
  onSaved: () => void;
}) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string>('');

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setErrorMessage('');

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        selectedFile.type
      )
    ) {
      setErrorMessage(
        'Format non accepté. Utilisez JPG, PNG ou WebP.'
      );

      event.target.value = '';
      return;
    }

    if (
      selectedFile.size > MAX_IMAGE_SIZE
    ) {
      setErrorMessage(
        "L'image ne doit pas dépasser 5 Mo."
      );

      event.target.value = '';
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const previewUrl =
      URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreview(previewUrl);

    event.target.value = '';
  }

  function removeImage() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview('');
  }

  async function save() {
    if (!form.title.trim()) {
      setErrorMessage(
        'Veuillez renseigner un titre.'
      );
      return;
    }

    if (!file) {
      setErrorMessage(
        'Veuillez sélectionner une image.'
      );
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      /*
       * Nom unique du fichier
       */
      const extension =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'jpg';

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath =
        `gallery/${fileName}`;

      /*
       * Upload vers Supabase Storage
       */
      const {
        error: uploadError,
      } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          }
        );

      if (uploadError) {
        console.error(
          'Erreur upload galerie :',
          uploadError
        );

        throw new Error(
          "Impossible d'envoyer l'image."
        );
      }

      /*
       * Récupération de l'URL publique
       */
      const {
        data: publicUrlData,
      } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const imageUrl =
        publicUrlData.publicUrl;

      if (!imageUrl) {
        throw new Error(
          "Impossible de récupérer l'URL de l'image."
        );
      }

      /*
       * Enregistrement dans la table gallery
       */
      const {
        error: insertError,
      } = await supabase
        .from('gallery')
        .insert({
          title: form.title.trim(),
          description:
            form.description.trim() ||
            null,
          image_url: imageUrl,
          category: form.category,
          event_date:
            form.event_date || null,
          is_active: true,
        });

      if (insertError) {
        console.error(
          'Erreur enregistrement galerie :',
          insertError
        );

        /*
         * Si l'insertion DB échoue,
         * on supprime également le fichier
         * envoyé dans Storage.
         */
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);

        throw insertError;
      }

      removeImage();

      onSaved();
    } catch (error) {
      console.error(
        'Erreur création galerie :',
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

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
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between p-6 border-b border-cream-200 sticky top-0 bg-white z-10">
          <h2 className="font-display text-xl font-bold text-primary-900">
            Ajouter une photo
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
              Titre
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title:
                    event.target.value,
                })
              }
              className="input-field"
              placeholder="Ex : Gâteau de mariage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Description
            </label>

            <input
              type="text"
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              className="input-field"
              placeholder="Une courte description..."
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              Photo
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!preview ? (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={saving}
                className="w-full border-2 border-dashed border-cream-300 hover:border-accent-400 rounded-2xl p-8 transition-all hover:bg-cream-50 group"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-accent-50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <ImagePlus className="w-7 h-7 text-accent-500" />
                  </div>

                  <p className="font-medium text-primary-800">
                    Ajouter une photo
                  </p>

                  <p className="text-xs text-primary-400 mt-1">
                    Cliquez pour choisir une image
                  </p>

                  <p className="text-xs text-primary-300 mt-1">
                    JPG, PNG ou WebP · 5 Mo maximum
                  </p>
                </div>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-cream-100 aspect-video group">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-primary-900/30 opacity-0 group-hover:opacity-100 transition-opacity" />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white text-error-500 shadow-lg flex items-center justify-center hover:bg-error-500 hover:text-white transition-colors"
                  title="Retirer l'image"
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="absolute bottom-3 left-3 right-3 bg-white/95 text-primary-800 rounded-lg py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Changer la photo
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Catégorie
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category:
                    event.target.value,
                })
              }
              className="input-field"
            >
              {GALLERY_CATEGORIES.map(
                (category) => (
                  <option
                    key={category.value}
                    value={category.value}
                  >
                    {category.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Date de l'événement
            </label>

            <input
              type="date"
              value={form.event_date}
              onChange={(event) =>
                setForm({
                  ...form,
                  event_date:
                    event.target.value,
                })
              }
              className="input-field"
            />
          </div>

          <button
            onClick={save}
            disabled={
              saving ||
              !form.title ||
              !file
            }
            className="btn-primary w-full"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
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

export default AdminGallery;