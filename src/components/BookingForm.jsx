import { useState } from 'react';
import Icon from './Icon';
import { bookingOptions, company, services } from '../data/content';

const { propertyTypes, timeWindows, frequencies } = bookingOptions;

// Local date as YYYY-MM-DD, used for the date picker's minimum and validation.
const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const initialForm = {
  name: '', phone: '', email: '', service: '', propertyType: '', location: '',
  date: '', time: timeWindows[0], frequency: frequencies[0], notes: '',
  website: '', // honeypot: real visitors never see or fill this
};

const fieldOrder = ['name', 'phone', 'email', 'service', 'location', 'date'];

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Enter your full name.';
  const digits = form.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 14) errors.phone = 'Enter a valid phone number.';
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.service) errors.service = 'Choose a service.';
  if (form.location.trim().length < 3) errors.location = 'Tell us where the service is needed.';
  if (!form.date) errors.date = 'Pick a preferred date.';
  else if (form.date < todayISO()) errors.date = 'Pick today or a later date.';
  return errors;
}

// Shape matches the public.bookings table in supabase/schema.sql.
function toRow(form) {
  return {
    full_name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim() || null,
    service: form.service,
    property_type: form.propertyType || null,
    location: form.location.trim(),
    preferred_date: form.date,
    preferred_time: form.time,
    frequency: form.frequency,
    notes: form.notes.trim() || null,
  };
}

// Fallback for when Supabase isn't configured, so a booking still reaches the business.
function mailtoFor(row) {
  const lines = [
    `Name: ${row.full_name}`,
    `Phone: ${row.phone}`,
    row.email && `Email: ${row.email}`,
    `Service: ${row.service}`,
    row.property_type && `Property: ${row.property_type}`,
    `Location: ${row.location}`,
    `Preferred date: ${row.preferred_date} (${row.preferred_time})`,
    `Frequency: ${row.frequency}`,
    row.notes && `\n${row.notes}`,
  ].filter(Boolean).join('\n');
  const subject = `Service booking — ${row.service}`;
  return `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
}

async function submitBooking(row) {
  // Loaded on demand so the Supabase client stays out of the initial bundle.
  const { supabase } = await import('../lib/supabase');
  if (!supabase) {
    window.location.href = mailtoFor(row);
    return 'email';
  }
  // No .select(): visitors may insert but not read bookings back.
  const { error } = await supabase.from('bookings').insert(row);
  if (error) throw error;
  return 'saved';
}

function Field({ label, error, optional = false, children }) {
  return (
    <label className={`field ${error ? 'is-invalid' : ''}`.trim()}>
      <span>{label}{optional && <em> (optional)</em>}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

function PillGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="pills">
        {options.map((option) => (
          <label className="pill" key={option}>
            <input type="radio" name={name} value={option} checked={value === option} onChange={onChange} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function BookingForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | saved | email | error

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
    if (status === 'error') setStatus('idle');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    const firstInvalid = fieldOrder.find((k) => nextErrors[k]);
    if (firstInvalid) {
      e.currentTarget.elements[firstInvalid]?.focus();
      return;
    }

    // Bots fill every field; quietly pretend it worked.
    if (form.website) {
      setStatus('saved');
      return;
    }

    setStatus('submitting');
    try {
      setStatus(await submitBooking(toRow(form)));
    } catch (err) {
      console.error('Booking failed', err);
      setStatus('error');
    }
  };

  const reset = () => {
    setForm(initialForm);
    setErrors({});
    setStatus('idle');
  };

  if (status === 'saved' || status === 'email') {
    const firstName = form.name.trim().split(/\s+/)[0];
    return (
      <div className="contact-form booking-success" id="book" role="status" aria-live="polite">
        <span className="success-icon"><Icon name="check" /></span>
        <h3>{status === 'saved' ? 'Booking received' : 'Almost done'}</h3>
        {status === 'saved' ? (
          <p>
            Thanks{firstName ? `, ${firstName}` : ''}. We’ll call you on <strong>{form.phone}</strong> to confirm
            your {form.service.toLowerCase() || 'service'} booking.
          </p>
        ) : (
          <p>Your email app should open with your booking ready to send. Just hit send and we’ll call you to confirm.</p>
        )}
        <p className="form-note">
          Need it urgently? Call <a href={company.phoneHref}>{company.phone}</a>.
        </p>
        <button type="button" className="btn btn-ghost" onClick={reset}>Book another service</button>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form className="contact-form" id="book" onSubmit={onSubmit} noValidate aria-labelledby="book-title">
      <div className="form-head">
        <h3 id="book-title">Book a service</h3>
        <p>Tell us what you need and we’ll call to confirm your booking.</p>
      </div>

      <div className="field-row">
        <Field label="Full name" error={errors.name}>
          <input name="name" type="text" autoComplete="name" maxLength={120} value={form.name} onChange={update} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={20} placeholder="0801 234 5678" value={form.phone} onChange={update} aria-invalid={!!errors.phone} />
        </Field>
      </div>

      <Field label="Email" optional error={errors.email}>
        <input name="email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={update} aria-invalid={!!errors.email} />
      </Field>

      <div className="field-row">
        <Field label="Service" error={errors.service}>
          <select name="service" value={form.service} onChange={update} aria-invalid={!!errors.service}>
            <option value="">Select a service</option>
            {services.map((s) => <option key={s.id}>{s.title}</option>)}
            <option>Something else</option>
          </select>
        </Field>
        <Field label="Property type" optional>
          <select name="propertyType" value={form.propertyType} onChange={update}>
            <option value="">Select type</option>
            {propertyTypes.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Address / area" error={errors.location}>
        <input name="location" type="text" autoComplete="street-address" maxLength={200} placeholder="e.g. 12 Admiralty Way, Lekki, Lagos" value={form.location} onChange={update} aria-invalid={!!errors.location} />
      </Field>

      <div className="field-row">
        <Field label="Preferred date" error={errors.date}>
          <input name="date" type="date" min={todayISO()} value={form.date} onChange={update} aria-invalid={!!errors.date} />
        </Field>
        <Field label="How often?">
          <select name="frequency" value={form.frequency} onChange={update}>
            {frequencies.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
      </div>

      <PillGroup legend="Preferred time" name="time" options={timeWindows} value={form.time} onChange={update} />

      <Field label="Anything we should know?" optional>
        <textarea name="notes" rows="3" maxLength={2000} placeholder="Size of the space, number of rooms, special requests…" value={form.notes} onChange={update} />
      </Field>

      <div className="hp" aria-hidden="true">
        <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} /></label>
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={status === 'submitting'}>
        {status === 'submitting' ? <><span className="spinner" aria-hidden="true" /> Booking…</> : <><Icon name="calendar" /> Book service</>}
      </button>

      <p className={`form-note ${status === 'error' || hasErrors ? 'is-error' : ''}`.trim()} role="status" aria-live="polite">
        {status === 'error'
          ? <>We couldn’t send your booking. Please try again or call <a href={company.phoneHref}>{company.phone}</a>.</>
          : hasErrors
            ? 'Please check the highlighted fields.'
            : 'We’ll call you to confirm the details before your service.'}
      </p>
    </form>
  );
}
