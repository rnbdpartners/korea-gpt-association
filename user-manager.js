// 테스트용 데모 계정 데이터
const DEMO_ACCOUNTS = [
    // 관리자 계정
    {
        id: 'admin001',
        email: 'admin@koreangpt.org',
        password: 'admin123!',
        name: '관리자',
        role: 'admin',
        company: '한국GPT협회',
        phone: '02-1234-5678',
        createdAt: '2024-01-01T00:00:00Z'
    },
    // 일반 사용자 계정들
    {
        id: 'demo001',
        email: 'demo@test.com',
        password: 'demo123!',
        name: '김데모',
        role: 'user',
        company: '테스트 회사',
        phone: '010-1234-5678',
        createdAt: '2024-01-15T09:00:00Z'
    },
    {
        id: 'enterprise001',
        email: 'manager@samsung.com',
        password: 'samsung123!',
        name: '이기업',
        role: 'user',
        company: '삼성전자',
        phone: '010-2345-6789',
        createdAt: '2024-02-01T10:30:00Z'
    },
    {
        id: 'startup001',
        email: 'ceo@startup.kr',
        password: 'startup123!',
        name: '박스타트',
        role: 'user',
        company: '스타트업코리아',
        phone: '010-3456-7890',
        createdAt: '2024-02-10T14:20:00Z'
    },
    {
        id: 'edu001',
        email: 'prof@university.ac.kr',
        password: 'edu123!',
        name: '최교수',
        role: 'user',
        company: '한국대학교',
        phone: '010-4567-8901',
        createdAt: '2024-02-15T16:45:00Z'
    }
];

// 테스트용 견적 데이터
const DEMO_QUOTES = [
    {
        id: '1708123456789',
        userId: 'enterprise001',
        userName: '이기업',
        company: '삼성전자',
        name: '이기업',
        phone: '010-2345-6789',
        email: 'manager@samsung.com',
        program: 'intermediate',
        participants: 50,
        type: 'hybrid',
        schedule: '2024-04',
        totalPrice: 16000000,
        status: 'contacted',
        timestamp: '2024-02-17T09:30:00Z'
    },
    {
        id: '1708123456790',
        userId: 'startup001',
        userName: '박스타트',
        company: '스타트업코리아',
        name: '박스타트',
        phone: '010-3456-7890',
        email: 'ceo@startup.kr',
        program: 'basic',
        participants: 15,
        type: 'online',
        schedule: '2024-03',
        totalPrice: 2250000,
        status: 'pending',
        timestamp: '2024-02-16T14:20:00Z'
    },
    {
        id: '1708123456791',
        userId: 'edu001',
        userName: '최교수',
        company: '한국대학교',
        name: '최교수',
        phone: '010-4567-8901',
        email: 'prof@university.ac.kr',
        program: 'advanced',
        participants: 25,
        type: 'offline',
        schedule: '2024-05',
        totalPrice: 12500000,
        status: 'completed',
        timestamp: '2024-02-15T11:15:00Z'
    }
];

// 사용자 관리 및 권한 시스템
class UserManager {
    constructor() {
        this.currentUser = null;
        this.initializeDemoData();
        this.loadCurrentUser();
    }

    // 데모 데이터 초기화
    initializeDemoData() {
        // 사용자 데이터가 없으면 데모 계정 생성
        if (!localStorage.getItem('users')) {
            const users = {};
            DEMO_ACCOUNTS.forEach(account => {
                users[account.email] = account;
            });
            localStorage.setItem('users', JSON.stringify(users));
        }

        // 견적 데이터가 없으면 데모 견적 생성
        if (!localStorage.getItem('quoteHistory')) {
            localStorage.setItem('quoteHistory', JSON.stringify(DEMO_QUOTES));
        }
    }

    // 현재 로그인된 사용자 로드
    loadCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    // 사용자 로그인
    login(userInfo) {
        this.currentUser = userInfo;
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        this.updateUIForUser();
        return true;
    }

    // 사용자 로그아웃
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUIForUser();
        window.location.href = 'index.html';
    }

    // 현재 사용자 정보 반환
    getCurrentUser() {
        return this.currentUser;
    }

    // 로그인 상태 확인
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 관리자 권한 확인
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // UI 업데이트 (로그인 상태에 따라)
    updateUIForUser() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        if (this.isLoggedIn()) {
            // 로그인된 상태
            navActions.innerHTML = `
                <div class="user-menu">
                    <span class="user-name">${this.currentUser.name}님</span>
                    <div class="user-dropdown">
                        <button class="user-dropdown-toggle">
                            <i class="fas fa-user-circle"></i>
                        </button>
                        <div class="user-dropdown-menu">
                            <a href="#" class="dropdown-item" onclick="userManager.showProfile()">내 정보</a>
                            <a href="#" class="dropdown-item" onclick="userManager.showMyCourses()">내 강의</a>
                            <div class="dropdown-divider"></div>
                            ${this.isAdmin() ? '<a href="admin.html" class="dropdown-item">관리자 페이지</a>' : ''}
                            <a href="#" class="dropdown-item" onclick="userManager.logout()">로그아웃</a>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // 로그인되지 않은 상태
            navActions.innerHTML = `
                <a href="login.html" class="btn-login">로그인</a>
                <a href="signup.html" class="btn-signup">회원가입</a>
            `;
        }

        // 드롭다운 이벤트 설정
        this.setupUserDropdown();
    }

    // 사용자 드롭다운 설정
    setupUserDropdown() {
        const dropdownToggle = document.querySelector('.user-dropdown-toggle');
        const dropdownMenu = document.querySelector('.user-dropdown-menu');

        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            // 외부 클릭 시 닫기
            document.addEventListener('click', function() {
                dropdownMenu.classList.remove('show');
            });
        }
    }

    // 내 정보 표시
    showProfile() {
        alert(`내 정보\n\n이름: ${this.currentUser.name}\n이메일: ${this.currentUser.email}\n회원 등급: ${this.getUserRole()}\n가입일: ${this.currentUser.joinDate}`);
    }

    // 내 강의 표시
    showMyCourses() {
        const purchasedCourses = this.currentUser.purchasedCourses || [];
        if (purchasedCourses.length === 0) {
            alert('구매한 강의가 없습니다.');
            return;
        }

        let courseList = '내 강의 목록\n\n';
        purchasedCourses.forEach((course, index) => {
            courseList += `${index + 1}. ${course.name}\n   수강률: ${course.progress}%\n   구매일: ${course.purchaseDate}\n\n`;
        });
        
        alert(courseList);
    }

    // 사용자 역할 텍스트 반환
    getUserRole() {
        switch(this.currentUser?.role) {
            case 'admin': return '관리자';
            case 'premium': return '프리미엄 회원';
            default: return '일반 회원';
        }
    }

    // 관리자 페이지 접근 권한 확인
    checkAdminAccess() {
        if (!this.isLoggedIn()) {
            alert('로그인이 필요합니다.');
            window.location.href = 'login.html';
            return false;
        }

        if (!this.isAdmin()) {
            alert('관리자 권한이 필요합니다.');
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }

    // 마케팅 채널 추적
    trackMarketingChannel() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmCampaign = urlParams.get('utm_campaign');
        const referrer = document.referrer;

        let marketingChannel = 'direct';

        if (utmSource) {
            marketingChannel = `${utmSource}${utmMedium ? '_' + utmMedium : ''}`;
        } else if (referrer) {
            if (referrer.includes('google')) marketingChannel = 'google_organic';
            else if (referrer.includes('naver')) marketingChannel = 'naver_organic';
            else if (referrer.includes('facebook')) marketingChannel = 'facebook';
            else if (referrer.includes('instagram')) marketingChannel = 'instagram';
            else if (referrer.includes('youtube')) marketingChannel = 'youtube';
            else marketingChannel = 'referral';
        }

        // 세션 스토리지에 저장
        sessionStorage.setItem('marketingChannel', marketingChannel);
        sessionStorage.setItem('utmCampaign', utmCampaign || '');
        
        return {
            channel: marketingChannel,
            campaign: utmCampaign,
            source: utmSource,
            medium: utmMedium,
            referrer: referrer
        };
    }
}

// 샘플 사용자 데이터
const sampleUsers = [
    {
        id: 1,
        email: 'admin@koreangpt.org',
        name: '관리자',
        role: 'admin',
        joinDate: '2024-01-01',
        phone: '010-1234-5678',
        company: '한국GPT협회',
        position: 'CEO',
        marketingChannel: 'direct',
        totalPurchaseAmount: 0,
        purchasedCourses: []
    },
    {
        id: 2,
        email: 'user@example.com',
        name: '김지은',
        role: 'premium',
        joinDate: '2024-01-10',
        phone: '010-2345-6789',
        company: '테크 스타트업',
        position: '마케팅 매니저',
        marketingChannel: 'google_cpc',
        totalPurchaseAmount: 448000,
        purchasedCourses: [
            {
                id: 1,
                name: 'GPT 프롬프트 마스터 과정',
                purchaseDate: '2024-01-15',
                progress: 85,
                amount: 149000,
                paymentMethod: 'card'
            },
            {
                id: 3,
                name: 'GPT로 마케팅 자동화하기',
                purchaseDate: '2024-01-20',
                progress: 60,
                amount: 179000,
                paymentMethod: 'kakaopay'
            }
        ]
    },
    {
        id: 3,
        email: 'test@test.com',
        name: '이준호',
        role: 'user',
        joinDate: '2024-01-12',
        phone: '010-3456-7890',
        company: 'AI 개발회사',
        position: '개발자',
        marketingChannel: 'naver_blog',
        totalPurchaseAmount: 299000,
        purchasedCourses: [
            {
                id: 2,
                name: 'AI 시대의 비즈니스 전략',
                purchaseDate: '2024-01-18',
                progress: 45,
                amount: 299000,
                paymentMethod: 'bank_transfer'
            }
        ]
    }
];

// 전역 사용자 관리자 인스턴스
const userManager = new UserManager();

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 마케팅 채널 추적
    userManager.trackMarketingChannel();
    
    // UI 업데이트
    userManager.updateUIForUser();
    
    // 관리자 페이지인 경우 권한 확인
    if (window.location.pathname.includes('admin.html')) {
        if (!userManager.checkAdminAccess()) {
            return;
        }
    }
});

// 로그인 기능 (기존 auth.js와 연동)
function performLogin(email, password) {
    // 샘플 사용자에서 찾기
    const user = sampleUsers.find(u => u.email === email);
    
    if (user) {
        // 실제로는 서버에서 비밀번호 검증
        userManager.login(user);
        return true;
    }
    
    return false;
}

// 소셜 로그인 처리
function handleSocialLogin(provider, userInfo) {
    // 마케팅 채널 정보 추가
    const marketingInfo = userManager.trackMarketingChannel();
    
    const newUser = {
        ...userInfo,
        role: 'user',
        joinDate: new Date().toISOString().split('T')[0],
        marketingChannel: marketingInfo.channel,
        utmCampaign: marketingInfo.campaign,
        totalPurchaseAmount: 0,
        purchasedCourses: []
    };
    
    userManager.login(newUser);
    return true;
}

console.log('사용자 관리 시스템 로드 완료');