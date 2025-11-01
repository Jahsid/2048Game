# 2048 Game (Expo + React Native)

A small, mobile-first implementation of the classic 2048 game built with Expo, React Native, TypeScript and file-based routing (expo-router).

This README documents the project structure, what each file/folder does, how to run the app locally, development tips, and relevant references.

---

## Quick start

Prerequisites
- Node.js (LTS)
- npm or yarn
- Expo CLI (optional): `npm i -g expo-cli` (you can also use `npx expo`)
- Android Studio / Xcode if you want to run emulators

Install dependencies

```bash
npm install
# or
# yarn
```

Start the dev server

```bash
npm run start
# or
# expo start
# To clear cache:
# expo start -c
```

Run on Android emulator / device

```bash
npm run android
```

Run on iOS simulator (macOS only)

```bash
npm run ios
```

Notes
- This project uses `expo-router` (see `app/` directory). The router expects an `app/` folder with route files.
- If you add or remove assets, restart the bundler if you run into missing asset errors.

---

## High-level project structure

Root files (important ones)
- `app.json` - Expo project configuration.
- `package.json` - npm scripts and dependencies.
- `tsconfig.json` - TypeScript configuration.
- `declarations.d.ts` - custom module declarations for assets (mp3, images) so TypeScript can import them.
- `eslint.config.js` - ESLint configuration.
- `README.md` - this file.

App entry and routing
- `app/` - expo-router routes and screens. `app/index.tsx` is the main screen for the game.
   - `app/_layout.tsx` - layout file used by expo-router. It wraps all routes. We use it to provide global providers (SafeArea, GestureHandler root) so each screen inherits them automatically.

Source code folders
- `components/` - small presentational components used by the app:
   - `Board.tsx` - the game board UI; renders rows/cells.
   - `Cell.tsx` - individual tile component and styling.
   - `Title.tsx` - header with score and restart button.
   - `GameOverlay.tsx` - modal displayed on win/game-over.
   - `Instructions.tsx` - the how-to-play collapsible panel.

- `logic/` - game rules and pure logic (this is the most important folder to test):
   - `gameLogic.ts` - grid creation, move logic, merging, adding random tile, and game-over/win checks. Keep this pure and unit-testable.

- `hooks/` - custom React hooks:
   - `useSwipe.ts` - swipe detection hook using `react-native-gesture-handler` (returns a `Gesture` to be used with `GestureDetector`).
   - (potential) `useAudio.ts` - a suggested hook to centralize audio loading (not yet present — recommended improvement).

- `assets/` - static resources:
   - `assets/audio/` - mp3 files used for background music and SFX.
   - `assets/images/` - app icons and images.

- `app/` (routes) and `App.tsx`
   - Because this project uses `expo-router` we rely on `app/index.tsx` and `app/_layout.tsx` for entry. A previous root `App.tsx` was removed to avoid duplicate entry points.

Scripts
- `npm run start` - starts the Expo dev server (same as `expo start`).
- `npm run android` - build & run on Android emulator (expo run:android).
- `npm run ios` - run on iOS simulator.
- `npm run reset-project` - helper script to reset starter code (present in this repo).

---

## How the main pieces work (short)

- Game logic (`logic/gameLogic.ts`) is intentionally pure JavaScript/TypeScript. It accepts a grid and returns a new grid and score for moves. This file should be covered by unit tests.
- UI layers (`components/`) read from React state (`app/index.tsx`) and render accordingly.
- Swipe gestures are handled by `react-native-gesture-handler` via `hooks/useSwipe.ts` which returns a `Gesture` used with `<GestureDetector gesture={...}>`.
- Safe area support is provided by `react-native-safe-area-context`. `app/_layout.tsx` wraps routes in `SafeAreaProvider` and we call `useSafeAreaInsets()` where needed.
- Audio is loaded via `expo-av` and played using simple `Audio.Sound` instances. Consider extracting audio behavior into a `useAudio` hook.

---

## Recommendations & Code-quality

1. Unit tests for `logic/gameLogic.ts` (Vitest or Jest) — high priority. The logic is pure and easy to test.
2. Make the board responsive: replace fixed sizes with `useWindowDimensions()` to calculate board/cell sizes.
3. Move global providers (SafeArea, Gesture handler root) to `app/_layout.tsx` (already done).
4. Extract audio loading/cleanup to `hooks/useAudio.ts`.
5. Add lint & format scripts and consider enabling `strict` in `tsconfig.json` for stronger type guarantees.
6. Replace occasional `JSON.stringify` comparisons in render code with a proper equality helper exported from `logic/gameLogic` if you need grid equality checks.

---

## Files & folders (detailed)

- `app/` — expo-router routes
   - `app/_layout.tsx` — global providers (SafeAreaProvider, GestureHandlerRootView). See: https://expo.github.io/router/docs/layouts
   - `app/index.tsx` — main game screen and UI wiring (state, handlers, audio). This is the app entry under expo-router.

- `components/` — presentational parts
   - `Board.tsx` — renders the game board. Recommendation: compute board size dynamically using `useWindowDimensions()`.
   - `Cell.tsx` — tile UI (colors, text). Keep styles here.
   - `Title.tsx` — header.
   - `GameOverlay.tsx` — win/lose modal overlay.
   - `Instructions.tsx` — expand/collapse help.

- `hooks/`
   - `useSwipe.ts` — gesture hook using `react-native-gesture-handler` (returns a `Gesture` for `GestureDetector`).
   - Add `useAudio.ts` — suggested to centralize `expo-av` usage (not implemented yet).

- `logic/`
   - `gameLogic.ts` — all game rules and functions. Keep pure. Export types like `Grid` and `MoveDirection` for reuse.

- `assets/` — images and audio
   - `assets/audio/*` — mp3s used by the app. These are imported with `import <file> from '...mp3'` (see `declarations.d.ts` to enable this in TypeScript).

- `declarations.d.ts` — asset module declarations for TypeScript (mp3, png, jpg etc).

- `scripts/reset-project.js` — helper utility used by the starter template.

- `android/`, `ios/` — native folders generated by Expo when needed (do not edit unless you understand native changes).

---

## Troubleshooting

- If you get "asset not found" errors after adding/removing images or audio, restart Metro with `expo start -c`.
- If gesture handling doesn't work on a device, ensure `GestureHandlerRootView` is present at the root (`app/_layout.tsx`).
- If TypeScript complains about importing mp3/png assets, ensure `declarations.d.ts` exists and restart the TypeScript server.

---

## References (reading)

- Expo docs: https://docs.expo.dev/
- Expo Router (file-based routing): https://expo.github.io/router/docs
- react-native-gesture-handler: https://docs.swmansion.com/react-native-gesture-handler/docs/
- react-native-safe-area-context: https://github.com/th3rdwave/react-native-safe-area-context
- expo-av (audio): https://docs.expo.dev/versions/latest/sdk/av/
- @react-native-async-storage/async-storage: https://github.com/react-native-async-storage/async-storage

---

If you want, I can now:
- Make the board responsive (compute sizes from `useWindowDimensions`).
- Add unit tests for `logic/gameLogic.ts` using Vitest and a small test suite covering moves and merges.
- Add a `useAudio` hook and move audio logic there.

Tell me which of those you'd like me to implement next and I'll start.
