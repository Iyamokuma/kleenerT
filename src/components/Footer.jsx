import Icon from './Icon';
import Foam, { Bubbles } from './Foam';
import { Brand } from './Header';
import { BookLink } from './booking/BookingProvider';
import { company, navLinks, services } from '../data/content';

const ctaBubbles = [[6, 58, 30, .4], [12, 70, 12, 1.4], [88, 54, 40, 0], [94, 64, 14, 1.8]];

function CallToAction() {
  return (
    <div className="container">
      <div className="cta">
        <img className="cta-bg" src="/images/bedroom-finish.jpg" alt="" loading="lazy" />
        <div className="cta-overlay" />
        <Bubbles items={ctaBubbles} />
        <div className="cta-inner">
          <h2>Ready for a spotless, well-managed space?</h2>
          <p>
            Let us handle the cleaning, staffing and upkeep while you focus on what matters most. We don’t just clean,
            we organize while at it.
          </p>
          <div className="cta-actions">
            <BookLink className="btn btn-primary btn-lg"><Icon name="calendar" /> Book a service</BookLink>
            <a href={company.phoneHref} className="btn btn-glass btn-lg"><Icon name="phone" /> Call {company.phone}</a>
          </div>
        </div>
        <Foam className="cta-foam" />
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <CallToAction />

      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>
            Your trusted partner for professional cleaning, janitorial &amp; housekeeping outsourcing, facility
            management, pest control and facility supplies — from homes to corporate facilities.
          </p>
          <div className="socials">
            <a href={company.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${company.instagram.handle}`}><Icon name="instagram" /></a>
            <a href={company.x.url} target="_blank" rel="noopener noreferrer" aria-label={`X ${company.x.handle}`}><Icon name="x" /></a>
            <a href={`mailto:${company.email}`} aria-label="Email"><Icon name="mail" /></a>
          </div>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            {navLinks.filter((l) => l.href !== '#services').map(({ href, label }) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
            <li><BookLink>Book a service</BookLink></li>
          </ul>
        </div>

        <div>
          <h4>Services</h4>
          <ul>
            {services.map((s) => <li key={s.id}><a href="#services">{s.title}</a></li>)}
          </ul>
        </div>

        <div>
          <h4>Get in touch</h4>
          <dl className="footer-contact">
            <dt>Call us now</dt>
            <dd><a href={company.phoneHref}>{company.phone}</a></dd>
            <dt>Email us</dt>
            <dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
            <dt>Head office</dt>
            <dd>{company.office}</dd>
          </dl>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {company.legalName} · RC {company.rc}</span>
        <span className="footer-tag">{company.tagline}</span>
      </div>
    </footer>
  );
}
