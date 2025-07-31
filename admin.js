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

console.log('관리자 대시보드 스크립트 로드 완료');