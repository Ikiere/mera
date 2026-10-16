/**
 * MERA Recording Completion & Review Screen
 * Matches Screen 14 from official design reference.
 * - Video preview card with center play trigger
 * - Heading: "Recording Complete!"
 * - Subtitle: "Keep going, or switch to manual scrolling."
 * - Primary Action: "Save" (vibrant violet pill button)
 * - Secondary Action: "Preview"
 * - Title renaming, duration stats, and export to device gallery
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { exportVideoToGallery } from '../services/media/mediaLibraryService';
import { THEME } from '../constants/theme';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import {
  getRecordingById,
  updateRecordingTitle,
  deleteRecording,
} from '../services/database/recordingsRepo';
import { RecordingRecord } from '../services/database/types';

export default function RecordingReviewScreen() {
  const router = useRouter();
  const { recordingId, fileUri, fallbackTitle } = useLocalSearchParams<{
    recordingId?: string;
    fileUri?: string;
    fallbackTitle?: string;
  }>();

  const [recording, setRecording] = useState<RecordingRecord | null>(null);
  const [title, setTitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function load() {
      let rec: RecordingRecord | null = null;
      if (recordingId) {
        try {
          rec = await getRecordingById(recordingId);
        } catch (err) {
          console.error('Error loading recording review from database:', err);
        }
      }

      if (rec) {
        setRecording(rec);
        setTitle(rec.title);
      } else if (fileUri) {
        const fallbackRec: RecordingRecord = {
          id: recordingId || 'take_' + Date.now(),
          script_id: null,
          title: fallbackTitle || 'Recorded Take',
          file_uri: fileUri,
          thumbnail_uri: null,
          duration_sec: 1,
          file_size_bytes: 1024 * 500,
          preset_used: 'tiktok_reels',
          created_at: Date.now(),
        };
        setRecording(fallbackRec);
        setTitle(fallbackRec.title);
      }
    }
    load();
  }, [recordingId, fileUri, fallbackTitle]);

  const handleSaveTitle = async () => {
    if (!recording) return;
    try {
      await updateRecordingTitle(recording.id, title);
      Alert.alert('Saved', 'Recording title updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update title.');
    }
  };

  const handleExportToPhotos = async () => {
    if (!recording) return;

    setIsExporting(true);
    try {
      const result = await exportVideoToGallery(recording.file_uri);
      if (result.success) {
        Alert.alert('Video Saved', result.message);
      } else {
        Alert.alert('Notice', result.message);
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Could not export video.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (!recording) return;

    Alert.alert(
      'Discard Take',
      'Are you sure you want to delete this recorded take?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(recording.id);
              router.replace('/(tabs)/gallery');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete recording.');
            }
          },
        },
      ]
    );
  };

  const handleFinishSave = () => {
    router.replace('/(tabs)/gallery');
  };

  if (!recording) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack title="Loading Recording..." />
      </SafeAreaView>
    );
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        showBack
        title="Review Take"
        onBack={() => router.replace('/(tabs)/studio')}
        rightAction={
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteIconBtn}
            accessibilityLabel="Delete take"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={THEME.colors.error} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Video Thumbnail Preview Box with Center Play Trigger (Screen 14) */}
        <View style={styles.videoBox}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert('Playback', `Playing ${recording.title} (${formatDuration(recording.duration_sec)})`)}
            style={styles.playCenterButton}
          >
            <Ionicons name="play" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{formatDuration(recording.duration_sec)}</Text>
          </View>
        </View>

        {/* Completion Status Section (Screen 14) */}
        <View style={styles.statusSection}>
          <Text style={styles.completionHeading}>Recording Complete!</Text>
          <Text style={styles.completionSubtitle}>
            Keep going, or switch to manual scrolling.
          </Text>
        </View>

        {/* Action Buttons Row (Screen 14) */}
        <View style={styles.actionButtonsCol}>
          <Button
            title="Preview"
            variant="secondary"
            size="lg"
            onPress={() => Alert.alert('Preview', 'Showing take playback.')}
            style={styles.previewBtn}
          />
          <Button
            title="Save"
            variant="primary"
            size="lg"
            onPress={handleFinishSave}
            style={styles.saveBtn}
          />
        </View>

        {/* Editable Title Card */}
        <View style={styles.metaCard}>
          <Text style={styles.cardHeading}>Take Details</Text>

          <View style={styles.titleInputRow}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Recording Title"
              placeholderTextColor={THEME.colors.textMuted}
              style={styles.titleInput}
            />
            <TouchableOpacity onPress={handleSaveTitle} style={styles.saveTitleBtn}>
              <Text style={styles.saveTitleText}>Rename</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleExportToPhotos}
            disabled={isExporting}
            style={styles.exportRow}
            activeOpacity={0.75}
          >
            <View style={styles.exportLeft}>
              <Ionicons name="download-outline" size={20} color={THEME.colors.accentLavender} />
              <Text style={styles.exportText}>Export to Photos / Gallery</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  deleteIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: 32,
  },
  videoBox: {
    height: 280,
    borderRadius: 24,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  playCenterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  durationPill: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: 'rgba(13, 11, 18, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  durationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: THEME.typography.weights.semibold,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  completionHeading: {
    fontSize: 24,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  completionSubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  actionButtonsCol: {
    gap: 12,
    marginBottom: 24,
  },
  previewBtn: {
    width: '100%',
  },
  saveBtn: {
    width: '100%',
  },
  metaCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.card,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    padding: 18,
    gap: 14,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  titleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    paddingHorizontal: 14,
    height: 44,
  },
  titleInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontFamily: THEME.typography.fontFamilies.sans,
  },
  saveTitleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.pill,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
  },
  saveTitleText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.accentLavender,
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
  },
  exportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exportText: {
    fontSize: 14,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textPrimary,
  },
});
