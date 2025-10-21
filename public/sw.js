// 🚀 The Freedom Compass - ROBUST Service Worker
// Version 3.0 - Prevents white screen issues on updates

const CACHE_VERSION = 'freedom-compass-v3.0';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// ⚠️ CRITICAL: Minimal caching to prevent white screen issues
// We ONLY cache essential offline assets, NOT the main bundle
const PRECACHE_URLS = [
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Install event - cache only essentials
self.addEventListener('install', (event) => {
  console.log('🚀 [SW] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🚀 [SW] Caching essential assets');
        return cache.addAll(PRECACHE_URLS.map(url => new Request(url, {
          cache: 'reload' // Force fresh fetch
        })));
      })
      .then(() => {
        console.log('🚀 [SW] Installation complete, waiting to activate');
        // DON'T skipWaiting() automatically - let UpdateNotification control it
      })
      .catch((error) => {
        console.error('🚀 [SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete ALL caches that don't match current version
            if (cacheName.startsWith('freedom-compass-') && 
                cacheName !== CACHE_NAME && 
                cacheName !== RUNTIME_CACHE) {
              console.log('🚀 [SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('🚀 [SW] Claiming all clients');
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients that new SW is active
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_ACTIVATED',
              version: CACHE_VERSION
            });
          });
        });
      })
  );
});

// Fetch event - NETWORK-FIRST strategy to prevent white screen
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // ⚠️ CRITICAL: HTML documents ALWAYS fetch from network first
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Return fresh HTML
          return response;
        })
        .catch(() => {
          // Only use cache if OFFLINE
          return caches.match('/index.html').then((cached) => {
            return cached || new Response(
              '<html><body><h1>Offline</h1><p>Please check your connection</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }
  
  // ⚠️ CRITICAL: JavaScript/CSS ALWAYS fetch from network first
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      url.pathname.includes('/static/js/') ||
      url.pathname.includes('/static/css/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses for offline fallback ONLY
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache ONLY if offline
          return caches.match(request);
        })
    );
    return;
  }
  
  // Firebase/API requests - network first, cache fallback
  if (url.hostname.includes('firebaseapp.com') || 
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebaseio.com') ||
      url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached data if offline
          return caches.match(request);
        })
    );
    return;
  }
  
  // Images and fonts - cache first (safe to cache)
  if (request.destination === 'image' || 
      request.destination === 'font' ||
      url.pathname.match(/\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            return cached;
          }
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
    return;
  }
  
  // Everything else - network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Listen for skip waiting message (from UpdateNotification component)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🚀 [SW] Received SKIP_WAITING message, activating new version');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    console.log('🚀 [SW] Claiming clients');
    self.clients.claim();
  }
});

// Periodic cache cleanup (run when SW is idle)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.keys().then((requests) => {
          // Delete cached items older than 7 days
          const now = Date.now();
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
          
          return Promise.all(
            requests.map((request) => {
              return cache.match(request).then((response) => {
                if (response) {
                  const dateHeader = response.headers.get('date');
                  if (dateHeader) {
                    const age = now - new Date(dateHeader).getTime();
                    if (age > maxAge) {
                      console.log('🚀 [SW] Deleting old cache entry:', request.url);
                      return cache.delete(request);
                    }
                  }
                }
              });
            })
          );
        });
      })
    );
  }
});

// Push notification support (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      },
      actions: [
        { action: 'open', title: 'Open App' },
        { action: 'close', title: 'Dismiss' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise, open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('🚀 [SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🚀 [SW] Unhandled rejection:', event.reason);
});

console.log('🚀 [SW] Service Worker script loaded, version:', CACHE_VERSION);
