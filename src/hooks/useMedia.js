import { useSyncExternalStore } from 'react';

/** True while the media query matches, e.g. useMedia('(max-width: 760px)'). */
export function useMedia(query) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
