// 관리자 배너 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 관리자 로그인 체크
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isAdmin && isLoggedIn) {
        // 관리자 배너 생성
        const adminBanner = document.createElement('div');
        adminBanner.className = 'admin-banner';
        adminBanner.innerHTML = `
            <div class="admin-banner-content">
                <div class="admin-info">
                    <i class="fas fa-shield-alt"></i>
                    <span>관리자 모드</span>
                </div>
                <div class="admin-actions">
                    <a href="page-builder.html" class="admin-link">
                        <i class="fas fa-edit"></i>
                        페이지 편집
                    </a>
                    <a href="admin-dashboard.html" class="admin-link">
                        <i class="fas fa-tachometer-alt"></i>
                        관리자 대시보드
                    </a>
                    <a href="#" class="admin-link" onclick="adminBanner.toggleAnalytics(event)">
                        <i class="fas fa-chart-line"></i>
                        실시간 분석
                    </a>
                    <button class="admin-logout" onclick="adminBanner.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        관리자 로그아웃
                    </button>
                </div>
            </div>
            
            <!-- 실시간 분석 패널 -->
            <div class="analytics-panel" id="analyticsPanel">
                <div class="analytics-grid">
                    <div class="analytics-item">
                        <div class="analytics-value">234</div>
                        <div class="analytics-label">현재 접속자</div>
                    </div>
                    <div class="analytics-item">
                        <div class="analytics-value">1,287</div>
                        <div class="analytics-label">오늘 방문자</div>
                    </div>
                    <div class="analytics-item">
                        <div class="analytics-value">89</div>
                        <div class="analytics-label">신규 가입</div>
                    </div>
                    <div class="analytics-item">
                        <div class="analytics-value">₩3.2M</div>
                        <div class="analytics-label">오늘 매출</div>
                    </div>
                </div>
            </div>
        `;
        
        // body 최상단에 배너 삽입
        document.body.insertBefore(adminBanner, document.body.firstChild);
        
        // 페이지 컨텐츠 여백 조정
        const header = document.querySelector('.header');
        if (header) {
            header.style.marginTop = '50px';
        }
        
        // 관리자 배너 스타일 추가
        if (!document.getElementById('admin-banner-styles')) {
            const style = document.createElement('style');
            style.id = 'admin-banner-styles';
            style.textContent = `
                .admin-banner {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #2d3e50 0%, #1a2332 100%);
                    color: white;
                    z-index: 10000;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                }
                
                .admin-banner-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 10px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .admin-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                }
                
                .admin-info i {
                    color: #31E0AA;
                    font-size: 18px;
                }
                
                .admin-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .admin-link {
                    color: white;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    font-size: 14px;
                }
                
                .admin-link:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #31E0AA;
                }
                
                .admin-logout {
                    background: rgba(220, 53, 69, 0.9);
                    color: white;
                    border: none;
                    padding: 6px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }
                
                .admin-logout:hover {
                    background: #dc3545;
                    transform: translateY(-1px);
                }
                
                /* 실시간 분석 패널 */
                .analytics-panel {
                    display: none;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 15px 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .analytics-panel.active {
                    display: block;
                }
                
                .analytics-grid {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px;
                }
                
                .analytics-item {
                    text-align: center;
                }
                
                .analytics-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #31E0AA;
                    margin-bottom: 5px;
                }
                
                .analytics-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                }
                
                /* 반응형 */
                @media (max-width: 768px) {
                    .admin-banner-content {
                        flex-direction: column;
                        gap: 10px;
                        padding: 10px;
                    }
                    
                    .admin-actions {
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 10px;
                    }
                    
                    .admin-link {
                        font-size: 12px;
                        padding: 5px 10px;
                    }
                    
                    .analytics-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }
                    
                    .analytics-value {
                        font-size: 20px;
                    }
                }
                
                /* 페이지 컨텐츠 조정 */
                body.admin-mode {
                    padding-top: 50px;
                }
                
                body.admin-mode .header {
                    top: 50px;
                }
                
                /* 편집 모드 인디케이터 */
                .edit-mode-indicator {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #31E0AA;
                    color: #1a1a1a;
                    padding: 10px 20px;
                    border-radius: 30px;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(49, 224, 170, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 9999;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // body에 admin-mode 클래스 추가
        document.body.classList.add('admin-mode');
    }
});

// 관리자 배너 기능
window.adminBanner = {
    // 실시간 분석 토글
    toggleAnalytics: function(e) {
        e.preventDefault();
        const panel = document.getElementById('analyticsPanel');
        panel.classList.toggle('active');
        
        // 실시간 데이터 업데이트 시작
        if (panel.classList.contains('active')) {
            this.startAnalyticsUpdate();
        } else {
            this.stopAnalyticsUpdate();
        }
    },
    
    // 관리자 로그아웃
    logout: function() {
        if (confirm('관리자 모드를 종료하시겠습니까?')) {
            localStorage.setItem('isAdmin', 'false');
            location.reload();
        }
    },
    
    // 실시간 분석 데이터 업데이트
    analyticsInterval: null,
    startAnalyticsUpdate: function() {
        this.updateAnalytics(); // 즉시 업데이트
        this.analyticsInterval = setInterval(() => {
            this.updateAnalytics();
        }, 5000); // 5초마다 업데이트
    },
    
    stopAnalyticsUpdate: function() {
        if (this.analyticsInterval) {
            clearInterval(this.analyticsInterval);
            this.analyticsInterval = null;
        }
    },
    
    updateAnalytics: function() {
        // 실제로는 서버에서 데이터를 가져옴 (데모용 랜덤 데이터)
        const analytics = document.querySelectorAll('.analytics-value');
        if (analytics[0]) analytics[0].textContent = Math.floor(Math.random() * 100) + 200; // 현재 접속자
        if (analytics[1]) analytics[1].textContent = (Math.floor(Math.random() * 500) + 1000).toLocaleString(); // 오늘 방문자
        if (analytics[2]) analytics[2].textContent = Math.floor(Math.random() * 50) + 50; // 신규 가입
        if (analytics[3]) analytics[3].textContent = '₩' + (Math.random() * 2 + 2).toFixed(1) + 'M'; // 오늘 매출
    }
};

// 페이지별 편집 모드 버튼 추가
document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isAdmin && isLoggedIn && !window.location.pathname.includes('page-builder.html')) {
        // 편집 모드 플로팅 버튼 추가
        const editButton = document.createElement('div');
        editButton.className = 'edit-mode-indicator';
        editButton.innerHTML = `
            <i class="fas fa-magic"></i>
            <span>이 페이지 편집</span>
        `;
        editButton.onclick = function() {
            // 현재 페이지 정보를 저장하고 페이지 빌더로 이동
            localStorage.setItem('editingPage', window.location.pathname);
            window.location.href = 'page-builder.html';
        };
        document.body.appendChild(editButton);
    }
});