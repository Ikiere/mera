/**
 * MERA Voice-Following Teleprompter Engine - Comprehensive Unit Tests
 * Covers exact matches, punctuation, repeats, skips, ASR errors, revisions,
 * long scripts, empty input, low confidence, and manual recovery.
 */

import { PrompterEngine } from '../lib/engine/prompterEngine';
import { tokenizeScript } from '../lib/engine/tokenizer';
import { computeWordDistance } from '../lib/engine/distance';

describe('PrompterEngine Unit Tests', () => {
  const SAMPLE_SCRIPT = `Welcome to MERA, your personal video director.
Today we are going to explore how speech-synchronized teleprompting works.
It follows your natural speaking voice instead of scrolling at a fixed speed.
If you pause to breathe or think, MERA patiently waits for you.
And when you skip ahead to the next point, MERA catches right back up!`;

  let engine: PrompterEngine;

  beforeEach(() => {
    engine = new PrompterEngine(SAMPLE_SCRIPT, 'medium');
  });

  afterEach(() => {
    engine.dispose();
  });

  test('1. Exact Match Sequence: words advance the cursor in sequence', () => {
    const res1 = engine.processTranscript('Welcome to MERA', false, 1.0);
    expect(res1).not.toBeNull();
    expect(res1?.advanced).toBe(true);
    expect(res1?.newCursor).toBeGreaterThanOrEqual(2);

    const res2 = engine.processTranscript('Welcome to MERA your personal video director', true, 1.0);
    expect(res2?.advanced).toBe(true);
    expect(res2?.newCursor).toBe(6); // 'director' is token 6
    expect(engine.getState().cursorIndex).toBe(6);
    expect(engine.getState().isUncertain).toBe(false);
  });

  test('2. Punctuation and Case Insensitivity: handles commas, caps, and periods', () => {
    const res = engine.processTranscript('welcome TO mera, YOUR PERSONAL video DIRECTOR.', true, 0.95);
    expect(res?.advanced).toBe(true);
    expect(res?.newCursor).toBe(6);
    expect(res?.isUncertain).toBe(false);
  });

  test('3. Repeated Words and Stutter Handling', () => {
    // Speaker says "Today we we are going"
    engine.setCursor(7); // Jump near "Today" (token 7)
    const res = engine.processTranscript('Today we we are going', false, 0.9);
    expect(res).not.toBeNull();
    expect(res?.advanced).toBe(true);
    expect(res?.isUncertain).toBe(false);
    expect(engine.getState().cursorIndex).toBeGreaterThanOrEqual(10);
  });

  test('4. Repeated Phrases / Retakes in Local Context', () => {
    // Start at beginning
    engine.processTranscript('Welcome to MERA', true, 1.0);
    const cursorBefore = engine.getState().cursorIndex;

    // Speaker repeats "Welcome to MERA"
    const res = engine.processTranscript('Welcome to MERA', true, 1.0);
    expect(res?.isRepeatDetected).toBe(true);
    // Should not jump into the future script
    expect(engine.getState().cursorIndex).toBeLessThanOrEqual(cursorBefore);
  });

  test('5. Skipped Paragraph / Forward Jump Recovery', () => {
    // Start at beginning
    engine.processTranscript('Welcome to MERA', true, 1.0);
    expect(engine.getState().cursorIndex).toBeLessThan(10);

    // Speaker skips directly to paragraph 4: "If you pause to breathe"
    const res = engine.processTranscript('If you pause to breathe', true, 1.0);
    expect(res?.isSkipDetected).toBe(true);
    expect(res?.advanced).toBe(true);
    // Cursor should have jumped forward past token 20
    expect(engine.getState().cursorIndex).toBeGreaterThan(20);
  });

  test('6. Speech Recognition Minor Errors & Phonetic Homophones', () => {
    // Test phonetic / edit distance
    const dist1 = computeWordDistance('their', 'there');
    expect(dist1.isMatch).toBe(true);

    const dist2 = computeWordDistance('speaking', 'speakin'); // dropped g
    expect(dist2.isMatch).toBe(true);

    // Feed transcript with slight misrecognition
    engine.setCursor(20);
    const res = engine.processTranscript('It folows your natural speeking voice', false, 0.85);
    expect(res?.advanced).toBe(true);
    expect(res?.isUncertain).toBe(false);
  });

  test('7. Unstable Partial Transcript Revisions: does not jump backwards erratically', () => {
    // Recognizer emits partial 1
    engine.processTranscript('Today we are', false, 0.9);
    const c1 = engine.getState().cursorIndex;

    // Recognizer emits revised partial with more words
    engine.processTranscript('Today we are going to explore', false, 0.9);
    const c2 = engine.getState().cursorIndex;
    expect(c2).toBeGreaterThan(c1);

    // Recognizer briefly drops a word in partial: "Today we going"
    engine.processTranscript('Today we going', false, 0.9);
    const c3 = engine.getState().cursorIndex;
    // Should preserve stable forward progress or stay at current
    expect(c3).toBeGreaterThanOrEqual(c1);
  });

  test('8. Long Scripts: handles 1,000+ words efficiently without latency', () => {
    const longParagraph = 'This is an extensive script created to verify speed and memory under load. ';
    const hugeText = longParagraph.repeat(80); // ~960 words
    const longEngine = new PrompterEngine(hugeText, 'medium');

    const start = Date.now();
    for (let i = 0; i < 20; i++) {
      longEngine.processTranscript('This is an extensive script created to verify', false, 0.9);
    }
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(200); // 20 iterations in under 200ms
    expect(longEngine.getTokens().length).toBeGreaterThan(800);
    longEngine.dispose();
  });

  test('9. Empty and Whitespace Recognition: returns null and does not crash', () => {
    const resEmpty = engine.processTranscript('', false, 1.0);
    expect(resEmpty).toBeNull();

    const resWhitespace = engine.processTranscript('   ', true, 1.0);
    expect(resWhitespace).toBeNull();
  });

  test('10. Low Confidence Transcripts: marks uncertainty without erratic jump', () => {
    const initialCursor = engine.getState().cursorIndex;
    const res = engine.processTranscript('gibberish unrecognised sound blurp', false, 0.2); // below 0.5 threshold

    expect(res?.isUncertain).toBe(true);
    expect(res?.advanced).toBe(false);
    expect(engine.getState().cursorIndex).toBe(initialCursor);
    expect(engine.getState().isUncertain).toBe(true);
  });

  test('11. Manual Controls: moveCursor, setCursor, recenter, and pause tracking', () => {
    engine.setCursor(15);
    expect(engine.getState().cursorIndex).toBe(15);

    engine.moveCursor(-5);
    expect(engine.getState().cursorIndex).toBe(10);

    engine.moveCursor(8);
    expect(engine.getState().cursorIndex).toBe(18);

    engine.setTracking(false);
    expect(engine.getState().isTracking).toBe(false);

    // When tracking is off, speech processing is ignored
    const res = engine.processTranscript('Welcome to MERA', true, 1.0);
    expect(res).toBeNull();
    expect(engine.getState().cursorIndex).toBe(18);

    engine.setTracking(true);
    expect(engine.getState().isTracking).toBe(true);
  });
});
