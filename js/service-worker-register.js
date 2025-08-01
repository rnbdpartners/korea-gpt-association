// Service Worker 등록 및 관리

(function() {
    'use strict';
    
    // Service Worker 지원 확인
    if (!('serviceWorker' in navigator)) {
        console.log('Service Worker is not supported');
        return;
    }
    
    // Service Worker 등록
    window.addEventListener('load', () => {
        registerServiceWorker();
    });
    
    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });
            
            console.log('Service Worker registered successfully:', registration.scope);
            
            // 업데이트 확인
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('Service Worker update found');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // 새 버전 사용 가능
                        showUpdateNotification(newWorker);
                    }
                });
            });
            
            // 주기적 업데이트 확인 (1시간마다)
            setInterval(() => {
                registration.update();
            }, 60 * 60 * 1000);
            
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
    
    // 업데이트 알림 표시
    function showUpdateNotification(worker) {
        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <div class="sw-update-content">
                <div class="sw-update-icon">🔄</div>
                <div class="sw-update-text">
                    <h4>새로운 버전이 있습니다</h4>
                    <p>페이지를 새로고침하여 최신 버전을 사용하세요.</p>
                </div>
                <div class="sw-update-actions">
                    <button class="sw-update-btn" onclick="updateServiceWorker()">
                        지금 업데이트
                    </button>
                    <button class="sw-dismiss-btn" onclick="dismissUpdateNotification(this)">
                        나중에
                    </button>
                </div>
            </div>
        `;
        
        // 스타일 추가
        if (!document.getElementById('sw-update-styles')) {
            const style = document.createElement('style');
            style.id = 'sw-update-styles';
            style.textContent = `
                .sw-update-notification {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    max-width: 500px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                    z-index: 100000;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease-out;
                }
                
                .sw-update-notification.show {
                    transform: translateY(0);
                    opacity: 1;
                }
                
                .sw-update-content {
                    display: flex;
                    align-items: center;
                    padding: 20px;
                    gap: 15px;
                }
                
                .sw-update-icon {
                    font-size: 32px;
                    flex-shrink: 0;
                }
                
                .sw-update-text {
                    flex: 1;
                }
                
                .sw-update-text h4 {
                    margin: 0 0 4px 0;
                    font-size: 16px;
                    color: #333;
                }
                
                .sw-update-text p {
                    margin: 0;
                    font-size: 14px;
                    color: #666;
                }
                
                .sw-update-actions {
                    display: flex;
                    gap: 10px;
                    flex-shrink: 0;
                }
                
                .sw-update-btn,
                .sw-dismiss-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .sw-update-btn {
                    background: #2196F3;
                    color: white;
                }
                
                .sw-update-btn:hover {
                    background: #1976D2;
                }
                
                .sw-dismiss-btn {
                    background: #f5f5f5;
                    color: #666;
                }
                
                .sw-dismiss-btn:hover {
                    background: #e0e0e0;
                }
                
                @media (max-width: 480px) {
                    .sw-update-notification {
                        left: 10px;
                        right: 10px;
                    }
                    
                    .sw-update-content {
                        flex-wrap: wrap;
                    }
                    
                    .sw-update-actions {
                        width: 100%;
                        margin-top: 10px;
                    }
                    
                    .sw-update-btn,
                    .sw-dismiss-btn {
                        flex: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 애니메이션
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 전역 함수 등록
        window.updateServiceWorker = () => {
            worker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        };
        
        window.dismissUpdateNotification = (button) => {
            const notification = button.closest('.sw-update-notification');
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };
    }
    
    // Service Worker 메시지 처리
    navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Message from Service Worker:', event.data);
    });
    
    // 오프라인/온라인 상태 처리
    window.addEventListener('online', () => {
        console.log('Back online');
        hideOfflineNotification();
    });
    
    window.addEventListener('offline', () => {
        console.log('Gone offline');
        showOfflineNotification();
    });
    
    // 오프라인 알림
    function showOfflineNotification() {
        if (document.getElementById('offline-notification')) return;
        
        const notification = document.createElement('div');
        notification.id = 'offline-notification';
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="offline-content">
                <span class="offline-icon">📡</span>
                <span class="offline-text">오프라인 모드 - 일부 기능이 제한될 수 있습니다</span>
            </div>
        `;
        
        // 스타일 추가
        if (!document.getElementById('offline-styles')) {
            const style = document.createElement('style');
            style.id = 'offline-styles';
            style.textContent = `
                .offline-notification {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #f44336;
                    color: white;
                    z-index: 100001;
                    transform: translateY(-100%);
                    transition: transform 0.3s ease-out;
                }
                
                .offline-notification.show {
                    transform: translateY(0);
                }
                
                .offline-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 10px;
                    font-size: 14px;
                }
                
                .offline-icon {
                    font-size: 18px;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
    }
    
    function hideOfflineNotification() {
        const notification = document.getElementById('offline-notification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }
    
    // 캐시 관리 API
    window.ServiceWorkerCache = {
        // 캐시 클리어
        clear: async function() {
            if (!navigator.serviceWorker.controller) return false;
            
            return new Promise((resolve) => {
                const channel = new MessageChannel();
                channel.port1.onmessage = (event) => {
                    resolve(event.data.success);
                };
                
                navigator.serviceWorker.controller.postMessage({
                    type: 'CLEAR_CACHE'
                }, [channel.port2]);
            });
        },
        
        // 특정 URL 캐시
        cacheUrls: async function(urls) {
            if (!navigator.serviceWorker.controller) return false;
            
            return new Promise((resolve) => {
                const channel = new MessageChannel();
                channel.port1.onmessage = (event) => {
                    resolve(event.data.success);
                };
                
                navigator.serviceWorker.controller.postMessage({
                    type: 'CACHE_URLS',
                    urls: urls
                }, [channel.port2]);
            });
        }
    };
    
    // 백그라운드 동기화 등록
    if ('SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
            // 폼 제출 시 백그라운드 동기화 등록
            window.registerBackgroundSync = async function(tag) {
                try {
                    await registration.sync.register(tag);
                    console.log('Background sync registered:', tag);
                } catch (error) {
                    console.error('Background sync registration failed:', error);
                }
            };
        });
    }
    
})();