# Yaepe

An e-amusement pass emulator for Android powered by HCE-F.
It lets you tag your phone on an arcade reader and use it as a card, without a physical card.

Version: **1.0.0**

[한국어](README.md) | English

## Download

Get the APK from the [latest release](https://github.com/creveld/yaepe/releases/latest).

## Requirements

- Android 7.0 (API 24) or newer
- NFC with HCE-F (NFC-F) support

Most NFC-equipped devices support HCE-F, but some devices have NFC without HCE-F. In that case the app shows a notice on launch.

## Features

- **3D card list** — cards are laid out in real card proportions and stacked vertically; scroll to pick one.
- **Card activation (HCE-F)** — tap a card to start emulating it. The active card gets a badge and its artwork fades in, blurred, behind the list.
- **Card management** — add, rename and delete cards. The card number (SID) is generated automatically and can be reissued.
- **KONAMI ID** — the card number is converted to a KONAMI ID and shown in groups of four. Tap it on the edit screen preview to copy it to the clipboard.
- **Custom design** — use an image from the gallery as the card face.
- **Tag notification** — a notification when the card is read by a reader. (Notification permission is required on Android 13+)
- **Themes** — monochrome Material 3 light and dark themes, toggled from the header.
- **Languages** — Korean or English, following the device language.

## Usage

1. Add a card with the **+** button in the bottom right corner.
2. Enter a name and tap **Save**. The card number is generated for you; **Change card number** issues a new one.
3. Tap a card on the home screen to activate it. The phone vibrates briefly on activation.
4. Hold the phone against an arcade reader.
5. Tap the card again to stop emulating it.

The pencil icon on a card opens the edit screen, where you can change its name and custom design or delete it. Deleting the active card also stops the emulation.

> Emulation only runs while the app is in the foreground. It is paused when the app goes to the background and resumed when it comes back.

## Notes

- On Samsung devices, set the default NFC setting (Settings > Connections > NFC and contactless payments > ⋯ in the top right > Default NFC settings) to **Automatic** or **Android OS**.
- A phone case can significantly reduce the read rate. If the card is not detected, try removing the case.
- The tag notification only means the reader has detected the card; it does not guarantee that the arcade accepted it.
- A changed card number cannot be restored to the previous one.
- Card data is stored only on the device (AsyncStorage).

## Upgrading from eAMEMu

Yaepe is versioned independently. Its package name differs from eAMEMu, so it installs as a separate app and saved cards are not carried over.

## Development

### Prerequisites

- Node.js 18 or newer (`.node-version`)
- JDK 17
- Android SDK 33 (Build Tools 33.0.0), NDK 23.1.7779620

### Run (development)

```bash
npm install
npm start                       # Metro bundler
npx react-native run-android    # or: cd android && ./gradlew :app:installDebug
```

Debug builds load JavaScript from Metro. When running on a physical device over USB, `adb reverse tcp:8081 tcp:8081` is required (the `run-android` command usually sets it up for you).

### Checks

```bash
npx tsc --noEmit
npm run lint
npm test
```

### Release build (the standalone APK)

```bash
npm run android:release         # cd android && ./gradlew assembleRelease
```

A release APK embeds the JavaScript bundle and its Hermes bytecode, so it runs **on its own, without Metro or a computer**. Install this APK to use the app on the go. (Debug builds load JavaScript from Metro and are meant for development only.)

The output is `android/app/build/outputs/apk/release/app-release.apk`. If `android/keystore.properties` exists the APK is signed with that keystore; otherwise it is signed with the debug key, which still installs fine.

```properties
storeFile=/path/to/keystore
storePassword=...
keyAlias=...
keyPassword=...
```

### Project layout

```
App.tsx                 navigation, theme and query client setup
src/components          UI components (card, 3D carousel, dialogs, ...)
src/screens             home screen, add/edit card screen
src/data                card storage (AsyncStorage)
src/modules             native module wrappers (HCE-F, card number conversion, notification permission)
src/state               active card state
src/themes              Material 3 themes and spacing scale
src/locales             Korean and English translations
android/app/src/main/java/eamu/ceed/yaepe
                        HCE-F service and native modules (Java/Kotlin)
```

## Special Thanks

- [@dogelition_man](https://github.com/ledoge) — card number conversion code
- [@juchan1220](https://github.com/juchan1220) — original eAMEMu / eAMEMu_RN
