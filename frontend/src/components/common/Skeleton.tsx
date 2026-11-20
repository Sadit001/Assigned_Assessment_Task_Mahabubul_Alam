import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-surface-card/60 rounded-lg border border-border-subtle/50 ${className}`}
    />
  );
};

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="space-y-2 pt-2 border-t border-border-subtle/40">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-1.5 flex-wrap">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
};
