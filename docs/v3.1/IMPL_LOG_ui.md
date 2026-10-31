# 모아컷 v3.1 구현 기록 — ui(속성 칸 탭 · 「+」 메뉴 · 소리 크기 dB)

브랜치 `v3.1/ui`(worktree ~/Projects/moacut-wt/ui). 명세 `UI_INSPECTOR_PLUS_VOLUME.md`. 다른 worktree(overlay · voice)와 겹치지 않게 `LayerPanels.tsx` · `VoiceUi.tsx` · 타임라인 레이어 줄 JSX 는 손대지 않았다.

---

## ui-1 — 속성 칸 분류 탭 · 「+」 메뉴 · 소리 크기(dB) (2026-10-10, Fable)

### 만든 것
- **`src/core/volume.ts`(새)**: `DB_FLOOR −30 · DB_MAX +12 · GAIN_MAX · DB_STEP · DB_OFFSET_MAX`, `dbToGain · gainToDb · clampGain · sliderToGain · gainToSlider · formatDb · formatPct`, 대상 모으기 `collectVolumeTargets`(소리 있는 영상 클립 · 소리 항목 · PIP 레이어), 일괄 `applyVolumeDb(p, targets, {mode:'set'|'offset', db})` · `applyMute` · `nextGain` · `volumeChangeLabel`, 고르게 맞추기 계약 `LoudnessMeasure · LoudnessMeasurement · NormalizeStep · LOUDNESS_PRESETS · planNormalize · applyNormalize`(측정 함수는 없음 — 명세 §6).
- **범위**: `ops.updateAudioItem` · `audioOps.setRoleMix` 의 음량 상한 2 → `clampGain`(GAIN_MAX ≈ 3.98, +12 dB). `types.ts` Clip.volume 주석.
- **`src/ui/InspectorTabs.tsx`(새, 공용 틀)**: `InspectorTabs({kind, tabs})` + `useInspectorUi`(선택 종류별 마지막 분류, 화면 상태) + `openInspectorTab(kind, id)` + `activeInspectorTab`. tablist · roving tabindex · 화살표 · Home · End · 점 표시.
- **`src/ui/Inspector.tsx`**: ClipPanel 5 분류(자르기+숨은 요소 · 소리 · 색감 · 크기·위치+움직임 · 전환), AudioPanel 4(역할·위치 · 소리 · 음성 · 연결), ProjectPanel 6(화면 · 소리 · 마커 · 자막 · 보이스 · 안내). 여러 클립일 때 「소리」는 하나라도 소리가 나면 보임.
- **`src/ui/SubtitlePanel.tsx`**: 6 분류(글+SRT · 모양 · 프리셋+내 스타일 · 움직임 · 보이스 · 연결) — 절 내용은 그대로 변수로 묶음.
- **`src/ui/VolumeUi.tsx`(새)**: `DbSlider`(값 두 번 누르면 0 dB · 0 dB 눈금 · % 보조), `VolumeBatchSection`(똑같이 = 바로 / 지금보다 = 적용 단추 · 음소거 · 창 열기), `VolumeAllSection`(프로젝트 「소리」), `VolumeDialog`(dialog `'volumes'`: 종류 seg · 목록 체크 · 일괄 · 고르게 맞추기 idle/measuring/done/error 상태 · `loudness.measure` 자리).
- **`src/ui/AudioUi.tsx`**: 클립 「소리」 · 소리 섞기 역할 6줄 슬라이더 → `DbSlider`.
- **`src/ui/InsertUi.tsx`(새)**: `useInsertUi{menu, at}`, `BoundaryMenu`(fixed · 꼬리 · 키보드 · 바깥/Esc/Tab/스크롤 닫힘), `addTransitionAt`(전환 + 「전환」 분류), `startInsertPick · insertMediaAt · insertFilesAt · cancelInsertPick`, `InsertPickNote`(보관함 안내 + Esc capture).
- **`src/ui/Timeline.tsx`**: `.boundary-add` 클릭 → 메뉴(`.is-open` · aria-haspopup/expanded, data-kbd 제거), 전환 표시 클릭 → 「전환」 분류, `.drop-mark.is-insert`, `<BoundaryMenu />` 한 번. `src/ui/Library.tsx`(3줄): `InsertPickNote`, `.is-picking` 에 끼워 넣기 포함, 카드 클릭 = `insertMediaAt(m) || …`.
- **`src/app/media.ts`**: `importFiles(files, { at })` — 그 자리에 끼움. **`src/state/store.ts`**: Dialog `'volumes'`. **`src/ui/App.tsx`**: `<VolumeDialog />`. **`src/ui/KeyHint.tsx`**: MODALS 에 volumes. **`src/ui/actions.ts`**: `toggleMarkerList` → 프로젝트 「마커」 분류 열기. **`src/main.tsx`**: CSS 2개 import, `__moacut.volume · inspector · insert`.
- **CSS**: `src/styles/inspector.css`(탭 · 경계 메뉴 · 끼워 넣기 안내/표시) · `src/styles/volume.css`(dB 슬라이더 · 창 목록) 새 파일, `tokens.css` `--gain-up` 짝, `tools/contrast.mjs` 짝 2개(94쌍 모두 OK).
- **도구**: `tools/ui-shots.mjs`(MOACUT_URL, 16장 → `tests/out/shots-ui/`: 1366×768 어두운 12 · 밝은 2 · 375 폭 2, 가로 넘침 0, 페이지 오류 0).

### 시험
- `npx tsc -b` 깨끗. `node tools/unit.mjs` 18 스위트 0 실패(새 `volume.test.ts` 22 통과, `audioops` 범위 한 줄 갱신).
- e2e(8876): `i-keys-guides` 48/48 · `e-regressions` 10/10. 다른 스위트는 선택자만 고치고 돌리지 않음(무거운 출력 시험 — Opus 몫): `a-cut-export` · `aa-keyframes` · `g-transitions-limiter` · `k-linking` · `l-runs-export` · `m-transform-export` · `s-audio-roles` · `v-tts`.
- 선택자 변화: `tests/e2e/lib.mjs` 에 `itab(page, label)` 추가. 탭 안의 절을 만지기 전에 그 탭을 연다. 「+」는 `.boundary-add` 클릭 뒤 `.boundary-menu [role=menuitem]` 첫 항목(= 화면 전환 넣기, data-kbd D).

### 의도한 동작 변화
- 「+」가 바로 전환을 넣지 않고 메뉴를 연다(단축키 D 는 전처럼 바로). 전환을 넣으면 클립 패널이 「전환」 분류로 열린다.
- 음량 상한 200 % → +12 dB(398 %). 슬라이더 왼쪽 끝 = 무음(−∞).
- 여러 클립 · 소리 항목을 고르면 「소리」 분류가 일괄 절(똑같이 / 지금보다)로 바뀐다.
- ⇧M(마커 목록)이 프로젝트 패널 「마커」 분류를 연다.

### 남은 것
명세 §6: `app/loudness.ts measureLoudness`(계약만) · 무거운 e2e 돌리기 · 레이어 패널 탭 · 타임라인 파형/키 → 분류 바로 열기 · 「+」 맨 앞 · 맨 끝.

---

## ui-2 — 엔진 · 통합 · 검증 (2026-10-10, Opus)

Fable 의 화면 결정(탭 · 「+」 메뉴 · dB 표기)은 그대로 두고, 측정 엔진을 넣고 기능 · 정확성 · 접근성 문제를 고쳤다. 커밋 f2bd446 · 24d7cfc · a5645ef · d5135ec · 4871a75 · 270e721(+ 이 기록).

### 소리 크기 엔진
- **`engine/analysis/loudness.ts`(새, 순수)**: ITU-R BS.1770-4 — K-가중 두 단(아날로그 원형에서 표본율마다 계수, 48 kHz = 표의 값 1e-8 안), 400 ms 블록 · 100 ms 간격, 절대 −70 LUFS · 상대 −10 LU 게이트, 진짜 피크(4배 보간 Blackman-sinc 24탭 · 위상 3개, 조용한 64표본 묶음은 「이 묶음 최대 × Σ|h| ≤ 지금 피크」면 건너뜀 — 값은 같고 빠름). `LoudnessMeter.push/pushInterleaved` 로 이어서(여러 구간 = 한 소리). 12탭은 백색 잡음 진짜 피크가 ffmpeg 보다 0.9 dB 낮아 24탭으로(48탭은 0.3 dB 넘게 높음). 10분 스테레오 잡음(최악) node 4.2초.
- **`engine/ffmpeg/audio.ts streamMixPcm`**: 원본을 한 번 붙이고 30초씩 `-ss` 로 꺼냄, 출력과 같은 스테레오 48 kHz(모노 → `pan=stereo|c0=c0|c1=c0`, 그 밖은 aformat 기본 내림 믹스 — exportPipeline 과 같은 사슬). 다른 작업 취소로 워커가 다시 뜨면 그 조각만 다시.
- **`app/loudness.ts measureLoudness`(새)**: `loudnessRanges` 의 원본 구간만, 원본 파일(사본 아님) · 보관 자산 Blob 에서. `jobs.run('loudness')` — HEAVY 에 추가(내보내기 · 자동 자막 뒤 대기, 머리 막대 알약 취소, 창 「취소」 = `jobs.cancelKind('loudness')` 로 대기 중이어도 빠짐). 못 잰 까닭: 「거의 무음이라 잴 수 없어요.」 「0.4초보다 짧아 잴 수 없어요.」 「…원본이 연결되지 않았어요. 「다시 연결」로…」 「보관된 소리 파일이 이 브라우저에 없어요…」. 캐시 = 지문(이름|크기|수정 시각) · 구간 · 채널 처리, 최근 200개.
- **`core/volume.ts`**: `loudnessRanges`(클립 [in,out) · 소리 항목 = `collectAudioSources` 의 그 항목 조각, 영상 끝에서 잘림, 안 보이면 [offset, offset+dur) · 레이어 = `layerPieces`, 이웃 구간 합침), `loudnessCacheKey`, `planNormalize` 상한 — **원본보다 키울 때만** 진짜 피크 + 키운 양 ≤ −1 dBTP(원본이 이미 넘으면 원본 크기까지만, 맞추기가 줄이지는 않음), 그다음 +12 dB(`limit: 'peak' | 'max'`, `want`), 못 잰 것은 `reason` 과 함께 그대로. `applyNormalize` 는 1e-9 안이면 안 바꿈(실행 취소 기록 없음). −∞ 규칙 주석: 「지금보다」는 무음을 깨우지 않고 「똑같이」만 깨움, 음소거는 gain 과 따로.
- **상한 0~2 → 0~3.98 확인**: 미리보기 클립 · PIP = GainNode(상한 없음), 자산 = GainNode, 출력 `volume=`(상한 없음), 리미터 = 같은 `Limiter`. **고친 것 둘**(`exportPipeline.ts`):
  1. 클립 조각 소리가 `pcm_s16le` 라 gain > 1 로 0 dBFS 를 넘으면 리미터 앞에서 잘렸다(미리보기는 실수 → 리미터). 키운 클립이 하나라도 있으면 조각 소리 · 무음 조각을 모두 `pcm_f32le` WAV 로(concat 은 한 형식이어야 함). ae ③b: 같은 Limiter 코드로 원본×3.98 을 누른 것과 잔차 **−44.3 dB**(16비트였다면 −5.4 dB).
  2. 리미터를 끄고 0 dBFS 를 넘기면 AAC 인코더가 제멋대로 눌렀다(ffmpeg-static 로 재현: +12 dB 말소리 실수 RMS −5.9 → AAC −9.5 dB, 피크 +8.2 → +4.6 dBFS). 미리보기는 스피커로 나갈 때 ±1 에서 잘리므로 출력도 섞은 뒤 `aformat=s16,aformat=fltp`(0 dBFS 에서 잘림) → AAC. ae ③: 원본×3.98 을 ±1 로 자른 것과 잔차 −25.2 dB · 최대 1.02.
- 저장 형식 · `core/migrate.ts` 변화 없음(값 범위만 넓어짐, 마이그레이션이 음량을 자르지 않음 — 확인).

### 화면 동작 고침(디자인은 그대로)
- `VolumeUi`: `loudness.measure = measureLoudness` 연결(VolumeUi 안 — main.tsx 충돌 줄이기), done 상태가 잰 값을 들고 기준을 바꾸면 `planNormalize` 만 다시, 대기 중 「앞 작업 「…」이(가) 끝나면 재요」(jobs 구독), 줄에 「피크 때문에 +N dB까지만」 · 「+12 dB 까지만」 · 못 잰 까닭, 기록 이름의 LUFS 를 「−16 LUFS」(전엔 ASCII -16), 끝나는 순간 취소 → 처음으로(전엔 잠긴 채 멈춤), dB 값 단추를 키보드로 누르면 0 dB(전엔 두 번 누르기만이라 키보드로는 아무 일 없음).
- `InsertUi`: 같은 「+」를 다시 누르면 닫힘 · 아이콘(svg)을 눌러도 바깥 누르기로 안 닫힘, 스크롤은 「+」가 실제로 움직였을 때만 닫음(열 때 늦게 오는 scroll 로 바로 닫혀 g-transitions-limiter 가 멈췄다), 키보드로 고르면 초점 이어 가기(전환 → 「전환」 탭, 끼워 넣기 → 첫 카드), **고르는 중 카드 Enter · Space = 그 자리에**(전엔 카드 Enter 가 「끝에 붙이기」라 키보드로는 끼워 넣을 수 없고 고르기도 안 끝남), 열린 창이 있으면 Esc 는 창 몫, 파일로 끼워 넣기도 끊긴 연결 자막 나눔 안내.
- `Timeline`: 새 영상 클립 강조 `is-new`(flashIds 는 불렀지만 영상 블록이 그리지 않았다), 「숨은 마커 n」 → 프로젝트 「마커」 분류. `actions.toggleMarkerList`: 다른 분류를 보고 있으면 접지 말고 「마커」 분류를 열고 펼침(기본 markerList = true 라 ⇧M 이 안 보이는 목록을 접기만 했다). `shortcuts.addSubtitleHere`: 새 자막은 「글」 분류로(마지막 분류가 「모양」이면 글 칸이 안 보였다 — a-cut-export 에서 재현).
- `store.apply` 합친 기록은 마지막 이름으로(「소리 크기 똑같이 −0.5 dB」에 머물던 것 → 「−6 dB」).
- `inspector.css`: 481 ~ 1100 px 타임라인 머리 단추 글 숨김 + 줄바꿈 허용 — 900 폭 가로 넘침 80 px(이 브랜치 전부터 있던 것, af ⑥ 에서 발견).
- `TopBar` 작업 아이콘 표에 `loudness: Mic` 한 칸, `main.tsx` 개발 훅 `loudness` · `jobs`.

### 시험(이번에 실제로 돌린 것만)
- `npx tsc -b` 깨끗 · `node tools/unit.mjs` 21 스위트 686개 0 실패(새 `loudness` 23: EBU Tech 3341 사인 1 · 2 · 3 · 4 = −23.0/−33.0 LUFS ±0.1, 모노 −23.01, 무음 · 0.3초 · −75 dBFS = null, 나눠 넣기 = 한 번에, fs/4 사인 45° 표본 −3.01 · 진짜 0 dBTP, ffmpeg-static ebur128 과 백색 · 분홍 + 게이트 · 44.1 kHz · 말소리 파일 통합 ±0.05 LU · 진짜 피크 ±0.2 dB / `volume` 22 → 36). `tools/contrast.mjs` 94쌍 0 미달.
- 새 e2e `ae-volume-db` **46/46**: 키보드 ← ×12 = 두 클립 −6 dB(기록 1개 「소리 크기 똑같이 −6 dB (2개)」), 「2개에 +3 dB」 실행 취소 한 번, 소리 항목 −4 dB, End = +12 dB. 720p 출력 RMS 차: −6.02 · +12.00(−18 → −6 dBFS 사인) · 소리 항목 −3.98 dB. 고르게 맞추기: 브라우저 잰 값 = ffmpeg ebur128(같은 채널 처리) −18.8/−18.8 · −18.7/−18.8 · −15/−15 · −21/−21, 5개 재기 0.9초 · 캐시 다시 재기 0.08초, 기준 −23 바꾸면 계획만, 큰 작업 뒤 대기 · Esc 잠금 · 취소로 줄에서 빠짐. 적용 뒤 720p 출력 구간 라우드니스 장면 · 막대 · 말소리 · 음악 모두 **−16 LUFS**(± 1 LU 기준).
- 새 e2e `af-inspector-plus` **36/36**: 메뉴 aria · 첫 항목 초점 · ↓↑ Home End · Esc 초점 복귀(선택 그대로) · 다시 누르면 닫힘 · 바깥 닫힘, 키보드 전환 넣기(「전환」 탭 초점, 실행 취소 한 번), 끼워 넣기 안내 role=status · 자리 표시 ±0.5 px · 음악 카드 안내 · 그 자리 · 뒤 자막 3.2 → 9.21초(+ 끼운 6.01초) · 앞 자막 그대로 · 실행 취소 한 번, 키보드 끼워 넣기(첫 카드 → Enter), 「파일」, 나눈 곳에 끼우면 걸친 자막 1 → 2조각 + 안내 · 실행 취소 한 번, 탭 aria · roving · ← → Home End(재생 위치 그대로) · 분류 기억 · 사진엔 소리 없음 · 여러 개 = 전환 없음 + 일괄 · 점 · ⇧M, 1366×768 스크롤 클립 자르기 0 · 소리 0 · 색감 114 · 크기·위치 313 · 전환 0 px, 900 · 375 폭 가로 넘침 0.
- 회귀(최종 코드, 8876, 브라우저 하나씩, `tests/out/regress/run.sh`):

  | 스위트 | 결과 | | 스위트 | 결과 |
  |---|---|---|---|---|
  | i-keys-guides | 48/48 | | n-autosave | 20/20 |
  | e-regressions | 10/10 | | o-migrate | 13/13 |
  | g-transitions-limiter | 16/16 | | s-audio-roles | 21/21 |
  | k-linking | 26/26 | | aa-keyframes | 13/13 |
  | l2-navigation | 29/29 | | m-transform-export | 25/25 |
  | c-scene-project | 19/19 | | a-cut-export | 23/23(클립 150 % → +3.51 dB) |
  | ae-volume-db | 46/46 | | af-inspector-plus | 36/36 |
  | l-runs-export | 27/27 | | | |

  처음 돌렸을 때 실패: g(메뉴가 늦은 scroll 로 닫힘 — 코드 고침), c · s · l-runs(분류 탭 안 SRT · 소리 섞기 — 시험 고침), a(새 자막 「글」 분류 → 9칸은 「모양」 — 코드 + 시험 고침). 고친 뒤 위 표 전부 다시 돌림.
- 고친 시험(의도된 화면 변화): `c-scene-project` SRT 앞에 `itab('자막')`(프로젝트 「자막」 분류), `l-runs-export` 자막을 모두 지운 뒤 SRT 불러오기 앞 `itab('자막')`, `s-audio-roles` 경고 문구 앞 `itab('소리')`(소리 섞기 = 프로젝트 「소리」 분류), `a-cut-export` 두 번째 자막 위치 9칸 앞 `itab('모양')`(새 자막이 「글」로 열림). Fable 이 고친 `g` 의 메뉴 항목 클릭은 그대로 맞았고, 실패 원인은 메뉴 스크롤 닫힘(위 고침).

### 남은 것 · 디자인에 넘길 것
- 「고르게 맞추기」는 항목마다 같은 기준 — 배경음악도 대사만큼 커진다(창의 기본 고르기 = 전부). 음악 역할은 기준 −N LU 로 두거나 기본 고르기에서 빼는 결정이 필요.
- 보관함이 「음악」 탭일 때 끼워 넣기를 고르면 카드가 음악뿐이다(누르면 안내만). 고르기 시작 때 「영상」 탭으로 바꿀지.
- 리미터를 끈 채 0 dBFS 를 넘기면 이제 미리보기처럼 잘린다 — 값 글 노랑(is-boost) 말고 「리미터를 켜세요」 같은 안내가 있으면 좋다.
- 돌리지 않은 것: `v-tts`(모델 401 MB) · `r-pip-export` · `u-4k` · `zz-all-res` · `d-build-smoke`, 귀로 듣는 확인, Edge.
