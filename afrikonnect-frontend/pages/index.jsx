// ===== PAGES/INDEX.JSX — Page d'accueil publique avec chatbot =====
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store';
import api from '../lib/api';
import {
  Ship, Shield, Users, PiggyBank, MessageCircle, ShoppingBag,
  ArrowRight, MessageSquare, X, Send, Sparkles
} from 'lucide-react';

const FEATURES = [
  { icon: ShoppingBag, titre: 'Marketplace B2B', desc: 'Plus de 2 000 produits africains certifiés UE, commandés en direct auprès de fournisseurs vérifiés.' },
  { icon: Ship, titre: 'Commandes groupées', desc: 'Partagez un conteneur avec d\'autres boutiques et réduisez vos frais de fret jusqu\'à 60 %.' },
  { icon: Shield, titre: 'Conformité IA', desc: 'Codes douaniers, certificats, étiquetage : notre agent IA vérifie tout avant l\'expédition.' },
  { icon: Users, titre: 'Communauté', desc: 'Un réseau de commerçants qui s\'entraident : bons plans, retours d\'expérience, partenariats.' },
  { icon: PiggyBank, titre: 'Tontine numérique', desc: 'L\'épargne rotative traditionnelle, sécurisée et digitalisée entre commerçants de confiance.' },
  { icon: MessageCircle, titre: 'Messagerie intégrée', desc: 'Discutez directement avec vos fournisseurs, sans intermédiaire ni commission cachée.' },
];

const ETAPES = [
  { num: '01', titre: 'Créez votre profil', desc: 'Commerçant ou fournisseur, inscription gratuite en 2 minutes.' },
  { num: '02', titre: 'Choisissez vos produits', desc: 'Catalogue vérifié, prix directs, commande seul ou en groupe.' },
  { num: '03', titre: 'Suivez votre import', desc: 'Tracking en temps réel et conformité douanière automatisée.' },
  { num: '04', titre: 'Recevez en boutique', desc: 'Livraison finale et gestion de vos stocks intégrée.' },
];

export default function Accueil() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-[var(--bg)]/85 backdrop-blur border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-green" />
            <span className="w-2.5 h-2.5 rounded-full bg-orange" />
            Afrikonnect
          </div>
          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <Link href="/app" className="bg-green text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-green-dark transition-colors">
                Mon tableau de bord
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[var(--text2)] hover:text-[var(--text)] transition-colors">
                  Se connecter
                </Link>
                <Link href="/register" className="bg-green text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-green-dark transition-colors">
                  Essayer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-green opacity-10 blur-[110px] -top-24 -left-24 pointer-events-none" />
        <div className="absolute w-72 h-72 rounded-full bg-orange opacity-10 blur-[90px] top-40 -right-16 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-14 text-center relative">
          <div className="inline-flex items-center gap-2 text-xs text-[var(--text2)] border border-[var(--border2)] rounded-full px-3.5 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            Plateforme B2B · Diaspora africaine en France
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-5">
            Le pont logistique<br />
            entre <em className="text-green not-italic">l'Afrique</em> et votre boutique
          </h1>
          <p className="text-[var(--text2)] max-w-xl mx-auto mb-8 leading-relaxed">
            Commandez auprès de fournisseurs vérifiés en Afrique, gérez vos imports en conformité
            avec les normes françaises, et partagez vos conteneurs pour économiser jusqu'à 60 % sur le fret.
          </p>
          <div className="flex items-center justify-center gap-3 mb-12">
            <Link href="/register" className="bg-green text-white font-medium px-6 py-3 rounded-full hover:bg-green-dark transition-colors inline-flex items-center gap-2">
              Essayer gratuitement <ArrowRight size={16} />
            </Link>
            <a href="#fonctionnalites" className="border border-[var(--border2)] text-[var(--text2)] px-6 py-3 rounded-full hover:text-[var(--text)] hover:border-green/40 transition-colors">
              Découvrir
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 text-center">
            <div><div className="font-display font-bold text-2xl">500+</div><div className="text-xs text-[var(--text3)]">Boutiques actives</div></div>
            <div className="w-px h-10 bg-[var(--border2)]" />
            <div><div className="font-display font-bold text-2xl">120+</div><div className="text-xs text-[var(--text3)]">Fournisseurs vérifiés</div></div>
            <div className="w-px h-10 bg-[var(--border2)]" />
            <div><div className="font-display font-bold text-2xl">15</div><div className="text-xs text-[var(--text3)]">Pays d'Afrique</div></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="fonctionnalites" className="max-w-6xl mx-auto px-5 py-14">
        <h2 className="font-display font-bold text-2xl text-center mb-10">
          Tout ce dont votre boutique a besoin,<br className="hidden sm:block" /> dans une seule plateforme
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.titre} className="card hover:border-green/25 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-green/12 text-green flex items-center justify-center mb-3">
                  <Icon size={17} />
                </div>
                <div className="font-semibold text-sm mb-1.5">{f.titre}</div>
                <p className="text-xs text-[var(--text3)] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <h2 className="font-display font-bold text-2xl text-center mb-10">
          De la commande à votre boutique en 4 étapes
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ETAPES.map((e) => (
            <div key={e.num} className="card">
              <div className="font-display font-bold text-green text-lg mb-2">{e.num}</div>
              <div className="font-semibold text-sm mb-1.5">{e.titre}</div>
              <p className="text-xs text-[var(--text3)] leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TARIFS */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <h2 className="font-display font-bold text-2xl text-center mb-10">Des tarifs simples et transparents</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="card">
            <div className="text-xs text-[var(--text3)] mb-1">Commerçant</div>
            <div className="font-semibold text-sm">Gratuit</div>
            <div className="font-display font-bold text-2xl my-2">0 €</div>
            <p className="text-xs text-[var(--text3)]">5 commandes/mois, marketplace, 1 conteneur groupé</p>
          </div>
          <div className="card border-green/40">
            <div className="text-xs text-green mb-1">Commerçant · Populaire</div>
            <div className="font-semibold text-sm">Pro</div>
            <div className="font-display font-bold text-2xl my-2">29 €<span className="text-sm text-[var(--text3)]">/mois</span></div>
            <p className="text-xs text-[var(--text3)]">Illimité, conformité IA, priorité conteneurs, support WhatsApp</p>
          </div>
          <div className="card">
            <div className="text-xs text-[var(--text3)] mb-1">Fournisseur</div>
            <div className="font-semibold text-sm">Starter</div>
            <div className="font-display font-bold text-2xl my-2">0 €</div>
            <p className="text-xs text-[var(--text3)]">5 produits au catalogue, visibilité standard</p>
          </div>
          <div className="card border-orange/40">
            <div className="text-xs text-orange mb-1">Fournisseur · 3 mois offerts</div>
            <div className="font-semibold text-sm">Vérifié</div>
            <div className="font-display font-bold text-2xl my-2">49 €<span className="text-sm text-[var(--text3)]">/mois</span></div>
            <p className="text-xs text-[var(--text3)]">Badge vérifié, produits illimités, mise en avant marketplace</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-5 py-14 text-center">
        <div className="card max-w-2xl mx-auto py-10">
          <h2 className="font-display font-bold text-2xl mb-3">Prêt à importer malin ?</h2>
          <p className="text-sm text-[var(--text3)] mb-6">Rejoignez les commerçants qui économisent sur chaque conteneur.</p>
          <Link href="/register" className="bg-green text-white font-medium px-6 py-3 rounded-full hover:bg-green-dark transition-colors inline-flex items-center gap-2">
            Créer mon compte gratuit <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--text3)]">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-green" />
          <span className="w-2 h-2 rounded-full bg-orange" />
          <span className="font-display font-bold text-sm text-[var(--text2)]">Afrikonnect</span>
        </div>
        © 2026 Afrikonnect — contact@afrikonnect.fr · Fait avec 🌍 pour la diaspora africaine en France
      </footer>

      {/* CHATBOT */}
      <ChatWidget />
    </div>
  );
}

// ===== WIDGET CHATBOT FLOTTANT =====
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking, open]);

  const envoyer = async (texte) => {
    const question = (texte ?? input).trim();
    if (!question || thinking) return;
    const nouveaux = [...messages, { role: 'user', content: question }];
    setMessages(nouveaux);
    setInput('');
    setThinking(true);
    try {
      const res = await api.post('/chatbot', { messages: nouveaux });
      setMessages([...nouveaux, { role: 'assistant', content: res.data.reponse }]);
    } catch {
      setMessages([...nouveaux, { role: 'assistant', content: 'Je suis momentanément indisponible 😅 Écrivez-nous à contact@afrikonnect.fr' }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le chat"
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green text-white shadow-lg shadow-green/25 flex items-center justify-center hover:bg-green-dark transition-all hover:scale-105"
        >
          <MessageSquare size={22} />
        </button>
      )}

      {/* Fenêtre de chat */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,380px)] h-[520px] bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 h-14 bg-[var(--surface)] border-b border-[var(--border)] flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-green/15 border border-green/25 flex items-center justify-center">
              <Sparkles size={14} className="text-green" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Kora</div>
              <div className="text-[10px] text-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" /> Assistant Afrikonnect
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="text-[var(--text3)] hover:text-[var(--text)] transition-colors">
              <X size={17} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.length === 0 && (
              <>
                <div className="bg-[var(--surface)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text2)] leading-relaxed">
                  Bonjour 👋 Je suis Kora, l'assistant Afrikonnect. Posez-moi vos questions sur la
                  plateforme, les conteneurs groupés, la conformité ou nos tarifs !
                </div>
                <div className="flex flex-col gap-1.5">
                  {['Comment ça marche ?', 'Quels sont vos tarifs ?', 'Je suis fournisseur en Afrique', 'C\'est quoi une commande groupée ?'].map((s) => (
                    <button
                      key={s}
                      onClick={() => envoyer(s)}
                      className="text-left text-xs border border-[var(--border2)] text-[var(--text2)] rounded-xl px-3 py-2 hover:border-green/40 hover:text-green transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}>
                <div className={`text-xs leading-relaxed rounded-xl px-3.5 py-2.5 max-w-[88%] whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-green text-white' : 'bg-[var(--surface)] text-[var(--text2)]'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="bg-[var(--surface)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text3)] w-fit">
                Kora réfléchit…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Saisie */}
          <form
            onSubmit={(e) => { e.preventDefault(); envoyer(); }}
            className="flex gap-2 p-3 border-t border-[var(--border)] flex-shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
              className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3.5 py-2 text-xs text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-green/40 transition-colors"
            />
            <button
              type="submit"
              disabled={thinking}
              aria-label="Envoyer"
              className="w-9 h-9 rounded-full bg-green text-white flex items-center justify-center hover:bg-green-dark transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
