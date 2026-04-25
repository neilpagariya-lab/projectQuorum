import { DeckGenerator, Movie } from './types';
import { shuffle, shuffleAndTake } from '../utils/shuffle';

const DECK_SIZE = 15;

function genreFilter(pool: Movie[], genre: string): Movie[] {
  const matches = pool.filter(m => m.genres.includes(genre));
  if (matches.length >= DECK_SIZE) return shuffleAndTake(matches, DECK_SIZE);
  // Backfill with random picks if not enough
  const remaining = pool.filter(m => !matches.some(x => x.id === m.id));
  return [...shuffle(matches), ...shuffleAndTake(remaining, DECK_SIZE - matches.length)].slice(0, DECK_SIZE);
}

function tagFilter(pool: Movie[], tag: string): Movie[] {
  const matches = pool.filter(m => m.deckTags.includes(tag));
  if (matches.length >= DECK_SIZE) return shuffleAndTake(matches, DECK_SIZE);
  const remaining = pool.filter(m => !matches.some(x => x.id === m.id));
  return [...shuffle(matches), ...shuffleAndTake(remaining, DECK_SIZE - matches.length)].slice(0, DECK_SIZE);
}

export const DECK_GENERATORS: DeckGenerator[] = [
  // ─── GENRE DECKS ───
  { id: 'romance', label: 'Romance', description: 'Love stories & heartwarming tales', icon: '💕', category: 'genre', generate: (pool) => genreFilter(pool, 'Romance') },
  { id: 'action', label: 'Action', description: 'High-octane thrills & explosions', icon: '💥', category: 'genre', generate: (pool) => genreFilter(pool, 'Action') },
  { id: 'thriller', label: 'Thriller', description: 'Edge-of-your-seat suspense', icon: '🔪', category: 'genre', generate: (pool) => genreFilter(pool, 'Thriller') },
  { id: 'horror', label: 'Horror', description: 'Scares, screams & nightmares', icon: '👻', category: 'genre', generate: (pool) => genreFilter(pool, 'Horror') },
  { id: 'sci-fi', label: 'Sci-Fi', description: 'Futuristic worlds & big ideas', icon: '🚀', category: 'genre', generate: (pool) => genreFilter(pool, 'Sci-Fi') },
  { id: 'comedy', label: 'Comedy', description: 'Laughs, gags & feel-good vibes', icon: '😂', category: 'genre', generate: (pool) => genreFilter(pool, 'Comedy') },
  { id: 'drama', label: 'Drama', description: 'Deep stories & powerful performances', icon: '🎭', category: 'genre', generate: (pool) => genreFilter(pool, 'Drama') },
  { id: 'mixed', label: 'Mixed Bag', description: 'A little bit of everything', icon: '🎲', category: 'genre', generate: (pool) => shuffleAndTake(pool, DECK_SIZE) },
  // ─── CURATED DECKS ───
  { id: 'random', label: 'Randomized', description: 'Feeling lucky? Total surprise deck', icon: '🎰', category: 'curated', generate: (pool) => shuffleAndTake(pool, DECK_SIZE) },
  { id: 'imdb-top', label: 'IMDb Top Picks', description: 'The highest rated films of all time', icon: '⭐', category: 'curated', generate: (pool) => tagFilter(pool, 'imdb-top') },
  { id: 'so-bad-its-good', label: 'So Bad It\'s Good', description: 'Gloriously terrible cinema', icon: '🗑️', category: 'curated', generate: (pool) => tagFilter(pool, 'so-bad') },
  { id: 'crowd-fav', label: 'Crowd Favorites', description: 'Everyone loves these picks', icon: '🔥', category: 'curated', generate: (pool) => tagFilter(pool, 'crowd-fav') },
  { id: 'underrated', label: 'Underrated Gems', description: 'Hidden treasures you might\'ve missed', icon: '💎', category: 'curated', generate: (pool) => tagFilter(pool, 'underrated') },
];

export function getDeckById(id: string): DeckGenerator | undefined {
  return DECK_GENERATORS.find(d => d.id === id);
}
