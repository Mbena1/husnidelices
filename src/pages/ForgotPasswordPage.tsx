import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Send, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-success-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-primary-900 mb-2">Email envoyé</h1>
              <p className="text-primary-500 text-sm mb-6">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                Vérifiez votre boîte de réception et vos spams.
              </p>
              <Link to="/connexion" className="btn-primary">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-400 to-primary-600 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-cream-50" />
                </div>
                <h1 className="font-display text-2xl font-bold text-primary-900">Mot de passe oublié</h1>
                <p className="text-primary-500 text-sm mt-2">
                  Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error-500/10 text-error-500 rounded-lg text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                  {!loading && <Send className="w-4 h-4" />}
                </button>
              </form>

              <div className="mt-6">
                <Link to="/connexion" className="inline-flex items-center gap-2 text-sm text-primary-500 hover:text-primary-700">
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
