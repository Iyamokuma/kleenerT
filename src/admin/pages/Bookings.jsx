import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Icon from '../../components/Icon';
import { services } from '../../data/content';
import { PAGE_SIZE, downloadCsv, fetchAllBookings, fetchBookings, fetchStats } from '../lib/api';
import { STATUSES, formatDay, formatNaira, formatNumber, timeAgo, todayISO } from '../lib/format';
import { useAdmin } from '../components/Layout';
import { useToast } from '../components/Toasts';
import { Avatar, EmptyState, ErrorNote, PageHeader, Skeleton, StatusBadge } from '../components/ui';

const TABS = [{ value: 'all', label: 'All' }, ...STATUSES];

export default function Bookings() {
  const { openBooking } = useAdmin();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'all';
  const q = params.get('q') || '';
  const service = params.get('service') || '';
  const sort = params.get('sort') || 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [searchInput, setSearchInput] = useState(q);
  const [exporting, setExporting] = useState(false);

  const setParam = (key, value, { resetPage = true } = {}) => setParams((p) => {
    if (value && value !== 'all') p.set(key, value); else p.delete(key);
    if (resetPage) p.delete('page');
    return p;
  });

  // Keep the box in sync when search comes from the top bar, and debounce typing.
  useEffect(() => setSearchInput(q), [q]);
  useEffect(() => {
    if (searchInput === q) return undefined;
    const t = setTimeout(() => setParam('q', searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const filters = { status, q, service, sort, page };
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['bookings', filters],
    queryFn: () => fetchBookings(filters),
    placeholderData: keepPreviousData,
  });
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: fetchStats });

  const total = data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, total);
  const countFor = (value) => (value === 'all' ? stats?.total : stats?.status_counts?.[value]) ?? 0;

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows = await fetchAllBookings({ status, q, service });
      downloadCsv(rows, `kleener-touch-bookings-${todayISO()}.csv`);
      toast(`Exported ${formatNumber(rows.length)} bookings`);
    } catch (err) {
      toast({ tone: 'error', title: 'Export failed', body: err.message });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader title="Bookings" subtitle="Every request from the website, phone and WhatsApp in one place.">
        <button type="button" className="btn btn-ghost" onClick={exportCsv} disabled={exporting || !total}>
          {exporting ? <span className="spinner spinner-dark" aria-hidden="true" /> : <Icon name="download" />} Export CSV
        </button>
      </PageHeader>

      <div className="seg" role="tablist" aria-label="Filter by status">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={status === t.value}
            className={`seg-btn ${t.value !== 'all' ? `seg-${t.value}` : ''}`.trim()}
            onClick={() => setParam('status', t.value)}
          >
            {t.label}
            <span className="seg-count">{formatNumber(countFor(t.value))}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <label className="toolbar-search">
          <Icon name="search" />
          <input type="search" placeholder="Search name, phone, reference, address…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Search bookings" />
        </label>
        <select value={service} onChange={(e) => setParam('service', e.target.value)} aria-label="Filter by service">
          <option value="">All services</option>
          {services.map((s) => <option key={s.id} value={s.title}>{s.title}</option>)}
          <option value="Something else">Something else</option>
        </select>
        <select value={sort} onChange={(e) => setParam('sort', e.target.value)} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="service_date">Service date</option>
        </select>
      </div>

      <ErrorNote error={error} />

      <div className={`table-card ${isFetching && !isLoading ? 'is-refreshing' : ''}`.trim()}>
        {isLoading ? <div className="pad"><Skeleton rows={8} /></div> : !data?.rows.length ? (
          <EmptyState icon="search" title={q || service || status !== 'all' ? 'No bookings match these filters' : 'No bookings yet'}>
            {q || service || status !== 'all' ? 'Try a different search or clear the filters.' : 'New requests from the website will appear here instantly.'}
          </EmptyState>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Service date</th>
                <th>Assigned</th>
                <th className="num">Quote</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((b) => (
                <tr key={b.id} onClick={() => openBooking(b.id)} data-new={b.status === 'new' || undefined}>
                  <td data-label="Customer">
                    <div className="cell-person">
                      <Avatar name={b.full_name} />
                      <div>
                        <button type="button" className="row-link" onClick={(e) => { e.stopPropagation(); openBooking(b.id); }}>{b.full_name}</button>
                        <small>{b.reference} · {timeAgo(b.created_at)}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Service"><span className="cell-strong">{b.service}</span><small>{b.location}</small></td>
                  <td data-label="Service date">
                    <span className={`cell-strong ${b.service_date < todayISO() && ['new', 'contacted', 'confirmed'].includes(b.status) ? 'overdue' : ''}`.trim()}>{formatDay(b.service_date)}</span>
                    <small>{b.scheduled_time || b.preferred_time || 'Any time'}{b.scheduled_date ? ' · confirmed' : ' · requested'}</small>
                  </td>
                  <td data-label="Assigned">{b.assigned_to || <span className="muted">Unassigned</span>}</td>
                  <td data-label="Quote" className="num">{b.quoted_amount != null ? formatNaira(b.quoted_amount) : <span className="muted">—</span>}</td>
                  <td data-label="Status"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {total > 0 && (
          <footer className="table-foot">
            <span>Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}</span>
            <div className="pager">
              <button type="button" className="icon-btn" disabled={page <= 1} onClick={() => setParam('page', String(page - 1), { resetPage: false })} aria-label="Previous page"><Icon name="chevronLeft" /></button>
              <span>Page {page} of {pages}</span>
              <button type="button" className="icon-btn" disabled={page >= pages} onClick={() => setParam('page', String(page + 1), { resetPage: false })} aria-label="Next page"><Icon name="chevronRight" /></button>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
