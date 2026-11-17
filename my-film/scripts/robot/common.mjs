// Shared helpers for the laptop robot: paths, config, logging, running commands.
// No secrets live here. Secrets live only in %USERPROFILE%\.short-films-robot\ (outside the repo).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

export const HOME = path.join(os.homedir(), ".short-films-robot");
export const TOKENS = path.join(HOME, "tokens");
export const LOGS = path.join(HOME, "logs");
export const CONFIG_FILE = path.join(HOME, "config.json");
export const CLIENT_SECRET = path.join(HOME, "client_secret.json");

// This file sits in <repo>/my-film/scripts/robot/
export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const SCRIPT_REPO = path.resolve(SCRIPT_DIR, "..", "..", "..");

for (const d of [HOME, TOKENS, LOGS]) fs.mkdirSync(d, { recursive: true });

export function readJson(file, fallback = undefined) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, file);
}

export function loadConfig() {
  const defaults = {
    // The robot's own copy of the project (so it never touches the folder you work in).
    checkout: path.join(HOME, "checkout"),
    remote: "https://github.com/mobilio101/short_films",
    branch: "main",
    // Finished videos go here (ignored by git). Kept apart from your own renders in my-film\out\.
    outDir: path.join(SCRIPT_REPO, "my-film", "out", "robot"),
    pollSeconds: 90,
    concurrency: { smirkman: 4, default: 8 },
    gl: "angle",
    driveFolderName: "Short films robot",
  };
  const cfg = { ...defaults, ...readJson(CONFIG_FILE, {}) };
  cfg.concurrency = { ...defaults.concurrency, ...(cfg.concurrency || {}) };
  return cfg;
}

const logFile = () => path.join(LOGS, "robot.log");

export function log(...parts) {
  const line = `[${new Date().toLocaleString("sv-SE")}] ${parts.join(" ")}`;
  console.log(line);
  try {
    const f = logFile();
    if (fs.existsSync(f) && fs.statSync(f).size > 5 * 1024 * 1024) {
      fs.renameSync(f, f.replace(/\.log$/, `.${Date.now()}.log`));
    }
    fs.appendFileSync(f, line + "\n", "utf8");
  } catch {
    /* logging must never stop the robot */
  }
}

// Run a program and collect its output. Never throws; returns { code, out, err }.
// `shell` is needed for npm / npx on Windows.
export function run(cmd, args, { cwd, shell = false, echo = false, timeoutMs = 0 } = {}) {
  return new Promise((resolve) => {
    const q = (a) => (/[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
    const child = shell
      ? spawn([cmd, ...args.map(q)].join(" "), { cwd, shell: true, windowsHide: true })
      : spawn(cmd, args, { cwd, windowsHide: true });
    let out = "";
    let err = "";
    let timer;
    if (timeoutMs) timer = setTimeout(() => child.kill(), timeoutMs);
    child.stdout.on("data", (d) => {
      out += d;
      if (echo) process.stdout.write(d);
    });
    child.stderr.on("data", (d) => {
      err += d;
      if (echo) process.stderr.write(d);
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ code: -1, out, err: err + String(e) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, out, err });
    });
  });
}

export function tail(text, n = 1500) {
  text = String(text || "").trim();
  return text.length > n ? "…" + text.slice(-n) : text;
}
