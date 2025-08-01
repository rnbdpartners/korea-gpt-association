// Service Worker for Korea GPT Association
const CACHE_NAME = 'kgpt-cache-v1';
const DYNAMIC_CACHE = 'kgpt-dynamic-v1';

// 캐시할 정적 자원
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/enterprise.html',
    '/enterprise-request.html',
    '/styles.css',
    '/enterprise.css',
    '/enterprise-request.css',
    '/css/progressive-enhancement.css',
    '/js/global-security.js',
    '/js/security-config.js',
    '/js/progressive-enhancement.js',
    '/js/error-handling.js',
    '/js/secure-enterprise-request.js',
    '/enterprise-request-enhanced.js',
    '/offline.html'
];

// 캐시하지 않을 URL 패턴
const NO_CACHE_PATTERNS = [
    /\/api\//,
    /\.json$/,
    /analytics/,
    /tracking/
];

// Service Worker 설치
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS.map(url => {
                    return new Request(url, { cache: 'reload' });
                }));
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.error('Service Worker: Cache failed', err);
            })
    );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        // 오래된 캐시 삭제
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch 이벤트 처리
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 같은 출처의 요청만 처리
    if (url.origin !== location.origin) {
        return;
    }
    
    // 캐시하지 않을 패턴 확인
    if (NO_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        event.respondWith(networkOnly(request));
        return;
    }
    
    // 네비게이션 요청 (HTML)
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // 이미지, CSS, JS 등의 자원
    if (request.destination === 'image' || 
        request.destination === 'style' || 
        request.destination === 'script') {
        event.respondWith(cacheFirst(request));
        return;
    }
    
    // 기타 요청
    event.respondWith(networkFirst(request));
});

// 네트워크 우선 전략
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // 성공적인 응답이면 캐시에 저장
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // 네트워크 실패 시 캐시에서 찾기
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // HTML 요청이고 캐시에도 없으면 오프라인 페이지 반환
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        
        throw error;
    }
}

// 캐시 우선 전략
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // 백그라운드에서 업데이트
        updateCache(request);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        // 성공적인 응답이면 캐시에 저장
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // 실패 시 기본 응답 반환
        return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// 네트워크만 사용
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// 백그라운드 캐시 업데이트
async function updateCache(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response);
        }
    } catch (error) {
        // 조용히 실패
    }
}

// 메시지 처리
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
    
    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE).then(cache => {
                return cache.addAll(event.data.urls);
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// 백그라운드 동기화 (지원하는 브라우저에서)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncFormData());
    }
});

// 폼 데이터 동기화
async function syncFormData() {
    try {
        // IndexedDB에서 저장된 폼 데이터 가져오기
        const db = await openDB();
        const tx = db.transaction('pendingForms', 'readonly');
        const store = tx.objectStore('pendingForms');
        const forms = await store.getAll();
        
        // 각 폼 데이터 전송 시도
        for (const formData of forms) {
            try {
                const response = await fetch(formData.url, {
                    method: 'POST',
                    headers: formData.headers,
                    body: formData.body
                });
                
                if (response.ok) {
                    // 성공하면 삭제
                    const deleteTx = db.transaction('pendingForms', 'readwrite');
                    await deleteTx.objectStore('pendingForms').delete(formData.id);
                }
            } catch (error) {
                console.error('Sync failed for form:', error);
            }
        }
    } catch (error) {
        console.error('Sync error:', error);
    }
}

// IndexedDB 열기
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('KGPTDatabase', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pendingForms')) {
                db.createObjectStore('pendingForms', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// 푸시 알림 (지원하는 브라우저에서)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '자세히 보기',
                icon: '/icons/checkmark.png'
            },
            {
                action: 'close',
                title: '닫기',
                icon: '/icons/xmark.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('한국GPT협회', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});