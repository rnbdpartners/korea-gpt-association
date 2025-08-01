// B2B 기업용 관리자 페이지 JavaScript

// 편집 모드 상태
let isEditMode = false;
let currentEditingElement = null;

// 데이터 저장소
let dashboardData = {};
let requestsData = [];
let membersData = [];
let instructorsData = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    loadDashboardData();
    initializeEditMode();
    makeElementsEditable();
    setupTabNavigation();
});

// 관리자 접근 권한 확인
function checkAdminAccess() {
    // GitHub Pages에서는 로컬 스토리지 기반 인증 사용
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }
    
    if (currentUser.role !== 'admin') {
        alert('관리자 권한이 필요합니다.');
        window.location.href = 'index.html';
        return;
    }
}

// 대시보드 데이터 로드
async function loadDashboardData() {
    // GitHub Pages에서는 정적 데이터 사용
    dashboardData = {
        totalRequests: 156,
        pendingRequests: 23,
        completedRequests: 98,
        totalMembers: 42,
        totalInstructors: 8
    };
    updateDashboardStats();
    loadRequestsData();
    loadMembersData();
    loadInstructorsData();
}

// 대시보드 통계 업데이트
function updateDashboardStats() {
    const stats = [
        { id: 'total-requests', value: dashboardData.totalRequests || 0 },
        { id: 'pending-requests', value: dashboardData.pendingRequests || 0 },
        { id: 'completed-requests', value: dashboardData.completedRequests || 0 },
        { id: 'total-members', value: dashboardData.totalMembers || 0 },
        { id: 'total-instructors', value: dashboardData.totalInstructors || 0 }
    ];

    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            element.textContent = stat.value;
        }
    });
}

// 교육 신청 데이터 로드
function loadRequestsData() {
    // GitHub Pages에서는 정적 데이터 사용
    requestsData = [
        {
            id: 1,
            requestNumber: 'REQ-2024-0001',
            enterpriseMember: { companyName: '삼성전자', managerName: '이매니저' },
            program: { programName: 'ChatGPT 기초 과정' },
            participantsCount: 30,
            status: 'pending',
            createdAt: new Date('2024-01-15')
        },
        {
            id: 2,
            requestNumber: 'REQ-2024-0002',
            enterpriseMember: { companyName: 'LG전자', managerName: '김담당' },
            program: { programName: '업무 자동화 과정' },
            participantsCount: 25,
            status: 'confirmed',
            createdAt: new Date('2024-01-18')
        },
        {
            id: 3,
            requestNumber: 'REQ-2024-0003',
            enterpriseMember: { companyName: '현대자동차', managerName: '박매니저' },
            program: { programName: 'AI 전문가 과정' },
            participantsCount: 20,
            status: 'completed',
            createdAt: new Date('2024-01-20')
        }
    ];
    updateRequestsTable();
}

// 회원 데이터 로드
function loadMembersData() {
    // GitHub Pages에서는 정적 데이터 사용
    membersData = [
        {
            id: 1,
            companyName: '삼성전자',
            managerName: '이매니저',
            email: 'manager@samsung.com',
            phone: '02-1234-5678',
            isActive: true,
            createdAt: new Date('2024-01-10')
        },
        {
            id: 2,
            companyName: 'LG전자',
            managerName: '김담당',
            email: 'kim@lg.com',
            phone: '02-2345-6789',
            isActive: true,
            createdAt: new Date('2024-01-12')
        },
        {
            id: 3,
            companyName: '현대자동차',
            managerName: '박매니저',
            email: 'park@hyundai.com',
            phone: '02-3456-7890',
            isActive: false,
            createdAt: new Date('2024-01-15')
        }
    ];
    updateMembersTable();
}

// 강사 데이터 로드
function loadInstructorsData() {
    // GitHub Pages에서는 정적 데이터 사용
    instructorsData = [
        {
            id: 1,
            name: '김철수',
            email: 'kimcs@example.com',
            phone: '010-1234-5678',
            carModel: 'SM5',
            carNumber: '12가3456',
            specialty: 'ChatGPT 기초 및 중급',
            isActive: true
        },
        {
            id: 2,
            name: '이영희',
            email: 'leeyh@example.com',
            phone: '010-2345-6789',
            carModel: 'K5',
            carNumber: '34나5678',
            specialty: '업무 자동화 전문',
            isActive: true
        },
        {
            id: 3,
            name: '박민수',
            email: 'parkms@example.com',
            phone: '010-3456-7890',
            carModel: '소나타',
            carNumber: '56다7890',
            specialty: 'AI 전략 및 고급 과정',
            isActive: true
        }
    ];
    updateInstructorsTable();
}

// 교육 신청 테이블 업데이트
function updateRequestsTable() {
    const tableBody = document.querySelector('#requests-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    requestsData.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.requestNumber}</td>
            <td>${request.enterpriseMember?.companyName || '-'}</td>
            <td>${request.program?.programName || '-'}</td>
            <td>${request.participantsCount}명</td>
            <td><span class="status-badge status-${request.status}">${getStatusText(request.status)}</span></td>
            <td>${formatDate(request.createdAt)}</td>
            <td>
                <button class="btn-sm btn-primary" onclick="viewRequest(${request.id})">상세보기</button>
                <button class="btn-sm btn-secondary" onclick="updateRequestStatus(${request.id})">상태변경</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 회원 테이블 업데이트
function updateMembersTable() {
    const tableBody = document.querySelector('#members-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    membersData.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.companyName}</td>
            <td>${member.managerName}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td><span class="status-badge ${member.isActive ? 'status-active' : 'status-inactive'}">${member.isActive ? '활성' : '비활성'}</span></td>
            <td>${formatDate(member.createdAt)}</td>
            <td>
                <button class="btn-sm btn-secondary" onclick="toggleMemberStatus(${member.id})">${member.isActive ? '비활성화' : '활성화'}</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 강사 테이블 업데이트
function updateInstructorsTable() {
    const tableBody = document.querySelector('#instructors-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    instructorsData.forEach(instructor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${instructor.name}</td>
            <td>${instructor.email}</td>
            <td>${instructor.phone}</td>
            <td>${instructor.carModel || '-'} (${instructor.carNumber || '-'})</td>
            <td>${instructor.specialty || '-'}</td>
            <td><span class="status-badge ${instructor.isActive ? 'status-active' : 'status-inactive'}">${instructor.isActive ? '활성' : '비활성'}</span></td>
            <td>
                <button class="btn-sm btn-primary" onclick="viewInstructorProfile(${instructor.id})">프로필</button>
                <button class="btn-sm btn-secondary" onclick="manageInstructorSchedule(${instructor.id})">일정관리</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 탭 네비게이션 설정
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // 모든 탭 버튼과 컨텐츠 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 선택된 탭 활성화
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// 유틸리티 함수들
function getStatusText(status) {
    const statusMap = {
        'pending': '대기중',
        'quote_sent': '견적발송',
        'date_selecting': '날짜선택중',
        'confirmed': '확정',
        'document_pending': '서류대기',
        'completed': '완료',
        'cancelled': '취소'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

function showNotification(message, type = 'info') {
    // 간단한 알림 표시
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f44336' : '#4CAF50'};
        color: white;
        border-radius: 4px;
        z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 신청 상세보기
function viewRequest(requestId) {
    const request = requestsData.find(r => r.id === requestId);
    if (request) {
        // 더미 상세 데이터 추가
        request.preferredDates = [
            { priority: 1, preferredDate: new Date('2024-02-15') },
            { priority: 2, preferredDate: new Date('2024-02-20') },
            { priority: 3, preferredDate: new Date('2024-02-25') }
        ];
        showRequestModal(request);
    } else {
        showNotification('신청 정보를 찾을 수 없습니다.', 'error');
    }
}

// 신청 상태 변경
function updateRequestStatus(requestId) {
    const newStatus = prompt('새로운 상태를 입력하세요:\npending, quote_sent, date_selecting, confirmed, document_pending, completed, cancelled');
    
    if (!newStatus) return;
    
    const request = requestsData.find(r => r.id === requestId);
    if (request) {
        request.status = newStatus;
        showNotification('상태가 변경되었습니다.');
        updateRequestsTable();
    } else {
        showNotification('상태 변경에 실패했습니다.', 'error');
    }
}

// 회원 상태 토글
function toggleMemberStatus(memberId) {
    const member = membersData.find(m => m.id === memberId);
    if (member) {
        member.isActive = !member.isActive;
        showNotification('회원 상태가 변경되었습니다.');
        updateMembersTable();
    } else {
        showNotification('회원 상태 변경에 실패했습니다.', 'error');
    }
}

// 강사 프로필 보기
function viewInstructorProfile(instructorId) {
    const instructor = instructorsData.find(i => i.id === instructorId);
    if (instructor) {
        showInstructorModal(instructor);
    }
}

// 강사 일정 관리
function manageInstructorSchedule(instructorId) {
    // 강사 일정 관리 모달이나 페이지 열기
    window.open(`instructor-schedule.html?id=${instructorId}`, '_blank');
}

// 신청 상세 모달 표시
function showRequestModal(request) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>교육 신청 상세정보</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="request-details">
                    <p><strong>신청번호:</strong> ${request.requestNumber}</p>
                    <p><strong>기업명:</strong> ${request.enterpriseMember?.companyName}</p>
                    <p><strong>담당자:</strong> ${request.enterpriseMember?.managerName}</p>
                    <p><strong>프로그램:</strong> ${request.program?.programName}</p>
                    <p><strong>참가인원:</strong> ${request.participantsCount}명</p>
                    <p><strong>교육형태:</strong> ${request.educationType}</p>
                    <p><strong>상태:</strong> ${getStatusText(request.status)}</p>
                    <p><strong>신청일:</strong> ${formatDate(request.createdAt)}</p>
                </div>
                ${request.preferredDates && request.preferredDates.length > 0 ? `
                    <div class="preferred-dates">
                        <h4>희망 날짜</h4>
                        ${request.preferredDates.map(date => 
                            `<p>${date.priority}순위: ${formatDate(date.preferredDate)}</p>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">닫기</button>
                <button class="btn btn-primary" onclick="confirmScheduleModal(${request.id})">일정 확정</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 강사 상세 모달 표시
function showInstructorModal(instructor) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>강사 정보</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="instructor-details">
                    <p><strong>이름:</strong> ${instructor.name}</p>
                    <p><strong>이메일:</strong> ${instructor.email}</p>
                    <p><strong>연락처:</strong> ${instructor.phone}</p>
                    <p><strong>생년월일:</strong> ${formatDate(instructor.birthDate)}</p>
                    <p><strong>차량:</strong> ${instructor.carModel || '-'} (${instructor.carNumber || '-'})</p>
                    <p><strong>전문분야:</strong> ${instructor.specialty || '-'}</p>
                    <p><strong>시급:</strong> ${instructor.hourlyRate ? instructor.hourlyRate + '원' : '-'}</p>
                    ${instructor.bio ? `<p><strong>소개:</strong> ${instructor.bio}</p>` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">닫기</button>
                <button class="btn btn-primary" onclick="editInstructor(${instructor.id})">수정</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 일정 확정 모달
function confirmScheduleModal(requestId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>교육 일정 확정</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="confirm-schedule-form">
                    <div class="form-group">
                        <label>확정 날짜</label>
                        <input type="date" name="confirmedDate" required>
                    </div>
                    <div class="form-group">
                        <label>시작 시간</label>
                        <input type="time" name="startTime" required>
                    </div>
                    <div class="form-group">
                        <label>종료 시간</label>
                        <input type="time" name="endTime" required>
                    </div>
                    <div class="form-group">
                        <label>장소</label>
                        <input type="text" name="location" placeholder="오프라인 교육 장소">
                    </div>
                    <div class="form-group">
                        <label>온라인 링크</label>
                        <input type="url" name="onlineLink" placeholder="온라인 교육 링크">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">취소</button>
                <button class="btn btn-primary" onclick="submitScheduleConfirmation(${requestId})">확정</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 일정 확정 제출
function submitScheduleConfirmation(requestId) {
    const form = document.getElementById('confirm-schedule-form');
    const formData = new FormData(form);
    
    const scheduleData = {
        confirmedDate: formData.get('confirmedDate'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        location: formData.get('location'),
        onlineLink: formData.get('onlineLink')
    };
    
    const request = requestsData.find(r => r.id === requestId);
    if (request) {
        request.status = 'confirmed';
        request.confirmedSchedule = scheduleData;
        showNotification('일정이 확정되었습니다.');
        document.querySelector('.modal-overlay').remove();
        updateRequestsTable();
    } else {
        showNotification('일정 확정에 실패했습니다.', 'error');
    }
}

// 편집 모드 초기화
function initializeEditMode() {
    // 편집 모드 토글 버튼 추가
    const headerContent = document.querySelector('.b2b-admin-header-content');
    if (headerContent) {
        const editToggleBtn = document.createElement('button');
        editToggleBtn.className = 'edit-mode-toggle';
        editToggleBtn.innerHTML = '<i class="fas fa-edit"></i> 편집 모드';
        editToggleBtn.onclick = toggleEditMode;
        headerContent.appendChild(editToggleBtn);
    }

    // 편집 툴바 생성
    createEditToolbar();
}

// 편집 모드 토글
function toggleEditMode() {
    isEditMode = !isEditMode;
    document.body.classList.toggle('editor-mode', isEditMode);
    
    const toggleBtn = document.querySelector('.edit-mode-toggle');
    toggleBtn.classList.toggle('active', isEditMode);
    toggleBtn.innerHTML = isEditMode ? 
        '<i class="fas fa-save"></i> 편집 완료' : 
        '<i class="fas fa-edit"></i> 편집 모드';
    
    if (!isEditMode) {
        saveAllChanges();
    }
}

// 편집 툴바 생성
function createEditToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';
    toolbar.innerHTML = `
        <h3>편집 도구</h3>
        <div class="editor-tools">
            <button class="editor-tool-btn" onclick="editText()">
                <i class="fas fa-font"></i> 텍스트 편집
            </button>
            <button class="editor-tool-btn" onclick="editStyle()">
                <i class="fas fa-palette"></i> 스타일 변경
            </button>
            <button class="editor-tool-btn" onclick="addSection()">
                <i class="fas fa-plus-square"></i> 섹션 추가
            </button>
            <button class="editor-tool-btn" onclick="deleteElement()">
                <i class="fas fa-trash"></i> 요소 삭제
            </button>
            <button class="editor-tool-btn" onclick="duplicateElement()">
                <i class="fas fa-copy"></i> 복사
            </button>
            <button class="editor-tool-btn" onclick="moveElement()">
                <i class="fas fa-arrows-alt"></i> 이동
            </button>
        </div>
    `;
    document.body.appendChild(toolbar);
}

// 편집 가능한 요소로 만들기
function makeElementsEditable() {
    const editableSelectors = [
        '.b2b-section-header h2',
        '.b2b-section-header p',
        '.b2b-card-title',
        '.b2b-stat-value',
        '.b2b-stat-label',
        '.b2b-btn',
        'td',
        'p'
    ];
    
    editableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.classList.add('editable-element');
            element.addEventListener('click', handleElementClick);
            element.addEventListener('mouseover', handleElementHover);
            element.addEventListener('mouseout', handleElementOut);
        });
    });
}

// 요소 클릭 처리
function handleElementClick(e) {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // 이전 선택 해제
    document.querySelectorAll('.editing').forEach(el => el.classList.remove('editing'));
    
    // 현재 요소 선택
    currentEditingElement = e.target;
    currentEditingElement.classList.add('editing');
    
    // 인라인 편집 툴팁 표시
    showEditTooltip(e.target);
}

// 요소 호버 처리
function handleElementHover(e) {
    if (!isEditMode) return;
    e.target.style.cursor = 'pointer';
}

// 요소 호버 아웃 처리
function handleElementOut(e) {
    if (!isEditMode) return;
}

// 편집 툴팁 표시
function showEditTooltip(element) {
    // 기존 툴팁 제거
    const existingTooltip = document.querySelector('.edit-tooltip');
    if (existingTooltip) existingTooltip.remove();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'edit-tooltip show';
    tooltip.innerHTML = `
        <button class="edit-tooltip-btn" onclick="quickEdit()">
            <i class="fas fa-edit"></i>
        </button>
        <button class="edit-tooltip-btn" onclick="changeColor()">
            <i class="fas fa-paint-brush"></i>
        </button>
        <button class="edit-tooltip-btn" onclick="changeFontSize()">
            <i class="fas fa-text-height"></i>
        </button>
        <button class="edit-tooltip-btn" onclick="deleteCurrentElement()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // 툴팁 위치 설정
    const rect = element.getBoundingClientRect();
    tooltip.style.top = `${rect.top - 50}px`;
    tooltip.style.left = `${rect.left}px`;
    
    document.body.appendChild(tooltip);
}

// 빠른 편집
function quickEdit() {
    if (!currentEditingElement) return;
    
    const currentText = currentEditingElement.innerText;
    const newText = prompt('텍스트를 수정하세요:', currentText);
    
    if (newText !== null && newText !== currentText) {
        currentEditingElement.innerText = newText;
        saveChange(currentEditingElement, 'text', newText);
    }
}

// 색상 변경
function changeColor() {
    if (!currentEditingElement) return;
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const currentColor = window.getComputedStyle(currentEditingElement).color;
    
    const colorPicker = document.createElement('div');
    colorPicker.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #000;
        padding: 20px;
        border-radius: 8px;
        display: flex;
        gap: 10px;
        z-index: 10001;
    `;
    
    colors.forEach(color => {
        const colorBtn = document.createElement('button');
        colorBtn.style.cssText = `
            width: 40px;
            height: 40px;
            background: ${color};
            border: none;
            border-radius: 4px;
            cursor: pointer;
        `;
        colorBtn.onclick = () => {
            currentEditingElement.style.color = color;
            saveChange(currentEditingElement, 'color', color);
            colorPicker.remove();
        };
        colorPicker.appendChild(colorBtn);
    });
    
    document.body.appendChild(colorPicker);
    
    // 클릭 외부 시 닫기
    setTimeout(() => {
        document.addEventListener('click', function closeColorPicker(e) {
            if (!colorPicker.contains(e.target)) {
                colorPicker.remove();
                document.removeEventListener('click', closeColorPicker);
            }
        });
    }, 100);
}

// 변경사항 저장
function saveChange(element, type, value) {
    const changes = JSON.parse(localStorage.getItem('pageChanges') || '{}');
    const elementId = element.id || `element-${Date.now()}`;
    
    if (!element.id) element.id = elementId;
    
    if (!changes[elementId]) changes[elementId] = {};
    changes[elementId][type] = value;
    
    localStorage.setItem('pageChanges', JSON.stringify(changes));
}

// 모든 변경사항 저장
function saveAllChanges() {
    const changes = JSON.parse(localStorage.getItem('pageChanges') || '{}');
    console.log('저장된 변경사항:', changes);
    alert('모든 변경사항이 저장되었습니다.');
}

// B2B 견적 데이터 가져오기
function getQuotesFromStorage() {
    return JSON.parse(localStorage.getItem('quotes') || '[]');
}

// B2B 샘플 데이터
const b2bData = {
    companies: [
        {
            id: 1,
            name: '삼성전자',
            industry: 'IT/소프트웨어',
            contact: '김담당',
            phone: '02-1234-5678',
            email: 'kim@samsung.com',
            size: '대기업',
            status: 'active',
            joinDate: '2023-03-15',
            contractValue: 50000000
        },
        {
            id: 2,
            name: 'LG전자',
            industry: '제조업',
            contact: '이매니저',
            phone: '02-8765-4321',
            email: 'lee@lg.com',
            size: '대기업',
            status: 'active',
            joinDate: '2023-06-20',
            contractValue: 35000000
        },
        {
            id: 3,
            name: '현대자동차',
            industry: '제조업',
            contact: '박팀장',
            phone: '02-5555-1234',
            email: 'park@hyundai.com',
            size: '대기업',
            status: 'pending',
            joinDate: '2023-12-01',
            contractValue: 28000000
        },
        {
            id: 4,
            name: '카카오',
            industry: 'IT/소프트웨어',
            contact: '최개발',
            phone: '02-9999-8888',
            email: 'choi@kakao.com',
            size: '대기업',
            status: 'active',
            joinDate: '2023-08-10',
            contractValue: 42000000
        },
        {
            id: 5,
            name: '스타트업코리아',
            industry: 'IT/소프트웨어',
            contact: '신대표',
            phone: '02-1111-2222',
            email: 'shin@startup.co.kr',
            size: '중소기업',
            status: 'active',
            joinDate: '2024-01-15',
            contractValue: 8000000
        }
    ],
    programs: [
        {
            id: 1,
            name: 'AI 프롬프트 마스터',
            type: '기초',
            duration: '8시간',
            participants: 156,
            satisfaction: 4.8,
            status: 'active'
        },
        {
            id: 2,
            name: '기업 맞춤 ChatGPT',
            type: '중급',
            duration: '16시간',
            participants: 89,
            satisfaction: 4.9,
            status: 'active'
        },
        {
            id: 3,
            name: 'AI 업무 자동화',
            type: '고급',
            duration: '24시간',
            participants: 45,
            satisfaction: 4.7,
            status: 'active'
        }
    ],
    projects: [
        {
            id: 1,
            name: '삼성전자 AI 교육 프로젝트',
            company: '삼성전자',
            progress: 85,
            startDate: '2024-01-01',
            endDate: '2024-03-31',
            status: 'active'
        },
        {
            id: 2,
            name: 'LG전자 프롬프트 교육',
            company: 'LG전자',
            progress: 100,
            startDate: '2023-12-01',
            endDate: '2024-01-15',
            status: 'completed'
        },
        {
            id: 3,
            name: '현대자동차 AI 도입 컨설팅',
            company: '현대자동차',
            progress: 25,
            startDate: '2024-01-15',
            endDate: '2024-06-30',
            status: 'planning'
        }
    ],
    contracts: [
        {
            id: 'CT-2024-001',
            company: '삼성전자',
            amount: 50000000,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'active',
            renewalDate: '2024-11-01'
        },
        {
            id: 'CT-2024-002',
            company: 'LG전자',
            amount: 35000000,
            startDate: '2023-06-01',
            endDate: '2024-05-31',
            status: 'renewal',
            renewalDate: '2024-04-01'
        }
    ],
    quotes: [],
    trainers: [
        {
            id: 1,
            name: '김AI',
            specialty: 'ChatGPT 전문가',
            experience: '5년',
            rating: 4.9,
            projects: 23,
            status: 'active'
        },
        {
            id: 2,
            name: '이프롬프트',
            specialty: '프롬프트 엔지니어링',
            experience: '3년',
            rating: 4.8,
            projects: 15,
            status: 'active'
        },
        {
            id: 3,
            name: '박머신러닝',
            specialty: 'AI 업무 자동화',
            experience: '7년',
            rating: 5.0,
            projects: 31,
            status: 'active'
        }
    ],
    supportTickets: [
        {
            id: 'TK-2024-089',
            company: '삼성전자',
            title: '교육 자료 추가 요청',
            priority: 'medium',
            status: 'open',
            assignee: '김담당',
            createdDate: '2024-01-30'
        },
        {
            id: 'TK-2024-090',
            company: 'LG전자',
            title: '강사 변경 요청',
            priority: 'high',
            status: 'inprogress',
            assignee: '이매니저',
            createdDate: '2024-01-29'
        }
    ]
};

// 테마 관리
const b2bThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('b2b-admin-theme') || 'light';
        this.setTheme(savedTheme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.body.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }
    },
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('b2b-admin-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            const text = themeToggle.querySelector('span');
            
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                text.textContent = '라이트모드';
            } else {
                icon.className = 'fas fa-moon';
                text.textContent = '다크모드';
            }
        }
    }
};

// 네비게이션 관리
function setupB2BNavigation() {
    const navLinks = document.querySelectorAll('.b2b-nav-link');
    const sections = document.querySelectorAll('.b2b-admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = link.getAttribute('data-section');
            
            // 네비게이션 활성화 상태 변경
            document.querySelectorAll('.b2b-nav-item').forEach(item => {
                item.classList.remove('active');
            });
            link.closest('.b2b-nav-item').classList.add('active');
            
            // 섹션 표시
            sections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// 드롭다운 관리
function setupB2BDropdown() {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.b2b-dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', () => {
            dropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!dropdownToggle.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
}

// 기업 테이블 렌더링
function renderCompaniesTable() {
    const tbody = document.getElementById('companiesTable');
    if (!tbody) return;
    
    tbody.innerHTML = b2bData.companies.map(company => `
        <tr>
            <td><strong>${company.name}</strong></td>
            <td>${company.industry}</td>
            <td>${company.contact}</td>
            <td>${company.size}</td>
            <td>
                <span class="b2b-badge b2b-badge-${company.status === 'active' ? 'active' : 'pending'}">
                    ${company.status === 'active' ? '활성' : '대기중'}
                </span>
            </td>
            <td>${company.joinDate}</td>
            <td>
                <button class="b2b-btn b2b-btn-secondary" onclick="viewCompany(${company.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="b2b-btn b2b-btn-warning" onclick="editCompany(${company.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 교육 프로그램 렌더링
function renderPrograms() {
    const container = document.getElementById('programsGrid');
    if (!container) return;
    
    container.innerHTML = b2bData.programs.map(program => `
        <div class="b2b-stat-card">
            <div class="b2b-stat-value">${program.participants}</div>
            <div class="b2b-stat-label">${program.name}</div>
            <div class="b2b-stat-change">
                <i class="fas fa-star"></i>
                만족도 ${program.satisfaction}/5.0
            </div>
            <div style="margin-top: 1rem;">
                <span class="b2b-badge b2b-badge-info">${program.type}</span>
                <span class="b2b-badge b2b-badge-active">${program.duration}</span>
            </div>
        </div>
    `).join('');
}

// 프로젝트 테이블 렌더링
function renderProjectsTable() {
    const tbody = document.getElementById('projectsTable');
    if (!tbody) return;
    
    tbody.innerHTML = b2bData.projects.map(project => `
        <tr>
            <td><strong>${project.name}</strong></td>
            <td>${project.company}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="flex: 1; background: var(--b2b-bg-secondary); border-radius: 4px; height: 8px;">
                        <div style="background: var(--b2b-primary); height: 100%; width: ${project.progress}%; border-radius: 4px;"></div>
                    </div>
                    <span>${project.progress}%</span>
                </div>
            </td>
            <td>${project.startDate}</td>
            <td>${project.endDate}</td>
            <td>
                <span class="b2b-badge b2b-badge-${getProjectStatusBadge(project.status)}">
                    ${getProjectStatusText(project.status)}
                </span>
            </td>
            <td>
                <button class="b2b-btn b2b-btn-secondary" onclick="viewProject(${project.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="b2b-btn b2b-btn-warning" onclick="editProject(${project.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 계약 테이블 렌더링
function renderContractsTable() {
    const tbody = document.getElementById('contractsTable');
    if (!tbody) return;
    
    tbody.innerHTML = b2bData.contracts.map(contract => `
        <tr>
            <td><strong>${contract.id}</strong></td>
            <td>${contract.company}</td>
            <td>₩${contract.amount.toLocaleString()}</td>
            <td>${contract.startDate} ~ ${contract.endDate}</td>
            <td>
                <span class="b2b-badge b2b-badge-${contract.status === 'active' ? 'active' : 'warning'}">
                    ${contract.status === 'active' ? '활성' : '갱신 필요'}
                </span>
            </td>
            <td>${contract.renewalDate}</td>
            <td>
                <button class="b2b-btn b2b-btn-secondary" onclick="viewContract('${contract.id}')">
                    <i class="fas fa-file-alt"></i>
                </button>
                <button class="b2b-btn b2b-btn-primary" onclick="renewContract('${contract.id}')">
                    <i class="fas fa-redo"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 견적 테이블 렌더링
function renderQuotesTable() {
    const tbody = document.getElementById('quotesTable');
    if (!tbody) return;
    
    // 로컬스토리지에서 견적 데이터 가져오기
    const storageQuotes = getQuotesFromStorage();
    
    // 저장된 견적을 B2B 데이터 형식으로 변환
    const formattedQuotes = storageQuotes.map(quote => ({
        id: quote.quoteNumber,
        company: quote.companyName,
        program: getProgramName(quote.programType),
        amount: quote.subtotal + quote.travelFee,
        status: 'pending',
        requestDate: new Date(quote.quoteDate).toLocaleDateString('ko-KR'),
        contactName: quote.contactName,
        contactPhone: quote.contactPhone,
        contactEmail: quote.contactEmail,
        educationHours: quote.educationHours,
        participantCount: quote.participantCount,
        isOnsite: quote.isOnsite,
        region: quote.region,
        requirements: quote.requirements
    }));
    
    // 기존 샘플 데이터와 합치기
    const allQuotes = [...formattedQuotes, ...b2bData.quotes];
    
    tbody.innerHTML = allQuotes.map(quote => `
        <tr>
            <td><strong>${quote.id}</strong></td>
            <td>${quote.company}</td>
            <td>${quote.program}</td>
            <td>₩${quote.amount.toLocaleString()}</td>
            <td>
                <span class="b2b-badge b2b-badge-${getQuoteStatusBadge(quote.status)}">
                    ${getQuoteStatusText(quote.status)}
                </span>
            </td>
            <td>${quote.requestDate}</td>
            <td>
                <button class="b2b-btn b2b-btn-primary" onclick="processQuote('${quote.id}')">
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button class="b2b-btn b2b-btn-secondary" onclick="viewQuote('${quote.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 강사 렌더링
function renderTrainers() {
    const container = document.getElementById('trainersGrid');
    if (!container) return;
    
    container.innerHTML = b2bData.trainers.map(trainer => `
        <div class="b2b-stat-card">
            <div class="b2b-stat-value">${trainer.rating}</div>
            <div class="b2b-stat-label">${trainer.name}</div>
            <div class="b2b-stat-change">
                <i class="fas fa-project-diagram"></i>
                ${trainer.projects}개 프로젝트
            </div>
            <div style="margin-top: 1rem;">
                <div style="font-size: 0.875rem; color: var(--b2b-text-secondary); margin-bottom: 0.5rem;">
                    ${trainer.specialty}
                </div>
                <span class="b2b-badge b2b-badge-info">${trainer.experience}</span>
                <span class="b2b-badge b2b-badge-active">${trainer.status === 'active' ? '활성' : '비활성'}</span>
            </div>
        </div>
    `).join('');
}

// 지원 티켓 테이블 렌더링
function renderSupportTicketsTable() {
    const tbody = document.getElementById('supportTicketsTable');
    if (!tbody) return;
    
    tbody.innerHTML = b2bData.supportTickets.map(ticket => `
        <tr>
            <td><strong>${ticket.id}</strong></td>
            <td>${ticket.company}</td>
            <td>${ticket.title}</td>
            <td>
                <span class="b2b-badge b2b-badge-${getPriorityBadge(ticket.priority)}">
                    ${getPriorityText(ticket.priority)}
                </span>
            </td>
            <td>
                <span class="b2b-badge b2b-badge-${getTicketStatusBadge(ticket.status)}">
                    ${getTicketStatusText(ticket.status)}
                </span>
            </td>
            <td>${ticket.assignee}</td>
            <td>${ticket.createdDate}</td>
            <td>
                <button class="b2b-btn b2b-btn-primary" onclick="processTicket('${ticket.id}')">
                    <i class="fas fa-reply"></i>
                </button>
                <button class="b2b-btn b2b-btn-secondary" onclick="viewTicket('${ticket.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// 차트 초기화
function initB2BCharts() {
    // B2B 매출 차트
    const revenueCtx = document.getElementById('b2bRevenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
                datasets: [{
                    label: 'B2B 매출',
                    data: [65000000, 72000000, 68000000, 84500000, 91000000, 95000000],
                    borderColor: 'var(--b2b-primary)',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₩' + (value / 1000000) + 'M';
                            }
                        }
                    }
                }
            }
        });
    }

    // 성과 분석 차트
    const performanceCtx = document.getElementById('b2bPerformanceChart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['삼성전자', 'LG전자', '현대자동차', '카카오', '스타트업코리아'],
                datasets: [{
                    label: '계약 금액 (백만원)',
                    data: [50, 35, 28, 42, 8],
                    backgroundColor: 'var(--b2b-primary)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // 만족도 차트
    const satisfactionCtx = document.getElementById('b2bSatisfactionChart');
    if (satisfactionCtx) {
        new Chart(satisfactionCtx, {
            type: 'doughnut',
            data: {
                labels: ['매우 만족', '만족', '보통', '불만족'],
                datasets: [{
                    data: [65, 25, 8, 2],
                    backgroundColor: [
                        'var(--b2b-success)',
                        'var(--b2b-primary)',
                        'var(--b2b-warning)',
                        'var(--b2b-error)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// 프로그램명 변환 헬퍼
function getProgramName(type) {
    const names = {
        'basic': 'ChatGPT 기초 과정',
        'advanced': 'AI 업무 활용 실무',
        'custom': '맞춤형 교육'
    };
    return names[type] || type;
}

// 헬퍼 함수들
function getProjectStatusBadge(status) {
    const badges = {
        'planning': 'warning',
        'active': 'info',
        'completed': 'active'
    };
    return badges[status] || 'info';
}

function getProjectStatusText(status) {
    const texts = {
        'planning': '기획중',
        'active': '진행중',
        'completed': '완료'
    };
    return texts[status] || status;
}

function getQuoteStatusBadge(status) {
    const badges = {
        'pending': 'warning',
        'sent': 'info',
        'accepted': 'active'
    };
    return badges[status] || 'info';
}

function getQuoteStatusText(status) {
    const texts = {
        'pending': '대기중',
        'sent': '발송완료',
        'accepted': '승인됨'
    };
    return texts[status] || status;
}

function getPriorityBadge(priority) {
    const badges = {
        'low': 'info',
        'medium': 'warning',
        'high': 'error'
    };
    return badges[priority] || 'info';
}

function getPriorityText(priority) {
    const texts = {
        'low': '낮음',
        'medium': '보통',
        'high': '높음'
    };
    return texts[priority] || priority;
}

function getTicketStatusBadge(status) {
    const badges = {
        'open': 'warning',
        'inprogress': 'info',
        'closed': 'active'
    };
    return badges[status] || 'info';
}

function getTicketStatusText(status) {
    const texts = {
        'open': '미해결',
        'inprogress': '처리중',
        'closed': '해결완료'
    };
    return texts[status] || status;
}

// 모달 관리
function openAddCompanyModal() {
    document.getElementById('addCompanyModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function openAddProgramModal() {
    showNotification('info', '프로그램 추가 기능은 곧 구현됩니다.');
}

function openAddContractModal() {
    showNotification('info', '계약 추가 기능은 곧 구현됩니다.');
}

function openAddTrainerModal() {
    showNotification('info', '강사 추가 기능은 곧 구현됩니다.');
}

// 필터링 함수들
function filterProjects(status) {
    // 탭 활성화 상태 변경
    document.querySelectorAll('.b2b-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // 실제 필터링 로직은 여기에 구현
    showNotification('info', `${status} 프로젝트 필터링`);
}

function filterQuotes(status) {
    document.querySelectorAll('.b2b-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    showNotification('info', `${status} 견적 필터링`);
}

function filterTickets(status) {
    document.querySelectorAll('.b2b-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    showNotification('info', `${status} 티켓 필터링`);
}

// 액션 함수들
function viewCompany(id) {
    showNotification('info', `기업 ${id} 상세 보기`);
}

function editCompany(id) {
    showNotification('info', `기업 ${id} 편집`);
}

function viewProject(id) {
    showNotification('info', `프로젝트 ${id} 상세 보기`);
}

function editProject(id) {
    showNotification('info', `프로젝트 ${id} 편집`);
}

function viewContract(id) {
    showNotification('info', `계약 ${id} 상세 보기`);
}

function renewContract(id) {
    showNotification('success', `계약 ${id} 갱신 처리`);
}

function processQuote(id) {
    // 견적 상태 업데이트
    const quotes = getQuotesFromStorage();
    const quote = quotes.find(q => q.quoteNumber === id);
    
    if (quote) {
        // 견적 상세 모달 표시
        showQuoteDetailModal(quote);
    } else {
        showNotification('success', `견적 ${id} 처리 완료`);
    }
}

function viewQuote(id) {
    // 견적 상세 보기
    const quotes = getQuotesFromStorage();
    const quote = quotes.find(q => q.quoteNumber === id);
    
    if (quote) {
        showQuoteDetailModal(quote);
    } else {
        showNotification('info', `견적 ${id} 상세 보기`);
    }
}

// 견적 상세 모달 표시
function showQuoteDetailModal(quote) {
    const modalHTML = `
        <div id="quoteDetailModal" class="b2b-modal show">
            <div class="b2b-modal-content">
                <div class="b2b-modal-header">
                    <h3 class="b2b-modal-title">견적 상세 정보</h3>
                    <button class="b2b-modal-close" onclick="closeQuoteDetailModal()">&times;</button>
                </div>
                <div class="b2b-modal-body">
                    <div class="b2b-form-group">
                        <label class="b2b-form-label">견적번호</label>
                        <p>${quote.quoteNumber}</p>
                    </div>
                    <div class="b2b-form-group">
                        <label class="b2b-form-label">기업 정보</label>
                        <p><strong>${quote.companyName}</strong></p>
                        <p>담당자: ${quote.contactName}</p>
                        <p>연락처: ${quote.contactPhone}</p>
                        <p>이메일: ${quote.contactEmail}</p>
                    </div>
                    <div class="b2b-form-group">
                        <label class="b2b-form-label">교육 프로그램</label>
                        <p>${getProgramName(quote.programType)}</p>
                        <p>교육시간: ${quote.educationHours}시간</p>
                        <p>참여인원: ${quote.participantCount}명</p>
                        <p>교육방식: ${quote.isOnsite ? '방문 교육' : '온라인 교육'}</p>
                        ${quote.isOnsite && quote.region === 'other' ? '<p>지역: 수도권 외</p>' : ''}
                    </div>
                    <div class="b2b-form-group">
                        <label class="b2b-form-label">견적 금액</label>
                        <p>교육비: ₩${quote.subtotal.toLocaleString()}</p>
                        ${quote.travelFee > 0 ? `<p>출장비: ₩${quote.travelFee.toLocaleString()}</p>` : ''}
                        <p><strong>총액 (VAT 별도): ₩${(quote.subtotal + quote.travelFee).toLocaleString()}</strong></p>
                    </div>
                    ${quote.requirements ? `
                    <div class="b2b-form-group">
                        <label class="b2b-form-label">기타 요구사항</label>
                        <p>${quote.requirements}</p>
                    </div>
                    ` : ''}
                    <div class="b2b-form-group">
                        <label class="b2b-form-label">요청일시</label>
                        <p>${new Date(quote.quoteDate).toLocaleString('ko-KR')}</p>
                    </div>
                </div>
                <div class="b2b-modal-footer">
                    <button class="b2b-btn b2b-btn-secondary" onclick="closeQuoteDetailModal()">닫기</button>
                    <button class="b2b-btn b2b-btn-primary" onclick="downloadQuotePDF('${quote.quoteNumber}')">
                        <i class="fas fa-download"></i> PDF 다운로드
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 기존 모달 제거
    const existingModal = document.getElementById('quoteDetailModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 새 모달 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 견적 상세 모달 닫기
function closeQuoteDetailModal() {
    const modal = document.getElementById('quoteDetailModal');
    if (modal) {
        modal.remove();
    }
}

// 견적서 PDF 다운로드
function downloadQuotePDF(quoteNumber) {
    const quotes = getQuotesFromStorage();
    const quote = quotes.find(q => q.quoteNumber === quoteNumber);
    
    if (quote && window.QuoteSystem) {
        // QuoteSystem의 데이터 설정
        window.QuoteSystem.currentQuote.data = quote;
        // PDF 다운로드 실행
        window.QuoteSystem.downloadPDF();
    } else {
        showNotification('error', 'PDF 다운로드 중 오류가 발생했습니다.');
    }
}

function processTicket(id) {
    showNotification('success', `티켓 ${id} 처리 시작`);
}

function viewTicket(id) {
    showNotification('info', `티켓 ${id} 상세 보기`);
}

function generateB2BReport() {
    showNotification('success', 'B2B 성과 리포트를 생성하여 다운로드했습니다.');
}

// 알림 시스템
function showNotification(type, message) {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.b2b-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `b2b-notification b2b-notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        ${message}
    `;
    
    // 메인 콘텐츠 상단에 추가
    const main = document.querySelector('.b2b-admin-main');
    main.insertBefore(notification, main.firstChild);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// 로그아웃
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// 현재 사용자 확인
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// 기업 교육 신청 데이터 가져오기
function getEnterpriseRequests() {
    return JSON.parse(localStorage.getItem('enterpriseRequests') || '[]');
}

// 신청 관리 테이블 렌더링
function renderRequestsTable() {
    const tbody = document.getElementById('requestsTable');
    if (!tbody) return;
    
    const requests = getEnterpriseRequests();
    
    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem;">
                    아직 신청 내역이 없습니다.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = requests.map(request => {
        const dates = request.dates || [];
        const statusBadge = request.confirmedDate ? 'active' : 'pending';
        const statusText = request.confirmedDate ? '확정' : '대기중';
        const hasDocument = request.documents && request.documents.businessLicense;
        
        return `
            <tr>
                <td><strong>${request.requestId}</strong></td>
                <td>${request.company.name}</td>
                <td>${request.manager.name}</td>
                <td>${getProgramName(request.quote.program)}</td>
                <td>${request.quote.participants}명</td>
                <td>${dates.map(date => new Date(date).toLocaleDateString('ko-KR')).join(', ')}</td>
                <td>${request.confirmedDate ? new Date(request.confirmedDate).toLocaleDateString('ko-KR') : '-'}</td>
                <td>
                    <span class="b2b-badge b2b-badge-${statusBadge}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    ${hasDocument ? 
                        '<span class="b2b-badge b2b-badge-active"><i class="fas fa-check"></i> 제출</span>' : 
                        '<span class="b2b-badge b2b-badge-warning"><i class="fas fa-clock"></i> 대기</span>'
                    }
                </td>
                <td>
                    <button class="b2b-btn b2b-btn-secondary" onclick="viewRequestDetail('${request.requestId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="b2b-btn b2b-btn-primary" onclick="confirmRequestDate('${request.requestId}')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 신청 상세 보기
function viewRequestDetail(requestId) {
    const requests = getEnterpriseRequests();
    const request = requests.find(r => r.requestId === requestId);
    
    if (!request) {
        showNotification('error', '신청 정보를 찾을 수 없습니다.');
        return;
    }
    
    // 상세 정보 표시
    document.getElementById('detailCompanyName').textContent = request.company.name || '-';
    document.getElementById('detailBusinessNumber').textContent = request.company.businessNumber || '-';
    document.getElementById('detailIndustry').textContent = request.company.industry || '-';
    document.getElementById('detailEmployeeCount').textContent = request.company.employeeCount || '-';
    
    document.getElementById('detailManagerName').textContent = request.manager.name || '-';
    document.getElementById('detailPosition').textContent = request.manager.position || '-';
    document.getElementById('detailEmail').textContent = request.manager.email || '-';
    document.getElementById('detailPhone').textContent = request.manager.phone || '-';
    
    document.getElementById('detailProgram').textContent = getProgramName(request.quote.program) || '-';
    document.getElementById('detailParticipants').textContent = `${request.quote.participants}명` || '-';
    document.getElementById('detailEducationType').textContent = request.quote.educationType || '-';
    document.getElementById('detailTotalAmount').textContent = `₩${(request.quote.totalAmount || 0).toLocaleString()}`;
    
    document.getElementById('detailRequestedDates').textContent = (request.dates || []).map(date => 
        new Date(date).toLocaleDateString('ko-KR')
    ).join(', ') || '-';
    document.getElementById('detailConfirmedDate').textContent = request.confirmedDate ? 
        new Date(request.confirmedDate).toLocaleDateString('ko-KR') : '미확정';
    document.getElementById('detailSpecialRequest').textContent = request.quote.specialRequest || '없음';
    
    // 사업자등록증 표시
    const documentPreview = document.getElementById('documentPreview');
    if (request.documents && request.documents.businessLicense) {
        documentPreview.innerHTML = `
            <div style="color: var(--b2b-success);">
                <i class="fas fa-file-pdf" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>사업자등록증이 제출되었습니다.</p>
                <p style="font-size: 0.875rem; color: var(--b2b-text-secondary);">
                    세금계산서 이메일: ${request.documents.taxEmail || '미입력'}
                </p>
            </div>
        `;
    } else {
        documentPreview.innerHTML = '<p>사업자등록증이 업로드되지 않았습니다.</p>';
    }
    
    // 모달 표시
    document.getElementById('requestDetailModal').style.display = 'flex';
}

// 신청 날짜 확정
function confirmRequestDate(requestId) {
    const requests = getEnterpriseRequests();
    const request = requests.find(r => r.requestId === requestId);
    
    if (!request) {
        showNotification('error', '신청 정보를 찾을 수 없습니다.');
        return;
    }
    
    if (request.confirmedDate) {
        showNotification('info', '이미 날짜가 확정된 신청입니다.');
        return;
    }
    
    // 첫 번째 희망 날짜로 확정
    if (request.dates && request.dates.length > 0) {
        request.confirmedDate = request.dates[0];
        localStorage.setItem('enterpriseRequests', JSON.stringify(requests));
        renderRequestsTable();
        showNotification('success', '교육 날짜가 확정되었습니다.');
    }
}

// 신청 필터링
function filterRequests(status) {
    document.querySelectorAll('.b2b-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // 실제 필터링 로직
    const requests = getEnterpriseRequests();
    let filteredRequests = [];
    
    switch(status) {
        case 'pending':
            filteredRequests = requests.filter(r => !r.confirmedDate);
            break;
        case 'confirmed':
            filteredRequests = requests.filter(r => r.confirmedDate && (!r.documents || !r.documents.businessLicense));
            break;
        case 'completed':
            filteredRequests = requests.filter(r => r.confirmedDate && r.documents && r.documents.businessLicense);
            break;
        default:
            filteredRequests = requests;
    }
    
    renderFilteredRequests(filteredRequests);
}

// 필터링된 신청 렌더링
function renderFilteredRequests(requests) {
    const tbody = document.getElementById('requestsTable');
    if (!tbody) return;
    
    if (requests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem;">
                    해당 조건의 신청 내역이 없습니다.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = requests.map(request => {
        const dates = request.dates || [];
        const statusBadge = request.confirmedDate ? 'active' : 'pending';
        const statusText = request.confirmedDate ? '확정' : '대기중';
        const hasDocument = request.documents && request.documents.businessLicense;
        
        return `
            <tr>
                <td><strong>${request.requestId}</strong></td>
                <td>${request.company.name}</td>
                <td>${request.manager.name}</td>
                <td>${getProgramName(request.quote.program)}</td>
                <td>${request.quote.participants}명</td>
                <td>${dates.map(date => new Date(date).toLocaleDateString('ko-KR')).join(', ')}</td>
                <td>${request.confirmedDate ? new Date(request.confirmedDate).toLocaleDateString('ko-KR') : '-'}</td>
                <td>
                    <span class="b2b-badge b2b-badge-${statusBadge}">
                        ${statusText}
                    </span>
                </td>
                <td>
                    ${hasDocument ? 
                        '<span class="b2b-badge b2b-badge-active"><i class="fas fa-check"></i> 제출</span>' : 
                        '<span class="b2b-badge b2b-badge-warning"><i class="fas fa-clock"></i> 대기</span>'
                    }
                </td>
                <td>
                    <button class="b2b-btn b2b-btn-secondary" onclick="viewRequestDetail('${request.requestId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="b2b-btn b2b-btn-primary" onclick="confirmRequestDate('${request.requestId}')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 신청 내역 엑셀 다운로드
function exportRequests() {
    const requests = getEnterpriseRequests();
    
    if (requests.length === 0) {
        showNotification('warning', '다운로드할 신청 내역이 없습니다.');
        return;
    }
    
    // CSV 형식으로 변환
    const headers = ['신청번호', '기업명', '담당자', '프로그램', '인원', '희망날짜', '확정날짜', '상태', '서류제출'];
    const rows = requests.map(request => {
        const dates = request.dates || [];
        const status = request.confirmedDate ? '확정' : '대기중';
        const hasDocument = request.documents && request.documents.businessLicense ? '제출' : '미제출';
        
        return [
            request.requestId,
            request.company.name,
            request.manager.name,
            getProgramName(request.quote.program),
            `${request.quote.participants}명`,
            dates.map(date => new Date(date).toLocaleDateString('ko-KR')).join(', '),
            request.confirmedDate ? new Date(request.confirmedDate).toLocaleDateString('ko-KR') : '-',
            status,
            hasDocument
        ].join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    // 다운로드
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `enterprise_requests_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('success', '신청 내역이 다운로드되었습니다.');
}

// 신청 상세 인쇄
function printRequestDetail() {
    window.print();
}

// 신청 확정 처리
function confirmRequest() {
    showNotification('success', '교육이 확정되었습니다.');
    closeModal('requestDetailModal');
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 인증 확인
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('관리자 권한이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = 'login.html';
        return;
    }

    // 관리자 정보 표시
    const adminUserName = document.querySelector('.admin-user-name');
    if (adminUserName) {
        adminUserName.textContent = `${currentUser.name} 관리자`;
    }

    // 테마 관리 초기화
    b2bThemeManager.init();
    
    // 네비게이션 및 드롭다운 초기화
    setupB2BNavigation();
    setupB2BDropdown();
    
    // 데이터 렌더링
    renderCompaniesTable();
    renderPrograms();
    renderProjectsTable();
    renderContractsTable();
    renderQuotesTable();
    renderTrainers();
    renderSupportTicketsTable();
    renderRequestsTable(); // 신청 관리 테이블 추가
    
    // 차트 초기화
    initB2BCharts();
    
    // 폼 이벤트 리스너
    const addCompanyForm = document.getElementById('addCompanyForm');
    if (addCompanyForm) {
        addCompanyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('success', '새 기업이 추가되었습니다.');
            closeModal('addCompanyModal');
        });
    }

    const b2bSettingsForm = document.getElementById('b2bSettingsForm');
    if (b2bSettingsForm) {
        b2bSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('success', 'B2B 설정이 저장되었습니다.');
        });
    }
    
    // 견적 데이터 자동 갱신 (5초마다)
    setInterval(() => {
        renderQuotesTable();
        renderRequestsTable(); // 신청 데이터도 자동 갱신
    }, 5000);
    
    console.log('B2B 관리자 대시보드 초기화 완료');
});

console.log('B2B 관리자 스크립트 로드 완료');