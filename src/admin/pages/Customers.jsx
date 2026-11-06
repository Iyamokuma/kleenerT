import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Icon from '../../components/Icon';
import { fetchCustomerBookings, fetchCustomers } from '../lib/api';
import { formatDay, formatNaira, formatNumber, timeAgo, whatsappNumber } from '../lib/format';
import BookingItem from '../components/BookingItem';
import { Avatar, Dialog, EmptyState, ErrorNote, PageHeader, Skeleton } from '../components/ui';

function useDebounced(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function CustomerDialog({ customer, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-bookings', customer?.phone_key],
    queryFn: () => fetchCustomerBookings(customer.phone_key),
    enabled: Boolean(customer),
  });
  return (
    <Dialog open={Boolean(customer)} onClose={onClose} title={customer?.full_name ?? 'Customer'} wide>
      {customer && (
        <div className="customer-detail">
          <div className="customer-head">
            <Avatar name={customer.full_name} size={56} />
            <div>
              <h3>{customer.full_name}</h3>
              <p>{customer.phone}{customer.email && ` · ${customer.email}`}</p>
              <p className="muted">Customer since {formatDay(customer.first_booking_at.slice(0, 10), { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="quick-actions">
            <a className="btn btn-ghost btn-sm" href={`tel:${customer.phone.replace(/\s/g, '')}`}><Icon name="phone" /> Call</a>
            <a className="btn btn-ghost btn-sm" href={`https://wa.me/${whatsappNumber(customer.phone)}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" /> WhatsApp</a>
            {customer.email && <a className="btn btn-ghost btn-sm" href={`mailto:${customer.email}`}><Icon name="mail" /> Email</a>}
          </div>
          <dl className="mini-stats">
            <div><dt>Bookings</dt><dd>{formatNumber(customer.bookings_count)}</dd></div>
            <div><dt>Completed</dt><dd>{formatNumber(customer.completed_count)}</dd></div>
            <div><dt>Lifetime value</dt><dd>{formatNaira(customer.total_value)}</dd></div>
          </dl>
          <h4>Booking history</h4>
          {isLoading ? <Skeleton rows={3} /> : <ul className="blist">{data?.map((b) => <BookingItem key={b.id} booking={b} show="date" />)}</ul>}
        </div>
      )}
    </Dialog>
  );
}

export default function Customers() {
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim());
  const [selected, setSelected] = useState(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', q],
    queryFn: () => fetchCustomers({ q }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Customers" subtitle="Everyone who has booked, grouped by phone number." />

      <div className="toolbar">
        <label className="toolbar-search">
          <Icon name="search" />
          <input type="search" placeholder="Search name, phone, email or area…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search customers" />
        </label>
        {data && <span className="muted">{formatNumber(data.length)} customer{data.length === 1 ? '' : 's'}</span>}
      </div>

      <ErrorNote error={error} />
      <div className="table-card">
        {isLoading ? <div className="pad"><Skeleton rows={8} /></div> : !data?.length ? (
          <EmptyState icon="users" title={q ? 'No customers match' : 'No customers yet'}>{q ? 'Try another search.' : 'Customers appear here after their first booking.'}</EmptyState>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Last location</th>
                <th className="num">Bookings</th>
                <th className="num">Completed</th>
                <th className="num">Lifetime value</th>
                <th>Last booking</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.phone_key} onClick={() => setSelected(c)}>
                  <td data-label="Customer">
                    <div className="cell-person">
                      <Avatar name={c.full_name} />
                      <div>
                        <button type="button" className="row-link" onClick={(e) => { e.stopPropagation(); setSelected(c); }}>{c.full_name}</button>
                        <small>{c.phone}{c.email && ` · ${c.email}`}</small>
                      </div>
                    </div>
                  </td>
                  <td data-label="Last location">{c.last_location}</td>
                  <td data-label="Bookings" className="num">{formatNumber(c.bookings_count)}</td>
                  <td data-label="Completed" className="num">{formatNumber(c.completed_count)}</td>
                  <td data-label="Lifetime value" className="num">{formatNaira(c.total_value)}</td>
                  <td data-label="Last booking">{timeAgo(c.last_booking_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <CustomerDialog customer={selected} onClose={() => setSelected(null)} />
    </>
  );
}
