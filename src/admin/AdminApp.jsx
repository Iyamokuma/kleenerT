import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { ForbiddenScreen, LoginScreen, SetPasswordScreen, SplashScreen, UnconfiguredScreen } from './auth/AuthScreens';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toasts';
import Overview from './pages/Overview';
import Bookings from './pages/Bookings';
import Schedule from './pages/Schedule';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import './admin.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
  },
});

function Gate() {
  const { status } = useAuth();
  const client = useQueryClient();

  // Never show one admin's cached data to the next person on this browser.
  useEffect(() => {
    if (status === 'signed-out') client.clear();
  }, [status, client]);

  if (status === 'unconfigured') return <UnconfiguredScreen />;
  if (status === 'loading' || status === 'checking') return <SplashScreen />;
  if (status === 'recovery') return <SetPasswordScreen />;
  if (status === 'signed-out') return <LoginScreen />;
  if (status === 'forbidden') return <ForbiddenScreen />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="customers" element={<Customers />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin" future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ToastProvider>
            <Gate />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
