import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, UserPlus, Eye, EyeOff, Phone, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function getPasswordStrength(pwd: string): { label: string; color: string; percent: number } {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: 'Faible', color: 'bg-error-500', percent: 25 };
  if (score <= 3) return { label: 'Moyen', color: 'bg-amber-500', percent: 60 };
  return { label: 'Fort', color: 'bg-success-500', percent: 100 };
}

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

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
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, firstName, lastName, phone);
    setLoading(false);
    if (error) {
      setError(error === 'User already registered' ? 'Un compte existe déjà avec cet email' : error);
    } else {
      navigate('/compte');
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-600 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-cream-50" />
            </div>
            <h1 className="font-display text-2xl font-bold text-primary-900">Créer votre compte</h1>
            <p className="text-primary-500 text-sm mt-2">Rejoignez notre communauté gourmande</p>
          </div>

          {error && <div className="mb-4 p-3 bg-error-500/10 text-error-500 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="input-field pl-10" placeholder="Prénom" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Nom</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="input-field" placeholder="Nom" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" placeholder="votre@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field pl-10" placeholder="+229 ..." />
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
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.percent}%` }} />
                  </div>
                  <p className="text-xs text-primary-400 mt-1">Force: <span className="font-medium">{strength.label}</span></p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success-500" />
                )}
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="w-4 h-4 mt-0.5 rounded text-accent-400 focus:ring-accent-400" />
              <span className="text-sm text-primary-600">J'accepte les conditions d'utilisation</span>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Création...' : 'Créer mon compte'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-primary-500">Déjà un compte ? </span>
            <Link to="/connexion" className="text-accent-600 font-medium hover:text-accent-700">Se connecter</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;
