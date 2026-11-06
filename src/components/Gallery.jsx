import Reveal from './Reveal';
import SectionHead from './SectionHead';
import { gallery } from '../data/content';

export default function Gallery() {
  return (
    <section className="section section-tint" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHead kicker="On the job" title="Real work, real spaces." id="gallery-title" />
        <div className="gallery">
          {gallery.map(({ src, alt, caption, area }, i) => (
            <Reveal as="figure" key={src} className={`g-${area}`} delay={(i % 3) * 60}>
              <img src={src} alt={alt} loading="lazy" />
              <figcaption>{caption}</figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
