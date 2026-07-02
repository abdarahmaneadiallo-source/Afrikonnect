// ===== PAGES/APP/INDEX.JSX — Dashboard principal =====
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { StatCard, Card, Badge, Button, ProgressBar, Avatar } from '../../components/ui';
import { commandesAPI, conformiteAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import Link from 'next/link';
import { AlertTriangle, Package, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';

const STATUT_CONFIG = {
  EN_ATTENTE: { label: 'En attente',  badge: 'gray'   },
  CONFIRME:   { label: 'Confirmé',    badge: 'blue'   },
  CHARGE:     { label: 'Chargé',      badge: 'blue'   },
  EN_TRANSIT: { label: 'En transit',  badge: 'green'  },
  DOUANE:     { label: 'Douane',      badge: 'amber'  },
  BLOQUE:     { label: 'Bloqué',      badge: 'red'    },
  LIVRE:      { label: 'Livré',       badge: 'green'  },
};

const PROGRESS = {
  EN_ATTENTE: 5, CONFIRME: 20, CHARGE: 35,
  EN_TRANSIT: 55, DOUANE: 70, BLOQUE: 65, LIVRE: 100,
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commandesAPI.list()
      .then(r => setCommandes(r.data))
      .catch(() => setCommandes(MOCK_COMMANDES))
      .finally(() => setLoading(false));
  }, []);

  const actives  = commandes.filter(c => !['LIVRE', 'ANNULE'].includes(c.statut));
  const bloquees = commandes.filter(c => c.statut === 'BLOQUE');
  const depenses = commandes.reduce((s, c) => s + (c.coutTotal || 0), 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold">
            Bonjour, {user?.firstName || 'Mamadou'} 👋
          </h1>
          <p className="text-sm text-[var(--text2)] mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/app/marketplace">
          <Button size="sm" className="hidden sm:flex">
            <Package size={14} /> Nouvelle commande
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 delay-100 animate-fade-up">
        <StatCard label="Commandes ce mois" value={commandes.length || 24} sub="+3 cette semaine" subColor="green" />
        <StatCard label="Dépenses import"   value={`${(depenses || 4820).toLocaleString('fr-FR')} €`} sub="Budget: 6 000 €" />
        <StatCard label="Alertes actives"   value={bloquees.length || 3} sub={bloquees.length ? 'Action requise' : 'Tout va bien'} subColor={bloquees.length ? 'red' : 'green'} />
        <StatCard label="Score conformité"  value="87%" sub="Bon niveau" subColor="green" />
      </div>

      {/* Alertes urgentes */}
      {bloquees.length > 0 && (
        <div className="bg-orange/8 border border-orange/20 rounded-xl p-4 mb-5 flex items-start gap-3 delay-200 animate-fade-up">
          <AlertTriangle size={16} className="text-orange flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-orange">{bloquees.length} lot{bloquees.length > 1 ? 's' : ''} bloqué{bloquees.length > 1 ? 's' : ''} en douane</div>
            <div className="text-xs text-[var(--text3)] mt-0.5">Action requise sous 48h pour éviter la destruction</div>
          </div>
          <Link href="/app/commandes">
            <Button variant="danger" size="sm">Résoudre</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commandes en cours */}
        <Card className="delay-200 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm">Commandes en cours</h2>
            <Badge variant="amber">{actives.length || 3} actives</Badge>
          </div>
          <div className="space-y-3">
            {(loading ? MOCK_COMMANDES : commandes).slice(0, 3).map((c) => {
              const cfg  = STATUT_CONFIG[c.statut] || STATUT_CONFIG.EN_TRANSIT;
              const prog = PROGRESS[c.statut] || 50;
              return (
                <Link href={`/app/commandes/${c.id}`} key={c.id}>
                  <div className="group hover:bg-[var(--surface2)] rounded-lg p-2.5 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-[var(--text3)]">#{c.id?.slice(-6).toUpperCase() || '4821'}</span>
                      <Badge variant={cfg.badge}>{cfg.label}</Badge>
                    </div>
                    <div className="text-sm font-medium mb-2">{c.nom || c.lignes?.[0]?.produit?.nom || 'Huile de palme 20L'}</div>
                    <ProgressBar value={prog} color={c.statut === 'BLOQUE' ? 'red' : 'green'} />
                    <div className="text-[10px] text-[var(--text3)] mt-1">{prog}% — {cfg.label}</div>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link href="/app/commandes" className="flex items-center gap-1 text-xs text-green hover:text-green-dark transition-colors mt-3">
            Voir toutes les commandes <ArrowRight size={12} />
          </Link>
        </Card>

        {/* Alertes & notifs */}
        <Card className="delay-300 animate-fade-up">
          <h2 className="font-display font-semibold text-sm mb-4">Alertes & notifications</h2>
          <div className="space-y-3">
            <AlertRow
              icon={<AlertTriangle size={13} />}
              iconBg="bg-orange/15 text-orange"
              title="Lot #4819 bloqué en douane"
              sub="Certificat sanitaire manquant — action sous 48h"
              action={<Link href="/app/conformite"><Button variant="ghost" size="sm">Résoudre</Button></Link>}
            />
            <AlertRow
              icon={<Package size={13} />}
              iconBg="bg-gold/15 text-gold"
              title="Stock faible — Gari 25kg"
              sub="8 unités restantes · Seuil d'alerte : 10"
            />
            <AlertRow
              icon={<CheckCircle size={13} />}
              iconBg="bg-green/15 text-green"
              title="Nouveau fournisseur vérifié"
              sub="Kofi Exports — Côte d'Ivoire · ★★★★★"
            />
            <AlertRow
              icon={<TrendingUp size={13} />}
              iconBg="bg-blue-500/15 text-blue-400"
              title="Score conformité amélioré"
              sub="Passé de 72% à 87% cette semaine"
            />
          </div>
        </Card>

        {/* Fournisseurs recommandés */}
        <Card className="md:col-span-2 delay-400 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm">Fournisseurs recommandés</h2>
            <Badge variant="gray">Vérifiés ✓</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FOURNISSEURS.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface2)] transition-colors cursor-pointer group">
                <Avatar initials={f.initials} color={f.color} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{f.nom}</div>
                  <div className="text-xs text-[var(--text3)] truncate">{f.pays} · {f.categories}</div>
                  <div className="text-[10px] text-gold mt-0.5">{f.stars}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] text-[var(--text3)]">Délai moy.</div>
                  <div className="text-xs font-semibold">{f.delai} j</div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Contact
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AlertRow({ icon, iconBg, title, sub, action }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)] last:border-0 last:pb-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium">{title}</div>
        <div className="text-[11px] text-[var(--text3)] mt-0.5">{sub}</div>
      </div>
      {action}
    </div>
  );
}

// Mock data pour le développement
const MOCK_COMMANDES = [
  { id: 'cmd_4821', statut: 'EN_TRANSIT', nom: 'Huile de palme 20L',    coutTotal: 380 },
  { id: 'cmd_4819', statut: 'BLOQUE',     nom: 'Farine de manioc 50kg', coutTotal: 220 },
  { id: 'cmd_4815', statut: 'CONFIRME',   nom: 'Poisson fumé — lot',    coutTotal: 450 },
];

const FOURNISSEURS = [
  { id: 1, initials: 'KE', color: 'orange', nom: 'Kofi Exports',    pays: 'Côte d\'Ivoire', categories: 'Épicerie sèche, huiles', stars: '★★★★★', delai: 18 },
  { id: 2, initials: 'DS', color: 'green',  nom: 'Dakar Spices',    pays: 'Sénégal',        categories: 'Épices, condiments',     stars: '★★★★☆', delai: 22 },
  { id: 3, initials: 'LF', color: 'blue',   nom: 'Lagos Foods',     pays: 'Nigeria',        categories: 'Poisson, viandes',       stars: '★★★★☆', delai: 25 },
  { id: 4, initials: 'BN', color: 'amber',  nom: 'Burkina Naturel', pays: 'Burkina Faso',   categories: 'Cosmétiques bio',        stars: '★★★★★', delai: 30 },
];

Dashboard.getLayout = (page) => <AppLayout>{page}</AppLayout>;
