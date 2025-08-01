// 페이지 빌더 JavaScript
class PageBuilder {
    constructor() {
        this.selectedElement = null;
        this.draggedElement = null;
        this.elementIdCounter = 0;
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupDragAndDrop();
        this.setupDeviceSwitching();
        this.setupContextMenu();
        this.setupPropertyPanel();
        this.setupToolbarActions();
    }

    // 탭 전환
    setupTabSwitching() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 모든 탭 비활성화
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // 선택된 탭 활성화
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab') + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // 드래그 앤 드롭
    setupDragAndDrop() {
        const blocks = document.querySelectorAll('.block-item');
        const canvas = document.getElementById('canvas');

        blocks.forEach(block => {
            block.addEventListener('dragstart', (e) => {
                this.draggedElement = {
                    type: block.getAttribute('data-block-type'),
                    isNew: true
                };
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // 드롭 위치 표시
            const afterElement = this.getDragAfterElement(canvas, e.clientY);
            if (afterElement == null) {
                canvas.classList.add('drag-over');
            }
        });

        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('drag-over');
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            
            if (this.draggedElement && this.draggedElement.isNew) {
                // 빈 상태 제거
                const emptyState = canvas.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.remove();
                }
                
                // 새 요소 생성
                const newElement = this.createElement(this.draggedElement.type);
                
                // 드롭 위치에 삽입
                const afterElement = this.getDragAfterElement(canvas, e.clientY);
                if (afterElement == null) {
                    canvas.appendChild(newElement);
                } else {
                    canvas.insertBefore(newElement, afterElement);
                }
                
                // 요소 선택
                this.selectElement(newElement);
            }
        });
    }

    // 드래그 위치 계산
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.builder-element:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // 요소 생성
    createElement(type) {
        const element = document.createElement('div');
        element.className = 'builder-element';
        element.id = `element-${this.elementIdCounter++}`;
        element.setAttribute('data-element-type', type);
        
        // 요소별 기본 콘텐츠
        let content = '';
        switch(type) {
            case 'section':
                content = `
                    <div style="min-height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                        <p style="color: #6c757d;">섹션 - 여기에 콘텐츠를 추가하세요</p>
                    </div>
                `;
                break;
            case 'heading':
                content = `<h2 contenteditable="true" style="color: #2D3E50;">제목을 입력하세요</h2>`;
                break;
            case 'text':
                content = `<p contenteditable="true" style="color: #6c757d; line-height: 1.6;">텍스트를 입력하세요. 이곳에 원하는 내용을 작성할 수 있습니다.</p>`;
                break;
            case 'button':
                content = `<button style="background: #31E0AA; color: #1a1a1a; padding: 12px 30px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">버튼 텍스트</button>`;
                break;
            case 'image':
                content = `<img src="https://via.placeholder.com/600x400" alt="이미지" style="width: 100%; height: auto; border-radius: 8px;">`;
                break;
            case 'columns':
                content = `
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <p>컬럼 1</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <p>컬럼 2</p>
                        </div>
                    </div>
                `;
                break;
            case 'hero':
                content = `
                    <div style="background: linear-gradient(135deg, #31E0AA 0%, #28c997 100%); color: white; padding: 80px 40px; text-align: center; border-radius: 12px;">
                        <h1 style="font-size: 48px; margin-bottom: 20px;">멋진 제목</h1>
                        <p style="font-size: 20px; margin-bottom: 30px; opacity: 0.9;">부제목이 들어갑니다</p>
                        <button style="background: white; color: #2D3E50; padding: 15px 40px; border: none; border-radius: 6px; font-size: 18px; font-weight: 600; cursor: pointer;">CTA 버튼</button>
                    </div>
                `;
                break;
            case 'card':
                content = `
                    <div style="border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <img src="https://via.placeholder.com/400x250" alt="카드 이미지" style="width: 100%; height: auto;">
                        <div style="padding: 20px;">
                            <h3 style="margin-bottom: 10px;">카드 제목</h3>
                            <p style="color: #6c757d; margin-bottom: 20px;">카드 설명이 들어갑니다.</p>
                            <button style="background: #31E0AA; color: #1a1a1a; padding: 10px 20px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">자세히 보기</button>
                        </div>
                    </div>
                `;
                break;
            case 'course-grid':
                content = `
                    <div style="padding: 40px 0;">
                        <h2 style="text-align: center; margin-bottom: 40px;">인기 강좌</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
                            ${this.createCourseCard()}
                            ${this.createCourseCard()}
                            ${this.createCourseCard()}
                        </div>
                    </div>
                `;
                break;
            case 'live-stats':
                content = `
                    <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
                        <h3 style="text-align: center; margin-bottom: 30px; color: #2D3E50;">실시간 학습 현황</h3>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center;">
                            <div>
                                <div style="font-size: 32px; font-weight: 700; color: #31E0AA;">234</div>
                                <div style="color: #6c757d; margin-top: 5px;">현재 수강생</div>
                            </div>
                            <div>
                                <div style="font-size: 32px; font-weight: 700; color: #31E0AA;">89</div>
                                <div style="color: #6c757d; margin-top: 5px;">오늘 수료</div>
                            </div>
                            <div>
                                <div style="font-size: 32px; font-weight: 700; color: #31E0AA;">4.9</div>
                                <div style="color: #6c757d; margin-top: 5px;">평균 만족도</div>
                            </div>
                            <div>
                                <div style="font-size: 32px; font-weight: 700; color: #31E0AA;">96%</div>
                                <div style="color: #6c757d; margin-top: 5px;">완주율</div>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        
        element.innerHTML = content + this.createElementToolbar();
        
        // 요소 클릭 이벤트
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });
        
        // 우클릭 이벤트
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, element);
        });
        
        return element;
    }

    // 강좌 카드 생성
    createCourseCard() {
        return `
            <div style="border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden;">
                <img src="https://via.placeholder.com/300x200" alt="강좌" style="width: 100%; height: auto;">
                <div style="padding: 20px;">
                    <span style="background: #31E0AA; color: #1a1a1a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">베스트셀러</span>
                    <h4 style="margin: 15px 0 10px 0;">강좌 제목</h4>
                    <p style="color: #6c757d; font-size: 14px; margin-bottom: 15px;">강좌 설명이 들어갑니다.</p>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: #ffc107;">★★★★★ 5.0</span>
                        <span style="font-weight: 700; color: #31E0AA;">33,000원</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 요소 툴바 생성
    createElementToolbar() {
        return `
            <div class="element-toolbar">
                <button onclick="pageBuilder.duplicateElement(this.parentElement.parentElement)" title="복제">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="pageBuilder.deleteElement(this.parentElement.parentElement)" title="삭제">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    // 요소 선택
    selectElement(element) {
        // 이전 선택 제거
        document.querySelectorAll('.builder-element').forEach(el => {
            el.classList.remove('selected');
        });
        
        // 새 요소 선택
        element.classList.add('selected');
        this.selectedElement = element;
        
        // 속성 패널 업데이트
        this.updatePropertyPanel(element);
    }

    // 속성 패널 업데이트
    updatePropertyPanel(element) {
        const panel = document.getElementById('properties-panel');
        const type = element.getAttribute('data-element-type');
        
        let properties = `
            <div class="property-group">
                <label>요소 타입</label>
                <input type="text" value="${type}" readonly style="background: #f8f9fa;">
            </div>
        `;
        
        // 타입별 속성
        switch(type) {
            case 'heading':
            case 'text':
            case 'button':
                properties += `
                    <div class="property-group">
                        <label>텍스트</label>
                        <textarea id="prop-text">${element.textContent.trim()}</textarea>
                    </div>
                `;
                break;
            case 'image':
                properties += `
                    <div class="property-group">
                        <label>이미지 URL</label>
                        <input type="text" id="prop-src" value="${element.querySelector('img')?.src || ''}">
                    </div>
                `;
                break;
        }
        
        // 공통 속성
        properties += `
            <div class="property-group">
                <label>배경색</label>
                <div class="color-input-group">
                    <input type="color" id="prop-bg-color" value="#ffffff">
                    <input type="text" id="prop-bg-text" value="#ffffff">
                </div>
            </div>
            
            <div class="property-group">
                <label>여백 (Padding)</label>
                <div class="spacing-inputs">
                    <input type="number" id="prop-padding-top" placeholder="위" value="20">
                    <input type="number" id="prop-padding-right" placeholder="오른쪽" value="20">
                    <input type="number" id="prop-padding-bottom" placeholder="아래" value="20">
                    <input type="number" id="prop-padding-left" placeholder="왼쪽" value="20">
                </div>
            </div>
            
            <div class="property-group">
                <label>외부 여백 (Margin)</label>
                <div class="spacing-inputs">
                    <input type="number" id="prop-margin-top" placeholder="위" value="10">
                    <input type="number" id="prop-margin-right" placeholder="오른쪽" value="10">
                    <input type="number" id="prop-margin-bottom" placeholder="아래" value="10">
                    <input type="number" id="prop-margin-left" placeholder="왼쪽" value="10">
                </div>
            </div>
        `;
        
        panel.innerHTML = properties;
        
        // 속성 변경 이벤트 바인딩
        this.bindPropertyEvents(element);
    }

    // 속성 변경 이벤트 바인딩
    bindPropertyEvents(element) {
        // 텍스트 변경
        const textInput = document.getElementById('prop-text');
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                const editableElement = element.querySelector('[contenteditable="true"]') || element.querySelector('button');
                if (editableElement) {
                    editableElement.textContent = e.target.value;
                }
            });
        }
        
        // 이미지 URL 변경
        const srcInput = document.getElementById('prop-src');
        if (srcInput) {
            srcInput.addEventListener('input', (e) => {
                const img = element.querySelector('img');
                if (img) {
                    img.src = e.target.value;
                }
            });
        }
        
        // 배경색 변경
        const bgColorInput = document.getElementById('prop-bg-color');
        const bgTextInput = document.getElementById('prop-bg-text');
        if (bgColorInput && bgTextInput) {
            bgColorInput.addEventListener('input', (e) => {
                element.style.backgroundColor = e.target.value;
                bgTextInput.value = e.target.value;
            });
            
            bgTextInput.addEventListener('input', (e) => {
                element.style.backgroundColor = e.target.value;
                bgColorInput.value = e.target.value;
            });
        }
        
        // 여백 변경
        ['padding', 'margin'].forEach(property => {
            ['top', 'right', 'bottom', 'left'].forEach(direction => {
                const input = document.getElementById(`prop-${property}-${direction}`);
                if (input) {
                    input.addEventListener('input', (e) => {
                        element.style[`${property}${direction.charAt(0).toUpperCase() + direction.slice(1)}`] = e.target.value + 'px';
                    });
                }
            });
        });
    }

    // 디바이스 전환
    setupDeviceSwitching() {
        const deviceBtns = document.querySelectorAll('.btn-device');
        const canvas = document.querySelector('.canvas-wrapper');
        
        deviceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 버튼 활성화
                deviceBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 캔버스 크기 조정
                const device = btn.getAttribute('data-device');
                switch(device) {
                    case 'desktop':
                        canvas.style.maxWidth = '1200px';
                        break;
                    case 'tablet':
                        canvas.style.maxWidth = '768px';
                        break;
                    case 'mobile':
                        canvas.style.maxWidth = '375px';
                        break;
                }
            });
        });
    }

    // 컨텍스트 메뉴
    setupContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        
        // 메뉴 외부 클릭시 닫기
        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });
        
        // 메뉴 아이템 클릭
        contextMenu.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.getAttribute('data-action');
                if (this.selectedElement) {
                    this.executeAction(action, this.selectedElement);
                }
                contextMenu.style.display = 'none';
            });
        });
    }

    // 컨텍스트 메뉴 표시
    showContextMenu(e, element) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        this.selectedElement = element;
    }

    // 액션 실행
    executeAction(action, element) {
        switch(action) {
            case 'duplicate':
                this.duplicateElement(element);
                break;
            case 'delete':
                this.deleteElement(element);
                break;
            case 'moveUp':
                this.moveElement(element, 'up');
                break;
            case 'moveDown':
                this.moveElement(element, 'down');
                break;
        }
    }

    // 요소 복제
    duplicateElement(element) {
        const clone = element.cloneNode(true);
        clone.id = `element-${this.elementIdCounter++}`;
        element.parentNode.insertBefore(clone, element.nextSibling);
        
        // 이벤트 재바인딩
        clone.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(clone);
        });
        
        clone.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, clone);
        });
    }

    // 요소 삭제
    deleteElement(element) {
        if (confirm('이 요소를 삭제하시겠습니까?')) {
            element.remove();
            
            // 캔버스가 비었으면 빈 상태 표시
            const canvas = document.getElementById('canvas');
            if (!canvas.querySelector('.builder-element')) {
                canvas.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-layer-group"></i>
                        <h3>여기에 블록을 드래그하세요</h3>
                        <p>왼쪽 패널에서 블록을 선택하여 페이지를 구성하세요</p>
                    </div>
                `;
            }
            
            // 속성 패널 초기화
            document.getElementById('properties-panel').innerHTML = `
                <div class="empty-properties">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>편집할 요소를 선택하세요</p>
                </div>
            `;
        }
    }

    // 요소 이동
    moveElement(element, direction) {
        if (direction === 'up' && element.previousElementSibling) {
            element.parentNode.insertBefore(element, element.previousElementSibling);
        } else if (direction === 'down' && element.nextElementSibling) {
            element.parentNode.insertBefore(element.nextElementSibling, element);
        }
    }

    // 툴바 액션
    setupToolbarActions() {
        // 미리보기
        document.querySelector('.btn-preview')?.addEventListener('click', () => {
            this.preview();
        });
        
        // 저장
        document.querySelector('.btn-save')?.addEventListener('click', () => {
            this.save();
        });
        
        // 게시
        document.querySelector('.btn-publish')?.addEventListener('click', () => {
            this.publish();
        });
    }

    // 미리보기
    preview() {
        const canvas = document.getElementById('canvas').cloneNode(true);
        
        // 편집 관련 요소 제거
        canvas.querySelectorAll('.element-toolbar').forEach(el => el.remove());
        canvas.querySelectorAll('.builder-element').forEach(el => {
            el.classList.remove('selected');
            el.removeAttribute('contenteditable');
        });
        
        // 새 창에서 미리보기
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>미리보기 | 한국GPT협회</title>
                <link rel="stylesheet" href="styles.css">
                <style>
                    body { margin: 0; padding: 0; }
                    .builder-element { border: none !important; }
                </style>
            </head>
            <body>
                ${canvas.innerHTML}
            </body>
            </html>
        `);
    }

    // 저장
    save() {
        const canvas = document.getElementById('canvas');
        const data = {
            html: canvas.innerHTML,
            timestamp: new Date().toISOString()
        };
        
        // 로컬 스토리지에 저장
        localStorage.setItem('pageBuilderData', JSON.stringify(data));
        
        alert('페이지가 저장되었습니다!');
    }

    // 게시
    publish() {
        if (confirm('이 페이지를 게시하시겠습니까?')) {
            // 실제로는 서버에 저장
            this.save();
            alert('페이지가 성공적으로 게시되었습니다!');
        }
    }

    // 속성 패널 설정
    setupPropertyPanel() {
        const closeBtn = document.querySelector('.btn-close-properties');
        const propertiesPanel = document.querySelector('.builder-properties');
        
        closeBtn?.addEventListener('click', () => {
            propertiesPanel.style.display = 'none';
        });
    }
}

// 페이지 빌더 초기화
const pageBuilder = new PageBuilder();

// 페이지 로드시 저장된 데이터 복원
document.addEventListener('DOMContentLoaded', () => {
    const savedData = localStorage.getItem('pageBuilderData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const canvas = document.getElementById('canvas');
        canvas.innerHTML = data.html;
        
        // 복원된 요소들에 이벤트 재바인딩
        canvas.querySelectorAll('.builder-element').forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                pageBuilder.selectElement(element);
            });
            
            element.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                pageBuilder.showContextMenu(e, element);
            });
        });
    }
});