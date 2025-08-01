// 오프라인 클래스 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 지역 필터 기능
    const locationBtns = document.querySelectorAll('.location-btn');
    const scheduleCards = document.querySelectorAll('.schedule-card');
    
    locationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 활성 버튼 변경
            locationBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const location = this.getAttribute('data-location');
            
            // 일정 카드 필터링
            scheduleCards.forEach(card => {
                if (location === 'all') {
                    card.style.display = 'block';
                } else {
                    const cardLocation = card.getAttribute('data-location');
                    card.style.display = cardLocation === location ? 'block' : 'none';
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
    
    // 대기자 등록 버튼
    const waitlistBtn = document.querySelector('.btn-waitlist');
    const waitlistModal = document.getElementById('waitlistModal');
    
    if (waitlistBtn) {
        waitlistBtn.addEventListener('click', function() {
            waitlistModal.classList.add('active');
        });
    }
    
    // 모달 닫기 기능
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
    
    // 모달 외부 클릭시 닫기
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // 신청 폼 제출
    const registrationForm = document.getElementById('registrationForm');
    
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 폼 데이터 수집
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // 유효성 검사
            if (!data.name || !data.phone || !data.email) {
                alert('필수 정보를 모두 입력해주세요.');
                return;
            }
            
            if (!document.getElementById('agreeTerms').checked) {
                alert('이용약관 및 개인정보처리방침에 동의해주세요.');
                return;
            }
            
            // 실제로는 서버로 데이터 전송
            console.log('신청 데이터:', data);
            
            // 성공 메시지
            alert('신청이 완료되었습니다! 담당자가 곧 연락드리겠습니다.');
            
            // 모달 닫기
            document.getElementById('registrationModal').classList.remove('active');
            
            // 폼 초기화
            this.reset();
        });
    }
    
    // 대기자 등록 폼 제출
    const waitlistForm = document.getElementById('waitlistForm');
    
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            if (!data.name || !data.phone) {
                alert('필수 정보를 모두 입력해주세요.');
                return;
            }
            
            console.log('대기자 등록 데이터:', data);
            
            alert('대기자 등록이 완료되었습니다! 자리가 나면 즉시 연락드리겠습니다.');
            
            document.getElementById('waitlistModal').classList.remove('active');
            this.reset();
        });
    }
    
    // 카운트다운 타이머
    startCountdown();
    
    // 스크롤 애니메이션
    initScrollAnimations();
    
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
});

// 신청 모달 열기
function openRegistrationModal(date, location) {
    const modal = document.getElementById('registrationModal');
    const selectedDate = modal.querySelector('.selected-date');
    const selectedLocation = modal.querySelector('.selected-location');
    
    // 선택한 일정 정보 표시
    selectedDate.textContent = `날짜: ${date}`;
    selectedLocation.textContent = `장소: ${location}`;
    
    modal.classList.add('active');
}

// 모달 닫기
function closeModal() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
}

// 캘린더로 스크롤
function scrollToCalendar() {
    const calendarSection = document.getElementById('calendar-section');
    if (calendarSection) {
        calendarSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 카운트다운 타이머
function startCountdown() {
    const countdownElements = document.querySelectorAll('.countdown-item .number');
    if (countdownElements.length < 3) return;
    
    // 조기등록 마감일 설정 (예: 3일 후)
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    
    function updateCountdown() {
        const now = new Date();
        const diff = deadline - now;
        
        if (diff <= 0) {
            countdownElements[0].textContent = '0';
            countdownElements[1].textContent = '0';
            countdownElements[2].textContent = '0';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        countdownElements[0].textContent = days;
        countdownElements[1].textContent = hours;
        countdownElements[2].textContent = minutes;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 60000); // 1분마다 업데이트
}

// 스크롤 애니메이션 초기화
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
        '.feature-card, .schedule-card, .timeline-item, .instructor-card, .review-card'
    );
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(el);
    });
}

// 실시간 좌석 수 업데이트 (데모용)
function updateSeatsCount() {
    const seatsElements = document.querySelectorAll('.seats-left');
    
    seatsElements.forEach(el => {
        if (el.textContent !== '마감') {
            const currentSeats = parseInt(el.textContent.match(/\d+/)[0]);
            
            // 랜덤하게 좌석 감소 (데모용)
            if (Math.random() > 0.9 && currentSeats > 1) {
                el.textContent = `${currentSeats - 1}석 남음`;
                
                // 3석 이하면 스타일 변경
                if (currentSeats - 1 <= 3) {
                    el.parentElement.classList.remove('available');
                    el.parentElement.classList.add('limited');
                }
            }
        }
    });
}

// 10초마다 좌석 수 업데이트 (데모용)
setInterval(updateSeatsCount, 10000);

// 긴급 메시지 애니메이션
const urgencyText = document.querySelector('.urgency-text');
if (urgencyText) {
    setInterval(() => {
        urgencyText.style.animation = 'none';
        setTimeout(() => {
            urgencyText.style.animation = 'pulse 2s ease-in-out infinite';
        }, 10);
    }, 5000);
}