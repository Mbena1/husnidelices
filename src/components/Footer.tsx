import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Logo } from './Logo';

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-primary-900 text-cream-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="mb-4">
              <span className="font-display text-2xl font-bold text-accent-300">
                {settings?.bakery_name || 'Délices Dorés'}
              </span>
            </div>
            <p className="text-cream-300 text-sm leading-relaxed mb-6">
              {settings?.tagline || 'L\'art de créer des moments inoubliables'}
            </p>
            <div className="flex items-center gap-3">
              {settings?.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-800 hover:bg-accent-400 hover:text-primary-900 transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.social_instagram && (
                <a
                  href={settings.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-800 hover:bg-accent-400 hover:text-primary-900 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-800 hover:bg-accent-400 hover:text-primary-900 transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-accent-300 mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-cream-300 hover:text-accent-300 transition-colors">Accueil</Link></li>
              <li><Link to="/boutique" className="text-cream-300 hover:text-accent-300 transition-colors">Boutique</Link></li>
              <li><Link to="/galerie" className="text-cream-300 hover:text-accent-300 transition-colors">Galerie</Link></li>
              <li><Link to="/promotions" className="text-cream-300 hover:text-accent-300 transition-colors">Promotions</Link></li>
              <li><Link to="/collections" className="text-cream-300 hover:text-accent-300 transition-colors">Collections</Link></li>
              <li><Link to="/commande-personnalisee" className="text-cream-300 hover:text-accent-300 transition-colors">Commande personnalisée</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-accent-300 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              {settings?.phone && (
                <li className="flex items-center gap-3 text-cream-300">
                  <Phone className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>{settings.phone}</span>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-center gap-3 text-cream-300">
                  <Mail className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>{settings.email}</span>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-center gap-3 text-cream-300">
                  <MapPin className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings?.hours && (
                <li className="flex items-center gap-3 text-cream-300">
                  <Clock className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>{settings.hours}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-accent-300 mb-4">Mon compte</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/connexion" className="text-cream-300 hover:text-accent-300 transition-colors">Se connecter</Link></li>
              <li><Link to="/inscription" className="text-cream-300 hover:text-accent-300 transition-colors">Créer un compte</Link></li>
              <li><Link to="/compte" className="text-cream-300 hover:text-accent-300 transition-colors">Espace client</Link></li>
              <li><Link to="/compte/commandes" className="text-cream-300 hover:text-accent-300 transition-colors">Mes commandes</Link></li>
              <li><Link to="/compte/favoris" className="text-cream-300 hover:text-accent-300 transition-colors">Mes favoris</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream-400 text-xs">
            © {new Date().getFullYear()} {settings?.bakery_name || 'Délices Dorés'}. Tous droits réservés.
          </p>
          <p className="text-cream-400 text-xs">
            Pâtisserie artisanale — {settings?.city || 'Cotonou'}, Bénin
          </p>
        </div>
      </div>
    </footer>
  );
}
