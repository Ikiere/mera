/**
 * MERA String Distance & Phonetic Similarity Utilities
 * Bounded Levenshtein distance and speech recognition variance normalization.
 */

// Common homophones and speech-to-text contractions/number equivalents
const HOMOPHONE_EQUIVALENTS: Record<string, string> = {
  "there": "their",
  "theyre": "their",
  "they're": "their",
  "your": "youre",
  "you're": "youre",
  "its": "it's",
  "it's": "its",
  "to": "too",
  "too": "to",
  "two": "to",
  "for": "four",
  "four": "for",
  "right": "write",
  "write": "right",
  "here": "hear",
  "hear": "here",
  "one": "1",
  "1": "one",
  "two_num": "2",
  "three": "3",
  "four_num": "4",
  "five": "5",
  "six": "6",
  "seven": "7",
  "eight": "8",
  "nine": "9",
  "ten": "10",
  "ok": "okay",
  "okay": "ok",
};

/**
 * Strips accents, lowercases, removes all punctuation, and collapses multiple spaces.
 */
export function normalizeWord(word: string): string {
  if (!word) return '';
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]/g, '')       // strip non-alphanumeric
    .trim();
}

/**
 * Strips punctuation and normalizes an entire sentence or phrase.
 */
export function normalizePhrase(phrase: string): string[] {
  if (!phrase) return [];
  return phrase
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .map(w => w.replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 0);
}

/**
 * Calculates bounded Levenshtein edit distance between two normalized words.
 * Returns early if distance exceeds maxAllowed.
 */
export function boundedLevenshteinDistance(
  a: string,
  b: string,
  maxAllowed: number
): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const lenA = a.length;
  const lenB = b.length;

  if (Math.abs(lenA - lenB) > maxAllowed) {
    return maxAllowed + 1;
  }

  // Pre-allocate row buffers to avoid GC pressure in tight speech loops
  let prevRow = new Array(lenB + 1);
  let currRow = new Array(lenB + 1);

  for (let j = 0; j <= lenB; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    currRow[0] = i;
    let minInRow = currRow[0];
    const charA = a.charCodeAt(i - 1);

    for (let j = 1; j <= lenB; j++) {
      const charB = b.charCodeAt(j - 1);
      const cost = charA === charB ? 0 : 1;

      const val = Math.min(
        prevRow[j] + 1,       // deletion
        currRow[j - 1] + 1,   // insertion
        prevRow[j - 1] + cost // substitution
      );

      currRow[j] = val;
      if (val < minInRow) {
        minInRow = val;
      }
    }

    if (minInRow > maxAllowed) {
      return maxAllowed + 1;
    }

    // Swap buffers
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[lenB];
}

/**
 * Evaluates similarity between a script word and a spoken word.
 * Returns a score between 0.0 (exact match) and 1.0 (complete mismatch).
 */
export function computeWordDistance(
  scriptWord: string,
  spokenWord: string,
  maxRatioThreshold = 0.35
): { distance: number; score: number; isMatch: boolean } {
  const normA = normalizeWord(scriptWord);
  const normB = normalizeWord(spokenWord);

  if (!normA && !normB) return { distance: 0, score: 0, isMatch: true };
  if (!normA || !normB) return { distance: 10, score: 1, isMatch: false };

  // 1. Direct equality
  if (normA === normB) {
    return { distance: 0, score: 0, isMatch: true };
  }

  // 2. Homophone / equivalent lookup
  if (
    HOMOPHONE_EQUIVALENTS[normA] === normB ||
    HOMOPHONE_EQUIVALENTS[normB] === normA ||
    (HOMOPHONE_EQUIVALENTS[normA] &&
     HOMOPHONE_EQUIVALENTS[normA] === HOMOPHONE_EQUIVALENTS[normB])
  ) {
    return { distance: 0, score: 0, isMatch: true };
  }

  // 3. Suffix tolerance (e.g., 'jump' vs 'jumping', 'walk' vs 'walked')
  if (
    (normA.startsWith(normB) && normA.length - normB.length <= 3) ||
    (normB.startsWith(normA) && normB.length - normA.length <= 3)
  ) {
    const score = 0.15;
    return { distance: 1, score, isMatch: true };
  }

  // 4. Bounded Levenshtein
  const maxLen = Math.max(normA.length, normB.length);
  // Allowed edits: 1 edit for 3-5 chars, 2 edits for 6+ chars
  const maxAllowedEdits = maxLen <= 3 ? 0 : maxLen <= 6 ? 1 : 2;
  const dist = boundedLevenshteinDistance(normA, normB, maxAllowedEdits);

  if (dist > maxAllowedEdits) {
    return { distance: dist, score: 1.0, isMatch: false };
  }

  const score = dist / maxLen;
  const isMatch = score <= maxRatioThreshold;
  return { distance: dist, score, isMatch };
}
