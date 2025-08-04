// 커뮤니티 API 시스템
class CommunityAPI {
    constructor() {
        this.storageKeys = {
            posts: 'communityPosts',
            comments: 'communityComments',
            likes: 'communityLikes'
        };
        
        this.categories = {
            'all': '전체',
            'question': '질문하기',
            'tips': '팁 & 노하우',
            'prompts': '프롬프트 공유',
            'success': '성공 사례',
            'discussion': '자유 토론'
        };
        
        this.initializeMockData();
    }

    // 목업 데이터 초기화
    initializeMockData() {
        if (!localStorage.getItem(this.storageKeys.posts)) {
            const mockPosts = [
                {
                    id: 'POST001',
                    category: 'tips',
                    title: 'ChatGPT로 업무 보고서 10분 만에 작성하는 꿀팁',
                    content: `안녕하세요! 오늘은 제가 실무에서 사용하는 ChatGPT 보고서 작성 팁을 공유하려고 합니다.

1. 기본 프롬프트 구조
"다음 데이터를 바탕으로 [부서명] 월간 보고서를 작성해줘. 형식은 1) 요약 2) 주요 성과 3) 개선사항 4) 다음달 계획으로 구성해줘"

2. 데이터 정리 팁
- 엑셀 데이터는 표 형태로 복사해서 붙여넣기
- 주요 수치는 미리 정리해두기
- 전월 대비 증감률은 자동 계산 요청

3. 보고서 다듬기
생성된 초안을 바탕으로 "좀 더 간결하게" 또는 "핵심 성과를 강조해서" 같은 추가 요청으로 완성도를 높입니다.

이 방법으로 원래 1시간 걸리던 보고서 작성을 10분으로 단축했습니다!`,
                    author: {
                        id: 'USER001',
                        name: '김민준',
                        avatar: 'https://via.placeholder.com/40',
                        role: 'instructor'
                    },
                    createdAt: new Date('2024-11-30T10:00:00').toISOString(),
                    updatedAt: new Date('2024-11-30T10:00:00').toISOString(),
                    views: 1234,
                    likes: 89,
                    comments: 23,
                    tags: ['ChatGPT', '업무자동화', '보고서작성'],
                    isPinned: false,
                    isNotice: false
                },
                {
                    id: 'POST002',
                    category: 'question',
                    title: 'ChatGPT가 갑자기 한국어를 이해 못하는 것 같아요',
                    content: `ChatGPT를 사용하다가 갑자기 한국어 질문에 영어로 답변하거나 
이상한 대답을 하는 경우가 있는데 혹시 해결 방법 아시는 분 계신가요?

특히 전문 용어가 섞인 질문을 하면 더 심한 것 같습니다.`,
                    author: {
                        id: 'USER002',
                        name: '이서연',
                        avatar: 'https://via.placeholder.com/40',
                        role: 'user'
                    },
                    createdAt: new Date('2024-11-29T15:30:00').toISOString(),
                    updatedAt: new Date('2024-11-29T15:30:00').toISOString(),
                    views: 567,
                    likes: 12,
                    comments: 8,
                    tags: ['ChatGPT', '오류해결', '한국어'],
                    isPinned: false,
                    isNotice: false
                },
                {
                    id: 'POST003',
                    category: 'prompts',
                    title: '마케팅 카피라이팅 프롬프트 모음 (실전 검증됨)',
                    content: `실제 마케팅 현장에서 사용하고 있는 프롬프트들을 공유합니다.

### 1. 제품 설명 카피
"[제품명]의 주요 특징: [특징 나열]
타겟 고객: [타겟 설명]
위 정보를 바탕으로 구매욕구를 자극하는 3줄 카피를 5개 만들어줘"

### 2. SNS 광고 카피
"[브랜드명]의 [이벤트/프로모션] 관련 인스타그램 광고 카피를 작성해줘.
- 이모지 포함
- 해시태그 5개
- CTA 문구 포함"

### 3. 이메일 제목
"[목적]을 위한 이메일 제목 10개를 만들어줘. 오픈율을 높일 수 있도록 호기심을 자극하되 클릭베이트는 피해줘"

더 많은 프롬프트가 필요하신 분은 댓글 남겨주세요!`,
                    author: {
                        id: 'USER003',
                        name: '박지훈',
                        avatar: 'https://via.placeholder.com/40',
                        role: 'instructor'
                    },
                    createdAt: new Date('2024-11-28T09:15:00').toISOString(),
                    updatedAt: new Date('2024-11-28T09:15:00').toISOString(),
                    views: 2341,
                    likes: 234,
                    comments: 45,
                    tags: ['프롬프트', '마케팅', '카피라이팅'],
                    isPinned: true,
                    isNotice: false
                }
            ];
            
            localStorage.setItem(this.storageKeys.posts, JSON.stringify(mockPosts));
        }
    }

    // 게시글 목록 조회
    async getPosts(filters = {}) {
        const posts = JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
        let filtered = [...posts];
        
        // 카테고리 필터
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(p => p.category === filters.category);
        }
        
        // 검색 필터
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(searchTerm) ||
                p.content.toLowerCase().includes(searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // 정렬
        const sortBy = filters.sortBy || 'latest';
        switch(sortBy) {
            case 'latest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'popular':
                filtered.sort((a, b) => b.likes - a.likes);
                break;
            case 'views':
                filtered.sort((a, b) => b.views - a.views);
                break;
            case 'comments':
                filtered.sort((a, b) => b.comments - a.comments);
                break;
        }
        
        // 고정글 우선 정렬
        filtered.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });
        
        return {
            success: true,
            data: filtered,
            total: filtered.length
        };
    }

    // 게시글 상세 조회
    async getPost(postId) {
        const posts = JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            // 조회수 증가
            post.views += 1;
            localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
            
            return {
                success: true,
                data: post
            };
        }
        
        return {
            success: false,
            error: '게시글을 찾을 수 없습니다.'
        };
    }

    // 게시글 작성
    async createPost(postData) {
        const validation = this.validatePost(postData);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }
        
        const posts = JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const newPost = {
            id: 'POST' + Date.now(),
            ...postData,
            author: {
                id: currentUser.id || 'GUEST',
                name: currentUser.name || '익명',
                avatar: currentUser.avatar || 'https://via.placeholder.com/40',
                role: currentUser.role || 'user'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments: 0,
            isPinned: false,
            isNotice: false
        };
        
        posts.unshift(newPost);
        localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
        
        return {
            success: true,
            data: newPost
        };
    }

    // 게시글 수정
    async updatePost(postId, updateData) {
        const posts = JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
        const index = posts.findIndex(p => p.id === postId);
        
        if (index === -1) {
            return {
                success: false,
                error: '게시글을 찾을 수 없습니다.'
            };
        }
        
        // 작성자 확인
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (posts[index].author.id !== currentUser.id && currentUser.role !== 'admin') {
            return {
                success: false,
                error: '수정 권한이 없습니다.'
            };
        }
        
        posts[index] = {
            ...posts[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
        
        return {
            success: true,
            data: posts[index]
        };
    }

    // 게시글 삭제
    async deletePost(postId) {
        const posts = JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
        const index = posts.findIndex(p => p.id === postId);
        
        if (index === -1) {
            return {
                success: false,
                error: '게시글을 찾을 수 없습니다.'
            };
        }
        
        // 작성자 확인
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (posts[index].author.id !== currentUser.id && currentUser.role !== 'admin') {
            return {
                success: false,
                error: '삭제 권한이 없습니다.'
            };
        }
        
        posts.splice(index, 1);
        localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
        
        // 관련 댓글, 좋아요도 삭제
        this.deleteRelatedData(postId);
        
        return {
            success: true,
            message: '게시글이 삭제되었습니다.'
        };
    }

    // 좋아요 토글
    async toggleLike(postId) {
        const posts = JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
        const likes = JSON.parse(localStorage.getItem(this.storageKeys.likes) || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!currentUser.id) {
            return {
                success: false,
                error: '로그인이 필요합니다.'
            };
        }
        
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            return {
                success: false,
                error: '게시글을 찾을 수 없습니다.'
            };
        }
        
        // 좋아요 상태 토글
        const likeKey = `${postId}_${currentUser.id}`;
        if (likes[likeKey]) {
            delete likes[likeKey];
            posts[postIndex].likes -= 1;
        } else {
            likes[likeKey] = true;
            posts[postIndex].likes += 1;
        }
        
        localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
        localStorage.setItem(this.storageKeys.likes, JSON.stringify(likes));
        
        return {
            success: true,
            data: {
                liked: !likes[likeKey],
                likeCount: posts[postIndex].likes
            }
        };
    }

    // 댓글 작성
    async createComment(postId, commentData) {
        const posts = JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
        const comments = JSON.parse(localStorage.getItem(this.storageKeys.comments) || '[]');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) {
            return {
                success: false,
                error: '게시글을 찾을 수 없습니다.'
            };
        }
        
        const newComment = {
            id: 'COMMENT' + Date.now(),
            postId,
            content: commentData.content,
            author: {
                id: currentUser.id || 'GUEST',
                name: currentUser.name || '익명',
                avatar: currentUser.avatar || 'https://via.placeholder.com/40'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        comments.push(newComment);
        posts[postIndex].comments += 1;
        
        localStorage.setItem(this.storageKeys.comments, JSON.stringify(comments));
        localStorage.setItem(this.storageKeys.posts, JSON.stringify(posts));
        
        return {
            success: true,
            data: newComment
        };
    }

    // 댓글 목록 조회
    async getComments(postId) {
        const comments = JSON.parse(localStorage.getItem(this.storageKeys.comments) || '[]');
        const postComments = comments
            .filter(c => c.postId === postId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return {
            success: true,
            data: postComments
        };
    }

    // 유효성 검사
    validatePost(data) {
        if (!data.title || data.title.trim().length < 5) {
            return {
                valid: false,
                error: '제목은 5자 이상 입력해주세요.'
            };
        }
        
        if (!data.content || data.content.trim().length < 10) {
            return {
                valid: false,
                error: '내용은 10자 이상 입력해주세요.'
            };
        }
        
        if (!data.category || !this.categories[data.category]) {
            return {
                valid: false,
                error: '올바른 카테고리를 선택해주세요.'
            };
        }
        
        return { valid: true };
    }

    // 관련 데이터 삭제
    deleteRelatedData(postId) {
        // 댓글 삭제
        const comments = JSON.parse(localStorage.getItem(this.storageKeys.comments) || '[]');
        const filteredComments = comments.filter(c => c.postId !== postId);
        localStorage.setItem(this.storageKeys.comments, JSON.stringify(filteredComments));
        
        // 좋아요 삭제
        const likes = JSON.parse(localStorage.getItem(this.storageKeys.likes) || '{}');
        Object.keys(likes).forEach(key => {
            if (key.startsWith(postId + '_')) {
                delete likes[key];
            }
        });
        localStorage.setItem(this.storageKeys.likes, JSON.stringify(likes));
    }

    // 통계 조회
    async getStatistics() {
        const posts = JSON.parse(localStorage.getItem(this.storageKeys.posts) || '[]');
        const stats = {};
        
        // 카테고리별 통계
        Object.keys(this.categories).forEach(cat => {
            stats[cat] = posts.filter(p => p.category === cat).length;
        });
        
        // 전체 통계
        stats.all = posts.length;
        
        return {
            success: true,
            data: stats
        };
    }
}

// 전역 인스턴스 생성
window.communityAPI = new CommunityAPI();

console.log('커뮤니티 API 시스템 로드 완료');