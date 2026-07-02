// ===== PAGES/APP/LOGISTIQUE.JSX =====
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Badge, Input, Select, Button, Spinner } from '../../components/ui';
import { commandesAPI } from '../../lib/api';
import { Ship, Plane, Truck, Calculator } from 'lucide-react';

const TAUX = { MARITIME: 1.8, AERIEN: 12, ROUTIER: 3.2 };
const DELAIS = { MARITIME: '20–30 jours', AERIEN: '3–5 jours', ROUTIER: '10–15 jours' };
const MODES = [
  { value: 'MARITIME', label: 'Maritime', icon: Ship,  desc: 'Le plus économique pour les gros volumes' },
  { value: 'AERIEN',   label: 'Aérien',   icon: Plane, desc: 'Rapide, pour produits frais ou urgents' },
  { value: 'ROUTIER',  label: 'Routier',  icon: Truck, desc: 'Bon compromis Afrique du Nord / Sahel' },
];

export default function Logistique() {
  const [enTransit, setEnTransit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [poids, setPoids] = useState(100);
  const [mode, setMode] = useState('MARITIME');

  useEffect(() => {
    commandesAPI.list()
      .then(res => setEnTransit(res.data.filter(c => ['EN_TRANSIT', 'CHARGE', 'DOUANE', 'BLOQUE'].includes(c.statut))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cout = Math.round((parseFloat(poids) || 0) * TAUX[mode]);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-6">Logistique</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Calculateur de fret */}
        <Card>
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Calculator size={15} className="text-green" /> Calculateur de fret
          </div>
          <div className="space-y-3">
            <Input label="Poids total (kg)" type="number" min="1" value={poids} onChange={e => setPoids(e.target.value)} />
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(m => {
                const Icon = m.icon;
                const active = mode === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs transition-all ${
                      active ? 'border-green bg-green/10 text-green' : 'border-[var(--border)] text-[var(--text2)] hover:border-[var(--border2)]'
                    }`}
                  >
                    <Icon size={18} />
                    {m.label}
                  </button>
                );
              })}
            </div>
            <div className="bg-[var(--surface2)] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[var(--text3)]">Coût estimé</div>
                <div className="font-display text-2xl font-bold">{cout.toLocaleString('fr-FR')} €</div>
                <div className="text-[11px] text-[var(--text3)] mt-0.5">Délai : {DELAIS[mode]}</div>
              </div>
              <Badge variant="green">{TAUX[mode]} €/kg</Badge>
            </div>
            <p className="text-[11px] text-[var(--text3)]">
              💡 Rejoignez une commande groupée pour réduire ce coût jusqu'à 60 %.
            </p>
          </div>
        </Card>

        {/* Expéditions en cours */}
        <Card>
          <div className="text-sm font-semibold mb-4">Expéditions en cours</div>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : enTransit.length === 0 ? (
            <p className="text-xs text-[var(--text3)] py-8 text-center">Aucune expédition en cours.</p>
          ) : (
            <div className="space-y-3">
              {enTransit.map(cmd => {
                const dernierSuivi = cmd.suivis?.[0];
                const pct = { CHARGE: 30, EN_TRANSIT: 55, DOUANE: 80, BLOQUE: 80 }[cmd.statut] || 10;
                return (
                  <div key={cmd.id} className="border border-[var(--border)] rounded-xl p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">#{cmd.id.slice(-6).toUpperCase()}</span>
                      <Badge variant={cmd.statut === 'BLOQUE' ? 'red' : 'green'}>
                        {cmd.statut === 'BLOQUE' ? 'Bloqué' : cmd.statut === 'DOUANE' ? 'Douane' : 'En transit'}
                      </Badge>
                    </div>
                    <div className="h-1 bg-[var(--surface2)] rounded-full overflow-hidden my-2">
                      <div
                        className={`h-full rounded-full ${cmd.statut === 'BLOQUE' ? 'bg-red-400' : 'bg-green'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[var(--text3)]">
                      {dernierSuivi ? `${dernierSuivi.description}${dernierSuivi.lieu ? ` — ${dernierSuivi.lieu}` : ''}` : '—'}
                    </div>
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

Logistique.getLayout = (page) => <AppLayout>{page}</AppLayout>;
