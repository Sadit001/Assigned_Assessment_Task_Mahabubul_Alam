import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Film, Compass, Ticket, Home, Menu, X, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { to: '/movies', label: 'Movies', icon: <Film className="w-4 h-4" /> },
    { to: '/rewatch', label: 'Rewatch Plan', icon: <Compass className="w-4 h-4" /> },
    { to: '/booking', label: 'Booking', icon: <Ticket className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-subtle/80 bg-background/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crimson via-crimson to-amber-700 flex items-center justify-center shadow-crimson-glow border border-crimson/40 group-hover:scale-105 transition-transform duration-200">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-wider text-text-main group-hover:text-white transition-colors flex items-center gap-1.5">
                DOOMSDAY <span className="text-crimson">READY</span>
              </span>
              <span className="text-[10px] tracking-widest text-gold uppercase font-medium">
                MCU Rewatch & Booking
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/5 border border-border-subtle shadow-inner'
                      : 'text-text-muted hover:text-text-main hover:bg-white/[0.03]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'text-crimson' : 'text-text-muted'}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-crimson via-gold to-crimson rounded-full shadow-crimson-glow" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Premiere Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-border-subtle text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Avengers: Doomsday</span>
            <span className="text-gold font-semibold">2026</span>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-muted hover:text-white hover:border-border-highlight transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-subtle bg-surface-dark/95 backdrop-blur-2xl px-4 pt-2 pb-5 space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-crimson/15 border border-crimson/30'
                    : 'text-text-muted hover:text-text-main hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-crimson' : 'text-text-muted'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
