import { useState, useEffect } from 'react';
import { Save, Check, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { useSettings } from '@/contexts/SettingsContext';
import type { SiteSettings } from '@/lib/types';

function AdminSettings() {
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (!settings) return;
    await supabase.from('site_settings').update({
      bakery_name: form.bakery_name,
      tagline: form.tagline,
      phone: form.phone,
      whatsapp_number: form.whatsapp_number,
      email: form.email,
      address: form.address,
      city: form.city,
      hours: form.hours,
      delivery_fee: form.delivery_fee,
      whatsapp_message: form.whatsapp_message,
      social_facebook: form.social_facebook,
      social_instagram: form.social_instagram,
      social_tiktok: form.social_tiktok,
      about_text: form.about_text,
      hero_title: form.hero_title,
      hero_subtitle: form.hero_subtitle,
    }).eq('id', settings.id);
    await refresh();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <AdminPageHeader title="Paramètres du site" />

      {saved && (
        <div className="mb-4 p-3 bg-success-500/10 text-success-600 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> Paramètres enregistrés avec succès
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Bakery info */}
        <div className="bg-white rounded-2xl p-6 border border-cream-200">
          <h2 className="font-display text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-accent-400" /> Informations de la pâtisserie
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Nom</label><input type="text" value={form.bakery_name || ''} onChange={e => setForm({ ...form, bakery_name: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Slogan</label><input type="text" value={form.tagline || ''} onChange={e => setForm({ ...form, tagline: e.target.value })} className="input-field" /></div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-700 mb-1">Texte À propos</label>
            <textarea rows={4} value={form.about_text || ''} onChange={e => setForm({ ...form, about_text: e.target.value })} className="input-field resize-none" />
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white rounded-2xl p-6 border border-cream-200">
          <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Page d'accueil</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Titre du Hero</label><input type="text" value={form.hero_title || ''} onChange={e => setForm({ ...form, hero_title: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Sous-titre du Hero</label><input type="text" value={form.hero_subtitle || ''} onChange={e => setForm({ ...form, hero_subtitle: e.target.value })} className="input-field" /></div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 border border-cream-200">
          <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Téléphone</label><input type="tel" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">WhatsApp (sans +)</label><input type="text" value={form.whatsapp_number || ''} onChange={e => setForm({ ...form, whatsapp_number: e.target.value })} className="input-field" placeholder="22901000000" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Email</label><input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Adresse</label><input type="text" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Ville</label><input type="text" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Horaires</label><input type="text" value={form.hours || ''} onChange={e => setForm({ ...form, hours: e.target.value })} className="input-field" /></div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-700 mb-1">Message WhatsApp par défaut</label>
            <input type="text" value={form.whatsapp_message || ''} onChange={e => setForm({ ...form, whatsapp_message: e.target.value })} className="input-field" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary-700 mb-1">Frais de livraison (FCFA)</label>
            <input type="number" value={form.delivery_fee ?? 0} onChange={e => setForm({ ...form, delivery_fee: parseInt(e.target.value) || 0 })} className="input-field" />
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl p-6 border border-cream-200">
          <h2 className="font-display text-lg font-semibold text-primary-900 mb-4">Réseaux sociaux</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Facebook</label><input type="url" value={form.social_facebook || ''} onChange={e => setForm({ ...form, social_facebook: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">Instagram</label><input type="url" value={form.social_instagram || ''} onChange={e => setForm({ ...form, social_instagram: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-primary-700 mb-1">TikTok</label><input type="url" value={form.social_tiktok || ''} onChange={e => setForm({ ...form, social_tiktok: e.target.value })} className="input-field" /></div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="w-5 h-5" /> {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </form>
    </div>
  );
}
export default AdminSettings;
