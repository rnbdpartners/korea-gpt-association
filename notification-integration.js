// 알림 시스템 통합
// 이 파일은 각 페이지의 이벤트와 알림 시스템을 연결합니다

document.addEventListener('DOMContentLoaded', function() {
    // 알림 시스템이 로드되었는지 확인
    if (typeof window.notificationSystem === 'undefined') {
        console.error('알림 시스템이 로드되지 않았습니다.');
        return;
    }

    // 로그인 성공 시 알림
    if (window.location.pathname.includes('login.html')) {
        const originalLogin = window.login;
        window.login = function() {
            const result = originalLogin.apply(this, arguments);
            if (result !== false) {
                localStorage.setItem('showWelcomeNotification', 'true');
            }
            return result;
        };
    }

    // 메인 페이지에서 환영 알림 표시
    if (window.location.pathname.endsWith('/') || window.location.pathname.includes('index.html')) {
        if (localStorage.getItem('showWelcomeNotification') === 'true') {
            setTimeout(() => {
                window.showNotification(
                    '로그인 성공',
                    '환영합니다! 학습을 시작해보세요.',
                    'success'
                );
                localStorage.removeItem('showWelcomeNotification');
            }, 1000);
        }
    }

    // 장바구니 추가 시 알림
    if (typeof window.addToCart !== 'undefined') {
        const originalAddToCart = window.addToCart;
        window.addToCart = function(courseId, courseName, price) {
            originalAddToCart(courseId, courseName, price);
            window.showNotification(
                '장바구니에 추가됨',
                `${courseName} 강의가 장바구니에 추가되었습니다.`,
                'success'
            );
        };
    }

    // 수강 신청 완료 시 알림
    if (window.location.pathname.includes('online-class.html')) {
        // 결제 완료 시뮬레이션
        const checkoutButtons = document.querySelectorAll('.btn-checkout');
        checkoutButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                setTimeout(() => {
                    window.showNotification(
                        '수강 신청 완료',
                        '강의 수강이 시작되었습니다. 내 강의실에서 확인하세요.',
                        'success',
                        'my-classroom.html'
                    );
                }, 2000);
            });
        });
    }

    // 오프라인 클래스 신청 시 알림
    if (window.location.pathname.includes('offline-class.html')) {
        // 신청 완료 후 알림
        if (typeof window.handleApplicationSubmit !== 'undefined') {
            const originalSubmit = window.handleApplicationSubmit;
            window.handleApplicationSubmit = async function(e) {
                const result = await originalSubmit.apply(this, arguments);
                if (result !== false) {
                    window.showNotification(
                        '신청 완료',
                        '오프라인 클래스 신청이 완료되었습니다. 확인 이메일을 발송했습니다.',
                        'success'
                    );
                }
                return result;
            };
        }
    }

    // 커뮤니티 활동 알림
    if (window.location.pathname.includes('community.html')) {
        // 게시글 작성 완료
        if (typeof window.communityAPI !== 'undefined') {
            const originalCreatePost = window.communityAPI.createPost;
            window.communityAPI.createPost = async function(postData) {
                const result = await originalCreatePost.apply(this, arguments);
                if (result.success) {
                    window.showNotification(
                        '게시글 작성 완료',
                        '게시글이 성공적으로 등록되었습니다.',
                        'success'
                    );
                }
                return result;
            };

            // 댓글 작성 완료
            const originalCreateComment = window.communityAPI.createComment;
            window.communityAPI.createComment = async function(postId, commentData) {
                const result = await originalCreateComment.apply(this, arguments);
                if (result.success) {
                    window.showNotification(
                        '댓글 작성 완료',
                        '댓글이 성공적으로 등록되었습니다.',
                        'success'
                    );
                }
                return result;
            };
        }
    }

    // 내 강의실 활동 알림
    if (window.location.pathname.includes('my-classroom.html')) {
        // 수료증 발급 알림
        if (typeof window.myClassroomAPI !== 'undefined') {
            const originalIssueCertificate = window.myClassroomAPI.issueCertificate;
            window.myClassroomAPI.issueCertificate = async function(courseId) {
                const result = await originalIssueCertificate.apply(this, arguments);
                if (result.success) {
                    window.showNotification(
                        '수료증 발급 완료',
                        '축하합니다! 수료증이 발급되었습니다.',
                        'success'
                    );
                }
                return result;
            };
        }

        // 학습 진도 업데이트 알림
        if (typeof window.myClassroomAPI !== 'undefined') {
            let lastProgress = {};
            const originalUpdateProgress = window.myClassroomAPI.updateLectureProgress;
            window.myClassroomAPI.updateLectureProgress = async function(courseId, lectureId, watchedSeconds) {
                const result = await originalUpdateProgress.apply(this, arguments);
                if (result.success && result.data.completed) {
                    const key = `${courseId}_${lectureId}`;
                    if (!lastProgress[key]) {
                        window.showNotification(
                            '강의 완료',
                            '강의를 완료했습니다! 다음 강의로 계속 진행하세요.',
                            'success'
                        );
                        lastProgress[key] = true;
                    }
                }
                return result;
            };
        }
    }

    // 검색 관련 알림
    if (typeof window.searchAPI !== 'undefined') {
        // 검색 결과가 없을 때
        const originalSearch = window.searchAPI.search;
        window.searchAPI.search = async function(query, filters) {
            const result = await originalSearch.apply(this, arguments);
            if (result.success && result.data.total === 0) {
                window.showNotification(
                    '검색 결과 없음',
                    '다른 검색어로 시도해보세요.',
                    'info'
                );
            }
            return result;
        };
    }

    // 세션 만료 경고 (데모)
    setTimeout(() => {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            window.showNotification(
                '세션 만료 임박',
                '10분 후 자동 로그아웃됩니다. 활동을 계속하세요.',
                'warning'
            );
        }
    }, 1800000); // 30분 후

    // 브라우저 알림 권한 요청
    if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    window.showNotification(
                        '알림 설정 완료',
                        '이제 중요한 소식을 실시간으로 받아보실 수 있습니다.',
                        'success'
                    );
                }
            });
        }, 5000);
    }

    // 특별 이벤트 알림 (데모)
    const today = new Date();
    const hour = today.getHours();
    
    // 점심시간 학습 권유
    if (hour === 12) {
        setTimeout(() => {
            window.showNotification(
                '점심시간 학습 추천',
                '짧은 시간에 학습할 수 있는 5분 강의를 추천드립니다.',
                'info',
                'online-class.html'
            );
        }, 10000);
    }

    // 저녁 학습 리마인더
    if (hour >= 19 && hour <= 21) {
        setTimeout(() => {
            window.showNotification(
                '오늘의 학습 리마인더',
                '오늘 학습 목표를 달성하셨나요? 지금 확인해보세요.',
                'info',
                'my-classroom.html'
            );
        }, 15000);
    }

    // 주말 특별 할인 알림 (토요일, 일요일)
    if (today.getDay() === 0 || today.getDay() === 6) {
        setTimeout(() => {
            window.showNotification(
                '주말 특별 할인',
                '이번 주말만! 모든 강의 20% 할인 중',
                'warning',
                'online-class.html'
            );
        }, 20000);
    }
});

console.log('알림 통합 시스템 로드 완료');