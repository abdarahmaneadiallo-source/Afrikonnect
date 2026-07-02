// ===== PAGES/APP/COMMANDES.JSX =====
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Badge, Button, Spinner, EmptyState } from '../../components/ui';
import { commandesAPI } from '../../lib/api';
import { Package, Ship, Plane, Truck, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

const STATUT_BADGE = {
  EN_ATTENTE: { label: 'En attente', variant: 'gray' },
  CONFIRME:   { label: 'Confirmé',   variant: 'blue' },
  CHARGE:     { label: 'Chargé',     variant: 'blue' },
  EN_TRANSIT: { label: 'En transit', variant: 'green' },
  DOUANE:     { label: 'Douane',     variant: 'orange' },
  BLOQUE:     { label: 'Bloqué',     variant: 'red' },
  LIVRE:      { label: 'Livré',      variant: 'green' },
  ANNULE:     { label: 'Annulé',     variant: 'gray' },
};

const TRANSPORT_ICON = { MARITIME: Ship, AERIEN: Plane, ROUTIER: Truck };
const TRANSPORT_LABEL = { MARITIME: 'Maritime', AERIEN: 'Aérien', ROUTIER: 'Routier' };

const STATUT_DOT = {
  EN_ATTENTE: 'bg-[var(--text3)]', CONFIRME: 'bg-blue-400', CHARGE: 'bg-blue-400',
  EN_TRANSIT: 'bg-green', DOUANE: 'bg-orange', BLOQUE: 'bg-red-400', LIVRE: 'bg-green',
};

function Timeline({ suivis }) {
  return (
    <div className="mt-4 pl-1">
      {suivis.map((s, i) => (
        <div key={s.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${STATUT_DOT[s.statut] || 'bg-[var(--text3)]'}`} />
            {i < suivis.length - 1 && <span className="w-px flex-1 min-h-[20px] bg-[var(--border2)] my-1" />}
          </div>
          <div className="pb-4">
            <div className="text-xs font-medium">{s.description}</div>
            <div className="text-[11px] text-[var(--text3)] flex items-center gap-1 mt-0.5">
              {s.lieu && <><MapPin size={10} /> {s.lieu} · </>}
              {new Date(s.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Commandes() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    commandesAPI.list()
      .then(res => setCommandes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-6">Commandes</h1>

      {commandes.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Aucune commande"
          description="Passez votre première commande depuis la marketplace."
        />
      ) : (
        <div className="space-y-3">
          {commandes.map((cmd) => {
            const badge = STATUT_BADGE[cmd.statut] || STATUT_BADGE.EN_ATTENTE;
            const TIcon = TRANSPORT_ICON[cmd.modeTransport] || Ship;
            const ref = `#${cmd.id.slice(-6).toUpperCase()}`;
            const open = openId === cmd.id;
            const produits = cmd.lignes?.map(l => l.produit?.nom).filter(Boolean).join(', ');
            return (
              <Card key={cmd.id}>
                <button
                  className="w-full flex items-center gap-3 text-left"
                  onClick={() => setOpenId(open ? null : cmd.id)}
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface2)] flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-[var(--text2)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{ref} — {produits || 'Commande'}</div>
                    <div className="text-[11px] text-[var(--text3)] flex items-center gap-2 mt-0.5">
                      <TIcon size={11} /> {TRANSPORT_LABEL[cmd.modeTransport]}
                      <span>·</span> {cmd.poids} kg
                      <span>·</span> Fret {cmd.coutFret} €
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-display font-bold text-sm">{cmd.coutTotal.toLocaleString('fr-FR')} €</div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  {open ? <ChevronUp size={16} className="text-[var(--text3)]" /> : <ChevronDown size={16} className="text-[var(--text3)]" />}
                </button>

                {open && (
                  <div className="border-t border-[var(--border)] mt-3 pt-1">
                    {cmd.alertes?.filter(a => !a.isResolu).map(a => (
                      <div key={a.id} className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2 mt-3 text-xs text-red-400">
                        ⚠ {a.description}
                      </div>
                    ))}
                    {cmd.suivis?.length > 0 && <Timeline suivis={cmd.suivis} />}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

Commandes.getLayout = (page) => <AppLayout>{page}</AppLayout>;
