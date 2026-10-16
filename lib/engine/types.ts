/**
 * MERA Voice-Following Teleprompter Engine Types
 */

export interface ScriptToken {
  index: number;
  raw: string;
  normalized: string;
  startChar: number;
  endChar: number;
  paragraphIndex: number;
  lineIndex: number;
}

export type TrackingSensitivity = 'low' | 'medium' | 'high';

export interface EngineConfig {
  /** Number of tokens forward to search in primary local window */
  lookaheadWindow: number;
  /** Number of tokens backward allowed for minor stutter/re-reading */
  lookbehindWindow: number;
  /** Maximum forward tokens to inspect when recovering from a skip */
  expandedLookahead: number;
  /** Maximum normalized edit distance ratio (0.0 to 1.0) allowed for token match */
  maxEditDistanceRatio: number;
  /** Minimum confidence threshold for speech recognition results (0.0 to 1.0) */
  minConfidence: number;
  /** Silence duration in milliseconds before pausing auto-tracking */
  pauseDelayMs: number;
  /** Sensitivity level preset */
  sensitivity: TrackingSensitivity;
  /** Average speaking rate in words per minute */
  wordsPerMinute: number;
}

export interface SpeechInputToken {
  text: string;
  normalized: string;
  isFinal: boolean;
  confidence?: number;
  timestamp?: number;
}

export interface MatchCandidate {
  scriptIndex: number;
  score: number; // 0 (perfect match) to 1 (mismatch)
  matchedCount: number;
  isExpandedSearch: boolean;
}

export interface EngineMatchResult {
  previousCursor: number;
  newCursor: number;
  advanced: boolean;
  matchScore: number;
  isUncertain: boolean;
  isSkipDetected: boolean;
  isRepeatDetected: boolean;
  matchedTokens: {
    scriptTokenIndex: number;
    rawScriptWord: string;
    spokenWord: string;
  }[];
}

export interface EngineState {
  cursorIndex: number;
  confirmedIndex: number;
  isTracking: boolean;
  isPaused: boolean;
  isUncertain: boolean;
  lastSpokenTimestamp: number;
  totalTokens: number;
  progressPercent: number;
  isAutoFollowing?: boolean;
}
