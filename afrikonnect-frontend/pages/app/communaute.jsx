// ===== PAGES/APP/COMMUNAUTE.JSX =====
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Badge, Button, Spinner } from '../../components/ui';
import { groupesAPI, tontinesAPI } from '../../lib/api';
import { Users, PiggyBank, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Communaute() {
  const [groupes, setGroupes] = useState([]);
  const [tontines, setTontines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([groupesAPI.list(), tontinesAPI.list()])
      .then(([g, t]) => { setGroupes(g.data); setTontines(t.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rejoindre = async (id) => {
    toast.success('Demande envoyée ! Ajoutez vos produits depuis la marketplace.');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-6">Communauté</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Commandes groupées */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users size={15} className="text-green" /> Commandes groupées
            </div>
            <Badge variant="green">Économisez jusqu'à 60 %</Badge>
          </div>
          {groupes.length === 0 ? (
            <p className="text-xs text-[var(--text3)] py-8 text-center">Aucun groupe ouvert pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {groupes.map(g => (
                <div key={g.id} className="border border-[var(--border)] rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{g.titre}</div>
                    <div className="text-[11px] text-[var(--text3)] mt-0.5">
                      {g.origine} <ArrowRight size={9} className="inline" /> {g.destination}
                      {' · '}{g._count?.commandes ?? 0}/{g.maxBoutiques} boutiques
                      {' · '}Départ {new Date(g.dateDepart).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="h-1 bg-[var(--surface2)] rounded-full overflow-hidden mt-2 max-w-[140px]">
                      <div className="h-full bg-green rounded-full" style={{ width: `${((g._count?.commandes ?? 0) / g.maxBoutiques) * 100}%` }} />
                    </div>
                  </div>
                  <Button size="sm" onClick={() => rejoindre(g.id)}>Rejoindre</Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Tontines */}
        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <PiggyBank size={15} className="text-gold" /> Mes tontines
          </div>
          {tontines.length === 0 ? (
            <p className="text-xs text-[var(--text3)] py-8 text-center">Vous n'êtes membre d'aucune tontine.</p>
          ) : (
            <div className="space-y-3">
              {tontines.map(t => {
                const totalVerse = t.versements?.filter(v => v.statut === 'PAYE').reduce((s, v) => s + v.montant, 0) ?? 0;
                return (
                  <div key={t.id} className="border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{t.nom}</div>
                      <Badge variant={t.statut === 'ACTIF' ? 'green' : 'gray'}>{t.statut === 'ACTIF' ? 'Active' : t.statut}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="bg-[var(--surface2)] rounded-lg py-2">
                        <div className="font-display font-bold text-sm">{t.montantPart} €</div>
                        <div className="text-[10px] text-[var(--text3)]">Part {t.frequence === 'MENSUEL' ? 'mensuelle' : t.frequence.toLowerCase()}</div>
                      </div>
                      <div className="bg-[var(--surface2)] rounded-lg py-2">
                        <div className="font-display font-bold text-sm">{t.membres?.length ?? 0}</div>
                        <div className="text-[10px] text-[var(--text3)]">Membres</div>
                      </div>
                      <div className="bg-[var(--surface2)] rounded-lg py-2">
                        <div className="font-display font-bold text-sm text-green">{totalVerse} €</div>
                        <div className="text-[10px] text-[var(--text3)]">Versé</div>
                      </div>
                    </div>
                    {t.membres?.length > 0 && (
                      <div className="text-[11px] text-[var(--text3)] mt-3">
                        Ordre de rotation : {t.membres.map(m => `${m.user?.firstName ?? '?'} ${m.user?.lastName?.[0] ?? ''}.`).join(' → ')}
                      </div>
                    )}
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

Communaute.getLayout = (page) => <AppLayout>{page}</AppLayout>;
