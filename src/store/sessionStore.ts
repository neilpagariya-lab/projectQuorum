import { create } from 'zustand';
import { SessionPhase, Participant, Movie } from '../domain/types';
import { v4 } from '../utils/uuid';

interface SessionState {
  phase: SessionPhase;
  participants: Participant[];
  selectedDeckId: string | null;
  activeDeck: Movie[];
  currentParticipantIndex: number;

  // Actions
  setPhase: (phase: SessionPhase) => void;
  startSession: () => void;
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  confirmRoster: () => void;
  selectDeck: (deckId: string, movies: Movie[]) => void;
  advanceToHandoff: () => void;
  participantReady: () => void;
  turnComplete: () => void;
  allTurnsComplete: () => void;
  toResults: () => void;
  rematch: () => void;
  newSession: () => void;
  fullReset: () => void;
  getCurrentParticipant: () => Participant | null;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  phase: 'IDLE',
  participants: [],
  selectedDeckId: null,
  activeDeck: [],
  currentParticipantIndex: 0,

  setPhase: (phase) => set({ phase }),
  
  startSession: () => set({ phase: 'SETUP', participants: [], selectedDeckId: null, activeDeck: [], currentParticipantIndex: 0 }),

  addParticipant: (name) => {
    const { participants } = get();
    if (participants.length >= 5) return;
    set({
      participants: [...participants, {
        id: v4(),
        name: name.trim(),
        order: participants.length,
        hasVoted: false,
      }],
    });
  },

  removeParticipant: (id) => {
    const { participants } = get();
    set({
      participants: participants.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i })),
    });
  },

  confirmRoster: () => set({ phase: 'DECK_SELECT' }),

  selectDeck: (deckId, movies) => set({ selectedDeckId: deckId, activeDeck: movies }),

  advanceToHandoff: () => set({ phase: 'HANDOFF' }),

  participantReady: () => set({ phase: 'VOTING' }),

  turnComplete: () => {
    const { participants, currentParticipantIndex } = get();
    const updated = participants.map((p, i) =>
      i === currentParticipantIndex ? { ...p, hasVoted: true } : p
    );
    const nextIndex = currentParticipantIndex + 1;
    if (nextIndex >= participants.length) {
      set({ participants: updated, phase: 'COMPUTING' });
    } else {
      set({ participants: updated, currentParticipantIndex: nextIndex, phase: 'HANDOFF' });
    }
  },

  allTurnsComplete: () => set({ phase: 'COMPUTING' }),

  toResults: () => set({ phase: 'RESULTS' }),

  rematch: () => {
    const { participants } = get();
    set({
      phase: 'DECK_SELECT',
      currentParticipantIndex: 0,
      participants: participants.map(p => ({ ...p, hasVoted: false })),
      selectedDeckId: null,
      activeDeck: [],
    });
  },

  newSession: () => set({
    phase: 'SETUP',
    participants: [],
    selectedDeckId: null,
    activeDeck: [],
    currentParticipantIndex: 0,
  }),

  fullReset: () => set({
    phase: 'IDLE',
    participants: [],
    selectedDeckId: null,
    activeDeck: [],
    currentParticipantIndex: 0,
  }),

  getCurrentParticipant: () => {
    const { participants, currentParticipantIndex } = get();
    return participants[currentParticipantIndex] ?? null;
  },
}));
