import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', type, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      if (type === 'datetime-local' || type === 'date' || type === 'time') {
        e.target.blur();
      }
    };

    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm text-slate-400">{label}</label>}
        <input
          ref={ref}
          type={type}
          className={`w-full px-3 py-2 bg-slate-800 border rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors ${error ? 'border-red-400' : 'border-slate-700'} ${className}`}
          onChange={handleChange}
          {...props}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
