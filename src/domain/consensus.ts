import { Movie, Vote, MovieScore, VOTE_WEIGHTS, VoteType } from './types';

const SPEED_WINDOW_MS = 5000;
const SPEED_MULTIPLIER = 0.5;
const MIN_DECISION_MS = 300;
const MAX_DECISION_MS = 30000;

function clampDecisionTime(ms: number): number {
  return Math.max(MIN_DECISION_MS, Math.min(ms, MAX_DECISION_MS));
}

export function computeSpeedWeightedScore(votes: Vote[]): number {
  return votes.reduce((sum, vote) => {
    const weight = VOTE_WEIGHTS[vote.type];
    const clamped = clampDecisionTime(vote.decisionTimeMs);
    if (weight === 0 || clamped > SPEED_WINDOW_MS) return sum;
    const speedFactor = 1 - (clamped / SPEED_WINDOW_MS);
    return sum + (speedFactor * weight * SPEED_MULTIPLIER);
  }, 0);
}

export function computeMovieScores(movies: Movie[], allVotes: Vote[]): MovieScore[] {
  const movieMap = new Map(movies.map(m => [m.id, m]));

  const scores: MovieScore[] = movies.map(movie => {
    const movieVotes = allVotes.filter(v => v.movieId === movie.id);
    const breakdown = { love: 0, yes: 0, no: 0 };
    const voterSentiment: Record<string, VoteType> = {};
    let totalScore = 0;
    let totalDecisionTime = 0;

    movieVotes.forEach(v => {
      breakdown[v.type]++;
      voterSentiment[v.participantId] = v.type;
      totalScore += VOTE_WEIGHTS[v.type];
      totalDecisionTime += clampDecisionTime(v.decisionTimeMs);
    });

    const maxPossible = movies.length > 0 ? movieVotes.length * 3 : 1;
    const genreScores: Record<string, number> = {};
    movie.genres.forEach(g => { genreScores[g] = totalScore; });

    return {
      movieId: movie.id,
      totalScore,
      normalizedScore: maxPossible > 0 ? totalScore / maxPossible : 0,
      voteBreakdown: breakdown,
      voterSentiment,
      avgDecisionTimeMs: movieVotes.length > 0 ? totalDecisionTime / movieVotes.length : 0,
      speedWeightedScore: computeSpeedWeightedScore(movieVotes),
      genreScores,
    };
  });

  // Sort with full tie-break pipeline
  return scores.sort((a, b) => {
    // Step 1: Weighted consensus score
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    // Step 2: Love count
    if (b.voteBreakdown.love !== a.voteBreakdown.love) return b.voteBreakdown.love - a.voteBreakdown.love;
    // Step 3: Speed-weighted confidence
    if (b.speedWeightedScore !== a.speedWeightedScore) return b.speedWeightedScore - a.speedWeightedScore;
    // Step 4: Accessibility
    const movieA = movieMap.get(a.movieId);
    const movieB = movieMap.get(b.movieId);
    const accA = movieA?.meta.accessibility ?? 3;
    const accB = movieB?.meta.accessibility ?? 3;
    if (accB !== accA) return accB - accA;
    // Step 5: Alphabetical (deterministic)
    const titleA = movieA?.title ?? '';
    const titleB = movieB?.title ?? '';
    return titleA.localeCompare(titleB);
  });
}

export function checkForTies(rankings: MovieScore[]): boolean {
  if (rankings.length < 2) return false;
  return rankings[0].totalScore === rankings[1].totalScore;
}

export function generateRationale(winner: MovieScore, movies: Movie[], participantCount: number): string {
  const movie = movies.find(m => m.id === winner.movieId);
  if (!movie) return 'The group has spoken!';

  const parts: string[] = [];
  const { love, yes, no } = winner.voteBreakdown;

  if (love === participantCount) {
    parts.push(`Everyone LOVED "${movie.title}"! A unanimous favorite.`);
  } else if (love > 0 && no === 0) {
    parts.push(`"${movie.title}" won hearts with ${love} love vote${love > 1 ? 's' : ''} and zero rejections.`);
  } else if (love > 0) {
    parts.push(`"${movie.title}" earned ${love} love vote${love > 1 ? 's' : ''} and ${yes} yes vote${yes !== 1 ? 's' : ''}.`);
  } else {
    parts.push(`"${movie.title}" had the strongest consensus with ${yes} yes vote${yes !== 1 ? 's' : ''}.`);
  }

  if (movie.genres.length > 1) {
    parts.push(`Spanning ${movie.genres.join(' & ')}, it appealed to a wide range of tastes.`);
  }

  if (winner.normalizedScore > 0.8) {
    parts.push('An overwhelmingly strong pick!');
  } else if (winner.normalizedScore > 0.5) {
    parts.push('A solid group choice.');
  }

  return parts.join(' ');
}
