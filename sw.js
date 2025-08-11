const CACHE_NAME = 'bantay-barangay-v1';
const STATIC_CACHE_URLS = [
    '/',
    '/index.php',
    '/pages/rescue-form.php',
    '/pages/alerts.php',
    '/pages/dashboard.php',
    '/assets/css/style.css',
    '/assets/js/rescue-form.js',
    '/assets/js/dashboard.js',
    '/includes/header.php',
    '/includes/footer.php',
    // Bootstrap CDN files
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS.map(url => 
                    url.startsWith('http') ? url : new URL(url, self.location.origin).href
                ));
            })
            .catch(error => {
                console.error('Cache installation failed:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Handle API requests differently
    if (event.request.url.includes('/api/')) {
        event.respondWith(handleApiRequest(event.request));
        return;
    }
    
    // Handle static assets and pages
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then(response => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Offline fallback
                        if (event.request.destination === 'document') {
                            return caches.match('/pages/offline.html') || 
                                   new Response('Offline - Please check your connection', {
                                       status: 503,
                                       statusText: 'Service Unavailable'
                                   });
                        }
                        
                        // Return offline page for navigation requests
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Handle API requests with offline support
async function handleApiRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);
        
        // Cache successful API responses for offline use
        if (response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // If network fails, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API calls
        return new Response(JSON.stringify({
            success: false,
            error: 'Offline - Data not available',
            offline: true
        }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// Background sync for offline rescue requests
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync-rescue') {
        event.waitUntil(syncOfflineRequests());
    }
});

// Sync offline rescue requests when connection is restored
async function syncOfflineRequests() {
    try {
        // Get offline requests from IndexedDB
        const offlineRequests = await getOfflineRequests();
        
        for (const request of offlineRequests) {
            try {
                const response = await fetch('/api/submit-rescue.php', {
                    method: 'POST',
                    body: request.formData
                });
                
                if (response.ok) {
                    // Remove from offline storage
                    await removeOfflineRequest(request.id);
                    
                    // Notify user of successful sync
                    self.registration.showNotification('Rescue Request Sent', {
                        body: 'Your offline rescue request has been successfully submitted.',
                        icon: '/assets/images/notification-icon.png',
                        badge: '/assets/images/badge-icon.png',
                        tag: 'rescue-sync-success'
                    });
                }
            } catch (error) {
                console.error('Failed to sync rescue request:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notification handling
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New emergency alert',
        icon: '/assets/images/notification-icon.png',
        badge: '/assets/images/badge-icon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Alert',
                icon: '/assets/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/images/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('BantayBarangay Alert', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        // Open the alerts page
        event.waitUntil(
            clients.openWindow('/pages/alerts.php')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Placeholder functions for IndexedDB operations
// (These would need to be implemented with actual IndexedDB code)
async function getOfflineRequests() {
    // Implementation needed: Get offline requests from IndexedDB
    return [];
}

async function removeOfflineRequest(id) {
    // Implementation needed: Remove request from IndexedDB
    return true;
}

// Message handling for cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('BantayBarangay Service Worker installed and active');
