import { useCallback, useRef } from "react";

/**
 * The word pool a game builds its questions from, frozen at the child's first
 * touch. The page hands a game a NEW pool array a second or two after it opens
 * (the example sentences arrive, a saved list resolves); games that rebuilt
 * their questions on it swapped the question under the child while the score
 * and the picked answer stayed. Before the first touch the newer pool is still
 * taken, so a game opened from a link gets the examples that arrive late.
 */
export function useFrozenPool<T>(pool: T): { pool: T; touch: () => void } {
  const kept = useRef(pool);
  const touched = useRef(false);
  if (!touched.current) kept.current = pool;
  const touch = useCallback(() => { touched.current = true; }, []);
  return { pool: kept.current, touch };
}
