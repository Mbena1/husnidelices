import { useState, useRef } from 'react';
import { User, Save, Check, Camera, Trash2, Mail, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

function AccountProfile() {
  const { profile, refreshProfile, updateEmail } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    neighborhood: profile?.neighborhood || '',
    notes: profile?.notes || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Email change modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      neighborhood: form.neighborhood,
      notes: form.notes,
    }).eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('L\'image ne doit pas dépasser 5 MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setAvatarError('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    setAvatarError('');
    setUploadingAvatar(true);

    const ext = file.name.split('.').pop();
    const fileName = `${profile.id}/avatar.${ext}`;

    // Delete old avatar if exists
    if (avatarUrl) {
      const oldPath = avatarUrl.split('/avatars/')[1];
      if (oldPath) {
        await supabase.storage.from('avatars').remove([oldPath]);
      }
    }

    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    if (uploadError) {
      setAvatarError('Erreur lors du téléversement de l\'image');
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
    setAvatarUrl(publicUrl);
    await refreshProfile();
    setUploadingAvatar(false);
  }

  async function removeAvatar() {
    if (!profile || !avatarUrl) return;
    const path = avatarUrl.split('/avatars/')[1];
    if (path) {
      await supabase.storage.from('avatars').remove([path]);
    }
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', profile.id);
    setAvatarUrl('');
    await refreshProfile();
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setEmailError('');
    if (newEmail !== confirmEmail) {
      setEmailError('Les emails ne correspondent pas');
      return;
    }
    if (newEmail === profile?.email) {
      setEmailError('Le nouvel email est identique à l\'email actuel');
      return;
    }
    setChangingEmail(true);
    const { error } = await updateEmail(newEmail);
    setChangingEmail(false);
    if (error) {
      setEmailError(error);
    } else {
      setEmailSuccess(true);
      setShowEmailModal(false);
      setNewEmail(''); setConfirmEmail('');
      setTimeout(() => setEmailSuccess(false), 5000);
    }
  }

  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary-900 mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-primary-700" />
        Mon profil
      </h2>

      {saved && (
        <div className="mb-4 p-3 bg-success-500/10 text-success-600 rounded-lg text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> Profil mis à jour.
        </div>
      )}
      {emailSuccess && (
        <div className="mb-4 p-3 bg-success-500/10 text-success-600 rounded-lg text-sm flex items-center gap-2">
          <Mail className="w-4 h-4" /> Un email de confirmation a été envoyé pour valider votre nouvelle adresse.
        </div>
      )}

      <div className="card p-6 max-w-2xl">
        {/* Avatar section */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-cream-200">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-cream-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-accent-400 flex items-center justify-center text-cream-50 font-display text-2xl font-bold">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-800 text-cream-50 flex items-center justify-center hover:bg-primary-700 shadow-lg transition-all"
              title="Modifier la photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-primary-900">{profile?.first_name} {profile?.last_name}</h3>
            <p className="text-sm text-primary-500 mb-2">{profile?.email}</p>
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar} className="btn-ghost text-sm">
                {uploadingAvatar ? 'Chargement...' : 'Modifier ma photo'}
              </button>
              {avatarUrl && (
                <button onClick={removeAvatar} className="btn-ghost text-sm text-error-500 hover:bg-error-500/10">
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              )}
            </div>
            {avatarError && <p className="text-xs text-error-500 mt-2">{avatarError}</p>}
          </div>
        </div>

        {/* Email section */}
        <div className="mb-6 pb-6 border-b border-cream-200">
          <p className="text-sm text-primary-400 mb-1">Adresse email actuelle</p>
          <div className="flex items-center justify-between">
            <p className="font-medium text-primary-900">{profile?.email}</p>
            <button onClick={() => setShowEmailModal(true)} className="btn-ghost text-sm">
              <Mail className="w-4 h-4" /> Modifier mon email
            </button>
          </div>
        </div>

        {/* Personal info form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Prénom</label>
              <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Nom</label>
              <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="+229 ..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Adresse</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="Votre adresse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Ville</label>
              <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="Cotonou" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Quartier</label>
              <input type="text" value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })} className="input-field" placeholder="Quartier" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Informations complémentaires</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" placeholder="Repère, étage, instructions de livraison..." />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="w-5 h-5" />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>

      {/* Email change modal */}
      {showEmailModal && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm"
          onClick={() => setShowEmailModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-cream-200">
              <h2 className="font-display text-xl font-bold text-primary-900">Modifier mon email</h2>
              <button onClick={() => setShowEmailModal(false)} className="p-2 text-primary-400 hover:text-primary-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {emailError && <div className="p-3 bg-error-500/10 text-error-500 rounded-lg text-sm">{emailError}</div>}
              <form onSubmit={handleEmailChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Nouvel email</label>
                  <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} className="input-field" placeholder="nouvel@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Confirmer le nouvel email</label>
                  <input type="email" required value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)} className="input-field" placeholder="nouvel@email.com" />
                </div>
                <p className="text-xs text-primary-400">Un email de confirmation sera envoyé à votre nouvelle adresse pour valider le changement.</p>
                <button type="submit" disabled={changingEmail} className="btn-primary w-full">
                  {changingEmail ? 'Envoi...' : 'Enregistrer'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default AccountProfile;
