// 관리자 대시보드 JavaScript
console.log('관리자 대시보드 로드됨');

// 샘플 데이터
let coursesData = [
    {
        id: 1,
        name: 'GPT 프롬프트 마스터 과정',
        category: '프롬프트 엔지니어링',
        price: 149000,
        originalPrice: 199000,
        students: 342,
        status: 'active',
        image: 'https://via.placeholder.com/300x200'
    },
    {
        id: 2,
        name: 'AI 시대의 비즈니스 전략',
        category: '비즈니스 AI',
        price: 299000,
        originalPrice: null,
        students: 298,
        status: 'active',
        image: 'https://via.placeholder.com/300x200'
    },
    {
        id: 3,
        name: 'GPT로 마케팅 자동화하기',
        category: 'AI 마케팅',
        price: 179000,
        originalPrice: null,
        students: 245,
        status: 'active',
        image: 'https://via.placeholder.com/300x200'
    },
    {
        id: 4,
        name: 'ChatGPT 프롬프트 기초',
        category: '프롬프트 엔지니어링',
        price: 99000,
        originalPrice: 132000,
        students: 189,
        status: 'inactive',
        image: 'https://via.placeholder.com/300x200'
    }
];

let ordersData = [
    {
        id: 'ORD-001',
        customerName: '김지은',
        courseName: 'GPT 프롬프트 마스터 과정',
        amount: 149000,
        status: 'completed',
        orderDate: '2024-01-15'
    },
    {
        id: 'ORD-002',
        customerName: '이준호',
        courseName: 'AI 시대의 비즈니스 전략',
        amount: 299000,
        status: 'pending',
        orderDate: '2024-01-14'
    },
    {
        id: 'ORD-003',
        customerName: '박민정',
        courseName: 'GPT로 마케팅 자동화하기',
        amount: 179000,
        status: 'completed',
        orderDate: '2024-01-13'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    
    // 사이드바 네비게이션
    setupNavigation();
    
    // 드롭다운 메뉴
    setupDropdown();
    
    // 강의 관리 기능
    setupCourseManagement();
    
    // 주문 관리 기능
    setupOrderManagement();
    
    // 통계 업데이트
    updateDashboardStats();
    
    // 모달 기능
    setupModals();
    
    console.log('관리자 대시보드 초기화 완료');
});

// 네비게이션 설정
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.dataset.section;
            
            // 활성 상태 업데이트
            navLinks.forEach(nl => nl.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // 섹션 표시/숨김
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // 섹션별 데이터 로드
            loadSectionData(targetSection);
        });
    });
}

// 드롭다운 메뉴 설정
function setupDropdown() {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // 외부 클릭 시 닫기
        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });
        
        // 드롭다운 아이템 클릭 이벤트
        const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                const text = this.textContent.trim();
                
                if (text === '로그아웃') {
                    e.preventDefault();
                    if (confirm('로그아웃 하시겠습니까?')) {
                        alert('로그아웃되었습니다.');
                        window.location.href = 'index.html';
                    }
                } else if (text === '사이트 보기') {
                    // 새 탭에서 열기
                    window.open('index.html', '_blank');
                } else {
                    e.preventDefault();
                    alert(`${text} 기능은 곧 제공될 예정입니다.`);
                }
                
                dropdownMenu.classList.remove('show');
            });
        });
    }
}

// 강의 관리 설정
function setupCourseManagement() {
    const addCourseBtn = document.getElementById('addCourseBtn');
    
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', function() {
            openCourseModal();
        });
    }
}

// 주문 관리 설정
function setupOrderManagement() {
    // 상태 필터
    const statusFilter = document.querySelector('.filter-select');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            const selectedStatus = this.value;
            renderOrdersTable(selectedStatus);
        });
    }
}

// 섹션별 데이터 로드
function loadSectionData(section) {
    switch (section) {
        case 'courses':
            renderCoursesTable();
            break;
        case 'orders':
            renderOrdersTable();
            break;
        case 'members':
            renderMembersTable();
            setupMemberFilters();
            break;
        case 'dashboard':
            updateDashboardStats();
            initializeWidgetSystem();
            break;
        case 'quotes':
            renderQuotesTable();
            setupQuoteFilters();
            break;
        default:
            break;
    }
}

// 강의 테이블 렌더링
function renderCoursesTable() {
    const tbody = document.querySelector('#coursesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    coursesData.forEach(course => {
        const row = document.createElement('tr');
        
        const discountPercent = course.originalPrice ? 
            Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) : 0;
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${course.image}" alt="${course.name}" 
                         style="width: 48px; height: 48px; border-radius: 6px; object-fit: cover;">
                    <strong>${course.name}</strong>
                </div>
            </td>
            <td>${course.category}</td>
            <td>
                ${course.originalPrice ? 
                    `<span style="text-decoration: line-through; color: #9ca3af; font-size: 0.75rem;">₩${course.originalPrice.toLocaleString()}</span><br>` : ''
                }
                <strong>₩${course.price.toLocaleString()}</strong>
                ${discountPercent > 0 ? `<span style="color: #dc2626; font-size: 0.75rem; font-weight: 600;">${discountPercent}% 할인</span>` : ''}
            </td>
            <td>${course.students}명</td>
            <td>
                <span class="status-badge ${course.status}">
                    ${course.status === 'active' ? '활성' : '비활성'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editCourse(${course.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteCourse(${course.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 주문 테이블 렌더링
function renderOrdersTable(statusFilter = 'all') {
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const filteredOrders = statusFilter === 'all' ? 
        ordersData : ordersData.filter(order => order.status === statusFilter);
    
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><strong>${order.id}</strong></td>
            <td>${order.customerName}</td>
            <td>${order.courseName}</td>
            <td><strong>₩${order.amount.toLocaleString()}</strong></td>
            <td>
                <span class="status-badge ${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td>${formatDate(order.orderDate)}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 상태 텍스트 변환
function getStatusText(status) {
    const statusMap = {
        'pending': '결제 대기',
        'completed': '결제 완료',
        'cancelled': '취소됨'
    };
    return statusMap[status] || status;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

// 대시보드 통계 업데이트
function updateDashboardStats() {
    // 실시간 데이터 계산
    const totalRevenue = ordersData
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.amount, 0);
    
    const totalOrders = ordersData.length;
    const totalMembers = 3892; // 샘플 데이터
    const totalCourses = coursesData.length;
    
    // DOM 업데이트
    const revenueEl = document.getElementById('totalRevenue');
    const ordersEl = document.getElementById('totalOrders');
    const membersEl = document.getElementById('totalMembers');
    const coursesEl = document.getElementById('totalCourses');
    
    if (revenueEl) revenueEl.textContent = `₩${totalRevenue.toLocaleString()}`;
    if (ordersEl) ordersEl.textContent = totalOrders.toLocaleString();
    if (membersEl) membersEl.textContent = totalMembers.toLocaleString();
    if (coursesEl) coursesEl.textContent = totalCourses.toString();
}

// 모달 설정
function setupModals() {
    // 강의 모달
    const courseModal = document.getElementById('courseModal');
    const courseCloseBtn = courseModal?.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelBtn');
    const courseForm = document.getElementById('courseForm');
    
    // 회원 상세 모달
    const memberModal = document.getElementById('memberDetailModal');
    const memberCloseBtn = memberModal?.querySelector('.modal-close');
    
    // 수강률 모달
    const progressModal = document.getElementById('courseProgressModal');
    const progressCloseBtn = progressModal?.querySelector('.modal-close');
    
    // 강의 모달 닫기
    [courseCloseBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                closeCourseModal();
            });
        }
    });
    
    // 회원 모달 닫기
    if (memberCloseBtn) {
        memberCloseBtn.addEventListener('click', function() {
            memberModal.classList.remove('show');
        });
    }
    
    // 수강률 모달 닫기
    if (progressCloseBtn) {
        progressCloseBtn.addEventListener('click', function() {
            progressModal.classList.remove('show');
        });
    }
    
    // 모달 외부 클릭 시 닫기
    [courseModal, memberModal, progressModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
    });
    
    // 강의 폼 제출
    if (courseForm) {
        courseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCourse();
        });
    }
}

// 강의 모달 열기
function openCourseModal(courseId = null) {
    const modal = document.getElementById('courseModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('courseForm');
    
    if (courseId) {
        // 편집 모드
        const course = coursesData.find(c => c.id === courseId);
        modalTitle.textContent = '강의 편집';
        
        // 폼 필드 채우기
        document.getElementById('courseName').value = course.name;
        document.getElementById('courseCategory').value = course.category;
        document.getElementById('coursePrice').value = course.price;
        document.getElementById('courseDiscount').value = course.originalPrice ? 
            Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) : 0;
        document.getElementById('courseDescription').value = course.description || '';
        document.getElementById('courseImage').value = course.image;
        
        form.dataset.courseId = courseId;
    } else {
        // 새 강의 모드
        modalTitle.textContent = '새 강의 추가';
        form.reset();
        delete form.dataset.courseId;
    }
    
    modal.classList.add('show');
}

// 강의 모달 닫기
function closeCourseModal() {
    const modal = document.getElementById('courseModal');
    modal.classList.remove('show');
}

// 강의 저장
function saveCourse() {
    const form = document.getElementById('courseForm');
    const formData = new FormData(form);
    const courseId = form.dataset.courseId;
    
    const courseData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseInt(formData.get('price')),
        discount: parseInt(formData.get('discount')) || 0,
        description: formData.get('description'),
        image: formData.get('image') || 'https://via.placeholder.com/300x200',
        status: 'active',
        students: 0
    };
    
    // 할인가 계산
    if (courseData.discount > 0) {
        courseData.originalPrice = Math.round(courseData.price / (1 - courseData.discount / 100));
    }
    
    if (courseId) {
        // 편집
        const index = coursesData.findIndex(c => c.id === parseInt(courseId));
        coursesData[index] = { ...coursesData[index], ...courseData };
        alert('강의가 수정되었습니다.');
    } else {
        // 새 강의 추가
        const newId = Math.max(...coursesData.map(c => c.id)) + 1;
        coursesData.push({ id: newId, ...courseData });
        alert('새 강의가 추가되었습니다.');
    }
    
    closeCourseModal();
    renderCoursesTable();
    updateDashboardStats();
}

// 강의 편집
function editCourse(courseId) {
    openCourseModal(courseId);
}

// 강의 삭제
function deleteCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    
    if (confirm(`"${course.name}" 강의를 삭제하시겠습니까?`)) {
        coursesData = coursesData.filter(c => c.id !== courseId);
        alert('강의가 삭제되었습니다.');
        renderCoursesTable();
        updateDashboardStats();
    }
}

// 주문 보기
function viewOrder(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    
    alert(`주문 정보\n\n주문번호: ${order.id}\n고객명: ${order.customerName}\n강의명: ${order.courseName}\n금액: ₩${order.amount.toLocaleString()}\n상태: ${getStatusText(order.status)}\n주문일: ${formatDate(order.orderDate)}`);
}

// 페이지 로드 시 초기 데이터 렌더링
window.addEventListener('load', function() {
    // 기본으로 대시보드 섹션 활성화
    loadSectionData('dashboard');
    initializeWidgetSystem();
});

// 회원 관리 기능
function renderMembersTable(filters = {}) {
    const tbody = document.querySelector('#membersTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // sampleUsers 데이터 사용 (user-manager.js에서 가져옴)
    let filteredMembers = sampleUsers;
    
    // 검색 필터 적용
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredMembers = filteredMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.email.toLowerCase().includes(searchTerm) ||
            member.company.toLowerCase().includes(searchTerm)
        );
    }
    
    // 역할 필터 적용
    if (filters.role && filters.role !== 'all') {
        filteredMembers = filteredMembers.filter(member => member.role === filters.role);
    }
    
    // 마케팅 채널 필터 적용
    if (filters.channel && filters.channel !== 'all') {
        filteredMembers = filteredMembers.filter(member => member.marketingChannel === filters.channel);
    }
    
    filteredMembers.forEach(member => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <strong>${member.name}</strong>
                    <small style="color: var(--text-secondary);">${member.email}</small>
                    <small style="color: var(--text-light);">${member.company} | ${member.position}</small>
                </div>
            </td>
            <td>${formatDate(member.joinDate)}</td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <strong>${member.purchasedCourses.length}개</strong>
                    ${member.purchasedCourses.slice(0, 2).map(course => 
                        `<small style="color: var(--text-secondary);">• ${course.name}</small>`
                    ).join('')}
                    ${member.purchasedCourses.length > 2 ? 
                        `<small style="color: var(--primary-color); cursor: pointer;" onclick="viewMemberDetail(${member.id})">+${member.purchasedCourses.length - 2}개 더보기</small>` : ''
                    }
                </div>
            </td>
            <td><strong style="color: var(--primary-color);">₩${member.totalPurchaseAmount.toLocaleString()}</strong></td>
            <td>
                <span class="channel-badge ${member.marketingChannel}">
                    ${getChannelText(member.marketingChannel)}
                </span>
            </td>
            <td>
                <span class="status-badge ${member.role}">
                    ${getRoleText(member.role)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="viewMemberDetail(${member.id})" title="상세보기">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editMemberRole(${member.id})" title="권한 변경">
                        <i class="fas fa-user-cog"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 회원 필터 설정
function setupMemberFilters() {
    const searchInput = document.getElementById('memberSearch');
    const roleFilter = document.getElementById('memberRoleFilter');
    const channelFilter = document.getElementById('memberChannelFilter');
    
    function applyFilters() {
        const filters = {
            search: searchInput?.value || '',
            role: roleFilter?.value || 'all',
            channel: channelFilter?.value || 'all'
        };
        renderMembersTable(filters);
    }
    
    // 이벤트 리스너 추가
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    
    if (roleFilter) {
        roleFilter.addEventListener('change', applyFilters);
    }
    
    if (channelFilter) {
        channelFilter.addEventListener('change', applyFilters);
    }
}

// 회원 상세 정보 보기
function viewMemberDetail(memberId) {
    const member = sampleUsers.find(m => m.id === memberId);
    if (!member) return;
    
    // 모달 열기
    const modal = document.getElementById('memberDetailModal');
    
    // 기본 정보 채우기
    document.getElementById('memberName').textContent = member.name;
    document.getElementById('memberEmail').textContent = member.email;
    document.getElementById('memberPhone').textContent = member.phone || '-';
    document.getElementById('memberCompany').textContent = member.company || '-';
    document.getElementById('memberPosition').textContent = member.position || '-';
    document.getElementById('memberJoinDate').textContent = formatDate(member.joinDate);
    document.getElementById('memberChannel').textContent = getChannelText(member.marketingChannel);
    
    // 구매 정보 채우기
    document.getElementById('memberTotalAmount').textContent = `₩${member.totalPurchaseAmount.toLocaleString()}`;
    document.getElementById('memberCourseCount').textContent = `${member.purchasedCourses.length}개`;
    
    // 구매 강의 목록 채우기
    const coursesList = document.getElementById('memberCoursesList');
    coursesList.innerHTML = '';
    
    if (member.purchasedCourses.length === 0) {
        coursesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">구매한 강의가 없습니다.</p>';
    } else {
        member.purchasedCourses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-item-detail';
            courseItem.onclick = () => showCourseProgress(member.id, course.id);
            
            courseItem.innerHTML = `
                <div class="course-basic">
                    <div class="course-name">${course.name}</div>
                    <div class="course-meta">
                        <span>구매일: ${formatDate(course.purchaseDate)}</span>
                        <span>결제금액: ₩${course.amount.toLocaleString()}</span>
                        <span class="payment-badge ${course.paymentMethod}">${getPaymentMethodText(course.paymentMethod)}</span>
                    </div>
                </div>
                <div class="course-progress">
                    <div class="progress-circle" style="background: conic-gradient(var(--primary-color) ${course.progress * 3.6}deg, var(--border-color) ${course.progress * 3.6}deg);">
                        <span>${course.progress}%</span>
                    </div>
                </div>
            `;
            
            coursesList.appendChild(courseItem);
        });
    }
    
    modal.classList.add('show');
}

// 수강률 상세 보기
function showCourseProgress(memberId, courseId) {
    const member = sampleUsers.find(m => m.id === memberId);
    const course = member?.purchasedCourses.find(c => c.id === courseId);
    
    if (!course) return;
    
    // 모달 열기
    const modal = document.getElementById('courseProgressModal');
    
    // 정보 채우기
    document.getElementById('progressCourseName').textContent = course.name;
    document.getElementById('progressPercentage').textContent = `${course.progress}%`;
    document.getElementById('progressPurchaseDate').textContent = formatDate(course.purchaseDate);
    document.getElementById('progressAmount').textContent = `₩${course.amount.toLocaleString()}`;
    document.getElementById('progressPaymentMethod').textContent = getPaymentMethodText(course.paymentMethod);
    document.getElementById('progressLastAccess').textContent = getLastAccessText(course.progress);
    
    // 프로그레스 바 설정
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${course.progress}%`;
    
    modal.classList.add('show');
}

// 회원 권한 변경
function editMemberRole(memberId) {
    const member = sampleUsers.find(m => m.id === memberId);
    if (!member) return;
    
    const currentRole = getRoleText(member.role);
    const newRole = prompt(`${member.name}님의 권한을 변경하시겠습니까?\n\n현재 권한: ${currentRole}\n\n1: 일반 회원\n2: 프리미엄 회원\n3: 관리자\n\n숫자를 입력하세요:`);
    
    if (newRole) {
        let roleValue;
        switch(newRole) {
            case '1':
                roleValue = 'user';
                break;
            case '2':
                roleValue = 'premium';
                break;
            case '3':
                roleValue = 'admin';
                break;
            default:
                alert('올바른 숫자를 입력해주세요.');
                return;
        }
        
        // 실제로는 서버 API 호출
        member.role = roleValue;
        alert(`${member.name}님의 권한이 ${getRoleText(roleValue)}(으)로 변경되었습니다.`);
        renderMembersTable();
    }
}

// 마케팅 채널 텍스트 변환
function getChannelText(channel) {
    const channelMap = {
        'direct': '직접 유입',
        'google_cpc': '구글 광고',
        'google_organic': '구글 검색',
        'naver_blog': '네이버 블로그',
        'facebook': '페이스북',
        'instagram': '인스타그램',
        'youtube': '유튜브',
        'referral': '추천'
    };
    return channelMap[channel] || channel;
}

// 역할 텍스트 변환
function getRoleText(role) {
    const roleMap = {
        'admin': '관리자',
        'premium': '프리미엄',
        'user': '일반 회원'
    };
    return roleMap[role] || role;
}

// 결제 방법 텍스트 변환
function getPaymentMethodText(method) {
    const methodMap = {
        'card': '카드결제',
        'bank_transfer': '계좌이체',
        'kakaopay': '카카오페이',
        'naverpay': '네이버페이'
    };
    return methodMap[method] || method;
}

// 마지막 접속일 계산
function getLastAccessText(progress) {
    if (progress === 0) return '미접속';
    if (progress === 100) return '완료';
    
    // 진행률에 따른 임의의 접속일 계산
    const daysAgo = Math.floor((100 - progress) / 10);
    if (daysAgo === 0) return '오늘';
    if (daysAgo === 1) return '어제';
    return `${daysAgo}일 전`;
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 위젯 시스템
const widgetManager = {
    availableWidgets: [
        {
            id: 'stats-overview',
            name: '통계 개요',
            description: '주요 지표 한눈에 보기',
            type: 'stats',
            active: true,
            order: 1
        },
        {
            id: 'revenue-chart',
            name: '매출 차트',
            description: '월별 매출 현황',
            type: 'chart',
            active: true,
            order: 2
        },
        {
            id: 'popular-courses',
            name: '인기 강의',
            description: 'TOP 5 인기 강의',
            type: 'list',
            active: true,
            order: 3
        },
        {
            id: 'recent-orders',
            name: '최근 주문',
            description: '최근 주문 현황',
            type: 'activity',
            active: true,
            order: 4
        },
        {
            id: 'new-members',
            name: '신규 회원',
            description: '최근 가입한 회원',
            type: 'activity',
            active: false,
            order: 5
        },
        {
            id: 'completion-rates',
            name: '수강 완료율',
            description: '강의별 완료율 통계',
            type: 'chart',
            active: false,
            order: 6
        }
    ],

    renderWidgets() {
        const container = document.getElementById('dashboardWidgets');
        if (!container) return;

        container.innerHTML = '';

        const activeWidgets = this.availableWidgets
            .filter(widget => widget.active)
            .sort((a, b) => a.order - b.order);

        activeWidgets.forEach(widget => {
            const widgetElement = this.createWidget(widget);
            container.appendChild(widgetElement);
        });
    },

    createWidget(widget) {
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'widget';
        widgetDiv.dataset.widgetId = widget.id;

        switch (widget.type) {
            case 'stats':
                widgetDiv.innerHTML = this.createStatsWidget();
                break;
            case 'chart':
                if (widget.id === 'revenue-chart') {
                    widgetDiv.innerHTML = this.createRevenueChartWidget();
                } else {
                    widgetDiv.innerHTML = this.createCompletionRatesWidget();
                }
                break;
            case 'list':
                widgetDiv.innerHTML = this.createPopularCoursesWidget();
                break;
            case 'activity':
                if (widget.id === 'recent-orders') {
                    widgetDiv.innerHTML = this.createRecentOrdersWidget();
                } else {
                    widgetDiv.innerHTML = this.createNewMembersWidget();
                }
                break;
        }

        return widgetDiv;
    },

    createStatsWidget() {
        const totalRevenue = ordersData
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + order.amount, 0);

        return `
            <div class="widget-header">
                <h3>통계 개요</h3>
                <div class="widget-actions">
                    <button class="widget-action" onclick="refreshWidget('stats-overview')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-stats">
                    <div class="widget-stat">
                        <h3 class="widget-stat-value">₩${totalRevenue.toLocaleString()}</h3>
                        <p class="widget-stat-label">총 매출</p>
                    </div>
                    <div class="widget-stat">
                        <h3 class="widget-stat-value">${ordersData.length}</h3>
                        <p class="widget-stat-label">총 주문</p>
                    </div>
                    <div class="widget-stat">
                        <h3 class="widget-stat-value">3,892</h3>
                        <p class="widget-stat-label">총 회원</p>
                    </div>
                    <div class="widget-stat">
                        <h3 class="widget-stat-value">${coursesData.length}</h3>
                        <p class="widget-stat-label">총 강의</p>
                    </div>
                </div>
            </div>
        `;
    },

    createRevenueChartWidget() {
        return `
            <div class="widget-header">
                <h3>월별 매출 현황</h3>
                <div class="widget-actions">
                    <button class="widget-action" onclick="refreshWidget('revenue-chart')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="widget-action" onclick="configureWidget('revenue-chart')">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-chart">
                    <p>매출 차트 (개발 중)</p>
                </div>
            </div>
        `;
    },

    createPopularCoursesWidget() {
        const popularCourses = coursesData
            .sort((a, b) => b.students - a.students)
            .slice(0, 5);

        const coursesList = popularCourses.map((course, index) => `
            <div class="widget-list-item">
                <div class="widget-item-info">
                    <h4>${index + 1}. ${course.name}</h4>
                    <p>${course.category}</p>
                </div>
                <div class="widget-item-value">${course.students}명</div>
            </div>
        `).join('');

        return `
            <div class="widget-header">
                <h3>인기 강의 TOP 5</h3>
                <div class="widget-actions">
                    <button class="widget-action" onclick="refreshWidget('popular-courses')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                ${coursesList}
            </div>
        `;
    },

    createRecentOrdersWidget() {
        const recentOrders = ordersData.slice(0, 5);

        const ordersList = recentOrders.map(order => `
            <div class="widget-list-item">
                <div class="widget-item-info">
                    <h4>${order.customerName}님</h4>
                    <p>${order.courseName}</p>
                </div>
                <div class="widget-item-value">₩${order.amount.toLocaleString()}</div>
            </div>
        `).join('');

        return `
            <div class="widget-header">
                <h3>최근 주문</h3>
                <div class="widget-actions">
                    <button class="widget-action" onclick="refreshWidget('recent-orders')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                ${ordersList}
            </div>
        `;
    },

    createNewMembersWidget() {
        return `
            <div class="widget-header">
                <h3>신규 회원</h3>
                <div class="widget-actions">
                    <button class="widget-action" onclick="refreshWidget('new-members')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-list-item">
                    <div class="widget-item-info">
                        <h4>정승현님</h4>
                        <p>8분 전 가입</p>
                    </div>
                </div>
                <div class="widget-list-item">
                    <div class="widget-item-info">
                        <h4>최영희님</h4>
                        <p>15분 전 가입</p>
                    </div>
                </div>
                <div class="widget-list-item">
                    <div class="widget-item-info">
                        <h4>한동훈님</h4>
                        <p>28분 전 가입</p>
                    </div>
                </div>
            </div>
        `;
    },

    createCompletionRatesWidget() {
        return `
            <div class="widget-header">
                <h3>수강 완료율</h3>
                <div class="widget-actions">
                    <button class="widget-action" onclick="refreshWidget('completion-rates')">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-chart">
                    <p>완료율 차트 (개발 중)</p>
                </div>
            </div>
        `;
    },

    renderWidgetSettings() {
        const settingsList = document.getElementById('widgetSettingsList');
        if (!settingsList) return;

        settingsList.innerHTML = '';

        this.availableWidgets
            .sort((a, b) => a.order - b.order)
            .forEach(widget => {
                const widgetItem = document.createElement('div');
                widgetItem.className = 'widget-item';
                widgetItem.dataset.widgetId = widget.id;
                widgetItem.draggable = true;
                widgetItem.style.cursor = 'move';

                widgetItem.innerHTML = `
                    <div class="widget-info">
                        <i class="fas fa-grip-vertical widget-drag-handle"></i>
                        <div>
                            <h4>${widget.name}</h4>
                            <p>${widget.description}</p>
                        </div>
                    </div>
                    <div class="widget-controls">
                        <div class="widget-toggle ${widget.active ? 'active' : ''}" 
                             onclick="toggleWidget('${widget.id}')"></div>
                    </div>
                `;

                settingsList.appendChild(widgetItem);
            });
    }
};

// 위젯 관리 함수들
function toggleDashboardSettings() {
    const settingsPanel = document.getElementById('dashboardSettings');
    if (settingsPanel.classList.contains('hidden')) {
        settingsPanel.classList.remove('hidden');
        widgetManager.renderWidgetSettings();
    } else {
        settingsPanel.classList.add('hidden');
    }
}

function showAddWidgetPanel() {
    alert('위젯 추가 기능은 곧 제공될 예정입니다.');
}

function toggleWidget(widgetId) {
    const widget = widgetManager.availableWidgets.find(w => w.id === widgetId);
    if (widget) {
        widget.active = !widget.active;
        widgetManager.renderWidgets();
        widgetManager.renderWidgetSettings();
        
        // 로컬 스토리지에 설정 저장
        localStorage.setItem('dashboardWidgets', JSON.stringify(widgetManager.availableWidgets));
    }
}

function refreshWidget(widgetId) {
    console.log(`위젯 새로고침: ${widgetId}`);
    widgetManager.renderWidgets();
}

function configureWidget(widgetId) {
    alert(`${widgetId} 위젯 설정 기능은 곧 제공될 예정입니다.`);
}

function resetDashboard() {
    if (confirm('대시보드를 기본 설정으로 복원하시겠습니까?')) {
        // 기본 설정으로 복원
        widgetManager.availableWidgets.forEach(widget => {
            if (['stats-overview', 'revenue-chart', 'popular-courses', 'recent-orders'].includes(widget.id)) {
                widget.active = true;
            } else {
                widget.active = false;
            }
        });
        
        widgetManager.renderWidgets();
        widgetManager.renderWidgetSettings();
        localStorage.removeItem('dashboardWidgets');
        alert('대시보드가 기본 설정으로 복원되었습니다.');
    }
}

function saveDashboardSettings() {
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgetManager.availableWidgets));
    alert('대시보드 설정이 저장되었습니다.');
    toggleDashboardSettings();
}

// 위젯 시스템 초기화
function initializeWidgetSystem() {
    // 로컬 스토리지에서 설정 불러오기
    const savedWidgets = localStorage.getItem('dashboardWidgets');
    if (savedWidgets) {
        try {
            const parsedWidgets = JSON.parse(savedWidgets);
            widgetManager.availableWidgets = parsedWidgets;
        } catch (e) {
            console.error('위젯 설정 로드 실패:', e);
        }
    }
    
    // 위젯 렌더링
    widgetManager.renderWidgets();
    
    // 드래그 앤 드롭 초기화
    initializeDragAndDrop();
}

// 드래그 앤 드롭 기능
function initializeDragAndDrop() {
    const widgetSettingsList = document.getElementById('widgetSettingsList');
    if (!widgetSettingsList) return;

    let draggedElement = null;
    let draggedIndex = null;

    // 드래그 이벤트 리스너 추가
    widgetSettingsList.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('widget-item') || e.target.closest('.widget-item')) {
            draggedElement = e.target.closest('.widget-item');
            draggedIndex = Array.from(widgetSettingsList.children).indexOf(draggedElement);
            draggedElement.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    widgetSettingsList.addEventListener('dragend', function(e) {
        if (draggedElement) {
            draggedElement.style.opacity = '';
            draggedElement = null;
            draggedIndex = null;
        }
    });

    widgetSettingsList.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    widgetSettingsList.addEventListener('drop', function(e) {
        e.preventDefault();
        
        if (!draggedElement) return;

        const dropTarget = e.target.closest('.widget-item');
        if (!dropTarget || dropTarget === draggedElement) return;

        const dropIndex = Array.from(widgetSettingsList.children).indexOf(dropTarget);
        
        // 위젯 순서 변경
        reorderWidgets(draggedIndex, dropIndex);
        
        // DOM 업데이트
        if (draggedIndex < dropIndex) {
            dropTarget.parentNode.insertBefore(draggedElement, dropTarget.nextSibling);
        } else {
            dropTarget.parentNode.insertBefore(draggedElement, dropTarget);
        }
    });

    // 모든 위젯 아이템에 draggable 속성 추가
    function makeDraggable(element) {
        element.draggable = true;
        element.style.cursor = 'move';
    }

    // MutationObserver로 동적 추가된 위젯 아이템 감지
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList.contains('widget-item')) {
                    makeDraggable(node);
                }
            });
        });
    });

    observer.observe(widgetSettingsList, { childList: true });
}

// 위젯 순서 변경
function reorderWidgets(fromIndex, toIndex) {
    const widgets = [...widgetManager.availableWidgets];
    const [movedWidget] = widgets.splice(fromIndex, 1);
    widgets.splice(toIndex, 0, movedWidget);

    // order 속성 업데이트
    widgets.forEach((widget, index) => {
        widget.order = index + 1;
    });

    widgetManager.availableWidgets = widgets;
    
    // 위젯 다시 렌더링
    widgetManager.renderWidgets();
    
    // 로컬 스토리지에 저장
    localStorage.setItem('dashboardWidgets', JSON.stringify(widgetManager.availableWidgets));
}

// 콘텐츠 편집 시스템
const contentEditor = {
    currentPage: null,
    currentElement: null,
    
    pageTemplates: {
        home: {
            title: '메인 페이지',
            sections: [
                { id: 'hero', name: '메인 배너', content: '<h2>AI 시대를 선도하는 GPT 전문 교육</h2><p>한국GPT협회와 함께 미래를 준비하세요</p>' },
                { id: 'about', name: '소개', content: '<h3>한국GPT협회 소개</h3><p>AI 교육의 미래를 선도하는 전문 교육 플랫폼입니다.</p>' },
                { id: 'features', name: '특징', content: '<ul><li>전문가 강의진</li><li>실무 중심 커리큘럼</li><li>1:1 멘토링</li></ul>' }
            ]
        },
        courses: {
            title: '강의 관리',
            sections: [
                { id: 'categories', name: '카테고리', content: '<h3>강의 카테고리</h3><p>프롬프트 엔지니어링, 비즈니스 AI, AI 마케팅, AI 리더십</p>' },
                { id: 'pricing', name: '가격 정책', content: '<h3>가격 정책</h3><p>합리적인 가격으로 최고의 교육을 제공합니다.</p>' }
            ]
        },
        enterprise: {
            title: '기업교육',
            sections: [
                { id: 'programs', name: '프로그램', content: '<h3>기업교육 프로그램</h3><p>맞춤형 기업교육 솔루션을 제공합니다.</p>' },
                { id: 'contact', name: '문의', content: '<h3>문의하기</h3><p>기업교육 문의: contact@koreangpt.org</p>' }
            ]
        },
        general: {
            title: '일반 설정',
            sections: [
                { id: 'siteinfo', name: '사이트 정보', content: '<h3>한국GPT협회</h3><p>이메일: info@koreangpt.org<br>전화: 02-1234-5678</p>' },
                { id: 'social', name: '소셜 미디어', content: '<h3>소셜 미디어</h3><p>Facebook, Instagram, YouTube에서 만나보세요.</p>' }
            ]
        }
    }
};

// 콘텐츠 편집 함수들
function openContentEditor() {
    const modal = document.getElementById('contentEditorModal');
    modal.classList.add('show');
    
    // 편집기 탭 이벤트 설정
    setupEditorTabs();
    
    // 모달 닫기 이벤트 설정
    setupEditorModal();
}

function editPage(pageId) {
    contentEditor.currentPage = pageId;
    const pageData = contentEditor.pageTemplates[pageId];
    
    if (!pageData) {
        alert('페이지 데이터를 찾을 수 없습니다.');
        return;
    }
    
    // 모달 제목 설정
    document.getElementById('editorModalTitle').textContent = `${pageData.title} 편집`;
    
    // 첫 번째 섹션 로드
    if (pageData.sections.length > 0) {
        loadSectionContent(pageData.sections[0]);
    }
    
    openContentEditor();
}

function loadSectionContent(section) {
    const visualEditor = document.getElementById('editableContent');
    const htmlEditor = document.getElementById('htmlEditor');
    
    visualEditor.innerHTML = section.content;
    htmlEditor.value = section.content;
    
    contentEditor.currentElement = section;
}

function setupEditorTabs() {
    const tabs = document.querySelectorAll('.editor-tab');
    const panels = document.querySelectorAll('.editor-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // 탭 활성화 상태 변경
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 패널 표시/숨김
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab + 'Editor') {
                    panel.classList.add('active');
                }
            });
            
            // HTML 편집기와 시각적 편집기 동기화
            syncEditorContent(targetTab);
        });
    });
}

function syncEditorContent(activeTab) {
    const visualEditor = document.getElementById('editableContent');
    const htmlEditor = document.getElementById('htmlEditor');
    
    if (activeTab === 'code') {
        // 시각적 편집기 → HTML 편집기
        htmlEditor.value = visualEditor.innerHTML;
    } else {
        // HTML 편집기 → 시각적 편집기
        visualEditor.innerHTML = htmlEditor.value;
    }
}

function setupEditorModal() {
    const modal = document.getElementById('contentEditorModal');
    const closeBtn = modal.querySelector('.modal-close');
    
    // 닫기 버튼
    closeBtn.addEventListener('click', closeContentEditor);
    
    // 모달 외부 클릭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeContentEditor();
        }
    });
}

function closeContentEditor() {
    const modal = document.getElementById('contentEditorModal');
    modal.classList.remove('show');
}

function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('editableContent').focus();
}

function insertImage() {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
        document.execCommand('insertImage', false, url);
    }
}

function insertLink() {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
}

function previewContent() {
    const content = document.getElementById('editableContent').innerHTML;
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>미리보기</title>
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            <div class="container" style="padding: 2rem;">
                ${content}
            </div>
        </body>
        </html>
    `);
}

function saveContent() {
    if (!contentEditor.currentElement) {
        alert('저장할 콘텐츠가 없습니다.');
        return;
    }
    
    const visualEditor = document.getElementById('editableContent');
    const newContent = visualEditor.innerHTML;
    
    // 로컬 스토리지에 저장
    const storageKey = `content_${contentEditor.currentPage}_${contentEditor.currentElement.id}`;
    localStorage.setItem(storageKey, newContent);
    
    // 템플릿 업데이트
    contentEditor.currentElement.content = newContent;
    
    alert('콘텐츠가 저장되었습니다.');
    closeContentEditor();
}

function openThemeSettings() {
    alert('테마 설정 기능은 곧 제공될 예정입니다.');
}

// 드래그 앤 드롭 편집 기능 (실제 사이트에서 사용)
function enableInlineEditing() {
    const editableElements = document.querySelectorAll('[data-editable]');
    
    editableElements.forEach(element => {
        element.classList.add('editable-element');
        
        // 편집 오버레이 추가
        const overlay = document.createElement('div');
        overlay.className = 'edit-overlay';
        overlay.textContent = '편집';
        overlay.onclick = () => editInline(element);
        
        element.appendChild(overlay);
    });
}

function editInline(element) {
    const originalContent = element.innerHTML;
    element.classList.add('editing');
    element.contentEditable = true;
    element.focus();
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '저장';
    saveBtn.className = 'btn btn-primary';
    saveBtn.style.position = 'absolute';
    saveBtn.style.top = '100%';
    saveBtn.style.right = '0';
    saveBtn.style.zIndex = '1000';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '취소';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.style.position = 'absolute';
    cancelBtn.style.top = '100%';
    cancelBtn.style.right = '70px';
    cancelBtn.style.zIndex = '1000';
    
    element.appendChild(saveBtn);
    element.appendChild(cancelBtn);
    
    saveBtn.onclick = () => {
        element.classList.remove('editing');
        element.contentEditable = false;
        saveBtn.remove();
        cancelBtn.remove();
        
        // 실제로는 서버에 저장
        const elementId = element.dataset.editable;
        localStorage.setItem(`inline_${elementId}`, element.innerHTML);
        alert('변경사항이 저장되었습니다.');
    };
    
    cancelBtn.onclick = () => {
        element.innerHTML = originalContent;
        element.classList.remove('editing');
        element.contentEditable = false;
        saveBtn.remove();
        cancelBtn.remove();
    };
}

// 견적 관리 기능
function renderQuotesTable(statusFilter = 'all') {
    const tbody = document.querySelector('#quotesTable tbody');
    if (!tbody) return;
    
    // 로컬스토리지에서 견적 데이터 가져오기
    const quoteHistory = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
    
    // 필터링
    const filteredQuotes = statusFilter === 'all' ? 
        quoteHistory : quoteHistory.filter(quote => quote.status === statusFilter);
    
    // 통계 업데이트
    updateQuoteStats(quoteHistory);
    
    tbody.innerHTML = '';
    
    if (filteredQuotes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">견적 요청이 없습니다.</td></tr>';
        return;
    }
    
    filteredQuotes.forEach(quote => {
        const row = document.createElement('tr');
        
        const programText = {
            basic: 'AI 입문 과정',
            intermediate: 'AI 실무 활용',
            advanced: 'AI 리더십',
            custom: '맞춤형'
        };
        
        const statusBadge = {
            pending: '<span class="status-badge pending">대기중</span>',
            contacted: '<span class="status-badge processing">연락완료</span>',
            completed: '<span class="status-badge completed">계약완료</span>'
        };
        
        row.innerHTML = `
            <td><strong>Q${quote.id}</strong></td>
            <td>${quote.company}</td>
            <td>${quote.name}<br><small>${quote.phone}</small></td>
            <td>${programText[quote.program] || '-'}</td>
            <td>${quote.participants}명</td>
            <td>${quote.program === 'custom' ? '별도 상담' : '₩' + quote.totalPrice.toLocaleString()}</td>
            <td>${new Date(quote.timestamp).toLocaleDateString('ko-KR')}</td>
            <td>${statusBadge[quote.status || 'pending']}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" onclick="viewQuoteDetail('${quote.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="updateQuoteStatus('${quote.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteQuote('${quote.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 견적 통계 업데이트
function updateQuoteStats(quotes) {
    const totalEl = document.getElementById('totalQuotes');
    const pendingEl = document.getElementById('pendingQuotes');
    const completedEl = document.getElementById('completedQuotes');
    
    if (totalEl) totalEl.textContent = quotes.length;
    if (pendingEl) pendingEl.textContent = quotes.filter(q => !q.status || q.status === 'pending').length;
    if (completedEl) completedEl.textContent = quotes.filter(q => q.status === 'completed').length;
}

// 견적 필터 설정
function setupQuoteFilters() {
    const searchInput = document.getElementById('quoteSearch');
    const dateFrom = document.getElementById('quoteDateFrom');
    const dateTo = document.getElementById('quoteDateTo');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            searchQuotes(e.target.value);
        }, 300));
    }
    
    if (dateFrom) {
        dateFrom.addEventListener('change', filterQuotesByDate);
    }
    
    if (dateTo) {
        dateTo.addEventListener('change', filterQuotesByDate);
    }
}

// 견적 검색
function searchQuotes(searchTerm) {
    const tbody = document.querySelector('#quotesTable tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

// 견적 필터
function filterQuotes(status) {
    renderQuotesTable(status);
}

// 견적 상세 보기
function viewQuoteDetail(quoteId) {
    const quotes = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
    const quote = quotes.find(q => q.id === quoteId);
    
    if (!quote) return;
    
    alert(`견적 상세 정보:\n
회사: ${quote.company}
담당자: ${quote.name}
연락처: ${quote.phone}
이메일: ${quote.email}
과정: ${quote.program}
인원: ${quote.participants}명
금액: ${quote.program === 'custom' ? '별도 상담' : '₩' + quote.totalPrice.toLocaleString()}
요청일: ${new Date(quote.timestamp).toLocaleString('ko-KR')}`);
}

// 견적 상태 업데이트
function updateQuoteStatus(quoteId) {
    const quotes = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) return;
    
    const newStatus = prompt('상태를 선택하세요:\npending, contacted, completed 중 입력');
    
    if (newStatus && ['pending', 'contacted', 'completed'].includes(newStatus)) {
        quotes[quoteIndex].status = newStatus;
        localStorage.setItem('quoteHistory', JSON.stringify(quotes));
        renderQuotesTable();
        alert('상태가 업데이트되었습니다.');
    }
}

// 견적 삭제
function deleteQuote(quoteId) {
    if (!confirm('정말 이 견적을 삭제하시겠습니까?')) return;
    
    const quotes = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
    const filtered = quotes.filter(q => q.id !== quoteId);
    
    localStorage.setItem('quoteHistory', JSON.stringify(filtered));
    renderQuotesTable();
    alert('견적이 삭제되었습니다.');
}

// 견적 내보내기
function exportQuotes() {
    const quotes = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
    
    if (quotes.length === 0) {
        alert('내보낼 견적이 없습니다.');
        return;
    }
    
    // CSV 형식으로 변환
    const headers = ['견적번호', '회사명', '담당자', '연락처', '이메일', '과정', '인원', '금액', '요청일', '상태'];
    const rows = quotes.map(q => [
        'Q' + q.id,
        q.company,
        q.name,
        q.phone,
        q.email,
        q.program,
        q.participants,
        q.program === 'custom' ? '별도상담' : q.totalPrice,
        new Date(q.timestamp).toLocaleDateString('ko-KR'),
        q.status || 'pending'
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // 다운로드
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `견적관리_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

console.log('관리자 대시보드 스크립트 로드 완료');