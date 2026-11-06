const LOCALE = 'en-NG';

export const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];
export const statusLabel = (value) => STATUSES.find((s) => s.value === value)?.label ?? value;

// What staff usually do next from each status.
export const NEXT_ACTIONS = {
  new: [{ to: 'contacted', label: 'Mark contacted' }, { to: 'confirmed', label: 'Confirm' }],
  contacted: [{ to: 'confirmed', label: 'Confirm booking' }],
  confirmed: [{ to: 'completed', label: 'Mark completed' }],
  completed: [],
  cancelled: [{ to: 'new', label: 'Reopen' }],
};

export const OPEN_STATUSES = ['new', 'contacted', 'confirmed'];

export const BOOKING_SOURCES = ['Phone call', 'WhatsApp', 'Walk-in', 'Email', 'Referral', 'Instagram'];

const naira = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
export const formatNaira = (n) => (n == null || n === '' ? '—' : naira.format(Number(n)));
export const formatNumber = (n) => new Intl.NumberFormat(LOCALE).format(n ?? 0);

// Dates stored as YYYY-MM-DD are calendar dates: parse them as local, not UTC.
export function parseDay(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function addDaysISO(iso, days) {
  const d = parseDay(iso);
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export const formatDay = (iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  (iso ? parseDay(iso).toLocaleDateString(LOCALE, opts) : '—');

export const formatDateTime = (ts) =>
  new Date(ts).toLocaleString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
export function timeAgo(ts) {
  const seconds = Math.round((new Date(ts).getTime() - Date.now()) / 1000);
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export function relativeDay(iso) {
  const diff = Math.round((parseDay(iso) - parseDay(todayISO())) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return formatDay(iso, { weekday: 'long' });
}

// 0801 234 5678 / +234 801… / 234801… → 234801… for wa.me links.
export function whatsappNumber(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  return digits;
}

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
