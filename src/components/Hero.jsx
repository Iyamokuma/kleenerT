import Icon from './Icon';
import { BookLink } from './booking/BookingProvider';
import Foam, { Bubbles } from './Foam';
import { clients, company } from '../data/content';

const heroBubbles = [
  [4, 74, 14, 0], [8, 70, 34, 1.2], [91, 62, 46, .6], [96, 70, 18, 2], [70, 78, 24, 1.6], [56, 20, 10, .3],
];

function ClientMarquee() {
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
  return (
    <>
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
        <Bubbles items={heroBubbles} />

        <div className="container hero-inner">
          <h1>Keep your space <span className="accent">spotless</span> and working.</h1>
          <p className="lead">
            {company.slogan} Professional cleaning, housekeeping, facility management and pest control for homes,
            offices and businesses across Nigeria.
          </p>
          <div className="hero-actions">
            <BookLink className="btn btn-primary btn-lg">Book a service <Icon name="arrow" /></BookLink>
            <a href="#services" className="btn btn-glass btn-lg">Our services</a>
          </div>
          <div className="hero-proof">
            <span><strong>98%+</strong> customer retention</span>
            <span className="sep" />
            <span><strong>30+</strong> trained staff</span>
            <span className="sep" />
            <span>RC {company.rc}</span>
          </div>
        </div>

        <Foam className="hero-foam" />
      </section>
      <ClientMarquee />
    </>
  );
}
