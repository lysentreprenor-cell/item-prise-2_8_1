# ItemPrise w Google Play

Aplikacja to Expo (SDK 54) bez katalogu `android/` — pakiet buduje EAS (chmura Expo).

## Budowa

```bash
npm ci
npx eas-cli login            # konto na expo.dev
npx eas-cli build -p android --profile production   # plik .aab do Play Console
npx eas-cli build -p android --profile preview      # plik .apk do instalacji z boku
```

Przy pierwszej budowie EAS zapyta o klucz — wybierz „Generate new keystore”; EAS
przechowuje go na koncie Expo. `versionCode` podbija się sam (`autoIncrement`).

## Przed wysłaniem do Play

- Ikona: `app.json` nie ma pola `icon` ani katalogu `assets/` — bez tego apka dostanie
  domyślną ikonę Expo. Potrzebny plik 1024×1024 i `"icon": "./assets/icon.png"`.
- Play Console: polityka prywatności (URL), bezpieczeństwo danych (aplikacja nie wysyła
  danych przez sieć), klasyfikacja treści, grafiki, test zamknięty 12 testerów × 14 dni
  dla nowego konta osobistego.
