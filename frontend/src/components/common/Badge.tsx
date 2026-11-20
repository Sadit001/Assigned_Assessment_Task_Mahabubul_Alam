import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'crimson' | 'gold' | 'emerald' | 'slate' | 'amber';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variantClasses = {
    crimson: 'bg-crimson/15 text-crimson-hover border border-crimson/30',
    gold: 'bg-gold/15 text-gold-hover border border-gold/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    slate: 'bg-surface-card text-text-muted border border-border-subtle',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
