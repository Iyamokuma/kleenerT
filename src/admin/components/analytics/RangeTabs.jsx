import { motion } from 'motion/react';

export const RANGES = [
  { days: 7, label: '7 days', long: 'last 7 days' },
  { days: 30, label: '30 days', long: 'last 30 days' },
  { days: 90, label: '90 days', long: 'last 90 days' },
  { days: 365, label: '12 months', long: 'last 12 months' },
];

/** Pill tabs; the dark pill glides to the chosen period. */
export default function RangeTabs({ value, onChange }) {
  return (
    <div className="rtabs" role="group" aria-label="Reporting period">
      {RANGES.map((r) => {
        const active = r.days === value;
        return (
          <button key={r.days} type="button" className="rtab" aria-pressed={active} onClick={() => onChange(r.days)}>
            {active && <motion.span layoutId="rtab-pill" className="rtab-pill" transition={{ type: 'spring', stiffness: 460, damping: 36 }} />}
            <span className="rtab-label">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
