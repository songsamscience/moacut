# 모아컷 v3.1 구현 기록 — voice(대본으로 AI 보이스)

브랜치 `v3.1/script-voice`(worktree ~/Projects/moacut-wt/voice, v3.1/integrate 기준). 2026-10-10.

## 만든 것
- **생성 로직 분리** `src/engine/tts/providers/`: `TtsProvider` 계약(id · 이름 · 라이선스 · kind · modelRev · voices · capability · load · estimate · synthesize · release) + Supertonic 3 구현(기존 ttsEngine/Worker 감쌈). 다른 모델은 계약 자리만.
- **목소리 표** `src/engine/tts/voices.ts`: `college-m` 「대학생 남(가상)」 · `college-f` 「대학생 여(가상)」(recipes.json 가중치 · 빠르기, 자동 지표 추정 나이 약 20세) + 기본 10개. 섞기 = style_ttl · style_dp 원소별 가중합 ÷ 가중치 합(Worker). `group: 'student'` 자리는 있으나 비어 있음 → 대본 창의 남학생 · 여학생 카드는 안 보임. 자막 마법사도 가상 2개를 맨 앞에서 고름.
- **후처리 자리** `src/engine/audio/voiceShift.ts`: `applyVoiceShift(pcm, sr, shift)` — shift ≠ 1 이면 오류(알고리즘은 따로). provider 가 합성 직후 부르고, 캐시 키(voiceKey)에 shift 포함.
- **읽기 규칙** `reading.ts`: 숫자 뒤 V · A · mA · W · kW · Ω · J · N · Pa, 소문자로 시작하는 약어(pH), 등식(F=ma → 에프 이퀄 엠 에이), 제N법칙 · 단원 · 과 · 절 · 편.
- **대본 창** dialog `'script-voice'`(`⇧V` · 머리 막대 「AI 보이스」, `src/ui/ScriptVoiceUi.tsx`, 흐름 `src/app/scriptVoice.ts`): 문장 나누기 + 읽기 제안 자동 적용(읽는 글 고치기), 문장 상태(대기 · 만드는 중 · 완료 · 저장된 결과 · 실패 이유), 문장 듣기 · 다시 만들기(새 씨앗) · 실패한 문장만 다시 · 전체 이어 듣기 · 취소. HEAVY 'tts' 작업 하나. 모델 없으면 라이선스 · 받기 창, 미지원이면 ttsCapability 사유.
- **결과 캐시** `src/app/ttsCache.ts`: IndexedDB `moacut-tts-cache`(프로젝트 DB 판은 그대로), 키 = sha1(제공자 · 모델 판 · 정규화 목소리 · 읽는 글 · 빠르기 · 단계 · 씨앗), 300개 · 150 MB 넘으면 오래 안 쓴 것부터. 기본 씨앗 = 읽는 글에서(같은 글 → 같은 소리).
- **넣기** `src/core/script.ts` `insertScriptVoice`(순수, apply 한 번): 「자막도 함께」 = 문장마다 자막(실제 PCM 길이, 쉼 0.3 · 문단 0.6) + replaceVoiceItems(stale · 충돌 · 테이크 그대로), 「음성만」 = 내레이션 한 항목(`AudioItem.aiVoice` → `hasTts` · MP4 고지). 자리를 먼저 확인하고, 자산 보관 실패면 지우고 프로젝트 불변. 영상 없음 · 영상 끝 넘음 = 원인 + 할 일.
- 개발 서버 전용 시험 훅 `scriptDev.failOnce`(import.meta.env.DEV) · `scriptDev.synth`(합성 횟수).

## 시험(포트 8875)
- `npx tsc -b` 깨끗, `node tools/unit.mjs` 전부 통과(새 `script.test.ts` 30, `tts.test.ts` 읽기 규칙 12줄 · 제외 3줄 더함).
- e2e(8875): `x-script-voice` 27/27 — 5문장 첫 생성 2.5 s(4문장 합성, 1문장 강제 실패) · 같은 대본 다시 = 저장된 결과 5 · 합성 0회(317 ms) · 720p 음성 RMS −22.5 ~ −26.5 dB / 무음 −120 dB · 외부 요청 0(모델 캐시 뒤). 모델 Cache Storage 는 출처(포트)마다 따로라 8875 에서는 앱 받기 경로로 1회 받음(22 s).
- 회귀: `i-keys-guides` 48/48 · `w-tts-conflict` 20/20 · `v-tts` 35/35(목소리 칸 12개 + **속성 칸 분류 탭 선택자 `itab('음성' · '글' · '보이스')` 3곳 보충** — ui 병합 뒤 v-tts 가 돌지 않아 WAV 내려받기 단추를 못 찾던 기존 문제).

## 의도한 화면 변화
- 자막 마법사 ② 목소리 칸 10 → 12(가상 2개 맨 앞, 「가상 · AI」 표시). 머리 막대에 「AI 보이스」 단추.
