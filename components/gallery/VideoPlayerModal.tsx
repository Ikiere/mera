/**
 * MERA Video Player & Review Modal
 * Provides playback, file information, and export options.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { exportVideoToGallery } from '../../services/media/mediaLibraryService';
import { THEME } from '../../constants/theme';
import { RecordingRecord } from '../../services/database/types';
import { Button } from '../common/Button';

interface VideoPlayerModalProps {
  visible: boolean;
  recording: RecordingRecord | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  recording,
  onClose,
  onDelete,
}) => {
  if (!recording) return null;

  const handleExport = async () => {
    try {
      const result = await exportVideoToGallery(recording.file_uri);
      if (result.success) {
        Alert.alert('Video Export', result.message);
      } else {
        Alert.alert('Notice', result.message);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to export video.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to permanently delete this video recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(recording.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {recording.title}
              </Text>
              <Text style={styles.modalSubtitle}>
                {recording.preset_used.replace('_', ' ')} • {Math.round(recording.duration_sec)}s
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Video Placeholder Screen Area */}
          <View style={styles.videoPlayerArea}>
            <View style={styles.playCenter}>
              <Ionicons name="play-circle" size={64} color={THEME.colors.accentBright} />
              <Text style={styles.playbackNotice}>Local Recording Preview</Text>
              <Text style={styles.fileUriText} numberOfLines={2}>
                {recording.file_uri}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Button
              title="Save to Photos"
              variant="primary"
              icon={<Ionicons name="download-outline" size={18} color="#FFFFFF" />}
              onPress={handleExport}
              style={{ flex: 1 }}
            />
            <Button
              title="Delete"
              variant="danger"
              icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
              onPress={handleDelete}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: THEME.spacing.base,
  },
  modalCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.xl,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  modalTitle: {
    fontSize: THEME.typography.sizes.lg,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.accentBright,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  closeBtn: {
    padding: 6,
    borderRadius: THEME.radii.sm,
    backgroundColor: THEME.colors.surfaceSecondary,
  },
  videoPlayerArea: {
    height: 240,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.base,
  },
  playCenter: {
    alignItems: 'center',
  },
  playbackNotice: {
    fontSize: THEME.typography.sizes.sm,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
    marginTop: 8,
  },
  fileUriText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: THEME.spacing.base,
    gap: 12,
  },
});
