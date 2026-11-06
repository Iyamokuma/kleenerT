import Reveal from './Reveal';
import SectionHead from './SectionHead';
import { mission, values, vision } from '../data/content';

export default function Values() {
  return (
    <section className="section section-tint">
      <div className="container">
        <div className="vm-grid">
          <Reveal as="article" className="vm-card">
            <span className="vm-label">Our vision</span>
            <p>{vision}</p>
          </Reveal>
          <Reveal as="article" className="vm-card vm-card-dark" delay={80}>
            <span className="vm-label">Our mission</span>
            <p>{mission}</p>
          </Reveal>
        </div>

        <SectionHead kicker="Core values" title="What we hold ourselves to" center />
        <ul className="values">
          {values.map(({ title, text }, i) => (
            <Reveal as="li" key={title} delay={(i % 4) * 60}>
              <strong>{title}</strong>
              <span>{text}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
