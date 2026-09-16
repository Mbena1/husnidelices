import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/lib/supabase';

function LoginPage() {
  const { signIn } = useAuth();
  const { settings } = useSettings();
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
    setLoading(false);
    if (error) {
      setError(error === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error);
    } else {
      // Check if the user is admin, redirect accordingly
      const { data: userData } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user?.id || '')
        .maybeSingle();
      if (profileData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/compte');
      }
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-600 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-cream-50" />
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-900">Bienvenue</h1>
            <p className="text-primary-500 text-sm mt-2">Connectez-vous à votre compte</p>
          </div>

          {error && <div className="mb-4 p-3 bg-error-500/10 text-error-500 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" placeholder="votre@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded text-accent-400 focus:ring-accent-400" />
                <span className="text-sm text-primary-600">Se souvenir de moi</span>
              </label>
              <Link to="/mot-de-passe-oublie" className="text-sm text-accent-600 font-medium hover:text-accent-700">
                Mot de passe oublié ?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-primary-500">Pas encore de compte ? </span>
            <Link to="/inscription" className="text-accent-600 font-medium hover:text-accent-700">Créer un compte</Link>
          </div>
        </div>
        <p className="text-center text-xs text-primary-400 mt-6">
          {settings?.bakery_name || 'Délices Dorés'} — Pâtisserie d'exception au Bénin
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
