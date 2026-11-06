import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { checkIsAdmin, resolveLoginEmail } from '../lib/api';

const AuthContext = createContext(null);

/**
 * status: 'loading' | 'signed-out' | 'recovery' | 'checking' | 'admin' | 'forbidden' | 'setup-required' | 'unconfigured'
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [recovery, setRecovery] = useState(false);
  const [admin, setAdmin] = useState(null); // null = unknown, 'setup' = database functions missing

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) {
      setAdmin(null);
      return undefined;
    }
    let cancelled = false;
    setAdmin(null);
    checkIsAdmin()
      .then((ok) => !cancelled && setAdmin(Boolean(ok)))
      .catch((err) => !cancelled && setAdmin(err?.code === 'PGRST202' ? 'setup' : false));
    return () => { cancelled = true; };
  }, [userId]);

  const value = useMemo(() => {
    let status;
    if (!supabase) status = 'unconfigured';
    else if (session === undefined) status = 'loading';
    else if (recovery && session) status = 'recovery';
    else if (!session) status = 'signed-out';
    else if (admin === null) status = 'checking';
    else if (admin === 'setup') status = 'setup-required';
    else status = admin ? 'admin' : 'forbidden';

    return {
      status,
      user: session?.user ?? null,
      email: session?.user?.email?.toLowerCase() ?? '',
      name: session?.user?.user_metadata?.full_name?.trim() ?? '',
      // Errors come back as { code, message, email } so the screen can say exactly what's wrong.
      signIn: async (login, password) => {
        let email;
        try {
          email = await resolveLoginEmail(login);
        } catch (err) {
          return { error: { code: err?.code === 'PGRST202' ? 'setup_required' : 'lookup_failed', message: err?.message } };
        }
        // Say which half is wrong: a mistyped username and a wrong password need different fixes.
        if (!email) return { error: { code: 'unknown_username', message: 'No admin has that username' } };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error
          ? { error: { code: error.code, message: error.message, email, byEmail: login.includes('@') } }
          : { error: null };
      },
      resendConfirmation: (email) =>
        supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: `${window.location.origin}/admin` } }),
      signOut: () => supabase.auth.signOut(),
      updateProfile: (fullName) => supabase.auth.updateUser({ data: { full_name: fullName.trim() } }),
      sendReset: async (login) => {
        const email = await resolveLoginEmail(login).catch(() => null);
        // Don't reveal whether a username exists.
        if (!email) return { error: null };
        return supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin` });
      },
      // Settings → Change password: prove the current password first, so an unattended
      // signed-in browser can't be used to take over the account.
      changePassword: async (currentPassword, nextPassword) => {
        const email = session?.user?.email;
        const check = await supabase.auth.signInWithPassword({ email, password: currentPassword });
        if (check.error) {
          return { error: { code: 'wrong_current', message: 'Your current password isn’t right.' } };
        }
        const { error } = await supabase.auth.updateUser({ password: nextPassword });
        if (!error) return { error: null };
        if (error.code === 'same_password') return { error: { code: error.code, message: 'Choose a password you haven’t used for this account.' } };
        if (error.code === 'weak_password') return { error: { code: error.code, message: 'That password is too weak. Use at least 8 characters with a mix of letters and numbers.' } };
        return { error: { code: error.code, message: error.message } };
      },
      updatePassword: async (password) => {
        const res = await supabase.auth.updateUser({ password });
        if (!res.error) setRecovery(false);
        return res;
      },
    };
  }, [session, recovery, admin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
