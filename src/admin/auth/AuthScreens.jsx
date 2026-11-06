import { useState } from 'react';
import Icon from '../../components/Icon';
import { useAuth } from './AuthProvider';

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth">
      <div className="auth-art" aria-hidden="true">
        <img src="/images/hero.jpg" alt="" />
        <div className="auth-art-copy">
          <span className="auth-chip">Kleener Touch · Admin</span>
          <p>“We don’t just clean, we organize while at it.”</p>
        </div>
      </div>
      <main className="auth-panel">
        <div className="auth-card">
          <a href="/" className="auth-brand">
            <img src="/images/logo.png" alt="" width="44" height="50" />
            <span><strong>Kleener Touch</strong><small>Operations dashboard</small></span>
          </a>
          <h1>{title}</h1>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}

function Message({ tone = 'error', children }) {
  return <p className={`auth-msg auth-msg-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</p>;
}

function loginErrorMessage(error) {
  switch (error.code) {
    case 'invalid_credentials':
      return { tone: 'error', text: 'Wrong username or password.' };
    case 'email_not_confirmed':
      return { tone: 'error', text: `This account’s email isn’t confirmed yet. Open the link Supabase sent to ${error.email}, then sign in.`, resendTo: error.email };
    case 'setup_required':
      return { tone: 'error', text: 'The admin database isn’t set up yet. Run the two SQL files in supabase/migrations (Supabase → SQL Editor), then try again.' };
    default:
      return { tone: 'error', text: error.message || 'Couldn’t sign in. Please try again.' };
  }
}

export function LoginScreen() {
  const { signIn, sendReset, resendConfirmation } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | reset
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === 'signin') {
      const { error } = await signIn(login, password);
      if (error) setMsg(loginErrorMessage(error));
    } else {
      const { error } = await sendReset(login);
      setMsg(error
        ? { tone: 'error', text: error.message }
        : { tone: 'ok', text: 'If that account exists, a reset link is on its way to its email.' });
    }
    setBusy(false);
  };

  return (
    <AuthShell
      title={mode === 'signin' ? 'Welcome back' : 'Reset your password'}
      subtitle={mode === 'signin' ? 'Sign in to manage bookings, schedules and customers.' : 'We’ll email you a link to set a new password.'}
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field">
          <span>Username or email</span>
          <input
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </label>
        {mode === 'signin' && (
          <label className="field">
            <span>Password</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        )}
        {msg && (
          <Message tone={msg.tone}>
            {msg.text}
            {msg.resendTo && (
              <button
                type="button"
                className="auth-inline-btn"
                onClick={async () => {
                  const { error } = await resendConfirmation(msg.resendTo);
                  setMsg(error
                    ? { tone: 'error', text: error.message }
                    : { tone: 'ok', text: `New confirmation link sent to ${msg.resendTo}. Open it, then sign in here.` });
                }}
              >
                Resend confirmation link
              </button>
            )}
          </Message>
        )}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? <span className="spinner" aria-hidden="true" /> : null}
          {mode === 'signin' ? 'Sign in' : 'Send reset link'}
        </button>
        <button type="button" className="auth-link" onClick={() => { setMode(mode === 'signin' ? 'reset' : 'signin'); setMsg(null); }}>
          {mode === 'signin' ? 'Forgot your password?' : '← Back to sign in'}
        </button>
      </form>
    </AuthShell>
  );
}

export function SetPasswordScreen() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setMsg('Use at least 8 characters.');
    if (password !== confirm) return setMsg('The passwords don’t match.');
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) setMsg(error.message);
    return undefined;
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose a password you haven’t used before.">
      <form className="auth-form" onSubmit={onSubmit}>
        <label className="field">
          <span>New password</span>
          <input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className="field">
          <span>Confirm password</span>
          <input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {msg && <Message>{msg}</Message>}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>Save password</button>
      </form>
    </AuthShell>
  );
}

export function ForbiddenScreen() {
  const { email, signOut } = useAuth();
  return (
    <AuthShell title="No access" subtitle={`${email} isn’t on the admin list. Ask an existing admin to add you in Settings.`}>
      <button type="button" className="btn btn-ghost btn-block" onClick={signOut}><Icon name="logout" /> Sign out</button>
    </AuthShell>
  );
}

export function SetupRequiredScreen() {
  const { signOut } = useAuth();
  return (
    <AuthShell
      title="Almost there"
      subtitle="You’re signed in, but the admin database hasn’t been set up. In Supabase → SQL Editor, run supabase/migrations/…0001_bookings.sql and then …0002_admin.sql, and reload this page."
    >
      <button type="button" className="btn btn-primary btn-block" onClick={() => window.location.reload()}>Reload</button>
      <button type="button" className="auth-link" onClick={signOut}>Sign out</button>
    </AuthShell>
  );
}

export function UnconfiguredScreen() {
  return (
    <AuthShell title="Supabase isn’t connected" subtitle="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then redeploy." />
  );
}

export function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="Loading">
      <img src="/images/logo.png" alt="" width="56" height="64" />
      <span className="splash-bar" />
    </div>
  );
}
