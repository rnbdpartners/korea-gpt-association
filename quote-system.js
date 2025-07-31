// 견적 시스템 JavaScript

// 견적 시스템 객체
const QuoteSystem = {
    // 현재 견적 데이터
    currentQuote: {
        step: 1,
        data: {}
    },
    
    // 가격 정책
    pricing: {
        basePrice: 1200000, // 1시간 기본 가격
        hourlyRate: 300000, // 4시간 초과 시 시간당 추가 요금
        baseHours: 4, // 기본 시간
        travelFee: 150000, // 수도권 외 출장비
        vatRate: 0.1 // 부가세 10%
    },
    
    // 프로그램별 시간
    programHours: {
        'basic': 8,
        'intermediate': 16,
        'advanced': 24,
        'custom': 0
    },
    
    // 초기화
    init() {
        this.setupEventListeners();
        this.loadSavedQuotes();
    },
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 플로팅 버튼 클릭
        const floatingBtn = document.querySelector('.floating-quote-btn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => this.openModal());
        }
        
        // 모달 외부 클릭
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // 폼 입력 이벤트
        const form = document.getElementById('quoteForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }
    },
    
    // 모달 열기
    openModal() {
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.classList.add('show');
            this.resetForm();
            this.showStep(1);
        }
    },
    
    // 모달 닫기
    closeModal() {
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },
    
    // 폼 초기화
    resetForm() {
        const form = document.getElementById('quoteForm');
        if (form) {
            form.reset();
        }
        this.currentQuote = {
            step: 1,
            data: {}
        };
    },
    
    // 단계 표시
    showStep(step) {
        const steps = document.querySelectorAll('.quote-step');
        steps.forEach(s => s.classList.remove('active'));
        
        const currentStep = document.querySelector(`.quote-step[data-step="${step}"]`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
        
        this.currentQuote.step = step;
    },
    
    // 다음 단계
    nextStep(currentStep) {
        if (this.validateStep(currentStep)) {
            this.saveStepData(currentStep);
            
            if (currentStep === 2) {
                this.updateQuoteSummary();
            }
            
            this.showStep(currentStep + 1);
        }
    },
    
    // 이전 단계
    prevStep(currentStep) {
        this.showStep(currentStep - 1);
    },
    
    // 단계 유효성 검사
    validateStep(step) {
        const stepElement = document.querySelector(`.quote-step[data-step="${step}"]`);
        const requiredFields = stepElement.querySelectorAll('[required]');
        
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                this.showError(`${field.previousElementSibling.textContent.replace('*', '').trim()}을(를) 입력해주세요.`);
                return false;
            }
        }
        
        // 이메일 유효성 검사
        if (step === 1) {
            const emailField = stepElement.querySelector('input[type="email"]');
            if (emailField && !this.validateEmail(emailField.value)) {
                emailField.focus();
                this.showError('올바른 이메일 주소를 입력해주세요.');
                return false;
            }
        }
        
        return true;
    },
    
    // 이메일 유효성 검사
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // 에러 표시
    showError(message) {
        // 간단한 알림으로 처리 (실제로는 더 나은 UI로 구현)
        alert(message);
    },
    
    // 단계 데이터 저장
    saveStepData(step) {
        const stepElement = document.querySelector(`.quote-step[data-step="${step}"]`);
        const inputs = stepElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                this.currentQuote.data[input.name] = input.value;
            }
        });
    },
    
    // 견적 업데이트
    updateQuote() {
        const program = document.querySelector('select[name="program"]').value;
        const participants = parseInt(document.querySelector('input[name="participants"]').value) || 0;
        const type = document.querySelector('select[name="type"]').value;
        
        if (program && participants && type) {
            const hours = this.programHours[program] || 0;
            const baseTotal = this.calculatePrice(hours, participants);
            
            // 실시간 업데이트 (필요시)
            console.log('Updated quote:', { program, participants, type, baseTotal });
        }
    },
    
    // 가격 계산
    calculatePrice(hours, participants) {
        let price = 0;
        
        if (hours <= this.pricing.baseHours) {
            price = this.pricing.basePrice;
        } else {
            price = this.pricing.basePrice + ((hours - this.pricing.baseHours) * this.pricing.hourlyRate);
        }
        
        // 참가자 수에 따른 할인 적용 가능
        // 예: 50명 이상 10% 할인 등
        
        return price;
    },
    
    // 견적 요약 업데이트
    updateQuoteSummary() {
        const data = this.currentQuote.data;
        
        // 프로그램명 표시
        const programSelect = document.querySelector('select[name="program"]');
        const programText = programSelect.options[programSelect.selectedIndex].text;
        document.getElementById('selectedProgram').textContent = programText;
        
        // 참가자 수 표시
        document.getElementById('selectedParticipants').textContent = `${data.participants}명`;
        
        // 교육 형태 표시
        const typeMap = {
            'offline': '오프라인',
            'online': '온라인',
            'hybrid': '하이브리드'
        };
        document.getElementById('selectedType').textContent = typeMap[data.type] || data.type;
        
        // 총 견적 계산
        const hours = this.programHours[data.program] || 0;
        let total = this.calculatePrice(hours, parseInt(data.participants));
        
        // 오프라인이고 수도권 외 지역인 경우 출장비 추가
        if (data.type === 'offline' && data.region === 'other') {
            total += this.pricing.travelFee;
        }
        
        // VAT 별도 표시
        document.getElementById('totalQuote').textContent = `₩${total.toLocaleString()} (VAT 별도)`;
        
        // 현재 견적 데이터에 계산 결과 저장
        this.currentQuote.data.hours = hours;
        this.currentQuote.data.subtotal = total;
        this.currentQuote.data.vat = total * this.pricing.vatRate;
        this.currentQuote.data.total = total + (total * this.pricing.vatRate);
    },
    
    // 견적서 제출
    submitQuote() {
        // 견적 데이터 완성
        const quoteData = {
            ...this.currentQuote.data,
            quoteNumber: this.generateQuoteNumber(),
            quoteDate: new Date().toISOString(),
            status: 'pending'
        };
        
        // 로컬 스토리지에 저장
        this.saveQuote(quoteData);
        
        // PDF 다운로드
        this.downloadPDF();
        
        // 감사 메시지 표시
        alert('견적서가 생성되었습니다. PDF 파일이 다운로드됩니다.');
        
        // 모달 닫기
        this.closeModal();
    },
    
    // 견적 번호 생성
    generateQuoteNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `Q${year}${month}${day}-${random}`;
    },
    
    // 견적 저장
    saveQuote(quoteData) {
        let quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        quotes.unshift(quoteData);
        
        // 최대 100개까지만 저장
        if (quotes.length > 100) {
            quotes = quotes.slice(0, 100);
        }
        
        localStorage.setItem('quotes', JSON.stringify(quotes));
    },
    
    // 저장된 견적 불러오기
    loadSavedQuotes() {
        const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        return quotes;
    },
    
    // PDF 다운로드
    downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = this.currentQuote.data;
        
        // 한글 폰트 설정 (실제로는 한글 폰트 파일을 로드해야 함)
        // doc.addFont('malgun.ttf', 'malgun', 'normal');
        // doc.setFont('malgun');
        
        // 헤더
        doc.setFontSize(20);
        doc.text('한국GPT협회 교육 견적서', 105, 30, { align: 'center' });
        
        // 견적 정보
        doc.setFontSize(12);
        doc.text(`견적번호: ${data.quoteNumber || this.generateQuoteNumber()}`, 20, 50);
        doc.text(`작성일: ${new Date().toLocaleDateString('ko-KR')}`, 20, 60);
        
        // 구분선
        doc.line(20, 65, 190, 65);
        
        // 고객 정보
        doc.setFontSize(14);
        doc.text('고객 정보', 20, 75);
        doc.setFontSize(11);
        doc.text(`회사명: ${data.company}`, 25, 85);
        doc.text(`담당자: ${data.name}`, 25, 92);
        doc.text(`연락처: ${data.phone}`, 25, 99);
        doc.text(`이메일: ${data.email}`, 25, 106);
        
        // 교육 정보
        doc.setFontSize(14);
        doc.text('교육 정보', 20, 120);
        doc.setFontSize(11);
        
        const programNames = {
            'basic': 'AI 입문 과정',
            'intermediate': 'AI 실무 활용 과정',
            'advanced': 'AI 리더십 과정',
            'custom': '맞춤형 과정'
        };
        
        doc.text(`교육 과정: ${programNames[data.program] || data.program}`, 25, 130);
        doc.text(`교육 시간: ${data.hours || 0}시간`, 25, 137);
        doc.text(`참가 인원: ${data.participants}명`, 25, 144);
        doc.text(`교육 형태: ${data.type === 'offline' ? '오프라인' : data.type === 'online' ? '온라인' : '하이브리드'}`, 25, 151);
        
        // 견적 금액
        doc.setFontSize(14);
        doc.text('견적 금액', 20, 165);
        doc.setFontSize(11);
        
        const subtotal = data.subtotal || 0;
        const vat = subtotal * 0.1;
        const total = subtotal + vat;
        
        doc.text(`교육비: ${subtotal.toLocaleString()}원`, 25, 175);
        if (data.type === 'offline' && data.region === 'other') {
            doc.text(`출장비: ${this.pricing.travelFee.toLocaleString()}원`, 25, 182);
        }
        doc.text(`부가세(10%): ${vat.toLocaleString()}원`, 25, 189);
        
        doc.setFontSize(12);
        doc.text(`총 견적금액: ${total.toLocaleString()}원`, 25, 199);
        
        // 하단 정보
        doc.setFontSize(10);
        doc.text('* 본 견적서는 발행일로부터 14일간 유효합니다.', 20, 220);
        doc.text('* 교육 일정 및 세부 내용은 협의 후 확정됩니다.', 20, 227);
        
        // 회사 정보
        doc.text('한국GPT협회 | 사업자등록번호: 123-45-67890', 105, 250, { align: 'center' });
        doc.text('서울시 강남구 테헤란로 123 | Tel: 02-1234-5678', 105, 257, { align: 'center' });
        
        // PDF 저장
        const filename = `한국GPT협회_견적서_${data.company}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '')}.pdf`;
        doc.save(filename);
    }
};

// 전역 함수로 노출 (HTML에서 직접 호출)
window.openQuoteModal = () => QuoteSystem.openModal();
window.closeQuoteModal = () => QuoteSystem.closeModal();
window.nextStep = (step) => QuoteSystem.nextStep(step);
window.prevStep = (step) => QuoteSystem.prevStep(step);
window.updateQuote = () => QuoteSystem.updateQuote();
window.submitQuote = () => QuoteSystem.submitQuote();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    QuoteSystem.init();
});

// 기업 교육 페이지 전용 함수
function downloadBrochure() {
    // 실제로는 서버에서 브로셔 PDF를 다운로드
    alert('기업교육 소개서를 다운로드합니다.');
    // window.open('/downloads/kgpt-business-brochure.pdf', '_blank');
}

// FAQ 토글
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
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
});

// 온라인/오프라인 선택에 따른 추가 필드 표시
document.addEventListener('DOMContentLoaded', function() {
    const typeSelect = document.querySelector('select[name="type"]');
    if (typeSelect) {
        typeSelect.addEventListener('change', function() {
            if (this.value === 'offline') {
                // 오프라인 선택 시 지역 선택 필드 추가
                const regionField = `
                    <div class="form-group" id="regionField">
                        <label>교육 지역 <span class="required">*</span></label>
                        <select name="region" required>
                            <option value="">선택하세요</option>
                            <option value="seoul">수도권</option>
                            <option value="other">수도권 외</option>
                        </select>
                    </div>
                `;
                
                const existingField = document.getElementById('regionField');
                if (!existingField) {
                    this.closest('.form-group').insertAdjacentHTML('afterend', regionField);
                }
            } else {
                // 온라인/하이브리드 선택 시 지역 필드 제거
                const regionField = document.getElementById('regionField');
                if (regionField) {
                    regionField.remove();
                }
            }
            
            // 견적 업데이트
            QuoteSystem.updateQuote();
        });
    }
});

// 맞춤형 과정 선택 시 추가 필드
document.addEventListener('DOMContentLoaded', function() {
    const programSelect = document.querySelector('select[name="program"]');
    if (programSelect) {
        programSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                // 맞춤형 과정 선택 시 추가 정보 필드
                const customField = `
                    <div class="form-group" id="customField">
                        <label>교육 시간 <span class="required">*</span></label>
                        <input type="number" name="customHours" min="4" placeholder="최소 4시간" required>
                    </div>
                    <div class="form-group" id="requirementsField">
                        <label>교육 요구사항</label>
                        <textarea name="requirements" rows="3" placeholder="구체적인 교육 내용이나 요구사항을 입력해주세요"></textarea>
                    </div>
                `;
                
                const existingCustom = document.getElementById('customField');
                if (!existingCustom) {
                    this.closest('.form-group').insertAdjacentHTML('afterend', customField);
                    
                    // 커스텀 시간 입력 시 견적 업데이트
                    const customHoursInput = document.querySelector('input[name="customHours"]');
                    if (customHoursInput) {
                        customHoursInput.addEventListener('input', function() {
                            QuoteSystem.currentQuote.data.customHours = parseInt(this.value) || 0;
                            QuoteSystem.updateQuote();
                        });
                    }
                }
            } else {
                // 다른 과정 선택 시 추가 필드 제거
                const customField = document.getElementById('customField');
                const requirementsField = document.getElementById('requirementsField');
                if (customField) customField.remove();
                if (requirementsField) requirementsField.remove();
            }
            
            // 견적 업데이트
            QuoteSystem.updateQuote();
        });
    }
});

// 실시간 가격 계산 업데이트 (맞춤형 과정 포함)
QuoteSystem.calculatePrice = function(hours, participants) {
    // 맞춤형 과정인 경우 customHours 사용
    if (this.currentQuote.data.program === 'custom' && this.currentQuote.data.customHours) {
        hours = parseInt(this.currentQuote.data.customHours);
    }
    
    let price = 0;
    
    if (hours <= this.pricing.baseHours) {
        price = this.pricing.basePrice;
    } else {
        price = this.pricing.basePrice + ((hours - this.pricing.baseHours) * this.pricing.hourlyRate);
    }
    
    // 참가자 수에 따른 할인
    if (participants >= 100) {
        price *= 0.85; // 100명 이상 15% 할인
    } else if (participants >= 50) {
        price *= 0.9; // 50명 이상 10% 할인
    }
    
    return Math.round(price);
};

// 견적 요약 업데이트 개선
QuoteSystem.updateQuoteSummary = function() {
    const data = this.currentQuote.data;
    
    // 프로그램명 표시
    const programSelect = document.querySelector('select[name="program"]');
    const programText = programSelect.options[programSelect.selectedIndex].text;
    document.getElementById('selectedProgram').textContent = programText;
    
    // 참가자 수 표시
    document.getElementById('selectedParticipants').textContent = `${data.participants}명`;
    
    // 교육 형태 표시
    const typeMap = {
        'offline': '오프라인',
        'online': '온라인',
        'hybrid': '하이브리드'
    };
    document.getElementById('selectedType').textContent = typeMap[data.type] || data.type;
    
    // 지역 정보 추가 (오프라인인 경우)
    if (data.type === 'offline' && data.region) {
        const regionText = data.region === 'seoul' ? ' (수도권)' : ' (수도권 외)';
        document.getElementById('selectedType').textContent += regionText;
    }
    
    // 총 견적 계산
    let hours = this.programHours[data.program] || 0;
    if (data.program === 'custom' && data.customHours) {
        hours = parseInt(data.customHours);
    }
    
    let subtotal = this.calculatePrice(hours, parseInt(data.participants));
    let travelFee = 0;
    
    // 오프라인이고 수도권 외 지역인 경우 출장비 추가
    if (data.type === 'offline' && data.region === 'other') {
        travelFee = this.pricing.travelFee;
    }
    
    const total = subtotal + travelFee;
    
    // 견적 상세 표시
    let quoteDetails = `₩${subtotal.toLocaleString()}`;
    if (travelFee > 0) {
        quoteDetails += ` + 출장비 ₩${travelFee.toLocaleString()}`;
    }
    quoteDetails += ' (VAT 별도)';
    
    document.getElementById('totalQuote').textContent = quoteDetails;
    
    // 현재 견적 데이터에 계산 결과 저장
    this.currentQuote.data.hours = hours;
    this.currentQuote.data.subtotal = subtotal;
    this.currentQuote.data.travelFee = travelFee;
    this.currentQuote.data.vat = total * this.pricing.vatRate;
    this.currentQuote.data.total = total + (total * this.pricing.vatRate);
};

// B2B 관리자 페이지 연동
window.QuoteSystem = QuoteSystem;