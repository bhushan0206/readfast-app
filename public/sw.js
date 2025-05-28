// Service Worker - DISABLED for OAuth compatibility
console.log('Service Worker disabled to fix OAuth callback issues');

// Don't intercept any requests - let them pass through normally
self.addEventListener('fetch', (event) => {
  // Do nothing - let all requests pass through
  return;
});

self.addEventListener('install', (event) => {
  console.log('Service Worker installing but disabled');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating but disabled');
  event.waitUntil(self.clients.claim());
});