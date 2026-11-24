import Icon from './Icon';
import Reveal from './Reveal';
import SectionHead from './SectionHead';
import { BookLink } from './booking/BookingProvider';
import { gallery } from '../data/content';

/**
 * Each photo says what the service is and why it matters, and links to booking it.
 * Portrait cards keep people in frame; on phones the row scrolls sideways.
 */
export default function Gallery() {
  return (
    <section className="section section-tint" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHead kicker="On the job" title="See what each service looks like." id="gallery-title">
          Real Kleener Touch staff on real jobs: what we do, and the care we take doing it.
        </SectionHead>
      </div>
      <div className="container gallery-wrap">
        <ul className="gallery" aria-label="Photos from Kleener Touch jobs">
          {gallery.map(({ src, alt, position, title, text, service }, i) => (
            <Reveal as="li" key={src} className="g-card" delay={(i % 3) * 70}>
              <img src={src} alt={alt} loading="lazy" style={{ objectPosition: position }} />
              <div className="g-copy">
                <h3>{title}</h3>
                <p>{text}</p>
                <BookLink service={service} className="g-link">Book this <Icon name="arrow" /></BookLink>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
