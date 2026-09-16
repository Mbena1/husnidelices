import { useState } from 'react';
import { Lock, Eye, EyeOff, Check, Shield, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function AccountSecurity() {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(newPassword);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary-900 mb-6 flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary-700" />
        Sécurité
      </h2>

      <div className="card p-6 max-w-2xl">
        <h3 className="font-display text-lg font-semibold text-primary-900 mb-2 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-accent-400" />
          Modifier mon mot de passe
        </h3>
        <p className="text-sm text-primary-500 mb-6">Choisissez un mot de passe sécurisé pour protéger votre compte.</p>

        {success && (
          <div className="mb-4 p-3 bg-success-500/10 text-success-600 rounded-lg text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> Votre mot de passe a été modifié avec succès.
          </div>
        )}
        {error && <div className="mb-4 p-3 bg-error-500/10 text-error-500 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Mot de passe actuel (recommandé)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
              <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600">
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
              <input type={showPasswords ? 'text' : 'password'} required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Confirmer le nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
              <input type={showPasswords ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            <Lock className="w-5 h-5" />
            {loading ? 'Modification...' : 'Modifier mon mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AccountSecurity;
