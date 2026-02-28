---
title: Mobile App Setup Guide
description: Set up the Storno mobile app for local development on macOS.
---

# Mobile App Setup Guide

This guide walks you through setting up the Storno mobile app for local development.

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | LTS (v20+) | JavaScript runtime |
| [npm](https://www.npmjs.com/) | Bundled with Node.js | Package manager |
| [Expo CLI](https://docs.expo.dev/get-started/set-up-your-environment/) | Latest | React Native development platform |
| [EAS CLI](https://docs.expo.dev/build/setup/) | Latest | Build and submit to app stores |
| [Xcode](https://developer.apple.com/xcode/) | Latest | iOS builds (macOS only) |
| [Android Studio](https://developer.android.com/studio) | Latest | Android builds and emulators |
| [Watchman](https://facebook.github.io/watchman/) | Latest | File watching (recommended on macOS) |

### Install Expo CLI and EAS CLI

```bash
npm install -g expo-cli eas-cli
```

### iOS Setup (macOS)

1. Install Xcode from the Mac App Store
2. Open Xcode and install the iOS Simulator runtime
3. Accept the Xcode license: `sudo xcodebuild -license accept`
4. Install CocoaPods: `sudo gem install cocoapods`

### Android Setup

1. Install Android Studio
2. In Android Studio, install the Android SDK (API 34+)
3. Configure `ANDROID_HOME` in your shell profile:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

4. Create an Android Virtual Device (AVD) in Android Studio with API 28+ (minimum SDK)

## Clone & Install

```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies
npm install
```

> **Note:** Always use `npx expo install <package>` when adding new dependencies instead of `npm install <package>`. Expo will automatically install the correct compatible version for your SDK.

## Environment Configuration

The mobile app uses Expo environment variables defined in `eas.json` for different build profiles. For local development, the app connects to the API based on the build profile:

| Profile | API URL | Description |
|---------|---------|-------------|
| `development` | `https://api.storno.test:8000` | Local development server |
| `preview` | `https://staging.storno.ro` | Staging environment |
| `production` | `https://api.storno.ro` | Production |

You can change the server host at runtime from the app's settings screen (useful for switching between environments during development).

### Sentry (Optional)

If you need error tracking in development, create a `.env` file:

```bash
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

This is optional for local development.

## Running the App

### Start the Development Server

```bash
npm start
```

This launches the Expo development server. You'll see a QR code and options to open the app.

### Run on iOS Simulator

```bash
npm run ios
```

This will build the native iOS project and launch it in the iOS Simulator.

### Run on Android Emulator

```bash
npm run android
```

Make sure an Android emulator is running or a device is connected via USB before running this command.

### Run on Web

```bash
npm run web
```

> **Note:** The web version has limited functionality compared to native platforms.

## Prebuild (Native Code Generation)

When you add a new native dependency or modify `app.config.ts`, you need to regenerate the native directories:

```bash
# Android only
npm run prebuild:android
```

This runs `expo prebuild --platform android --clean` and regenerates the `android/` directory.

For iOS, the native code is generated during `npm run ios`.

## Building for Distribution

### EAS Cloud Builds

```bash
# iOS
npm run build:ios:preview        # Internal testing
npm run build:ios:production     # App Store

# Android
npm run build:android:preview    # Internal testing
npm run build:android:production # Google Play
```

### Local Android Build

```bash
npm run prebuild:android
npm run build:android:local
```

This produces an `.aab` file in `android/app/build/outputs/bundle/release/`.

### Submit to Stores

```bash
# iOS — requires App Store Connect credentials
npm run submit:ios

# Android — requires Google Play service account key
npm run submit:android

# Build + submit in one step
npm run build:submit:ios
npm run build:submit:android
```

## Google Play Metadata

Manage Google Play Store metadata and screenshots via Fastlane:

```bash
npm run gplay:metadata     # Upload title, descriptions
npm run gplay:screenshots  # Upload screenshots
npm run gplay:all          # Upload everything
```

Metadata files are in `fastlane/metadata/android/` organized by locale (`en-US/`, `ro/`).

## Linting

```bash
npm run lint
```

Uses ESLint with the official Expo flat config. Fix any lint errors before submitting a PR.

## Next Steps

- Read the [Architecture Guide](/contributing-guide/mobile-app/architecture) to understand the codebase
- Check [Common Errors](/contributing-guide/mobile-app/common-errors) if you run into issues
- Review the [Translation Guidelines](/contributing-guide/mobile-app/translation-guidelines) if working on i18n
