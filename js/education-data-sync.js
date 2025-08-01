// 교육 관리 데이터 동기화 시스템

class DataSyncManager {
    constructor() {
        this.syncChannel = null;
        this.syncInterval = null;
        this.lastSync = null;
        
        this.init();
    }
    
    init() {
        // BroadcastChannel 설정 (탭 간 동기화)
        if ('BroadcastChannel' in window) {
            this.syncChannel = new BroadcastChannel('education_sync');
            this.syncChannel.onmessage = (event) => this.handleSyncMessage(event);
        }
        
        // Storage 이벤트 리스너 (구형 브라우저 지원)
        window.addEventListener('storage', (event) => {
            if (event.key === 'education_sync') {
                this.handleStorageSync(event);
            }
        });
        
        // 온라인/오프라인 상태 감지
        window.addEventListener('online', () => this.syncWithServer());
        window.addEventListener('offline', () => this.enableOfflineMode());
        
        // 주기적 동기화 (5분마다)
        this.syncInterval = setInterval(() => {
            if (navigator.onLine) {
                this.syncWithServer();
            }
        }, 5 * 60 * 1000);
    }
    
    // 동기화 메시지 처리
    handleSyncMessage(event) {
        const { action, data } = event.data;
        
        switch (action) {
            case 'event_added':
                this.onEventAdded(data);
                break;
            case 'event_updated':
                this.onEventUpdated(data);
                break;
            case 'event_deleted':
                this.onEventDeleted(data);
                break;
            case 'instructor_added':
                this.onInstructorAdded(data);
                break;
            case 'instructor_updated':
                this.onInstructorUpdated(data);
                break;
            case 'curriculum_added':
                this.onCurriculumAdded(data);
                break;
            case 'curriculum_updated':
                this.onCurriculumUpdated(data);
                break;
        }
    }
    
    // Storage 동기화 처리
    handleStorageSync(event) {
        if (event.newValue) {
            try {
                const data = JSON.parse(event.newValue);
                if (data.timestamp && Date.now() - data.timestamp < 1000) {
                    this.handleSyncMessage({ data });
                }
            } catch (e) {
                console.error('Storage sync error:', e);
            }
        }
    }
    
    // 이벤트 추가 시 동기화
    onEventAdded(event) {
        if (educationCalendar && educationCalendar.calendar) {
            educationCalendar.calendar.addEvent({
                ...event,
                extendedProps: {
                    instructorId: event.instructorId,
                    curriculumId: event.curriculumId,
                    locationType: event.locationType,
                    location: event.location,
                    currentParticipants: event.currentParticipants,
                    maxParticipants: event.maxParticipants,
                    status: event.status
                }
            });
            
            // 로컬 데이터 업데이트
            const events = JSON.parse(localStorage.getItem('educationEvents') || '[]');
            events.push(event);
            localStorage.setItem('educationEvents', JSON.stringify(events));
            
            // UI 업데이트
            educationCalendar.updateTodaySchedule();
        }
    }
    
    // 이벤트 업데이트 시 동기화
    onEventUpdated(event) {
        if (educationCalendar && educationCalendar.calendar) {
            const calendarEvent = educationCalendar.calendar.getEventById(event.id);
            if (calendarEvent) {
                calendarEvent.setProp('title', event.title);
                calendarEvent.setStart(event.start);
                calendarEvent.setEnd(event.end);
                calendarEvent.setProp('color', event.color);
                calendarEvent.setExtendedProp('status', event.status);
            }
            
            // 로컬 데이터 업데이트
            const events = JSON.parse(localStorage.getItem('educationEvents') || '[]');
            const index = events.findIndex(e => e.id === event.id);
            if (index > -1) {
                events[index] = event;
                localStorage.setItem('educationEvents', JSON.stringify(events));
            }
            
            // UI 업데이트
            educationCalendar.updateTodaySchedule();
        }
    }
    
    // 이벤트 삭제 시 동기화
    onEventDeleted(eventId) {
        if (educationCalendar && educationCalendar.calendar) {
            const calendarEvent = educationCalendar.calendar.getEventById(eventId);
            if (calendarEvent) {
                calendarEvent.remove();
            }
            
            // 로컬 데이터 업데이트
            let events = JSON.parse(localStorage.getItem('educationEvents') || '[]');
            events = events.filter(e => e.id !== eventId);
            localStorage.setItem('educationEvents', JSON.stringify(events));
            
            // UI 업데이트
            educationCalendar.updateTodaySchedule();
        }
    }
    
    // 강사 추가 시 동기화
    onInstructorAdded(instructor) {
        const instructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        instructors.push(instructor);
        localStorage.setItem('instructors', JSON.stringify(instructors));
        
        // UI 업데이트
        if (educationCalendar) {
            educationCalendar.instructors = instructors;
            educationCalendar.updateInstructorFilters();
            
            // 강사 관리 뷰가 열려있으면 업데이트
            if (document.getElementById('instructorsView').style.display !== 'none') {
                educationCalendar.loadInstructorsView();
            }
        }
    }
    
    // 강사 업데이트 시 동기화
    onInstructorUpdated(instructor) {
        const instructors = JSON.parse(localStorage.getItem('instructors') || '[]');
        const index = instructors.findIndex(i => i.id === instructor.id);
        if (index > -1) {
            instructors[index] = instructor;
            localStorage.setItem('instructors', JSON.stringify(instructors));
            
            // UI 업데이트
            if (educationCalendar) {
                educationCalendar.instructors = instructors;
                educationCalendar.updateInstructorFilters();
                
                // 캘린더 이벤트 색상 업데이트
                educationCalendar.events.forEach(event => {
                    if (event.instructorId === instructor.id) {
                        const calendarEvent = educationCalendar.calendar.getEventById(event.id);
                        if (calendarEvent) {
                            calendarEvent.setProp('color', instructor.color);
                        }
                    }
                });
            }
        }
    }
    
    // 커리큘럼 추가 시 동기화
    onCurriculumAdded(curriculum) {
        const curriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');
        curriculums.push(curriculum);
        localStorage.setItem('curriculums', JSON.stringify(curriculums));
        
        // UI 업데이트
        if (educationCalendar) {
            educationCalendar.curriculums = curriculums;
            
            // 커리큘럼 관리 뷰가 열려있으면 업데이트
            if (document.getElementById('curriculumView').style.display !== 'none') {
                educationCalendar.loadCurriculumView();
            }
        }
    }
    
    // 커리큘럼 업데이트 시 동기화
    onCurriculumUpdated(curriculum) {
        const curriculums = JSON.parse(localStorage.getItem('curriculums') || '[]');
        const index = curriculums.findIndex(c => c.id === curriculum.id);
        if (index > -1) {
            curriculums[index] = curriculum;
            localStorage.setItem('curriculums', JSON.stringify(curriculums));
            
            // UI 업데이트
            if (educationCalendar) {
                educationCalendar.curriculums = curriculums;
            }
        }
    }
    
    // 서버와 동기화 (API 연동 시)
    async syncWithServer() {
        if (!navigator.onLine) return;
        
        try {
            // 로컬 변경사항 확인
            const localChanges = this.getLocalChanges();
            
            if (localChanges.length > 0) {
                // 서버로 변경사항 전송
                // const response = await fetch('/api/sync', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(localChanges)
                // });
                
                // 성공 시 동기화 타임스탬프 업데이트
                this.lastSync = Date.now();
                localStorage.setItem('lastSync', this.lastSync);
            }
            
            // 서버에서 최신 데이터 가져오기
            // const updates = await fetch('/api/updates?since=' + this.lastSync);
            // this.applyServerUpdates(updates);
            
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    // 로컬 변경사항 수집
    getLocalChanges() {
        const changes = [];
        const lastSync = parseInt(localStorage.getItem('lastSync') || '0');
        
        // 변경사항 추적 로직
        // 실제 구현 시에는 각 데이터에 lastModified 타임스탬프를 추가하여 추적
        
        return changes;
    }
    
    // 오프라인 모드 활성화
    enableOfflineMode() {
        if (educationCalendar) {
            educationCalendar.showNotification('오프라인 모드 - 변경사항은 온라인 시 동기화됩니다.', 'warning');
        }
    }
    
    // 정리
    destroy() {
        if (this.syncChannel) {
            this.syncChannel.close();
        }
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

// 강사 관리 뷰 확장
if (window.educationCalendar) {
    // 강사 뷰 로드
    educationCalendar.loadInstructorsView = function() {
        const grid = document.getElementById('instructorsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.instructors.map(instructor => `
            <div class="instructor-card" onclick="educationCalendar.showInstructorDetails(${instructor.id})">
                <div class="instructor-header">
                    <div class="instructor-avatar" style="background-color: ${instructor.color}20; color: ${instructor.color}">
                        ${instructor.name.charAt(0)}
                    </div>
                    <div class="instructor-info">
                        <h4>${instructor.name}</h4>
                        <p>${instructor.email}</p>
                    </div>
                </div>
                <div class="instructor-tags">
                    ${instructor.specialty.map(s => `<span class="tag">${s}</span>`).join('')}
                </div>
                <div class="instructor-stats">
                    <div class="stat">
                        <div class="stat-value">${instructor.experienceYears}</div>
                        <div class="stat-label">경력(년)</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${instructor.rating}</div>
                        <div class="stat-label">평점</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${this.formatPrice(instructor.hourlyRate)}</div>
                        <div class="stat-label">시간당</div>
                    </div>
                </div>
            </div>
        `).join('');
    };
    
    // 커리큘럼 뷰 로드
    educationCalendar.loadCurriculumView = function() {
        const list = document.getElementById('curriculumList');
        if (!list) return;
        
        list.innerHTML = this.curriculums.map(curriculum => `
            <div class="curriculum-item" onclick="educationCalendar.showCurriculumDetails(${curriculum.id})">
                <div class="curriculum-header">
                    <div>
                        <h3 class="curriculum-title">${curriculum.name}</h3>
                        <span class="curriculum-code">${curriculum.code}</span>
                    </div>
                    <span class="curriculum-badge badge-${curriculum.category}">
                        ${this.getCategoryText(curriculum.category)}
                    </span>
                </div>
                <div class="curriculum-modules">
                    ${curriculum.modules.slice(0, 3).map((module, index) => `
                        <div class="module">
                            <span class="module-number">${index + 1}</span>
                            <span>${module}</span>
                        </div>
                    `).join('')}
                    ${curriculum.modules.length > 3 ? `
                        <div class="module">
                            <span class="module-number">+${curriculum.modules.length - 3}</span>
                            <span>더보기</span>
                        </div>
                    ` : ''}
                </div>
                <div class="curriculum-footer">
                    <span><i class="fas fa-clock"></i> ${curriculum.durationHours}시간</span>
                    <span><i class="fas fa-users"></i> 최대 ${curriculum.maxParticipants}명</span>
                    <span><i class="fas fa-won-sign"></i> ${this.formatPrice(curriculum.basePrice)}</span>
                </div>
            </div>
        `).join('');
    };
    
    educationCalendar.getCategoryText = function(category) {
        const categoryMap = {
            basic: '기초',
            intermediate: '중급',
            advanced: '고급',
            custom: '맞춤'
        };
        return categoryMap[category] || category;
    };
}

// 인스턴스 생성
const dataSyncManager = new DataSyncManager();

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    dataSyncManager.destroy();
});