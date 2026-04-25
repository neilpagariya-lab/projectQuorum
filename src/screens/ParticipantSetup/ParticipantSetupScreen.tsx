import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, ArrowRight } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';

export function ParticipantSetupScreen() {
  const { participants, addParticipant, removeParticipant, confirmRoster } = useSessionStore();
  const [step, setStep] = useState<'A' | 'B'>('A');
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Auto-fill names if previously entered
  useEffect(() => {
    if (targetCount) {
      const initialNames = Array(targetCount).fill('');
      participants.slice(0, targetCount).forEach((p, i) => {
        initialNames[i] = p.name;
      });
      setNames(initialNames);
    }
  }, [targetCount, participants]);

  const handleProceedToB = (count: number) => {
    setTargetCount(count);
    setStep('B');
    setError('');
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
    setError('');
  };

  const handleFinalSubmit = () => {
    // Validate
    const trimmedNames = names.map(n => n.trim());
    if (trimmedNames.some(n => !n)) {
      setError('Please fill in all player names.');
      return;
    }
    const uniqueNames = new Set(trimmedNames.map(n => n.toLowerCase()));
    if (uniqueNames.size !== trimmedNames.length) {
      setError('Names must be unique.');
      return;
    }

    // Sync to store
    const currentIds = participants.map(p => p.id);
    currentIds.forEach(id => removeParticipant(id));
    
    trimmedNames.forEach(name => addParticipant(name));
    confirmRoster();
  };

  return (
    <div className="screen flex items-center justify-center relative">
      <div className="ambient-bg" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mx-auto px-6">
        
        {/* Header - Always visible */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white">Who's Watching Tonight?</h1>
          <p className="text-lg md:text-xl" style={{ color: '#a0a0b8' }}>Assemble your movie crew.</p>
        </motion.div>

        <div className="w-full relative min-h-[400px] flex justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP A: Choose Count */}
            {step === 'A' && (
              <motion.div
                key="step-A"
                className="grid grid-cols-2 gap-6 max-w-[480px] w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 0.5 }}
              >
                {[2, 3, 4, 5].map((count) => (
                  <motion.button
                    key={count}
                    onClick={() => handleProceedToB(count)}
                    className="flex flex-col items-center justify-center gap-5 bg-[#121217]/80 backdrop-blur-md border border-white/5 rounded-[32px] p-8 cursor-pointer transition-all hover:bg-[#181822] hover:border-[#f5b21a]/40 group"
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
                  >
                    <div className="w-16 h-16 rounded-full bg-[#f5b21a]/10 flex items-center justify-center group-hover:bg-[#f5b21a]/20 transition-colors duration-300">
                      <Users size={32} className="text-[#f5b21a] opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-wide">{count} Players</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* STEP B: Enter Names */}
            {step === 'B' && targetCount && (
              <motion.div
                key="step-B"
                className="flex flex-col items-center w-full max-w-[480px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-full flex flex-col gap-5 mb-12">
                  {names.map((name, i) => (
                    <motion.div 
                      key={i}
                      className="relative flex items-center w-full"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="absolute left-4 w-12 h-12 rounded-full bg-[#f5b21a] flex items-center justify-center z-10 shadow-[0_4px_16px_rgba(245,178,26,0.3)]">
                        <User size={22} className="text-[#0a0a0c]" />
                      </div>
                      <input
                        className="input-field pl-20 py-5 text-lg font-medium w-full rounded-[24px] bg-[#121217]/80 border-white/10 focus:bg-[#181822] focus:border-[#f5b21a]"
                        placeholder={`Player ${i + 1} Name`}
                        value={name}
                        onChange={(e) => handleNameChange(i, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && i === targetCount - 1 && handleFinalSubmit()}
                        autoFocus={i === 0}
                        maxLength={20}
                      />
                    </motion.div>
                  ))}
                </div>

                {error && (
                  <motion.p 
                    className="text-red-400 font-medium mb-6 text-center"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex flex-col items-center gap-6 w-full">
                  <motion.button
                    className="btn-primary w-full py-5 rounded-[24px] text-lg font-bold"
                    onClick={handleFinalSubmit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Proceed to Deck Selection
                    <ArrowRight size={22} />
                  </motion.button>
                  <button 
                    className="text-[#a0a0b8] hover:text-white transition-colors font-medium text-sm tracking-wide uppercase"
                    onClick={() => setStep('A')}
                  >
                    ← Back to player count
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
