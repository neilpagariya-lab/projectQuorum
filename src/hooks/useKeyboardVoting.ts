import { useCallback, useEffect } from 'react';
import { VoteType } from '../domain/types';

interface UseKeyboardVotingOptions {
  onVote: (type: VoteType) => void;
  enabled: boolean;
}

export function useKeyboardVoting({ onVote, enabled }: UseKeyboardVotingOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onVote('no');
        break;
      case 'ArrowRight':
        e.preventDefault();
        onVote('yes');
        break;
      case 'ArrowUp':
        e.preventDefault();
        onVote('love');
        break;
    }
  }, [onVote, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
