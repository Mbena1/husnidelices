import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { SectionReveal } from '@/components/Animations';
import { supabase } from '@/lib/supabase';

export function ContactPage() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    const whatsappMsg = `Bonjour, je suis ${form.name}.\nEmail: ${form.email}\nTéléphone: ${form.phone}\n\n${form.message}`;
    const number = settings?.whatsapp_number || '22901000000';
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');

    setSent(true);
    setSending(false);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-primary-900 text-cream-50 py-16">
        <div className="container-padding px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">Contact</h1>
          <p className="text-cream-200 text-lg max-w-2xl mx-auto">
            Nous sommes à votre écoute pour toutes vos questions et commandes
          </p>
        </div>
      </div>

      <div className="container-padding px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <SectionReveal>
            <h2 className="font-display text-2xl font-bold text-primary-900 mb-6">
              Coordonnées
            </h2>
            <div className="space-y-6">
              {settings?.phone && (
                <a href={`tel:${settings.phone}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-primary-800 flex items-center justify-center group-hover:bg-accent-400 transition-colors">
                    <Phone className="w-5 h-5 text-cream-50" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-400">Téléphone</p>
                    <p className="font-medium text-primary-900">{settings.phone}</p>
                  </div>
                </a>
              )}
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-primary-800 flex items-center justify-center group-hover:bg-accent-400 transition-colors">
                    <Mail className="w-5 h-5 text-cream-50" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-400">Email</p>
                    <p className="font-medium text-primary-900">{settings.email}</p>
                  </div>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-800 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-cream-50" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-400">Adresse</p>
                    <p className="font-medium text-primary-900">{settings.address}</p>
                  </div>
                </div>
              )}
              {settings?.hours && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-800 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cream-50" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-400">Horaires</p>
                    <p className="font-medium text-primary-900">{settings.hours}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
                <h3 className="font-display text-lg font-semibold text-primary-900">WhatsApp</h3>
              </div>
              <p className="text-primary-600 text-sm mb-4">
                Contactez-nous directement sur WhatsApp pour une réponse rapide
              </p>
              <WhatsAppButton />
            </div>
          </SectionReveal>

          {/* Contact form */}
          <SectionReveal delay={0.2}>
            <div className="card p-8">
              <h2 className="font-display text-2xl font-bold text-primary-900 mb-6">
                Envoyez-nous un message
              </h2>
              {sent && (
                <div className="mb-4 p-4 bg-success-500/10 text-success-600 rounded-lg text-sm">
                  Votre message a été préparé dans WhatsApp. Envoyez-le pour finaliser.
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input-field"
                    placeholder="+229 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Votre message..."
                  />
                </div>
                <button type="submit" disabled={sending} className="btn-primary w-full">
                  <Send className="w-5 h-5" />
                  {sending ? 'Envoi...' : 'Envoyer via WhatsApp'}
                </button>
              </form>
            </div>
          </SectionReveal>
        </div>
      </div>
    </div>
  );
}
export default ContactPage;
