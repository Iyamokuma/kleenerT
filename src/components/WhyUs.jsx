import Icon from './Icon';
import Reveal from './Reveal';
import { quality, reasons } from '../data/content';

export default function WhyUs() {
  return (
    <section className="section section-dark">
      <div className="container why-grid">
        <div className="why-copy">
          <span className="kicker kicker-light">Why Kleener Touch</span>
          <h2>Quality built into the process — not inspected after.</h2>
          <p>
            From staff selection and onboarding to role-specific training, supervision, performance monitoring and
            corrective action, our objective is consistency you can count on.
          </p>
          <ul className="checklist light">
            {quality.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </div>
        <div className="why-cards">
          {reasons.map(({ icon, title, text }, i) => (
            <Reveal className="why-card" key={title} delay={(i % 2) * 60}>
              <Icon name={icon} />
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
