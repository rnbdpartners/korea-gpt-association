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
    documents: {},
    requestId: null
};

// 교육 프로그램 정보
let educationPrograms = [];

// 관리자가 설정한 가능/불가능 날짜 (예시 데이터)
const availableDates = [
    '2024-02-05', '2024-02-06', '2024-02-08', '2024-02-12', 
    '2024-02-13', '2024-02-15', '2024-02-19', '2024-02-20',
    '2024-02-22', '2024-02-26', '2024-02-27', '2024-02-29'
];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
    // API 스크립트 로드 확인
    const script = document.createElement('script');
    script.src = '/js/api-config.js';
    document.head.appendChild(script);
    
    script.onload = async () => {
        // 교육 프로그램 로드
        try {
            const programs = await API.getPrograms();
            educationPrograms = programs;
            loadProgramOptions();
        } catch (error) {
            console.error('Failed to load programs:', error);
        }
    };
    
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
async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // 비밀번호 확인
    if (formData.get('password') !== formData.get('passwordConfirm')) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    // 데이터 준비
    const signupData = {
        email: formData.get('email'),
        password: formData.get('password'),
        managerName: formData.get('managerName'),
        position: formData.get('position'),
        phone: formData.get('phone'),
        companyName: formData.get('companyName'),
        businessNumber: formData.get('businessNumber'),
        industry: formData.get('industry'),
        employeeCount: formData.get('employeeCount')
    };
    
    try {
        // API 호출
        const response = await API.register(signupData);
        
        // 토큰 저장
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('enterpriseUser', JSON.stringify(response.user));
        
        // 데이터 저장
        requestData.manager = {
            name: signupData.managerName,
            position: signupData.position,
            email: signupData.email,
            phone: signupData.phone
        };
        
        requestData.company = {
            name: signupData.companyName,
            businessNumber: signupData.businessNumber,
            industry: signupData.industry,
            employeeCount: signupData.employeeCount
        };
        
        alert('회원가입이 완료되었습니다.');
        nextStep(1);
    } catch (error) {
        alert(error.message || '회원가입 중 오류가 발생했습니다.');
    }
}

// Step 2: 견적 처리
async function handleQuote(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const programId = formData.get('program');
    const program = educationPrograms.find(p => p.id == programId);
    
    requestData.quote = {
        programId: parseInt(programId),
        program: program?.programName,
        participants: parseInt(formData.get('participants')),
        educationType: formData.get('educationType'),
        duration: formData.get('duration'),
        specialRequest: formData.get('specialRequest'),
        totalAmount: calculateTotal(formData)
    };
    
    try {
        // 교육 신청 API 호출
        const response = await API.submitRequest({
            programId: requestData.quote.programId,
            participantsCount: requestData.quote.participants,
            educationType: requestData.quote.educationType,
            duration: requestData.quote.duration,
            specialRequest: requestData.quote.specialRequest
        });
        
        requestData.requestId = response.request.id;
        requestData.requestNumber = response.request.requestNumber;
        
        nextStep(2);
    } catch (error) {
        alert(error.message || '견적 요청 중 오류가 발생했습니다.');
    }
    initializeCalendar();
}

// 견적 요약 업데이트
function updateQuoteSummary() {
    const form = document.getElementById('enterpriseQuoteForm');
    const formData = new FormData(form);
    
    const programId = formData.get('program');
    const participants = formData.get('participants');
    const type = formData.get('educationType');
    
    // 프로그램명 표시
    const program = educationPrograms.find(p => p.id == programId);
    
    document.getElementById('selectedProgram').textContent = program ? program.programName : '-';
    document.getElementById('selectedParticipants').textContent = participants ? `${participants}명` : '-';
    document.getElementById('selectedType').textContent = type || '-';
    
    // 총액 계산
    const total = calculateTotal(formData);
    document.getElementById('totalAmount').textContent = total.toLocaleString() + '원';
}

// 총액 계산
function calculateTotal(formData) {
    const programId = formData.get('program');
    const participants = parseInt(formData.get('participants')) || 0;
    
    const program = educationPrograms.find(p => p.id == programId);
    if (!program || !program.pricePerPerson) {
        return 0; // 별도 협의
    }
    
    return program.pricePerPerson * participants;
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
        // 선택 취소
        const index = selectedDates.indexOf(dateStr);
        selectedDates.splice(index, 1);
        updateSelectedDatesDisplay();
        updateCalendarDates();
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
function updateSelectedDatesDisplay() {
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

// 확정 상태 확인
async function checkConfirmationStatus() {
    try {
        const request = await API.getRequest(requestData.requestId);
        
        if (request.status === 'confirmed' && request.confirmedSchedule) {
            const confirmedDate = new Date(request.confirmedSchedule.confirmedDate);
            document.getElementById('confirmedDate').textContent = 
                confirmedDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                });
            requestData.confirmedDate = request.confirmedSchedule.confirmedDate;
            
            // 확정 버튼 표시
            document.getElementById('acceptBtn').style.display = 'inline-block';
        } else {
            // 5초 후 다시 확인
            setTimeout(checkConfirmationStatus, 5000);
        }
    } catch (error) {
        console.error('Status check error:', error);
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
async function submitDates() {
    if (selectedDates.length === 0) {
        alert('최소 1개 이상의 날짜를 선택해주세요.');
        return;
    }
    
    requestData.dates = selectedDates;
    
    try {
        // 선호 날짜 제출
        const datesData = selectedDates.map((date, index) => ({
            date: date,
            priority: index + 1
        }));
        
        await API.submitDates(requestData.requestId, datesData);
        
        nextStep(3);
        
        // 관리자가 확정할 때까지 대기
        document.getElementById('confirmedDate').textContent = '관리자 확정 대기 중...';
        
        // 주기적으로 확정 상태 확인
        checkConfirmationStatus();
    } catch (error) {
        alert(error.message || '날짜 제출 중 오류가 발생했습니다.');
    }
}

// Step 4: 일정 수락
async function acceptSchedule() {
    try {
        await API.acceptSchedule(requestData.requestId);
        alert('교육 일정이 확정되었습니다.');
        nextStep(4);
    } catch (error) {
        alert(error.message || '일정 확정 중 오류가 발생했습니다.');
    }
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

async function handleFile(file) {
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
    
    // 파일 즉시 업로드
    try {
        const taxEmail = document.getElementById('taxEmail')?.value || '';
        const notes = document.getElementById('notes')?.value || '';
        
        const response = await API.uploadFile(
            `/upload/business-license/${requestData.requestId}`,
            file,
            { taxEmail, notes }
        );
        
        requestData.documents.uploadedId = response.document.id;
    } catch (error) {
        console.error('File upload error:', error);
        alert('파일 업로드 중 오류가 발생했습니다.');
    }
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
async function completeRequest() {
    const additionalForm = document.getElementById('additionalInfoForm');
    const formData = new FormData(additionalForm);
    
    requestData.documents.taxEmail = formData.get('taxEmail');
    requestData.documents.notes = formData.get('notes');
    
    // 요약 정보 표시
    document.getElementById('summaryCompany').textContent = requestData.company.name;
    document.getElementById('summaryProgram').textContent = requestData.quote.program || getKoreanProgramName(requestData.quote.programId);
    document.getElementById('summaryDate').textContent = requestData.confirmedDate ? 
        new Date(requestData.confirmedDate).toLocaleDateString('ko-KR') : '확정 대기';
    document.getElementById('summaryManager').textContent = requestData.manager.name;
    document.getElementById('summaryRequestNumber').textContent = requestData.requestNumber || '-';
    
    try {
        // 상태를 '문서 제출 완료'로 업데이트
        if (requestData.requestId) {
            await API.updateRequestStatus(requestData.requestId, 'completed');
        }
        
        nextStep(5);
    } catch (error) {
        console.error('Complete request error:', error);
        alert('신청 완료 처리 중 오류가 발생했습니다.');
    }
}

// 프로그램명 한글 변환
function getKoreanProgramName(programId) {
    const program = educationPrograms.find(p => p.id == programId);
    return program ? program.programName : '-';
}

// 프로그램 옵션 로드
function loadProgramOptions() {
    const programSelect = document.getElementById('program');
    if (!programSelect) return;
    
    programSelect.innerHTML = '<option value="">프로그램을 선택하세요</option>';
    
    educationPrograms.forEach(program => {
        const option = document.createElement('option');
        option.value = program.id;
        option.textContent = program.programName;
        option.dataset.price = program.pricePerPerson || 0;
        programSelect.appendChild(option);
    });
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