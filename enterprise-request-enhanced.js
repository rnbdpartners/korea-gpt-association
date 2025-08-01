// 보안 강화된 기업 교육 신청 시스템 - 메인 스크립트

// ErrorTypes 정의 (error-handling.js에서 정의되지 않은 경우를 위해)
const ErrorTypes = window.ErrorTypes || {
    NETWORK: 'network',
    VALIDATION: 'validation',
    PERMISSION: 'permission',
    TIMEOUT: 'timeout',
    SERVER: 'server',
    CLIENT: 'client',
    UNKNOWN: 'unknown'
};

// 전역 변수 (기존 코드와의 호환성 유지)
let currentStep = ApplicationState.currentStep;
let calendar = ApplicationState.calendar;
let selectedDates = ApplicationState.selectedDates;
let requestData = ApplicationState.requestData;

// 관리자가 설정한 가능/불가능 날짜 (예시 데이터)
const availableDates = [
    '2024-02-05', '2024-02-06', '2024-02-08', '2024-02-12', 
    '2024-02-13', '2024-02-15', '2024-02-19', '2024-02-20',
    '2024-02-22', '2024-02-26', '2024-02-27', '2024-02-29'
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 세션 체크 및 데이터 복원
    const savedData = loadFromSecureStorage('enterpriseRequest');
    if (savedData) {
        ApplicationState.requestData = savedData;
        requestData = savedData;
        
        // 현재 단계 복원
        if (savedData.currentStep) {
            currentStep = savedData.currentStep;
            ApplicationState.currentStep = savedData.currentStep;
            showStep(currentStep);
        }
    }
    
    // 보안 강화된 폼 이벤트 리스너
    const signupForm = document.getElementById('enterpriseSignupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSecureSignup);
        
        // 실시간 입력 검증
        signupForm.addEventListener('input', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                validateField(e.target);
            }
        });
        
        // 비밀번호 강도 표시
        const passwordInput = signupForm.querySelector('input[name="password"]');
        if (passwordInput) {
            passwordInput.addEventListener('input', showPasswordStrength);
        }
    }
    
    const quoteForm = document.getElementById('enterpriseQuoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleSecureQuote);
        quoteForm.addEventListener('input', updateQuoteSummary);
    }
    
    // 파일 업로드 이벤트
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('businessLicense');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleSecureDrop);
        fileInput.addEventListener('change', handleSecureFileSelect);
    }
});

// 필드별 실시간 검증
function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value;
    
    // 검증 규칙 가져오기
    let rules = {};
    if (ValidationRules.manager[fieldName]) {
        rules = ValidationRules.manager[fieldName];
    } else if (ValidationRules.company[fieldName]) {
        rules = ValidationRules.company[fieldName];
    } else if (ValidationRules.quote[fieldName]) {
        rules = ValidationRules.quote[fieldName];
    }
    
    if (!rules) return;
    
    // 기존 에러 메시지 제거
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) existingError.remove();
    field.classList.remove('error');
    
    // 검증 수행
    const validator = new SecureFormValidator({ [fieldName]: rules });
    if (!validator.validate({ [fieldName]: fieldValue })) {
        const errors = validator.getErrors();
        if (errors[fieldName]) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errors[fieldName][0];
            field.parentNode.appendChild(errorDiv);
        }
    }
}

// 비밀번호 강도 표시
function showPasswordStrength(e) {
    const password = e.target.value;
    const strength = InputValidator.getPasswordStrength(password);
    
    // 기존 강도 표시 제거
    let strengthDiv = e.target.parentNode.querySelector('.password-strength');
    if (!strengthDiv) {
        strengthDiv = document.createElement('div');
        strengthDiv.className = 'password-strength';
        e.target.parentNode.appendChild(strengthDiv);
    }
    
    const strengthLevels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    const strengthColors = ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#4caf50'];
    
    strengthDiv.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${strength.score * 20}%; background-color: ${strengthColors[strength.score - 1]}"></div>
        </div>
        <span class="strength-text">${strengthLevels[strength.score - 1]}</span>
        ${strength.feedback ? `<div class="strength-feedback">${strength.feedback}</div>` : ''}
    `;
}

// 견적 요약 업데이트 (XSS 방지 적용)
function updateQuoteSummary() {
    const form = document.getElementById('enterpriseQuoteForm');
    const formData = new FormData(form);
    
    const program = formData.get('program');
    const participants = formData.get('participants');
    const type = formData.get('educationType');
    
    // 프로그램명 표시
    const programNames = {
        basic: 'ChatGPT 기초 과정',
        intermediate: '업무 자동화 과정',
        advanced: 'AI 전문가 과정',
        custom: '맞춤형 교육'
    };
    
    // XSS 방지를 위한 안전한 텍스트 설정
    const selectedProgramEl = document.getElementById('selectedProgram');
    if (selectedProgramEl) {
        selectedProgramEl.textContent = programNames[program] || '-';
    }
    
    const selectedParticipantsEl = document.getElementById('selectedParticipants');
    if (selectedParticipantsEl) {
        selectedParticipantsEl.textContent = participants ? `${participants}명` : '-';
    }
    
    const selectedTypeEl = document.getElementById('selectedType');
    if (selectedTypeEl) {
        const typeNames = {
            offline: '오프라인',
            online: '온라인',
            hybrid: '하이브리드'
        };
        selectedTypeEl.textContent = typeNames[type] || '-';
    }
    
    // 총액 계산
    const total = calculateTotal(formData);
    const totalAmountEl = document.getElementById('totalAmount');
    if (totalAmountEl) {
        totalAmountEl.textContent = total.toLocaleString() + '원';
    }
}

// 총액 계산
function calculateTotal(formData) {
    const prices = {
        basic: 200000,
        intermediate: 350000,
        advanced: 500000,
        custom: 0
    };
    
    const program = formData.get('program');
    const participants = parseInt(formData.get('participants')) || 0;
    
    // 참가자 수 제한 검증
    if (participants > 1000) {
        showNotification('참가자 수는 1000명을 초과할 수 없습니다.', 'error');
        return 0;
    }
    
    if (program === 'custom') {
        return 0; // 별도 협의
    }
    
    return (prices[program] || 0) * participants;
}

// Step 3: 캘린더 초기화
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        height: 'auto',
        headerToolbar: {
            left: 'prev,next',
            center: 'title',
            right: 'today'
        },
        dateClick: function(info) {
            try {
                validateDateSelection(info.dateStr);
                handleDateClick(info.dateStr);
            } catch (error) {
                showNotification(error.message, 'error');
            }
        },
        datesSet: function() {
            updateCalendarDates();
        }
    });
    
    calendar.render();
    updateCalendarDates();
    
    ApplicationState.calendar = calendar;
}

// 캘린더 날짜 업데이트
function updateCalendarDates() {
    // 모든 날짜 초기화
    document.querySelectorAll('.fc-daygrid-day').forEach(day => {
        const date = day.getAttribute('data-date');
        day.classList.remove('available', 'unavailable', 'selected');
        
        if (availableDates.includes(date)) {
            day.classList.add('available');
        } else {
            day.classList.add('unavailable');
        }
        
        if (selectedDates.includes(date)) {
            day.classList.add('selected');
        }
    });
}

// 날짜 클릭 처리 (보안 강화)
function handleDateClick(dateStr) {
    if (!availableDates.includes(dateStr)) {
        showNotification('선택할 수 없는 날짜입니다.', 'error');
        return;
    }
    
    if (selectedDates.includes(dateStr)) {
        showNotification('이미 선택된 날짜입니다.', 'warning');
        return;
    }
    
    if (selectedDates.length >= 3) {
        showNotification('최대 3개까지 선택 가능합니다.', 'warning');
        return;
    }
    
    selectedDates.push(dateStr);
    ApplicationState.selectedDates = selectedDates;
    updateSelectedDates();
    updateCalendarDates();
}

// 선택된 날짜 표시 업데이트
function updateSelectedDates() {
    selectedDates.forEach((date, index) => {
        const input = document.getElementById(`date${index + 1}`);
        if (input) {
            const dateObj = new Date(date);
            const formatted = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;
            input.value = formatted;
        }
    });
    
    // 제출 버튼 활성화
    const submitBtn = document.getElementById('submitDatesBtn');
    if (submitBtn) {
        submitBtn.disabled = selectedDates.length === 0;
    }
}

// 날짜 제거
function removeDate(priority) {
    const index = priority - 1;
    if (selectedDates[index]) {
        selectedDates.splice(index, 1);
        ApplicationState.selectedDates = selectedDates;
        updateSelectedDates();
        updateCalendarDates();
        
        // 입력 필드 초기화
        for (let i = 1; i <= 3; i++) {
            const input = document.getElementById(`date${i}`);
            if (input) {
                input.value = selectedDates[i - 1] ? 
                    new Date(selectedDates[i - 1]).toLocaleDateString('ko-KR') : '';
            }
        }
    }
}

// 날짜 제출
function submitDates() {
    if (selectedDates.length === 0) {
        showNotification('최소 1개 이상의 날짜를 선택해주세요.', 'error');
        return;
    }
    
    requestData.dates = selectedDates;
    ApplicationState.requestData.dates = selectedDates;
    
    // 세션에 저장
    saveToSecureStorage('enterpriseRequest', ApplicationState.requestData);
    
    nextStep(3);
    
    // 가상의 확정 날짜 설정 (첫 번째 선택 날짜)
    setTimeout(() => {
        const confirmedDate = new Date(selectedDates[0]);
        const confirmedDateEl = document.getElementById('confirmedDate');
        if (confirmedDateEl) {
            confirmedDateEl.textContent = confirmedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        }
        requestData.confirmedDate = selectedDates[0];
        ApplicationState.requestData.confirmedDate = selectedDates[0];
    }, 500);
}

// Step 4: 일정 수락
function acceptSchedule() {
    showNotification('교육 일정이 확정되었습니다.', 'success');
    nextStep(4);
}

// 일정 변경 요청
function requestChange() {
    if (confirm('일정 변경을 요청하시겠습니까? 담당자가 연락드릴 예정입니다.')) {
        showNotification('변경 요청이 접수되었습니다.', 'info');
        // 실제로는 관리자에게 알림 전송
    }
}

// Step 5: 파일 업로드 처리 (보안 강화)
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragging');
}

async function handleSecureDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        try {
            const fileData = await handleSecureFileUpload(files[0]);
            displayFilePreview(fileData);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

async function handleSecureFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        try {
            const fileData = await handleSecureFileUpload(file);
            displayFilePreview(fileData);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }
}

// 파일 미리보기 표시
function displayFilePreview(fileData) {
    const uploadArea = document.getElementById('uploadArea');
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    const preview = uploadArea.querySelector('.upload-preview');
    
    placeholder.style.display = 'none';
    preview.style.display = 'block';
    
    const previewImage = document.getElementById('previewImage');
    const fileName = document.getElementById('fileName');
    
    if (fileData.dataUrl) {
        previewImage.src = fileData.dataUrl;
    } else {
        // PDF 아이콘 표시
        previewImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI2Y0NDMzNiIgZD0iTTQwLDE0SDI4bC02LTZIOGMtMi4yLDAtNCwxLjgtNCw0djI0YzAsMi4yLDEuOCw0LDQsNGgzMmMyLjIsMCw0LTEuOCw0LTR2LTE4QzQ0LDE1LjgsNDIuMiwxNCw0MCwxNHoiLz48L3N2Zz4=';
    }
    
    fileName.textContent = fileData.name;
    
    // 완료 버튼 활성화
    document.getElementById('completeBtn').disabled = false;
    
    // 파일 데이터 저장
    requestData.documents.businessLicense = fileData;
    ApplicationState.requestData.documents.businessLicense = fileData;
}

function removeFile() {
    const uploadArea = document.getElementById('uploadArea');
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    const preview = uploadArea.querySelector('.upload-preview');
    
    placeholder.style.display = 'block';
    preview.style.display = 'none';
    
    document.getElementById('businessLicense').value = '';
    document.getElementById('completeBtn').disabled = true;
    
    delete requestData.documents.businessLicense;
    delete ApplicationState.requestData.documents.businessLicense;
}

// Step 6: 신청 완료 (보안 강화)
function completeRequest() {
    const additionalForm = document.getElementById('additionalInfoForm');
    const formData = new FormData(additionalForm);
    
    // 이메일 검증
    const taxEmail = formData.get('taxEmail');
    if (taxEmail && !InputValidator.isValidEmail(taxEmail)) {
        showNotification('올바른 이메일 형식이 아닙니다.', 'error');
        return;
    }
    
    // 특이사항 sanitize
    const notes = InputValidator.sanitizeInput(formData.get('notes') || '');
    
    requestData.documents.taxEmail = taxEmail;
    requestData.documents.notes = notes;
    ApplicationState.requestData.documents.taxEmail = taxEmail;
    ApplicationState.requestData.documents.notes = notes;
    
    // 요약 정보 표시 (XSS 방지)
    document.getElementById('summaryCompany').textContent = requestData.company.name;
    document.getElementById('summaryProgram').textContent = getKoreanProgramName(requestData.quote.program);
    document.getElementById('summaryDate').textContent = new Date(requestData.confirmedDate).toLocaleDateString('ko-KR');
    document.getElementById('summaryManager').textContent = requestData.manager.name;
    
    // 데이터를 세션 스토리지에 저장 (보안 강화)
    const allRequests = JSON.parse(sessionStorage.getItem('enterpriseRequests') || '[]');
    const newRequest = {
        ...ApplicationState.requestData,
        requestId: `REQ-2024-${String(allRequests.length + 1).padStart(4, '0')}`,
        submittedAt: new Date().toISOString()
    };
    
    allRequests.push(newRequest);
    sessionStorage.setItem('enterpriseRequests', JSON.stringify(allRequests));
    
    // 세션 데이터 정리
    sessionStorage.removeItem('enterpriseRequest');
    
    showNotification('신청이 완료되었습니다!', 'success');
    nextStep(5);
}

// 프로그램명 한글 변환
function getKoreanProgramName(program) {
    const names = {
        basic: 'ChatGPT 기초 과정',
        intermediate: '업무 자동화 과정',
        advanced: 'AI 전문가 과정',
        custom: '맞춤형 교육'
    };
    return names[program] || program;
}

// 단계 이동 (개선)
function nextStep(currentStepNum) {
    // 현재 단계 데이터 저장
    ApplicationState.currentStep = currentStepNum + 1;
    ApplicationState.requestData.currentStep = currentStepNum + 1;
    saveToSecureStorage('enterpriseRequest', ApplicationState.requestData);
    
    showStep(currentStepNum + 1);
    hideStep(currentStepNum);
    
    // 프로세스 인디케이터 업데이트
    const currentIndicator = document.querySelector(`[data-step="${currentStepNum}"]`);
    const nextIndicator = document.querySelector(`[data-step="${currentStepNum + 1}"]`);
    
    if (currentIndicator) currentIndicator.classList.add('completed');
    if (nextIndicator) nextIndicator.classList.add('active');
    
    currentStep = currentStepNum + 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousStep(currentStepNum) {
    // 현재 단계 데이터 저장
    ApplicationState.currentStep = currentStepNum - 1;
    ApplicationState.requestData.currentStep = currentStepNum - 1;
    saveToSecureStorage('enterpriseRequest', ApplicationState.requestData);
    
    showStep(currentStepNum - 1);
    hideStep(currentStepNum);
    
    // 프로세스 인디케이터 업데이트
    const currentIndicator = document.querySelector(`[data-step="${currentStepNum}"]`);
    if (currentIndicator) currentIndicator.classList.remove('active');
    
    currentStep = currentStepNum - 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 단계 표시/숨기기 헬퍼 함수
function showStep(stepNum) {
    const stepEl = document.getElementById(`step${stepNum}`);
    if (stepEl) {
        stepEl.style.display = 'block';
        // 애니메이션 효과
        stepEl.style.opacity = '0';
        setTimeout(() => {
            stepEl.style.transition = 'opacity 0.3s ease-in';
            stepEl.style.opacity = '1';
        }, 10);
    }
}

function hideStep(stepNum) {
    const stepEl = document.getElementById(`step${stepNum}`);
    if (stepEl) {
        stepEl.style.display = 'none';
    }
}

// CSS 스타일 추가
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .password-strength {
        margin-top: 5px;
    }
    
    .strength-bar {
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 5px;
    }
    
    .strength-fill {
        height: 100%;
        transition: width 0.3s ease;
    }
    
    .strength-text {
        font-size: 12px;
        color: #666;
    }
    
    .strength-feedback {
        font-size: 12px;
        color: #666;
        margin-top: 3px;
    }
    
    input.error, select.error, textarea.error {
        border-color: #f44336 !important;
        background-color: #ffebee !important;
    }
    
    .error-message {
        color: #f44336;
        font-size: 12px;
        margin-top: 3px;
        animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .dragging {
        background-color: #e3f2fd !important;
        border-color: #2196f3 !important;
    }
`;
document.head.appendChild(additionalStyles);

// 전역 함수 export (기존 코드와의 호환성)
window.nextStep = nextStep;
window.previousStep = previousStep;
window.removeDate = removeDate;
window.submitDates = submitDates;
window.acceptSchedule = acceptSchedule;
window.requestChange = requestChange;
window.removeFile = removeFile;
window.completeRequest = completeRequest;