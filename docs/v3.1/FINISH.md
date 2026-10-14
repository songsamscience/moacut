# v3.1 마무리 체크리스트(끊기면 여기서 이어서)

브랜치 `v3.1/integrate`(worktree ~/Projects/moacut-wt/integrate, 서버 8877) = overlay + ui + script-voice + voiceShift.

- [x] 합치기 overlay → ui → voice, tsc · unit 통과(2026-10-10)
- [x] 합친 뒤 e2e 9개 통과(ac · ad · ae · af · r-pip · i-keys · g-trans · k-linking · zz-all-res)
- [x] Fable 다듬기 1회(대본 창 · 문장 줄 위계 · LayerPanel 분류 탭 · 겹침 줄 · + 메뉴 · 소리 창), 캡처 ≤ 2회
- [x] 전체 e2e 한 번(33개 통과 — r-pip 탭 선택자 고침, b-auto 첫 실행 흔들림 재실행 통과)(`tests/out/run-all.sh` → tests/out/all-summary.txt), 실패만 고치기
- [x] `npm run build` + d-build-smoke 9/9(로컬 8872 · 실주소)
- [x] main 합치기(91a1112) · 0.4.0 · OneDrive 동기화 · GitHub Pages 8987865(2026-10-10, 사용자 허락)
- 학생 목소리: credible=false(남 19.9세 · 여 21.1세, ~/Projects/moacut-voice-lab/out/student_challenge.md). 앱은 「대학생 남/여(가상)」만. 학생 카드는 청음 승인 뒤 student 목소리를 표에 넣으면 나타남.
- Qwen3-TTS: 사용량 때문에 이번엔 실행 안 함(검토 미완).
