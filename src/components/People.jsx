import Reveal from './Reveal';
import SectionHead from './SectionHead';
import { team } from '../data/content';

export default function People() {
  return (
    <section className="section" aria-labelledby="people-title">
      <div className="container">
        <SectionHead kicker="Our people" title="The quality of our service is the quality of our people." id="people-title">
          We continue to invest in recruitment, onboarding, training, supervision and professional development.
        </SectionHead>
        <div className="people">
          {team.map(({ src, alt }, i) => (
            <Reveal as="img" key={src} src={src} alt={alt} loading="lazy" delay={(i % 6) * 50} />
          ))}
        </div>
      </div>
    </section>
  );
}
