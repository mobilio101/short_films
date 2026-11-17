// Google sign-in (OAuth for a desktop app), YouTube Data API uploads and Google Drive copies.
// Uses only the official Google APIs over HTTPS. Tokens are stored in %USERPROFILE%\.short-films-robot\tokens\.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { CLIENT_SECRET, TOKENS, readJson, writeJson, log } from "./common.mjs";

export const YT_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl", // needed for caption upload and reading the channel name
];
export const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive.file"]; // only files the robot made

export const tokenFile = (name) => path.join(TOKENS, `${name}.json`);
export const hasClient = () => fs.existsSync(CLIENT_SECRET);
export const hasToken = (name) => hasClient() && fs.existsSync(tokenFile(name));

function client() {
  const j = readJson(CLIENT_SECRET);
  const c = j.installed || j.web;
  if (!c?.client_id) throw new Error("client_secret.json is not a Google OAuth desktop client file");
  return c;
}

// ---------- sign-in (run by add-channel.bat, by a person) ----------

export async function authorize(name, scopes) {
  const { client_id, client_secret } = client();
  const verifier = crypto.randomBytes(48).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const state = crypto.randomBytes(16).toString("hex");

  const server = http.createServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const redirect = `http://127.0.0.1:${server.address().port}`;

  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id,
      redirect_uri: redirect,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent select_account",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    });

  const code = await new Promise((resolve, reject) => {
    server.on("request", (req, res) => {
      const q = new URL(req.url, redirect).searchParams;
      if (!q.get("code") && !q.get("error")) {
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      if (q.get("state") !== state || q.get("error")) {
        res.end("<h2>연결하지 못했습니다. 창을 닫고 다시 시도해 주세요.</h2>");
        reject(new Error(q.get("error") || "state mismatch"));
      } else {
        res.end("<h2>연결되었습니다. 이 창은 닫으셔도 됩니다.</h2>");
        resolve(q.get("code"));
      }
    });
    console.log("\n브라우저에서 Google 로그인 창이 열립니다. 안 열리면 아래 주소를 Chrome에 붙여 넣어 주세요:\n");
    console.log(url + "\n");
    spawn("rundll32", ["url.dll,FileProtocolHandler", url], { detached: true, stdio: "ignore" }).unref();
  }).finally(() => server.close());

  const tok = await postForm("https://oauth2.googleapis.com/token", {
    code,
    client_id,
    client_secret,
    redirect_uri: redirect,
    grant_type: "authorization_code",
    code_verifier: verifier,
  });
  if (!tok.refresh_token) throw new Error("Google did not return a refresh token; please try again");
  const saved = { refresh_token: tok.refresh_token, scope: tok.scope, savedAt: new Date().toISOString() };
  writeJson(tokenFile(name), saved);
  return saved;
}

// ---------- access tokens ----------

const cache = new Map();

async function accessToken(name) {
  const hit = cache.get(name);
  if (hit && hit.exp > Date.now() + 60_000) return hit.token;
  const { client_id, client_secret } = client();
  const t = readJson(tokenFile(name));
  const r = await postForm("https://oauth2.googleapis.com/token", {
    client_id,
    client_secret,
    refresh_token: t.refresh_token,
    grant_type: "refresh_token",
  });
  cache.set(name, { token: r.access_token, exp: Date.now() + (r.expires_in || 3600) * 1000 });
  return r.access_token;
}

async function postForm(url, form) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Google sign-in error ${res.status}: ${j.error_description || j.error || ""}`);
  return j;
}

async function api(name, url, init = {}) {
  const token = await accessToken(name);
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) } });
  const text = await res.text();
  let j;
  try {
    j = text ? JSON.parse(text) : {};
  } catch {
    j = { raw: text };
  }
  if (!res.ok) {
    const msg = j.error?.message || j.raw || res.statusText;
    throw new Error(`Google API ${res.status}: ${msg}`);
  }
  return { res, json: j };
}

// Upload big files in one resumable session (start, then send the bytes).
async function resumable(name, startUrl, metadata, file, mime) {
  const size = fs.statSync(file).size;
  const { res } = await api(name, startUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(size),
      "X-Upload-Content-Type": mime,
    },
    body: JSON.stringify(metadata),
  });
  const session = res.headers.get("location");
  if (!session) throw new Error("Google did not open an upload session");
  const { json } = await api(name, session, {
    method: "PUT",
    headers: { "Content-Type": mime, "Content-Length": String(size) },
    body: fs.readFileSync(file),
  });
  return json;
}

// ---------- YouTube ----------

export async function myChannel(name) {
  const { json } = await api(name, "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true");
  const c = json.items?.[0];
  return c ? { id: c.id, title: c.snippet.title } : null;
}

const CATEGORY = {
  "film & animation": "1",
  entertainment: "24",
  "people & blogs": "22",
  comedy: "23",
  education: "27",
  "howto & style": "26",
  "science & technology": "28",
};

export async function uploadVideo(channelId, order, file) {
  const status = { privacyStatus: "private", selfDeclaredMadeForKids: !!order.madeForKids };
  if (order.publishAt) status.publishAt = order.publishAt; // scheduled: stays private until then
  const snippet = {
    title: String(order.title).slice(0, 100),
    description: String(order.description || "").slice(0, 5000),
    tags: order.tags || [],
    categoryId: CATEGORY[String(order.category || "education").toLowerCase()] || "27",
  };
  if (order.language) {
    snippet.defaultLanguage = order.language;
    snippet.defaultAudioLanguage = order.language;
  }
  const v = await resumable(
    channelId,
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    { snippet, status },
    file,
    "video/mp4",
  );
  return { videoId: v.id, url: `https://youtu.be/${v.id}`, privacy: v.status?.privacyStatus || "private" };
}

export async function uploadCaptions(channelId, videoId, language, srtFile) {
  const boundary = "robot" + crypto.randomBytes(8).toString("hex");
  const meta = JSON.stringify({ snippet: { videoId, language: language || "en", name: "", isDraft: false } });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`),
    fs.readFileSync(srtFile),
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  await api(channelId, "https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet", {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
}

// ---------- Google Drive ----------

async function driveFolder(folderName) {
  const t = readJson(tokenFile("drive"));
  if (t.folderId) {
    try {
      const { json } = await api("drive", `https://www.googleapis.com/drive/v3/files/${t.folderId}?fields=id,trashed`);
      if (!json.trashed) return t.folderId;
    } catch {
      /* folder gone: make a new one */
    }
  }
  const { json } = await api("drive", "https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: folderName, mimeType: "application/vnd.google-apps.folder" }),
  });
  writeJson(tokenFile("drive"), { ...t, folderId: json.id });
  log(`Drive: made folder "${folderName}"`);
  return json.id;
}

export async function copyToDrive(file, folderName) {
  const parent = await driveFolder(folderName);
  const f = await resumable(
    "drive",
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink",
    { name: path.basename(file), parents: [parent] },
    file,
    "video/mp4",
  );
  return { fileId: f.id, link: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view` };
}
