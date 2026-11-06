import SectionHead from './SectionHead';
import { industries } from '../data/content';

export default function Industries() {
  return (
    <section className="section">
      <div className="container">
        <SectionHead kicker="Industries we serve" title="Adaptable to every facility environment." />
        <ul className="chips">
          {industries.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </section>
  );
}
