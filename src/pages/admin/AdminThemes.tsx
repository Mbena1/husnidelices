import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Save, Palette, Play, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AdminPageHeader } from '@/components/AdminUI';
import { LoadingSpinner, EmptyState } from '@/components/States';
import type { Theme, SiteSettings } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';

function AdminThemes() {
  const { refresh } = useSettings();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', primary_color: '#3D2817', secondary_color: '#C8A96A',
    accent_color: '#D4AF37', text_color: '#2A1F14', background_color: '#FAF6F0',
    button_color: '#3D2817', hero_title: '', hero_subtitle: '',
  });

  async function loadThemes() {
    setLoading(true);
    const { data } = await supabase.from('themes').select('*').order('created_at');
    setThemes(data as Theme[] || []);
    setLoading(false);
  }

  useEffect(() => { loadThemes(); }, []);

  async function save() {
    if (!form.name) return;
    await supabase.from('themes').insert({
      ...form,
      is_active: false,
      is_default: false,
      hero_title: form.hero_title || null,
      hero_subtitle: form.hero_subtitle || null,
      description: form.description || null,
    });
    setCreating(false);
    setForm({ name: '', description: '', primary_color: '#3D2817', secondary_color: '#C8A96A', accent_color: '#D4AF37', text_color: '#2A1F14', background_color: '#FAF6F0', button_color: '#3D2817', hero_title: '', hero_subtitle: '' });
    loadThemes();
  }

  async function remove(id: string) {
    const theme = themes.find(t => t.id === id);
    if (theme?.is_default) { alert('Impossible de supprimer le thème par défaut'); return; }
    if (!confirm('Supprimer ce thème?')) return;
    await supabase.from('themes').delete().eq('id', id);
    loadThemes();
  }

  async function activate(id: string) {
    // Deselect all
    await supabase.from('themes').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    // Activate selected
    await supabase.from('themes').update({ is_active: true }).eq('id', id);
    // Set in site settings
    const { data: settings } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
    if (settings) {
      await supabase.from('site_settings').update({ active_theme_id: id }).eq('id', settings.id);
    }
    refresh();
    loadThemes();
  }

  async function deactivate(id: string) {
    await supabase.from('themes').update({ is_active: false }).eq('id', id);
    const { data: settings } = await supabase.from('site_settings').select('id').limit(1).maybeSingle();
    if (settings) {
      await supabase.from('site_settings').update({ active_theme_id: null }).eq('id', settings.id);
    }
    refresh();
    loadThemes();
  }

  return (
    <div>
      <AdminPageHeader title="Thèmes" action={<button onClick={() => setCreating(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Créer un thème</button>} />

      <div className="mb-6 p-4 bg-accent-50 rounded-xl border border-accent-200 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-accent-600 flex-shrink-0" />
        <p className="text-sm text-primary-700">Les thèmes modifient l'apparence du site: couleurs, texte du hero et ambiance. Activez un thème pour l'appliquer immédiatement, ou associez-le à un événement pour une activation automatique.</p>
      </div>

      {loading ? <LoadingSpinner /> : themes.length === 0 ? (
        <EmptyState title="Aucun thème" message="Créez votre premier thème" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map(theme => (
            <div key={theme.id} className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
              {/* Color preview */}
              <div className="h-24 flex" style={{ backgroundColor: theme.background_color }}>
                <div className="flex-1" style={{ backgroundColor: theme.primary_color }} />
                <div className="flex-1" style={{ backgroundColor: theme.secondary_color }} />
                <div className="flex-1" style={{ backgroundColor: theme.accent_color }} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary-600" />
                    <h3 className="font-medium text-primary-900">{theme.name}</h3>
                  </div>
                  {theme.is_active && <span className="badge bg-success-500/10 text-success-600"><Check className="w-3 h-3" /> Actif</span>}
                  {theme.is_default && <span className="badge bg-cream-200 text-primary-500">Défaut</span>}
                </div>
                {theme.description && <p className="text-sm text-primary-500 mb-3 line-clamp-2">{theme.description}</p>}
                {theme.hero_title && <p className="text-xs text-primary-400 mb-2"><strong>Hero:</strong> {theme.hero_title}</p>}
                <div className="flex gap-2 pt-3 border-t border-cream-100">
                  {theme.is_active ? (
                    <button onClick={() => deactivate(theme.id)} className="btn-ghost text-sm flex-1">Désactiver</button>
                  ) : (
                    <button onClick={() => activate(theme.id)} className="btn-primary text-sm flex-1"><Play className="w-4 h-4" /> Activer</button>
                  )}
                  {!theme.is_default && <button onClick={() => remove(theme.id)} className="p-2 rounded-lg text-error-500 hover:bg-error-500/10"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {creating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm" onClick={() => setCreating(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-cream-200 sticky top-0 bg-white z-10">
                <h2 className="font-display text-xl font-bold text-primary-900">Nouveau thème</h2>
                <button onClick={() => setCreating(false)} className="p-2 text-primary-400"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Nom du thème</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Ex: Noël, Saint-Valentin..." /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Description</label><input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <ColorField label="Couleur principale" value={form.primary_color} onChange={v => setForm({ ...form, primary_color: v })} />
                  <ColorField label="Couleur secondaire" value={form.secondary_color} onChange={v => setForm({ ...form, secondary_color: v })} />
                  <ColorField label="Couleur d'accent" value={form.accent_color} onChange={v => setForm({ ...form, accent_color: v })} />
                  <ColorField label="Couleur du texte" value={form.text_color} onChange={v => setForm({ ...form, text_color: v })} />
                  <ColorField label="Couleur du fond" value={form.background_color} onChange={v => setForm({ ...form, background_color: v })} />
                  <ColorField label="Couleur des boutons" value={form.button_color} onChange={v => setForm({ ...form, button_color: v })} />
                </div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Titre du Hero (optionnel)</label><input type="text" value={form.hero_title} onChange={e => setForm({ ...form, hero_title: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Sous-titre du Hero (optionnel)</label><input type="text" value={form.hero_subtitle} onChange={e => setForm({ ...form, hero_subtitle: e.target.value })} className="input-field" /></div>
                <button onClick={save} className="btn-primary w-full"><Save className="w-4 h-4" /> Créer le thème</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-12 h-10 rounded-lg border border-cream-300 cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="input-field text-sm" />
      </div>
    </div>
  );
}
export default AdminThemes;
