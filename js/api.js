// API 설정
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : 'https://your-backend-domain.com/api';

// API 클라이언트 클래스
class APIClient {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // 토큰 설정
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // HTTP 요청 공통 메서드
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // 인증 토큰 추가
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      
      // 401 에러시 토큰 제거하고 로그인 페이지로 리다이렉트
      if (error.message.includes('Token') || error.message.includes('authorization')) {
        this.setToken(null);
        if (window.location.pathname !== '/login.html') {
          window.location.href = '/login.html';
        }
      }
      
      throw error;
    }
  }

  // GET 요청
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST 요청
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT 요청
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE 요청
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // 파일 업로드
  async uploadFile(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {}, // Content-Type을 제거하여 브라우저가 자동으로 설정하도록 함
      body: formData
    });
  }
}

// 인증 관련 API
class AuthAPI extends APIClient {
  // 회원가입
  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // 로그인
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // 관리자 로그인
  async adminLogin(email, password) {
    const response = await this.post('/auth/admin/login', { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // 로그아웃
  logout() {
    this.setToken(null);
    window.location.href = '/index.html';
  }

  // 현재 사용자 정보 확인
  getCurrentUser() {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // 로그인 상태 확인
  isLoggedIn() {
    return !!this.token && !!this.getCurrentUser();
  }

  // 관리자 권한 확인
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }
}

// 기업 관련 API
class EnterpriseAPI extends APIClient {
  // 교육 프로그램 목록 조회
  async getPrograms() {
    return this.get('/enterprise/programs');
  }

  // 교육 신청
  async submitRequest(requestData) {
    return this.post('/enterprise/request', requestData);
  }

  // 희망 날짜 제출
  async submitDates(requestId, dates) {
    return this.post(`/enterprise/request/${requestId}/dates`, { dates });
  }

  // 내 신청 목록 조회
  async getMyRequests() {
    return this.get('/enterprise/requests');
  }

  // 특정 신청 조회
  async getRequest(requestId) {
    return this.get(`/enterprise/requests/${requestId}`);
  }

  // 일정 수락
  async acceptSchedule(requestId) {
    return this.post(`/enterprise/requests/${requestId}/accept`);
  }
}

// 관리자 API
class AdminAPI extends APIClient {
  // 대시보드 데이터
  async getDashboard() {
    return this.get('/admin/dashboard');
  }

  // 교육 신청 목록 조회
  async getRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/admin/requests?${queryString}`);
  }

  // 특정 교육 신청 조회
  async getRequest(requestId) {
    return this.get(`/admin/requests/${requestId}`);
  }

  // 신청 상태 변경
  async updateRequestStatus(requestId, status) {
    return this.put(`/admin/requests/${requestId}/status`, { status });
  }

  // 일정 확정
  async confirmSchedule(requestId, scheduleData) {
    return this.post(`/admin/requests/${requestId}/confirm-schedule`, scheduleData);
  }

  // 특정 날짜 가능한 강사 조회
  async getAvailableInstructors(date) {
    return this.get(`/admin/instructors/available/${date}`);
  }

  // 기업 회원 목록 조회
  async getMembers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/admin/members?${queryString}`);
  }

  // 회원 상태 토글
  async toggleMemberStatus(memberId) {
    return this.put(`/admin/members/${memberId}/toggle-status`);
  }

  // 교육 프로그램 목록 조회
  async getPrograms() {
    return this.get('/admin/programs');
  }

  // 교육 프로그램 생성
  async createProgram(programData) {
    return this.post('/admin/programs', programData);
  }
}

// 강사 관련 API
class InstructorAPI extends APIClient {
  // 강사 목록 조회
  async getInstructors() {
    return this.get('/instructors');
  }

  // 강사 생성
  async createInstructor(instructorData) {
    return this.post('/instructors', instructorData);
  }

  // 강사 정보 수정
  async updateInstructor(instructorId, instructorData) {
    return this.put(`/instructors/${instructorId}`, instructorData);
  }

  // 강사 가용성 조회
  async getAvailability(year, month) {
    return this.get(`/instructors/availability/${year}/${month}`);
  }

  // 강사 가용성 설정
  async setAvailability(instructorId, availabilityData) {
    return this.post(`/instructors/${instructorId}/availability`, availabilityData);
  }

  // 블랙아웃 날짜 설정
  async setBlackoutDate(instructorId, blackoutData) {
    return this.post(`/instructors/${instructorId}/blackout`, blackoutData);
  }

  // 강사 배정
  async assignInstructor(assignmentData) {
    return this.post('/instructors/assign', assignmentData);
  }

  // 강사 강의 이력 조회
  async getHistory(instructorId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/instructors/${instructorId}/history?${queryString}`);
  }

  // 강사 월간 통계 조회
  async getMonthlyStats(instructorId, year, month) {
    return this.get(`/instructors/${instructorId}/stats/${year}/${month}`);
  }
}

// 파일 업로드 API
class UploadAPI extends APIClient {
  // 사업자등록증 업로드
  async uploadBusinessLicense(requestId, formData) {
    return this.uploadFile(`/upload/business-license/${requestId}`, formData);
  }

  // 강사 서명 업로드
  async uploadInstructorSignature(instructorId, formData) {
    return this.uploadFile(`/upload/instructor-signature/${instructorId}`, formData);
  }

  // 강사 프로필 이미지 업로드
  async uploadInstructorProfile(instructorId, formData) {
    return this.uploadFile(`/upload/instructor-profile/${instructorId}`, formData);
  }
}

// API 인스턴스 생성
const authAPI = new AuthAPI();
const enterpriseAPI = new EnterpriseAPI();
const adminAPI = new AdminAPI();
const instructorAPI = new InstructorAPI();
const uploadAPI = new UploadAPI();

// 전역으로 export
window.authAPI = authAPI;
window.enterpriseAPI = enterpriseAPI;
window.adminAPI = adminAPI;
window.instructorAPI = instructorAPI;
window.uploadAPI = uploadAPI;