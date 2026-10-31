# v3.5 트랙 D — 속성 칸 · 틀 구현 기록 (Opus, 2026-10-10)

브랜치 `v3.5/inspector-frame`(main 16ea7f2 에서). 설계 근거: `UI_REVIEW_FABLE.md` §2 B1 · B4 · B7 · B9, §3.6 P0-6, §5 충돌 규칙.
이 트랙은 화면 배치만 바꿨어요. 렌더 · 프로젝트 값(데이터 구조)은 그대로라 미리보기 = 출력에 영향이 없어요.

## 1. 무엇을 · 어떻게

### P0-6 속성 칸 탭 정리

| 요소 | 전 | 후 | 옮긴 내용 |
|---|---|---|---|
| 자막 | 글 · 모양 · 프리셋 · 움직임 · **보이스** · **연결** (6) | **글 · 모양 · 프리셋 · 움직임** (4) | 「글」 탭 아래에 차례로: 배치 방식 seg(`AttachSection`) → 「AI 보이스 · 더빙」 절(「AI 보이스 만들기 (V)」 또는 음성 상태 줄 + 「더빙 녹음」) → SRT. 「글」 탭 점 = 음성 있음 또는 시간에 고정(전 보이스 · 연결 탭 점을 합침) |
| 소리 항목 | 역할·위치 · 소리 · **음성**(음성일 때) · **연결** (3~4) | **역할·위치 · 소리** (2) | 배치 방식은 「역할·위치」 맨 아래(점 = 시간에 고정). 음성 절(상태 줄 · 원본 소리 모드 · 말머리 · 테이크 · WAV)은 「소리」 탭 맨 위(여러 개 골랐을 때도) |
| 화면 위(PIP · 도형) | PIP · 크기·위치 · 움직임 · 소리 · **연결** · 도형 | PIP · 크기·위치 · 움직임 · 소리 · 도형 | **판단: 합침.** 「연결」 탭이 seg 하나뿐이라 같은 원칙. 「크기·위치」 탭의 「표시 시간」 절 바로 아래로(시간 · 배치가 한곳) |
| 마커 · 모자이크 | 탭 없음(배치 방식이 이미 본문 안) | 그대로 | **판단: 바꿀 것 없음** |
| 클립 · 프로젝트 | — | 그대로(클립 「전환」만 B7) | |

- 「읽을 문장」(`VoiceUi.tsx` `ReadTextField`): 글과 같으면 접고 `button.read-toggle`「읽기 다르게」(aria-expanded=false). 누르면 칸이 펼쳐지고 초점이 칸으로, 「접기」로 다시 접혀요.
  이미 다른 값(손 입력 `readManual` · 제안 수락 `readFix`)이 있거나 「확인 필요」 알림이 있으면 펼친 채(접기 단추 없음). **읽기 제안 칩(예: 「CO2 → 씨오투」)은 접혀 있어도 보여요** — 누르면 읽을 문장이 달라져 칸이 펼쳐짐(정보 손실 0). 다른 자막을 고르면 다시 접힘.
- 탭 기억(`useInspectorUi`): 없어진 탭 id(`subtitle: voice/attach`, `audio: voice/attach`, `layer: link`)를 가리키면 `InspectorTabs` 의 기존 규칙(`shown.find(...) ?? shown[0]`)대로 첫 탭. 시험으로 확인(aj ①②).
- 「V」 · 「Ctrl/⌘+L」 단축키는 탭과 상관없이 동작(그대로).

### B7 클립 「전환」 = 앞 경계 · 뒤 경계

- `AudioFxPanels.tsx` `TransitionSection` → `TransitionEdge` 두 묶음(`.tr-edge[data-edge=in|out]`, role=group).
  - 앞 경계 = 앞 클립 → 이 클립 = 이 클립의 `transitionIn`, 뒤 경계 = 이 클립 → 다음 클립 = **다음 클립의 `transitionIn`** 을 `setTransition(다음 클립 id)` 로(기존 함수 재사용, 데이터 구조 그대로).
  - 묶음마다 머리(「앞 경계」 + 「앞 클립 이름 → 이 클립」 + 미리 보기) · 타일 9개 · 길이 막대(전환 있을 때).
  - 없는 쪽은 비활성 묶음(`aria-disabled`, 점선 · 흐린 바탕) + 이유 한 줄: 「첫 클립이라 앞 클립이 없어요.」 · 「마지막 클립이라 뒤 클립이 없어요.」
  - 「모든 경계에 적용」은 앞 경계 전환, 없으면 뒤 경계 전환을 써요(첫 클립에서도 쓸모 있게). 「모두 없애기」 그대로.
  - 탭 점 = 앞 또는 뒤 경계에 전환. 타일은 묶음 안에서 조금 낮게(58 → 50 px)해서 1366×768 에서 스크롤이 늘지 않게.

### B9 토스트 위치 — 속성 칸 아래쪽으로 결정

- 901 px 이상: 타임라인 바로 위 · 오른쪽 맞춤 · 속성 칸 폭(`calc(var(--inspector-w) - 20px)`). 미리보기 칸과 겹침 0 이라 영상 · 자막이 가려지지 않아요.
  「재생 막대 위 오른쪽」은 16:9 영상이 칸을 꽉 채우면 틀 오른쪽 아래(자막 자리)와 겹쳐서 버렸어요. 속성 칸 아래쪽은 잠깐(2.8 s) 가려도 스크롤로 닿는 곳이라 덜 아까워요.
- 원본 보기(source) 모드의 높인 자리 규칙도 같은 자리로 덮었어요. 900 이하(세로 쌓기)는 기존 규칙(화면 아래 가운데) 그대로.
- **합칠 때 주의(트랙 A)**: 자리 = `bottom: calc(var(--timeline-h) + 10px)`. 타임라인 높이를 바꾸는 방식이 `--timeline-h` 를 갱신하지 않으면 이 줄을 그 값에 맞춰야 해요.

### B1 좁은 창(1024 ~ 1280) 세 칸 겹침

- 원인(실측): 재생 막대가 줄바꿈 없는 단추 줄이라 최소 폭이 약 720 px(1280 은 812 px). `.stage` 의 안쪽 열이 `auto` 라 이 폭만큼 커져 영상 틀 · 재생 막대가 속성 칸 위로 나갔어요(1024: 180 px, 1180: 24 px, 1280: 84 px 겹침). 머리 막대는 `.saved` 글이 줄어든 칸 밖으로 넘쳐 개인정보 알약과 겹쳤어요.
- 고침(`src/styles/frame.css`, CSS 만): `.stage { grid-template-columns: minmax(0,1fr); grid-template-rows: minmax(0,1fr) auto }`, 재생 막대는 모자라면 두 줄로 접기(`flex-wrap: wrap`, 최소 높이 `--transport-h` — 한 줄이면 높이 그대로). 세로 쌓기 대신 세 칸을 유지했어요(1024 에서도 영상 512×288).
  - **합칠 때 주의(트랙 C)**: 재생 막대 단추를 6개 이하로 줄이면 1180 이상에선 한 줄로 들어갈 거예요. `Stage.tsx` 는 건드리지 않았고, 이 규칙은 `.stage > .transport--timeline` 선택자 하나예요.
- 머리 막대: 브랜드 · 동작 단추 묶음은 안 줄어들고(`flex: none`), 프로젝트 이름 칸(최소 88 px) · 저장 상태 글(말줄임)이 줄어요. 숨기는 순서: 저장 상태 글(≤ 1100) → 개인정보 알약(≤ 1060) → 채널 링크(≤ 960). 오류 · 경고 상태 글(`.is-failed` · `.is-warn` · `.is-off`)은 숨기지 않아요.

### B4 브랜드 줄바꿈

- `.brand` `flex: none` + `nowrap`. 작업 알약은 최대 300 px · 먼저 줄어들고 이름(`span.pill__label`, `TopBar.tsx`)은 말줄임, 1100 이하에선 진행 막대를 숨기고 %만.
- 알약이 떠 있으면 같은 숨김 순서를 더 넓은 폭에서: 저장 상태 글 · 개인정보 알약 ≤ 1440, 채널 링크 ≤ 1280.

## 2. 바뀐 파일

- `src/ui/SubtitlePanel.tsx` — 자막 4탭, 「글」 탭에 배치 방식 · AI 보이스 · 더빙
- `src/ui/VoiceUi.tsx` — `ReadTextField` 접기, `SubtitleVoiceSection` 에 `extra`(더빙 단추) 자리
- `src/ui/Inspector.tsx` — 소리 2탭, 클립 「전환」 탭 제목 · 점
- `src/ui/LayerPanels.tsx` — 화면 위 「연결」 탭 → 「크기·위치」 안
- `src/ui/AudioFxPanels.tsx` — `TransitionSection` 앞 · 뒤 경계
- `src/ui/TopBar.tsx` — 알약 이름 `span.pill__label`
- `src/styles/frame.css`(새 파일) · `src/main.tsx`(맨 끝에 불러오기)
- 시험: `tests/e2e/aj-inspector-frame.mjs`(새), `tests/e2e/lib.mjs`, `ac-overlay-lane.mjs`, `g-transitions-limiter.mjs`, `zx-voice-clicks.mjs`

## 3. e2e 선택자 — 의도된 변화 vs 회귀

- `lib.mjs` `itab(page, label)`: 없어진 탭 이름이면 내용이 옮겨 간 탭으로(`MOVED_TABS`: 보이스 → 글, 연결 → 글 / 역할·위치 / 크기·위치, 음성 → 소리). 프로젝트 패널 「보이스」는 그대로라 먼저 잡혀요. 이것 하나로 `k-linking`(자막 「연결」) · `v-tts`(자막 「보이스」 · 소리 「음성」)가 고칠 것 없이 새 화면을 따라가요.
- **의도된 변화**
  - `ac-overlay-lane` ⑥: PIP 탭 목록 `PIP,크기·위치,움직임,소리,연결` → `PIP,크기·위치,움직임,소리`.
  - `g-transitions-limiter`: 가운데 클립은 전환 묶음이 둘이라 타일 선택자를 `.tr-edge[data-edge="in"] .tiles--transition .tile` 로(「+」 메뉴로 연 경계 = 그 클립의 앞 경계).
  - `zx-voice-clicks` (d): 「음성」 탭 → 「소리」 탭(클릭 수는 같음: 탭 1번).
- 나머지 목록(a-cut-export · aa-keyframes · af-inspector-plus · ae-volume-db · e-regressions · c-scene-project · l-runs-export · m-transform-export · r-pip-export · s-audio-roles)은 남아 있는 탭 이름 · `data-tab`(place · sound)만 써서 고칠 것 없음.

## 4. 시험한 것

- `npm run typecheck` 통과 · `npm run test:unit` — script 4 실패는 main 16ea7f2 에서도 같음(목소리 목록 10 ↔ 12, 이 트랙과 무관), 나머지 통과.
- e2e(포트 8877): aj-inspector-frame 31/31(새) · ac-overlay-lane 26/26 · af-inspector-plus 36/36 · k-linking 26/26 · e-regressions 10/10 · g-transitions-limiter 16/16(MP4 381프레임 그대로) · r-pip-export 24/24 · s-audio-roles 21/21 · v-tts 38/38 · zx-voice-clicks 10/10.
  - af 첫 실행에서 2개 실패 → 고침: 첫 클립 「전환」 스크롤 62 px(절 머리 없애고 비활성 묶음 한 줄로 → 10 px), 375 폭 가로 넘침 44 px(머리 막대 `flex: none` 이 480 이하 줄바꿈 규칙을 덮음 → 901 이상에만).
  - s-audio-roles 는 v-tts 와 동시에 돌렸을 때 내보내기에서 멈춰 혼자 다시 돌려 통과(부하 탓, 코드 무관).
- 화면 확인: `tests/out/v35-inspector/`(1024 · 1180 · 1440 어두운 · 밝은, 전환 · 소리 탭, 알약 머리 막대). `tools/app-shots.mjs` 에 1024 · 1100 추가.

## 5. 못 한 것 · 남은 것

- 고친 뒤 마지막 CSS(전환 타일 `keep-all` · 1180 이하 묶음 안쪽 여백)는 캡처로만 봤고 시험은 다시 안 돌렸어요.
- 나머지 목록(a-cut-export · aa-keyframes · ae-volume-db · c-scene-project · l-runs-export · m-transform-export)은 남아 있는 탭 이름만 써서 돌리지 않았어요 — 마지막 전체 e2e 때 확인.
- 1024 폭 속성 칸(272 px)에서 시간 입력 숫자가 잘리는 것(전부터 있던 것)과 토스트가 여러 개 쌓이면 속성 칸 아래를 꽤 덮는 것은 그대로예요.
- 가운데 클립 「전환」(두 묶음 다 켜짐)은 1366×768 에서 스크롤이 생겨요(첫 · 마지막 클립은 없음).
