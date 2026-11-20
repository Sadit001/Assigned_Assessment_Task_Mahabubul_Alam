import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="w-20 h-20 rounded-3xl bg-crimson/15 border border-crimson/30 flex items-center justify-center text-crimson shadow-crimson-glow">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold text-gold tracking-widest uppercase">
          404 TIMELINE ANOMALY
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-text-main">
          Nexus Point Not Found
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          The reality branch you are attempting to traverse does not exist in this sector of the multiverse.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link to="/">
          <Button variant="primary" icon={<Home className="w-4 h-4" />}>
            Return to Headquarters
          </Button>
        </Link>
        <Link to="/movies">
          <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
            Browse Movies
          </Button>
        </Link>
      </div>
    </div>
  );
};
