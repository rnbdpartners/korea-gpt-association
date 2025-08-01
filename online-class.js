// 온라인 클래스 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드시 장바구니 수 업데이트
    updateCartCount();
    // 필터 탭 기능
    const filterTabs = document.querySelectorAll('.filter-tab');
    const courseCards = document.querySelectorAll('.course-card');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 활성 탭 변경
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // 강좌 필터링
            courseCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    const category = card.getAttribute('data-category');
                    card.style.display = category === filter ? 'block' : 'none';
                }
            });
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
    
    // 미리보기 모달
    const previewButtons = document.querySelectorAll('.btn-preview');
    const previewModal = document.getElementById('previewModal');
    const modalClose = document.querySelector('.modal-close');
    const modalIframe = previewModal.querySelector('iframe');
    
    previewButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 여기에 실제 비디오 URL을 설정
            modalIframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ'; // 예시 URL
            previewModal.classList.add('active');
        });
    });
    
    modalClose.addEventListener('click', function() {
        previewModal.classList.remove('active');
        modalIframe.src = ''; // 비디오 정지
    });
    
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            previewModal.classList.remove('active');
            modalIframe.src = ''; // 비디오 정지
        }
    });
    
    // 장바구니 알림
    const cartButtons = document.querySelectorAll('.btn-cart');
    const cartNotification = document.getElementById('cartNotification');
    
    cartButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 장바구니에 추가
            const courseCard = this.closest('.course-card');
            const courseTitle = courseCard.querySelector('.course-title').textContent;
            const instructor = courseCard.querySelector('.meta-item span').textContent;
            const originalPrice = courseCard.querySelector('.original-price').textContent;
            const finalPrice = courseCard.querySelector('.current-price').textContent;
            const discountRate = courseCard.querySelector('.discount-rate').textContent;
            const duration = courseCard.querySelectorAll('.meta-item')[1].textContent.trim();
            const lectures = courseCard.querySelectorAll('.meta-item')[2].textContent.trim();
            
            // 장바구니 데이터 구성
            const cartItem = {
                id: Date.now(),
                title: courseTitle,
                instructor: instructor,
                originalPrice: originalPrice,
                finalPrice: finalPrice,
                discountRate: discountRate,
                duration: duration,
                lectures: lectures,
                thumbnail: courseCard.querySelector('.course-thumbnail img').src
            };
            
            // 기존 장바구니 가져오기
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // 중복 체크
            const exists = cart.some(item => item.title === courseTitle);
            if (!exists) {
                cart.push(cartItem);
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // 알림 표시
                cartNotification.classList.add('show');
                
                setTimeout(() => {
                    cartNotification.classList.remove('show');
                }, 3000);
                
                // 장바구니 아이템 수 업데이트
                updateCartCount();
            } else {
                alert('이미 장바구니에 담긴 강의입니다.');
            }
        });
    });
    
    // 수강신청 버튼
    const enrollButtons = document.querySelectorAll('.btn-enroll');
    
    enrollButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const courseCard = this.closest('.course-card');
            const courseTitle = courseCard.querySelector('.course-title').textContent;
            const coursePrice = courseCard.querySelector('.current-price').textContent;
            
            // 로그인 체크 (추후 실제 로그인 상태 확인)
            const isLoggedIn = checkLoginStatus();
            
            if (!isLoggedIn) {
                alert('수강신청을 위해 로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }
            
            // 장바구니에 담고 결제 페이지로 이동
            const courseCard = this.closest('.course-card');
            
            // 장바구니에 추가
            const cartItem = {
                id: Date.now(),
                title: courseTitle,
                instructor: courseCard.querySelector('.meta-item span').textContent,
                originalPrice: courseCard.querySelector('.original-price').textContent,
                finalPrice: coursePrice,
                discountRate: courseCard.querySelector('.discount-rate').textContent,
                duration: courseCard.querySelectorAll('.meta-item')[1].textContent.trim(),
                lectures: courseCard.querySelectorAll('.meta-item')[2].textContent.trim(),
                thumbnail: courseCard.querySelector('.course-thumbnail img').src
            };
            
            // 바로 구매를 위한 장바구니 설정
            localStorage.setItem('cart', JSON.stringify([cartItem]));
            
            // 결제 페이지로 이동
            window.location.href = 'checkout.html';
        });
    });
    
    // 모바일 메뉴 토글
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-active');
            this.innerHTML = navMenu.classList.contains('mobile-active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
    
    // 스크롤 애니메이션
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
    const animateElements = document.querySelectorAll('.course-card, .benefit-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
    
    // 강의 카드 클릭 시 상세 페이지로 이동
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // 버튼 클릭이 아닌 경우에만 상세 페이지로 이동
            if (!e.target.closest('.btn-cart, .btn-enroll, .btn-preview')) {
                window.location.href = 'course-detail.html';
            }
        });
        
        // 커서 포인터 스타일 추가
        card.style.cursor = 'pointer';
    });
    
    // 실시간 수강생 수 업데이트 (데모용)
    updateLiveStats();
});

// 로그인 상태 확인 함수
function checkLoginStatus() {
    // 실제로는 세션이나 토큰 확인
    return localStorage.getItem('isLoggedIn') === 'true';
}

// 장바구니 수 업데이트
function updateCartCount() {
    // localStorage에서 장바구니 데이터 가져오기
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.length;
    
    // 장바구니 아이콘에 숫자 표시 (추후 UI 구현 시 활성화)
    const cartIcon = document.querySelector('.cart-count');
    if (cartIcon) {
        cartIcon.textContent = cartCount;
        cartIcon.style.display = cartCount > 0 ? 'block' : 'none';
    }
}

// 실시간 통계 업데이트
function updateLiveStats() {
    const todayStudents = document.querySelector('.cta-stats .number');
    const currentStudents = document.querySelectorAll('.students span');
    
    // 랜덤하게 숫자 변경 (데모용)
    setInterval(() => {
        if (todayStudents) {
            const current = parseInt(todayStudents.textContent);
            const change = Math.random() > 0.7 ? 1 : 0;
            todayStudents.textContent = current + change + '명';
        }
        
        currentStudents.forEach(span => {
            if (Math.random() > 0.8) {
                const text = span.textContent;
                const match = text.match(/(\d+)명/);
                if (match) {
                    const num = parseInt(match[1]);
                    span.textContent = (num + 1) + '명 수강중';
                }
            }
        });
    }, 10000); // 10초마다 업데이트
}

// CTA 버튼 클릭
document.querySelector('.btn-cta-large')?.addEventListener('click', function() {
    window.scrollTo({
        top: document.querySelector('.courses-section').offsetTop - 100,
        behavior: 'smooth'
    });
});