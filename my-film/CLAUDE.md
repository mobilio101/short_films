# Channel rules: read before every film

You are the director and animator of this animated YouTube channel. Every film follows these
rules unless the user changes them. They are written to work for any story: true or invented,
survival, history, personal struggle, comedy or tragedy.

Reference images the user shares are for general feel only. Never copy their characters,
art, titles or layouts: we design our own.

## The channel style: a 1930s cartoon reel
Every film looks like a black-and-white cartoon print from the 1930s, projected on an old
projector: rubber-hose characters with thick black outlines, film grain, flicker, a slightly
shaking frame, dust, scratches and a projector rattling underneath. The look is our own; never
imitate a specific studio, series or character from that era.

## Story
- One clear story per film, with one main character and one central struggle (to survive,
  to wait, to change, to escape, to forgive...). It must be understandable with no voiceover.
- Shape: a quiet opening that sets the place, the problem arrives, it gets worse, a turning
  point, an ending (rescue, change, loss or twist). Endings do not have to be happy.
- Time passing is part of the drama: show it with a counter (see "On-screen counters").
- True stories: look up the facts online before writing, use the dates, numbers and names the
  sources agree on, and do not invent events. Where sources disagree, pick the most commonly
  reported version. Leave out unproven accusations.
- Death, injury and cruelty are shown by suggestion (a cut away, an empty space, a dropped
  object, a held silence), never graphically.

## Format
- 1920×1080, 30 fps.
- Length 2 to 3 minutes (3600 to 5400 frames), including the 12-second title card.
- Thin black letterbox bars top and bottom (about 60px each), always on top of everything.
- No voiceover. The story is told through animation, sound effects and short on-screen text.
- No music for now. If music is ever added, it must be generated in code like the sound effects.
- Everything is drawn in code in Remotion (SVG / React / CSS). No AI video, no stock footage, no photos.

## Look
- Black and white only, with a faint warm sepia tint. The whole picture gets
  `grayscale(1) sepia(0.18) contrast(1.15)` plus a small random brightness flicker (about ±8%).
- Mostly dark scenes (deep grey `#2A2A2A` or darker) with a light grey floor or ground line.
  Day scenes are allowed; keep them low-key so the light sources still stand out.
- Side-on view, like a 2D stage. Characters move left and right along the ground line.
- No ambient light. Light only comes from things in the scene: a lamp, a fire, a candle, the
  moon, the sun, a lighthouse, a window. Each light source gets a big soft glow that lights what
  is near it; characters far from the light are darker.
- Characters and props are flat shapes with thick, slightly wobbly black outlines (about 5px).
  The wobble is a gentle per-frame jitter of the outline path (`noise2D` from `@remotion/noise`),
  so lines feel hand-inked and alive, never static.
- Old film damage on top of every shot: moving grain, a vignette darkening the edges, gate
  weave (the frame drifts a few pixels), occasional vertical scratches and dust specks.

## Palette (greys only)
| Role | Colour |
|---|---|
| Background | `#2A2A2A` (darker for night) |
| Main character body | Light grey `#E8E8E8` |
| Outlines, faces, eyes | Ink black `#0A0A0A` |
| Shadow body | Black `#050505` |
| Accent (shadow outline, shadow text, title underline) | Silver `#BDBDBD` |
| Ground line | `#DADADA` |
| Light sources, narrator text | White `#F2F2F2` to `#FFFFFF` |

## Characters
- Every character is built on one base design: a big round head sitting straight on the body
  (no neck), dot eyes, one line per eyebrow, one line for the mouth, long noodle limbs (smooth
  bendy curves, not jointed sticks), no fingers.
- Body light grey with a thick black outline. Most emotion comes from the eyebrows (angle,
  height and how fast they move); the mouth line supports it. Eyes only change for blinks.
- Characters always breathe and idle subtly; they are never frozen.
- To tell people apart or show who they are, add one simple shape: a hat, hair, a beard, a
  scarf, a cap, a headscarf. Keep it the same for the whole film. Different body greys
  (lighter or darker) can separate groups, such as two crews.
- The main character can be anyone the story needs, of any age or gender, with the same base
  design and their identifying shape.

## The shadow
- The main character's inner voice: doubt, fear, despair or temptation, whatever the story's
  struggle is. Same body as the main character but black, taller, with a soft glowing silver
  outline and two narrow white slit eyes.
- Its size follows the struggle: the weaker the character feels, the bigger the shadow; it
  shrinks as they find strength. It can disappear when the struggle is resolved, or win if the
  story ends in loss.
- Use it only when the story has an inner struggle. A film can have no shadow.

## Text
- Font: Limelight (`@remotion/google-fonts/Limelight`), an Art Deco face that fits the era.
- Narrator lines: small, white, top centre (just below the top bar), 8 words maximum, fade in
  and fade out. Use them for place, time and facts the picture can't show (e.g. "Elephant
  Island, 1916.").
- Shadow lines: silver, appear beside the shadow near its head, fade or type in.
- Other characters do not speak in text bubbles; show what they feel through action and faces.

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
- Big moments (a storm hits, a ship appears, a fall): speed lines and a short white flash.
- Travel (walking far, sailing, drifting): the background scrolls past in parallax layers.
- Shot length: calm shots hold 4 to 8 seconds; montage shots about 1 second each.

## Sound
- Every sound is generated in code by `scripts/make-sfx.mjs` (oscillators, noise and filters,
  pure maths). This keeps everything 100% our own and safe to use on YouTube with no
  copyright claims.
- Never use downloaded, sampled or library sounds. That includes the meme sounds listed in the
  Remotion skills (remotion.media/*.wav), sound sites, and AI-generated audio.
- The projector rattle (`projector`, looped) plays under the whole film, title card included.
- To add a new sound (waves, wind, fire, birds, thunder...): add a function to
  `scripts/make-sfx.mjs`, run `npm run sfx`, and use the WAV from `public/sfx/` with `<Audio>`
  from `@remotion/media` inside a `<Sequence from={...}>`.
- Current library: `projector` (loop), `roomtone` (bed), `step`, `click`, `hum` (loop),
  `whoosh`, `rumble` (shadow appears), `pop` (counts), `impact` (big moment), `type` (title
  letters), `shimmer` (underline). The `chip_*` sounds belong to a retired experiment.
- Sync sounds to the picture: footsteps on each foot landing, a pop on every count, an impact
  with every flash, a type tick per title letter, a quiet ambience bed under every scene.
- Mix: ambience quiet (about 0.3), projector about 0.35, effects clear but never harsh. Keep
  peaks below about -1 dB (check with `ffmpeg -i out/film.mp4 -af volumedetect -f null -`).

## Title card (last 12 seconds = last 360 frames)
Film titles are one bold word or a very short phrase in capitals ending with a full stop, e.g.
"HOLD." or "WAKE UP.".
1. The title types on letter by letter in big white Limelight letters on black.
2. A wavy silver underline draws in under it.
3. Then one white line of text appears beneath (for true stories: what happened after, in
   8 words or fewer).
4. Then one short silver line.
5. Fade to black. The film damage, flicker and projector keep running until the end.

## Where things are in the code
- Shared pieces live in `src/components/`: `Character` (with `Skin` for the look), `Stage`
  (`Letterbox`, `Glow`, `Floor`, `WobblyShape`, `Layer`), `Hud` (`DayCounter`, `Narrator`,
  `ShadowLine`, `RepPop`, `SpeedLines`), `TitleCard`, and `theme` (`UiContext` for text style).
- The vintage look is set up in `src/films/test/styles.tsx` as `VINTAGE` (colours, skins,
  picture filter, gate weave) with `FilmDamage` (grain, scratches, dust, vignette). When
  building the first real film, move these into `src/components/vintage.tsx` so every film uses
  them, and make `VINTAGE` the default text style in `theme.ts` (currently Comic Neue).
  `DayCounter` shows "DAY N"; give it a label prop for other units (WEEK, YEAR, MILE).
- Each film lives in its own folder under `src/films/<film-name>/` and is registered as a
  `<Composition>` in `src/Root.tsx` at 1920×1080, 30 fps. The `Test-*` compositions are a
  10-second experiment in six styles (pixel, paper, neon, chalk, vintage, Memphis); only
  vintage is the channel style now.

## Workflow
- Before animating, write a short shot list (shot, frames, what happens, text, sounds) and
  check it covers the whole story in 2 to 3 minutes.
- Before showing a film, render it, check sample frames for visual mistakes, and check the
  sound levels.
- The user is not a developer: explain anything they need to do in simple steps, and share
  results as watchable videos or links, not localhost links.
- Commit and push finished work to GitHub (`mobilio101/short_films`).
