/* 모아컷 서비스 워커 — 하나만 둔다(DESIGN_V3_A §8, 옛 coi-sw.js 를 대신함).
   (a) 같은 출처 응답(캐시에서 꺼낸 것 포함)에 COOP/COEP 머리글 → 머리글을 못 붙이는 정적 호스팅(GitHub Pages)에서도 교차 출처 격리.
   (b) 빌드 산출물(앱 셸 · ffmpeg 코어 · 음성 인식 런타임 · 워커 · 화면 글꼴)을 미리 캐시 → 서버가 꺼져도 열림.
       목록은 빌드 때 vite.config.ts 가 아래 PRECACHE 자리에 넣는다(개발 서버에서는 비어 있음 — 늘 네트워크).
   (c) 버전이 박힌 jsDelivr 글꼴 · CSS 주소와 hangeul.pstatic.net 글꼴만 캐시 우선(앱이 'moacut-fonts-v2'에 받아 둔 것을 내줌).
       huggingface · 모델 주소는 건드리지 않는다(음성 인식 · AI 보이스가 자기 캐시를 가짐).
   (d) v4 기본 소재 자료실(같은 출처 library/): 소재 파일은 처음 쓸 때 받아 'moacut-library-v1' 에 담고 다음부터 캐시 먼저(오프라인에서도 열림).
       목록(index.json · catalog/*.json)은 네트워크 먼저 · 안 되면 캐시(목록이 바뀌면 바로 보이게). 부분 요청(Range) 응답은 담지 않는다.
   (e) 조각 요청(Range — <audio> · <video> 가 보냄): 사파리는 요청한 조각만 담은 206 응답이어야 재생한다(캐시의 통째 응답 200 은 못 틀고,
       머리글을 다시 붙인 응답도 말썽 — 아이폰 소리 안 남, 2026-11-01). 자료실 파일은 담아 뒀으면 그 조각을 206 으로 잘라 주고(오프라인) 아니면
       네트워크 응답 그대로, 그 밖의 조각 요청은 서비스 워커를 거치지 않는다(격리 머리글은 문서 · 워커에만 필요).
   사용자 파일을 저장하거나 밖으로 보내지 않는다. */
const PRECACHE = {"version":"1316b4c60224","files":["./","./assets/OpenRAIL-M-supertonic-3-SLf1qXVv.js","./assets/asrWorker-VlGGvF67.js","./assets/index-CX66tlxK.css","./assets/index-j1UdAZZb.js","./assets/modelWorker-DrCnqtuc.js","./assets/ort-wasm-simd-threaded.jsep-B0T3yYHD.wasm","./assets/ort-wasm-simd-threaded.jsep-B0TxsgQ-.mjs","./assets/trackerWorker-CIvfOR4v.js","./assets/ttsWorker-vlIZ4Lpu.js","./assets/vitsWorker-DeDNDHQb.js","./assets/worker-DYSz7Krg.js","./ffmpeg/ffmpeg-core.js","./ffmpeg/ffmpeg-core.wasm","./fonts/pretendard/LICENSE.txt","./fonts/pretendard/Pretendard-Bold.woff2","./fonts/pretendard/Pretendard-Medium.woff2","./fonts/pretendard/Pretendard-Regular.woff2","./fonts/pretendard/Pretendard-SemiBold.woff2","./fonts/pretendard/pretendard.css","./index.html","./models/silero_vad.onnx","./models/songsam_ko.json","./models/songsam_ko.onnx","./voices/ko-f1.mp3","./voices/ko-f2.mp3","./voices/ko-f3.mp3","./voices/ko-f4.mp3","./voices/ko-f5.mp3","./voices/ko-f6.mp3","./voices/ko-m1.mp3","./voices/ko-m2.mp3","./voices/ko-m3.mp3","./voices/ko-m4.mp3","./voices/ko-m5.mp3","./voices/ko-m6.mp3","./voices/ss-f07.mp3","./voices/ss-f08.mp3","./voices/ss-f09.mp3","./voices/ss-f10.mp3","./voices/ss-f11.mp3","./voices/ss-f12.mp3","./voices/ss-f13.mp3","./voices/ss-f14.mp3","./voices/ss-f15.mp3","./voices/ss-f16.mp3","./voices/ss-f17.mp3","./voices/ss-f18.mp3","./voices/ss-m07.mp3","./voices/ss-m08.mp3","./voices/ss-m09.mp3","./voices/ss-m10.mp3","./voices/ss-m11.mp3","./voices/ss-m12.mp3","./voices/ss-m13.mp3","./voices/ss-m14.mp3","./voices/ss-m15.mp3","./voices/ss-m16.mp3","./voices/ss-m17.mp3","./voices/voices.json"]}
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

/** (e) 자료실 조각 요청: 담아 둔 파일이면 206 조각, 없으면 네트워크 응답 그대로 */
async function libraryRange(req) {
  const hit = await (await caches.open(LIB_CACHE)).match(req.url)
  if (!hit) return fetch(req)
  const blob = await hit.blob()
  const size = blob.size
  const m = /^bytes=(\d*)-(\d*)$/.exec((req.headers.get('range') || '').trim())
  let start = m && m[1] ? +m[1] : 0
  let end = m && m[2] ? +m[2] : size - 1
  if (m && !m[1] && m[2]) [start, end] = [Math.max(0, size - +m[2]), size - 1] // 끝에서 N 바이트
  end = Math.min(end, size - 1)
  if (!m || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: { 'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' },
  })
}

self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET') return
  if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return
  const u = new URL(r.url)
  if (r.headers.has('range')) {
    if (isLibrary(u)) e.respondWith(libraryRange(r))
    return
  }
  if (isLibrary(u)) e.respondWith(libraryFetch(r))
  else if (u.origin === self.location.origin) e.respondWith(sameOrigin(r))
  else if (isFontUrl(u)) e.respondWith(fontFirst(r))
})
