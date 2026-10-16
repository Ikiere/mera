# MERA Android Development & Native Build Guide

This guide explains how to configure, build, and run **MERA** as a native Android application using Expo development builds.

---

## 1. Prerequisites

To build and run MERA locally on Android:
- **Node.js**: v20.x or v24.x
- **JDK**: Java Development Kit 17 (recommended: Eclipse Temurin 17 or OpenJDK 17)
- **Android Studio**: Ladybug / Koala or latest stable
- **Android SDK**:
  - Android SDK Platform 34 or 35
  - Android SDK Build-Tools 34.0.0+
  - Android SDK Command-line Tools
  - NDK (Side by side) 26.x or compatible
  - CMake 3.22.1+

---

## 2. Environment Variables Configuration

Ensure the following environment variables are set in your shell:

### Windows (PowerShell):
```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot", "User")

# Add platform-tools to Path
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
[System.Environment]::SetEnvironmentVariable("Path", "$currentPath;$env:LOCALAPPDATA\Android\Sdk\platform-tools", "User")
```

Verify in terminal:
```bash
adb --version
javac -version
```

---

## 3. Native Prebuild Generation

MERA uses Expo Prebuild to generate the native Android project from `app.json`:

```bash
# Generate or update the android/ project folder
npx expo prebuild --platform android --clean
```

This will automatically configure:
- Package name: `com.mera.videodirector`
- Android Manifest permissions (`CAMERA`, `RECORD_AUDIO`, `READ_MEDIA_VIDEO`)
- Android Gradle plugins (`expo-camera`, `expo-sqlite`, `expo-media-library`)

---

## 4. Running the Development Build

### On Android Emulator:
1. Start an Android Virtual Device (AVD) from Android Studio (Pixel 8 / API 34+ recommended).
2. Run:
```bash
npx expo run:android
```

### On Physical Android Device:
1. Enable **Developer Options** and **USB Debugging** on your phone.
2. Connect your device via USB and verify connection:
```bash
adb devices
```
3. Run:
```bash
npx expo run:android --device
```

---

## 5. Building a Standalone Release APK

For local testing without a dev server:

1. Navigate to the android directory:
```bash
cd android
```

2. Generate a release APK:
```bash
./gradlew assembleRelease
```
*(On Windows: `.\gradlew.bat assembleRelease`)*

3. Output location:
```
android/app/build/outputs/apk/release/app-release.apk
```

4. Install directly to your connected device:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 6. Native Android Speech Recognition Notes

- Android's native `SpeechRecognizer` API interacts with the device's default speech service (e.g. Google Speech Recognition or device on-device speech packs).
- For offline recognition on Android, ensure offline language packs are downloaded under **Settings > System > Languages > Speech > Speech Services by Google > Offline Speech Recognition**.
- When microphone or speech permissions are denied, MERA automatically transitions into **Manual Prompter Mode** with on-screen nudge controls.
