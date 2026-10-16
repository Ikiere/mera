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

    if (!isSupabaseConfigured()) {
      // Graceful offline demo mode
      await saveUserSetting('currentUserEmail', cleanEmail);
      return {
        success: true,
        message: 'Signed in (Offline Mode)',
        user: { email: cleanEmail, id: 'demo_user' },
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
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

    if (!isSupabaseConfigured()) {
      // Offline fallback: simulate signup requiring OTP confirmation
      await saveUserSetting('pending_user_email' as any, cleanEmail as any);
      return {
        success: true,
        message: 'Verification code sent to your email (Demo Mode: use code 123456)',
        user: { email: cleanEmail, user_metadata: { full_name: fullName } },
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      await saveUserSetting('pending_user_email' as any, cleanEmail as any);
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

    if (!isSupabaseConfigured()) {
      // Accept demo token or any 6-digit token in demo mode
      if (cleanToken.length === 6) {
        await saveUserSetting('currentUserEmail', cleanEmail);
        return {
          success: true,
          message: 'Account verified successfully!',
          user: { email: cleanEmail },
        };
      }
      return { success: false, message: 'Invalid 6-digit verification code.' };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
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
        return { success: true, user: recoveryCheck.data.user, session: recoveryCheck.data.session };
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

    if (!isSupabaseConfigured()) {
      return { success: true, message: 'New verification code sent! (Demo: 123456)' };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Verification code resent successfully.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Could not resend code' };
    }
  },

  /**
   * Send Password Reset Email
   */
  resetPassword: async (email: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured()) {
      return {
        success: true,
        message: 'Password reset instructions sent to your email (Demo Mode).',
      };
    }

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
