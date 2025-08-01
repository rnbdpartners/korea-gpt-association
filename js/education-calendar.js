// 교육 관리 캘린더 시스템

class EducationCalendar {
    constructor() {
        this.calendar = null;
        this.currentView = 'month';
        this.selectedFilters = {
            instructors: [],
            courses: ['all'],
            status: ['all']
        };
        this.events = [];
        this.instructors = [];
        this.curriculums = [];
        this.venues = [];
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.initCalendar();
        this.initEventListeners();
        this.initDateTimePickers();
    }
    
    // 데이터 로드
    loadData() {
        // localStorage에서 데이터 로드
        this.events = JSON.parse(localStorage.getItem('educationEvents') || '[]');
        this.instructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        this.curriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');
        this.venues = JSON.parse(localStorage.getItem('venues') || '[]');
        
        // 기본 데이터가 없으면 샘플 데이터 생성
        if (this.instructors.length === 0) {
            this.createSampleData();
        }
        
        this.updateInstructorFilters();
    }
    
    // 샘플 데이터 생성
    createSampleData() {
        // 샘플 강사
        this.instructors = [
            {
                id: 1,
                name: '김철수',
                email: 'kim@example.com',
                phone: '010-1234-5678',
                specialty: ['ChatGPT', 'AI 자동화'],
                experienceYears: 5,
                rating: 4.8,
                hourlyRate: 150000,
                color: '#2196F3',
                availableDays: ['월', '화', '수', '목', '금'],
                status: 'active'
            },
            {
                id: 2,
                name: '이영희',
                email: 'lee@example.com',
                phone: '010-2345-6789',
                specialty: ['프롬프트 엔지니어링', 'AI 비즈니스'],
                experienceYears: 3,
                rating: 4.9,
                hourlyRate: 120000,
                color: '#4CAF50',
                availableDays: ['화', '목', '금'],
                status: 'active'
            },
            {
                id: 3,
                name: '박민수',
                email: 'park@example.com',
                phone: '010-3456-7890',
                specialty: ['AI 기초', 'ChatGPT'],
                experienceYears: 2,
                rating: 4.7,
                hourlyRate: 100000,
                color: '#FF9800',
                availableDays: ['월', '수', '금'],
                status: 'active'
            }
        ];
        
        // 샘플 커리큘럼
        this.curriculums = [
            {
                id: 1,
                code: 'GPT-101',
                name: 'ChatGPT 기초 과정',
                category: 'basic',
                durationHours: 8,
                modules: [
                    'AI와 ChatGPT 소개',
                    '프롬프트 작성 기초',
                    '실습: 업무 활용 사례',
                    'Q&A 및 마무리'
                ],
                maxParticipants: 30,
                basePrice: 200000
            },
            {
                id: 2,
                code: 'GPT-201',
                name: '업무 자동화 과정',
                category: 'intermediate',
                durationHours: 16,
                modules: [
                    'ChatGPT API 활용',
                    '업무 자동화 설계',
                    '실전 프로젝트',
                    '성과 측정 및 개선'
                ],
                maxParticipants: 20,
                basePrice: 350000
            },
            {
                id: 3,
                code: 'GPT-301',
                name: 'AI 전문가 과정',
                category: 'advanced',
                durationHours: 24,
                modules: [
                    '고급 프롬프트 엔지니어링',
                    'AI 모델 이해와 활용',
                    '비즈니스 전략 수립',
                    '팀 교육 및 리더십'
                ],
                maxParticipants: 15,
                basePrice: 500000
            }
        ];
        
        // 샘플 이벤트
        const today = new Date();
        this.events = [
            {
                id: 1,
                title: 'ChatGPT 기초 과정 - 삼성전자',
                instructorId: 1,
                curriculumId: 1,
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9, 0).toISOString(),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 0).toISOString(),
                color: '#2196F3',
                locationType: 'offline',
                location: '서울 강남구 테헤란로 123',
                currentParticipants: 25,
                maxParticipants: 30,
                status: 'scheduled'
            },
            {
                id: 2,
                title: '업무 자동화 과정 - LG CNS',
                instructorId: 2,
                curriculumId: 2,
                start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 9, 0).toISOString(),
                end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 18, 0).toISOString(),
                color: '#4CAF50',
                locationType: 'online',
                location: 'https://zoom.us/j/123456789',
                currentParticipants: 18,
                maxParticipants: 20,
                status: 'scheduled'
            }
        ];
        
        // 로컬 스토리지에 저장
        this.saveData();
    }
    
    // 데이터 저장
    saveData() {
        localStorage.setItem('educationEvents', JSON.stringify(this.events));
        localStorage.setItem('instructors', JSON.stringify(this.instructors));
        localStorage.setItem('curriculums', JSON.stringify(this.curriculums));
        localStorage.setItem('venues', JSON.stringify(this.venues));
    }
    
    // 캘린더 초기화
    initCalendar() {
        const calendarEl = document.getElementById('calendar');
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ko',
            height: '100%',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },
            editable: true,
            droppable: true,
            eventStartEditable: true,
            eventDurationEditable: true,
            eventResizableFromStart: true,
            
            // 이벤트 소스
            events: this.getFilteredEvents(),
            
            // 이벤트 렌더링
            eventContent: (arg) => {
                const instructor = this.getInstructorById(arg.event.extendedProps.instructorId);
                return {
                    html: `
                        <div class="fc-event-main">
                            <div class="fc-event-time">${arg.timeText}</div>
                            <div class="fc-event-title">${arg.event.title}</div>
                            <div class="fc-event-meta">${instructor ? instructor.name : ''}</div>
                        </div>
                    `
                };
            },
            
            // 이벤트 클릭
            eventClick: (info) => {
                this.showEventDetails(info.event);
            },
            
            // 이벤트 드래그 완료
            eventDrop: (info) => {
                this.updateEvent(info.event);
                this.showNotification('일정이 이동되었습니다.', 'success');
            },
            
            // 이벤트 리사이즈 완료
            eventResize: (info) => {
                this.updateEvent(info.event);
                this.showNotification('일정 시간이 변경되었습니다.', 'success');
            },
            
            // 날짜 클릭
            dateClick: (info) => {
                this.quickAddClass(info.date);
            },
            
            // 외부 이벤트 드롭
            drop: (info) => {
                if (info.draggedEl.dataset.instructorId) {
                    this.createEventFromDrop(info);
                }
            }
        });
        
        this.calendar.render();
    }
    
    // 필터된 이벤트 가져오기
    getFilteredEvents() {
        return this.events.filter(event => {
            // 강사 필터
            if (this.selectedFilters.instructors.length > 0 && 
                !this.selectedFilters.instructors.includes(event.instructorId)) {
                return false;
            }
            
            // 과정 필터
            if (!this.selectedFilters.courses.includes('all')) {
                const curriculum = this.getCurriculumById(event.curriculumId);
                if (!curriculum || !this.selectedFilters.courses.includes(curriculum.category)) {
                    return false;
                }
            }
            
            // 상태 필터
            if (!this.selectedFilters.status.includes('all') && 
                !this.selectedFilters.status.includes(event.status)) {
                return false;
            }
            
            return true;
        });
    }
    
    // 이벤트 리스너 초기화
    initEventListeners() {
        // 네비게이션 메뉴
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(item.dataset.view);
            });
        });
        
        // 뷰 토글
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.changeCalendarView(btn.dataset.view);
            });
        });
        
        // 필터
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                this.toggleFilter(tag);
            });
        });
        
        // 폼 제출
        document.getElementById('newClassForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewClass(e.target);
        });
        
        document.getElementById('newInstructorForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewInstructor(e.target);
        });
        
        // 모달 외부 클릭 시 닫기
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }
    
    // DateTime Picker 초기화
    initDateTimePickers() {
        flatpickr.localize(flatpickr.l10ns.ko);
        
        document.querySelectorAll('.datetime-picker').forEach(input => {
            flatpickr(input, {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true,
                locale: "ko"
            });
        });
    }
    
    // 뷰 전환
    switchView(view) {
        // 네비게이션 활성화 상태 변경
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });
        
        // 뷰 컨테이너 표시/숨김
        document.querySelectorAll('.view-container').forEach(container => {
            container.style.display = 'none';
        });
        
        const viewContainer = document.getElementById(`${view}View`);
        if (viewContainer) {
            viewContainer.style.display = 'block';
            
            // 뷰별 초기화
            switch(view) {
                case 'instructors':
                    this.loadInstructorsView();
                    break;
                case 'curriculum':
                    this.loadCurriculumView();
                    break;
                case 'students':
                    this.loadStudentsView();
                    break;
                case 'venues':
                    this.loadVenuesView();
                    break;
                case 'reports':
                    this.loadReportsView();
                    break;
            }
        }
    }
    
    // 캘린더 뷰 변경
    changeCalendarView(view) {
        const viewMap = {
            'month': 'dayGridMonth',
            'week': 'timeGridWeek',
            'day': 'timeGridDay',
            'list': 'listWeek'
        };
        
        this.calendar.changeView(viewMap[view]);
        
        // 버튼 활성화 상태 변경
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }
    
    // 필터 토글
    toggleFilter(tag) {
        const filterType = tag.parentElement.id.replace('Filters', '');
        const filterValue = tag.dataset.filter;
        
        if (filterValue === 'all') {
            // 전체 선택
            tag.parentElement.querySelectorAll('.filter-tag').forEach(t => {
                t.classList.toggle('active', t === tag);
            });
            this.selectedFilters[filterType] = ['all'];
        } else {
            // 개별 선택
            tag.classList.toggle('active');
            const allTag = tag.parentElement.querySelector('[data-filter="all"]');
            if (allTag) allTag.classList.remove('active');
            
            // 필터 업데이트
            if (tag.classList.contains('active')) {
                const index = this.selectedFilters[filterType].indexOf('all');
                if (index > -1) {
                    this.selectedFilters[filterType].splice(index, 1);
                }
                this.selectedFilters[filterType].push(filterValue);
            } else {
                const index = this.selectedFilters[filterType].indexOf(filterValue);
                if (index > -1) {
                    this.selectedFilters[filterType].splice(index, 1);
                }
                if (this.selectedFilters[filterType].length === 0) {
                    this.selectedFilters[filterType] = ['all'];
                    allTag.classList.add('active');
                }
            }
        }
        
        // 캘린더 업데이트
        this.updateCalendarEvents();
    }
    
    // 캘린더 이벤트 업데이트
    updateCalendarEvents() {
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(this.getFilteredEvents());
    }
    
    // 강사 필터 업데이트
    updateInstructorFilters() {
        const container = document.getElementById('instructorFilters');
        if (!container) return;
        
        container.innerHTML = `
            <span class="filter-tag active" data-filter="all">전체</span>
            ${this.instructors.map(instructor => `
                <span class="filter-tag" data-filter="${instructor.id}" 
                      style="--color: ${instructor.color}">
                    ${instructor.name}
                </span>
            `).join('')}
        `;
        
        // 이벤트 리스너 재등록
        container.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', () => this.toggleFilter(tag));
        });
    }
    
    // 오늘의 일정 업데이트
    updateTodaySchedule() {
        const container = document.getElementById('todaySchedule');
        if (!container) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayEvents = this.events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= today && eventDate < tomorrow;
        }).sort((a, b) => new Date(a.start) - new Date(b.start));
        
        if (todayEvents.length === 0) {
            container.innerHTML = '<p class="no-schedule">오늘 예정된 일정이 없습니다.</p>';
            return;
        }
        
        container.innerHTML = todayEvents.map(event => {
            const instructor = this.getInstructorById(event.instructorId);
            const startTime = new Date(event.start).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const endTime = new Date(event.end).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            return `
                <div class="schedule-item" onclick="educationCalendar.showEventDetails('${event.id}')">
                    <div class="schedule-time">${startTime} - ${endTime}</div>
                    <div class="schedule-title">${event.title}</div>
                    <div class="schedule-meta">
                        <i class="fas fa-user"></i> ${instructor?.name || ''}
                        <i class="fas fa-users"></i> ${event.currentParticipants}/${event.maxParticipants}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 빠른 강의 추가
    quickAddClass(date = new Date()) {
        // 날짜 설정
        const startDate = date.toISOString().slice(0, 16);
        const endDate = new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16);
        
        // 폼 초기화
        const form = document.getElementById('newClassForm');
        if (form) {
            form.reset();
            form.startDateTime.value = startDate;
            form.endDateTime.value = endDate;
            
            // 셀렉트 옵션 업데이트
            this.updateFormSelects(form);
        }
        
        this.openModal('newClassModal');
    }
    
    // 폼 셀렉트 업데이트
    updateFormSelects(form) {
        // 커리큘럼 옵션
        const curriculumSelect = form.querySelector('select[name="curriculum"]');
        if (curriculumSelect) {
            curriculumSelect.innerHTML = `
                <option value="">선택하세요</option>
                ${this.curriculums.map(c => `
                    <option value="${c.id}">${c.name} (${c.code})</option>
                `).join('')}
            `;
        }
        
        // 강사 옵션
        const instructorSelect = form.querySelector('select[name="instructor"]');
        if (instructorSelect) {
            instructorSelect.innerHTML = `
                <option value="">선택하세요</option>
                ${this.instructors.filter(i => i.status === 'active').map(i => `
                    <option value="${i.id}">${i.name}</option>
                `).join('')}
            `;
        }
    }
    
    // 새 강의 처리
    handleNewClass(form) {
        const formData = new FormData(form);
        
        const newEvent = {
            id: Date.now(),
            title: formData.get('title'),
            curriculumId: parseInt(formData.get('curriculum')),
            instructorId: parseInt(formData.get('instructor')),
            start: new Date(formData.get('startDateTime')).toISOString(),
            end: new Date(formData.get('endDateTime')).toISOString(),
            locationType: formData.get('locationType'),
            location: formData.get('location'),
            maxParticipants: parseInt(formData.get('maxParticipants')),
            currentParticipants: 0,
            color: formData.get('color'),
            notes: formData.get('notes'),
            status: 'scheduled'
        };
        
        // 이벤트 추가
        this.events.push(newEvent);
        this.saveData();
        
        // 캘린더에 추가
        this.calendar.addEvent({
            ...newEvent,
            extendedProps: {
                instructorId: newEvent.instructorId,
                curriculumId: newEvent.curriculumId,
                locationType: newEvent.locationType,
                location: newEvent.location,
                currentParticipants: newEvent.currentParticipants,
                maxParticipants: newEvent.maxParticipants,
                status: newEvent.status
            }
        });
        
        // 오늘 일정 업데이트
        this.updateTodaySchedule();
        
        // 모달 닫기
        this.closeModal('newClassModal');
        this.showNotification('새 강의가 추가되었습니다.', 'success');
        
        // 실시간 동기화 트리거
        this.triggerSync('event_added', newEvent);
    }
    
    // 이벤트 업데이트
    updateEvent(calendarEvent) {
        const eventId = parseInt(calendarEvent.id);
        const eventIndex = this.events.findIndex(e => e.id === eventId);
        
        if (eventIndex > -1) {
            this.events[eventIndex] = {
                ...this.events[eventIndex],
                start: calendarEvent.start.toISOString(),
                end: calendarEvent.end.toISOString()
            };
            this.saveData();
            this.updateTodaySchedule();
            
            // 실시간 동기화 트리거
            this.triggerSync('event_updated', this.events[eventIndex]);
        }
    }
    
    // 이벤트 상세 표시
    showEventDetails(eventIdOrObj) {
        let event;
        if (typeof eventIdOrObj === 'string' || typeof eventIdOrObj === 'number') {
            event = this.events.find(e => e.id == eventIdOrObj);
        } else {
            const eventId = parseInt(eventIdOrObj.id);
            event = this.events.find(e => e.id === eventId);
        }
        
        if (!event) return;
        
        const instructor = this.getInstructorById(event.instructorId);
        const curriculum = this.getCurriculumById(event.curriculumId);
        
        const content = document.getElementById('classDetailContent');
        content.innerHTML = `
            <div class="event-detail">
                <div class="detail-header">
                    <h2>${event.title}</h2>
                    <span class="status-badge status-${event.status}">${this.getStatusText(event.status)}</span>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-section">
                        <h4>일정 정보</h4>
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${this.formatDate(event.start)} - ${this.formatDate(event.end)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${this.formatTime(event.start)} - ${this.formatTime(event.end)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.locationType === 'online' ? '온라인' : event.location}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>강사 정보</h4>
                        <div class="detail-item">
                            <i class="fas fa-user"></i>
                            <span>${instructor?.name || ''}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-envelope"></i>
                            <span>${instructor?.email || ''}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-phone"></i>
                            <span>${instructor?.phone || ''}</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>수강 정보</h4>
                        <div class="detail-item">
                            <i class="fas fa-book"></i>
                            <span>${curriculum?.name || ''}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span>수강생: ${event.currentParticipants} / ${event.maxParticipants}명</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-won-sign"></i>
                            <span>${this.formatPrice(curriculum?.basePrice || 0)} / 인</span>
                        </div>
                    </div>
                </div>
                
                ${event.notes ? `
                    <div class="detail-notes">
                        <h4>메모</h4>
                        <p>${event.notes}</p>
                    </div>
                ` : ''}
                
                <div class="detail-actions">
                    <button class="btn-secondary" onclick="educationCalendar.editEvent(${event.id})">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button class="btn-secondary" onclick="educationCalendar.duplicateEvent(${event.id})">
                        <i class="fas fa-copy"></i> 복제
                    </button>
                    <button class="btn-secondary danger" onclick="educationCalendar.deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
                
                <div class="enrollment-section">
                    <h4>수강생 목록</h4>
                    <div class="enrollment-list">
                        <!-- 수강생 목록은 별도 구현 -->
                        <p class="no-data">등록된 수강생이 없습니다.</p>
                    </div>
                </div>
            </div>
        `;
        
        this.openModal('classDetailModal');
    }
    
    // 모달 열기/닫기
    openModal(modalId) {
        document.getElementById(modalId)?.classList.add('show');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId)?.classList.remove('show');
    }
    
    // 유틸리티 함수들
    getInstructorById(id) {
        return this.instructors.find(i => i.id === id);
    }
    
    getCurriculumById(id) {
        return this.curriculums.find(c => c.id === id);
    }
    
    formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short'
        });
    }
    
    formatTime(dateStr) {
        return new Date(dateStr).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    formatPrice(price) {
        return price.toLocaleString('ko-KR');
    }
    
    getStatusText(status) {
        const statusMap = {
            scheduled: '예정',
            in_progress: '진행중',
            completed: '완료',
            cancelled: '취소'
        };
        return statusMap[status] || status;
    }
    
    // 알림 표시
    showNotification(message, type = 'info') {
        // 알림 구현 (토스트 메시지)
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // 실시간 동기화 트리거
    triggerSync(action, data) {
        // 다른 탭이나 창에 이벤트 브로드캐스트
        if (window.BroadcastChannel) {
            const channel = new BroadcastChannel('education_sync');
            channel.postMessage({ action, data });
        }
        
        // 로컬 스토리지 이벤트 (구형 브라우저 지원)
        window.localStorage.setItem('education_sync', JSON.stringify({
            action,
            data,
            timestamp: Date.now()
        }));
    }
}

// 인스턴스 생성
let educationCalendar;

document.addEventListener('DOMContentLoaded', () => {
    educationCalendar = new EducationCalendar();
    
    // 오늘 일정 초기 로드
    educationCalendar.updateTodaySchedule();
    
    // 주기적 업데이트 (1분마다)
    setInterval(() => {
        educationCalendar.updateTodaySchedule();
    }, 60000);
});

// 전역 함수 (HTML에서 호출용)
function quickAddClass() {
    educationCalendar.quickAddClass();
}

function quickAddInstructor() {
    educationCalendar.openModal('newInstructorModal');
}

function quickAddCurriculum() {
    // 커리큘럼 추가 모달 구현
}

function openNewClassModal() {
    educationCalendar.quickAddClass();
}

function openNewInstructorModal() {
    educationCalendar.openModal('newInstructorModal');
}

function closeModal(modalId) {
    educationCalendar.closeModal(modalId);
}