// 로딩 및 오류 처리가 통합된 보안 핸들러

// 보안 강화된 회원가입 처리 (로딩 상태 포함)
async function handleSecureSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // 중복 제출 방지
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    
    // 로딩 표시
    const loadingId = showLoading({
        message: '회원가입 처리 중입니다...',
        overlay: true
    });
    
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
        
        // 진행률 업데이트
        LoadingManager.updateMessage(loadingId, '데이터 저장 중...');
        
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
        showError({
            type: ErrorTypes.VALIDATION,
            message: error.message
        });
    } finally {
        hideLoading(loadingId);
        submitButton.disabled = false;
        submitButton.textContent = '회원가입 및 다음 단계';
    }
}

// 보안 강화된 견적 처리 (로딩 상태 포함)
async function handleSecureQuote(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // 중복 제출 방지
    if (submitButton.disabled) return;
    submitButton.disabled = true;
    
    // 로딩 표시
    const loadingId = showLoading({
        message: '견적을 생성하고 있습니다...',
        overlay: true
    });
    
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
        
        // 진행률 업데이트
        LoadingManager.updateMessage(loadingId, '견적 계산 중...');
        
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
        showError({
            type: ErrorTypes.VALIDATION,
            message: error.message
        });
    } finally {
        hideLoading(loadingId);
        submitButton.disabled = false;
        submitButton.textContent = '견적 확인 및 다음 단계';
    }
}

// 네트워크 오류 재시도 기능이 포함된 파일 업로드
async function handleSecureFileUploadWithRetry(file) {
    return withRetry(async () => {
        return await handleSecureFileUpload(file);
    }, {
        maxRetries: 3,
        delay: 1000,
        backoff: 2
    });
}

// 전역 함수 재정의
window.handleSecureSignup = handleSecureSignup;
window.handleSecureQuote = handleSecureQuote;
window.handleSecureFileUploadWithRetry = handleSecureFileUploadWithRetry;