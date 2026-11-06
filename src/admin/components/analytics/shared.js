import { useSyncExternalStore } from 'react';

// Shared motion presets and number helpers for the overview.

export const EASE = [0.22, 0.61, 0.36, 1];

/** Parent: reveals its children one after another. */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Child: rises into place. */
export const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

// Chart series. Validated for colour-blind separation and normal-vision distance
// (dataviz validate_palette.js, light surface); they follow the status badges:
// green = completed, violet = still open, pink = cancelled.
export const SERIES = [
  { key: 'completed', label: 'Completed', color: '#2E9E5B' },
  { key: 'open', label: 'Open', color: '#8C86F0' },
  { key: 'cancelled', label: 'Cancelled', color: '#E9719F' },
];

export const NAIRA_FORMAT = { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 };
export const NAIRA_COMPACT = { style: 'currency', currency: 'NGN', notation: 'compact', maximumFractionDigits: 1 };

export const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** "+24%" style change against the previous period, or null when there's nothing to compare. */
export function change(current, previous) {
  if (!previous) return current ? { label: 'New', dir: 'up' } : null;
  const value = Math.round(((current - previous) / previous) * 100);
  return { label: `${value > 0 ? '+' : ''}${value}%`, dir: value > 0 ? 'up' : value < 0 ? 'down' : 'flat' };
}

/** 95 → "1h 35m", 3000 → "2d 2h". */
export function formatDuration(minutes) {
  if (minutes == null) return '—';
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m}m`;
  if (m < 60 * 24) return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`;
  const d = Math.floor(m / 1440);
  const h = Math.round((m % 1440) / 60);
  return `${d}d${h ? ` ${h}h` : ''}`;
}

/** Whole-number axis for counts: 9 → 0·5·10, 13 → 0·5·10·15, 3 → 0·1·2·3. */
export function countAxis(value) {
  if (!value || value <= 0) return { max: 4, ticks: [0, 1, 2, 3, 4] };
  const raw = value / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, [1, 2, 5, 10].map((s) => s * magnitude).find((s) => s >= raw));
  const max = Math.ceil(value / step) * step;
  return { max, ticks: Array.from({ length: max / step + 1 }, (_, i) => i * step) };
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/** True while the media query matches (e.g. phone widths). */
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
