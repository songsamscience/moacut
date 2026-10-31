# 모아컷 v3.2 구현 기록 — 「AI 보이스 만들기」 창 하나 · 목소리 10개 · 쉼 재설계

가지 `v3.2/voice-ui`(main `a1d9d2d` 기준), 2026-10-10, 구현 Opus. 설계: `docs/v3.2/VOICE_UI_FABLE.md`(U1~U9 · §2.3 상태 기계 · §3 명세), `docs/v3.2/VOICE_PLAN_FABLE.md` §4(목록) · §2.3(쉼).
목소리 레시피는 처음엔 임시값이었고, 2026-10-10 측정으로 확정(`VOICE_RESULT.md`, moacut-voice-lab `work/v32/cand_final.json`) — 사용자 청음 뒤 바뀌면 `src/engine/tts/voices.ts` 숫자 · `desc` 를 바꾸고 `lab/v32_samples.py <recipes> public/voices` 로 샘플을 다시 만든 뒤 `zw-voice-samples` 를 돌린다. 권장 빠르기 칸은 0.9~1.5 → 0.8~1.5(빠른 프리셋을 늦춘 기본값 0.85 · 0.88 이 「권장 밖」으로 나오지 않게).

## 무엇을 어디에

| 곳 | 내용 |
|---|---|
| `src/engine/tts/voices.ts` | v3.2 목록 10개 `ko-m1…ko-m5 · ko-f1…ko-f5`(이름 「남성 1」 + `desc` 「낮고 차분한 톤」 · `sample` = `voices/<id>.mp3` · `{kind:'mix', ttl, dp}` · 목소리별 `speed`) — **레시피 숫자는 이 파일 한 곳**. 옛 `M1…F5` · `college-m/f` 는 `hidden: true` · 이름 「남성 1(이전)」 「대학생 남(이전)」(지우지 않음, 레시피 그대로). `LISTED_VOICES` · `DEFAULT_VOICE_ID = 'ko-f3'` · `isListedVoice` · `voiceTitle()`(「남성 1 — 낮고 차분한 톤」, 음성 상태 줄 등 한 줄 표기). `VIRTUAL_NOTE` = VOICE_PLAN §4.3 문구(셋째 문장은 바닥 안내와 겹쳐 뺌) |
| `public/voices/` | 미리 듣기 MP3 10개 + `voices.json`(임시 레시피로 만든 것을 그대로 복사, 합계 519 KB). 서비스 워커 미리 캐시는 빌드 산출물 전부를 넣는 기존 `moacut-sw-precache` 가 자동으로 포함(빌드본 `sw.js` 에서 확인 — d-build-smoke) |
| `src/engine/audio/trim.ts`(새) | `trimRange` · `trimSilence(pcm, sr, { lead: 0.05, trail: 0.10 })` — 10 ms 틀(hop = ⌊sr/100⌋) dB, 문턱 = max(−50, 최대 − 40), 넘는 첫 · 마지막 틀 ± 여유. 파이썬 `lab/v32_samples.py trim_silence` 와 같은 결과(파이썬 `round` 처럼 .5 는 짝수 쪽 — 22.05 kHz × 0.05 = 1102.5 에서 실제로 1 표본 차이가 났던 것을 맞춤) |
| `src/core/script.ts` | `SCRIPT_GAP` 0.3 → **0.45**, `SCRIPT_PARA_GAP` 0.6 → **0.9** |
| `src/app/tts.ts` | `licenseAccepted()` = `ss.moacut.ttsLicense` **와** `ss.moacut.aiDisclosureAck` 둘 다 rev, `acceptLicense()` 둘 다 기록 · `SAMPLE_TEXT` 비교 문장 · `SAMPLE_SEED` 7 · `synthesizeGroups` · `sampleVoice` 결과 다듬기 · 재생 슬롯 정리(`pcmSource`/`urlSource`, 앱 전체 한 번에 하나) · **미리 듣기** `useSample` · `loadSampleFiles` · `playSample`(규칙 (1) 기본 빠르기 · 8단계 = MP3, (2) 아니면 모델로 합성, 모델 없으면 MP3, (3) 둘 다 없으면 ▶ 비활성) · `playSampleChain`(10개 이어 듣기, 0.4 s 쉼) · `makeItemCandidate({autoPlay})` + `playCandidate`(「다시 만들기」 후보 자동 재생 1회) · `acceptItemCandidate` 되돌리기 토스트 · `replaceItemVoice`(길이 맞추기 바로 바꾸기) · `regenStaleVoices`(변경된 음성 바로 다시 만들기, 진행 `useTts.regen`) · `undoAction(label)` · `withEndNote` 내보냄 · `ttsEngine` 내보냄(시험용). 마법사 열기(`openVoiceWizard` · `openRegenWizard`)와 `useTts.wizard` 삭제 |
| `src/app/scriptVoice.ts` | 대본 탭 흐름. 합성 직후 · 캐시에서 꺼낸 뒤 다듬기(캐시에는 원본) · `generateScript` 가 `'license'` 등 결과를 돌려줌(동의 판은 창이 연다) · `intent` · `run`(만드는 중 k / m) · `changed`(목소리를 바꿔서 다시 만들어요) · `inserting`/`insertError` · `resetLineRead`(「원래대로」) · `insertScript({ skipFailed, endNote })` + 되돌리기 토스트 · 공용 설정 `applyDefaultPrefs`(project.voice → `ss.moacut.voicePrefs` → ko-f3, 숨김 건너뜀) · `savePrefs` |
| `src/app/voiceSubs.ts`(새) | 자막 탭 흐름(옛 마법사 ①~⑤의 로컬 상태를 zustand `useVoiceSubs` 로): `openSubs`(고를 자막 + 읽기 제안 한 번 적용) · `subsGroups` · `subsRows`(고른 묶음 + 안 고른 자막 회색 행) · `toggleRow` · `checkAll` · `makeSubs` · `insertSubs`(충돌이면 `openVoiceFit`) · `estimateSubs` · 듣기 · `resetReadText` |
| `src/app/voiceStudio.ts`(새) | 창 하나 흐름: `openVoiceStudio({source, ids})` · 옛 이름 `openScriptVoice` · `openVoiceWizard`(단축키 · 패널이 그대로 부름) · `setSource` · `studioGo(insert | preview)` · 동의 판 `openStudioLicense` · `licenseContinue`(받기 시작 → 몸통 복귀 → 다 받으면 `pending` 이어서) · `studioInsert` · `studioCancel` · `closeStudio` |
| `src/ui/VoiceStudio.tsx`(새, `ScriptVoiceUi.tsx` 삭제 · `VoiceWizard` 삭제) | 머리(탭 `role=tablist` 「대본으로」 「자막으로 (n)」 + 모델 칩: 받기 단추 / 받는 중 진행 · 취소 / 「모델 받아 둠 · 내 기기에서만」 / 대기열), 왼쪽(① 대본 · 자막 고르기, ② 목소리 카드 10개 두 열 · ▶ · 10개 이어 듣기, AI 안내, 세부 설정), 오른쪽(문장 목록 `VoiceLineRow` 한 컴포넌트로 두 탭), 바닥(넣는 방법 · 안내 · 닫기 · 먼저 들어 보기 · 주 단추, §2.3 단계별), 동의 판(같은 창), Ctrl/⌘+Enter(e.code) |
| `src/ui/VoiceUi.tsx` | `LicenseBody`(본문, 체크 문구 「위 조건을 읽었고 지키겠어요. 만든 영상에는 AI 음성 사용을 밝힐게요.」) + `LicensePanel`(받기 창 단추) · `DownloadProgress` · `WaitHint` 내보냄 · 후보 줄 자동 재생 상태(■ 멈추기) · 「다시 만들기」 = autoPlay · 프로젝트 「변경된 음성 다시 만들기 (n)」 = 바로(진행 줄 · 멈추기) · 길이 맞추기 「적용」 = 바로 바꿈 |
| `src/ui/dialogs/Modal.tsx` | `focus?: string`(열 때 초점 선택자) |
| `src/ui/App.tsx` · `shortcuts.ts` · `TopBar.tsx` · `main.tsx` | dialog `'voice'` · `'script-voice'` → `VoiceStudio` 하나, 여는 함수는 `app/voiceStudio`, 개발 훅에 `voiceStudio` · `voiceSubs` |
| `src/styles/voice.css` | §3.11 새 클래스(`.vs*` · `.vs-voice*` · `.vs-line*`), 지움 목록(`.steps--h` · `.voice-subs` · `.voice-groups` · `.list__group` · `.voice-tiles` · `.voice-tile` · `.read-row*` · `.voice-read-list` · `.voice-cands` · `.voice-cand` · `.script-voice__card(s)/presets/settings/make/put/step/no` · `.voice-wizard__foot-hint` · `.voice-model-card`) 삭제. 새 색 토큰 없음 |
| 시험 | 단위 `tests/unit/trim.test.ts`(새 10) · `script.test.ts`(쉼 · 목록 · 숨김 · D3 섞기 제약). e2e `x-script-voice` · `v-tts` · `w-tts-conflict` · `zv-offline-tts` · `d-build-smoke` 고침, 새 `zw-voice-samples`(샘플 회귀) · `zx-voice-clicks`(클릭 수 실측) |
| 문서 | README AI 보이스 절, ARCHITECTURE §2.8, 이 기록 |
| 캡처 | `tests/out/voice-ui-shots/_voice-shots.mjs` 새 선택자 → `tests/out/voice-ui-shots-after/`(같은 번호 + 06b · 09b · 11 · 14b · 16c · 17b · 18c 추가, `_metrics.json`) |

## 문서와 다르게 한 점 · 이유

1. **기본 빠르기 · 품질(U7)**: 문서는 「빠르기 = 목소리 기본값 · 품질 보통」. 마지막 기록(project.voice → voicePrefs)에 빠르기 · 단계가 있으면 그대로 되살린다(같은 대본 = 같은 소리 · 캐시가 맞음, 교사가 고른 「빠르게」가 매번 풀리지 않게). 기록이 없을 때만 목소리 기본값 · 보통. 목소리를 바꾸면 빠르기는 그 목소리 기본값(문서대로).
2. **`[data-source]`**: `Modal` 이 data 속성을 받지 않아 창 몸통 `div.vs__wrap[data-source=script|subs]` 에 둠. 창 클래스는 `.modal.wide.script-voice.vs.vs--{phase}`.
3. **「원래대로」(자막 탭)**: `readTextPatch(sub, '')` 만으로는 제안(readFix)이 남아 화면 글과 계속 달라 단추가 안 없어짐 → `readFix: []`(제안 끔)까지. 빈 배열이라 다음에 창을 열어도 제안 자동 적용이 다시 걸리지 않음. 대본 탭은 읽는 글 = 화면 글 + 제안 비움.
4. **자막 탭 제안 자동 적용**: 이미 음성이 있는 자막은 뺀다(적용하면 그 음성이 바로 「다시 생성 필요」가 되므로).
5. **예상 길이(자막 탭)**: 길이 예측은 다듬기 전 길이라 그대로면 「길어요」가 잘못 뜬다(실측: 예상 2.8 s → 만든 뒤 1.9 s). 예상 = 예측 − `TRIM_EST_SEC`(0.75 s) ÷ 빠르기. 0.75 = 실측 80개(목록 10 × 문장 4 × 빠르기 2)의 (원본 − 다듬은 길이) × 빠르기 중앙값(0.29 ~ 1.43, p10 0.49 · p90 0.95).
6. **길이 맞추기 「속도 올리기」**: 다듬은 길이는 빠르기에 정확히 반비례하지 않는다(모델이 붙이는 앞뒤 무음 길이도 같이 바뀜 · 잡음 길이가 달라짐). 계획 빠르기로 만든 결과가 목표를 넘으면 그 결과 길이로 다시 셈해 최대 2번 더 만든 뒤 바꾼다(실측: 계획 1.09 로 3.27 s 넘침 → 1.11 로 3.12 s, 최종 실행에서는 1.17 로 3.05 s). 그래서 §4.1 「속도 = 계획값」은 「계획값 이상(넘칠 때만 더)」으로 시험을 고침. 화면의 「1.02 → 1.09」 표기는 planSpeedFix 그대로.
7. **창 높이**: 넓은 화면(> 900)에서 `height: min(728px, 100vh − 40px)` 고정 — 탭 · 동의 판을 바꿀 때 창이 출렁이지 않게. 세부 설정을 펼치면 왼쪽 열만 안에서 스크롤(몸통 스크롤 0 유지).
8. **목소리 카드 DOM**: 고르기 카드 10개 → ▶ 10개 순서로 두고 격자 자리(CSS 변수)로 배치 — §3.8 Tab 순서 「고른 카드(roving) → 카드 ▶ 들」을 지키려고. 그래서 `div.vs-voice` 감싸개 대신 카드 단추 자체가 `.vs-voice.vs-voice__pick[data-voice]`(`.is-selected` · `.is-playing`), ▶ 는 `.vs-voice__play[data-voice]`.
9. **동의 판 초점**: 주 단추가 체크 전에는 비활성이라 동의 체크 칸으로(체크 뒤 Tab 한 번에 주 단추).
10. **대본 칸 rows 4 · 카드 높이 42 px**(문서 5 · 44): 1366×768 한 화면(문서 §3.3 「넘치면 rows 5 → 4 부터」).
11. **자막 탭 완료 배지**: 「완료 · 2.9 초 / 자막 2.6 초」 한 배지(.ok, 넘치면 .warn + 「· 길어요」).
12. **MP3 재생**: `fetch` → blob 주소(서비스 워커 캐시 · 범위 요청과 무관하게 오프라인에서도 같은 소리). 「10개 이어 듣기」는 각 목소리 기본 빠르기 MP3(파일이 없고 모델이 있으면 그 목소리를 합성).
13. **375 바닥**: 1줄 = 넣는 방법 세그 + 안내(두 줄까지, 넘치면 말줄임 · 전문은 title), 2줄 = 닫기 · 먼저 들어 보기(아이콘) · 주 단추(flex 1).
14. **`chunkGap`(120자 조각 사이 0.3 s)는 그대로** — 지시 범위(대본 쉼 · 다듬기) 밖. 자막 묶음이 120자를 넘는 경우에만 쓰임.
15. 받는 중 창을 닫으면 받기는 계속되지만 다 받은 뒤 자동 만들기는 하지 않는다(창이 열려 있을 때만 이어 함).

## 시험 결과(최종 실행 — 개발 서버 8871, 빌드본 8872, 모델 캐시 profile-v-tts)

| 시험 | 결과 | 메모 |
|---|---|---|
| `tsc -b` | 0 오류 | |
| `npm run test:unit` | 23 묶음 모두 통과(새 trim 10 · script 35) | trim 은 파이썬 numpy 기준값 4개와 표본까지 같음 |
| x-script-voice | **33/33** | 다듬기 앞 0.05 · 뒤 0.10 s(5문장 모두) · 쉼 0.450/0.450/0.900/0.450 · 같은 대본 다시 = 캐시 5 · 합성 0회 · Ctrl+Enter = 만들어 넣기 · 토스트 되돌리기 → 6 → 5 → 다시 실행 6 |
| v-tts | **38/38** | 받기 창 체크 하나(두 키 기록) · V → 자막 탭 · MP3 들어 보기(동의 전) · AI 고지 키 없는 옛 사용자 → 같은 창 동의 판 → 자동 이어 만들기 · 예상 길이 · 변경된 음성 바로 다시 만들기 · Whisper CER 0.00 |
| w-tts-conflict | **21/21** | 예상 「길어요」 → 만들어 넣기 한 번 → 길이 맞추기 창 → 「적용」 바로 바꿈(계획 1.09 → 다시 맞춰 1.17, 3.05 s ≤ 3.2 s) |
| zv-offline-tts | **5/5** | 외부 막힘에서 합성(옛 숨김 목소리 F1) + 미리 듣기 샘플 디코드 |
| i-keys-guides | **48/48** | keymap · README 표 그대로 |
| zw-voice-samples(새) | **15/15** | 아래 「샘플 회귀」 |
| zx-voice-clicks(새) | **10/10** | 아래 「클릭 수 실측」 |
| t-record · s-audio-roles · f-ime-keys · af-inspector-plus · e-regressions · z-offline | 21/21 · 21/21 · 9/9 · 36/36 · 10/10 · 10/10 | 영향 확인(더빙 · 상태 줄 · 키 · 속성 칸 · 오프라인) |
| `npm run build` | 성공 | `dist/sw.js` 미리 캐시에 `./voices/voices.json` + MP3 10개 |
| d-build-smoke(8872) | **11/11** | 새 2항목: 미리 캐시 목록 · 빌드본 창 카드 10개 · 「여성 3 들어 보기」 같은 출처 MP3 |
| 캡처 `_voice-shots.mjs` → `tests/out/voice-ui-shots-after/` | 1366 어두운 · 밝은, 375 | 가로 넘침 0(전부), 1366 창 1120×728 몸통 스크롤 0(모든 상태 · 세부 설정 펼침 포함), 375 바닥 113~115 px(두 줄) · 몸통 스크롤은 허용(≤ 900 규칙) |

## 클릭 수 실측(`tests/e2e/zx-voice-clicks.mjs`, 클릭 1 = 키 1, 글자 입력 · 기다림 안 셈)

| 일 | 지금(문서 §1) | 목표(§5) | **실측** | 비고 |
|---|---|---|---|---|
| (a) 처음 쓰는 사람 대본 → 넣기 | 8 | 4 | **4** | ⇧V · 만들어 넣기 · 동의 체크 · 받고 계속하기. 열면 대본 칸에 초점(0), 받은 뒤 다시 누르지 않아도 만들어 넣고 창 닫힘. 모델 캐시에서 작은 파일(tts.json 8 KB)을 지워 실제로 이어 받게 함(400 MB 반복 금지) — 화면은 「이어 받고 계속하기」 |
| (b) 모델 있음 · 자막 3개 | 8(두 번째부터 7) | 2 | **2** | V · 만들어 넣기 |
| (b′) 모델 있음 · 대본 | 3~5 | 2 | **2** | ⇧V · 만들어 넣기(Ctrl+Enter 도 같음) |
| (c) 목소리 10개 비교 | 11(모델 없으면 불가) | 1 | **1** | 「10개 이어 듣기」 → 남성 1 → … → 여성 5 순서 10개, 모델 동의 전 · 70 s |
| (d) 음성 하나 다시 만들기 | 4~5 | 3~4 | **4** | 블록 · 「음성」 탭 · 다시 만들기(다 되면 자동 재생) · 바꾸기. 속성 칸 탭이 이미 「음성」이면 3 |
| (d′) 변경된 음성 다시 만들기 | 5~6 | 2 | **2** | 「보이스」 탭 · 단추(창 없이 바로) |

## 샘플 회귀(`tests/e2e/zw-voice-samples.mjs`) — 앱 엔진 경로 ↔ 샘플

- 조건 일치: `voices.json` 의 판 · 글 · 씨앗 7 · 8단계 · 다듬기(0.05/0.10) = 앱 상수, 목록 10개 = 샘플 10개.
- **wasm 경로**(샘플 기준, R6): 길이 10/10 표본까지 같음, 번들 MP3(64 kbps)와 정규화 상관 0.9965 ~ 0.9986(어긋남 0). `pcm16_sha256` 은 0/10 같음.
- sha 가 다른 까닭(한 번 확인): 샘플 스크립트와 같은 경로(`lab/synth.py` + `v32_samples.trim_silence`, 파이썬 ORT CPU)로 10개를 한 번 다시 만들어(낮은 우선순위 · 2스레드, 출력은 작업 폴더 밖 scratch) 정확한 int16 을 얻음 → 그 sha 는 `voices.json` 과 10/10 같음(샘플 재현 확인). 앱 wasm int16 과 견주면 **상관 1.0000000(10개 모두) · 최대 차 1 ~ 8 LSB · 다른 표본 0.8 ~ 8.9 % · SNR 72.7 ~ 85.2 dB** — 파이썬 ORT ↔ onnxruntime-web wasm 의 부동소수 끝자리 차이가 int16 반올림 경계에서 1 LSB 씩 나는 것. 소리는 같음.
- **WebGPU 경로(참고)**: 같은 조건에서 wasm 과 파형 상관 0.56 ~ 0.89, 다듬은 길이 차 최대 2205 표본(0.05 s). 커널 정밀도 차이가 8단계 흐름 · 보코더를 지나며 커짐. 앱은 WebGPU 가 되면 WebGPU 로 만들므로, 「들어 보기」가 MP3 일 때(기본 빠르기)와 빠르기를 바꿔 합성할 때 소리가 미세하게 다를 수 있음 → 남은 문제.

## 남은 문제

- **목소리는 자동 지표로 확정, 사용자 청음 전**: 이름 · 설명은 측정값에 맞춰 일부 바꿈(남성 2 「중음」 · 남성 3 「중저음」 · 여성 2 「또렷하고 안정적인 중저음」 · 여성 3 「부드럽고 따뜻한 중음」). 청음 뒤 바뀌면 위 순서대로.
- **WebGPU ↔ wasm 차이**(위 표): 청음으로 「같은 목소리」로 들리는지 확인 필요. 필요하면 미리 듣기 합성만 wasm 으로 고정하는 선택지가 있음(느려짐).
- 자막 탭 예상 길이는 어림(±0.4 s 안팎). 만든 뒤 배지 · 길이 맞추기 창이 실제 길이로 다시 판단한다.
- 길이 맞추기 「속도 올리기」가 다시 맞출 때 빠르기가 계획값보다 조금 높아질 수 있음(화면의 「→ 1.09」 표기는 계획값).
- 받기 오류 · 받기 취소 · 대기열(HEAVY) 표시는 코드 경로만 있고 e2e 로 일부러 일으켜 보지는 않음(v-tts ① 의 받기 창 취소 · 이어 받기는 그대로 통과).
