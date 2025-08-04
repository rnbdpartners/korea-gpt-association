// 학습 커뮤니티 페이지 JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // API 스크립트 로드 확인
    if (typeof window.communityAPI === 'undefined') {
        const script = document.createElement('script');
        script.src = 'community-api.js';
        document.head.appendChild(script);
        
        // API 로드 대기
        await new Promise(resolve => {
            script.onload = resolve;
        });
    }
    
    // 초기 데이터 로드
    loadPosts();
    
    // 카테고리 필터링
    const categoryLinks = document.querySelectorAll('.category-list a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // 활성 카테고리 변경
            document.querySelector('.category-list li.active')?.classList.remove('active');
            this.parentElement.classList.add('active');
            
            // 카테고리 값 추출
            const categoryText = this.textContent.trim();
            let category = 'all';
            
            if (categoryText.includes('질문하기')) category = 'question';
            else if (categoryText.includes('팁 & 노하우')) category = 'tips';
            else if (categoryText.includes('프롬프트 공유')) category = 'prompts';
            else if (categoryText.includes('성공 사례')) category = 'success';
            else if (categoryText.includes('자유 토론')) category = 'discussion';
            
            // 게시글 재로드
            await loadPosts({ category });
        });
    });
    
    // 태그 클릭 이벤트
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', async function() {
            const tagText = this.textContent.replace('#', '');
            await loadPosts({ search: tagText });
        });
    });
    
    // 글쓰기 버튼
    const writeBtn = document.querySelector('.btn-write');
    
    if (writeBtn) {
        writeBtn.addEventListener('click', function() {
            // 로그인 체크
            const isLoggedIn = checkLoginStatus();
            if (!isLoggedIn) {
                alert('글쓰기를 위해 로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }
            
            showWriteModal();
        });
    }
    
    // 글쓰기 폼 제출
    const writeForm = document.getElementById('writeForm');
    if (writeForm) {
        writeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // 태그 파싱
            if (data.tags) {
                data.tags = data.tags.split(',').map(tag => tag.trim().replace('#', ''));
            } else {
                data.tags = [];
            }
            
            // API 호출
            const result = await window.communityAPI.createPost(data);
            
            if (result.success) {
                alert('글이 성공적으로 등록되었습니다!');
                closeModal();
                this.reset();
                await loadPosts();
            } else {
                alert(result.error || '글 작성에 실패했습니다.');
            }
        });
    }
    
    // 더보기 버튼
    const loadMoreBtn = document.querySelector('.btn-load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // 실제로는 서버에서 추가 데이터를 가져옴
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 로딩중...';
            
            setTimeout(() => {
                this.innerHTML = '더 많은 글 보기 <i class="fas fa-chevron-down"></i>';
                alert('추가 글을 불러왔습니다.');
            }, 1000);
        });
    }
    
    // 커뮤니티 가입 버튼
    const joinBtn = document.querySelector('.btn-join-community');
    if (joinBtn) {
        joinBtn.addEventListener('click', function() {
            const isLoggedIn = checkLoginStatus();
            if (!isLoggedIn) {
                alert('커뮤니티 가입을 위해 먼저 로그인해주세요.');
                window.location.href = 'login.html';
                return;
            }
            
            alert('커뮤니티에 가입되었습니다! AI 학습 가이드북이 이메일로 발송되었습니다.');
        });
    }
    
    // 정렬 필터
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', async function() {
            const sortBy = this.value;
            await loadPosts({ sortBy });
        });
    }
    
    // 페이지네이션
    const pageButtons = document.querySelectorAll('.page-btn:not(:disabled)');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 활성 페이지 변경
            document.querySelector('.page-btn.active')?.classList.remove('active');
            this.classList.add('active');
            
            // 페이지 변경 로직
            const pageNum = this.textContent;
            console.log('Page changed to:', pageNum);
        });
    });
    
    // 모달 닫기
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // 모달 외부 클릭시 닫기
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // 실시간 통계 업데이트
    updateCommunityStats();
    
    // 스크롤 애니메이션
    initScrollAnimations();
    
    // 모바일 메뉴 토글
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-active');
            this.innerHTML = navMenu.classList.contains('mobile-active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
});

// 게시글 목록 로드
async function loadPosts(filters = {}) {
    const result = await window.communityAPI.getPosts(filters);
    
    if (result.success) {
        renderForumList(result.data);
        updateCategoryStats();
    }
}

// 포럼 목록 렌더링
function renderForumList(posts) {
    const forumList = document.querySelector('.forum-list');
    if (!forumList) return;
    
    // 공지사항 유지
    const noticeItem = forumList.querySelector('.forum-item.notice');
    
    // 게시글 HTML 생성
    const postsHTML = posts.map(post => {
        const categoryNames = {
            'question': '질문하기',
            'tips': '팁 & 노하우',
            'prompts': '프롬프트 공유',
            'success': '성공 사례',
            'discussion': '자유 토론'
        };
        
        const statusClass = post.isPinned ? 'hot' : 
                          post.comments > 10 ? 'answered' : '';
        
        const statusIcon = post.isPinned ? 'fa-fire' : 
                         post.comments > 10 ? 'fa-check-circle' : 
                         'fa-question-circle';
        
        const statusText = post.isPinned ? '인기' :
                         post.comments > 10 ? '활발' :
                         '답변대기';
        
        return `
            <div class="forum-item" data-post-id="${post.id}">
                <div class="forum-status ${statusClass}">
                    <i class="fas ${statusIcon}"></i>
                    <span>${statusText}</span>
                </div>
                <div class="forum-main">
                    <h3 class="forum-title">
                        <a href="#" onclick="viewPost('${post.id}'); return false;">${post.title}</a>
                        ${post.comments > 0 ? `<span class="reply-count">[${post.comments}]</span>` : ''}
                    </h3>
                    <div class="forum-meta">
                        <span class="category">${categoryNames[post.category] || post.category}</span>
                        <span class="author">${post.author.name}</span>
                        <span class="date">${formatDate(post.createdAt)}</span>
                        <span class="views"><i class="fas fa-eye"></i> ${post.views}</span>
                        <span class="likes"><i class="fas fa-heart"></i> ${post.likes}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 공지사항 + 게시글 표시
    forumList.innerHTML = noticeItem ? noticeItem.outerHTML + postsHTML : postsHTML;
}

// 게시글 상세 보기
async function viewPost(postId) {
    const result = await window.communityAPI.getPost(postId);
    
    if (result.success) {
        showPostDetailModal(result.data);
        
        // 댓글 로드
        const commentsResult = await window.communityAPI.getComments(postId);
        if (commentsResult.success) {
            renderComments(commentsResult.data);
        }
    }
}

// 게시글 상세 모달 표시
function showPostDetailModal(post) {
    // 기존 모달 제거
    const existingModal = document.getElementById('postDetailModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isAuthor = currentUser.id === post.author.id;
    const isAdmin = currentUser.role === 'admin';
    
    const modal = document.createElement('div');
    modal.id = 'postDetailModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content post-detail-modal">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            
            <div class="post-header">
                <div class="post-category">${getCategoryName(post.category)}</div>
                <h2 class="post-title">${post.title}</h2>
                <div class="post-meta">
                    <div class="author-info">
                        <img src="${post.author.avatar}" alt="${post.author.name}">
                        <div>
                            <span class="author-name">${post.author.name}</span>
                            <span class="post-date">${formatDate(post.createdAt)}</span>
                        </div>
                    </div>
                    <div class="post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views}</span>
                        <span class="like-btn" onclick="toggleLike('${post.id}')">
                            <i class="fas fa-heart"></i> <span class="like-count">${post.likes}</span>
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="post-content">
                ${post.content.replace(/\n/g, '<br>')}
            </div>
            
            ${post.tags && post.tags.length > 0 ? `
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            ` : ''}
            
            ${isAuthor || isAdmin ? `
                <div class="post-actions">
                    <button class="btn-edit" onclick="editPost('${post.id}')">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button class="btn-delete" onclick="deletePost('${post.id}')">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            ` : ''}
            
            <div class="comments-section">
                <h3>댓글 <span class="comment-count">${post.comments}</span></h3>
                
                <div class="comment-form">
                    <textarea id="commentContent" placeholder="댓글을 작성해주세요..." rows="3"></textarea>
                    <button class="btn-comment" onclick="submitComment('${post.id}')">댓글 작성</button>
                </div>
                
                <div class="comments-list" id="commentsList">
                    <!-- 댓글이 여기에 표시됩니다 -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 스타일 추가
    if (!document.getElementById('post-detail-styles')) {
        const style = document.createElement('style');
        style.id = 'post-detail-styles';
        style.textContent = `
            .post-detail-modal {
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .post-header {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e9ecef;
            }
            
            .post-category {
                display: inline-block;
                padding: 6px 12px;
                background: #31E0AA;
                color: #1a1a1a;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .post-title {
                font-size: 28px;
                margin-bottom: 15px;
                color: #2d3e50;
            }
            
            .post-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .author-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .author-info img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
            }
            
            .author-name {
                font-weight: 600;
                display: block;
                margin-bottom: 2px;
            }
            
            .post-date {
                font-size: 12px;
                color: #6c757d;
            }
            
            .post-stats {
                display: flex;
                gap: 20px;
                color: #6c757d;
            }
            
            .like-btn {
                cursor: pointer;
                transition: color 0.3s ease;
            }
            
            .like-btn:hover {
                color: #dc3545;
            }
            
            .like-btn.liked {
                color: #dc3545;
            }
            
            .post-content {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
                color: #495057;
            }
            
            .post-tags {
                margin-bottom: 30px;
            }
            
            .post-actions {
                display: flex;
                gap: 10px;
                margin-bottom: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
            }
            
            .btn-edit, .btn-delete {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-edit {
                background: #e9ecef;
                color: #495057;
            }
            
            .btn-edit:hover {
                background: #dee2e6;
            }
            
            .btn-delete {
                background: #f8d7da;
                color: #721c24;
            }
            
            .btn-delete:hover {
                background: #f5c6cb;
            }
            
            .comments-section {
                margin-top: 40px;
            }
            
            .comments-section h3 {
                margin-bottom: 20px;
                color: #2d3e50;
            }
            
            .comment-form {
                margin-bottom: 30px;
            }
            
            .comment-form textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                resize: vertical;
                font-family: inherit;
            }
            
            .btn-comment {
                margin-top: 10px;
                padding: 10px 20px;
                background: #31E0AA;
                color: #1a1a1a;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-comment:hover {
                background: #28c997;
                transform: translateY(-2px);
            }
            
            .comment-item {
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .comment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .comment-author {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .comment-author img {
                width: 32px;
                height: 32px;
                border-radius: 50%;
            }
            
            .comment-content {
                color: #495057;
                line-height: 1.6;
            }
        `;
        document.head.appendChild(style);
    }
}

// 댓글 렌더링
function renderComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <div class="comment-author">
                    <img src="${comment.author.avatar}" alt="${comment.author.name}">
                    <div>
                        <strong>${comment.author.name}</strong>
                        <span class="comment-date">${formatDate(comment.createdAt)}</span>
                    </div>
                </div>
            </div>
            <div class="comment-content">
                ${comment.content.replace(/\n/g, '<br>')}
            </div>
        </div>
    `).join('');
}

// 댓글 작성
async function submitComment(postId) {
    const content = document.getElementById('commentContent').value.trim();
    
    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }
    
    if (!checkLoginStatus()) {
        alert('댓글 작성을 위해 로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }
    
    const result = await window.communityAPI.createComment(postId, { content });
    
    if (result.success) {
        document.getElementById('commentContent').value = '';
        
        // 댓글 목록 새로고침
        const commentsResult = await window.communityAPI.getComments(postId);
        if (commentsResult.success) {
            renderComments(commentsResult.data);
            
            // 댓글 수 업데이트
            const commentCount = document.querySelector('.comment-count');
            if (commentCount) {
                commentCount.textContent = commentsResult.data.length;
            }
        }
    } else {
        alert(result.error || '댓글 작성에 실패했습니다.');
    }
}

// 좋아요 토글
async function toggleLike(postId) {
    if (!checkLoginStatus()) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }
    
    const result = await window.communityAPI.toggleLike(postId);
    
    if (result.success) {
        const likeBtn = document.querySelector('.like-btn');
        const likeCount = document.querySelector('.like-count');
        
        if (result.data.liked) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
        
        likeCount.textContent = result.data.likeCount;
    }
}

// 게시글 수정
async function editPost(postId) {
    const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const post = posts.find(p => p.id === postId);
    
    if (!post) return;
    
    // 수정 모달 표시
    showEditModal(post);
}

// 수정 모달 표시
function showEditModal(post) {
    const existingModal = document.getElementById('editModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content write-modal">
            <button class="modal-close" onclick="closeModal()">&times;</button>
            <h2>글 수정</h2>
            
            <form id="editForm">
                <input type="hidden" name="postId" value="${post.id}">
                
                <div class="form-group">
                    <label>카테고리 <span class="required">*</span></label>
                    <select name="category" required>
                        <option value="">선택하세요</option>
                        <option value="question" ${post.category === 'question' ? 'selected' : ''}>질문하기</option>
                        <option value="tips" ${post.category === 'tips' ? 'selected' : ''}>팁 & 노하우</option>
                        <option value="prompts" ${post.category === 'prompts' ? 'selected' : ''}>프롬프트 공유</option>
                        <option value="success" ${post.category === 'success' ? 'selected' : ''}>성공 사례</option>
                        <option value="discussion" ${post.category === 'discussion' ? 'selected' : ''}>자유 토론</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>제목 <span class="required">*</span></label>
                    <input type="text" name="title" value="${post.title}" required>
                </div>
                
                <div class="form-group">
                    <label>내용 <span class="required">*</span></label>
                    <textarea name="content" rows="10" required>${post.content}</textarea>
                </div>
                
                <div class="form-group">
                    <label>태그</label>
                    <input type="text" name="tags" value="${post.tags ? post.tags.join(', ') : ''}" placeholder="#ChatGPT #프롬프트 (쉼표로 구분)">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="closeModal()">취소</button>
                    <button type="submit" class="btn-submit">수정하기</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 수정 폼 제출 이벤트
    document.getElementById('editForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        const postId = data.postId;
        delete data.postId;
        
        // 태그 파싱
        if (data.tags) {
            data.tags = data.tags.split(',').map(tag => tag.trim().replace('#', ''));
        } else {
            data.tags = [];
        }
        
        const result = await window.communityAPI.updatePost(postId, data);
        
        if (result.success) {
            alert('글이 수정되었습니다.');
            closeModal();
            location.reload();
        } else {
            alert(result.error || '수정에 실패했습니다.');
        }
    });
}

// 게시글 삭제
async function deletePost(postId) {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
        return;
    }
    
    const result = await window.communityAPI.deletePost(postId);
    
    if (result.success) {
        alert('게시글이 삭제되었습니다.');
        closeModal();
        await loadPosts();
    } else {
        alert(result.error || '삭제에 실패했습니다.');
    }
}

// 글쓰기 모달 표시
function showWriteModal() {
    const writeModal = document.getElementById('writeModal');
    if (writeModal) {
        writeModal.classList.add('active');
    }
}

// 카테고리별 통계 업데이트
async function updateCategoryStats() {
    const result = await window.communityAPI.getStatistics();
    
    if (result.success) {
        const counts = document.querySelectorAll('.category-list .count');
        const stats = result.data;
        
        // 각 카테고리의 개수 업데이트
        counts.forEach((countEl, index) => {
            const categories = ['all', 'question', 'tips', 'prompts', 'success', 'discussion'];
            const category = categories[index];
            
            if (stats[category] !== undefined) {
                countEl.textContent = stats[category];
            }
        });
    }
}

// 카테고리 이름 가져오기
function getCategoryName(category) {
    const names = {
        'question': '질문하기',
        'tips': '팁 & 노하우',
        'prompts': '프롬프트 공유',
        'success': '성공 사례',
        'discussion': '자유 토론'
    };
    return names[category] || category;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
}

// 로그인 상태 확인
function checkLoginStatus() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// 모달 닫기
function closeModal() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
        
        // 동적으로 생성된 모달은 제거
        if (modal.id === 'postDetailModal' || modal.id === 'editModal') {
            modal.remove();
        }
    });
}

// 커뮤니티 통계 업데이트 (데모용)
function updateCommunityStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    // 카운트 애니메이션
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent.replace(/,/g, ''));
        let current = 0;
        const increment = target / 50;
        
        const updateCount = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCount);
            } else {
                stat.textContent = target.toLocaleString();
            }
        };
        
        updateCount();
    });
    
    // 실시간 업데이트 시뮬레이션
    setInterval(() => {
        // 일일 활성 사용자
        const activeUsers = statNumbers[0];
        const currentActive = parseInt(activeUsers.textContent.replace(/,/g, ''));
        const change = Math.floor(Math.random() * 10) - 5; // -5 ~ +5
        activeUsers.textContent = (currentActive + change).toLocaleString();
        
        // 게시글 수 증가
        const posts = statNumbers[1];
        const currentPosts = parseInt(posts.textContent.replace(/,/g, ''));
        if (Math.random() > 0.7) {
            posts.textContent = (currentPosts + 1).toLocaleString();
        }
    }, 30000); // 30초마다 업데이트
}

// 스크롤 애니메이션
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들
    const animateElements = document.querySelectorAll(
        '.article-card, .benefit-card, .activity-card'
    );
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(el);
    });
}

// 좋아요 기능 (데모)
document.querySelectorAll('.engagement .fa-heart').forEach(heart => {
    heart.parentElement.style.cursor = 'pointer';
    heart.parentElement.addEventListener('click', function() {
        const count = parseInt(this.textContent.match(/\d+/)[0]);
        const isLiked = this.classList.contains('liked');
        
        if (isLiked) {
            this.textContent = ` ${count - 1}`;
            this.classList.remove('liked');
            heart.style.color = '';
        } else {
            this.textContent = ` ${count + 1}`;
            this.classList.add('liked');
            heart.style.color = 'var(--error-color)';
        }
    });
});

// 전역 함수로 내보내기
window.viewPost = viewPost;
window.toggleLike = toggleLike;
window.submitComment = submitComment;
window.editPost = editPost;
window.deletePost = deletePost;
window.closeModal = closeModal;