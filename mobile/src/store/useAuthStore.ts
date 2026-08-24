import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  initializing: boolean;
}

export const useAuthStore = create<AuthState>((set) => {
  supabase.auth.getSession().then(({ data }) => {
    set({ session: data.session, initializing: false });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    set({ session, initializing: false });
  });

  return { session: null, initializing: true };
});
