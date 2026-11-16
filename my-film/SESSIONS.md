# Sessions: who does what

Each session is a separate chat in the Claude app. Sessions don't remember each other's chats: they
hand work over through files in this repository (`STATUS.md`, `channels/*/BACKLOG.md`, `STORY.md`,
`queue/`). Keep chats short; when one gets long, close it and open a new one with the same start
message: it picks up from the files.

| Session | Job | Model | Lives |
|---|---|---|---|
| **총괄 (HQ)** | Status of everything, creates film sessions, owns shared code and rulebooks, merges finished branches into `main`, watches robot results | Sonnet day to day, Opus for rule or shared-code changes | Restart about weekly |
| **기획 · Inkredible / 역사 한 방울** | Topic ideas with sources → `channels/inkredible/BACKLOG.md`, `channels/drop/BACKLOG.md` | Sonnet | Ongoing |
| **기획 · SMIRKMAN** | Topic ideas → `channels/smirkman/BACKLOG.md` | Sonnet | Ongoing |
| **기획 · 한걸음** | Confirm the format (10-second test), then topic ideas → `channels/hangeoleum/BACKLOG.md` | Opus for the test, then Sonnet | Ongoing |
| **자동화** | Build the laptop robot and Codex instructions (`AUTOMATION.md`) | Opus | Until the robot works |
| **제작 · <film>** | One film: `STORY.md`, voice, animation, stills, upload info, render order | Opus | One film, then close |

## Hand-over rules
- Planning sessions only edit their channel's `BACKLOG.md` (branch `plan/<channel>`).
- When the user picks a topic, 총괄 (or the planning session) creates the film session with the
  start message below, moves the topic to "In production" in the backlog and adds a row to `STATUS.md`.
- Film sessions work on `film/<name>`; when the user approves the stills they write the upload info,
  push, and tell 총괄. 총괄 merges into `main`, which the laptop robot renders and uploads.

## Start messages (copy into a new session)
**총괄**
> 너는 총괄 세션이야. my-film/CLAUDE.md, SESSIONS.md, STATUS.md를 읽고 지금 현황을 한국어로 짧게 알려줘.

**기획 · <채널>**
> 너는 <채널> 기획 세션이야. my-film/CLAUDE.md와 <규칙 파일>, <BACKLOG.md>를 읽고, 새 주제 후보 5개를
> 출처와 함께 BACKLOG.md에 추가한 다음 한국어로 짧게 보여줘.

**제작 · <영상>**
> 너는 <채널>의 "<주제>" 제작 세션이야. my-film/CLAUDE.md와 <규칙 파일>을 읽고, 규칙대로 STORY.md(사실과
> 출처, 대본, 장면 목록)부터 써서 보여준 다음 내 "go"를 기다려. 브랜치는 film/<이름>.

**자동화**
> 너는 자동화 세션이야. my-film/CLAUDE.md와 AUTOMATION.md를 읽고 노트북 렌더·업로드 로봇을 만들자.
