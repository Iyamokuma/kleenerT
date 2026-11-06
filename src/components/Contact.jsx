import BookingForm from './BookingForm';
import Icon from './Icon';
import { company } from '../data/content';

export default function Contact() {
  return (
    <section className="section" id="contact">
      <div className="container contact-grid">
        <div className="contact-copy">
          <span className="kicker">Book a service</span>
          <h2>Let’s keep your facility working.</h2>
          <p>
            Every facility has different needs. Our promise is to listen, understand, respond and deliver — whether it’s
            a home, an office, a hotel or a corporate facility.
          </p>

          <ul className="contact-list">
            <li><Icon name="phone" /><a href={company.phoneHref}>{company.phone}</a></li>
            <li><Icon name="mail" /><a href={`mailto:${company.email}`}>{company.email}</a></li>
            <li><Icon name="pin" /><span>Head Office: {company.office}</span></li>
            <li><Icon name="instagram" /><a href={company.instagram.url} target="_blank" rel="noopener noreferrer">{company.instagram.handle}</a></li>
            <li><Icon name="x" /><a href={company.x.url} target="_blank" rel="noopener noreferrer">{company.x.handle}</a></li>
          </ul>

          <div className="coverage">
            <span className="coverage-label">Geographic coverage</span>
            <ul className="chips chips-sm">
              {company.coverage.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>

        <BookingForm />
      </div>
    </section>
  );
}
