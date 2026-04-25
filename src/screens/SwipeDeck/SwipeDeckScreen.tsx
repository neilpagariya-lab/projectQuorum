import { useCallback, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, X, ThumbsUp, Clock, Star } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useVotingStore } from '../../store/votingStore';
import { useKeyboardVoting } from '../../hooks/useKeyboardVoting';
import { VoteType, Movie } from '../../domain/types';

const SWIPE_THRESHOLD = 100;
const THROW_VELOCITY = 500;

export function SwipeDeckScreen() {
  const { getCurrentParticipant, activeDeck, turnComplete } = useSessionStore();
  const { recordVote, getCurrentQueue, markCardShown } = useVotingStore();
  const participant = getCurrentParticipant();
  const queue = participant ? getCurrentQueue(participant.id) : undefined;
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const currentMovieId = queue ? queue.deck[queue.currentIndex] : undefined;
  const currentMovie = currentMovieId ? activeDeck.find(m => m.id === currentMovieId) : undefined;
  const progress = queue ? queue.currentIndex : 0;
  const total = queue ? queue.deck.length : 15;
  const isDone = queue ? queue.currentIndex >= queue.deck.length : true;

  const handleVote = useCallback((type: VoteType) => {
    if (!participant || !currentMovieId || isDone) return;
    setExitDirection(type === 'no' ? 'left' : type === 'yes' ? 'right' : 'up');
    setTimeout(() => {
      recordVote(participant.id, currentMovieId, type);
      setExitDirection(null);
      const q = useVotingStore.getState().getCurrentQueue(participant.id);
      if (q && q.currentIndex >= q.deck.length) {
        turnComplete();
      } else {
        markCardShown(participant.id);
      }
    }, 350);
  }, [participant, currentMovieId, isDone, recordVote, turnComplete, markCardShown]);

  useKeyboardVoting({ onVote: handleVote, enabled: !isDone });

  if (!participant || isDone) return null;

  const progressPct = ((progress) / total) * 100;
  const hasPoster = !!currentMovie?.poster;

  return (
    <div className="screen" style={{ overflow: 'hidden' }}>
      {/* ── Cinematic Background: blurred current movie poster ── */}
      <AnimatePresence mode="wait">
        {hasPoster && currentMovie && (
          <motion.div
            key={currentMovie.id + '-bg'}
            className="fixed inset-0 z-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src={currentMovie.poster}
              alt=""
              className="w-full h-full object-cover"
              style={{ 
                filter: 'blur(20px) brightness(0.3) saturate(1.4)',
                transform: 'scale(1.15)' 
              }}
            />
            {/* Vignette overlay */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback dark bg if no poster */}
      {!hasPoster && <div className="ambient-bg" />}

      {/* ── Main Layout ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto h-full py-4 px-4">

        {/* ─── Card Stack (Main Focus) ─── */}
        <div className="relative flex-1 w-full flex items-center justify-center z-20" style={{ perspective: '1200px' }}>
          {/* Background stack cards */}
          {[2, 1].map(offset => {
            const idx = queue!.currentIndex + offset;
            if (idx >= queue!.deck.length) return null;
            return (
              <div
                key={`bg-${offset}`}
                className="absolute w-full rounded-2xl"
                style={{
                  maxWidth: '370px',
                  height: '540px',
                  transform: `scale(${1 - offset * 0.04}) translateY(${offset * 10}px)`,
                  opacity: 0.25 - offset * 0.1,
                  zIndex: 10 - offset,
                  background: 'rgba(20,20,30,0.8)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              />
            );
          })}

          {/* Active Card */}
          <AnimatePresence mode="wait">
            {currentMovie && !exitDirection && (
              <SwipeCard
                key={currentMovie.id}
                movie={currentMovie}
                onVote={handleVote}
              />
            )}
          </AnimatePresence>
        </div>



        <p className="text-[10px] tracking-wider z-20 pb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          ← nope · ↑ love · → yes
        </p>
      </div>

      {/* ── Vote Animation Overlay ── */}
      <AnimatePresence>
        {exitDirection && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {exitDirection === 'up' && <Heart size={140} fill="#c084fc" color="#c084fc" style={{ filter: 'drop-shadow(0 0 50px rgba(168,85,247,0.8))' }} />}
            {exitDirection === 'right' && <ThumbsUp size={140} color="#34d399" style={{ filter: 'drop-shadow(0 0 50px rgba(16,185,129,0.8))' }} />}
            {exitDirection === 'left' && <X size={140} color="#f87171" strokeWidth={4} style={{ filter: 'drop-shadow(0 0 50px rgba(239,68,68,0.8))' }} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SwipeCard — Full-poster cinematic draggable card
   ═══════════════════════════════════════════════════════════ */
function SwipeCard({ movie, onVote }: { movie: Movie; onVote: (type: VoteType) => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const cardOpacity = useTransform(x, [-300, -100, 0, 100, 300], [0.6, 1, 1, 1, 0.6]);

  // Directional label visibility
  const noOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const yesOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);
  const loveOpacity = useTransform(y, [0, -50, -120], [0, 0.5, 1]);

  // Edge glow colors during drag
  const noBorder = useTransform(x, [-150, 0], ['rgba(239,68,68,0.5)', 'rgba(239,68,68,0)']);
  const yesBorder = useTransform(x, [0, 150], ['rgba(16,185,129,0)', 'rgba(16,185,129,0.5)']);
  const loveBorder = useTransform(y, [0, -120], ['rgba(168,85,247,0)', 'rgba(168,85,247,0.5)']);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.y < -SWIPE_THRESHOLD || velocity.y < -THROW_VELOCITY) { onVote('love'); return; }
    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -THROW_VELOCITY) { onVote('no'); return; }
    if (offset.x > SWIPE_THRESHOLD || velocity.x > THROW_VELOCITY) { onVote('yes'); return; }
  };

  const hasPoster = !!movie.poster;

  return (
    <motion.div
      className="absolute w-full cursor-grab active:cursor-grabbing overflow-hidden rounded-[32px]"
      style={{
        x, y, rotate,
        opacity: cardOpacity,
        maxWidth: '440px',
        height: '640px',
        zIndex: 20,
        touchAction: 'none',
        boxShadow: '0 30px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
      }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 15 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: [0, -4, 0],  // subtle float hint
      }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
      transition={{
        scale: { type: 'spring', stiffness: 260, damping: 22 },
        opacity: { duration: 0.25 },
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {/* ── Full-bleed poster (THE card) ── */}
      {hasPoster ? (
        <img
          src={movie.poster}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-8xl"
             style={{ background: 'var(--gradient-card)' }}>
          <img src={`https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop`} alt="fallback" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        </div>
      )}

      {/* ── Gradient overlay for text readability ── */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.1) 55%, transparent 70%)',
      }} />

      {/* ── Edge glow during drag ── */}
      <motion.div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        boxShadow: useTransform(
          [noBorder, yesBorder, loveBorder] as any,
          ([n, y, l]: string[]) => `inset 0 0 30px ${n}, inset 0 0 30px ${y}, inset 0 0 30px ${l}`
        ),
      }} />

      {/* ── Content overlay (bottom-aligned) ── */}
      <div className="absolute inset-x-0 bottom-0 p-8 z-10 flex flex-col justify-end">
        <h3 className="text-3xl font-black leading-tight mb-2 tracking-tight"
            style={{ color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
          {movie.title}
        </h3>

        {/* Essential Metadata */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-bold px-3 py-1 rounded-full"
                style={{ background: 'rgba(245,178,26,0.2)', color: '#f5b21a' }}>
            {movie.year}
          </span>
          <span className="text-sm font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {movie.genres.slice(0, 2).join(' • ')}
          </span>
        </div>

        {/* Synopsis - simplified */}
        <p className="text-sm font-medium leading-relaxed opacity-80 line-clamp-3 text-white drop-shadow-md">
          {movie.synopsis}
        </p>
      </div>

      {/* ── Drag Vote Overlays ── */}
      <motion.div
        className="absolute top-6 left-6 px-5 py-2 rounded-xl text-lg font-black -rotate-12 z-30"
        style={{
          opacity: noOpacity,
          background: 'rgba(239,68,68,0.9)', color: 'white',
          boxShadow: '0 4px 24px rgba(239,68,68,0.5)',
          border: '2px solid rgba(255,255,255,0.25)',
        }}
      >
        NOPE
      </motion.div>
      <motion.div
        className="absolute top-6 right-6 px-5 py-2 rounded-xl text-lg font-black rotate-12 z-30"
        style={{
          opacity: yesOpacity,
          background: 'rgba(16,185,129,0.9)', color: 'white',
          boxShadow: '0 4px 24px rgba(16,185,129,0.5)',
          border: '2px solid rgba(255,255,255,0.25)',
        }}
      >
        YES!
      </motion.div>
      <motion.div
        className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl text-lg font-black z-30"
        style={{
          opacity: loveOpacity,
          background: 'rgba(168,85,247,0.9)', color: 'white',
          boxShadow: '0 4px 24px rgba(168,85,247,0.5)',
          border: '2px solid rgba(255,255,255,0.25)',
        }}
      >
        LOVE ❤️
      </motion.div>
    </motion.div>
  );
}
