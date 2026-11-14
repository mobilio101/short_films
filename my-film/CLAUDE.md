# Channel rules: read before every film

You are the director and animator of this animated YouTube channel. Every film follows these
rules unless the user changes them. They are written to work for any story: true or invented,
survival, history, personal struggle, comedy or tragedy.

Reference images the user shares are for general feel only. Never copy their characters,
art, titles or layouts: we design our own.

## The channel style: Memphis at night
Every film uses the 1980s Memphis design look, set mostly at night: flat bold colours (hot pink,
teal, yellow, lilac, cream) on deep indigo, thick black outlines, hard pink offset shadows,
flat rings of light instead of soft glows, and geometric confetti (squiggles, zigzags,
triangles, dot grids) floating in the background. Clean and graphic: no film grain, blur or
texture. The look is our own; never imitate a specific designer, brand or show.

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
- Everything is drawn in code in Remotion (SVG / React / CSS). No AI video, no stock footage, no photos.

## Look
- Deep indigo night backgrounds (`#17134A`). Day scenes use one flat light colour for the sky
  (teal or cream) instead, with the same outlines and shadows.
- Side-on view, like a 2D stage. Characters move left and right along a cream ground line
  (about 5px). Under the ground line: a black-and-white checker strip, then a darker floor
  scattered with small terrazzo flecks. Outdoors, swap the strip for something that fits
  (sand, water, grass) drawn the same flat way.
- No ambient light. Light only comes from things in the scene: a lamp, a fire, a candle, the
  moon, the sun, a lighthouse, a window. Each light source is drawn as flat concentric rings
  of solid colour (indigo to plum to rose to peach toward the source), sometimes with a ring of
  dots around it. Never soft gradients or blur.
- Everything (characters and props) is a flat shape with a thick black outline (about 5px) and
  a hard pink offset shadow (about 10px down and right, no blur).
- Background confetti: about a dozen small geometric shapes that slowly drift and turn. Keep
  them around the edges and the upper background, away from text, faces and the action.
  Choose shapes that suit the scene (e.g. wavy lines and dots at sea).

## Palette
| Role | Colour |
|---|---|
| Night background | Indigo `#17134A` (floor `#221C5C`) |
| Main character body | Amber `#FFB627` |
| Outlines, faces, eyes | Ink black `#0A0A0A` |
| Hot pink: offset shadows, accent (shadow outline, shadow text, title underline) | `#FF5FA2` |
| Teal | `#2EC4B6` |
| Yellow: flashes, lamps, shadow's eyes | `#FFD23F` |
| Lilac | `#9B8CFF` |
| Cream: ground line, narrator text, title text, moon | `#FFF6E9` |
Props and other characters use teal, yellow, lilac, pink and cream. No other colours, no
gradients.

## Characters
- Every character is built on one base design: a big round head sitting straight on the body
  (no neck), dot eyes, one line per eyebrow, one line for the mouth, long noodle limbs (smooth
  bendy curves, not jointed sticks), no fingers.
- Flat body colour with a thick black outline. The main character is amber; other people get
  another palette colour (teal, lilac, cream...) so they are easy to tell apart. Groups (two
  crews, two armies) each get their own colour.
- Most emotion comes from the eyebrows (angle, height and how fast they move); the mouth line
  supports it. Eyes only change for blinks.
- Characters always breathe and idle subtly; they are never frozen.
- To show who someone is, add one simple flat shape: a hat, hair, a beard, a scarf, a cap, a
  headscarf, a helmet. Keep it the same for the whole film.
- The main character can be anyone the story needs, of any age or gender, with the same base
  design and their identifying shape.

## The shadow
- The main character's inner voice: doubt, fear, despair or temptation, whatever the story's
  struggle is. Same body as the main character but ink black, taller, with a hot pink outline
  and two narrow yellow slit eyes.
- Its size follows the struggle: the weaker the character feels, the bigger the shadow; it
  shrinks as they find strength. It can disappear when the struggle is resolved, or win if the
  story ends in loss.
- Use it only when the story has an inner struggle. A film can have no shadow.

## Voiceover
- One narrator for the whole Short: high energy, fast but clear, about 150 to 165 words for 60
  seconds (75 to 85 for 30 s, 110 to 125 for 45 s).
- The script is one flowing paragraph, written to be spoken: short sentences, no scene
  directions, nothing the narrator can't say out loud.
- The voice file goes in `public/voice/<film-name>.wav` (or .mp3). Timings for captions and
  shots come from the voice file (word timestamps), never guessed.
- The voice is the loudest thing in the mix; sound effects sit underneath it.

## Text
- Font: Bungee (`@remotion/google-fonts/Bungee`), a chunky 1980s display face, all capitals.
- Captions: the voiceover shown 1 to 3 words at a time, big, cream with a thick black outline,
  centred in the lower-middle of the safe area, the current word popping in hot pink or yellow.
  Captions are synced to the word timestamps.
- Labels: short tags on the picture (a place, a date, a number) that pop in and out. Use them
  for facts the picture alone can't show (e.g. "ELEPHANT ISLAND, 1916").
- Shadow lines: hot pink, appear beside the shadow near its head, fade or type in.
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
- Big moments (a storm hits, a ship appears, a fall): speed lines and a short yellow flash.
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
  (underline). `projector` and the `chip_*` sounds belong to retired experiments.
- Sync sounds to the picture: footsteps on each foot landing, a pop on every count, an impact
  with every flash, a whoosh on every hard cut, a quiet ambience bed under every scene.
- Mix: voice on top, ambience quiet (about 0.2), effects clear but never harsh. Keep
  peaks below about -1 dB (check with `ffmpeg -i out/film.mp4 -af volumedetect -f null -`).

## Titles and end card
- Video titles are short, punchy and curiosity-driven, in the patterns "Why ___", "How ___
  worked", "The ___ that ___" (e.g. "The Army Made of Balloons"). Never misleading.
- The last 2 to 3 seconds are an end card, under the narrator's final line: the payoff word or
  phrase in big cream Bungee letters with a wavy hot pink underline drawing in. No fade to black
  (Shorts loop, so the end should flow back into the hook).

## Where things are in the code
- Shared pieces live in `src/components/`: `Character` (with `Skin` for the look), `Stage`
  (`Letterbox`, `Glow`, `Floor`, `WobblyShape`, `Layer`), `Hud` (`DayCounter`, `Narrator`,
  `ShadowLine`, `RepPop`, `SpeedLines`), `TitleCard`, and `theme` (`UiContext` for text style).
- The Memphis look is set up in `src/films/test/styles.tsx` as `MEMPHIS` (palette `M`, skins,
  pink offset shadow) with `MemphisBackdrop` (flat light rings, confetti, checker floor). When
  building the first real film, move these into `src/components/memphis.tsx` so every film uses
  them, make the Memphis text style the default in `theme.ts` (currently Comic Neue), and turn
  the light rings and confetti into reusable components that take positions as props.
  `DayCounter` shows "DAY N"; give it a label prop for other units (WEEK, YEAR, MILE).
- Each film lives in its own folder under `src/films/<film-name>/` and is registered as a
  `<Composition>` in `src/Root.tsx` at 1080×1920, 30 fps. The `Test-*` compositions are a
  10-second experiment in six styles (pixel, paper, neon, chalk, vintage, Memphis); only
  Memphis is the channel style now.
- `prompts/history-short.md` is the prompt for planning a new Short (ideas, voiceover script,
  scenes). Word timestamps for captions: use the `remotion-captions` skill.

## Workflow
- Before animating, write a short shot list (shot, frames, what happens, text, sounds) and
  check it covers the whole story in 2 to 3 minutes.
- Before showing a film, render it, check sample frames for visual mistakes, and check the
  sound levels.
- The user is not a developer: explain anything they need to do in simple steps, and share
  results as watchable videos or links, not localhost links.
- Commit and push finished work to GitHub (`mobilio101/short_films`).
