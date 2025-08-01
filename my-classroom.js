// 내 강의실 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 로그인 체크
    checkAuthentication();
    
    // 탭 전환 기능
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 활성 탭 변경
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // 이어서 학습하기 버튼
    const continueButtons = document.querySelectorAll('.btn-continue');
    continueButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const courseCard = this.closest('.course-progress-card');
            const courseTitle = courseCard.querySelector('h3').textContent;
            
            console.log('Continue learning:', courseTitle);
            alert(`${courseTitle} 강의를 이어서 학습합니다.`);
            // 실제로는 강의 플레이어 페이지로 이동
        });
    });
    
    // 수료증 보기
    const certificateButtons = document.querySelectorAll('.btn-certificate:not(:disabled)');
    const certificateModal = document.getElementById('certificateModal');
    
    certificateButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            certificateModal.classList.add('active');
        });
    });
    
    // 수료증 다운로드 버튼
    const downloadButtons = document.querySelectorAll('.btn-download');
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.certificate-card');
            const title = card.querySelector('h4').textContent;
            
            console.log('Download certificate:', title);
            alert(`${title} 수료증을 다운로드합니다.`);
        });
    });
    
    // 수료증 공유 버튼
    const shareButtons = document.querySelectorAll('.btn-share');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            alert('수료증 공유 기능이 곧 추가됩니다!');
        });
    });
    
    // 모달 닫기
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const modals = document.querySelectorAll('.modal');
    
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // 학습 도우미
    const assistantToggle = document.querySelector('.assistant-toggle');
    const assistantPanel = document.querySelector('.assistant-panel');
    const assistantClose = document.querySelector('.assistant-close');
    
    if (assistantToggle) {
        assistantToggle.addEventListener('click', function() {
            assistantPanel.classList.toggle('active');
            // 배지 제거
            const badge = this.querySelector('.assistant-badge');
            if (badge) {
                badge.style.display = 'none';
            }
        });
    }
    
    if (assistantClose) {
        assistantClose.addEventListener('click', function() {
            assistantPanel.classList.remove('active');
        });
    }
    
    // 추천 강의 수강 시작
    const startCourseButtons = document.querySelectorAll('.btn-start-course');
    startCourseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.recommendation-card');
            const courseTitle = card.querySelector('h3').textContent;
            
            if (confirm(`${courseTitle} 수강을 시작하시겠습니까?`)) {
                alert('수강 신청이 완료되었습니다!');
                // 실제로는 수강 신청 API 호출
                location.reload();
            }
        });
    });
    
    // 썸네일 클릭시 강의 재생
    const courseThumbnails = document.querySelectorAll('.course-thumbnail');
    courseThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const card = this.closest('.course-progress-card');
            if (!card.classList.contains('completed')) {
                const continueBtn = card.querySelector('.btn-continue');
                if (continueBtn) {
                    continueBtn.click();
                }
            }
        });
    });
    
    // 주간 학습 현황 툴팁
    const activityLevels = document.querySelectorAll('.activity-level');
    activityLevels.forEach(level => {
        level.addEventListener('mouseenter', function(e) {
            const tooltip = this.getAttribute('title');
            if (tooltip) {
                // 툴팁 표시 로직
                console.log(tooltip);
            }
        });
    });
    
    // 스크롤 애니메이션
    initScrollAnimations();
    
    // 학습 통계 업데이트
    updateLearningStats();
    
    // 사용자 정보 드롭다운
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            // 드롭다운 메뉴 표시
            console.log('User profile clicked');
        });
    }
});

// 인증 체크
function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('로그인이 필요한 페이지입니다.');
        window.location.href = 'login.html';
    } else {
        // 사용자 정보 로드
        loadUserData();
    }
}

// 사용자 정보 로드
function loadUserData() {
    // 실제로는 서버에서 사용자 정보를 가져옴
    const userData = {
        name: '김지은',
        streakDays: 7,
        totalCourses: 3,
        totalHours: 24.5,
        certificates: 2,
        points: 1250
    };
    
    // UI 업데이트
    document.querySelector('.user-name').textContent = userData.name;
    document.querySelector('.streak-count').textContent = userData.streakDays;
    // ... 나머지 데이터 업데이트
}

// 로그아웃
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userToken');
        window.location.href = 'index.html';
    }
}

// 스크롤 애니메이션
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들
    const animateElements = document.querySelectorAll(
        '.summary-card, .course-progress-card, .certificate-card, .badge-item, .recommendation-card'
    );
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(el);
    });
}

// 학습 통계 업데이트
function updateLearningStats() {
    // 숫자 카운트 애니메이션
    const summaryNumbers = document.querySelectorAll('.summary-number');
    
    summaryNumbers.forEach(num => {
        const target = parseFloat(num.textContent);
        let current = 0;
        const increment = target / 50;
        const isDecimal = target % 1 !== 0;
        
        const updateCount = () => {
            current += increment;
            if (current < target) {
                num.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                requestAnimationFrame(updateCount);
            } else {
                num.textContent = isDecimal ? target.toFixed(1) : target;
            }
        };
        
        updateCount();
    });
    
    // 진도 바 애니메이션
    setTimeout(() => {
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }, 500);
}

// PDF 다운로드
document.querySelector('.btn-download-pdf')?.addEventListener('click', function() {
    alert('수료증 PDF를 다운로드합니다.');
    // 실제로는 PDF 생성 및 다운로드 로직
});

// 인쇄
document.querySelector('.btn-print')?.addEventListener('click', function() {
    window.print();
});

// LinkedIn 공유
document.querySelector('.btn-share-linkedin')?.addEventListener('click', function() {
    const certificateId = 'KGPT-2024-1120-001'; // 예시
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent('한국GPT협회 수료증')}`;
    window.open(shareUrl, '_blank');
});

// 학습 연속 일수 애니메이션
const streakBadge = document.querySelector('.streak-badge i');
if (streakBadge) {
    setInterval(() => {
        streakBadge.style.animation = 'none';
        setTimeout(() => {
            streakBadge.style.animation = 'flicker 2s ease-in-out infinite';
        }, 10);
    }, 5000);
}