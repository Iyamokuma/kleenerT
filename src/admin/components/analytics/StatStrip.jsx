import { motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { ArrowDownRight, ArrowUpRight, Ban, Globe, Inbox, Timer } from 'lucide-react';
import { formatNumber } from '../../lib/format';
import { change, formatDuration, pct, rise, stagger } from './shared';

function Delta({ delta, goodWhen = 'up' }) {
  if (!delta) return null;
  const good = delta.dir === 'flat' ? null : delta.dir === goodWhen;
  const Arrow = delta.dir === 'down' ? ArrowDownRight : ArrowUpRight;
  return (
    <span className={`delta${good === true ? ' is-good' : good === false ? ' is-bad' : ''}`}>
      {delta.dir !== 'flat' && delta.label !== 'New' && <Arrow aria-hidden="true" strokeWidth={2.2} />}
      {delta.label}
    </span>
  );
}

function Stat({ icon: Icon, label, children, sub, delta, goodWhen }) {
  return (
    <motion.div className="ov-stat" variants={rise}>
      <span className="ov-stat-icon"><Icon strokeWidth={1.8} aria-hidden="true" /></span>
      <div className="ov-stat-body">
        <span className="ov-stat-label">{label}</span>
        <span className="ov-stat-value">{children}<Delta delta={delta} goodWhen={goodWhen} /></span>
        <span className="ov-stat-sub">{sub}</span>
      </div>
    </motion.div>
  );
}

export default function StatStrip({ a, periodLabel }) {
  const onlineShare = pct(a.website, a.received);
  const cancelRate = pct(a.cancelled, a.received);
  return (
    <motion.div className="ov-stats" variants={stagger} initial="hidden" animate="show">
      <Stat icon={Inbox} label="Requests received" delta={change(a.received, a.received_prev)} sub={`vs ${formatNumber(a.received_prev)} the ${periodLabel.replace('last', 'previous')}`}>
        <NumberFlow value={a.received} locales="en-NG" />
      </Stat>
      <Stat icon={Timer} label="Avg. first response" sub={a.responded ? `Time to first status change · ${formatNumber(a.responded)} requests` : 'Shows once requests are followed up'}>
        {formatDuration(a.avg_response_minutes)}
      </Stat>
      <Stat icon={Globe} label="Booked online" sub={`${formatNumber(a.website)} of ${formatNumber(a.received)} came from the website`}>
        <NumberFlow value={onlineShare} suffix="%" />
      </Stat>
      <Stat icon={Ban} label="Cancellation rate" sub={`${formatNumber(a.cancelled)} cancelled in this period`}>
        <NumberFlow value={cancelRate} suffix="%" />
      </Stat>
    </motion.div>
  );
}
