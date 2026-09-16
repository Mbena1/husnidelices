import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingCart, User, Menu, X, Cake } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from './Logo';

const navLinks = [
  { label: 'Accueil', path: '/' },
  { label: 'Boutique', path: '/boutique' },
  { label: 'Galerie', path: '/galerie' },
  { label: 'Promotions', path: '/promotions' },
  { label: 'À propos', path: '/a-propos' },
  { label: 'Contact', path: '/contact' },
];

export function Navbar() {
  const { totalItems, openCart } = useCart();
  const { profile } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/boutique?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className={`flex items-center ${scrolled ? '' : 'filter drop-shadow'}`}>
            <Logo />
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path ||
                (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                    scrolled
                      ? isActive
                        ? 'text-primary-800 bg-primary-50'
                        : 'text-primary-700 hover:text-primary-800 hover:bg-primary-50'
                      : isActive
                        ? 'text-accent-300'
                        : 'text-cream-50 hover:text-accent-300'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? 'text-primary-700 hover:bg-primary-50' : 'text-cream-50 hover:bg-white/10'
              }`}
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to={profile ? '/compte/favoris' : '/connexion'}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? 'text-primary-700 hover:bg-primary-50' : 'text-cream-50 hover:bg-white/10'
              }`}
              aria-label="Favoris"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <button
              onClick={openCart}
              className={`relative p-2 rounded-lg transition-colors ${
                scrolled ? 'text-primary-700 hover:bg-primary-50' : 'text-cream-50 hover:bg-white/10'
              }`}
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-accent-400 text-primary-900 text-xs font-bold rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              to={profile ? '/compte' : '/connexion'}
              className={`p-2 rounded-lg transition-colors ${
                scrolled ? 'text-primary-700 hover:bg-primary-50' : 'text-cream-50 hover:bg-white/10'
              }`}
              aria-label="Compte"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-primary-700 hover:bg-primary-50' : 'text-cream-50 hover:bg-white/10'
              }`}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un gâteau, un dessert..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-primary-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-cream-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-cream-200">
                <Logo />
                <button onClick={() => setMobileOpen(false)} className="p-2 text-primary-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'bg-primary-800 text-cream-50'
                          : 'text-primary-700 hover:bg-primary-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-4 pt-4 border-t border-cream-200">
                  <Link to="/commande-personnalisee" className="btn-accent w-full">
                    <Cake className="w-5 h-5" />
                    Commande personnalisée
                  </Link>
                </div>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="btn-outline mt-3 w-full">
                    Dashboard Admin
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
