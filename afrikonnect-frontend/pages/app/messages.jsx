// ===== PAGES/APP/MESSAGES.JSX =====
import { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Avatar, Button, Spinner, EmptyState } from '../../components/ui';
import { messagesAPI } from '../../lib/api';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [texte, setTexte] = useState('');
  const [sending, setSending] = useState(false);

  const charger = () =>
    messagesAPI.list()
      .then(res => setMessages(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { charger(); }, []);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!texte.trim()) return;
    setSending(true);
    try {
      await messagesAPI.send({ contenu: texte });
      setTexte('');
      toast.success('Message envoyé');
      charger();
    } catch {
      toast.error("Échec de l'envoi");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="font-display text-xl font-bold mb-6">Messages</h1>

      <Card>
        {messages.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Aucun message"
            description="Contactez un fournisseur depuis la marketplace ou écrivez un premier message ci-dessous."
          />
        ) : (
          <div className="space-y-1 mb-4">
            {messages.map(m => {
              const initials = `${m.expediteur?.firstName?.[0] ?? '?'}${m.expediteur?.lastName?.[0] ?? ''}`;
              return (
                <div key={m.id} className="flex gap-3 py-3 border-b border-[var(--border)] last:border-0">
                  <Avatar initials={initials} color={m.expediteur?.role === 'FOURNISSEUR' ? 'orange' : 'green'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{m.expediteur?.firstName} {m.expediteur?.lastName}</span>
                      {m.commande && (
                        <span className="text-[10px] text-[var(--text3)]">· Commande #{m.commande.id.slice(-6).toUpperCase()}</span>
                      )}
                      <span className="ml-auto text-[10px] text-[var(--text3)] flex-shrink-0">
                        {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text2)] mt-1 leading-relaxed">{m.contenu}</p>
                  </div>
                  {!m.lu && <span className="w-1.5 h-1.5 rounded-full bg-orange flex-shrink-0 mt-2" />}
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={envoyer} className="flex gap-2 pt-2">
          <input
            value={texte}
            onChange={e => setTexte(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-full px-4 py-2 text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-green/40 transition-colors"
          />
          <Button type="submit" size="sm" loading={sending}>
            <Send size={13} /> Envoyer
          </Button>
        </form>
      </Card>
    </div>
  );
}

Messages.getLayout = (page) => <AppLayout>{page}</AppLayout>;
