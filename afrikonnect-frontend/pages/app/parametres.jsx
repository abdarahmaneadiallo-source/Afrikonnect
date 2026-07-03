// ===== PAGES/APP/PARAMETRES.JSX =====
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Input, Button, Badge, Divider, Spinner } from '../../components/ui';
import { authAPI, stripeAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import api from '../../lib/api';
import { User, Store, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS_COMMERCANT = [
  { id: 'FREE', nom: 'Gratuit', prix: '0 €', desc: '5 commandes/mois, marketplace, 1 conteneur groupé' },
  { id: 'PRO', nom: 'Pro', prix: '29 €/mois', desc: 'Commandes illimitées, conformité IA, priorité conteneurs, support WhatsApp' },
];

const PLANS_FOURNISSEUR = [
  { id: 'FREE', nom: 'Starter', prix: '0 €', desc: '5 produits max, visibilité standard' },
  { id: 'FOURNISSEUR', nom: 'Vérifié', prix: '49 €/mois', desc: 'Badge vérifié, produits illimités, mise en avant marketplace, statistiques de demande' },
];

export default function Parametres() {
  const { user, updateUser } = useAuthStore();
  const [profil, setProfil] = useState({ firstName: '', lastName: '', phone: '' });
  const [boutique, setBoutique] = useState({ nom: '', adresse: '', ville: '', codePostal: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    authAPI.me()
      .then(res => {
        const u = res.data;
        setProfil({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' });
        if (u.boutique) {
          setBoutique({
            nom: u.boutique.nom || '', adresse: u.boutique.adresse || '',
            ville: u.boutique.ville || '', codePostal: u.boutique.codePostal || ''
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfil = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/users/me', profil);
      updateUser(res.data);
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const saveBoutique = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/me/boutique', boutique);
      toast.success('Boutique mise à jour');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const changerPlan = async (plan) => {
    if (plan === user?.plan) return;
    try {
      const res = await stripeAPI.createCheckout(plan);
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error('Paiement indisponible en mode démo');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="font-display text-xl font-bold mb-6">Paramètres</h1>

      {/* Profil */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold mb-4">
          <User size={15} className="text-green" /> Mon profil
        </div>
        <form onSubmit={saveProfil} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" value={profil.firstName} onChange={e => setProfil({ ...profil, firstName: e.target.value })} />
            <Input label="Nom" value={profil.lastName} onChange={e => setProfil({ ...profil, lastName: e.target.value })} />
          </div>
          <Input label="Téléphone" value={profil.phone} onChange={e => setProfil({ ...profil, phone: e.target.value })} placeholder="+33 6 12 34 56 78" />
          <Input label="Email" value={user?.email || ''} disabled className="opacity-60" />
          <Button type="submit" size="sm" loading={saving}>Enregistrer</Button>
        </form>
      </Card>

      {/* Boutique */}
      {user?.role === 'COMMERCANT' && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Store size={15} className="text-orange" /> Ma boutique
          </div>
          <form onSubmit={saveBoutique} className="space-y-3">
            <Input label="Nom de la boutique" value={boutique.nom} onChange={e => setBoutique({ ...boutique, nom: e.target.value })} />
            <Input label="Adresse" value={boutique.adresse} onChange={e => setBoutique({ ...boutique, adresse: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ville" value={boutique.ville} onChange={e => setBoutique({ ...boutique, ville: e.target.value })} />
              <Input label="Code postal" value={boutique.codePostal} onChange={e => setBoutique({ ...boutique, codePostal: e.target.value })} />
            </div>
            <Button type="submit" size="sm" loading={saving}>Enregistrer</Button>
          </form>
        </Card>
      )}

      {/* Abonnement */}
      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold mb-4">
          <CreditCard size={15} className="text-gold" />
          Abonnement {user?.role === 'FOURNISSEUR' ? 'Fournisseur' : 'Commerçant'}
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {(user?.role === 'FOURNISSEUR' ? PLANS_FOURNISSEUR : PLANS_COMMERCANT).map(p => {
            const actif = user?.plan === p.id;
            return (
              <button
                key={p.id}
                onClick={() => changerPlan(p.id)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  actif ? 'border-green bg-green/8' : 'border-[var(--border)] hover:border-[var(--border2)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.nom}</span>
                  {actif && <Badge variant="green">Actuel</Badge>}
                </div>
                <div className="font-display font-bold mt-1">{p.prix}</div>
                <div className="text-[11px] text-[var(--text3)] mt-1 leading-snug">{p.desc}</div>
              </button>
            );
          })}
        </div>
        {user?.role === 'FOURNISSEUR' && (
          <p className="text-[11px] text-[var(--text3)] mt-3">
            🎁 Les 15 premiers fournisseurs signés bénéficient du plan Vérifié gratuit pendant 3 mois.
          </p>
        )}
      </Card>
    </div>
  );
}

Parametres.getLayout = (page) => <AppLayout>{page}</AppLayout>;
