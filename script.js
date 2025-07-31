// 한국GPT협회 웹사이트 JavaScript
console.log('한국GPT협회 웹사이트 로드됨');

// B2C 홈페이지 기능
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료');
    
    // 숫자 카운트 애니메이션
    const animateNumbers = () => {
        const numbers = document.querySelectorAll('.metric-number');
        
        numbers.forEach(number => {
            const target = parseFloat(number.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateNumber = () => {
                current += increment;
                if (current < target) {
                    number.textContent = Math.floor(current);
                    requestAnimationFrame(updateNumber);
                } else {
                    number.textContent = target % 1 === 0 ? target : target.toFixed(1);
                }
            };
            
            updateNumber();
        });
    };
    
    // Intersection Observer로 숫자 애니메이션 트리거
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const metricsSection = document.querySelector('.success-metrics');
    if (metricsSection) {
        observer.observe(metricsSection);
    }
    
    // 스크롤 탑 버튼
    const topBtn = document.querySelector('.top-btn');
    if (topBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                topBtn.classList.add('visible');
            } else {
                topBtn.classList.remove('visible');
            }
        });
    }
    
    // 모바일 메뉴 토글
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-active');
            mobileMenuToggle.innerHTML = navMenu.classList.contains('mobile-active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
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
                if (navMenu && navMenu.classList.contains('mobile-active')) {
                    navMenu.classList.remove('mobile-active');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            }
        });
    });
    
    // 타이핑 애니메이션 효과
    const typingElements = document.querySelectorAll('.output-text');
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let index = 0;
        
        const typeWriter = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 30);
            }
        };
        
        // 약간의 지연 후 시작
        setTimeout(typeWriter, 1000);
    });
    
    // 버튼 클릭 이벤트
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.hasAttribute('onclick')) {
                e.preventDefault();
                const buttonText = this.textContent;
                alert(`${buttonText} 기능은 곧 제공될 예정입니다!`);
            }
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
    const scrollObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, scrollObserverOptions);
    
    // 애니메이션 대상 요소들
    const animateElements = document.querySelectorAll('.course-card, .review-card, .enterprise-info, .path-card, .testimonial-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        scrollObserver.observe(el);
    });
    
    // 헤더 스크롤 효과
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.backgroundColor = 'var(--bg-primary)';
            header.style.backdropFilter = 'none';
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // ROI 계산기
    const salaryInput = document.getElementById('salary');
    if (salaryInput) {
        salaryInput.addEventListener('input', function() {
            const salary = parseInt(this.value) || 0;
            const yearlyValue = salary * 12 * 1.5; // 2.5배 생산성 중 1.5배를 추가 가치로 계산
            const resultElement = document.querySelector('.highlight-number');
            if (resultElement) {
                resultElement.textContent = yearlyValue.toLocaleString() + '원';
            }
        });
    }
    
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

// 스크롤 함수
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 온라인 코스 보기
function showOnlineCourses() {
    // TODO: 온라인 코스 상세 페이지로 이동 또는 모달 열기
    alert('온라인 VOD 코스 상세 페이지 준비 중입니다.');
}

// 오프라인 일정 보기
function showOfflineSchedule() {
    // TODO: 오프라인 예약 페이지로 이동 또는 모달 열기
    alert('오프라인 교육 예약 페이지 준비 중입니다.');
}

// 1:1 상담 채팅
function openChat() {
    // TODO: 채팅 위젯 또는 카카오톡 상담 연결
    alert('1:1 상담 기능 준비 중입니다.\n전화: 02-1234-5678');
}

// 브로셔 다운로드
function downloadBrochure() {
    // TODO: PDF 다운로드 기능
    alert('교육 소개서 다운로드 기능 준비 중입니다.');
}