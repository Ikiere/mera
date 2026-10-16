# MERA Permissions & Privacy Architecture

This document describes the native permissions requested by MERA, the exact moments they are requested, and the security principles governing user data.

---

## 1. Zero Cloud Architecture

MERA is engineered as a **100% on-device, local-first application**:
- **No User Registration**: You can open the app and record immediately.
- **No Remote Telemetry**: Audio, video, and script contents never touch an external server or third-party AI API.
- **Local SQLite Engine**: Scripts, metadata, and user preferences are saved locally inside an embedded SQLite database in the device application sandbox.
- **Local Media Storage**: Videos are written to `FileSystem.documentDirectory` and only copied to the system photo library when explicitly requested by the user.

---

## 2. Permissions Breakdown

| Platform | Permission | When Requested | Plain-Language Purpose |
| :--- | :--- | :--- | :--- |
| **Android & iOS** | **Camera** | First entry into Studio or Setup Assistant | Needed to render the live viewfinder and record talking-head video. |
| **Android & iOS** | **Microphone** | First entry into Studio or Setup Assistant | Needed to capture synchronized audio and provide input for voice-following teleprompting. |
| **iOS** | **Speech Recognition** | Starting speech-synchronized tracking | Grants access to Apple's native SFSpeechRecognizer on-device framework. |
| **Android & iOS** | **Photo Library / Gallery** | Saving video from Review or Gallery screens | Allows exporting your completed video files into the device's native Camera Roll / Photos app. |

---

## 3. Graceful Permission Degradation

If a user denies a permission:
1. **Camera Denied**: The app presents an informative permission banner with a direct system settings shortcut, rather than crashing.
2. **Microphone Denied**: Video recording is disabled or muted, and the teleprompter switches to **Manual Mode** with touch controls.
3. **Speech Recognition Denied**: The prompter operates in **Manual Scrolling Mode** where users can adjust speed or tap words to seek.
4. **Media Library Denied**: Videos remain securely accessible within MERA's local gallery; the user is notified if they try to export to the system Camera Roll.
