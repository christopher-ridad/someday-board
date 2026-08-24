import { supabase } from '@/lib/supabase';

// Sends a one-time 6-digit code to the given email (the Magic Link template
// must include {{ .Token }} for the email to actually show a code). Using a
// typed-in code instead of a clickable deep link sidesteps Expo Go's
// cold-start deep-linking limitation entirely — no app handoff, no redirect
// URL allow-listing needed.
export async function sendSignInCode(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function verifySignInCode(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
}
