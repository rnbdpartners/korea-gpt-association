// 통합 검색 API 시스템
class SearchAPI {
    constructor() {
        this.searchableContent = {
            courses: [],
            posts: [],
            instructors: [],
            faq: []
        };
        
        this.initializeSearchData();
    }

    // 검색 데이터 초기화
    initializeSearchData() {
        // 온라인 강의 데이터
        this.searchableContent.courses = [
            {
                id: 'GPT_FIRST',
                type: 'online',
                title: 'ChatGPT 첫걸음: 3시간 완성 패키지',
                description: '비개발자도 쉽게 따라하는 ChatGPT 기초 마스터 과정',
                instructor: '김민준',
                tags: ['입문', 'ChatGPT', '기초', '비개발자'],
                price: 49000,
                url: 'course-detail.html?id=GPT_FIRST'
            },
            {
                id: 'GPT_BUSINESS',
                type: 'online',
                title: '비즈니스를 위한 ChatGPT 활용법',
                description: '업무 생산성 10배 높이는 실전 ChatGPT 활용 전략',
                instructor: '이서연',
                tags: ['비즈니스', '실무', '마케팅', '자동화'],
                price: 99000,
                url: 'course-detail.html?id=GPT_BUSINESS'
            },
            {
                id: 'GPT_MARKETING',
                type: 'online',
                title: 'AI 마케팅 자동화 마스터',
                description: 'ChatGPT로 마케팅 콘텐츠 대량 생산하기',
                instructor: '박지훈',
                tags: ['마케팅', '콘텐츠', '자동화', 'SNS'],
                price: 149000,
                url: 'course-detail.html?id=GPT_MARKETING'
            },
            {
                id: 'OFFLINE_MASTER',
                type: 'offline',
                title: 'ChatGPT 마스터 클래스',
                description: '하루 8시간 집중 오프라인 교육',
                instructor: '김민준',
                tags: ['오프라인', '집중교육', '실습', '네트워킹'],
                price: 250000,
                url: 'offline-class.html'
            }
        ];

        // 커뮤니티 게시글 데이터
        const communityPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
        this.searchableContent.posts = communityPosts.map(post => ({
            id: post.id,
            type: 'post',
            title: post.title,
            content: post.content.substring(0, 200) + '...',
            author: post.author.name,
            category: post.category,
            tags: post.tags || [],
            url: 'community.html#' + post.id
        }));

        // 강사 데이터
        this.searchableContent.instructors = [
            {
                id: 'INS001',
                type: 'instructor',
                name: '김민준',
                title: 'AI 교육 전문가',
                bio: '전) 삼성전자 AI 연구소, 현) 한국GPT협회 수석 강사',
                courses: ['ChatGPT 첫걸음', 'ChatGPT 마스터 클래스'],
                url: 'instructors.html#kim-minjun'
            },
            {
                id: 'INS002',
                type: 'instructor',
                name: '이서연',
                title: '프롬프트 엔지니어',
                bio: '전) 네이버 AI Lab, 프롬프트 설계 전문가',
                courses: ['비즈니스를 위한 ChatGPT 활용법'],
                url: 'instructors.html#lee-seoyeon'
            },
            {
                id: 'INS003',
                type: 'instructor',
                name: '박지훈',
                title: '비즈니스 AI 컨설턴트',
                bio: '전) LG CNS 디지털 혁신팀, 기업 AI 도입 전문가',
                courses: ['AI 마케팅 자동화 마스터'],
                url: 'instructors.html#park-jihoon'
            }
        ];

        // FAQ 데이터
        this.searchableContent.faq = [
            {
                id: 'FAQ001',
                type: 'faq',
                question: 'ChatGPT Plus 구독이 필요한가요?',
                answer: '기초 과정은 무료 버전으로도 충분합니다. 고급 과정에서는 Plus 구독을 권장합니다.',
                category: '수강 관련',
                url: 'faq.html#chatgpt-plus'
            },
            {
                id: 'FAQ002',
                type: 'faq',
                question: '수료증은 언제 발급되나요?',
                answer: '모든 강의를 100% 수료하시면 즉시 발급됩니다.',
                category: '수료증',
                url: 'faq.html#certificate'
            },
            {
                id: 'FAQ003',
                type: 'faq',
                question: '환불 정책은 어떻게 되나요?',
                answer: '수강 시작 후 7일 이내, 진도율 30% 미만 시 100% 환불 가능합니다.',
                category: '결제/환불',
                url: 'faq.html#refund'
            }
        ];
    }

    // 통합 검색
    async search(query, filters = {}) {
        if (!query || query.trim().length < 2) {
            return {
                success: false,
                error: '검색어는 2자 이상 입력해주세요.'
            };
        }

        const searchTerm = query.toLowerCase().trim();
        const results = {
            courses: [],
            posts: [],
            instructors: [],
            faq: [],
            total: 0
        };

        // 강의 검색
        if (!filters.type || filters.type === 'all' || filters.type === 'courses') {
            results.courses = this.searchableContent.courses.filter(course => {
                return course.title.toLowerCase().includes(searchTerm) ||
                       course.description.toLowerCase().includes(searchTerm) ||
                       course.instructor.toLowerCase().includes(searchTerm) ||
                       course.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            });
        }

        // 게시글 검색
        if (!filters.type || filters.type === 'all' || filters.type === 'posts') {
            results.posts = this.searchableContent.posts.filter(post => {
                return post.title.toLowerCase().includes(searchTerm) ||
                       post.content.toLowerCase().includes(searchTerm) ||
                       post.author.toLowerCase().includes(searchTerm) ||
                       post.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            });
        }

        // 강사 검색
        if (!filters.type || filters.type === 'all' || filters.type === 'instructors') {
            results.instructors = this.searchableContent.instructors.filter(instructor => {
                return instructor.name.toLowerCase().includes(searchTerm) ||
                       instructor.title.toLowerCase().includes(searchTerm) ||
                       instructor.bio.toLowerCase().includes(searchTerm) ||
                       instructor.courses.some(course => course.toLowerCase().includes(searchTerm));
            });
        }

        // FAQ 검색
        if (!filters.type || filters.type === 'all' || filters.type === 'faq') {
            results.faq = this.searchableContent.faq.filter(faq => {
                return faq.question.toLowerCase().includes(searchTerm) ||
                       faq.answer.toLowerCase().includes(searchTerm) ||
                       faq.category.toLowerCase().includes(searchTerm);
            });
        }

        // 총 결과 수 계산
        results.total = results.courses.length + 
                       results.posts.length + 
                       results.instructors.length + 
                       results.faq.length;

        // 검색 기록 저장
        this.saveSearchHistory(query);

        return {
            success: true,
            data: results,
            query: query
        };
    }

    // 자동완성 제안
    async getSuggestions(query) {
        if (!query || query.trim().length < 1) {
            return {
                success: true,
                data: []
            };
        }

        const searchTerm = query.toLowerCase().trim();
        const suggestions = new Set();

        // 강의 제목에서 추출
        this.searchableContent.courses.forEach(course => {
            if (course.title.toLowerCase().includes(searchTerm)) {
                suggestions.add(course.title);
            }
            // 태그에서도 추출
            course.tags.forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm)) {
                    suggestions.add(tag);
                }
            });
        });

        // 인기 검색어에서 추출
        const popularSearches = this.getPopularSearches();
        popularSearches.forEach(search => {
            if (search.toLowerCase().includes(searchTerm)) {
                suggestions.add(search);
            }
        });

        return {
            success: true,
            data: Array.from(suggestions).slice(0, 10)
        };
    }

    // 인기 검색어 조회
    getPopularSearches() {
        const searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const frequency = {};
        
        searches.forEach(search => {
            frequency[search.query] = (frequency[search.query] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([query]) => query);
    }

    // 최근 검색어 조회
    getRecentSearches(limit = 5) {
        const searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const unique = Array.from(new Set(searches.map(s => s.query)));
        return unique.slice(0, limit);
    }

    // 검색 기록 저장
    saveSearchHistory(query) {
        const searches = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        searches.unshift({
            query: query,
            timestamp: new Date().toISOString()
        });
        
        // 최대 100개까지만 저장
        if (searches.length > 100) {
            searches.pop();
        }
        
        localStorage.setItem('searchHistory', JSON.stringify(searches));
    }

    // 검색 기록 삭제
    clearSearchHistory() {
        localStorage.removeItem('searchHistory');
        return {
            success: true,
            message: '검색 기록이 삭제되었습니다.'
        };
    }

    // 검색 필터 옵션 조회
    getFilterOptions() {
        return {
            type: [
                { value: 'all', label: '전체' },
                { value: 'courses', label: '강의' },
                { value: 'posts', label: '게시글' },
                { value: 'instructors', label: '강사' },
                { value: 'faq', label: 'FAQ' }
            ],
            courseType: [
                { value: 'all', label: '전체' },
                { value: 'online', label: '온라인' },
                { value: 'offline', label: '오프라인' }
            ],
            priceRange: [
                { value: 'all', label: '전체' },
                { value: '0-50000', label: '5만원 이하' },
                { value: '50000-100000', label: '5-10만원' },
                { value: '100000-200000', label: '10-20만원' },
                { value: '200000-', label: '20만원 이상' }
            ]
        };
    }
}

// 전역 인스턴스 생성
window.searchAPI = new SearchAPI();

console.log('검색 API 시스템 로드 완료');