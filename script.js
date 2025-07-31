// 한국GPT협회 웹사이트 JavaScript
console.log('한국GPT협회 웹사이트 로드됨');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료');
    
    // 모바일 메뉴 토글
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-active');
        });
    }
    
    // 스무스 스크롤
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 모바일 메뉴 닫기
                if (navMenu.classList.contains('mobile-active')) {
                    navMenu.classList.remove('mobile-active');
                }
            }
        });
    });
    
    // 버튼 클릭 이벤트
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const buttonText = this.textContent;
            alert(`${buttonText} 기능은 곧 제공될 예정입니다!`);
        });
    });
    
    // 강의 카드 클릭 이벤트
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', function() {
            const courseTitle = this.querySelector('h3').textContent;
            const coursePrice = this.querySelector('.price').textContent;
            alert(`${courseTitle}\n가격: ${coursePrice}\n\n상세 페이지로 이동합니다.`);
        });
        
        // 호버 효과를 위한 커서 스타일
        card.style.cursor = 'pointer';
    });
    
    // 기업교육 문의 버튼
    const enterpriseBtn = document.querySelector('.enterprise .btn-primary');
    if (enterpriseBtn) {
        enterpriseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const companyName = prompt('회사명을 입력해주세요:');
            if (companyName) {
                const contactName = prompt('담당자명을 입력해주세요:');
                if (contactName) {
                    const phone = prompt('연락처를 입력해주세요:');
                    if (phone) {
                        alert(`기업교육 문의가 접수되었습니다.\n\n회사명: ${companyName}\n담당자: ${contactName}\n연락처: ${phone}\n\n빠른 시일 내에 연락드리겠습니다.`);
                    }
                }
            }
        });
    }
    
    // 로그인/회원가입 버튼
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            alert('로그인 페이지로 이동합니다.');
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            alert('회원가입 페이지로 이동합니다.');
        });
    }
    
    // 소셜 미디어 링크
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className.split('-')[1];
            alert(`${platform} 페이지로 이동합니다.`);
        });
    });
    
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
    const animateElements = document.querySelectorAll('.course-card, .review-card, .enterprise-info');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
    
    // 헤더 스크롤 효과
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = 'var(--bg-primary)';
            header.style.backdropFilter = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // 성능 최적화를 위한 스크롤 이벤트 디바운싱
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 모바일 메뉴 CSS 추가
    const mobileMenuCSS = `
        @media (max-width: 768px) {
            .nav-menu.mobile-active {
                display: flex;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background-color: var(--bg-primary);
                box-shadow: var(--shadow-md);
                flex-direction: column;
                padding: 1rem;
                gap: 1rem;
            }
            
            .nav-menu.mobile-active .nav-links {
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav-menu.mobile-active .nav-actions {
                justify-content: center;
            }
        }
    `;
    
    // CSS 스타일 동적 추가
    const style = document.createElement('style');
    style.textContent = mobileMenuCSS;
    document.head.appendChild(style);
    
    console.log('모든 JavaScript 기능이 로드되었습니다.');
});