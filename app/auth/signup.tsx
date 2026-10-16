/**
 * MERA Authentication: Sign Up Screen
 * Features a top hero banner with real creators in studio setting up video camera,
 * blended into the obsidian form using a vector curved shape divider.
 * Leads directly to OTP Confirmation page.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Button } from '../../components/common/Button';
import { authService } from '../../services/supabase/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    const result = await authService.signUp(email, password, fullName);
    setLoading(false);

    if (result.success) {
      // Direct requirement: Navigate to OTP confirmation page after sign up
      router.push({
        pathname: '/auth/otp',
        params: { email: email.trim().toLowerCase(), fullName: fullName.trim() },
      });
    } else {
      Alert.alert('Sign Up Failed', result.message || 'Could not create account.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoid}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP HERO BANNER: Real people making videos */}
        <View style={styles.heroBannerContainer}>
          <Image
            source={require('../../assets/creator-camera.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Content creators filming in studio"
          />

          {/* Gradient overlay with top safe-area navigation */}
          <LinearGradient
            colors={['rgba(13, 11, 18, 0.75)', 'transparent', 'rgba(13, 11, 18, 0.4)']}
            style={styles.imageOverlay}
          >
            <SafeAreaView edges={['top']} style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
                accessibilityLabel="Back to Login"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color={THEME.colors.textPrimary} />
              </TouchableOpacity>

              <Image
                source={require('../../assets/MERA HOME.png')}
                style={styles.brandLogo}
                resizeMode="contain"
                accessibilityLabel="MERA"
              />
            </SafeAreaView>
          </LinearGradient>

          {/* VECTOR SHAPE DIVIDER: Blends bottom of image to the dark form */}
          <View style={styles.shapeDividerContainer}>
            <Svg
              width={SCREEN_WIDTH}
              height={55}
              viewBox="0 0 375 55"
              preserveAspectRatio="none"
              style={styles.shapeDividerSvg}
            >
              {/* Lavender accent ambient glow path */}
              <Path
                d="M0,15 C90,48 240,0 375,25 L375,55 L0,55 Z"
                fill="rgba(139, 92, 246, 0.35)"
              />
              {/* Solid dark obsidian background fill seamlessly matching form */}
              <Path
                d="M0,25 C110,55 260,10 375,35 L375,55 L0,55 Z"
                fill="#0D0B12"
              />
            </Svg>
          </View>
        </View>

        {/* MAIN FORM CONTAINER */}
        <View style={styles.formContainer}>
          {/* Header Title */}
          <View style={styles.headerTextGroup}>
            <Text style={styles.headingTitle}>Create Account</Text>
            <Text style={styles.headingSubtitle}>
              Join MERA to record talking-head videos with smart voice-tracking teleprompter.
            </Text>
          </View>

          {/* Input: Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={18}
                color={THEME.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Alex Morgan"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          {/* Input: Email */}
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
                placeholder="creator@domain.com"
                placeholderTextColor={THEME.colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Input: Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD (MIN 6 CHARS)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={THEME.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={THEME.colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={THEME.colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Input: Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={THEME.colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={THEME.colors.textMuted}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Action: Create Account */}
          <Button
            title={loading ? 'Creating Account...' : 'Continue to Verification'}
            variant="primary"
            size="lg"
            onPress={handleSignUp}
            disabled={loading}
            icon={
              loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              )
            }
            style={styles.submitBtn}
          />

          {/* Footer: Navigate to Login */}
          <View style={styles.footerGroup}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/login')}
              style={styles.signinTouchArea}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 16, left: 12, right: 12 }}
              accessibilityRole="button"
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 64,
  },
  heroBannerContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: '#17131F',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(13, 11, 18, 0.75)',
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: {
    width: 120,
    height: 38,
  },
  shapeDividerContainer: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    width: '100%',
    height: 55,
  },
  shapeDividerSvg: {
    width: '100%',
    height: 55,
  },
  formContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerTextGroup: {
    marginBottom: 24,
  },
  headingTitle: {
    fontSize: 28,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  headingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.colors.textSecondary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    width: '100%',
    height: 54,
    marginTop: 10,
    marginBottom: 24,
  },
  footerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 28,
  },
  signinTouchArea: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  footerText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.accentPrimary,
  },
});
