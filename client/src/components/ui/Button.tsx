import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-sky-500 hover:bg-sky-400 text-white shadow-[0_0_10px_rgba(14,165,233,0.3)]',
  secondary: 'bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700',
  danger: 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30',
  ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
};

export function Button({ variant = 'primary', isLoading, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : children}
    </button>
  );
}
