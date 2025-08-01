// 실시간 콘텐츠 편집기

class ContentEditor {
    constructor() {
        this.editMode = true;
        this.selectedElement = null;
        this.originalContent = {};
        this.changes = new Map();
        this.currentPage = 'index';
        this.editorFrame = null;
        this.frameDocument = null;
        
        this.init();
    }
    
    init() {
        // iframe 로드 대기
        this.editorFrame = document.getElementById('editorFrame');
        this.editorFrame.onload = () => {
            this.frameDocument = this.editorFrame.contentDocument;
            this.initializeEditor();
        };
        
        // 이벤트 리스너
        this.setupEventListeners();
        
        // 미디어 라이브러리 초기화
        this.loadMediaLibrary();
        
        // 자동 저장 (5분마다)
        setInterval(() => this.autoSave(), 5 * 60 * 1000);
    }
    
    initializeEditor() {
        // 편집 가능 요소 표시
        this.makeElementsEditable();
        
        // 스타일 주입
        this.injectEditorStyles();
        
        // 이벤트 바인딩
        this.bindFrameEvents();
        
        // 원본 콘텐츠 저장
        this.saveOriginalContent();
    }
    
    makeElementsEditable() {
        const editableSelectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span:not(.no-edit)',
            'a', 'button',
            'img',
            'section', 'div.editable',
            '.hero-title', '.hero-subtitle',
            '.section-header', '.card-title',
            '.btn-primary', '.btn-secondary',
            '.price', '.stat-number'
        ];
        
        editableSelectors.forEach(selector => {
            this.frameDocument.querySelectorAll(selector).forEach(element => {
                element.classList.add('editable-element');
                element.dataset.editorId = this.generateId();
                
                // 편집 오버레이 추가
                const overlay = document.createElement('div');
                overlay.className = 'edit-overlay';
                overlay.textContent = this.getElementType(element);
                element.appendChild(overlay);
            });
        });
    }
    
    injectEditorStyles() {
        const style = this.frameDocument.createElement('style');
        style.textContent = `
            .editable-element {
                position: relative;
                outline: 2px dashed transparent;
                transition: all 0.2s;
                cursor: pointer !important;
            }
            
            .editable-element:hover {
                outline-color: #2196F3 !important;
            }
            
            .editable-element.selected {
                outline: 2px solid #2196F3 !important;
                box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.2) !important;
            }
            
            .edit-overlay {
                position: absolute;
                top: -30px;
                right: 0;
                background: #2196F3;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                display: none;
                z-index: 10000;
                pointer-events: none;
            }
            
            .editable-element:hover .edit-overlay,
            .editable-element.selected .edit-overlay {
                display: block;
            }
            
            .drop-zone {
                min-height: 50px;
                border: 2px dashed #2196F3;
                border-radius: 8px;
                margin: 10px 0;
                background: rgba(33, 150, 243, 0.05);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #2196F3;
                font-weight: 500;
            }
            
            .component-preview {
                border: 2px solid #4CAF50;
                border-radius: 8px;
                padding: 20px;
                margin: 10px 0;
                position: relative;
            }
            
            .component-actions {
                position: absolute;
                top: -15px;
                right: 10px;
                display: flex;
                gap: 5px;
            }
            
            .component-btn {
                width: 30px;
                height: 30px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }
            
            .component-btn:hover {
                background: #f5f5f5;
            }
            
            @media (max-width: 768px) {
                .edit-overlay {
                    font-size: 10px;
                    padding: 2px 6px;
                }
            }
        `;
        this.frameDocument.head.appendChild(style);
    }
    
    bindFrameEvents() {
        // 클릭 이벤트
        this.frameDocument.addEventListener('click', (e) => {
            const element = e.target.closest('.editable-element');
            if (element) {
                e.preventDefault();
                e.stopPropagation();
                this.selectElement(element);
            }
        });
        
        // 더블클릭으로 인라인 편집
        this.frameDocument.addEventListener('dblclick', (e) => {
            const element = e.target.closest('.editable-element');
            if (element && this.isTextElement(element)) {
                e.preventDefault();
                this.startInlineEdit(element);
            }
        });
        
        // 키보드 단축키
        this.frameDocument.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveAll();
                        break;
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                }
            }
            
            if (e.key === 'Delete' && this.selectedElement) {
                e.preventDefault();
                this.deleteElement();
            }
        });
    }
    
    selectElement(element) {
        // 이전 선택 해제
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
        }
        
        // 새 요소 선택
        this.selectedElement = element;
        element.classList.add('selected');
        
        // 사이드바 업데이트
        this.updateSidebar(element);
    }
    
    updateSidebar(element) {
        const elementInfo = document.getElementById('elementInfo');
        const editTools = document.getElementById('editTools');
        
        // 요소 정보 표시
        const elementType = this.getElementType(element);
        elementInfo.innerHTML = `
            <h4>선택된 요소</h4>
            <p><strong>타입:</strong> ${elementType}</p>
            <p><strong>클래스:</strong> ${element.className || '없음'}</p>
            <p><strong>ID:</strong> ${element.id || '없음'}</p>
        `;
        
        // 편집 도구 표시
        editTools.style.display = 'block';
        this.showEditPanel(element);
    }
    
    showEditPanel(element) {
        // 모든 패널 숨기기
        document.querySelectorAll('.edit-panel').forEach(panel => {
            panel.style.display = 'none';
        });
        
        const tagName = element.tagName.toLowerCase();
        
        // 텍스트 요소
        if (this.isTextElement(element)) {
            this.showTextEditPanel(element);
        }
        // 이미지
        else if (tagName === 'img') {
            this.showImageEditPanel(element);
        }
        // 링크
        else if (tagName === 'a') {
            this.showLinkEditPanel(element);
        }
        // 버튼
        else if (tagName === 'button' || element.classList.contains('btn')) {
            this.showButtonEditPanel(element);
        }
        // 섹션
        else if (tagName === 'section' || tagName === 'div') {
            this.showSectionEditPanel(element);
        }
    }
    
    showTextEditPanel(element) {
        const panel = document.getElementById('textEditPanel');
        panel.style.display = 'block';
        
        // 현재 값 설정
        document.getElementById('textContent').value = element.textContent;
        document.getElementById('fontSize').value = parseInt(getComputedStyle(element).fontSize);
        document.getElementById('textColor').value = this.rgbToHex(getComputedStyle(element).color);
        
        // 정렬 버튼
        const textAlign = getComputedStyle(element).textAlign;
        document.querySelectorAll('.align-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.align === textAlign);
        });
    }
    
    showImageEditPanel(element) {
        const panel = document.getElementById('imageEditPanel');
        panel.style.display = 'block';
        
        document.getElementById('imageSrc').value = element.src;
        document.getElementById('imageAlt').value = element.alt;
        document.getElementById('imageWidth').value = element.width;
        document.getElementById('imageHeight').value = element.height;
    }
    
    showLinkEditPanel(element) {
        const panel = document.getElementById('linkEditPanel');
        panel.style.display = 'block';
        
        document.getElementById('linkHref').value = element.href;
        document.getElementById('linkTarget').value = element.target || '_self';
        
        // 텍스트 편집도 함께 표시
        this.showTextEditPanel(element);
    }
    
    showButtonEditPanel(element) {
        const panel = document.getElementById('buttonEditPanel');
        panel.style.display = 'block';
        
        document.getElementById('buttonText').value = element.textContent;
        
        // 버튼 액션 분석
        const onclick = element.getAttribute('onclick');
        if (onclick) {
            if (onclick.includes('location.href')) {
                document.getElementById('buttonAction').value = 'link';
                document.getElementById('actionValue').value = onclick.match(/'([^']+)'/)?.[1] || '';
            } else if (onclick.includes('download')) {
                document.getElementById('buttonAction').value = 'download';
            } else if (onclick.includes('openPopup')) {
                document.getElementById('buttonAction').value = 'popup';
            }
        }
        
        // 스타일 분석
        if (element.classList.contains('btn-primary')) {
            document.getElementById('buttonStyle').value = 'primary';
        } else if (element.classList.contains('btn-secondary')) {
            document.getElementById('buttonStyle').value = 'secondary';
        }
    }
    
    showSectionEditPanel(element) {
        const panel = document.getElementById('sectionEditPanel');
        panel.style.display = 'block';
        
        const style = getComputedStyle(element);
        document.getElementById('sectionBgColor').value = this.rgbToHex(style.backgroundColor);
        
        // 패딩
        document.getElementById('paddingTop').value = parseInt(style.paddingTop);
        document.getElementById('paddingRight').value = parseInt(style.paddingRight);
        document.getElementById('paddingBottom').value = parseInt(style.paddingBottom);
        document.getElementById('paddingLeft').value = parseInt(style.paddingLeft);
        
        // 표시 상태
        document.getElementById('sectionVisible').checked = style.display !== 'none';
    }
    
    applyChanges() {
        if (!this.selectedElement) return;
        
        const element = this.selectedElement;
        const tagName = element.tagName.toLowerCase();
        
        // 변경사항 저장
        const elementId = element.dataset.editorId;
        const changes = {};
        
        // 텍스트 변경
        if (this.isTextElement(element)) {
            const newText = document.getElementById('textContent').value;
            if (newText !== element.textContent) {
                element.textContent = newText;
                changes.text = newText;
            }
            
            const fontSize = document.getElementById('fontSize').value + 'px';
            if (fontSize !== element.style.fontSize) {
                element.style.fontSize = fontSize;
                changes.fontSize = fontSize;
            }
            
            const color = document.getElementById('textColor').value;
            if (color !== element.style.color) {
                element.style.color = color;
                changes.color = color;
            }
            
            // 정렬
            const align = document.querySelector('.align-btn.active')?.dataset.align;
            if (align && align !== element.style.textAlign) {
                element.style.textAlign = align;
                changes.textAlign = align;
            }
        }
        
        // 이미지 변경
        if (tagName === 'img') {
            const src = document.getElementById('imageSrc').value;
            if (src !== element.src) {
                element.src = src;
                changes.src = src;
            }
            
            const alt = document.getElementById('imageAlt').value;
            if (alt !== element.alt) {
                element.alt = alt;
                changes.alt = alt;
            }
            
            const width = document.getElementById('imageWidth').value;
            if (width) {
                element.width = width;
                changes.width = width;
            }
            
            const height = document.getElementById('imageHeight').value;
            if (height) {
                element.height = height;
                changes.height = height;
            }
        }
        
        // 링크 변경
        if (tagName === 'a') {
            const href = document.getElementById('linkHref').value;
            if (href !== element.href) {
                element.href = href;
                changes.href = href;
            }
            
            const target = document.getElementById('linkTarget').value;
            if (target !== element.target) {
                element.target = target;
                changes.target = target;
            }
        }
        
        // 버튼 변경
        if (tagName === 'button' || element.classList.contains('btn')) {
            const text = document.getElementById('buttonText').value;
            if (text !== element.textContent) {
                element.textContent = text;
                changes.buttonText = text;
            }
            
            const action = document.getElementById('buttonAction').value;
            const actionValue = document.getElementById('actionValue').value;
            
            if (action === 'link' && actionValue) {
                element.setAttribute('onclick', `window.location.href='${actionValue}'`);
                changes.onclick = `window.location.href='${actionValue}'`;
            } else if (action === 'popup') {
                element.setAttribute('onclick', `openPopup('${actionValue}')`);
                changes.onclick = `openPopup('${actionValue}')`;
            }
            
            // 스타일 변경
            const style = document.getElementById('buttonStyle').value;
            element.className = element.className.replace(/btn-(primary|secondary|success|danger)/g, '');
            element.classList.add(`btn-${style}`);
            changes.buttonStyle = style;
        }
        
        // 섹션 변경
        if (tagName === 'section' || tagName === 'div') {
            const bgColor = document.getElementById('sectionBgColor').value;
            element.style.backgroundColor = bgColor;
            changes.backgroundColor = bgColor;
            
            const padding = [
                document.getElementById('paddingTop').value,
                document.getElementById('paddingRight').value,
                document.getElementById('paddingBottom').value,
                document.getElementById('paddingLeft').value
            ].map(v => v ? v + 'px' : '0').join(' ');
            
            element.style.padding = padding;
            changes.padding = padding;
            
            const visible = document.getElementById('sectionVisible').checked;
            element.style.display = visible ? '' : 'none';
            changes.display = visible ? '' : 'none';
        }
        
        // 변경사항 기록
        if (Object.keys(changes).length > 0) {
            this.changes.set(elementId, {
                element: element,
                changes: changes,
                timestamp: Date.now()
            });
            this.showChangesIndicator();
        }
        
        this.showNotification('변경사항이 적용되었습니다.', 'success');
    }
    
    cancelEdit() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            this.selectedElement = null;
        }
        
        document.getElementById('elementInfo').innerHTML = '<h4>선택된 요소</h4><p class="no-selection">요소를 선택하세요</p>';
        document.getElementById('editTools').style.display = 'none';
    }
    
    startInlineEdit(element) {
        if (!this.isTextElement(element)) return;
        
        // contenteditable 활성화
        element.contentEditable = true;
        element.focus();
        
        // 전체 선택
        const range = this.frameDocument.createRange();
        range.selectNodeContents(element);
        const selection = this.frameDocument.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // 편집 완료 이벤트
        const finishEdit = () => {
            element.contentEditable = false;
            
            // 변경사항 저장
            const elementId = element.dataset.editorId;
            this.changes.set(elementId, {
                element: element,
                changes: { text: element.textContent },
                timestamp: Date.now()
            });
            this.showChangesIndicator();
        };
        
        element.addEventListener('blur', finishEdit, { once: true });
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                element.blur();
            }
        }, { once: true });
    }
    
    // 컴포넌트 추가
    addComponent(componentType, targetElement) {
        const components = {
            hero: this.createHeroComponent(),
            feature: this.createFeatureComponent(),
            testimonial: this.createTestimonialComponent(),
            cta: this.createCTAComponent(),
            pricing: this.createPricingComponent(),
            faq: this.createFAQComponent(),
            popup: this.createPopupComponent(),
            banner: this.createBannerComponent()
        };
        
        const component = components[componentType];
        if (component) {
            const wrapper = this.frameDocument.createElement('div');
            wrapper.className = 'component-preview';
            wrapper.innerHTML = component;
            
            // 컴포넌트 액션 버튼
            const actions = this.frameDocument.createElement('div');
            actions.className = 'component-actions';
            actions.innerHTML = `
                <button class="component-btn" onclick="contentEditor.moveComponent(this, 'up')">↑</button>
                <button class="component-btn" onclick="contentEditor.moveComponent(this, 'down')">↓</button>
                <button class="component-btn" onclick="contentEditor.deleteComponent(this)">×</button>
            `;
            wrapper.appendChild(actions);
            
            // 타겟 요소에 추가
            if (targetElement) {
                targetElement.appendChild(wrapper);
            } else {
                // 기본적으로 body 끝에 추가
                this.frameDocument.body.appendChild(wrapper);
            }
            
            // 새 컴포넌트도 편집 가능하게
            this.makeElementsEditable();
            
            this.showNotification('컴포넌트가 추가되었습니다.', 'success');
        }
    }
    
    createHeroComponent() {
        return `
            <section class="hero-section editable">
                <div class="container">
                    <h1 class="hero-title editable">여기에 제목을 입력하세요</h1>
                    <p class="hero-subtitle editable">부제목을 입력하세요</p>
                    <button class="btn btn-primary editable">CTA 버튼</button>
                </div>
            </section>
        `;
    }
    
    createFeatureComponent() {
        return `
            <section class="features-section editable">
                <div class="container">
                    <h2 class="section-title editable">특징</h2>
                    <div class="features-grid">
                        <div class="feature-card editable">
                            <i class="fas fa-star"></i>
                            <h3 class="editable">특징 1</h3>
                            <p class="editable">설명을 입력하세요</p>
                        </div>
                        <div class="feature-card editable">
                            <i class="fas fa-heart"></i>
                            <h3 class="editable">특징 2</h3>
                            <p class="editable">설명을 입력하세요</p>
                        </div>
                        <div class="feature-card editable">
                            <i class="fas fa-bolt"></i>
                            <h3 class="editable">특징 3</h3>
                            <p class="editable">설명을 입력하세요</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
    
    createCTAComponent() {
        return `
            <section class="cta-section editable">
                <div class="container">
                    <h2 class="cta-title editable">지금 시작하세요!</h2>
                    <p class="cta-text editable">설명 텍스트를 입력하세요</p>
                    <button class="btn btn-primary btn-lg editable">시작하기</button>
                </div>
            </section>
        `;
    }
    
    // 저장 기능
    saveAll() {
        const saveData = {
            page: this.currentPage,
            changes: Array.from(this.changes.entries()).map(([id, data]) => ({
                id: id,
                selector: this.getElementSelector(data.element),
                changes: data.changes,
                timestamp: data.timestamp
            })),
            savedAt: Date.now()
        };
        
        // localStorage에 저장
        localStorage.setItem(`pageContent_${this.currentPage}`, JSON.stringify(saveData));
        
        // 서버로 전송 (API 구현 시)
        // this.saveToServer(saveData);
        
        this.showNotification('모든 변경사항이 저장되었습니다.', 'success');
        this.hideChangesIndicator();
    }
    
    autoSave() {
        if (this.changes.size > 0) {
            this.saveAll();
            console.log('자동 저장 완료');
        }
    }
    
    // 미디어 라이브러리
    loadMediaLibrary() {
        const mediaGrid = document.getElementById('mediaGrid');
        const savedMedia = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
        
        mediaGrid.innerHTML = savedMedia.map(media => `
            <div class="media-item" data-url="${media.url}" onclick="contentEditor.selectMedia('${media.url}')">
                <img src="${media.url}" alt="${media.name}">
            </div>
        `).join('');
    }
    
    uploadMedia() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,video/*,.pdf,.doc,.docx';
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                // 실제로는 서버에 업로드
                // 여기서는 로컬 URL 생성
                const url = URL.createObjectURL(file);
                
                const mediaLibrary = JSON.parse(localStorage.getItem('mediaLibrary') || '[]');
                mediaLibrary.push({
                    name: file.name,
                    url: url,
                    type: file.type,
                    size: file.size,
                    uploadedAt: Date.now()
                });
                
                localStorage.setItem('mediaLibrary', JSON.stringify(mediaLibrary));
                this.loadMediaLibrary();
            });
        };
        
        input.click();
    }
    
    openMediaLibrary() {
        this.openModal('mediaLibraryModal');
        this.loadMediaLibraryModal();
    }
    
    // 유틸리티 함수
    isTextElement(element) {
        const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'li', 'td', 'th'];
        return textTags.includes(element.tagName.toLowerCase());
    }
    
    getElementType(element) {
        const tag = element.tagName.toLowerCase();
        const classList = element.className;
        
        if (tag === 'h1') return '제목 1';
        if (tag === 'h2') return '제목 2';
        if (tag === 'h3') return '제목 3';
        if (tag === 'p') return '단락';
        if (tag === 'a') return '링크';
        if (tag === 'button') return '버튼';
        if (tag === 'img') return '이미지';
        if (tag === 'section') return '섹션';
        if (classList.includes('hero')) return '히어로';
        if (classList.includes('card')) return '카드';
        
        return tag.toUpperCase();
    }
    
    getElementSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) {
            const classes = element.className.split(' ').filter(c => !c.includes('editable'));
            if (classes.length > 0) return `.${classes[0]}`;
        }
        return element.tagName.toLowerCase();
    }
    
    generateId() {
        return 'editor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return '#000000';
        
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        
        return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `editor-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 340px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showChangesIndicator() {
        document.getElementById('changesIndicator').classList.add('show');
    }
    
    hideChangesIndicator() {
        document.getElementById('changesIndicator').classList.remove('show');
    }
    
    openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
    
    // 페이지 전환
    switchPage(page) {
        this.saveAll(); // 현재 페이지 저장
        this.currentPage = page;
        this.editorFrame.src = `${page}.html`;
        this.changes.clear();
        this.hideChangesIndicator();
    }
    
    // 편집 모드 토글
    toggleEditMode() {
        this.editMode = !this.editMode;
        
        if (!this.editMode) {
            // 편집 모드 해제
            this.frameDocument.querySelectorAll('.editable-element').forEach(el => {
                el.classList.remove('editable-element', 'selected');
                el.querySelector('.edit-overlay')?.remove();
            });
            
            document.querySelector('.edit-mode-badge').textContent = '편집 모드 OFF';
            document.querySelector('.edit-mode-badge').style.background = '#666';
        } else {
            // 편집 모드 활성화
            this.initializeEditor();
            document.querySelector('.edit-mode-badge').textContent = '편집 모드 ON';
            document.querySelector('.edit-mode-badge').style.background = '#4CAF50';
        }
    }
    
    // 미리보기
    preview() {
        const previewWindow = window.open(this.currentPage + '.html', '_blank');
    }
    
    // 게시
    publish() {
        if (confirm('변경사항을 실제 사이트에 적용하시겠습니까?')) {
            // 실제로는 서버에 저장
            this.saveAll();
            
            // 게시 상태 저장
            localStorage.setItem(`published_${this.currentPage}`, JSON.stringify({
                content: localStorage.getItem(`pageContent_${this.currentPage}`),
                publishedAt: Date.now()
            }));
            
            this.showNotification('성공적으로 게시되었습니다!', 'success');
        }
    }
    
    // 원본 콘텐츠 저장
    saveOriginalContent() {
        this.frameDocument.querySelectorAll('.editable-element').forEach(element => {
            const id = element.dataset.editorId;
            this.originalContent[id] = {
                html: element.innerHTML,
                text: element.textContent,
                styles: element.getAttribute('style') || ''
            };
        });
    }
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    // 컴포넌트 드래그 시작
    document.querySelectorAll('.component-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('component', item.dataset.component);
            item.style.opacity = '0.5';
        });
        
        item.addEventListener('dragend', (e) => {
            item.style.opacity = '';
        });
    });
}

// 전역 인스턴스
let contentEditor;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    contentEditor = new ContentEditor();
    setupDragAndDrop();
    
    // 페이지 언로드 시 저장 확인
    window.addEventListener('beforeunload', (e) => {
        if (contentEditor.changes.size > 0) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});

// 애니메이션 스타일 추가
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animationStyle);