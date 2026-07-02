// ===== PAGES/LOGIN.JSX =====
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      toast.success('Connexion réussie !');
      router.push('/app');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      {/* BG orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-green opacity-10 blur-[100px] -top-32 -left-32" />
        <div className="absolute w-64 h-64 rounded-full bg-orange opacity-8 blur-[80px] -bottom-20 -right-20" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-green" />
            <span className="w-3 h-3 rounded-full bg-orange" />
          </div>
          <h1 className="font-display text-2xl font-bold">Afrikonnect</h1>
          <p className="text-sm text-[var(--text2)] mt-1">Connectez-vous à votre compte</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="vous@exemple.fr"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
          <Button type="submit" loading={loading} className="w-full justify-center mt-2">
            Se connecter
          </Button>

          {/* Demo mode */}
          <button
            type="button"
            onClick={() => { login({ id: '1', firstName: 'Mamadou', lastName: 'Konaté', email: 'mamadou@test.fr', role: 'COMMERCANT', plan: 'PRO' }, 'demo_token'); router.push('/app'); }}
            className="w-full text-xs text-[var(--text3)] hover:text-[var(--text2)] transition-colors py-1"
          >
            → Accès démo (sans inscription)
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text3)] mt-4">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-green hover:text-green-dark transition-colors">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
