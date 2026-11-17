# Codex instructions: build the laptop robot (render + YouTube upload)

For the user (Korean, polite): open the **Codex app on the laptop**, choose the folder
`C:\claude\short_films`, turn on computer use, and paste the **Prompt** below. Codex works in four
steps and stops to ask you only where marked **[USER]**. Everything else it does alone.

## Prompt (paste this into Codex)
```
You are setting up an automatic render-and-upload robot on this Windows laptop. Work in
C:\claude\short_films. First read my-film\AUTOMATION.md (the design), my-film\CLAUDE.md and
my-film\channels\channels.json. Talk to me in polite Korean (존댓말), simply: I am not a developer.

Rules:
- Never put passwords, OAuth tokens or API keys in the repository or in chat. Store them only in
  %USERPROFILE%\.short-films-robot\ (outside the repo).
- Upload to YouTube only through the official YouTube Data API. Never automate YouTube Studio by
  clicking in a browser. Every upload starts as PRIVATE.
- Do not edit films, rulebooks or shared code. You may add files under my-film\scripts\robot\ and
  my-film\queue\ only. Commit on branch auto/robot and push; do not merge to main.
- Do not delete or overwrite anything I already have. Render into a separate folder
  (my-film\out\) that is not tracked by git.

Step 1: Robot code (my-film\scripts\robot\robot.mjs, Node, no AI):
 - Every 90 seconds: git pull main. For each my-film\queue\<film>.json that has no matching
   queue\done\<film>.json or queue\failed\<film>.json: read it (fields: film, composition, channel,
   title, description, tags, captions, privacy, publishAt).
 - Render: npx remotion render <composition> out\<film>.mp4 --gl=angle (concurrency 8 for 2D
   channels, 4 for SMIRKMAN 3D). Check the file exists and the length matches durationSeconds.
 - Upload with the YouTube Data API to the channel named in the order (one OAuth token per channel,
   stored outside the repo), then upload the caption file, then copy the mp4 to Google Drive.
 - Write queue\done\<film>.json (YouTube link, render seconds) or queue\failed\<film>.json (error),
   commit and push only that file.
 - Never run two renders at once. Survive errors: one failed film must not stop the others.
Step 2: Start-up. Register the robot in Windows Task Scheduler to start at log-on, restart on
 failure, and keep the laptop awake while plugged in. Test by rebooting.
NOTE: the YouTube channels do NOT exist yet; I will create them later. So the robot must work before
 that: render every order, but if the order's channel has no OAuth token yet, do not upload and do not
 fail: keep the mp4 in out\ and the Drive copy, and write queue\done\<film>.json with
 "upload": "waiting for channel". When I add a channel later, running the robot again must upload
 those waiting films. Give me one simple command or double-click file to authorize a new channel
 (add-channel.bat <channel id>).
Step 3 [USER]: Google Cloud. Create one Google Cloud project, enable YouTube Data API v3 and Google
 Drive API, make an OAuth consent screen, then set up the authorization for the channels that exist (none yet: only the Drive copy and the
 consent screen are needed now; each YouTube channel is authorized later with add-channel.bat, in my
 logged-in Chrome). Click "Allow" for me; ask me only for
 Google's phone confirmation. Tell me when Google's audit is needed (uploads stay private until
 then; that is fine) and help me apply.
Step 4: Test with one film. Put a copy of my-film\src\films\acoustic-kitty\upload.json into
 queue\acoustic-kitty.json, adapt it to the order format, and run the robot once: render, Drive copy,
 done-file with "upload": "waiting for channel". Show me the mp4 (Drive link). If a channel exists
 by then, also do the private upload and show me the link.
 Then write my-film\queue\README.md (the order format) and report what works and what does not.
```

## For 총괄 after Codex finishes
- Review branch `auto/robot` (read the code: no secrets, never edits tracked files except queue
  results), then merge into `main`.
- Move each finished film's `upload.json` into `queue/<film>.json` (Acoustic Kitty first).
- Update `AUTOMATION.md` status and `STATUS.md`.

## If Codex gets stuck
Common causes: Chrome not logged in to the Google account that owns the channels; the laptop
asleep; Google's phone prompt not confirmed; Node or Git missing. Tell Codex the cause in plain
words and have it retry that step.
