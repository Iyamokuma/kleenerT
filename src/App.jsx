import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Values from './components/Values';
import Services from './components/Services';
import Gallery from './components/Gallery';
import Approach from './components/Approach';
import WhyUs from './components/WhyUs';
import Industries from './components/Industries';
import Clients from './components/Clients';
import People from './components/People';
import Leadership from './components/Leadership';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <Stats />
        <About />
        <Values />
        <Services />
        <Gallery />
        <Approach />
        <WhyUs />
        <Industries />
        <Clients />
        <People />
        <Leadership />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
