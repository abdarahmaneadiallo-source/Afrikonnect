// ===== PAGES/REGISTER.JSX =====
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { Button, Input } from '../components/ui';
import { Store, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'COMMERCANT', label: 'Commerçant', icon: Store, desc: 'Je tiens une boutique en France' },
  { value: 'FOURNISSEUR', label: 'Fournisseur', icon: Truck, desc: 'Je vends depuis l\'Afrique' },
];

export default function Register() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'COMMERCANT'
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.user, res.data.token);
      toast.success('Bienvenue sur Afrikonnect !');
      router.push('/app');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-green opacity-10 blur-[100px] -top-32 -left-32" />
        <div className="absolute w-64 h-64 rounded-full bg-orange opacity-8 blur-[80px] -bottom-20 -right-20" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-green" />
            <span className="w-3 h-3 rounded-full bg-orange" />
          </div>
          <h1 className="font-display text-2xl font-bold">Afrikonnect</h1>
          <p className="text-sm text-[var(--text2)] mt-1">Créez votre compte gratuitement</p>
        </div>

        <form onSubmit={submit} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
          {/* Choix du rôle */}
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(r => {
              const Icon = r.icon;
              const active = form.role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r.value }))}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-all ${
                    active
                      ? 'border-green bg-green/10 text-green'
                      : 'border-[var(--border)] text-[var(--text2)] hover:border-[var(--border2)]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{r.label}</span>
                  <span className="text-[10px] text-[var(--text3)] text-center leading-tight">{r.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prénom"
              placeholder="Mamadou"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              required
            />
            <Input
              label="Nom"
              placeholder="Koné"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              required
            />
          </div>
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
            placeholder="8 caractères minimum"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
          />
          <Button type="submit" loading={loading} className="w-full justify-center mt-2">
            Créer mon compte
          </Button>
          <p className="text-[10px] text-[var(--text3)] text-center leading-relaxed">
            En vous inscrivant, vous acceptez nos conditions d'utilisation.
            Plan Gratuit : 5 commandes/mois, sans engagement.
          </p>
        </form>

        <p className="text-center text-xs text-[var(--text3)] mt-4">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-green hover:text-green-dark transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
