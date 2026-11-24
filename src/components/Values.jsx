import Reveal from './Reveal';
import { mission, values, vision } from '../data/content';

/**
 * Vision, mission and core values on a dark-blue band. Values read as a numbered
 * list (no boxes); the last one, Excellence, closes the section as a statement.
 */
export default function Values() {
  const list = values.slice(0, -1);
  const closing = values[values.length - 1];

  return (
    <section className="section values-band" id="values" aria-labelledby="values-title">
      <div className="container">
        <div className="vm">
          <Reveal as="article" className="vm-item">
            <span className="vm-label">Our vision</span>
            <p className="justify">{vision}</p>
          </Reveal>
          <Reveal as="article" className="vm-item" delay={80}>
            <span className="vm-label">Our mission</span>
            <p className="justify">{mission}</p>
          </Reveal>
        </div>

        <div className="values-head">
          <span className="kicker kicker-light">Core values</span>
          <h2 id="values-title">What we hold ourselves to</h2>
        </div>

        <ol className="values-list">
          {list.map(({ title, text }, i) => (
            <Reveal as="li" key={title} delay={(i % 2) * 70}>
              <span className="value-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{title}</h3>
                <p className="justify">{text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="value-closing">
          <span className="value-n" aria-hidden="true">{String(values.length).padStart(2, '0')}</span>
          <h3>{closing.title}</h3>
          <p>{closing.text}</p>
        </Reveal>
      </div>
    </section>
  );
}
