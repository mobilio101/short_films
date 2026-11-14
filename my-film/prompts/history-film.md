# Prompt: history film or Short (for this project)

Paste everything below the line into Claude Code, run from the `my-film` folder.

---

You are the director and animator of my animated YouTube channel. Follow every rule in
`CLAUDE.md` (style, characters, shadow, text, counters, sound, title card). Where this prompt
and `CLAUDE.md` disagree, `CLAUDE.md` wins. Work in these steps and stop where told.

**Step 1: Ideas.** Give me 10 ideas for a film about a dramatic, true moment in history: a war
or battle, a military strategy, a turning point, the rise or fall of an empire, a famous
mission or expedition, or an event that changed the world. For each idea give:
- a title: one bold word or a very short phrase in capitals ending with a full stop
  (e.g. "OUTNUMBERED."), curiosity-driven but never misleading;
- one line on what happened and the hook that makes people keep watching;
- the inner struggle the shadow could voice (fear, pride, doubt...), or "no shadow".
Choose stories that can be told without graphic violence, and that can be followed with no
voiceover. Do not repeat stories we have already made (check `src/films/`). Then stop and ask
me to pick a number and a format.

**Step 2: Format.** I will reply with an idea number and one format:
- Film: 2 to 3 minutes, 1920×1080 (16:9), as described in `CLAUDE.md`;
- Short: 30, 45 or 60 seconds, 1080×1920 (9:16, vertical), same style, for YouTube Shorts or
  TikTok. Shorts end with a 4-second title card instead of 12.

**Step 3: Facts.** Look the story up online before writing anything. List the key facts
(dates, places, numbers, names, outcome) with a source link for each. Flag anything sources
disagree on and say which version you will use. Never invent quotes, numbers or events, and
leave out unproven accusations.

**Step 4: Story in on-screen text.** There is no voiceover, so the script is the sequence of
narrator lines that will appear on screen (8 words maximum each), plus any shadow lines.
- The first 2 seconds must hook: open on the most striking image of the story (a flash-forward
  is allowed), with a short line that raises a question.
- Every scene must move the story forward; no filler.
- End on a strong, memorable payoff that leads into the title card. The title card's white
  line says what happened next or why it mattered.
- Show violence and death only by suggestion (smoke on the horizon, an empty space, a fallen
  flag, a cut away). Never show injuries or bodies.

**Step 5: Scene list.** Turn the story into a table with one row per shot:
time range, frames at 30 fps, place and time of day, the light source, who is in it
(base character design plus each person's identifying shape), what happens, the camera,
on-screen text, and sound effects.
- Use only camera work we can draw in Remotion: locked camera, slow push-in, pull-out reveal,
  sideways tracking (the background scrolls in parallax layers), hard cut to a close-up of an
  object, camera shake, a whip pan with speed lines, a hand-drawn map with an animated arrow
  or dotted line. No 3D orbits or drone shots.
- Show scale the 2D way: rows of simple figures, flags, tents, ships as silhouettes on the
  horizon, dust and smoke drifting across layers, a map.
- Pacing for a Film: calm shots 4 to 8 seconds, montage shots about 1 second.
  Pacing for a Short: a new shot every 2 to 3 seconds, montage shots about 1 second.
- Check that the times add up exactly to the chosen length, including the title card.
- List any new sound effects needed; they will be generated in code.

**Step 6: Stop.** Save the plan as `src/films/<title>/STORY.md`, commit and push it, show it
to me, and wait. Do not animate anything until I say "go".

**Step 7: Build (only after "go").** Build the film from the shared components, generate the
new sounds in `scripts/make-sfx.mjs`, register the composition in `src/Root.tsx`, render it,
check sample frames and sound levels, fix anything wrong, then send me the video and commit
and push the code.
