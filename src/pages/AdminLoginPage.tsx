import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function AdminLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error);
      setLoading(false);
    } else {
      window.location.href = '/admin';
    }
  }

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-dark rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-cream-50" />
            </div>
            <h1 className="font-display text-2xl font-bold text-cream-50">Administration</h1>
            <p className="text-cream-300 text-sm mt-2">Espace réservé à l'administrateur</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-500/20 text-error-300 rounded-lg text-sm border border-error-500/30">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-1">Email administrateur</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-cream-50 placeholder:text-cream-400/50 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                  placeholder="admin@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-cream-50 placeholder:text-cream-400/50 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-400 focus:ring-accent-400 bg-white/5 border-white/20"
                />
                <span className="text-sm text-cream-300">Se souvenir de moi</span>
              </label>
              <Link to="/mot-de-passe-oublie" className="text-sm text-accent-300 hover:text-accent-200">
                Mot de passe oublié ?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-400 text-primary-900 font-medium rounded-lg transition-all duration-300 hover:bg-accent-300 hover:shadow-lg active:scale-95 disabled:opacity-50">
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-cream-400 hover:text-cream-200">
              <ArrowLeft className="w-4 h-4" />
              Retour au site
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLoginPage;
