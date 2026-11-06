import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { CalendarDays, ExternalLink, Inbox, LayoutGrid, LogOut, Plus, Search, Settings, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { fetchAdmins, fetchStats } from '../lib/api';
import BookingDrawer from './BookingDrawer';
import NewBookingDialog from './NewBookingDialog';
import { useToast } from './Toasts';

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const NAV = [
  { to: '/', label: 'Overview', Icon: LayoutGrid, end: true },
  { to: '/bookings', label: 'Bookings', Icon: Inbox, badge: true },
  { to: '/schedule', label: 'Schedule', Icon: CalendarDays },
  { to: '/customers', label: 'Customers', Icon: Users },
  { to: '/settings', label: 'Settings', Icon: Settings },
];

const SPRING = { type: 'spring', stiffness: 520, damping: 38 };

function useRealtimeBookings(onNewBooking) {
  const queryClient = useQueryClient();
  const callback = useRef(onNewBooking);
  callback.current = onNewBooking;

  useEffect(() => {
    const channel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        queryClient.invalidateQueries();
        if (payload.eventType === 'INSERT' && payload.new?.source === 'website') callback.current(payload.new);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);
}

/** The signed-in admin's username, for the account chip. */
export function useMyUsername() {
  const { email } = useAuth();
  const { data } = useQuery({ queryKey: ['admins'], queryFn: fetchAdmins });
  return data?.find((a) => a.email === email)?.username ?? '';
}

function NavItem({ item, count, layoutId, withLabel }) {
  const { Icon } = item;
  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`} aria-label={withLabel ? undefined : item.label}>
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId={layoutId} className="nav-item-bg" transition={SPRING} />}
          <Icon className="nav-item-icon" strokeWidth={1.8} aria-hidden="true" />
          {item.badge && count > 0 && <span className="nav-item-badge" aria-label={`${count} new`}>{count > 99 ? '99+' : count}</span>}
          {withLabel ? <span className="nav-item-label">{item.label}</span> : <span className="nav-item-tip" aria-hidden="true">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);
  const [search, setSearch] = useState('');
  const username = useMyUsername();

  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: fetchStats });
  const newCount = stats?.status_counts?.new ?? 0;

  const bookingId = params.get('booking');
  const openBooking = useCallback((id) => setParams((p) => { p.set('booking', id); return p; }), [setParams]);
  const closeBooking = useCallback(() => setParams((p) => { p.delete('booking'); return p; }, { replace: true }), [setParams]);

  useRealtimeBookings((row) => {
    toast({
      tone: 'info',
      title: 'New booking',
      body: `${row.full_name} · ${row.service}`,
      duration: 9000,
      action: { label: 'View', onClick: () => openBooking(row.id) },
    });
  });

  useEffect(() => {
    document.title = `${newCount ? `(${newCount}) ` : ''}Kleener Touch · Admin`;
  }, [newCount]);

  const actions = useMemo(() => ({ openBooking, openNewBooking: () => setNewOpen(true) }), [openBooking]);
  const onOverview = location.pathname === '/';

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/bookings?q=${encodeURIComponent(q)}` : '/bookings');
    setSearch('');
  };

  return (
    <AdminContext.Provider value={actions}>
      <div className="adm">
        <aside className="rail">
          <Link to="/" className="rail-logo" aria-label="Kleener Touch admin home">
            <img src="/images/logo.png" alt="" width="40" height="46" />
          </Link>
          <nav className="rail-nav" aria-label="Admin">
            {NAV.map((item) => <NavItem key={item.to} item={item} count={newCount} layoutId="rail-active" />)}
          </nav>
          <div className="rail-foot">
            <a href="/" className="nav-item" target="_blank" rel="noopener noreferrer" aria-label="View website (opens in a new tab)">
              <ExternalLink className="nav-item-icon" strokeWidth={1.8} aria-hidden="true" />
              <span className="nav-item-tip" aria-hidden="true">View website</span>
            </a>
            <button type="button" className="nav-item" onClick={signOut} aria-label="Sign out">
              <LogOut className="nav-item-icon" strokeWidth={1.8} aria-hidden="true" />
              <span className="nav-item-tip" aria-hidden="true">Sign out</span>
            </button>
          </div>
        </aside>

        <div className="adm-main">
          <header className="adm-top">
            <Link to="/" className="adm-top-logo" aria-label="Overview">
              <img src="/images/logo.png" alt="" width="32" height="37" />
            </Link>
            <form className="adm-search" onSubmit={onSearch} role="search">
              <Search aria-hidden="true" strokeWidth={1.8} />
              <input
                type="search"
                placeholder="Search name, phone, reference or address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search bookings"
              />
            </form>
            {!onOverview && (
              <button type="button" className="pill pill-dark" onClick={() => setNewOpen(true)}>
                <Plus aria-hidden="true" strokeWidth={2} /> <span className="hide-sm">New booking</span>
              </button>
            )}
            <Link to="/settings" className="adm-me" aria-label={`Admin account${username ? ` @${username}` : ''}`}>
              <span className="adm-me-avatar" aria-hidden="true">A</span>
              <span className="adm-me-text">
                <strong>Admin</strong>
                {username && <small>@{username}</small>}
              </span>
            </Link>
          </header>

          <main className="adm-content" id="main">
            <motion.div
              key={location.pathname}
              className="page"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>

        <nav className="tabbar" aria-label="Admin">
          {NAV.map((item) => <NavItem key={item.to} item={item} count={newCount} layoutId="tab-active" withLabel />)}
        </nav>
      </div>

      <BookingDrawer id={bookingId} onClose={closeBooking} />
      <NewBookingDialog open={newOpen} onClose={() => setNewOpen(false)} onCreated={openBooking} />
    </AdminContext.Provider>
  );
}
