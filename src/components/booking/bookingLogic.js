import { bookingOptions, company, services } from '../../data/content';

export const OTHER_SERVICE = 'Something else';

export const serviceOptions = [
  ...services.map((s) => ({ value: s.title, label: s.tab, blurb: s.blurb, icon: s.icon })),
  { value: OTHER_SERVICE, label: 'Something else', blurb: 'Tell us what you need', icon: 'layers' },
];

export const steps = [
  { title: 'What do you need?', short: 'Service', fields: ['service'] },
  { title: 'When & where?', short: 'Schedule', fields: ['date', 'location'] },
  { title: 'Your details', short: 'Details', fields: ['name', 'phone', 'email'] },
];

export const initialForm = {
  service: '',
  propertyType: '',
  frequency: bookingOptions.frequencies[0],
  date: '',
  time: bookingOptions.timeWindows[0].value,
  location: '',
  name: '',
  phone: '',
  email: '',
  notes: '',
  website: '', // honeypot: hidden from people, bots fill it in
};

// Local calendar date as YYYY-MM-DD (toISOString alone would shift to UTC).
export function isoDate(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function upcomingDays(count = 10) {
  const start = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return {
      iso: isoDate(d),
      weekday: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-NG', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-NG', { month: 'short' }),
    };
  });
}

export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });
}

const validators = {
  service: (f) => (!f.service ? 'Choose the service you need.' : ''),
  date: (f) => {
    if (!f.date) return 'Pick a preferred date.';
    if (f.date < isoDate(new Date())) return 'Pick today or a later date.';
    return '';
  },
  location: (f) => (f.location.trim().length < 3 ? 'Tell us where the service is needed.' : ''),
  name: (f) => (f.name.trim().length < 2 ? 'Enter your full name.' : ''),
  phone: (f) => {
    const digits = f.phone.replace(/\D/g, '').length;
    return digits < 10 || digits > 15 ? 'Enter a valid phone number.' : '';
  },
  email: (f) => (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? 'Enter a valid email address.' : ''),
};

export function validateStep(stepIndex, form) {
  return Object.fromEntries(
    steps[stepIndex].fields
      .map((field) => [field, validators[field](form)])
      .filter(([, message]) => message),
  );
}

// Named arguments of public.create_booking() in supabase/migrations.
function toRpcArgs(f) {
  return {
    p_full_name: f.name.trim(),
    p_phone: f.phone.trim(),
    p_service: f.service,
    p_location: f.location.trim(),
    p_preferred_date: f.date,
    p_email: f.email.trim() || null,
    p_property_type: f.propertyType || null,
    p_preferred_time: f.time,
    p_frequency: f.frequency,
    p_notes: f.notes.trim() || null,
  };
}

// Used only when Supabase isn't configured, so a booking still reaches the business.
function mailtoFor(f) {
  const body = [
    `Name: ${f.name}`,
    `Phone: ${f.phone}`,
    f.email && `Email: ${f.email}`,
    `Service: ${f.service}`,
    f.propertyType && `Property: ${f.propertyType}`,
    `Location: ${f.location}`,
    `Preferred date: ${f.date} (${f.time})`,
    `Frequency: ${f.frequency}`,
    f.notes && `\n${f.notes}`,
  ].filter(Boolean).join('\n');
  const subject = `Service booking — ${f.service}`;
  return `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export class BookingError extends Error {}

export async function submitBooking(form) {
  // Bots fill every field; pretend it worked and store nothing.
  if (form.website) return { via: 'saved', reference: null };

  // Loaded on demand so the Supabase client stays out of the initial bundle.
  const { supabase } = await import('../../lib/supabase');
  if (!supabase) {
    window.location.href = mailtoFor(form);
    return { via: 'email', reference: null };
  }

  const { data, error } = await supabase.rpc('create_booking', toRpcArgs(form));
  // Database not set up yet (function missing): don't lose the booking, send it by email.
  if (error?.code === 'PGRST202') {
    window.location.href = mailtoFor(form);
    return { via: 'email', reference: null };
  }
  if (error) {
    // Validation and rate-limit messages from the database are written for customers.
    const friendly = error.code === '22023' || error.hint === 'rate_limited';
    throw new BookingError(friendly ? error.message : `We couldn’t send your booking. Please try again or call ${company.phone}.`);
  }
  return { via: 'saved', reference: data };
}
