/**
 * MERA Script Tokenizer & Normalizer
 * Extracts indexed tokens with exact char offsets, line indices, and paragraph mappings.
 */

import { ScriptToken } from './types';
import { normalizeWord } from './distance';

export interface TokenizedScript {
  rawText: string;
  tokens: ScriptToken[];
  totalWords: number;
  totalParagraphs: number;
  totalLines: number;
  estimatedDurationSec: number;
}

/**
 * Tokenizes arbitrary script text into indexed tokens preserving exact character offsets.
 */
export function tokenizeScript(
  scriptText: string,
  wordsPerMinute: number = 140
): TokenizedScript {
  if (!scriptText || typeof scriptText !== 'string') {
    return {
      rawText: '',
      tokens: [],
      totalWords: 0,
      totalParagraphs: 0,
      totalLines: 0,
      estimatedDurationSec: 0,
    };
  }

  const tokens: ScriptToken[] = [];
  const lines = scriptText.split(/\r?\n/);
  let totalParagraphs = 0;
  let inParagraph = false;

  // Regex to match non-whitespace sequences (words with punctuation attached)
  const wordRegex = /\S+/g;
  let match: RegExpExecArray | null;

  // Track global character offset
  let globalCharOffset = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const isLineEmpty = line.trim().length === 0;

    if (!isLineEmpty) {
      if (!inParagraph) {
        totalParagraphs++;
        inParagraph = true;
      }
    } else {
      inParagraph = false;
    }

    wordRegex.lastIndex = 0;
    while ((match = wordRegex.exec(line)) !== null) {
      const rawWord = match[0];
      const startInLine = match.index;
      const endInLine = startInLine + rawWord.length;

      const norm = normalizeWord(rawWord);
      // Even if a token is just punctuation like "---" or "...", keep it with empty norm
      tokens.push({
        index: tokens.length,
        raw: rawWord,
        normalized: norm,
        startChar: globalCharOffset + startInLine,
        endChar: globalCharOffset + endInLine,
        lineIndex: lineIdx,
        paragraphIndex: Math.max(0, totalParagraphs - 1),
      });
    }

    // Account for newline character (\n is 1 char)
    globalCharOffset += line.length + 1;
  }

  const validWordCount = tokens.filter(t => t.normalized.length > 0).length;
  const estimatedDurationSec = Math.ceil((validWordCount / Math.max(wordsPerMinute, 60)) * 60);

  return {
    rawText: scriptText,
    tokens,
    totalWords: validWordCount,
    totalParagraphs: Math.max(1, totalParagraphs),
    totalLines: lines.length,
    estimatedDurationSec,
  };
}
