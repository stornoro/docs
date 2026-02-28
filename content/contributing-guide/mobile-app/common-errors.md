---
title: Common Errors
description: Troubleshooting common issues when developing the Storno mobile app.
---

# Common Errors

This page covers common issues you may encounter while developing the Storno mobile app and how to resolve them.

## Setup & Installation

### `expo: command not found`

Expo CLI is not installed globally.

```bash
npm install -g expo-cli eas-cli
```

Or run Expo commands via npx:

```bash
npx expo start
```

### npm Install Fails with Peer Dependency Errors

When adding new packages, always use `npx expo install` instead of `npm install`:

```bash
# Correct
npx expo install @react-native-async-storage/async-storage

# Incorrect — may install incompatible versions
npm install @react-native-async-storage/async-storage
```

Expo automatically resolves the correct version compatible with your SDK.

### Node.js Version Mismatch

If you see errors about incompatible Node.js versions, make sure you're using the LTS version (v20+):

```bash
node --version  # Should be v20.x or higher
```

Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:

```bash
nvm install --lts
nvm use --lts
```

## Build Errors

### `expo prebuild` Fails

If native code generation fails:

1. Delete the existing native directories and retry:

```bash
rm -rf android ios
npm run prebuild:android
```

2. Clear the Expo cache:

```bash
npx expo start --clear
```

3. Make sure all native dependencies are properly listed in `app.config.ts` plugins.

### Android Build Fails — SDK Not Found

Ensure `ANDROID_HOME` is set correctly:

```bash
echo $ANDROID_HOME
# Should output: /Users/<your-user>/Library/Android/sdk
```

If not set, add to your `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### iOS Build Fails — CocoaPods Issues

If iOS builds fail with CocoaPods errors:

```bash
cd ios
pod install --repo-update
cd ..
```

If that doesn't work, clean and rebuild:

```bash
rm -rf ios/Pods ios/Podfile.lock
cd ios && pod install && cd ..
```

### EAS Build Fails

Check the EAS CLI version:

```bash
eas --version
eas update  # Update if needed
```

Review the build logs on the [Expo dashboard](https://expo.dev) for detailed error messages.

## Runtime Errors

### Metro Bundler — Module Not Found

If Metro can't resolve a module:

1. Clear the Metro cache:

```bash
npx expo start --clear
```

2. Delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
```

3. If using a native module, make sure you've run `expo prebuild`.

### White Screen on Launch

Usually caused by an unhandled error during app initialization. Check the Metro terminal output for JavaScript errors. Common causes:

- Missing environment variables
- API server not reachable
- Corrupted secure storage data

To reset secure storage on the simulator:

- **iOS:** Reset the simulator (Device > Erase All Content and Settings)
- **Android:** Clear app data (Settings > Apps > Storno > Clear Data)

### Network Request Failed (Axios)

If API calls fail with network errors:

1. **Local development:** Make sure the backend server is running at the configured URL
2. **Android emulator:** Use `10.0.2.2` instead of `localhost` to reach the host machine
3. **iOS simulator:** `localhost` works, but verify the port matches your backend
4. **Physical device:** Use the machine's local IP address or a tunnel like `ngrok`

You can change the server host in the app's settings screen without rebuilding.

### Token Refresh Loop

If the app keeps logging you out or shows repeated 401 errors:

1. The refresh token may have expired — log out and log back in
2. Check if the backend server's clock is synchronized
3. Verify the backend is returning valid JWT tokens

### WebSocket Connection Failed

If real-time updates aren't working:

1. Check that the Centrifugo server is running
2. Verify the WebSocket URL in the environment configuration
3. Check the app's network connectivity
4. Look for connection errors in the Metro console

## TypeScript Errors

### Type Errors After Updating Types

If you've updated type definitions and see cascading errors:

1. Restart the TypeScript language server in your editor
2. Make sure all affected files use the updated types
3. Run `npx tsc --noEmit` to check for type errors project-wide

### Strict Mode Violations

The project uses TypeScript strict mode. Common issues:

- **Implicit `any`:** Always provide explicit types for function parameters
- **Null checks:** Use optional chaining (`?.`) or null guards before accessing properties
- **Missing return types:** Add explicit return types to exported functions

## Linting Errors

### ESLint Errors on Commit

Run the linter before committing:

```bash
npm run lint
```

The project uses the official Expo ESLint flat config. Most issues can be auto-fixed, but the project doesn't include a `--fix` script — review changes manually to ensure correctness.

## Fastlane / Store Deployment

### Google Play Metadata Upload Fails

1. Verify the service account key exists at `fastlane/google-play-key.json`
2. Check that the service account has the correct Google Play Console permissions
3. Ensure the app is already created in the Google Play Console

### Screenshot Dimensions Rejected

Google Play requires specific screenshot dimensions. Screenshots should be placed in:

```
fastlane/metadata/android/<locale>/images/phoneScreenshots/
```

Supported locales: `en-US`, `ro`

## Getting Help

If you encounter an issue not listed here:

1. Check the Metro bundler terminal for detailed error logs
2. Search the [Expo documentation](https://docs.expo.dev)
3. Check [React Native's troubleshooting guide](https://reactnative.dev/docs/troubleshooting)
4. Review the Sentry dashboard for crash reports (if configured)
