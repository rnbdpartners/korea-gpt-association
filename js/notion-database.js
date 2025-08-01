// 노션처럼 자유도 높은 데이터베이스 시스템

class NotionDatabase {
    constructor() {
        this.databases = new Map();
        this.currentDatabase = null;
        this.views = ['table', 'board', 'calendar', 'gallery', 'list'];
        this.currentView = 'table';
        
        this.init();
    }
    
    init() {
        this.loadDatabases();
        this.setupEventListeners();
    }
    
    // 데이터베이스 생성
    createDatabase(options = {}) {
        const database = {
            id: this.generateId(),
            name: options.name || '새 데이터베이스',
            icon: options.icon || '📊',
            properties: options.properties || this.getDefaultProperties(),
            items: options.items || [],
            views: options.views || [
                {
                    id: this.generateId(),
                    name: '모든 항목',
                    type: 'table',
                    filters: [],
                    sorts: [],
                    groupBy: null,
                    settings: {}
                }
            ],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.databases.set(database.id, database);
        this.saveToStorage();
        
        return database;
    }
    
    // 기본 속성
    getDefaultProperties() {
        return [
            {
                id: 'title',
                name: '이름',
                type: 'title',
                width: 200,
                visible: true,
                required: true
            },
            {
                id: this.generateId(),
                name: '상태',
                type: 'select',
                options: [
                    { id: '1', name: '시작 전', color: '#e0e0e0' },
                    { id: '2', name: '진행 중', color: '#2196F3' },
                    { id: '3', name: '완료', color: '#4CAF50' }
                ],
                width: 120,
                visible: true
            },
            {
                id: this.generateId(),
                name: '담당자',
                type: 'person',
                width: 150,
                visible: true
            },
            {
                id: this.generateId(),
                name: '날짜',
                type: 'date',
                width: 150,
                visible: true
            },
            {
                id: this.generateId(),
                name: '태그',
                type: 'multiSelect',
                options: [],
                width: 200,
                visible: true
            }
        ];
    }
    
    // 속성 추가
    addProperty(databaseId, property) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        const newProperty = {
            id: this.generateId(),
            name: property.name || '새 속성',
            type: property.type || 'text',
            width: property.width || 150,
            visible: true,
            ...property
        };
        
        // 타입별 기본값 설정
        switch (newProperty.type) {
            case 'select':
            case 'multiSelect':
                newProperty.options = property.options || [];
                break;
            case 'number':
                newProperty.format = property.format || 'number';
                newProperty.precision = property.precision || 0;
                break;
            case 'formula':
                newProperty.expression = property.expression || '';
                break;
            case 'relation':
                newProperty.relatedDatabase = property.relatedDatabase || null;
                newProperty.relatedProperty = property.relatedProperty || null;
                break;
        }
        
        database.properties.push(newProperty);
        database.updatedAt = Date.now();
        
        // 기존 아이템에 새 속성 추가
        database.items.forEach(item => {
            item[newProperty.id] = this.getDefaultValue(newProperty.type);
        });
        
        this.saveToStorage();
        return newProperty;
    }
    
    // 속성 수정
    updateProperty(databaseId, propertyId, updates) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        const propertyIndex = database.properties.findIndex(p => p.id === propertyId);
        if (propertyIndex === -1) return;
        
        database.properties[propertyIndex] = {
            ...database.properties[propertyIndex],
            ...updates
        };
        
        database.updatedAt = Date.now();
        this.saveToStorage();
    }
    
    // 속성 삭제
    deleteProperty(databaseId, propertyId) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        // title 속성은 삭제 불가
        const property = database.properties.find(p => p.id === propertyId);
        if (property?.type === 'title') return;
        
        database.properties = database.properties.filter(p => p.id !== propertyId);
        
        // 아이템에서도 해당 속성 제거
        database.items.forEach(item => {
            delete item[propertyId];
        });
        
        database.updatedAt = Date.now();
        this.saveToStorage();
    }
    
    // 아이템 추가
    addItem(databaseId, item = {}) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        const newItem = {
            id: this.generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        // 각 속성에 대한 기본값 설정
        database.properties.forEach(property => {
            if (item[property.id] !== undefined) {
                newItem[property.id] = item[property.id];
            } else {
                newItem[property.id] = this.getDefaultValue(property.type);
            }
        });
        
        database.items.push(newItem);
        database.updatedAt = Date.now();
        
        this.saveToStorage();
        return newItem;
    }
    
    // 아이템 수정
    updateItem(databaseId, itemId, updates) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        const itemIndex = database.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        
        database.items[itemIndex] = {
            ...database.items[itemIndex],
            ...updates,
            updatedAt: Date.now()
        };
        
        database.updatedAt = Date.now();
        this.saveToStorage();
    }
    
    // 아이템 삭제
    deleteItem(databaseId, itemId) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        database.items = database.items.filter(item => item.id !== itemId);
        database.updatedAt = Date.now();
        
        this.saveToStorage();
    }
    
    // 뷰 추가
    addView(databaseId, view) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        const newView = {
            id: this.generateId(),
            name: view.name || '새 뷰',
            type: view.type || 'table',
            filters: view.filters || [],
            sorts: view.sorts || [],
            groupBy: view.groupBy || null,
            settings: view.settings || {},
            createdAt: Date.now()
        };
        
        database.views.push(newView);
        database.updatedAt = Date.now();
        
        this.saveToStorage();
        return newView;
    }
    
    // 필터 추가
    addFilter(databaseId, viewId, filter) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        const view = database.views.find(v => v.id === viewId);
        if (!view) return;
        
        view.filters.push({
            id: this.generateId(),
            property: filter.property,
            operator: filter.operator,
            value: filter.value
        });
        
        database.updatedAt = Date.now();
        this.saveToStorage();
    }
    
    // 정렬 추가
    addSort(databaseId, viewId, sort) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        const view = database.views.find(v => v.id === viewId);
        if (!view) return;
        
        view.sorts.push({
            property: sort.property,
            direction: sort.direction || 'ascending'
        });
        
        database.updatedAt = Date.now();
        this.saveToStorage();
    }
    
    // 아이템 필터링
    filterItems(items, filters, properties) {
        if (!filters || filters.length === 0) return items;
        
        return items.filter(item => {
            return filters.every(filter => {
                const property = properties.find(p => p.id === filter.property);
                if (!property) return true;
                
                const value = item[filter.property];
                const filterValue = filter.value;
                
                switch (filter.operator) {
                    case 'equals':
                        return value === filterValue;
                    case 'not_equals':
                        return value !== filterValue;
                    case 'contains':
                        return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
                    case 'not_contains':
                        return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
                    case 'is_empty':
                        return !value || value === '' || (Array.isArray(value) && value.length === 0);
                    case 'is_not_empty':
                        return value && value !== '' && (!Array.isArray(value) || value.length > 0);
                    case 'greater_than':
                        return Number(value) > Number(filterValue);
                    case 'less_than':
                        return Number(value) < Number(filterValue);
                    case 'date_is':
                        return this.compareDates(value, filterValue, 'equals');
                    case 'date_before':
                        return this.compareDates(value, filterValue, 'before');
                    case 'date_after':
                        return this.compareDates(value, filterValue, 'after');
                    default:
                        return true;
                }
            });
        });
    }
    
    // 아이템 정렬
    sortItems(items, sorts, properties) {
        if (!sorts || sorts.length === 0) return items;
        
        return [...items].sort((a, b) => {
            for (const sort of sorts) {
                const property = properties.find(p => p.id === sort.property);
                if (!property) continue;
                
                let aValue = a[sort.property];
                let bValue = b[sort.property];
                
                // null/undefined 처리
                if (aValue == null) aValue = '';
                if (bValue == null) bValue = '';
                
                // 타입별 정렬
                let comparison = 0;
                switch (property.type) {
                    case 'number':
                        comparison = Number(aValue) - Number(bValue);
                        break;
                    case 'date':
                        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
                        break;
                    case 'checkbox':
                        comparison = (aValue ? 1 : 0) - (bValue ? 1 : 0);
                        break;
                    default:
                        comparison = String(aValue).localeCompare(String(bValue));
                }
                
                if (comparison !== 0) {
                    return sort.direction === 'descending' ? -comparison : comparison;
                }
            }
            return 0;
        });
    }
    
    // 그룹화
    groupItems(items, groupBy, properties) {
        if (!groupBy) return { ungrouped: items };
        
        const property = properties.find(p => p.id === groupBy);
        if (!property) return { ungrouped: items };
        
        const groups = {};
        
        items.forEach(item => {
            let groupKey = item[groupBy];
            
            // 그룹 키 처리
            if (property.type === 'select' || property.type === 'multiSelect') {
                const option = property.options?.find(o => o.id === groupKey);
                groupKey = option ? option.name : 'No Selection';
            } else if (property.type === 'checkbox') {
                groupKey = groupKey ? 'Checked' : 'Unchecked';
            } else if (property.type === 'date') {
                groupKey = groupKey ? new Date(groupKey).toLocaleDateString() : 'No Date';
            } else if (!groupKey) {
                groupKey = 'Empty';
            }
            
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
        });
        
        return groups;
    }
    
    // 포뮬라 계산
    calculateFormula(expression, item, properties) {
        // 간단한 포뮬라 파서 (실제로는 더 복잡한 파서 필요)
        let result = expression;
        
        // 속성 참조 치환
        properties.forEach(property => {
            const regex = new RegExp(`\\{${property.name}\\}`, 'g');
            const value = item[property.id];
            
            if (property.type === 'number') {
                result = result.replace(regex, value || 0);
            } else {
                result = result.replace(regex, `"${value || ''}"`);
            }
        });
        
        try {
            // 안전한 eval 대안 사용 권장
            return Function('"use strict"; return (' + result + ')')();
        } catch (error) {
            return 'Error';
        }
    }
    
    // 관계 데이터 가져오기
    getRelationData(item, property) {
        if (property.type !== 'relation') return null;
        
        const relatedDatabase = this.databases.get(property.relatedDatabase);
        if (!relatedDatabase) return null;
        
        const relatedIds = Array.isArray(item[property.id]) ? item[property.id] : [item[property.id]];
        return relatedDatabase.items.filter(relatedItem => 
            relatedIds.includes(relatedItem.id)
        );
    }
    
    // 통계 계산
    calculateStats(items, propertyId, properties) {
        const property = properties.find(p => p.id === propertyId);
        if (!property || property.type !== 'number') return null;
        
        const values = items
            .map(item => Number(item[propertyId]))
            .filter(v => !isNaN(v));
        
        if (values.length === 0) return null;
        
        return {
            count: values.length,
            sum: values.reduce((a, b) => a + b, 0),
            average: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }
    
    // 뷰 렌더링
    renderView(databaseId, viewId) {
        const database = this.databases.get(databaseId);
        if (!database) return '';
        
        const view = database.views.find(v => v.id === viewId) || database.views[0];
        if (!view) return '';
        
        // 필터링 및 정렬
        let items = this.filterItems(database.items, view.filters, database.properties);
        items = this.sortItems(items, view.sorts, database.properties);
        
        // 뷰 타입별 렌더링
        switch (view.type) {
            case 'table':
                return this.renderTableView(database, items, view);
            case 'board':
                return this.renderBoardView(database, items, view);
            case 'calendar':
                return this.renderCalendarView(database, items, view);
            case 'gallery':
                return this.renderGalleryView(database, items, view);
            case 'list':
                return this.renderListView(database, items, view);
            default:
                return this.renderTableView(database, items, view);
        }
    }
    
    // 테이블 뷰 렌더링
    renderTableView(database, items, view) {
        const visibleProperties = database.properties.filter(p => p.visible);
        
        return `
            <div class="notion-table">
                <table>
                    <thead>
                        <tr>
                            ${visibleProperties.map(property => `
                                <th style="width: ${property.width}px">
                                    <div class="property-header">
                                        <span>${property.name}</span>
                                        <button class="property-menu" onclick="notionDB.showPropertyMenu('${property.id}')">
                                            <i class="fas fa-chevron-down"></i>
                                        </button>
                                    </div>
                                </th>
                            `).join('')}
                            <th class="add-property">
                                <button onclick="notionDB.showAddProperty('${database.id}')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr data-item-id="${item.id}">
                                ${visibleProperties.map(property => `
                                    <td>
                                        ${this.renderCell(item, property, database)}
                                    </td>
                                `).join('')}
                                <td></td>
                            </tr>
                        `).join('')}
                        <tr class="add-row">
                            <td colspan="${visibleProperties.length + 1}">
                                <button onclick="notionDB.addNewItem('${database.id}')">
                                    <i class="fas fa-plus"></i> 새 항목
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // 보드 뷰 렌더링
    renderBoardView(database, items, view) {
        const groupProperty = database.properties.find(p => p.id === view.groupBy);
        if (!groupProperty || groupProperty.type !== 'select') {
            return '<p>보드 뷰를 사용하려면 선택 속성으로 그룹화하세요.</p>';
        }
        
        const groups = this.groupItems(items, view.groupBy, database.properties);
        
        return `
            <div class="notion-board">
                ${groupProperty.options.map(option => `
                    <div class="board-column">
                        <div class="column-header" style="background: ${option.color}20; border-color: ${option.color}">
                            <span class="column-title">${option.name}</span>
                            <span class="column-count">${(groups[option.name] || []).length}</span>
                        </div>
                        <div class="column-items" data-group="${option.id}">
                            ${(groups[option.name] || []).map(item => `
                                <div class="board-card" data-item-id="${item.id}">
                                    ${this.renderCard(item, database)}
                                </div>
                            `).join('')}
                            <button class="add-card" onclick="notionDB.addNewItem('${database.id}', {${groupProperty.id}: '${option.id}'})">
                                <i class="fas fa-plus"></i> 추가
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 셀 렌더링
    renderCell(item, property, database) {
        const value = item[property.id];
        
        switch (property.type) {
            case 'title':
                return `<input type="text" value="${value || ''}" class="cell-input title" 
                        onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.value)">`;
            
            case 'text':
                return `<input type="text" value="${value || ''}" class="cell-input" 
                        onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.value)">`;
            
            case 'number':
                return `<input type="number" value="${value || ''}" class="cell-input" 
                        onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.value)">`;
            
            case 'select':
                return `
                    <select class="cell-select" onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.value)">
                        <option value="">-</option>
                        ${property.options.map(option => `
                            <option value="${option.id}" ${value === option.id ? 'selected' : ''} 
                                    style="background: ${option.color}20">
                                ${option.name}
                            </option>
                        `).join('')}
                    </select>
                `;
            
            case 'multiSelect':
                const selectedValues = Array.isArray(value) ? value : [];
                return `
                    <div class="multi-select-cell" onclick="notionDB.showMultiSelect('${database.id}', '${item.id}', '${property.id}')">
                        ${selectedValues.map(valueId => {
                            const option = property.options.find(o => o.id === valueId);
                            return option ? `<span class="tag" style="background: ${option.color}20; color: ${option.color}">${option.name}</span>` : '';
                        }).join('')}
                        ${selectedValues.length === 0 ? '<span class="placeholder">선택</span>' : ''}
                    </div>
                `;
            
            case 'date':
                return `<input type="date" value="${value || ''}" class="cell-input" 
                        onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.value)">`;
            
            case 'checkbox':
                return `<input type="checkbox" ${value ? 'checked' : ''} 
                        onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.checked)">`;
            
            case 'url':
                return `<input type="url" value="${value || ''}" class="cell-input" placeholder="https://" 
                        onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.value)">`;
            
            case 'email':
                return `<input type="email" value="${value || ''}" class="cell-input" 
                        onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.value)">`;
            
            case 'phone':
                return `<input type="tel" value="${value || ''}" class="cell-input" 
                        onchange="notionDB.updateCell('${database.id}', '${item.id}', '${property.id}', this.value)">`;
            
            case 'formula':
                const result = this.calculateFormula(property.expression, item, database.properties);
                return `<span class="formula-result">${result}</span>`;
            
            case 'relation':
                const relatedItems = this.getRelationData(item, property);
                return `
                    <div class="relation-cell">
                        ${relatedItems ? relatedItems.map(related => 
                            `<span class="relation-tag">${related.title || 'Untitled'}</span>`
                        ).join('') : ''}
                    </div>
                `;
            
            default:
                return value || '';
        }
    }
    
    // 카드 렌더링 (보드/갤러리 뷰용)
    renderCard(item, database) {
        const titleProperty = database.properties.find(p => p.type === 'title');
        const title = item[titleProperty.id] || 'Untitled';
        
        return `
            <h4>${title}</h4>
            ${database.properties.filter(p => p.visible && p.type !== 'title').slice(0, 3).map(property => {
                const value = this.formatValue(item[property.id], property);
                return value ? `
                    <div class="card-property">
                        <span class="property-name">${property.name}:</span>
                        <span class="property-value">${value}</span>
                    </div>
                ` : '';
            }).join('')}
        `;
    }
    
    // 값 포맷팅
    formatValue(value, property) {
        if (value == null || value === '') return '';
        
        switch (property.type) {
            case 'select':
                const option = property.options?.find(o => o.id === value);
                return option ? option.name : value;
            
            case 'multiSelect':
                return Array.isArray(value) ? value.map(v => {
                    const opt = property.options?.find(o => o.id === v);
                    return opt ? opt.name : v;
                }).join(', ') : '';
            
            case 'date':
                return new Date(value).toLocaleDateString();
            
            case 'checkbox':
                return value ? '✓' : '✗';
            
            case 'number':
                if (property.format === 'currency') {
                    return new Intl.NumberFormat('ko-KR', {
                        style: 'currency',
                        currency: 'KRW'
                    }).format(value);
                }
                return value.toLocaleString();
            
            default:
                return value;
        }
    }
    
    // 기본값 생성
    getDefaultValue(type) {
        switch (type) {
            case 'title':
            case 'text':
            case 'url':
            case 'email':
            case 'phone':
                return '';
            case 'number':
                return 0;
            case 'checkbox':
                return false;
            case 'date':
                return null;
            case 'select':
                return null;
            case 'multiSelect':
            case 'relation':
                return [];
            case 'formula':
                return null;
            default:
                return '';
        }
    }
    
    // 날짜 비교
    compareDates(date1, date2, operator) {
        const d1 = new Date(date1).setHours(0, 0, 0, 0);
        const d2 = new Date(date2).setHours(0, 0, 0, 0);
        
        switch (operator) {
            case 'equals':
                return d1 === d2;
            case 'before':
                return d1 < d2;
            case 'after':
                return d1 > d2;
            default:
                return false;
        }
    }
    
    // 셀 업데이트
    updateCell(databaseId, itemId, propertyId, value) {
        const database = this.databases.get(databaseId);
        if (!database) return;
        
        const item = database.items.find(i => i.id === itemId);
        if (!item) return;
        
        const property = database.properties.find(p => p.id === propertyId);
        if (!property) return;
        
        // 타입에 따른 값 변환
        switch (property.type) {
            case 'number':
                item[propertyId] = value ? Number(value) : 0;
                break;
            case 'checkbox':
                item[propertyId] = Boolean(value);
                break;
            case 'multiSelect':
                item[propertyId] = Array.isArray(value) ? value : [];
                break;
            default:
                item[propertyId] = value;
        }
        
        item.updatedAt = Date.now();
        database.updatedAt = Date.now();
        
        this.saveToStorage();
        
        // 포뮬라 재계산 필요 시
        if (database.properties.some(p => p.type === 'formula')) {
            this.refreshView(databaseId);
        }
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 드래그 앤 드롭 (보드 뷰)
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('board-card')) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('itemId', e.target.dataset.itemId);
                e.target.style.opacity = '0.5';
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('board-card')) {
                e.target.style.opacity = '';
            }
        });
        
        document.addEventListener('dragover', (e) => {
            if (e.target.closest('.column-items')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });
        
        document.addEventListener('drop', (e) => {
            const columnItems = e.target.closest('.column-items');
            if (columnItems) {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('itemId');
                const newGroup = columnItems.dataset.group;
                
                // 그룹 업데이트
                if (this.currentDatabase && itemId && newGroup) {
                    const database = this.databases.get(this.currentDatabase);
                    const view = database.views.find(v => v.type === 'board');
                    if (view && view.groupBy) {
                        this.updateCell(this.currentDatabase, itemId, view.groupBy, newGroup);
                        this.refreshView(this.currentDatabase);
                    }
                }
            }
        });
    }
    
    // 뷰 새로고침
    refreshView(databaseId) {
        // 현재 뷰 다시 렌더링
        if (this.currentDatabase === databaseId && this.onRefresh) {
            this.onRefresh();
        }
    }
    
    // 저장
    saveToStorage() {
        const data = {};
        this.databases.forEach((db, id) => {
            data[id] = db;
        });
        localStorage.setItem('notionDatabases', JSON.stringify(data));
    }
    
    // 로드
    loadDatabases() {
        const saved = localStorage.getItem('notionDatabases');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.entries(data).forEach(([id, db]) => {
                    this.databases.set(id, db);
                });
            } catch (error) {
                console.error('Failed to load databases:', error);
            }
        }
        
        // 샘플 데이터베이스 생성
        if (this.databases.size === 0) {
            this.createSampleDatabase();
        }
    }
    
    // 샘플 데이터베이스
    createSampleDatabase() {
        const database = this.createDatabase({
            name: '교육 프로그램 관리',
            icon: '🎓',
            properties: [
                {
                    id: 'title',
                    name: '프로그램명',
                    type: 'title',
                    width: 250,
                    visible: true,
                    required: true
                },
                {
                    id: this.generateId(),
                    name: '카테고리',
                    type: 'select',
                    options: [
                        { id: 'basic', name: '기초', color: '#2196F3' },
                        { id: 'intermediate', name: '중급', color: '#FF9800' },
                        { id: 'advanced', name: '고급', color: '#9C27B0' }
                    ],
                    width: 120,
                    visible: true
                },
                {
                    id: this.generateId(),
                    name: '강사',
                    type: 'multiSelect',
                    options: [
                        { id: 'kim', name: '김철수', color: '#4CAF50' },
                        { id: 'lee', name: '이영희', color: '#E91E63' },
                        { id: 'park', name: '박민수', color: '#00BCD4' }
                    ],
                    width: 200,
                    visible: true
                },
                {
                    id: this.generateId(),
                    name: '가격',
                    type: 'number',
                    format: 'currency',
                    width: 150,
                    visible: true
                },
                {
                    id: this.generateId(),
                    name: '시작일',
                    type: 'date',
                    width: 150,
                    visible: true
                },
                {
                    id: this.generateId(),
                    name: '온라인',
                    type: 'checkbox',
                    width: 80,
                    visible: true
                }
            ]
        });
        
        // 샘플 아이템 추가
        this.addItem(database.id, {
            title: 'ChatGPT 기초 과정',
            [database.properties[1].id]: 'basic',
            [database.properties[2].id]: ['kim'],
            [database.properties[3].id]: 200000,
            [database.properties[4].id]: '2024-02-01',
            [database.properties[5].id]: true
        });
        
        this.addItem(database.id, {
            title: '업무 자동화 과정',
            [database.properties[1].id]: 'intermediate',
            [database.properties[2].id]: ['lee', 'park'],
            [database.properties[3].id]: 350000,
            [database.properties[4].id]: '2024-02-15',
            [database.properties[5].id]: false
        });
    }
    
    // ID 생성
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// 전역 인스턴스
const notionDB = new NotionDatabase();

// 편의 함수들
window.notionDB = {
    updateCell: (dbId, itemId, propId, value) => notionDB.updateCell(dbId, itemId, propId, value),
    addNewItem: (dbId, defaults) => {
        const item = notionDB.addItem(dbId, defaults);
        notionDB.refreshView(dbId);
    },
    showPropertyMenu: (propId) => {
        console.log('Property menu for:', propId);
        // 속성 메뉴 구현
    },
    showAddProperty: (dbId) => {
        console.log('Add property to:', dbId);
        // 속성 추가 UI 구현
    },
    showMultiSelect: (dbId, itemId, propId) => {
        console.log('Multi-select for:', dbId, itemId, propId);
        // 다중 선택 UI 구현
    }
};