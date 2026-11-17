// Connect one YouTube channel (or Google Drive) to the robot. A person runs this, through add-channel.bat:
//   add-channel.bat smirkman      (channel ids are in my-film/channels/channels.json)
//   add-channel.bat drive         (Google Drive, for the mp4 copies)

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { CLIENT_SECRET, SCRIPT_REPO, readJson } from "./common.mjs";
import { authorize, myChannel, tokenFile, YT_SCOPES, DRIVE_SCOPES } from "./google.mjs";

const id = (process.argv[2] || "").trim().toLowerCase();
const channels = readJson(path.join(SCRIPT_REPO, "my-film", "channels", "channels.json")).channels;
const ids = channels.map((c) => c.id);

function say(t) {
  console.log(t);
}

async function ensureClientSecret() {
  if (fs.existsSync(CLIENT_SECRET)) return true;
  // Look for the file Google Cloud gives you ("client_secret_....json") in Downloads, and copy it.
  const dl = path.join(os.homedir(), "Downloads");
  const found = fs.existsSync(dl)
    ? fs
        .readdirSync(dl)
        .filter((f) => /^client_secret.*\.json$/i.test(f))
        .map((f) => path.join(dl, f))
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    : [];
  if (found.length) {
    fs.copyFileSync(found[0], CLIENT_SECRET);
    say(`Google Cloud 열쇠 파일을 찾아서 로봇 보관함에 복사했습니다: ${path.basename(found[0])}`);
    return true;
  }
  say("\n아직 Google Cloud 준비(3단계)가 끝나지 않았습니다.");
  say("Google Cloud에서 받은 client_secret_....json 파일을 '다운로드' 폴더에 두고 다시 실행해 주세요.");
  return false;
}

async function main() {
  if (!id || (id !== "drive" && !ids.includes(id))) {
    say("사용법: add-channel.bat <채널 이름>");
    say("채널 이름: " + ids.join(", ") + ", 또는 drive (구글 드라이브)");
    process.exit(1);
  }
  if (!(await ensureClientSecret())) process.exit(1);

  if (id === "drive") {
    say("\n구글 드라이브를 연결합니다. 브라우저에서 영상 사본을 보관할 구글 계정을 고르고 '허용'을 눌러 주세요.");
    await authorize("drive", DRIVE_SCOPES);
    say("\n완료: 구글 드라이브가 연결되었습니다. 로봇이 다음 차례에 기다리던 영상을 드라이브에 복사합니다.");
    return;
  }

  const ch = channels.find((c) => c.id === id);
  say(`\n유튜브 채널 "${ch.name}"을(를) 연결합니다.`);
  say(`브라우저에서 구글 계정을 고른 다음, 채널 목록에서 꼭 "${ch.name}" 채널을 골라 '허용'을 눌러 주세요.`);
  await authorize(id, YT_SCOPES);
  const mine = await myChannel(id).catch(() => null);
  if (!mine) {
    fs.unlinkSync(tokenFile(id));
    say("\n이 계정에는 유튜브 채널이 없습니다. 다시 실행해서 채널을 골라 주세요.");
    process.exit(1);
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = await rl.question(`\n연결된 채널: "${mine.title}". "${ch.name}" 채널이 맞나요? (Y/N) `);
  rl.close();
  if (!/^y/i.test(ans.trim())) {
    fs.unlinkSync(tokenFile(id));
    say("연결을 취소했습니다. 다시 실행해서 맞는 채널을 골라 주세요.");
    process.exit(1);
  }
  const t = readJson(tokenFile(id));
  fs.writeFileSync(tokenFile(id), JSON.stringify({ ...t, channel: mine }, null, 2));
  say(`\n완료: "${mine.title}" 채널이 연결되었습니다. 기다리던 영상이 있으면 로봇이 2분 안에 '비공개'로 올립니다.`);
}

main().catch((e) => {
  console.error("\n문제가 생겼습니다: " + e.message);
  process.exit(1);
});
