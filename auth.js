// 인증 관련 JavaScript
console.log('인증 스크립트 로드됨');

document.addEventListener('DOMContentLoaded', function() {
    
    // 구글 로그인/회원가입
    const googleLogin = document.getElementById('googleLogin');
    const googleSignup = document.getElementById('googleSignup');
    
    if (googleLogin) {
        googleLogin.addEventListener('click', function() {
            handleGoogleAuth('login');
        });
    }
    
    if (googleSignup) {
        googleSignup.addEventListener('click', function() {
            handleGoogleAuth('signup');
        });
    }
    
    // 카카오 로그인/회원가입
    const kakaoLogin = document.getElementById('kakaoLogin');
    const kakaoSignup = document.getElementById('kakaoSignup');
    
    if (kakaoLogin) {
        kakaoLogin.addEventListener('click', function() {
            handleKakaoAuth('login');
        });
    }
    
    if (kakaoSignup) {
        kakaoSignup.addEventListener('click', function() {
            handleKakaoAuth('signup');
        });
    }
    
    // 회원가입 폼 처리
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupSubmit);
        
        // 실시간 비밀번호 확인
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', function() {
                validatePasswordMatch(password.value, this.value, this);
            });
            
            password.addEventListener('input', function() {
                validatePassword(this.value, this);
                if (confirmPassword.value) {
                    validatePasswordMatch(this.value, confirmPassword.value, confirmPassword);
                }
            });
        }
        
        // 이메일 실시간 검증
        const email = document.getElementById('email');
        if (email) {
            email.addEventListener('input', function() {
                validateEmail(this.value, this);
            });
        }
    }
    
    // 로그인 폼 처리
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // 비밀번호 찾기
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
    
});

// 구글 인증 처리
function handleGoogleAuth(type) {
    // 실제 구현에서는 Google OAuth API를 사용
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        alert(`구글 ${type === 'login' ? '로그인' : '회원가입'} 기능은 곧 제공될 예정입니다.\n\n실제 서비스에서는 Google OAuth를 통해 안전하게 인증됩니다.`);
    }, 1500);
}

// 카카오 인증 처리
function handleKakaoAuth(type) {
    // 실제 구현에서는 Kakao Login API를 사용
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        alert(`카카오 ${type === 'login' ? '로그인' : '회원가입'} 기능은 곧 제공될 예정입니다.\n\nKakao Login SDK를 통해 간편하게 가입하실 수 있습니다.`);
    }, 1500);
}

// 회원가입 폼 제출 처리
function handleSignupSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // 폼 검증
    if (!validateSignupForm(data)) {
        return;
    }
    
    showLoadingState();
    
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
        hideLoadingState();
        
        // 성공 시뮬레이션
        alert(`회원가입이 완료되었습니다!\n\n환영합니다, ${data.name}님!\n이메일 인증을 위해 ${data.email}로 메일을 발송했습니다.`);
        
        // 로그인 페이지로 리다이렉트
        window.location.href = 'login.html';
    }, 2000);
}

// 로그인 폼 제출 처리
function handleLoginSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // 기본 검증
    if (!data.email || !data.password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    showLoadingState();
    
    // 실제 로그인 처리
    setTimeout(() => {
        hideLoadingState();
        
        // 사용자 관리자를 통한 로그인 시도
        if (typeof performLogin !== 'undefined' && performLogin(data.email, data.password)) {
            const currentUser = userManager.getCurrentUser();
            alert(`로그인 성공!\n\n환영합니다, ${currentUser.name}님!`);
            window.location.href = 'index.html';
        } else {
            alert('이메일 또는 비밀번호가 올바르지 않습니다.\n\n데모 계정:\n- admin@koreangpt.org (관리자)\n- user@example.com (일반 사용자)');
        }
    }, 1500);
}

// 회원가입 폼 검증
function validateSignupForm(data) {
    let isValid = true;
    
    // 이름 검증
    if (!data.name || data.name.length < 2) {
        showFieldError('name', '이름을 2자 이상 입력해주세요.');
        isValid = false;
    } else {
        showFieldSuccess('name');
    }
    
    // 이메일 검증
    if (!validateEmail(data.email, document.getElementById('email'))) {
        isValid = false;
    }
    
    // 비밀번호 검증
    if (!validatePassword(data.password, document.getElementById('password'))) {
        isValid = false;
    }
    
    // 비밀번호 확인 검증
    if (!validatePasswordMatch(data.password, data.confirmPassword, document.getElementById('confirmPassword'))) {
        isValid = false;
    }
    
    // 약관 동의 검증
    if (!data.agreeTerms) {
        alert('이용약관에 동의해주세요.');
        isValid = false;
    }
    
    if (!data.agreePrivacy) {
        alert('개인정보처리방침에 동의해주세요.');
        isValid = false;
    }
    
    return isValid;
}

// 이메일 검증
function validateEmail(email, field) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showFieldError(field.id, '이메일을 입력해주세요.');
        return false;
    }
    
    if (!emailRegex.test(email)) {
        showFieldError(field.id, '올바른 이메일 형식을 입력해주세요.');
        return false;
    }
    
    showFieldSuccess(field.id);
    return true;
}

// 비밀번호 검증
function validatePassword(password, field) {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!password) {
        showFieldError(field.id, '비밀번호를 입력해주세요.');
        return false;
    }
    
    if (password.length < minLength) {
        showFieldError(field.id, `비밀번호는 ${minLength}자 이상이어야 합니다.`);
        return false;
    }
    
    if (!hasLetter || !hasNumber || !hasSpecial) {
        showFieldError(field.id, '영문, 숫자, 특수문자를 포함해야 합니다.');
        return false;
    }
    
    showFieldSuccess(field.id);
    return true;
}

// 비밀번호 확인 검증
function validatePasswordMatch(password, confirmPassword, field) {
    if (!confirmPassword) {
        showFieldError(field.id, '비밀번호 확인을 입력해주세요.');
        return false;
    }
    
    if (password !== confirmPassword) {
        showFieldError(field.id, '비밀번호가 일치하지 않습니다.');
        return false;
    }
    
    showFieldSuccess(field.id);
    return true;
}

// 필드 에러 표시
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // 기존 에러 메시지 제거
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 에러 스타일 적용
    field.classList.add('error');
    field.classList.remove('success');
    
    // 에러 메시지 추가
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

// 필드 성공 표시
function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // 기존 에러 메시지 제거
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 성공 스타일 적용
    field.classList.add('success');
    field.classList.remove('error');
}

// 비밀번호 찾기 처리
function handleForgotPassword() {
    const email = prompt('비밀번호를 재설정할 이메일 주소를 입력해주세요:');
    
    if (email) {
        if (validateEmail(email, { id: 'temp' })) {
            alert(`비밀번호 재설정 링크를 ${email}로 발송했습니다.\n\n이메일을 확인해주세요.`);
        } else {
            alert('올바른 이메일 주소를 입력해주세요.');
        }
    }
}

// 로딩 상태 표시
function showLoadingState() {
    const submitBtn = document.querySelector('.auth-submit');
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    }
}

// 로딩 상태 해제
function hideLoadingState() {
    const submitBtn = document.querySelector('.auth-submit');
    if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// 실제 구현 시 필요한 외부 SDK 로드 함수들

// 구글 OAuth 초기화 (실제 구현 시)
function initGoogleAuth() {
    // Google Identity Services 라이브러리 로드
    // gapi.load('auth2', function() {
    //     gapi.auth2.init({
    //         client_id: 'YOUR_GOOGLE_CLIENT_ID'
    //     });
    // });
}

// 카카오 로그인 초기화 (실제 구현 시)
function initKakaoAuth() {
    // Kakao SDK 로드
    // Kakao.init('YOUR_KAKAO_APP_KEY');
}

// 데모 계정 로그인
function loginDemo(type) {
    const demoCredentials = {
        admin: {
            email: 'admin@koreangpt.org',
            password: 'admin123!'
        },
        enterprise: {
            email: 'manager@samsung.com',
            password: 'samsung123!'
        },
        startup: {
            email: 'ceo@startup.kr',
            password: 'startup123!'
        }
    };
    
    const credentials = demoCredentials[type];
    if (!credentials) return;
    
    // 버튼 로딩 상태
    const demoBtn = event.target.closest('.demo-btn');
    demoBtn.style.opacity = '0.7';
    demoBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
        if (typeof performLogin !== 'undefined' && performLogin(credentials.email, credentials.password)) {
            const currentUser = userManager.getCurrentUser();
            alert(`데모 계정 로그인 성공!\n\n환영합니다, ${currentUser.name}님!`);
            
            // 관리자면 관리자 페이지로, 일반 사용자면 메인 페이지로
            if (currentUser.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert('데모 계정 로그인에 실패했습니다.');
            demoBtn.style.opacity = '1';
            demoBtn.style.pointerEvents = 'auto';
        }
    }, 1000);
}

console.log('모든 인증 기능이 로드되었습니다.');