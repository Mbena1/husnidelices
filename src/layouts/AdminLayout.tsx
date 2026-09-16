import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Cake, ShoppingCart, Tag, FolderTree,
  Image, Calendar, Palette, Users, Bell, Settings, LogOut,
  Menu, X, Home, Store
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
  { to: '/admin/demandes', label: 'Demandes', icon: Cake },
  { to: '/admin/produits', label: 'Produits', icon: Package },
  { to: '/admin/categories', label: 'Catégories', icon: Store },
  { to: '/admin/galerie', label: 'Galerie', icon: Image },
  { to: '/admin/promotions', label: 'Promotions', icon: Tag },
  { to: '/admin/collections', label: 'Collections', icon: FolderTree },
  { to: '/admin/evenements', label: 'Événements', icon: Calendar },
  { to: '/admin/themes', label: 'Thèmes', icon: Palette },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

export function AdminLayout() {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-primary-900 mb-2">Accès refusé</h1>
          <p className="text-primary-500 mb-6">Vous devez être administrateur pour accéder à cette page</p>
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-cream-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary-900 text-cream-100 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-primary-800">
          <Link to="/" className="font-display text-xl font-bold text-accent-300">
            Délices Dorés
          </Link>
          <p className="text-xs text-cream-400 mt-1">Administration</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {adminLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-accent-400 text-primary-900' : 'text-cream-300 hover:bg-primary-800 hover:text-cream-50'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-800 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-cream-300 hover:bg-primary-800 hover:text-cream-50 transition-all">
            <Home className="w-5 h-5" />
            Voir le site
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-error-400 hover:bg-error-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-primary-900 text-cream-100 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-primary-800">
                <span className="font-display text-lg font-bold text-accent-300">Administration</span>
                <button onClick={() => setSidebarOpen(false)} className="text-cream-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {adminLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive ? 'bg-accent-400 text-primary-900' : 'text-cream-300 hover:bg-primary-800'
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 border-t border-primary-800">
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-error-400">
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-primary-900 text-cream-50 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display font-bold text-accent-300">Admin</span>
          <Link to="/" className="p-2">
            <Home className="w-5 h-5" />
          </Link>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
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
        </main>
      </div>
    </div>
  );
}
