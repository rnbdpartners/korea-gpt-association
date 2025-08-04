// 오프라인 클래스 신청 API 처리 시스템

class OfflineClassAPI {
    constructor() {
        // API 엔드포인트 설정 (실제 배포시 변경 필요)
        this.baseURL = 'https://api.koreangpt.org'; // 예시 URL
        this.mockMode = true; // 개발 모드에서는 목업 데이터 사용
        
        // 로컬 스토리지 키
        this.storageKeys = {
            applications: 'offlineClassApplications',
            schedules: 'offlineClassSchedules'
        };
        
        this.initializeMockData();
    }

    // 목업 데이터 초기화
    initializeMockData() {
        if (this.mockMode && !localStorage.getItem(this.storageKeys.schedules)) {
            const mockSchedules = [
                {
                    id: 'SCH001',
                    date: '2024-12-14',
                    location: '서울',
                    venue: '강남 교육센터',
                    address: '서울특별시 강남구 테헤란로 123',
                    totalSeats: 30,
                    availableSeats: 8,
                    price: 199000,
                    earlyBirdPrice: 149000,
                    earlyBirdDeadline: '2024-12-07',
                    status: 'open'
                },
                {
                    id: 'SCH002',
                    date: '2024-12-21',
                    location: '부산',
                    venue: '부산 IT교육원',
                    address: '부산광역시 해운대구 센텀로 456',
                    totalSeats: 25,
                    availableSeats: 15,
                    price: 199000,
                    earlyBirdPrice: 149000,
                    earlyBirdDeadline: '2024-12-14',
                    status: 'open'
                },
                {
                    id: 'SCH003',
                    date: '2025-01-11',
                    location: '대구',
                    venue: '대구 혁신센터',
                    address: '대구광역시 중구 혁신로 789',
                    totalSeats: 20,
                    availableSeats: 20,
                    price: 199000,
                    earlyBirdPrice: 149000,
                    earlyBirdDeadline: '2025-01-04',
                    status: 'open'
                }
            ];
            
            localStorage.setItem(this.storageKeys.schedules, JSON.stringify(mockSchedules));
        }
    }

    // 일정 목록 조회
    async getSchedules(filters = {}) {
        if (this.mockMode) {
            // 로컬 스토리지에서 데이터 조회
            const schedules = JSON.parse(localStorage.getItem(this.storageKeys.schedules) || '[]');
            
            // 필터 적용
            let filtered = schedules;
            if (filters.location) {
                filtered = filtered.filter(s => s.location === filters.location);
            }
            if (filters.status) {
                filtered = filtered.filter(s => s.status === filters.status);
            }
            
            return {
                success: true,
                data: filtered
            };
        }
        
        // 실제 API 호출
        try {
            const response = await fetch(`${this.baseURL}/offline-classes/schedules`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('일정 조회 오류:', error);
            return { success: false, error: error.message };
        }
    }

    // 신청서 제출
    async submitApplication(applicationData) {
        // 데이터 유효성 검사
        const validation = this.validateApplication(applicationData);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }

        if (this.mockMode) {
            // 로컬 스토리지에 저장
            const applications = JSON.parse(localStorage.getItem(this.storageKeys.applications) || '[]');
            const newApplication = {
                id: 'APP' + Date.now(),
                ...applicationData,
                submittedAt: new Date().toISOString(),
                status: 'pending',
                paymentStatus: 'waiting'
            };
            
            applications.push(newApplication);
            localStorage.setItem(this.storageKeys.applications, JSON.stringify(applications));
            
            // 좌석 수 감소
            this.updateAvailableSeats(applicationData.scheduleId, -1);
            
            // 이메일 발송 시뮬레이션
            this.sendConfirmationEmail(newApplication);
            
            return {
                success: true,
                data: {
                    applicationId: newApplication.id,
                    message: '신청이 완료되었습니다. 확인 이메일을 발송했습니다.'
                }
            };
        }
        
        // 실제 API 호출
        try {
            const response = await fetch(`${this.baseURL}/offline-classes/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(applicationData)
            });
            return await response.json();
        } catch (error) {
            console.error('신청서 제출 오류:', error);
            return { success: false, error: error.message };
        }
    }

    // 신청 상태 조회
    async getApplicationStatus(applicationId) {
        if (this.mockMode) {
            const applications = JSON.parse(localStorage.getItem(this.storageKeys.applications) || '[]');
            const application = applications.find(a => a.id === applicationId);
            
            if (application) {
                return {
                    success: true,
                    data: application
                };
            }
            
            return {
                success: false,
                error: '신청 정보를 찾을 수 없습니다.'
            };
        }
        
        // 실제 API 호출
        try {
            const response = await fetch(`${this.baseURL}/offline-classes/applications/${applicationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('신청 상태 조회 오류:', error);
            return { success: false, error: error.message };
        }
    }

    // 신청 취소
    async cancelApplication(applicationId, reason) {
        if (this.mockMode) {
            const applications = JSON.parse(localStorage.getItem(this.storageKeys.applications) || '[]');
            const index = applications.findIndex(a => a.id === applicationId);
            
            if (index !== -1) {
                applications[index].status = 'cancelled';
                applications[index].cancelReason = reason;
                applications[index].cancelledAt = new Date().toISOString();
                
                localStorage.setItem(this.storageKeys.applications, JSON.stringify(applications));
                
                // 좌석 수 복구
                this.updateAvailableSeats(applications[index].scheduleId, 1);
                
                return {
                    success: true,
                    message: '신청이 취소되었습니다.'
                };
            }
            
            return {
                success: false,
                error: '신청 정보를 찾을 수 없습니다.'
            };
        }
        
        // 실제 API 호출
        try {
            const response = await fetch(`${this.baseURL}/offline-classes/applications/${applicationId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({ reason })
            });
            return await response.json();
        } catch (error) {
            console.error('신청 취소 오류:', error);
            return { success: false, error: error.message };
        }
    }

    // 결제 정보 업데이트
    async updatePaymentStatus(applicationId, paymentData) {
        if (this.mockMode) {
            const applications = JSON.parse(localStorage.getItem(this.storageKeys.applications) || '[]');
            const index = applications.findIndex(a => a.id === applicationId);
            
            if (index !== -1) {
                applications[index].paymentStatus = paymentData.status;
                applications[index].paymentMethod = paymentData.method;
                applications[index].paymentCompletedAt = new Date().toISOString();
                
                if (paymentData.status === 'completed') {
                    applications[index].status = 'confirmed';
                }
                
                localStorage.setItem(this.storageKeys.applications, JSON.stringify(applications));
                
                return {
                    success: true,
                    message: '결제 정보가 업데이트되었습니다.'
                };
            }
            
            return {
                success: false,
                error: '신청 정보를 찾을 수 없습니다.'
            };
        }
        
        // 실제 API 호출
        try {
            const response = await fetch(`${this.baseURL}/offline-classes/applications/${applicationId}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(paymentData)
            });
            return await response.json();
        } catch (error) {
            console.error('결제 정보 업데이트 오류:', error);
            return { success: false, error: error.message };
        }
    }

    // 유효성 검사
    validateApplication(data) {
        // 필수 필드 검사
        const requiredFields = ['name', 'email', 'phone', 'company', 'position', 'scheduleId'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return {
                    valid: false,
                    error: `${field} 필드는 필수입니다.`
                };
            }
        }
        
        // 이메일 형식 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                valid: false,
                error: '올바른 이메일 형식이 아닙니다.'
            };
        }
        
        // 전화번호 형식 검사
        const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
        if (!phoneRegex.test(data.phone)) {
            return {
                valid: false,
                error: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'
            };
        }
        
        return { valid: true };
    }

    // 좌석 수 업데이트 (목업 모드)
    updateAvailableSeats(scheduleId, change) {
        const schedules = JSON.parse(localStorage.getItem(this.storageKeys.schedules) || '[]');
        const index = schedules.findIndex(s => s.id === scheduleId);
        
        if (index !== -1) {
            schedules[index].availableSeats += change;
            if (schedules[index].availableSeats <= 0) {
                schedules[index].status = 'full';
            }
            localStorage.setItem(this.storageKeys.schedules, JSON.stringify(schedules));
        }
    }

    // 확인 이메일 발송 (시뮬레이션)
    sendConfirmationEmail(application) {
        console.log('확인 이메일 발송:', {
            to: application.email,
            subject: '한국GPT협회 오프라인 교육 신청 확인',
            applicationId: application.id
        });
        
        // 실제로는 이메일 서비스 API 호출
        if (!this.mockMode) {
            fetch(`${this.baseURL}/email/send-confirmation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: application.email,
                    applicationData: application
                })
            });
        }
    }

    // 인증 토큰 가져오기
    getAuthToken() {
        // 실제로는 로그인 시 받은 토큰 사용
        return localStorage.getItem('authToken') || '';
    }

    // 통계 데이터 조회
    async getStatistics() {
        if (this.mockMode) {
            const applications = JSON.parse(localStorage.getItem(this.storageKeys.applications) || '[]');
            const schedules = JSON.parse(localStorage.getItem(this.storageKeys.schedules) || '[]');
            
            return {
                success: true,
                data: {
                    totalApplications: applications.length,
                    confirmedApplications: applications.filter(a => a.status === 'confirmed').length,
                    totalRevenue: applications
                        .filter(a => a.paymentStatus === 'completed')
                        .reduce((sum, a) => sum + (a.price || 0), 0),
                    upcomingClasses: schedules.filter(s => new Date(s.date) > new Date()).length,
                    totalSeatsAvailable: schedules.reduce((sum, s) => sum + s.availableSeats, 0)
                }
            };
        }
        
        // 실제 API 호출
        try {
            const response = await fetch(`${this.baseURL}/offline-classes/statistics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('통계 조회 오류:', error);
            return { success: false, error: error.message };
        }
    }
}

// API 인스턴스 생성 및 전역 변수로 등록
window.offlineClassAPI = new OfflineClassAPI();

console.log('오프라인 클래스 API 시스템 로드 완료');