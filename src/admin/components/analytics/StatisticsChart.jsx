import { useState } from 'react';
import { motion } from 'motion/react';
import { ChartColumn, ChevronDown, Table } from 'lucide-react';
import { formatNaira, formatNumber } from '../../lib/format';
import { SERIES, countAxis, rise, useMedia } from './shared';

const GAP = 4;      // surface gap between stacked segments
const MIN_SEG = 8;  // a 1 next to a 40 must still be visible

const monthShort = (i) => new Date(2000, i, 1).toLocaleDateString('en-NG', { month: 'short' });
const monthLong = (i, year) => new Date(year, i, 1).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
const emptyYear = () => Array.from({ length: 12 }, (_, i) => ({ month: i + 1, completed: 0, open: 0, cancelled: 0, revenue: 0 }));
const totalOf = (r) => r.completed + r.open + r.cancelled;

function describe(r, i, year) {
  const parts = SERIES.map((s) => `${r[s.key]} ${s.label.toLowerCase()}`).join(', ');
  return `${monthLong(i, year)}: ${totalOf(r)} bookings (${parts}), ${formatNaira(r.revenue)} revenue`;
}

/** Monthly bookings for one year, stacked by outcome on hatched full-height tracks. */
export default function StatisticsChart({ monthly, year, years, onYear }) {
  const [hidden, setHidden] = useState(() => new Set());
  const [view, setView] = useState('chart');
  const [active, setActive] = useState(null);
  const compact = useMedia('(max-width: 760px)');
  const PLOT_H = compact ? 190 : 290;

  const now = new Date();
  const currentMonth = year === now.getFullYear() ? now.getMonth() : -1;
  const rows = monthly?.length === 12 ? monthly : emptyYear();
  const visible = SERIES.filter((s) => !hidden.has(s.key));
  const shown = rows.map((r) => visible.reduce((sum, s) => sum + r[s.key], 0));
  const { max, ticks } = countAxis(Math.max(0, ...shown));
  const yearTotal = rows.reduce((sum, r) => sum + totalOf(r), 0);
  const busiest = shown.indexOf(Math.max(...shown));
  const focus = active ?? (currentMonth >= 0 ? currentMonth : busiest);
  const fr = rows[focus];

  const toggle = (key) => setHidden((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next.size === SERIES.length ? prev : next; // always keep one series on
  });

  return (
    <motion.section className="ov-panel stats-panel" variants={rise}>
      <header className="ov-panel-head">
        <h2>Statistics</h2>
        <div className="legend" role="group" aria-label="Show or hide outcomes">
          {SERIES.map((s) => (
            <button key={s.key} type="button" className="legend-pill" aria-pressed={!hidden.has(s.key)} onClick={() => toggle(s.key)}>
              <i style={{ background: s.color }} aria-hidden="true" />{s.label}
            </button>
          ))}
        </div>
        <div className="ov-panel-tools">
          <div className="view-toggle" role="group" aria-label="Display as">
            <button type="button" aria-pressed={view === 'chart'} aria-label="Chart" title="Chart" onClick={() => setView('chart')}><ChartColumn strokeWidth={1.8} aria-hidden="true" /></button>
            <button type="button" aria-pressed={view === 'table'} aria-label="Table" title="Table" onClick={() => setView('table')}><Table strokeWidth={1.8} aria-hidden="true" /></button>
          </div>
          <label className="year-select">
            <span className="sr-only">Year</span>
            <select value={year} onChange={(e) => onYear(Number(e.target.value))}>
              {(years?.length ? years : [year]).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown strokeWidth={1.8} aria-hidden="true" />
          </label>
        </div>
      </header>
      <p className="ov-panel-sub">{formatNumber(yearTotal)} bookings received in {year}, by where they ended up.</p>

      {view === 'chart' ? (
        <>
          <div className="sc" style={{ '--plot-h': `${PLOT_H}px` }}>
            <div className="sc-axis" aria-hidden="true">
              {ticks.map((t) => <span key={t} style={{ bottom: `${(t / max) * 100}%` }}>{t}</span>)}
            </div>
            <div className="sc-cols" role="list" aria-label={`Bookings per month in ${year}`} onMouseLeave={() => setActive(null)}>
              {rows.map((r, i) => {
                const segs = visible
                  .filter((s) => r[s.key] > 0)
                  .map((s) => ({ ...s, h: Math.max(MIN_SEG, (r[s.key] / max) * PLOT_H - GAP) }));
                const stackH = segs.reduce((sum, s) => sum + s.h, 0) + GAP * Math.max(0, segs.length - 1);
                const isFocus = i === focus;
                return (
                  <div
                    key={r.month}
                    role="listitem"
                    tabIndex={0}
                    className={`sc-col${isFocus ? ' is-focus' : ''}${currentMonth >= 0 && i > currentMonth ? ' is-future' : ''}${i === currentMonth ? ' is-now' : ''}`}
                    aria-label={describe(r, i, year)}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                  >
                    <div className="sc-track">
                      <div className="sc-stack">
                        {segs.map((s, si) => (
                          <motion.span
                            key={s.key}
                            className="sc-seg"
                            style={{ background: s.color }}
                            initial={{ height: 0 }}
                            animate={{ height: s.h }}
                            transition={{ type: 'spring', stiffness: 160, damping: 21, delay: 0.1 + i * 0.035 + si * 0.06 }}
                          />
                        ))}
                      </div>
                      {isFocus && shown[i] > 0 && (
                        <motion.span
                          layoutId="sc-flag"
                          className="sc-flag"
                          style={{ bottom: Math.min(stackH + 10, PLOT_H - 30) }}
                          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                        >
                          {shown[i]}
                        </motion.span>
                      )}
                    </div>
                    <span className="sc-month" aria-hidden="true">{compact ? monthShort(i).charAt(0) : monthShort(i)}</span>
                  </div>
                );
              })}
            </div>
            {yearTotal === 0 && (
              <p className="sc-empty">No bookings in {year} yet. They’ll stack up here month by month.</p>
            )}
          </div>
          <div className="sc-readout" aria-hidden="true">
            <strong>{monthLong(focus, year)}</strong>
            <span>{formatNumber(totalOf(fr))} bookings</span>
            {SERIES.map((s) => (
              <span key={s.key} className="sc-readout-item"><i style={{ background: s.color }} />{formatNumber(fr[s.key])} {s.label.toLowerCase()}</span>
            ))}
            <span className="sc-readout-money">{formatNaira(fr.revenue)} earned</span>
          </div>
        </>
      ) : (
        <div className="sc-table-wrap">
          <table className="sc-table">
            <caption className="sr-only">Bookings per month in {year}, by outcome</caption>
            <thead>
              <tr><th scope="col">Month</th>{SERIES.map((s) => <th key={s.key} scope="col" className="num">{s.label}</th>)}<th scope="col" className="num">Total</th><th scope="col" className="num">Revenue</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.month}>
                  <th scope="row">{monthShort(i)}</th>
                  {SERIES.map((s) => <td key={s.key} className="num">{formatNumber(r[s.key])}</td>)}
                  <td className="num"><strong>{formatNumber(totalOf(r))}</strong></td>
                  <td className="num">{formatNaira(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                {SERIES.map((s) => <td key={s.key} className="num">{formatNumber(rows.reduce((sum, r) => sum + r[s.key], 0))}</td>)}
                <td className="num"><strong>{formatNumber(yearTotal)}</strong></td>
                <td className="num">{formatNaira(rows.reduce((sum, r) => sum + Number(r.revenue), 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </motion.section>
  );
}
