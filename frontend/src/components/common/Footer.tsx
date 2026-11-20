import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border-subtle/60 bg-surface-dark/50 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-crimson/20 border border-crimson/40 flex items-center justify-center text-crimson">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-sm tracking-wider text-text-main">
                DOOMSDAY <span className="text-crimson">READY</span>
              </p>
              <p className="text-xs text-text-muted">YOUR MCU JOURNEY STARTS HERE.</p>
            </div>
          </div>

          <div className="text-xs text-text-muted text-center md:text-right space-y-1">
            <p>Blinto Talent Accelerator 2027 • Full Stack Developer Assessment</p>
            <p className="flex items-center justify-center md:justify-end gap-1">
              Crafted with <Heart className="w-3 h-3 text-crimson fill-crimson" /> using React, Node.js, TypeScript & PostgreSQL
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
