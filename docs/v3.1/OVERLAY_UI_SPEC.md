# v3.1 화면 위(겹치기) UI 명세 — 「레이어」를 파이널컷식 연결 클립으로

구현자(Opus)가 그대로 옮길 수 있게 쓴 화면 명세. 데이터 모형(`Project.layers`, `Layer`, `core/layers.ts`)은 그대로 두고 **보이는 말 · 줄의 자리 · 블록 모양 · 속성 칸**만 바꾼다. CSS 는 `src/styles/layers.css`(이 명세와 짝, 이미 고쳐 둠) · 토큰은 `tokens.css`(`--clip-ov*` · `--ov-*` 추가, 대비 검사 통과).
기준 문서: `docs/UI_SPEC.md` §6 · `docs/v3/DESIGN_V3_B.md` §2 · §7. 어긋나면 이 문서가 이긴다.

---

## 0. 지금 화면의 문제 (2026-10-10 캡처 `docs/v3.1/shots/before-timeline.png`, 1366×768 어두운 화면, 화면 위 요소 3개)

| # | 문제 | 이 명세의 답 |
|---|---|---|
| 1 | 「레이어」 줄이 **영상 줄 아래**에 있다. 화면에서는 영상 *위*에 겹치는데 타임라인은 반대라 「얹힌다」는 느낌이 없다(파이널컷은 주 스토리라인 위). | 줄을 영상 줄 **바로 위**로(§2.1). |
| 2 | 행 순서가 시간순 채우기라 앞뒤와 무관. 캡처에서 맨 앞인 「사각형」이 **맨 아래 행**. | 행 = 앞뒤(위 행 = 화면에서 앞), 영상 쪽에서 위로 쌓음(§2.3). |
| 3 | 연결 표시가 블록 안 11 px 아이콘뿐. 주 클립과 이어지는 선이 없고, 「시간에 고정」 핀은 글자처럼 보여 「류」로 읽힌다. | 블록 시작에서 영상 줄까지 내려가는 **연결 줄기 + 점**, 고정은 점선 줄기 + 핀 머리(§2.5). |
| 4 | 22 px 블록에 종류 아이콘 + 연결 아이콘 + 이름이 몰려 조금만 좁아도 이름이 바로 잘린다. | 블록 24 px, 왼쪽 **썸네일 칩** 하나 + 이름, 연결은 줄기로 빼냄(§2.4). |
| 5 | 줄 이름 · 머리 단추 · 속성 칸 제목 · 토스트 모두 「레이어」. 용어 문제의 근원. | 「화면 위」 · 「PIP 영상 / 사진 / 도형」(§1). |
| 6 | 새 PIP 가 화면 **가운데** 35 % — 주 영상의 핵심을 가린다. | 영상 → 오른쪽 아래 30 %, 사진 → 오른쪽 위 25 %(§3). |
| 7 | 요소가 없으면 줄 자체가 없어 **끌어 놓을 자리를 알 수 없다**. | 클립이 있으면 항상 보이는 얇은 빈 줄 + 안내(§2.2). |
| 8 | 세 종류가 같은 보라 블록, 구분은 12 px 아이콘뿐. | 칩에 실제 썸네일 · 그림 · 도형색, 영상 블록엔 「PIP」 알약(§2.4). |
| 9 | `layers.css` 가 `--clip-pip`(소리 줄 **PIP 소리 역할** 색, 노랑)을 보라로 덮어써 소리 줄 색이 설계와 달라진다. | 새 토큰 `--clip-ov` · `--clip-ov-line`, 덮어쓰기 삭제(§7). |
| 10 | 3행이면 자막 줄이 밀려 세로 스크롤. 위에 얹는 구조에선 줄이 자랄 때 **영상 줄이 밀려 내려가면** 안 된다. | 줄 높이가 늘어난 만큼 `timeline__scroll.scrollTop` 보정(§2.1). |

---

## 1. 이름 짓기 (확정)

주 화면 문구에서 「레이어」를 쓰지 않는다. 「레이어」는 **툴팁 괄호 보조**와 README 용어 표에만 남긴다(다른 편집기에서 온 사람을 위해).

| 자리 | 확정 문구 | 비고 |
|---|---|---|
| 타임라인 줄 이름 | **화면 위** | 장소 이름(영상 · 자막 · 소리와 같은 급). 보관함 카드 단추 「화면 위에」와 같은 말. |
| 블록 종류 | **PIP 영상** · **사진** · **도형** | `LAYER_KIND_NAME = { video: 'PIP 영상', image: '사진', shape: '도형' }` |
| 요소를 통틀어 부를 때 | **화면 위 요소** | 토스트 · 실행 취소 라벨 · 접근성 문구. 예: 「화면 위 요소 2개 삭제」 |
| 추가 단추(타임라인 머리) | **화면 위에 올리기** (P) — 단추 글은 「화면 위에」, 툴팁 전체 | `kbdProps('layer-add', { more: '영상 · 사진 · 도형을 영상 위에 겹쳐요 (레이어)' })` |
| 추가 단추(줄 머리 `+`) | aria-label · title 「화면 위에 올리기 (P)」 | 같은 메뉴 |
| 추가 메뉴 항목 | 「영상 · 사진 (보관함에서 고르기)」 / 구분선 / 라벨 「도형」 + 5종 | 메뉴 `aria-label`「화면 위에 올리기」 |
| 보관함 카드 단추 | 「화면 위에」(그대로) · 툴팁 「재생 위치에서 영상 위에 겹쳐요 — 영상은 오른쪽 아래 PIP 창, 사진은 오른쪽 위」 | |
| 보관함 고르기 안내 | 「영상 위에 올릴 파일을 눌러요 · Esc 취소」 | `.layer-pick-note` |
| 빈 줄 안내 | 「보관함의 영상 · 사진을 여기에 끌어 놓으면 영상 위에 겹쳐요」(≤480: 「영상 · 사진을 여기에 놓아요」) | §2.2 |
| 끌어 놓기 안내 | 「여기에 놓으면 영상 위에 겹쳐요」 / 불가 「아래에 영상이 없어요」 | §2.6 |
| 속성 칸 제목 | 종류 이름 그대로: **「PIP 영상」 · 「사진」 · 「도형」**, 여러 개면 「화면 위 요소 n개」 | 부제 `화면 위 · {이름}` + 배지 「숨김」「잠금」 |
| 속성 칸 새 절 | **「PIP」**(영상 · 사진) / 도형은 **「배치 · 앞뒤」** | §4 |
| 미리보기 상자 이름표 | `{종류} · {이름}` 예 「PIP 영상 · 실험.mp4」 | `.layer-box__name` |
| 줄 머리 눈 단추 | 「화면 위 요소 모두 숨기기(화면 · 소리 · 출력에서 빠져요)」/「모두 보이기」 | |
| 토스트(추가) | 「'{이름}'을 영상 위에 올렸어요 — 오른쪽 아래」(사진: 오른쪽 위, 도형: 가운데) | §3 |
| 토스트(끌어 놓기 실패) | 「아래에 영상이 없어 올릴 수 없어요. 영상이 있는 자리에 놓아 주세요.」 | |
| 실행 취소 라벨 | 「화면 위 옮기기」「화면 위 시작 바꾸기」「화면 위 끝 바꾸기」「화면 위 앞으로/뒤로/맨 앞/맨 뒤」「화면 위 숨기기/보이기/잠그기/잠금 풀기」「화면 위 요소 n개 삭제」「도형 올리기」「'{이름}' 영상 위에 올리기」 | `layerActions.ts` · `Timeline.tsx` · `LayerPanels.tsx` |
| 단축키 표(`keymap.ts` what) | `layer-add` 「화면 위에 올리기 메뉴 열기 · 닫기(영상 · 사진 · 도형)」· `layer-hide` 「고른 화면 위 요소 숨기기 · 보이기」· `layer-lock` 「… 잠그기 · 풀기」· `layer-order` 「고른 화면 위 요소 앞으로 · 뒤로(줄에서 위 · 아래)」· `layer-nudge` 「미리보기 상자에 초점이 있을 때 1 px 옮기기(Shift = 10 px)」 | README 표도 같이 |
| 소리 줄 PIP 역할 | 「PIP」(그대로) — 블록 색 `--clip-pip` 노랑(§7) | 속성 칸 hint 「PIP 소리는 소리 줄 「PIP」 역할로 섞여요」 그대로 |

README 「용어」 표(새로, 단축키 표 위에):

```
| 모아컷에서 | 뜻 | 다른 편집기에서 |
|---|---|---|
| 화면 위 | 주 영상 위에 겹쳐 보이는 것들이 놓이는 타임라인 줄 | 레이어(프리미어 · 캡컷), 연결된 클립(파이널컷) |
| PIP 영상 | 영상 위에 작은 창으로 겹친 다른 영상 | PIP, 오버레이 |
| 사진 · 도형 | 영상 위에 겹친 그림 · 로고 · 네모 · 원 | 오버레이, 그래픽 |
| 연결 줄기 | 화면 위 블록에서 주 영상까지 내려가는 선 — 그 영상을 옮기면 같이 움직여요 | 연결선(파이널컷) |
| 핀 | 영상을 옮겨도 그 시각에 그대로 있는 표시 | 시간 고정 |
```

---

## 2. 타임라인 「화면 위」 줄 (파이널컷식)

### 2.1 자리 · 높이

```
section.timeline
  div.timeline__head  (… 「화면 위에」 단추 = LayerAddButton …)
  div.timeline__scroll
    div.ruler__corner · div.ruler                      (sticky top)
    div.track__label.track--ov  ·  div.track__lane.track--ov      ← 새 자리: 눈금 바로 아래, 영상 줄 바로 위
    div.track__label.track--video · div.track__lane.track--video
    자막 · 모자이크 · 소리 (그대로)
```

- **보이는 조건**: `project.clips.length > 0` 이면 항상(요소 0개여도). 클립이 없으면 없음(`timeline__empty` 만).
- 높이는 CSS 가 계산한다. 라벨 · 줄에 `style={{ '--ov-rows': n }}` 만 준다(`n = 행 수`, 요소 0개면 `0` + `.is-empty`).
  - `.track--ov`: `height: calc(10px + var(--ov-rows) * 26px)` → 1행 36 · 2행 62 · 3행 88.
  - `.track--ov.is-empty`: 26 px.
- 블록 24 px, 행 간격 2 px, 위 · 아래 여백 6 · 4 px(아래 4 px 는 줄기 · 점 자리).
- **영상 줄 고정**: 행 수가 바뀌어 줄 높이가 `Δ` 만큼 늘거나 줄면 같은 렌더에서 `timeline__scroll.scrollTop += Δ`(`useLayoutEffect`, 이전 행 수를 ref 로). 파이널컷처럼 주 영상은 제자리, 위 줄만 자란다. 눈금은 sticky 라 그대로.
- 행 수가 많아 타임라인이 넘치면 기존 세로 스크롤 · `timeline__resize` 에 맡긴다(제한 없음).

### 2.2 줄 머리 라벨 · 빈 줄

```
div.track__label.track--ov[style=--ov-rows]
  svg (lucide PictureInPicture2, 15)
  span.track__name 「화면 위」
  button.btn.icon.sm.ov-add[aria-label=화면 위에 올리기 (P)][aria-haspopup=menu][aria-expanded]  (Plus 14)  ← LayerAddButton compact 모드, 같은 메뉴를 라벨 아래로 띄움(.layer-menu.is-lane)
  button.btn.icon.sm (Eye/EyeOff, 요소 ≥ 1 일 때만)  ← 기존 LayerLaneToggle, 문구 §1
div.track__lane.track--ov.is-empty[role=listbox][aria-label=화면 위 줄]
  span.lane-hint.ov-hint 「보관함의 영상 · 사진을 여기에 끌어 놓으면 영상 위에 겹쳐요」
  span.lane-hint.ov-hint.is-short 「영상 · 사진을 여기에 놓아요」      (≤480 에서만 보임, CSS 가 바꿔 끼움)
```

- 라벨은 `92px` 열 그대로(≤480: 72 px, 이름 숨김 — `.track__name { display:none }`, 아이콘 + `+` 만, 눈 단추 숨김).
- 빈 줄은 평소 글자 `--text-mute`, 줄 바탕은 `--ov-lane`(다른 줄보다 아주 조금 보랏빛, 「다른 종류의 줄」 신호).

### 2.3 행 배정 (위 = 앞)

`layerRows` 를 아래 규칙으로 바꾼다. 행 0 = 영상 줄 바로 위, 숫자가 클수록 위.

```
rows = Map<id, row>
for l in project.layers (배열 순서 = 뒤 → 앞):
  overlapping = 앞서 배정된 요소 중 시간이 겹치는 것(한 조각이라도 [s,e) 겹침)
  rows[l] = overlapping 비면 0, 아니면 max(rows[o] for o in overlapping) + 1
n = max(rows) + 1  (요소 0개면 0)
```

- 같은 시각에 겹치는 것끼리는 **배열 뒤쪽(화면에서 앞)이 항상 더 위**. 겹치지 않는 것은 행 0 을 같이 쓴다 → 차례로 나오는 PIP 는 한 줄.
- 블록 위치는 CSS: `.clip--ov { bottom: calc(4px + var(--ov-row) * 26px); height: 24px; top: auto }` — 블록에 `style={{ left, width, '--ov-row': row }}`.
- 접근성 문구에 행을 넣는다: `aria-label="PIP 영상 '실험.mp4' 0:01.5~0:06.5 · 겹침 2번째(앞에서)"` — 「앞에서 k번째」 = 같은 시각 겹치는 것 중 앞에서 센 순서(1 = 맨 앞).

### 2.4 블록

```
div.clip.clip--ov[data-kind=video|image|shape][data-id][style=left,width,--ov-row]
   (.is-selected .is-dragging .is-hidden .is-locked .is-related .is-new .is-fixed)
   role=option aria-selected tabindex=-1 aria-label=§2.3 title=§아래
  span.clip__handle.l
  span.ov-chip                       ← 18×18, 왼쪽 3 px 안쪽
     img[src=썸네일][alt=""]            video: 미디어 첫 썸네일 1장(.clip__thumbs 가 쓰는 같은 출처, 띠 아님) · image: 그 그림
     svg[aria-hidden]                   shape: SHAPE_ICON, style=--c:{fill}  (채움색으로 칠함)
  span.clip__label
     span.ov-kind 「PIP」                video 만(알약) — 사진 · 도형은 칩이 곧 종류라 생략
     {이름}
  i.clip__gap ×n (기존, 무음 간격)
  span.clip__badges.is-top > span.clip__badge.warn 「잘림」 (기존)
  i.clip__kf … (기존 KfMarks)
  span.clip__handle.r
```

- 색: 한 가족색 `--clip-ov` / `--clip-ov-line`(보라, 소리 PIP 노랑과 다름). 종류는 칩이 보여 준다.
- `.is-hidden` 점선 + 45 % · `.is-locked` 손잡이 없음 · `.is-related`(부모 클립 선택) 기존 `--related` 테두리 — 줄기도 같이 그 색.
- 좁은 블록: `@container (max-width: 34px)` 이름 숨김(기존), `≤ 26px` 칩만.
- title: `{종류} · {이름}{ · 숨김}{ · 잠김 (⇧L로 풀어요) | — 끌어서 옮기기 · 가장자리로 길이 · 위아래로 끌면 앞뒤}`
- 더블클릭 = 재생 위치를 블록 시작으로(기존).

### 2.5 연결 줄기 · 핀 (줄 안 형제 요소, 블록 밖)

블록은 `overflow:hidden` 이라 줄기는 **줄(lane)의 형제 요소**로 그린다(블록보다 먼저, z 0).

```
i.ov-stem[style=left:{블록 left + 10}px, --ov-row:r][aria-hidden]         ← 영상에 연결(att.mode=clip)
i.ov-stem.is-fixed[…]                                                       ← 시간에 고정(att.mode=fixed)
(.is-selected .is-related .is-hidden 은 블록과 같이 붙임)
```

- 기하는 CSS: 줄 바닥(영상 줄 경계) 에서 블록 바닥까지 `height: calc(5px + var(--ov-row) * 26px)`, 너비 2 px, 색 `--clip-ov-line`. 아래 끝 `::after` 6 px 점이 **영상 줄 위 경계선 위에** 앉는다 = 「이 영상에 붙어 있다」.
- 고정(`.is-fixed`): 1.5 px **점선**, 색 `--warn`, 아래 끝은 점 대신 핀 머리(6×6 둥근 네모 + 1 px 바늘). title 은 블록에: 「시간에 고정 — 영상을 옮겨도 그대로예요」.
- 선택되면 `--accent`, 부모 클립 선택(`.is-related`)이면 `--related`, 숨김이면 45 %.
- 아래 행 블록이 줄기를 가리는 것은 그대로 둔다(파이널컷도 같음). 끌기 중(`.is-dragging`)엔 줄기를 같이 옮긴다(left 만 바뀜).
- 블록 안 `span.clip__link`(Link2/Pin 아이콘)은 **화면 위 블록에서 뺀다**(자막 · 소리 블록은 그대로).

### 2.6 끌기 · 피드백

| 동작 | 피드백 |
|---|---|
| 가로 끌기(옮기기) · 손잡이 | 기존 `useSpanDrag`(스냅 · 안내). 블록 `.is-dragging` + 줄기 같이. |
| **세로 끌기(앞뒤 바꾸기)** | 같은 끌기에서 `|dy| ≥ 13px` 를 넘어 다른 행에 들어가면 그 행에 `div.ov-slot[style=--ov-row]`(점선 테두리 + `--accent-soft`, 줄 전체 너비) 표시, 커서 `grabbing`. 놓으면 `moveLayerZ` 로 **그 행과 겹치는 요소들보다 앞(위로 끌었을 때) / 뒤(아래로)** 가 되게 배열을 옮긴다. 가로 이동과 동시에 해도 된다(둘 다 한 apply, 라벨 「화면 위 옮기기」). 행이 바뀌지 않으면 아무것도 안 한다. 맨 위 행 위로 더 끌면 맨 앞, 행 0 아래로 끌면 맨 뒤. |
| 보관함 카드를 줄에 끌어 오기(`MEDIA_DRAG_TYPE`) | 줄 `.is-drop-target`(배경 `--accent-soft`) + `div.ov-ghost[style=left,width,--ov-row]`: 놓을 시각 = `laneTime`, 너비 = 영상이면 원본 길이(chain 끝까지) · 사진이면 5 초, 행 = §2.3 규칙으로 새 요소가 갈 행. 안에 `span.ov-ghost__text`「여기에 놓으면 영상 위에 겹쳐요」. 놓으면 `addLayerHere` 와 같은 길(§3 기본 배치) 단, 시각은 재생 위치가 아니라 놓은 시각. |
| 아래에 영상이 없는 자리 | 줄 `.is-drop-invalid`, 고스트 `.is-invalid`(점선 `--danger`, 글 「아래에 영상이 없어요」), 놓으면 토스트(§1) 하고 아무것도 안 만듦. |
| 소리 카드를 끌어 오기 | 받지 않음(`dropEffect = 'none'`), 피드백 없음. |
| 미리보기(`stage__frame`)에 끌어 오기 | 기존 `.is-over` 점선 + 새 `div.stage__drop-hint` 「놓으면 영상 위에 겹쳐요」(가운데 알약, 검정 70 % 바탕 흰 글). |
| 추가 직후 | 블록 `.is-new`(기존 초록 번쩍) + 토스트(§1) + 선택 + 속성 칸 「PIP」 절이 맨 위라 바로 보임. |

### 2.7 키보드

- 줄 안 ↑/↓ = 같은 줄 이전 · 다음 요소(기존 공통 규칙) — 화면 위 줄에서는 **행 순서**(위 행 먼저)로 돈다.
- Ctrl+↑/↓ = 앞으로 · 뒤로(= 행 위 · 아래), 기존. 토스트 없음, 블록이 행을 옮기는 것으로 충분(`transition: bottom .15s`, reduced-motion 땐 없음).
- P = 추가 메뉴(기존). 줄 머리 `+` 는 Tab 순서에 들어가고 Enter/Space 로 연다.
- 고른 블록에 초점이 가면(`tabIndex=-1` → 프로그램 초점) `.clip:focus-visible` 기존 `--focus`.

---

## 3. 새 요소 기본 배치 (`core/defaults.ts` · `core/layers.ts newLayer`)

| 종류 | 자리 | 크기 | 상수 |
|---|---|---|---|
| PIP 영상 | **오른쪽 아래** — 그린 상자가 화면 가장자리에서 가로 · 세로 각 **4 %** 떨어지게 | 짧은 변의 **30 %** | `NEW_PIP_SCALE = 0.30`, `PIP_MARGIN = 0.04` |
| 사진 | **오른쪽 위** (로고 · 그림 자리, PIP 와 안 겹침) | 짧은 변의 **25 %** | `NEW_IMAGE_SCALE = 0.25`, 같은 여백 |
| 도형 | 가운데(그대로) | 30 %(그대로) | `NEW_SHAPE_SIZE` |

- `transform.x/y` 는 가운데 비율이므로 상자 크기를 먼저 구한다(`layerRect` 와 같은 `contain` 계산, 1080p 기준 W×H): `x = 1 − 0.04 − w/W/2`, `y = 1 − 0.04 − h/H/2`(오른쪽 위는 `y = 0.04 + h/H/2`). 비율을 바꿔도 값은 그대로(기존 규칙).
- **빈 자리 찾기**(SHOULD): 그 시각에 보이는 다른 화면 위 요소가 이미 같은 자리(가운데 거리 < 10 %)에 있으면 다음 자리로: 오른쪽 아래 → 왼쪽 아래 → 오른쪽 위 → 왼쪽 위 → 가운데. 토스트 문구의 자리 이름도 따라간다.
- 테두리 · 둥근 모서리 기본값: **꺼짐 · 0**. 켤 때 기본 색 `#ffffff`, 두께 1.0 %(§4.2).

---

## 4. 속성 칸

### 4.1 제목 · 순서

`InspectorHead title = LAYER_KIND_NAME[kind]`(여러 개: 「화면 위 요소 n개」), hint `화면 위 · {이름}` + 배지. 절 순서:

1. `div.note.warn` 겹침 경고(기존, 문구의 「레이어」→「화면 위 요소」: 「00:12~00:20에 화면 위 요소 5개가 겹쳐요. …」)
2. **「PIP」**(영상 · 사진) / **「배치 · 앞뒤」**(도형) — §4.2
3. 「이름 · 상태」(기존)
4. **「세부 조정」** = 기존 「배치」 절 그대로(가로 · 세로 · 크기 슬라이더 · 회전 · 뒤집기 · 불투명도 · 자르기)
5. 「움직임」(기존)
6. 「표시 시간」(기존, hint 「주 영상을 자르면 PIP도 같은 구간이 빠져요(동기)」 그대로)
7. 「배치 방식」 `AttachSection`(기존 공용)
8. 「소리」(영상, 기존)
9. 「도형」(도형, 기존 — 채움 · 테두리 · 두께는 여기 그대로, §4.2 테두리는 도형에 없음)
10. 삭제

기존 「순서」 절은 없앤다(§4.2 로 흡수).

### 4.2 「PIP」 절 (`div.section.pip-section`)

```
Section title="PIP"  (도형: "배치 · 앞뒤")
  div.pip-quick                                  ← 2열: 왼쪽 격자, 오른쪽 세로 묶음
    div.field
      span.field__label 「빠른 위치」
      div.grid9[role=radiogroup][aria-label=빠른 위치] > button×9 [aria-label=왼쪽 위 … 오른쪽 아래](.is-selected)   ← 자막 위치와 같은 .grid9 재사용
    div.pip-quick__side
      button.btn.sm.pip-fill[aria-pressed] 「꽉 채우기」(Maximize2 14)        ← 화면 전체(x=y=.5, scale = 꽉 차는 배율, 'cover' 아님 'contain')
      Seg label="크기" value=작게|보통|크게|(없음) options [작게 20 % · 보통 30 % · 크게 50 %]  full
  Switch 「테두리」                                                    ← video · image 만
    (켜짐) Swatches 「테두리 색」 colors=[#ffffff, #000000, #ffd23f, #ff6b9c, #7cd2ff, #9be08a] + 직접 고르기
           Slider  「테두리 두께」 0.2~5 % step .1, format `${v}%`, title 「화면 짧은 변 대비 — 1080p 에서 1 % ≈ 11 px」
  Slider 「모서리 둥글기」 0~50 % step 1, format `${v}%`, title 「상자 짧은 변 대비 — 50 % 면 알약 · 원」   ← video · image 만
  div.field
    span.field__label 「앞뒤 (줄에서 위 = 앞)」
    div.btn-row > 「앞으로 (⌘↑)」「뒤로 (⌘↓)」「맨 앞」「맨 뒤」   ← 기존 단추 4개 그대로 옮김, title 「맨 앞으로(가장 위에 보여요)」 유지
```

- **빠른 위치**: 9칸 = 가장자리 여백 4 %(§3)로 3×3 자리. 현재 `x, y` 가 어느 칸의 값과 ±1 % 안이면 그 칸 `.is-selected`, 아니면 아무 칸도 아님. 누르면 `x, y` 만 바꿈(크기 · 회전 유지). 움직임 키가 있으면 재생 위치 키로(기존 `kv`).
- **꽉 채우기**: 누르면 x=y=0.5, scale = 짧은 변 기준 화면에 꽉 차는 배율(가로 영상 16:9 PIP 라면 1/0.5625…: `layerRect` 역산), rot 0. 이미 꽉 찬 상태면 `aria-pressed=true`, 다시 누르면 「보통 · 오른쪽 아래」로 되돌림.
- **크기 단계**: scale 이 20/30/50 % ±1 % 면 해당 칸, 아니면 아무 칸도 `aria-checked` 아님(Seg 에 `value={null}` 허용 — 부품에 `T | null` 받게 조금 넓힘). 누르면 scale 만.
- **테두리 · 둥글기 데이터**(새 필드, 둘 다 선택적 · 없으면 꺼짐):
  ```ts
  interface Layer { …; border?: { color: string; width: number /* 화면 짧은 변 비율 .002~.05 */ }; radius?: number /* 상자 짧은 변 비율 0~.5 */ }
  ```
  - 켜기 → `border = { color: '#ffffff', width: 0.01 }`, 끄기 → `border` 삭제(값은 잊음, 단순하게).
  - 그리기(미리보기 · 출력 공용): 둥근 모서리는 **내용(자르기 뒤) 상자에** 적용, 테두리는 그 둥근 상자 **바깥쪽**으로 두께만큼(내용이 가려지지 않게), 회전 · 불투명도 · 뒤집기 · 키프레임 크기를 함께 따른다. 두께는 `scale` 과 무관하게 화면 기준(짧은 변 비율)이라 작은 창도 굵기가 같다.
  - 실행 취소 라벨 「테두리 켜기/끄기」「테두리 색」「테두리 두께」「모서리 둥글기」(끌기는 key `ly-bw` · `ly-rad` 로 한 단계).
- 여러 개 고름: 빠른 위치 · 크기 · 테두리 · 둥글기는 **모두에 같은 값**(`setAll`), 앞뒤는 기존 `orderLayers`.
- 도형은 「PIP」 대신 「배치 · 앞뒤」: 빠른 위치 + 크기 단계(도형 `w·h` 가 아니라 `scale`) + 앞뒤만. 테두리는 도형 절에 있음.

### 4.3 기존 부품 재사용

`Switch` · `Swatches` · `Slider` · `Seg` · `Section` · `NumInput`(`src/ui/controls.tsx`) 그대로. `.grid9`(app.css, 자막 위치) 그대로. 새 CSS 는 `.pip-section` · `.pip-quick` · `.pip-quick__side` · `.pip-fill` 만(layers.css).

---

## 5. 접근성

| 대상 | 문구 · 역할 |
|---|---|
| 줄 | `role=listbox aria-label="화면 위 줄" aria-multiselectable=true` |
| 블록 | `role=option aria-selected` · `aria-label="{종류} '{이름}' {시작}~{끝} · 겹침 {k}번째(앞에서)"`, 고정이면 끝에 「· 시간에 고정」, 숨김 「· 숨김」, 잠김 「· 잠김」 |
| 줄기 · 핀 · 고스트 · 슬롯 | `aria-hidden` (정보는 블록 aria-label 과 토스트에 있음) |
| `+` 단추 | `aria-label="화면 위에 올리기 (P)" aria-haspopup=menu aria-expanded` |
| 메뉴 | `role=menu aria-label="화면 위에 올리기"`, 항목 `role=menuitem`, 도형 라벨은 `role=presentation` |
| 격자 | `role=radiogroup aria-label="빠른 위치"`, 칸 `role=radio aria-checked aria-label="왼쪽 위 · 위 가운데 · 오른쪽 위 · 왼쪽 · 가운데 · 오른쪽 · 왼쪽 아래 · 아래 가운데 · 오른쪽 아래"` |
| 꽉 채우기 | `aria-pressed` |
| 토스트 | 기존 `aria-live=polite` 영역 |
| 초점 | 모든 단추 · 블록 `:focus-visible` → `--focus`. 터치(≤480) 손잡이 · 칩 28 px 유지 |
| 색만으로 구분 금지 | 고정은 점선 + 핀 모양, 선택은 테두리 + 줄기 색, 종류는 칩 + 「PIP」 글 |

---

## 6. 폭별 모양

| 폭 | 줄 머리 | 블록 | 속성 「PIP」 |
|---|---|---|---|
| 1366×768(기본, 어두운 · 밝은) | 92 px: 아이콘 + 「화면 위」 + `+` + 눈 | 칩 18 + 「PIP」 알약 + 이름, 줄기 2 px | 격자 96 px + 오른쪽 묶음(꽉 채우기 · 크기 seg), 슬라이더 전체 폭 |
| 900(세로 쌓기) | 같음(타임라인은 맨 아래, 가로 스크롤 안에서만) | 같음 | 속성 칸이 미리보기 아래 전체 폭 → `.pip-quick` 그대로 2열 |
| 375(≤480) | 72 px: 아이콘 + `+` 만(`track__name` · 눈 숨김), 빈 줄 글 「영상 · 사진을 여기에 놓아요」 | 「PIP」 알약 숨김, 칩 + 이름, 손잡이 터치 폭 | `.pip-quick` 1열(격자 위, 묶음 아래), 앞뒤 단추 2×2(`btn-row` 줄바꿈), 가로 넘침 0 |

밝은 화면: `--clip-ov #e7defa / --clip-ov-line #6f4fbf`, 줄 바탕 `--ov-lane #ecebf3`. 대비는 §7.

---

## 7. 토큰 · 대비 (`tokens.css`, 이미 반영)

| 토큰 | 어두운 | 밝은 | 용도 |
|---|---|---|---|
| `--clip-ov` | `#3b2f58` | `#e7defa` | 화면 위 블록 바탕 |
| `--clip-ov-line` | `#a58be0` | `#6f4fbf` | 블록 테두리 · 연결 줄기 · 점 |
| `--ov-lane` | `#1b1a24` | `#ecebf3` | 화면 위 줄 바탕(다른 줄 `--track-bg` 와 살짝 다름) |
| `--clip-pip` / `--clip-pip-line` | (그대로 노랑) | | **소리 줄 PIP 역할 전용** — `layers.css` 의 덮어쓰기 삭제 |

`tools/contrast.mjs` 에 짝 추가: `clip-ink/clip-ov` · `text-mute/ov-lane` · `clip-ov-line/ov-lane` · `text-sub/ov-lane` → 어두운 · 밝은 모두 ≥ 4.5 (실행 결과 `0쌍 부족`).

---

## 8. 구현 체크리스트 (Opus)

1. `Timeline.tsx`: 줄 자리 이동(눈금 아래 · 영상 위), `track--layer` → `track--ov`, `--ov-rows`/`--ov-row` 인라인 변수, `layerRows` §2.3, `scrollTop` 보정 §2.1, 빈 줄 §2.2, `LayerBlock` → 칩 · 「PIP」 알약 · `clip__link` 제거, `OvStem` 형제 렌더 §2.5, 세로 끌기 §2.6, 줄 drop §2.6.
2. `LayerPanels.tsx`: `LAYER_KIND_NAME` 바꿈, `LayerAddButton` `compact` 모드 + 문구, `LayerPanel` 제목 · 절 순서 · 「PIP」 절 §4.2, 「순서」 절 삭제.
3. `core/types.ts` `Layer.border · radius`, `core/defaults.ts` 상수 §3, `core/layers.ts newLayer` 자리 계산 §3, 그리기(미리보기 WebGL · 출력) 테두리 · 둥글기 §4.2, `migrate` 는 선택 필드라 손댈 것 없음.
4. `layerActions.ts` · `keymap.ts` · `Library.tsx` · `Stage.tsx` · `README.md` 문구 §1, `stage__drop-hint`.
5. `LayerHit.tsx` 이름표 `{종류} · {이름}`.
6. `docs/UI_SPEC.md` §6 · `DESIGN_V3_B.md` §2.1 · §7 에 「v3.1 OVERLAY_UI_SPEC 가 우선」 한 줄.
7. 검사: `node tools/contrast.mjs src/styles/tokens.css`, `tools/app-shots.mjs` 에 화면 위 요소 3개 상태(1366 어두운 · 밝은 · 900 · 375) 추가, 가로 넘침 0.
