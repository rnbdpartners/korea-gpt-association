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
    
    // 새로운 기능들 초기화
    setupUnifiedSearch();
    setupInlineEditing();
    setupFileUpload();
    setupCustomerManagement();
    setupSupportSystem();
    setupTicketManagement();
    setupContentManagement();
    setupMediaLibrary();
    
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

// 고급 BI 대시보드 기능
const biDashboard = {
    charts: {},
    sparklines: {},
    realTimeInterval: null,
    dropzoneInstance: null,
    
    // 초기화
    init() {
        this.initializeKPIData();
        this.initializeCharts();
        this.initializeRealTimeUpdates();
        this.initializeDropzone();
        this.generateAIInsights();
        this.updateActivityFeed();
        this.setupNotifications();
    },
    
    // KPI 데이터 초기화
    initializeKPIData() {
        // 실시간 매출 데이터
        const completedOrders = ordersData.filter(order => order.status === 'completed');
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
        
        // 전환율 계산 (견적 → 계약)
        const quotes = JSON.parse(localStorage.getItem('quoteHistory') || '[]');
        const completedQuotes = quotes.filter(q => q.status === 'completed');
        const conversionRate = quotes.length > 0 ? (completedQuotes.length / quotes.length * 100) : 0;
        
        // 고객 만족도 (샘플 데이터)
        const satisfaction = 4.7;
        
        // 고객 유지율 (샘플 데이터)
        const retention = 87.3;
        
        // KPI 업데이트
        this.updateKPI('totalRevenue', totalRevenue, '매출');
        this.updateKPI('conversionRate', conversionRate, '전환율', '%');
        this.updateKPI('customerSatisfaction', satisfaction, '만족도');
        this.updateKPI('customerRetention', retention, '유지율', '%');
        
        // 목표 대비 달성률 계산
        const revenueGoal = 50000000; // 5천만원 목표
        const goalPercentage = Math.min((totalRevenue / revenueGoal * 100), 100);
        document.getElementById('revenueGoal').textContent = Math.round(goalPercentage) + '%';
    },
    
    // KPI 업데이트
    updateKPI(kpiId, value, label, unit = '') {
        const element = document.getElementById(kpiId);
        if (element) {
            if (label === '매출') {
                element.textContent = '₩' + value.toLocaleString();
            } else if (unit === '%') {
                element.textContent = value.toFixed(1) + '%';
            } else {
                element.textContent = value.toFixed(1);
            }
        }
        
        // 스파크라인 차트 생성
        this.createSparkline(kpiId + 'Sparkline', this.generateSparklineData());
    },
    
    // 스파크라인 데이터 생성
    generateSparklineData() {
        const data = [];
        for (let i = 0; i < 7; i++) {
            data.push(Math.random() * 100 + 50);
        }
        return data;
    },
    
    // 스파크라인 차트 생성
    createSparkline(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.sparklines[canvasId]) {
            this.sparklines[canvasId].destroy();
        }
        
        this.sparklines[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', ''],
                datasets: [{
                    data: data,
                    borderColor: '#04F9BC',
                    backgroundColor: 'rgba(4, 249, 188, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: {
                    point: { radius: 0 }
                }
            }
        });
    },
    
    // 메인 차트 초기화
    initializeCharts() {
        this.createRevenueChart();
        this.createFunnelChart();
        this.createRegionChart();
        this.createProgramChart();
    },
    
    // 매출 추이 차트
    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const labels = [];
        const data = [];
        
        // 최근 30일 데이터 생성
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
            data.push(Math.random() * 2000000 + 500000);
        }
        
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '일별 매출',
                    data: data,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#04F9BC',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return '매출: ₩' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#6b7280' }
                    },
                    y: {
                        grid: { color: 'rgba(107, 114, 128, 0.1)' },
                        ticks: { 
                            color: '#6b7280',
                            callback: function(value) {
                                return '₩' + (value / 1000000).toFixed(1) + 'M';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    },
    
    // 고객 유입 경로 차트
    createFunnelChart() {
        const ctx = document.getElementById('funnelChart');
        if (!ctx) return;
        
        this.charts.funnel = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['사이트 방문', '견적 요청', '상담 진행', '계약 체결'],
                datasets: [{
                    data: [1245, 298, 156, 89],
                    backgroundColor: [
                        '#04F9BC',
                        '#3b82f6',
                        '#f59e0b',
                        '#10b981'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value}명 (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    },
    
    // 지역별 분포 차트
    createRegionChart() {
        const ctx = document.getElementById('regionChart');
        if (!ctx) return;
        
        this.charts.region = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['서울', '경기', '부산', '대구', '인천', '광주', '대전', '기타'],
                datasets: [{
                    data: [450, 320, 180, 120, 95, 75, 65, 145],
                    backgroundColor: [
                        '#04F9BC',
                        '#BED7CF',
                        '#3b82f6',
                        '#f59e0b',
                        '#10b981',
                        '#8b5cf6',
                        '#ef4444',
                        '#6b7280'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.y}명`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#6b7280' }
                    },
                    y: {
                        grid: { color: 'rgba(107, 114, 128, 0.1)' },
                        ticks: { color: '#6b7280' }
                    }
                }
            }
        });
    },
    
    // 교육 프로그램 성과 차트
    createProgramChart() {
        const ctx = document.getElementById('programChart');
        if (!ctx) return;
        
        this.charts.program = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['프롬프트 엔지니어링', '비즈니스 AI', 'AI 마케팅', 'AI 리더십', '맞춤형 교육'],
                datasets: [{
                    label: '등록 현황',
                    data: [85, 70, 65, 45, 90],
                    borderColor: '#04F9BC',
                    backgroundColor: 'rgba(4, 249, 188, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#04F9BC',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            color: '#6b7280'
                        },
                        grid: { color: 'rgba(107, 114, 128, 0.2)' },
                        pointLabels: {
                            color: '#374151',
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    },
    
    // 실시간 업데이트 초기화
    initializeRealTimeUpdates() {
        // 30초마다 데이터 업데이트
        this.realTimeInterval = setInterval(() => {
            this.updateRealTimeData();
        }, 30000);
        
        // 즉시 첫 업데이트 실행
        this.updateRealTimeData();
    },
    
    // 실시간 데이터 업데이트
    updateRealTimeData() {
        // KPI 데이터 업데이트
        this.initializeKPIData();
        
        // 활동 피드 업데이트
        this.updateActivityFeed();
        
        // 알림 확인
        this.checkForNewNotifications();
    },
    
    // 활동 피드 업데이트
    updateActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;
        
        const activities = [
            { user: '김', action: '새로운 견적을 요청했습니다', time: '방금 전', type: 'quote' },
            { user: '이', action: 'AI 마케팅 과정을 완료했습니다', time: '5분 전', type: 'completion' },
            { user: '박', action: '프리미엄 회원으로 업그레이드했습니다', time: '12분 전', type: 'upgrade' },
            { user: '정', action: '새로 가입했습니다', time: '18분 전', type: 'signup' },
            { user: '최', action: '견적 상담을 완료했습니다', time: '25분 전', type: 'consultation' }
        ];
        
        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-avatar">${activity.user}</div>
                <div class="activity-content">
                    <p><strong>${activity.user}님이</strong> ${activity.action}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    },
    
    // AI 인사이트 생성
    generateAIInsights() {
        const aiInsights = document.getElementById('aiInsights');
        if (!aiInsights) return;
        
        const insights = [
            {
                title: '매출 증가 기회',
                content: '프롬프트 엔지니어링 과정의 수요가 35% 증가했습니다. 추가 과정 개설을 고려해보세요.',
                type: 'opportunity'
            },
            {
                title: '고객 이탈 위험',
                content: '최근 7일간 3명의 프리미엄 회원이 활동하지 않았습니다. 맞춤형 리텐션 캠페인이 필요합니다.',
                type: 'warning'
            },
            {
                title: '마케팅 최적화',
                content: '네이버 블로그 유입 고객의 전환율이 42%로 가장 높습니다. 해당 채널 투자를 늘려보세요.',
                type: 'suggestion'
            }
        ];
        
        aiInsights.innerHTML = insights.map(insight => `
            <div class="ai-insight-item">
                <div class="ai-insight-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="ai-insight-content">
                    <h5>${insight.title}</h5>
                    <p>${insight.content}</p>
                </div>
            </div>
        `).join('');
    },
    
    // 드래그앤드롭 이미지 업로드 초기화
    initializeDropzone() {
        const dropzoneElement = document.querySelector('.dropzone');
        if (!dropzoneElement) return;
        
        // Dropzone 설정이 이미 있다면 제거
        if (this.dropzoneInstance) {
            this.dropzoneInstance.destroy();
        }
        
        // Dropzone 초기화
        this.dropzoneInstance = new Dropzone(dropzoneElement, {
            url: '/upload', // 실제 업로드 URL (데모용)
            maxFilesize: 10, // MB
            acceptedFiles: 'image/*',
            maxFiles: 5,
            addRemoveLinks: true,
            dictDefaultMessage: `
                <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                <div style="font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem;">이미지를 여기에 드래그하거나 클릭하세요</div>
                <div style="font-size: 0.875rem; color: var(--text-light);">JPG, PNG, GIF 파일만 가능 (최대 10MB)</div>
            `,
            dictRemoveFile: '삭제',
            dictCancelUpload: '취소',
            dictUploadCanceled: '업로드가 취소되었습니다',
            dictInvalidFileType: '지원하지 않는 파일 형식입니다',
            dictFileTooBig: '파일 크기가 너무 큽니다 (최대 {{maxFilesize}}MB)',
            dictMaxFilesExceeded: '최대 {{maxFiles}}개 파일만 업로드 가능합니다',
            
            init: function() {
                this.on('success', function(file, response) {
                    console.log('파일 업로드 성공:', file.name);
                    biDashboard.showNotification('success', `${file.name} 업로드 완료`);
                });
                
                this.on('error', function(file, errorMessage) {
                    console.error('파일 업로드 실패:', errorMessage);
                    biDashboard.showNotification('error', `업로드 실패: ${errorMessage}`);
                });
                
                this.on('sending', function(file, xhr, formData) {
                    // 추가 데이터 전송 시 사용
                    formData.append('timestamp', Date.now());
                });
            }
        });
        
        // 데모용 가짜 업로드 처리
        this.dropzoneInstance.options.url = 'javascript:void(0)';
        this.dropzoneInstance.processQueue = function() {
            const files = this.getQueuedFiles();
            files.forEach(file => {
                setTimeout(() => {
                    this.emit('success', file, { status: 'success' });
                    this.emit('complete', file);
                }, 1000 + Math.random() * 2000);
            });
        };
    },
    
    // 알림 시스템 설정
    setupNotifications() {
        // 페이지 로드 시 환영 알림
        setTimeout(() => {
            this.showNotification('info', '비즈니스 인텔리전스 대시보드에 오신 것을 환영합니다!');
        }, 1000);
        
        // 주기적으로 시스템 상태 확인
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% 확률
                this.showRandomNotification();
            }
        }, 60000); // 1분마다
    },
    
    // 알림 표시
    showNotification(type, message) {
        const alertsContainer = document.getElementById('realTimeAlerts');
        if (!alertsContainer) return;
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="btn-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        alertsContainer.appendChild(alertDiv);
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    },
    
    // 랜덤 알림 표시
    showRandomNotification() {
        const notifications = [
            { type: 'success', message: '새로운 견적 요청이 접수되었습니다.' },
            { type: 'info', message: '시스템 백업이 완료되었습니다.' },
            { type: 'warning', message: '서버 용량이 85%에 도달했습니다.' }
        ];
        
        const notification = notifications[Math.floor(Math.random() * notifications.length)];
        this.showNotification(notification.type, notification.message);
    },
    
    // 알림 아이콘 반환
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },
    
    // 새 알림 확인
    checkForNewNotifications() {
        // 실제 구현에서는 서버 API 호출
        // 여기서는 데모용 랜덤 알림
        if (Math.random() < 0.05) { // 5% 확률
            this.showRandomNotification();
        }
    },
    
    // 차트 새로고침
    refreshChart(chartType) {
        if (this.charts[chartType]) {
            // 새로운 데이터 생성
            const newData = this.generateChartData(chartType);
            this.charts[chartType].data = newData;
            this.charts[chartType].update('none');
        }
    },
    
    // 차트 데이터 생성
    generateChartData(chartType) {
        switch (chartType) {
            case 'revenue':
                return {
                    labels: this.charts.revenue.data.labels,
                    datasets: [{
                        ...this.charts.revenue.data.datasets[0],
                        data: this.charts.revenue.data.datasets[0].data.map(() => 
                            Math.random() * 2000000 + 500000
                        )
                    }]
                };
            default:
                return this.charts[chartType].data;
        }
    },
    
    // 정리
    destroy() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        
        if (this.dropzoneInstance) {
            this.dropzoneInstance.destroy();
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        Object.values(this.sparklines).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
};

// 대시보드 관련 유틸리티 함수들
function updateDashboardData() {
    const dateRange = document.getElementById('dateRange').value;
    console.log(`데이터 범위 변경: ${dateRange}일`);
    
    // 선택된 기간에 따른 데이터 업데이트
    biDashboard.initializeKPIData();
    biDashboard.showNotification('info', `최근 ${dateRange}일 데이터로 업데이트되었습니다.`);
}

function exportDashboardData() {
    biDashboard.showNotification('info', '대시보드 데이터를 내보내는 중...');
    
    setTimeout(() => {
        // CSV 데이터 생성
        const data = {
            timestamp: new Date().toISOString(),
            revenue: document.getElementById('totalRevenue').textContent,
            conversion: document.getElementById('conversionRate').textContent,
            satisfaction: document.getElementById('customerSatisfaction').textContent,
            retention: document.getElementById('customerRetention').textContent
        };
        
        const csv = Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard_data_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
        biDashboard.showNotification('success', '대시보드 데이터가 내보내졌습니다.');
    }, 1000);
}

function refreshDashboard() {
    biDashboard.showNotification('info', '대시보드를 새로고침하는 중...');
    
    setTimeout(() => {
        biDashboard.updateRealTimeData();
        biDashboard.generateAIInsights();
        biDashboard.showNotification('success', '대시보드가 새로고침되었습니다.');
    }, 500);
}

function toggleMapView() {
    biDashboard.showNotification('info', '지도 보기 기능은 곧 제공될 예정입니다.');
}

function updateProgramChart(metric) {
    console.log(`프로그램 차트 지표 변경: ${metric}`);
    
    const chart = biDashboard.charts.program;
    if (chart) {
        let newData;
        switch (metric) {
            case 'enrollment':
                newData = [85, 70, 65, 45, 90];
                break;
            case 'completion':
                newData = [92, 88, 76, 84, 95];
                break;
            case 'satisfaction':
                newData = [4.8, 4.6, 4.7, 4.5, 4.9];
                break;
            default:
                newData = [85, 70, 65, 45, 90];
        }
        
        chart.data.datasets[0].data = newData;
        chart.update();
    }
}

// 차트 컨트롤 함수들
function setChartPeriod(chartId, period) {
    console.log(`${chartId} 차트 기간 변경: ${period}`);
    
    // 버튼 활성화 상태 변경
    document.querySelectorAll(`[data-period]`).forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 차트 데이터 업데이트
    if (biDashboard.charts.revenue) {
        biDashboard.refreshChart('revenue');
    }
}

// 콘텐츠 관리 시스템 강화
const contentManagement = {
    templates: {},
    currentTemplate: null,
    
    init() {
        this.loadTemplates();
        this.setupAdvancedEditor();
    },
    
    loadTemplates() {
        // 실제로는 서버에서 로드
        this.templates = {
            'main-banner': {
                name: '메인 배너',
                content: '<h2>AI 시대를 선도하는 GPT 전문 교육</h2><p>한국GPT협회와 함께 미래를 준비하세요</p>',
                type: 'hero'
            },
            'course-intro': {
                name: '강의 소개',
                content: '<h3>전문가가 설계한 실무 중심 커리큘럼</h3>',
                type: 'content'
            }
        };
    },
    
    setupAdvancedEditor() {
        // 고급 에디터 기능 설정
        this.setupImageUploader();
        this.setupContentBlocks();
    },
    
    setupImageUploader() {
        const uploadArea = document.querySelector('.upload-area');
        if (!uploadArea) return;
        
        uploadArea.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            
            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => this.handleImageUpload(file));
            };
            
            input.click();
        });
        
        // 드래그앤드롭 지원
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            files.forEach(file => this.handleImageUpload(file));
        });
    },
    
    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            biDashboard.showNotification('error', '이미지 파일만 업로드 가능합니다.');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            biDashboard.showNotification('error', '파일 크기는 10MB 이하여야 합니다.');
            return;
        }
        
        // 파일 읽기
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            this.addImageToGallery(file.name, imageUrl);
            biDashboard.showNotification('success', `${file.name} 업로드 완료`);
        };
        reader.readAsDataURL(file);
    },
    
    addImageToGallery(filename, url) {
        // 이미지 갤러리에 추가 (실제 구현에서는 서버 저장)
        const gallery = document.getElementById('imageGallery');
        if (!gallery) return;
        
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <img src="${url}" alt="${filename}" onclick="selectImage('${url}')">
            <div class="image-info">
                <span>${filename}</span>
                <button onclick="deleteImage('${filename}')" class="btn-delete">삭제</button>
            </div>
        `;
        
        gallery.appendChild(imageItem);
    },
    
    setupContentBlocks() {
        // 콘텐츠 블록 시스템 설정
        const blockTypes = ['text', 'image', 'video', 'button', 'gallery'];
        
        blockTypes.forEach(type => {
            const button = document.getElementById(`add-${type}-block`);
            if (button) {
                button.addEventListener('click', () => this.addContentBlock(type));
            }
        });
    },
    
    addContentBlock(type) {
        const editor = document.getElementById('editableContent');
        if (!editor) return;
        
        let blockHtml = '';
        
        switch (type) {
            case 'text':
                blockHtml = '<div class="content-block text-block" contenteditable="true"><p>텍스트를 입력하세요...</p></div>';
                break;
            case 'image':
                blockHtml = '<div class="content-block image-block"><img src="https://via.placeholder.com/400x200" alt="이미지"><div class="block-controls"><button onclick="editImage(this)">편집</button></div></div>';
                break;
            case 'button':
                blockHtml = '<div class="content-block button-block"><button class="btn btn-primary">버튼 텍스트</button><div class="block-controls"><button onclick="editButton(this)">편집</button></div></div>';
                break;
            default:
                blockHtml = `<div class="content-block ${type}-block"><p>${type} 블록</p></div>`;
        }
        
        editor.insertAdjacentHTML('beforeend', blockHtml);
        biDashboard.showNotification('success', `${type} 블록이 추가되었습니다.`);
    }
};

// 사용자 행동 추적 시스템
const userAnalytics = {
    sessions: [],
    events: [],
    
    init() {
        this.trackPageView();
        this.setupEventTracking();
        this.startSessionTracking();
    },
    
    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            timestamp: Date.now(),
            referrer: document.referrer
        };
        
        this.events.push({
            type: 'pageview',
            data: pageData,
            timestamp: Date.now()
        });
    },
    
    setupEventTracking() {
        // 클릭 이벤트 추적
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link, .btn, .action-btn')) {
                this.trackEvent('click', {
                    element: e.target.tagName,
                    text: e.target.textContent.trim(),
                    className: e.target.className
                });
            }
        });
        
        // 폼 제출 추적
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                form: e.target.id || 'unknown',
                action: e.target.action
            });
        });
    },
    
    trackEvent(eventType, eventData) {
        this.events.push({
            type: eventType,
            data: eventData,
            timestamp: Date.now(),
            sessionId: this.getCurrentSessionId()
        });
        
        // 로컬 스토리지에 저장
        localStorage.setItem('userEvents', JSON.stringify(this.events.slice(-100))); // 최근 100개만 보관
    },
    
    startSessionTracking() {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            startTime: Date.now(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            events: []
        };
        
        this.sessions.push(session);
        localStorage.setItem('currentSession', sessionId);
    },
    
    getCurrentSessionId() {
        return localStorage.getItem('currentSession') || this.generateSessionId();
    },
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    getAnalyticsReport() {
        return {
            totalSessions: this.sessions.length,
            totalEvents: this.events.length,
            topEvents: this.getTopEvents(),
            sessionDuration: this.getAverageSessionDuration()
        };
    },
    
    getTopEvents() {
        const eventCounts = {};
        this.events.forEach(event => {
            eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        });
        
        return Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    },
    
    getAverageSessionDuration() {
        if (this.sessions.length === 0) return 0;
        
        const completedSessions = this.sessions.filter(s => s.endTime);
        if (completedSessions.length === 0) return 0;
        
        const totalDuration = completedSessions.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
        return Math.round(totalDuration / completedSessions.length / 1000); // 초 단위
    }
};

// 성능 모니터링 시스템
const performanceMonitor = {
    metrics: {},
    
    init() {
        this.measurePageLoad();
        this.monitorRealTimeMetrics();
        this.setupPerformanceObserver();
    },
    
    measurePageLoad() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            this.metrics.pageLoad = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart,
                timestamp: Date.now()
            };
            
            console.log('페이지 로드 성능:', this.metrics.pageLoad);
        });
    },
    
    monitorRealTimeMetrics() {
        setInterval(() => {
            this.metrics.memory = performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null;
            
            this.metrics.connection = navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null;
            
        }, 5000); // 5초마다
    },
    
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // 최대 콘텐츠 페인트 측정
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        this.metrics.lcp = entry.startTime;
                    }
                });
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    },
    
    getPerformanceReport() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
    }
};

// 메인 초기화 함수 수정
document.addEventListener('DOMContentLoaded', function() {
    // 기존 초기화
    setupNavigation();
    setupDropdown();
    setupCourseManagement();
    setupOrderManagement();
    updateDashboardStats();
    setupModals();
    
    // 새로운 BI 시스템 초기화
    biDashboard.init();
    contentManagement.init();
    userAnalytics.init();
    performanceMonitor.init();
    
    console.log('고급 BI 대시보드 초기화 완료');
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    biDashboard.destroy();
    
    // 세션 종료 시간 기록
    const sessionId = userAnalytics.getCurrentSessionId();
    const session = userAnalytics.sessions.find(s => s.id === sessionId);
    if (session) {
        session.endTime = Date.now();
    }
});

// 미디어 관리 및 추가 유틸리티 함수들
function openMediaManager() {
    biDashboard.showNotification('info', '미디어 관리자를 열었습니다.');
    
    // 드롭존 초기화 (이미 초기화되지 않은 경우에만)
    if (!biDashboard.dropzoneInstance) {
        biDashboard.initializeDropzone();
    }
    
    // 스크롤을 미디어 관리 섹션으로 이동
    const mediaSection = document.querySelector('.content-management');
    if (mediaSection) {
        mediaSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function generateAnalyticsReport() {
    biDashboard.showNotification('info', '분석 리포트를 생성하는 중...');
    
    setTimeout(() => {
        const report = {
            generatedAt: new Date().toISOString(),
            period: '최근 30일',
            summary: {
                totalRevenue: document.getElementById('totalRevenue')?.textContent || '₩0',
                totalOrders: ordersData.length,
                conversionRate: document.getElementById('conversionRate')?.textContent || '0%',
                customerSatisfaction: document.getElementById('customerSatisfaction')?.textContent || '0',
                activeUsers: sampleUsers?.length || 0
            },
            userAnalytics: userAnalytics.getAnalyticsReport(),
            performance: performanceMonitor.getPerformanceReport(),
            recommendations: [
                '프롬프트 엔지니어링 과정의 수요가 증가하고 있습니다.',
                '모바일 사용자 비율이 65%로 높아 모바일 최적화가 중요합니다.',
                '네이버 블로그 마케팅 채널의 ROI가 가장 높습니다.',
                '고객 만족도 향상을 위해 1:1 상담 서비스 확대를 권장합니다.'
            ]
        };
        
        // JSON 파일로 다운로드
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_report_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        biDashboard.showNotification('success', '분석 리포트가 생성되어 다운로드되었습니다.');
    }, 2000);
}

function selectImage(imageUrl) {
    // 이미지 선택 처리
    const selectedImages = document.querySelectorAll('.image-item.selected');
    selectedImages.forEach(img => img.classList.remove('selected'));
    
    event.target.closest('.image-item').classList.add('selected');
    biDashboard.showNotification('info', '이미지가 선택되었습니다.');
}

function deleteImage(filename) {
    if (confirm(`"${filename}" 이미지를 삭제하시겠습니까?`)) {
        const imageItem = event.target.closest('.image-item');
        if (imageItem) {
            imageItem.remove();
            biDashboard.showNotification('success', `${filename} 이미지가 삭제되었습니다.`);
        }
    }
}

// 일정 관리 기능 (추가 기능)
const scheduleManager = {
    events: [],
    
    init() {
        this.loadSchedule();
        this.setupEventHandlers();
    },
    
    loadSchedule() {
        // 샘플 일정 데이터
        this.events = [
            {
                id: 1,
                title: '기업교육 상담 - 삼성전자',
                date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일
                type: 'consultation',
                priority: 'high'
            },
            {
                id: 2,
                title: '신규 강의 기획 회의',
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
                type: 'meeting',
                priority: 'medium'
            },
            {
                id: 3,
                title: '월간 매출 리뷰',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 일주일 후
                type: 'review',
                priority: 'high'
            }
        ];
    },
    
    setupEventHandlers() {
        // 일정 관련 이벤트 처리
    },
    
    getUpcomingEvents(days = 7) {
        const now = new Date();
        const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        return this.events.filter(event => 
            event.date >= now && event.date <= future
        ).sort((a, b) => a.date - b.date);
    },
    
    addEvent(eventData) {
        const newEvent = {
            id: Math.max(...this.events.map(e => e.id)) + 1,
            ...eventData,
            date: new Date(eventData.date)
        };
        
        this.events.push(newEvent);
        this.saveSchedule();
        return newEvent;
    },
    
    saveSchedule() {
        localStorage.setItem('adminSchedule', JSON.stringify(this.events));
    }
};

// 시스템 상태 모니터링
const systemMonitor = {
    status: {
        server: 'healthy',
        database: 'healthy',
        storage: 'warning',
        lastChecked: new Date()
    },
    
    init() {
        this.checkSystemHealth();
        setInterval(() => this.checkSystemHealth(), 5 * 60 * 1000); // 5분마다
    },
    
    checkSystemHealth() {
        // 실제로는 서버 API 호출
        const statuses = ['healthy', 'warning', 'error'];
        
        this.status = {
            server: statuses[Math.floor(Math.random() * 3)],
            database: statuses[Math.floor(Math.random() * 3)],
            storage: Math.random() > 0.8 ? 'warning' : 'healthy',
            memory: this.getMemoryUsage(),
            lastChecked: new Date()
        };
        
        this.updateStatusDisplay();
        this.checkAlerts();
    },
    
    getMemoryUsage() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const total = performance.memory.totalJSHeapSize;
            return Math.round((used / total) * 100);
        }
        return Math.floor(Math.random() * 100);
    },
    
    updateStatusDisplay() {
        // 시스템 상태 UI 업데이트
        const statusElement = document.getElementById('systemStatus');
        if (statusElement) {
            const overallStatus = this.getOverallStatus();
            statusElement.className = `system-status ${overallStatus}`;
            statusElement.textContent = this.getStatusText(overallStatus);
        }
    },
    
    getOverallStatus() {
        const statuses = Object.values(this.status).filter(s => typeof s === 'string');
        if (statuses.includes('error')) return 'error';
        if (statuses.includes('warning')) return 'warning';
        return 'healthy';
    },
    
    getStatusText(status) {
        const texts = {
            healthy: '정상',
            warning: '주의',
            error: '오류'
        };
        return texts[status] || '알 수 없음';
    },
    
    checkAlerts() {
        if (this.status.storage === 'warning') {
            biDashboard.showNotification('warning', '저장소 용량이 부족합니다.');
        }
        
        if (this.status.memory > 90) {
            biDashboard.showNotification('warning', '메모리 사용량이 높습니다.');
        }
        
        if (this.status.server === 'error') {
            biDashboard.showNotification('error', '서버 연결에 문제가 있습니다.');
        }
    }
};

// 백업 및 복원 시스템
const backupManager = {
    lastBackup: null,
    
    init() {
        this.loadBackupInfo();
        this.scheduleAutoBackup();
    },
    
    loadBackupInfo() {
        const backupInfo = localStorage.getItem('lastBackup');
        if (backupInfo) {
            this.lastBackup = JSON.parse(backupInfo);
        }
    },
    
    createBackup() {
        biDashboard.showNotification('info', '백업을 생성하는 중...');
        
        const backupData = {
            timestamp: new Date().toISOString(),
            courses: coursesData,
            orders: ordersData,
            users: sampleUsers || [],
            quotes: JSON.parse(localStorage.getItem('quoteHistory') || '[]'),
            settings: {
                theme: localStorage.getItem('theme'),
                dashboardWidgets: localStorage.getItem('dashboardWidgets')
            }
        };
        
        setTimeout(() => {
            // 백업 파일 생성
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `kgpt_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            // 백업 정보 저장
            this.lastBackup = {
                timestamp: backupData.timestamp,
                size: blob.size
            };
            localStorage.setItem('lastBackup', JSON.stringify(this.lastBackup));
            
            biDashboard.showNotification('success', '백업이 성공적으로 생성되었습니다.');
        }, 1500);
    },
    
    restoreBackup(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                if (confirm('백업을 복원하시겠습니까? 현재 데이터가 모두 대체됩니다.')) {
                    // 데이터 복원
                    if (backupData.courses) coursesData = backupData.courses;
                    if (backupData.orders) ordersData = backupData.orders;
                    if (backupData.quotes) localStorage.setItem('quoteHistory', JSON.stringify(backupData.quotes));
                    if (backupData.settings) {
                        Object.entries(backupData.settings).forEach(([key, value]) => {
                            if (value) localStorage.setItem(key, value);
                        });
                    }
                    
                    biDashboard.showNotification('success', '백업이 성공적으로 복원되었습니다. 페이지를 새로고침하겠습니다.');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } catch (error) {
                biDashboard.showNotification('error', '백업 파일이 손상되었거나 올바르지 않습니다.');
            }
        };
        reader.readAsText(file);
    },
    
    scheduleAutoBackup() {
        // 24시간마다 자동 백업 알림
        setInterval(() => {
            if (!this.lastBackup || (Date.now() - new Date(this.lastBackup.timestamp).getTime()) > 24 * 60 * 60 * 1000) {
                biDashboard.showNotification('info', '자동 백업 시간입니다. 데이터를 백업하시겠습니까?');
            }
        }, 60 * 60 * 1000); // 1시간마다 체크
    }
};

// 초기화 함수들 추가
function initializeAdvancedFeatures() {
    scheduleManager.init();
    systemMonitor.init();
    backupManager.init();
}

// 버튼 핸들러 함수들
function createSystemBackup() {
    backupManager.createBackup();
}

function uploadBackupFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            backupManager.restoreBackup(file);
        }
    };
    input.click();
}

function viewSystemLogs() {
    const logs = [
        { time: '2024-01-15 14:30:25', level: 'INFO', message: '사용자 로그인: admin@koreangpt.org' },
        { time: '2024-01-15 14:25:12', level: 'INFO', message: '새로운 견적 요청 접수: Q001' },
        { time: '2024-01-15 14:20:05', level: 'WARNING', message: '저장소 용량 85% 도달' },
        { time: '2024-01-15 14:15:33', level: 'INFO', message: '대시보드 데이터 업데이트 완료' },
        { time: '2024-01-15 14:10:18', level: 'ERROR', message: '이메일 발송 실패: SMTP 연결 오류' }
    ];
    
    const logHtml = logs.map(log => 
        `<div class="log-entry ${log.level.toLowerCase()}">
            <span class="log-time">${log.time}</span>
            <span class="log-level">${log.level}</span>
            <span class="log-message">${log.message}</span>
        </div>`
    ).join('');
    
    const popup = window.open('', 'logs', 'width=800,height=600');
    popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>시스템 로그</title>
            <style>
                body { font-family: monospace; margin: 20px; }
                .log-entry { padding: 8px; border-bottom: 1px solid #eee; }
                .log-time { color: #666; margin-right: 10px; }
                .log-level { font-weight: bold; margin-right: 10px; }
                .info { color: #0066cc; }
                .warning { color: #ff6600; }
                .error { color: #cc0000; }
            </style>
        </head>
        <body>
            <h2>시스템 로그</h2>
            ${logHtml}
        </body>
        </html>
    `);
}

// 테마 관리
const themeManager = {
    init() {
        // 저장된 테마 로드
        const savedTheme = localStorage.getItem('admin-theme') || 'light';
        this.setTheme(savedTheme);
        
        // 테마 토글 버튼 이벤트
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }
    },
    
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('admin-theme', theme);
        
        // 버튼 텍스트와 아이콘 업데이트
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

// 현재 사용자 확인 함수
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// 메인 초기화에 추가 기능 포함
document.addEventListener('DOMContentLoaded', function() {    
    // 인증 확인
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('관리자 권한이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = 'login.html';
        return;
    }

    // 관리자 정보 표시
    const adminUserSpan = document.querySelector('.admin-user span');
    if (adminUserSpan) {
        adminUserSpan.textContent = `${currentUser.name} 관리자`;
    }
    
    // 테마 관리 초기화
    themeManager.init();
    
    // 기존 초기화
    setupNavigation();
    setupDropdown();
    setupCourseManagement();
    setupOrderManagement();
    updateDashboardStats();
    setupModals();
    
    // 새로운 BI 시스템 초기화
    biDashboard.init();
    contentManagement.init();
    userAnalytics.init();
    performanceMonitor.init();
    
    // 고급 기능 초기화
    initializeAdvancedFeatures();
    
    console.log('고급 BI 대시보드 초기화 완료');
});

// 통합 검색 기능
function setupUnifiedSearch() {
    const searchInput = document.getElementById('unifiedSearch');
    const searchFilters = document.getElementById('searchFilters');
    const resultsContent = document.getElementById('resultsContent');
    const resultsCount = document.getElementById('resultsCount');
    
    let searchTimeout;
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    }
    
    // 필터 토글
    window.toggleSearchFilters = function() {
        if (searchFilters) {
            searchFilters.style.display = searchFilters.style.display === 'none' ? 'block' : 'none';
        }
    };
    
    // 검색 실행
    function performSearch(query) {
        if (!query.trim()) {
            showNoResults();
            return;
        }
        
        // 실제 구현에서는 API 호출
        const mockResults = generateMockSearchResults(query);
        displaySearchResults(mockResults);
    }
    
    function generateMockSearchResults(query) {
        const results = [];
        
        // 회원 검색 결과
        if (query.includes('김') || query.includes('이') || query.includes('박')) {
            results.push({
                type: 'members',
                title: `${query}지은`,
                subtitle: 'VIP 고객 • 가입일: 2023-05-15',
                data: '총 구매액: ₩450,000 • 구매 강의: 3개'
            });
        }
        
        // 강의 검색 결과
        if (query.includes('GPT') || query.includes('AI') || query.includes('프롬프트')) {
            results.push({
                type: 'courses',
                title: 'GPT 프롬프트 마스터 과정',
                subtitle: '프롬프트 엔지니어링 • 활성',
                data: '수강생: 342명 • 평점: 4.8/5.0'
            });
        }
        
        // 주문 검색 결과
        if (query.includes('주문') || query.includes('결제')) {
            results.push({
                type: 'orders',
                title: '주문 #ORD-001',
                subtitle: '김지은 • 2024-01-15',
                data: 'GPT 프롬프트 마스터 과정 • ₩149,000'
            });
        }
        
        return results;
    }
    
    function displaySearchResults(results) {
        if (resultsCount) {
            resultsCount.textContent = results.length;
        }
        
        if (!resultsContent) return;
        
        if (results.length === 0) {
            showNoResults();
            return;
        }
        
        const html = results.map(result => `
            <div class="search-result-item" data-type="${result.type}">
                <div class="result-header">
                    <h4>${result.title}</h4>
                    <span class="result-type">${getResultTypeLabel(result.type)}</span>
                </div>
                <p class="result-subtitle">${result.subtitle}</p>
                <p class="result-data">${result.data}</p>
            </div>
        `).join('');
        
        resultsContent.innerHTML = html;
    }
    
    function showNoResults() {
        if (resultsContent) {
            resultsContent.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>검색 결과가 없습니다</p>
                </div>
            `;
        }
        if (resultsCount) {
            resultsCount.textContent = '0';
        }
    }
    
    function getResultTypeLabel(type) {
        const labels = {
            'members': '회원',
            'courses': '강의',
            'orders': '주문',
            'tickets': '티켓',
            'reviews': '후기'
        };
        return labels[type] || type;
    }
    
    // 검색 기록 지우기
    window.clearSearchHistory = function() {
        const historyContainer = document.getElementById('searchHistory');
        if (historyContainer) {
            historyContainer.innerHTML = '<p style="color: var(--admin-text-secondary); font-size: 0.875rem;">검색 기록이 없습니다.</p>';
        }
    };
}

// 인라인 편집 기능
function setupInlineEditing() {
    // 텍스트 편집
    window.enableInlineEdit = function(element) {
        if (element.classList.contains('editing')) return;
        
        const originalText = element.textContent.trim();
        element.classList.add('editing');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.style.width = '100%';
        input.style.border = 'none';
        input.style.background = 'transparent';
        input.style.font = 'inherit';
        input.style.color = 'inherit';
        input.style.outline = 'none';
        
        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();
        
        function saveEdit() {
            const newText = input.value.trim();
            element.classList.remove('editing');
            element.textContent = newText || originalText;
            
            // 변경사항 저장 (실제 구현에서는 API 호출)
            saveContentChange(element.dataset.field, newText);
            addToChangesList(element.dataset.field, originalText, newText);
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                element.classList.remove('editing');
                element.textContent = originalText;
            }
        });
    };
    
    // 이미지 업로드
    window.openImageUpload = function(element) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = element.querySelector('img');
                    if (img) {
                        img.src = e.target.result;
                        saveContentChange(element.dataset.field, e.target.result);
                        addToChangesList(element.dataset.field, img.src, e.target.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };
    
    function saveContentChange(field, value) {
        // 실제 구현에서는 서버에 저장
        console.log(`Saving ${field}: ${value}`);
    }
    
    function addToChangesList(field, oldValue, newValue) {
        const changesList = document.getElementById('changesList');
        if (!changesList) return;
        
        const changeItem = document.createElement('div');
        changeItem.className = 'change-item';
        changeItem.innerHTML = `
            <div class="change-info">
                <strong>${field}</strong>
                <div class="change-details">
                    <span class="old-value">이전: ${oldValue.substring(0, 50)}...</span>
                    <span class="new-value">새값: ${newValue.substring(0, 50)}...</span>
                </div>
            </div>
            <div class="change-actions">
                <button class="btn btn-sm btn-secondary" onclick="revertChange(this)">되돌리기</button>
            </div>
        `;
        
        changesList.appendChild(changeItem);
    }
    
    window.revertChange = function(button) {
        button.closest('.change-item').remove();
    };
    
    window.previewChanges = function() {
        alert('변경사항 미리보기 기능이 구현됩니다.');
    };
    
    window.publishChanges = function() {
        const changesList = document.getElementById('changesList');
        if (changesList) {
            changesList.innerHTML = '<p style="color: var(--admin-text-secondary);">적용할 변경사항이 없습니다.</p>';
        }
        showNotification('변경사항이 성공적으로 적용되었습니다.', 'success');
    };
}

// 파일 업로드 시스템
function setupFileUpload() {
    const dropzone = document.getElementById('mediaDropzone');
    const fileInput = document.getElementById('fileInput');
    
    if (dropzone) {
        // 드래그 앤 드롭 이벤트
        dropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        dropzone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        dropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            handleFileUpload(files);
        });
        
        dropzone.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            handleFileUpload(files);
        });
    }
    
    function handleFileUpload(files) {
        const progressContainer = document.getElementById('uploadProgress');
        const progressList = document.getElementById('progressList');
        
        if (progressContainer) progressContainer.style.display = 'block';
        
        files.forEach((file, index) => {
            const progressItem = createProgressItem(file);
            if (progressList) progressList.appendChild(progressItem);
            
            // 실제 업로드 시뮬레이션
            simulateUpload(file, progressItem);
        });
    }
    
    function createProgressItem(file) {
        const item = document.createElement('div');
        item.className = 'progress-item';
        item.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-percentage">0%</div>
        `;
        return item;
    }
    
    function simulateUpload(file, progressItem) {
        let progress = 0;
        const progressFill = progressItem.querySelector('.progress-fill');
        const progressPercentage = progressItem.querySelector('.progress-percentage');
        
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // 업로드 완료 후 미디어 그리드에 추가
                addToMediaGrid(file);
            }
            
            if (progressFill) progressFill.style.width = progress + '%';
            if (progressPercentage) progressPercentage.textContent = Math.round(progress) + '%';
        }, 200);
    }
    
    function addToMediaGrid(file) {
        const mediaGrid = document.getElementById('mediaGrid');
        if (!mediaGrid) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.innerHTML = `
                <div class="media-thumbnail">
                    <img src="${e.target.result}" alt="${file.name}">
                </div>
                <div class="media-info">
                    <div class="media-name">${file.name}</div>
                    <div class="media-size">${formatFileSize(file.size)}</div>
                </div>
                <div class="media-actions">
                    <button class="btn btn-sm btn-outline" onclick="showMediaInfo(this)">정보</button>
                    <button class="btn btn-sm btn-outline" onclick="deleteMedia(this)">삭제</button>
                </div>
            `;
            
            mediaGrid.appendChild(mediaItem);
        };
        
        reader.readAsDataURL(file);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    window.selectFiles = function() {
        if (fileInput) fileInput.click();
    };
    
    window.cancelUpload = function() {
        const progressContainer = document.getElementById('uploadProgress');
        if (progressContainer) progressContainer.style.display = 'none';
    };
}

// 고객 관리 시스템
function setupCustomerManagement() {
    // 고객 세그먼트 보기
    window.viewSegment = function(segmentType) {
        console.log('고객 세그먼트 보기:', segmentType);
        // 실제 구현에서는 필터링된 고객 목록 표시
    };
    
    // 고객 추가
    window.addCustomer = function() {
        console.log('새 고객 추가');
        // 실제 구현에서는 고객 추가 모달 표시
    };
    
    // 고객 데이터 내보내기
    window.exportCustomers = function() {
        console.log('고객 데이터 내보내기');
        showNotification('고객 데이터를 내보내는 중...', 'info');
    };
    
    // 고객 테이블 데이터 로드
    loadCustomersData();
}

function loadCustomersData() {
    const customersTable = document.getElementById('customersTable');
    if (!customersTable) return;
    
    const tbody = customersTable.querySelector('tbody');
    if (!tbody) return;
    
    // 샘플 고객 데이터
    const customers = [
        {
            name: '김지은',
            email: 'jieun@example.com',
            segment: 'VIP',
            joinDate: '2023-05-15',
            lastActivity: '2024-01-20',
            purchaseCount: 3,
            totalAmount: 450000,
            status: 'active'
        },
        {
            name: '이준호',
            email: 'junho@example.com',
            segment: '단골',
            joinDate: '2023-08-22',
            lastActivity: '2024-01-18',
            purchaseCount: 2,
            totalAmount: 320000,
            status: 'active'
        },
        {
            name: '박민정',
            email: 'minjung@example.com',
            segment: '일반',
            joinDate: '2023-11-10',
            lastActivity: '2024-01-15',
            purchaseCount: 1,
            totalAmount: 179000,
            status: 'inactive'
        }
    ];
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>
                <div class="customer-info">
                    <div class="customer-name">${customer.name}</div>
                    <div class="customer-email">${customer.email}</div>
                </div>
            </td>
            <td><span class="segment-badge ${customer.segment.toLowerCase()}">${customer.segment}</span></td>
            <td>${customer.joinDate}</td>
            <td>${customer.lastActivity}</td>
            <td>${customer.purchaseCount}회</td>
            <td>₩${customer.totalAmount.toLocaleString()}</td>
            <td><span class="status-badge ${customer.status}">${customer.status === 'active' ? '활성' : '비활성'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit" onclick="editCustomer('${customer.email}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteCustomer('${customer.email}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 지원 시스템
function setupSupportSystem() {
    // 새 티켓 생성
    window.createNewTicket = function() {
        console.log('새 티켓 생성');
    };
    
    // 지식베이스 열기
    window.openKnowledgeBase = function() {
        console.log('지식베이스 열기');
    };
    
    // 채널 설정
    window.configureChannel = function(channelType) {
        console.log('채널 설정:', channelType);
    };
    
    // 실시간 지원 활동 로드
    loadSupportActivity();
}

function loadSupportActivity() {
    const activityFeed = document.getElementById('supportActivityFeed');
    if (!activityFeed) return;
    
    const activities = [
        {
            type: 'ticket_created',
            user: '김지은',
            message: '새 티켓을 생성했습니다: "로그인 문제"',
            time: '5분 전'
        },
        {
            type: 'ticket_resolved',
            user: '관리자1',
            message: '티켓 #T-001을 해결했습니다',
            time: '15분 전'
        },
        {
            type: 'chat_started',
            user: '이준호',
            message: '라이브 채팅을 시작했습니다',
            time: '23분 전'
        }
    ];
    
    activityFeed.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-avatar">${activity.user[0]}</div>
            <div class="activity-content">
                <p><strong>${activity.user}</strong> ${activity.message}</p>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// 티켓 관리
function setupTicketManagement() {
    // 새 티켓 생성
    window.createTicket = function() {
        console.log('새 티켓 생성');
    };
    
    // 티켓 내보내기
    window.exportTickets = function() {
        console.log('티켓 내보내기');
    };
    
    // 티켓 보드 로드
    loadTicketBoard();
}

function loadTicketBoard() {
    const columns = ['newTickets', 'inProgressTickets', 'pendingTickets', 'resolvedTickets'];
    const ticketData = {
        newTickets: [
            { id: 'T-008', title: '로그인 문제', customer: '김지은', priority: 'high' },
            { id: 'T-009', title: '결제 오류', customer: '이준호', priority: 'medium' }
        ],
        inProgressTickets: [
            { id: 'T-005', title: '강의 접근 불가', customer: '박민정', priority: 'high' },
            { id: 'T-006', title: '이메일 수신 문제', customer: '최영수', priority: 'low' }
        ],
        pendingTickets: [
            { id: 'T-007', title: '환불 요청', customer: '정미경', priority: 'medium' }
        ],
        resolvedTickets: [
            { id: 'T-001', title: '비밀번호 재설정', customer: '김지은', priority: 'low' }
        ]
    };
    
    columns.forEach(columnId => {
        const column = document.getElementById(columnId);
        if (!column) return;
        
        const tickets = ticketData[columnId] || [];
        column.innerHTML = tickets.map(ticket => `
            <div class="ticket-card" data-ticket-id="${ticket.id}">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-priority priority-${ticket.priority}">${ticket.priority}</span>
                </div>
                <div class="ticket-title">${ticket.title}</div>
                <div class="ticket-customer">${ticket.customer}</div>
            </div>
        `).join('');
    });
}

// 콘텐츠 관리
function setupContentManagement() {
    // 페이지 탭 전환
    const pageTabs = document.querySelectorAll('.page-tab');
    const pageContents = document.querySelectorAll('.page-content');
    
    pageTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPage = this.dataset.page;
            
            // 탭 활성화
            pageTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 콘텐츠 표시
            pageContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetPage + 'Content') {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 일괄 편집 모드
    window.enableBulkEdit = function() {
        console.log('일괄 편집 모드 활성화');
        document.body.classList.add('bulk-edit-mode');
    };
    
    // 사이트 미리보기
    window.previewSite = function() {
        window.open('index.html', '_blank');
    };
}

// 미디어 라이브러리
function setupMediaLibrary() {
    // 폴더 생성
    window.createFolder = function() {
        const folderName = prompt('폴더 이름을 입력하세요:');
        if (folderName) {
            console.log('폴더 생성:', folderName);
        }
    };
    
    window.openFileUpload = function() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.click();
    };
    
    // 상위 폴더로 이동
    window.goUpFolder = function() {
        console.log('상위 폴더로 이동');
    };
    
    // 미디어 정보 표시
    window.showMediaInfo = function(button) {
        const mediaItem = button.closest('.media-item');
        const mediaName = mediaItem.querySelector('.media-name').textContent;
        console.log('미디어 정보 표시:', mediaName);
    };
    
    // 미디어 삭제
    window.deleteMedia = function(button) {
        if (confirm('이 파일을 삭제하시겠습니까?')) {
            button.closest('.media-item').remove();
            showNotification('파일이 삭제되었습니다.', 'success');
        }
    };
    
    // 미디어 정보 패널 닫기
    window.closeMediaInfo = function() {
        const panel = document.getElementById('mediaInfoPanel');
        if (panel) panel.style.display = 'none';
    };
}

// 추가 기능들
window.generateReport = function() {
    showNotification('분석 리포트를 생성하는 중...', 'info');
};

window.scheduleReport = function() {
    console.log('자동 리포트 설정');
};

window.generateCustomReport = function() {
    showNotification('사용자 정의 리포트를 생성하는 중...', 'info');
};

window.saveReportTemplate = function() {
    showNotification('리포트 템플릿이 저장되었습니다.', 'success');
};

// 알림 시스템
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 스타일 추가
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--admin-bg-primary);
        border: 1px solid var(--admin-border-color);
        border-radius: 8px;
        padding: 1rem;
        box-shadow: var(--admin-shadow-lg);
        z-index: 10000;
        min-width: 300px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;
    
    document.body.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

console.log('관리자 대시보드 스크립트 로드 완료');