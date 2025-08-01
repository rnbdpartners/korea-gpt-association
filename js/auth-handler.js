// Authentication Handler
document.addEventListener('DOMContentLoaded', function() {
    // API 스크립트가 이미 로드되었는지 확인
    if (typeof API !== 'undefined') {
        initializeAuth();
    } else {
        // API 스크립트 로드
        const script = document.createElement('script');
        script.src = '/js/api-config.js';
        document.head.appendChild(script);
        
        script.onload = () => {
            initializeAuth();
        };
    }
});

function initializeAuth() {
    // 로그인 폼 처리
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 회원가입 폼 처리
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // 관리자 로그인 폼 처리
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // 데모 계정 버튼들
    document.querySelectorAll('[data-demo-type]').forEach(button => {
        button.addEventListener('click', handleDemoLogin);
    });
}

// 일반 로그인 처리
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await API.login({
            email: formData.get('email'),
            password: formData.get('password')
        });
        
        // 토큰 및 사용자 정보 저장
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        alert('로그인이 완료되었습니다.');
        
        // 리다이렉트
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
        window.location.href = redirectUrl || 'index.html';
    } catch (error) {
        alert(error.message || '로그인 중 오류가 발생했습니다.');
    }
}

// 회원가입 처리
async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // 비밀번호 확인
    if (formData.get('password') !== formData.get('passwordConfirm')) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 약관 동의 확인
    if (!formData.get('termsAgree')) {
        alert('이용약관에 동의해주세요.');
        return;
    }
    
    if (!formData.get('privacyAgree')) {
        alert('개인정보 처리방침에 동의해주세요.');
        return;
    }
    
    try {
        const response = await API.register({
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            managerName: formData.get('name'), // 개인 회원가입인 경우
            position: '개인회원',
            companyName: '개인',
            businessNumber: '0000000000'
        });
        
        // 토큰 및 사용자 정보 저장
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        alert('회원가입이 완료되었습니다.');
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message || '회원가입 중 오류가 발생했습니다.');
    }
}

// 관리자 로그인 처리
async function handleAdminLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await API.adminLogin({
            email: formData.get('email'),
            password: formData.get('password')
        });
        
        // 토큰 및 관리자 정보 저장
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        
        alert('관리자 로그인이 완료되었습니다.');
        window.location.href = 'admin-select.html';
    } catch (error) {
        alert(error.message || '관리자 로그인 중 오류가 발생했습니다.');
    }
}

// 데모 로그인 처리
async function handleDemoLogin(e) {
    const demoType = e.currentTarget.dataset.demoType;
    console.log('Demo login type:', demoType);
    
    const demoAccounts = {
        student: {
            email: 'student@demo.com',
            password: 'demo123'
        },
        enterprise: {
            email: 'enterprise@demo.com',
            password: 'demo123'
        },
        admin: {
            email: 'admin@koreagpt.org',
            password: 'admin123!@#'
        }
    };
    
    const account = demoAccounts[demoType];
    if (!account) return;
    
    try {
        let response;
        if (demoType === 'admin') {
            console.log('Admin login attempt:', account);
            response = await API.adminLogin(account);
            localStorage.setItem('adminUser', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token);
            alert('관리자 로그인 성공');
            window.location.href = 'admin-select.html';
        } else {
            console.log('User login attempt:', account);
            response = await API.login(account);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token);
            
            if (demoType === 'enterprise') {
                alert('기업 회원 로그인 성공');
                window.location.href = 'enterprise-request.html';
            } else {
                alert('로그인 성공');
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.error('Demo login error:', error);
        alert('데모 계정 로그인 실패: ' + (error.message || '서버 연결 오류'));
    }
}

// 로그아웃 처리
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('enterpriseUser');
    
    window.location.href = 'index.html';
}

// 인증 상태 확인
function checkAuth() {
    const token = localStorage.getItem('authToken');
    return !!token;
}

// 사용자 정보 가져오기
function getCurrentUser() {
    const user = localStorage.getItem('user');
    const adminUser = localStorage.getItem('adminUser');
    
    if (adminUser) {
        return JSON.parse(adminUser);
    } else if (user) {
        return JSON.parse(user);
    }
    
    return null;
}

// 전역 함수로 내보내기
window.authHandler = {
    checkAuth,
    getCurrentUser,
    logout
};