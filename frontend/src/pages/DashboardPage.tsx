import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Film, Compass, Ticket, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { getMovies } from '../api/movies';
import { getCinemas } from '../api/cinemas';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Movie } from '../types';

export const DashboardPage: React.FC = () => {
  const { data: movies = [], isLoading: moviesLoading } = useQuery<Movie[]>({
    queryKey: ['movies'],
    queryFn: () => getMovies(),
  });

  const { data: cinemas = [] } = useQuery({
    queryKey: ['cinemas'],
    queryFn: () => getCinemas(),
  });

  const totalMovies = movies.length;
  const watchedMovies = movies.filter((m: Movie) => m.watched).length;
  const watchedPercentage = totalMovies > 0 ? Math.round((watchedMovies / totalMovies) * 100) : 0;
  const totalRuntimeMinutes = movies.reduce((sum: number, m: Movie) => sum + m.runtime, 0);
  const totalHours = Math.floor(totalRuntimeMinutes / 60);

  // Find Avengers: Doomsday or the latest movie
  const doomsdayMovie = movies.find((m: Movie) => m.title.toLowerCase().includes('doomsday')) || movies[movies.length - 1];

  return (
    <div className="space-y-12 pb-16">
      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-dark border border-border-subtle p-8 sm:p-12 lg:p-16 shadow-cinematic">
        {/* Ambient Radial Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-crimson/15 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] pointer-events-none -ml-32 -mb-32" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge variant="gold" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
              BLINTO TALENT ACCELERATOR 2027
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-tight">
              DOOMSDAY <span className="text-crimson">READY</span>
            </h1>
            <p className="text-lg sm:text-2xl font-display text-gold tracking-wider">
              YOUR MCU JOURNEY STARTS HERE.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-sm sm:text-base text-text-muted leading-relaxed"
          >
            Avengers: Doomsday approaches. Prepare your ultimate cinematic rewatch with real graph-based topological dependency sequencing, progress tracking, and minimum-bundle opening-night watch party calculations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link to={doomsdayMovie ? `/rewatch?target=${doomsdayMovie.id}` : '/rewatch'}>
              <Button variant="primary" size="lg" icon={<Compass className="w-5 h-5" />}>
                Generate Rewatch Plan
              </Button>
            </Link>
            <Link to="/movies">
              <Button variant="secondary" size="lg" icon={<Film className="w-5 h-5" />}>
                Manage MCU Library
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-md">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MCU Movies</span>
            <Film className="w-4 h-4 text-crimson" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-display text-text-main">
            {moviesLoading ? '—' : totalMovies}
          </span>
          <p className="text-xs text-text-muted mt-1">Cataloged in database</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-md">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Watched</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-display text-emerald-400">
            {moviesLoading ? '—' : watchedMovies}
          </span>
          <p className="text-xs text-text-muted mt-1">{watchedPercentage}% complete</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-md">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Runtime</span>
            <Clock className="w-4 h-4 text-gold" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-display text-gold">
            {moviesLoading ? '—' : `${totalHours}h`}
          </span>
          <p className="text-xs text-text-muted mt-1">Epic movie marathon</p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-border-subtle shadow-md">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Venues</span>
            <Ticket className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-display text-text-main">
            {cinemas.length}
          </span>
          <p className="text-xs text-text-muted mt-1">Available for booking</p>
        </div>
      </section>

      {/* Feature Exploration Grid (The 3 Primary Views) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-text-main">
              Mission Modules
            </h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Explore the three core capabilities required for Doomsday preparation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Movies */}
          <Link
            to="/movies"
            className="group p-6 rounded-2xl bg-surface-card border border-border-subtle hover:border-crimson/50 hover:bg-surface-card-hover transition-all duration-300 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-crimson/15 border border-crimson/30 flex items-center justify-center text-crimson group-hover:scale-105 transition-transform">
                <Film className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold font-display text-text-main group-hover:text-white transition-colors">
                  1. Movies & Dependencies
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Manage all MCU titles, edit prerequisite links, toggle watched states with instant persistence, and validate cycle freedom.
                </p>
              </div>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-crimson group-hover:text-crimson-hover">
              <span>Open Movies Library</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Rewatch Plan */}
          <Link
            to="/rewatch"
            className="group p-6 rounded-2xl bg-surface-card border border-border-subtle hover:border-gold/50 hover:bg-surface-card-hover transition-all duration-300 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold font-display text-text-main group-hover:text-white transition-colors">
                  2. Rewatch Roadmap
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Calculate topological ordering for any target MCU movie. Track progress ("4 of 7 watched") and total remaining watch time.
                </p>
              </div>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-gold group-hover:text-gold-hover">
              <span>Generate Watch Plan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Cinema Booking */}
          <Link
            to="/booking"
            className="group p-6 rounded-2xl bg-surface-card border border-border-subtle hover:border-emerald-500/50 hover:bg-surface-card-hover transition-all duration-300 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Ticket className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold font-display text-text-main group-hover:text-white transition-colors">
                  3. Watch-Party Booking
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Optimize cinema bundles using Dynamic Programming. Computes minimum bundles for 1 to 10,000 guests with zero empty seats.
                </p>
              </div>
            </div>
            <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>Book Group Seats</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};
