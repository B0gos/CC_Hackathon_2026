# CC Hackathon 2026 – AR Campus Navigator

A lightweight Expo/React Native app for discovering nearby campus landmarks using camera view, location, and compass heading.

## What's in this repo

- `my-app/` – Main app used for the project
- `my-app/app-example/` – Expo starter/example code kept for reference
- `Criteria.md` – Hackathon judging checklist

## Main features

- AR-style camera overlay for nearby places
- Auto-detect mode (point at a landmark to get details)
- Manual "Find Nearby" mode
- Optional Gemini summaries
- Optional Text-to-Speech playback

## Quick start

1. Open a terminal in `my-app/`
2. Install dependencies:

	```bash
	npm install
	```

3. (Optional) Add API keys in `my-app/.env`:

	```env
	GEMINI_API_KEY=your_key_here
	ELEVENLABS_API_KEY=your_key_here
	```

4. Start the app:

	```bash
	npm run start
	```

## Useful commands

Run from `my-app/`:

- `npm run start` – Start Expo dev server
- `npm run android` – Run Android build
- `npm run ios` – Run iOS build (macOS only)
- `npm run web` – Run web version
- `npm run lint` – Run lint checks

## Notes

- Camera + location permissions are required.
- Internet is required for place data and AI/TTS features.
