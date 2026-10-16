/**
 * MERA Authentication: Email Verification / OTP Screen
 * Seamlessly handles Supabase Free tier (confirmation links) and 6-digit OTP codes.
 * Auto-detects when user confirms via link and immediately unlocks the app.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  AppState,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { ErrorModal } from '../../components/common/ErrorModal';
import { authService } from '../../services/supabase/authService';
import { supabase } from '../../services/supabase/supabaseClient';
import { saveUserSetting } from '../../services/database/settingsRepo';

export default function OtpConfirmationScreen() {
  const router = useRouter();
  const { email, password, resent } = useLocalSearchParams<{
    email: string;
    password?: string;
    resent?: string;
  }>();
  const isMountedRef = useRef(true);

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showManualCode, setShowManualCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  // Successful verification transition helper
  const handleSuccessRedirect = async () => {
    await saveUserSetting('hasCompletedOnboarding', false);
    if (email) {
      await saveUserSetting('currentUserEmail', email.toLowerCase());
    }
    router.replace('/(tabs)');
  };

  // Check if email has been verified on Supabase
  const checkVerification = async (silent = true) => {
    if (!silent) setCheckingStatus(true);

    try {
      // 1. Check existing session
      const sessionResult = await authService.checkSession(email);
      if (sessionResult.success && sessionResult.user) {
        await handleSuccessRedirect();
        return true;
      }

      // 2. If user registered with password, test signing in
      // When email confirmation link is clicked in Supabase, signIn immediately succeeds!
      if (password && email) {
        const signResult = await authService.signIn(email, password);
        if (signResult.success) {
          await handleSuccessRedirect();
          return true;
        }
      }
    } catch {
      // Quiet fail during background poll
    } finally {
      if (!silent && isMountedRef.current) setCheckingStatus(false);
    }
    return false;
  };

  // 1. Listen for Supabase session changes (fired when link or deep link completes)
  useEffect(() => {
    isMountedRef.current = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        await handleSuccessRedirect();
      }
    });

    // 2. Listen for AppState changes (e.g. when user switches back from their email app)
    const appStateSub = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        await checkVerification(true);
      }
    });

    // 3. Auto-poll every 3.5 seconds to detect link click in real-time without user doing anything
    const pollInterval = setInterval(() => {
      if (isMountedRef.current) {
        checkVerification(true);
      }
    }, 3500);

    return () => {
      isMountedRef.current = false;
      authListener?.subscription?.unsubscribe();
      appStateSub.remove();
      clearInterval(pollInterval);
    };
  }, [email, password]);

  // Cooldown countdown for resend button
  useEffect(() => {
    let timer: any = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Open the native email app directly
  const handleOpenEmailApp = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('message:');
      } else {
        await Linking.openURL('mailto:');
      }
    } catch {
      // If default scheme fails, fallback to mailto
      try {
        await Linking.openURL('mailto:');
      } catch {
        setErrorModal({
          visible: true,
          title: 'Email App',
          message: 'Please open your preferred email app to check your inbox.',
        });
      }
    }
  };

  // Manual Check Verification Button
  const handleManualCheckStatus = async () => {
    const verified = await checkVerification(false);
    if (!verified) {
      setErrorModal({
        visible: true,
        title: 'Verification Incomplete',
        message: 'Your email has not been confirmed yet. Please tap the confirmation link in your email and try again.',
      });
    }
  };

  // Handle manual 6-digit code or pasted token/link
  const handleVerifyCodeOrToken = async () => {
    let rawToken = otpCode.trim();

    if (!rawToken) {
      setErrorModal({
        visible: true,
        title: 'Input Required',
        message: 'Please enter your 6-digit code or paste the verification link from your email.',
      });
      return;
    }

    // Extract token if user pasted a full URL
    if (rawToken.includes('token=')) {
      const match = rawToken.match(/token=([a-zA-Z0-9_\-]+)/);
      if (match && match[1]) {
        rawToken = match[1];
      }
    }

    setLoading(true);
    const result = await authService.verifyOtp(email || '', rawToken);
    setLoading(false);

    if (result.success) {
      await handleSuccessRedirect();
    } else {
      setErrorModal({
        visible: true,
        title: 'Verification Failed',
        message: result.message || 'Incorrect code or expired token. Please check your email or tap the link directly.',
      });
    }
  };

  // Resend confirmation email
  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setLoading(true);
    const result = await authService.resendOtp(email);
    setLoading(false);

    if (result.success) {
      setResendCooldown(30);
      setErrorModal({
        visible: true,
        title: 'Email Sent',
        message: 'A new verification email has been sent. Please check your inbox.',
      });
    } else {
      setErrorModal({
        visible: true,
        title: 'Notice',
        message: result.message || 'Failed to resend confirmation email.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel="Back to Sign Up"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Hero Visual Badge */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-open-outline" size={38} color={THEME.colors.accentPrimary} />
            </View>
          </View>

          {/* Heading */}
          <View style={styles.textSection}>
            {resent === 'true' && (
              <View style={styles.resentBadge}>
                <Ionicons name="refresh-circle" size={16} color={THEME.colors.accentPrimary} />
                <Text style={styles.resentBadgeText}>New confirmation email sent to your inbox!</Text>
              </View>
            )}
            <Text style={styles.title}>Confirm Your Email</Text>
            <Text style={styles.subtitle}>
              We sent a verification link to{' '}
              <Text style={styles.emailHighlight}>{email || 'your email'}</Text>.
            </Text>
            <Text style={styles.instructions}>
              Tap the link in your email to instantly verify your account and start using MERA.
            </Text>
          </View>

          {/* MAIN ACTION CARD */}
          <View style={styles.card}>
            {/* Live Polling Status Indicator */}
            <View style={styles.statusIndicator}>
              <ActivityIndicator size="small" color={THEME.colors.accentPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.statusText}>
                {checkingStatus ? 'Checking verification...' : 'Waiting for confirmation link tap...'}
              </Text>
            </View>

            {/* Primary Action: Open Email App */}
            <Button
              title="Open Email App"
              variant="primary"
              size="lg"
              onPress={handleOpenEmailApp}
              icon={<Ionicons name="mail" size={20} color="#FFFFFF" />}
              style={styles.openMailBtn}
            />

            {/* Secondary Action: I've Already Confirmed */}
            <TouchableOpacity
              onPress={handleManualCheckStatus}
              style={styles.checkStatusBtn}
              activeOpacity={0.7}
              disabled={checkingStatus}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={THEME.colors.accentLavender} />
              <Text style={styles.checkStatusText}>I've confirmed in my email</Text>
            </TouchableOpacity>

            {/* Accordion Toggle: Manual Code/Token input */}
            <TouchableOpacity
              onPress={() => setShowManualCode((prev) => !prev)}
              style={styles.accordionToggle}
              activeOpacity={0.7}
            >
              <Text style={styles.accordionText}>
                {showManualCode ? 'Hide manual code entry' : 'Have a 6-digit code or link? Enter manually'}
              </Text>
              <Ionicons
                name={showManualCode ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={THEME.colors.textMuted}
              />
            </TouchableOpacity>

            {/* Expandable Manual Input Section */}
            {showManualCode && (
              <View style={styles.manualSection}>
                <Text style={styles.inputLabel}>ENTER CODE OR PASTE VERIFICATION LINK</Text>
                <View style={styles.tokenInputWrapper}>
                  <TextInput
                    style={styles.tokenInput}
                    placeholder="123456 or paste link"
                    placeholderTextColor={THEME.colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={otpCode}
                    onChangeText={setOtpCode}
                  />
                </View>
                <Button
                  title={loading ? 'Verifying...' : 'Verify Code'}
                  variant="secondary"
                  size="md"
                  onPress={handleVerifyCodeOrToken}
                  disabled={loading || !otpCode.trim()}
                  style={styles.verifyManualBtn}
                />
              </View>
            )}

            {/* Resend Action */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the email? </Text>
              {resendCooldown > 0 ? (
                <Text style={styles.cooldownText}>Resend in {resendCooldown}s</Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  style={styles.resendTouchArea}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.resendLink}>Resend Email</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Obsidian Error/Alert Pop-up Modal */}
      <ErrorModal
        visible={errorModal.visible}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
  },
  resentBadgeText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.accentLavender,
  },
  title: {
    fontSize: 26,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 6,
  },
  emailHighlight: {
    color: THEME.colors.accentLavender,
    fontWeight: THEME.typography.weights.semibold,
  },
  instructions: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  card: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    gap: 14,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: THEME.radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  statusText: {
    fontSize: 13,
    color: THEME.colors.accentLavender,
    fontWeight: THEME.typography.weights.medium,
  },
  openMailBtn: {
    width: '100%',
    height: 52,
  },
  checkStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: THEME.radii.lg,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  checkStatusText: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
  },
  accordionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 4,
  },
  accordionText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weights.medium,
  },
  manualSection: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.radii.md,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.6,
  },
  tokenInputWrapper: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  tokenInput: {
    fontSize: 14,
    color: THEME.colors.textPrimary,
  },
  verifyManualBtn: {
    width: '100%',
    height: 44,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  resendText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  cooldownText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weights.semibold,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.accentPrimary,
  },
  resendTouchArea: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
});
