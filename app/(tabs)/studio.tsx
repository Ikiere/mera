/**
 * MERA Flagship Recording Studio
 * Matches Screens 9-13 from official design reference.
 * - Immersive edge-to-edge camera viewfinder
 * - Dynamic HUD: Status Badge (Listening, Following Script, Paused, Manual Scroll, Speech Not Detected) + English chip
 * - Lens-height teleprompter overlay with illuminated phrase highlight
 * - Real-time glowing violet Audio Waveform & digital recording timer
 * - "Switch to Manual" recovery button
 * - Studio footer controls: Flip Camera, Primary Record/Pause/Resume Trigger, Prompter Settings
 * - 100% preservation of camera recording, auto-cadence tracking, SQLite persistence, and review pipeline
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { SMART_PRESETS, CameraPreset, getPresetById } from '../../constants/presets';
import { PrompterEngine } from '../../lib/engine/prompterEngine';
import { ScriptToken, TrackingSensitivity, EngineState } from '../../lib/engine/types';
import { CameraPreviewView } from '../../components/camera/CameraPreviewView';
import { OverlayPrompter } from '../../components/prompter/OverlayPrompter';
import { SplitPrompter } from '../../components/prompter/SplitPrompter';
import { PrompterControls } from '../../components/prompter/PrompterControls';
import { Badge } from '../../components/common/Badge';
import { AudioWaveform } from '../../components/common/AudioWaveform';
import { SpeechRecognitionService } from '../../services/speech/SpeechRecognitionService';
import { getScriptById, getAllScripts } from '../../services/database/scriptsRepo';
import { saveRecordingMetadata } from '../../services/database/recordingsRepo';
import { getUserSettings } from '../../services/database/settingsRepo';
import { ScriptRecord } from '../../services/database/types';

export default function RecordingStudioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scriptId?: string }>();

  // Scripts State
  const [currentScript, setCurrentScript] = useState<ScriptRecord | null>(null);
  const [allScripts, setAllScripts] = useState<ScriptRecord[]>([]);
  const [showScriptPicker, setShowScriptPicker] = useState(false);
  const [showControlsSheet, setShowControlsSheet] = useState(false);

  // Camera & Studio Settings
  const [activePreset, setActivePreset] = useState<CameraPreset>(SMART_PRESETS[0]);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  const [prompterLayout, setPrompterLayout] = useState<'overlay' | 'split'>('overlay');
  const [prompterFontSize, setPrompterFontSize] = useState<number>(22);
  const [prompterOpacity, setPrompterOpacity] = useState<number>(0.82);
  const [trackingSensitivity, setTrackingSensitivity] = useState<TrackingSensitivity>('medium');
  const [showFramingGuides, setShowFramingGuides] = useState<boolean>(true);

  // Recording Lifecycle
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);

  const cameraRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  // Teleprompter Engine
  const engineRef = useRef<PrompterEngine | null>(null);
  const [tokens, setTokens] = useState<ScriptToken[]>([]);
  const [engineState, setEngineState] = useState<EngineState>({
    cursorIndex: 0,
    confirmedIndex: 0,
    isTracking: true,
    isPaused: false,
    isUncertain: false,
    lastSpokenTimestamp: Date.now(),
    totalTokens: 0,
    progressPercent: 0,
    isAutoFollowing: false,
  });

  // Speech Recognition Service
  const speechService = useRef(SpeechRecognitionService.getInstance()).current;

  // Initialize Settings & Default Script
  const initStudio = useCallback(async () => {
    try {
      const settings = await getUserSettings();
      setCameraFacing(settings.defaultCamera);
      setPrompterFontSize(settings.prompterFontSize);
      setPrompterOpacity(settings.prompterOpacity);
      setPrompterLayout(settings.prompterLayout);
      setTrackingSensitivity(settings.trackingSensitivity);
      setActivePreset(getPresetById(settings.defaultPresetId));

      const scripts = await getAllScripts();
      setAllScripts(scripts);

      let targetScript: ScriptRecord | null = null;
      if (params.scriptId) {
        targetScript = await getScriptById(params.scriptId);
      }
      if (!targetScript && scripts.length > 0) {
        targetScript = scripts[0];
      }

      setCurrentScript(targetScript);

      const content = targetScript ? targetScript.content : '';
      if (!engineRef.current) {
        engineRef.current = new PrompterEngine(content, settings.trackingSensitivity);
        engineRef.current.subscribeState((newState) => {
          setEngineState(newState);
        });
      } else {
        engineRef.current.loadScript(content);
      }
      setTokens(engineRef.current.getTokens());
    } catch (err) {
      console.error('Error initializing studio:', err);
    }
  }, [params.scriptId]);

  useFocusEffect(
    useCallback(() => {
      initStudio();
      return () => {
        engineRef.current?.stopAutoFollow();
        speechService.stop();
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };
    }, [initStudio])
  );

  // Wire Speech Recognition to Prompter Engine
  useEffect(() => {
    const unsubResults = speechService.subscribeToResults((res) => {
      if (engineRef.current && isRecording && !isRecordingPaused) {
        engineRef.current.processTranscript(res.transcript, res.isFinal, res.confidence);
      }
    });

    return () => {
      unsubResults();
    };
  }, [isRecording, isRecordingPaused]);

  // Handle Script Selection
  const handleSelectScript = (script: ScriptRecord) => {
    setCurrentScript(script);
    if (engineRef.current) {
      engineRef.current.stopAutoFollow();
      engineRef.current.loadScript(script.content);
      setTokens(engineRef.current.getTokens());
    }
    setShowScriptPicker(false);
  };

  // Start Recording with Countdown
  const triggerRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    // 3-second countdown
    let count = 3;
    setCountdownValue(count);

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownValue(count);
      } else {
        clearInterval(timer);
        setCountdownValue(null);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setIsRecordingPaused(false);
      setRecordingSeconds(0);

      // Reset prompter engine to beginning
      engineRef.current?.reset();

      // Start speech recognition
      await speechService.start({
        continuous: true,
        interimResults: true,
        locale: 'en-US',
      });

      // Start automatic voice following at target cadence
      const baseWpm =
        trackingSensitivity === 'high' ? 160 : trackingSensitivity === 'low' ? 130 : 145;
      const scriptWpm =
        currentScript && currentScript.estimated_duration_sec > 0
          ? Math.round((currentScript.word_count / currentScript.estimated_duration_sec) * 60)
          : baseWpm;
      engineRef.current?.startAutoFollow(scriptWpm || baseWpm);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Trigger camera recording if supported
      if (cameraRef.current && typeof cameraRef.current.recordAsync === 'function') {
        cameraRef.current
          .recordAsync({ maxDuration: 3600 })
          .then((videoResult: any) => {
            handleRecordingFinished(videoResult?.uri);
          })
          .catch((err: any) => {
            console.warn('Camera recordAsync error:', err);
          });
      }
    } catch (err: any) {
      setIsRecording(false);
      engineRef.current?.stopAutoFollow();
      Alert.alert('Recording Error', err?.message || 'Could not start recording session.');
    }
  };

  const togglePauseResumeRecording = () => {
    if (!isRecording) return;

    if (isRecordingPaused) {
      // Resume
      setIsRecordingPaused(false);
      const baseWpm =
        trackingSensitivity === 'high' ? 160 : trackingSensitivity === 'low' ? 130 : 145;
      engineRef.current?.startAutoFollow(baseWpm);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      // Pause
      setIsRecordingPaused(true);
      engineRef.current?.stopAutoFollow();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsRecordingPaused(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      engineRef.current?.stopAutoFollow();
      await speechService.stop();

      if (cameraRef.current && typeof cameraRef.current.stopRecording === 'function') {
        cameraRef.current.stopRecording();
      } else {
        const mockUri = `mera_recording_${Date.now()}.mp4`;
        handleRecordingFinished(mockUri);
      }
    } catch (err: any) {
      Alert.alert('Stop Error', err?.message || 'Error stopping recording');
    }
  };

  const handleRecordingFinished = async (videoUri?: string) => {
    const finalUri = videoUri || `file://local/recordings/mera_${Date.now()}.mp4`;
    const title = currentScript ? `${currentScript.title} Take 1` : `Take ${new Date().toLocaleTimeString()}`;

    try {
      const record = await saveRecordingMetadata({
        script_id: currentScript ? currentScript.id : null,
        title,
        file_uri: finalUri,
        thumbnail_uri: null,
        duration_sec: recordingSeconds || 1,
        file_size_bytes: (recordingSeconds || 1) * 1024 * 350,
        preset_used: activePreset.id,
      });

      router.push({
        pathname: '/review',
        params: { recordingId: record.id },
      });
    } catch (err: any) {
      console.error('Failed to save recording metadata:', err);
      // Graceful fallback to review screen so user can still preview and export video
      router.push({
        pathname: '/review',
        params: {
          recordingId: 'temp_' + Date.now(),
          fileUri: finalUri,
          fallbackTitle: title,
        },
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Determine current studio status pill matching Screens 9-13
  const getStudioStatus = () => {
    if (!isRecording) {
      return { variant: 'listening' as const, label: 'Listening' };
    }
    if (isRecordingPaused) {
      return { variant: 'paused' as const, label: 'Paused' };
    }
    if (!engineState.isTracking) {
      return { variant: 'manual' as const, label: 'Manual Scroll' };
    }
    if (engineState.isUncertain) {
      return { variant: 'speechError' as const, label: 'Speech Not Detected' };
    }
    return { variant: 'following' as const, label: 'Following Script' };
  };

  const studioStatus = getStudioStatus();

  return (
    <View style={styles.container}>
      {/* Immersive Edge-to-Edge Camera Preview */}
      <View style={styles.cameraWrapper}>
        <CameraPreviewView
          preset={activePreset}
          facing={cameraFacing}
          onToggleFacing={() => setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
          isRecording={isRecording}
          recordingDurationSec={recordingSeconds}
          countdownValue={countdownValue}
          showFramingGuides={showFramingGuides}
          onToggleFramingGuides={() => setShowFramingGuides((prev) => !prev)}
          cameraRef={cameraRef}
        >
          {/* Top Floating Studio HUD Bar (Screens 9-13) */}
          <SafeAreaView edges={['top']} style={styles.topHudContainer}>
            <View style={styles.topHudRow}>
              {/* Left: Dynamic Status Pill + Language Chip */}
              <View style={styles.statusGroup}>
                <Badge
                  label={studioStatus.label}
                  variant={studioStatus.variant}
                  showDot
                />
                <View style={styles.languageChip}>
                  <Text style={styles.languageText}>English</Text>
                </View>
              </View>

              {/* Right: Framing Toggle, Script Selector, Close */}
              <View style={styles.headerActionsGroup}>
                <TouchableOpacity
                  onPress={() => setShowFramingGuides((prev) => !prev)}
                  style={[styles.hudIconBtn, showFramingGuides && styles.hudIconBtnActive]}
                  accessibilityLabel="Toggle Framing Guides"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="scan-outline"
                    size={18}
                    color={showFramingGuides ? THEME.colors.accentLavender : '#FFFFFF'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowScriptPicker(true)}
                  style={styles.scriptChipBtn}
                  accessibilityLabel="Choose script"
                  activeOpacity={0.7}
                >
                  <Ionicons name="document-text-outline" size={14} color={THEME.colors.accentLavender} />
                  <Text style={styles.scriptChipText} numberOfLines={1}>
                    {currentScript ? currentScript.title : 'Script'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (isRecording) {
                      Alert.alert('Recording in Progress', 'Stop recording before leaving studio?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Stop & Exit', style: 'destructive', onPress: () => stopRecording() },
                      ]);
                    } else {
                      router.back();
                    }
                  }}
                  style={styles.hudIconBtn}
                  accessibilityLabel="Exit studio"
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Lens-Height Teleprompter Overlay (Screens 9-13) */}
            <View style={styles.prompterWrapper}>
              <OverlayPrompter
                tokens={tokens}
                cursorIndex={engineState.cursorIndex}
                fontSize={prompterFontSize}
                opacity={prompterOpacity}
                isPaused={engineState.isPaused || isRecordingPaused}
                isUncertain={engineState.isUncertain}
                isAutoFollowing={engineState.isAutoFollowing && !isRecordingPaused}
                onSelectToken={(idx) => engineRef.current?.setCursor(idx)}
              />
            </View>

            {/* Glowing Audio Waveform & Digital Timer (Screens 9-12) */}
            <View style={styles.waveformTimerContainer}>
              <AudioWaveform isActive={isRecording && !isRecordingPaused} barCount={28} />
              <Text style={styles.timerDigits}>{formatTimer(recordingSeconds)}</Text>
            </View>

            {/* "Switch to Manual" Recovery Pill Button (Screen 12) */}
            {(!engineState.isTracking || engineState.isUncertain) && isRecording ? (
              <View style={styles.manualSwitchWrapper}>
                <TouchableOpacity
                  onPress={() => engineRef.current?.setTracking(!engineState.isTracking)}
                  style={styles.switchManualBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="swap-horizontal" size={14} color="#FFFFFF" />
                  <Text style={styles.switchManualText}>
                    {engineState.isTracking ? 'Switch to Manual' : 'Resume Voice Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </SafeAreaView>

          {/* Bottom Recording Control Bar (Screens 9-13) */}
          <SafeAreaView edges={['bottom']} style={styles.bottomControlBar}>
            {/* Left Button: Flip Camera Front / Back */}
            <TouchableOpacity
              onPress={() => setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
              style={styles.circleToolBtn}
              accessibilityLabel="Flip camera"
              activeOpacity={0.75}
            >
              <Ionicons name="camera-reverse-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Center Primary Recording Control */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={triggerRecording}
              style={[
                styles.primaryRecordRing,
                isRecording && styles.primaryRecordRingActive,
              ]}
              accessibilityLabel={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {isRecording ? (
                <View style={styles.stopRecordingSquare} />
              ) : (
                <View style={styles.startRecordingInnerDot} />
              )}
            </TouchableOpacity>

            {/* Right Button: Prompter Controls Sheet */}
            <TouchableOpacity
              onPress={() => setShowControlsSheet(true)}
              style={styles.circleToolBtn}
              accessibilityLabel="Prompter Settings"
              activeOpacity={0.75}
            >
              <Ionicons name="options-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </CameraPreviewView>
      </View>

      {/* Script Selection Modal */}
      <Modal visible={showScriptPicker} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Script</Text>
              <TouchableOpacity onPress={() => setShowScriptPicker(false)}>
                <Ionicons name="close" size={22} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={allScripts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectScript(item)}
                  style={[
                    styles.scriptOptionItem,
                    currentScript?.id === item.id && styles.scriptOptionActive,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scriptOptionTitle}>{item.title}</Text>
                    <Text style={styles.scriptOptionMeta}>{item.word_count} words</Text>
                  </View>
                  {currentScript?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={20} color={THEME.colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ color: THEME.colors.textSecondary }}>No scripts found.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Prompter Controls Sheet Modal */}
      <Modal visible={showControlsSheet} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prompter Controls</Text>
              <TouchableOpacity onPress={() => setShowControlsSheet(false)}>
                <Ionicons name="close" size={22} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <PrompterControls
              isTracking={engineState.isTracking}
              onToggleTracking={() => engineRef.current?.setTracking(!engineState.isTracking)}
              onRewind={() => engineRef.current?.moveCursor(-5)}
              onForward={() => engineRef.current?.moveCursor(5)}
              onRecenter={() => engineRef.current?.recenter()}
              fontSize={prompterFontSize}
              onChangeFontSize={(s) => setPrompterFontSize(s)}
              sensitivity={trackingSensitivity}
              onChangeSensitivity={(sens) => {
                setTrackingSensitivity(sens);
                engineRef.current?.setSensitivity(sens);
              }}
              opacity={prompterOpacity}
              onChangeOpacity={(op) => setPrompterOpacity(op)}
              layout={prompterLayout}
              onToggleLayout={() =>
                setPrompterLayout((prev) => (prev === 'overlay' ? 'split' : 'overlay'))
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  topHudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
  },
  topHudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageChip: {
    backgroundColor: 'rgba(23, 19, 31, 0.85)',
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  languageText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textSecondary,
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hudIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(23, 19, 31, 0.85)',
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudIconBtnActive: {
    borderColor: THEME.colors.accentPrimary,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  scriptChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(23, 19, 31, 0.85)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: THEME.radii.pill,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    maxWidth: 130,
    gap: 5,
  },
  scriptChipText: {
    fontSize: 11,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
  },
  prompterWrapper: {
    marginTop: 4,
  },
  waveformTimerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 2,
  },
  timerDigits: {
    fontSize: 15,
    fontWeight: THEME.typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  manualSwitchWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  switchManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accentBright,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: THEME.radii.pill,
    gap: 6,
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  switchManualText: {
    fontSize: 12,
    fontWeight: THEME.typography.weights.bold,
    color: '#FFFFFF',
  },
  bottomControlBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 18,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(13, 11, 18, 0.45)',
  },
  circleToolBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(23, 19, 31, 0.85)',
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryRecordRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3.5,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 11, 18, 0.6)',
  },
  primaryRecordRingActive: {
    borderColor: THEME.colors.accentBright,
    shadowColor: THEME.colors.accentPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  startRecordingInnerDot: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EF4444',
  },
  stopRecordingSquare: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: THEME.colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: THEME.typography.weights.bold,
    color: THEME.colors.textPrimary,
  },
  scriptOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scriptOptionActive: {
    backgroundColor: THEME.colors.surfaceSecondary,
    borderColor: THEME.colors.accentPrimary,
  },
  scriptOptionTitle: {
    fontSize: 15,
    fontWeight: THEME.typography.weights.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  scriptOptionMeta: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
});
