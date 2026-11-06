import { motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { EASE, rise } from './shared';

const BLOCKS = 8;

/**
 * Segmented meter: whole blocks fill up to `ratio`, the next block fills
 * part-way, and the rest stay as dashed outlines.
 */
function Blocks({ ratio, label }) {
  const filled = Math.max(0, Math.min(1, ratio || 0)) * BLOCKS;
  return (
    <div className="blocks" role="img" aria-label={label}>
      {Array.from({ length: BLOCKS }, (_, i) => {
        const fill = Math.max(0, Math.min(1, filled - i));
        return (
          <span key={i} className={`block${fill > 0 ? ' is-on' : ''}`}>
            <motion.span
              className="block-fill"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: fill > 0 ? 1 : 0, width: `${fill * 100}%` }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.06, ease: EASE }}
            />
          </span>
        );
      })}
    </div>
  );
}

export default function MeterCard({ tone, icon: Icon, title, pill, value, format, of, ratio, meterLabel, foot }) {
  return (
    <motion.section className={`meter meter-${tone}`} variants={rise}>
      <header className="meter-head">
        <span className="meter-icon"><Icon strokeWidth={1.8} aria-hidden="true" /></span>
        <h2>{title}</h2>
        {pill && <span className="meter-pill">{pill}</span>}
      </header>
      <p className="meter-figure">
        <NumberFlow className="meter-value" value={value} format={format} locales="en-NG" willChange />
        {of && <span className="meter-of">/ {of}</span>}
      </p>
      <Blocks ratio={ratio} label={meterLabel} />
      {foot && <p className="meter-foot">{foot}</p>}
    </motion.section>
  );
}
