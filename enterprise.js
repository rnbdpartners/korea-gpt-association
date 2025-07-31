// 기업교육 페이지 JavaScript

// 관리자 모드 체크 및 초기화
document.addEventListener('DOMContentLoaded', function() {
    checkAdminMode();
    initializeAdminFeatures();
});

// 관리자 모드 확인
function checkAdminMode() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn && currentUser.role === 'admin') {
        // 관리자인 경우 admin-enterprise.html로 리다이렉트
        if (!window.location.pathname.includes('admin-enterprise.html')) {
            window.location.href = 'admin-enterprise.html';
        }
    }
}

// 관리자 기능 초기화
function initializeAdminFeatures() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role === 'admin' && window.location.pathname.includes('admin-enterprise.html')) {
        enableAdminMode();
    }
}

// 견적 데이터 저장
let quoteData = {
    company: '',
    name: '',
    phone: '',
    email: '',
    program: '',
    participants: 0,
    type: '',
    schedule: '',
    totalPrice: 0,
    timestamp: new Date().toISOString()
};

// 가격 정보 (1인당 가격)
const pricing = {
    basic: { offline: 200000, online: 150000, hybrid: 180000 },
    intermediate: { offline: 350000, online: 280000, hybrid: 320000 },
    advanced: { offline: 500000, online: 400000, hybrid: 450000 },
    custom: { offline: 0, online: 0, hybrid: 0 } // 별도 상담
};

// 견적 모달 열기
function openQuoteModal() {
    const currentUser = window.userManager?.getCurrentUser();
    
    if (!currentUser) {
        alert('견적 확인은 회원만 가능합니다. 로그인해주세요.');
        window.location.href = 'login.html?redirect=enterprise.html';
        return;
    }
    
    document.getElementById('quoteModal').style.display = 'block';
    resetQuoteForm();
}

// 견적 모달 닫기
function closeQuoteModal() {
    document.getElementById('quoteModal').style.display = 'none';
}

// 폼 초기화
function resetQuoteForm() {
    document.getElementById('quoteForm').reset();
    document.querySelectorAll('.quote-step').forEach((step, index) => {
        step.classList.toggle('active', index === 0);
    });
    quoteData = {
        company: '',
        name: '',
        phone: '',
        email: '',
        program: '',
        participants: 0,
        type: '',
        schedule: '',
        totalPrice: 0,
        timestamp: new Date().toISOString()
    };
}

// 다음 단계
function nextStep(currentStep) {
    const form = document.getElementById('quoteForm');
    const currentStepEl = document.querySelector(`.quote-step[data-step="${currentStep}"]`);
    const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
    
    // 유효성 검사
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value) {
            input.style.borderColor = '#e53e3e';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 데이터 저장
    if (currentStep === 1) {
        quoteData.company = form.company.value;
        quoteData.name = form.name.value;
        quoteData.phone = form.phone.value;
        quoteData.email = form.email.value;
    } else if (currentStep === 2) {
        quoteData.program = form.program.value;
        quoteData.participants = parseInt(form.participants.value);
        quoteData.type = form.type.value;
        quoteData.schedule = form.schedule.value;
        
        // 견적 요약 업데이트
        updateQuoteSummary();
    }
    
    // 다음 단계로 이동
    document.querySelectorAll('.quote-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`.quote-step[data-step="${currentStep + 1}"]`).classList.add('active');
}

// 이전 단계
function prevStep(currentStep) {
    document.querySelectorAll('.quote-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`.quote-step[data-step="${currentStep - 1}"]`).classList.add('active');
}

// 견적 업데이트
function updateQuote() {
    const form = document.getElementById('quoteForm');
    const program = form.program.value;
    const participants = parseInt(form.participants.value) || 0;
    const type = form.type.value;
    
    if (program && participants && type && pricing[program]) {
        const pricePerPerson = pricing[program][type];
        quoteData.totalPrice = pricePerPerson * participants;
    }
}

// 견적 요약 업데이트
function updateQuoteSummary() {
    const programText = {
        basic: 'AI 입문 과정 (8시간)',
        intermediate: 'AI 실무 활용 과정 (16시간)',
        advanced: 'AI 리더십 과정 (24시간)',
        custom: '맞춤형 과정'
    };
    
    const typeText = {
        offline: '오프라인',
        online: '온라인',
        hybrid: '하이브리드'
    };
    
    document.getElementById('selectedProgram').textContent = programText[quoteData.program] || '-';
    document.getElementById('selectedParticipants').textContent = quoteData.participants + '명';
    document.getElementById('selectedType').textContent = typeText[quoteData.type] || '-';
    
    if (quoteData.program === 'custom') {
        document.getElementById('totalQuote').textContent = '별도 상담';
    } else {
        document.getElementById('totalQuote').textContent = '₩' + quoteData.totalPrice.toLocaleString();
    }
}

// 견적서 제출 및 PDF 생성
function submitQuote() {
    // 견적 데이터 저장 (로컬 스토리지)
    saveQuoteToHistory();
    
    // PDF 생성
    generateQuotePDF();
    
    // 관리자에게 알림 (실제로는 서버로 전송)
    console.log('견적 요청:', quoteData);
    
    alert('견적서가 생성되었습니다. PDF 다운로드가 시작됩니다.');
    closeQuoteModal();
}

// 견적 이력 저장
function saveQuoteToHistory() {
    const currentUser = window.userManager?.getCurrentUser();
    if (!currentUser) return;
    
    const quoteHistory = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
    const newQuote = {
        ...quoteData,
        userId: currentUser.id,
        userName: currentUser.name,
        id: Date.now().toString()
    };
    
    quoteHistory.push(newQuote);
    localStorage.setItem('quoteHistory', JSON.stringify(quoteHistory));
}

// PDF 생성
function generateQuotePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // 폰트 설정
    doc.setFont('helvetica', 'normal');
    
    // 헤더
    doc.setFontSize(24);
    doc.text('한국GPT협회 Business', 20, 30);
    
    doc.setFontSize(18);
    doc.text('교육 견적서', 20, 45);
    
    // 구분선
    doc.line(20, 50, 190, 50);
    
    // 견적 정보
    doc.setFontSize(12);
    let yPos = 65;
    
    doc.text('견적일자: ' + new Date().toLocaleDateString('ko-KR'), 20, yPos);
    yPos += 10;
    
    doc.text('회사명: ' + quoteData.company, 20, yPos);
    yPos += 10;
    
    doc.text('담당자: ' + quoteData.name, 20, yPos);
    yPos += 10;
    
    doc.text('연락처: ' + quoteData.phone, 20, yPos);
    yPos += 10;
    
    doc.text('이메일: ' + quoteData.email, 20, yPos);
    yPos += 20;
    
    // 교육 정보
    doc.setFontSize(14);
    doc.text('교육 정보', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    const programText = {
        basic: 'AI 입문 과정 (8시간)',
        intermediate: 'AI 실무 활용 과정 (16시간)',
        advanced: 'AI 리더십 과정 (24시간)',
        custom: '맞춤형 과정'
    };
    
    const typeText = {
        offline: '오프라인',
        online: '온라인',
        hybrid: '하이브리드'
    };
    
    doc.text('선택 과정: ' + programText[quoteData.program], 20, yPos);
    yPos += 10;
    
    doc.text('교육 인원: ' + quoteData.participants + '명', 20, yPos);
    yPos += 10;
    
    doc.text('교육 형태: ' + typeText[quoteData.type], 20, yPos);
    yPos += 10;
    
    if (quoteData.schedule) {
        doc.text('희망 시기: ' + quoteData.schedule, 20, yPos);
        yPos += 10;
    }
    
    yPos += 10;
    
    // 견적 금액
    doc.setFontSize(16);
    if (quoteData.program === 'custom') {
        doc.text('예상 견적: 별도 상담', 20, yPos);
    } else {
        doc.text('예상 견적: ' + quoteData.totalPrice.toLocaleString() + '원', 20, yPos);
    }
    
    // 안내 문구
    yPos += 20;
    doc.setFontSize(10);
    doc.text('* 상기 금액은 예상 견적이며, 정확한 금액은 상담 후 확정됩니다.', 20, yPos);
    yPos += 5;
    doc.text('* VAT 별도', 20, yPos);
    
    // 문의처
    yPos += 15;
    doc.text('문의: 02-1234-5678 / business@koreangpt.org', 20, yPos);
    
    // PDF 저장
    doc.save(`한국GPT협회_견적서_${quoteData.company}_${new Date().toISOString().slice(0,10)}.pdf`);
}

// 소개서 다운로드
function downloadBrochure() {
    // 실제로는 서버에서 파일을 다운로드
    alert('교육 소개서 다운로드를 준비중입니다.');
}

// FAQ 토글
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-question');
    
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.classList.toggle('active');
            
            // 다른 FAQ 닫기
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== parent) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('quoteModal');
        if (event.target === modal) {
            closeQuoteModal();
        }
    });
    
    // 스크롤 시 플로팅 버튼 애니메이션
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        const floatingBtn = document.querySelector('.floating-quote-btn');
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            floatingBtn.style.transform = 'translateX(100px)';
        } else {
            floatingBtn.style.transform = 'translateX(0)';
        }
        
        lastScroll = currentScroll;
    });
});