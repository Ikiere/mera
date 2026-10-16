/**
 * MERA Recordings Library Screen
 * Redesigned to match Screen 15 of the official design reference.
 * Dark media library with filter pills (All / Videos), squircle recording cards,
 * playback modal, and floating action button.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { VideoCard } from '../../components/gallery/VideoCard';
import { VideoPlayerModal } from '../../components/gallery/VideoPlayerModal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  getAllRecordings,
  deleteRecording,
} from '../../services/database/recordingsRepo';
import { RecordingRecord } from '../../services/database/types';

export default function GalleryScreen() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<RecordingRecord | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'videos'>('all');

  const loadRecordings = useCallback(async () => {
    try {
      const recs = await getAllRecordings();
      setRecordings(recs);
    } catch (err) {
      console.error('Error loading recordings:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecordings();
    }, [loadRecordings])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecordings();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to permanently delete this video? The file will be removed from your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(id);
              loadRecordings();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete recording');
            }
          },
        },
      ]
    );
  };

  const handlePlay = (rec: RecordingRecord) => {
    setSelectedRecording(rec);
    setShowPlayerModal(true);
  };

  const filteredRecordings = useMemo(() => {
    return recordings;
  }, [recordings, activeTab]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        title="Recordings"
        subtitle={`${recordings.length} saved video${recordings.length === 1 ? '' : 's'}`}
      />

      {/* Filter Tabs matching Screen 15 */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'all' }}
        >
          <Text
            style={[
              styles.tabPillText,
              activeTab === 'all' && styles.tabPillTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('videos')}
          style={[styles.tabPill, activeTab === 'videos' && styles.tabPillActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'videos' }}
        >
          <Text
            style={[
              styles.tabPillText,
              activeTab === 'videos' && styles.tabPillTextActive,
            ]}
          >
            Videos
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredRecordings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.accentPrimary}
          />
        }
        renderItem={({ item }) => (
          <VideoCard
            recording={item}
            onPlay={() => handlePlay(item)}
            onDelete={() => handleDelete(item.id)}
            onExportSuccess={() => loadRecordings()}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No recordings yet"
            subtitle="Take your first video in the studio to start building your library."
            actionTitle="+ Start Recording"
            onAction={() => router.push('/(tabs)/studio')}
          />
        }
      />

      {/* Floating Action Button '+' matching Screen 15 */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/studio')}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Record new video"
      >
        <Ionicons name="videocam" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Video Player Modal */}
      <VideoPlayerModal
        visible={showPlayerModal}
        recording={selectedRecording}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedRecording(null);
        }}
        onDelete={(id) => {
          handleDelete(id);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: THEME.spacing.base,
    marginBottom: THEME.spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: THEME.radii.pill,
    backgroundColor: THEME.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  tabPillActive: {
    backgroundColor: THEME.colors.accentPrimary,
    borderColor: THEME.colors.accentPrimary,
  },
  tabPillText: {
    fontSize: THEME.typography.sizes.xs,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
  },
  tabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: THEME.typography.weights.bold,
  },
  listContent: {
    padding: THEME.spacing.base,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});
