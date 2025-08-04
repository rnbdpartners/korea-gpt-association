// 내 강의실 API 시스템
class MyClassroomAPI {
    constructor() {
        this.storageKeys = {
            enrollments: 'myEnrollments',
            progress: 'courseProgress',
            certificates: 'myCertificates',
            notes: 'courseNotes',
            watchHistory: 'videoWatchHistory'
        };
        
        this.initializeMockData();
    }

    // 목업 데이터 초기화
    initializeMockData() {
        // 수강 신청 데이터
        if (!localStorage.getItem(this.storageKeys.enrollments)) {
            const mockEnrollments = [
                {
                    id: 'ENROLL001',
                    courseId: 'GPT_FIRST',
                    courseName: 'ChatGPT 첫걸음: 3시간 완성 패키지',
                    courseType: 'online',
                    thumbnail: 'https://via.placeholder.com/300x200',
                    instructor: '김민준',
                    enrolledAt: new Date('2024-11-15').toISOString(),
                    expiresAt: new Date('2025-02-15').toISOString(),
                    status: 'active',
                    totalLectures: 15,
                    completedLectures: 8,
                    totalDuration: 180, // 분
                    watchedDuration: 95, // 분
                    lastAccessedAt: new Date('2024-12-01T14:30:00').toISOString(),
                    progress: 53.3
                },
                {
                    id: 'ENROLL002',
                    courseId: 'GPT_BUSINESS',
                    courseName: '비즈니스를 위한 ChatGPT 활용법',
                    courseType: 'online',
                    thumbnail: 'https://via.placeholder.com/300x200',
                    instructor: '이서연',
                    enrolledAt: new Date('2024-10-20').toISOString(),
                    expiresAt: new Date('2025-01-20').toISOString(),
                    status: 'active',
                    totalLectures: 20,
                    completedLectures: 20,
                    totalDuration: 240,
                    watchedDuration: 240,
                    lastAccessedAt: new Date('2024-11-25T18:45:00').toISOString(),
                    progress: 100,
                    certificateId: 'CERT001'
                },
                {
                    id: 'ENROLL003',
                    courseId: 'OFFLINE_DEC',
                    courseName: 'ChatGPT 마스터 클래스',
                    courseType: 'offline',
                    thumbnail: 'https://via.placeholder.com/300x200',
                    instructor: '박지훈',
                    enrolledAt: new Date('2024-11-30').toISOString(),
                    classDate: new Date('2024-12-14').toISOString(),
                    location: '서울 강남 교육장',
                    status: 'upcoming',
                    progress: 0
                }
            ];
            
            localStorage.setItem(this.storageKeys.enrollments, JSON.stringify(mockEnrollments));
        }

        // 강의 진도 상세 데이터
        if (!localStorage.getItem(this.storageKeys.progress)) {
            const mockProgress = {
                'GPT_FIRST': {
                    lectures: [
                        { id: 'L001', title: 'ChatGPT란 무엇인가?', duration: 15, watched: 15, completed: true },
                        { id: 'L002', title: '계정 생성과 기본 설정', duration: 10, watched: 10, completed: true },
                        { id: 'L003', title: '첫 대화 시작하기', duration: 12, watched: 12, completed: true },
                        { id: 'L004', title: '효과적인 질문하기', duration: 20, watched: 20, completed: true },
                        { id: 'L005', title: '프롬프트 기본 원칙', duration: 18, watched: 18, completed: true },
                        { id: 'L006', title: '실전 프롬프트 예제 1', duration: 15, watched: 15, completed: true },
                        { id: 'L007', title: '실전 프롬프트 예제 2', duration: 15, watched: 15, completed: true },
                        { id: 'L008', title: '업무 자동화 시작하기', duration: 25, watched: 25, completed: true },
                        { id: 'L009', title: '이메일 작성 자동화', duration: 20, watched: 8, completed: false },
                        { id: 'L010', title: '문서 요약과 분석', duration: 22, watched: 0, completed: false }
                    ],
                    lastWatchedLecture: 'L009',
                    lastWatchedTime: 480 // 초
                },
                'GPT_BUSINESS': {
                    lectures: Array(20).fill(null).map((_, i) => ({
                        id: `B${String(i+1).padStart(3, '0')}`,
                        title: `Chapter ${i+1}`,
                        duration: 12,
                        watched: 12,
                        completed: true
                    }))
                }
            };
            
            localStorage.setItem(this.storageKeys.progress, JSON.stringify(mockProgress));
        }

        // 수료증 데이터
        if (!localStorage.getItem(this.storageKeys.certificates)) {
            const mockCertificates = [
                {
                    id: 'CERT001',
                    courseId: 'GPT_BUSINESS',
                    courseName: '비즈니스를 위한 ChatGPT 활용법',
                    studentName: '홍길동',
                    issuedAt: new Date('2024-11-25').toISOString(),
                    certificateNumber: 'KGA-2024-1125-001',
                    grade: 'A+',
                    totalScore: 98
                }
            ];
            
            localStorage.setItem(this.storageKeys.certificates, JSON.stringify(mockCertificates));
        }
    }

    // 내 수강 목록 조회
    async getMyEnrollments(filters = {}) {
        const enrollments = JSON.parse(localStorage.getItem(this.storageKeys.enrollments) || '[]');
        let filtered = [...enrollments];
        
        // 상태 필터
        if (filters.status) {
            filtered = filtered.filter(e => e.status === filters.status);
        }
        
        // 강의 유형 필터
        if (filters.courseType) {
            filtered = filtered.filter(e => e.courseType === filters.courseType);
        }
        
        // 정렬
        const sortBy = filters.sortBy || 'recent';
        switch(sortBy) {
            case 'recent':
                filtered.sort((a, b) => new Date(b.lastAccessedAt || b.enrolledAt) - new Date(a.lastAccessedAt || a.enrolledAt));
                break;
            case 'progress':
                filtered.sort((a, b) => b.progress - a.progress);
                break;
            case 'expiring':
                filtered.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
                break;
        }
        
        return {
            success: true,
            data: filtered
        };
    }

    // 강의 진도 상세 조회
    async getCourseProgress(courseId) {
        const progress = JSON.parse(localStorage.getItem(this.storageKeys.progress) || '{}');
        const courseProgress = progress[courseId];
        
        if (!courseProgress) {
            return {
                success: false,
                error: '진도 정보를 찾을 수 없습니다.'
            };
        }
        
        return {
            success: true,
            data: courseProgress
        };
    }

    // 강의 진도 업데이트
    async updateLectureProgress(courseId, lectureId, watchedSeconds) {
        const progress = JSON.parse(localStorage.getItem(this.storageKeys.progress) || '{}');
        
        if (!progress[courseId]) {
            return {
                success: false,
                error: '강의를 찾을 수 없습니다.'
            };
        }
        
        const lecture = progress[courseId].lectures.find(l => l.id === lectureId);
        if (!lecture) {
            return {
                success: false,
                error: '강의를 찾을 수 없습니다.'
            };
        }
        
        // 진도 업데이트
        lecture.watched = Math.min(watchedSeconds / 60, lecture.duration);
        lecture.completed = lecture.watched >= lecture.duration * 0.9; // 90% 이상 시청 시 완료
        
        // 마지막 시청 정보 업데이트
        progress[courseId].lastWatchedLecture = lectureId;
        progress[courseId].lastWatchedTime = watchedSeconds;
        
        localStorage.setItem(this.storageKeys.progress, JSON.stringify(progress));
        
        // 수강 정보도 업데이트
        await this.updateEnrollmentProgress(courseId);
        
        return {
            success: true,
            data: {
                lectureId,
                watched: lecture.watched,
                completed: lecture.completed
            }
        };
    }

    // 수강 정보 진도 업데이트
    async updateEnrollmentProgress(courseId) {
        const enrollments = JSON.parse(localStorage.getItem(this.storageKeys.enrollments) || '[]');
        const progress = JSON.parse(localStorage.getItem(this.storageKeys.progress) || '{}');
        
        const enrollment = enrollments.find(e => e.courseId === courseId);
        const courseProgress = progress[courseId];
        
        if (enrollment && courseProgress) {
            const completedCount = courseProgress.lectures.filter(l => l.completed).length;
            const totalWatched = courseProgress.lectures.reduce((sum, l) => sum + l.watched, 0);
            
            enrollment.completedLectures = completedCount;
            enrollment.watchedDuration = totalWatched;
            enrollment.progress = (completedCount / enrollment.totalLectures) * 100;
            enrollment.lastAccessedAt = new Date().toISOString();
            
            localStorage.setItem(this.storageKeys.enrollments, JSON.stringify(enrollments));
        }
    }

    // 수료증 발급
    async issueCertificate(courseId) {
        const enrollments = JSON.parse(localStorage.getItem(this.storageKeys.enrollments) || '[]');
        const enrollment = enrollments.find(e => e.courseId === courseId);
        
        if (!enrollment) {
            return {
                success: false,
                error: '수강 정보를 찾을 수 없습니다.'
            };
        }
        
        if (enrollment.progress < 100) {
            return {
                success: false,
                error: '모든 강의를 완료해야 수료증을 받을 수 있습니다.'
            };
        }
        
        // 이미 수료증이 있는지 확인
        const certificates = JSON.parse(localStorage.getItem(this.storageKeys.certificates) || '[]');
        const existing = certificates.find(c => c.courseId === courseId);
        
        if (existing) {
            return {
                success: true,
                data: existing
            };
        }
        
        // 새 수료증 발급
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const newCertificate = {
            id: 'CERT' + Date.now(),
            courseId: courseId,
            courseName: enrollment.courseName,
            studentName: currentUser.name || '수강생',
            issuedAt: new Date().toISOString(),
            certificateNumber: `KGA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
            grade: 'A',
            totalScore: 95
        };
        
        certificates.push(newCertificate);
        localStorage.setItem(this.storageKeys.certificates, JSON.stringify(certificates));
        
        // 수강 정보에 수료증 ID 추가
        enrollment.certificateId = newCertificate.id;
        localStorage.setItem(this.storageKeys.enrollments, JSON.stringify(enrollments));
        
        return {
            success: true,
            data: newCertificate
        };
    }

    // 수료증 조회
    async getMyCertificates() {
        const certificates = JSON.parse(localStorage.getItem(this.storageKeys.certificates) || '[]');
        
        return {
            success: true,
            data: certificates
        };
    }

    // 노트 저장
    async saveCourseNote(courseId, lectureId, note) {
        const notes = JSON.parse(localStorage.getItem(this.storageKeys.notes) || '{}');
        
        if (!notes[courseId]) {
            notes[courseId] = {};
        }
        
        notes[courseId][lectureId] = {
            content: note,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.storageKeys.notes, JSON.stringify(notes));
        
        return {
            success: true,
            message: '노트가 저장되었습니다.'
        };
    }

    // 노트 조회
    async getCourseNotes(courseId) {
        const notes = JSON.parse(localStorage.getItem(this.storageKeys.notes) || '{}');
        
        return {
            success: true,
            data: notes[courseId] || {}
        };
    }

    // 학습 통계 조회
    async getLearningStatistics() {
        const enrollments = JSON.parse(localStorage.getItem(this.storageKeys.enrollments) || '[]');
        const certificates = JSON.parse(localStorage.getItem(this.storageKeys.certificates) || '[]');
        
        const stats = {
            totalEnrollments: enrollments.length,
            activeEnrollments: enrollments.filter(e => e.status === 'active').length,
            completedCourses: certificates.length,
            totalWatchTime: enrollments.reduce((sum, e) => sum + (e.watchedDuration || 0), 0),
            averageProgress: enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length || 0,
            upcomingOfflineClasses: enrollments.filter(e => e.courseType === 'offline' && e.status === 'upcoming').length
        };
        
        return {
            success: true,
            data: stats
        };
    }

    // 학습 추천
    async getRecommendations() {
        const enrollments = JSON.parse(localStorage.getItem(this.storageKeys.enrollments) || '[]');
        
        // 현재 학습 중인 강의 기반 추천
        const recommendations = [];
        
        if (enrollments.some(e => e.courseId.includes('FIRST'))) {
            recommendations.push({
                courseId: 'GPT_ADVANCED',
                courseName: 'ChatGPT 고급 활용법',
                reason: '기초 과정을 수강하신 분들께 추천'
            });
        }
        
        if (enrollments.some(e => e.courseId.includes('BUSINESS'))) {
            recommendations.push({
                courseId: 'GPT_MARKETING',
                courseName: 'AI 마케팅 자동화 마스터',
                reason: '비즈니스 과정 수강생 맞춤 추천'
            });
        }
        
        return {
            success: true,
            data: recommendations
        };
    }
}

// 전역 인스턴스 생성
window.myClassroomAPI = new MyClassroomAPI();

console.log('내 강의실 API 시스템 로드 완료');