// 검색 UI 컴포넌트
class SearchComponent {
    constructor() {
        this.searchModal = null;
        this.searchInput = null;
        this.resultsContainer = null;
        this.suggestionsContainer = null;
        this.isSearching = false;
        
        this.init();
    }

    init() {
        // 검색 모달 생성
        this.createSearchModal();
        
        // 검색 버튼 이벤트 바인딩
        this.bindSearchButtons();
        
        // 키보드 단축키 설정
        this.setupKeyboardShortcuts();
    }

    createSearchModal() {
        // 검색 모달 HTML
        const modalHTML = `
            <div id="searchModal" class="search-modal">
                <div class="search-modal-content">
                    <div class="search-header">
                        <div class="search-input-wrapper">
                            <i class="fas fa-search"></i>
                            <input type="text" id="searchInput" placeholder="강의, 강사, 게시글 검색..." autocomplete="off">
                            <button class="search-close" onclick="searchComponent.closeSearch()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="search-filters">
                            <select id="searchTypeFilter">
                                <option value="all">전체</option>
                                <option value="courses">강의</option>
                                <option value="posts">게시글</option>
                                <option value="instructors">강사</option>
                                <option value="faq">FAQ</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="search-suggestions" id="searchSuggestions">
                        <!-- 자동완성 제안이 여기에 표시됩니다 -->
                    </div>
                    
                    <div class="search-results" id="searchResults">
                        <div class="search-welcome">
                            <i class="fas fa-search"></i>
                            <h3>무엇을 찾고 계신가요?</h3>
                            <p>강의, 강사, 커뮤니티 게시글을 검색해보세요</p>
                            
                            <div class="popular-searches">
                                <h4>인기 검색어</h4>
                                <div class="popular-tags" id="popularTags">
                                    <!-- 인기 검색어가 여기에 표시됩니다 -->
                                </div>
                            </div>
                            
                            <div class="recent-searches">
                                <h4>최근 검색어</h4>
                                <div class="recent-list" id="recentSearches">
                                    <!-- 최근 검색어가 여기에 표시됩니다 -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 모달 스타일
        const styleHTML = `
            <style>
                .search-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .search-modal.active {
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 100px;
                    opacity: 1;
                }

                .search-modal-content {
                    background: white;
                    width: 90%;
                    max-width: 800px;
                    max-height: 80vh;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    transform: translateY(-20px);
                    transition: transform 0.3s ease;
                }

                .search-modal.active .search-modal-content {
                    transform: translateY(0);
                }

                .search-header {
                    padding: 20px;
                    border-bottom: 1px solid #e9ecef;
                }

                .search-input-wrapper {
                    position: relative;
                    margin-bottom: 15px;
                }

                .search-input-wrapper i {
                    position: absolute;
                    left: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6c757d;
                    font-size: 20px;
                }

                #searchInput {
                    width: 100%;
                    padding: 15px 50px 15px 55px;
                    font-size: 18px;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    outline: none;
                    transition: border-color 0.3s ease;
                }

                #searchInput:focus {
                    border-color: #31E0AA;
                }

                .search-close {
                    position: absolute;
                    right: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #6c757d;
                    cursor: pointer;
                    padding: 5px 10px;
                    transition: color 0.3s ease;
                }

                .search-close:hover {
                    color: #2d3e50;
                }

                .search-filters {
                    display: flex;
                    gap: 10px;
                }

                .search-filters select {
                    padding: 8px 16px;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                }

                .search-suggestions {
                    display: none;
                    padding: 10px 20px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                }

                .search-suggestions.active {
                    display: block;
                }

                .suggestion-item {
                    padding: 8px 12px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: background 0.2s ease;
                }

                .suggestion-item:hover {
                    background: #e9ecef;
                }

                .search-results {
                    padding: 20px;
                    max-height: calc(80vh - 200px);
                    overflow-y: auto;
                }

                .search-welcome {
                    text-align: center;
                    padding: 40px 20px;
                    color: #6c757d;
                }

                .search-welcome i {
                    font-size: 48px;
                    margin-bottom: 20px;
                    opacity: 0.5;
                }

                .search-welcome h3 {
                    color: #2d3e50;
                    margin-bottom: 10px;
                }

                .popular-searches, .recent-searches {
                    margin-top: 40px;
                }

                .popular-searches h4, .recent-searches h4 {
                    color: #2d3e50;
                    margin-bottom: 15px;
                    font-size: 16px;
                }

                .popular-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: center;
                }

                .popular-tag {
                    padding: 8px 16px;
                    background: #e9ecef;
                    border-radius: 20px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .popular-tag:hover {
                    background: #31E0AA;
                    color: white;
                    transform: translateY(-2px);
                }

                .recent-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    align-items: center;
                }

                .recent-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 16px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }

                .recent-item:hover {
                    background: #e9ecef;
                }

                .recent-item i {
                    color: #6c757d;
                    font-size: 14px;
                }

                .search-loading {
                    text-align: center;
                    padding: 40px;
                    color: #6c757d;
                }

                .search-loading i {
                    font-size: 32px;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .search-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: #6c757d;
                }

                .search-empty i {
                    font-size: 48px;
                    margin-bottom: 20px;
                    opacity: 0.5;
                }

                .result-section {
                    margin-bottom: 30px;
                }

                .result-section h3 {
                    font-size: 18px;
                    color: #2d3e50;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .result-count {
                    font-size: 14px;
                    color: #6c757d;
                    font-weight: normal;
                }

                .result-item {
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .result-item:hover {
                    background: #e9ecef;
                    transform: translateX(5px);
                }

                .result-item h4 {
                    font-size: 16px;
                    color: #2d3e50;
                    margin-bottom: 5px;
                }

                .result-item p {
                    font-size: 14px;
                    color: #6c757d;
                    margin-bottom: 5px;
                }

                .result-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: #6c757d;
                }

                .result-type {
                    display: inline-block;
                    padding: 2px 8px;
                    background: #31E0AA;
                    color: white;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .search-shortcut {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #2d3e50;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    opacity: 0.8;
                    pointer-events: none;
                }
            </style>
        `;

        // DOM에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.head.insertAdjacentHTML('beforeend', styleHTML);

        // 요소 참조 저장
        this.searchModal = document.getElementById('searchModal');
        this.searchInput = document.getElementById('searchInput');
        this.resultsContainer = document.getElementById('searchResults');
        this.suggestionsContainer = document.getElementById('searchSuggestions');

        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 검색 입력 이벤트
        this.searchInput.addEventListener('input', this.debounce((e) => {
            const query = e.target.value;
            if (query.length >= 2) {
                this.performSearch(query);
            } else if (query.length > 0) {
                this.showSuggestions(query);
            } else {
                this.showWelcomeScreen();
            }
        }, 300));

        // 검색 필터 변경
        document.getElementById('searchTypeFilter').addEventListener('change', () => {
            const query = this.searchInput.value;
            if (query.length >= 2) {
                this.performSearch(query);
            }
        });

        // 모달 외부 클릭 시 닫기
        this.searchModal.addEventListener('click', (e) => {
            if (e.target === this.searchModal) {
                this.closeSearch();
            }
        });
    }

    bindSearchButtons() {
        // 모든 검색 버튼에 이벤트 바인딩
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-search') || e.target.closest('[data-search-trigger]')) {
                e.preventDefault();
                this.openSearch();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K로 검색 열기
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
            
            // ESC로 검색 닫기
            if (e.key === 'Escape' && this.searchModal.classList.contains('active')) {
                this.closeSearch();
            }
        });
    }

    openSearch() {
        this.searchModal.classList.add('active');
        this.searchInput.focus();
        this.showWelcomeScreen();
        
        // 검색 단축키 안내 표시
        this.showShortcutHint();
    }

    closeSearch() {
        this.searchModal.classList.remove('active');
        this.searchInput.value = '';
        this.resultsContainer.innerHTML = '';
        this.suggestionsContainer.innerHTML = '';
        this.suggestionsContainer.classList.remove('active');
    }

    async performSearch(query) {
        if (this.isSearching) return;
        
        this.isSearching = true;
        this.showLoading();
        
        try {
            const filter = document.getElementById('searchTypeFilter').value;
            const result = await window.searchAPI.search(query, { type: filter });
            
            if (result.success) {
                this.displayResults(result.data, query);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('검색 오류:', error);
            this.showError('검색 중 오류가 발생했습니다.');
        } finally {
            this.isSearching = false;
        }
    }

    async showSuggestions(query) {
        const result = await window.searchAPI.getSuggestions(query);
        
        if (result.success && result.data.length > 0) {
            this.suggestionsContainer.innerHTML = result.data.map(suggestion => `
                <div class="suggestion-item" onclick="searchComponent.searchFromSuggestion('${suggestion}')">
                    <i class="fas fa-search"></i> ${suggestion}
                </div>
            `).join('');
            this.suggestionsContainer.classList.add('active');
        } else {
            this.suggestionsContainer.classList.remove('active');
        }
    }

    searchFromSuggestion(query) {
        this.searchInput.value = query;
        this.performSearch(query);
        this.suggestionsContainer.classList.remove('active');
    }

    showWelcomeScreen() {
        const popularSearches = window.searchAPI.getPopularSearches();
        const recentSearches = window.searchAPI.getRecentSearches();
        
        this.resultsContainer.innerHTML = `
            <div class="search-welcome">
                <i class="fas fa-search"></i>
                <h3>무엇을 찾고 계신가요?</h3>
                <p>강의, 강사, 커뮤니티 게시글을 검색해보세요</p>
                
                ${popularSearches.length > 0 ? `
                    <div class="popular-searches">
                        <h4>인기 검색어</h4>
                        <div class="popular-tags">
                            ${popularSearches.map(search => `
                                <span class="popular-tag" onclick="searchComponent.searchFromTag('${search}')">
                                    ${search}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${recentSearches.length > 0 ? `
                    <div class="recent-searches">
                        <h4>최근 검색어</h4>
                        <div class="recent-list">
                            ${recentSearches.map(search => `
                                <div class="recent-item" onclick="searchComponent.searchFromTag('${search}')">
                                    <i class="fas fa-history"></i>
                                    <span>${search}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    searchFromTag(query) {
        this.searchInput.value = query;
        this.performSearch(query);
    }

    showLoading() {
        this.resultsContainer.innerHTML = `
            <div class="search-loading">
                <i class="fas fa-spinner"></i>
                <p>검색 중...</p>
            </div>
        `;
    }

    showError(message) {
        this.resultsContainer.innerHTML = `
            <div class="search-empty">
                <i class="fas fa-exclamation-circle"></i>
                <h3>오류가 발생했습니다</h3>
                <p>${message}</p>
            </div>
        `;
    }

    displayResults(results, query) {
        if (results.total === 0) {
            this.resultsContainer.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <h3>검색 결과가 없습니다</h3>
                    <p>"${query}"에 대한 검색 결과를 찾을 수 없습니다.</p>
                    <p>다른 검색어로 시도해보세요.</p>
                </div>
            `;
            return;
        }

        let html = '';

        // 강의 결과
        if (results.courses.length > 0) {
            html += `
                <div class="result-section">
                    <h3>
                        <i class="fas fa-graduation-cap"></i>
                        강의
                        <span class="result-count">(${results.courses.length})</span>
                    </h3>
                    ${results.courses.map(course => `
                        <div class="result-item" onclick="window.location.href='${course.url}'">
                            <span class="result-type">${course.type === 'online' ? '온라인' : '오프라인'}</span>
                            <h4>${this.highlightQuery(course.title, query)}</h4>
                            <p>${this.highlightQuery(course.description, query)}</p>
                            <div class="result-meta">
                                <span><i class="fas fa-user"></i> ${course.instructor}</span>
                                <span><i class="fas fa-won-sign"></i> ${course.price.toLocaleString()}원</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // 게시글 결과
        if (results.posts.length > 0) {
            html += `
                <div class="result-section">
                    <h3>
                        <i class="fas fa-comments"></i>
                        커뮤니티 게시글
                        <span class="result-count">(${results.posts.length})</span>
                    </h3>
                    ${results.posts.map(post => `
                        <div class="result-item" onclick="window.location.href='${post.url}'">
                            <span class="result-type">게시글</span>
                            <h4>${this.highlightQuery(post.title, query)}</h4>
                            <p>${this.highlightQuery(post.content, query)}</p>
                            <div class="result-meta">
                                <span><i class="fas fa-user"></i> ${post.author}</span>
                                <span><i class="fas fa-folder"></i> ${this.getCategoryName(post.category)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // 강사 결과
        if (results.instructors.length > 0) {
            html += `
                <div class="result-section">
                    <h3>
                        <i class="fas fa-chalkboard-teacher"></i>
                        강사
                        <span class="result-count">(${results.instructors.length})</span>
                    </h3>
                    ${results.instructors.map(instructor => `
                        <div class="result-item" onclick="window.location.href='${instructor.url}'">
                            <span class="result-type">강사</span>
                            <h4>${this.highlightQuery(instructor.name, query)} - ${instructor.title}</h4>
                            <p>${this.highlightQuery(instructor.bio, query)}</p>
                            <div class="result-meta">
                                <span><i class="fas fa-book"></i> ${instructor.courses.join(', ')}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // FAQ 결과
        if (results.faq.length > 0) {
            html += `
                <div class="result-section">
                    <h3>
                        <i class="fas fa-question-circle"></i>
                        FAQ
                        <span class="result-count">(${results.faq.length})</span>
                    </h3>
                    ${results.faq.map(faq => `
                        <div class="result-item" onclick="window.location.href='${faq.url}'">
                            <span class="result-type">FAQ</span>
                            <h4>${this.highlightQuery(faq.question, query)}</h4>
                            <p>${this.highlightQuery(faq.answer, query)}</p>
                            <div class="result-meta">
                                <span><i class="fas fa-tag"></i> ${faq.category}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        this.resultsContainer.innerHTML = html;
    }

    highlightQuery(text, query) {
        if (!text || !query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    getCategoryName(category) {
        const names = {
            'question': '질문하기',
            'tips': '팁 & 노하우',
            'prompts': '프롬프트 공유',
            'success': '성공 사례',
            'discussion': '자유 토론'
        };
        return names[category] || category;
    }

    showShortcutHint() {
        const hint = document.createElement('div');
        hint.className = 'search-shortcut';
        hint.innerHTML = 'Ctrl + K 로 검색';
        document.body.appendChild(hint);
        
        setTimeout(() => {
            hint.remove();
        }, 3000);
    }

    debounce(func, wait) {
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
}

// 전역 인스턴스 생성
window.searchComponent = new SearchComponent();

console.log('검색 컴포넌트 로드 완료');