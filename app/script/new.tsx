/**
 * MERA New Script Screen
 * Matches Screen 7 from official design reference.
 * Create a fresh talking-head video script with instant duration and word count feedback,
 * formatting controls, and direct "Start Recording" flow.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { createScript } from '../../services/database/scriptsRepo';
import { tokenizeScript } from '../../lib/engine/tokenizer';

export default function NewScriptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 16;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [fontSizeSetting, setFontSizeSetting] = useState<'sm' | 'md' | 'lg'>('md');
  const [lineSpacingSetting, setLineSpacingSetting] = useState<number>(1.5);
  const [readingPosition, setReadingPosition] = useState<'top' | 'middle' | 'bottom'>('top');

  const tokenized = tokenizeScript(content, 140);

  const handleSave = async (openInStudio = false) => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Empty Script', 'Please provide a title or script text to save.');
      return;
    }

    setSaving(true);
    try {
      const record = await createScript(title || 'Untitled Script', content);
      if (openInStudio) {
        router.replace({
          pathname: '/(tabs)/studio',
          params: { scriptId: record.id },
        });
      } else {
        router.replace(`/script/${record.id}` as any);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save script.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        showBack
        title="New Script"
        rightAction={
          <TouchableOpacity
            onPress={() => handleSave(false)}
            style={styles.saveIconBtn}
            accessibilityLabel="Save script"
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={20} color={THEME.colors.accentLavender} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          {/* Script Title Input */}
          <TextInput
            placeholder="Script Title (e.g., Product Update)"
            placeholderTextColor={THEME.colors.textMuted}
            value={title}
            onChangeText={setTitle}
            style={styles.titleInput}
          />

          {/* Stats Row */}
          <View style={styles.metaRow}>
            <Text style={styles.autosaveText}>New draft</Text>
            <Text style={styles.wordCountText}>{tokenized.totalWords} words</Text>
          </View>

          {/* Editor Body Card */}
          <View style={styles.editorCard}>
            <TextInput
              placeholder="Start writing or paste your talking-head script here..."
              placeholderTextColor={THEME.colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              style={[
                styles.contentInput,
                {
                  fontSize: fontSizeSetting === 'sm' ? 15 : fontSizeSetting === 'lg' ? 21 : 17,
                  lineHeight:
                    (fontSizeSetting === 'sm' ? 15 : fontSizeSetting === 'lg' ? 21 : 17) *
                    lineSpacingSetting,
                },
              ]}
            />
          </View>
        </ScrollView>

        {/* Bottom Toolbar & Action (Screen 7) */}
        <View
          style={[
            styles.bottomToolbar,
            {
              paddingTop: 16,
              paddingBottom: 16 + bottomInset,
            },
          ]}
        >
          <View style={styles.controlsRow}>
            {/* Text Size */}
            <View style={styles.toolbarGroup}>
              <Text style={styles.toolbarLabel}>Text Size</Text>
              <View style={styles.segmentGroup}>
                <TouchableOpacity
                  onPress={() => setFontSizeSetting('sm')}
                  style={[styles.segmentBtn, fontSizeSetting === 'sm' && styles.segmentActive]}
                >
                  <Text style={[styles.segmentTextSm, fontSizeSetting === 'sm' && styles.segmentTextActive]}>
                    A
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFontSizeSetting('lg')}
                  style={[styles.segmentBtn, fontSizeSetting === 'lg' && styles.segmentActive]}
                >
                  <Text style={[styles.segmentTextLg, fontSizeSetting === 'lg' && styles.segmentTextActive]}>
                    A
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Line Spacing */}
            <View style={styles.toolbarGroup}>
              <Text style={styles.toolbarLabel}>Line Spacing</Text>
              <View style={styles.segmentGroup}>
                <TouchableOpacity
                  onPress={() => setLineSpacingSetting(1.3)}
                  style={[styles.segmentBtn, lineSpacingSetting === 1.3 && styles.segmentActive]}
                >
                  <Ionicons name="reorder-two" size={14} color={lineSpacingSetting === 1.3 ? '#FFF' : THEME.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setLineSpacingSetting(1.6)}
                  style={[styles.segmentBtn, lineSpacingSetting === 1.6 && styles.segmentActive]}
                >
                  <Ionicons name="reorder-four" size={14} color={lineSpacingSetting === 1.6 ? '#FFF' : THEME.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Reading Position */}
            <View style={styles.toolbarGroup}>
              <Text style={styles.toolbarLabel}>Reading Position</Text>
              <View style={styles.segmentGroup}>
                <TouchableOpacity
                  onPress={() => setReadingPosition('top')}
                  style={[styles.segmentBtn, readingPosition === 'top' && styles.segmentActive]}
                >
                  <Ionicons name="chevron-up" size={13} color={readingPosition === 'top' ? '#FFF' : THEME.colors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setReadingPosition('middle')}
                  style={[styles.segmentBtn, readingPosition === 'middle' && styles.segmentActive]}
                >
                  <Ionicons name="reorder-two-outline" size={13} color={readingPosition === 'middle' ? '#FFF' : THEME.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Button
            title="Start Recording"
            variant="primary"
            size="lg"
            onPress={() => handleSave(true)}
            style={styles.startRecordBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  saveIconBtn: {
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
    paddingBottom: 20,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: THEME.typography.weights.heavy,
    color: THEME.colors.textPrimary,
    fontFamily: THEME.typography.fontFamilies.sans,
    paddingVertical: 4,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  autosaveText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  wordCountText: {
    fontSize: 12,
    color: THEME.colors.accentLavender,
    fontWeight: THEME.typography.weights.semibold,
  },
  editorCard: {
    minHeight: 260,
    backgroundColor: THEME.colors.surfaceElevated,
    borderRadius: THEME.radii.card,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  contentInput: {
    color: THEME.colors.textPrimary,
    fontFamily: THEME.typography.fontFamilies.sans,
    minHeight: 240,
  },
  bottomToolbar: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
    paddingHorizontal: THEME.spacing.lg,
    gap: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarGroup: {
    alignItems: 'flex-start',
    gap: 4,
  },
  toolbarLabel: {
    fontSize: 10,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.2,
  },
  segmentGroup: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceSecondary,
    borderRadius: THEME.radii.pill,
    padding: 2,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: THEME.colors.accentPrimary,
  },
  segmentTextSm: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
  },
  segmentTextLg: {
    fontSize: 15,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  startRecordBtn: {
    width: '100%',
  },
});
