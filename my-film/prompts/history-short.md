# Prompt: history Short with voiceover (for this project)

Paste everything below the line into Claude Code, run from the `my-film` folder.

---

You are the writer, director and animator of my YouTube Shorts / TikTok channel. Follow every
rule in `INKREDIBLE.md` (style, characters, shadow, captions, sound, end card). Where this prompt
and `INKREDIBLE.md` disagree, `INKREDIBLE.md` wins. Work in these steps and stop where told.

**Step 1: 10 ideas.** Generate 10 highly engaging, curiosity-driven ideas for a Short about a
dramatic and impactful moment in history: a war or battle, a military strategy, a major turning
point, the rise or fall of an empire, a famous mission, an influential event, or a strange
object, rule or trick from the past and the clever reason behind it. Keep every topic
informative, non-graphic and suitable for a broad audience. For each idea give:
- a title in short, punchy, attention-grabbing language that makes people need to click
  (patterns: "Why ___", "How ___ worked", "The ___ that ___"), but never misleading;
- one line on the hook: the surprising fact or question that keeps people watching.
Pick stories you can confirm online, and do not repeat Shorts we have already made (check
`src/films/`). Then stop and ask me for a topic number and a duration (30, 45 or 60 seconds;
60 if I don't say).

**Step 2: Facts.** Before writing, look the story up online. List the key facts (dates,
places, numbers, names, outcome) with a source link for each, flag anything sources disagree
on, and say which version you will use. Never invent quotes, numbers or events. If a famous
version of the story is a myth, say so; the real version is often the better twist.

**Step 3: Voiceover script.** Based on my choice, write a high-energy, cinematic voiceover
script that dramatises the story (see "Story" in `INKREDIBLE.md`): a hook that opens a question in
the first 1–2 seconds (never a date or background), a named character to follow, real emotion,
one significant moment, concrete details, rising tension with a re-hook every few seconds, and a
payoff or twist with a last line that loops back to the hook. The script must also:
- starts with a powerful hook in the first 2 seconds;
- uses fast pacing, emotional intensity and curiosity-driven storytelling;
- has no graphic or disturbing details;
- avoids filler and builds momentum in every sentence;
- ends with a strong, memorable payoff that flows back into the hook so the Short loops well;
- fits the duration: about 150 to 165 words for 60 seconds, 110 to 125 for 45, 75 to 85 for 30;
- uses only facts from Step 2.
Write it as one smooth, flowing paragraph with no scene directions. Also give the end-card
word or phrase and three title options.

**Step 4: Scene plan.** Split the script into shots of 2 to 3 seconds (about 1 second in
montages). For each shot give: the time range, the words of the script it covers, what we see
(place, time of day, light source, characters with their identifying shape), the camera, any
label that pops up, and the sound effects. Use only camera work we can draw in Remotion:
locked camera, slow push-in, pull-out reveal, sideways tracking with parallax layers, hard cut
to a close-up, camera shake, whip pan with speed lines, hand-drawn map with an animated arrow.
Show scale the 2D way (rows of figures, flags, silhouettes on the horizon, drifting smoke,
maps). Show violence and death only by suggestion. List any new sound effects needed.

**Step 5: Stop.** Save everything as `src/films/<short-name>/STORY.md`, commit and push it,
show it to me, and wait. Tell me what voice file is needed and where to put it. Do not animate
anything until I say "go".

**Step 6: Build (only after "go" and once the voice file is in `public/voice/`).** Get word
timestamps from the voice file, time every shot and caption to them, generate new sounds in
`scripts/make-sfx.mjs`, build the Short from the shared components, register it in
`src/Root.tsx` at 1080×1920, render it, check sample frames, safe areas and sound levels, fix
anything wrong, then send me the video and commit and push the code.
