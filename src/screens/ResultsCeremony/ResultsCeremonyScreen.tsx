import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Users, Zap, Star } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useResultsStore } from '../../store/resultsStore';
import { useVotingStore } from '../../store/votingStore';
import { useConfetti } from '../../hooks/useConfetti';
import { MOVIE_POOL } from '../../data/movies';

export function ResultsCeremonyScreen() {
  const { rematch, newSession, participants } = useSessionStore();
  const results = useResultsStore(s => s.results);
  const clearResults = useResultsStore(s => s.clearResults);
  const resetVoting = useVotingStore(s => s.resetVoting);
  const { fireConfetti, fireBurst } = useConfetti();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setRevealed(true);
      fireBurst();
      setTimeout(() => fireConfetti(), 300);
    }, 800);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!results) return null;

  const movieMap = new Map(MOVIE_POOL.map(m => [m.id, m]));
  const winner = movieMap.get(results.winner.movieId);
  const podiumMovies = results.podium.map(s => ({
    score: s,
    movie: movieMap.get(s.movieId),
  }));

  const handleRematch = () => {
    clearResults();
    resetVoting();
    rematch();
  };

  const handleNewSession = () => {
    clearResults();
    resetVoting();
    newSession();
  };

  return (
    <div className="screen !justify-start !pt-0 overflow-y-auto" style={{ background: '#0a0a0c' }}>
      {/* ── Background: blurred winner poster ── */}
      <AnimatePresence>
        {revealed && winner && (
          <motion.div
            className="fixed inset-0 z-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <img
              src={winner.poster}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'blur(40px) brightness(0.2) saturate(1.2)', transform: 'scale(1.2)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16 pb-32">
        {/* WINNER HERO SECTION */}
        <AnimatePresence>
          {revealed && winner && (
            <motion.div
              className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 mb-24"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Winner Poster - Huge */}
              <motion.div
                className="w-full md:w-1/2 max-w-[400px] shrink-0"
                initial={{ scale: 0.9, opacity: 0, rotateY: 20 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.2, type: 'spring' }}
                style={{ perspective: '1000px' }}
              >
                <div className="relative rounded-[24px] overflow-hidden" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)' }}>
                  <img src={winner.poster} alt={winner.title} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#f5b21a]/20 to-transparent mix-blend-overlay" />
                </div>
              </motion.div>

              {/* Winner Details */}
              <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                <motion.div
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-6"
                  style={{ background: 'rgba(245,178,26,0.15)', color: '#f5b21a', border: '1px solid rgba(245,178,26,0.3)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Trophy size={16} /> Tonight's Pick
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tighter text-white leading-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {winner.title}
                </motion.h1>

                <motion.div
                  className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 text-lg font-medium"
                  style={{ color: '#a0a0b8' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <span className="text-white bg-white/10 px-3 py-1 rounded-md">{winner.year}</span>
                  <span>{winner.runtime} min</span>
                  <span>•</span>
                  <span>{winner.genres.join(', ')}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#f5b21a]">
                    <Star size={18} fill="currentColor" /> {winner.meta.imdbRating ?? 'N/A'}
                  </span>
                </motion.div>

                <motion.div
                  className="inline-flex items-center gap-2 text-2xl font-black mb-8"
                  style={{ color: '#f5b21a' }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, type: 'spring' }}
                >
                  <Zap size={24} />
                  Consensus Score: {results.winner.totalScore}
                </motion.div>

                <motion.p
                  className="text-xl italic leading-relaxed"
                  style={{ color: '#d0d0df' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  "{results.rationale}"
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RUNNERS UP (PODIUM) */}
        {revealed && podiumMovies.length > 1 && (
          <motion.div 
            className="mb-24"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
          >
            <h3 className="text-2xl font-bold text-center mb-10 text-white tracking-tight">Runner-Ups</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
              {podiumMovies.slice(1, 4).map((item, idx) => {
                if (!item.movie) return null;
                return (
                  <div key={item.movie.id} className="flex flex-col items-center">
                    <div className="relative w-full max-w-[240px] aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-2xl group border border-white/5">
                      <img src={item.movie.poster} alt={item.movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                      <div className="absolute bottom-0 left-0 p-4 w-full">
                        <span className="inline-block px-2 py-1 bg-black/50 backdrop-blur-md rounded-md text-xs font-bold text-[#f5b21a] mb-2">
                          #{idx + 2}
                        </span>
                        <h4 className="text-lg font-bold text-white leading-tight">{item.movie.title}</h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ACTION BUTTONS */}
        {revealed && (
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
          >
            <button className="btn-primary text-lg px-8 py-4 w-full sm:w-auto" onClick={handleRematch}>
              <RotateCcw size={20} /> Play Again
            </button>
            <button className="bg-transparent text-white border border-white/20 hover:bg-white/5 hover:border-white/40 transition-all text-lg px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 w-full sm:w-auto" onClick={handleNewSession}>
              <Users size={20} /> New Group
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
