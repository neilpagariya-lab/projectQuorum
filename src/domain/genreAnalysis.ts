import { Movie, MovieScore, GenreInsight } from './types';

export function computeGenreInsights(rankings: MovieScore[], movies: Movie[]): GenreInsight[] {
  const movieMap = new Map(movies.map(m => [m.id, m]));
  const genreMap = new Map<string, { scores: MovieScore[]; loveCount: number }>();

  rankings.forEach(score => {
    const movie = movieMap.get(score.movieId);
    if (!movie) return;
    movie.genres.forEach(genre => {
      if (!genreMap.has(genre)) genreMap.set(genre, { scores: [], loveCount: 0 });
      const entry = genreMap.get(genre)!;
      entry.scores.push(score);
      entry.loveCount += score.voteBreakdown.love;
    });
  });

  const insights: GenreInsight[] = [];
  genreMap.forEach((data, genre) => {
    const sorted = [...data.scores].sort((a, b) => b.totalScore - a.totalScore);
    const avgScore = data.scores.reduce((s, x) => s + x.totalScore, 0) / data.scores.length;
    insights.push({
      genre,
      topMovie: sorted[0],
      avgScore,
      totalVotes: data.scores.length,
      loveCount: data.loveCount,
    });
  });

  return insights.sort((a, b) => b.avgScore - a.avgScore);
}
