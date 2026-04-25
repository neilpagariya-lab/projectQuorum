import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useVotingStore } from '../../store/votingStore';
import { useResultsStore } from '../../store/resultsStore';

export function ComputingScreen() {
  const { activeDeck, participants, toResults } = useSessionStore();
  const allVotes = useVotingStore(s => s.allVotes);
  const computeResults = useResultsStore(s => s.computeResults);
  const [step, setStep] = useState(0);

  const steps = [
    'Tallying votes...',
    'Analyzing preferences...',
    'Computing consensus...',
    'Generating insights...',
    'And the winner is...',
  ];

  useEffect(() => {
    // Compute results immediately
    computeResults(activeDeck, allVotes, participants);

    // Step through messages for suspense
    const timers = steps.map((_, i) =>
      setTimeout(() => setStep(i), i * 1200)
    );
    const finalTimer = setTimeout(() => toResults(), steps.length * 1200 + 500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="screen">
      <div className="ambient-bg" />
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mb-8"
        >
          <Loader2 size={48} style={{ color: 'var(--accent-purple)' }} />
        </motion.div>

        <motion.h2
          key={step}
          className="text-2xl font-bold mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {steps[step]}
        </motion.h2>

        {/* Animated dots */}
        <div className="flex gap-2 mt-4">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: i <= step ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)',
              }}
              animate={i === step ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
