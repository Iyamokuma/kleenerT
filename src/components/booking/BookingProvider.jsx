import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import BookingModal from './BookingModal';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetService, setPresetService] = useState(null);

  const openBooking = useCallback((service = null) => {
    setPresetService(service);
    setIsOpen(true);
  }, []);
  const closeBooking = useCallback(() => setIsOpen(false), []);

  // Deep link: any URL ending in #book opens the form straight away.
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#book') {
        openBooking();
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [openBooking]);

  const value = useMemo(() => ({ openBooking }), [openBooking]);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal open={isOpen} presetService={presetService} onClose={closeBooking} />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
}

/** A real link to #book (works without JS) that opens the booking modal. */
export function BookLink({ service, onClick, children, ...rest }) {
  const { openBooking } = useBooking();
  return (
    <a
      href="#book"
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        openBooking(service);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
