import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Icon from '../../components/Icon';
import { bookingOptions } from '../../data/content';
import { addNote, deleteBooking, fetchBooking, fetchEvents, updateBooking } from '../lib/api';
import {
  NEXT_ACTIONS, STATUSES, formatDateTime, formatDay, formatNaira, statusLabel, timeAgo, whatsappNumber,
} from '../lib/format';
import { Avatar, ConfirmDialog, ErrorNote, Skeleton, StatusBadge } from './ui';
import { useToast } from './Toasts';

const PIPELINE = ['new', 'contacted', 'confirmed', 'completed'];

function Pipeline({ status }) {
  const current = PIPELINE.indexOf(status);
  if (status === 'cancelled') {
    return <div className="pipeline pipeline-cancelled"><Icon name="close" /> This booking was cancelled</div>;
  }
  return (
    <ol className="pipeline">
      {PIPELINE.map((s, i) => (
        <li key={s} data-state={i < current ? 'done' : i === current ? 'active' : 'todo'}>
          <span>{i < current ? <Icon name="check" /> : i + 1}</span>
          {statusLabel(s)}
        </li>
      ))}
    </ol>
  );
}

function Detail({ label, children }) {
  return (
    <div className="detail">
      <dt>{label}</dt>
      <dd>{children || <span className="muted">—</span>}</dd>
    </div>
  );
}

const manageFields = (b) => ({
  scheduled_date: b.scheduled_date ?? '',
  scheduled_time: b.scheduled_time ?? '',
  assigned_to: b.assigned_to ?? '',
  quoted_amount: b.quoted_amount ?? '',
});

function ManageForm({ booking, onSave, saving }) {
  const [form, setForm] = useState(() => manageFields(booking));
  useEffect(() => setForm(manageFields(booking)), [booking]);

  const initial = manageFields(booking);
  const dirty = Object.keys(form).some((k) => String(form[k]) !== String(initial[k]));
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSave({
      scheduled_date: form.scheduled_date || null,
      scheduled_time: form.scheduled_time || null,
      assigned_to: form.assigned_to.trim() || null,
      quoted_amount: form.quoted_amount === '' ? null : Number(form.quoted_amount),
    });
  };

  return (
    <form className="manage" onSubmit={submit}>
      <div className="field-row">
        <label className="field">
          <span>Service date</span>
          <input type="date" name="scheduled_date" value={form.scheduled_date} onChange={set} />
        </label>
        <label className="field">
          <span>Time</span>
          <select name="scheduled_time" value={form.scheduled_time} onChange={set}>
            <option value="">Not set</option>
            {bookingOptions.timeWindows.map((t) => <option key={t.value} value={t.value}>{t.value} · {t.hint}</option>)}
          </select>
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Assigned to</span>
          <input name="assigned_to" maxLength={120} placeholder="Team member or crew" value={form.assigned_to} onChange={set} />
        </label>
        <label className="field">
          <span>Quote (₦)</span>
          <input type="number" name="quoted_amount" min="0" step="500" inputMode="numeric" placeholder="0" value={form.quoted_amount} onChange={set} />
        </label>
      </div>
      <div className="manage-actions">
        {dirty && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(initial)}>Discard</button>}
        <button type="submit" className="btn btn-primary btn-sm" disabled={!dirty || saving}>
          {saving && <span className="spinner" aria-hidden="true" />} Save changes
        </button>
      </div>
    </form>
  );
}

function Activity({ bookingId }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [note, setNote] = useState('');
  const { data: events, isLoading } = useQuery({ queryKey: ['events', bookingId], queryFn: () => fetchEvents(bookingId) });

  const mutation = useMutation({
    mutationFn: () => addNote(bookingId, note.trim()),
    onSuccess: () => {
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['events', bookingId] });
    },
    onError: (err) => toast({ tone: 'error', title: 'Note not saved', body: err.message }),
  });

  return (
    <div className="activity">
      <form className="note-form" onSubmit={(e) => { e.preventDefault(); if (note.trim()) mutation.mutate(); }}>
        <textarea
          rows="2"
          maxLength={2000}
          placeholder="Add an internal note — e.g. “Customer prefers Saturday, gate code 2241”"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-label="Internal note"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!note.trim() || mutation.isPending}>Add note</button>
      </form>
      {isLoading ? <Skeleton rows={3} /> : (
        <ol className="timeline-list">
          {events?.map((ev) => (
            <li key={ev.id} data-kind={ev.kind}>
              <span className="tl-dot" />
              <div>
                <p>{ev.message}</p>
                <small>{ev.actor} · <time dateTime={ev.created_at} title={formatDateTime(ev.created_at)}>{timeAgo(ev.created_at)}</time></small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function BookingDrawer({ id, onClose }) {
  const ref = useRef(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBooking(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    const d = ref.current;
    if (id && !d.open) d.showModal();
    if (!id && d.open) d.close();
  }, [id]);

  useEffect(() => {
    const d = ref.current;
    const handle = () => onCloseRef.current();
    d.addEventListener('close', handle);
    return () => d.removeEventListener('close', handle);
  }, []);

  const update = useMutation({
    mutationFn: (patch) => updateBooking(id, patch),
    onSuccess: (row, patch) => {
      queryClient.setQueryData(['booking', id], row);
      queryClient.invalidateQueries();
      toast(patch.status ? `Marked as ${statusLabel(patch.status).toLowerCase()}` : 'Booking updated');
    },
    onError: (err) => toast({ tone: 'error', title: 'Update failed', body: err.message }),
  });

  const remove = useMutation({
    mutationFn: () => deleteBooking(id),
    onSuccess: () => {
      setConfirmDelete(false);
      queryClient.removeQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries();
      toast(`Booking ${booking?.reference} deleted`);
      onClose();
    },
    onError: (err) => toast({ tone: 'error', title: 'Delete failed', body: err.message }),
  });

  const b = booking;
  const firstName = b?.full_name.split(/\s+/)[0];
  const waText = b && encodeURIComponent(`Hello ${firstName}, this is Kleener Touch about your ${b.service} booking (${b.reference}).`);

  return (
    <dialog ref={ref} className="drawer" aria-label="Booking details" onClick={(e) => e.target === ref.current && onClose()}>
      {id && (
        <div className="drawer-inner">
          <header className="drawer-head">
            <div>
              <span className="drawer-ref">{b?.reference ?? 'Loading…'}</span>
              {b && <span className="drawer-meta">Received {timeAgo(b.created_at)} · via {b.source}</span>}
            </div>
            <div className="drawer-head-actions">
              {b && <StatusBadge status={b.status} />}
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
            </div>
          </header>

          <div className="drawer-body">
            {isLoading && <Skeleton rows={8} />}
            <ErrorNote error={error} />
            {b && (
              <>
                <section className="drawer-customer">
                  <Avatar name={b.full_name} size={48} />
                  <div>
                    <h2>{b.full_name}</h2>
                    <p>{b.phone}{b.email && <> · {b.email}</>}</p>
                  </div>
                </section>
                <div className="quick-actions">
                  <a className="btn btn-ghost btn-sm" href={`tel:${b.phone.replace(/\s/g, '')}`}><Icon name="phone" /> Call</a>
                  <a className="btn btn-ghost btn-sm" href={`https://wa.me/${whatsappNumber(b.phone)}?text=${waText}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" /> WhatsApp</a>
                  {b.email && <a className="btn btn-ghost btn-sm" href={`mailto:${b.email}?subject=${encodeURIComponent(`Your Kleener Touch booking ${b.reference}`)}`}><Icon name="mail" /> Email</a>}
                </div>

                <section className="drawer-section">
                  <h3>Progress</h3>
                  <Pipeline status={b.status} />
                  <div className="status-actions">
                    {NEXT_ACTIONS[b.status].map((a) => (
                      <button key={a.to} type="button" className="btn btn-primary btn-sm" disabled={update.isPending} onClick={() => update.mutate({ status: a.to })}>
                        {a.label}
                      </button>
                    ))}
                    <label className="status-select">
                      <span className="sr-only">Set status</span>
                      <select value={b.status} onChange={(e) => update.mutate({ status: e.target.value })} disabled={update.isPending}>
                        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </label>
                  </div>
                </section>

                <section className="drawer-section">
                  <h3>Job</h3>
                  <dl className="details">
                    <Detail label="Service">{b.service}</Detail>
                    <Detail label="Property">{b.property_type}</Detail>
                    <Detail label="Customer asked for">{formatDay(b.preferred_date)}{b.preferred_time && ` · ${b.preferred_time}`}</Detail>
                    <Detail label="Frequency">{b.frequency}</Detail>
                    <Detail label="Location">
                      {b.location}{' '}
                      <a className="inline-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.location)}`} target="_blank" rel="noopener noreferrer">
                        Map <Icon name="external" />
                      </a>
                    </Detail>
                    <Detail label="Quote">{b.quoted_amount != null ? formatNaira(b.quoted_amount) : null}</Detail>
                  </dl>
                  {b.notes && <blockquote className="customer-notes"><Icon name="chat" />{b.notes}</blockquote>}
                </section>

                <section className="drawer-section">
                  <h3>Schedule &amp; assignment</h3>
                  <ManageForm booking={b} saving={update.isPending} onSave={(patch) => update.mutate(patch)} />
                </section>

                <section className="drawer-section">
                  <h3>Activity</h3>
                  <Activity bookingId={b.id} />
                </section>

                <section className="drawer-section drawer-danger">
                  <div>
                    <strong>Delete booking</strong>
                    <p>Removes the booking and its history permanently.</p>
                  </div>
                  <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => setConfirmDelete(true)}><Icon name="trash" /> Delete</button>
                </section>
              </>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this booking?"
        body={b && `${b.reference} for ${b.full_name} will be removed permanently, including its activity history. This can’t be undone.`}
        busy={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setConfirmDelete(false)}
      />
    </dialog>
  );
}
