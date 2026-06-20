import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--brand)', color: '#fff' },
  secondary: { background: 'var(--input-bg)', color: 'var(--text-secondary)' },
  ghost: { background: 'transparent', color: 'var(--text-secondary)' },
  danger: { background: 'var(--input-bg)', color: '#EF4444' },
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', style, ...props }: Props) {
  return (
    <button
      className={`text-sm px-3.5 py-1.5 rounded-md font-medium inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors ${className}`}
      style={{ ...styles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
