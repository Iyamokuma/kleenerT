import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingOptions, services } from '../../data/content';
import { createBooking } from '../lib/api';
import { BOOKING_SOURCES, todayISO } from '../lib/format';
import { Dialog } from './ui';
import { useToast } from './Toasts';

const blank = () => ({
  source: BOOKING_SOURCES[0], status: 'new', full_name: '', phone: '', email: '', service: services[0].title,
  property_type: '', location: '', preferred_date: todayISO(), preferred_time: bookingOptions.timeWindows[0].value,
  frequency: bookingOptions.frequencies[0], notes: '',
});

export default function NewBookingDialog({ open, onClose, onCreated }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState(blank);
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => createBooking({
      ...form,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase() || null,
      property_type: form.property_type || null,
      location: form.location.trim(),
      notes: form.notes.trim() || null,
    }),
    onSuccess: (row) => {
      queryClient.invalidateQueries();
      toast({ title: 'Booking added', body: `${row.reference} · ${row.full_name}` });
      setForm(blank());
      onClose();
      onCreated?.(row.id);
    },
  });

  return (
    <Dialog open={open} onClose={onClose} title="New booking" wide>
      <form className="adm-form" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
        <div className="field-row">
          <label className="field">
            <span>Came in via</span>
            <select name="source" value={form.source} onChange={set}>{BOOKING_SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={set}>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
            </select>
          </label>
        </div>
        <div className="field-row">
          <label className="field"><span>Customer name</span><input name="full_name" required minLength={2} maxLength={120} value={form.full_name} onChange={set} /></label>
          <label className="field"><span>Phone</span><input name="phone" type="tel" required minLength={7} maxLength={20} value={form.phone} onChange={set} /></label>
        </div>
        <label className="field"><span>Email <em>(optional)</em></span><input name="email" type="email" maxLength={254} value={form.email} onChange={set} /></label>
        <div className="field-row">
          <label className="field">
            <span>Service</span>
            <select name="service" value={form.service} onChange={set}>
              {services.map((s) => <option key={s.id}>{s.title}</option>)}
              <option>Something else</option>
            </select>
          </label>
          <label className="field">
            <span>Property type <em>(optional)</em></span>
            <select name="property_type" value={form.property_type} onChange={set}>
              <option value="">Not specified</option>
              {bookingOptions.propertyTypes.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>
        <label className="field"><span>Address / area</span><input name="location" required minLength={3} maxLength={200} value={form.location} onChange={set} /></label>
        <div className="field-row field-row-3">
          <label className="field"><span>Preferred date</span><input name="preferred_date" type="date" required value={form.preferred_date} onChange={set} /></label>
          <label className="field">
            <span>Time</span>
            <select name="preferred_time" value={form.preferred_time} onChange={set}>{bookingOptions.timeWindows.map((t) => <option key={t.value}>{t.value}</option>)}</select>
          </label>
          <label className="field">
            <span>Frequency</span>
            <select name="frequency" value={form.frequency} onChange={set}>{bookingOptions.frequencies.map((f) => <option key={f}>{f}</option>)}</select>
          </label>
        </div>
        <label className="field"><span>Notes <em>(optional)</em></span><textarea name="notes" rows="3" maxLength={2000} value={form.notes} onChange={set} /></label>
        {mutation.error && <p className="error-note" role="alert">{mutation.error.message}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending && <span className="spinner" aria-hidden="true" />} Add booking
          </button>
        </div>
      </form>
    </Dialog>
  );
}
