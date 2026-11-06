import { useEffect, useState } from 'react';
import Icon from './Icon';
import { navLinks } from '../data/content';
import { useActiveSection } from '../hooks/useActiveSection';

const sectionIds = navLinks.map((l) => l.href.slice(1));

export function Brand({ light = false }) {
  return (
    <a href="#top" className={`brand ${light ? 'brand-light' : ''}`.trim()} aria-label="Kleener Touch home">
      <img src="/images/logo.png" alt="" width="44" height="50" />
      <span className="brand-text">
        <strong>Kleener Touch</strong>
        <small>Facility Management Ltd.</small>
      </span>
    </a>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`.trim()} id="top">
      <div className="container header-inner">
        <Brand />

        <nav className={`nav ${open ? 'is-open' : ''}`.trim()} id="nav" aria-label="Primary">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} onClick={close} className={active === href.slice(1) ? 'is-active' : undefined}>
              {label}
            </a>
          ))}
          <a href="#book" onClick={close} className="btn btn-primary btn-sm nav-cta">Book a service</a>
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-controls="nav"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
    </header>
  );
}
