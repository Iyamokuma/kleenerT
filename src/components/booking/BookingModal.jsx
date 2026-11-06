import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../Icon';
import { Bubbles } from '../Foam';
import { bookingOptions, company } from '../../data/content';
import { prefersReducedMotion } from '../../hooks/useInView';
import '../../styles/booking.css';
import {
  BookingError, OTHER_SERVICE, formatDate, initialForm, isoDate, serviceOptions, steps, submitBooking,
  upcomingDays, validateStep,
} from './bookingLogic';

const { propertyTypes, timeWindows, frequencies } = bookingOptions;
const asideBubbles = [[10, 78, 26, 0], [22, 88, 12, 1.2], [78, 70, 34, .5], [86, 84, 14, 1.8]];
const CLOSE_FALLBACK_MS = 450;

function Field({ label, optional, error, children, className = '' }) {
  return (
    <label className={`field ${error ? 'is-invalid' : ''} ${className}`.trim()}>
      <span>{label}{optional && <em> (optional)</em>}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

function ServiceStep({ form, update, errors }) {
  return (
    <>
      <fieldset className="bk-services" aria-describedby={errors.service ? 'err-service' : undefined}>
        <legend className="sr-only">Service</legend>
        {serviceOptions.map((o, i) => (
          <label className="bk-service" key={o.value} style={{ '--i': i }}>
            <input type="radio" name="service" value={o.value} checked={form.service === o.value} onChange={update} />
            <span className="bk-service-card">
              <span className="bk-service-icon"><Icon name={o.icon} /></span>
              <span className="bk-service-text"><strong>{o.label}</strong><small>{o.blurb}</small></span>
              <span className="bk-tick"><Icon name="check" /></span>
            </span>
          </label>
        ))}
      </fieldset>
      {errors.service && <p className="field-error" id="err-service">{errors.service}</p>}

      <div className="field-row">
        <Field label="Property type" optional>
          <select name="propertyType" value={form.propertyType} onChange={update}>
            <option value="">Select type</option>
            {propertyTypes.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="How often?">
          <select name="frequency" value={form.frequency} onChange={update}>
            {frequencies.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
      </div>
    </>
  );
}

function ScheduleStep({ form, update, setField, errors }) {
  const days = useMemo(() => upcomingDays(10), []);
  const today = days[0].iso;
  const pickedChip = days.some((d) => d.iso === form.date);

  return (
    <>
      <div className={`field ${errors.date ? 'is-invalid' : ''}`.trim()}>
        <span id="date-label">Preferred date</span>
        <div className="bk-days" role="group" aria-labelledby="date-label">
          {days.map((d, i) => (
            <button
              type="button"
              key={d.iso}
              className="bk-day"
              style={{ '--i': i }}
              aria-pressed={form.date === d.iso}
              onClick={() => setField('date', d.iso)}
            >
              <small>{d.weekday}</small>
              <strong>{d.day}</strong>
              <small>{d.month}</small>
            </button>
          ))}
        </div>
        <label className={`bk-other-date ${form.date && !pickedChip ? 'is-set' : ''}`.trim()}>
          <Icon name="calendar" />
          <span>{form.date && !pickedChip ? formatDate(form.date) : 'Pick another date'}</span>
          <input
            name="date"
            type="date"
            min={today}
            value={form.date}
            onChange={update}
            onClick={(e) => e.currentTarget.showPicker?.()}
            aria-label="Choose another date"
          />
        </label>
        {errors.date && <small className="field-error">{errors.date}</small>}
      </div>

      <fieldset className="field">
        <legend>Preferred time</legend>
        <div className="bk-times">
          {timeWindows.map((t) => (
            <label className="bk-time" key={t.value}>
              <input type="radio" name="time" value={t.value} checked={form.time === t.value} onChange={update} />
              <span><strong>{t.value}</strong><small>{t.hint}</small></span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Address / area" error={errors.location}>
        <span className="input-icon">
          <Icon name="pin" />
          <input
            name="location"
            type="text"
            autoComplete="street-address"
            maxLength={200}
            placeholder="e.g. 12 Admiralty Way, Lekki, Lagos"
            value={form.location}
            onChange={update}
            aria-invalid={!!errors.location}
          />
        </span>
      </Field>
    </>
  );
}

function DetailsStep({ form, update, errors, goTo }) {
  const service = serviceOptions.find((o) => o.value === form.service);
  return (
    <>
      <div className="bk-summary">
        <span><Icon name={service?.icon ?? 'sparkle'} />{service?.label}</span>
        <span><Icon name="calendar" />{formatDate(form.date)} · {form.time}</span>
        <button type="button" className="bk-link" onClick={() => goTo(0)}>Edit</button>
      </div>

      <div className="field-row">
        <Field label="Full name" error={errors.name}>
          <input name="name" type="text" autoComplete="name" maxLength={120} value={form.name} onChange={update} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="0801 234 5678" value={form.phone} onChange={update} aria-invalid={!!errors.phone} />
        </Field>
      </div>
      <Field label="Email" optional error={errors.email}>
        <input name="email" type="email" autoComplete="email" maxLength={254} placeholder="For your booking confirmation" value={form.email} onChange={update} aria-invalid={!!errors.email} />
      </Field>
      <Field label={form.service === OTHER_SERVICE ? 'What do you need?' : 'Anything we should know?'} optional={form.service !== OTHER_SERVICE}>
        <textarea name="notes" rows="3" maxLength={2000} placeholder="Size of the space, number of rooms, special requests…" value={form.notes} onChange={update} />
      </Field>

      <div className="hp" aria-hidden="true">
        <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update} /></label>
      </div>
    </>
  );
}

function SuccessView({ result, form, onDone }) {
  const [copied, setCopied] = useState(false);
  const firstName = form.name.trim().split(/\s+/)[0];
  const service = serviceOptions.find((o) => o.value === form.service);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the reference is still on screen */
    }
  };

  return (
    <div className="bk-success" role="status" aria-live="polite">
      <svg className="bk-success-mark" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="24" />
        <path d="M15 27.5l7 7 15-15" />
      </svg>
      {result.via === 'email' ? (
        <>
          <h3>Almost done</h3>
          <p>Your email app should open with your booking ready to send. Hit send and we’ll call you to confirm.</p>
        </>
      ) : (
        <>
          <h3>Booking received!</h3>
          <p>Thanks{firstName ? `, ${firstName}` : ''}. We’ll call you on <strong>{form.phone}</strong> to confirm the details.</p>
        </>
      )}

      {result.reference && (
        <div className="bk-ref">
          <span>Your reference</span>
          <strong>{result.reference}</strong>
          <button type="button" className="bk-link" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      )}

      <dl className="bk-recap">
        <div><dt>Service</dt><dd>{service?.label}</dd></div>
        <div><dt>Date</dt><dd>{formatDate(form.date)} · {form.time}</dd></div>
        <div><dt>Location</dt><dd>{form.location}</dd></div>
      </dl>

      <button type="button" className="btn btn-primary btn-block" onClick={onDone}>Done</button>
      <p className="form-note">Need it urgently? Call <a href={company.phoneHref}>{company.phone}</a>.</p>
    </div>
  );
}

export default function BookingModal({ open, presetService, onClose }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);
  const formRef = useRef(null);
  const pointerDownOnBackdrop = useRef(false);
  const closeTimer = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);
  const [closing, setClosing] = useState(false);

  // Open: show as a true modal (focus trap, inert page, Esc support).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog || dialog.open) return;
    if (presetService) setForm((f) => ({ ...f, service: presetService }));
    setClosing(false);
    dialog.showModal();
    titleRef.current?.focus();
  }, [open, presetService]);

  const finishClose = () => {
    clearTimeout(closeTimer.current);
    dialogRef.current?.close();
    setClosing(false);
    // A finished booking starts fresh next time; an unfinished one is kept.
    if (status === 'done') {
      setForm(initialForm);
      setStep(0);
      setResult(null);
      setStatus('idle');
    }
    onClose();
  };

  const requestClose = () => {
    if (closing) return;
    if (prefersReducedMotion()) {
      finishClose();
      return;
    }
    setClosing(true);
    closeTimer.current = setTimeout(finishClose, CLOSE_FALLBACK_MS);
  };

  // Esc fires "cancel": run the exit animation instead of closing abruptly.
  useEffect(() => {
    const dialog = dialogRef.current;
    const onCancel = (e) => {
      e.preventDefault();
      requestClose();
    };
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  });

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
    if (status === 'error') setStatus('idle');
  };
  const setField = (name, value) => update({ target: { name, value } });

  const goTo = (next) => {
    setDirection(next > step ? 'forward' : 'back');
    setErrors({});
    setStep(next);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      const first = steps[step].fields.find((f) => stepErrors[f]);
      const el = formRef.current?.elements[first];
      (el?.length && !el.tagName ? el[0] : el)?.focus?.();
      return;
    }
    if (step < steps.length - 1) {
      goTo(step + 1);
      return;
    }

    setStatus('submitting');
    setSubmitError('');
    try {
      setResult(await submitBooking(form));
      setStatus('done');
      requestAnimationFrame(() => titleRef.current?.focus());
    } catch (err) {
      setSubmitError(err instanceof BookingError ? err.message : `Something went wrong. Please call ${company.phone}.`);
      setStatus('error');
    }
  };

  const isDone = status === 'done';
  const progress = isDone ? 1 : (step + 1) / steps.length;

  return (
    <dialog
      ref={dialogRef}
      className="bk-dialog"
      data-closing={closing || undefined}
      aria-labelledby="bk-title"
      onPointerDown={(e) => { pointerDownOnBackdrop.current = e.target === dialogRef.current; }}
      onClick={(e) => {
        if (e.target === dialogRef.current && pointerDownOnBackdrop.current) requestClose();
      }}
      onAnimationEnd={(e) => {
        if (closing && e.animationName === 'bk-panel-out') finishClose();
      }}
    >
      <div className="bk-shell">
        <aside className="bk-aside" aria-hidden="true">
          <img src="/images/housekeeping.jpg" alt="" />
          <div className="bk-aside-inner">
            <span className="bk-aside-brand">
              <img src="/images/logo.png" alt="" width="36" height="41" />
              Kleener Touch
            </span>
            <h2>Book a service</h2>
            <p>Tell us what you need. We’ll call you to confirm the details.</p>
            <ol className="bk-aside-steps">
              {steps.map((s, i) => (
                <li key={s.short} data-state={isDone || i < step ? 'done' : i === step ? 'active' : 'todo'}>
                  <span>{isDone || i < step ? <Icon name="check" /> : i + 1}</span>
                  {s.short}
                </li>
              ))}
            </ol>
            <a className="bk-aside-call" href={company.phoneHref} tabIndex={-1}>
              <Icon name="phone" /> Prefer to talk? {company.phone}
            </a>
          </div>
          <Bubbles items={asideBubbles} />
        </aside>

        <div className="bk-main">
          <header className="bk-head">
            <div>
              <span className="bk-step-label">{isDone ? 'All set' : `Step ${step + 1} of ${steps.length}`}</span>
              <h3 id="bk-title" ref={titleRef} tabIndex={-1}>{isDone ? 'Booking confirmed' : steps[step].title}</h3>
            </div>
            <button type="button" className="bk-close" onClick={requestClose} aria-label="Close booking form">
              <Icon name="close" />
            </button>
          </header>
          <div className="bk-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>

          {isDone ? (
            <div className="bk-body"><SuccessView result={result} form={form} onDone={requestClose} /></div>
          ) : (
            <form ref={formRef} className="bk-form" onSubmit={onSubmit} noValidate>
              <div className="bk-body">
                <div key={step} className={`bk-step bk-step-${direction}`}>
                  {step === 0 && <ServiceStep form={form} update={update} errors={errors} />}
                  {step === 1 && <ScheduleStep form={form} update={update} setField={setField} errors={errors} />}
                  {step === 2 && <DetailsStep form={form} update={update} errors={errors} goTo={goTo} />}
                </div>
              </div>

              <footer className="bk-foot">
                {status === 'error' && <p className="bk-error" role="alert">{submitError}</p>}
                <div className="bk-foot-row">
                  {step > 0 ? (
                    <button type="button" className="btn btn-ghost" onClick={() => goTo(step - 1)}>Back</button>
                  ) : (
                    <a className="bk-call" href={company.phoneHref}><Icon name="phone" /> {company.phone}</a>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
                    {status === 'submitting' && <><span className="spinner" aria-hidden="true" /> Sending…</>}
                    {status !== 'submitting' && step < steps.length - 1 && <>Continue <Icon name="arrow" /></>}
                    {status !== 'submitting' && step === steps.length - 1 && <><Icon name="calendar" /> Confirm booking</>}
                  </button>
                </div>
              </footer>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
