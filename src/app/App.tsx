import { AnimatePresence, motion } from 'framer-motion';
import { useSessionStore } from '../store/sessionStore';
import { LandingScreen } from '../screens/Landing/LandingScreen';
import { ParticipantSetupScreen } from '../screens/ParticipantSetup/ParticipantSetupScreen';
import { DeckSelectionScreen } from '../screens/DeckSelection/DeckSelectionScreen';
import { TurnHandoffScreen } from '../screens/TurnHandoff/TurnHandoffScreen';
import { SwipeDeckScreen } from '../screens/SwipeDeck/SwipeDeckScreen';
import { ComputingScreen } from '../screens/Computing/ComputingScreen';
import { ResultsCeremonyScreen } from '../screens/ResultsCeremony/ResultsCeremonyScreen';

const pageTransition = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.04 },
  transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
};

export default function App() {
  const phase = useSessionStore(s => s.phase);

  const renderScreen = () => {
    switch (phase) {
      case 'IDLE': return <LandingScreen />;
      case 'SETUP': return <ParticipantSetupScreen />;
      case 'DECK_SELECT': return <DeckSelectionScreen />;
      case 'HANDOFF': return <TurnHandoffScreen />;
      case 'VOTING': return <SwipeDeckScreen />;
      case 'COMPUTING': return <ComputingScreen />;
      case 'RESULTS': return <ResultsCeremonyScreen />;
      default: return <LandingScreen />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={phase} {...pageTransition} className="w-full h-full">
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
}
