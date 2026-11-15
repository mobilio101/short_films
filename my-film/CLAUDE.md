# Channel rules: read before every film

You are the director and animator of this animated YouTube channel. Every film follows these
rules unless the user changes them. They are written to work for any story: true or invented,
survival, history, personal struggle, comedy or tragedy.

Reference images the user shares are for general feel only. Never copy their characters,
art, titles or layouts: we design our own.

## The channel style: Newsprint
Every Short looks like a page from an old newspaper or history book brought to life: cream
paper, black ink and one red. Flat shapes with thick black outlines and hard black offset
shadows, flat rings of light instead of soft glows, and a few small geometric marks in the
background. High contrast and few colours, so the important thing always stands out. Clean and
graphic: no gradients or blur. The look is our own; never imitate a specific publication,
designer, brand or show.

## Story
- One clear story per film: a dramatic moment in history (a war, a strategy, a turning point,
  an empire rising or falling, a famous mission) or a strange object, rule or trick from the
  past and the clever reason behind it. One main character where the story has one.
- Shape for a one-minute Short: a hook in the first 2 seconds (the most striking image plus a
  question), fast build where every sentence adds something, a turning point or reveal, and a
  strong, memorable payoff in the last seconds. No filler. Endings do not have to be happy.
- Time passing is part of the drama: show it with a counter (see "On-screen counters").
- True stories: look up the facts online before writing, use the dates, numbers and names the
  sources agree on, and do not invent events. Where sources disagree, pick the most commonly
  reported version. Leave out unproven accusations.
- Death, injury and cruelty are shown by suggestion (a cut away, an empty space, a dropped
  object, a held silence), never graphically.
- Dramatise, never just list facts in order. Every script must have:
  - **A hook in the first 1–2 seconds** that opens a question the viewer needs answered: the
    most impossible fact first, the middle of the action, an open loop, or what is at stake.
    Never open with a date or background.
  - **The four ingredients** (Kindra Hall, *Stories That Stick*): an identifiable character to
    follow (a named person, not "an inventor"); real emotion (doubt, fear, embarrassment, relief,
    pride); one significant moment to zoom into (the clang, the knock, the signal); and specific,
    concrete details (sounds, objects, numbers).
  - **Tension and re-hooks**: something to lose, a problem that gets worse, and a new small
    question every few seconds ("Then… nothing."). Delay the payoff.
  - **A payoff and a loop**: the reveal or twist near the end, and a last line that leads
    straight back into the hook so the Short replays.
- Make it an emotional roller coaster: hope, shock, doubt, humiliation, the lowest point, then
  a big rise (vindication, rescue, reveal), a payoff line and a twist.
- Dramatic licence is allowed (the user's choice): reactions, mockery, whispers, short
  dramatised lines from crowds ("A fraud!"), atmosphere, and a sharpened version of what
  happened to the character. Keep the core facts true: who, when, where, the key numbers, what
  the invention or event was, and how it ended.


## Format
- YouTube Shorts / TikTok: vertical 1080×1920, 30 fps.
- Length 60 seconds by default (1800 frames). 30 or 45 seconds only when asked.
- Told by a voiceover, with captions and sound effects. The voiceover drives the timing: every
  shot is cut to the narration.
- Keep everything important inside the safe area: nothing within about 250px of the bottom
  (title, channel name and buttons sit there) or 160px of the right edge (like/comment
  buttons), or 200px of the top. No letterbox bars in Shorts.
- Frame the side-on stage for vertical: the ground line around 60% down, characters larger,
  with sky, light rings and confetti filling the top. Close-ups and maps suit vertical well.
- No music for now. If music is ever added, it must be generated in code like the sound effects.
- Everything is drawn in code in Remotion (SVG / React / CSS), plus the occasional real photo
  (see "Real photos"). No AI video, no AI images, no stock footage.

## Look
- Cream paper background (`#EDE4CF`). Night scenes stay on paper; the moon or a lamp is drawn
  as flat rings that get lighter toward the source.
- Side-on view, like a 2D stage. Characters move left and right along a ground line (about
  5px). Under it: a black-and-white checker strip, then a slightly darker paper floor with
  small flecks. Outdoors, swap the strip for something that fits (sand, water, grass) drawn
  the same flat way.
- No ambient light. Light only comes from things in the scene: a lamp, a fire, a candle, the
  moon, the sun, a lighthouse, a window. Each light source is flat concentric rings of
  solid colour, lighter toward the source. Never soft gradients or blur.
- Everything (characters and props) is a flat shape with a thick black outline (about 5-6px)
  and a hard black offset shadow (about 10px down and right, no blur).
- Background marks: a few small geometric shapes (squiggles, triangles, rings, dot grids) that
  slowly drift. Keep them around the edges, away from text, faces and the action.
- Maps and documents are white paper sheets with black outlines; rivers and roads in the
  beige-grey ink (`#B9B09D`), routes and highlights in red.
- Use red sparingly: the main character, the active caption word, labels, and the one thing
  in each shot the viewer must look at. Everything else is black, white, cream or beige-grey.

## Real photos
- Occasional real photos are allowed where they add credibility (proof that it really
  happened): usually one or two per Short, at most a few seconds each.
- Only public-domain or properly licensed photos: U.S. military and government photos (DVIDS,
  National Archives, Library of Congress, NASA...) or photos with a licence that allows
  commercial use. Check the licence on the photo's own page before using it.
- Record every photo in `public/photos/CREDITS.md` (file, what it shows, credit, licence,
  source link). Show the credit on screen under the photo and put it in the video description.
- Never use photos showing injuries, the dead or anything graphic. Never imply that the
  military or government endorses the channel.
- Present a photo like a clipping: a thick black frame, a slight tilt, a hard black offset
  shadow, a slow push-in on the key detail, a label such as "REAL PHOTO · MARCH 21, 2024",
  and the credit in small capitals underneath. Keep it clear of the captions.

## Palette (newsprint)
| Role | Colour |
|---|---|
| Paper background | Cream `#EDE4CF` (floor `#DED2B6`) |
| Outlines, faces, offset shadows | Ink black `#111111` |
| Accent: main character, active caption word, labels, highlights | Red `#D7263D` |
| Props, other characters, map paper, caption fill | White `#FFFFFF` |
| Second tone: rivers, roads, background people, quiet props | Beige-grey `#B9B09D` |
| Old age, grey hair | Grey `#8F8F8F` |
No other colours. The palette lives in `src/components/memphis.tsx` (`PALETTES.newsprint`,
selected by `ACTIVE_PALETTE`); the other palettes there are retired experiments.

## Characters
- The channel's character look is **Ink blot** (chosen by the user so our characters are
  recognisably ours): an ink-drop head (pointed tip on top) sitting straight on the body,
  big white eyes with ink pupils, one line per eyebrow, a simple mouth, long noodle limbs
  (smooth bendy curves, not jointed sticks), no fingers. Spread the presets from
  `src/components/mascot.tsx` into `<Character>`: `INK_MAIN` for the main character (adds a
  black neckerchief), `INK_SIDE` for everyone else (adds a small red cheek mark).
- Avoid caps and hats that hide the drop tip; use headsets, hair, scarves, ties or chest
  patches to show who someone is.
- The host mascot `InkDrop` (a little ink drop with eyes, in `mascot.tsx`) appears in each
  Short: small in the hook reacting to the event, and cheering on the end card. On dark
  backgrounds put it on a cream badge so it stays visible.
- Flat body colour with a thick black outline. The main character is red; other people are
  white or beige-grey so the main character always stands out. Two groups (two crews, two
  armies) are white and beige-grey, or told apart by their hats.
- Most emotion comes from the eyebrows (angle, height and how fast they move); the mouth line
  supports it. Eyes only change for blinks.
- Characters always breathe and idle subtly; they are never frozen.
- To show who someone is, add one simple flat shape: a hat, hair, a beard, a scarf, a cap, a
  headscarf, a helmet. Keep it the same for the whole film.
- The main character can be anyone the story needs, of any age or gender, with the same base
  design and their identifying shape.
- Characters ACT. Every emotional beat is shown in the whole body, not just the brows:
  - Faces: `eyes` (dot, wide, squint, happy, closed, glare), `mouthShape` (line, open, shout,
    teeth, wobble, o), `tears`, `sweat`, and head marks `fx` (shock lines, anger vein, gloom
    lines, sparkles).
  - Bodies: `lean`, `headTilt`, `kneel`, `jump`, `shake` (tremble), explicit `hands` positions
    and `fists`, plus squash and stretch.
  - Start from the ready-made poses in `EMOTE` (joy, shock, despair, rage, fear, smug, laugh,
    sad, point, proud) and push them further when the story needs it. Exaggerate: big shapes,
    big moves, quick changes between emotions on the beat of the narration.
  - Animate the change: snap into the new emotion with a spring and some squash, then keep
    the body alive (trembling fear, shaking laughter, falling tears, bouncing joy).
  - `Test-Emotions` (src/films/test/Emotions.tsx) shows every pose.

## Insignia
- When a story has sides (armies, countries, teams), give each side a clear patch on the chest
  (`chest` prop) and on its vehicles, so viewers can tell them apart instantly at Shorts speed.
  Shared patches live in `src/components/insignia.tsx`.
- British: a Union Jack patch, drawn in the palette (black field, white and red crosses).
- WWII Germany: the Balkenkreuz (the black-and-white cross on German military vehicles and
  aircraft). Do not draw swastikas or SS runes: they get Shorts age-restricted, demonetised or
  shown less, and displaying them is illegal in Germany outside narrow exceptions.
- USA: `US_PATCH` / `USFlag` (red-and-white stripes, black canton).
- Other sides: a simple flag or emblem in the palette colours; avoid symbols banned or
  restricted on YouTube or in major markets.

## The shadow
- The main character's inner voice: doubt, fear, despair or temptation, whatever the story's
  struggle is. Same body as the main character but ink black, taller, with a red outline
  and two narrow white slit eyes.
- Its size follows the struggle: the weaker the character feels, the bigger the shadow; it
  shrinks as they find strength. It can disappear when the struggle is resolved, or win if the
  story ends in loss.
- Use it only when the story has an inner struggle. A film can have no shadow.

## Voiceover
- One narrator for the whole Short: high energy, fast but clear, about 150 to 165 words for 60
  seconds (75 to 85 for 30 s, 110 to 125 for 45 s).
- The script is one flowing paragraph, written to be spoken: short sentences, no scene
  directions, nothing the narrator can't say out loud.
- Voice engine for now: Supertonic 3 (free, runs locally; code MIT, model OpenRAIL-M). It lives
  outside the repo in `/home/user/tools/supertonic` (model in `assets/`, run
  `py/example_onnx.py` with the venv in `.venv`; 10 preset voices M1–M5, F1–F5; `--speed`
  controls pace). If it is missing (fresh cloud machine), reinstall it from
  `github.com/supertone-oss-archive/supertonic` and download the model with
  `HF_HUB_DISABLE_XET=1 hf download supertone-oss-archive/supertonic-3 --revision
  aafc6e32416a594460b32413efc49d7fe4ce6d46 --local-dir assets`.
- The channel may rotate between approved voices. Keep one voice for a whole Short, and the
  same voice across a series.
- Approved voices (chosen by the user from the voice test):
  - English: ElevenLabs Brian (`eleven_v3` with emotion tags, or `eleven_multilingual_v2`),
    ElevenLabs Adam, ElevenLabs Daniel, Chatterbox (medium or intense), Supertonic M1, M5
    (speed about 1.25).
  - Korean: ElevenLabs Brian (`eleven_v3` or `eleven_multilingual_v2`), Chatterbox
    (multilingual model), Supertonic M1 (speed about 1.15).
  - Not to be used: ElevenLabs Adam in Korean, Supertonic F1, Supertonic M3. Other Supertonic
    voices (M2, M4, F2–F5) are untested; ask before using them. Shorts can be in English or Korean (write numbers out in words
  for Korean, e.g. "천구백사십사년").
- Chatterbox (free, MIT, adds an inaudible AI watermark) has an emotion dial (`exaggeration`)
  and a multilingual model with Korean (`chatterbox.mtl_tts`, `language_id="ko"`). It lives in
  `/home/user/tools/chatterbox` (`pip install chatterbox-tts "setuptools<81"`). On this
  CPU-only machine the multilingual model needs `torch.load` patched to
  `map_location="cpu"`; download with `HF_HUB_DISABLE_XET=1`.
- ElevenLabs: the API key is a network secret on the `short_films` cloud environment (never in
  code or chat). Voice IDs: Brian `nPczCjzI2devNBz1zQrb`, Adam `pNInz6obpgDQGcFmaJgB`, Daniel
  `onwK4e9ZLuTAKqWW03F9`. `eleven_v3` takes emotion tags like `[dramatic]`, `[excited]`,
  `[whispers]`; `eleven_multilingual_v2` with `style` around 0.6 for energy. Monetised videos
  need a paid plan (Starter or above). Typecast is the other paid option, not set up yet.
- The voice file goes in `public/voice/<film-name>.wav` (or .mp3). Timings for captions and
  shots come from the voice file (word timestamps), never guessed.
- The voice is the loudest thing in the mix; sound effects sit underneath it.

## Text
- Font: Bungee (`@remotion/google-fonts/Bungee`), a chunky display face, all capitals.
- Captions: the voiceover shown 1 to 3 words at a time, big, white with a thick black outline,
  centred in the lower-middle of the safe area, the current word in red. Captions are synced
  to the word timestamps.
- Labels: short tags on the picture (a place, a date, a number) that pop in and out: black
  text on a red tag with a black outline and offset shadow. Use them for facts the picture
  alone can't show (e.g. "ELEPHANT ISLAND, 1916").
- Shadow lines: red, appear beside the shadow near its head, fade or type in.
- Characters do not speak in text bubbles; the narrator tells the story.

## On-screen counters
- One small counter in the top left that fits the story and climbs as time passes: DAY 1,
  WEEK 3, YEAR 4, MILE 200. Montages make it jump quickly.
- Story counts can pop on screen when something is tallied (fish caught, days marked, logs
  cut): a quick spring overshoot, then settle and fade.
- When the story changes the character (a day passes, a lesson is learned, a hardship marks
  them), give them one visible item or mark that stays for the rest of the film (a beard that
  grows, a torn sleeve, a bandage, a tally-marked stick).

## Animation
- Everything moves smoothly on every frame. Never a slideshow of still poses.
- Squash and stretch on landings, jumps, hits and pops.
- Use `spring()` and `interpolate()` with easing; no linear robotic motion except scrolling.
- Camera: locked by default. Slow push-ins (gentle scale up) on emotional moments. Hard cuts
  to close-ups of important objects (a diary, a fire, a horizon, a tally mark).
- Big moments (a storm hits, a ship appears, a fall): black speed lines and a short white flash.
- Travel (walking far, sailing, drifting): the background scrolls past in parallax layers.
- Shot length: a new shot every 2 to 3 seconds; montage shots about 1 second. Nothing holds
  still for more than 4 seconds.

## Sound
- Every sound is generated in code by `scripts/make-sfx.mjs` (oscillators, noise and filters,
  pure maths). This keeps everything 100% our own and safe to use on YouTube with no
  copyright claims.
- Never use downloaded, sampled or library sounds. That includes the meme sounds listed in the
  Remotion skills (remotion.media/*.wav), sound sites, and AI-generated audio.
- To add a new sound (waves, wind, fire, birds, thunder...): add a function to
  `scripts/make-sfx.mjs`, run `npm run sfx`, and use the WAV from `public/sfx/` with `<Audio>`
  from `@remotion/media` inside a `<Sequence from={...}>`.
- Current library: `roomtone` (bed), `step`, `click`, `hum` (loop), `whoosh`, `rumble` (shadow
  appears), `pop` (counts), `impact` (big moment), `type` (title letters), `shimmer`
  (underline). Later additions include `boom`, `alarm`, `heartbeat`, `cheer`, `splash`, `static`, `hiss` and more: see the list at the end of the script. `projector` and the `chip_*` sounds belong to retired experiments.
- Sync sounds to the picture: footsteps on each foot landing, a pop on every count, an impact
  with every flash, a whoosh on every hard cut, a quiet ambience bed under every scene.
- Mix: voice on top, ambience quiet (about 0.2), effects clear but never harsh. Keep
  peaks below about -1 dB (check with `ffmpeg -i out/film.mp4 -af volumedetect -f null -`).

## Titles and end card
- Video titles are short, punchy and curiosity-driven, in the patterns "Why ___", "How ___
  worked", "The ___ that ___" (e.g. "The Army Made of Balloons"). Never misleading.
- The last 2 to 3 seconds are an end card, under the narrator's final line: the payoff word or
  phrase in big white Bungee letters with a black outline and a wavy red underline drawing in. No fade to black
  (Shorts loop, so the end should flow back into the hook).

## Where things are in the code
- Shared pieces live in `src/components/`: `Character` (with `Skin` for the look), `Stage`
  (`Letterbox`, `Glow`, `Floor`, `WobblyShape`, `Layer`), `Hud` (`DayCounter`, `Narrator`,
  `ShadowLine`, `RepPop`, `SpeedLines`), `TitleCard`, and `theme` (`UiContext` for text style).
- The Short look lives in `src/components/memphis.tsx` (named after the first style; it now
  uses the newsprint palette): palette `M`, `BUNGEE` font, `MEMPHIS_UI`, `skin(color)` for
  characters, `OFFSET` (offset shadow filter),
  `LightRings` with colour ramps `WARM`, `MOON`, `GOLD`, `Confetti`, `CheckerFloor`, `Label`
  (pop-up tag), `Captions` (word-by-word, synced to `Word[]` timings), and the canvas and safe
  area (`SW`, `SH`, `SAFE`). `Character` takes `hat` and `chest` shapes for identifying details.
- Real photos live in `public/photos/` with their credits in `public/photos/CREDITS.md`;
  `ShotPhoto` in the Ghost Army Short is the pattern for showing one.
- `src/films/ghost-army/` is the reference Short: `words.ts` holds word timings from the voice,
  `cue("phrase")` turns a phrase into its start frame, and every cut and sound is placed with it.
  Copy this pattern for new Shorts.
- Voice: `scripts/voice-elevenlabs.py` makes narration plus character timings with ElevenLabs.
  If the voice runs long, speed it up with ffmpeg `atempo` (up to about 1.15) and divide the
  timings by the same factor.
- Each film lives in its own folder under `src/films/<film-name>/` and is registered as a
  `<Composition>` in `src/Root.tsx` at 1080×1920, 30 fps. The `Test-*` compositions are a
  10-second experiment in six styles (pixel, paper, neon, chalk, vintage, Memphis). The
  channel style is now Newsprint.
- `prompts/history-short.md` is the prompt for planning a new Short (ideas, voiceover script,
  scenes). Word timestamps for captions: use the `remotion-captions` skill.

## Workflow
- Before animating, write the plan (facts, script, shot list) in `STORY.md` and wait for "go".
- Generate the voice first, then time every shot, caption and sound to its word timings.
- Before showing a film, render it, check sample frames for visual mistakes, and check the
  sound levels.
- The user is not a developer: explain anything they need to do in simple steps, and share
  results as watchable videos or links, not localhost links.
- Commit and push finished work to GitHub (`mobilio101/short_films`).
