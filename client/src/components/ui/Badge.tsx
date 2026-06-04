type BadgeVariant = 'pending' | 'in_progress' | 'completed' | 'verified' | 'rejected' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  pending: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  in_progress: 'bg-sky-400/10 text-sky-400 border-sky-400/30 animate-pulse',
  completed: 'bg-green-400/10 text-green-400 border-green-400/30',
  verified: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  rejected: 'bg-red-400/10 text-red-400 border-red-400/30',
  default: 'bg-slate-400/10 text-slate-400 border-slate-400/30',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-widest border rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
}
