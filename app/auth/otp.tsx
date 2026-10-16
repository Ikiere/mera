/**
 * MERA Authentication: OTP Confirmation Screen
 * Matches required flow: Sign Up -> OTP Confirmation -> Onboarding Experience.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { ErrorModal } from '../../components/common/ErrorModal';
import { authService } from '../../services/supabase/authService';
import { saveUserSetting } from '../../services/database/settingsRepo';

export default function OtpConfirmationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleVerify = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorModal({
        visible: true,
        title: 'Invalid Code',
        message: 'Please enter the complete 6-digit verification code sent to your email.',
      });
      return;
    }

    setLoading(true);
    const result = await authService.verifyOtp(email || '', otpCode.trim());
    setLoading(false);

    if (result.success) {
      // Flow requirement: After OTP confirmation, show the Onboarding page!
      await saveUserSetting('hasCompletedOnboarding', false);

      Alert.alert(
        'Email Confirmed',
        'Your account has been verified successfully. Welcome to MERA!',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Replace root to trigger the 3-page onboarding walkthrough
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } else {
      setErrorModal({
        visible: true,
        title: 'Verification Failed',
        message: result.message || 'Incorrect 6-digit code. Please verify the code in your email and try again.',
      });
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setLoading(true);
    const result = await authService.resendOtp(email);
    setLoading(false);

    if (result.success) {
      setResendCooldown(30);
      Alert.alert('Code Sent', result.message || 'A new 6-digit code has been sent to your email.');
    } else {
      setErrorModal({
        visible: true,
        title: 'Notice',
        message: result.message || 'Failed to resend code.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Icon Circle */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={38} color={THEME.colors.accentPrimary} />
            </View>
          </View>

          {/* Heading */}
          <View style={styles.textSection}>
            <Text style={styles.title}>Confirm Verification Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{' '}
              <Text style={styles.emailHighlight}>{email || 'your email'}</Text>. Enter it below to activate your account.
            </Text>
          </View>

          {/* OTP Input Card */}
          <View style={styles.card}>
            <Text style={styles.inputLabel}>6-DIGIT CODE</Text>
            <View style={styles.otpInputWrapper}>
              <TextInput
                style={styles.otpInput}
                placeholder="123456"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                value={otpCode}
                onChangeText={setOtpCode}
                autoFocus
              />
            </View>

            <Button
              title={loading ? 'Verifying...' : 'Confirm & Continue'}
              variant="primary"
              size="lg"
              onPress={handleVerify}
              disabled={loading || otpCode.trim().length !== 6}
              icon={
                loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                )
              }
              style={styles.verifyBtn}
            />

            {/* Resend Action */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {resendCooldown > 0 ? (
                <Text style={styles.cooldownText}>Resend in {resendCooldown}s</Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResend}
                  style={styles.resendTouchArea}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Custom Error Pop-up Modal */}
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
  container: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'space-between',
    paddingBottom: 32,
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
    marginTop: 20,
    marginBottom: 10,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 320,
  },
  emailHighlight: {
    color: THEME.colors.accentLavender,
    fontWeight: THEME.typography.weights.semibold,
  },
  card: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    gap: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.6,
  },
  otpInputWrapper: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.accentPrimary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: 28,
    fontWeight: THEME.typography.weights.heavy,
    letterSpacing: 10,
    color: THEME.colors.textPrimary,
    textAlign: 'center',
    width: '100%',
  },
  verifyBtn: {
    marginTop: 6,
    width: '100%',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
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
