// Pluxy Service Worker for Offline & Android WebAPK Installation
const CACHE_NAME = "pluxy-cache-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./manifest.json",
  "./assets/pluxy-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./js/api.js",
  "./js/data.js",
  "./js/sync.js",
  "./js/gemini.js",
  "./js/app.js",
  "./js/modules/auth.js",
  "./js/modules/feed.js",
  "./js/modules/stories.js",
  "./js/modules/snaps.js",
  "./js/modules/chat.js",
  "./js/modules/calling.js",
  "./js/modules/camera.js",
  "./js/modules/reels.js",
  "./js/modules/explore.js",
  "./js/modules/snapmap.js",
  "./js/modules/ai.js",
  "./js/modules/ai_vision.js",
  "./js/modules/profile.js",
  "./js/modules/creator_studio.js",
  "./js/modules/admin.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Bypass cache completely for API calls, WebSockets, or non-GET methods
  if (e.request.method !== "GET" || url.pathname.startsWith("/api/") || url.pathname.startsWith("/ws")) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).then((networkRes) => {
        // Cache successful GET responses for static assets
        if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return networkRes;
      });
    }).catch(() => {
      // Only fallback to index.html for navigation requests
      if (e.request.mode === "navigate") {
        return caches.match("./index.html");
      }
    })
  );
});