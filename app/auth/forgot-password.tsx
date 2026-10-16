/**
 * MERA Authentication: Forgot Password Screen
 * Initiates Supabase password recovery workflow.
 */

import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { ErrorModal } from '../../components/common/ErrorModal';
import { authService } from '../../services/supabase/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleReset = async () => {
    if (!email.trim()) {
      setErrorModal({
        visible: true,
        title: 'Required Field',
        message: 'Please enter your account email address.',
      });
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(email.trim());
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorModal({
        visible: true,
        title: 'Reset Request Failed',
        message: result.message || 'Could not send reset instructions.',
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
              accessibilityLabel="Back to Login"
            >
              <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Icon Circle */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={38} color={THEME.colors.accentPrimary} />
            </View>
          </View>

          {/* Heading */}
          <View style={styles.textSection}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          {/* Form / Success Card */}
          <View style={styles.card}>
            {submitted ? (
              <View style={styles.successState}>
                <Ionicons name="checkmark-circle" size={44} color={THEME.colors.success} />
                <Text style={styles.successTitle}>Instructions Sent</Text>
                <Text style={styles.successDesc}>
                  We have dispatched password reset instructions to{' '}
                  <Text style={styles.emailHighlight}>{email}</Text>. Please check your inbox.
                </Text>
                <Button
                  title="Back to Sign In"
                  variant="primary"
                  size="md"
                  onPress={() => router.replace('/auth/login')}
                  style={{ width: '100%', marginTop: 12 }}
                />
              </View>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={THEME.colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="you@domain.com"
                      placeholderTextColor={THEME.colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      autoFocus
                    />
                  </View>
                </View>

                <Button
                  title={loading ? 'Sending...' : 'Send Reset Instructions'}
                  variant="primary"
                  size="lg"
                  onPress={handleReset}
                  disabled={loading}
                  icon={
                    loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                    )
                  }
                  style={styles.submitBtn}
                />
              </>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backLink}>Remember your password? Sign In</Text>
            </TouchableOpacity>
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
    paddingBottom: 28,
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
    fontSize: 26,
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
  card: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.radii.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: THEME.colors.textPrimary,
    fontSize: 15,
  },
  submitBtn: {
    marginTop: 6,
    width: '100%',
  },
  successState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginTop: 6,
  },
  successDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emailHighlight: {
    color: THEME.colors.accentLavender,
    fontWeight: THEME.typography.weights.semibold,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backLink: {
    fontSize: 14,
    color: THEME.colors.accentLavender,
    fontWeight: THEME.typography.weights.medium,
  },
});
