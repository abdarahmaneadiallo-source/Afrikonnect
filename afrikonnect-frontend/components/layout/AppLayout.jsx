// ===== COMPONENTS/LAYOUT/APPLAYOUT.JSX =====
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { clsx } from 'clsx';
import { useAuthStore, useUIStore } from '../../lib/store';
import {
  Home, ShoppingBag, Package, Truck, Shield,
  Users, MessageCircle, Settings, Bell, LogOut,
  Menu, X, ChevronRight
} from 'lucide-react';

const NAV = [
  { href: '/app',            icon: Home,          label: 'Tableau de bord', section: null },
  { href: '/app/marketplace', icon: ShoppingBag,   label: 'Marketplace',     section: null },
  { href: '/app/commandes',  icon: Package,        label: 'Commandes',       section: null },
  { href: '/app/logistique', icon: Truck,          label: 'Logistique',      section: 'Outils' },
  { href: '/app/conformite', icon: Shield,         label: 'Conformité',      section: null },
  { href: '/app/communaute', icon: Users,          label: 'Communauté',      section: null },
  { href: '/app/messages',   icon: MessageCircle,  label: 'Messages',        badge: 3, section: 'Compte' },
  { href: '/app/parametres', icon: Settings,       label: 'Paramètres',      section: null },
];

export default function AppLayout({ children }) {
  const router   = useRouter();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { useAuthStore.getState().init(); }, []);

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'MK';
  const plan     = user?.plan || 'FREE';

  const handleLogout = () => { logout(); router.push('/login'); };

  const Sidebar = ({ mobile = false }) => {
    let lastSection = null;
    return (
      <aside className={clsx(
        'flex flex-col bg-[var(--bg2)] border-r border-[var(--border)] h-full overflow-y-auto',
        mobile ? 'w-full' : (sidebarOpen ? 'w-[200px]' : 'w-[56px]')
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-[52px] border-b border-[var(--border)] flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-green" />
          <span className="w-2 h-2 rounded-full bg-orange" />
          {(sidebarOpen || mobile) && (
            <span className="font-display font-bold text-base ml-1">Afrikonnect</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2">
          {NAV.map((item) => {
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;
            const active = router.pathname === item.href ||
              (item.href !== '/app' && router.pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <div key={item.href}>
                {showSection && (sidebarOpen || mobile) && (
                  <div className="text-[10px] text-[var(--text3)] uppercase tracking-widest px-4 pt-4 pb-1 font-medium">
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  onClick={() => mobile && setMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-2.5 px-4 py-2 text-sm transition-all border-l-2',
                    active
                      ? 'text-green bg-green/8 border-green'
                      : 'text-[var(--text2)] border-transparent hover:bg-[var(--surface)] hover:text-[var(--text)]'
                  )}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {(sidebarOpen || mobile) && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="bg-orange text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-[var(--border)] p-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green/15 border border-green/20 flex items-center justify-center text-xs font-semibold text-green flex-shrink-0">
              {initials}
            </div>
            {(sidebarOpen || mobile) && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-[var(--text3)]">Plan {plan}</div>
              </div>
            )}
            {(sidebarOpen || mobile) && (
              <button onClick={handleLogout} className="text-[var(--text3)] hover:text-[var(--text2)] transition-colors">
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg)]">
      {/* Topbar */}
      <header className="flex items-center gap-3 px-4 h-[52px] bg-[var(--bg2)] border-b border-[var(--border)] flex-shrink-0 z-20">
        {/* Toggle sidebar */}
        <button
          onClick={() => { toggleSidebar(); setMobileOpen(!mobileOpen); }}
          className="text-[var(--text2)] hover:text-[var(--text)] transition-colors"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden sm:flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 h-8">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Rechercher..." className="bg-transparent text-xs text-[var(--text)] placeholder-[var(--text3)] outline-none w-full" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Plan badge */}
          {plan !== 'FREE' && (
            <span className="hidden sm:block badge-green text-[10px] px-2 py-0.5 rounded-full font-medium">
              {plan}
            </span>
          )}

          {/* Notifications */}
          <button className="relative w-8 h-8 flex items-center justify-center text-[var(--text2)] hover:text-[var(--text)] transition-colors">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange" />
          </button>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-green/15 border border-green/20 flex items-center justify-center text-xs font-semibold text-green cursor-pointer">
            {initials}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex">
            <div className="w-64 h-full"><Sidebar mobile /></div>
            <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
