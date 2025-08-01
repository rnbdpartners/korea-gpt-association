// 보안 강화된 기업 교육 신청 시스템

// 의존성 체크
if (!window.InputValidator || !window.CSRFToken) {
    console.error('보안 설정이 로드되지 않았습니다.');
}

// 전역 변수 (immutable 패턴 적용)
const ApplicationState = {
    currentStep: 1,
    maxStep: 6,
    calendar: null,
    selectedDates: [],
    requestData: {
        manager: {},
        company: {},
        quote: {},
        dates: [],
        confirmedDate: null,
        documents: {}
    }
};

// 입력 검증 규칙
const ValidationRules = {
    manager: {
        managerName: {
            required: true,
            minLength: 2,
            maxLength: 50,
            pattern: /^[가-힣a-zA-Z\s]+$/,
            message: '이름은 2-50자의 한글 또는 영문만 입력 가능합니다.'
        },
        position: {
            required: true,
            minLength: 2,
            maxLength: 30,
            message: '직책은 2-30자로 입력해주세요.'
        },
        email: {
            required: true,
            validator: InputValidator.isValidEmail,
            message: '올바른 이메일 형식이 아닙니다.'
        },
        phone: {
            required: true,
            validator: InputValidator.isValidPhone,
            message: '올바른 전화번호 형식이 아닙니다. (예: 02-1234-5678, 010-1234-5678)'
        },
        password: {
            required: true,
            minLength: 8,
            validator: (value) => InputValidator.getPasswordStrength(value).score >= 3,
            message: '비밀번호는 8자 이상이며, 대소문자, 숫자, 특수문자를 포함해야 합니다.'
        }
    },
    company: {
        companyName: {
            required: true,
            minLength: 2,
            maxLength: 100,
            message: '기업명은 2-100자로 입력해주세요.'
        },
        businessNumber: {
            required: true,
            validator: InputValidator.isValidBusinessNumber,
            message: '올바른 사업자등록번호 형식이 아닙니다. (예: 123-45-67890)'
        }
    },
    quote: {
        participants: {
            required: true,
            type: 'number',
            min: 1,
            max: 1000,
            message: '교육 인원은 1-1000명 사이로 입력해주세요.'
        },
        educationType: {
            required: true,
            enum: ['offline', 'online', 'hybrid'],
            message: '교육 형태를 선택해주세요.'
        }
    }
};

// 보안 강화된 폼 검증 클래스
class SecureFormValidator {
    constructor(rules) {
        this.rules = rules;
        this.errors = {};
    }
    
    validate(formData) {
        this.errors = {};
        
        for (const [field, rule] of Object.entries(this.rules)) {
            const value = formData[field];
            
            // 필수 필드 체크
            if (rule.required && !value) {
                this.addError(field, '필수 입력 항목입니다.');
                continue;
            }
            
            // 값이 없으면 선택적 필드이므로 통과
            if (!value) continue;
            
            // 타입 체크
            if (rule.type === 'number' && isNaN(value)) {
                this.addError(field, '숫자만 입력 가능합니다.');
                continue;
            }
            
            // 길이 체크
            if (rule.minLength && value.length < rule.minLength) {
                this.addError(field, `최소 ${rule.minLength}자 이상 입력해주세요.`);
            }
            if (rule.maxLength && value.length > rule.maxLength) {
                this.addError(field, `최대 ${rule.maxLength}자까지 입력 가능합니다.`);
            }
            
            // 범위 체크 (숫자)
            if (rule.type === 'number') {
                const numValue = Number(value);
                if (rule.min !== undefined && numValue < rule.min) {
                    this.addError(field, `최소값은 ${rule.min}입니다.`);
                }
                if (rule.max !== undefined && numValue > rule.max) {
                    this.addError(field, `최대값은 ${rule.max}입니다.`);
                }
            }
            
            // 패턴 체크
            if (rule.pattern && !rule.pattern.test(value)) {
                this.addError(field, rule.message || '올바른 형식이 아닙니다.');
            }
            
            // 커스텀 검증
            if (rule.validator && !rule.validator(value)) {
                this.addError(field, rule.message || '유효하지 않은 값입니다.');
            }
            
            // Enum 체크
            if (rule.enum && !rule.enum.includes(value)) {
                this.addError(field, rule.message || '허용되지 않은 값입니다.');
            }
        }
        
        return Object.keys(this.errors).length === 0;
    }
    
    addError(field, message) {
        if (!this.errors[field]) {
            this.errors[field] = [];
        }
        this.errors[field].push(message);
    }
    
    getErrors() {
        return this.errors;
    }
    
    displayErrors(formElement) {
        // 기존 에러 메시지 제거
        formElement.querySelectorAll('.error-message').forEach(el => el.remove());
        formElement.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // 새 에러 메시지 표시
        for (const [field, messages] of Object.entries(this.errors)) {
            const input = formElement.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.innerHTML = messages.map(msg => 
                    `<span>${InputValidator.escapeHtml(msg)}</span>`
                ).join('<br>');
                
                input.parentNode.appendChild(errorDiv);
            }
        }
    }
}

// 안전한 데이터 저장
function saveToSecureStorage(key, data) {
    try {
        // CSRF 토큰 추가
        data._csrf = CSRFToken.generate();
        CSRFToken.store(data._csrf);
        
        // 데이터 암호화 (간단한 Base64, 실제로는 더 강력한 암호화 필요)
        const encrypted = btoa(JSON.stringify(data));
        
        // 세션 스토리지에 저장 (브라우저 종료 시 자동 삭제)
        sessionStorage.setItem(key, encrypted);
        
        return true;
    } catch (error) {
        console.error('데이터 저장 오류:', error);
        return false;
    }
}

// 안전한 데이터 불러오기
function loadFromSecureStorage(key) {
    try {
        const encrypted = sessionStorage.getItem(key);
        if (!encrypted) return null;
        
        const data = JSON.parse(atob(encrypted));
        
        // CSRF 토큰 검증
        if (!data._csrf || !CSRFToken.verify(data._csrf)) {
            console.warn('CSRF 토큰 검증 실패');
            return null;
        }
        
        delete data._csrf;
        return data;
    } catch (error) {
        console.error('데이터 불러오기 오류:', error);
        return null;
    }
}

// 보안 강화된 회원가입 처리
async function handleSecureSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // 중복 제출 방지
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    submitButton.textContent = '처리 중...';
    
    try {
        // 폼 데이터 수집 및 sanitize
        const formData = {
            managerName: InputValidator.sanitizeInput(form.managerName.value.trim()),
            position: InputValidator.sanitizeInput(form.position.value.trim()),
            email: InputValidator.sanitizeInput(form.email.value.trim()),
            phone: InputValidator.sanitizeInput(form.phone.value.trim()),
            password: form.password.value, // 비밀번호는 sanitize하지 않음
            passwordConfirm: form.passwordConfirm.value,
            companyName: InputValidator.sanitizeInput(form.companyName.value.trim()),
            businessNumber: InputValidator.sanitizeInput(form.businessNumber.value.trim()),
            industry: InputValidator.sanitizeInput(form.industry.value),
            employeeCount: InputValidator.sanitizeInput(form.employeeCount.value)
        };
        
        // 비밀번호 확인
        if (formData.password !== formData.passwordConfirm) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }
        
        // 폼 검증
        const validator = new SecureFormValidator({
            ...ValidationRules.manager,
            ...ValidationRules.company
        });
        
        if (!validator.validate(formData)) {
            validator.displayErrors(form);
            throw new Error('입력값을 확인해주세요.');
        }
        
        // 데이터 저장
        ApplicationState.requestData.manager = {
            name: formData.managerName,
            position: formData.position,
            email: formData.email,
            phone: formData.phone
        };
        
        ApplicationState.requestData.company = {
            name: formData.companyName,
            businessNumber: formData.businessNumber,
            industry: formData.industry,
            employeeCount: formData.employeeCount
        };
        
        // 세션에 저장
        saveToSecureStorage('enterpriseRequest', ApplicationState.requestData);
        
        // 성공 메시지
        showNotification('회원가입이 완료되었습니다.', 'success');
        
        // 다음 단계로 이동
        nextStep();
        
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '회원가입 및 다음 단계';
    }
}

// 보안 강화된 견적 처리
async function handleSecureQuote(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // 중복 제출 방지
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    submitButton.textContent = '처리 중...';
    
    try {
        // 폼 데이터 수집
        const formData = {
            program: InputValidator.sanitizeInput(form.program.value),
            participants: parseInt(form.participants.value),
            educationType: InputValidator.sanitizeInput(form.educationType.value),
            duration: InputValidator.sanitizeInput(form.duration.value),
            specialRequest: InputValidator.sanitizeInput(form.specialRequest.value)
        };
        
        // 폼 검증
        const validator = new SecureFormValidator(ValidationRules.quote);
        
        if (!validator.validate(formData)) {
            validator.displayErrors(form);
            throw new Error('입력값을 확인해주세요.');
        }
        
        // 프로그램 정보
        const programInfo = {
            basic: { name: 'ChatGPT 기초 과정', price: 200000 },
            intermediate: { name: '업무 자동화 과정', price: 350000 },
            advanced: { name: 'AI 전문가 과정', price: 500000 },
            custom: { name: '맞춤형 교육', price: null }
        };
        
        // 견적 계산
        const program = programInfo[formData.program];
        const totalAmount = program.price ? program.price * formData.participants : null;
        
        // 데이터 저장
        ApplicationState.requestData.quote = {
            program: formData.program,
            programName: program.name,
            participants: formData.participants,
            educationType: formData.educationType,
            duration: formData.duration,
            specialRequest: formData.specialRequest,
            estimatedAmount: totalAmount
        };
        
        // 세션에 저장
        saveToSecureStorage('enterpriseRequest', ApplicationState.requestData);
        
        // 성공 메시지
        showNotification('견적이 생성되었습니다.', 'success');
        
        // 다음 단계로 이동
        nextStep();
        
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '견적 확인 및 다음 단계';
    }
}

// 보안 강화된 파일 업로드
async function handleSecureFileUpload(file) {
    // 파일 검증
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('PDF, JPG, PNG 파일만 업로드 가능합니다.');
    }
    
    if (file.size > maxSize) {
        throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
    }
    
    // 파일명 sanitize
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // 파일 미리보기 (이미지인 경우)
    if (file.type.startsWith('image/')) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // XSS 방지를 위한 이미지 검증
                const img = new Image();
                img.onload = () => {
                    resolve({
                        name: sanitizedFileName,
                        type: file.type,
                        size: file.size,
                        dataUrl: e.target.result
                    });
                };
                img.onerror = () => reject(new Error('유효하지 않은 이미지 파일입니다.'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('파일 읽기 오류'));
            reader.readAsDataURL(file);
        });
    } else {
        // PDF 등 다른 파일
        return {
            name: sanitizedFileName,
            type: file.type,
            size: file.size,
            dataUrl: null
        };
    }
}

// 날짜 선택 보안 검증
function validateDateSelection(date) {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 과거 날짜 선택 불가
    if (selectedDate < today) {
        throw new Error('과거 날짜는 선택할 수 없습니다.');
    }
    
    // 너무 먼 미래 선택 불가 (1년 이내)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    
    if (selectedDate > maxDate) {
        throw new Error('1년 이내의 날짜만 선택 가능합니다.');
    }
    
    return true;
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${InputValidator.escapeHtml(message)}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#f44336' : '#4CAF50'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .error {
        border-color: #f44336 !important;
    }
    
    .error-message {
        color: #f44336;
        font-size: 14px;
        margin-top: 5px;
    }
    
    .notification {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);

// Export 함수들
window.handleSecureSignup = handleSecureSignup;
window.handleSecureQuote = handleSecureQuote;
window.handleSecureFileUpload = handleSecureFileUpload;
window.validateDateSelection = validateDateSelection;
window.SecureFormValidator = SecureFormValidator;