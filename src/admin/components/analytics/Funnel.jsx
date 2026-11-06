import { motion } from 'motion/react';
import { formatNumber } from '../../lib/format';
import { EASE, pct, rise } from './shared';

// Stage colours match the status badges used everywhere else in the admin.
const STAGES = [
  { key: 'received', label: 'Received', color: 'var(--st-new-dot)' },
  { key: 'contacted', label: 'Contacted', color: 'var(--st-contacted-dot)' },
  { key: 'confirmed', label: 'Confirmed', color: 'var(--st-confirmed-dot)' },
  { key: 'completed', label: 'Completed', color: 'var(--st-completed-dot)' },
];

/** How far requests get. Uses the activity log, so a cancelled job still counts for the stages it reached. */
export default function Funnel({ funnel, periodLabel }) {
  const f = funnel ?? { received: 0, contacted: 0, confirmed: 0, completed: 0 };
  const top = f.received;
  return (
    <motion.section className="ov-panel" variants={rise}>
      <header className="ov-panel-head"><h2>Pipeline</h2><span className="ov-panel-chip">{pct(f.completed, top)}% completed</span></header>
      <p className="ov-panel-sub">How far requests from the {periodLabel} have got.</p>
      <ol className="funnel">
        {STAGES.map((s, i) => {
          const value = f[s.key];
          const share = top ? value / top : 0;
          const prev = i ? f[STAGES[i - 1].key] : null;
          const lost = prev != null ? prev - value : 0;
          return (
            <li key={s.key}>
              <div className="funnel-row">
                <span className="funnel-label">{s.label}</span>
                <span className="funnel-value"><strong>{formatNumber(value)}</strong> · {pct(value, top)}%</span>
              </div>
              <span className="funnel-track">
                <motion.span
                  className="funnel-fill"
                  style={{ background: s.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(share * 100, value ? 4 : 0)}%` }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.1, ease: EASE }}
                />
              </span>
              {i > 0 && lost > 0 && <span className="funnel-lost">−{formatNumber(lost)} didn’t reach this stage</span>}
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
}
