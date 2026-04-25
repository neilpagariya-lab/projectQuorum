import { create } from 'zustand';
import { SessionResults, Movie, Vote, Participant } from '../domain/types';
import { computeMovieScores, checkForTies, generateRationale } from '../domain/consensus';
import { computeGenreInsights } from '../domain/genreAnalysis';
import { computeGroupProfile, computeParticipantBadges, computeTasteCompatibility } from '../domain/groupProfile';

interface ResultsState {
  results: SessionResults | null;
  computeResults: (movies: Movie[], votes: Vote[], participants: Participant[]) => void;
  clearResults: () => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
  results: null,

  computeResults: (movies, votes, participants) => {
    const rankings = computeMovieScores(movies, votes);
    const winner = rankings[0];
    const podium = rankings.slice(0, 3);
    const ties = checkForTies(rankings);
    const rationale = generateRationale(winner, movies, participants.length);
    const genreInsights = computeGenreInsights(rankings, movies);
    const groupProfile = computeGroupProfile(rankings, votes, movies);
    const participantBadges = computeParticipantBadges(participants, votes);
    const tasteCompatibility = computeTasteCompatibility(participants, votes);

    set({
      results: {
        rankings,
        winner,
        podium,
        rationale,
        ties,
        genreInsights,
        groupProfile,
        participantBadges,
        tasteCompatibility,
      },
    });
  },

  clearResults: () => set({ results: null }),
}));
