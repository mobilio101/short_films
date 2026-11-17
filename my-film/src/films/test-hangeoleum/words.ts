// Word timings from the ElevenLabs voice (Brian, eleven_multilingual_v2, speed 0.92), one clip per line,
// shifted to where each line starts in the film. Generated; do not edit by hand.
export type LineWord = { text: string; startMs: number; endMs: number; line: number };

// Frame where each voice line starts (public/voice/test-hangeoleum/line1-4.mp3).
export const LINE_STARTS = [3, 87, 183, 252];

export const WORDS: LineWord[] = [{"text": "알람", "startMs": 146, "endMs": 448, "line": 1}, {"text": "끄고,", "startMs": 506, "endMs": 1006, "line": 1}, {"text": "왜", "startMs": 1191, "endMs": 1296, "line": 1}, {"text": "또", "startMs": 1319, "endMs": 1400, "line": 1}, {"text": "눕게", "startMs": 1447, "endMs": 1656, "line": 1}, {"text": "될까?", "startMs": 1714, "endMs": 2120, "line": 1}, {"text": "같은", "startMs": 2958, "endMs": 3283, "line": 2}, {"text": "아침,", "startMs": 3341, "endMs": 3666, "line": 2}, {"text": "다른", "startMs": 3689, "endMs": 3933, "line": 2}, {"text": "한", "startMs": 3991, "endMs": 4084, "line": 2}, {"text": "걸음.", "startMs": 4142, "endMs": 4502, "line": 2}, {"text": "딱", "startMs": 6135, "endMs": 6344, "line": 3}, {"text": "한", "startMs": 6390, "endMs": 6483, "line": 3}, {"text": "발만,", "startMs": 6530, "endMs": 6971, "line": 3}, {"text": "바닥에.", "startMs": 7017, "endMs": 7598, "line": 3}, {"text": "일단", "startMs": 8667, "endMs": 8980, "line": 4}, {"text": "일어나.", "startMs": 9039, "endMs": 9538, "line": 4}];
