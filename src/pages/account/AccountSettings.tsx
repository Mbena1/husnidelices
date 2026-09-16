import { Link } from 'react-router-dom';
import { Settings, User, Shield, Mail, Bell, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function AccountSettings() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const sections = [
    { title: 'Profil', desc: 'Modifier vos informations personnelles', icon: User, link: '/compte/profil' },
    { title: 'Sécurité', desc: 'Modifier votre mot de passe', icon: Shield, link: '/compte/securite' },
    { title: 'Email', desc: 'Changer votre adresse email', icon: Mail, link: '/compte/profil' },
    { title: 'Notifications', desc: 'Gérer vos préférences de notification', icon: Bell, link: '/compte/notifications' },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary-900 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary-700" />
        Paramètres
      </h2>

      <div className="space-y-3 max-w-2xl">
        {sections.map((section, i) => (
          <Link
            key={i}
            to={section.link}
            className="card card-hover p-5 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <section.icon className="w-6 h-6 text-primary-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-primary-900">{section.title}</h3>
              <p className="text-sm text-primary-500">{section.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary-300 group-hover:text-primary-600 transition-colors" />
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-cream-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 p-5 rounded-2xl border border-error-500/20 bg-error-500/5 hover:bg-error-500/10 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-error-500/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-6 h-6 text-error-500" />
            </div>
            <div>
              <h3 className="font-medium text-error-600">Déconnexion</h3>
              <p className="text-sm text-primary-400">Se déconnecter de votre compte</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
