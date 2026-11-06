import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Icon from '../../components/Icon';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { fetchStats } from '../lib/api';
import BookingDrawer from './BookingDrawer';
import NewBookingDialog from './NewBookingDialog';
import { useToast } from './Toasts';
import { Avatar } from './ui';

const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

const NAV = [
  { to: '/', label: 'Overview', icon: 'grid', end: true },
  { to: '/bookings', label: 'Bookings', icon: 'list', badge: true },
  { to: '/schedule', label: 'Schedule', icon: 'calendar' },
  { to: '/customers', label: 'Customers', icon: 'users' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

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

export default function Layout() {
  const { email, name, signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [navOpen, setNavOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [search, setSearch] = useState('');

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

  useEffect(() => setNavOpen(false), [location.pathname]);
  useEffect(() => {
    document.title = `${newCount ? `(${newCount}) ` : ''}Kleener Touch · Admin`;
  }, [newCount]);

  const actions = useMemo(() => ({ openBooking, openNewBooking: () => setNewOpen(true) }), [openBooking]);

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/bookings?q=${encodeURIComponent(q)}` : '/bookings');
    setSearch('');
  };

  return (
    <AdminContext.Provider value={actions}>
      <div className={`adm ${navOpen ? 'nav-open' : ''}`.trim()}>
        <aside className="adm-side">
          <a href="/admin" className="adm-brand">
            <img src="/images/logo.png" alt="" width="38" height="43" />
            <span><strong>Kleener Touch</strong><small>Operations</small></span>
          </a>
          <nav className="adm-nav" aria-label="Admin">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.badge && newCount > 0 && <span className="nav-badge" aria-label={`${newCount} new`}>{newCount}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="adm-side-foot">
            <a href="/" className="adm-side-link" target="_blank" rel="noopener noreferrer"><Icon name="external" /> View website</a>
            <div className="adm-user">
              <Avatar name={name || email.split('@')[0].replace(/[._-]/g, ' ')} size={34} />
              <span className="adm-user-text" title={email}>
                {name && <strong>{name}</strong>}
                <small>{email}</small>
              </span>
              <button type="button" className="icon-btn icon-btn-dark" onClick={signOut} aria-label="Sign out" title="Sign out"><Icon name="logout" /></button>
            </div>
          </div>
        </aside>
        <button type="button" className="adm-scrim" aria-label="Close menu" onClick={() => setNavOpen(false)} tabIndex={navOpen ? 0 : -1} />

        <div className="adm-main">
          <header className="adm-top">
            <button type="button" className="icon-btn adm-menu" onClick={() => setNavOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
            <form className="adm-search" onSubmit={onSearch} role="search">
              <Icon name="search" />
              <input
                type="search"
                placeholder="Search name, phone, reference or address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search bookings"
              />
            </form>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setNewOpen(true)}><Icon name="plus" /> <span className="hide-sm">New booking</span></button>
          </header>
          <main className="adm-content" id="main">
            <Outlet />
          </main>
        </div>
      </div>

      <BookingDrawer id={bookingId} onClose={closeBooking} />
      <NewBookingDialog open={newOpen} onClose={() => setNewOpen(false)} onCreated={openBooking} />
    </AdminContext.Provider>
  );
}
