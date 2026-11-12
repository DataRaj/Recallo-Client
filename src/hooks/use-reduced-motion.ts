'use client';

import { useMediaQuery } from './use-media-query';

/** React to preference changes during the session as well as on initial load. */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', true);
}
