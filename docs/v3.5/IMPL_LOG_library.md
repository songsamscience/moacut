# v3.5 트랙 B — 보관함 · 메뉴 구현 기록 (Opus, 2026-10-10)

브랜치 `v3.5/library-menu` (main 16ea7f2 에서). 설계: `UI_REVIEW_FABLE.md` §2 B3 · B8, §3.3 P0-1, §3.4 P0-2.

## 무엇을 · 어떻게
- **P0-1 · B8 카드 다이어트** (`Library.tsx`, `libraryActions.ts`, `styles/library.css`): 카드 = 썸네일 64×40 + 이름 + 메타 한 줄(52 px). 「+」(영상 · 사진 = 타임라인 끝에 추가, 음악 = 배경음악으로 넣기) · 「⋯」는 호버 · 초점 · 메뉴 열림 때만, 터치(hover:none)는 「⋯」 늘 · 「+」는 고른 카드에서만. 단추 동작 · 조건은 `libraryActions.ts` 한 곳(단추 · 메뉴 · Enter · 두 번 누르기 공용). 두 번 누르기는 카드 전체(단추 영역 제외), 단추 · 카드 click 은 `detail > 1` 무시 → 두 번 실행 없음. 카드가 있으면 끌어 놓기 칸은 한 줄. 문구 「사본 만들기」→「가벼운 미리보기 사본」, 「원본」→「원본 보기」(도움말 · 토스트 · README 용어표 포함).
- **P0-2 우클릭 메뉴** (`ContextMenu.tsx`, `menuItems.ts`, `popover.ts`, `styles/menu.css`): 문서 단위 `contextmenu` 위임([data-ctx] · `.timeline .track__lane`), ⇧F10(keymap `context-menu`, 「보기」 끝 · README 표 같은 자리), 터치 길게 누르기 500 ms, 카드 「⋯」. 창 끝에서 위 · 왼쪽 뒤집기, Esc · 바깥 누르기 · Tab · (연 요소가 움직인) 스크롤로 닫기, ↑↓ Home End Enter, `role=menu/menuitem`, 단축키 표기는 `keyDef/kbdOf`(맥 표기). 오른쪽 단추 pointerdown 은 블록 끌기 · 줄 상자 고르기가 시작되지 않게 막고, 고르지 않은 블록이면 그것만 고름.
  - 항목은 기존 함수만: 클립(나누기 · 복제 · 여기까지 앞/여기부터 뒤 자르기 · 스타일 복사/붙여넣기/골라서 · 원본 보기 · 소리 분리 · 삭제), 자막(글 고치기 · 다음 자막과 합치기 · 둘로 나누기 · 스타일 · 배치 방식 · AI 보이스 · 더빙 녹음 · 삭제), 소리(역할만 듣기 · 배치 방식 · 다시 합치기 · 삭제), 화면 위(숨김 · 잠금 · 앞/뒤/맨 앞/맨 뒤 · 스타일 · 배치 방식 · 삭제), 모자이크(따라가기 · 삭제), 마커(이 시점으로 · 이름 고치기 · 삭제), 빈 줄(자막 · 마커 · 모자이크 · 화면 위에 올리기), 카드(⋯ 와 같음). Delete · Ctrl+D 처리는 `shortcuts.ts` 의 `deleteSelection` · `duplicateSelectedClip` 으로 꺼내 키와 메뉴가 같이 부름.
  - 연결: `Timeline.tsx` 블록 · 마커에 `data-ctx`/`data-id` 만, `Stage.tsx`(SubHit) · `LayerHit.tsx` · `MosaicHit.tsx` 겹 요소에도 속성만.
- **B3** (`LayerPanels.tsx`): 「화면 위에」 메뉴를 `placeNear` 로 fixed 배치(아래가 모자라면 위로, 스크롤 칸에 잘리지 않음), 위로 펼칠 땐 단축키 말풍선을 단추 아래로(`data-kbd-below`). `InsertUi.tsx` 경계 메뉴도 같은 유틸(동작 그대로).

## 시험
- `npm run typecheck` 통과. `npm run test:unit`: script.test.ts 4건 실패 — **main 16ea7f2 에서도 같은 4건**(목소리 목록, 이번 변경과 무관).
- 새 `tests/e2e/ah-context-menu.mjs` 51/51: 카드 높이 52 px · 1440×900 8장 보임 · 호버 단추 · 두 번 누르기 = 원본 보기(레이어 0) · 「+」 두 번 = 한 번 · 7곳 + 모자이크 · 마커 메뉴 항목과 실제 동작 · 실행 취소 1번 · 고름 규칙 · ⇧F10 · ↑ ↓ · Esc 초점 복귀 · 오른쪽 아래 뒤집힘 · 길게 누르기 · 표기 = keymap(89개) · B3.
- 고친 시험(의도된 화면 변화): k-linking · r-pip-export(카드 「화면 위에」 → 「⋯」 메뉴), p-proxy-time(「사본 만들기」 → 「⋯」 → 「가벼운 미리보기 사본」), 공용 `cardMenu()` 를 `lib.mjs` 에. a-cut-export · w-tts-conflict 는 새 「+」 의 aria-label 이 기존 선택자와 맞아 그대로.
- 결과(포트 8875): ah-context-menu 51/51 · i-keys-guides 48/48 · af-inspector-plus 36/36 · ac-overlay-lane 26/26 · l2-navigation 29/29 · k-linking 26/26 · r-pip-export 24/24 · w-tts-conflict 21/21 · a-cut-export 23/23 · q-proxy-quality 9/9 · p-proxy-time 16/16 · u-4k 11/11.
  - 회귀로 보였다가 아닌 것: k-linking · w-tts-conflict · a-cut-export 첫 실행 실패는 시험 도중 소스를 고쳐 HMR 로 페이지가 다시 읽힌 탓(+ 병렬 CPU) — 단독 재실행 모두 통과.
  - ac-overlay-lane 은 실제 회귀를 잡았음: 줄 머리 「+」 메뉴를 위로 뒤집자 타임라인 스크롤 칸에 잘림 → fixed 배치로 고침.
- 화면 확인: `tests/out/v35-library/`(1440 어두운 · 밝은, 375). 고친 것: 위로 펼친 「화면 위에」 메뉴 끝 항목을 단축키 말풍선이 가림 → 말풍선 아래로, 375 에서 「⋯」 메뉴가 늦게 온 scroll 이벤트로 바로 닫힘 → 연 요소가 실제로 움직일 때만 닫기.

## 못 한 것 · 남긴 것
- 빈 줄 「붙여넣기」: 브라우저 붙여넣기(파일)는 사용자의 붙여넣기 동작이 있어야 해서 메뉴 함수로 부를 수 없어 뺐어요. 속도 · 앞뒤 경계 전환은 아직 기능이 없어 뺐어요(지시대로).
- 소리 · 화면 위 「복제」: 기존 함수가 없어 뺐어요. 카드 `Shift+Enter`(화면 위에) · `Delete` 키는 새 키라 넣지 않았어요.
- 트랙 C 의 Q/W(앞뒤 자르기) 키가 합쳐지면 클립 메뉴 「여기까지 앞 / 여기부터 뒤 자르기」에 `key` 만 달면 표기가 붙어요.
- 트랙 A 가 타임라인 기본 높이를 키우면 보관함 높이가 줄어요 — 합친 뒤 「카드 7장」 시험을 다시 봐야 해요(지금 1440×900 은 8장 보임).
