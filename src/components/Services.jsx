import { useRef, useState } from 'react';
import Icon from './Icon';
import SectionHead from './SectionHead';
import { services } from '../data/content';

export default function Services() {
  const [activeId, setActiveId] = useState(services[0].id);
  const tabRefs = useRef({});

  // WAI-ARIA tabs: arrow keys move focus and selection
  const onKeyDown = (e, index) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = services[(index + step + services.length) % services.length];
    setActiveId(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <section className="section" id="services">
      <div className="container">
        <SectionHead kicker="Our services" title="One partner for everything your facility needs.">
          Instead of engaging multiple providers for different needs, access a broad range of services through one
          dependable partner.
        </SectionHead>

        <div className="tabs" role="tablist" aria-label="Service categories">
          {services.map((s, i) => {
            const selected = s.id === activeId;
            return (
              <button
                key={s.id}
                ref={(el) => { tabRefs.current[s.id] = el; }}
                type="button"
                role="tab"
                id={`tab-${s.id}`}
                aria-controls={`panel-${s.id}`}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(s.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <Icon name={s.icon} />
                {s.tab}
              </button>
            );
          })}
        </div>

        {services.map((s) => (
          <div
            key={s.id}
            className="panel"
            role="tabpanel"
            id={`panel-${s.id}`}
            aria-labelledby={`tab-${s.id}`}
            hidden={s.id !== activeId}
          >
            <div className="panel-copy">
              <h3>{s.title}</h3>
              <p>{s.intro}</p>
              <ul className="checklist cols-2">
                {s.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <img className="panel-img" src={s.image.src} alt={s.image.alt} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}
