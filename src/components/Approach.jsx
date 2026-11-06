import Reveal from './Reveal';
import SectionHead from './SectionHead';
import { steps } from '../data/content';

export default function Approach() {
  return (
    <section className="section" id="approach">
      <div className="container">
        <SectionHead kicker="How we work" title="Our approach to service delivery" center>
          Effective service delivery begins with understanding your specific needs.
        </SectionHead>
        <ol className="steps">
          {steps.map(({ title, text }, i) => (
            <Reveal as="li" key={title} delay={(i % 3) * 60}>
              <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
