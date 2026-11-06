import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Icon from '../../../components/Icon';
import { serviceOptions } from '../../../components/booking/bookingLogic';
import { formatNaira, formatNumber } from '../../lib/format';
import { EASE, pct, rise } from './shared';

const PER_PAGE = 4;
const TINTS = ['pink', 'sky', 'lilac', 'peach'];

/**
 * Every service the business offers, most-booked first, four to a page.
 * Services nobody booked yet still show (with 0) so the panel reads as a menu.
 */
export default function ServicesPanel({ services, periodLabel }) {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);

  const counts = new Map((services ?? []).map((s) => [s.service, s]));
  const known = new Set(serviceOptions.map((o) => o.value));
  const items = [
    ...serviceOptions.map((o, order) => ({ ...o, order, count: counts.get(o.value)?.count ?? 0, revenue: counts.get(o.value)?.revenue ?? 0 })),
    ...(services ?? []).filter((s) => !known.has(s.service)).map((s, i) => ({ value: s.service, label: s.service, icon: 'layers', order: 99 + i, count: s.count, revenue: s.revenue })),
  ].sort((a, b) => b.count - a.count || a.order - b.order);
  const total = items.reduce((sum, s) => sum + s.count, 0);
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const current = Math.min(page, pages - 1);
  const slice = items.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE);

  const go = (next) => { setDir(next > current ? 1 : -1); setPage(next); };

  return (
    <motion.section className="ov-panel services-panel" variants={rise}>
      <header className="ov-panel-head">
        <h2>Popular services</h2>
        {pages > 1 && (
          <div className="dots" role="group" aria-label="Pages">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} type="button" className="dot" aria-pressed={i === current} aria-label={`Page ${i + 1} of ${pages}`} onClick={() => go(i)} />
            ))}
          </div>
        )}
      </header>
      <p className="ov-panel-sub">{total ? `${formatNumber(total)} bookings in the ${periodLabel}` : `No bookings in the ${periodLabel} yet`}</p>
      <div className="svc-viewport">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.ul
            key={current}
            className="svc-grid"
            custom={dir}
            variants={{
              enter: (d) => ({ opacity: 0, x: d * 40 }),
              center: { opacity: 1, x: 0 },
              exit: (d) => ({ opacity: 0, x: d * -40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: EASE }}
          >
            {slice.map((s, i) => {
              const share = pct(s.count, total);
              return (
                <li key={s.value}>
                  <Link to={`/bookings?service=${encodeURIComponent(s.value)}`} className="svc" aria-label={`${s.label}: ${s.count} bookings, ${share}% of all. View bookings`}>
                    <span className={`svc-icon tint-${TINTS[(current * PER_PAGE + i) % TINTS.length]}`}><Icon name={s.icon} /></span>
                    <strong className="svc-name">{s.label}</strong>
                    <span className="svc-count">{formatNumber(s.count)} {s.count === 1 ? 'booking' : 'bookings'}{Number(s.revenue) > 0 ? ` · ${formatNaira(s.revenue)}` : ''}</span>
                    <span className="svc-bar" aria-hidden="true">
                      <motion.span initial={{ width: 0 }} animate={{ width: `${share}%` }} transition={{ duration: 0.7, delay: 0.2 + i * 0.07, ease: EASE }} />
                    </span>
                    <span className="svc-share" aria-hidden="true">{share}%</span>
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
