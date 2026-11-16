# New channel rules: read before every film for this channel

The channel's name and logo are still to be chosen (working name: "new channel"). These rules are
separate from Inkredible's (`CLAUDE.md`); nothing from Inkredible's look (Newsprint, ink-blot
characters, the ink-drop mascot, Bungee captions) is used here. Approved by the user on 16 Nov 2026
after the 10-second test `Test-Cabin3D`.

Reference channels are for feel only. Never copy their characters, worlds, titles, topics or scripts.
- **Ricks Clips** (@RicksClips3000): the format leader (2D characters in bright 3D worlds, strange true
  facts). Our research is in `research/ricks-clips-report.md`.
- **Bradikinin** (@BradikininVideos): its mascot is a white round head with black rectangular
  sunglasses, no mouth, a white shirt and black tie on red. Our main character must never be mistaken
  for it: skin-coloured face, round shades, a visible smirk, colourful outfits, bright 3D worlds.

## The look: "3D world, 2D characters"
Every Short is a real 3D place built in code, with flat 2D cartoon characters standing inside it.
Bright, modern and comic, never muted or vintage.

- **The world is real 3D**: Three.js inside Remotion (`@remotion/three`). Rooms, streets, ships and
  props are built from shapes in code. Every texture (wood grain, brick, plaster, maps, rugs, the sky
  outside) is painted in code on a canvas. No downloaded models, no images, no AI.
- **Black ink outlines on every 3D edge**: thick lines (about 5–6.5 px at 1080×1920) on walls, corners,
  furniture and props, not just the boxes.
- **Bright daylight and saturated colour.** Each story gets its own palette (teal and yellow, deep
  blue night, red and gold), but always clean and bright. Avoid one tone everywhere: add colour
  accents (a life ring, a rug, a flag, bottles) so no scene is all brown.
- **Light comes from things in the scene** (sun through a window, a lantern, a candle, a lamp) with
  real shadows. Soft gradients, glows and haze are allowed.
- **Depth in three layers:**
  1. **Back:** the 3D world, slightly out of focus (CSS blur about 1.8 px) with a light warm haze (fog).
  2. **Middle:** the flat 2D characters, always sharp.
  3. **Front:** a few props right in front of the lens (a post, a crate, ropes), in their own 3D
     layer, heavily blurred (about 7 px), kept to the frame edges so they never cover a face.
  Add depth cues where they fit: sunbeams with drifting dust, a contact shadow under each character,
  floorboards and roads that run away from the camera.
- **Camera:** low (about 1 m), wide (about 64° field of view), always slowly moving (eased push-ins,
  drifts, travelling through the world). Short shakes on big moments.

## Characters
- Built with `src/characters/toon/Toon.tsx`: bold black outlines, flat bright colours (`POP`
  palette), a **triangle shirt** (narrow shoulders, wide hem) with a **line pattern** (stripes, wavy,
  pinstripe, zigzag), thin stick arms spread away from the body with round hands, thin legs and chunky
  shoes, **chunky black eyebrows**, and bold hats.
- **Head shapes tell you who someone is:**
  - **Round:** the main character and likeable people.
  - **Square:** authority and workers (officials, guards, bosses, soldiers, builders).
  - **Inverted triangle:** schemers and know-it-alls (con men, smug kings, rivals).
- **Expressions:** neutral (deadpan), sneaky, smug, shock, panic, grin, happy, angry. Comedy comes
  from contrast: a calm deadpan face that suddenly explodes into shock, then goes back.
- Eyebrows float on top of hat brims (cartoon convention) so the acting always shows.
- Characters are placed by projecting their 3D floor spot onto the screen with the same camera as the
  3D scene, so they stay standing in the world while the camera moves.
- Characters always breathe and move a little; squash and stretch on jumps and landings.

## The main character
- `MAIN` in `src/characters/toon/Toon.tsx`: a **round head**, **round black sunglasses**, the
  **closed smirk** (lips together, one corner pulled up, a dimple) and **one raised eyebrow**. Cool,
  cynical, always knows something. Name to be chosen with the channel name.
- **His outfit changes every story** (captain, explorer, knight, inventor…), but the face, the shades
  and the smirk never change. Those are how viewers recognise him.
- **His running gag:** on a big shock his shades fly off his face; he looks around deadpan without
  them; they drop back onto his nose with a *clink* and the smirk returns.

## Story
- One strange, concrete thing (an object, a rule, a job, a place) + a paradox or loophole (it seems
  impossible, illegal or pointless) + the real reason, revealed at the end. Avoid textbook "how X
  works" topics unless there's a strange object or person to follow.
- True stories only: check every fact online, use what the sources agree on, never invent events.
- Hook in the first sentence (first word at 0 s): an odd action, a "you" situation, or "X is illegal.
  Yet…". Then a "So… / But… / Then…" escalation with someone doubting or laughing, the explanation
  ("You see…") at about 70%, a "So…" payoff at about 85–90%, and one plain closing line. No intro, no
  sign-off, no call to action; end cleanly so the Short loops.
- Death and cruelty are shown by suggestion, never graphically.

## Format and pace
- Vertical 1080×1920, 30 fps, about 55–60 seconds.
- Voiceover of about 165–185 words, fast and steady (about 3.3 words per second), with no dead air.
- Shots of about 6–10 seconds where the camera keeps moving, joined by dissolves; hard cuts only for
  big moments.
- Captions: one or two words at a time, big, white with a black outline, in the middle of the screen
  (inside the safe area: nothing important within 250 px of the bottom, 160 px of the right, 200 px
  of the top). The caption font will be chosen with the branding.

## Sound
- Every sound effect is generated in code by `scripts/make-sfx.mjs` (run `npm run sfx`). Never
  downloaded, sampled, library or AI sounds. Ship set: `waves` (loop), `creak`, `clink`, plus the
  existing library (`splash`, `whoosh`, `pop`, `boing`, `seagull`, …).
- A quiet ambience bed under every scene, a sound on every action, the voice always loudest. Keep
  peaks below about -1 dB (check with `ffmpeg -i file.mp4 -af volumedetect -f null -`).
- No music unless it's generated in code.

## Rendering
- **Render full videos on the user's laptop** (NVIDIA RTX 5070 Laptop, 8 GB VRAM). The project is
  cloned at `C:\claude\short_films` (branch `style-3d-world-prompts`). The user double-clicks
  `C:\claude\short_films\render.bat`, which pulls the latest code from GitHub (and runs `npm ci` if
  packages changed), asks for the composition name, renders with `--gl=angle --concurrency=8`, and
  opens the folder with the mp4 (`my-film\out\<name>.mp4`). `render.bat` exists only on the laptop
  (not in git). Windows Graphics settings have Remotion's `chrome-headless-shell.exe` set to
  "High performance".
- **Measured speed** of `Test-Cabin3D` (10 s, 1080×1920): laptop `--gl=angle` about **16 s**
  (concurrency 4: 18 s, **8: 16.6 s, steadiest**, 12: 16–20 s, 16: 17.6 s; `--gl=vulkan` 17 s);
  laptop software rendering (`--gl=swangle`) 194 s; this cloud machine about **18 minutes**. So a
  60-second Short takes about 1–2 minutes on the laptop and about 2 hours in the cloud.
- **So the workflow is:** build and check stills here in the cloud (`--gl=swangle
  --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`, about 10 s per still),
  commit and push, then the user renders the video on the laptop and shares it back (Google Drive).
  Render short cloud videos only when the laptop isn't available.
- Never ask the user to edit project files on the laptop: local edits make `render.bat`'s `git pull`
  fail.
- Shadows use `shadows="percentage"` (PCF). three.js removed PCFSoftShadowMap; the remaining
  `THREE.Clock` warnings in the render log come from React Three Fiber and are harmless.
- Before rendering a video: render stills of key frames and check them for mistakes (objects covering
  faces, characters floating, the camera inside objects).

## Where things are
- `src/characters/toon/Toon.tsx`: the character system (`Toon`, `Look`, `CAST`, `MAIN`, `POP`).
- `src/films/test/cabin3d/`: the reference scene (`Cabin3D.tsx`: 3D room, outlines, layers, sunbeam,
  camera, timeline and soundtrack; `textures.ts`: textures painted in code). Copy this pattern.
- `src/films/test/toon/`: character sheets (`Test-ToonSheet`, `Test-SmileSheet`, `Test-ShadesSheet`).
- `prompts/3d-world-style-prompts.md`: step-by-step prompts for this style.

## Workflow
- Before animating: write the plan (facts with sources, script, shot list) in `STORY.md` and wait for "go".
- Voice first, then time every shot, caption and sound to its word timings.
- Show stills before rendering video; share results as playable videos, never localhost links.
- The user is not a developer: explain things simply.
- Commit and push finished work to GitHub (`mobilio101/short_films`).
