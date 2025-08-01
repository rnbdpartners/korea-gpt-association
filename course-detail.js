// 강의 상세 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 탭 전환 기능
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 모든 탭 비활성화
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // 선택된 탭 활성화
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
    
    // 커리큘럼 섹션 접기/펼치기
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const lessons = this.nextElementSibling;
            lessons.classList.toggle('collapsed');
            
            const icon = this.querySelector('i');
            if (lessons.classList.contains('collapsed')) {
                icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
            } else {
                icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
            }
        });
    });
    
    // FAQ 토글
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            // 다른 FAQ 닫기
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // 현재 FAQ 토글
            item.classList.toggle('active');
        });
    });
    
    // 미리보기 비디오 재생
    const previewPlayBtn = document.getElementById('previewPlay');
    const previewModal = document.getElementById('previewModal');
    const modalClose = document.querySelector('.modal-close');
    const modalIframe = previewModal.querySelector('iframe');
    
    if (previewPlayBtn) {
        previewPlayBtn.addEventListener('click', function() {
            // 실제로는 강의 미리보기 비디오 URL 설정
            modalIframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
            previewModal.classList.add('active');
        });
    }
    
    // 개별 강의 미리보기
    const previewBtns = document.querySelectorAll('.btn-preview');
    previewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            // 해당 강의의 미리보기 비디오 재생
            modalIframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
            previewModal.classList.add('active');
        });
    });
    
    // 모달 닫기
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            previewModal.classList.remove('active');
            modalIframe.src = '';
        });
    }
    
    // 모달 외부 클릭시 닫기
    if (previewModal) {
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal) {
                previewModal.classList.remove('active');
                modalIframe.src = '';
            }
        });
    }
    
    // 지금 바로 수강하기 버튼
    const enrollBtn = document.querySelector('.btn-enroll-now');
    if (enrollBtn) {
        enrollBtn.addEventListener('click', function() {
            // 로그인 체크
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (!isLoggedIn) {
                alert('수강신청을 위해 로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }
            
            // 장바구니에 바로 담고 결제 페이지로 이동
            const courseData = {
                id: Date.now(),
                title: 'ChatGPT 첫걸음: 30분 만에 시작하기',
                instructor: '김민준 강사',
                originalPrice: '66,000원',
                finalPrice: '33,000원',
                discountRate: '-50%',
                duration: '총 3시간',
                lectures: '15개 강의',
                thumbnail: 'https://via.placeholder.com/400x225'
            };
            
            localStorage.setItem('cart', JSON.stringify([courseData]));
            window.location.href = 'checkout.html';
        });
    }
    
    // 장바구니 담기 버튼
    const addCartBtn = document.querySelector('.btn-add-cart');
    if (addCartBtn) {
        addCartBtn.addEventListener('click', function() {
            const courseData = {
                id: Date.now(),
                title: 'ChatGPT 첫걸음: 30분 만에 시작하기',
                instructor: '김민준 강사',
                originalPrice: '66,000원',
                finalPrice: '33,000원',
                discountRate: '-50%',
                duration: '총 3시간',
                lectures: '15개 강의',
                thumbnail: 'https://via.placeholder.com/400x225'
            };
            
            // 기존 장바구니 가져오기
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // 중복 체크
            const exists = cart.some(item => item.title === courseData.title);
            if (!exists) {
                cart.push(courseData);
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // 성공 알림
                showCartNotification();
                updateCartCount();
            } else {
                alert('이미 장바구니에 담긴 강의입니다.');
            }
        });
    }
    
    // 후기 도움돼요 버튼
    const helpfulBtns = document.querySelectorAll('.btn-helpful');
    helpfulBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentCount = parseInt(this.textContent.match(/\d+/)[0]);
            this.innerHTML = `<i class="fas fa-thumbs-up"></i> 도움돼요 (${currentCount + 1})`;
            this.disabled = true;
            this.style.opacity = '0.6';
        });
    });
    
    // 더 많은 후기 보기
    const loadMoreBtn = document.querySelector('.btn-load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // 실제로는 서버에서 추가 후기 데이터를 가져옴
            alert('추가 후기를 불러오는 기능은 백엔드 연동 후 구현됩니다.');
        });
    }
    
    // 관련 강의 카드 클릭
    const relatedCourses = document.querySelectorAll('.course-card.mini');
    relatedCourses.forEach(card => {
        card.addEventListener('click', function() {
            // 해당 강의의 상세 페이지로 이동
            // 실제로는 강의 ID를 기반으로 동적 URL 생성
            window.location.href = 'course-detail.html';
        });
    });
    
    // 할인 타이머 (데모용)
    updateDiscountTimer();
    
    // 장바구니 수 업데이트
    updateCartCount();
});

// 장바구니 알림 표시
function showCartNotification() {
    // 알림 요소가 없으면 생성
    let notification = document.getElementById('cartNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cartNotification';
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>장바구니에 담았습니다</span>
        `;
        document.body.appendChild(notification);
        
        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .cart-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--primary);
                color: var(--dark);
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                transform: translateX(400px);
                transition: transform 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
            }
            .cart-notification.show {
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 장바구니 수 업데이트
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.length;
    
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// 할인 타이머 업데이트 (데모용)
function updateDiscountTimer() {
    const timerElement = document.querySelector('.discount-timer span');
    if (!timerElement) return;
    
    // 2일 후 종료로 설정
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 2);
    endDate.setHours(23, 59, 59);
    
    function updateTimer() {
        const now = new Date();
        const timeDiff = endDate - now;
        
        if (timeDiff <= 0) {
            timerElement.textContent = '할인 종료';
            return;
        }
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        timerElement.textContent = `할인 종료까지 ${days}일 ${hours}시간 ${minutes}분`;
    }
    
    updateTimer();
    setInterval(updateTimer, 60000); // 1분마다 업데이트
}