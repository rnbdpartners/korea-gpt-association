// 내 강의실 페이지 JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // API 스크립트 로드 확인
    if (typeof window.myClassroomAPI === 'undefined') {
        const script = document.createElement('script');
        script.src = 'my-classroom-api.js';
        document.head.appendChild(script);
        
        // API 로드 대기
        await new Promise(resolve => {
            script.onload = resolve;
        });
    }
    
    // 로그인 체크
    checkAuthentication();
    
    // 초기 데이터 로드
    loadDashboardData();
    
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
            
            // 탭별 데이터 로드
            switch(targetTab) {
                case 'learning':
                    loadLearningCourses();
                    break;
                case 'certificates':
                    loadCertificates();
                    break;
                case 'badges':
                    loadBadges();
                    break;
            }
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
    
    // 스크롤 애니메이션
    initScrollAnimations();
    
    // 사용자 정보 드롭다운
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            // 드롭다운 메뉴 표시
            console.log('User profile clicked');
        });
    }
});

// 대시보드 데이터 로드
async function loadDashboardData() {
    try {
        // 학습 통계 로드
        const statsResult = await window.myClassroomAPI.getLearningStatistics();
        if (statsResult.success) {
            updateDashboardStats(statsResult.data);
        }
        
        // 수강 중인 강의 로드
        await loadLearningCourses();
        
        // 추천 강의 로드
        const recommendResult = await window.myClassroomAPI.getRecommendations();
        if (recommendResult.success) {
            displayRecommendations(recommendResult.data);
        }
        
    } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
    }
}

// 대시보드 통계 업데이트
function updateDashboardStats(stats) {
    // 요약 카드 업데이트
    const summaryCards = document.querySelectorAll('.summary-card');
    if (summaryCards.length >= 4) {
        summaryCards[0].querySelector('.summary-number').textContent = stats.totalEnrollments;
        summaryCards[1].querySelector('.summary-number').textContent = (stats.totalWatchTime / 60).toFixed(1);
        summaryCards[2].querySelector('.summary-number').textContent = stats.completedCourses;
        summaryCards[3].querySelector('.summary-number').textContent = '1,250'; // 포인트는 별도 관리
    }
    
    // 학습 통계 애니메이션
    updateLearningStats();
}

// 수강 중인 강의 로드
async function loadLearningCourses() {
    const result = await window.myClassroomAPI.getMyEnrollments({ status: 'active' });
    
    if (result.success) {
        const container = document.querySelector('.courses-grid');
        if (!container) return;
        
        if (result.data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap"></i>
                    <p>아직 수강 중인 강의가 없습니다.</p>
                    <a href="online-class.html" class="btn-primary">강의 둘러보기</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = result.data.map(enrollment => {
            const isCompleted = enrollment.progress === 100;
            const daysLeft = Math.ceil((new Date(enrollment.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="course-progress-card ${isCompleted ? 'completed' : ''}" data-course-id="${enrollment.courseId}">
                    <div class="course-thumbnail">
                        <img src="${enrollment.thumbnail}" alt="${enrollment.courseName}">
                        <div class="course-type">${enrollment.courseType === 'online' ? '온라인' : '오프라인'}</div>
                        ${isCompleted ? '<div class="course-badge">수료완료</div>' : ''}
                    </div>
                    <div class="course-info">
                        <h3>${enrollment.courseName}</h3>
                        <div class="course-meta">
                            <span><i class="fas fa-user"></i> ${enrollment.instructor}</span>
                            <span><i class="fas fa-calendar"></i> ${daysLeft > 0 ? daysLeft + '일 남음' : '기간 만료'}</span>
                        </div>
                        <div class="progress-section">
                            <div class="progress-header">
                                <span>진도율</span>
                                <span class="progress-percentage">${Math.round(enrollment.progress)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${enrollment.progress}%"></div>
                            </div>
                            <div class="progress-detail">
                                <span>${enrollment.completedLectures}/${enrollment.totalLectures} 강의</span>
                                <span>${enrollment.watchedDuration}/${enrollment.totalDuration}분</span>
                            </div>
                        </div>
                        <div class="course-actions">
                            ${isCompleted ? 
                                `<button class="btn-certificate" onclick="viewCertificate('${enrollment.courseId}')">
                                    <i class="fas fa-certificate"></i> 수료증 보기
                                </button>` :
                                `<button class="btn-continue" onclick="continueLearning('${enrollment.courseId}')">
                                    <i class="fas fa-play"></i> 이어서 학습하기
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // 진도바 애니메이션
        setTimeout(() => {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        }, 100);
    }
}

// 수료증 로드
async function loadCertificates() {
    const result = await window.myClassroomAPI.getMyCertificates();
    
    if (result.success) {
        const container = document.querySelector('#certificates .certificates-grid');
        if (!container) return;
        
        if (result.data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-certificate"></i>
                    <p>아직 획득한 수료증이 없습니다.</p>
                    <p class="text-muted">강의를 100% 수료하면 수료증을 받을 수 있습니다.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = result.data.map(cert => `
            <div class="certificate-card" data-cert-id="${cert.id}">
                <div class="certificate-preview">
                    <div class="cert-header">
                        <img src="images/logo.png" alt="한국GPT협회">
                        <h4>수료증</h4>
                    </div>
                    <div class="cert-body">
                        <p class="cert-recipient">${cert.studentName}</p>
                        <p class="cert-course">${cert.courseName}</p>
                        <p class="cert-date">${new Date(cert.issuedAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                </div>
                <div class="certificate-info">
                    <h4>${cert.courseName}</h4>
                    <p class="cert-number">인증번호: ${cert.certificateNumber}</p>
                    <div class="cert-actions">
                        <button class="btn-download" onclick="downloadCertificate('${cert.id}')">
                            <i class="fas fa-download"></i> 다운로드
                        </button>
                        <button class="btn-share" onclick="shareCertificate('${cert.id}')">
                            <i class="fas fa-share-alt"></i> 공유
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// 배지 로드
function loadBadges() {
    // 배지 시스템은 별도 구현 필요
    const badgesGrid = document.querySelector('.badges-grid');
    if (badgesGrid) {
        // 기존 배지 유지
    }
}

// 추천 강의 표시
function displayRecommendations(recommendations) {
    const container = document.querySelector('.recommendations-grid');
    if (!container || recommendations.length === 0) return;
    
    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card">
            <div class="recommendation-badge">추천</div>
            <h3>${rec.courseName}</h3>
            <p>${rec.reason}</p>
            <button class="btn-start-course" onclick="startCourse('${rec.courseId}')">
                수강 시작하기
            </button>
        </div>
    `).join('');
}

// 학습 이어하기
async function continueLearning(courseId) {
    const progressResult = await window.myClassroomAPI.getCourseProgress(courseId);
    
    if (progressResult.success) {
        const lastLecture = progressResult.data.lastWatchedLecture;
        const lastTime = progressResult.data.lastWatchedTime;
        
        console.log(`이어서 학습: ${courseId}, 강의: ${lastLecture}, 시간: ${lastTime}초`);
        alert(`마지막 학습 위치부터 재생합니다.\n강의 ID: ${lastLecture}`);
        
        // 실제로는 강의 플레이어 페이지로 이동
        // window.location.href = `/player.html?course=${courseId}&lecture=${lastLecture}&t=${lastTime}`;
    }
}

// 수료증 보기
async function viewCertificate(courseId) {
    const certificates = await window.myClassroomAPI.getMyCertificates();
    
    if (certificates.success) {
        const cert = certificates.data.find(c => c.courseId === courseId);
        
        if (cert) {
            showCertificateModal(cert);
        } else {
            // 수료증 발급 시도
            const issueResult = await window.myClassroomAPI.issueCertificate(courseId);
            if (issueResult.success) {
                showCertificateModal(issueResult.data);
            } else {
                alert(issueResult.error);
            }
        }
    }
}

// 수료증 모달 표시
function showCertificateModal(certificate) {
    const modal = document.getElementById('certificateModal');
    if (!modal) return;
    
    // 수료증 정보 업데이트
    modal.querySelector('.certificate-name').textContent = certificate.studentName;
    modal.querySelector('.certificate-course').textContent = certificate.courseName;
    modal.querySelector('.certificate-date').textContent = new Date(certificate.issuedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    modal.querySelector('.certificate-number').textContent = certificate.certificateNumber;
    
    modal.classList.add('active');
}

// 수료증 다운로드
function downloadCertificate(certId) {
    console.log('수료증 다운로드:', certId);
    alert('수료증 PDF를 다운로드합니다.');
    // 실제로는 PDF 생성 및 다운로드 API 호출
}

// 수료증 공유
function shareCertificate(certId) {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href + '?cert=' + certId)}`;
    window.open(shareUrl, '_blank');
}

// 강의 시작
function startCourse(courseId) {
    if (confirm('이 강의 수강을 시작하시겠습니까?')) {
        // 실제로는 수강 신청 API 호출
        alert('수강 신청이 완료되었습니다!');
        loadLearningCourses();
    }
}

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
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // UI 업데이트
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = currentUser.name || '학습자';
    }
    
    // 연속 학습 일수 계산 (데모용)
    const streakCount = document.querySelector('.streak-count');
    if (streakCount) {
        streakCount.textContent = '7';
    }
}

// 로그아웃
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userToken');
        localStorage.removeItem('currentUser');
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

// 전역 함수 내보내기
window.continueLearning = continueLearning;
window.viewCertificate = viewCertificate;
window.downloadCertificate = downloadCertificate;
window.shareCertificate = shareCertificate;
window.startCourse = startCourse;
window.logout = logout;