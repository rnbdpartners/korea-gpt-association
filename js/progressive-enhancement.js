// Progressive Enhancement 구현
(function() {
    'use strict';
    
    // 기능 지원 체크
    const FeatureDetection = {
        // JavaScript 지원
        hasJavaScript: true, // 이 코드가 실행되면 JS 지원
        
        // 로컬 스토리지 지원
        hasLocalStorage: (function() {
            try {
                const test = 'test';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch(e) {
                return false;
            }
        })(),
        
        // 세션 스토리지 지원
        hasSessionStorage: (function() {
            try {
                const test = 'test';
                sessionStorage.setItem(test, test);
                sessionStorage.removeItem(test);
                return true;
            } catch(e) {
                return false;
            }
        })(),
        
        // Fetch API 지원
        hasFetch: 'fetch' in window,
        
        // Promise 지원
        hasPromise: 'Promise' in window,
        
        // FormData 지원
        hasFormData: 'FormData' in window,
        
        // IntersectionObserver 지원
        hasIntersectionObserver: 'IntersectionObserver' in window,
        
        // Service Worker 지원
        hasServiceWorker: 'serviceWorker' in navigator,
        
        // 드래그 앤 드롭 지원
        hasDragDrop: 'draggable' in document.createElement('span'),
        
        // 파일 API 지원
        hasFileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob)
    };
    
    // 브라우저 기능에 따른 폴리필 로드
    function loadPolyfills() {
        const polyfills = [];
        
        // Promise 폴리필
        if (!FeatureDetection.hasPromise) {
            polyfills.push('https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js');
        }
        
        // Fetch 폴리필
        if (!FeatureDetection.hasFetch) {
            polyfills.push('https://cdn.jsdelivr.net/npm/whatwg-fetch@3/dist/fetch.umd.js');
        }
        
        // IntersectionObserver 폴리필
        if (!FeatureDetection.hasIntersectionObserver) {
            polyfills.push('https://cdn.jsdelivr.net/npm/intersection-observer@0.12.0/intersection-observer.js');
        }
        
        return Promise.all(polyfills.map(url => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = url;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }));
    }
    
    // 기본 기능 제공 (JavaScript 비활성화 시)
    function setupBasicFunctionality() {
        // HTML 클래스 토글
        document.documentElement.classList.remove('no-js');
        document.documentElement.classList.add('js');
        
        // 기능 지원 클래스 추가
        Object.keys(FeatureDetection).forEach(feature => {
            if (FeatureDetection[feature]) {
                document.documentElement.classList.add(feature);
            }
        });
    }
    
    // 폼 향상
    function enhanceForms() {
        // 모든 폼에 novalidate 속성 추가 (커스텀 검증 사용)
        document.querySelectorAll('form').forEach(form => {
            if (FeatureDetection.hasJavaScript) {
                form.setAttribute('novalidate', '');
            }
            
            // 제출 버튼 중복 클릭 방지
            form.addEventListener('submit', function(e) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.disabled = true;
                    
                    // 타임아웃 설정 (폼 처리 실패 시 재활성화)
                    setTimeout(() => {
                        submitBtn.disabled = false;
                    }, 5000);
                }
            });
        });
        
        // 입력 필드 자동 완성 향상
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.setAttribute('autocomplete', 'email');
            input.setAttribute('inputmode', 'email');
        });
        
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.setAttribute('autocomplete', 'tel');
            input.setAttribute('inputmode', 'tel');
        });
        
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.setAttribute('inputmode', 'numeric');
        });
    }
    
    // 이미지 지연 로딩
    function setupLazyLoading() {
        if (FeatureDetection.hasIntersectionObserver) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // 폴백: 모든 이미지 즉시 로드
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
    
    // 파일 업로드 향상
    function enhanceFileUpload() {
        if (!FeatureDetection.hasFileAPI || !FeatureDetection.hasDragDrop) {
            // 드래그 앤 드롭 비활성화, 기본 파일 선택만 사용
            document.querySelectorAll('.upload-area').forEach(area => {
                area.classList.add('no-drag-drop');
                
                const dragText = area.querySelector('p');
                if (dragText && dragText.textContent.includes('드래그')) {
                    dragText.textContent = '클릭하여 파일을 선택하세요';
                }
            });
        }
    }
    
    // 애니메이션 성능 최적화
    function optimizeAnimations() {
        // 사용자 설정 확인
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.documentElement.classList.add('reduce-motion');
            
            // CSS에서 처리
            const style = document.createElement('style');
            style.textContent = `
                .reduce-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 키보드 접근성 향상
    function enhanceKeyboardAccessibility() {
        // 탭 포커스 스타일링
        let isTabbing = false;
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                isTabbing = true;
                document.documentElement.classList.add('keyboard-nav');
            }
        });
        
        document.addEventListener('mousedown', () => {
            isTabbing = false;
            document.documentElement.classList.remove('keyboard-nav');
        });
        
        // Skip to content 링크 추가
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content';
        skipLink.textContent = '본문으로 건너뛰기';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 100000;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // 메인 컨텐츠에 ID 추가
        const mainContent = document.querySelector('main') || document.querySelector('.container');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }
    
    // ARIA 속성 추가
    function enhanceARIA() {
        // 로딩 상태 표시
        document.querySelectorAll('.loading').forEach(el => {
            el.setAttribute('aria-busy', 'true');
            el.setAttribute('aria-live', 'polite');
        });
        
        // 에러 메시지
        document.querySelectorAll('.error-message').forEach(el => {
            el.setAttribute('role', 'alert');
            el.setAttribute('aria-live', 'assertive');
        });
        
        // 필수 필드
        document.querySelectorAll('input[required], select[required], textarea[required]').forEach(el => {
            el.setAttribute('aria-required', 'true');
        });
        
        // 폼 그룹 라벨링
        document.querySelectorAll('.form-group').forEach(group => {
            const label = group.querySelector('label');
            const input = group.querySelector('input, select, textarea');
            
            if (label && input && !input.id) {
                const id = `field_${Math.random().toString(36).substr(2, 9)}`;
                input.id = id;
                label.setAttribute('for', id);
            }
        });
    }
    
    // 네트워크 상태 감지
    function setupNetworkDetection() {
        let isOnline = navigator.onLine;
        
        function updateNetworkStatus() {
            isOnline = navigator.onLine;
            document.documentElement.classList.toggle('offline', !isOnline);
            
            if (!isOnline) {
                showOfflineMessage();
            } else {
                hideOfflineMessage();
            }
        }
        
        function showOfflineMessage() {
            const message = document.createElement('div');
            message.id = 'offline-message';
            message.className = 'offline-notification';
            message.innerHTML = `
                <i class="fas fa-wifi-slash"></i>
                <span>인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.</span>
            `;
            message.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f44336;
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            `;
            
            document.body.appendChild(message);
        }
        
        function hideOfflineMessage() {
            const message = document.getElementById('offline-message');
            if (message) {
                message.remove();
            }
        }
        
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        
        // 초기 상태 설정
        updateNetworkStatus();
    }
    
    // 성능 모니터링
    function setupPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            // Long Task 감지
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('Long task detected:', entry);
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // Long task API를 지원하지 않는 브라우저
            }
            
            // 페이지 로드 성능
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
                        console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
                    }
                }, 0);
            });
        }
    }
    
    // CSS 지원 감지 및 폴백
    function setupCSSFallbacks() {
        // CSS Grid 지원
        if (!CSS.supports('display', 'grid')) {
            document.documentElement.classList.add('no-grid');
        }
        
        // CSS 변수 지원
        if (!CSS.supports('--test', '0')) {
            document.documentElement.classList.add('no-css-vars');
        }
        
        // Flexbox 지원
        if (!CSS.supports('display', 'flex')) {
            document.documentElement.classList.add('no-flexbox');
        }
    }
    
    // 초기화
    function init() {
        setupBasicFunctionality();
        
        // 폴리필 로드 후 기능 향상
        loadPolyfills().then(() => {
            enhanceForms();
            setupLazyLoading();
            enhanceFileUpload();
            optimizeAnimations();
            enhanceKeyboardAccessibility();
            enhanceARIA();
            setupNetworkDetection();
            setupPerformanceMonitoring();
            setupCSSFallbacks();
            
            // 초기화 완료 이벤트
            window.dispatchEvent(new CustomEvent('progressive-enhancement-ready'));
        }).catch(error => {
            console.error('폴리필 로드 실패:', error);
        });
    }
    
    // DOM 준비 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 전역 노출
    window.ProgressiveEnhancement = {
        features: FeatureDetection,
        init: init
    };
})();