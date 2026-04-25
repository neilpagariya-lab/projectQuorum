// ============================================================
// Fisher-Yates Shuffle — Pure, deterministic utility
// ============================================================

/**
 * Returns a new shuffled copy of the array (does NOT mutate original).
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffle and take the first `count` items.
 */
export function shuffleAndTake<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count);
}
