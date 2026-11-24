import { useState } from 'react';
import Icon from './Icon';
import Reveal from './Reveal';
import { BookLink } from './booking/BookingProvider';
import SectionHead from './SectionHead';
import { qualityControl, services } from '../data/content';
import { useMedia } from '../hooks/useMedia';

function ServiceBody({ s }) {
  return (
    <>
      <p className="justify svc-intro">{s.intro}</p>
      <ul className="checklist cols-2">
        {s.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <BookLink service={s.title} className="btn btn-primary btn-sm svc-cta">
        Book this service <Icon name="arrow" />
      </BookLink>
    </>
  );
}

function ServiceImage({ s }) {
  return (
    <div className="svc-media">
      <img src={s.image.src} alt={s.image.alt} loading="lazy" style={{ objectPosition: s.image.position }} />
      <span className="svc-letter" aria-hidden="true">{s.letter}</span>
    </div>
  );
}

/** Phones: one group open at a time, so the section stays short. */
function ServiceAccordion() {
  const [open, setOpen] = useState(services[0].id);
  return (
    <div className="svc-accordion">
      {services.map((s) => {
        const expanded = open === s.id;
        return (
          <article key={s.id} className={`svc-acc${expanded ? ' is-open' : ''}`}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`svc-${s.id}`}
                onClick={() => setOpen(expanded ? null : s.id)}
              >
                <span className="svc-acc-letter" aria-hidden="true">{s.letter}</span>
                <span className="svc-acc-title">{s.title}<small>{s.items.length} services</small></span>
                <span className="svc-acc-chev" aria-hidden="true" />
              </button>
            </h3>
            <div id={`svc-${s.id}`} className="svc-acc-body" hidden={!expanded}>
              <ServiceImage s={s} />
              <ServiceBody s={s} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function Services() {
  const compact = useMedia('(max-width: 760px)');

  return (
    <section className="section" id="services">
      <div className="container">
        <SectionHead kicker="Our services" title="One partner for everything your facility needs.">
          Instead of engaging multiple providers for different needs, access a broad range of services through one
          dependable partner.
        </SectionHead>

        {compact ? <ServiceAccordion /> : (
          <div className="svc-grid">
            {services.map((s, i) => (
              <Reveal as="article" key={s.id} className="svc-card" delay={(i % 2) * 80}>
                <ServiceImage s={s} />
                <div className="svc-card-body">
                  <h3><span className="sr-only">{s.letter}. </span>{s.title}</h3>
                  <ServiceBody s={s} />
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="qc-band">
          <span className="qc-icon"><Icon name="shield" /></span>
          <div>
            <h3>{qualityControl.title}</h3>
            <p className="justify">{qualityControl.text}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
