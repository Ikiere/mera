# MERA iOS Development & Native Build Guide

This guide details the prerequisites, build steps, and native configuration required to compile and run **MERA** on Apple iOS devices.

---

## 1. Prerequisites

Building the native iOS application requires:
- **Operating System**: macOS Sonoma (14.0+) or macOS Sequoia
- **Xcode**: 15.2 or newer (with iOS SDK 17+)
- **Command Line Tools**: Installed via `xcode-select --install`
- **CocoaPods**: v1.14.0+ (`sudo gem install cocoapods` or `brew install cocoapods`)
- **Node.js**: v20.x or v24.x

---

## 2. Native Prebuild Generation

Generate the native iOS Xcode project from the configured Expo plugins:

```bash
npx expo prebuild --platform ios --clean
```

This creates the `ios/` workspace, linking native pods for `expo-camera`, `expo-sqlite`, `expo-media-library`, and `expo-file-system`.

---

## 3. Running in Development

### On iOS Simulator:
```bash
npx expo run:ios
```
*(Select simulator e.g., iPhone 15 Pro)*

> **Note on Simulator Testing**: The iOS Simulator does not provide a physical camera feed. `expo-camera` will display a simulated camera backdrop. Microphone and speech tracking can be verified if your Mac microphone is passed into the simulator.

### On Physical iPhone:
1. Open the project in Xcode:
```bash
open ios/Mera.xcworkspace
```
2. In the **Signing & Capabilities** tab of the `Mera` target, select your personal or team Apple Developer account.
3. Connect your iPhone via USB, trust the computer, and enable **Developer Mode** on your device (under iOS **Settings > Privacy & Security > Developer Mode**).
4. Run:
```bash
npx expo run:ios --device
```

---

## 4. Privacy Permissions in Info.plist

MERA configures explicit iOS privacy descriptions in `app.json` which are generated into `ios/Mera/Info.plist`:

| Key | Purpose |
| :--- | :--- |
| `NSCameraUsageDescription` | Displays live video preview and records talking-head video. |
| `NSMicrophoneUsageDescription` | Records high-definition audio and tracks speech synchronization. |
| `NSSpeechRecognitionUsageDescription` | Operates on-device speech-to-text to follow script teleprompter words. |
| `NSPhotoLibraryUsageDescription` | Allows browsing and managing local recordings. |
| `NSPhotoLibraryAddUsageDescription` | Exports completed takes directly to device Camera Roll. |

---

## 5. AVAudioSession & Audio Focus Management

- Talking-head recording requires simultaneous microphone capture and video writing.
- MERA configures the audio session category to `.playAndRecord` with `.defaultToSpeaker` and `.allowBluetooth` options.
- If an incoming phone call or Siri interruption occurs, the app safely finalizes the active video segment and halts prompter tracking without data loss.
