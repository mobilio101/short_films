# Short films studio: start here

Four YouTube channels are made in this project. Read this file, then the rulebook for the channel
you are working on. The user is not a developer and speaks Korean: explain everything simply, in
Korean, and share results as images or playable videos, never localhost links.

| Channel | Language | Rulebook | Topic list |
|---|---|---|---|
| **Inkredible** | English | `INKREDIBLE.md` | `channels/inkredible/BACKLOG.md` |
| **역사 한 방울** (Korean Inkredible) | Korean | `INKREDIBLE.md` (Korean rules under Text) | `channels/drop/BACKLOG.md` |
| **SMIRKMAN** (3D world, 2D characters) | English | `SMIRKMAN.md` | `channels/smirkman/BACKLOG.md` |
| **한걸음** (self-improvement) | Korean | `HANGEOLEUM.md` | `channels/hangeoleum/BACKLOG.md` |

YouTube settings (descriptions, keywords, title and tag rules) for all four: `channels/channels.json`.
Brand files: `brand/`.

## How the work is split
Read `SESSIONS.md`: which session does what, how sessions hand work over, and the start message for
each kind of session. Current state of every film: `STATUS.md` (keep it up to date when you start or
finish something). Rendering and uploading run on the user's laptop: `AUTOMATION.md`.

## Rules for every session
- Work on your own branch (`film/<name>`, `plan/<channel>`, `auto/<topic>`), commit and push it. The
  총괄 (HQ) session merges finished work into `main`. Never rewrite `main`'s history.
- A film session changes only its own folder `src/films/<name>/`, its line in `src/Root.tsx`, its
  sounds, and `STATUS.md`. Shared code (`src/characters/`, `src/world3d/`, `src/components/`,
  `scripts/`) and the rulebooks are changed only by 총괄, so sessions don't overwrite each other.
  If a film needs a shared change, ask 총괄 (or the user) first.
- Never render full videos in the cloud (about 2 hours per Short). Render still frames to check the
  work; the laptop renders the video.
- Secrets: the ElevenLabs key is injected by the network proxy; never put keys in code or chat, never
  ask the user to paste one. Never bypass network or site blocks.
- Never ask the user to edit files on the laptop.
- Reference channels are for feel only: never copy their characters, art, titles or topics.
- True stories: check facts online and list sources in `STORY.md`.
- Every sound is generated in code; no downloaded, library or AI sounds; no AI images or video.
