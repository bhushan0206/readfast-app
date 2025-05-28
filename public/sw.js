// Service Worker for handling SPA navigation
const CACHE_NAME = 'readfast-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache, fallback to index.html for navigation
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // For navigation requests, serve index.html to handle SPA routing
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        
        return fetch(event.request);
      }
    )
  );
});