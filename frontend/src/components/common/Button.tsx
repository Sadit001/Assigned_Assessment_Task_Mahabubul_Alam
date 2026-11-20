import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold tracking-wide',
  };

  const variantClasses = {
    primary:
      'bg-crimson hover:bg-crimson-hover text-white shadow-crimson-glow focus:ring-crimson border border-crimson/50 hover:shadow-lg',
    gold: 'bg-gold hover:bg-gold-hover text-black shadow-gold-glow focus:ring-gold border border-gold/50 font-semibold',
    secondary:
      'bg-surface-card hover:bg-surface-card-hover text-text-main border border-border-subtle hover:border-border-highlight focus:ring-border-highlight',
    outline:
      'bg-transparent hover:bg-white/5 text-text-main border border-border-subtle hover:border-crimson focus:ring-crimson',
    ghost:
      'bg-transparent hover:bg-white/5 text-text-muted hover:text-text-main focus:ring-border-subtle',
    danger:
      'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
