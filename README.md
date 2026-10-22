# Chinese for Czech speakers (working title)

An Android app for learning Mandarin Chinese, with every explanation written in Czech. It follows the HSK 3.0 syllabus (2025 revision), levels 1–3, starting with HSK 1.

*Aplikace pro výuku čínštiny, která všechno vysvětluje česky.*

## Status

Early development. Nothing to learn from yet.

Planned for version 1.0 (HSK 1):

- Vocabulary with spaced repetition
- Word details with example sentences and audio
- Stroke order and a tracing quiz
- Pronunciation and tones explained through Czech
- Short grammar lessons
- Progress stats and backup

No account, no ads, no data leaves your phone.

## Running it

Needs Node 22.11+, JDK 17 or 21, and Android Studio with the Android SDK. With a phone or emulator connected:

```bash
npm install
npm run content:build
npx expo run:android
```

`npm run content:build` makes the content database the app loads. Run it again after changing anything in `content/`.

## License

- Code: [MIT](LICENSE).
- Learning content in `content/`: [CC BY-SA 4.0](content/LICENSE).
- Third-party data keeps its own license, with a license file next to each dataset. The HSK word list comes from [HearMandarin](https://github.com/wzperson/hearmandarin-hsk-3-0-word-list) (CC BY 4.0).
- The app name and logo are not licensed.
