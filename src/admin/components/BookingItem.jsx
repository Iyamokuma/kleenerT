import { formatDay, relativeDay, timeAgo } from '../lib/format';
import { useAdmin } from './Layout';
import { Avatar, StatusBadge } from './ui';

/** Compact, clickable booking row used in lists on the overview, schedule and customer pages. */
export default function BookingItem({ booking: b, show = 'received' }) {
  const { openBooking } = useAdmin();
  return (
    <li>
      <button type="button" className="bitem" onClick={() => openBooking(b.id)}>
        <Avatar name={b.full_name} />
        <span className="bitem-main">
          <strong>{b.full_name}</strong>
          <small>{b.service} · {b.location}</small>
        </span>
        <span className="bitem-side">
          <StatusBadge status={b.status} />
          <small>
            {show === 'received' && timeAgo(b.created_at)}
            {show === 'service' && `${relativeDay(b.service_date)} · ${b.scheduled_time || b.preferred_time || 'Any time'}`}
            {show === 'date' && formatDay(b.service_date)}
          </small>
        </span>
      </button>
    </li>
  );
}
