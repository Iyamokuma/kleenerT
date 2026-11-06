import { BookLink } from './booking/BookingProvider';
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

        <div className="book-card">
          <span className="book-card-icon"><Icon name="calendar" /></span>
          <h3>Book in under a minute</h3>
          <p>Pick a service, choose a date and leave your number. We’ll call to confirm the details.</p>
          <ol className="book-card-steps">
            <li><span>1</span>Choose the service you need</li>
            <li><span>2</span>Pick a date, time and location</li>
            <li><span>3</span>We call you to confirm</li>
          </ol>
          <BookLink className="btn btn-primary btn-lg btn-block">Book a service <Icon name="arrow" /></BookLink>
          <p className="form-note">Or call <a href={company.phoneHref}>{company.phone}</a></p>
        </div>
      </div>
    </section>
  );
}
