// ===== PAGES/ADMIN.JSX — Tableau de bord administrateur =====
import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, Badge, Avatar, StatCard, Spinner } from '../components/ui';
import api from '../lib/api';
import { ShieldAlert, Users, Package, TrendingUp } from 'lucide-react';

const STATUT_BADGE = {
  EN_ATTENTE: { label: 'En attente', variant: 'gray' },
  CONFIRME:   { label: 'Confirmé',   variant: 'blue' },
  CHARGE:     { label: 'Chargé',     variant: 'blue' },
  EN_TRANSIT: { label: 'En transit', variant: 'green' },
  DOUANE:     { label: 'Douane',     variant: 'orange' },
  BLOQUE:     { label: 'Bloqué',     variant: 'red' },
  LIVRE:      { label: 'Livré',      variant: 'green' },
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setErreur(err.response?.status === 403
        ? "Cette page est réservée à l'administrateur de la plateforme."
        : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (erreur) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShieldAlert size={40} className="text-orange mb-4" />
        <div className="font-display font-semibold text-lg mb-2">Accès restreint</div>
        <p className="text-sm text-[var(--text3)] max-w-xs">{erreur}</p>
      </div>
    );
  }

  const u = stats.utilisateurs;
  const c = stats.commandes;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="font-display text-xl font-bold">Administration</h1>
        <Badge variant="orange">Privé</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Inscrits au total"
          value={u.total}
          sub={`${u.commercants} commerçants · ${u.fournisseurs} fournisseurs`}
        />
        <StatCard
          label="Nouveaux aujourd'hui"
          value={u.nouveauxAujourdhui}
          sub={u.nouveauxAujourdhui > 0 ? '🎉 En croissance' : 'Rien pour le moment'}
          subColor={u.nouveauxAujourdhui > 0 ? 'green' : 'muted'}
        />
        <StatCard
          label="Nouveaux (7 jours)"
          value={u.nouveaux7j}
          subColor="green"
          sub="Cette semaine"
        />
        <StatCard
          label="Commandes du jour"
          value={c.aujourdhui}
          sub={`${c.total} au total`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Derniers inscrits */}
        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Users size={15} className="text-green" /> Derniers inscrits
          </div>
          {stats.derniersInscrits.length === 0 ? (
            <p className="text-xs text-[var(--text3)] py-6 text-center">Aucun inscrit.</p>
          ) : (
            <div className="space-y-1">
              {stats.derniersInscrits.map(user => {
                const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`;
                const detail = user.boutique
                  ? `${user.boutique.nom}${user.boutique.ville ? ' · ' + user.boutique.ville : ''}`
                  : user.fournisseur
                    ? `${user.fournisseur.nomEntreprise} · ${user.fournisseur.pays}`
                    : user.email;
                return (
                  <div key={user.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                    <Avatar initials={initials} color={user.role === 'FOURNISSEUR' ? 'orange' : 'green'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {user.firstName} {user.lastName}
                        <span className="text-[var(--text3)] font-normal"> — {user.email}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text3)] truncate">{detail}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant={user.role === 'FOURNISSEUR' ? 'orange' : 'green'}>
                        {user.role === 'FOURNISSEUR' ? 'Fournisseur' : 'Commerçant'}
                      </Badge>
                      <div className="text-[10px] text-[var(--text3)] mt-1">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Dernières commandes */}
        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Package size={15} className="text-orange" /> Dernières commandes
          </div>
          {stats.dernieresCommandes.length === 0 ? (
            <p className="text-xs text-[var(--text3)] py-6 text-center">Aucune commande.</p>
          ) : (
            <div className="space-y-1">
              {stats.dernieresCommandes.map(cmd => {
                const badge = STATUT_BADGE[cmd.statut] || STATUT_BADGE.EN_ATTENTE;
                return (
                  <div key={cmd.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">#{cmd.id.slice(-6).toUpperCase()}</div>
                      <div className="text-[11px] text-[var(--text3)]">
                        {cmd.user?.firstName} {cmd.user?.lastName} · {new Date(cmd.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="font-display font-bold text-sm">{cmd.coutTotal.toLocaleString('fr-FR')} €</div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

Admin.getLayout = (page) => <AppLayout>{page}</AppLayout>;
