/**
 * MERA Auth Callback Screen
 * Handles deep links from Supabase email verification (e.g. mera://auth/callback#access_token=... or ?code=...)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { supabase } from '../../services/supabase/supabaseClient';
import { saveUserSetting } from '../../services/database/settingsRepo';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function handleAuthRedirect() {
      try {
        const url = await Linking.getInitialURL();
        const currentUrl = url || '';

        // 1. Check for token hash / code in URL parameters
        if (params.code && typeof params.code === 'string') {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) throw error;
        } else if (params.token_hash && typeof params.token_hash === 'string') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: params.token_hash,
            type: 'signup',
          });
          if (error) throw error;
        } else if (currentUrl.includes('#')) {
          // Parse fragment #access_token=...&refresh_token=...
          const hashIndex = currentUrl.indexOf('#');
          const fragment = currentUrl.substring(hashIndex + 1);
          const searchParams = new URLSearchParams(fragment);
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) throw error;
          }
        }

        // Verify active session was established
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          if (sessionData.session.user.email) {
            await saveUserSetting('currentUserEmail', sessionData.session.user.email.toLowerCase());
          }
          await saveUserSetting('hasCompletedOnboarding', false);

          if (isMounted) {
            setStatus('success');
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 800);
          }
          return;
        }

        // If no session found yet, route back to login
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Could not establish session. Please sign in with your credentials.');
          setTimeout(() => {
            router.replace('/auth/login');
          }, 2000);
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err?.message || 'Verification failed');
          setTimeout(() => {
            router.replace('/auth/login');
          }, 2500);
        }
      }
    }

    handleAuthRedirect();

    return () => {
      isMounted = false;
    };
  }, [params, router]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator size="large" color={THEME.colors.accentPrimary} />
            <Text style={styles.title}>Verifying Your Account</Text>
            <Text style={styles.subtitle}>Connecting to MERA Studio...</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>Opening MERA Studio...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.errorBadge}>
              <Ionicons name="alert-circle" size={32} color={THEME.colors.error} />
            </View>
            <Text style={styles.title}>Verification Incomplete</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
