# 한걸음: channel rules, read before every film for this channel

**한걸음** (Korean, tagline "오늘도, 딱 한 걸음만.") is a self-improvement channel: short animated stories
about fighting the lazy, scrolling, procrastinating self. Chosen by the user on 16 Nov 2026.
Brand: `brand/hangeoleum/avatar.png` and `banner.png` (drawn in `src/films/test/brand/Brand.tsx`).
YouTube settings: `channels/channels.json`.

> **Status: format confirmed by the user on 17 Nov 2026** with the 10-second test `Test-Hangeoleum`
> (`src/films/test-hangeoleum/`): vertical Korean Shorts, split screen 게으른 나 (top) / 한걸음 나
> (bottom), the look and colours below. Use the test as the reference for every film.

Reference channels are for feel only. Never copy their characters, art, titles or layouts.

## Feel
- One inner struggle per film: putting things off, the phone and dopamine, overthinking, comfort,
  just showing up, starting over, sleep, exercise.
- Moody, intimate night scenes (bedroom, desk, gym, street, couch) where one warm light source (phone
  glow, lamp, alarm clock, door crack) cuts through the dark.
- Honest and warm, never preachy. The viewer should think "that's me", then get one small, concrete
  step they can take today (the channel name is the promise: one step).

## Format (confirmed 17 Nov 2026)
- Vertical 1080×1920, 30 fps, about 45–60 seconds. Korean narration, captions, code-made sound.
- Safe area as in `INKREDIBLE.md` (nothing important within 250 px of the bottom, 160 px of the right
  edge, 200 px of the top).
- Title on screen and as the video title: one short resolution ending with a full stop, e.g.
  "딱 5분만." or "폰 내려놔.", plus a search phrase in brackets in the YouTube title.

## Look
- Very dark backgrounds (`#0B0B10` to `#15151D`) with a thin grey floor line (`#8A8A94`).
- Side-on 2D stage. No ambient light: light only comes from things in the scene, each with a big soft
  radial glow that lights what is near it.
- Props are simple flat shapes with thin, slightly wobbly grey outlines (~2px), gently jittered with
  `@remotion/noise` so they feel hand-drawn and alive.

| Role | Colour |
|---|---|
| Hero body | Amber `#F5A623` |
| Hero face lines | Near black `#1A1A1A` |
| The lazy self (shadow) body | Pure black `#000000` |
| Accent: shadow outline and text, title underline | Violet `#8B6CFF` |
| Outlines, floor line | Grey `#8A8A94` |
| Narrator and caption text | White `#FFFFFF` |

## The hero
- Amber, big round head sitting straight on the body, no neck. Dot eyes, one line per eyebrow, one
  line for the mouth. Long noodle limbs, no fingers. (`Hero` in `src/films/test/brand/LogoSheet.tsx`
  is the logo version; build the animated one from it.)
- Most emotion comes from the eyebrows (angle, height, speed); the mouth line supports it.
- Always breathing and idling; never frozen.

## 게으른 나 (the shadow)
- Same body as the hero but pure black and taller, with a glowing violet outline and two narrow violet
  slit eyes. He is the lazy, comfortable inner voice.
- His size follows the struggle: the weaker the hero feels, the bigger he is. He shrinks as the hero
  takes the step. He speaks in short violet lines beside his head ("5분만 더…").

## Story
- Hook in the first 2 seconds: a moment everyone knows ("알람 끄고 다시 눕는 순간.").
- Build: the excuses get louder (the shadow grows), the lowest point, then one small step and the
  shadow shrinks. End on the one-step action and the title word.
- Korean scripts are written natively in Korean (see the Korean rules in `INKREDIBLE.md`): warm
  spoken style, one consistent ending, no translation habits. Show the script and get approval first.
- Advice must be sensible and safe. No medical or mental-health claims; for serious topics
  (depression, self-harm) do not make a film without asking the user.

- **Intro:** even on this calm channel the first 2 seconds are 2–3 fast cuts (alarm, phone glow,
  tired face). After that the pace slows down.
- A split screen of 게으른 나 and 한걸음 나 side by side suits this channel.
- Topics: check `channels/TOPICS.md` first and claim the topic when the user picks it.

## Sound and voice
- Every sound generated in code (`scripts/make-sfx.mjs`). Quiet room tone, a ticking clock, the phone
  buzz, footsteps; no music unless generated in code.
- Voice: pick from the approved Korean voices in `INKREDIBLE.md` (ElevenLabs Brian, Chatterbox
  multilingual, Supertonic M1). A calmer, slower read than the history channels. Test with the user.

## Workflow
- Same as the other channels: `STORY.md` plan, wait for "go", voice first, cut to word timings,
  stills before video, render on the laptop (see `AUTOMATION.md`).
