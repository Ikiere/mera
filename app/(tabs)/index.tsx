/**
 * MERA Home Dashboard Screen
 * Redesigned to match the official MERA Home design reference 100%.
 * - Header: MERA HOME 3D Brand Logo on left + VIP Crown button on right
 * - Hero Card: Start Recording with centered glowing violet record button
 * - Action Card: New Script (Write or paste your script) with chevron
 * - Section: Recent Recordings with squircle video thumbnails, duration & date
 * - Bottom Navigation: Home, Scripts, Recordings, Settings
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { OnboardingModal } from '../../components/common/OnboardingModal';
import { getAllScripts } from '../../services/database/scriptsRepo';
import { getAllRecordings } from '../../services/database/recordingsRepo';
import { getUserSettings, saveUserSetting } from '../../services/database/settingsRepo';
import { ScriptRecord, RecordingRecord } from '../../services/database/types';

export default function HomeScreen() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [latestScript, setLatestScript] = useState<ScriptRecord | null>(null);
  const [recentRecordings, setRecentRecordings] = useState<RecordingRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Compulsory authentication & onboarding check on launch
  useEffect(() => {
    async function checkAuthAndOnboarding() {
      try {
        const settings = await getUserSettings();
        if (!settings.currentUserEmail) {
          router.replace('/auth/login');
          return;
        }
        setAuthChecked(true);
        if (settings.hasCompletedOnboarding === false) {
          setShowOnboarding(true);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
        setAuthChecked(true);
      }
    }
    checkAuthAndOnboarding();
  }, [router]);

  const handleFinishOnboarding = async () => {
    setShowOnboarding(false);
    try {
      await saveUserSetting('hasCompletedOnboarding', true);
    } catch (err) {
      console.error('Error saving onboarding state:', err);
    }
  };

  const loadData = useCallback(async () => {
    try {
      const scripts = await getAllScripts();
      if (scripts.length > 0) {
        setLatestScript(scripts[0]);
      } else {
        setLatestScript(null);
      }

      const recs = await getAllRecordings();
      setRecentRecordings(recs.slice(0, 4));
    } catch (err) {
      console.error('Error loading home data:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function recheck() {
        try {
          const settings = await getUserSettings();
          if (!settings.currentUserEmail) {
            router.replace('/auth/login');
            return;
          }
          setAuthChecked(true);
          loadData();
        } catch (err) {
          console.error('Error rechecking auth:', err);
        }
      }
      recheck();
    }, [loadData, router])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diffHours = (now - timestamp) / (1000 * 60 * 60);
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    const d = new Date(timestamp);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${day}`;
  };

  const handleStartRecording = () => {
    if (latestScript) {
      router.push({
        pathname: '/(tabs)/studio',
        params: { scriptId: latestScript.id },
      });
    } else {
      router.push('/(tabs)/studio');
    }
  };

  if (!authChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.accentPrimary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 3-Page Onboarding Modal */}
      <OnboardingModal
        visible={showOnboarding}
        onFinish={handleFinishOnboarding}
      />

      {/* Brand Header matching 100% reference design */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/MERA HOME.png')}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="MERA"
        />

        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.crownBtn}
          accessibilityLabel="VIP Membership"
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="crown" size={19} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.accentPrimary}
          />
        }
      >
        {/* Primary Action Card: Start Recording (Matching 100% Reference) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleStartRecording}
          style={styles.heroCard}
        >
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Start Recording</Text>
            <Text style={styles.heroSubtitle}>Turn your script into a video</Text>
          </View>

          {/* Centered Glowing Violet Record Button */}
          <View style={styles.heroCenterAction}>
            <View style={styles.heroRecordCircle}>
              <Ionicons name="videocam" size={28} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Secondary Action Card: New Script (Matching 100% Reference) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/script/new')}
          style={styles.newScriptCard}
        >
          <View style={styles.newScriptTextContainer}>
            <Text style={styles.newScriptTitle}>New Script</Text>
            <Text style={styles.newScriptSubtitle}>Write or paste your script</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
        </TouchableOpacity>

        {/* Section Header: Recent Recordings (Matching 100% Reference) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Recordings</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/gallery')}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Recordings List */}
        {recentRecordings.length > 0 ? (
          <View style={styles.recordingsList}>
            {recentRecordings.map((rec) => (
              <TouchableOpacity
                key={rec.id}
                activeOpacity={0.75}
                onPress={() =>
                  router.push({
                    pathname: '/review',
                    params: { recordingId: rec.id },
                  })
                }
                style={styles.recordingCard}
              >
                {/* Squircle Thumbnail with Presenter Avatar */}
                <View style={styles.thumbnailSquircle}>
                  <Ionicons name="person" size={22} color={THEME.colors.accentLavender} />
                  <View style={styles.thumbnailPlayBadge}>
                    <Ionicons name="play" size={8} color="#FFFFFF" style={{ marginLeft: 1 }} />
                  </View>
                </View>

                {/* Recording Details */}
                <View style={styles.recordingDetails}>
                  <Text style={styles.recordingTitle} numberOfLines={1}>
                    {rec.title}
                  </Text>
                  <Text style={styles.recordingMeta}>
                    {formatDuration(rec.duration_sec)} • {formatDate(rec.created_at)}
                  </Text>
                </View>

                {/* Options Menu Trigger */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/review',
                      params: { recordingId: rec.id },
                    })
                  }
                  style={styles.moreBtn}
                  accessibilityLabel="Recording options"
                >
                  <Ionicons name="ellipsis-vertical" size={18} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyRecordingsCard}>
            <Ionicons name="videocam-outline" size={32} color={THEME.colors.textMuted} />
            <Text style={styles.emptyRecordingsTitle}>No recordings yet</Text>
            <Text style={styles.emptyRecordingsSubtitle}>
              Tap "Start Recording" above to record your first video with voice teleprompter.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 43, 64, 0.45)',
  },
  logoImage: {
    width: 150,
    height: 50,
  },
  crownBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 24,
    paddingTop: 22,
    paddingHorizontal: 22,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  heroTextContainer: {
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    letterSpacing: -0.1,
  },
  heroCenterAction: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 4,
  },
  heroRecordCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: THEME.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  newScriptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginBottom: 24,
  },
  newScriptTextContainer: {
    flex: 1,
  },
  newScriptTitle: {
    fontSize: 16,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 3,
  },
  newScriptSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.accentPrimary,
  },
  recordingsList: {
    gap: 10,
  },
  recordingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginBottom: 10,
  },
  thumbnailSquircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  thumbnailPlayBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.background,
  },
  recordingDetails: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 15,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  recordingMeta: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: THEME.typography.weights.regular,
  },
  moreBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRecordingsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.card,
    padding: 28,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    gap: 8,
  },
  emptyRecordingsTitle: {
    fontSize: 15,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    marginTop: 4,
  },
  emptyRecordingsSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
});
