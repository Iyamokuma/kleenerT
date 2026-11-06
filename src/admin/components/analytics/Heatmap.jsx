import { motion } from 'motion/react';
import { bookingOptions } from '../../../data/content';
import { formatNumber } from '../../lib/format';
import { rise } from './shared';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS = bookingOptions.timeWindows.map((t) => t.value); // Morning, Afternoon, Flexible
const STEPS = 5; // sequential single-hue ramp, light → dark (see .heat-0 … .heat-5)

/** Which weekday and time of day customers ask for. */
export default function Heatmap({ cells, periodLabel }) {
  const grid = SLOTS.map(() => DAYS.map(() => 0));
  for (const c of cells ?? []) {
    const row = SLOTS.indexOf(c.slot) >= 0 ? SLOTS.indexOf(c.slot) : SLOTS.length - 1;
    if (c.dow >= 1 && c.dow <= 7) grid[row][c.dow - 1] += c.count;
  }
  const max = Math.max(0, ...grid.flat());
  const dayTotals = DAYS.map((_, d) => grid.reduce((sum, row) => sum + row[d], 0));
  const peak = max ? DAYS[dayTotals.indexOf(Math.max(...dayTotals))] : null;
  const level = (v) => (v && max ? Math.max(1, Math.ceil((v / max) * STEPS)) : 0);

  return (
    <motion.section className="ov-panel" variants={rise}>
      <header className="ov-panel-head"><h2>Busiest days</h2>{peak && <span className="ov-panel-chip">Peak: {peak}</span>}</header>
      <p className="ov-panel-sub">Requested service days for bookings in the {periodLabel}.</p>
      <div className="heat" role="table" aria-label="Bookings by requested weekday and time of day">
        <div role="row" className="heat-row heat-head">
          <span role="columnheader"><span className="sr-only">Time</span></span>
          {DAYS.map((d) => <span key={d} role="columnheader">{d}</span>)}
        </div>
        {SLOTS.map((slot, r) => (
          <div role="row" className="heat-row" key={slot}>
            <span role="rowheader" className="heat-slot">{slot}</span>
            {DAYS.map((d, c) => {
              const v = grid[r][c];
              return (
                <motion.span
                  key={d}
                  role="cell"
                  className={`heat-cell heat-${level(v)}`}
                  title={`${d} ${slot.toLowerCase()}: ${formatNumber(v)}`}
                  aria-label={`${d} ${slot.toLowerCase()}: ${formatNumber(v)} bookings`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 24, delay: 0.1 + (r * 7 + c) * 0.015 }}
                >
                  {v > 0 ? v : ''}
                </motion.span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="heat-legend" aria-hidden="true">
        <span>Fewer</span>
        {Array.from({ length: STEPS + 1 }, (_, i) => <i key={i} className={`heat-${i}`} />)}
        <span>More</span>
      </div>
    </motion.section>
  );
}
