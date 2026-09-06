// Pluxy Service Worker for Offline & Android WebAPK Installation
const CACHE_NAME = "pluxy-cache-v1";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./manifest.json",
  "./assets/pluxy-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./js/data.js",
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
  "./js/modules/profile.js"
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
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    }).catch(() => {
      return caches.match("./index.html");
    })
  );
});