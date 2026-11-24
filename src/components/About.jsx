import Icon from './Icon';
import Reveal from './Reveal';
import { company, founder, milestones } from '../data/content';

function Founder() {
  return (
    <div className="founder" id="founder">
      <Reveal className="founder-photo">
        <img src={founder.photo} alt={`${founder.name}, ${founder.role}`} loading="lazy" />
      </Reveal>
      <Reveal className="founder-copy" delay={80}>
        <span className="kicker">Our founder</span>
        <h3 className="founder-name">{founder.name}</h3>
        <p className="founder-role">{founder.role}</p>
        <blockquote className="founder-quote">“{founder.quote}”</blockquote>
        <p className="justify">{founder.bio}</p>
        <h4 className="quals-title">Qualifications</h4>
        <ul className="quals">
          {founder.qualifications.map((q) => (
            <li key={q}><span className="quals-icon"><Icon name="badge" /></span>{q}</li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

export default function About() {
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="about-grid">
          <Reveal className="about-media">
            <img
              className="about-img-main"
              src="/images/staff-storefront.jpg"
              alt="Kleener Touch staff member in uniform cleaning a commercial glass frontage"
              loading="lazy"
            />
            <img
              className="about-img-sub"
              src="/images/staff-uniform.jpg"
              alt="Kleener Touch staff member in a branded uniform"
              loading="lazy"
            />
            <div className="about-badge">
              <Icon name="shield" />
              <span>
                <strong>RC {company.rc}</strong>
                <small>Registered Limited Liability Company</small>
              </span>
            </div>
          </Reveal>

          <Reveal className="about-copy" delay={80}>
            <span className="kicker">Who we are</span>
            <h2>A facility partner built on structure, fairness and accountability.</h2>
            <p className="justify">
              {company.legalName} is a Nigerian facility solutions company committed to delivering professional, reliable
              and customer-focused services that keep facilities, workplaces and residential spaces functioning efficiently.
            </p>
            <p className="justify">
              We were established to close a real gap between skilled craftsmen and the clients who need them. Craftsmen
              often struggle to negotiate fair compensation, while clients face challenges with accountability, reliability,
              supervision and continuity. Kleener Touch provides structure to that relationship: work is properly defined,
              expectations are clearly communicated and agreed compensation is honoured.
            </p>
            <ol className="milestones">
              {milestones.map(({ date, text }) => (
                <li key={date}><strong>{date}</strong><span>{text}</span></li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Founder />
      </div>
    </section>
  );
}
