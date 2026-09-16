import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard, Package, Cake, User, Heart, LogOut,
  Menu, X, ShoppingBag, Bell, Shield, Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const accountLinks = [
  { to: '/compte', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/compte/profil', label: 'Mon profil', icon: User },
  { to: '/compte/commandes', label: 'Mes commandes', icon: Package },
  { to: '/compte/demandes', label: 'Mes demandes', icon: Cake },
  { to: '/compte/favoris', label: 'Mes favoris', icon: Heart },
  { to: '/compte/notifications', label: 'Notifications', icon: Bell },
  { to: '/compte/securite', label: 'Sécurité', icon: Shield },
  { to: '/compte/parametres', label: 'Paramètres', icon: Settings },
];

export function AccountLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Client';
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="container-padding px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={fullName} className="w-12 h-12 rounded-full object-cover border-2 border-accent-300" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-accent-400 flex items-center justify-center text-cream-50 font-display font-bold">
                {initials}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold text-primary-900">Espace client</h1>
              <p className="text-primary-500 text-sm">Bonjour, {profile?.first_name || fullName}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-white border border-cream-300 text-primary-700"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl p-4 border border-cream-200 sticky top-24">
              <nav className="space-y-1">
                {accountLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-800 text-cream-50'
                          : 'text-primary-600 hover:bg-primary-50'
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                ))}
                <div className="pt-3 mt-3 border-t border-cream-200">
                  <Link to="/boutique" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50">
                    <ShoppingBag className="w-5 h-5" />
                    Boutique
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error-500 hover:bg-error-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
