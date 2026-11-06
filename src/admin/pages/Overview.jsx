import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Icon from '../../components/Icon';
import { serviceOptions } from '../../components/booking/bookingLogic';
import { useAuth } from '../auth/AuthProvider';
import { fetchBookings, fetchSchedule, fetchStats } from '../lib/api';
import { OPEN_STATUSES, STATUSES, addDaysISO, formatDay, formatNaira, formatNumber, todayISO } from '../lib/format';
import BookingItem from '../components/BookingItem';
import { BarList, ColumnChart } from '../components/Charts';
import { Card, EmptyState, ErrorNote, PageHeader, Skeleton } from '../components/ui';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function Kpi({ icon, label, value, hint, to, tone }) {
  const body = (
    <>
      <span className={`kpi-icon ${tone ? `kpi-${tone}` : ''}`.trim()}><Icon name={icon} /></span>
      <span className="kpi-label">{label}</span>
      <strong className="kpi-value">{value}</strong>
      {hint && <span className="kpi-hint">{hint}</span>}
    </>
  );
  return to ? <Link to={to} className="kpi kpi-link">{body}</Link> : <div className="kpi">{body}</div>;
}

function monthDelta(current, previous) {
  if (!previous) return current ? 'First bookings this month' : 'No bookings yet';
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}% vs last month`;
}

const shortService = (title) => serviceOptions.find((o) => o.value === title)?.label ?? title;

export default function Overview() {
  const { name } = useAuth();
  const today = todayISO();

  const stats = useQuery({ queryKey: ['stats'], queryFn: fetchStats });
  const attention = useQuery({ queryKey: ['bookings', { status: 'new', sort: 'oldest' }], queryFn: () => fetchBookings({ status: 'new', sort: 'oldest' }) });
  const upcoming = useQuery({ queryKey: ['schedule', today, 7], queryFn: () => fetchSchedule(today, addDaysISO(today, 6)) });

  const s = stats.data;
  const daily = (s?.daily ?? []).map((d) => ({ key: d.day, value: d.count, tip: formatDay(d.day) }));
  const byService = (s?.by_service ?? []).map((d) => ({ label: shortService(d.service), value: d.count }));
  const upcomingOpen = (upcoming.data ?? []).filter((b) => OPEN_STATUSES.includes(b.status));
  const firstName = name.split(/\s+/)[0];

  return (
    <>
      <PageHeader title={`${greeting()}${firstName ? `, ${firstName}` : ''}`} subtitle={formatDay(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      <ErrorNote error={stats.error} />

      <div className="kpis">
        <Kpi icon="inbox" tone="sky" label="New requests" value={s ? formatNumber(s.status_counts?.new ?? 0) : '–'} hint={s ? `${s.new_today} received today` : ' '} to="/bookings?status=new" />
        <Kpi icon="calendar" tone="navy" label="Jobs in the next 7 days" value={s ? formatNumber(s.upcoming_7d) : '–'} hint="New, contacted or confirmed" to="/schedule" />
        <Kpi icon="list" tone="violet" label="Bookings this month" value={s ? formatNumber(s.this_month) : '–'} hint={s ? monthDelta(s.this_month, s.last_month) : ' '} />
        <Kpi icon="naira" tone="green" label="Completed revenue (month)" value={s ? formatNaira(s.revenue_month) : '–'} hint={s ? `${s.completed_month} jobs completed` : ' '} />
      </div>

      <div className="pipeline-strip">
        {STATUSES.map((st) => (
          <Link key={st.value} to={`/bookings?status=${st.value}`} className={`pipe-chip pipe-${st.value}`}>
            <span className="badge-dot" />
            {st.label}
            <strong>{formatNumber(s?.status_counts?.[st.value] ?? 0)}</strong>
          </Link>
        ))}
      </div>

      <div className="grid-2-1">
        <Card title="Bookings received · last 30 days" action={s && <span className="muted">{formatNumber(daily.reduce((a, d) => a + d.value, 0))} total</span>}>
          {s ? <ColumnChart data={daily} label="Bookings received per day, last 30 days" formatLabel={(d) => formatDay(d.key, { day: 'numeric', month: 'short' })} /> : <Skeleton rows={6} />}
        </Card>
        <Card title="By service">
          {s ? <BarList data={byService} emptyLabel="Bookings will appear here by service." /> : <Skeleton rows={5} />}
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Needs a first call" action={<Link to="/bookings?status=new" className="card-link">View all <Icon name="chevronRight" /></Link>}>
          {attention.isLoading ? <Skeleton rows={4} /> : attention.data?.rows.length ? (
            <ul className="blist">{attention.data.rows.slice(0, 6).map((b) => <BookingItem key={b.id} booking={b} />)}</ul>
          ) : <EmptyState icon="check" title="All caught up">No new requests waiting for a call.</EmptyState>}
        </Card>
        <Card title="Coming up this week" action={<Link to="/schedule" className="card-link">Schedule <Icon name="chevronRight" /></Link>}>
          {upcoming.isLoading ? <Skeleton rows={4} /> : upcomingOpen.length ? (
            <ul className="blist">{upcomingOpen.slice(0, 6).map((b) => <BookingItem key={b.id} booking={b} show="service" />)}</ul>
          ) : <EmptyState icon="calendar" title="Nothing scheduled">No jobs in the next 7 days.</EmptyState>}
        </Card>
      </div>
    </>
  );
}
