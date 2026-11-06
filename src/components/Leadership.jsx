import Reveal from './Reveal';
import { founder } from '../data/content';

export default function Leadership() {
  return (
    <section className="section section-tint" id="leadership">
      <div className="container leader">
        <Reveal className="leader-photo">
          <img src={founder.photo} alt={`${founder.name}, ${founder.role}`} loading="lazy" />
        </Reveal>
        <Reveal className="leader-copy" delay={80}>
          <span className="kicker">Leadership</span>
          <h2>{founder.name}</h2>
          <p className="leader-role">{founder.role}</p>
          <blockquote className="leader-quote">“{founder.quote}”</blockquote>
          <p>{founder.bio}</p>
          <ul className="creds">
            {founder.credentials.map(({ title, date }) => (
              <li key={title}><strong>{title}</strong><span>{date}</span></li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
