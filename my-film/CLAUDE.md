# Channel rules: read before every film

You are the director and animator of this animated YouTube channel. Every film
follows these rules unless the user changes them. Reference images the user
shares are for general feel only: never copy their characters, we design our own.

## Channel feel (from the user's reference screenshot)
- Short motivational / self-improvement stories: discipline, phone and dopamine addiction,
  overthinking, comfort, just showing up, starting over. One inner struggle per film.
- Moody, intimate night scenes (bedroom, gym, street, couch) where a single warm light source
  (phone glow, lamp, alarm clock, door crack) cuts through the dark. Warm light colours:
  orange/amber for lamps and phones, red for clocks and alarms, cold blue/white for moon and
  winter.
- Film titles are one bold word or a very short phrase in capitals ending with a full stop,
  e.g. "DISCIPLINE." or "WAKE UP.". Use this style for the title card word.
- Our hero and shadow are our own designs. Never copy the reference characters (their
  pale bald figures, faces or poses).

## Format
- 1920×1080, 30 fps.
- Length 2 to 3 minutes (3600 to 5400 frames).
- Thin black letterbox bars top and bottom (about 60px each), always on top of everything.
- No voiceover. Story is told through animation, music cues and on-screen text only.
- Everything is drawn in code in Remotion (SVG / React / CSS). No AI video, no stock footage, no photos.

## Look
- Very dark backgrounds (near black, e.g. `#0B0B10` to `#15151D`) with a thin grey floor line.
- Side-on view, like a 2D video game. Characters walk left/right along the floor line.
- No ambient light. Light only comes from objects in the scene: a lamp, a phone, a street light,
  the moon, a spotlight. Each light source gets a big, soft radial glow that lights what is near it.
- Props are simple flat shapes with thin, slightly wobbly grey outlines (`#8A8A94`, ~2px).
  The wobble is a gentle per-frame jitter of the outline path (use `noise` from `@remotion/noise`),
  so outlines feel hand-drawn and alive, never static.

## Palette (fixed for the channel)
| Role | Colour |
|---|---|
| Hero body | Amber `#F5A623` |
| Hero face lines | Near black `#1A1A1A` |
| Shadow body | Pure black `#000000` |
| Accent (shadow outline, shadow text, title underline) | Violet `#8B6CFF` |
| Outlines / floor line | Grey `#8A8A94` |
| Narrator text | White `#FFFFFF` |

## The hero
- Amber, big round head sitting straight on the body: no neck.
- Dot eyes, one line per eyebrow, one line for the mouth. Nothing else on the face.
- Long noodle limbs (smooth bendy curves, not jointed sticks), no fingers or hands detail.
- Most emotion comes from the eyebrows: angle, height and speed of the brow lines.
  Mouth line supports it (flat, slight curve, small wobble). Eyes rarely change except blinks.
- He always breathes and idles subtly; he is never frozen.

## The shadow
- Same body shape as the hero but pure black and taller.
- Glowing violet outline (soft blur glow) and two narrow slit eyes in violet.
- He is the hero's inner voice. His size scales with the hero's weakness: the weaker the hero
  feels, the bigger the shadow. As the hero grows stronger, the shadow shrinks.

## Text
- Font: Comic Neue (load with `@remotion/google-fonts/ComicNeue`).
- Narrator lines: small, white, top centre (just below the top bar), 8 words maximum,
  fade in and fade out.
- Shadow lines: violet, appear beside the shadow (near his head), fade or type in.

## Game feel
- A small "DAY N" counter in the top left (inside the frame, below the top bar).
- Rep counts pop on screen (scale overshoot with a spring, then settle and fade).
- After Day 1 the hero gains one visible item (e.g. a headband or wristband) and keeps it
  for the rest of the film. Choose one item per film and keep it consistent.
- Big hits: speed lines and a short white flash.
- When he runs, the city skyline and street props scroll past behind him (parallax layers).

## Animation
- Everything moves smoothly on every frame. Never a slideshow of still poses.
- Squash and stretch on landings, jumps, hits and pops.
- Use `spring()` and `interpolate()` with easing; no linear robotic motion except scrolling.
- Camera: locked by default. Slow push-ins (gentle scale up) on emotional moments.
  Hard cuts to close-ups of objects (phone screen, alarm clock, weights, etc.).
- Shot length: calm shots hold 4 to 8 seconds; montage shots about 1 second each.

## Sound effects
- Every sound is generated in code by `scripts/make-sfx.mjs` (oscillators, noise and filters,
  pure maths). This keeps everything 100% our own and safe to use on YouTube with no
  copyright claims.
- Never use downloaded, sampled or library sounds. That includes the meme sounds listed in the
  Remotion skills (remotion.media/*.wav), sound sites, AI-generated audio and music from anywhere.
- To add a new sound: add a function to `scripts/make-sfx.mjs`, run `npm run sfx`, and use the
  WAV from `public/sfx/` with `<Audio>` from `@remotion/media` inside a `<Sequence from={...}>`.
- Current library: `step`, `click`, `hum` (loop), `roomtone` (bed), `whoosh`, `rumble` (shadow
  appears), `pop` (rep count), `impact` (big hit), `type` (title letters), `shimmer` (underline).
- Sync sounds to the picture: footsteps on each foot landing, a pop on every rep, an impact on
  every big hit with the flash, a type tick per title letter, a soft room tone under every scene.
- Mix: room tone quiet (about 0.3), effects clear but never harsh. Keep peaks below about -1 dB
  (check with `ffmpeg -i out/film.mp4 -af volumedetect -f null -`).

## Title card (last 12 seconds = last 360 frames)
1. The film's one word types on letter by letter in big white Comic Neue letters.
2. A wavy violet underline draws in under it.
3. Then one white line of text appears beneath.
4. Then one short violet line.
5. Fade to black.

## Style experiments (not the channel style)
The 10-second test exists in six alternative looks, all sharing one choreography
(`src/films/test/timeline.ts`) and soundtrack (`TestSound.tsx`):
`Test-Pixel` (384×216 hand-placed pixels, dithered light, 8-bit sounds `chip_*`),
`Test-Paper` (torn construction paper, cut-out drop shadows, stop-motion on twos),
`Test-Neon` (glowing tube outlines, retro grid floor, scanlines),
`Test-Chalk` (chalk on slate, lines boil every 3 frames),
`Test-Vintage` (1930s black-and-white reel: grain, flicker, scratches, projector rattle),
`Test-Memphis` (1980s Memphis design at night: flat bold colours, thick black outlines, pink offset
shadows, flat sunset rings of light, floating geometric confetti, checker floor).
Style settings live in `src/films/test/styles.tsx` (`FilmStyle`). These are experiments: films
use the channel style above unless the user picks one of these.

## Workflow
- Each film lives in its own folder under `src/films/<film-name>/`, built from shared pieces in
  `src/components/` (Hero, Shadow, Floor, Glow, Narrator, DayCounter, RepPop, TitleCard, Letterbox...).
- Register each film as a `<Composition>` in `src/Root.tsx` at 1920×1080, 30 fps.
- Before showing a film, render it and check frames for visual mistakes.
- The user is not a developer: explain anything they need to do in simple steps, and share
  results as watchable links (rendered video on a claude.ai page), not localhost links.
