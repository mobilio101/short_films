# Fit an ElevenLabs narration to a Short and write its word timings.
# - shortens long pauses to `keep` seconds,
# - speeds the voice up (pitch unchanged) so speech ends at `target` seconds (never slower than 1.0),
# - writes public/voice/<name>.mp3 and src/films/<name>/words.ts.
#
# Usage: python3 scripts/fit-voice.py raw.mp3 alignment.json <name> [target_seconds=57.5] [keep_pause=0.5]
import json, re, subprocess, sys, os

raw, align_path, name = sys.argv[1], sys.argv[2], sys.argv[3]
target = float(sys.argv[4]) if len(sys.argv) > 4 else 57.5
keep = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

a = json.load(open(align_path))
words, cur, s, pe = [], "", None, None
for c, b, e in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
    if c.isspace():
        if cur:
            words.append([cur, s, pe]); cur = ""
        continue
    if not cur:
        s = b
    cur += c; pe = e
if cur:
    words.append([cur, s, pe])
# drop emotion tags like [excited]
w = [[re.sub(r"^\[[a-z ]+\]", "", x[0]), x[1], x[2]] for x in words if not re.fullmatch(r"\[[a-z ]+\]", x[0])]
w = [x for x in w if x[0]]

cuts = []
for i in range(len(w) - 1):
    g = w[i + 1][1] - w[i][2]
    if g > keep + 0.05:
        cuts.append((w[i][2] + keep / 2, w[i + 1][1] - keep / 2))
total = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw]).decode())

def new_t(x):
    r = 0.0
    for cs, ce in cuts:
        if x >= ce: r += ce - cs
        elif x > cs: r += x - cs
    return x - r

speech_end = new_t(w[-1][2])
k = max(1.0, speech_end / target)
segs, t = [], 0.0
for cs, ce in cuts:
    segs.append((t, cs)); t = ce
segs.append((t, total))
filt = "".join(f"[0:a]atrim={a0:.3f}:{a1:.3f},asetpts=PTS-STARTPTS[s{i}];" for i, (a0, a1) in enumerate(segs))
filt += "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[c];[c]atempo={k:.4f}[o]"
out_mp3 = os.path.join(root, "public", "voice", f"{name}.mp3")
os.makedirs(os.path.dirname(out_mp3), exist_ok=True)
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", raw, "-filter_complex", filt, "-map", "[o]", "-ar", "44100", "-b:a", "192k", out_mp3])

out = [{"text": x[0], "startMs": round(new_t(x[1]) / k * 1000), "endMs": round(new_t(x[2]) / k * 1000)} for x in w]
ts = os.path.join(root, "src", "films", name, "words.ts")
os.makedirs(os.path.dirname(ts), exist_ok=True)
open(ts, "w").write(
    f"// Word timings from the ElevenLabs voice (pauses over {keep}s trimmed, sped up {k:.2f}x). Generated; do not edit by hand.\n"
    'import { Word } from "../../components/memphis";\n\nexport const WORDS: Word[] = ' + json.dumps(out) + ";\n"
)
print(f"raw {total:.1f}s, trimmed {sum(ce - cs for cs, ce in cuts):.1f}s of pauses, speed {k:.2f}x, speech ends at {out[-1]['endMs'] / 1000:.1f}s")
