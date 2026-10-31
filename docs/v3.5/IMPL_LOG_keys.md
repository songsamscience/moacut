# v3.5 트랙 C — 재생 · 키 구현 기록 (2026-10-10, Opus)

## 무엇을 · 어떻게
- **P0-4 재생 조작**: `J`/`K`/`L` 빨리 보기(×1→×2→×4, J 는 뒤로 — 일정 간격(90 ms) 되감기로 그림만, 소리 없음). 속도 배지(누르면 ×1→×2→×4). 엔진 `Playback.setRate`(1·2·4, 멈추면 1로 — 녹음 · 구간 듣기는 늘 1배, 자산 소리는 1배일 때만). 스피커 = 미리듣기 음량 · 소리 끄기(리미터 뒤 `outGain`, localStorage `ss.moacut.previewVolume`). D4 ⏮ ◀| ▶ |▶ ⏭. 시간 칸 눌러 `mm:ss.cc` 입력(Enter 이동 · Esc 취소 · 잘못된 값 = 흔들림 + 원래 값). `` ` `` = 보관함 · 속성 칸 접기(`data-wide-preview`, 도구 판을 열면 원래대로) + 단추. 구간 반복은 구간 칩 안.
- **P0-5 구간**: `src/state/playView.ts`(보기 상태 store — 구간 · 배속 · 반복 · 음량 · 넓게, 프로젝트를 바꾸면 구간을 지움, `timelineRange()` = 「구간만 내보내기」에서 읽을 함수). `src/core/rangeEdit.ts` `liftRange` / `keepRange`(splitClipAt ×2 → finish → deleteClipsCascade — 삭제 확인 창과 같은 규칙), store.apply 1번. `src/ui/playActions.ts`(I/O/X/Alt+X/⇧I·⇧O/빼기/남기기/Q·W/넓게). `RangeBand.tsx`(눈금자 분홍 괄호 + 옅은 칠, Timeline.tsx 에는 import 1줄 + 사용 1줄). 재생 막대 「구간 ▾」 메뉴(I · O · X · ⌥X 단추 짝), 구간 칩(⇧I/⇧O 시각 단추 · 빼기 · 이것만 남기기 · 구간 반복 · 구간만 듣기 · ✕)은 막대 오른쪽 위에 띄움(1280 한 줄 유지).
- **P0-6b**: 비율 seg · 맞춤 seg · 안내선 · 정렬 · 안전 영역 · 성능/화질 → 「16:9 ▾」 + 「보기 ▾」(맞춤 · 자막 안전 영역 G · 정렬 안내선 · 안내선 ; · 미리보기 가볍게/선명하게 「출력 화질은 그대로예요」). 팝오버는 자체 `flipPlace`/`useFlipPopover`(`// TODO(v3.5 merge): popover.ts 로 교체`). 재생 막대는 새 파일 `src/ui/Transport.tsx`, CSS 는 `src/styles/playback.css`.
- **키맵**: `KeyDef.scope`('timeline' | 'source') 추가 — I/O 가 화면에 따라 다른 동작. 더한 키: J·K·L, ⇧I/⇧O, `, Q, W, I/O(타임라인), X, Alt+X, ⇧Delete(⇧Backspace). 옮긴 키: 배치 방식 L → **⇧P**. Delete 는 Shift 없을 때만(⇧Delete = 구간이 있으면 빼기, 없으면 보통 삭제).
- **결정**: ① `K` 는 키프레임 넣기와 같은 키 → 재생 중이면 멈춤, 멈춰 있으면 키 넣기(키프레임 줄 문구에 적음). ② 빼기 뒤 확인 창 대신 토스트(줄어든 길이 · 함께 지운 연결 요소 수 · Ctrl+Z). ③ Q(앞 자르기) 뒤엔 재생 위치를 그 클립 시작으로(같은 장면) + 2초 강조 — 속성 칸 단추도 같은 함수라 같이 바뀜. ④ 재생 막대 시각은 mm:ss.cc(다른 칸의 mm:ss.ff 는 그대로 — 나중에 통일할지 검토). ⑤ 원본 보기에서는 J/L 이 동작하지 않음(scope timeline).

## 시험
- typecheck 통과 · unit 전부 통과(새 `range.test.ts` 28), 단 `script.test` 4 실패는 **원래 있던 것**(기준 커밋 16ea7f2 에서도 같은 4 실패).
- 새 e2e `ai-range-keys` 38/38(내보내기 480p 빼기 뒤 4.0 s 확인 포함). 고친 시험: i-keys-guides 49/49 · l2-navigation 29/29 · k-linking 26/26 · ac-overlay-lane 26/26 · c-scene-project 19/19 · p-proxy-time 16/16 · q-proxy-quality 9/9, f-ime-keys 9/9(그대로).
- 의도된 변화로 고친 곳: L→⇧P(k-linking · ac-overlay-lane), 비율 seg → 「16:9 ▾」(c-scene · i-keys), 안내선 · 안전 영역 · 화질 → 「보기 ▾」(i-keys · p-proxy · q-proxy, 「화질 우선」→「선명하게」), 타임라인 I/O = 구간(l2), 시간 표기 .cc(d-build-smoke 파싱 /100). 회귀는 없었음.
- 화면: 1440×900 · 1280×720 어두운 · 밝은 캡처(`tests/out/v35-keys/`) — 1280 에서 막대 한 줄(48 px, 넘침 0), 보기 메뉴는 위로 뒤집힘.

## 못 한 것
- d-build-smoke 는 파싱만 고치고 돌리지 않음(빌드 필요) · 전체 e2e 는 마지막 통합 때.
- 실제 소리(×2 · ×4 음정 · 음량)는 귀로 듣지 않음 — 엔진 값으로만 확인.
