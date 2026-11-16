# Automation: render and upload with no hands

Goal (the user's): run everything from an iPhone, 100% remote. Cloud sessions make the films; the
user's Windows laptop renders them on its GPU and uploads them to YouTube automatically.
**Status: designed, not built yet.** The 자동화 (automation) session builds it.

## Design (agreed with the user, 16 Nov 2026)
```
iPhone (Claude app) ─ approve script, approve stills
   ▼
Cloud film session ─ builds the film, writes upload info, adds a render order, pushes
   ▼
GitHub (main) ─ the shared notice board
   ▼  checked every 1–2 minutes
Laptop robot (no AI, free) ─ git pull → render on GPU → loudness check → upload to the right
   YouTube channel → copy the mp4 to Google Drive → write the result (YouTube link or error) back
   ▼
iPhone ─ YouTube Studio notification
```

## Parts to build
1. **Render orders**: one small file per film, e.g. `queue/<film>.json` with the composition id,
   channel id (from `channels/channels.json`), title, description, tags, caption file, publish time.
   Results go to `queue/done/<film>.json` (YouTube link, render time) or `queue/failed/`.
2. **Robot** on the laptop (PowerShell or Node), started by Task Scheduler at log-on, survives sleep
   and restarts: poll GitHub, render, upload, report. Never edits tracked files except the queue
   results it commits.
3. **GPU settings**: `--gl=angle`. 3D films (SMIRKMAN) use up to three WebGL canvases per frame, so
   concurrency about 4–6 to stay inside 8 GB VRAM; 2D films (Inkredible, 한걸음) concurrency 8–12.
   Benchmark once per channel and save the best value. Encoding is a small part of the time.
4. **YouTube upload** through the official YouTube Data API (one Google Cloud project, one OAuth
   token per channel, all four channels as brand accounts under one Google account). Upload the
   caption file too (we already have word timings). Quota allows about 6 uploads a day.
   - Until Google's API audit is passed, API uploads are forced to **private**; the user taps
     "Public" in the YouTube Studio app. Apply for the audit at the start; after it, scheduled
     publishing is fully automatic.
   - Do not upload by clicking through YouTube Studio in a browser (fragile, and YouTube's terms
     forbid automated access): use the API.
5. **Google Drive copy** of each mp4 so the user can watch it on the iPhone.
6. **One-time setup on the laptop** is done by **Codex with computer use** (the user approved using
   Codex). We write the instructions; Codex installs, clicks Google's "Allow" screens in the user's
   logged-in Chrome, and tests one private upload. The user only confirms Google's phone prompt if
   asked. (Ego Lite was considered: it is a Mac browser; the laptop is Windows.)

## Open questions for the user
- How many YouTube channels exist already, and is the laptop's Chrome logged in to that Google account?
- Can the laptop stay on and plugged in at home?

## Laptop facts
- NVIDIA RTX 5070 Laptop, 8 GB VRAM, Windows. Project at `C:\claude\short_films`.
- `render.bat` (not in git) pulls, runs `npm ci` if needed, asks for a composition and renders with
  `--gl=angle --concurrency=8`. Measured: 10 s of 3D video in about 16 s.
- Remote Control folder sharing to cloud sessions showed `not_available` (Nov 2026), so the cloud
  can't drive the laptop directly; GitHub is the bridge.
