import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Icon from '../../components/Icon';
import { useAuth } from '../auth/AuthProvider';
import { addAdmin, downloadCsv, fetchAdmins, fetchAllBookings, removeAdmin } from '../lib/api';
import { formatDay, formatNumber, todayISO } from '../lib/format';
import { useToast } from '../components/Toasts';
import { Avatar, Card, ConfirmDialog, ErrorNote, PageHeader, Skeleton } from '../components/ui';

function ProfileCard() {
  const { name, updateProfile } = useAuth();
  const toast = useToast();
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await updateProfile(value);
    setBusy(false);
    toast(error ? { tone: 'error', title: 'Couldn’t save', body: error.message } : 'Name saved');
  };
  return (
    <Card title="Your profile">
      <form className="inline-form" onSubmit={onSubmit}>
        <input value={value} onChange={(e) => setValue(e.target.value)} maxLength={80} placeholder="Your full name" aria-label="Your full name" />
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy || value.trim() === name}>Save</button>
      </form>
      <p className="muted card-sub card-sub-after">Shown in the greeting and sidebar.</p>
    </Card>
  );
}

function PasswordCard() {
  const { updatePassword } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('The passwords don’t match.');
    setBusy(true);
    const { error: err } = await updatePassword(password);
    setBusy(false);
    if (err) return setError(err.message);
    setPassword('');
    setConfirm('');
    setError('');
    toast('Password updated');
    return undefined;
  };

  return (
    <Card title="Change password">
      <form className="adm-form" onSubmit={onSubmit}>
        <div className="field-row">
          <label className="field"><span>New password</span><input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <label className="field"><span>Confirm</span><input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
        </div>
        {error && <p className="error-note" role="alert">{error}</p>}
        <div><button type="submit" className="btn btn-primary btn-sm" disabled={busy || !password}>Update password</button></div>
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
      <PageHeader title="Settings" subtitle={`Signed in as ${email}`} />
      <div className="settings-grid">
        <AdminsCard />
        <div className="settings-col">
          <ProfileCard />
          <PasswordCard />
          <DataCard />
        </div>
      </div>
    </>
  );
}
