import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Icon from '../../components/Icon';
import { fetchOverdue, fetchSchedule } from '../lib/api';
import { addDaysISO, formatDay, relativeDay, todayISO } from '../lib/format';
import BookingItem from '../components/BookingItem';
import { useAdmin } from '../components/Layout';
import { Card, EmptyState, ErrorNote, PageHeader, Skeleton, StatusBadge } from '../components/ui';

const DAYS = 14;
const TIME_ORDER = { Morning: 0, Afternoon: 1, Flexible: 2 };

export default function Schedule() {
  const { openBooking } = useAdmin();
  const today = todayISO();
  const [offset, setOffset] = useState(0);
  const start = addDaysISO(today, offset * DAYS);
  const end = addDaysISO(start, DAYS - 1);

  const schedule = useQuery({ queryKey: ['schedule', start, DAYS], queryFn: () => fetchSchedule(start, end) });
  const overdue = useQuery({ queryKey: ['schedule', 'overdue', today], queryFn: () => fetchOverdue(today) });

  const days = useMemo(() => {
    const byDay = new Map();
    for (const b of schedule.data ?? []) {
      if (!byDay.has(b.service_date)) byDay.set(b.service_date, []);
      byDay.get(b.service_date).push(b);
    }
    return [...byDay.entries()].map(([day, list]) => [
      day,
      list.sort((a, b) => (TIME_ORDER[a.scheduled_time || a.preferred_time] ?? 3) - (TIME_ORDER[b.scheduled_time || b.preferred_time] ?? 3)),
    ]);
  }, [schedule.data]);

  return (
    <>
      <PageHeader title="Schedule" subtitle="Jobs by service date. Confirmed dates take priority over what the customer asked for.">
        <div className="pager pager-lg">
          <button type="button" className="icon-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Previous two weeks"><Icon name="chevronLeft" /></button>
          <span>{formatDay(start, { day: 'numeric', month: 'short' })} – {formatDay(end, { day: 'numeric', month: 'short' })}</span>
          <button type="button" className="icon-btn" onClick={() => setOffset((o) => o + 1)} aria-label="Next two weeks"><Icon name="chevronRight" /></button>
          {offset !== 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOffset(0)}>Today</button>}
        </div>
      </PageHeader>

      {offset === 0 && overdue.data?.length > 0 && (
        <Card title={`Past their date · ${overdue.data.length}`} className="card-warn">
          <p className="muted card-sub">These open bookings have a service date before today. Reschedule, complete or cancel them.</p>
          <ul className="blist">{overdue.data.map((b) => <BookingItem key={b.id} booking={b} show="date" />)}</ul>
        </Card>
      )}

      <ErrorNote error={schedule.error} />
      {schedule.isLoading ? <Card><Skeleton rows={8} /></Card> : !days.length ? (
        <Card><EmptyState icon="calendar" title="Nothing scheduled in these two weeks">Confirmed and requested jobs will show up here by date.</EmptyState></Card>
      ) : (
        <div className="agenda">
          {days.map(([day, list]) => (
            <section key={day} className={`agenda-day ${day === today ? 'is-today' : ''}`.trim()}>
              <header>
                <span className="agenda-date"><strong>{formatDay(day, { day: 'numeric' })}</strong><small>{formatDay(day, { month: 'short' })}</small></span>
                <div>
                  <h2>{relativeDay(day)}</h2>
                  <small>{list.length} job{list.length > 1 ? 's' : ''}</small>
                </div>
              </header>
              <ul>
                {list.map((b) => (
                  <li key={b.id}>
                    <button type="button" className="agenda-job" onClick={() => openBooking(b.id)} data-status={b.status}>
                      <span className="agenda-time">{b.scheduled_time || b.preferred_time || 'Any time'}</span>
                      <span className="agenda-main">
                        <strong>{b.full_name} · {b.service}</strong>
                        <small><Icon name="pin" /> {b.location}</small>
                      </span>
                      <span className="agenda-side">
                        <StatusBadge status={b.status} />
                        <small>{b.assigned_to ? <><Icon name="user" /> {b.assigned_to}</> : 'Unassigned'}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
