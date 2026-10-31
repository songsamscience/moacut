# 모아컷 v3.2 「AI 보이스 만들기」 화면 구성 설계(Fable)

작성 2026-10-10 · 설계만(코드 수정 없음) · 구현 · 연결 · 시험은 Opus가 이 문서를 보고 한다.
짝 문서: `docs/v3.2/VOICE_PLAN_FABLE.md`(목소리 10개 제작 · 목록 · 샘플 · 호환 — **id · 샘플 경로 · 기본값 규칙은 그 문서 §4 를 따른다**). 이 문서는 그 목록을 **어디에 · 어떻게 보여 주고, 몇 번 눌러 끝나게 하느냐**만 정한다.
지금 화면 캡처(실제 모델로 찍음): `tests/out/voice-ui-shots/`(찍는 스크립트 `_voice-shots.mjs`, 같은 폴더).

사용자 말: 「보이스를 만드는 과정이 너무 클릭이 많아, 약간 디자인도 손봐줘.」 — 중학교 과학 교사. 쉬운 말, 「레이어」 같은 용어 금지.

---

## 0. 핵심 결정(먼저 읽기)

| # | 결정 | 까닭 |
|---|---|---|
| U1 | **창 하나**(「AI 보이스 만들기」)로 합친다. 「대본으로 AI 보이스」 창과 ①~⑤ 마법사를 없애고, 창 위 탭 **「대본으로」 / 「자막으로」** 로 재료만 고른다 | 지금은 같은 일을 하는 창이 둘이고 목소리 목록 · 미리 듣기 · 확인 체크가 서로 다르다(§1.5 ①) |
| U2 | 주 단추는 **「만들어 넣기」 하나** — 만들고, 다 되면 바로 타임라인에 넣고, 창을 닫고, 토스트에 **「되돌리기」** 단추. 먼저 듣고 싶은 사람은 **「먼저 들어 보기」**(만들기만) → 「타임라인에 넣기」 | 「만들기 → 다음 → 넣기」 세 번이 한 번으로. 되돌리기는 이미 한 apply 라 Ctrl+Z 와 같음 |
| U3 | 단계 번호는 **①②** 둘만(① 대본 쓰기/자막 고르기 · ② 목소리). 오른쪽 문장 목록은 「확인하는 곳」, 넣기는 바닥 막대 | ⑤까지 세는 번호가 「할 일이 다섯」처럼 보임 |
| U4 | 라이선스 동의 · 모델 받기(401 MB)는 **없애지 않고 흐름 안에 넣는다**: 모델이 없을 때 「만들어 넣기」를 누르면 창 몸통이 동의 판으로 바뀌고, 「받고 계속하기」 뒤 **자동으로 만들어 넣는다**(다시 누를 필요 없음). 받는 동안은 창으로 돌아와 대본 · 목소리를 계속 만질 수 있다 | 법 · 용량 안내는 필요하지만 「받기 끝 → 다시 만들기」 재클릭은 불필요(§1.5 ⑥) |
| U5 | **AI 고지 확인 체크를 동의 판으로 옮긴다**(한 번, 브라우저 저장 `ss.moacut.aiDisclosureAck` = 모델 rev). 창마다 · 프로젝트마다 다시 체크하지 않는다. 넣을 때 `project.aiDisclosureAck = true` 는 그대로 기록. 바닥 막대에는 체크 대신 한 줄 안내 「넣은 음성엔 'AI 생성 음성' 표시가 들어가요」 | OpenRAIL-M (e) 의무는 동의 판에 이미 있고, MP4 고지는 끌 수 없으니 체크는 한 번이면 됨. (대안 B: 프로젝트마다 첫 넣기에만 바닥에 체크 1회 — 제품 결정이 「프로젝트마다」면 이걸로) |
| U6 | 목소리 **10개(남성 5 · 여성 5) 두 열 카드**, 카드마다 **▶ 들어 보기**(비교 문장 1개, 번들 MP3 → 모델 받기 전에도 됨; 모델이 있고 빠르기 · 품질을 바꿨으면 그 설정으로 합성), 머리에 **「10개 이어 듣기」** | 모델 400 MB 전엔 ▶ 가 죽어 있어 못 골랐음(§1.5 ⑤). 비교는 한 번 눌러 쭉 듣는 게 가장 적음 |
| U7 | 기본값 똑똑하게: 목소리 = 이 프로젝트 마지막(`project.voice`) → 브라우저 마지막(`ss.moacut.voicePrefs`) → `ko-f3`. 빠르기는 목소리 기본값, 품질 「보통」. **빠르기 · 품질 · 넣기 방식 세부 · 끝 고지 자막 · 짧은 자막 묶기는 「세부 설정」(접힘)** | 매번 보는 사람은 거의 안 만짐(§1.5 ⑦) |
| U8 | 「다시 만들기」(항목) 후보는 **다 되면 자동 재생** → 「바꾸기」. 「변경된 음성 다시 만들기 (n)」 · 길이 맞추기의 「속도 올리기」 · 「읽을 문장 줄이기」는 **같은 씨앗이라 후보 없이 바로 바꾼다**(이전 소리는 테이크에 남음, 토스트 「되돌리기」) | 새 씨앗(소리가 달라짐)일 때만 듣고 고르면 됨 |
| U9 | 오른쪽 문장 행: 읽는 글은 테두리 없는 글(마우스 올리면 테두리) · ▶ 는 회색(재생 중만 분홍) · 상태 배지는 「완료 · 2.7 초」 한 가지(「저장된 결과」 구분은 `data-status` 로만) | 줄마다 분홍 ▶ 가 주 단추보다 눈에 띄었고, 「저장된 결과」는 교사에게 뜻 없는 말 |

목표 클릭 수(창 열기 포함, 글 입력 제외): **처음 쓰는 사람 대본 → 넣기 4번**(지금 8), **다시 쓰는 사람 2번**(지금 자막 7~8 · 대본 3~5), 목소리 10개 비교 **1번**(지금 11). 전체 표는 §5.

---

## 1. 지금 흐름의 클릭 수

세는 법: 마우스 클릭 1 = 키 1(V · ⇧V · Esc) = 1. 글자 입력은 안 센다. 「초점이 이미 있어 안 눌러도 되는 것」은 0.

### 1.1 (a) 처음 쓰는 사람 — 대본 한 줄 → 타임라인(대본 창, `02~07` 캡처)

| 순서 | 누르는 것 | 수 | 비고 |
|---|---|---|---|
| 1 | 머리 막대 「AI 보이스」(또는 ⇧V) | 1 | `TopBar.tsx:111` |
| 2 | 대본 칸 | 1 | 모델이 없으면 초점이 「음성 모델 받기」 카드에 가 있어 칸을 눌러야 함(`Modal.tsx:26` 첫 초점 규칙) |
| 3 | 「모두 만들기」 | 1 | 모델 없음 → `generateScript` 가 라이선스 창을 연다(`scriptVoice.ts:142`) |
| 4 | 「위 조건을 읽었고 지키겠어요」 | 1 | |
| 5 | 「받기 시작」 | 1 | 받기 끝 → 대본 창으로 돌아오지만 **만들기는 안 됨** |
| 6 | 「모두 만들기」 다시 | 1 | |
| 7 | 「AI 음성 사용을 … 확인했어요」 | 1 | |
| 8 | 「타임라인에 넣기」 | 1 | |
| | **합계** | **8** | 목소리를 들어 보려면 모델을 받은 뒤 「기본 목소리 10개」 펼치기 +1, ▶ 마다 +1 |

### 1.2 (b) 모델이 있는 사람 — 자막 3개로(마법사, `08~12`)

| 순서 | 누르는 것 | 수 | 비고 |
|---|---|---|---|
| 1 | V(또는 자막 패널 「보이스」 탭 → 「AI 보이스 만들기 (V)」 = 2) | 1 | 선택 자막 없으면 전체 |
| 2 | ① 자막 고르기 「다음」 | 1 | 선택으로 열면 이미 정해져 있음 — 결정 없는 단계 |
| 3 | ② 목소리 「다음」 | 1 | 기본값 그대로면 결정 없음 |
| 4 | ③ 읽을 문장 「다음」 | 1 | 예상 길이 계산 기다림. 대부분 그대로 |
| 5 | ④ 「만들기」 | 1 | |
| 6 | ④ 「다음」 | 1 | |
| 7 | ⑤ 「AI 음성 사용을 … 확인했어요」 | 1 | 프로젝트당 처음만(`project.aiDisclosureAck`) |
| 8 | ⑤ 「타임라인에 넣기」 | 1 | 길어진 음성이 있으면 「길이 맞추기」 창이 바로 열림(+§1.4) |
| | **합계** | **8**(두 번째부터 7) | 같은 일을 대본 창으로 하면 ⇧V 1 + 「모두 만들기」 1 + 확인 체크 (1) + 넣기 1 = **3~5**(모델 있으면 대본 칸에 초점이 자동) |

### 1.3 (c) 목소리 골라 들어 보기 · 바꾸기

| 일 | 지금 누르는 것 | 수 |
|---|---|---|
| 10개를 다 들어 보기(대본 창) | 「기본 목소리 10개」 펼치기 1 + ▶ ×10 | **11**(모델 없으면 **불가** — ▶ 비활성 `ScriptVoiceUi.tsx:49`) |
| 10개를 다 들어 보기(마법사 ②) | ▶ ×10(가상 2개까지 12) | 10~12(모델 없으면 불가) |
| 하나 고르기 | 카드 1 | 1 |
| 만든 뒤 목소리 바꾸기(대본 창) | 카드 1 → 결과가 모두 「대기」로 → 「모두 만들기」 1 → 「넣기」 1 | 3 |
| 샘플 문장 | 「안녕하세요, 오늘 수업을 시작할게요.」(`tts.ts:42`) → 비교 문장으로 바꿀 것 | — |

### 1.4 (d) 다시 만들기 · 길이 맞추기(`13~16b`)

| 일 | 지금 누르는 것 | 수 |
|---|---|---|
| 음성 하나 다시 만들기(새 씨앗) | 타임라인 음성 블록 1 → 속성 칸 「음성」 탭 1(종류별로 기억되면 0) → 「다시 만들기」 1 → 「듣기」 1 → 「바꾸기」 1 | **4~5** |
| 변경된 음성 다시 만들기 | 선택 해제(Esc) 0~1 → 프로젝트 「보이스」 탭 1 → 「변경된 음성 다시 만들기 (n)」 1 → 마법사 ④ 「만들기」 1 → 「다음」 1 → 「타임라인에 넣기」 1 | **5~6** |
| 길이 맞추기(넣은 뒤 자동으로 열림) | 「속도 올리기」가 기본 선택 → 「적용」 1 → 후보 줄 「듣기」(0~1) → 「바꾸기」 1 | **2~3** |
| 길이 맞추기(타임라인 배지로) | 배지 1 → 「적용」 1 → 「바꾸기」 1 | 3 |

### 1.5 불필요한 확인 · 중복 · 흩어진 설정

| # | 문제 | 어디 |
|---|---|---|
| ① | 같은 일을 하는 창이 둘(대본 창 · 마법사). 목소리 목록(2 + 접힌 10 vs 12), 미리 듣기 조건, 확인 체크 저장 위치가 다름 | `ScriptVoiceUi.tsx` · `VoiceUi.tsx` |
| ② | 마법사 5단계 중 ① · ③ · ⑤는 대부분 결정이 없는데 「다음」을 눌러야 함. 단계 띠가 375 폭에서 잘림(`19` 캡처) | `VoiceWizard` |
| ③ | 만들기와 넣기가 떨어져 있음(「만들기」→「다음」→「넣기」 / 「모두 만들기」→「넣기」) | 둘 다 |
| ④ | AI 고지 확인 체크가 라이선스 동의와 따로, 창마다 또 있음 | `label.check` ×2 |
| ⑤ | 모델이 없으면 ▶ 가 죽어 있어 **400 MB 를 받기 전엔 목소리를 못 고름** | `canSample` · `disabled={!ready}` |
| ⑥ | 받기가 끝나면 창으로 돌아오지만 「모두 만들기」를 다시 눌러야 함 | `generateScript` → `openLicense` |
| ⑦ | 설정이 흩어짐: 빠르기 · 품질(③ 만들기), 넣는 방법(바닥), 묶기(마법사 ①), 끝 고지 자막(마법사 ⑤), 제안 모두 적용(마법사 ③) | |
| ⑧ | 줄마다 분홍 ▶(primary) 5개가 주 단추보다 눈에 띔. 「저장된 결과」 배지는 뜻이 안 통함. 읽는 글 칸이 줄마다 큰 입력 상자라 무거움 | `06` 캡처 |
| ⑨ | 375 폭: 대본 창 몸통 스크롤 639 px, 바닥 막대 3줄 | `18` 캡처 |

---

## 2. 새 흐름

### 2.1 원칙
1. 재료(대본 / 자막)만 고르면 나머지는 기본값으로 바로 간다. 바꿀 것이 있는 사람만 왼쪽을 만진다.
2. 「만들어 넣기」 한 번 = 만들기 + 넣기 + 창 닫기 + 토스트(되돌리기). 실패하면 넣지 않고 창에 남아 이유를 보여 준다.
3. 처음 한 번(동의 · 받기)은 같은 창 안에서, 끝나면 하던 일을 **자동으로 이어 간다**.
4. 듣는 일은 어디서나 한 번: 카드 ▶, 「10개 이어 듣기」, 행 ▶, 「전체 이어 듣기」. 재생은 앱 전체에서 한 번에 하나(`stopPlayback`).

### 2.2 흐름도

```
[⇧V · 머리 막대 「AI 보이스」] ─┐                       ┌─ [V · 자막 패널 「AI 보이스 만들기 (V)」 · 「자막 전체 → AI 보이스」]
                               ▼                       ▼
                 ┌──────── 창 「AI 보이스 만들기」 (탭: 대본으로 | 자막으로) ────────┐
                 │ ① 대본 쓰기(또는 자막 고르기) → 문장 목록이 오른쪽에 생김          │
                 │ ② 목소리(기본값 있음) · 세부 설정(접힘)                            │
                 │ [먼저 들어 보기]  [만들어 넣기]                                   │
                 └──────────────┬─────────────────────────┬──────────────────────┘
          모델 없음 ┌───────────┘                         │ 모델 있음
                   ▼                                       ▼
   동의 판(같은 창) 「받고 계속하기」 ──받는 중(창으로 복귀, 머리 칩)──▶ 다 받으면 자동으로 ▶ 만들기(행마다 진행) ─┬─ 모두 성공 → 넣기 → 창 닫힘 → 토스트 「… 넣었어요」[되돌리기]
                                                                                                        └─ 일부 실패 → 창 유지: 「실패한 문장 다시 만들어 넣기 (n)」 / 「실패한 문장 빼고 넣기」
   자막으로 넣은 뒤 길어진 음성이 있으면 → 「음성 길이 맞추기」 창(지금처럼) → 「적용」 한 번에 바꿈
```

### 2.3 상태 기계(창 하나, `phase`)

| phase | 들어오는 조건 | 보이는 것 | 주 단추 |
|---|---|---|---|
| `empty` | 문장 0개 | 오른쪽 안내 「대본을 쓰면 문장이 여기에 나와요.」 / 「고른 자막이 없어요.」 | 「만들어 넣기」 비활성(title 「대본을 먼저 써요」 / 「자막을 하나 이상 골라요」) |
| `ready` | 문장 ≥ 1, 안 만든 것 있음 | 행 상태 「대기」(배지 없음) | 「만들어 넣기」 · 보조 「먼저 들어 보기」 |
| `license` | 주 단추 눌렀는데 모델 없음(또는 동의 안 됨) | 몸통 = 동의 판(§3.6) | 「받고 계속하기」(모델 있고 동의만 없으면 「동의하고 계속하기」) |
| `downloading` | 받기 시작 | 창 몸통 복귀, 머리 칩 「받는 중 123 / 401 MB [취소]」 | 「만들어 넣기」 비활성 + 바닥 hint 「다 받으면 바로 만들어 넣어요」(`pendingIntent` 보관) |
| `making` | 만들기 중 | 행마다 진행 막대, 요약 「만드는 중 2 / 5」 | 「만드는 중 2 / 5」 비활성 + 「멈추기」 |
| `made` | 모두 완료(「먼저 들어 보기」 경로) | 행마다 ▶ · 길이 | 「타임라인에 넣기」 |
| `partial` | 일부 실패 | 실패 행 `.is-failed` + 이유 | intent=insert: 「실패한 문장 다시 만들어 넣기 (n)」 + ghost 「실패한 문장 빼고 넣기」 / intent=preview: 「실패한 문장만 다시 (n)」 + 「타임라인에 넣기」 비활성(title 「모든 문장을 먼저 만들어요」) |
| `inserting` | 자산 보관 중 | 바닥 hint 「넣는 중…」 | 모두 비활성 |
| `error` | 넣기 실패 · 세션 실패 · 기기 불가 | `div.note.danger` 맨 위 | 세션 · 기기 불가면 비활성, 보관 실패면 「다시 넣기」 |

취소: `making` 에서 「멈추기」 = `jobs.cancelKind('tts')` → 끝난 행은 유지, 만들던 행은 「대기」(지금 그대로). `downloading` 에서 「취소」 = `cancelDownload()`(받은 파일은 남김) → `ready` 로, `pendingIntent` 지움. 대기열(HEAVY) = 머리 칩에 「자동 자막이 끝나면 시작해요 · 대기 1번째 [대기 취소]」(기존 `WaitHint`).

---

## 3. 화면 구성 명세

### 3.1 창 틀 · 여는 법

- `div.modal.wide.script-voice.vs[data-source=script|subs]` — `Modal` 그대로(eyebrow 「AI VOICE」, 제목 「AI 보이스 만들기」, hint = 요약 줄 §3.2). `locked` = making · downloading · inserting(지금과 같이 Esc · 바깥 클릭 막음, 「멈추고 닫기」 단추로만).
- 폭 `min(100%, 1120px)`(지금 값). 1366×768 에서 몸통 스크롤 없이 한 화면(문장 목록만 안에서 스크롤).
- dialog id: `'voice'` 하나로 합치고 `'script-voice'` 는 같은 창으로 보냄(App.tsx 두 줄 → 한 컴포넌트 `VoiceStudio`). 열기 함수 `openVoiceStudio({ source: 'script' | 'subs', ids?: string[] })`; 기존 `openScriptVoice()` = source script, `openVoiceWizard(ids)` = source subs(이름은 남겨 shortcuts · 패널이 그대로 부르게).
- 첫 초점: 대본 탭 = `#script-text`, 자막 탭 = 첫 행 체크박스. `Modal` 에 `focus?: string`(선택자) prop 하나를 더해 쓴다(지금 규칙은 DOM 첫 입력이라 탭 세그 단추에 초점이 감).
- 진입점은 그대로: 머리 막대 「AI 보이스」(⇧V) → 대본 탭. V · 자막 패널 「AI 보이스 만들기 (V)」 · 「선택한 자막 n개 → AI 보이스」 · 프로젝트 「자막 전체 → AI 보이스」 → 자막 탭(그 자막들 체크). 자막이 0개면 자막 탭 비활성(title 「자막이 없어요. 자막을 먼저 넣고(T · 자동 자막) 다시 눌러요.」).

### 3.2 머리(제목 아래 한 줄 — `Modal` 의 `hint` 자리에 그린다, 몸통 행이 아님)

```
div.vs__head   (= Modal hint 노드. hint 는 ReactNode 를 받으므로 Modal 수정 없음)
  div.seg.vs__tabs[role=tablist aria-label="재료"]  > button[role=tab]「대본으로」 · button「자막으로 (3)」   ← (n) = 프로젝트 자막 수
  span.vs__model  (오른쪽 끝)
     모델 없음:  button.btn.ghost.sm「음성 모델 받기 · 401 MB」(title 「처음 한 번만 받아요. 받은 뒤에는 이 기기 안에서만 만들어요.」) → phase license
     받는 중:    span「받는 중」 + div.progress.sm + b.num「123 / 401 MB」 + button.btn.ghost.sm「취소」
     받아 둠:    span.hint「모델 받아 둠 · 내 기기에서만」   (글만)
     대기열:     WaitHint 그대로(칩 자리에)
```
요약 글(지금 제목 hint 「문장 5개 · 14.0 초」)은 오른쪽 열 머리(§3.4)로 옮긴다: 대본 탭 「문장 5개 · 14.0 초」, 자막 탭 「자막 3개 · 묶음 3개 · 이미 음성 있는 자막 1개는 바꿔요」(해당 없으면 뒷말 생략). 머리를 몸통 행으로 두지 않는 까닭: 1366×768 에서 몸통 높이가 ≈ 534 px 인데 왼쪽 열이 ≈ 484 px 라 40 px 행 하나가 더 들어가면 스크롤이 생긴다.

탭을 바꿔도 각 탭의 입력(대본 글 · 체크 상태 · 결과)은 그대로 둔다(두 스토어 유지, §6).

### 3.3 왼쪽 열 `div.vs__side`(폭 `--vs-side-w: 420px`)

**① 재료**
- 대본 탭: `label.field > span.field__label.vs__step(①「대본」) + textarea#script-text.textarea.script-voice__text`(rows 5, placeholder 지금 문구 그대로). 밑 hint 「문장 끝 · 줄바꿈에서 나누고, 빈 줄은 조금 더 쉬어요.」
- 자막 탭: 같은 자리에 `div.vs__subs > span.field__label.vs__step(①「자막 고르기」) + div.btn-row(「모두 고르기」「모두 풀기」 ghost sm) + p.hint`「오른쪽 목록에서 체크를 풀면 그 자막은 건너뛰어요. 음성은 자막 자리에 들어가요.」 (목록 자체는 오른쪽 — 왼쪽에 자막 목록을 또 두지 않는다.) `expanded.report`(같은 음성을 쓰는 자막 자동 포함 안내)는 이 hint 아래 한 줄로.

**② 목소리** `div.field.vs__voices`
```
div.field__head > span.field__label.vs__step(②「목소리」) + button.btn.ghost.sm.vs__chain(Play/Square)「10개 이어 듣기」/ 재생 중 「멈추기」
div.vs-voices[role=radiogroup aria-label="목소리"]
  div.vs-voices__col > span.group-title「남성」 + div.vs-voice ×5
  div.vs-voices__col > span.group-title「여성」 + div.vs-voice ×5
div.vs-voice(.is-selected .is-playing)[data-voice=ko-m1]
  button.vs-voice__pick[role=radio aria-checked tabindex=0|-1]
     b.vs-voice__name「남성 1」 + small.vs-voice__desc「낮고 차분한 톤」 (+ 선택 시 svg Check 14 오른쪽 위)
  button.btn.icon.sm.ghost.vs-voice__play[aria-label="남성 1 들어 보기" | 재생 중 "멈추기"][aria-pressed]  (Play 13 / Square 13)
p.hint.vs__ai-note「이 목소리들은 Supertonic 3 의 공개 목소리를 섞어 만든 AI 음성이에요. 실제 사람의 녹음이나 목소리 복제가 아니에요.」  (VOICE_PLAN §4.3 문구, 마지막 「영상에 쓸 때는…」 문장은 바닥 막대 안내와 겹치므로 뺀다)
```
- 목록 · 이름 · 설명 · 순서 · 기본값은 VOICE_PLAN §4.1(`ko-m1…ko-f5`, `hidden` 목소리는 안 그림). 설명 문구는 나중에 바뀔 수 있으므로 `VoiceDef.desc` 에서 읽는다.
- 카드 높이 44 px, 두 열이라 5줄 = 244 px. 1366 에서 왼쪽 열 합계 ≈ 대본(label 20 + textarea 96 + hint 18) 134 + 목소리(머리 24 + 열 제목 18 + 244 + AI 안내 2줄 32) 318 + 세부 30 + 간격 30 ≈ 512 ≤ 몸통 높이 ≈ 534(창 728 − 머리 90 − 바닥 72 − 몸통 여백 32). 자막 탭은 대본 칸이 없어 더 여유. 넘치면 textarea rows 5 → 4 부터 줄인다(목소리 카드는 줄이지 않는다).
- **들어 보기 규칙**(U6): (1) `speed === voice.speed && steps === 8` → `public/voices/<id>.mp3` 를 `<audio>` 로(즉시, 모델 불필요) (2) 아니면 모델 있을 때 `sampleVoice(id, speed, steps)`(지금 함수 · 캐시) — 없으면 (1)로 떨어지고 title 「미리 듣기는 기본 빠르기예요」 (3) MP3 404 이고 모델도 없으면 ▶ 비활성 title 「모델을 받으면 들을 수 있어요」. 샘플 문장(둘 다) = **「여러분, 오늘은 우리 주변에서 쉽게 발견할 수 있는 흥미로운 현상을 함께 살펴보겠습니다.」**(`SAMPLE_TEXT` 교체). 합성 중엔 ▶ 에 `.is-loading`.
- **10개 이어 듣기**: 남성 1 → … → 여성 5 순서로 (1) 규칙의 소리를 이어서(파일 사이 0.4 s). 재생 중 카드는 `.is-playing`(테두리 accent, ▶ → ■), 목록을 그 카드로 스크롤. 듣는 중에 카드를 눌러 **고르기는 되고 재생은 안 끊긴다**. 다른 카드 ▶ 를 누르면 이어 듣기는 멈추고 그것만. 끝나면 단추 글이 「10개 이어 듣기」로 돌아온다.
- 선택 바꾸기 = `setVoiceSettings({ voiceId })`(빠르기를 그 목소리 기본값으로 — 지금 로직), 결과는 모두 「대기」로(지금과 같음). 만든 뒤 바꾸면 요약에 「목소리를 바꿔서 다시 만들어요」 1줄.

**세부 설정** `details.vs__advanced > summary「세부 설정 · 빠르기 1.05× · 보통」`(summary 에 현재 값 요약, 기본 접힘, 값이 기본과 다르면 자동으로 펼침)
- `Slider`「빠르기」 0.7~2.0 step 0.05, format `1.05×`(0.9~1.5 밖이면 「(권장 0.9~1.5 밖)」 — 지금 마법사 문구)
- `Seg`「품질」 「빠르게 (4단계)」「보통 (8단계)」
- (「넣는 방법」 세그는 여기가 아니라 바닥 막대 §3.5 — 넣을 때 보는 결정이라 넣기 단추 옆에 둔다)
- 자막 탭만: `label.check`「짧은 자막은 한 문장으로 묶기」(기본 켬, 지금 `grouping`)
- 둘 다: `label.check`「영상 끝에 'AI 음성 사용' 문구 넣기 (2 초 자막)」(기본 끔, 지금 `endNote` — 대본 쪽 `insertScript` 에도 `withEndNote` 적용)

### 3.4 오른쪽 열 `div.vs__main` — 문장 목록(창 안에서만 스크롤)

```
div.script-voice__head
  span.field__label「문장 · 듣기」(번호 없음) + span.hint.script-voice__sum[role=status]「문장 5개 · 14.0 초 · 완료 4 · 실패 1」(만들기 전엔 「문장 5개 · 읽는 글을 고칠 수 있어요 · 화면 자막은 그대로」)
  button.btn.sm(Play)「전체 이어 듣기」/「멈추기」(모두 완료일 때만 활성)
div.list.script-voice__lines[role=list]
  div.list__row.script-line.vs-line(.is-idle .is-making .is-done .is-cached .is-failed .is-skipped)[data-line=i data-status]
    (자막 탭) input.check[type=checkbox aria-label="1번 자막 포함"]         ← 풀면 .is-skipped(회색, 건너뜀)
    span.script-line__n「1」 (+ 자막 탭: span.time「00:03」)
    span.list__main
      span.script-line__text   화면 자막 글(묶음이면 자막마다 한 줄)
      input.input.sm.vs-line__read[aria-label="1번 문장 읽는 글"]  (묶음이면 자막마다 한 칸 = 지금 ReadLines 규칙: 줄 수 고정, 줄 i = 자막 i)
      (읽는 글 ≠ 화면 글일 때만) button.btn.ghost.sm.vs-line__reset「원래대로」(title 「화면 자막 글 그대로 읽어요」)
      (making) span.progress.sm[role=progressbar]
      (failed) small.voice-cand__err「만들지 못했어요: {이유}」
    span.list__actions.script-line__actions
      span.badge.script-line__status  대기: 없음 / 만드는 중: .accent「만드는 중 40 %」 / 완료 · cached: .ok「완료 · 2.7 초」 / 실패: .danger「실패」
         자막 탭 추가: 만들기 전 예상 「예상 2.9 초 / 자막 2.6 초」(.warn + 「· 길어요」) · 만든 뒤 「2.9 초 / 자막 2.6 초」(.warn) · 「있음 → 교체」 badge
      button.btn.icon.sm.ghost(Play)[aria-label="1번 듣기"]  (pcm 없으면 비활성 · 재생 중 .is-active + Square)
      button.btn.ghost.sm(RefreshCw)「다시 만들기」(title 「새 씨앗으로 다시 만들어요」)
  p.hint.script-voice__empty「대본을 쓰면 문장이 여기에 나와요.」/「고른 자막이 없어요.」
```
- 읽는 글 칸: 평소 테두리 · 바탕 없음(글처럼), hover · focus 에 `.input` 테두리. title 「읽는 글 — 숫자 · 영어 읽는 법을 고쳐요. 화면 자막은 안 바뀌어요.」 제안 칩(FixChips)은 이 창엔 **안 둔다**(자막 패널 「글」 탭에 그대로). 자막 탭에서는 창을 열 때 readManual · readFix 가 없는 자막에 제안을 **한 번에 적용**(apply '읽을 문장 제안', 되돌릴 수 있음) — 대본 탭과 같은 규칙(제안 자동). 「원래대로」 = `readTextPatch(sub, '')` / 대본은 `setLineRead(id, text)`.
- 자막 탭 행 = 묶음(`groupSubtitlesForVoice`). 묶음에 자막이 여럿이면 화면 글 · 읽는 글 칸이 자막 수만큼 세로로(지금 ③과 같음). 체크 해제 = 그 묶음 건너뜀(`speakable` 에서 뺌).
- 행 높이 ≈ 64 px(한 자막). 5행이면 320 px — 1366 에서 스크롤 없음.

### 3.5 바닥 막대 `div.modal__foot.vs__foot`(한 줄, 1366 에서 줄바꿈 없음)

```
(대본 탭) div.seg.vs__put[aria-label="넣는 방법"] 「자막 + 음성」「음성만」      ← 지금 「자막도 함께」/「음성만」 — radio 이름 「음성만」은 유지, 「자막도 함께」→「자막 + 음성」
span.hint.vs__foot-hint[role=status]  상태별(§3.7): 기본 「재생 위치 00:01.00부터 넣어요 · 넣은 음성엔 'AI 생성 음성' 표시가 들어가요」 / 자막 탭 「자막 자리에 넣어요 · 이미 있는 음성은 바꾸고 이전 소리는 테이크에 남겨요」
button.btn「닫기」(making 중 「멈추고 닫기」)
button.btn.vs__preview「먼저 들어 보기」(= generateScript, intent preview)  ← phase ready · partial(preview) 에서만
button.btn.primary.vs__go  「만들어 넣기」/「타임라인에 넣기」/「만드는 중 2 / 5」/「실패한 문장 다시 만들어 넣기 (1)」  (§2.3)
```
- AI 고지 체크박스 없음(U5). 끝 고지 자막 체크는 세부 설정.
- 「만들어 넣기」 = `generateScript()` → 모두 완료면 `insertScript()`(대본) / `commitCandidates(validCands, { ack: true, endNote })`(자막) → 성공 시 `setDialog(null)` + `toast('자막과 AI 음성 5개를 넣었어요.', 'ok', { label: '되돌리기', run: () => useEditor.getState().undo() })`(toast 는 action 을 이미 받음 `state/toast.ts`). 자막 탭에서 충돌이 있으면 지금처럼 `openVoiceFit(첫 충돌)` + 토스트 「AI 보이스 3개를 넣었어요 · 길이를 맞출 음성 1개」.
- 영상 클립이 없으면(대본 탭) 주 단추 비활성 title 「영상을 타임라인에 먼저 넣어요」 + hint 같은 문구(지금 그대로).
- 단축키: **Ctrl+Enter(⌘Enter) = 주 단추**(대본 칸에 초점이 있어도). 창 안에서만 받는다(keymap 표엔 안 넣음 — 더빙의 Enter 처럼 창 전용).

### 3.6 동의 · 받기 판(같은 창 몸통, `div.vs__license`)

- 기존 `LicensePanel` 을 그대로 몸통에 넣는다(요약 note · 「파일 보기 (16개)」 · 「전문 보기」 · Attachment A 요약 · MIT 안내 · 진행 막대 · 오류 · `WaitHint`). 바꾸는 것 세 가지:
  1. 체크 문구 하나로: **「위 조건을 읽었고 지키겠어요. 만든 영상에는 AI 음성 사용을 밝힐게요.」** → 저장 `ss.moacut.ttsLicense` = rev(지금) **+ `ss.moacut.aiDisclosureAck` = rev**. `licenseAccepted()` 는 둘 다 있어야 참(옛 사용자는 체크 한 번 더 — 모델이 있으면 「동의하고 계속하기」 한 번).
  2. 주 단추 글: 모델 없음 「받고 계속하기」 / 일부 받음 「이어 받고 계속하기」 / 오류 뒤 「다시 받기」 / 모델 있음 「동의하고 계속하기」. 보조 「취소」(→ 창 몸통으로, `pendingIntent` 지움).
  3. 받기가 **시작되면 바로 창 몸통으로 돌아온다**(진행은 머리 칩 §3.2). 다 받으면 `pendingIntent`(insert | preview)를 이어서 실행한다. 창을 닫아도 받기는 계속(지금 jobs 그대로), 다음에 열면 칩에 보임.
- 머리 칩 「음성 모델 받기 · 401 MB」를 눌러 들어온 경우(intent 없음) 주 단추는 「받기 시작」, 끝나면 창 몸통으로만 돌아온다.
- 프로젝트 패널 「받기 · 401 MB」 단추는 지금처럼 독립 창 `TtsLicenseDialog`(`.voice-license-dialog`) — 같은 `LicensePanel` 이므로 문구 · 체크는 자동으로 같아진다.

### 3.7 상태 · 문구 표

| 상태 | 어디 | 문구(정확히) |
|---|---|---|
| 비어 있음(대본) | 오른쪽 | 「대본을 쓰면 문장이 여기에 나와요.」 |
| 비어 있음(자막) | 오른쪽 | 「고른 자막이 없어요. 체크를 켜거나 「모두 고르기」를 눌러요.」 |
| 기기 불가 | 맨 위 note.danger | `ttsCapability().reason` 그대로 |
| 세션 실패 | 맨 위 note.danger | 「이 브라우저에서 음성 모델을 열지 못했어요. 최신 Chrome · Edge로 열거나 더빙 녹음을 써 보세요.」 |
| 모델 없음 | 머리 칩 | 「음성 모델 받기 · 401 MB」 |
| 받는 중 | 머리 칩 · 바닥 hint | 「받는 중 123 / 401 MB」 · 「다 받으면 바로 만들어 넣어요」(intent insert) / 「다 받으면 바로 만들어요」(preview) / 없음 |
| 받기 오류 | 동의 판 note.danger | `dlError` 그대로 + 단추 「다시 받기」 |
| 만드는 중 | 요약 · 주 단추 · 행 | 「만드는 중 2 / 5」 · 행 배지 「만드는 중 40 %」 |
| 대기열 | 머리 칩 | 「{앞 작업}이 끝나면 시작해요 · 대기 {n}번째 [대기 취소]」 |
| 완료 | 행 배지 | 「완료 · 2.7 초」(cached 도 같은 글, title 「전에 만든 결과를 다시 썼어요」) |
| 실패 | 행 | 「실패」 + 「만들지 못했어요: {friendly(e).message}」 |
| 일부 실패(insert) | 바닥 | hint 「실패한 문장이 있어 넣지 않았어요.」 주 「실패한 문장 다시 만들어 넣기 (1)」 ghost 「실패한 문장 빼고 넣기」 |
| 넣는 중 | 바닥 hint | 「넣는 중…」 |
| 넣기 실패 | 맨 위 note.danger | 「음성을 보관하지 못했어요(저장 공간 부족). 저장 공간을 비우고 다시 눌러요.」 등 `commitCandidates` · `insertScript` 메시지 + 주 「다시 넣기」 |
| 넣기 완료 | 토스트 ok | 「자막과 AI 음성 5개를 넣었어요.」 / 「AI 내레이션 1개를 넣었어요.」 / 「AI 보이스 3개를 넣었어요.」 + [되돌리기] |
| 목소리 바꿈(결과 있었음) | 요약 | 「목소리를 바꿔서 다시 만들어요」 |
| 샘플 없음 · 모델 없음 | 카드 ▶ title | 「모델을 받으면 들을 수 있어요」 |
| 영상 없음(대본) | 바닥 hint · 주 title | 「영상을 타임라인에 먼저 넣어요」 |

### 3.8 키보드 · 접근성

| 키 | 하는 일 |
|---|---|
| ⇧V / V | 창 열기(대본 / 자막) — keymap 그대로 |
| Esc | 닫기(locked 면 무시, 지금 Modal 규칙) |
| Ctrl+Enter | 주 단추(만들어 넣기 · 타임라인에 넣기) — 창 전용 |
| Tab | 탭 세그 → 대본 칸 → 목소리(선택된 카드 하나만 tab stop, roving) → 카드 ▶ 들 → 세부 설정 → 문장 행 → 바닥 |
| 목소리에서 ← → ↑ ↓ | 카드 이동 + 선택(radio 관례). Home · End 첫 · 끝. 같은 카드에서 Space 한 번 더 = 그 카드 들어 보기 |
| 문장 행 입력에서 ↑ ↓ | 위 · 아래 행 읽는 글 칸으로 |

- 창 `role=dialog aria-modal aria-labelledby`(Modal). 탭 세그 `role=tablist/tab aria-selected`(Seg 를 radiogroup 으로 쓰는 지금 방식도 허용 — 하나로 통일만).
- 목소리 `role=radiogroup aria-label="목소리"`, 카드 `role=radio aria-checked`, ▶ `aria-label="{이름} 들어 보기"` / 재생 중 `"멈추기"` + `aria-pressed=true`. 이어 듣기 단추 `aria-pressed`.
- 요약 줄 `role=status aria-live=polite`(만드는 중 n / m · 완료 · 실패 수). 실패 행 안내 `role=alert` 는 **한 군데**(맨 위 note)만 — 행마다 alert 를 달지 않는다.
- 진행 `role=progressbar aria-valuenow`, 받기 진행 `aria-valuetext="모델 받기 30 %"`(지금).
- 색만으로 상태를 말하지 않음: 배지 글(완료 · 실패), 실패 행 왼쪽 3 px 선(지금), 선택 카드 Check 아이콘.
- 초점 복귀: 창 닫히면 열기 전 요소로(Modal). 동의 판 ↔ 창 몸통 전환 시 초점은 주 단추로.
- `prefers-reduced-motion` 은 app.css 전역 규칙으로 충분(새 애니메이션 없음, 기존 `sv-pulse` 는 유지해도 전역 규칙이 끔).

### 3.9 1366×768 · 375 폭 배치

**1366×768(주 화면)** — 창 1120×(≤728). 몸통 2열 `grid-template-columns: var(--vs-side-w) minmax(0, 1fr)`, gap 18.
```
┌ AI VOICE ─────────────────────────────────────────────────────────────────────── ✕ ┐
│ AI 보이스 만들기                                                                      │
│ [ 대본으로 ][ 자막으로 (3) ]                                     모델 받아 둠 · 내 기기에서만 │
├──────────────────────────────┬────────────────────────────────────────────────────┤
│ ① 대본                        │ 문장 · 듣기  문장 5개 · 14.0 초 · 완료 4 · 실패 1 [▶ 전체 이어 듣기] │
│ ┌──────────────────────────┐ │ ┌────────────────────────────────────────────────┐ │
│ │ 전압이 3V일 때 …            │ │ │ 1  전압이 3V일 때 전류는 0.5A예요.      완료 · 4.1 초 │ │
│ │                            │ │ │    전압이 삼 볼트일 때 전류는 영 점 오 …   ▶  ↻ 다시 만들기│ │
│ └──────────────────────────┘ │ │ 2  V=IR 로 저항을 구해요.               완료 · 2.7 초 │ │
│ ② 목소리          [▶ 10개 이어 듣기]│ │    브이 이퀄 아이 알 로 …                 ▶  ↻      │ │
│ 남성              여성          │ │ 3  물의 pH는 7이에요.                     실패      │ │
│ ┌ 남성 1 ✓    ▶┐┌ 여성 1     ▶┐ │ │    물의 피에이치는 칠이에요.               ▶  ↻      │ │
│ │ 낮고 차분한 톤 ││ 낮고 차분한 톤 │ │ │    만들지 못했어요: 메모리 부족. …                   │ │
│ ├ 남성 2      ▶┤├ 여성 2     ▶┤ │ │ 4  …                                     완료 · 3.2 초│ │
│ │ 부드럽고 따뜻한 중저음 │ …    │ │ │ 5  …                                     완료 · 2.0 초│ │
│ │ … ×5          ││ … ×5        │ │ └────────────────────────────────────────────────┘ │
│ └──────────────┘└─────────────┘ │                                                    │
│ 이 목소리들은 … AI 음성이에요.   │                                                    │
│ ▸ 세부 설정 · 빠르기 1.05× · 보통  │                                                    │
├──────────────────────────────┴────────────────────────────────────────────────────┤
│ [자막 + 음성][음성만]  실패한 문장이 있어 넣지 않았어요.   [닫기] [실패한 문장 빼고 넣기] [실패한 문장 다시 만들어 넣기 (1)] │
└───────────────────────────────────────────────────────────────────────────────────┘
```
동의 판으로 바뀐 몸통(같은 창, 머리 · 바닥은 유지하되 바닥은 「취소」「받고 계속하기」만):
```
│ 한 번만 받아요 · 401 MB · 내 기기에서만 실행              [파일 보기 (16개)]            │
│ ⓘ Supertonic 3 (OpenRAIL-M) · 무료 · 수업 · 상업 영상에 써도 돼요. 금지: … [전문 보기]  │
│ ▸ 금지 용도(Attachment A) 요약                                                        │
│ 코드는 MIT(…). 목소리 화자 정보는 제공되지 않아요. 모델은 huggingface.co 에서 …          │
│ ☑ 위 조건을 읽었고 지키겠어요. 만든 영상에는 AI 음성 사용을 밝힐게요.                      │
│                                                           [취소] [받고 계속하기]       │
```

**≤ 900(세로 쌓기)**: 몸통 1열(왼쪽 → 오른쪽 순), 문장 목록 `max-height: none`(창 몸통이 한 번만 스크롤 — 지금 규칙). 목소리는 2열 유지.

**≤ 480(375 폭, 창 335 px)**:
- 머리: 탭 세그 한 줄, 모델 칩은 그 아래 줄(글 「받아 둠」은 숨김, 받는 중만 보임).
- 목소리 **1열 10줄**, 카드 한 줄 38 px: `b 이름 + small 설명` 가로 나란히(`.vs-voice__pick{display:flex;gap:6px;align-items:baseline}`), 설명은 말줄임.
- 세부 설정 요약 줄은 「세부 설정」만.
- 문장 행: 번호 + 글/읽는 글 위, 배지 · ▶ · 「다시 만들기」는 아래 줄(지금 ≤640 규칙 유지).
- 바닥: 두 줄 — 1줄 세그 + hint, 2줄 단추 3개(「닫기」 왼쪽 ghost, 「먼저 들어 보기」 「만들어 넣기」 오른쪽, 주 단추 `flex:1`). 「먼저 들어 보기」는 글 대신 아이콘(Headphones)만 + title.
- 목표: 가로 넘침 0, 창 몸통 세로 스크롤은 있어도 됨(≤ 900 규칙).

### 3.10 다른 곳 변화(창 밖)

| 곳 | 지금 | 바꿈 |
|---|---|---|
| 자막 패널 「보이스」 탭(`SubtitleVoiceSection`) | 「AI 보이스 만들기 (V)」 → 마법사 | 같은 단추 → 창(자막 탭, 그 자막 체크). 문구 · 선택자 그대로 |
| 프로젝트 「보이스」 탭(`ProjectVoiceSection`) | 「자막 전체 → AI 보이스」 → 마법사 / 「변경된 음성 다시 만들기 (n)」 → 마법사 ④ | 「자막 전체 → AI 보이스」 → 창(자막 탭, 모두 체크). **「변경된 음성 다시 만들기 (n)」 = 바로 만들어 바꿈**(`regenStaleVoices()`: stale AI 항목마다 저장된 seed · voiceId · speed · steps 로 `synthesizeGroups` → `commitCandidates(…, { label: '변경된 음성 다시 만들기' })`), 단추 아래 `div.progress.sm` + hint 「2 / 3 만드는 중 [멈추기]」, 끝나면 토스트 「변경된 음성 3개를 다시 만들었어요 · 이전 소리는 테이크에」[되돌리기] |
| 음성 상태 줄 「다시 만들기」(`VoiceStatus`) | 후보 → 「듣기」 → 「바꾸기」 | 후보가 되면 **자동 재생 1회**(`playPcm`) → 줄에 「새 후보 3.6 초 ■ 멈추기 [바꾸기] [버리기]」. 선택자 · 문구 그대로 |
| 길이 맞추기(`VoiceFitDialog`) | 속도 · 문장 「적용」 → 후보 줄 → 「바꾸기」 | **「적용」이 바로 바꾼다**(같은 씨앗: `makeItemCandidate` 뒤 `acceptItemCandidate` 를 이어 부름; 진행은 창 안 `VoiceCandidateRow.is-making` 그대로, 완료 토스트 「새 길이로 바꿨어요 · 이전 소리는 테이크에」[되돌리기]). 「자막 시간 늘리기」 · 「자막 시작에 맞추기」 · 「그대로 두기」 · 이전/다음 · 「나중에」 · 「이제 맞아요」 문구 전부 그대로 |
| 머리 막대 「AI 보이스」 | ⇧V · title 「대본으로 AI 보이스 (⇧V) — 대본을 문장마다 …」 | 그대로(창만 바뀜) |
| keymap `voice-make` · `script-voice` | 그대로 | **글 · 키 안 바꿈**(README 표 비교 시험 i-keys-guides) |
| 타임라인 배지 · WAV 내려받기 · 테이크 메뉴 · 읽을 문장 칸 · 칩 | — | 안 바꿈 |

### 3.11 CSS — 재사용 · 새 클래스 · 토큰

**재사용(그대로)**: `.modal.wide` `.modal__head/__body/__foot` `.seg(.full)` `.btn(.primary .ghost .sm .icon .block .is-active .is-loading)` `.badge(.ok .accent .warn .danger)` `.list .list__row .list__main .list__actions .time` `.progress(.sm) .progress__meta` `.note(.danger .warn)` `.check` `.hint` `.field .field__label .field__head` `.group-title` `.textarea .input.sm` `.slider` `.kv` `.voice-license*` `.voice-attach` `.voice-files` `.voice-wait` `.script-voice__text/__head/__sum/__lines/__empty` `.script-line*`(행) `.voice-cand__err` `.voice-model-card`(안 씀 → 지워도 됨) `.voice-candidate` `.voice-status*` `.fix-option*`.

**지움**: `.steps--h` 마법사 띠, `.voice-subs`, `.voice-groups`, `.list__group`, `.voice-tiles`, `.voice-tile`, `.read-row*`, `.voice-read-list`, `.voice-cands`, `.voice-cand`, `.script-voice__cards`, `.script-voice__card`, `.script-voice__presets`, `.script-voice__settings`, `.script-voice__make`, `.script-voice__put`, `.script-voice__step`, `.script-voice__no`(→ `.vs__step` 으로 이름만), `.voice-wizard__foot-hint`(→ `.vs__foot-hint`).

**새 클래스(`src/styles/voice.css`, 색은 토큰만)**
```css
.vs { --vs-side-w: 420px; }
.vs__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.vs__model { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; font-size: 11.5px; color: var(--text-mute); }
.vs__model .progress { width: 120px; }
.vs__body { display: grid; grid-template-columns: var(--vs-side-w) minmax(0, 1fr); gap: 18px; min-height: 0; flex: 1; }
.vs__side, .vs__main { min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: 10px; }
.vs__step { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: var(--text-main); }
.vs__step > i { display: inline-grid; place-items: center; width: 18px; height: 18px; font: 700 11px/1 var(--font); font-style: normal; color: #fff; background: var(--primary); border-radius: 50%; }
.vs-voices { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px; }
.vs-voices__col { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.vs-voices__col > .group-title { padding: 0 2px; }
.vs-voice { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 4px; min-width: 0; }
.vs-voice__pick { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; min-height: 44px; padding: 5px 10px; text-align: left; background: var(--bg-input); border: 1px solid var(--border-line); border-radius: var(--r-tile); transition: border-color var(--t-color); position: relative; }
.vs-voice__pick:hover { border-color: var(--border-hover); }
.vs-voice__pick:focus-visible { outline: 0; box-shadow: var(--focus); }
.vs-voice__name { font-size: 12.5px; font-weight: 600; color: var(--text-main); }
.vs-voice__desc { max-width: 100%; font-size: 11px; line-height: 1.35; color: var(--text-mute); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vs-voice.is-selected .vs-voice__pick { border-color: var(--accent); background: var(--accent-soft); }
.vs-voice.is-selected .vs-voice__name { color: var(--accent); }
.vs-voice__pick > svg { position: absolute; top: 6px; right: 8px; color: var(--accent); }   /* Check 14 */
.vs-voice__play { width: 28px; height: 28px; }
.vs-voice.is-playing .vs-voice__pick { border-color: var(--accent); }
.vs-voice.is-playing .vs-voice__play { color: var(--accent); background: var(--accent-soft); }
.vs__advanced { font-size: 12px; color: var(--text-sub); }
.vs__advanced > summary { cursor: pointer; font-weight: 600; }
.vs__advanced > div { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 8px; }
.vs-line__read { background: transparent; border-color: transparent; padding-left: 0; color: var(--text-sub); }
.vs-line__read:hover, .vs-line__read:focus-visible { background: var(--bg-input); border-color: var(--border-soft); padding-left: 10px; }
.vs-line.is-skipped { opacity: .5; }
.vs-line.is-skipped .list__actions { visibility: hidden; }
.vs-line .list__actions .btn.icon.is-active { color: var(--accent); background: var(--accent-soft); }
.vs__foot { flex-wrap: nowrap; gap: 8px 10px; }
.vs__foot-hint { flex: 1 1 auto; min-width: 0; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vs__put { flex: none; }
@media (max-width: 900px) {
  .vs__body { grid-template-columns: 1fr; }
  .script-voice__lines { max-height: none; min-height: 0; flex: none; }   /* 지금 규칙 유지 */
}
@media (max-width: 480px) {
  .vs-voices { grid-template-columns: 1fr; }
  .vs-voice__pick { flex-direction: row; align-items: baseline; gap: 6px; min-height: 38px; padding: 6px 28px 6px 10px; }
  .vs-voice__desc { flex: 1; }
  .vs__advanced > div { grid-template-columns: 1fr; }
  .vs__foot { flex-wrap: wrap; }
  .vs__foot-hint { flex-basis: 100%; white-space: normal; }
  .vs__foot .btn.primary { flex: 1; }
  .vs__preview span { display: none; }   /* 아이콘만 */
}
```
- **새 색 토큰 없음.** 쓰는 토큰: `--accent --accent-soft --primary --primary-hover --ok --ok-soft --warn --warn-soft --warn-line --danger --danger-soft --danger-line --bg-input --bg-soft --bg-card --border-line --border-soft --border-hover --text-main --text-sub --text-mute --r-tile --r-btn --t-color --focus --font`. 길이 값 `--vs-side-w` 하나만 `.vs` 안 지역 변수(tokens.css 에 안 넣음).
- 밝은 테마는 토큰으로 자동. 확인할 것: `.vs-voice.is-selected`(accent-soft 위 accent 글, 대비 4.5 이상 — 지금 `.tile.is-selected` 와 같은 조합이라 통과), `.vs-line__read` 평소 글색 `--text-sub`.

---

## 4. 바꾸지 말아야 할 것 / 의도적으로 바뀌는 것(시험 기준)

### 4.1 지켜야 할 핵심 동작(시험이 계속 기대)
| 동작 | 시험 | 비고 |
|---|---|---|
| 동의 뒤 `localStorage['ss.moacut.ttsLicense'] === rev` | v-tts ① | 추가로 `ss.moacut.aiDisclosureAck` 도 rev. 시험이 미리 심는 값은 두 키 모두 심어야 함 |
| 받기 창(프로젝트 패널 「받기 · n MB」 → `.voice-license-dialog`): 체크 전 「받기 시작」 비활성, OpenRAIL-M · (e) · MIT 글, 「전문 보기」 → `.voice-license__full` 에 Attachment A, 진행 `.progress__meta b`「n / 401 MB」, 「받기 취소」 → 받은 파일 남음, 「받기 시작」/「다시 받기」 이어 받기 → 창 닫힘 | v-tts ① | `LicensePanel` 그대로. 체크 문구만 바뀜(`label.check` 선택자는 유지) |
| 자막 「읽을 문장」 칸 `#sub-read` · 제안 칩 `.chips.suggest .chip` = readFix · 손 입력 readManual | v-tts ② | 안 건드림 |
| 머리 막대 `.topbar` 「AI 보이스」 단추 1개 · title 에 ⇧V | x-script-voice | 그대로 |
| ⇧V → `.script-voice` 창, `#script-text` 에 대본 → `.script-line` 5행, 행 `input` 값 = 자동 고친 읽는 글(READS), `.script-line__text` = 대본 그대로 | x-script-voice | 행 구조 유지(`.vs-line` 추가만). 자막 탭 행도 같은 클래스 |
| `scriptDev.failOnce` · `scriptDev.synth`, `useScript` 상태 `idle/making/done/cached/failed`, 취소 → 만들던 행은 idle | x-script-voice | 그대로 |
| 실패 행 `.voice-cand__err` 에 이유, 「실패한 문장만 다시 (1)」(preview 경로) → 합성 1회 더, 다른 행 PCM 그대로 | x-script-voice | preview 경로 단추 이름 유지 |
| 「전체 이어 듣기」 ↔ 「멈추기」 | x-script-voice | 그대로 |
| 넣기 = 한 apply 「대본 AI 보이스」 · 창 닫힘 · 음성 n개 = 고른 목소리 · steps · readText = 고친 글 · 자막 글 = 대본 · 항목 길이 = PCM 길이 · 자막 구간 = 음성 구간 · 재생 위치부터 · 쉼 0.3/0.6(VOICE_PLAN §2.3 이 바꾸면 그 값) · assetRefs · `aiDisclosureAck === true` | x-script-voice | `insertScript` 그대로. ack 는 localStorage 에서 옴 |
| 넣은 뒤 대본 칸 비어 있음, 같은 대본 다시 = cached 5 · 합성 0회 | x-script-voice | 행 배지 글은 「완료」로 바뀌므로 cached 판정은 `data-status="cached"` 또는 `useScript` 상태로 |
| 「음성만」 radio → 내레이션 1개 · `aiVoice.voiceId` · 길이 = 이어 붙인 PCM · 자막 안 늘어남 | x-script-voice | radio 이름 「음성만」 유지(「자막도 함께」→「자막 + 음성」) |
| 720p MP4 comment · 음성 구간 RMS · ICMT · `_AI음성.wav` · Whisper CER · 새로 고침 복원 | v-tts ④~⑥⑧ · x-script-voice | 안 건드림 |
| 자막 1개 수정 → 그 음성만 stale · 「다시 생성 필요」 배지 · `.voice-status.is-stale` → 「변경된 음성 다시 만들기 (1)」 → 그 항목만 새 assetId · 저장된 seed 유지 · 새 글 · 이전은 테이크 | v-tts ⑦ | **마법사 ④ 없이 바로** — 단추 누른 뒤 `takes.length === 1` 을 기다리면 됨 |
| `openVoiceFit` · `.voice-fit` · `.voice-fit__kind[data-kind]` · 「속도 올리기」 small 「1.05 → 1.66」(planSpeedFix) · 「자막 시간 늘리기」 목록 `.voice-plan .list__row[data-sub|data-voice]` = planTimeChange · 적용 = 한 apply 「음성 시간 맞추기」 · 클립 불변 · 「나중에」 · 「이 음성은 이제 맞아요」 · 컷에 걸침 · 내보내기 확인 창 「그대로 내보내기」 | w-tts-conflict | 그대로 |
| 타임라인 `.clip--audio .voice-conflict` 배지 · 「AI」 배지 ×n | v-tts · w-tts-conflict | 그대로 |
| `window.__moacut.tts.sampleVoice('F1', 1, 4)` 가 오프라인에서 PCM(외부 요청 0) | zv-offline-tts | 함수 · 숨김 id 유지. 번들 MP3 는 같은 출처라 「외부 요청」 아님 |
| 외부 요청 = huggingface · jsDelivr 만 | v-tts | MP3 는 `/voices/…` 같은 출처 |
| keymap 글 · 순서 = README 표 | i-keys-guides | `voice-make` · `script-voice` 행 안 바꿈 |

### 4.2 의도적으로 바뀌는 것(시험을 고쳐야 함)
| 바뀜 | 영향 시험 | 고칠 방향 |
|---|---|---|
| `.voice-wizard` 창 · `.steps--h` · `.step.is-current` · `.voice-subs input:checked` · `.list__group` · `.voice-tiles .tile`(12개) · `.read-row .badge`「예상 … / 자막 …」 · `.voice-cand .badge` · 「다음」「만들기」 · ⑤ `label.check`「AI 음성 사용을 시청자에게」 없어짐 | v-tts ③ · ⑦, w-tts-conflict ① | V → `.script-voice[data-source=subs]` → (여성 2 고르려면 `getByRole('radio', { name: /여성 2/ })`) → 「만들어 넣기」 → `audio.length === 3`. 예상 길이는 행 배지 `.script-line__status`「예상 2.9 초 / 자막 2.6 초」로. 후보 수 = `.script-line.is-done` 수. 「프로젝트 밖 후보」 확인은 「먼저 들어 보기」 경로로 |
| 목소리 카드: 「대학생 남(가상)」「대학생 여(가상)」 radio · `details.voice-attach .voice-tile` ×10 · 「자동 지표 추정 나이 약 20세」 글 없어짐 → `.vs-voice[role=radio]` 10개, 이름 「남성 1」… + 설명 | x-script-voice · v-tts | `getByRole('radio', { name: /남성 1/ })`; `voiceId` 기대값 `college-m` → 고른 id(예 `ko-m1`); 「여성 2 들어 보기」 ▶ 는 MP3 재생이라 `.is-loading` 대기 불필요(모델 합성 경로를 시험하려면 빠르기를 바꾼 뒤 누른다) |
| 창 안 AI 고지 체크 없음 → 「확인 체크 전 넣기 막힘」 | x-script-voice · v-tts ⑤ | 동의 판으로 옮김: 체크 전 「받고 계속하기」 비활성을 확인. 시험이 `ss.moacut.ttsLicense` 만 심으면 창이 동의 판을 한 번 더 보이므로 `ss.moacut.aiDisclosureAck` 도 심는다 |
| 「모두 만들기」 → 「먼저 들어 보기」(만들기만) / 「만들어 넣기」(만들고 넣기) | x-script-voice | 상태 변화 · 실패 · 캐시 확인은 「먼저 들어 보기」로, 넣기는 「타임라인에 넣기」(만든 뒤) 또는 처음부터 「만들어 넣기」 |
| 행 배지 「저장된 결과」 → 「완료」 | x-script-voice | `.script-line[data-status=cached]` 5개 |
| 「실패한 문장만 다시 (1)」은 preview 경로에서만; insert 경로는 「실패한 문장 다시 만들어 넣기 (1)」 | x-script-voice | 지금 시험은 「모두 만들기」 뒤 누르므로 preview 경로 → 이름 그대로 |
| 「변경된 음성 다시 만들기 (1)」 → 창 없이 바로 바꿈 | v-tts ⑦ | `wiz.waitFor()` · 「만들기」「다음」「넣기」 삭제, `takes.length === 1` 대기 |
| 길이 맞추기 「적용」(속도 · 문장) → 바로 바꿈(후보 줄 「바꾸기」 없음) | w-tts-conflict ① | `check('적용 = 후보만')` 삭제; 「적용」 뒤 `takes.length === 1` 대기, 나머지 판정(길이 ≤ 자막 구간 · 속도 = 계획값 · 충돌 없음 · 「이제 맞아요」) 그대로 |
| `SAMPLE_TEXT` 비교 문장으로 | (없음) | — |
| `Modal` `focus` prop 추가, dialog `'voice'` 로 통합(`'script-voice'` 별칭) | e2e 전반 `setDialog` 쓰는 곳 없음 | — |

---

## 5. 지금 ↔ 새 화면 클릭 수

| 일 | 지금 | 새 화면 | 줄인 방법 |
|---|---|---|---|
| (a) 처음 사용자 대본 → 넣기 | 8 (열기 · 대본 칸 · 모두 만들기 · 동의 · 받기 · 모두 만들기 · 확인 체크 · 넣기) | **4** (열기 · 만들어 넣기 · 동의 체크 · 받고 계속하기) | 초점 자동, 받기 뒤 자동 계속, 체크 합침, 만들기+넣기 합침 |
| (b) 모델 있음 · 자막 3개 | 8(두 번째부터 7) | **2** (V · 만들어 넣기) | 단계 ①③④⑤ 삭제, 기본값 |
| (b′) 모델 있음 · 대본 | 3~5 | **2** (⇧V · 만들어 넣기) | 체크 삭제, 합침 |
| (c) 목소리 10개 비교 | 11(모델 없으면 불가) | **1** (10개 이어 듣기), 모델 없어도 됨 | 번들 샘플 · 이어 듣기 |
| (c′) 만든 뒤 목소리 바꿔 넣기 | 3 | **2** (카드 · 만들어 넣기) | |
| (d) 음성 하나 다시 만들기 | 4~5 | **3~4** (블록 · (탭) · 다시 만들기 · 바꾸기) | 후보 자동 재생 |
| (d′) 변경된 음성 다시 만들기 | 5~6 | **2** (보이스 탭 · 단추) | 같은 씨앗 → 바로 바꿈 |
| (d″) 길이 맞추기(자동 열림 / 배지) | 2~3 / 3 | **1 / 2** (적용) | 같은 씨앗 → 바로 바꿈 |

---

## 6. 구현 메모(Opus 용)

- **파일**: `src/ui/VoiceStudio.tsx`(새, `ScriptVoiceUi.tsx` 를 옮겨 키움 — `VoiceWizard` 는 지움), `src/ui/VoiceUi.tsx`(LicensePanel 체크 문구 · `onStarted` 콜백 · `TtsLicenseDialog` · `VoiceStatus` 자동 재생 · `VoiceFitDialog` 바로 바꾸기 · `ProjectVoiceSection` 재생성 진행), `src/app/tts.ts`(`licenseAccepted` 두 키, `openVoiceStudio`, `regenStaleVoices`, `SAMPLE_TEXT`, `playSample(id)` — MP3 ↔ 합성 선택 · 이어 듣기 체인, `acceptItemCandidate` 뒤 되돌리기 토스트), `src/app/scriptVoice.ts`(`intent`, 기본값 규칙 §U7, 만든 뒤 자동 넣기 `makeAndInsert()`, `endNote`), `src/ui/dialogs/Modal.tsx`(`focus` prop), `src/ui/App.tsx`(dialog 두 id → 한 컴포넌트), `src/styles/voice.css`(§3.11), `vite.config.ts` `moacut-sw-precache` 목록에 `public/voices/*.mp3`(오프라인), `src/app/offline.ts` 'tts' 행 detail 에 「미리 듣기 샘플」 포함 여부 표시(선택).
- **두 스토어 유지, 행 어댑터 하나**: 대본 탭은 `useScript`(lines), 자막 탭은 지금 마법사의 로컬 상태(`checked · grouping · cands · prog · est · voiceId · speed · steps`)를 `useVoiceSubs` zustand 로 옮긴다(창을 닫았다 열어도 받는 중 `pendingIntent` 가 살아 있게). 행 컴포넌트 `VoiceLineRow` 는 `{ n, time?, screen: string[], read: string[], status, ratio, dur?, error?, checked?, hasVoice?, estimate?, span?, onRead(i, text), onPlay, onRemake, onToggle }` 만 받는다.
- **공유 설정**: `voiceId · speed · steps` 는 한 곳(`useVoicePrefs`: project.voice → localStorage `ss.moacut.voicePrefs` → 기본)에서 읽고, 두 탭이 같은 값을 쓴다. 넣을 때 `project.voice` 갱신(지금 `commitCandidates` · `insertScript` 가 함) + localStorage 저장.
- **자막 탭 예상 길이**: 모델이 있을 때만 `estimateTexts`(지금 ③ 로직, 500 ms 디바운스). 없으면 배지 생략.
- **자막 탭 만들기**: `synthesizeGroups(specs, { onProgress, onEach })` 그대로, 행 상태는 `prog · cands` 에서 파생. 넣기 `commitCandidates(list, { ack: true, endNote })` → 충돌 시 `openVoiceFit`.
- **동의 뒤 자동 계속**: `LicensePanel` 에 `onStarted()`(받기 시작 직후 — 창 몸통 복귀용)와 `onDone()`(끝) 둘. `onDone` 에서 `pendingIntent` 를 보고 `generateScript()` → `insertScript()` / 자막 경로 실행. 받기 중 사용자가 목소리 · 대본을 바꿔도 끝난 뒤 **그 시점 값**으로 만든다.
- **되돌리기 토스트**: `toast(text, 'ok', { label: '되돌리기', run: () => useEditor.getState().undo() })` — `undo()` 가 라벨을 돌려주므로 그대로 됨. 넣기 전 복원 지점(묶음 ≥ 2)은 지금처럼.
- **샘플 재생**: `<audio>` 하나를 `tts.ts` 에 두고 `playing` 에 통합(`stopPlayback` 이 `<audio>` 도 멈추게). 이어 듣기는 `ended` 에서 다음 id, 끝나면 `playing = null`. MP3 `error` 이벤트 → 모델 있으면 합성으로, 없으면 토스트 「미리 듣기 파일이 없어요. 모델을 받으면 들을 수 있어요.」
- **접근성 체크 순서**: Tab 순서 · 카드 roving tabindex · Ctrl+Enter · `role=status` 요약 · 실패 alert 1곳 · 375 폭 가로 넘침 0(`_voice-shots.mjs` 의 `ovf` 계산 재사용).
- **캡처로 검수**: `tests/out/voice-ui-shots/_voice-shots.mjs` 를 새 선택자에 맞게 고쳐 같은 번호로 다시 찍어 전/후 비교(1366 어두운 · 밝은, 375). 모델 캐시는 `tests/out/e2e/profile-v-tts` 에 8871 출처로 이미 있음(받기 안 해도 됨).

---

## 부록 — 지금 화면 캡처 목록(`tests/out/voice-ui-shots/`)

| 파일 | 내용 |
|---|---|
| 00 · 01 · 01b | 편집 화면: 프로젝트 「보이스」 탭, 자막 「보이스」 탭(음성 없음), 자막 「글」 탭(읽을 문장 칸) |
| 02 · 03 | 대본 창 빈 상태(모델 없음 카드) · 대본 입력 뒤 문장 5개(대기) |
| 04 · 04b | 라이선스 · 모델 받기 창, 파일 목록 펼침 |
| 05 · 06 · 07 | 모델 있음 대본 창 · 만든 뒤 행 상태 · 바닥 막대(체크 전 넣기 비활성) |
| 08 ~ 12 | 마법사 ① 자막 고르기 · ② 목소리(모델 없음/있음) · ③ 읽을 문장(예상 길이) · ④ 후보 · ⑤ 확인 |
| 13 · 13b | 음성 길이 맞추기(속도 기본 선택) · 자막 시간 늘리기 목록 |
| 14 · 15 · 16 · 16b | 자막 패널 음성 상태 줄 · 소리 패널 「음성」 탭 · 프로젝트 보이스 절 · 변경된 음성(1) |
| 17 | 밝은 테마 대본 창 |
| 18 · 18b · 19 · 20 | 375 폭: 대본 창(몸통 스크롤 639 px) · 전체 페이지 · 마법사 ②(단계 띠 잘림) · 길이 맞추기 |
