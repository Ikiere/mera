# MERA: AI-Powered Personal Video Director

> **Record flawless talking-head videos alone.**  
> Intelligent teleprompter synchronized to your natural speaking voice with real-time framing guidance, smart camera presets, and 100% on-device privacy.

---

## 1. Product Overview

MERA is an on-device personal video director engineered for single-operator creators—including YouTubers, educators, course creators, public speakers, and business professionals.

Unlike conventional teleprompters that roll at a mechanical, unnatural scrolling speed, MERA's core **Speech-Synchronized Script Tracking Engine** listens to your voice and follows your exact words.
- If you pause to breathe or think, MERA patiently holds your place.
- If you skip ahead to your next paragraph, MERA smoothly catches right up.
- If you stutter or repeat a sentence, MERA retains local context without jumping erratically into future script sections.
- When you finish recording, your video is saved directly to your device sandbox with instant review and camera-roll export.

---

## 2. Key Features

- **Voice-Following Teleprompter**:
  - Bounded token alignment using phonetic similarity and edit-distance matching.
  - Sub-millisecond matching latency across 1,200+ word scripts.
  - Both **Overlay Mode** (translucent prompter over viewfinder) and **Split Mode** (viewfinder & prompter side-by-side).
  - Tap-to-seek, ±5 word manual nudge, and recenter controls.
- **Flagship Recording Studio**:
  - Live camera preview (`expo-camera`) with front/rear camera switching.
  - Recording timer, pulsing status badge, and live microphone audio meter.
  - 3-second pre-recording countdown.
  - Non-destructive save and review flow.
- **Smart Camera Presets**:
  - TikTok / Reels / Shorts (9:16 vertical)
  - YouTube Landscape (16:9 widescreen)
  - Cinematic Talking Head (24fps 4K framing)
  - Online Course / Lecture
  - Executive & Business Pitch
- **Camera Setup Assistant**:
  - Pre-recording checklist validating camera permissions, microphone access, orientation match, and eye-line alignment.
- **Local SQLite Database**:
  - Zero cloud dependencies or accounts required.
  - Complete script CRUD, duplicate, word count, and reading duration estimates.
  - Video gallery with metadata and direct export to device photo library (`expo-media-library`).
- **Privacy First**:
  - 100% on-device execution. Zero telemetry, zero external video or audio streaming.

---

## 3. Technology Stack

- **Framework**: React Native & Expo SDK 57 (TypeScript Strict Mode)
- **Navigation**: Expo Router (File-based navigation with tabs and modals)
- **Camera & Video**: `expo-camera` (`CameraView`)
- **Database**: `expo-sqlite` (WAL mode, relational schemas)
- **Filesystem & Media**: `expo-file-system`, `expo-media-library`
- **Audio & Haptics**: `expo-haptics`
- **Speech Abstraction**: Native Android/iOS Speech Recognition bridge + Web Speech API fallback

---

## 4. Project Structure

```
Mera/
├── app/                        # Expo Router Pages
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Bottom tab navigation
│   │   ├── index.tsx           # Home Dashboard
│   │   ├── scripts.tsx         # Script Library
│   │   ├── studio.tsx          # Flagship Recording Studio
│   │   └── gallery.tsx         # Local Video Gallery
│   ├── script/
│   │   ├── [id].tsx            # Script Editor
│   │   └── new.tsx             # Create New Script
│   ├── _layout.tsx             # Root Stack Layout & Theme
│   ├── review.tsx              # Recording Review & Export
│   ├── settings.tsx            # Settings & Offline Diagnostics
│   └── setup.tsx               # Pre-Recording Camera Setup Assistant
├── components/                 # UI Component Hierarchy
│   ├── camera/                 # Viewfinder, FramingGuide, AudioMeter
│   ├── common/                 # Button, Card, Badge, Header
│   ├── gallery/                # VideoCard, VideoPlayerModal
│   ├── prompter/               # OverlayPrompter, SplitPrompter, Controls
│   └── scripts/                # ScriptCard
├── constants/
│   ├── presets.ts              # Smart Camera Presets specifications
│   └── theme.ts                # Deep luxury purple/black design tokens
├── lib/
│   └── engine/                 # Pure Voice-Following Teleprompter Engine
│       ├── distance.ts         # Bounded Levenshtein & phonetic normalizer
│       ├── prompterEngine.ts   # Sliding-window matcher & jitter dampener
│       ├── tokenizer.ts        # Script tokenization & char-offset mapping
│       └── types.ts            # Engine data types
├── services/
│   ├── camera/                 # CameraController & types
│   ├── database/               # SQLite DB, scriptsRepo, recordingsRepo, settingsRepo
│   ├── setup/                  # Pre-recording framing evaluator
│   └── speech/                 # Cross-platform SpeechRecognitionService
├── scripts/
│   └── verify_engine.ts        # Automated standalone test suite
├── docs/                       # Technical Guides
│   ├── ANDROID_BUILD_GUIDE.md  # Android Development & Build instructions
│   ├── IOS_BUILD_GUIDE.md      # iOS Development & Build instructions
│   ├── PERMISSIONS_AND_PRIVACY.md # Native permissions specification
│   ├── TROUBLESHOOTING.md      # Common issues & fixes
│   └── VERIFICATION_AND_LIMITATIONS.md # Audit & hardware verification list
├── app.json                    # Expo config plugins & permission descriptions
├── package.json
└── tsconfig.json
```

---

## 5. Getting Started & Development

### Prerequisites
- Node.js v20+ or v24+
- npm v10+

### Installation
```bash
# Clone the repository and enter the directory
cd Mera

# Run automated tests
npm test

# Verify TypeScript compilation
npx tsc --noEmit

# Run project health audit
npx expo-doctor
```

### Running Locally
```bash
# Start development server
npm start

# Run on Android emulator / connected device
npm run android

# Run in Web browser
npm run web
```

---

## 6. Testing & Quality Assurance

MERA includes an automated verification test suite covering core engine scenarios:
1. **Exact Word Alignment**: Sequential spoken tokens advance cursor smoothly.
2. **Punctuation & Capitalization**: Case-insensitive and punctuation-stripped matching.
3. **Repeated Words & Stuttering**: Prevents erratic jumps when speakers repeat syllables.
4. **Skipped Paragraph Recovery**: Expanded forward lookahead detects skips and recovers context.
5. **Phonetic Distance & Homophones**: Normalizes common speech variants (e.g., "there" / "their", "1" / "one").
6. **Low-Confidence Speech**: Ignores acoustic noise and avoids unwarranted movements.
7. **Long Script Stress Testing**: Validates 50 tracking iterations across 1,200 words in under 10ms.
8. **Manual Cursor Controls**: Tests programmatic and user seek overrides.

Run the test suite anytime:
```bash
npm test
```
