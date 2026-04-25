import { motion } from 'framer-motion';
import { Play, Film } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';

export function LandingScreen() {
  const startSession = useSessionStore(s => s.startSession);

  return (
    <div className="screen flex items-center justify-center relative overflow-hidden">
      {/* Immersive Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-screen"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop)' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a0c]/80 via-[#0a0a0c]/60 to-[#0a0a0c] pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        >
           <Film size={56} className="text-[#f5b21a] drop-shadow-[0_0_20px_rgba(245,178,26,0.3)]" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          Project <span className="text-[#f5b21a]">Quorum</span>
        </motion.h1>

        {/* Headline */}
        <motion.h2
          className="text-2xl md:text-4xl font-light mb-4"
          style={{ color: '#e0e0e0' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Settle movie night democratically.
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl font-medium tracking-wide mb-14"
          style={{ color: '#a0a0b8' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Swipe. Vote. Reach consensus.
        </motion.p>

        {/* CTA */}
        <motion.button
          className="btn-primary text-xl px-12 py-5 uppercase tracking-wider"
          onClick={startSession}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Start Movie Session
        </motion.button>

        {/* Secondary Info */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-20 text-sm font-semibold uppercase tracking-widest text-[#a0a0b8]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          <span>Group Voting</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5b21a]/50" />
          <span>Curated Decks</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5b21a]/50" />
          <span>Consensus Engine</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
