import Reveal from './Reveal';
import SectionHead from './SectionHead';
import { steps } from '../data/content';

/** A connected timeline rather than six boxes; compact enough to fit one phone screen. */
export default function Approach() {
  return (
    <section className="section approach" id="approach">
      <div className="container">
        <SectionHead kicker="How we work" title="Our approach to service delivery" center>
          Effective service delivery begins with understanding your specific needs.
        </SectionHead>
        <Reveal as="ol" className="steps">
          {steps.map(({ title, text }, i) => (
            <li key={title}>
              <span className="step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="step-copy">
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
