import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Check, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/compte'), 2500);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-success-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success-500" />
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-900 mb-2">Mot de passe modifié</h1>
            <p className="text-primary-500 text-sm">Votre mot de passe a été modifié avec succès. Redirection...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-cream-50" />
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-900">Nouveau mot de passe</h1>
            <p className="text-primary-500 text-sm mt-2">Choisissez un nouveau mot de passe sécurisé</p>
          </div>

          {error && <div className="mb-4 p-3 bg-error-500/10 text-error-500 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Modification...' : 'Modifier mon mot de passe'}
              {!loading && <Check className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/connexion" className="text-sm text-primary-500 hover:text-primary-700">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;
