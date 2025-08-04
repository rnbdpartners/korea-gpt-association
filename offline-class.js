// 오프라인 클래스 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 일정 데이터 로드
    loadSchedules();
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
    
    // 신청하기 버튼 클릭
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-apply') && !e.target.disabled) {
            const scheduleCard = e.target.closest('.schedule-card');
            const scheduleId = scheduleCard.getAttribute('data-schedule-id');
            showApplicationForm(scheduleId);
        }
    });
    
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

// 일정 데이터 로드
async function loadSchedules() {
    try {
        const result = await offlineClassAPI.getSchedules({ status: 'open' });
        if (result.success) {
            updateScheduleCards(result.data);
        }
    } catch (error) {
        console.error('일정 로드 오류:', error);
    }
}

// 일정 카드 업데이트
function updateScheduleCards(schedules) {
    const container = document.querySelector('.schedule-grid');
    if (!container) return;
    
    container.innerHTML = schedules.map(schedule => `
        <div class="schedule-card" data-schedule-id="${schedule.id}" data-location="${schedule.location}">
            <div class="schedule-header">
                <div class="location-badge">${schedule.location}</div>
                ${schedule.availableSeats < 10 ? '<div class="limited-badge">마감임박</div>' : ''}
            </div>
            
            <div class="schedule-body">
                <h3>${new Date(schedule.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} (${new Date(schedule.date).toLocaleDateString('ko-KR', { weekday: 'long' })})</h3>
                <p class="schedule-time"><i class="fas fa-clock"></i> 10:00 - 18:00 (점심시간 1시간)</p>
                <p class="schedule-venue"><i class="fas fa-map-marker-alt"></i> ${schedule.venue}</p>
                
                <div class="seats-info ${schedule.availableSeats === 0 ? 'full' : schedule.availableSeats < 10 ? 'limited' : 'available'}">
                    <div class="seats-bar">
                        <div class="seats-filled" style="width: ${((schedule.totalSeats - schedule.availableSeats) / schedule.totalSeats * 100)}%"></div>
                    </div>
                    <p class="seats-left">${schedule.availableSeats === 0 ? '마감' : schedule.availableSeats + '석 남음'}</p>
                </div>
                
                <div class="price-info">
                    ${new Date() < new Date(schedule.earlyBirdDeadline) ? 
                        `<p class="early-bird">조기등록가 <span>${schedule.earlyBirdPrice.toLocaleString()}원</span></p>
                         <p class="original-price">정가 ${schedule.price.toLocaleString()}원</p>` :
                        `<p class="current-price">${schedule.price.toLocaleString()}원</p>`
                    }
                </div>
                
                <button class="btn-apply" ${schedule.availableSeats === 0 ? 'disabled' : ''}>
                    ${schedule.availableSeats === 0 ? '마감' : '신청하기'}
                </button>
            </div>
        </div>
    `).join('');
    
    // 지역 필터 기능 재설정
    setupLocationFilter();
}

// 지역 필터 기능 설정
function setupLocationFilter() {
    const locationBtns = document.querySelectorAll('.location-btn');
    const scheduleCards = document.querySelectorAll('.schedule-card');
    
    locationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            locationBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const location = this.getAttribute('data-location');
            
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
}

// 신청 폼 표시
function showApplicationForm(scheduleId) {
    // 모달 스타일 추가
    if (!document.getElementById('application-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'application-modal-styles';
        style.textContent = `
            .application-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            }
            
            .application-modal .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .application-modal .modal-header {
                padding: 30px 30px 20px;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .application-modal .modal-header h2 {
                margin: 0;
                font-size: 24px;
                color: #2d3e50;
            }
            
            .application-modal .modal-close {
                background: none;
                border: none;
                font-size: 28px;
                color: #6c757d;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .application-modal .modal-close:hover {
                background: #f8f9fa;
                color: #2d3e50;
            }
            
            .application-form {
                padding: 30px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #2d3e50;
            }
            
            .form-group .required {
                color: #dc3545;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                font-size: 16px;
                transition: all 0.3s ease;
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #31E0AA;
                box-shadow: 0 0 0 3px rgba(49, 224, 170, 0.1);
            }
            
            .form-actions {
                display: flex;
                gap: 12px;
                margin-top: 30px;
            }
            
            .form-actions button {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-cancel {
                background: #e9ecef;
                color: #495057;
            }
            
            .btn-cancel:hover {
                background: #dee2e6;
            }
            
            .btn-submit {
                background: #31E0AA;
                color: #1a1a1a;
                flex: 1;
            }
            
            .btn-submit:hover {
                background: #28c997;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(49, 224, 170, 0.3);
            }
            
            .btn-submit:disabled {
                background: #6c757d;
                transform: none;
                box-shadow: none;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 모달 HTML 생성
    const modal = document.createElement('div');
    modal.className = 'application-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>오프라인 클래스 신청</h2>
                <button class="modal-close" onclick="closeApplicationForm()">&times;</button>
            </div>
            
            <form id="applicationForm" class="application-form">
                <input type="hidden" name="scheduleId" value="${scheduleId}">
                
                <div class="form-group">
                    <label for="name">이름 <span class="required">*</span></label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">이메일 <span class="required">*</span></label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="phone">전화번호 <span class="required">*</span></label>
                    <input type="tel" id="phone" name="phone" placeholder="010-1234-5678" required>
                </div>
                
                <div class="form-group">
                    <label for="company">회사명 <span class="required">*</span></label>
                    <input type="text" id="company" name="company" required>
                </div>
                
                <div class="form-group">
                    <label for="position">직책 <span class="required">*</span></label>
                    <input type="text" id="position" name="position" required>
                </div>
                
                <div class="form-group">
                    <label for="purpose">수강 목적</label>
                    <textarea id="purpose" name="purpose" rows="3" placeholder="어떤 목적으로 수강하시나요? (선택사항)"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="questions">사전 질문</label>
                    <textarea id="questions" name="questions" rows="3" placeholder="강사님께 미리 질문하고 싶은 내용이 있으신가요? (선택사항)"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="closeApplicationForm()">취소</button>
                    <button type="submit" class="btn-submit">신청하기</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 폼 제출 이벤트
    document.getElementById('applicationForm').addEventListener('submit', handleApplicationSubmit);
}

// 신청 폼 닫기
window.closeApplicationForm = function() {
    const modal = document.querySelector('.application-modal');
    if (modal) {
        modal.remove();
    }
}

// 신청서 제출 처리
async function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const applicationData = {};
    formData.forEach((value, key) => {
        applicationData[key] = value;
    });
    
    // 로딩 표시
    const submitBtn = e.target.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '처리중...';
    submitBtn.disabled = true;
    
    try {
        const result = await offlineClassAPI.submitApplication(applicationData);
        
        if (result.success) {
            // 성공 메시지 표시
            alert(`신청이 완료되었습니다!\n신청번호: ${result.data.applicationId}\n\n확인 이메일을 발송했습니다.`);
            closeApplicationForm();
            
            // 일정 데이터 새로고침
            loadSchedules();
        } else {
            alert('신청 중 오류가 발생했습니다: ' + result.error);
        }
    } catch (error) {
        console.error('신청 처리 오류:', error);
        alert('신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}