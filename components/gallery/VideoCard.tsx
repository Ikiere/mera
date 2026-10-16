/**
 * MERA Video Card Component
 * Redesigned to match Screen 15 of the official design reference.
 * Compact squircle card with duration/date metadata, play trigger, and action menu.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { exportVideoToGallery } from '../../services/media/mediaLibraryService';
import { THEME } from '../../constants/theme';
import { RecordingRecord } from '../../services/database/types';

interface VideoCardProps {
  recording: RecordingRecord;
  onPlay: () => void;
  onDelete: () => void;
  onExportSuccess?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  recording,
  onPlay,
  onDelete,
  onExportSuccess,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]}`;
  };

  const handleExport = async () => {
    setMenuVisible(false);
    try {
      const result = await exportVideoToGallery(recording.file_uri);
      if (result.success) {
        Alert.alert('Video Exported', result.message);
        onExportSuccess?.();
      } else {
        Alert.alert('Notice', result.message);
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Could not save video.');
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete();
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPlay}
        style={styles.cardContainer}
        accessibilityRole="button"
        accessibilityLabel={`Recording ${recording.title}, duration ${formatDuration(recording.duration_sec)}`}
      >
        {/* Left Squircle Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <View style={styles.playIconCircle}>
            <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        </View>

        {/* Middle Info Column */}
        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={1}>
            {recording.title}
          </Text>
          <Text style={styles.metaText}>
            {formatDuration(recording.duration_sec)} • {formatDate(recording.created_at)}
          </Text>
        </View>

        {/* Right Menu Trigger */}
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => setMenuVisible(true)}
          style={styles.menuBtn}
          accessibilityLabel="Recording options"
        >
          <Ionicons name="ellipsis-vertical" size={18} color={THEME.colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Action Sheet Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuSheet}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle} numberOfLines={1}>
                {recording.title}
              </Text>
              <Text style={styles.menuSubtitle}>
                {formatDuration(recording.duration_sec)} • {formatDate(recording.created_at)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onPlay();
              }}
            >
              <Ionicons name="play-circle-outline" size={20} color={THEME.colors.textPrimary} />
              <Text style={styles.menuItemText}>Play Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleExport}>
              <Ionicons name="download-outline" size={20} color={THEME.colors.accentBright} />
              <Text style={[styles.menuItemText, { color: THEME.colors.accentBright }]}>
                Save to Photos
              </Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={THEME.colors.error} />
              <Text style={[styles.menuItemText, { color: THEME.colors.error }]}>
                Delete Recording
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.lg,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  thumbnailContainer: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: THEME.colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginRight: 14,
  },
  playIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  metaText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    fontWeight: THEME.typography.weights.regular,
  },
  menuBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    padding: THEME.spacing.base,
    paddingBottom: 34,
  },
  menuSheet: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.xl,
    padding: THEME.spacing.base,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  menuHeader: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  menuTitle: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: THEME.colors.borderSubtle,
    marginVertical: 4,
  },
});
