import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // 'pkce' was needed for the earlier link-based magic-link flow (it
    // requires a redirect-exchange step). Sign-in is now a typed-in code via
    // verifyOtp, which doesn't use redirect exchange at all — and 'pkce'
    // makes Supabase generate a long PKCE-style code instead of a plain
    // 6-digit OTP for the email, which is why the email code was too long.
    flowType: 'implicit',
  },
});

// iOS suspends JS timers in the background, so the SDK's refresh timer needs
// to be explicitly paused/resumed with app state — otherwise sessions go
// stale silently after the app is backgrounded for a while.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
