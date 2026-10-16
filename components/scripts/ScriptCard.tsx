/**
 * MERA Script Card Component
 * Matches Screen 6 from official design reference.
 * Sleek, high-contrast dark card with title, read-time and date metadata, and direct actions.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { ScriptRecord } from '../../services/database/types';

interface ScriptCardProps {
  script: ScriptRecord;
  onPress: () => void;
  onRecord: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  onPress,
  onRecord,
  onDuplicate,
  onDelete,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      {/* Script Icon Squircle */}
      <View style={styles.iconSquircle}>
        <Ionicons name="document-text-outline" size={20} color={THEME.colors.accentLavender} />
      </View>

      {/* Title & Metadata */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {script.title || 'Untitled Script'}
        </Text>
        <Text style={styles.metadata}>
          {formatDuration(script.estimated_duration_sec)} • {formatDate(script.updated_at)}
        </Text>
      </View>

      {/* Quick Record Action */}
      <TouchableOpacity
        onPress={onRecord}
        style={styles.quickRecordBtn}
        accessibilityLabel="Record this script"
        activeOpacity={0.7}
      >
        <Ionicons name="videocam" size={16} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Chevron Right */}
      <Ionicons name="chevron-forward" size={16} color={THEME.colors.textMuted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    marginBottom: 10,
  },
  iconSquircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  metadata: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  quickRecordBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
});
