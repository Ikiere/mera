# MERA Troubleshooting Guide

This guide provides immediate solutions for common development, runtime, camera, and speech tracking issues.

---

## 1. Speech Recognition & Teleprompter Issues

### Issue: The teleprompter does not advance while I speak.
- **Check 1**: Is the tracking toggle active? In the studio toolbar, ensure the mic button says **`TRACKING`** (purple badge) and not **`MANUAL`** (amber badge).
- **Check 2**: Did you grant microphone permission? Go to **Settings > Diagnostics** to verify microphone status.
- **Check 3**: Speech sensitivity setting. If your voice is quiet or there is room ambient noise, switch sensitivity to **HIGH** in the prompter toolbar.
- **Check 4**: Ensure your language matches the script language (default is `en-US`).

### Issue: Prompter jumps forward when I didn't say the words.
- **Solution**: The engine is designed with skip detection. If background noise or false speech triggers a match far ahead, tap the **Recenter** icon (`locate-outline`) or use the **-5 Rewind** button in the studio toolbar.

---

## 2. Camera Preview Issues

### Issue: Camera viewfinder displays a black screen.
- **On Simulator / Emulator**: Android emulators require a virtual scene or webcam configured under **AVD Settings > Camera (Front/Back) > Webcam0**. iOS Simulators do not simulate live camera feeds.
- **On Physical Device**: Check whether another background app is holding camera focus. Tap the front/back camera switch button to re-initialize the `CameraView` session.

### Issue: Video recording fails immediately upon tapping Record.
- **Solution**: Ensure your device has sufficient local storage space. MERA writes video files to the internal device application sandbox.

---

## 3. Database & Local Storage Issues

### Issue: Scripts or recordings are not loading.
- **Solution**: SQLite database automatically self-heals with WAL mode. If data becomes corrupted during development, navigate to **Settings > Restore Default Settings** to re-initialize schema tables.

---

## 4. Build & Environment Issues

### Issue: `npx expo run:android` fails with Gradle error.
- **Solution 1**: Verify JDK version is 17: `javac -version`.
- **Solution 2**: Run `npx expo prebuild --platform android --clean` to re-synchronize Gradle configuration files.

### Issue: `npm test` fails with cannot find module.
- **Solution**: Ensure dependencies are installed and run `npm test`, which executes `tsx scripts/verify_engine.ts` using Node.
