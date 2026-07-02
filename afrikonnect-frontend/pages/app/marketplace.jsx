// ===== PAGES/APP/MARKETPLACE.JSX =====
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Button, Badge, Input, Select } from '../../components/ui';
import { produitsAPI, groupesAPI } from '../../lib/api';
import { ShoppingCart, Star, Users, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '', label: 'Tout' },
  { value: 'epicerie', label: '🌾 Épicerie sèche' },
  { value: 'poisson',  label: '🐟 Poisson & viande' },
  { value: 'cosmetiques', label: '🧴 Cosmétiques' },
  { value: 'epices',   label: '🌿 Épices' },
  { value: 'textile',  label: '👗 Textile' },
];

const PAYS = [
  { value: '', label: 'Tous les pays' },
  { value: 'CI', label: '🇨🇮 Côte d\'Ivoire' },
  { value: 'SN', label: '🇸🇳 Sénégal' },
  { value: 'NG', label: '🇳🇬 Nigeria' },
  { value: 'CM', label: '🇨🇲 Cameroun' },
  { value: 'GH', label: '🇬🇭 Ghana' },
  { value: 'BF', label: '🇧🇫 Burkina Faso' },
];

export default function Marketplace() {
  const [produits,   setProduits]   = useState(MOCK_PRODUITS);
  const [groupes,    setGroupes]    = useState(MOCK_GROUPES);
  const [categorie,  setCategorie]  = useState('');
  const [pays,       setPays]       = useState('');
  const [search,     setSearch]     = useState('');
  const [panier,     setPanier]     = useState([]);
  const [loading,    setLoading]    = useState(false);

  const filtered = produits.filter(p =>
    (!categorie  || p.categorie === categorie) &&
    (!pays       || p.paysCode  === pays) &&
    (!search     || p.nom.toLowerCase().includes(search.toLowerCase()))
  );

  const addToPanier = (produit) => {
    setPanier(prev => {
      const exists = prev.find(i => i.id === produit.id);
      if (exists) return prev.map(i => i.id === produit.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...produit, qty: 1 }];
    });
    toast.success(`${produit.nom} ajouté au panier`);
  };

  const totalPanier = panier.reduce((s, i) => s + i.prix * i.qty, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold">Marketplace</h1>
        {panier.length > 0 && (
          <Button size="sm">
            <ShoppingCart size={14} />
            Panier ({panier.length}) — {totalPanier.toFixed(0)} €
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 h-9 flex-1 min-w-48">
          <Search size={13} className="text-[var(--text3)]" />
          <input
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-[var(--text)] placeholder-[var(--text3)]"
          />
        </div>
        <Select value={categorie} onChange={e => setCategorie(e.target.value)} className="h-9 text-xs">
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
        <Select value={pays} onChange={e => setPays(e.target.value)} className="h-9 text-xs">
          {PAYS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </Select>
      </div>

      {/* Commandes groupées */}
      <div className="bg-green/6 border border-green/20 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-green" />
            <span className="font-medium text-sm">Commandes groupées disponibles</span>
          </div>
          <Badge variant="green">Économisez jusqu'à 60%</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groupes.map(g => (
            <div key={g.id} className="flex items-center gap-3 bg-[var(--surface)] rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-green/15 flex items-center justify-center flex-shrink-0">
                <Users size={14} className="text-green" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{g.origine} → {g.destination}</div>
                <div className="text-[10px] text-[var(--text3)]">{g.membres}/{g.max} boutiques · Départ {g.depart}</div>
              </div>
              <Button variant="success" size="sm" onClick={() => toast.success(`Rejoint le groupe ${g.origine} → ${g.destination}`)}>
                Rejoindre
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Grille produits */}
      <div className="text-xs text-[var(--text3)] mb-3">
        {filtered.length} produit{filtered.length > 1 ? 's' : ''} · Certifiés UE · Étiquetage FR inclus
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <div
            key={p.id}
            className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-4 hover:border-green/25 transition-all cursor-pointer animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
          >
            <div className="text-3xl mb-3">{p.emoji}</div>
            <div className="text-sm font-semibold mb-1">{p.nom}</div>
            <div className="text-xs text-[var(--text3)] mb-3">{p.fournisseur} · {p.pays}</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {p.certifications.map(c => (
                <span key={c} className="text-[9px] bg-green/8 text-green border border-green/15 px-1.5 py-0.5 rounded-full">
                  {c}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-display text-lg font-bold">{p.prix} €</span>
                <span className="text-xs text-[var(--text3)] ml-1">/ {p.unite}</span>
              </div>
              <Button size="sm" onClick={() => addToPanier(p)}>
                <ShoppingCart size={12} /> Ajouter
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--text3)]">
          <div className="text-3xl mb-3">🔍</div>
          <div className="font-medium">Aucun produit trouvé</div>
          <div className="text-sm mt-1">Modifiez vos filtres</div>
        </div>
      )}
    </div>
  );
}

const MOCK_PRODUITS = [
  { id: 1, emoji: '🌴', nom: 'Huile de palme rouge — 20L', fournisseur: 'Kofi Exports', pays: 'Côte d\'Ivoire', paysCode: 'CI', categorie: 'epicerie', prix: 38, unite: '20L', certifications: ['ISO 22000', 'Étiquetage FR'] },
  { id: 2, emoji: '🌾', nom: 'Farine de manioc — 25kg',    fournisseur: 'Dakar Spices',  pays: 'Sénégal',       paysCode: 'SN', categorie: 'epicerie', prix: 22, unite: '25kg', certifications: ['Cert. sanitaire', 'Étiquetage FR'] },
  { id: 3, emoji: '🐟', nom: 'Poisson fumé — lot 5kg',     fournisseur: 'Lagos Foods',   pays: 'Nigeria',       paysCode: 'NG', categorie: 'poisson', prix: 45, unite: '5kg', certifications: ['Sanitaire OK'] },
  { id: 4, emoji: '🧴', nom: 'Beurre de karité pur — 1kg', fournisseur: 'Burkina Naturel', pays: 'Burkina Faso', paysCode: 'BF', categorie: 'cosmetiques', prix: 14, unite: '1kg', certifications: ['Bio certifié', 'Étiquetage FR'] },
  { id: 5, emoji: '🌶', nom: 'Piment séché — 10kg',        fournisseur: 'Dakar Spices',  pays: 'Sénégal',       paysCode: 'SN', categorie: 'epices',  prix: 31, unite: '10kg', certifications: ['Étiquetage FR'] },
  { id: 6, emoji: '🫒', nom: 'Huile de nigelle — 500ml',   fournisseur: 'Morocco Naturel', pays: 'Maroc',         paysCode: 'MA', categorie: 'cosmetiques', prix: 18, unite: '500ml', certifications: ['Bio', 'Étiquetage FR'] },
];

const MOCK_GROUPES = [
  { id: 1, origine: 'Abidjan', destination: 'Lyon',  membres: 3, max: 5, depart: '25 mai' },
  { id: 2, origine: 'Dakar',   destination: 'Paris', membres: 1, max: 5, depart: 'En formation' },
];

Marketplace.getLayout = (page) => <AppLayout>{page}</AppLayout>;
