# Generate narration with word timings from ElevenLabs.
# The API key is injected by the cloud environment's network proxy; never put it here.
# Usage: python3 scripts/voice-elevenlabs.py script.txt out.mp3 alignment.json <voice_id> <model> <stability> [speed]
# Then speed up with ffmpeg atempo if needed and convert the alignment to src/films/<name>/words.ts.
import json, sys, base64, subprocess, urllib.request
# usage: el_tts.py <text_file> <out_mp3> <out_alignment_json> <voice_id> <model> <stability> [speed]
text = open(sys.argv[1]).read().strip()
body = {"text": text, "model_id": sys.argv[5], "voice_settings": {"stability": float(sys.argv[6]), "similarity_boost": 0.8}}
if len(sys.argv) > 7:
    body["voice_settings"]["speed"] = float(sys.argv[7])
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{sys.argv[4]}/with-timestamps?output_format=mp3_44100_128",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
try:
    r = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read()[:400].decode()); sys.exit(1)
open(sys.argv[2], "wb").write(base64.b64decode(r["audio_base64"]))
json.dump(r.get("normalized_alignment") or r["alignment"], open(sys.argv[3], "w"))
print("ok")
