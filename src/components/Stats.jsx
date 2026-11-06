import { useEffect, useState } from 'react';
import { stats } from '../data/content';
import { useInView, prefersReducedMotion } from '../hooks/useInView';

function CountUp({ value, from = 0, duration = 1200 }) {
  const [ref, inView] = useInView({ threshold: 0.6, rootMargin: '0px' });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return undefined;
    let frame;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setDisplay(Math.round(from + (value - from) * (1 - (1 - p) ** 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, from, duration]);

  return <span ref={ref}>{display}</span>;
}

export default function Stats() {
  return (
    <section className="stats" aria-label="Company at a glance">
      <div className="container stats-grid">
        {stats.map(({ value, from, suffix, label }) => (
          <div className="stat" key={label}>
            <span className="stat-num"><CountUp value={value} from={from} />{suffix}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
