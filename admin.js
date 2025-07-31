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
    const modal = document.getElementById('courseModal');
    const closeBtn = modal?.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelBtn');
    const courseForm = document.getElementById('courseForm');
    
    // 모달 닫기
    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                closeCourseModal();
            });
        }
    });
    
    // 모달 외부 클릭 시 닫기
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCourseModal();
            }
        });
    }
    
    // 폼 제출
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

console.log('관리자 대시보드 스크립트 로드 완료');