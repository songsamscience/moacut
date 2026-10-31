# 모아컷 v3 최종 자동 검사 결과 (2026-10-09)

환경: macOS · Google Chrome(headless, playwright-core) · 개발 서버 `:8871`(d-build-smoke 만 `vite preview :8872` 빌드본) · 주 해상도는 suite 기본값.
게이트: `npx tsc -b` 깨끗 · `node tools/unit.mjs` **19 파일 627 통과 / 0 실패**.

## 1. suite 결과

| suite | 결과 | 비고 |
|---|---|---|
| a-cut-export | 23/23 | |
| aa-keyframes | 13/13 | |
| ab-mosaic-solid | 9/9 | |
| b-auto | 20/20 (다시) | 첫 실행은 4 s 만에 중단 — Vite 가 `@huggingface/transformers` 를 처음 미리 묶으며 페이지를 새로 고침(「optimized dependencies changed. reloading」). 개발 서버 전용 흔들림, 다시 돌려 통과 |
| c-scene-project | 19/19 | |
| d-build-smoke | 9/9 | `npm run build` → `vite preview :8872` |
| e-regressions | 10/10 | |
| f-ime-keys | 9/9 | |
| g-transitions-limiter | 16/16 | |
| h-mosaic | 18/18 | |
| i-keys-guides | 48/48 | |
| j-mosaic-shapes-scale | 18/18 | |
| k-linking | 26/26 | |
| k-mosaic-ui | 15/15 | |
| l-runs-export | 27/27 | 480 · 720 · 1080p |
| l2-navigation | 29/29 | |
| m-transform-export | 25/25 | |
| n-autosave | 20/20 (고침 뒤) | 첫 실행 19/20 — 아래 「고친 것」 |
| o-migrate | 13/13 | |
| p-proxy-time | 16/16 | |
| q-proxy-quality | 9/9 | |
| r-pip-export | 24/24 | |
| s-audio-roles | 21/21 | |
| t-record | 21/21 | 가짜 마이크 장치 |
| u-4k | 11/11 | |
| v-tts | 35/35 | |
| w-tts-conflict | 20/20 | |
| z-offline | 10/10 | |
| zv-offline-tts (새) | 4/4 | 외부 차단 상태 AI 음성 생성 |
| zz-all-res | 22/22 | 480 · 720 · 1080 · 2160p 전체 회귀 |

합계 30 suite · **560 / 560 통과**(흔들림 1건 다시 실행 · 낡은 시험 1건 수정 뒤).

### 고친 것
- `n-autosave` 「미리보기: 보관 소리 자산이 blob 주소로 재생」: w2-audio 부터 자산 소리(녹음 · AI 음성)는 `<audio>` 가 아니라 소리 그래프(blob 주소 → decodeAudioData → AudioBufferSourceNode, A §4.1)로 재생 — 시험이 옛 `sndEls` 를 읽어 빈 배열. 의도된 동작 변화라 시험을 새 경로(그래프 voice · 버퍼 길이 0.6 s · `db.peekAssetUrl` = blob:)로 바꿈. 앱 코드 변경 없음.
- `tests/e2e/lib.mjs`: 망 감사용으로 `launch()` 한 모든 브라우저 요청을 `tests/out/e2e/net-<suite>.json`(바깥 호스트별 메서드 · 개수)에 남김. 판정 변화 없음.
- 새 `tests/e2e/zv-offline-tts.mjs`: v-tts 프로필(모델 캐시)로 `--host-resolver-rules` 차단 → `tts.sampleVoice('F1')` 실제 PCM 150 634 표본(3.4 s) · RMS −25.8 dB · 네트워크 응답 0 · 실패 0.

## 2. 망 감사(요청 기록 기준)
- 바깥 요청은 **모두 GET**, 호스트는 정적 파일뿐: `cdn.jsdelivr.net`(a-cut-export 34건 — 자막 글꼴 파일), `huggingface.co` · `us.aws.cdn.hf.co`(v-tts 23건 — 라이선스 동의 뒤 TTS 모델 파일), `example.com`(z-offline · zv 의 「막혔는지」 탐침 1건, 차단됨). 나머지 suite(d-build-smoke 포함) 바깥 요청 0(모델 · 글꼴은 프로필 캐시). POST · PUT 등 본문 있는 바깥 요청 0 → 사용자 미디어 업로드 · 유료/원격 API 호출 없음.
- d-build-smoke(빌드본): 요청 71 · 바깥 0.
- z-offline ② 차단 단계: 외부 주소 요청 8건 전부 서비스 워커 캐시 응답 · 네트워크 응답 0 · 실패 0. zv-offline-tts: 바깥 응답 0.
- 한계: lib 기록은 페이지 · 컨텍스트 요청만(서비스 워커 자체 fetch 는 z-offline 만 `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS` 로 봄).

## 3. 사용자 검증 항목(BRIEF §1) → 근거

| 항목 | 근거(suite · 검사) |
|---|---|
| 순서 변경 시 연결 자막 · 사진 · 효과음 함께 이동 | k-linking: B 를 앞으로 끌기 → 연결 자막 1.0~3.5 함께 · 출력 ② 자막 PNG 상관 1.00~3.50(±1프레임) · 로고 첫 프레임 = B 새 시작 + 0.5 s(15 ±1) · 효과음 onset = B + 1.5 s ±10 ms |
| 고정 배경음악 불변 | k-linking: 순서 바꾸기 전 · 뒤 출력 PCM 상관 1.0000 · 어긋남 0 · att 고정 0초 그대로 |
| 프록시 편집 뒤 원본 기반 1080p 정상 | q-proxy-quality: 성능 우선(사본 540p) 편집 → 1920×1080 · 90프레임 · 화질 우선 출력과 같은 프레임(PSNR ∞) · 원본 대비 42.83 dB vs 사본 확대 33.40 dB. p-proxy-time: 사본으로 볼 때도 출력 프레임 = 원본 |
| 부분 강조 출력 | l-runs-export: 480/720/1080p 강조 낱말 #ffe14d ±8 · 굵게 = Pretendard 700 잉크 · 미리보기 vs 출력 < 2/255 |
| PIP 출력 | r-pip-export: PIP · 로고 · 도형 경계 = layerPx ±2 · 반투명 섞기 · PIP 동기 시간 · 소리 onset ±10 ms · 음소거 −120 dB |
| 키프레임 출력 | aa-keyframes: 프레임 0/45/89 = clipPx(±0) · 애니 자막 알파 미리보기 0.537/0.533 vs 출력 0.540/0.533 · 무음 컷 뒤 한 곡선(480p). r-pip-export: 키 있는 레이어 sendcmd 경계 ±3 px |
| 모자이크 출력 | h-mosaic · j-mosaic-shapes-scale(모양 5 · 블러/픽셀 · 추적, 미리보기 = 출력) · ab-mosaic-solid(가리기 709 색 ±3 · 손 키 경로 ±0) · zz-all-res(해상도별 가리기 넓이 · 가운데 ±3, 흐림) |
| 한국어 음성 WAV · MP4 모두 재생 | v-tts: WAV 44.1 kHz 모노 16-bit · 길이 = 측정값 · RMS −27 dB · Whisper CER WAV 0.00 / MP4 구간 0.00 · 720p PCM 상관 1.000 |
| 긴 음성 안 잘림 · 안 겹침 · 조정 가능 | w-tts-conflict: 충돌 → 길이 맞추기 창 · 속도 1.05 → 1.54(3.20 s ≤ 자막) · 시간 늘리기 목록 = 실제(±1/60 s) · 컷에 걸친 음성 길이 그대로 · MP4 말끝 −27.5 dB(WAV 와 같음) · 내보내기 전 미해결 충돌 확인 |
| 자막 수정 뒤 그 음성만 재생성 | v-tts: 1개 수정 → stale 1개 → ④ 재생성 · 그 음성만 새 assetId · 나머지 2개 그대로 · seed 유지 |
| 프로젝트 복원 뒤 생성 음성 재사용 | v-tts: 새로 고침 → 같은 assetId · 보관함 파일 · 480p PCM 상관 1.000. n-autosave: 묶음(.moacut) 내보내기 · 열기 → 자산 sha256 일치 · MP4 에 자산 소리 |
| 480 · 720 · 1080p 에서 새 기능 유지 | zz-all-res: 한 프로젝트(연결 자막 강조 · 변형 클립 · PIP + 로고 · 키 사진 · 애니 자막 · 가리기 + 흐림 · 녹음 내레이션 덕 · 고정 음악) 480/720/1080/2160 → 크기 · 90프레임 · 강조색 · 경계 ±0 · 모자이크 · 소리 48 kHz 2ch. l-runs-export 3해상도 |
| 유료 API 호출 · 사용자 미디어 업로드 없음 | §2 망 감사(30 suite 바깥 요청 GET 만 · 정적 호스트만) · a-cut-export · v-tts · d-build-smoke 의 바깥 요청 검사 |
| 외부 네트워크 차단 상태 | z-offline: 차단 확인 → 보관함 열기 · 나누기 · 새 글자 fontsource 자막 · 720p 출력 · 네트워크 응답 0. zv-offline-tts: 차단 상태 AI 음성 생성 실제 PCM |
| 녹음 더빙 | t-record: 권한 · 장치 목록 · 입력 막대 · 헤드폰 안내 · 카운트다운 3-2-1 · 클릭 출력 −2.9 ms · 다시 녹음 = 같은 항목 · 끊김 실패 시 이전 유지 + 원인 · 할 일 · ⇧R 더빙 3줄 · 큰 읽을 문장 · 긴 줄만 충돌 1.7 s · 출력에서 안 잘림 · 첫 줄 시작 3.1 ms. s-audio-roles: 혼합 모드(only −120 dB · 덕 −12.04 dB). n-autosave: 녹음 자산 보관 · 묶음 · MP4 |
| 4K(2160p) | u-4k: 사양 확인(가능 · 예상 시간 · 용량) · deviceMemory 4 → 불가 + 이유 · 10초 3840×2160 300프레임 · 9:16 2160×3840 · 1:1 2160×2160 · 확대 경고 · 원본에서 출력. zz-all-res 2160p |

## 4. 미검증
- **실제 마이크 · 사람 목소리** 녹음/더빙(Chrome 가짜 장치 `--use-fake-device` 톤만), 헤드폰 실제 되울림.
- **Chrome 이외 브라우저**(Edge · Safari · Firefox) — 이번엔 Chrome 만 돌림(`MOACUT_BROWSER=edge` 는 있으나 안 돌림).
- **WebGPU 경로**: 자동 자막은 WASM 만(b-auto 기본) — WebGPU 장치 선택 미실행.
- **오프라인 자동 자막(Whisper)** — 차단 상태 편집 · 글꼴 · 출력 · AI 음성만 확인.
- **서버를 끈 채 빌드본을 서비스 워커 셸 캐시로 부팅** — d-build-smoke 에 해당 검사 없음.
- **AI 음성 1080p · 2160p 출력**(720p · 480p 만). 더빙 음성의 컷/무음 삭제 뒤 위치 재계산은 단위 시험(voice · audioops)만, e2e 는 AI 음성(w-tts-conflict)으로만.
- **zz-all-res 의 키 사진 · 애니 자막**은 프로젝트에 들어가 출력되지만 해상도별 픽셀 판정은 없음(키프레임 픽셀 판정은 aa-keyframes 720/480p).
- **실제 저사양 기기 4K 판정**(deviceMemory 를 바꿔 흉내만), 수십 분 길이 영상의 메모리 · 속도, 자동 자막 · TTS · 고해상도 인코딩 동시 실행 관리(e2e 없음).
- **브라우저 데이터 실제 삭제 뒤 복구**(같은 브라우저에서 묶음 다시 열기만 확인).
- 사람 눈으로 본 화면 품질 · 사용성.
