import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ChevronRight, Plus, Settings as SettingsIcon, Target, Wallet } from 'lucide-react';
import { fetchAnalytics, fetchBookings, fetchSchedule, fetchStats } from '../lib/api';
import { OPEN_STATUSES, addDaysISO, formatDay, formatNaira, formatNumber, todayISO } from '../lib/format';
import BookingItem from '../components/BookingItem';
import { useAdmin } from '../components/Layout';
import { Card, EmptyState, ErrorNote, Skeleton } from '../components/ui';
import ActionCard from '../components/analytics/ActionCard';
import Funnel from '../components/analytics/Funnel';
import Greeting from '../components/analytics/Greeting';
import Heatmap from '../components/analytics/Heatmap';
import MeterCard from '../components/analytics/MeterCard';
import RangeTabs, { RANGES } from '../components/analytics/RangeTabs';
import ServicesPanel from '../components/analytics/ServicesPanel';
import StatStrip from '../components/analytics/StatStrip';
import StatisticsChart from '../components/analytics/StatisticsChart';
import { NAIRA_COMPACT, NAIRA_FORMAT, change, pct, rise, stagger } from '../components/analytics/shared';
import '../overview.css';

const RANGE_KEY = 'kt-admin-range';
const EMPTY = {
  received: 0, received_prev: 0, won: 0, won_prev: 0, open: 0, cancelled: 0, website: 0, jobs_done: 0,
  revenue: 0, revenue_prev: 0, responded: 0, avg_response_minutes: null,
  funnel: null, services: [], heatmap: [], monthly: null, years: [],
};

function readRange() {
  try {
    const saved = Number(localStorage.getItem(RANGE_KEY));
    return RANGES.some((r) => r.days === saved) ? saved : 30;
  } catch {
    return 30;
  }
}

export default function Overview() {
  const { openNewBooking } = useAdmin();
  const today = todayISO();
  const [days, setDays] = useState(readRange);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const range = RANGES.find((r) => r.days === days);

  const pickRange = (value) => {
    setDays(value);
    try { localStorage.setItem(RANGE_KEY, String(value)); } catch { /* private mode: not remembered */ }
  };

  const analytics = useQuery({
    queryKey: ['analytics', days, year],
    queryFn: () => fetchAnalytics({ days, year }),
    placeholderData: keepPreviousData, // keep numbers on screen and animate to the new ones
  });
  const stats = useQuery({ queryKey: ['stats'], queryFn: fetchStats });
  const attention = useQuery({ queryKey: ['bookings', { status: 'new', sort: 'oldest' }], queryFn: () => fetchBookings({ status: 'new', sort: 'oldest' }) });
  const upcoming = useQuery({ queryKey: ['schedule', today, 7], queryFn: () => fetchSchedule(today, addDaysISO(today, 6)) });

  const a = analytics.data ?? EMPTY;
  const waiting = stats.data?.status_counts?.new ?? 0;
  const upcomingOpen = (upcoming.data ?? []).filter((b) => OPEN_STATUSES.includes(b.status));
  const winRate = pct(a.won, a.received);
  const revenueDelta = change(Number(a.revenue), Number(a.revenue_prev));
  const revenue = Number(a.revenue);
  const revenuePrev = Number(a.revenue_prev);

  return (
    <div className="ov">
      <header className="ov-head">
        <Greeting>
          <span className="live-dot" aria-hidden="true" />
          <span>{formatDay(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="ov-head-sep" aria-hidden="true">·</span>
          <span>{waiting ? `${formatNumber(waiting)} new ${waiting === 1 ? 'request' : 'requests'} waiting` : 'Live: updates as bookings arrive'}</span>
        </Greeting>
        <div className="ov-actions">
          <Link to="/settings" className="pill pill-outline"><SettingsIcon strokeWidth={1.8} aria-hidden="true" /> Settings</Link>
          <button type="button" className="pill pill-soft" onClick={openNewBooking}><Plus strokeWidth={1.8} aria-hidden="true" /> New booking</button>
        </div>
      </header>

      <RangeTabs value={days} onChange={pickRange} />

      <ErrorNote error={analytics.error} />

      <motion.div className={`ov-cards${analytics.isFetching ? ' is-fetching' : ''}`} variants={stagger} initial="hidden" animate="show">
        <MeterCard
          tone="lilac"
          icon={Target}
          title="Requests won"
          pill={`${winRate}% won`}
          value={a.won}
          of={`${formatNumber(a.received)} requests`}
          ratio={a.received ? a.won / a.received : 0}
          meterLabel={`${winRate}% of requests in the ${range.long} were confirmed or completed`}
          foot={`Confirmed or completed, ${range.long}`}
        />
        <MeterCard
          tone="mist"
          icon={Wallet}
          title="Revenue"
          pill={revenueDelta ? `${revenueDelta.label} vs prev.` : 'No jobs yet'}
          value={revenue}
          format={revenue >= 1e5 ? NAIRA_COMPACT : NAIRA_FORMAT}
          of={`${formatNaira(revenuePrev)} before`}
          ratio={revenuePrev ? revenue / revenuePrev : revenue ? 1 : 0}
          meterLabel={revenuePrev ? `${pct(revenue, revenuePrev)}% of the previous period’s revenue` : 'No revenue in the previous period to compare with'}
          foot={`${formatNumber(a.jobs_done)} completed ${a.jobs_done === 1 ? 'job' : 'jobs'} with a quote, ${range.long}`}
        />
        <ActionCard waiting={waiting} oldest={attention.data?.rows?.[0]} />
      </motion.div>

      <StatStrip a={a} periodLabel={range.long} />

      <motion.div className="ov-grid ov-grid-wide" variants={stagger} initial="hidden" animate="show">
        <StatisticsChart monthly={a.monthly} year={year} years={a.years} onYear={setYear} />
        <ServicesPanel services={a.services} periodLabel={range.long} />
      </motion.div>

      <motion.div className="ov-grid" variants={stagger} initial="hidden" animate="show">
        <Funnel funnel={a.funnel} periodLabel={range.long} />
        <Heatmap cells={a.heatmap} periodLabel={range.long} />
      </motion.div>

      <motion.div className="ov-grid" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={rise}>
          <Card title="Needs a first call" action={<Link to="/bookings?status=new&sort=oldest" className="card-link">View all <ChevronRight aria-hidden="true" /></Link>}>
            {attention.isLoading ? <Skeleton rows={4} /> : attention.data?.rows.length ? (
              <ul className="blist">{attention.data.rows.slice(0, 6).map((b) => <BookingItem key={b.id} booking={b} />)}</ul>
            ) : <EmptyState icon="check" title="All caught up">No new requests waiting for a call.</EmptyState>}
          </Card>
        </motion.div>
        <motion.div variants={rise}>
          <Card title="Coming up this week" action={<Link to="/schedule" className="card-link">Schedule <ChevronRight aria-hidden="true" /></Link>}>
            {upcoming.isLoading ? <Skeleton rows={4} /> : upcomingOpen.length ? (
              <ul className="blist">{upcomingOpen.slice(0, 6).map((b) => <BookingItem key={b.id} booking={b} show="service" />)}</ul>
            ) : <EmptyState icon="calendar" title="Nothing scheduled">No jobs in the next 7 days.</EmptyState>}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
