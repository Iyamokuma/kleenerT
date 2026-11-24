import { useEffect, useState } from 'react';
import { highlights } from '../data/content';
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

/** Solid strip under the hero: the three figures the client wants highlighted. */
export default function Stats() {
  return (
    <section className="highlights" aria-label="Kleener Touch at a glance">
      <div className="container">
        <ul className="highlights-grid">
          {highlights.map(({ label, value, from, suffix }) => (
            <li key={label}>
              <span className="highlight-label">{label}</span>
              <span className="highlight-num">
                <CountUp value={value} from={from} />{suffix}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
