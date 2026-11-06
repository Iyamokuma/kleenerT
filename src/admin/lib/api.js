import { supabase } from '../../lib/supabase';

export const PAGE_SIZE = 20;

// Columns staff can edit from the dashboard.
const EDITABLE = ['status', 'assigned_to', 'scheduled_date', 'scheduled_time', 'quoted_amount', 'full_name', 'phone', 'email', 'location', 'notes'];

function unwrap({ data, error, count }) {
  if (error) throw error;
  return count === undefined || count === null ? data : { rows: data, count };
}

// PostgREST filter syntax treats , ( ) as separators; strip them from free text.
const cleanSearch = (q) => q.replace(/[,()%*\\]/g, ' ').trim();

function applyFilters(query, { status, service, q }) {
  if (status && status !== 'all') query = query.eq('status', status);
  if (service) query = query.eq('service', service);
  const term = q ? cleanSearch(q) : '';
  if (term) {
    const digits = term.replace(/\D/g, '');
    const like = `%${term}%`;
    const ors = [`full_name.ilike.${like}`, `reference.ilike.${like}`, `location.ilike.${like}`, `email.ilike.${like}`, `phone.ilike.${like}`];
    if (digits.length >= 4) ors.push(`phone_key.like.%${digits.slice(-10)}%`);
    query = query.or(ors.join(','));
  }
  return query;
}

const SORTS = {
  newest: [['created_at', { ascending: false }]],
  oldest: [['created_at', { ascending: true }]],
  service_date: [['service_date', { ascending: true }], ['created_at', { ascending: false }]],
};

export async function fetchBookings({ page = 1, sort = 'newest', ...filters }) {
  let query = supabase.from('bookings').select('*', { count: 'exact' });
  query = applyFilters(query, filters);
  for (const [col, opts] of SORTS[sort] ?? SORTS.newest) query = query.order(col, opts);
  const from = (page - 1) * PAGE_SIZE;
  return unwrap(await query.range(from, from + PAGE_SIZE - 1));
}

export async function fetchAllBookings(filters) {
  let query = supabase.from('bookings').select('*');
  query = applyFilters(query, filters).order('created_at', { ascending: false }).limit(5000);
  return unwrap(await query);
}

export async function fetchBooking(id) {
  return unwrap(await supabase.from('bookings').select('*').eq('id', id).single());
}

export async function fetchEvents(bookingId) {
  return unwrap(
    await supabase.from('booking_events').select('*').eq('booking_id', bookingId).order('created_at', { ascending: false }),
  );
}

export async function updateBooking(id, patch) {
  const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => EDITABLE.includes(k)));
  return unwrap(await supabase.from('bookings').update(clean).eq('id', id).select().single());
}

export async function createBooking(row) {
  return unwrap(await supabase.from('bookings').insert(row).select().single());
}

export async function deleteBooking(id) {
  return unwrap(await supabase.from('bookings').delete().eq('id', id));
}

export async function addNote(bookingId, message) {
  return unwrap(await supabase.from('booking_events').insert({ booking_id: bookingId, kind: 'note', message }));
}

export async function fetchStats() {
  return unwrap(await supabase.rpc('admin_dashboard_stats'));
}

export async function fetchSchedule(fromISO, toISO) {
  return unwrap(
    await supabase
      .from('bookings')
      .select('*')
      .gte('service_date', fromISO)
      .lte('service_date', toISO)
      .in('status', ['new', 'contacted', 'confirmed', 'completed'])
      .order('service_date', { ascending: true })
      .order('created_at', { ascending: true }),
  );
}

export async function fetchRecent(limit = 6) {
  return unwrap(await supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(limit));
}

export async function fetchCustomers({ q = '' }) {
  let query = supabase.from('booking_customers').select('*').order('last_booking_at', { ascending: false }).limit(500);
  const term = cleanSearch(q);
  if (term) {
    const digits = term.replace(/\D/g, '');
    const ors = [`full_name.ilike.%${term}%`, `email.ilike.%${term}%`, `last_location.ilike.%${term}%`];
    if (digits.length >= 4) ors.push(`phone_key.like.%${digits.slice(-10)}%`);
    query = query.or(ors.join(','));
  }
  return unwrap(await query);
}

export async function fetchAdmins() {
  return unwrap(await supabase.from('admin_users').select('*').order('added_at'));
}

export async function addAdmin(email, addedBy) {
  return unwrap(await supabase.from('admin_users').insert({ email: email.trim().toLowerCase(), added_by: addedBy }));
}

export async function removeAdmin(email) {
  return unwrap(await supabase.from('admin_users').delete().eq('email', email));
}

export async function checkIsAdmin() {
  return unwrap(await supabase.rpc('is_admin'));
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------
const CSV_COLUMNS = [
  ['reference', 'Reference'], ['created_at', 'Received'], ['status', 'Status'], ['full_name', 'Name'],
  ['phone', 'Phone'], ['email', 'Email'], ['service', 'Service'], ['property_type', 'Property'],
  ['location', 'Location'], ['preferred_date', 'Preferred date'], ['preferred_time', 'Preferred time'],
  ['scheduled_date', 'Scheduled date'], ['scheduled_time', 'Scheduled time'], ['frequency', 'Frequency'],
  ['assigned_to', 'Assigned to'], ['quoted_amount', 'Quote (NGN)'], ['source', 'Source'], ['notes', 'Customer notes'],
];

function csvCell(value) {
  if (value == null) return '';
  let s = String(value);
  // Stop spreadsheet apps treating customer text as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(rows, filename) {
  const lines = [CSV_COLUMNS.map(([, h]) => h).join(','), ...rows.map((r) => CSV_COLUMNS.map(([k]) => csvCell(r[k])).join(','))];
  const blob = new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function fetchOverdue(todayIso) {
  return unwrap(
    await supabase
      .from('bookings')
      .select('*')
      .lt('service_date', todayIso)
      .in('status', ['new', 'contacted', 'confirmed'])
      .order('service_date', { ascending: true })
      .limit(50),
  );
}

export async function fetchCustomerBookings(phoneKey) {
  return unwrap(await supabase.from('bookings').select('*').eq('phone_key', phoneKey).order('created_at', { ascending: false }));
}
