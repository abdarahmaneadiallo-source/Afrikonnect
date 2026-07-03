// ===== PAGES/APP/CONFORMITE.JSX =====
import { useState, useRef, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Badge, ProgressBar, Input, Avatar } from '../../components/ui';
import { conformiteAPI } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import { Shield, Scan, Check, X, AlertTriangle, Lock, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const SUGGESTIONS_COMMERCANT = [
  'Quels documents pour importer du poisson fumé ?',
  'Comment étiqueter de la farine de manioc ?',
  'Mon lot est bloqué en douane, que faire ?',
];
const SUGGESTIONS_FOURNISSEUR = [
  'Quels certificats pour exporter du beurre de karité ?',
  'Comment obtenir l\'agrément UE pour le poisson ?',
  'Comment éviter 12% de droits sur le textile ?',
];

const CODES = [
  { nom: 'Huile de palme',   code: '1511 10 90', tva: 5.5,  droit: 0,  libre: true  },
  { nom: 'Farine de manioc', code: '1108 14 00', tva: 5.5,  droit: 0,  libre: true  },
  { nom: 'Poisson fumé',     code: '0305 41 00', tva: 5.5,  droit: 0,  libre: false },
  { nom: 'Beurre de karité', code: '1515 90 91', tva: 20,   droit: 0,  libre: true  },
  { nom: 'Piment séché',     code: '0904 21 10', tva: 5.5,  droit: 0,  libre: true  },
  { nom: 'Tissus wax',       code: '5208',       tva: 20,   droit: 12, libre: false },
  { nom: 'Gari / Attiéké',   code: '1904 10 10', tva: 5.5,  droit: 0,  libre: true  },
];

export default function Conformite() {
  const { user } = useAuthStore();
  const isPro = user?.plan === 'PRO' || user?.plan === 'FOURNISSEUR';

  const [query,   setQuery]   = useState('');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const verifier = async () => {
    if (!query.trim()) return;
    if (!isPro) { toast.error('Fonctionnalité Pro — Passez au plan Pro'); return; }
    setLoading(true);
    try {
      const res = await conformiteAPI.verifier({ produit: query });
      setResult(res.data);
    } catch {
      // Fallback mock
      setResult(MOCK_RESULT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold">Conformité & douanes</h1>
        <Badge variant="green">Score global : 87%</Badge>
      </div>

      {/* Scanner */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} className="text-green" />
          <span className="font-semibold text-sm">Vérificateur de conformité IA</span>
          {isPro && <Badge variant="blue">IA activée</Badge>}
        </div>

        {!isPro ? (
          <div className="bg-[var(--surface2)] rounded-xl p-6 text-center border border-[var(--border2)]">
            <Lock size={28} className="text-[var(--text3)] mx-auto mb-3" />
            <div className="font-semibold text-sm mb-1">Fonctionnalité Pro</div>
            <div className="text-xs text-[var(--text3)] mb-4">
              Le vérificateur de conformité IA est disponible avec le plan Pro (29 €/mois)
            </div>
            <Link href="/app/parametres">
              <Button size="sm">Passer au Pro</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Zone de scan */}
            <div className="bg-[var(--surface2)] border border-dashed border-[var(--border2)] rounded-xl p-6 text-center mb-4 cursor-pointer hover:border-green/30 transition-colors"
              onClick={() => toast('Scanner la caméra disponible sur mobile')}>
              <Scan size={32} className="text-[var(--text3)] mx-auto mb-2" />
              <div className="text-sm text-[var(--text3)]">Cliquez pour scanner un code-barres produit</div>
              <div className="text-xs text-[var(--text3)] mt-1">ou entrez le nom ci-dessous</div>
            </div>

            <div className="flex gap-3">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifier()}
                placeholder="Ex: farine de manioc, poisson fumé, huile de palme..."
                className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-green/40"
              />
              <Button onClick={verifier} loading={loading}>
                <Shield size={14} /> Vérifier
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Résultat */}
      {result && (
        <Card className="mb-4 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">Résultat — {result.produit || query}</span>
            <span className={`font-display font-bold text-lg ${result.analyse.score >= 80 ? 'text-green' : result.analyse.score >= 50 ? 'text-gold' : 'text-red-400'}`}>
              {result.analyse.score}%
            </span>
          </div>
          <ProgressBar
            value={result.analyse.score}
            color={result.analyse.score >= 80 ? 'green' : result.analyse.score >= 50 ? 'orange' : 'red'}
            className="mb-4"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <CheckItem ok={result.analyse.etiquettageFR}  label="Étiquetage en français" sub="Nom, ingrédients, allergènes" />
            <CheckItem ok={result.analyse.datePeremption} label="Date de péremption"      sub="Format DD/MM/YYYY" />
            <CheckItem ok={result.analyse.certificatSanitaire} label="Certificat sanitaire" sub="Document DGCCRF" action={!result.analyse.certificatSanitaire} />
            <CheckItem ok={result.analyse.tracabilite}   label="Traçabilité fournisseur"  sub="Numéro de lot requis" />
          </div>

          {result.codeDouanier && (
            <div className="bg-[var(--surface2)] rounded-lg p-3 text-xs">
              <div className="text-[var(--text3)] mb-1">Code douanier NC</div>
              <div className="font-mono font-medium">{result.codeDouanier}</div>
              <div className="text-[var(--text3)] mt-1">TVA {result.tvaTaux}% · Droit {result.droitDouane}%</div>
            </div>
          )}

          {result.analyse.recommandations?.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-medium text-[var(--text3)] mb-2">Actions recommandées</div>
              <ul className="space-y-1.5">
                {result.analyse.recommandations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text2)]">
                    <span className="w-4 h-4 rounded-full bg-green/15 text-green flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold">{i+1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Agent IA Conformité */}
      <AgentConformite isPro={isPro} role={user?.role} />

      {/* Codes douaniers fréquents */}
      <Card>
        <h2 className="font-semibold text-sm mb-4">Codes douaniers fréquents</h2>
        <div className="divide-y divide-[var(--border)]">
          {CODES.map(c => (
            <div key={c.code} className="flex items-center gap-3 py-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{c.nom}</div>
                <div className="text-xs text-[var(--text3)] font-mono mt-0.5">NC : {c.code} · TVA {c.tva}% · Droit {c.droit}%</div>
              </div>
              <Badge variant={c.libre ? 'green' : 'amber'}>
                {c.libre ? 'Import libre' : 'Contrôlé'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AgentConformite({ isPro, role }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  const suggestions = role === 'FOURNISSEUR' ? SUGGESTIONS_FOURNISSEUR : SUGGESTIONS_COMMERCANT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const envoyer = async (texte) => {
    const question = (texte ?? input).trim();
    if (!question || thinking) return;
    if (!isPro) { toast.error('Agent IA réservé au plan Pro'); return; }

    const nouveaux = [...messages, { role: 'user', content: question }];
    setMessages(nouveaux);
    setInput('');
    setThinking(true);
    try {
      const res = await conformiteAPI.agent(nouveaux);
      setMessages([...nouveaux, { role: 'assistant', content: res.data.reponse }]);
    } catch {
      toast.error('L\'agent est momentanément indisponible');
      setMessages(messages);
    } finally {
      setThinking(false);
    }
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={15} className="text-gold" />
        <span className="font-semibold text-sm">Agent Conformité IA</span>
        <Badge variant="orange">Expert douane & normes UE</Badge>
      </div>
      <p className="text-[11px] text-[var(--text3)] mb-4">
        Posez toutes vos questions réglementaires — réponses adaptées à votre profil
        {role === 'FOURNISSEUR' ? ' fournisseur (export vers la France)' : ' commerçant (import en France)'}.
      </p>

      {/* Fil de discussion */}
      {messages.length === 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => envoyer(s)}
              className="text-xs border border-[var(--border2)] text-[var(--text2)] rounded-full px-3 py-1.5 hover:border-green/40 hover:text-green transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={12} className="text-gold" />
                </div>
              )}
              <div className={`text-xs leading-relaxed rounded-xl px-3.5 py-2.5 max-w-[85%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-green/15 text-[var(--text)]'
                  : 'bg-[var(--surface2)] text-[var(--text2)]'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-gold" />
              </div>
              <div className="bg-[var(--surface2)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text3)]">
                L'agent analyse votre question…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Saisie */}
      <form onSubmit={e => { e.preventDefault(); envoyer(); }} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ex : quels certificats pour importer des crevettes séchées ?"
          className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-full px-4 py-2 text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-green/40 transition-colors"
        />
        <Button type="submit" size="sm" loading={thinking}>
          <Send size={13} /> Demander
        </Button>
      </form>
    </Card>
  );
}

function CheckItem({ ok, label, sub, action }) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--surface2)]">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-green/15 text-green' : 'bg-red-500/15 text-red-400'}`}>
        {ok ? <Check size={12} /> : <X size={12} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium">{label}</div>
        <div className="text-[10px] text-[var(--text3)]">{sub}</div>
      </div>
      {action && (
        <button className="text-[10px] badge-amber px-2 py-0.5 rounded-full cursor-pointer">
          Obtenir
        </button>
      )}
    </div>
  );
}

const MOCK_RESULT = {
  produit: 'Poisson fumé',
  codeDouanier: '0305 41 00',
  tvaTaux: 5.5,
  droitDouane: 0,
  analyse: {
    score: 67,
    etiquettageFR: true,
    datePeremption: true,
    certificatSanitaire: false,
    tracabilite: false,
    recommandations: [
      'Demander le certificat sanitaire DGCCRF à votre fournisseur',
      'Vérifier que le numéro de lot est imprimé sur l\'emballage',
      'Conserver les documents à disposition pour le contrôle douanier',
    ],
    risque: 'MOYEN',
  },
};

Conformite.getLayout = (page) => <AppLayout>{page}</AppLayout>;
