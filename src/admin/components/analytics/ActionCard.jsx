import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Copy, Play } from 'lucide-react';
import { timeAgo } from '../../lib/format';
import { rise } from './shared';

const BOOKING_LINK = `${typeof window !== 'undefined' ? window.location.origin : ''}/#book`;

/** The dark call-to-action card: whatever most needs doing right now. */
export default function ActionCard({ waiting, oldest }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BOOKING_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Copy your booking link:', BOOKING_LINK);
    }
  };

  return (
    <motion.section className="action-card" variants={rise}>
      <div className="action-top">
        <h2>
          {waiting > 0
            ? <>{waiting} new {waiting === 1 ? 'request' : 'requests'}<br />waiting for a call</>
            : <>You’re all<br />caught up</>}
        </h2>
        <span className="action-logo" aria-hidden="true"><img src="/images/logo.png" alt="" width="40" height="46" /></span>
      </div>
      <p className="action-sub">
        {waiting > 0
          ? (oldest ? `Oldest arrived ${timeAgo(oldest.created_at)} · ${oldest.full_name}` : 'Call them while they’re keen.')
          : 'Share your booking link to bring in the next job.'}
      </p>
      {waiting > 0 ? (
        <Link to="/bookings?status=new&sort=oldest" className="action-btn">
          Start calling <Play aria-hidden="true" strokeWidth={1.8} />
        </Link>
      ) : (
        <button type="button" className="action-btn" onClick={copy}>
          {copied ? <>Link copied <Check aria-hidden="true" strokeWidth={2} /></> : <>Copy booking link <Copy aria-hidden="true" strokeWidth={1.8} /></>}
        </button>
      )}
      <span className="sr-only" aria-live="polite">{copied ? 'Booking link copied' : ''}</span>
    </motion.section>
  );
}
