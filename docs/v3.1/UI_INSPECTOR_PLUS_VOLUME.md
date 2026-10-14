# 모아컷 v3.1 — 속성 칸 길찾기 · 「+」 메뉴 · 소리 크기(dB) 명세

사용자 요청(2026-10-10): ① 소리 크기를 dB 로, 여러 개 한꺼번에 ② 클립을 누르면 옆 속성 칸을 스크롤해야 찾을 수 있어 분류를 고르게 ③ 「+」를 누르면 「화면 전환」과 「영상 끼워 넣기」 중 하나를 고르게.
근거 문서: `docs/UI_SPEC.md` §5(속성 칸 DOM) · `docs/v3/DESIGN_V3_B.md` §9(소리). 구현 기록은 `IMPL_LOG_ui.md`. 캡처 `tests/out/shots-ui/`(tools/ui-shots.mjs).

---

## 1. 요약(고른 안)

| 요청 | 고른 안 | 한 줄 근거 |
|---|---|---|
| 속성 칸 길찾기 | **머리 아래 분류 탭 한 줄**(아이콘 + 짧은 이름, `role=tablist`) — 클립 5 · 소리 4 · 자막 6 · 프로젝트 6 분류, 선택 종류별로 마지막 분류 기억 | 304 px 폭에서 한 줄에 다 보이고, 처음 쓰는 학생이 「소리 · 색감 · 크기·위치 · 전환」을 이름으로 바로 찾는다. 접는 절 · 목차는 여전히 스크롤이 남고, 아이콘 레일은 이름이 없어 학생이 못 알아본다 |
| 「+」 | **작은 메뉴**(화면 고정 좌표, 꼬리) 「화면 전환 넣기」 / 「영상 · 사진 끼워 넣기」 — 끼워 넣기는 보관함 고르기 모드(비었으면 파일 열기) | 두 동작 모두 「그 경계 자리」가 핵심이라 「+」 하나에 둔다. 전환이 있는 경계는 전환 표시가 그대로(「+」 없음) |
| 소리 크기 | **dB 가 주 표기, % 는 작은 보조** · 슬라이더 −30 ~ +12 dB(바닥 = −∞ 무음) · 여러 개 골랐을 때 「똑같이」(바로 적용) / 「지금보다 ±N dB」(적용 단추) · 프로젝트 「소리 크기 한꺼번에」 창(목록 + 일괄 + 고르게 맞추기 자리) | 0 dB = 원래 크기가 모든 곳(클립 · 소리 · 역할 섞기 · 리미터)에서 같은 말이 된다. 측정이 필요한 「고르게 맞추기」는 상태 · 문구만 두고 함수는 다음 단계(§6) |

---

## 2. 속성 칸 분류 탭(공용 틀 `src/ui/InspectorTabs.tsx`)

### 2.1 후보 비교

| 후보 | 장점 | 버린 까닭 |
|---|---|---|
| A. 탭 · 분류 막대(고름) | 이름이 보여 처음 쓰는 학생도 찾음 · 한 분류만 그려 스크롤이 거의 없음 · aria tablist 로 키보드 · 선택 종류별 기억이 자연스러움 | 분류가 7개를 넘으면 두 줄 — 그래서 클립은 「움직임」을 「크기·위치」 안에, 「숨은 요소」를 「자르기」 안에 넣어 5개로 |
| B. 아이콘 레일(세로) | 자리 적게 차지 | 아이콘만으론 「색감」과 「크기·위치」를 못 구분, 말풍선이 필요 |
| C. 접는 절 + 위쪽 목차 | 구조 그대로 | 펼치면 다시 길어져 스크롤이 남고, 접힘 상태를 외워야 함 |
| D. 타임라인 블록 부분(파형 · 전환 표시 · 키) 누르면 그 분류 | 빠름 | 단독으론 발견이 어려움 — A 의 **보조**로만: 전환 표시 · 「+」 메뉴 → 「전환」 분류(구현), 파형 → 「소리」 · 키 표시 → 「크기·위치」(남은 일) |

### 2.2 DOM · 클래스

```
aside.panel.inspector
  div.inspector__head …(그대로)
  div.itabs[role=tablist aria-label="속성 분류"]
    button.itab[role=tab id aria-selected aria-controls tabindex=0|-1 data-tab=id title](.is-active)
      span.itab__icon > svg(16) [+ i.itab__dot]      ← 그 분류에 바꾼 값이 있으면 점
      span.itab__label 「자르기」
  div.inspector__body.itab-panel[role=tabpanel id aria-labelledby data-tab=id]  ← 고른 분류의 절(section)만
```
- `InspectorTabs({ kind, tabs: { id, label, icon, title?, dot?, hidden?, content }[] })`. `hidden` 인 분류는 안 그린다(예: 사진 클립엔 「소리」 없음, 여러 개 고르면 「전환」 없음).
- 기억: `useInspectorUi.tab[kind]`(화면 상태 · 저장 안 함 — 새로 고치면 첫 분류). 기억한 분류가 지금 패널에 없으면 첫 분류. 다른 곳에서 `openInspectorTab(kind, id)`.
- 분류를 바꾸면 몸통 스크롤을 맨 위로.
- 키보드: 탭에 초점 → ← → ↑ ↓ 로 이동 + 바로 열림, Home · End. 전역 단축키 처리기는 `role=tab` 의 화살표를 건드리지 않는다(shortcuts.ts `ownsArrows`).
- CSS `src/styles/inspector.css`: `.itab` flex 1 · 11 px · 활성 = accent 글 + accent-soft 바탕(`.btn.is-active` 와 같은 말). 375 폭에서도 한 줄.

### 2.3 패널별 분류(순서 = 탭 순서, 기본 = 첫 분류)

| 패널 | 분류(id · 이름 · 아이콘) | 안에 드는 절 | 숨김 조건 · 점 |
|---|---|---|---|
| 클립 `kind='clip'` | cut 자르기 Scissors | 자르기(시작 · 끝 · 앞/뒤 자르기 · 분할 · 복제 · 삭제) + 숨은 요소(HiddenSection, 하나일 때) | — |
| | sound 소리 Volume2 | 하나: ClipSoundSection(dB 슬라이더 · 음소거 · 소리 분리) / 여럿: VolumeBatchSection | 하나면 사진일 때 숨김, 여럿이면 소리 나는 클립이 하나도 없을 때 숨김 · 점 = 음소거 · 분리 · 0 dB 아님 |
| | color 색감 Palette | 색감(밝기 · 대비 · 채도 · 필터 · 세기 · 모든 클립에) | 점 = DEFAULT_COLOR 와 다름 |
| | transform 크기·위치 Move | 화면 변형(ClipTransformSection) + 움직임(MotionSection, 하나일 때) | 소리 원본이면 숨김 · 점 = transform 또는 keys |
| | transition 전환 Blend | 화면 전환(TransitionSection) | 여럿이면 숨김 · 점 = transitionIn |
| 소리 항목 `kind='audio'` | place 역할·위치 MapPin | 역할(AudioRoleSection) + 위치 · 길이 | — |
| | sound 소리 Volume2 | 하나: 음량(dB) · 음소거 · 페이드 · 삭제 / 여럿: VolumeBatchSection | 점 = 음소거 · 0 dB 아님 · 페이드 |
| | voice 음성 AudioLines | AudioVoiceSection(+ VoiceStatus) | voice 없으면 숨김 |
| | attach 연결 Link2 | AttachSection | 점 = 시간에 고정 |
| 자막 `kind='subtitle'` | text 글 Type | 글 · 읽을 문장 · 시작 · 끝 · 합치기 · 나누기 · 삭제 · 더빙 녹음 + SRT | — |
| | style 모양 Brush | 글꼴 · 모양(글꼴 · 굵기 · 크기 · 색 · 외곽선 · 그림자 · 상자 · 자간 · 행간 · 정렬 · 위치) | 점 = 기본 대사 모양과 다름 |
| | preset 프리셋 LayoutTemplate | 프리셋 + 내 스타일(MyStylesSection) | — |
| | motion 움직임 Route | MotionSection | 점 = keys |
| | voice 보이스 AudioLines | SubtitleVoiceSection | 점 = 이 자막을 읽는 음성 있음 |
| | attach 연결 Link2 | AttachSection | 점 = 시간에 고정 |
| 프로젝트 `kind='project'` | screen 화면 Monitor | 화면 비율 · 맞춤 · 빈 곳 색 | — |
| | sound 소리 Volume2 | 소리 섞기(MixSection, dB) + 소리 크기 한꺼번에(VolumeAllSection) + 리미터 | 점 = 역할 음량 · 음소거 · 리미터 켬 |
| | markers 마커 Bookmark | MarkerListSection | 점 = 마커 있음 · ⇧M(toggleMarkerList)이 이 분류를 연다 |
| | subs 자막 Captions | SRT 불러오기 · 내보내기 | — |
| | voice 보이스 AudioLines | ProjectVoiceSection(AI 보이스) | — |
| | guide 안내 ListChecks | 순서(steps) + 보관 상태(KeepSection) | — |
| 모자이크 · 마커 · 도구 판 | 탭 없음(짧음) | 그대로 | — |
| 레이어 `kind='layer'` | **이번엔 손대지 않음**(overlay 작업과 겹침) | — | 나중에 적용하는 법 §2.5 |

1366×768 에서 스크롤(캡처 기준): 클립 자르기 · 소리 · 소리 항목 · 여럿 소리 = 없음, 색감 114 px, 크기·위치 313 px(변형 + 움직임), 전환 23 px, 자막 글 271 px, 프로젝트 소리 350 px(역할 6줄 + 한꺼번에 + 리미터). 더 줄이려면 「크기·위치」를 「변형」 · 「움직임」으로 나누거나(탭 6개), 소리 섞기 줄 간격을 줄인다 — 남은 일.

### 2.4 여러 개 골랐을 때
- 클립 여럿: 탭 「자르기 · 소리 · 색감 · 크기·위치」. 「소리」는 VolumeBatchSection(§4.2). 색감 · 변형은 전처럼 고른 것 모두에(`set`).
- 소리 항목 여럿: 「소리」 = VolumeBatchSection, 「역할·위치」는 마지막에 고른 항목 값(기존 동작).
- 자막 여럿: 기존대로(모양 · 프리셋은 모두에, 글 · 시간은 하나일 때만).

### 2.5 레이어 패널에 나중에 적용하는 법(overlay 작업 뒤)
`LayerPanel` 의 `<div className="inspector__body">…</div>` 를 `<InspectorTabs kind="layer" tabs={[…]} />` 로 바꾸고 절을 나눈다: `info` 이름·상태 + 순서 / `place` 배치(ClipTransform 류) + 표시 시간 / `sound` 소리(`DbSlider` 로 `Layer.volume`) / `shape` 도형(kind shape 만) / `motion` 움직임. 다른 파일은 손댈 것 없음. 「소리」 절의 % 슬라이더는 `DbSlider label="음량" gain={l.volume} onChange={(g) => set({ volume: g })}` 한 줄 교체.

---

## 3. 클립 경계 「+」 메뉴(`src/ui/InsertUi.tsx`)

### 3.1 동작
- 「+」(`button.boundary-add`, 전환 없는 경계에만, 영상 줄 위에 마우스를 올리면 보임)를 누르면 메뉴가 열린다. 열린 동안 「+」는 `.is-open`(진하게) · `aria-expanded=true` · `aria-haspopup=menu`.
- 메뉴 `div.menu.boundary-menu[role=menu aria-label="{i}번째와 {i+1}번째 클립 사이"]`(position: fixed, 「+」 위 가운데, 위 공간 없으면 아래 `.is-below`, 꼬리 `::after`):
  - `span.menu__label` 「{i}번째 · {i+1}번째 클립 사이」
  - `button.menu__item[role=menuitem data-kbd=D]` **화면 전환 넣기** / small 「겹쳐 넘기기 0.5초 · 뒤에서 바꿀 수 있어요」 → `setTransition(DEFAULT_TRANSITION)` + 그 클립 고르기 + 클립 패널 「전환」 분류 열기. (단축키 말풍선 D 는 이 항목에 — `+` 단추엔 더 이상 없음)
  - `button.menu__item[role=menuitem]` **영상 · 사진 끼워 넣기** / small 「보관함에서 고르기」 또는(보관함에 영상 · 사진이 없으면) 「파일 열어서 이 자리에」 → §3.2
- 닫힘: Esc(초점을 「+」로 되돌림) · 바깥 mousedown · Tab · 창 크기 바뀜 · 스크롤. 키보드: 열리면 첫 항목에 초점, ↑ ↓ Home End 로 이동, Enter · Space 로 고름.
- 단축키 D(가까운 경계에 전환)는 그대로 — 메뉴 없이 바로 넣는다(keymap 변화 없음).

### 3.2 끼워 넣기 고르기(보관함)
- `useInsertUi.at = index`(끼울 자리). 보관함 위 `div.note.insert-pick-note[role=status]` 「**{i}번째 클립 뒤**에 끼워 넣을 영상 · 사진 카드를 눌러요 · Esc 취소」 + 「파일」(파일 열어 그 자리에) + ✕. 카드 목록은 `.library__list.is-picking`(레이어 고르기와 같은 점선 테두리).
- 타임라인 영상 줄에 `div.drop-mark.is-insert`(끌어 놓을 때와 같은 자리 표시 + 점).
- 카드(썸네일 · 이름)를 누르면 `appendClips(pr, [m], at)`(applyLinked — 끊긴 연결 나눔 안내 그대로) → 새 클립 고르기 + 2초 강조, 고르기 끝. 음악 카드면 안내 토스트. 카드 안 단추(타임라인 · 화면 위에 …)는 제 일을 한다.
- 파일 열기: 임시 `input[type=file]` → `importFiles(files, { at })`(app/media.ts 에 `at` 추가) → 같은 마무리.
- Esc(문서 capture) · ✕ · 다른 카드 없이 끝내기 = `cancelInsertPick()`. 실행 취소로 클립 수가 바뀌어도 index 는 appendClips 가 범위 안으로 맞춘다.
- 맨 앞 · 맨 끝: **「+」를 두지 않는다.** 맨 끝은 카드 「타임라인」 단추 · 끌어 놓기, 맨 앞은 끌어 놓기로 이미 되고, 「+」는 「전환 자리」와 같은 곳이어야 뜻이 맞는다. 필요해지면 `boundary-add` 를 index 0 · n 에도 그리고 메뉴 첫 항목을 비활성(「첫 클립이라 전환 없음」)으로 — 남은 일.

---

## 4. 소리 크기(dB)

### 4.1 표기 · 범위(`src/core/volume.ts`)
- 저장은 그대로 선형 gain(`Clip.volume` · `AudioItem.volume` · `Layer.volume` · `mix.roles[r].volume`). 출력(ffmpeg `volume=`) · 미리보기(GainNode) 변화 없음.
- `DB_FLOOR = −30`(슬라이더 바닥 = gain 0 = −∞) · `DB_MAX = +12` · `GAIN_MAX = 10^(12/20) ≈ 3.98` · `DB_STEP = 0.5` · `DB_OFFSET_MAX = 12`.
- **범위 변화**: `updateAudioItem` · `setRoleMix` 의 상한 2 → `clampGain`(GAIN_MAX). 0 ~ 2 를 넘는 값은 리미터가 받아 준다(권장 preset). 단위 시험 `audioops` 한 줄 바꿈.
- `formatDb(gain)`: '0 dB' · '+3.5 dB' · '−6 dB' · '−∞ dB'(0.05 dB 안은 0). `formatPct` '100%'.
- `DbSlider`(VolumeUi.tsx): `div.slider.slider--db(.is-boost)` > label + `button.slider__val.num.slider__reset`(「−6 dB」 + small 「50%」, **두 번 누르면 0 dB**) + input[type=range min=−30 max=12 step=.5 aria-valuetext] + (hint). 0 dB 자리에 눈금(`::after`, `--zero` 71.43%). +dB 이면 값이 `--gain-up`(노랑, 대비 검사 추가).
- 쓰는 곳: 클립 「소리」, 소리 항목 「소리」, 프로젝트 「소리 섞기」 역할 6줄. 리미터 슬라이더는 이미 dB. 레이어 「소리」는 §2.5.

### 4.2 여러 개 골랐을 때 — `VolumeBatchSection({ kind: 'clip' | 'audio', ids })`
```
div.section > 제목 「소리 · {n}개 한꺼번에」
  p.hint 「지금 −6 dB ~ 0 dB · 1개는 소리가 없어요」
  div.field > seg 「어떻게」: 똑같이 | 지금보다
  (똑같이) DbSlider 「음량」 — 움직이면 바로 모두에(apply 합침 키 vol-batch:ids) · 값이 제각각이면 마지막 것 값 + hint 「움직이면 모두 이 값이 돼요」
  (지금보다) Slider 「바꿀 양」 −12 ~ +12 dB(0.5) + button.btn.primary.sm.block 「{n}개에 +3 dB」(누르면 적용 · 0 으로 되돌림)
  Switch 「음소거」(모두 켜져 있으면 켬)
  button.btn.sm.block 「프로젝트 소리 전부 보기」 → 창
```
- 실행 취소 이름: `volumeChangeLabel` 「소리 크기 똑같이 −6 dB (5개)」 「소리 크기 지금보다 +2.5 dB (3개)」.
- 선택은 한 종류뿐이라 클립 · 소리 항목 「섞임」은 창(§4.3)에서만.

### 4.3 프로젝트 「소리 크기 한꺼번에」 — `VolumeAllSection` + `VolumeDialog`(dialog `'volumes'`)
- 프로젝트 「소리」 분류 절: hint 「소리 나는 것 4개(영상 클립 3 · 소리 1) · 지금 −6 dB ~ 0 dB」 + 「목록에서 맞추기」 「고르게 맞추기」(둘 다 같은 창, 뒤 것은 아래 절로 스크롤).
- 창 `div.modal.volume-dialog`(Modal: Esc · Tab 가둠 · 바깥 클릭, 재는 동안 `locked`):
  - `div.volume-dialog__filter` > seg 종류(전체 n · 영상 클립 n · 소리 n · PIP n) + check 「보이는 것 모두」
  - `div.list.volume-list[role=list]` > `label.list__row.volume-row(.is-selected .is-muted)[role=listitem]` > checkbox + `span.list__main`(b 아이콘+이름 · small 「영상 클립 · 대사」) + `span.volume-row__db.num(.is-boost)`(음소거면 VolumeX + dB)
    - 대상 = `collectVolumeTargets(project)`: 소리 있는 영상 클립(사진 · 분리한 클립 제외, 이름 `n. 파일`) → 소리 항목(역할) → PIP 영상 레이어. 기본 모두 고름.
  - `div.section.volume-dialog__batch` 「고른 {n}개 소리 크기」 + seg 똑같이 | 지금보다 → DbSlider 「모두 이 값으로」 / Slider 「각자 지금 값에서」 → btn-row 「{n}개에 적용」(primary) · 「음소거」 · 「해제」. 적용 토스트 「{n}개 소리 크기를 바꿨어요.」, 이미 같으면 「이미 그 값이에요.」
  - `div.section.volume-dialog__norm` 「고르게 맞추기」 + select 기준(−16 LUFS 유튜브 · 팟캐스트 기본 / −14 음악 스트리밍처럼 조금 크게 / −23 방송 기준) + hint. 상태(§4.4).
  - foot 「닫기」.
- 375 폭: 종류 seg 가 한 줄 가득, 목록 220 px 스크롤.

### 4.4 「고르게 맞추기」 상태(화면에 구현됨 — 측정 함수만 없음)
| 상태 | 화면 |
|---|---|
| idle | `button「{n}개 재서 맞추기」`(측정 함수가 없으면 비활성 + hint 「소리 크기 측정은 다음 판에서 열려요. 지금은 위 「고른 소리 크기」로 직접 맞춰 주세요.」) |
| measuring | `div.progress[role=progressbar aria-valuenow]` + meta 「재는 중 **2** / 5 · {이름}」 + 「취소」(AbortController) · 창은 `locked`(Esc · 닫기 막음) |
| done | `div.list.volume-list--plan` 줄마다 이름 · small 「잰 값 −20.3 LUFS」(못 잰 것은 「재지 못해 그대로 둬요」) · 「−6 dB → **+4 dB**」 + 「이대로 적용」(한 apply 「소리 크기 고르게(−16 LUFS · n개)」) · 「다시」 |
| error | note.danger 「재지 못했어요. {원인} 다시 해 보거나 위에서 직접 맞춰 주세요.」 + 「다시」 |
| 취소 | idle 로(토스트 없음) |

---

## 5. 접근성 · 키보드 · 문구
- 탭: `role=tablist/tab/tabpanel`, `aria-selected` · `aria-controls` · roving tabindex, ← → ↑ ↓ Home End. 메뉴: `role=menu/menuitem`, ↑ ↓ Home End, Esc 는 「+」로 초점 복귀, `aria-haspopup` · `aria-expanded`. 끼워 넣기 안내 `role=status`. dB 슬라이더 `aria-valuetext="−6 dB"`. 창은 Modal 공용(초점 가둠 · 복귀).
- 대비: tokens.css `--gain-up`(어두운 #f2c069 · 밝은 #8a5a00) 추가, `tools/contrast.mjs` 짝 2개 추가 → 94쌍 모두 4.5:1 이상.
- 문구(해요체 · 짧게): 「0 dB = 원래 크기 · 왼쪽 끝 = 무음 · 값을 두 번 누르면 0 dB」, 「움직이면 모두 이 값이 돼요」, 「무음(−∞)인 것은 그대로」, 「{i}번째 클립 뒤에 끼워 넣을 영상 · 사진 카드를 눌러요 · Esc 취소」, 「음악 파일은 소리 줄로 끌어 놓아요. 끼워 넣을 영상이나 사진을 골라 주세요.」
- 단축키 표(keymap.ts) 변화 없음. 「+」의 `data-kbd=D` 는 메뉴 「화면 전환 넣기」 항목으로 옮김(i-keys-guides 시험 갱신).

---

## 6. 다음 단계(Opus)에 넘기는 계약 · 남은 일

> **2026-10-10 Opus 구현 · 검증 뒤 상태**: §6.1 측정 함수는 들어갔고(`app/loudness.ts` · `engine/analysis/loudness.ts`, 단위 23 · e2e `ae-volume-db`), 「고르게 맞추기」 단추가 살아 있다. 기준을 바꾸면 다시 재지 않고 계획만 다시 세운다. 키울 때 진짜 피크 −1 dBTP 상한(`limit: 'peak'` → 「피크 때문에 +N dB까지만」), +12 dB 상한(`'max'`), 못 잰 까닭(무음 · 0.4초보다 짧음 · 파일 없음)을 줄에 보인다. 큰 작업이 돌면 「앞 작업 「…」이(가) 끝나면 재요」. 「+」 메뉴 · 탭 · 끼워 넣기 동작은 `af-inspector-plus` 로 확인(키보드 흐름 · 초점 이어 가기 고침 포함). 기록 `IMPL_LOG_ui.md` ui-2.

### 6.1 측정 함수 — `src/app/loudness.ts` 의 `measureLoudness`(구현됨 — 아래는 계약 원문)
```ts
import type { LoudnessMeasure } from '../core/volume'
export const measureLoudness: LoudnessMeasure
// (p, targets, { signal, onProgress }) => Promise<LoudnessMeasurement[]>
//  - 대상마다 원본의 쓰는 구간만(클립: [in,out) · 소리: offset..offset+dur · 레이어: srcIn 기준) PCM 을 꺼내(engine/ffmpeg/audio extractPcm 또는 WebAudio decode)
//    EBU R128 통합 라우드니스(LUFS)와 진짜 피크(dBTP)를 잰다. gain · 음소거 · 페이드를 곱하기 전 값.
//  - 무음 · 읽기 실패는 lufs: null + reason. signal.aborted 면 AbortError 를 던진다. onProgress(done, total, current) 를 대상마다.
//  - 미리보기 사본(proxy)이 아닌 원본으로(사본은 소리를 다르게 인코딩할 수 있음).
```
연결: `src/ui/VolumeUi.tsx` 의 `loudness.measure = measureLoudness`(앱 시작 때 한 번, 예: App.tsx 또는 main.tsx). 꽂히면 「{n}개 재서 맞추기」가 살아나고 §4.4 상태가 그대로 돈다. `planNormalize` · `applyNormalize` 는 core/volume.ts 에 있고 단위 시험 있음(측정값 → gain 산술만).

### 6.2 그 밖의 남은 일
- e2e(무거운 출력 시험)를 돌려 선택자 수정이 맞는지 확인: `a-cut-export` · `aa-keyframes` · `g-transitions-limiter` · `k-linking` · `l-runs-export` · `m-transform-export` · `s-audio-roles` · `v-tts`(모두 `itab(page, '…')` 한 줄씩 추가). 이번에 돌린 것: `i-keys-guides` 48/48 · `e-regressions` 10/10.
- 출력 쪽: gain 상한 2 → 3.98 이 ffmpeg `volume=` 필터 · 리미터 · 4K 경로에서 그대로 통과하는지(값만 커진 것이라 문제 없을 것) — `a-cut-export` 음량 1.5 배 검사로 확인.
- 타임라인 블록 부분 → 분류 바로 열기(파형 → 소리, 키 표시 → 크기·위치): `ClipBlock` 의 파형 · `KfMarks` 에 `openInspectorTab('clip', …)` 한 줄씩(이번엔 블록 JSX 를 건드리지 않음).
- 레이어 패널 탭 · DbSlider(§2.5) — overlay 합친 뒤.
- 「+」를 맨 앞 · 맨 끝에도(§3.2 마지막) — 요청이 있으면.
- 프로젝트 「소리」 분류 길이(350 px): 소리 섞기 줄 간격 또는 역할 줄 접기.
- README 「소리」 단락에 dB 표기 · 한꺼번에 맞추기 한 줄(docs 갱신은 version 올릴 때).
