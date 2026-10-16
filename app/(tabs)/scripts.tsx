/**
 * MERA Script Library Screen
 * Matches Screen 6 from official design reference.
 * - Header: "Scripts" title with search and actions
 * - Search bar: "Search scripts..."
 * - Category filter chips: All, My Scripts, Shared
 * - High-contrast script cards with duration and date
 * - Floating Action Button (+) to create new script
 * - Full SQLite search, duplication, and deletion support preserved
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { ScriptCard } from '../../components/scripts/ScriptCard';
import { EmptyState } from '../../components/common/EmptyState';
import {
  getAllScripts,
  deleteScript,
  duplicateScript,
  searchScripts,
} from '../../services/database/scriptsRepo';
import { ScriptRecord } from '../../services/database/types';

type ScriptFilter = 'all' | 'my' | 'shared';

export default function ScriptsScreen() {
  const router = useRouter();

  const [scripts, setScripts] = useState<ScriptRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ScriptFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadScripts = useCallback(async (query = '') => {
    try {
      if (query.trim()) {
        const results = await searchScripts(query);
        setScripts(results);
      } else {
        const all = await getAllScripts();
        setScripts(all);
      }
    } catch (err) {
      console.error('Error loading scripts:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadScripts(searchQuery);
    }, [loadScripts, searchQuery])
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    loadScripts(text);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateScript(id);
      loadScripts(searchQuery);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to duplicate script');
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Script',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteScript(id);
              loadScripts(searchQuery);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete script');
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScripts(searchQuery);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        title="Scripts"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/script/new')}
            style={styles.headerAddBtn}
            accessibilityLabel="Create Script"
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      {/* Search Bar matching Reference Screen 6 */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color={THEME.colors.textMuted} />
          <TextInput
            placeholder="Search scripts..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Ionicons name="close-circle" size={16} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Filter Chips matching Reference */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setActiveFilter('all')}
            style={[
              styles.filterChip,
              activeFilter === 'all' && styles.filterChipActive,
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'all' && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('my')}
            style={[
              styles.filterChip,
              activeFilter === 'my' && styles.filterChipActive,
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'my' && styles.filterTextActive,
              ]}
            >
              My Scripts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('shared')}
            style={[
              styles.filterChip,
              activeFilter === 'shared' && styles.filterChipActive,
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'shared' && styles.filterTextActive,
              ]}
            >
              Shared
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Script List or Empty State */}
      <FlatList
        data={scripts}
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
          <ScriptCard
            script={item}
            onPress={() => router.push(`/script/${item.id}` as any)}
            onRecord={() =>
              router.push({
                pathname: '/(tabs)/studio',
                params: { scriptId: item.id },
              })
            }
            onDuplicate={() => handleDuplicate(item.id)}
            onDelete={() => handleDelete(item.id, item.title)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={searchQuery ? 'No matching scripts' : 'No scripts yet'}
            subtitle={
              searchQuery
                ? `No scripts found for "${searchQuery}". Try a different keyword.`
                : 'Create your first script to get started.'
            }
            actionTitle="+ Create Script"
            onAction={() => router.push('/script/new')}
          />
        }
      />

      {/* Floating Action Button (+) matching Screen 6 */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/script/new')}
        style={styles.fab}
        accessibilityLabel="Create Script"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  headerAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.md,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.radii.pill,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontFamily: THEME.typography.fontFamilies.sans,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: THEME.radii.pill,
    backgroundColor: THEME.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.accentPrimary,
    borderColor: THEME.colors.accentPrimary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.medium,
    color: THEME.colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: THEME.typography.weights.bold,
  },
  listContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.xs,
    paddingBottom: 90,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});
