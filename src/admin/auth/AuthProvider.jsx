import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { checkIsAdmin } from '../lib/api';

const AuthContext = createContext(null);

/**
 * status: 'loading' | 'signed-out' | 'recovery' | 'checking' | 'admin' | 'forbidden' | 'unconfigured'
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [recovery, setRecovery] = useState(false);
  const [admin, setAdmin] = useState(null); // null = unknown

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
      .catch(() => !cancelled && setAdmin(false));
    return () => { cancelled = true; };
  }, [userId]);

  const value = useMemo(() => {
    let status;
    if (!supabase) status = 'unconfigured';
    else if (session === undefined) status = 'loading';
    else if (recovery && session) status = 'recovery';
    else if (!session) status = 'signed-out';
    else if (admin === null) status = 'checking';
    else status = admin ? 'admin' : 'forbidden';

    return {
      status,
      user: session?.user ?? null,
      email: session?.user?.email?.toLowerCase() ?? '',
      name: session?.user?.user_metadata?.full_name?.trim() ?? '',
      signIn: (email, password) => supabase.auth.signInWithPassword({ email: email.trim(), password }),
      signOut: () => supabase.auth.signOut(),
      updateProfile: (fullName) => supabase.auth.updateUser({ data: { full_name: fullName.trim() } }),
      sendReset: (email) =>
        supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin` }),
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
