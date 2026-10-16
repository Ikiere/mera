/**
 * Standalone MERA Teleprompter Engine Verification Script
 * Runs all unit test scenarios using standard Node.js assertions.
 */

import { PrompterEngine } from '../lib/engine/prompterEngine';
import { tokenizeScript } from '../lib/engine/tokenizer';
import { computeWordDistance } from '../lib/engine/distance';

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running MERA Voice-Following Teleprompter Engine Tests ---');

const SAMPLE_SCRIPT = `Welcome to MERA, your personal video director.
Today we are going to explore how speech-synchronized teleprompting works.
It follows your natural speaking voice instead of scrolling at a fixed speed.
If you pause to breathe or think, MERA patiently waits for you.
And when you skip ahead to the next point, MERA catches right back up!`;

const engine = new PrompterEngine(SAMPLE_SCRIPT, 'medium');

async function runAllTests() {
  try {
  // Test 1: Exact matches
  console.log('Testing 1: Exact matches...');
  const res1 = engine.processTranscript('Welcome to MERA', false, 1.0);
  assert(res1 !== null && res1.advanced, 'res1 should have advanced');
  assert(res1!.newCursor >= 2, `newCursor should be >= 2, got ${res1!.newCursor}`);

  const res2 = engine.processTranscript('Welcome to MERA your personal video director', true, 1.0);
  assert(res2 !== null && res2.advanced, 'res2 should have advanced');
  assert(res2!.newCursor === 6, `Expected cursor at 6 (director), got ${res2!.newCursor}`);
  console.log('  PASS: Exact matches advance cursor stably.');

  // Test 2: Punctuation and case insensitivity
  console.log('Testing 2: Punctuation and case insensitivity...');
  const resPunct = engine.processTranscript('welcome TO mera, YOUR PERSONAL video DIRECTOR.', true, 0.95);
  assert(resPunct !== null, 'resPunct should not be null');
  assert(resPunct!.newCursor === 6, `Expected cursor 6, got ${resPunct!.newCursor}`);
  assert(!resPunct!.isUncertain, 'Punctuation variance should not be uncertain');
  console.log('  PASS: Punctuation and case insensitivity matched correctly.');

  // Test 3: Repeated words and stutter
  console.log('Testing 3: Stutter & repeated words...');
  engine.setCursor(7);
  const resRepeat = engine.processTranscript('Today we we are going', false, 0.9);
  assert(resRepeat !== null && resRepeat.advanced, 'resRepeat should advance');
  assert(engine.getState().cursorIndex >= 10, 'Cursor should advance through stutter');
  console.log('  PASS: Handled repeated words seamlessly.');

  // Test 4: Skip detection
  console.log('Testing 4: Forward skip detection...');
  const resSkip = engine.processTranscript('If you pause to breathe', true, 1.0);
  assert(resSkip !== null && resSkip.isSkipDetected, 'Skip should be detected');
  assert(engine.getState().cursorIndex > 20, 'Cursor should jump past skipped text');
  console.log('  PASS: Successfully recovered from skipped passage.');

  // Test 5: Homophones and phonetics
  console.log('Testing 5: Homophones and phonetic distance...');
  const dHomophone = computeWordDistance('there', 'their');
  assert(dHomophone.isMatch, 'Homophone there/their must match');
  const dNum = computeWordDistance('1', 'one');
  assert(dNum.isMatch, 'Number 1/one must match');
  console.log('  PASS: Homophones and numbers normalized correctly.');

  // Test 6: Low confidence
  console.log('Testing 6: Low confidence threshold...');
  const curBefore = engine.getState().cursorIndex;
  const resLow = engine.processTranscript('unintelligible murmuring noise', false, 0.2);
  assert(resLow !== null && resLow.isUncertain, 'Low confidence must be marked uncertain');
  assert(engine.getState().cursorIndex === curBefore, 'Cursor must not jump on low confidence');
  console.log('  PASS: Low-confidence speech does not trigger erroneous jump.');

  // Test 7: Long script performance
  console.log('Testing 7: Long script stress test (1,200 words)...');
  const hugeText = 'The quick brown fox jumps over the lazy dog. '.repeat(130);
  const hugeEngine = new PrompterEngine(hugeText, 'medium');
  const t0 = Date.now();
  for (let i = 0; i < 50; i++) {
    hugeEngine.processTranscript('The quick brown fox jumps over', false, 0.95);
  }
  const tTotal = Date.now() - t0;
  assert(tTotal < 250, `50 iterations took ${tTotal}ms (expected < 250ms)`);
  hugeEngine.dispose();
  console.log(`  PASS: Processed 50 tracking iterations across 1,200 words in ${tTotal}ms!`);

  // Test 8: Manual controls
  console.log('Testing 8: Manual cursor overrides...');
  engine.setCursor(12);
  assert(engine.getState().cursorIndex === 12, 'Cursor set to 12');
  engine.moveCursor(-4);
  assert(engine.getState().cursorIndex === 8, 'Cursor moved back to 8');
  engine.setTracking(false);
  assert(!engine.getState().isTracking, 'Tracking toggled off');
  const resDisabled = engine.processTranscript('Welcome to MERA', true, 1.0);
  assert(resDisabled === null, 'No speech processing when tracking is off');
  console.log('  PASS: Manual overrides and tracking controls verified.');

  // Test 9: Automatic Voice Follower Cadence
  console.log('Testing 9: Automatic Voice Follower Cadence...');
  engine.setTracking(true);
  engine.reset();
  assert(engine.getState().cursorIndex === 0, 'Cursor should be at 0');
  engine.startAutoFollow(600); // 600 WPM for fast test (100ms per word)
  assert(engine.getIsAutoFollowing(), 'Auto follow must be active');
  
  // Wait 250ms to allow words to advance automatically
  await new Promise((resolve) => setTimeout(resolve, 250));
  const autoState = engine.getState();
  assert(autoState.cursorIndex > 0, `Cursor must auto-advance without human pressing buttons (got ${autoState.cursorIndex})`);
  engine.stopAutoFollow();
  assert(!engine.getIsAutoFollowing(), 'Auto follow must be stopped');
  console.log(`  PASS: Automatic voice follower advanced to word index ${autoState.cursorIndex} automatically.`);

    console.log('\n=== ALL 9 VERIFICATION SUITES PASSED FLAWLESSLY ===');
  } finally {
    engine.dispose();
  }
}

runAllTests().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
