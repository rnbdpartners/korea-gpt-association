// 기업 견적 시스템 JavaScript

// 견적 시스템 전역 객체
const QuoteSystem = {
    // 가격 정책
    pricing: {
        basePrice: 1200000, // 1시간 기본 가격
        hourlyRate: 300000, // 4시간 초과 시 시간당 추가 요금
        baseHours: 4, // 기본 시간
        travelFee: 150000, // 수도권 외 출장비
        vatRate: 0.1 // 부가세 10%
    },

    // 현재 견적 데이터
    currentQuote: {
        step: 1,
        data: {
            // Step 1: 기본 정보
            companyName: '',
            contactName: '',
            contactEmail: '',
            contactPhone: '',
            companySize: '',
            industry: '',
            
            // Step 2: 강의 정보
            programType: '',
            educationHours: 1,
            participantCount: '',
            educationDate: '',
            educationLocation: '',
            isOnsite: true,
            region: 'seoul',
            requirements: '',
            
            // Step 3: 견적 확인
            quoteNumber: '',
            quoteDate: '',
            subtotal: 0,
            travelFee: 0,
            vat: 0,
            total: 0
        }
    },

    // 초기화
    init() {
        this.createFloatingButton();
        this.createModal();
        this.bindEvents();
        this.loadSavedData();
    },

    // 플로팅 버튼 생성
    createFloatingButton() {
        const button = document.createElement('a');
        button.className = 'floating-quote-btn';
        button.href = '#';
        button.innerHTML = '<i class="fas fa-calculator"></i> 간편견적확인';
        button.onclick = (e) => {
            e.preventDefault();
            this.openModal();
        };
        document.body.appendChild(button);
    },

    // 모달 생성
    createModal() {
        const modalHTML = `
            <div id="quoteModal" class="quote-modal-overlay">
                <div class="quote-modal">
                    <div class="quote-modal-header">
                        <h2>기업교육 견적 요청</h2>
                        <p>3단계로 간편하게 견적을 받아보세요</p>
                        <button class="quote-modal-close" onclick="QuoteSystem.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="quote-steps-indicator">
                        <div class="step-indicator active" data-step="1">
                            <div class="step-number">1</div>
                            <div class="step-label">기본 정보</div>
                        </div>
                        <div class="step-indicator" data-step="2">
                            <div class="step-number">2</div>
                            <div class="step-label">강의 정보</div>
                        </div>
                        <div class="step-indicator" data-step="3">
                            <div class="step-number">3</div>
                            <div class="step-label">견적 확인</div>
                        </div>
                    </div>
                    
                    <div class="quote-modal-body">
                        <!-- Step 1: 기본 정보 -->
                        <div class="quote-step active" id="step1">
                            <h3>기업 정보를 입력해주세요</h3>
                            <form id="quoteForm1">
                                <div class="quote-form-group">
                                    <label class="quote-form-label">
                                        기업명 <span class="required">*</span>
                                    </label>
                                    <input type="text" class="quote-form-input" name="companyName" required>
                                </div>
                                
                                <div class="quote-form-row">
                                    <div class="quote-form-group">
                                        <label class="quote-form-label">
                                            담당자명 <span class="required">*</span>
                                        </label>
                                        <input type="text" class="quote-form-input" name="contactName" required>
                                    </div>
                                    <div class="quote-form-group">
                                        <label class="quote-form-label">
                                            연락처 <span class="required">*</span>
                                        </label>
                                        <input type="tel" class="quote-form-input" name="contactPhone" placeholder="010-0000-0000" required>
                                    </div>
                                </div>
                                
                                <div class="quote-form-group">
                                    <label class="quote-form-label">
                                        이메일 <span class="required">*</span>
                                    </label>
                                    <input type="email" class="quote-form-input" name="contactEmail" required>
                                </div>
                                
                                <div class="quote-form-row">
                                    <div class="quote-form-group">
                                        <label class="quote-form-label">기업 규모</label>
                                        <select class="quote-form-select" name="companySize">
                                            <option value="">선택하세요</option>
                                            <option value="small">50명 미만</option>
                                            <option value="medium">50-299명</option>
                                            <option value="large">300명 이상</option>
                                        </select>
                                    </div>
                                    <div class="quote-form-group">
                                        <label class="quote-form-label">업종</label>
                                        <select class="quote-form-select" name="industry">
                                            <option value="">선택하세요</option>
                                            <option value="it">IT/소프트웨어</option>
                                            <option value="manufacturing">제조업</option>
                                            <option value="finance">금융/보험</option>
                                            <option value="service">서비스업</option>
                                            <option value="public">공공기관</option>
                                            <option value="other">기타</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Step 2: 강의 정보 -->
                        <div class="quote-step" id="step2">
                            <h3>교육 프로그램을 선택해주세요</h3>
                            <div class="program-options">
                                <div class="program-option" data-program="basic">
                                    <div class="program-name">ChatGPT 기초 과정</div>
                                    <div class="program-description">ChatGPT 기본 사용법부터 프롬프트 작성까지</div>
                                </div>
                                <div class="program-option" data-program="advanced">
                                    <div class="program-name">AI 업무 활용 실무</div>
                                    <div class="program-description">업무 자동화와 생산성 향상을 위한 고급 활용법</div>
                                </div>
                                <div class="program-option" data-program="custom">
                                    <div class="program-name">맞춤형 교육</div>
                                    <div class="program-description">기업 니즈에 맞는 커스터마이징 교육</div>
                                </div>
                            </div>
                            
                            <form id="quoteForm2">
                                <div class="quote-form-row">
                                    <div class="quote-form-group">
                                        <label class="quote-form-label">
                                            교육 시간 <span class="required">*</span>
                                        </label>
                                        <select class="quote-form-select" name="educationHours" required onchange="QuoteSystem.calculatePrice()">
                                            <option value="1">1시간</option>
                                            <option value="2">2시간</option>
                                            <option value="3">3시간</option>
                                            <option value="4" selected>4시간</option>
                                            <option value="6">6시간</option>
                                            <option value="8">8시간 (1일)</option>
                                            <option value="16">16시간 (2일)</option>
                                        </select>
                                    </div>
                                    <div class="quote-form-group">
                                        <label class="quote-form-label">
                                            예상 참여 인원 <span class="required">*</span>
                                        </label>
                                        <input type="number" class="quote-form-input" name="participantCount" min="1" required>
                                    </div>
                                </div>
                                
                                <div class="quote-form-row">
                                    <div class="quote-form-group">
                                        <label class="quote-form-label">희망 교육일</label>
                                        <input type="date" class="quote-form-input" name="educationDate">
                                    </div>
                                    <div class="quote-form-group">
                                        <label class="quote-form-label">교육 방식</label>
                                        <select class="quote-form-select" name="isOnsite" onchange="QuoteSystem.toggleLocationField()">
                                            <option value="true">방문 교육</option>
                                            <option value="false">온라인 교육</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="quote-form-group" id="locationField">
                                    <label class="quote-form-label">교육 장소 (지역)</label>
                                    <select class="quote-form-select" name="region" onchange="QuoteSystem.calculatePrice()">
                                        <option value="seoul">서울/수도권</option>
                                        <option value="other">그 외 지역</option>
                                    </select>
                                </div>
                                
                                <div class="quote-form-group">
                                    <label class="quote-form-label">기타 요구사항</label>
                                    <textarea class="quote-form-textarea" name="requirements" placeholder="특별한 요구사항이 있으시면 입력해주세요"></textarea>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Step 3: 견적 확인 -->
                        <div class="quote-step" id="step3">
                            <h3>견적서 확인</h3>
                            <div class="quote-summary">
                                <h3>견적 내역</h3>
                                <div class="summary-item">
                                    <span class="summary-label">기업명</span>
                                    <span class="summary-value" id="summaryCompany">-</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">교육 프로그램</span>
                                    <span class="summary-value" id="summaryProgram">-</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">교육 시간</span>
                                    <span class="summary-value" id="summaryHours">-</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">참여 인원</span>
                                    <span class="summary-value" id="summaryParticipants">-</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">교육 방식</span>
                                    <span class="summary-value" id="summaryMethod">-</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">교육비</span>
                                    <span class="summary-value" id="summarySubtotal">-</span>
                                </div>
                                <div class="summary-item" id="travelFeeItem" style="display: none;">
                                    <span class="summary-label">출장비</span>
                                    <span class="summary-value" id="summaryTravelFee">-</span>
                                </div>
                                <div class="summary-total">
                                    <span class="label">총 견적가 (VAT 별도)</span>
                                    <span class="value" id="summaryTotal">-</span>
                                </div>
                            </div>
                            <div class="vat-notice">
                                <i class="fas fa-info-circle"></i>
                                부가세 10%는 별도로 청구됩니다.
                            </div>
                        </div>
                        
                        <!-- 성공 메시지 -->
                        <div class="quote-step" id="stepSuccess" style="display: none;">
                            <div class="quote-success">
                                <div class="success-icon">
                                    <i class="fas fa-check"></i>
                                </div>
                                <h3>견적 요청이 완료되었습니다!</h3>
                                <p>
                                    담당자가 영업일 기준 1일 이내에<br>
                                    입력하신 연락처로 상세 견적서를 발송해드립니다.
                                </p>
                                <div class="quote-number" id="finalQuoteNumber">-</div>
                                <div>
                                    <button class="quote-btn quote-btn-primary" onclick="QuoteSystem.downloadPDF()">
                                        <i class="fas fa-download"></i>
                                        견적서 다운로드
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quote-modal-footer">
                        <button class="quote-btn quote-btn-secondary" id="prevBtn" onclick="QuoteSystem.prevStep()">
                            <i class="fas fa-arrow-left"></i>
                            이전
                        </button>
                        <button class="quote-btn quote-btn-primary" id="nextBtn" onclick="QuoteSystem.nextStep()">
                            다음
                            <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 모달을 body에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // 이벤트 바인딩
    bindEvents() {
        // 프로그램 선택
        document.addEventListener('click', (e) => {
            if (e.target.closest('.program-option')) {
                document.querySelectorAll('.program-option').forEach(opt => opt.classList.remove('selected'));
                e.target.closest('.program-option').classList.add('selected');
                this.currentQuote.data.programType = e.target.closest('.program-option').dataset.program;
            }
        });

        // 모달 외부 클릭시 닫기
        document.getElementById('quoteModal').addEventListener('click', (e) => {
            if (e.target.id === 'quoteModal') {
                this.closeModal();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('quoteModal').classList.contains('show')) {
                this.closeModal();
            }
        });
    },

    // 모달 열기
    openModal() {
        document.getElementById('quoteModal').classList.add('show');
        this.resetForm();
        this.currentQuote.step = 1;
        this.updateStep();
    },

    // 모달 닫기
    closeModal() {
        document.getElementById('quoteModal').classList.remove('show');
    },

    // 다음 단계
    nextStep() {
        if (!this.validateStep()) return;
        
        this.saveStepData();
        
        if (this.currentQuote.step === 3) {
            this.submitQuote();
        } else {
            this.currentQuote.step++;
            this.updateStep();
        }
    },

    // 이전 단계
    prevStep() {
        if (this.currentQuote.step > 1) {
            this.currentQuote.step--;
            this.updateStep();
        }
    },

    // 단계 업데이트
    updateStep() {
        // 모든 스텝 숨기기
        document.querySelectorAll('.quote-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // 현재 스텝 표시
        document.getElementById(`step${this.currentQuote.step}`).classList.add('active');
        
        // 스텝 인디케이터 업데이트
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 < this.currentQuote.step) {
                indicator.classList.add('completed');
            } else if (index + 1 === this.currentQuote.step) {
                indicator.classList.add('active');
            }
        });
        
        // 버튼 업데이트
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.style.display = this.currentQuote.step === 1 ? 'none' : 'flex';
        
        if (this.currentQuote.step === 3) {
            nextBtn.innerHTML = '<i class="fas fa-check"></i> 견적 요청하기';
            this.updateSummary();
        } else {
            nextBtn.innerHTML = '다음 <i class="fas fa-arrow-right"></i>';
        }
    },

    // 단계별 유효성 검사
    validateStep() {
        const step = this.currentQuote.step;
        
        if (step === 1) {
            const form = document.getElementById('quoteForm1');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
        } else if (step === 2) {
            if (!this.currentQuote.data.programType) {
                alert('교육 프로그램을 선택해주세요.');
                return false;
            }
            const form = document.getElementById('quoteForm2');
            if (!form.checkValidity()) {
                form.reportValidity();
                return false;
            }
        }
        
        return true;
    },

    // 단계 데이터 저장
    saveStepData() {
        const step = this.currentQuote.step;
        
        if (step === 1) {
            const form = document.getElementById('quoteForm1');
            const formData = new FormData(form);
            formData.forEach((value, key) => {
                this.currentQuote.data[key] = value;
            });
        } else if (step === 2) {
            const form = document.getElementById('quoteForm2');
            const formData = new FormData(form);
            formData.forEach((value, key) => {
                if (key === 'educationHours') {
                    this.currentQuote.data[key] = parseInt(value);
                } else if (key === 'isOnsite') {
                    this.currentQuote.data[key] = value === 'true';
                } else {
                    this.currentQuote.data[key] = value;
                }
            });
            this.calculatePrice();
        }
    },

    // 가격 계산
    calculatePrice() {
        const hours = parseInt(document.querySelector('[name="educationHours"]')?.value || 1);
        const isOnsite = document.querySelector('[name="isOnsite"]')?.value === 'true';
        const region = document.querySelector('[name="region"]')?.value || 'seoul';
        
        let subtotal = 0;
        
        // 기본 시간(4시간)까지는 시간당 120만원
        if (hours <= this.pricing.baseHours) {
            subtotal = hours * this.pricing.basePrice;
        } else {
            // 4시간 초과분은 시간당 30만원
            subtotal = (this.pricing.baseHours * this.pricing.basePrice) + 
                      ((hours - this.pricing.baseHours) * this.pricing.hourlyRate);
        }
        
        // 출장비 계산
        let travelFee = 0;
        if (isOnsite && region === 'other') {
            travelFee = this.pricing.travelFee;
        }
        
        // VAT 계산
        const vat = (subtotal + travelFee) * this.pricing.vatRate;
        const total = subtotal + travelFee + vat;
        
        // 데이터 저장
        this.currentQuote.data.subtotal = subtotal;
        this.currentQuote.data.travelFee = travelFee;
        this.currentQuote.data.vat = vat;
        this.currentQuote.data.total = total;
    },

    // 요약 정보 업데이트
    updateSummary() {
        const data = this.currentQuote.data;
        
        // 프로그램명 매핑
        const programNames = {
            'basic': 'ChatGPT 기초 과정',
            'advanced': 'AI 업무 활용 실무',
            'custom': '맞춤형 교육'
        };
        
        document.getElementById('summaryCompany').textContent = data.companyName;
        document.getElementById('summaryProgram').textContent = programNames[data.programType] || '-';
        document.getElementById('summaryHours').textContent = `${data.educationHours}시간`;
        document.getElementById('summaryParticipants').textContent = `${data.participantCount}명`;
        document.getElementById('summaryMethod').textContent = data.isOnsite ? '방문 교육' : '온라인 교육';
        document.getElementById('summarySubtotal').textContent = `₩${data.subtotal.toLocaleString()}`;
        
        if (data.travelFee > 0) {
            document.getElementById('travelFeeItem').style.display = 'flex';
            document.getElementById('summaryTravelFee').textContent = `₩${data.travelFee.toLocaleString()}`;
        } else {
            document.getElementById('travelFeeItem').style.display = 'none';
        }
        
        document.getElementById('summaryTotal').textContent = `₩${(data.subtotal + data.travelFee).toLocaleString()}`;
    },

    // 지역 필드 토글
    toggleLocationField() {
        const isOnsite = document.querySelector('[name="isOnsite"]').value === 'true';
        document.getElementById('locationField').style.display = isOnsite ? 'block' : 'none';
        this.calculatePrice();
    },

    // 견적 제출
    submitQuote() {
        // 견적 번호 생성
        const date = new Date();
        const quoteNumber = `QT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        
        this.currentQuote.data.quoteNumber = quoteNumber;
        this.currentQuote.data.quoteDate = date.toISOString();
        
        // 로컬 스토리지에 저장
        this.saveQuoteToStorage();
        
        // 성공 화면 표시
        this.showSuccess(quoteNumber);
        
        // 관리자에게 알림 (실제로는 서버로 전송)
        console.log('견적 요청 데이터:', this.currentQuote.data);
    },

    // 성공 화면 표시
    showSuccess(quoteNumber) {
        document.querySelectorAll('.quote-step').forEach(step => {
            step.style.display = 'none';
        });
        
        document.getElementById('stepSuccess').style.display = 'block';
        document.getElementById('finalQuoteNumber').textContent = quoteNumber;
        
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        
        // 스텝 인디케이터 모두 완료 표시
        document.querySelectorAll('.step-indicator').forEach(indicator => {
            indicator.classList.add('completed');
        });
    },

    // PDF 다운로드
    downloadPDF() {
        const data = this.currentQuote.data;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // 한글 폰트 설정 (실제로는 한글 폰트 파일 필요)
        doc.setFont('helvetica');
        
        // 헤더
        doc.setFontSize(20);
        doc.text('견적서', 105, 30, { align: 'center' });
        
        // 견적 정보
        doc.setFontSize(10);
        doc.text(`견적번호: ${data.quoteNumber}`, 20, 50);
        doc.text(`작성일: ${new Date(data.quoteDate).toLocaleDateString('ko-KR')}`, 140, 50);
        
        // 고객 정보
        doc.setFontSize(12);
        doc.text('1. 고객 정보', 20, 70);
        doc.setFontSize(10);
        doc.text(`기업명: ${data.companyName}`, 30, 80);
        doc.text(`담당자: ${data.contactName}`, 30, 87);
        doc.text(`연락처: ${data.contactPhone}`, 30, 94);
        doc.text(`이메일: ${data.contactEmail}`, 30, 101);
        
        // 교육 정보
        doc.setFontSize(12);
        doc.text('2. 교육 정보', 20, 120);
        doc.setFontSize(10);
        const programNames = {
            'basic': 'ChatGPT 기초 과정',
            'advanced': 'AI 업무 활용 실무',
            'custom': '맞춤형 교육'
        };
        doc.text(`프로그램: ${programNames[data.programType]}`, 30, 130);
        doc.text(`교육시간: ${data.educationHours}시간`, 30, 137);
        doc.text(`참여인원: ${data.participantCount}명`, 30, 144);
        doc.text(`교육방식: ${data.isOnsite ? '방문 교육' : '온라인 교육'}`, 30, 151);
        
        // 견적 금액
        doc.setFontSize(12);
        doc.text('3. 견적 금액', 20, 170);
        doc.setFontSize(10);
        doc.text(`교육비: ${data.subtotal.toLocaleString()}원`, 30, 180);
        if (data.travelFee > 0) {
            doc.text(`출장비: ${data.travelFee.toLocaleString()}원`, 30, 187);
        }
        doc.text(`소계 (VAT 별도): ${(data.subtotal + data.travelFee).toLocaleString()}원`, 30, 194);
        doc.text(`부가세 (10%): ${data.vat.toLocaleString()}원`, 30, 201);
        doc.setFontSize(12);
        doc.text(`총 금액: ${data.total.toLocaleString()}원`, 30, 210);
        
        // 하단 정보
        doc.setFontSize(8);
        doc.text('한국GPT협회', 20, 270);
        doc.text('www.koreangpt.org', 20, 275);
        doc.text('문의: info@koreangpt.org', 20, 280);
        
        // 파일명 생성 및 다운로드
        const fileName = `한국GPT협회_견적서_${data.companyName}_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);
    },

    // 로컬 스토리지에 저장
    saveQuoteToStorage() {
        let quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
        quotes.push(this.currentQuote.data);
        localStorage.setItem('quotes', JSON.stringify(quotes));
    },

    // 저장된 데이터 불러오기
    loadSavedData() {
        // 이전에 저장된 기본 정보가 있다면 불러오기
        const savedInfo = localStorage.getItem('companyInfo');
        if (savedInfo) {
            const info = JSON.parse(savedInfo);
            // 필요시 기본 정보 자동 입력
        }
    },

    // 폼 초기화
    resetForm() {
        this.currentQuote = {
            step: 1,
            data: {
                companyName: '',
                contactName: '',
                contactEmail: '',
                contactPhone: '',
                companySize: '',
                industry: '',
                programType: '',
                educationHours: 4,
                participantCount: '',
                educationDate: '',
                educationLocation: '',
                isOnsite: true,
                region: 'seoul',
                requirements: '',
                quoteNumber: '',
                quoteDate: '',
                subtotal: 0,
                travelFee: 0,
                vat: 0,
                total: 0
            }
        };
        
        // 폼 리셋
        document.getElementById('quoteForm1').reset();
        document.getElementById('quoteForm2').reset();
        document.querySelectorAll('.program-option').forEach(opt => opt.classList.remove('selected'));
    }
};

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    QuoteSystem.init();
});

// 전역 함수로 노출 (HTML에서 직접 호출용)
window.QuoteSystem = QuoteSystem;