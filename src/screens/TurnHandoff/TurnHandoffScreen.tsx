import { motion } from 'framer-motion';
import { ChevronRight, Eye } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useVotingStore } from '../../store/votingStore';

export function TurnHandoffScreen() {
  const { getCurrentParticipant, participantReady } = useSessionStore();
  const markCardShown = useVotingStore(s => s.markCardShown);
  const participant = getCurrentParticipant();

  if (!participant) return null;

  const handleReady = () => {
    markCardShown(participant.id);
    participantReady();
  };

  return (
    <div className="screen">
      <div className="ambient-bg" />
      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-sm"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <motion.div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-6"
          style={{ background: 'var(--gradient-hero)', boxShadow: 'var(--shadow-glow)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
        >
          {participant.name[0].toUpperCase()}
        </motion.div>

        <motion.div
          className="flex items-center gap-2 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Eye size={16} style={{ color: 'var(--accent-purple)' }} />
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--accent-purple)' }}>
            Pass the device to
          </span>
        </motion.div>

        <motion.h2
          className="text-4xl font-black mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {participant.name}
        </motion.h2>

        <motion.p
          className="text-sm mb-10"
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          You'll swipe through 15 movie cards.<br />
          <span style={{ color: 'var(--text-muted)' }}>
            ← No &nbsp;·&nbsp; → Yes &nbsp;·&nbsp; ↑ Love
          </span>
        </motion.p>

        <motion.button
          className="btn-primary text-lg px-10 py-4"
          onClick={handleReady}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          I'm Ready
          <ChevronRight size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
}
