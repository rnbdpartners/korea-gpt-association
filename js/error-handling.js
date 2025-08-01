// 전역 오류 처리 및 로딩 상태 관리

(function() {
    'use strict';
    
    // 오류 타입 정의
    const ErrorTypes = {
        NETWORK: 'network',
        VALIDATION: 'validation',
        PERMISSION: 'permission',
        TIMEOUT: 'timeout',
        SERVER: 'server',
        CLIENT: 'client',
        UNKNOWN: 'unknown'
    };
    
    // 오류 메시지 템플릿
    const ErrorMessages = {
        [ErrorTypes.NETWORK]: {
            title: '네트워크 오류',
            message: '인터넷 연결을 확인해주세요.',
            icon: 'fa-wifi',
            actions: ['retry', 'dismiss']
        },
        [ErrorTypes.VALIDATION]: {
            title: '입력 오류',
            message: '입력하신 정보를 다시 확인해주세요.',
            icon: 'fa-exclamation-circle',
            actions: ['dismiss']
        },
        [ErrorTypes.PERMISSION]: {
            title: '권한 오류',
            message: '이 작업을 수행할 권한이 없습니다.',
            icon: 'fa-lock',
            actions: ['login', 'dismiss']
        },
        [ErrorTypes.TIMEOUT]: {
            title: '시간 초과',
            message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
            icon: 'fa-clock',
            actions: ['retry', 'dismiss']
        },
        [ErrorTypes.SERVER]: {
            title: '서버 오류',
            message: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            icon: 'fa-server',
            actions: ['retry', 'dismiss']
        },
        [ErrorTypes.CLIENT]: {
            title: '클라이언트 오류',
            message: '요청을 처리할 수 없습니다.',
            icon: 'fa-desktop',
            actions: ['refresh', 'dismiss']
        },
        [ErrorTypes.UNKNOWN]: {
            title: '알 수 없는 오류',
            message: '예상치 못한 오류가 발생했습니다.',
            icon: 'fa-question-circle',
            actions: ['refresh', 'dismiss']
        }
    };
    
    // 오류 처리 클래스
    class ErrorHandler {
        constructor() {
            this.errorQueue = [];
            this.setupGlobalErrorHandlers();
            this.setupStyles();
        }
        
        // 전역 오류 핸들러 설정
        setupGlobalErrorHandlers() {
            // JavaScript 오류
            window.addEventListener('error', (event) => {
                console.error('Global error:', event.error);
                this.handleError({
                    type: ErrorTypes.CLIENT,
                    message: event.message,
                    stack: event.error?.stack,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });
            
            // Promise 거부
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled promise rejection:', event.reason);
                this.handleError({
                    type: ErrorTypes.CLIENT,
                    message: event.reason?.message || event.reason,
                    stack: event.reason?.stack
                });
                event.preventDefault();
            });
            
            // 네트워크 오류 감지
            window.addEventListener('offline', () => {
                this.handleError({
                    type: ErrorTypes.NETWORK,
                    message: '인터넷 연결이 끊어졌습니다.'
                });
            });
        }
        
        // 오류 처리
        handleError(error) {
            // 오류 타입 결정
            const errorType = error.type || this.determineErrorType(error);
            const errorConfig = ErrorMessages[errorType] || ErrorMessages[ErrorTypes.UNKNOWN];
            
            // 오류 로그
            this.logError(error);
            
            // 사용자에게 표시
            this.showErrorNotification({
                ...errorConfig,
                details: error.message || errorConfig.message,
                error: error
            });
            
            // 오류 추적 (프로덕션 환경에서)
            if (window.location.hostname !== 'localhost') {
                this.trackError(error);
            }
        }
        
        // 오류 타입 결정
        determineErrorType(error) {
            if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
                return ErrorTypes.NETWORK;
            }
            if (error.status >= 500) {
                return ErrorTypes.SERVER;
            }
            if (error.status === 401 || error.status === 403) {
                return ErrorTypes.PERMISSION;
            }
            if (error.code === 'TIMEOUT' || error.timeout) {
                return ErrorTypes.TIMEOUT;
            }
            if (error.validation) {
                return ErrorTypes.VALIDATION;
            }
            return ErrorTypes.UNKNOWN;
        }
        
        // 오류 로그
        logError(error) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                type: error.type,
                message: error.message,
                stack: error.stack,
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // 로컬 스토리지에 저장 (최대 50개)
            try {
                const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
                logs.unshift(logEntry);
                if (logs.length > 50) logs.pop();
                localStorage.setItem('errorLogs', JSON.stringify(logs));
            } catch (e) {
                console.error('Failed to save error log:', e);
            }
        }
        
        // 오류 추적 (분석 도구로 전송)
        trackError(error) {
            // Google Analytics 또는 다른 분석 도구로 전송
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: error.message,
                    fatal: false
                });
            }
        }
        
        // 오류 알림 표시
        showErrorNotification(config) {
            const notification = document.createElement('div');
            notification.className = 'error-notification';
            notification.innerHTML = `
                <div class="error-notification-content">
                    <div class="error-icon">
                        <i class="fas ${config.icon}"></i>
                    </div>
                    <div class="error-body">
                        <h4>${config.title}</h4>
                        <p>${InputValidator.escapeHtml(config.details)}</p>
                    </div>
                    <div class="error-actions">
                        ${config.actions.map(action => this.getActionButton(action, config.error)).join('')}
                    </div>
                    <button class="error-close" aria-label="닫기">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // 닫기 버튼
            notification.querySelector('.error-close').addEventListener('click', () => {
                this.dismissNotification(notification);
            });
            
            // 액션 버튼 이벤트
            notification.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.handleAction(e.target.dataset.action, config.error);
                    this.dismissNotification(notification);
                });
            });
            
            // 화면에 추가
            document.body.appendChild(notification);
            
            // 애니메이션
            setTimeout(() => notification.classList.add('show'), 10);
            
            // 자동 제거 (10초 후)
            setTimeout(() => this.dismissNotification(notification), 10000);
        }
        
        // 액션 버튼 생성
        getActionButton(action, error) {
            const actionConfigs = {
                retry: { text: '다시 시도', icon: 'fa-redo' },
                dismiss: { text: '확인', icon: 'fa-check' },
                login: { text: '로그인', icon: 'fa-sign-in-alt' },
                refresh: { text: '새로고침', icon: 'fa-sync' }
            };
            
            const config = actionConfigs[action];
            if (!config) return '';
            
            return `
                <button class="error-action-btn" data-action="${action}">
                    <i class="fas ${config.icon}"></i>
                    <span>${config.text}</span>
                </button>
            `;
        }
        
        // 액션 처리
        handleAction(action, error) {
            switch (action) {
                case 'retry':
                    if (error.retry) error.retry();
                    break;
                case 'login':
                    window.location.href = 'login.html';
                    break;
                case 'refresh':
                    window.location.reload();
                    break;
                case 'dismiss':
                default:
                    // 닫기만 함
                    break;
            }
        }
        
        // 알림 제거
        dismissNotification(notification) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
        
        // 스타일 설정
        setupStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .error-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    z-index: 100000;
                    transform: translateX(420px);
                    transition: transform 0.3s ease-out;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .error-notification.show {
                    transform: translateX(0);
                }
                
                .error-notification-content {
                    display: flex;
                    align-items: flex-start;
                    padding: 20px;
                    gap: 15px;
                }
                
                .error-icon {
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    background: #ffebee;
                    color: #f44336;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                
                .error-body {
                    flex: 1;
                }
                
                .error-body h4 {
                    margin: 0 0 5px 0;
                    font-size: 16px;
                    color: #333;
                }
                
                .error-body p {
                    margin: 0;
                    font-size: 14px;
                    color: #666;
                    line-height: 1.4;
                }
                
                .error-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .error-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    font-size: 13px;
                    color: #333;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .error-action-btn:hover {
                    background: #f5f5f5;
                    border-color: #999;
                }
                
                .error-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: none;
                    color: #999;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                
                .error-close:hover {
                    background: #f5f5f5;
                    color: #333;
                }
                
                @media (max-width: 480px) {
                    .error-notification {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 로딩 상태 관리 클래스
    class LoadingManager {
        constructor() {
            this.loadingStack = [];
            this.setupStyles();
        }
        
        // 로딩 시작
        show(options = {}) {
            const config = {
                message: '처리 중입니다...',
                overlay: true,
                spinner: true,
                timeout: 30000,
                ...options
            };
            
            const loadingId = Date.now();
            const loading = document.createElement('div');
            loading.className = 'loading-indicator';
            loading.id = `loading-${loadingId}`;
            
            if (config.overlay) {
                loading.classList.add('with-overlay');
            }
            
            loading.innerHTML = `
                <div class="loading-content">
                    ${config.spinner ? '<div class="loading-spinner"></div>' : ''}
                    ${config.message ? `<div class="loading-message">${InputValidator.escapeHtml(config.message)}</div>` : ''}
                    ${config.progress !== undefined ? `
                        <div class="loading-progress">
                            <div class="loading-progress-bar" style="width: ${config.progress}%"></div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            document.body.appendChild(loading);
            
            // 애니메이션
            setTimeout(() => loading.classList.add('show'), 10);
            
            // 타임아웃 설정
            const timeoutId = setTimeout(() => {
                this.hide(loadingId);
                window.ErrorHandler.handleError({
                    type: ErrorTypes.TIMEOUT,
                    message: '작업 시간이 초과되었습니다.'
                });
            }, config.timeout);
            
            // 스택에 추가
            this.loadingStack.push({
                id: loadingId,
                element: loading,
                timeoutId: timeoutId,
                config: config
            });
            
            return loadingId;
        }
        
        // 로딩 종료
        hide(loadingId) {
            const index = this.loadingStack.findIndex(item => item.id === loadingId);
            if (index === -1) return;
            
            const { element, timeoutId } = this.loadingStack[index];
            
            clearTimeout(timeoutId);
            element.classList.remove('show');
            
            setTimeout(() => {
                element.remove();
                this.loadingStack.splice(index, 1);
            }, 300);
        }
        
        // 진행률 업데이트
        updateProgress(loadingId, progress) {
            const loading = this.loadingStack.find(item => item.id === loadingId);
            if (!loading) return;
            
            const progressBar = loading.element.querySelector('.loading-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
        
        // 메시지 업데이트
        updateMessage(loadingId, message) {
            const loading = this.loadingStack.find(item => item.id === loadingId);
            if (!loading) return;
            
            const messageEl = loading.element.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
        
        // 모든 로딩 제거
        hideAll() {
            [...this.loadingStack].forEach(item => this.hide(item.id));
        }
        
        // 스타일 설정
        setupStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .loading-indicator {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                
                .loading-indicator.show {
                    opacity: 1;
                }
                
                .loading-indicator.with-overlay {
                    background: rgba(0, 0, 0, 0.5);
                    pointer-events: all;
                }
                
                .loading-content {
                    background: white;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    min-width: 200px;
                }
                
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto 15px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #2196F3;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .loading-message {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 15px;
                }
                
                .loading-progress {
                    width: 100%;
                    height: 4px;
                    background: #e0e0e0;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 15px;
                }
                
                .loading-progress-bar {
                    height: 100%;
                    background: #2196F3;
                    transition: width 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 재시도 메커니즘
    class RetryHandler {
        constructor() {
            this.retryQueue = new Map();
        }
        
        // 재시도 가능한 작업 래핑
        async withRetry(fn, options = {}) {
            const config = {
                maxRetries: 3,
                delay: 1000,
                backoff: 2,
                timeout: 30000,
                ...options
            };
            
            let lastError;
            
            for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
                try {
                    // 타임아웃 설정
                    const result = await Promise.race([
                        fn(),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), config.timeout)
                        )
                    ]);
                    
                    return result;
                } catch (error) {
                    lastError = error;
                    
                    // 재시도 불가능한 오류
                    if (error.status === 401 || error.status === 403 || error.status === 404) {
                        throw error;
                    }
                    
                    // 마지막 시도였으면 오류 발생
                    if (attempt === config.maxRetries) {
                        throw error;
                    }
                    
                    // 재시도 대기
                    const delay = config.delay * Math.pow(config.backoff, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    console.log(`Retry attempt ${attempt + 1}/${config.maxRetries}`);
                }
            }
            
            throw lastError;
        }
    }
    
    // 전역 인스턴스 생성
    window.ErrorHandler = new ErrorHandler();
    window.LoadingManager = new LoadingManager();
    window.RetryHandler = new RetryHandler();
    
    // 편의 함수
    window.showLoading = (options) => window.LoadingManager.show(options);
    window.hideLoading = (id) => window.LoadingManager.hide(id);
    window.showError = (error) => window.ErrorHandler.handleError(error);
    window.withRetry = (fn, options) => window.RetryHandler.withRetry(fn, options);
    
})();