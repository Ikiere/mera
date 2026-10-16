/**
 * MERA Voice-Following Teleprompter Engine
 * Core speech-synchronized script tracking engine.
 */

import {
  ScriptToken,
  EngineConfig,
  EngineState,
  EngineMatchResult,
  SpeechInputToken,
  TrackingSensitivity,
} from './types';
import { tokenizeScript, TokenizedScript } from './tokenizer';
import { computeWordDistance, normalizePhrase } from './distance';

const DEFAULT_CONFIGS: Record<TrackingSensitivity, EngineConfig> = {
  low: {
    lookaheadWindow: 10,
    lookbehindWindow: 1,
    expandedLookahead: 50,
    maxEditDistanceRatio: 0.25,
    minConfidence: 0.65,
    pauseDelayMs: 2000,
    sensitivity: 'low',
    wordsPerMinute: 130,
  },
  medium: {
    lookaheadWindow: 18,
    lookbehindWindow: 2,
    expandedLookahead: 90,
    maxEditDistanceRatio: 0.35,
    minConfidence: 0.50,
    pauseDelayMs: 1500,
    sensitivity: 'medium',
    wordsPerMinute: 145,
  },
  high: {
    lookaheadWindow: 28,
    lookbehindWindow: 4,
    expandedLookahead: 150,
    maxEditDistanceRatio: 0.45,
    minConfidence: 0.35,
    pauseDelayMs: 1200,
    sensitivity: 'high',
    wordsPerMinute: 160,
  },
};

export class PrompterEngine {
  private config: EngineConfig;
  private tokenizedScript: TokenizedScript;
  private tokens: ScriptToken[] = [];
  
  // State
  private cursorIndex = 0;
  private confirmedIndex = 0;
  private isTracking = true;
  private isPaused = false;
  private isUncertain = false;
  private lastSpokenTimestamp = 0;
  private pauseTimer: any = null;

  // Auto-follow cadence tracking
  private autoFollowTimer: any = null;
  private isAutoFollowing = false;
  private autoFollowWpm = 140;

  // Partial transcript stability tracking
  private lastProcessedTranscript = '';
  private stableMatchStreak = 0;

  // Listeners
  private stateListeners: Set<(state: EngineState) => void> = new Set();
  private matchListeners: Set<(result: EngineMatchResult) => void> = new Set();

  constructor(scriptText = '', sensitivity: TrackingSensitivity = 'medium') {
    this.config = { ...DEFAULT_CONFIGS[sensitivity] };
    this.tokenizedScript = tokenizeScript(scriptText, this.config.wordsPerMinute);
    this.tokens = this.tokenizedScript.tokens;
  }

  /**
   * Load or update script content.
   */
  public loadScript(scriptText: string): void {
    this.tokenizedScript = tokenizeScript(scriptText, this.config.wordsPerMinute);
    this.tokens = this.tokenizedScript.tokens;
    this.reset();
  }

  /**
   * Reset engine cursor to beginning.
   */
  public reset(): void {
    this.clearAutoFollowTimer();
    this.cursorIndex = 0;
    this.confirmedIndex = 0;
    this.isPaused = false;
    this.isUncertain = false;
    this.lastSpokenTimestamp = Date.now();
    this.lastProcessedTranscript = '';
    this.stableMatchStreak = 0;
    this.clearPauseTimer();
    if (this.isAutoFollowing) {
      this.scheduleNextAutoFollowWord();
    }
    this.emitState();
  }

  /**
   * Starts automatic voice cadence pacing through the script.
   * Advances word-by-word at the target speaking rate without requiring manual intervention,
   * while dynamically re-aligning whenever recognized speech events arrive.
   */
  public startAutoFollow(wpm?: number): void {
    if (wpm && wpm > 0) {
      this.autoFollowWpm = wpm;
    } else {
      this.autoFollowWpm = this.config.wordsPerMinute;
    }
    this.isAutoFollowing = true;
    this.isPaused = false;
    this.clearAutoFollowTimer();
    this.scheduleNextAutoFollowWord();
    this.emitState();
  }

  /**
   * Stops or pauses automated voice cadence pacing.
   */
  public stopAutoFollow(): void {
    this.isAutoFollowing = false;
    this.clearAutoFollowTimer();
    this.emitState();
  }

  /**
   * Returns whether automated voice follow pacing is active.
   */
  public getIsAutoFollowing(): boolean {
    return this.isAutoFollowing;
  }

  private clearAutoFollowTimer(): void {
    if (this.autoFollowTimer) {
      clearTimeout(this.autoFollowTimer);
      this.autoFollowTimer = null;
    }
  }

  /**
   * Schedules the next word advance based on natural human speech cadence,
   * factoring in word length, punctuation pauses, and paragraph breaks.
   */
  private scheduleNextAutoFollowWord(): void {
    this.clearAutoFollowTimer();
    if (!this.isAutoFollowing || !this.isTracking || this.tokens.length === 0) {
      return;
    }

    if (this.cursorIndex >= this.tokens.length - 1) {
      this.isAutoFollowing = false;
      this.emitState();
      return;
    }

    const currentToken = this.tokens[this.cursorIndex];
    const rawWord = currentToken?.raw || '';

    // Base delay per word: (60,000ms / WPM)
    let delay = Math.round(60000 / Math.max(80, Math.min(260, this.autoFollowWpm)));

    // Word length weighting
    const cleanLen = (currentToken?.normalized || rawWord).length;
    if (cleanLen <= 3) {
      delay = Math.round(delay * 0.85);
    } else if (cleanLen >= 8) {
      delay = Math.round(delay * 1.25);
    }

    // Natural punctuation pauses
    if (rawWord.endsWith(',') || rawWord.endsWith(';') || rawWord.endsWith(':')) {
      delay += 180;
    } else if (rawWord.endsWith('.') || rawWord.endsWith('?') || rawWord.endsWith('!')) {
      delay += 380;
    }

    // Paragraph transition pause
    const nextToken = this.tokens[this.cursorIndex + 1];
    if (nextToken && nextToken.paragraphIndex > currentToken.paragraphIndex) {
      delay += 400;
    }

    this.autoFollowTimer = setTimeout(() => {
      if (!this.isAutoFollowing || !this.isTracking) {
        return;
      }

      if (this.cursorIndex < this.tokens.length - 1) {
        this.cursorIndex++;
        this.confirmedIndex = this.cursorIndex;
        this.lastSpokenTimestamp = Date.now();
        this.emitState();
        this.scheduleNextAutoFollowWord();
      } else {
        this.isAutoFollowing = false;
        this.emitState();
      }
    }, delay);
  }

  /**
   * Update tracking sensitivity.
   */
  public setSensitivity(sensitivity: TrackingSensitivity): void {
    this.config = {
      ...this.config,
      ...DEFAULT_CONFIGS[sensitivity],
      sensitivity,
    };
    if (this.isAutoFollowing) {
      this.autoFollowWpm = this.config.wordsPerMinute;
      this.scheduleNextAutoFollowWord();
    }
    this.emitState();
  }

  /**
   * Toggle or set automated voice tracking.
   */
  public setTracking(active: boolean): void {
    this.isTracking = active;
    if (!active) {
      this.clearPauseTimer();
      this.clearAutoFollowTimer();
      this.isPaused = true;
    } else {
      this.isPaused = false;
      this.lastSpokenTimestamp = Date.now();
      if (this.isAutoFollowing) {
        this.scheduleNextAutoFollowWord();
      }
    }
    this.emitState();
  }

  /**
   * Manual override: move cursor backward or forward by token count.
   */
  public moveCursor(delta: number): void {
    const newIdx = Math.max(0, Math.min(this.tokens.length - 1, this.cursorIndex + delta));
    this.cursorIndex = newIdx;
    this.confirmedIndex = newIdx;
    this.stableMatchStreak = 0;
    if (this.isAutoFollowing) {
      this.scheduleNextAutoFollowWord();
    }
    this.emitState();
  }

  /**
   * Manual override: jump directly to a token index.
   */
  public setCursor(tokenIndex: number): void {
    const clamped = Math.max(0, Math.min(this.tokens.length - 1, tokenIndex));
    this.cursorIndex = clamped;
    this.confirmedIndex = clamped;
    this.stableMatchStreak = 0;
    if (this.isAutoFollowing) {
      this.scheduleNextAutoFollowWord();
    }
    this.emitState();
  }

  /**
   * Recenter tracking window on current cursor.
   */
  public recenter(): void {
    this.confirmedIndex = this.cursorIndex;
    this.stableMatchStreak = 0;
    this.isUncertain = false;
    if (this.isAutoFollowing) {
      this.scheduleNextAutoFollowWord();
    }
    this.emitState();
  }

  /**
   * Process a speech recognition transcript (partial or final).
   */
  public processTranscript(
    transcript: string,
    isFinal = false,
    confidence = 1.0
  ): EngineMatchResult | null {
    if (!this.isTracking || this.tokens.length === 0) {
      return null;
    }

    const trimmed = (transcript || '').trim();
    if (!trimmed) {
      return null;
    }

    // Reset pause state and timer
    this.lastSpokenTimestamp = Date.now();
    if (this.isPaused) {
      this.isPaused = false;
    }
    this.resetPauseTimer();

    // Check confidence threshold
    if (confidence < this.config.minConfidence) {
      this.isUncertain = true;
      this.emitState();
      return {
        previousCursor: this.cursorIndex,
        newCursor: this.cursorIndex,
        advanced: false,
        matchScore: 1.0,
        isUncertain: true,
        isSkipDetected: false,
        isRepeatDetected: false,
        matchedTokens: [],
      };
    }

    const spokenWords = normalizePhrase(trimmed);
    if (spokenWords.length === 0) {
      return null;
    }

    // Prevent re-processing identical partial transcript repeatedly
    if (!isFinal && trimmed === this.lastProcessedTranscript) {
      return null;
    }
    this.lastProcessedTranscript = trimmed;

    // We focus on the latest tail of spoken words (sliding window of spoken speech)
    // E.g., last 1 to 4 spoken words to align with script tokens
    const recentSpoken = spokenWords.slice(-4);
    const result = this.alignSpokenWords(recentSpoken, isFinal);

    this.isUncertain = result.isUncertain;
    if (result.advanced) {
      this.cursorIndex = result.newCursor;
      if (isFinal || this.stableMatchStreak >= 2) {
        this.confirmedIndex = result.newCursor;
      }
      if (this.isAutoFollowing) {
        this.scheduleNextAutoFollowWord();
      }
    }

    this.emitMatch(result);
    this.emitState();
    return result;
  }

  /**
   * Core alignment algorithm: sliding window matching + skip/repeat recovery.
   */
  private alignSpokenWords(
    spokenWords: string[],
    isFinal: boolean
  ): EngineMatchResult {
    const prevCursor = this.cursorIndex;
    const totalTokens = this.tokens.length;

    if (spokenWords.length === 0 || totalTokens === 0) {
      return {
        previousCursor: prevCursor,
        newCursor: prevCursor,
        advanced: false,
        matchScore: 1.0,
        isUncertain: false,
        isSkipDetected: false,
        isRepeatDetected: false,
        matchedTokens: [],
      };
    }

    const lastSpoken = spokenWords[spokenWords.length - 1];

    // 1. PRIMARY LOCAL WINDOW SEARCH: [cursor - lookbehind, cursor + lookahead]
    const localStart = Math.max(0, this.cursorIndex - this.config.lookbehindWindow);
    const localEnd = Math.min(totalTokens - 1, this.cursorIndex + this.config.lookaheadWindow);

    let bestLocalMatch: { index: number; score: number; matchedTokens: any[] } | null = null;

    for (let i = localStart; i <= localEnd; i++) {
      const match = this.evaluateMultiWordMatch(i, spokenWords);
      if (match.isMatch) {
        if (!bestLocalMatch || match.score < bestLocalMatch.score) {
          bestLocalMatch = { index: i, score: match.score, matchedTokens: match.matchedTokens };
        }
      }
    }

    // If local match found
    if (bestLocalMatch) {
      this.stableMatchStreak++;
      const isRepeat = bestLocalMatch.index < this.cursorIndex;
      const targetCursor = bestLocalMatch.index;

      return {
        previousCursor: prevCursor,
        newCursor: targetCursor,
        advanced: targetCursor > prevCursor,
        matchScore: bestLocalMatch.score,
        isUncertain: false,
        isSkipDetected: false,
        isRepeatDetected: isRepeat,
        matchedTokens: bestLocalMatch.matchedTokens,
      };
    }

    // 2. EXPANDED LOOKAHEAD (Skip Recovery)
    // If the speaker skipped a sentence or paragraph, look further ahead
    // Require higher stringency: at least 2 consecutive matched words or a high-confidence single word
    const expStart = localEnd + 1;
    const expEnd = Math.min(totalTokens - 1, this.cursorIndex + this.config.expandedLookahead);

    let bestSkipMatch: { index: number; score: number; matchedTokens: any[] } | null = null;

    for (let i = expStart; i <= expEnd; i++) {
      const match = this.evaluateMultiWordMatch(i, spokenWords);
      // For skip detection, require at least 2 tokens matched or a very low error score
      if (match.isMatch && (match.matchedTokens.length >= 2 || (spokenWords.length === 1 && match.score === 0))) {
        if (!bestSkipMatch || match.score < bestSkipMatch.score) {
          bestSkipMatch = { index: i, score: match.score, matchedTokens: match.matchedTokens };
        }
      }
    }

    if (bestSkipMatch) {
      // Detected a forward skip!
      this.stableMatchStreak = 1;
      return {
        previousCursor: prevCursor,
        newCursor: bestSkipMatch.index,
        advanced: true,
        matchScore: bestSkipMatch.score,
        isUncertain: false,
        isSkipDetected: true,
        isRepeatDetected: false,
        matchedTokens: bestSkipMatch.matchedTokens,
      };
    }

    // 3. NO MATCH FOUND -> UNCERTAIN STATE
    // Do not jump or regress
    this.stableMatchStreak = 0;
    return {
      previousCursor: prevCursor,
      newCursor: prevCursor,
      advanced: false,
      matchScore: 1.0,
      isUncertain: true,
      isSkipDetected: false,
      isRepeatDetected: false,
      matchedTokens: [],
    };
  }

  /**
   * Matches sequence of spoken words ending at target script token index.
   */
  private evaluateMultiWordMatch(
    targetScriptIndex: number,
    spokenWords: string[]
  ): { isMatch: boolean; score: number; matchedTokens: any[] } {
    const matchedTokens: any[] = [];
    let totalScore = 0;
    let matchesCount = 0;

    // Match backwards from targetScriptIndex with spokenWords ending at spokenWords.length - 1
    let scriptIdx = targetScriptIndex;
    let spokenIdx = spokenWords.length - 1;

    while (scriptIdx >= 0 && spokenIdx >= 0) {
      const sToken = this.tokens[scriptIdx];
      // Skip script tokens that are purely punctuation (e.g. empty normalized)
      if (!sToken.normalized) {
        scriptIdx--;
        continue;
      }

      const spoken = spokenWords[spokenIdx];
      const dist = computeWordDistance(sToken.normalized, spoken, this.config.maxEditDistanceRatio);

      if (dist.isMatch) {
        matchedTokens.unshift({
          scriptTokenIndex: sToken.index,
          rawScriptWord: sToken.raw,
          spokenWord: spoken,
        });
        totalScore += dist.score;
        matchesCount++;
      } else {
        // Break sequence on mismatch
        break;
      }

      scriptIdx--;
      spokenIdx--;
    }

    if (matchesCount === 0) {
      return { isMatch: false, score: 1.0, matchedTokens: [] };
    }

    const avgScore = totalScore / matchesCount;
    return {
      isMatch: avgScore <= this.config.maxEditDistanceRatio,
      score: avgScore,
      matchedTokens,
    };
  }

  /**
   * Pause detection timer management.
   */
  private resetPauseTimer(): void {
    this.clearPauseTimer();
    this.pauseTimer = setTimeout(() => {
      this.isPaused = true;
      this.emitState();
    }, this.config.pauseDelayMs);
  }

  private clearPauseTimer(): void {
    if (this.pauseTimer) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  /**
   * State and match event subscriptions.
   */
  public subscribeState(listener: (state: EngineState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => this.stateListeners.delete(listener);
  }

  public subscribeMatch(listener: (result: EngineMatchResult) => void): () => void {
    this.matchListeners.add(listener);
    return () => this.matchListeners.delete(listener);
  }

  private emitState(): void {
    const state = this.getState();
    for (const listener of this.stateListeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in state listener:', err);
      }
    }
  }

  private emitMatch(result: EngineMatchResult): void {
    for (const listener of this.matchListeners) {
      try {
        listener(result);
      } catch (err) {
        console.error('Error in match listener:', err);
      }
    }
  }

  public getState(): EngineState {
    const total = this.tokens.length;
    const progress = total > 0 ? Math.min(100, Math.round((this.cursorIndex / (total - 1 || 1)) * 100)) : 0;

    return {
      cursorIndex: this.cursorIndex,
      confirmedIndex: this.confirmedIndex,
      isTracking: this.isTracking,
      isPaused: this.isPaused,
      isUncertain: this.isUncertain,
      lastSpokenTimestamp: this.lastSpokenTimestamp,
      totalTokens: total,
      progressPercent: progress,
      isAutoFollowing: this.isAutoFollowing,
    };
  }

  public getTokens(): ScriptToken[] {
    return this.tokens;
  }

  public getTokenizedScript(): TokenizedScript {
    return this.tokenizedScript;
  }

  public getConfig(): EngineConfig {
    return { ...this.config };
  }

  public dispose(): void {
    this.clearAutoFollowTimer();
    this.clearPauseTimer();
    this.stateListeners.clear();
    this.matchListeners.clear();
  }
}
