# 모아컷 자막 글꼴

자막에 쓸 수 있는 한글 글꼴 30종과 그 라이선스를 정리했어요. 주소와 라이선스는 `tools/font-research.json`(직접 확인한 조사 결과)에 있는 값만 옮겼어요.

## 불러오는 방법

- 글꼴 파일은 저장소에 넣지 않아요. 사용자가 그 글꼴을 처음 고르면 브라우저가 **버전을 고정한 공개 CDN**(`cdn.jsdelivr.net`, `hangeul.pstatic.net`)에서 내려받아요. 두 곳 모두 `Access-Control-Allow-Origin: *` 를 보내요.
- **통짜 파일**(굵기마다 한 파일): 받은 파일을 Cache Storage `moacut-fonts-v1` 에 두고 다음부터는 내려받지 않아요.
- **조각(unicode-range)**: `@fontsource` CSS 의 조각 중 자막 글자에 필요한 것만 받아요(`document.fonts.load(글꼴, 글자)`).
- 캔버스에 그리기 전에 `ensureFont(글꼴, 굵기, 글자)` 로 그 글자들이 실제로 준비됐는지 기다려요. 미리보기와 내보내기 PNG 가 같은 글꼴로 그려져요.
- 안쪽 family 이름은 `mc-<id>` 를 써서 화면(UI) 글꼴과 부딪히지 않아요.
- **내 글꼴**: TTF·OTF 만 받아요(파일 앞 4바이트로 확인). 이 기기 메모리에서만 쓰고 어디에도 보내지 않아요. 굵기는 400 하나로 다뤄요. 새로 열면 다시 골라야 해요.
- 즐겨찾기·최근 글꼴은 localStorage `ss.moacut.fontFav`·`ss.moacut.fontRecent` 에 둬요.

## 글꼴 목록

| # | 이름 | 분류 | 제작 | 라이선스 | 굵기 | 받는 곳·방식 | 조건(조사 기록) | 라이선스 파일 |
|---|---|---|---|---|---|---|---|---|
| 1 | 프리텐다드<br>`pretendard` | 고딕 | 길형진(orioncactus) | SIL OFL 1.1 | 400·500·600·700 | cdn.jsdelivr.net<br>통짜 woff2 | OFL 전문(LICENSE) 동봉, 폰트 단독 판매 금지, 예약 이름 Pretendard: 수정·서브셋 파생본은 이름 변경 필요(공식 파일 그대로 쓰면 무관) | [pretendard.txt](../licenses/fonts/pretendard.txt) |
| 2 | 프리젠테이션<br>`freesentation` | 고딕 | 이주임(Freesentation) | SIL OFL 1.1 | 400·500·700·900 | cdn.jsdelivr.net<br>통짜 woff2 | OFL 전문 동봉, 폰트 단독 판매 금지 | [freesentation.txt](../licenses/fonts/freesentation.txt) |
| 3 | 페이퍼로지<br>`paperlogy` | 고딕 | 이주임(Freesentation) | SIL OFL 1.1 | 400·500·700·900 | cdn.jsdelivr.net<br>통짜 woff2 | OFL 전문 동봉, 폰트 단독 판매·라이선스 변경 금지 | [paperlogy.txt](../licenses/fonts/paperlogy.txt) |
| 4 | 에스코어드림<br>`s-core-dream` | 고딕 | (주)에스코어 | 에스코어 글꼴 자체 라이선스 | 400·500·700·800 | cdn.jsdelivr.net<br>통짜 woff | 저작권 안내문 동봉(어려우면 출처 표기 권장), 폰트 파일 수정·단독 판매 금지, 배포된 파일 형태 그대로 써야 함(woff2 변환·서브셋 금지로 보는 게 안전) | [s-core-dream.txt](../licenses/fonts/s-core-dream.txt) |
| 5 | 노토 산스 KR<br>`noto-sans-kr` | 고딕 | Google (Adobe Source Han Sans 기반) | SIL OFL 1.1 | 400·700 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 글꼴 단독 판매 금지, 수정본은 OFL 유지·예약 이름(RFN) 사용 금지 | [noto-sans-kr.txt](../licenses/fonts/noto-sans-kr.txt) |
| 6 | IBM 플렉스 산스 KR<br>`ibm-plex-sans-kr` | 고딕 | IBM | SIL OFL 1.1 | 400·700 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지, 수정본 RFN 'Plex' 사용 금지 | [ibm-plex-sans-kr.txt](../licenses/fonts/ibm-plex-sans-kr.txt) |
| 7 | 나눔고딕<br>`nanum-gothic` | 고딕 | NAVER (디자인 산돌) | SIL OFL 1.1 | 400·700·800 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지, 수정본 RFN 'Nanum/NanumGothic' 사용 금지 | [nanum-gothic.txt](../licenses/fonts/nanum-gothic.txt) |
| 8 | 나눔스퀘어<br>`nanum-square` | 고딕 | 네이버, 네이버문화재단 | SIL OFL 1.1 (네이버 글꼴 저작권 안내) | 300·400·700·800 | hangeul.pstatic.net<br>통짜 woff | 글꼴 자체 유료 판매 금지. 번들·재배포 시 저작권 안내와 OFL 전문 동봉(어려우면 출처 표기 권장). | [nanum-square.txt](../licenses/fonts/nanum-square.txt) |
| 9 | 노토 세리프 KR<br>`noto-serif-kr` | 명조 | Google (Adobe Source Han Serif 기반) | SIL OFL 1.1 | 400·700 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [noto-serif-kr.txt](../licenses/fonts/noto-serif-kr.txt) |
| 10 | 나눔명조<br>`nanum-myeongjo` | 명조 | NAVER (디자인 Fontrix) | SIL OFL 1.1 | 400·700·800 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지, 수정본 RFN 'Nanum/NanumMyeongjo' 사용 금지 | [nanum-myeongjo.txt](../licenses/fonts/nanum-myeongjo.txt) |
| 11 | 고운바탕<br>`gowun-batang` | 명조 | 류양희 (Yanghee Ryu) | SIL OFL 1.1 | 400·700 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [gowun-batang.txt](../licenses/fonts/gowun-batang.txt) |
| 12 | 함렛<br>`hahmlet` | 명조 | Hypertype (함민주) | SIL OFL 1.1 | 400·700 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [hahmlet.txt](../licenses/fonts/hahmlet.txt) |
| 13 | 송명<br>`song-myung` | 명조 | JIKJI SOFT | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [song-myung.txt](../licenses/fonts/song-myung.txt) |
| 14 | 마루 부리<br>`maru-buri` | 명조 | 네이버, 네이버문화재단 | SIL OFL 1.1 (네이버 글꼴 저작권 안내) | 200·300·400·600·700 | hangeul.pstatic.net<br>통짜 woff2 | 글꼴 자체 유료 판매 금지. 번들·재배포 시 저작권 안내와 OFL 전문 동봉(어려우면 출처 표기 권장). | [maru-buri.txt](../licenses/fonts/maru-buri.txt) |
| 15 | 나눔손글씨 펜<br>`nanum-pen-script` | 손글씨 | NAVER (디자인 산돌) | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지, 수정본 RFN 'NanumPen' 등 사용 금지 | [nanum-pen-script.txt](../licenses/fonts/nanum-pen-script.txt) |
| 16 | 개구<br>`gaegu` | 손글씨 | JIKJI SOFT | SIL OFL 1.1 | 400·700 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [gaegu.txt](../licenses/fonts/gaegu.txt) |
| 17 | 하이멜로디<br>`hi-melody` | 손글씨 | YoonDesign | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [hi-melody.txt](../licenses/fonts/hi-melody.txt) |
| 18 | 감자꽃<br>`gamja-flower` | 손글씨 | YoonDesign | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [gamja-flower.txt](../licenses/fonts/gamja-flower.txt) |
| 19 | 동해독도<br>`east-sea-dokdo` | 손글씨 | YoonDesign | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [east-sea-dokdo.txt](../licenses/fonts/east-sea-dokdo.txt) |
| 20 | 나눔손글씨 붓<br>`nanum-brush-script` | 손글씨 | NAVER (디자인 산돌) | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지, 수정본 RFN 'NanumBrush' 등 사용 금지 | [nanum-brush-script.txt](../licenses/fonts/nanum-brush-script.txt) |
| 21 | 고운돋움<br>`gowun-dodum` | 둥근 | 류양희 (Yanghee Ryu) | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [gowun-dodum.txt](../licenses/fonts/gowun-dodum.txt) |
| 22 | 주아<br>`jua` | 둥근 | 우아한형제들 (배달의민족) | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [jua.txt](../licenses/fonts/jua.txt) |
| 23 | 동글<br>`dongle` | 둥근 | 류양희 (Yanghee Ryu) | SIL OFL 1.1 | 400·700 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [dongle.txt](../licenses/fonts/dongle.txt) |
| 24 | 카페24 써라운드<br>`cafe24-ssurround` | 둥근 | 카페24(주) | SIL OFL 1.1 | 300·700 | cdn.jsdelivr.net<br>통짜 woff | 글꼴 자체 유료 판매 금지. 번들·재배포 시 저작권 안내와 라이선스 전문 동봉(어려우면 출처 표기 권장). 수정본에도 OFL 적용. | [cafe24-ssurround.txt](../licenses/fonts/cafe24-ssurround.txt) |
| 25 | G마켓 산스<br>`gmarket-sans` | 강조 | G마켓(eBay Korea) | SIL OFL 1.1 | 300·500·700 | cdn.jsdelivr.net<br>통짜 woff | OFL 전문 동봉(배포 zip에 없음. 폰트 name 13 항목의 'Copyright 2019 eBay Korea, RFN Gmarket Sans Font' 문구로 직접 작성), 단독 판매 금지. 예약 이름이 있어 woff2 변환·서브셋본을 저장소에 넣으면 이름 변경이 필요함, 원본 TTF를 그대로 쓰면 무관 | [gmarket-sans.txt](../licenses/fonts/gmarket-sans.txt) |
| 26 | 검은고딕<br>`black-han-sans` | 강조 | Zess Type | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [black-han-sans.txt](../licenses/fonts/black-han-sans.txt) |
| 27 | 도현<br>`do-hyeon` | 강조 | 우아한형제들 (배달의민족) | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [do-hyeon.txt](../licenses/fonts/do-hyeon.txt) |
| 28 | 베이글 팻 원<br>`bagel-fat-one` | 강조 | JAMO Typeface | SIL OFL 1.1 | 400 | cdn.jsdelivr.net<br>조각(unicode-range) | OFL 전문·저작권 표기 동봉, 단독 판매 금지 | [bagel-fat-one.txt](../licenses/fonts/bagel-fat-one.txt) |
| 29 | SB 어그로체<br>`sb-aggro` | 강조 | (주)샌드박스네트워크 | 샌드박스 어그로체 라이선스(제작사 자체, OFL 성격) | 300·500·700 | cdn.jsdelivr.net<br>통짜 woff | 폰트 파일 유료 판매 금지. 결과물이 샌드박스 마케팅에 쓰일 수 있음(거부는 이메일로 요청). 라이선스 PDF 동봉 권장. | [sb-aggro.txt](../licenses/fonts/sb-aggro.txt) |
| 30 | 여기어때 잘난체<br>`jalnan` | 강조 | (주)여기어때컴퍼니(GC Company) | 여기어때 잘난체 라이선스(제작사 자체) | 700 | cdn.jsdelivr.net<br>통짜 woff | 글꼴 파일 유료 판매 금지. 어떤 형태로든 임의 수정·개작한 파일 재배포 금지. 임베딩된 폰트 별도 판매 불가. 번들 시 저작권 안내와 라이선스 전문(가이드 PDF) 동봉. | [jalnan.txt](../licenses/fonts/jalnan.txt) |

- 모든 글꼴은 조사에서 **영상 자막 사용·웹 삽입·앱 번들 재배포 허용**으로 확인됐어요. 여기어때 잘난체는 공식 가이드에서 임베딩(웹·서버 내 탑재)이 △로 표시돼 있고, 라이선스 전문을 함께 두면 번들·재배포가 가능하다고 적혀 있어요.
- 카페24 써라운드의 300 굵기는 별도 글꼴인 「써라운드 에어」예요.
- 에스코어드림·G마켓 산스·SB 어그로체·여기어때 잘난체·카페24 써라운드는 제작사 공식 배포가 아닌 눈누(projectnoonnu) jsDelivr 사본(버전 고정)에서 받아요. 공식 파일을 수정하지 않은 웹폰트 변환본이라 CDN 으로 불러오는 용도로만 써요.
- 라이선스 원문 파일을 고정 주소로 받을 수 없는 글꼴(에스코어드림·G마켓 산스·카페24 써라운드·나눔스퀘어·마루 부리·SB 어그로체·여기어때 잘난체)은 공식 안내 주소와 핵심 문구를 적은 안내 파일을 뒀어요. OFL 글꼴의 전문은 [OFL-1.1.txt](../licenses/fonts/OFL-1.1.txt) 예요.

## 확인 결과 (tests/pages/render-fonts.html, 2026-10-09)

- 30종 × 선언한 굵기 전부(65가지)를 불러와 `'가나다라 한글 자막 테스트 ABC abc 0123 ?!.,'` 의 빠진 글자를 검사했어요: **실패 0, 빠진 글자 0**.
- 빠진 글자 검사는 폭이 아주 다른 시험용 글꼴 두 개를 대체 글꼴로 붙여 재요. 프리텐다드에 없는 `ꙮ`·`😀` 를 실제로 찾아냈어요.
- 처음 받을 때 내려받은 양(합계 약 15.8MB, 헤드리스 Chrome, 캐시 없음): 통짜 파일은 굵기마다 0.2~1.8MB, 조각 글꼴은 이 문장 하나에 52~160KB 였어요. 네이버(hangeul.pstatic.net) 파일은 브라우저가 크기를 알려 주지 않아 합계에서 빠졌어요(조사 기록: 나눔스퀘어 0.23~0.28MB, 마루 부리 0.41~0.47MB).
