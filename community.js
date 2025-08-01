// 학습 커뮤니티 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 카테고리 필터링
    const categoryLinks = document.querySelectorAll('.category-list a');
    const forumItems = document.querySelectorAll('.forum-item');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 활성 카테고리 변경
            document.querySelector('.category-list li.active')?.classList.remove('active');
            this.parentElement.classList.add('active');
            
            // 카테고리에 따른 필터링 (실제로는 서버에서 데이터를 가져옴)
            const category = this.textContent.trim();
            console.log('Selected category:', category);
        });
    });
    
    // 태그 클릭 이벤트
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            console.log('Selected tag:', this.textContent);
            // 태그에 따른 필터링 로직
        });
    });
    
    // 글쓰기 버튼
    const writeBtn = document.querySelector('.btn-write');
    const writeModal = document.getElementById('writeModal');
    
    if (writeBtn) {
        writeBtn.addEventListener('click', function() {
            // 로그인 체크
            const isLoggedIn = checkLoginStatus();
            if (!isLoggedIn) {
                alert('글쓰기를 위해 로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }
            
            writeModal.classList.add('active');
        });
    }
    
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
    
    // 글쓰기 폼 제출
    const writeForm = document.getElementById('writeForm');
    if (writeForm) {
        writeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // 유효성 검사
            if (!data.category || !data.title || !data.content) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }
            
            // 실제로는 서버로 데이터 전송
            console.log('Post data:', data);
            
            alert('글이 성공적으로 등록되었습니다!');
            writeModal.classList.remove('active');
            this.reset();
            
            // 게시글 목록 새로고침 (실제로는 AJAX로 처리)
            location.reload();
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
        filterSelect.addEventListener('change', function() {
            const sortBy = this.value;
            console.log('Sort by:', sortBy);
            // 정렬 로직 구현
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

// 로그인 상태 확인
function checkLoginStatus() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// 모달 닫기
function closeModal() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
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