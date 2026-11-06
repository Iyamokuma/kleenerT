import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AtSign, ExternalLink, Eye, EyeOff, LogOut } from 'lucide-react';
import Icon from '../../components/Icon';
import { useAuth } from '../auth/AuthProvider';
import { addAdmin, downloadCsv, fetchAdmins, fetchAllBookings, removeAdmin, setMyUsername } from '../lib/api';
import { formatDay, formatNumber, todayISO } from '../lib/format';
import { useToast } from '../components/Toasts';
import { useMyUsername } from '../components/Layout';
import { Avatar, Card, ConfirmDialog, ErrorNote, PageHeader, Skeleton } from '../components/ui';

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

function PasswordInput({ label, value, onChange, autoComplete, hint }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <span className="pw-field">
        <input type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="pw-toggle" aria-pressed={show} aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} onClick={() => setShow((v) => !v)}>
          {show ? <EyeOff aria-hidden="true" strokeWidth={1.8} /> : <Eye aria-hidden="true" strokeWidth={1.8} />}
        </button>
      </span>
      {hint}
    </label>
  );
}

function strength(pw) {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  if (pw.length < 8) score = Math.min(score, 1);
  return { score, label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score] };
}

function AccountCard() {
  const { email, signOut } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const current = useMyUsername();
  const [value, setValue] = useState(null); // null = untouched, show the saved username
  const draft = value ?? current;
  const cleaned = draft.replace(/\s/g, '').toLowerCase();
  const valid = USERNAME_RE.test(cleaned);

  const save = useMutation({
    mutationFn: () => setMyUsername(cleaned),
    onSuccess: (saved) => {
      toast({ title: 'Username updated', body: `Sign in with “${saved}” or your email from now on.` });
      setValue(null);
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err) => toast({ tone: 'error', title: 'Couldn’t change username', body: err.message }),
  });

  return (
    <Card title="Your account">
      <div className="account-head">
        <span className="adm-me-avatar adm-me-avatar-lg" aria-hidden="true">A</span>
        <div>
          <strong>Admin</strong>
          <small>{email}</small>
        </div>
      </div>
      <form className="adm-form" onSubmit={(e) => { e.preventDefault(); if (valid && cleaned !== current) save.mutate(); }}>
        <label className="field">
          <span>Username</span>
          <span className="at-field">
            <AtSign aria-hidden="true" strokeWidth={1.8} />
            <input
              value={draft}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={32}
              aria-invalid={draft !== '' && !valid}
              aria-describedby="username-help"
            />
          </span>
          <small id="username-help" className={`field-help${draft !== '' && !valid ? ' is-error' : ''}`}>
            {draft !== '' && !valid ? '3–32 letters, numbers, dots, dashes or underscores.' : 'Use this or your email to sign in.'}
          </small>
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-sm" disabled={save.isPending || !valid || cleaned === current}>
            {save.isPending && <span className="spinner" aria-hidden="true" />} Save username
          </button>
        </div>
      </form>
      <div className="account-links">
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><ExternalLink aria-hidden="true" strokeWidth={1.8} /> View website</a>
        <button type="button" className="btn btn-ghost btn-sm" onClick={signOut}><LogOut aria-hidden="true" strokeWidth={1.8} /> Sign out</button>
      </div>
    </Card>
  );
}

function PasswordCard() {
  const { changePassword } = useAuth();
  const toast = useToast();
  const [currentPw, setCurrentPw] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const meter = strength(password);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!currentPw) return setError('Enter your current password.');
    if (password.length < 8) return setError('Use at least 8 characters for the new password.');
    if (password !== confirm) return setError('The new passwords don’t match.');
    if (password === currentPw) return setError('The new password must be different from the current one.');
    setError('');
    setBusy(true);
    const { error: err } = await changePassword(currentPw, password);
    setBusy(false);
    if (err) return setError(err.message);
    setCurrentPw('');
    setPassword('');
    setConfirm('');
    setError('');
    toast({ title: 'Password changed', body: 'Use the new password next time you sign in.' });
    return undefined;
  };

  return (
    <Card title="Change password">
      <form className="adm-form" onSubmit={onSubmit}>
        <PasswordInput label="Current password" value={currentPw} onChange={setCurrentPw} autoComplete="current-password" />
        <PasswordInput
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={password && (
            <span className="pw-meter" data-score={meter.score}>
              <span className="pw-meter-bars" aria-hidden="true">{[1, 2, 3, 4].map((i) => <i key={i} />)}</span>
              <span className="pw-meter-label">{meter.label}</span>
            </span>
          )}
        />
        <PasswordInput label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        {error && <p className="error-note" role="alert">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !currentPw || !password || !confirm}>
            {busy && <span className="spinner" aria-hidden="true" />} Change password
          </button>
        </div>
      </form>
    </Card>
  );
}

function AdminsCard() {
  const { email: me } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [removing, setRemoving] = useState(null);
  const { data: admins, isLoading, error } = useQuery({ queryKey: ['admins'], queryFn: fetchAdmins });

  const add = useMutation({
    mutationFn: () => addAdmin({ email, username }, me),
    onSuccess: () => {
      toast({ title: 'Admin added', body: `${email.trim().toLowerCase()} can sign in once their account exists.` });
      setEmail('');
      setUsername('');
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err) => toast({
      tone: 'error',
      title: 'Couldn’t add admin',
      body: err.code === '23505' ? 'That email or username is already taken.'
        : err.code === '23514' ? 'Usernames are 3–32 letters, numbers, dots, dashes or underscores.' : err.message,
    }),
  });

  const remove = useMutation({
    mutationFn: () => removeAdmin(removing),
    onSuccess: () => {
      toast(`${removing} removed`);
      setRemoving(null);
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (err) => toast({ tone: 'error', title: 'Couldn’t remove admin', body: err.message }),
  });

  return (
    <Card title="Admins">
      <p className="muted card-sub">
        People on this list can sign in to the dashboard. They also need a login: create one in Supabase →
        Authentication → Users → <em>Add user</em> (tick “Auto confirm”), or send them a password reset from the sign-in page.
      </p>
      <ErrorNote error={error} />
      {isLoading ? <Skeleton rows={2} /> : (
        <ul className="admin-list">
          {admins?.map((a) => (
            <li key={a.email}>
              <Avatar name={a.email.split('@')[0].replace(/[._-]/g, ' ')} />
              <div>
                <strong>{a.email}{a.email === me && <span className="you">You</span>}</strong>
                <small>{a.username && <>Username <b>{a.username}</b> · </>}Added {formatDay(a.added_at.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}{a.added_by && a.added_by !== 'setup' ? ` by ${a.added_by}` : ''}</small>
              </div>
              {a.email !== me && (
                <button type="button" className="icon-btn" onClick={() => setRemoving(a.email)} aria-label={`Remove ${a.email}`}><Icon name="trash" /></button>
              )}
            </li>
          ))}
        </ul>
      )}
      <form className="inline-form" onSubmit={(e) => { e.preventDefault(); if (email.trim()) add.mutate(); }}>
        <input type="email" placeholder="colleague@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email to add as admin" required />
        <input placeholder="Username (optional)" value={username} onChange={(e) => setUsername(e.target.value)} aria-label="Username (optional)" maxLength={32} autoCapitalize="none" className="inline-form-short" />
        <button type="submit" className="btn btn-primary btn-sm" disabled={add.isPending}><Icon name="plus" /> Add admin</button>
      </form>
      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove admin?"
        body={`${removing} will lose access to the dashboard immediately.`}
        confirmLabel="Remove"
        busy={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setRemoving(null)}
      />
    </Card>
  );
}

function DataCard() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const exportAll = async () => {
    setBusy(true);
    try {
      const rows = await fetchAllBookings({});
      downloadCsv(rows, `kleener-touch-all-bookings-${todayISO()}.csv`);
      toast(`Exported ${formatNumber(rows.length)} bookings`);
    } catch (err) {
      toast({ tone: 'error', title: 'Export failed', body: err.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card title="Data">
      <p className="muted card-sub">Download every booking as a spreadsheet (opens in Excel, Numbers or Google Sheets).</p>
      <button type="button" className="btn btn-ghost btn-sm" onClick={exportAll} disabled={busy}>
        {busy ? <span className="spinner spinner-dark" aria-hidden="true" /> : <Icon name="download" />} Export all bookings
      </button>
    </Card>
  );
}

export default function Settings() {
  const { email } = useAuth();
  return (
    <>
      <PageHeader title="Settings" subtitle={`Signed in as Admin · ${email}`} />
      <div className="settings-grid">
        <div className="settings-col">
          <AccountCard />
          <PasswordCard />
        </div>
        <div className="settings-col">
          <AdminsCard />
          <DataCard />
        </div>
      </div>
    </>
  );
}
