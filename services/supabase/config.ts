/**
 * MERA Supabase Configuration
 * Configures Supabase project credentials for authentication.
 * All scripts, camera recordings, and teleprompter functions remain 100% offline-first.
 */

// Retrieve environment variables or use configured project keys
export const SUPABASE_CONFIG = {
  url:
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    'https://wnradwfpefxrlzrssgmr.supabase.co',
  anonKey:
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InducmFkd2ZwZWZ4cmx6cnNzZ21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwOTQ2MTgsImV4cCI6MjEwNzY3MDYxOH0.n0kgBtdqTsphPDNq6WgsDzIpejrG7rvnlf1-omScH-4',
};

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_CONFIG.url) &&
    !SUPABASE_CONFIG.url.includes('your-project') &&
    Boolean(SUPABASE_CONFIG.anonKey) &&
    !SUPABASE_CONFIG.anonKey.includes('your-anon-key')
  );
};
