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

## Must-haves for every film (all channels)
Learned from studying successful Shorts channels (Nov 2026). Check all five before the user approves stills.
1. **Be ourselves, never a copy.** YouTube groups look-alike videos and shows copies to almost no one,
   and since July 2025 it treats mass-produced, repetitive videos as "inauthentic content", which can
   cost the **whole channel** its monetisation. Every film needs its own research, sources, script and
   scenes; never reuse a template with the words swapped. Learn from reference channels, never copy
   their topics, titles, scenes or thumbnails.
2. **One topic, one channel.** Before proposing a topic, check `channels/TOPICS.md` and search YouTube
   for it: if a big channel already made the same video, only go ahead with a clearly different angle.
   When the user picks a topic, claim it in `TOPICS.md` at once. Channels never share a topic, even
   when they are worked on at the same time. **The one exception: Inkredible (English) and
   역사 한 방울 (Korean) share topics**: the Korean film is written natively and recut, never translated.
3. **The mute test.** Mute the film and hide the channel name: would a viewer still know which channel
   it is? If not, strengthen the channel's signature (character, look, recurring gag, sound) first.
4. **Fast intro.** The first 2 seconds hold 2–3 cuts, each under 1 second, with the camera moving
   toward the subject, under the first line of narration. Then the channel's normal pace. (The first
   seconds decide whether viewers swipe away, YouTube's main Shorts signal.)
5. **Hook as a question** in the first sentence. "What happens if…?" is a strong form.

## How the work is split
Read `SESSIONS.md`: which session does what, how sessions hand work over, and the start message for
each kind of session. Current state of every film: `STATUS.md` (keep it up to date when you start or
finish something). Rendering and uploading run on the user's laptop by a robot: `AUTOMATION.md`.
**To get a film rendered, a film session writes its render order `queue/<film>.json` (format:
`queue/README.md`) in the same push as the upload info, and tells 총괄; once 총괄 merges it into `main`,
the laptop robot renders it, copies it to Google Drive and uploads it as private. Sessions never render
full videos in the cloud and never write `queue/done/` or `queue/failed/` (only the robot does).**

## Rules for every session
- Always speak to the user in polite Korean (존댓말, 예: "~합니다", "~해요"), never casual speech (반말).
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
