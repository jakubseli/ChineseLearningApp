# Chinese for Czech speakers (working title)

Aplikace pro výuku čínštiny, vysvětlená česky. Covers the HSK 3.0 syllabus, levels 1–3, starting with HSK 1. Work in progress.

## Development

Requires Node 22.11+, a JDK (17 or 21) and Android Studio with the Android SDK. Builds a development build and installs it on a connected device or emulator:

```bash
npm install
npx expo run:android
```

## License

- Code: [MIT](LICENSE).
- Czech learning content in `content/source/`: all rights reserved (see its LICENSE file).
- Third-party data: each folder in `content/raw/` has its own license file.
- The app name and logo are not covered by any license. Forks must use their own.
