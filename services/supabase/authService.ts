/**
 * MERA Authentication Service
 * Supabase auth layer supporting Sign In, Sign Up, OTP Verification, and Password Reset.
 */

import { supabase } from './supabaseClient';
import { isSupabaseConfigured } from './config';
import { saveUserSetting } from '../database/settingsRepo';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  session?: any;
}

export const authService = {
  /**
   * Sign In with Email and Password
   */
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'Invalid credentials. User not found.' };
      }

      await saveUserSetting('currentUserEmail', cleanEmail);
      return { success: true, user: data.user, session: data.session };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Login failed' };
    }
  },

  /**
   * Sign Up with Email, Password, and Full Name
   */
  signUp: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: 'mera://auth/callback',
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Signup failed' };
    }
  },

  /**
   * Verify 6-digit OTP code sent to Email
   */
  verifyOtp: async (email: string, token: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    try {
      let { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'signup',
      });

      if (error) {
        // Also check if it was an email change or recovery token
        const recoveryCheck = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'email',
        });
        if (recoveryCheck.error) {
          return { success: false, message: error.message };
        }
        data = recoveryCheck.data;
      }

      await saveUserSetting('currentUserEmail', cleanEmail);
      return { success: true, user: data.user, session: data.session };
    } catch (err: any) {
      return { success: false, message: err?.message || 'OTP verification failed' };
    }
  },

  /**
   * Resend OTP verification code to Email
   */
  resendOtp: async (email: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Verification code resent to your email.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Could not resend code' };
    }
  },

  /**
   * Send Password Reset Email
   */
  resetPassword: async (email: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Reset request failed' };
    }
  },

  /**
   * Sign Out
   */
  signOut: async (): Promise<void> => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      await saveUserSetting('currentUserEmail', null);
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  },

  /**
   * Check if current session exists or if email was verified via link
   */
  checkSession: async (email?: string): Promise<AuthResponse> => {
    if (!isSupabaseConfigured()) return { success: false, message: 'Supabase not configured' };
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return { success: false, message: error.message };
      }
      if (data?.session?.user) {
        const userEmail = data.session.user.email || email || '';
        if (userEmail) {
          await saveUserSetting('currentUserEmail', userEmail.toLowerCase());
        }
        return { success: true, user: data.session.user, session: data.session };
      }
      return { success: false, message: 'No active session. Please enter the 6-digit code.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to check session' };
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    } catch {
      return null;
    }
  },
};
