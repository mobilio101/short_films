# Render orders (for the laptop robot)

One file per film: `my-film/queue/<film>.json`. Push it to `main`; the laptop robot checks every
90 seconds, renders it, copies the mp4 to Google Drive, uploads it to YouTube as **private**, and
writes the result back:

- `queue/done/<film>.json`: it worked (render time, length, loudness, Drive link, YouTube link)
- `queue/failed/<film>.json`: it did not (`step` and `error` say where and why)

A film is done once: the robot skips an order that already has a done or failed file.
**To render again**, delete that film's done or failed file (and change the order if needed).

## Order format
```json
{
  "film": "acoustic-kitty",
  "composition": "AcousticKitty",
  "channel": "smirkman",
  "durationSeconds": 57,
  "title": "What Happens If the CIA Turns a Cat Into a Spy?",
  "description": "First line matters most for search.\n\nSources: ...\n\n#facts #history #shorts",
  "tags": ["weird facts", "true story"],
  "category": "Education",
  "language": "en",
  "madeForKids": false,
  "captions": "my-film/src/films/acoustic-kitty/captions.en.srt",
  "privacy": "private",
  "publishAt": null
}
```

| Field | Needed | Meaning |
|---|---|---|
| `film` | yes | Same as the file name. The mp4 is saved as `my-film/out/robot/<film>.mp4` on the laptop (never overwritten: a second render gets a date in the name). |
| `composition` | yes | Composition id in `src/Root.tsx`. |
| `channel` | yes | Channel id from `channels/channels.json`: `inkredible`, `drop`, `smirkman`, `step`. |
| `title` | yes | YouTube title (max 100 characters). |
| `durationSeconds` | recommended | Expected length. The robot fails the film if the mp4 is more than 1.5 s off. |
| `description`, `tags` | recommended | YouTube description and tags. |
| `category` | no | `Education` (default), `Entertainment`, `Howto & Style`, `People & Blogs`, `Comedy`, `Film & Animation`, `Science & Technology`. |
| `language` | no | Language of title and voice (`en`, `ko`). Also the caption language. |
| `madeForKids` | no | Always `false` for our channels. |
| `captions` | no | Path to the `.srt` file, from the repository root. |
| `privacy` | no | Ignored: every upload starts **private** (also forced by Google until the API audit). |
| `publishAt` | no | ISO time, e.g. `"2026-12-01T09:00:00+09:00"`. YouTube publishes the private video then (works after Google's audit). |
| `concurrency` | no | Override render concurrency (default: 4 for `smirkman` 3D, 8 for the others). |

## Results
`upload` in a done file:
- `"done"`: uploaded; see `youtube.url`.
- `"waiting for channel"`: the channel is not connected yet. On the laptop run
  `my-film\scripts\robot\add-channel.bat <channel>`; the robot then uploads all waiting films.
- `"error, will retry"` / `"failed"`: the upload failed (tried up to 3 times); see `uploadError`.

`drive.status`: `"done"` (with `drive.link`), `"waiting for Drive setup"` (run
`add-channel.bat drive`), or an error that is retried.

`loudnessLUFS`: measured loudness of the mp4 (recorded only; YouTube plays at about -14).

Only the robot writes in `done/` and `failed/`. Sessions write only the order files.

## Laptop files (outside the repository)
`%USERPROFILE%\.short-films-robot\`: `config.json` (branch, output folder), `client_secret.json`
(Google Cloud), `tokens\` (one per channel, plus `drive`), `logs\robot.log`, and `checkout\` (the
robot's own copy of the project). Set-up: `scripts\robot\install-robot.bat` (once),
`add-channel.bat <channel>` (per channel), `robot-status.bat` (is it running?).
