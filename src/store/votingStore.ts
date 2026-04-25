import { create } from 'zustand';
import { Vote, VoteType, ParticipantVoteQueue } from '../domain/types';
import { dealDeck } from '../domain/deck';
import { Movie } from '../domain/types';

interface VotingState {
  queues: ParticipantVoteQueue[];
  allVotes: Vote[];

  // Actions
  initializeQueues: (participantIds: string[], movies: Movie[]) => void;
  recordVote: (participantId: string, movieId: string, type: VoteType) => void;
  markCardShown: (participantId: string) => void;
  getCurrentQueue: (participantId: string) => ParticipantVoteQueue | undefined;
  getCurrentMovie: (participantId: string, movies: Movie[]) => Movie | undefined;
  isParticipantDone: (participantId: string) => boolean;
  resetVoting: () => void;
}

export const useVotingStore = create<VotingState>((set, get) => ({
  queues: [],
  allVotes: [],

  initializeQueues: (participantIds, movies) => {
    const queues: ParticipantVoteQueue[] = participantIds.map(id => ({
      participantId: id,
      deck: dealDeck(movies),
      votes: [],
      currentIndex: 0,
      cardShownAt: Date.now(),
    }));
    set({ queues, allVotes: [] });
  },

  recordVote: (participantId, movieId, type) => {
    const { queues, allVotes } = get();
    const queue = queues.find(q => q.participantId === participantId);
    if (!queue) return;

    const now = Date.now();
    const decisionTimeMs = now - queue.cardShownAt;

    const vote: Vote = {
      participantId,
      movieId,
      type,
      timestamp: now,
      decisionTimeMs,
    };

    const updatedQueues = queues.map(q => {
      if (q.participantId !== participantId) return q;
      return {
        ...q,
        votes: [...q.votes, vote],
        currentIndex: q.currentIndex + 1,
        cardShownAt: now,
      };
    });

    set({ queues: updatedQueues, allVotes: [...allVotes, vote] });
  },

  markCardShown: (participantId) => {
    const { queues } = get();
    set({
      queues: queues.map(q =>
        q.participantId === participantId ? { ...q, cardShownAt: Date.now() } : q
      ),
    });
  },

  getCurrentQueue: (participantId) => {
    return get().queues.find(q => q.participantId === participantId);
  },

  getCurrentMovie: (participantId, movies) => {
    const queue = get().queues.find(q => q.participantId === participantId);
    if (!queue || queue.currentIndex >= queue.deck.length) return undefined;
    const movieId = queue.deck[queue.currentIndex];
    return movies.find(m => m.id === movieId);
  },

  isParticipantDone: (participantId) => {
    const queue = get().queues.find(q => q.participantId === participantId);
    return queue ? queue.currentIndex >= queue.deck.length : true;
  },

  resetVoting: () => set({ queues: [], allVotes: [] }),
}));
