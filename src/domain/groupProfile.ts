import { Movie, Vote, MovieScore, GroupTasteProfile, VOTE_WEIGHTS, Participant } from './types';
import { ARCHETYPE_MAP, FALLBACK_ARCHETYPES, PARTICIPANT_BADGE_RULES } from '../data/archetypes';

export function computeGroupProfile(
  rankings: MovieScore[],
  allVotes: Vote[],
  movies: Movie[]
): GroupTasteProfile {
  const movieMap = new Map(movies.map(m => [m.id, m]));

  // Dominant genres by total weighted score
  const genreTotals = new Map<string, number>();
  rankings.forEach(score => {
    const movie = movieMap.get(score.movieId);
    if (!movie) return;
    movie.genres.forEach(g => {
      genreTotals.set(g, (genreTotals.get(g) ?? 0) + score.totalScore);
    });
  });

  const sortedGenres = [...genreTotals.entries()].sort((a, b) => b[1] - a[1]);
  const dominantGenres = sortedGenres.slice(0, 3).map(([g]) => g);

  // Archetype
  const archetype = findArchetype(dominantGenres);

  // Diversity score: how spread votes are (0 = all one genre, 1 = even)
  const totalGenreScore = sortedGenres.reduce((s, [, v]) => s + v, 0);
  const genreCount = sortedGenres.length;
  const evenShare = totalGenreScore / (genreCount || 1);
  const variance = sortedGenres.reduce((s, [, v]) => s + Math.pow(v - evenShare, 2), 0) / (genreCount || 1);
  const maxVariance = Math.pow(totalGenreScore, 2);
  const diversityScore = maxVariance > 0 ? Math.max(0, 1 - (variance / maxVariance)) : 0.5;

  // Consensus strength: how much the group agrees (low variance in scores = high consensus)
  const scoreValues = rankings.map(r => r.totalScore);
  const avgScore = scoreValues.reduce((s, v) => s + v, 0) / (scoreValues.length || 1);
  const scoreVariance = scoreValues.reduce((s, v) => s + Math.pow(v - avgScore, 2), 0) / (scoreValues.length || 1);
  const maxScoreVar = Math.pow(avgScore * 3, 2);
  const consensusStrength = maxScoreVar > 0 ? Math.max(0, Math.min(1, 1 - (scoreVariance / maxScoreVar))) : 0.5;

  // Most divisive: highest variance in vote weights across participants
  const mostDivisiveMovie = findMostDivisive(rankings, allVotes);

  // Dark horse: unexpectedly high score relative to accessibility
  const darkHorseMovie = findDarkHorse(rankings, movieMap);

  return { dominantGenres, archetype, diversityScore, consensusStrength, mostDivisiveMovie, darkHorseMovie };
}

function findArchetype(dominantGenres: string[]): string {
  // Try pairs first
  for (let i = 0; i < dominantGenres.length; i++) {
    for (let j = i + 1; j < dominantGenres.length; j++) {
      const key = `${dominantGenres[i]},${dominantGenres[j]}`;
      if (ARCHETYPE_MAP[key]) return ARCHETYPE_MAP[key];
      const reverseKey = `${dominantGenres[j]},${dominantGenres[i]}`;
      if (ARCHETYPE_MAP[reverseKey]) return ARCHETYPE_MAP[reverseKey];
    }
  }
  // Try single
  if (dominantGenres[0] && ARCHETYPE_MAP[dominantGenres[0]]) return ARCHETYPE_MAP[dominantGenres[0]];
  return FALLBACK_ARCHETYPES[0];
}

function findMostDivisive(rankings: MovieScore[], allVotes: Vote[]): MovieScore | null {
  let maxVariance = 0;
  let divisive: MovieScore | null = null;

  rankings.forEach(score => {
    const movieVotes = allVotes.filter(v => v.movieId === score.movieId);
    if (movieVotes.length < 2) return;
    const weights = movieVotes.map(v => VOTE_WEIGHTS[v.type]);
    const avg = weights.reduce((s, w) => s + w, 0) / weights.length;
    const variance = weights.reduce((s, w) => s + Math.pow(w - avg, 2), 0) / weights.length;
    if (variance > maxVariance) { maxVariance = variance; divisive = score; }
  });

  return divisive;
}

function findDarkHorse(rankings: MovieScore[], movieMap: Map<string, Movie>): MovieScore | null {
  // Movie that scored higher than expected given its accessibility
  const withSurprise = rankings.map(score => {
    const movie = movieMap.get(score.movieId);
    const accessibility = movie?.meta.accessibility ?? 3;
    // Lower accessibility + higher score = bigger surprise
    const surprise = score.normalizedScore * (6 - accessibility);
    return { score, surprise };
  });

  withSurprise.sort((a, b) => b.surprise - a.surprise);
  // Only pick if it's not the winner (that's not surprising)
  const candidate = withSurprise.find((_, i) => i > 0);
  return candidate?.score ?? null;
}

export function computeParticipantBadges(
  participants: Participant[],
  allVotes: Vote[]
): Record<string, string> {
  const badges: Record<string, string> = {};
  if (participants.length === 0) return badges;

  const stats = participants.map(p => {
    const votes = allVotes.filter(v => v.participantId === p.id);
    return {
      id: p.id,
      loveCount: votes.filter(v => v.type === 'love').length,
      noCount: votes.filter(v => v.type === 'no').length,
      avgTime: votes.length > 0 ? votes.reduce((s, v) => s + v.decisionTimeMs, 0) / votes.length : 0,
    };
  });

  const mostLoves = [...stats].sort((a, b) => b.loveCount - a.loveCount)[0];
  const mostNos = [...stats].sort((a, b) => b.noCount - a.noCount)[0];
  const fastest = [...stats].sort((a, b) => a.avgTime - b.avgTime)[0];
  const slowest = [...stats].sort((a, b) => b.avgTime - a.avgTime)[0];

  if (mostLoves) badges[mostLoves.id] = PARTICIPANT_BADGE_RULES[0].badge;
  if (mostNos && !badges[mostNos.id]) badges[mostNos.id] = PARTICIPANT_BADGE_RULES[1].badge;
  if (fastest && !badges[fastest.id]) badges[fastest.id] = PARTICIPANT_BADGE_RULES[2].badge;
  if (slowest && !badges[slowest.id]) badges[slowest.id] = PARTICIPANT_BADGE_RULES[3].badge;

  // Give remaining participants a default badge
  participants.forEach(p => {
    if (!badges[p.id]) badges[p.id] = PARTICIPANT_BADGE_RULES[4].badge;
  });

  return badges;
}

export function computeTasteCompatibility(
  participants: Participant[],
  allVotes: Vote[]
): Record<string, Record<string, number>> {
  const compat: Record<string, Record<string, number>> = {};

  participants.forEach(p1 => {
    compat[p1.id] = {};
    participants.forEach(p2 => {
      if (p1.id === p2.id) { compat[p1.id][p2.id] = 1; return; }
      const v1 = allVotes.filter(v => v.participantId === p1.id);
      const v2 = allVotes.filter(v => v.participantId === p2.id);
      const v1Map = new Map(v1.map(v => [v.movieId, v.type]));
      const v2Map = new Map(v2.map(v => [v.movieId, v.type]));
      let matches = 0;
      let total = 0;
      v1Map.forEach((type, movieId) => {
        if (v2Map.has(movieId)) {
          total++;
          if (v2Map.get(movieId) === type) matches++;
        }
      });
      compat[p1.id][p2.id] = total > 0 ? matches / total : 0;
    });
  });

  return compat;
}
