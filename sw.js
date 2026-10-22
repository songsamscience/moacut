/* 모아컷 서비스 워커 — 하나만 둔다(DESIGN_V3_A §8, 옛 coi-sw.js 를 대신함).
   (a) 같은 출처 응답(캐시에서 꺼낸 것 포함)에 COOP/COEP 머리글 → 머리글을 못 붙이는 정적 호스팅(GitHub Pages)에서도 교차 출처 격리.
   (b) 빌드 산출물(앱 셸 · ffmpeg 코어 · 음성 인식 런타임 · 워커 · 화면 글꼴)을 미리 캐시 → 서버가 꺼져도 열림.
       목록은 빌드 때 vite.config.ts 가 아래 PRECACHE 자리에 넣는다(개발 서버에서는 비어 있음 — 늘 네트워크).
   (c) 버전이 박힌 jsDelivr 글꼴 · CSS 주소와 hangeul.pstatic.net 글꼴만 캐시 우선(앱이 'moacut-fonts-v2'에 받아 둔 것을 내줌).
       huggingface · 모델 주소는 건드리지 않는다(음성 인식 · AI 보이스가 자기 캐시를 가짐).
   (d) v4 기본 소재 자료실(같은 출처 library/): 소재 파일은 처음 쓸 때 받아 'moacut-library-v1' 에 담고 다음부터 캐시 먼저(오프라인에서도 열림).
       목록(index.json · catalog/*.json)은 네트워크 먼저 · 안 되면 캐시(목록이 바뀌면 바로 보이게). 부분 요청(Range) 응답은 담지 않는다.
   사용자 파일을 저장하거나 밖으로 보내지 않는다. */
const PRECACHE = {"version":"e14673c02191","files":["./","./assets/OpenRAIL-M-supertonic-3-SLf1qXVv.js","./assets/asrWorker-VlGGvF67.js","./assets/index-CX66tlxK.css","./assets/index-DSEWDWbP.js","./assets/modelWorker-DrCnqtuc.js","./assets/ort-wasm-simd-threaded.jsep-B0T3yYHD.wasm","./assets/ort-wasm-simd-threaded.jsep-B0TxsgQ-.mjs","./assets/trackerWorker-CIvfOR4v.js","./assets/ttsWorker-D5tNPZ1-.js","./assets/vitsWorker-CUkWoPFI.js","./assets/worker-DYSz7Krg.js","./ffmpeg/ffmpeg-core.js","./ffmpeg/ffmpeg-core.wasm","./fonts/pretendard/LICENSE.txt","./fonts/pretendard/Pretendard-Bold.woff2","./fonts/pretendard/Pretendard-Medium.woff2","./fonts/pretendard/Pretendard-Regular.woff2","./fonts/pretendard/Pretendard-SemiBold.woff2","./fonts/pretendard/pretendard.css","./index.html","./models/silero_vad.onnx","./models/songsam_ko.json","./models/songsam_ko.onnx","./voices/ko-f1.mp3","./voices/ko-f2.mp3","./voices/ko-f3.mp3","./voices/ko-f4.mp3","./voices/ko-f5.mp3","./voices/ko-f6.mp3","./voices/ko-m1.mp3","./voices/ko-m2.mp3","./voices/ko-m3.mp3","./voices/ko-m4.mp3","./voices/ko-m5.mp3","./voices/ko-m6.mp3","./voices/ss-f07.mp3","./voices/ss-f08.mp3","./voices/ss-f09.mp3","./voices/ss-f10.mp3","./voices/ss-f11.mp3","./voices/ss-f12.mp3","./voices/ss-f13.mp3","./voices/ss-f14.mp3","./voices/ss-f15.mp3","./voices/ss-f16.mp3","./voices/ss-f17.mp3","./voices/ss-f18.mp3","./voices/ss-m07.mp3","./voices/ss-m08.mp3","./voices/ss-m09.mp3","./voices/ss-m10.mp3","./voices/ss-m11.mp3","./voices/ss-m12.mp3","./voices/ss-m13.mp3","./voices/ss-m14.mp3","./voices/ss-m15.mp3","./voices/ss-m16.mp3","./voices/ss-m17.mp3","./voices/voices.json"]}
const SHELL_PREFIX = 'moacut-shell-'
const SHELL = SHELL_PREFIX + (PRECACHE ? PRECACHE.version : 'dev')
const FONT_CACHE = 'moacut-fonts-v2'
const FONT_CACHES = [FONT_CACHE, 'moacut-fonts-v1']
const LIB_CACHE = 'moacut-library-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      if (PRECACHE && PRECACHE.files.length) {
        const c = await caches.open(SHELL)
        await c.addAll(PRECACHE.files)
      }
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith(SHELL_PREFIX) && k !== SHELL) await caches.delete(k)
      await self.clients.claim()
    })(),
  )
})

function isolate(res) {
  if (!res || res.status === 0 || res.type === 'opaque' || res.type === 'opaqueredirect') return res
  const h = new Headers(res.headers)
  h.set('Cross-Origin-Opener-Policy', 'same-origin')
  h.set('Cross-Origin-Embedder-Policy', 'credentialless')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
}

/** 버전이 박힌 글꼴 주소만 */
function isFontUrl(u) {
  if (u.hostname === 'hangeul.pstatic.net') return /\.(woff2?|ttf|otf|css)$/i.test(u.pathname)
  if (u.hostname === 'cdn.jsdelivr.net') return /@[\w.-]*\d[\w.-]*\//.test(u.pathname) && /\.(woff2?|ttf|otf|css)$/i.test(u.pathname)
  return false
}

async function sameOrigin(req) {
  try {
    return isolate(await fetch(req))
  } catch (err) {
    // 서버에 닿지 않음(오프라인) → 미리 캐시한 앱 셸
    const c = await caches.open(SHELL)
    let hit = await c.match(req, { ignoreSearch: true })
    if (!hit && req.mode === 'navigate') hit = (await c.match('./index.html')) || (await c.match('./'))
    if (hit) return isolate(hit)
    throw err
  }
}

async function fontFirst(req) {
  for (const name of FONT_CACHES) {
    if (name !== FONT_CACHE && !(await caches.has(name))) continue
    const hit = await (await caches.open(name)).match(req.url)
    if (hit) return hit
  }
  const res = await fetch(req)
  if (res.ok && (res.type === 'cors' || res.type === 'basic')) {
    const c = await caches.open(FONT_CACHE)
    await c.put(req.url, res.clone()).catch(() => undefined)
  }
  return res
}

/** 자료실 경로(서비스 워커 범위 아래 library/ — GitHub Pages 하위 경로에서도) */
function isLibrary(u) {
  return u.origin === self.location.origin && u.pathname.startsWith(new URL('library/', self.registration.scope).pathname)
}

async function libraryFetch(req) {
  const u = new URL(req.url)
  const isList = /\/library\/(index\.json|catalog\/)/.test(u.pathname)
  const ranged = req.headers.has('range')
  const c = await caches.open(LIB_CACHE)
  if (!isList) {
    const hit = await c.match(req.url)
    if (hit) return isolate(hit)
  }
  try {
    const res = await fetch(req)
    if (res.status === 200 && !ranged && res.type === 'basic') await c.put(req.url, res.clone()).catch(() => undefined)
    return isolate(res)
  } catch (err) {
    const hit = await c.match(req.url)
    if (hit) return isolate(hit)
    throw err
  }
}

self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET') return
  if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return
  const u = new URL(r.url)
  if (isLibrary(u)) e.respondWith(libraryFetch(r))
  else if (u.origin === self.location.origin) e.respondWith(sameOrigin(r))
  else if (isFontUrl(u)) e.respondWith(fontFirst(r))
})
