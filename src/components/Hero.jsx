import Icon from './Icon';
import { BookLink } from './booking/BookingProvider';
import { clients, hero } from '../data/content';

export function ClientMarquee() {
  // Rendered twice so the CSS loop can translate by exactly half its width.
  const row = (hidden) => (
    <ul className="marquee-row" aria-hidden={hidden || undefined}>
      {clients.map((c) => <li key={c}>{c}</li>)}
    </ul>
  );
  return (
    <div className="trusted">
      <p className="trusted-title">Trusted by homeowners and businesses across Lagos and beyond</p>
      <div className="marquee">
        <div className="marquee-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const [first, middle, last] = hero.headline;
  return (
    <section className="hero">
      <img
        className="hero-bg"
        src="/images/hero.jpg"
        alt=""
        width="1280"
        height="765"
        fetchPriority="high"
      />
      <div className="hero-overlay" />

      <div className="container hero-inner">
        <h1>
          <span>{first}</span> <span>{middle}</span> <span className="accent">{last}</span>
        </h1>
        <p className="lead">{hero.lead}</p>
        <p className="hero-sub">{hero.sub}</p>
        <div className="hero-actions">
          <BookLink className="btn btn-light btn-lg">Book a service <Icon name="arrow" /></BookLink>
          <a href="#services" className="btn btn-glass btn-lg">Our services</a>
        </div>
      </div>
    </section>
  );
}
