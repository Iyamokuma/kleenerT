import Icon from './Icon';
import Reveal from './Reveal';
import SectionHead from './SectionHead';
import { reviews } from '../data/content';

export default function Clients() {
  return (
    <section className="section section-tint" id="clients">
      <div className="container">
        <SectionHead kicker="Client experience" title="Trusted by businesses across industries" center>
          Many of our client relationships have lasted more than a year — our strongest indicator of commitment to service.
        </SectionHead>

        <div className="reviews">
          {reviews.map(({ quote, name, meta }, i) => (
            <Reveal as="blockquote" className="review" key={name} delay={(i % 3) * 60}>
              <div className="stars" role="img" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, n) => <Icon key={n} name="star" className="star" />)}
              </div>
              <p>“{quote}”</p>
              <footer>
                <strong>{name}</strong>
                <span>{meta}</span>
              </footer>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
