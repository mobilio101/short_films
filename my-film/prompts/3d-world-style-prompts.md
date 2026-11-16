# 3D world, 2D characters: prompts for Inkredible

Based on the reel "How creators make 3D animations with Claude using only code"
(Get Rich With Me, Facebook). The reel builds a Short about Chicago lifting its buildings in the
1850s–60s. The background is real 3D (Three.js inside Remotion) and the characters are flat 2D.

## What the reel does, in 3 chapters

1. **Train Claude on the style.** Give it about 10 reference videos. Claude studies them frame by
   frame (camera, cuts, colours, light, script pattern) and writes everything into one
   **rulebook**. Tip from the reel: "Don't let Claude guess what a style looks like. Make it study
   the real thing and write it down."
2. **Make the visuals, step by step.** First try: everything was plain boxes. Fixes that worked:
   - Remake **one still frame** first and compare it side by side with the reference.
   - Go back and forth on small things (outline too thin or too thick, shading too strong, props
     too boxy).
   - For the 5-second test, spell out exactly what you want, with no guesswork: real 3D models with
     detail, ink outlines on every edge, a camera that travels through the 3D world, things in
     front, middle and back, background blurred and character sharp.
3. **Render fast.** In the cloud, 5 seconds at low resolution took 13 minutes, because the cloud
   machine has no graphics card. On the creator's laptop (RTX 5050 graphics card) the full video took about 1 minute.

The script pattern they found in the viral Shorts: open with something that sounds impossible,
then explain why. There's a "You see…" explanation at about 72% of the video, a "So…" consequence
line at about 82–93%, and a closing line of about 12 words. Captions show one word at a time.
The narrator speaks about 3.35 words per second.

## Inkredible rules that still apply

- Reference videos are for **feel only**. We never copy another channel's characters, scenes,
  titles or layouts. We study them for numbers (camera speed, outline thickness, colours) and then
  design our own.
- Everything is made in code: no AI images, no AI video, no downloaded 3D models. The 3D worlds
  are built from shapes in code, with textures painted in code.
- Sound effects are generated in code (`scripts/make-sfx.mjs`).
- Our characters are the **ink-blot** people and the **ink-drop mascot**, drawn flat in 2D.

---

## Prompt 1: Study the references and write the rulebook

> I've put reference videos in `references/` (or here are the links). They are for feel only:
> we will not copy their characters, scenes or layouts.
> Analyse every video. Don't give opinions; give numbers.
> 1. Extract frames and build contact sheets (one image per 2 seconds). Look at the sheets
>    yourself, not just the code output.
> 2. Measure per video and on average: camera movement (how often it moves, how fast, push, pan,
>    orbit, crane), number of cuts and average shot length, dissolves vs hard cuts, brightness,
>    contrast and saturation, outline thickness and colour, shadow and highlight colour, background
>    blur and depth, character proportions (head size vs body, limb thickness).
> 3. Transcribe the audio. Measure words per second and pauses.
> 4. Find the script pattern: how the first sentence works, how it escalates, where the pivot is,
>    how it ends, and any repeated phrases.
> Save everything to `style/rulebook-3d.md`, with a final section "Rules to follow".
> Keep a log of steps and problems in `PROGRESS.md`.

## Prompt 2: Story ideas (optional; we also have `prompts/history-short.md`)

> Read `style/rulebook-3d.md` and the transcripts.
> 1. List every topic the references already cover.
> 2. Suggest 8 new history stories that fit the same formula: a strange fact that sounds impossible
>    in the first sentence, then the real reason. They must be true and well documented, and not
>    topics the references already covered.
> 3. For the top 3, check every fact (dates, names, numbers, places) and give me the sources.
> 4. Tell me which has the strongest first line and why.
> Save to `STORY.md`. Don't write the script yet.

## Prompt 3: The script

> Write the script for story #__ using the rulebook and the CLAUDE.md story rules.
> - Start with the impossible fact in the first sentence. No intro.
> - Follow the rulebook's escalation, pivot ("You see…") and payoff ("So…").
> - Match the rulebook's words per second; about 150–165 words for 60 seconds.
> - Simple words, a human tone, no generic AI phrases. Use only facts we verified.
> Split it into numbered shots: the line spoken, plus a one-line description of what's on screen
> and how the camera moves. Save it to `STORY.md` and wait for my "go".

## Prompt 4: One still frame first (the step that made the biggest jump)

> Using `style/rulebook-3d.md`, build ONE still frame with Three.js inside Remotion
> (`@remotion/three`), as a separate `Test-` composition. Don't make a video yet.
> - A real 3D room (pick one that fits our story) with detailed props, built from shapes in code.
> - Paint every texture in code (wood grain, brick, plaster, tile gloss, small noise), with soft
>   gradients on the walls.
> - Black ink outlines on every 3D edge: the room's corners, the ceiling edge, the skirting boards
>   and every object, not just boxes.
> - Light from things in the scene (a window, a lamp, a candle) with real shadows.
> - Our ink-blot main character standing in the room, flat 2D, sharp, with a thick outline.
> - Something in the foreground, the middle and the back. The background is slightly blurred and
>   the character is sharp.
> Render the still, put it side by side with a reference frame, and list what's still different
> (outline thickness, shading strength, colours, how detailed or boxy the props are). Fix those,
> render again, and show me both. Don't copy the reference's scene; match its level of detail.

## Prompt 5: 5-second test (spell everything out)

> The still is approved. Now make a 5-second test from it, in the same look. Be exact. This must
> NOT become a flat 2D animation:
> - Every background is real 3D models with detail and painted textures, and ink outlines on
>   every edge.
> - The camera travels through the 3D world (a slow push-in with easing, using the camera numbers
>   in the rulebook). The room shifts in depth while the character stays flat.
> - The character breathes, idles and reacts (our EMOTE poses).
> - Foreground, middle and back layers; background blurred, character sharp.
> - Sound effects generated in code.
> Before rendering, render 5 stills and check them against the rulebook. Fix any problems first
> (camera inside objects, wrong colours, anything blocking faces). Then render the clip, and log
> what went wrong in `PROGRESS.md`.

## Prompt 6: The full Short

> Make the full video from the approved script and voice-over. Time every shot, caption and sound
> to the word timings. Use one camera move per shot, carried across cuts with dissolves where the
> rulebook says. Render stills of every shot first and show me a contact sheet before the full
> render.

---

## Rendering: the cloud vs your own computer

3D is heavy to render, and this cloud machine has no graphics card. A 60-second 1080p Short could
take hours here. The reel's fix is to let Claude write the code, and let your own computer's
graphics card do the rendering:

1. Install **Node.js** on your computer (nodejs.org).
2. Open the project folder in the **Claude desktop app** on your computer.
3. Ask Claude to run `npm install`. That downloads Remotion.
4. In **Windows Settings → System → Display → Graphics**, set Claude, and the Chrome that Remotion
   uses, to **High performance** (your NVIDIA card, if you have one).
5. Ask Claude for a `render.bat` file. Double-click it and the render starts.

Without a graphics card it still works, just slower.
