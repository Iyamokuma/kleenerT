import Reveal from './Reveal';
import { company, milestones } from '../data/content';

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <Reveal className="about-media">
          <img className="about-img-main" src="/images/housekeeping.jpg" alt="Kleener Touch staff member setting up a finished living space" loading="lazy" />
          <img className="about-img-sub" src="/images/team-5.jpg" alt="Kleener Touch housekeeper in uniform" loading="lazy" />
          <div className="about-badge">
            <strong>RC {company.rc}</strong>
            <span>Registered Limited Liability Company</span>
          </div>
        </Reveal>

        <Reveal className="about-copy" delay={80}>
          <span className="kicker">Who we are</span>
          <h2>A facility partner built on structure, fairness and accountability.</h2>
          <p>
            {company.legalName} is a Nigerian facility solutions company committed to delivering professional, reliable
            and customer-focused services that keep facilities, workplaces and residential spaces functioning efficiently.
          </p>
          <p>
            We were established to close a real gap between skilled craftsmen and the clients who need them. Craftsmen
            often struggle to negotiate fair compensation, while clients face challenges with accountability, reliability,
            supervision and continuity. Kleener Touch provides structure to that relationship — work is properly defined,
            expectations are clearly communicated and agreed compensation is honoured.
          </p>
          <ol className="timeline">
            {milestones.map(({ date, text }) => (
              <li key={date}><span>{date}</span>{text}</li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
