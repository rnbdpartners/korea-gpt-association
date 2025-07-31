// 기업 교육 신청 시스템 JavaScript

// 전역 변수
let currentStep = 1;
let calendar;
let selectedDates = [];
let requestData = {
    manager: {},
    company: {},
    quote: {},
    dates: [],
    confirmedDate: null,
    documents: {}
};

// 관리자가 설정한 가능/불가능 날짜 (예시 데이터)
const availableDates = [
    '2024-02-05', '2024-02-06', '2024-02-08', '2024-02-12', 
    '2024-02-13', '2024-02-15', '2024-02-19', '2024-02-20',
    '2024-02-22', '2024-02-26', '2024-02-27', '2024-02-29'
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 폼 이벤트 리스너
    const signupForm = document.getElementById('enterpriseSignupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    const quoteForm = document.getElementById('enterpriseQuoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuote);
        quoteForm.addEventListener('input', updateQuoteSummary);
    }
    
    // 파일 업로드 이벤트
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('businessLicense');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
    }
});

// Step 1: 회원가입 처리
function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // 비밀번호 확인
    if (formData.get('password') !== formData.get('passwordConfirm')) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 데이터 저장
    requestData.manager = {
        name: formData.get('managerName'),
        position: formData.get('position'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    requestData.company = {
        name: formData.get('companyName'),
        businessNumber: formData.get('businessNumber'),
        industry: formData.get('industry'),
        employeeCount: formData.get('employeeCount')
    };
    
    // 가상의 회원가입 처리
    localStorage.setItem('enterpriseUser', JSON.stringify({
        ...requestData.manager,
        company: requestData.company.name,
        role: 'enterprise'
    }));
    
    alert('회원가입이 완료되었습니다.');
    nextStep(1);
}

// Step 2: 견적 처리
function handleQuote(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    requestData.quote = {
        program: formData.get('program'),
        participants: formData.get('participants'),
        educationType: formData.get('educationType'),
        duration: formData.get('duration'),
        specialRequest: formData.get('specialRequest'),
        totalAmount: calculateTotal(formData)
    };
    
    nextStep(2);
    initializeCalendar();
}

// 견적 요약 업데이트
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
    
    document.getElementById('selectedProgram').textContent = programNames[program] || '-';
    document.getElementById('selectedParticipants').textContent = participants ? `${participants}명` : '-';
    document.getElementById('selectedType').textContent = type || '-';
    
    // 총액 계산
    const total = calculateTotal(formData);
    document.getElementById('totalAmount').textContent = total.toLocaleString() + '원';
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
    
    if (program === 'custom') {
        return 0; // 별도 협의
    }
    
    return prices[program] * participants;
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
            handleDateClick(info.dateStr);
        },
        datesSet: function() {
            updateCalendarDates();
        }
    });
    
    calendar.render();
    updateCalendarDates();
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

// 날짜 클릭 처리
function handleDateClick(dateStr) {
    if (!availableDates.includes(dateStr)) {
        alert('선택할 수 없는 날짜입니다.');
        return;
    }
    
    if (selectedDates.includes(dateStr)) {
        alert('이미 선택된 날짜입니다.');
        return;
    }
    
    if (selectedDates.length >= 3) {
        alert('최대 3개까지 선택 가능합니다.');
        return;
    }
    
    selectedDates.push(dateStr);
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
        alert('최소 1개 이상의 날짜를 선택해주세요.');
        return;
    }
    
    requestData.dates = selectedDates;
    nextStep(3);
    
    // 가상의 확정 날짜 설정 (첫 번째 선택 날짜)
    setTimeout(() => {
        const confirmedDate = new Date(selectedDates[0]);
        document.getElementById('confirmedDate').textContent = 
            confirmedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        requestData.confirmedDate = selectedDates[0];
    }, 500);
}

// Step 4: 일정 수락
function acceptSchedule() {
    alert('교육 일정이 확정되었습니다.');
    nextStep(4);
}

// 일정 변경 요청
function requestChange() {
    if (confirm('일정 변경을 요청하시겠습니까? 담당자가 연락드릴 예정입니다.')) {
        alert('변경 요청이 접수되었습니다.');
        // 실제로는 관리자에게 알림 전송
    }
}

// Step 5: 파일 업로드 처리
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragging');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
    }
    
    // 파일 타입 체크
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        alert('PDF, JPG, PNG 파일만 업로드 가능합니다.');
        return;
    }
    
    // 파일 미리보기
    const reader = new FileReader();
    reader.onload = function(e) {
        const uploadArea = document.getElementById('uploadArea');
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        const preview = uploadArea.querySelector('.upload-preview');
        
        placeholder.style.display = 'none';
        preview.style.display = 'block';
        
        if (file.type.startsWith('image/')) {
            document.getElementById('previewImage').src = e.target.result;
        } else {
            document.getElementById('previewImage').src = '/path/to/pdf-icon.png';
        }
        
        document.getElementById('fileName').textContent = file.name;
        
        // 완료 버튼 활성화
        document.getElementById('completeBtn').disabled = false;
    };
    
    reader.readAsDataURL(file);
    requestData.documents.businessLicense = file;
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
}

// Step 6: 신청 완료
function completeRequest() {
    const additionalForm = document.getElementById('additionalInfoForm');
    const formData = new FormData(additionalForm);
    
    requestData.documents.taxEmail = formData.get('taxEmail');
    requestData.documents.notes = formData.get('notes');
    
    // 요약 정보 표시
    document.getElementById('summaryCompany').textContent = requestData.company.name;
    document.getElementById('summaryProgram').textContent = getKoreanProgramName(requestData.quote.program);
    document.getElementById('summaryDate').textContent = new Date(requestData.confirmedDate).toLocaleDateString('ko-KR');
    document.getElementById('summaryManager').textContent = requestData.manager.name;
    
    // 데이터를 로컬 스토리지에 저장 (실제로는 서버로 전송)
    const allRequests = JSON.parse(localStorage.getItem('enterpriseRequests') || '[]');
    allRequests.push({
        ...requestData,
        requestId: `REQ-2024-${String(allRequests.length + 1).padStart(4, '0')}`,
        submittedAt: new Date().toISOString()
    });
    localStorage.setItem('enterpriseRequests', JSON.stringify(allRequests));
    
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

// 단계 이동
function nextStep(currentStepNum) {
    document.getElementById(`step${currentStepNum}`).style.display = 'none';
    document.getElementById(`step${currentStepNum + 1}`).style.display = 'block';
    
    // 프로세스 인디케이터 업데이트
    document.querySelector(`[data-step="${currentStepNum}"]`).classList.add('completed');
    document.querySelector(`[data-step="${currentStepNum + 1}"]`).classList.add('active');
    
    currentStep = currentStepNum + 1;
    window.scrollTo(0, 0);
}

function previousStep(currentStepNum) {
    document.getElementById(`step${currentStepNum}`).style.display = 'none';
    document.getElementById(`step${currentStepNum - 1}`).style.display = 'block';
    
    // 프로세스 인디케이터 업데이트
    document.querySelector(`[data-step="${currentStepNum}"]`).classList.remove('active');
    
    currentStep = currentStepNum - 1;
    window.scrollTo(0, 0);
}