import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Compass, Star } from 'lucide-react';
import { useSessionStore } from '../../store/sessionStore';
import { useVotingStore } from '../../store/votingStore';
import { DECK_GENERATORS } from '../../domain/deckGenerators';
import { MOVIE_POOL } from '../../data/movies';

// Cinematic background images (high quality)
const DECK_BACKGROUNDS: Record<string, string> = {
  'imdb-top': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2000&auto=format&fit=crop', // classic theater
  'crowd-fav': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2000&auto=format&fit=crop', // neon cinema
  'action': 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1000&auto=format&fit=crop', // explosions/dark
  'romance': 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1000&auto=format&fit=crop', // moody
  'horror': 'https://images.unsplash.com/photo-1505635552518-3448ff116af3?q=80&w=1000&auto=format&fit=crop', // dark woods
  'comedy': 'https://images.unsplash.com/photo-1585607344893-43a479234dd1?q=80&w=1000&auto=format&fit=crop', // stage
  'sci-fi': 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1000&auto=format&fit=crop', // space
  'thriller': 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000&auto=format&fit=crop', // moody street
  'random': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop'
};

export function DeckSelectionScreen() {
  const { selectDeck, advanceToHandoff, participants } = useSessionStore();
  const initializeQueues = useVotingStore(s => s.initializeQueues);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'genre' | 'curated'>('genre');

  const handleSelect = (deckId: string) => {
    setSelectedId(deckId);
    const generator = DECK_GENERATORS.find(d => d.id === deckId);
    if (generator) {
      const movies = generator.generate(MOVIE_POOL);
      selectDeck(deckId, movies);
    }
  };

  const handleConfirm = () => {
    const { activeDeck } = useSessionStore.getState();
    if (!selectedId || activeDeck.length === 0) return;
    initializeQueues(participants.map(p => p.id), activeDeck);
    advanceToHandoff();
  };

  const featuredDecks = DECK_GENERATORS.filter(d => d.id === 'imdb-top' || d.id === 'crowd-fav');
  const visibleDecks = DECK_GENERATORS.filter(d => 
    d.category === activeTab && !['imdb-top', 'crowd-fav', 'random'].includes(d.id)
  );

  return (
    <div className="screen !justify-start !pt-20 overflow-y-auto" style={{ background: '#0a0a0c' }}>
      <div className="w-full max-w-5xl mx-auto px-6 pb-40">
        
        {/* Header */}
        <motion.div 
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-3 text-white">
            Choose Your Deck
          </h1>
          <p className="text-[#a0a0b8] text-xl font-medium">
            What's the vibe for tonight?
          </p>
        </motion.div>

        {/* Featured Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {featuredDecks.map((deck) => (
            <FeaturedCard
              key={deck.id}
              deck={deck}
              selected={selectedId === deck.id}
              onSelect={() => handleSelect(deck.id)}
            />
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="flex flex-wrap items-center gap-4 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={() => setActiveTab('genre')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all border ${
              activeTab === 'genre' 
                ? 'bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent text-[#a0a0b8] border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <Compass size={18} />
            Genre Explorer
          </button>
          <button
            onClick={() => setActiveTab('curated')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all border ${
              activeTab === 'curated' 
                ? 'bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                : 'bg-transparent text-[#a0a0b8] border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <Star size={18} />
            Curated Picks
          </button>
          <button
            onClick={() => handleSelect('random')}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-transparent text-[#a0a0b8] border border-white/10 hover:border-white/30 hover:text-white transition-all ml-0 sm:ml-4"
          >
            <Sparkles size={18} />
            Surprise Me
          </button>
        </motion.div>

        {/* Standard Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {visibleDecks.map((deck, i) => (
              <motion.div
                key={deck.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <StandardCard
                  deck={deck}
                  selected={selectedId === deck.id}
                  onSelect={() => handleSelect(deck.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Fixed Bottom CTA */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-12 pt-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, #0a0a0c 0%, rgba(10,10,12,0.9) 60%, transparent 100%)',
            }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <motion.button
              className="btn-primary text-xl px-16 py-5 pointer-events-auto shadow-[0_20px_40px_rgba(245,178,26,0.2)]"
              onClick={handleConfirm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Voting
              <ArrowRight size={24} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getBgUrl(deckId: string) {
  return DECK_BACKGROUNDS[deckId] || DECK_BACKGROUNDS['random'];
}

function FeaturedCard({ deck, selected, onSelect }: any) {
  const bgUrl = getBgUrl(deck.id);
  
  return (
    <motion.button
      onClick={onSelect}
      className="relative text-left overflow-hidden rounded-3xl h-80 group cursor-pointer border transition-all duration-500 w-full"
      style={{
        borderColor: selected ? '#f5b21a' : 'rgba(255,255,255,0.08)',
        boxShadow: selected ? '0 0 0 2px #f5b21a, 0 30px 60px rgba(0,0,0,0.8)' : '0 20px 40px rgba(0,0,0,0.4)'
      }}
      whileHover={{ scale: selected ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0">
        <img src={bgUrl} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/60 to-transparent opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0a0c] via-transparent to-transparent opacity-80" />
      
      <div className="absolute inset-0 p-10 flex flex-col justify-end">
        <div className="mb-auto mt-2">
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-xs font-bold tracking-widest text-white uppercase">
            Featured
          </span>
        </div>
        <h3 className="text-4xl font-black text-white mb-3 tracking-tight">{deck.label}</h3>
        <p className="text-[#a0a0b8] text-base font-medium max-w-sm leading-relaxed">{deck.description}</p>
        
        <div className={`mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${selected ? 'text-[#f5b21a]' : 'text-transparent'}`}>
          Selected <ArrowRight size={18} />
        </div>
      </div>
    </motion.button>
  );
}

function StandardCard({ deck, selected, onSelect }: any) {
  const bgUrl = getBgUrl(deck.id);
  
  return (
    <motion.button
      onClick={onSelect}
      className="relative text-left overflow-hidden rounded-[24px] h-64 group cursor-pointer border transition-all duration-500 w-full"
      style={{
        borderColor: selected ? '#f5b21a' : 'rgba(255,255,255,0.05)',
        boxShadow: selected ? '0 0 0 2px #f5b21a, 0 10px 30px rgba(0,0,0,0.6)' : '0 10px 20px rgba(0,0,0,0.3)'
      }}
      whileHover={{ scale: selected ? 1 : 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="absolute inset-0">
        <img src={bgUrl} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
      </div>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/50 to-transparent opacity-90" />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <h4 className="text-2xl font-black text-white mb-3 leading-tight tracking-tight">{deck.label}</h4>
        <div className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors duration-300 ${selected ? 'text-[#f5b21a]' : 'text-[#f5b21a]/60 group-hover:text-[#f5b21a]'}`}>
          Select Deck <ArrowRight size={16} />
        </div>
      </div>
    </motion.button>
  );
}
