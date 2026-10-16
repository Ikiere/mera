/**
 * MERA Supabase Configuration
 * Configures Supabase project credentials for authentication.
 * All scripts, camera recordings, and teleprompter functions remain 100% offline-first.
 */

// Retrieve environment variables or use configured project keys
export const SUPABASE_CONFIG = {
  // Replace these with your Supabase Project Settings -> API credentials
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
};

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_CONFIG.url) &&
    !SUPABASE_CONFIG.url.includes('your-project') &&
    Boolean(SUPABASE_CONFIG.anonKey) &&
    !SUPABASE_CONFIG.anonKey.includes('your-anon-key')
  );
};
