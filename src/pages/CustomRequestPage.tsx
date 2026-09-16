import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, Calendar, Users, DollarSign, Palette, Sparkles, Upload, Send, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { EVENT_TYPES, formatPrice } from '@/lib/utils';

export function CustomRequestPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    event_type: 'anniversaire',
    desired_date: '',
    servings: '',
    budget: '',
    flavor: '',
    color_theme: '',
    theme_description: '',
    size: '',
    description: '',
    contact_preference: 'whatsapp',
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !profile) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('custom-requests').upload(fileName, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('custom-requests').getPublicUrl(fileName);
        newUrls.push(urlData.publicUrl);
      }
    }
    setImageUrls(prev => [...prev, ...newUrls]);
    setUploading(false);
  }

  function removeImage(idx: number) {
    setImageUrls(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) {
      navigate('/connexion');
      return;
    }
    setSubmitting(true);

    const { data: request, error } = await supabase
      .from('custom_requests')
      .insert({
        user_id: profile.id,
        event_type: form.event_type,
        desired_date: form.desired_date || null,
        servings: form.servings ? parseInt(form.servings) : null,
        budget: form.budget ? parseInt(form.budget) : null,
        flavor: form.flavor || null,
        color_theme: form.color_theme || null,
        theme_description: form.theme_description || null,
        size: form.size || null,
        description: form.description,
        contact_preference: form.contact_preference,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && request && imageUrls.length > 0) {
      await supabase.from('custom_request_images').insert(
        imageUrls.map(url => ({ request_id: request.id, url }))
      );
    }

    // Notify admin
    await supabase.from('notifications').insert({
      is_admin_target: true,
      title: 'Nouvelle demande personnalisée',
      message: `Demande ${form.event_type} de ${profile.first_name || ''} ${profile.last_name || ''}`,
      type: 'custom_request',
      link: '/admin/demandes',
    });

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20 pb-12 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full">
          <div className="card p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-success-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-900 mb-2">Demande envoyée!</h1>
            <p className="text-primary-500 text-sm mb-6">
              Merci! Nous étudions votre demande et vous répondrons dans les plus brefs délais.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/compte/demandes')} className="btn-primary">
                Voir mes demandes
              </button>
              <button onClick={() => navigate('/')} className="btn-outline">
                Accueil
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20 pb-12">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden mb-8">
        <img
          src="https://images.pexels.com/photos/1682474/pexels-photo-1682474.jpeg?auto=compress&cs=tinysrgb&h=800&w=1920"
          alt="Commande personnalisée"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 to-primary-900/50" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <Sparkles className="w-12 h-12 text-accent-400 mx-auto mb-4" />
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream-50 mb-4">Commande personnalisée</h1>
            <p className="text-cream-200 max-w-xl mx-auto">Décrivez votre vision et nous créerons une pièce unique pour votre événement</p>
          </div>
        </div>
      </div>

      <div className="container-padding px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* Event type */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
              <Cake className="w-5 h-5 text-accent-400" />
              Type d'événement
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setForm({ ...form, event_type: type.value })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.event_type === type.value
                      ? 'border-accent-400 bg-accent-50 text-primary-900'
                      : 'border-cream-300 bg-white text-primary-600 hover:border-primary-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Détails de la création</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-1">
                  <Calendar className="w-4 h-4" /> Date souhaitée
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.desired_date}
                  onChange={e => setForm({ ...form, desired_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-1">
                  <Users className="w-4 h-4" /> Nombre de personnes
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.servings}
                  onChange={e => setForm({ ...form, servings: e.target.value })}
                  className="input-field"
                  placeholder="Ex: 50"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-1">
                  <DollarSign className="w-4 h-4" /> Budget approximatif (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })}
                  className="input-field"
                  placeholder="Ex: 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Taille souhaitée</label>
                <input
                  type="text"
                  value={form.size}
                  onChange={e => setForm({ ...form, size: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Grand, 3 étages..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Parfum souhaité</label>
                <input
                  type="text"
                  value={form.flavor}
                  onChange={e => setForm({ ...form, flavor: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Chocolat, vanille, fruit..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-1">
                  <Palette className="w-4 h-4" /> Couleurs / thème
                </label>
                <input
                  type="text"
                  value={form.color_theme}
                  onChange={e => setForm({ ...form, color_theme: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Rose et or, floral..."
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-primary-700 mb-1">Thème / décoration</label>
              <input
                type="text"
                value={form.theme_description}
                onChange={e => setForm({ ...form, theme_description: e.target.value })}
                className="input-field"
                placeholder="Ex: Princesse Disney, football, élégant..."
              />
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-primary-700 mb-2">Décrivez votre idée</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none"
              placeholder="Plus nous en savons, mieux nous pouvons créer. Décrivez votre vision, vos envies, vos contraintes..."
            />
          </div>

          {/* Inspiration images */}
          <div className="card p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-primary-700 mb-3">
              <Upload className="w-5 h-5" /> Photos d'inspiration (optionnel)
            </label>
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                    <img src={url} alt="Inspiration" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-error-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-cream-300 rounded-xl cursor-pointer hover:border-accent-400 hover:bg-accent-50 transition-all">
              <Upload className="w-6 h-6 text-primary-400 mb-2" />
              <span className="text-sm text-primary-500">
                {uploading ? 'Chargement...' : 'Cliquez pour ajouter des photos'}
              </span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {/* Contact preference */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-primary-700 mb-3">Préférence de contact</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'whatsapp', label: 'WhatsApp' },
                { value: 'phone', label: 'Téléphone' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, contact_preference: opt.value })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.contact_preference === opt.value
                      ? 'border-accent-400 bg-accent-50'
                      : 'border-cream-300 bg-white text-primary-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full text-base py-4">
            <Send className="w-5 h-5" />
            {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </button>

          {!profile && (
            <p className="text-center text-sm text-error-500">
              Vous devez être connecté pour envoyer une demande
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
export default CustomRequestPage;
