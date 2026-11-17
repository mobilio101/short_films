// The laptop robot: pull render orders from GitHub, render on the GPU, copy to Google Drive,
// upload to YouTube (always PRIVATE), and write the result back. No AI. Plain Node, no extra packages.
//
//   node robot.mjs            run forever (every 90 seconds)
//   node robot.mjs --once     one round, then stop (for tests)
//   node robot.mjs --once --branch auto/robot   use another branch for a test
//
// It works in its own copy of the project (%USERPROFILE%\.short-films-robot\checkout), never in the
// folder you work in, and only ever commits files in my-film/queue/done/ and my-film/queue/failed/.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { HOME, LOGS, SCRIPT_DIR, loadConfig, log, readJson, writeJson, run, tail } from "./common.mjs";
import { hasToken, uploadVideo, uploadCaptions, copyToDrive } from "./google.mjs";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);

const cfg = loadConfig();
if (opt("--branch")) cfg.branch = opt("--branch");
const ONCE = flag("--once");
const REPO = cfg.checkout;
const FILM_DIR = path.join(REPO, "my-film");
const QUEUE = path.join(FILM_DIR, "queue");
const STATE_FILE = path.join(HOME, "state.json");
const MAX_UPLOAD_TRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();

// ---------- only one robot at a time ----------

const LOCK = path.join(HOME, "robot.lock");
function takeLock() {
  try {
    const pid = Number(fs.readFileSync(LOCK, "utf8"));
    if (pid && pid !== process.pid) {
      try {
        process.kill(pid, 0);
        return false; // another robot is alive
      } catch {
        /* stale lock */
      }
    }
  } catch {
    /* no lock */
  }
  fs.writeFileSync(LOCK, String(process.pid));
  return true;
}
const dropLock = () => {
  try {
    if (Number(fs.readFileSync(LOCK, "utf8")) === process.pid) fs.unlinkSync(LOCK);
  } catch {
    /* ignore */
  }
};

// ---------- keep the laptop awake while plugged in ----------

function keepAwake() {
  const ps1 = path.join(SCRIPT_DIR, "keep-awake.ps1");
  if (!fs.existsSync(ps1)) return;
  const child = spawn(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-WindowStyle", "Hidden", "-File", ps1, "-ParentPid", String(process.pid)],
    { stdio: "ignore", windowsHide: true },
  );
  child.on("error", () => {});
  process.on("exit", () => child.kill());
}

// ---------- git ----------

const git = (...a) => run("git", a, { cwd: REPO });

async function syncCheckout() {
  if (!fs.existsSync(path.join(REPO, ".git"))) {
    log(`Making the robot's own copy of the project in ${REPO} ...`);
    const r = await run("git", ["clone", "--branch", cfg.branch, cfg.remote, REPO]);
    if (r.code !== 0) throw new Error("git clone failed: " + tail(r.err, 400));
  }
  // The robot signs its own result commits (only in its own copy).
  if (!(await git("config", "user.email")).out.trim()) {
    await git("config", "user.name", "Laptop robot");
    await git("config", "user.email", "robot@short-films.laptop");
  }
  let r = await git("fetch", "origin", cfg.branch);
  if (r.code !== 0) throw new Error("git fetch failed (internet or GitHub login?): " + tail(r.err, 400));
  const cur = (await git("rev-parse", "--abbrev-ref", "HEAD")).out.trim();
  if (cur !== cfg.branch) {
    r = await git("checkout", "-B", cfg.branch, `origin/${cfg.branch}`);
    if (r.code !== 0) throw new Error("git checkout failed: " + tail(r.err, 400));
  }
  r = await git("pull", "--rebase", "origin", cfg.branch);
  if (r.code !== 0) {
    await git("rebase", "--abort");
    throw new Error("git pull failed: " + tail(r.err, 400));
  }
}

async function commitAndPush(relFile, message) {
  await git("add", "--", relFile);
  const c = await git("commit", "-m", message, "--only", "--", relFile);
  if (c.code !== 0 && !/nothing to commit|no changes added/i.test(c.out + c.err)) {
    log("git commit problem: " + tail(c.err || c.out, 300));
  }
  for (let i = 1; i <= 4; i++) {
    const p = await git("push", "origin", `HEAD:${cfg.branch}`);
    if (p.code === 0) return true;
    log(`git push try ${i} failed: ${tail(p.err, 200)}`);
    await git("pull", "--rebase", "origin", cfg.branch);
    await sleep(2000 * 2 ** i);
  }
  log("Could not push the result now; it will be pushed with the next result.");
  return false;
}

// ---------- packages ----------

async function ensurePackages() {
  const lock = path.join(FILM_DIR, "package-lock.json");
  const hash = crypto.createHash("sha256").update(fs.readFileSync(lock)).digest("hex");
  const state = readJson(STATE_FILE, {});
  if (state.lockHash === hash && fs.existsSync(path.join(FILM_DIR, "node_modules"))) return;
  log("Installing packages (npm ci). The first time takes a few minutes ...");
  const r = await run("npm", ["ci"], { cwd: FILM_DIR, shell: true });
  if (r.code !== 0) throw new Error("npm ci failed: " + tail(r.err, 600));
  writeJson(STATE_FILE, { ...state, lockHash: hash });
}

// ---------- self update ----------

const ownFiles = ["robot.mjs", "google.mjs", "common.mjs", "keep-awake.ps1"];
const ownHash = (dir) =>
  crypto
    .createHash("sha256")
    .update(ownFiles.map((f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f)) : "")).join("|"))
    .digest("hex");
const START_HASH = ownHash(SCRIPT_DIR);
const CHECKOUT_SCRIPT_DIR = path.join(FILM_DIR, "scripts", "robot");

function needsRestart() {
  const inCheckout = path.resolve(SCRIPT_DIR).toLowerCase() === path.resolve(CHECKOUT_SCRIPT_DIR).toLowerCase();
  if (inCheckout) return ownHash(SCRIPT_DIR) !== START_HASH; // new robot code arrived
  return fs.existsSync(path.join(CHECKOUT_SCRIPT_DIR, "robot.mjs")); // the copy now has the robot: use it
}

// ---------- the work ----------

const resultPath = (kind, film) => path.join(QUEUE, kind, `${film}.json`);
const relResult = (kind, film) => `my-film/queue/${kind}/${film}.json`;

function listOrders() {
  if (!fs.existsSync(QUEUE)) return [];
  return fs
    .readdirSync(QUEUE)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.basename(f, ".json"))
    .filter((film) => !fs.existsSync(resultPath("done", film)) && !fs.existsSync(resultPath("failed", film)));
}

function readOrder(film) {
  const o = readJson(path.join(QUEUE, `${film}.json`));
  for (const k of ["composition", "channel", "title"]) if (!o[k]) throw new Error(`order is missing "${k}"`);
  o.film = o.film || film;
  return o;
}

function freeOutFile(film) {
  fs.mkdirSync(cfg.outDir, { recursive: true });
  let f = path.join(cfg.outDir, `${film}.mp4`);
  if (fs.existsSync(f)) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
    f = path.join(cfg.outDir, `${film}-${stamp}.mp4`); // never overwrite an older video
  }
  return f;
}

async function render(order) {
  const out = freeOutFile(order.film);
  const tmp = out.replace(/\.mp4$/, ".rendering.mp4");
  const conc = order.concurrency || cfg.concurrency[order.channel] || cfg.concurrency.default;
  log(`Rendering ${order.film} (${order.composition}, concurrency ${conc}) -> ${out}`);
  const t0 = Date.now();
  const r = await run(
    "npx",
    ["remotion", "render", order.composition, tmp, `--gl=${cfg.gl}`, `--concurrency=${conc}`],
    { cwd: FILM_DIR, shell: true },
  );
  const seconds = Math.round((Date.now() - t0) / 1000);
  fs.writeFileSync(path.join(LOGS, `render-${order.film}.log`), r.out + "\n" + r.err);
  if (r.code !== 0 || !fs.existsSync(tmp)) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* nothing to clean */
    }
    throw new Error("render failed: " + tail(r.err || r.out, 900));
  }
  fs.renameSync(tmp, out);

  const probe = await run(
    "npx",
    ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", out],
    { cwd: FILM_DIR, shell: true },
  );
  const duration = parseFloat(probe.out.trim());
  if (!(duration > 0)) throw new Error("rendered file has no readable length");
  if (order.durationSeconds && Math.abs(duration - order.durationSeconds) > 1.5) {
    throw new Error(`length is ${duration.toFixed(1)} s but the order says ${order.durationSeconds} s`);
  }

  const loud = await run(
    "npx",
    ["remotion", "ffmpeg", "-hide_banner", "-nostats", "-i", out, "-vn", "-af", "loudnorm=print_format=json", "-f", "null", "-"],
    { cwd: FILM_DIR, shell: true },
  );
  const m = (loud.err + loud.out).match(/"input_i"\s*:\s*"(-?[\d.]+)"/);
  const lufs = m ? Number(m[1]) : null;
  log(`Rendered ${order.film} in ${seconds} s, length ${duration.toFixed(2)} s, loudness ${lufs ?? "?"} LUFS`);
  return { file: out, renderSeconds: seconds, durationSeconds: Number(duration.toFixed(2)), loudnessLUFS: lufs };
}

// Drive copy and YouTube upload. Used for new films and for films that were waiting.
// Returns true when something changed.
async function deliver(order, done) {
  let changed = false;
  const fileOk = done.file && fs.existsSync(done.file);

  if (done.drive?.status !== "done" && fileOk && hasToken("drive")) {
    try {
      const d = await copyToDrive(done.file, cfg.driveFolderName);
      done.drive = { status: "done", link: d.link, at: now() };
      log(`Drive copy: ${d.link}`);
    } catch (e) {
      done.drive = { status: "error, will retry", error: String(e.message || e), at: now() };
      log(`Drive copy failed: ${e.message}`);
    }
    changed = true;
  } else if (!done.drive) {
    done.drive = { status: "waiting for Drive setup" };
    changed = true;
  }

  const tries = done.uploadTries || 0;
  const wantsUpload = done.upload !== "done" && done.upload !== "failed" && tries < MAX_UPLOAD_TRIES;
  if (wantsUpload && !hasToken(order.channel)) {
    if (done.upload !== "waiting for channel") {
      done.upload = "waiting for channel";
      changed = true;
    }
  } else if (wantsUpload && !fileOk) {
    done.upload = "failed";
    done.uploadError = "the mp4 is no longer on the laptop: " + done.file;
    changed = true;
  } else if (wantsUpload) {
    try {
      log(`Uploading ${order.film} to YouTube channel "${order.channel}" as PRIVATE ...`);
      const v = await uploadVideo(order.channel, order, done.file);
      done.upload = "done";
      done.youtube = { ...v, at: now() };
      delete done.uploadError;
      log(`Uploaded: ${v.url}`);
      const srt = order.captions && [path.join(REPO, order.captions), path.join(FILM_DIR, order.captions)].find((p) => fs.existsSync(p));
      if (srt) {
        try {
          await uploadCaptions(order.channel, v.videoId, order.language, srt);
          done.captions = "done";
        } catch (e) {
          done.captions = "failed: " + e.message;
        }
      } else {
        done.captions = order.captions ? "caption file not found: " + order.captions : "none";
      }
    } catch (e) {
      done.uploadTries = tries + 1;
      done.uploadError = String(e.message || e);
      done.upload = done.uploadTries >= MAX_UPLOAD_TRIES ? "failed" : "error, will retry";
      log(`Upload failed (${done.uploadTries}/${MAX_UPLOAD_TRIES}): ${e.message}`);
    }
    changed = true;
  }
  return changed;
}

async function processOrder(film) {
  let order;
  let step = "reading the order";
  try {
    order = readOrder(film);
    step = "rendering";
    const r = await render(order);
    const done = { film, composition: order.composition, channel: order.channel, title: order.title, renderedAt: now(), ...r };
    step = "delivering";
    await deliver(order, done);
    writeJson(resultPath("done", film), done);
    await commitAndPush(relResult("done", film), `Robot: ${film} rendered (upload: ${done.upload})`);
  } catch (e) {
    log(`FAILED ${film} while ${step}: ${e.message}`);
    writeJson(resultPath("failed", film), { film, step, error: String(e.message || e), at: now() });
    await commitAndPush(relResult("failed", film), `Robot: ${film} failed while ${step}`);
  }
}

// Films rendered earlier whose Drive copy or YouTube upload is still waiting.
async function retryWaiting() {
  const dir = path.join(QUEUE, "done");
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const film = path.basename(f, ".json");
    try {
      const done = readJson(path.join(dir, f));
      const uploadOpen = done.upload !== "done" && done.upload !== "failed";
      const driveOpen = done.drive?.status !== "done";
      if (!uploadOpen && !driveOpen) continue;
      const orderFile = path.join(QUEUE, `${film}.json`);
      if (!fs.existsSync(orderFile)) continue;
      const order = readOrder(film);
      const ready = (uploadOpen && hasToken(order.channel)) || (driveOpen && hasToken("drive") && done.file && fs.existsSync(done.file));
      if (!ready) continue;
      if (await deliver(order, done)) {
        writeJson(path.join(dir, f), done);
        await commitAndPush(relResult("done", film), `Robot: ${film} delivered (upload: ${done.upload})`);
      }
    } catch (e) {
      log(`Could not retry ${film}: ${e.message}`);
    }
  }
}

async function round() {
  await syncCheckout();
  if (needsRestart()) return "restart";
  await ensurePackages();
  for (const film of listOrders()) {
    await processOrder(film); // one at a time: never two renders at once
    await syncCheckout().catch((e) => log(e.message));
  }
  await retryWaiting();
  return "ok";
}

async function main() {
  if (!takeLock()) {
    log("Another robot is already running. This one stops.");
    await sleep(60_000);
    return;
  }
  process.on("exit", dropLock);
  process.on("SIGINT", () => process.exit(0));
  keepAwake();
  log(`Robot started (branch ${cfg.branch}, copy ${REPO}, videos to ${cfg.outDir})`);
  for (;;) {
    try {
      if ((await round()) === "restart") {
        log("New robot code arrived: restarting.");
        return;
      }
    } catch (e) {
      log("Round problem (will try again): " + e.message);
    }
    if (ONCE) return;
    await sleep(cfg.pollSeconds * 1000);
  }
}

main().then(() => process.exit(0));
