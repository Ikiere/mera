/**
 * MERA Authentication: Login Screen
 * Features a top hero banner with real creators making video,
 * blended into the obsidian form using a vector curved shape divider.
 * Authentication is compulsory to use the app.
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

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    const result = await authService.signIn(email, password);
    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Sign In Failed', result.message || 'Check your email and password.');
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
            source={require('../../assets/creator-studio.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Content creators producing video"
          />

          {/* Subtle gradient overlay to provide contrast for top badge */}
          <LinearGradient
            colors={['rgba(13, 11, 18, 0.7)', 'transparent', 'rgba(13, 11, 18, 0.4)']}
            style={styles.imageOverlay}
          >
            <SafeAreaView edges={['top']} style={styles.topBar}>
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
            <Text style={styles.headingTitle}>Welcome Back</Text>
            <Text style={styles.headingSubtitle}>
              Sign in to your account to record and manage your talking-head videos.
            </Text>
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
            <Text style={styles.inputLabel}>PASSWORD</Text>
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

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
            style={styles.forgotBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Compulsory Sign In Action */}
          <Button
            title={loading ? 'Signing In...' : 'Sign In'}
            variant="primary"
            size="lg"
            onPress={handleSignIn}
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

          {/* Footer: Navigate to Sign Up */}
          <View style={styles.footerGroup}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/signup')}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLink}>Sign Up</Text>
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
    paddingBottom: 36,
  },
  heroBannerContainer: {
    width: '100%',
    height: 250,
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
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  brandLogo: {
    width: 140,
    height: 44,
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
    marginBottom: 26,
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
    marginBottom: 18,
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 26,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.accentLavender,
  },
  submitBtn: {
    width: '100%',
    height: 54,
    marginBottom: 24,
  },
  footerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.accentPrimary,
  },
});
