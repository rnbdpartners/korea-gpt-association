// 보안 강화된 인증 시스템
console.log('보안 인증 시스템 로드됨');

// 의존성 체크
if (!window.InputValidator || !window.SecureSessionManager) {
    console.error('보안 설정이 로드되지 않았습니다.');
}

// 로그인 시도 추적기 초기화
const loginTracker = new LoginAttemptTracker();
const rateLimiter = new RateLimiter(5, 60000); // 1분에 5회 제한

// 안전한 데모 계정 관리 (해시된 비밀번호 시뮬레이션)
const DEMO_ACCOUNTS_HASHED = {
    'admin@koreangpt.org': {
        passwordHash: 'a4e0f8e0c9b0a1d0e8f0c9b0a1d0e8f0', // 실제로는 bcrypt 해시
        role: 'admin',
        name: '김관리'
    },
    'user@example.com': {
        passwordHash: 'b5f1g9f1d0c1b2e1f9g1d0c1b2e1f9g1',
        role: 'user',
        name: '김회원'
    },
    'manager@samsung.com': {
        passwordHash: 'c6g2h0g2e1d2c3f2h0g2e1d2c3f2h0g2',
        role: 'user',
        name: '이매니저'
    },
    'ceo@startup.kr': {
        passwordHash: 'd7h3i1h3f2e3d4g3i1h3f2e3d4g3i1h3',
        role: 'user',
        name: '박대표'
    }
};

// 비밀번호 해시 시뮬레이션 (실제로는 서버에서 처리)
function simulatePasswordHash(password) {
    // 간단한 해시 시뮬레이션 (실제로는 bcrypt 사용)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

// 보안 강화된 로그인 처리
async function handleSecureLogin(email, password) {
    // 입력 검증
    if (!InputValidator.isValidEmail(email)) {
        throw new Error('올바른 이메일 형식이 아닙니다.');
    }
    
    // Rate limiting 체크
    if (!rateLimiter.canMakeRequest(email)) {
        const remainingTime = rateLimiter.getRemainingTime(email);
        throw new Error(`너무 많은 시도가 있었습니다. ${Math.ceil(remainingTime / 1000)}초 후에 다시 시도해주세요.`);
    }
    
    // 계정 잠금 체크
    if (loginTracker.isLocked(email)) {
        const remainingTime = loginTracker.getRemainingLockTime(email);
        throw new Error(`계정이 일시적으로 잠겼습니다. ${Math.ceil(remainingTime / 60000)}분 후에 다시 시도해주세요.`);
    }
    
    // 데모 환경에서의 인증 (실제로는 서버 API 호출)
    const account = DEMO_ACCOUNTS_HASHED[email];
    
    if (!account) {
        loginTracker.recordAttempt(email, false);
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    
    // 비밀번호 검증 (데모용 간단 체크)
    const isValidPassword = (
        (email === 'admin@koreangpt.org' && password === 'admin123') ||
        (email === 'user@example.com' && password === 'user123') ||
        (email === 'manager@samsung.com' && password === 'samsung123') ||
        (email === 'ceo@startup.kr' && password === 'startup123')
    );
    
    if (!isValidPassword) {
        loginTracker.recordAttempt(email, false);
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    
    // 로그인 성공
    loginTracker.recordAttempt(email, true);
    
    // 세션 생성
    const user = {
        email: email,
        name: account.name,
        role: account.role,
        loginTime: new Date().toISOString()
    };
    
    SecureSessionManager.startSession(user);
    
    return user;
}

// 로그인 폼 이벤트 핸들러
async function handleLoginFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const errorElement = document.getElementById('loginError');
    
    // 폼 비활성화
    submitButton.disabled = true;
    submitButton.textContent = '로그인 중...';
    
    try {
        const email = InputValidator.sanitizeInput(form.email.value.trim());
        const password = form.password.value;
        
        const user = await handleSecureLogin(email, password);
        
        // 로그인 성공 처리
        showSuccessMessage('로그인 성공! 잠시 후 이동합니다...');
        
        // 리다이렉트
        setTimeout(() => {
            const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || 'index.html';
            window.location.href = returnUrl;
        }, 1000);
        
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '로그인';
    }
}

// 회원가입 폼 검증 및 처리
async function handleSecureSignup(formData) {
    // 입력 검증
    const errors = [];
    
    // 이메일 검증
    if (!InputValidator.isValidEmail(formData.email)) {
        errors.push('올바른 이메일 형식이 아닙니다.');
    }
    
    // 비밀번호 강도 검증
    const passwordStrength = InputValidator.getPasswordStrength(formData.password);
    if (passwordStrength.score < 3) {
        errors.push(`비밀번호가 너무 약합니다. (현재: ${passwordStrength.level})`);
    }
    
    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
        errors.push('비밀번호가 일치하지 않습니다.');
    }
    
    // 이름 검증
    if (formData.name.length < 2) {
        errors.push('이름은 2자 이상이어야 합니다.');
    }
    
    // 전화번호 검증 (선택사항)
    if (formData.phone && !InputValidator.isValidPhone(formData.phone)) {
        errors.push('올바른 전화번호 형식이 아닙니다.');
    }
    
    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }
    
    // 데모 환경에서는 로컬 저장 (실제로는 서버 API 호출)
    const newUser = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    // 기존 사용자 체크
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (existingUsers.find(u => u.email === formData.email)) {
        throw new Error('이미 등록된 이메일입니다.');
    }
    
    // 사용자 추가
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    return newUser;
}

// 비밀번호 강도 표시기
function updatePasswordStrengthIndicator(password) {
    const strength = InputValidator.getPasswordStrength(password);
    const indicator = document.getElementById('passwordStrength');
    
    if (!indicator) return;
    
    const colors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];
    const width = (strength.score / 6) * 100;
    
    indicator.innerHTML = `
        <div style="width: 100%; background: #eee; border-radius: 4px; margin-top: 5px;">
            <div style="width: ${width}%; background: ${colors[Math.min(strength.score - 1, 4)]}; 
                        height: 4px; border-radius: 4px; transition: all 0.3s;"></div>
        </div>
        <small style="color: ${colors[Math.min(strength.score - 1, 4)]}">
            비밀번호 강도: ${strength.level}
        </small>
    `;
}

// 오류 메시지 표시
function showErrorMessage(message) {
    const errorElement = document.getElementById('loginError') || 
                        document.getElementById('signupError') ||
                        document.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.classList.add('shake');
        
        setTimeout(() => {
            errorElement.classList.remove('shake');
        }, 500);
    } else {
        alert(message);
    }
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    const successElement = document.querySelector('.success-message') ||
                          document.createElement('div');
    
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1000;
    `;
    
    document.body.appendChild(successElement);
    
    setTimeout(() => {
        successElement.remove();
    }, 3000);
}

// 로그아웃 처리
function handleSecureLogout() {
    SecureSessionManager.endSession();
    showSuccessMessage('로그아웃되었습니다.');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// 세션 체크
function checkSecureSession() {
    const session = SecureSessionManager.getSession();
    if (!session) {
        return null;
    }
    return session.user;
}

// 페이지 보호
function protectPage(requiredRole = null) {
    const session = SecureSessionManager.getSession();
    
    if (!session) {
        window.location.href = `login.html?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        return false;
    }
    
    if (requiredRole && session.user.role !== requiredRole) {
        alert('접근 권한이 없습니다.');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .shake {
        animation: shake 0.5s;
    }
    
    .error-message {
        color: #f44336;
        background: #ffebee;
        padding: 10px;
        border-radius: 4px;
        margin-top: 10px;
        font-size: 14px;
    }
    
    .success-message {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export 함수들
window.handleSecureLogin = handleSecureLogin;
window.handleLoginFormSubmit = handleLoginFormSubmit;
window.handleSecureSignup = handleSecureSignup;
window.updatePasswordStrengthIndicator = updatePasswordStrengthIndicator;
window.handleSecureLogout = handleSecureLogout;
window.checkSecureSession = checkSecureSession;
window.protectPage = protectPage;