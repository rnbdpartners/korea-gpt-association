// 보안 설정 및 유틸리티
const SecurityConfig = {
    // 개발/프로덕션 환경 구분
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // 허용된 도메인
    allowedDomains: [
        'rnbdpartners.github.io',
        'localhost',
        '127.0.0.1'
    ],
    
    // 세션 타임아웃 (30분)
    sessionTimeout: 30 * 60 * 1000,
    
    // 로그인 시도 제한
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15분
    
    // CORS 설정
    corsHeaders: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

// 입력 값 검증 클래스
class InputValidator {
    // 이메일 검증
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 전화번호 검증
    static isValidPhone(phone) {
        const phoneRegex = /^(\d{2,3})-?(\d{3,4})-?(\d{4})$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
    
    // 사업자등록번호 검증
    static isValidBusinessNumber(number) {
        const cleaned = number.replace(/[^\d]/g, '');
        if (cleaned.length !== 10) return false;
        
        // 사업자등록번호 검증 알고리즘
        const checkID = [1, 3, 7, 1, 3, 7, 1, 3, 5, 1];
        let sum = 0;
        
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned[i]) * checkID[i];
        }
        
        sum += Math.floor(parseInt(cleaned[8]) * 5 / 10);
        const checkNum = (10 - (sum % 10)) % 10;
        
        return checkNum === parseInt(cleaned[9]);
    }
    
    // XSS 방지를 위한 HTML 이스케이프
    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // SQL Injection 방지를 위한 특수문자 제거
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/['"`;\\]/g, '');
    }
    
    // 비밀번호 강도 검증
    static getPasswordStrength(password) {
        let strength = 0;
        
        // 길이 체크
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // 복잡도 체크
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        const levels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
        return {
            score: strength,
            level: levels[Math.min(Math.floor(strength / 1.5), 4)]
        };
    }
}

// CSRF 토큰 생성기
class CSRFToken {
    static generate() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    static store(token) {
        sessionStorage.setItem('csrfToken', token);
    }
    
    static verify(token) {
        return token === sessionStorage.getItem('csrfToken');
    }
}

// Rate Limiter
class RateLimiter {
    constructor(maxRequests = 10, timeWindow = 60000) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = new Map();
    }
    
    canMakeRequest(identifier) {
        const now = Date.now();
        const userRequests = this.requests.get(identifier) || [];
        
        // 시간 창 내의 요청만 필터링
        const recentRequests = userRequests.filter(time => now - time < this.timeWindow);
        
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }
        
        recentRequests.push(now);
        this.requests.set(identifier, recentRequests);
        
        return true;
    }
    
    getRemainingTime(identifier) {
        const userRequests = this.requests.get(identifier) || [];
        if (userRequests.length === 0) return 0;
        
        const oldestRequest = Math.min(...userRequests);
        const timeElapsed = Date.now() - oldestRequest;
        
        return Math.max(0, this.timeWindow - timeElapsed);
    }
}

// 로그인 시도 추적기
class LoginAttemptTracker {
    constructor() {
        this.attempts = new Map();
    }
    
    recordAttempt(email, success) {
        const key = email.toLowerCase();
        const record = this.attempts.get(key) || {
            count: 0,
            firstAttempt: Date.now(),
            lastAttempt: Date.now(),
            locked: false,
            lockedUntil: null
        };
        
        if (!success) {
            record.count++;
            record.lastAttempt = Date.now();
            
            if (record.count >= SecurityConfig.maxLoginAttempts) {
                record.locked = true;
                record.lockedUntil = Date.now() + SecurityConfig.lockoutDuration;
            }
        } else {
            // 성공 시 초기화
            record.count = 0;
            record.locked = false;
            record.lockedUntil = null;
        }
        
        this.attempts.set(key, record);
    }
    
    isLocked(email) {
        const record = this.attempts.get(email.toLowerCase());
        if (!record || !record.locked) return false;
        
        if (Date.now() > record.lockedUntil) {
            record.locked = false;
            record.count = 0;
            return false;
        }
        
        return true;
    }
    
    getRemainingLockTime(email) {
        const record = this.attempts.get(email.toLowerCase());
        if (!record || !record.locked) return 0;
        
        return Math.max(0, record.lockedUntil - Date.now());
    }
}

// 세션 관리자
class SecureSessionManager {
    static startSession(user) {
        const sessionId = CSRFToken.generate();
        const sessionData = {
            user: user,
            sessionId: sessionId,
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        // 세션 데이터 암호화 (간단한 Base64, 실제로는 더 강력한 암호화 필요)
        // 한글 문자 처리를 위해 encodeURIComponent 사용
        const jsonString = JSON.stringify(sessionData);
        const encoded = encodeURIComponent(jsonString);
        const encrypted = btoa(encoded);
        sessionStorage.setItem('secureSession', encrypted);
        
        // 세션 타임아웃 설정
        this.setSessionTimeout();
    }
    
    static getSession() {
        try {
            const encrypted = sessionStorage.getItem('secureSession');
            if (!encrypted) return null;
            
            // 한글 문자 처리를 위해 decodeURIComponent 사용
            const decoded = atob(encrypted);
            const jsonString = decodeURIComponent(decoded);
            const sessionData = JSON.parse(jsonString);
            
            // 세션 만료 체크
            if (Date.now() - sessionData.lastActivity > SecurityConfig.sessionTimeout) {
                this.endSession();
                return null;
            }
            
            // 활동 시간 업데이트
            sessionData.lastActivity = Date.now();
            // 한글 문자 처리를 위해 encodeURIComponent 사용
            const updatedJson = JSON.stringify(sessionData);
            const updatedEncoded = encodeURIComponent(updatedJson);
            sessionStorage.setItem('secureSession', btoa(updatedEncoded));
            
            return sessionData;
        } catch (error) {
            console.error('Session validation error:', error);
            return null;
        }
    }
    
    static endSession() {
        sessionStorage.removeItem('secureSession');
        sessionStorage.removeItem('csrfToken');
        localStorage.removeItem('rememberMe');
    }
    
    static setSessionTimeout() {
        // 세션 타임아웃 자동 처리
        setTimeout(() => {
            const session = this.getSession();
            if (!session) {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login.html';
            }
        }, SecurityConfig.sessionTimeout);
    }
}

// Export
window.SecurityConfig = SecurityConfig;
window.InputValidator = InputValidator;
window.CSRFToken = CSRFToken;
window.RateLimiter = RateLimiter;
window.LoginAttemptTracker = LoginAttemptTracker;
window.SecureSessionManager = SecureSessionManager;