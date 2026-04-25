import { Movie } from './types';
import { shuffle } from '../utils/shuffle';

/** Shuffle movie IDs for a participant's deck order */
export function dealDeck(movies: Movie[]): string[] {
  return shuffle(movies.map(m => m.id));
}
