# 모아컷이 쓰는 오픈소스와 무료 자료

모아컷 자체 코드는 MIT 라이선스예요(`package.json`). 아래 자료는 각자의 라이선스를 따라요.

## 앱에 함께 배포되는 것(dist)

| 이름 | 판 | 라이선스 | 쓰임 |
|---|---|---|---|
| React · React DOM | 19.3.0 | MIT | 화면 |
| zustand | 5.0.15 | MIT | 편집 상태 · 실행 취소 기록 |
| fflate | 0.8.2 | MIT | 백업 묶음 .moacut.zip 쓰기 · 읽기(압축 없음, 스트리밍) |
| lucide-react | 1.53.0 | ISC | 아이콘 |
| @ffmpeg/ffmpeg · @ffmpeg/util | 0.12.15 · 0.12.2 | MIT | ffmpeg.wasm 연결부 |
| **@ffmpeg/core**(단일 스레드) | 0.12.10 | **GPL-2.0-or-later**(FFmpeg + libx264 등) | 영상 해독 · 합성 · H.264/AAC 인코딩. `public/ffmpeg/`에 그대로 넣어 배포해요. 원본 소스: https://github.com/ffmpegwasm/ffmpeg.wasm (core 0.12.10), FFmpeg https://ffmpeg.org, x264 https://www.videolan.org/developers/x264.html |
| @huggingface/transformers | 3.8.1 | Apache-2.0 | 기기 안 음성 인식(Whisper) · 모델 번역(크롬 번역이 없는 브라우저) |
| Silero VAD v5 모델(`public/models/silero_vad.onnx`, 2.3 MB — pysilero-vad 2.1.1 에 든 판) | v5 | MIT(Silero Team · 포장 Michael Hansen) | 자동 자막에서 말소리 구간 찾기(배경음 · 잡음이 있어도) — `licenses/vad/MIT-silero-vad.txt` |
| onnxruntime-web | 1.22.0-dev.20250409-89f8206ba4(Transformers.js 3.8.1이 고정한 판, AI 보이스용 직접 의존성도 같은 판) | MIT | 음성 인식 · AI 보이스 실행기(WASM · WebGPU). wasm 파일은 dist/assets에 로컬로 들어가요 |
| Supertonic web helper 이식(`src/engine/tts/korean.ts` · `src/engine/audio/wav.ts`) | supertonic@1e9799e | MIT(Copyright (c) 2025 Supertone Inc.) | AI 보이스 글 전처리 · WAV 쓰기 — `licenses/tts/MIT-supertonic-code.txt` |
| @huggingface/jinja | 0.5.10 | MIT | Transformers.js 내부 |
| 송쌤과학 목소리 모델(`models/songsam_ko.onnx` · `songsam_ko.json`, 미리 듣기 `voices/ss-*.mp3`) | 학습 중 판(앱 목록에 「학습 중 · ○번째 바퀴」 표시) | 송쌤과학 자체 학습 — 바탕 체크포인트 Piper `libritts_r/medium`(**LibriTTS-R, CC BY 4.0**, Koizumi et al. 2023, rhasspy/piper-checkpoints) · 학습 재료 목소리 Qwen3-TTS(Alibaba Qwen, Apache-2.0) · 읽힌 문장은 직접 지은 글 | AI 보이스 「송쌤과학 목소리」(가상 목소리, 실제 사람 녹음 · 복제 아님) |

> ffmpeg.wasm 코어는 GPL이라, 모아컷을 다시 배포할 때는 이 표의 원본 소스 주소를 함께 알려야 해요. 모아컷은 코어를 고치지 않고 받은 파일 그대로 써요.

## 실행할 때 내려받는 무료 자료(저장소에는 없음)

| 자료 | 받는 곳 | 라이선스 |
|---|---|---|
| UI 글꼴 Pretendard 1.3.9(400 · 500 · 600 · 700 woff2) | 앱에 포함(`public/fonts/pretendard/`, 라이선스 `LICENSE.txt` · `licenses/fonts/pretendard.txt`) | SIL OFL 1.1 |
| 자막 글꼴 30종 | cdn.jsdelivr.net · hangeul.pstatic.net | 글꼴마다 다름 — [docs/FONTS.md](docs/FONTS.md) · `licenses/fonts/` |
| Whisper base(onnx-community/whisper-base) | huggingface.co | Apache-2.0(openai/whisper-base) |
| Whisper small(onnx-community/whisper-small) | huggingface.co | Apache-2.0(openai/whisper-small) |
| Whisper large-v3-turbo(onnx-community/whisper-large-v3-turbo, WebGPU 전용 선택지) | huggingface.co | MIT(openai/whisper-large-v3-turbo) |
| AI 보이스 Supertonic 3(supertone-oss-archive/supertonic-3 @ aafc6e3, ONNX 4개 + JSON 12개, 401 MB) | huggingface.co | BigScience OpenRAIL-M(사용 제한 · AI 생성 고지) — `licenses/tts/` |
| 자막 번역 모델 M2M100 418M(Xenova/m2m100_418M, 8비트, 약 638 MB) — **크롬 기기 안 번역이 없는 브라우저에서만** | huggingface.co | MIT(facebook/m2m100_418M) |

크롬에서는 번역에 크롬 내장 기기 안 번역(Translator API)을 써요. 언어 팩은 모아컷이 아니라 **크롬이 직접** 받아 관리해요(언어 쌍마다 처음 한 번, 글은 기기 밖으로 나가지 않음).

모델 파일은 처음 쓸 때 한 번 받아 브라우저 Cache Storage(`transformers-cache` · AI 보이스는 `moacut-tts-v1`, sha256 확인)에, 통짜 글꼴은 `moacut-fonts-v1`에 보관해요. 영상 · 음성 · 자막은 어디에도 보내지 않아요.

## 기본 소재(소재 자료실, `public/library/`)

앱과 함께 배포되는 그림 · 효과음 · 배경음이에요. 모두 상업적 이용 · 수정 · 자료실 형태 재배포가 허용된 것만 넣었고, 항목마다 제작자 · 원본 페이지 · 확인한 날짜 · 확인 근거가 `public/library/catalog/*.json` 에 있어요. 전체 목록과 확인 근거: [docs/v4/ASSETS.md](docs/v4/ASSETS.md).

| 묶음 | 제작자 | 라이선스 | 원본 · 확인 근거 |
|---|---|---|---|
| 직접 제작 그림 · 효과음 · 배경음(`*-self-*`) | 송쌤과학(직접 제작) | CC0 1.0(`licenses/CC0-1.0.txt`) | 이 저장소 `tools/library/make-self-assets.mjs`(수식 합성, 외부 음원 · 샘플 없음) · `tools/library/svg/*.svg`(손으로 쓴 SVG, 글꼴 · 외부 그림 없음) |
| 효과음 37개(`sfx-kenney-*`) | Kenney(www.kenney.nl) | CC0 1.0 | 팩 6개(Interface Sounds · UI Audio · Impact Sounds · Digital Audio · Music Jingles · Sci-fi Sounds) 각 페이지의 「License: Creative Commons CC0」와 압축 안 License.txt 확인. OGG 를 WAV 로 바꾸고 앞뒤 무음을 잘라 크기를 맞췄어요 |
| 배경음 21곡(`bgm-oga-*`) | Kistol · Trex0n · MintoDog · Scribe · CodeManu · Agecaf · KiluaBoy · Cleyton Kauffman · Joth · extenz · Emma_MA · Mopz · Écrivain · Aureolus_Omicron · isaiah658 · TinyWorlds · Juhani Junkala | CC0 1.0 | opengameart.org 각 곡 페이지의 License(s) 칸이 CC0 하나뿐인 것만(압축 안 글도 확인). MP3 128 kbps 로 바꿨어요 |
| 클래식 배경음 6곡(`bgm-wm-*`) | 연주 Kimiko Ishizaka · Luke Faulkner(Musopen) · 미국 공군 군악대 · 미국 해병대 군악대 / 작곡 바흐 · 쇼팽 · 파헬벨 · 엘가 · 홀스트 | 연주 녹음 CC0 1.0(3곡) · 퍼블릭 도메인(미국 정부 저작물, 3곡) — 작곡은 모두 공유 저작물 | 위키미디어 공용 각 파일 페이지의 라이선스 틀(`{{cc0}}` · `{{cc-zero}}` · `{{PD-USGov-…}}`). 긴 곡은 유명한 대목만 잘라 MP3 128 kbps 로 바꿨어요 |

CC0 와 퍼블릭 도메인은 출처 표기 의무가 없지만, 앱의 「출처 목록」에서 권장 문구(`credit.text`)를 복사할 수 있어요. 사용자가 불러온 파일에는 이 표시가 붙지 않아요.

## 개발 · 시험에만 쓰는 것(배포에 들어가지 않음)

| 이름 | 판 | 라이선스 |
|---|---|---|
| Vite · @vitejs/plugin-react | 7.3.7 · 5.2.0 | MIT |
| TypeScript | 5.9.3 | Apache-2.0 |
| playwright-core(설치된 Chrome으로 E2E 시험) | 1.64.0 | Apache-2.0 |
| ffmpeg-static(시험 미디어 만들기 · 결과 검사) | 5.3.0 | GPL-3.0-or-later(ffmpeg 바이너리) |
| ffprobe-static(결과 검사) | 3.1.0 | MIT(바이너리는 FFmpeg 라이선스) |

`npm audit`가 알리는 6건(sharp · onnxruntime-node · global-agent 계열)은 Transformers.js의 **Node.js 전용** 선택 의존성이에요. 브라우저용 빌드(dist)에는 들어가지 않아요.
