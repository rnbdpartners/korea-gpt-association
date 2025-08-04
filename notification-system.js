// 알림 시스템
class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        this.unreadCount = 0;
        this.notificationContainer = null;
        this.notificationBadge = null;
        
        this.init();
    }

    init() {
        // 알림 UI 생성
        this.createNotificationUI();
        
        // 읽지 않은 알림 수 계산
        this.updateUnreadCount();
        
        // 주기적으로 새 알림 확인 (데모용)
        this.startNotificationCheck();
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    createNotificationUI() {
        // 알림 아이콘 추가 (네비게이션 바에)
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            const notificationBtn = document.createElement('button');
            notificationBtn.className = 'btn-notification';
            notificationBtn.innerHTML = `
                <i class="fas fa-bell"></i>
                <span class="notification-badge" style="display: none;">0</span>
            `;
            notificationBtn.onclick = () => this.toggleNotifications();
            
            // 검색 버튼 다음에 삽입
            const searchBtn = navActions.querySelector('.btn-search');
            if (searchBtn) {
                searchBtn.insertAdjacentElement('afterend', notificationBtn);
            } else {
                navActions.insertBefore(notificationBtn, navActions.firstChild);
            }
            
            this.notificationBadge = notificationBtn.querySelector('.notification-badge');
        }

        // 알림 패널 생성
        const notificationPanel = document.createElement('div');
        notificationPanel.className = 'notification-panel';
        notificationPanel.innerHTML = `
            <div class="notification-header">
                <h3>알림</h3>
                <button class="mark-all-read" onclick="notificationSystem.markAllAsRead()">
                    모두 읽음 표시
                </button>
            </div>
            <div class="notification-list">
                <!-- 알림이 여기에 표시됩니다 -->
            </div>
            <div class="notification-footer">
                <a href="#" onclick="notificationSystem.viewAllNotifications()">
                    모든 알림 보기
                </a>
            </div>
        `;
        document.body.appendChild(notificationPanel);
        this.notificationContainer = notificationPanel;

        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .btn-notification {
                position: relative;
                background: transparent;
                border: none;
                color: var(--text-primary);
                font-size: 1.2rem;
                padding: 0.5rem;
                cursor: pointer;
                transition: color 0.3s ease;
            }

            .btn-notification:hover {
                color: var(--primary-color);
            }

            .notification-badge {
                position: absolute;
                top: 0;
                right: 0;
                background: #dc3545;
                color: white;
                font-size: 0.7rem;
                font-weight: 600;
                padding: 0.2rem 0.4rem;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            }

            .notification-panel {
                position: fixed;
                top: 70px;
                right: 20px;
                width: 380px;
                max-height: 500px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                display: none;
                z-index: 1001;
                overflow: hidden;
            }

            .notification-panel.active {
                display: block;
                animation: slideDown 0.3s ease;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .notification-header {
                padding: 20px;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notification-header h3 {
                margin: 0;
                font-size: 18px;
                color: #2d3e50;
            }

            .mark-all-read {
                background: none;
                border: none;
                color: #31E0AA;
                font-size: 14px;
                cursor: pointer;
                transition: color 0.3s ease;
            }

            .mark-all-read:hover {
                color: #28c997;
            }

            .notification-list {
                max-height: 350px;
                overflow-y: auto;
            }

            .notification-item {
                padding: 15px 20px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background 0.3s ease;
                position: relative;
            }

            .notification-item:hover {
                background: #f8f9fa;
            }

            .notification-item.unread {
                background: #f0f9ff;
            }

            .notification-item.unread::before {
                content: '';
                position: absolute;
                left: 8px;
                top: 50%;
                transform: translateY(-50%);
                width: 8px;
                height: 8px;
                background: #31E0AA;
                border-radius: 50%;
            }

            .notification-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-size: 18px;
                float: left;
            }

            .notification-icon.info {
                background: #e3f2fd;
                color: #1976d2;
            }

            .notification-icon.success {
                background: #e8f5e9;
                color: #388e3c;
            }

            .notification-icon.warning {
                background: #fff3e0;
                color: #f57c00;
            }

            .notification-icon.error {
                background: #ffebee;
                color: #d32f2f;
            }

            .notification-content {
                overflow: hidden;
            }

            .notification-title {
                font-weight: 600;
                color: #2d3e50;
                margin-bottom: 5px;
                font-size: 14px;
            }

            .notification-message {
                color: #6c757d;
                font-size: 13px;
                line-height: 1.4;
            }

            .notification-time {
                color: #adb5bd;
                font-size: 12px;
                margin-top: 5px;
            }

            .notification-footer {
                padding: 15px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }

            .notification-footer a {
                color: #31E0AA;
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
            }

            .notification-footer a:hover {
                color: #28c997;
            }

            .empty-notifications {
                padding: 60px 20px;
                text-align: center;
                color: #6c757d;
            }

            .empty-notifications i {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .notification-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                max-width: 350px;
                z-index: 10000;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .notification-toast.hide {
                animation: fadeOut 0.3s ease forwards;
            }

            @keyframes fadeOut {
                to {
                    opacity: 0;
                    transform: translateY(30px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // 클릭 외부 영역 감지
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-notification') && 
                !e.target.closest('.notification-panel')) {
                this.closeNotifications();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeNotifications();
            }
        });
    }

    // 알림 추가
    addNotification(notification) {
        const newNotification = {
            id: Date.now().toString(),
            type: notification.type || 'info',
            title: notification.title,
            message: notification.message,
            link: notification.link || null,
            read: false,
            createdAt: new Date().toISOString(),
            ...notification
        };

        this.notifications.unshift(newNotification);
        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();

        // 토스트 알림 표시
        if (notification.showToast !== false) {
            this.showToast(newNotification);
        }

        return newNotification;
    }

    // 알림 읽음 처리
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.updateUnreadCount();
            this.renderNotifications();
        }
    }

    // 모든 알림 읽음 처리
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();
    }

    // 알림 삭제
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
        this.updateUnreadCount();
        this.renderNotifications();
    }

    // 알림 저장
    saveNotifications() {
        // 최대 50개까지만 저장
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }

    // 읽지 않은 알림 수 업데이트
    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (this.notificationBadge) {
            if (this.unreadCount > 0) {
                this.notificationBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                this.notificationBadge.style.display = 'block';
            } else {
                this.notificationBadge.style.display = 'none';
            }
        }
    }

    // 알림 목록 렌더링
    renderNotifications() {
        const listContainer = this.notificationContainer.querySelector('.notification-list');
        
        if (this.notifications.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>새로운 알림이 없습니다</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" 
                 onclick="notificationSystem.handleNotificationClick('${notification.id}')">
                <div class="notification-icon ${notification.type}">
                    <i class="${this.getIconClass(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTime(notification.createdAt)}</div>
                </div>
            </div>
        `).join('');
    }

    // 알림 클릭 처리
    handleNotificationClick(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        this.markAsRead(notificationId);

        if (notification.link) {
            window.location.href = notification.link;
        }
    }

    // 알림 패널 토글
    toggleNotifications() {
        if (this.notificationContainer.classList.contains('active')) {
            this.closeNotifications();
        } else {
            this.openNotifications();
        }
    }

    openNotifications() {
        this.notificationContainer.classList.add('active');
        this.renderNotifications();
    }

    closeNotifications() {
        this.notificationContainer.classList.remove('active');
    }

    // 토스트 알림 표시
    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div style="display: flex; align-items: start; gap: 15px;">
                <div class="notification-icon ${notification.type}" style="flex-shrink: 0;">
                    <i class="${this.getIconClass(notification.type)}"></i>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 5px;">${notification.title}</div>
                    <div style="color: #6c757d; font-size: 14px;">${notification.message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: #6c757d; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // 5초 후 자동 제거
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    // 아이콘 클래스 가져오기
    getIconClass(type) {
        const icons = {
            info: 'fas fa-info',
            success: 'fas fa-check',
            warning: 'fas fa-exclamation',
            error: 'fas fa-times',
            course: 'fas fa-graduation-cap',
            community: 'fas fa-comments',
            system: 'fas fa-cog'
        };
        return icons[type] || icons.info;
    }

    // 시간 포맷팅
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return date.toLocaleDateString('ko-KR');
    }

    // 모든 알림 보기
    viewAllNotifications() {
        // 별도의 알림 페이지로 이동하거나 모달 표시
        alert('모든 알림 페이지는 준비 중입니다.');
    }

    // 데모용 알림 생성
    startNotificationCheck() {
        // 초기 데모 알림
        if (this.notifications.length === 0) {
            this.addNotification({
                type: 'success',
                title: '환영합니다!',
                message: '한국GPT협회에 오신 것을 환영합니다. 학습을 시작해보세요!',
                showToast: false
            });

            this.addNotification({
                type: 'course',
                title: '새로운 강의 오픈',
                message: 'ChatGPT 고급 활용법 강의가 오픈되었습니다.',
                link: 'online-class.html',
                showToast: false
            });
        }

        // 주기적으로 데모 알림 생성 (30초마다)
        setInterval(() => {
            const demoNotifications = [
                {
                    type: 'info',
                    title: '학습 리마인더',
                    message: '오늘의 학습을 완료하지 않으셨습니다.'
                },
                {
                    type: 'success',
                    title: '수료증 발급 완료',
                    message: 'ChatGPT 첫걸음 과정 수료증이 발급되었습니다.',
                    link: 'my-classroom.html'
                },
                {
                    type: 'community',
                    title: '새로운 댓글',
                    message: '작성하신 게시글에 새로운 댓글이 달렸습니다.',
                    link: 'community.html'
                },
                {
                    type: 'warning',
                    title: '수강 기간 만료 임박',
                    message: '비즈니스 ChatGPT 과정이 3일 후 만료됩니다.'
                }
            ];

            // 랜덤하게 알림 생성 (20% 확률)
            if (Math.random() < 0.2) {
                const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
                this.addNotification(randomNotification);
            }
        }, 30000);
    }
}

// 전역 인스턴스 생성
window.notificationSystem = new NotificationSystem();

// 외부에서 사용할 수 있는 함수들
window.showNotification = (title, message, type = 'info', link = null) => {
    return window.notificationSystem.addNotification({ title, message, type, link });
};

console.log('알림 시스템 로드 완료');