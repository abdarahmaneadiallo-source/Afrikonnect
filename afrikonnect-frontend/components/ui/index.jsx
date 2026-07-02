// ===== COMPONENTS/UI/INDEX.JSX — Composants réutilisables =====
import { clsx } from 'clsx';

// ===== BUTTON =====
export function Button({ children, variant = 'primary', size = 'md', className, disabled, loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:  'bg-green text-white hover:bg-green-dark active:scale-95',
    ghost:    'bg-transparent text-[var(--text2)] border border-[var(--border2)] hover:bg-[var(--surface2)] hover:text-[var(--text)]',
    danger:   'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25',
    success:  'bg-green/15 text-green border border-green/25 hover:bg-green/25',
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// ===== BADGE =====
export function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={clsx('badge-' + variant, 'text-[10px] px-2 py-0.5 rounded-full font-medium', className)}>
      {children}
    </span>
  );
}

// ===== CARD =====
export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={clsx('card', hover && 'hover:border-[var(--border2)] cursor-pointer', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ===== STAT CARD =====
export function StatCard({ label, value, sub, subColor = 'muted', icon }) {
  const subColors = {
    green: 'text-green',
    red:   'text-red-400',
    muted: 'text-[var(--text3)]',
  };
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="text-[11px] text-[var(--text3)] mb-1">{label}</div>
      <div className="font-display text-2xl font-bold">{value}</div>
      {sub && <div className={clsx('text-[11px] mt-0.5', subColors[subColor])}>{sub}</div>}
    </div>
  );
}

// ===== INPUT =====
export function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-[var(--text3)] font-medium">{label}</label>}
      <input
        className={clsx(
          'bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text3)]',
          'focus:outline-none focus:border-green/40 transition-colors',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

// ===== SELECT =====
export function Select({ label, children, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-[var(--text3)] font-medium">{label}</label>}
      <select
        className={clsx(
          'bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)]',
          'focus:outline-none focus:border-green/40 transition-colors',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ===== PROGRESS BAR =====
export function ProgressBar({ value, color = 'green', className }) {
  const colors = {
    green:  'bg-green',
    orange: 'bg-orange',
    red:    'bg-red-400',
    blue:   'bg-blue-400',
  };
  return (
    <div className={clsx('h-1 bg-[var(--surface2)] rounded-full overflow-hidden', className)}>
      <div
        className={clsx('h-full rounded-full transition-all duration-500', colors[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ===== AVATAR =====
export function Avatar({ initials, color = 'green', size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' };
  const colors = {
    green:  'bg-green/15 text-green border-green/20',
    orange: 'bg-orange/15 text-orange border-orange/20',
    blue:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
    amber:  'bg-gold/15 text-gold border-gold/20',
  };
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-semibold border flex-shrink-0', sizes[size], colors[color])}>
      {initials}
    </div>
  );
}

// ===== EMPTY STATE =====
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="font-display font-semibold text-lg mb-2">{title}</div>
      <div className="text-sm text-[var(--text3)] mb-6 max-w-xs">{description}</div>
      {action}
    </div>
  );
}

// ===== LOADING SPINNER =====
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={clsx('border-2 border-[var(--border2)] border-t-green rounded-full animate-spin', sizes[size])} />
  );
}

// ===== DIVIDER =====
export function Divider({ label }) {
  if (!label) return <div className="border-t border-[var(--border)] my-4" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 border-t border-[var(--border)]" />
      <span className="text-[10px] text-[var(--text3)] uppercase tracking-wider">{label}</span>
      <div className="flex-1 border-t border-[var(--border)]" />
    </div>
  );
}
