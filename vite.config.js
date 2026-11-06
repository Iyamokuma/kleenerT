import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // NEXT_PUBLIC_ is accepted too, so the variable names Supabase's Vercel integration creates work unchanged.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
});
