// 글로벌 보안 설정
(function() {
    'use strict';
    
    // HTTPS 강제 적용
    function enforceHTTPS() {
        if (window.location.protocol !== 'https:' && 
            window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1' &&
            window.location.hostname.indexOf('github.io') !== -1) {
            window.location.protocol = 'https:';
        }
    }
    
    // 보안 헤더 검증 (메타 태그로 설정된 CSP 확인)
    function checkSecurityHeaders() {
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
            console.warn('Content Security Policy가 설정되지 않았습니다.');
            
            // 동적으로 CSP 추가 (기본값)
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Security-Policy';
            meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com";
            document.head.appendChild(meta);
        }
        
        // Referrer Policy 설정
        const referrerMeta = document.querySelector('meta[name="referrer"]');
        if (!referrerMeta) {
            const meta = document.createElement('meta');
            meta.name = 'referrer';
            meta.content = 'strict-origin-when-cross-origin';
            document.head.appendChild(meta);
        }
    }
    
    // XSS 방지를 위한 전역 필터
    window.sanitizeHTML = function(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    };
    
    // 안전한 JSON 파싱
    window.safeJSONParse = function(jsonString) {
        try {
            // JSON 문자열 검증
            if (typeof jsonString !== 'string') {
                throw new Error('입력값이 문자열이 아닙니다.');
            }
            
            // 위험한 패턴 검출
            const dangerousPatterns = [
                /<script/i,
                /javascript:/i,
                /on\w+\s*=/i
            ];
            
            for (const pattern of dangerousPatterns) {
                if (pattern.test(jsonString)) {
                    throw new Error('위험한 패턴이 감지되었습니다.');
                }
            }
            
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON 파싱 오류:', error);
            return null;
        }
    };
    
    // 안전한 URL 리다이렉션
    window.safeRedirect = function(url) {
        try {
            const targetUrl = new URL(url, window.location.origin);
            
            // 허용된 도메인 확인
            const allowedHosts = [
                window.location.hostname,
                'rnbdpartners.github.io',
                'github.com'
            ];
            
            if (!allowedHosts.includes(targetUrl.hostname)) {
                console.warn('허용되지 않은 도메인으로의 리다이렉션 시도:', targetUrl.hostname);
                return false;
            }
            
            window.location.href = targetUrl.href;
            return true;
        } catch (error) {
            console.error('잘못된 URL:', url);
            return false;
        }
    };
    
    // 클릭재킹 방지
    function preventClickjacking() {
        if (window.self !== window.top) {
            // iframe 내에서 실행 중인 경우
            document.body.style.display = 'none';
            
            // 부모 프레임이 같은 도메인인지 확인
            try {
                if (window.top.location.hostname === window.self.location.hostname) {
                    // 같은 도메인이면 허용
                    document.body.style.display = '';
                } else {
                    // 다른 도메인이면 차단
                    window.top.location = window.self.location;
                }
            } catch (e) {
                // 크로스 도메인 접근 시 오류 발생 - 차단
                window.top.location = window.self.location;
            }
        }
    }
    
    // 콘솔 보호 (프로덕션 환경)
    function protectConsole() {
        if (window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1') {
            
            // 개발자 도구 감지 경고
            const warningMessage = '%c⚠️ 경고! ⚠️';
            const warningStyle = 'color: red; font-size: 30px; font-weight: bold;';
            const infoMessage = '%c이 콘솔은 개발자용입니다. 누군가 여기에 코드를 붙여넣으라고 했다면, 그것은 사기일 가능성이 높습니다.';
            const infoStyle = 'font-size: 16px;';
            
            console.log(warningMessage, warningStyle);
            console.log(infoMessage, infoStyle);
            
            // 콘솔 메서드 오버라이드 (선택적)
            if (!SecurityConfig.isDevelopment) {
                const noop = function() {};
                ['log', 'debug', 'info', 'warn'].forEach(method => {
                    console[method] = noop;
                });
            }
        }
    }
    
    // 컨텍스트 메뉴 비활성화 (선택적)
    function disableContextMenu() {
        if (window.location.hostname !== 'localhost' && 
            window.location.hostname !== '127.0.0.1') {
            document.addEventListener('contextmenu', function(e) {
                // 입력 필드에서는 허용
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    return;
                }
                e.preventDefault();
                return false;
            });
        }
    }
    
    // 자동 로그아웃 타이머
    let logoutTimer;
    function setupAutoLogout() {
        const IDLE_TIME = 30 * 60 * 1000; // 30분
        
        function resetTimer() {
            clearTimeout(logoutTimer);
            
            // 로그인 상태인 경우에만 타이머 설정
            if (window.SecureSessionManager && SecureSessionManager.getSession()) {
                logoutTimer = setTimeout(() => {
                    alert('장시간 미사용으로 자동 로그아웃됩니다.');
                    if (window.handleSecureLogout) {
                        handleSecureLogout();
                    }
                }, IDLE_TIME);
            }
        }
        
        // 사용자 활동 감지
        ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });
        
        resetTimer();
    }
    
    // 네트워크 요청 보안
    function secureNetworkRequests() {
        // XMLHttpRequest 오버라이드
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            
            // 원본 open 메서드 저장
            const originalOpen = xhr.open;
            xhr.open = function(method, url, ...args) {
                // 외부 도메인 요청 차단
                try {
                    const targetUrl = new URL(url, window.location.origin);
                    const allowedDomains = [
                        window.location.hostname,
                        'api.github.com',
                        'jsonplaceholder.typicode.com' // 테스트용
                    ];
                    
                    if (!allowedDomains.includes(targetUrl.hostname)) {
                        console.warn('차단된 외부 요청:', targetUrl.hostname);
                        throw new Error('허용되지 않은 도메인');
                    }
                } catch (e) {
                    // 상대 경로는 허용
                    if (!url.startsWith('/') && !url.startsWith('./')) {
                        console.error('잘못된 요청 URL:', url);
                    }
                }
                
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            return xhr;
        };
    }
    
    // 보안 초기화
    function initializeSecurity() {
        enforceHTTPS();
        checkSecurityHeaders();
        preventClickjacking();
        protectConsole();
        // disableContextMenu(); // 필요시 활성화
        setupAutoLogout();
        // secureNetworkRequests(); // 필요시 활성화
        
        console.log('글로벌 보안 설정이 적용되었습니다.');
    }
    
    // DOM 로드 완료 시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSecurity);
    } else {
        initializeSecurity();
    }
    
    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', function() {
        clearTimeout(logoutTimer);
    });
    
})();