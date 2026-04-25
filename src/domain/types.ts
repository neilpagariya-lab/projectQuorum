// ============================================================
// Project Quorum — Core Type Definitions
// ============================================================

export type SessionPhase =
  | 'IDLE'
  | 'SETUP'
  | 'DECK_SELECT'
  | 'HANDOFF'
  | 'VOTING'
  | 'TURN_COMPLETE'
  | 'COMPUTING'
  | 'RESULTS';

export type VoteType = 'love' | 'yes' | 'no';

export const VOTE_WEIGHTS: Record<VoteType, number> = {
  love: 3,
  yes: 1,
  no: 0,
};

// ─── Movie ──────────────────────────────────────────────────

export interface Movie {
  id: string;
  title: string;
  year: number;
  genres: string[];
  runtime: number;
  poster: string;
  synopsis: string;
  tags: string[];
  deckTags: string[];
  meta: {
    mood: string[];
    accessibility: number;   // 1–5
    rewatchability: number;  // 1–5
    imdbRating?: number;
    criticScore?: number;
  };
}

// ─── Participant ────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  order: number;
  hasVoted: boolean;
}

// ─── Voting ─────────────────────────────────────────────────

export interface Vote {
  participantId: string;
  movieId: string;
  type: VoteType;
  timestamp: number;
  decisionTimeMs: number;
}

export interface ParticipantVoteQueue {
  participantId: string;
  deck: string[];       // movie IDs
  votes: Vote[];
  currentIndex: number;
  cardShownAt: number;
}

// ─── Scoring & Results ──────────────────────────────────────

export interface MovieScore {
  movieId: string;
  totalScore: number;
  normalizedScore: number;
  voteBreakdown: { love: number; yes: number; no: number };
  voterSentiment: Record<string, VoteType>;
  avgDecisionTimeMs: number;
  speedWeightedScore: number;
  genreScores: Record<string, number>;
}

export interface GenreInsight {
  genre: string;
  topMovie: MovieScore;
  avgScore: number;
  totalVotes: number;
  loveCount: number;
}

export interface GroupTasteProfile {
  dominantGenres: string[];
  archetype: string;
  diversityScore: number;
  consensusStrength: number;
  mostDivisiveMovie: MovieScore | null;
  darkHorseMovie: MovieScore | null;
}

export interface SessionResults {
  rankings: MovieScore[];
  winner: MovieScore;
  podium: MovieScore[];
  rationale: string;
  ties: boolean;
  genreInsights: GenreInsight[];
  groupProfile: GroupTasteProfile;
  participantBadges: Record<string, string>;
  tasteCompatibility: Record<string, Record<string, number>>;
}

// ─── Deck Generator ─────────────────────────────────────────

export interface DeckGenerator {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'genre' | 'curated';
  generate: (pool: Movie[]) => Movie[];
}
