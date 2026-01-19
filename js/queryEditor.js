// Query Editor and Visual Query Builder
let currentQuery = {
    select: [],
    from: null,
    where: [],
    orderBy: null
};

let monacoEditor = null;

// Initialize query editor
function initQueryEditor() {
    // Only setup old builder if new accessible builder isn't available
    if (!window.initAccessibleQueryBuilder) {
        setupTabs();
        setupVisualBuilder();
    }
    
    // Always setup SQL editor (used by both builders)
    setupSQLEditor();
    setupTableDraggables();
}

// Setup tab switching
function setupTabs() {
    // SQL editor tab removed - only visual builder available
    const tabs = document.querySelectorAll('.tab-btn-pixel');
    // Note: SQL editor functionality temporarily disabled
    const builder = document.getElementById('query-builder');
    const editor = document.getElementById('sql-editor');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show/hide panels
            if (targetTab === 'builder') {
                if (builder) builder.classList.add('active');
                if (editor) editor.classList.remove('active');
            } else {
                if (builder) builder.classList.remove('active');
                if (editor) editor.classList.add('active');
            }
        });
    });
}

// Setup SQL editor with Monaco
async function setupSQLEditor() {
    // Wait a bit for Monaco to load, then initialize
    setTimeout(() => {
        if (typeof require !== 'undefined') {
            require(['vs/editor/editor.main'], initMonacoEditor);
        } else if (typeof monaco !== 'undefined') {
            initMonacoEditor();
        } else {
            console.warn('Monaco Editor not available, using textarea fallback');
            initTextareaFallback();
        }
    }, 100);
}

function initMonacoEditor() {
    // Check if Monaco is available
    if (typeof monaco === 'undefined') {
        console.error('Monaco Editor not loaded');
        initTextareaFallback();
        return;
    }
    
    // Monaco is available, proceed with initialization
    (function() {
        // Try sql-editor-container first (query builder modal), then monaco-container (main page)
        const container = document.getElementById('sql-editor-container') || document.getElementById('monaco-container');
        
        // Get table names for autocomplete
        const tables = ['suspects', 'locations', 'timeline', 'witnesses', 'evidence', 'cctv'];
        const tableColumns = {
            'suspects': ['id', 'name', 'age', 'occupation', 'address', 'alibi', 'motive', 'suspicious_level'],
            'locations': ['id', 'name', 'address', 'location_type', 'description', 'distance_from_crime'],
            'timeline': ['id', 'timestamp', 'event_description', 'location_id', 'suspect_id', 'evidence_type'],
            'witnesses': ['id', 'name', 'statement', 'credibility', 'location_id'],
            'evidence': ['id', 'item_name', 'description', 'found_at_location', 'found_by', 'relevance'],
            'cctv': ['id', 'camera_location', 'timestamp', 'person_seen', 'activity_description', 'location_id']
        };
        
        // Create custom SQL language with autocomplete
        monaco.languages.register({ id: 'sql-detective' });
        monaco.languages.setMonarchTokensProvider('sql-detective', {
            keywords: ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'AS', 'AND', 'OR', 'NOT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'HAVING', 'DISTINCT', 'UNION', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP'],
            operators: ['=', '!=', '<>', '<', '>', '<=', '>=', 'LIKE', 'IN', 'BETWEEN', 'IS', 'NULL'],
            tokenizer: {
                root: [
                    [/[a-z_$][\w$]*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],
                    [/[A-Z][\w\$]*/, 'keyword'],
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                    [/'([^'\\]|\\.)*$/, 'string.invalid'],
                    [/'/, { token: 'string.quote', bracket: '@open', next: '@stringsingle' }],
                    [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                    [/\d+/, 'number'],
                    [/[;,.]/, 'delimiter'],
                    [/[()]/, '@brackets'],
                    [/[\s]+/, 'white'],
                    [/\/\*/, 'comment', '@comment'],
                    [/--.*$/, 'comment']
                ],
                string: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape.invalid'],
                    [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
                ],
                stringsingle: [
                    [/[^\\']+/, 'string'],
                    [/\\./, 'string.escape.invalid'],
                    [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
                ],
                comment: [
                    [/[^/*]+/, 'comment'],
                    [/\/\*/, 'comment', '@push'],
                    [/\*\//, 'comment', '@pop'],
                    [/[/*]/, 'comment']
                ]
            }
        });
        
        // Register completion provider
        monaco.languages.registerCompletionItemProvider('sql-detective', {
            provideCompletionItems: function(model, position) {
                const suggestions = [];
                
                // Add SQL keywords
                const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT'];
                keywords.forEach(keyword => {
                    suggestions.push({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        documentation: `SQL keyword: ${keyword}`
                    });
                });
                
                // Add table names
                tables.forEach(table => {
                    suggestions.push({
                        label: table,
                        kind: monaco.languages.CompletionItemKind.Class,
                        insertText: table,
                        documentation: `Table: ${table}`
                    });
                });
                
                // Add column names
                Object.keys(tableColumns).forEach(table => {
                    tableColumns[table].forEach(column => {
                        suggestions.push({
                            label: `${table}.${column}`,
                            kind: monaco.languages.CompletionItemKind.Property,
                            insertText: `${table}.${column}`,
                            documentation: `Column ${column} from table ${table}`
                        });
                    });
                });
                
                return { suggestions: suggestions };
            }
        });
        
        // Create editor
        monacoEditor = monaco.editor.create(container, {
            value: 'SELECT * FROM suspects;',
            language: 'sql-detective',
            theme: 'vs-dark',
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            lineNumbers: 'on',
            roundedSelection: false,
            cursorStyle: 'line',
            formatOnPaste: true,
            formatOnType: true
        });
        
        // Setup buttons
        const runBtn = document.getElementById('run-query-btn');
        const clearBtn = document.getElementById('clear-query-btn');
        const exampleBtn = document.getElementById('load-example-btn');
        const formatBtn = document.getElementById('format-query-btn');
        
        if (!runBtn) {
            console.warn('Run button not found');
            return;
        }
        
        runBtn.addEventListener('click', () => {
            const query = monacoEditor.getValue().trim();
            if (query) {
                if (window.runQuery) {
                    window.runQuery(query);
                }
            }
        });
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                monacoEditor.setValue('');
                monacoEditor.focus();
            });
        }
        
        if (exampleBtn) {
            exampleBtn.addEventListener('click', () => {
                const examples = [
                    "SELECT * FROM suspects;",
                    "SELECT name, occupation, suspicious_level FROM suspects ORDER BY suspicious_level DESC;",
                    "SELECT * FROM timeline ORDER BY timestamp;",
                    "SELECT s.name, t.event_description, t.timestamp FROM timeline t JOIN suspects s ON t.suspect_id = s.id ORDER BY t.timestamp;",
                    "SELECT l.name, COUNT(*) as events FROM timeline t JOIN locations l ON t.location_id = l.id GROUP BY l.name;"
                ];
                const randomExample = examples[Math.floor(Math.random() * examples.length)];
                monacoEditor.setValue(randomExample);
                monacoEditor.focus();
            });
        }
        
        if (formatBtn) {
            formatBtn.addEventListener('click', () => {
                const value = monacoEditor.getValue();
                // Simple formatting - capitalize keywords
                const formatted = value
                    .replace(/\bselect\b/gi, 'SELECT')
                    .replace(/\bfrom\b/gi, 'FROM')
                    .replace(/\bwhere\b/gi, 'WHERE')
                    .replace(/\bjoin\b/gi, 'JOIN')
                    .replace(/\border by\b/gi, 'ORDER BY')
                    .replace(/\bgroup by\b/gi, 'GROUP BY');
                monacoEditor.setValue(formatted);
            });
        }
        
        // Ctrl+Enter to run query
        monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            runBtn.click();
        });
        
        // Focus editor
        monacoEditor.focus();
        
        // Make monacoEditor globally available
        window.monacoEditor = monacoEditor;
    })();
}

// Fallback textarea editor setup
function initTextareaFallback() {
    const container = document.getElementById('monaco-container');
    const textarea = document.createElement('textarea');
    textarea.id = 'sql-input';
    textarea.placeholder = 'Write your SQL query here...\n\nExample: SELECT * FROM suspects;';
    textarea.style.cssText = 'width: 100%; height: 100%; background: var(--bg-card); color: var(--text-primary); border: none; padding: 15px; font-family: monospace; resize: none; outline: none;';
    container.innerHTML = '';
    container.appendChild(textarea);
    
    const runBtn = document.getElementById('run-query-btn');
    const clearBtn = document.getElementById('clear-query-btn');
    const exampleBtn = document.getElementById('load-example-btn');
    const formatBtn = document.getElementById('format-query-btn');
    
    if (formatBtn) formatBtn.style.display = 'none';
    
    runBtn.addEventListener('click', () => {
        const query = textarea.value.trim();
        if (query && window.runQuery) {
            window.runQuery(query);
        }
    });
    
    clearBtn.addEventListener('click', () => {
        textarea.value = '';
        textarea.focus();
    });
    
    exampleBtn.addEventListener('click', () => {
        const examples = [
            "SELECT * FROM suspects;",
            "SELECT name, occupation, suspicious_level FROM suspects ORDER BY suspicious_level DESC;",
            "SELECT * FROM timeline ORDER BY timestamp;",
            "SELECT s.name, t.event_description, t.timestamp FROM timeline t JOIN suspects s ON t.suspect_id = s.id ORDER BY t.timestamp;",
            "SELECT l.name, COUNT(*) as events FROM timeline t JOIN locations l ON t.location_id = l.id GROUP BY l.name;"
        ];
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        textarea.value = randomExample;
    });
    
    textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            runBtn.click();
        }
    });
    
    textarea.focus();
}

function setupTextareaEditor(textarea) {
    const runBtn = document.getElementById('run-query-btn');
    const clearBtn = document.getElementById('clear-query-btn');
    const exampleBtn = document.getElementById('load-example-btn');
    const formatBtn = document.getElementById('format-query-btn');
    
    if (formatBtn) formatBtn.style.display = 'none';
    
    runBtn.addEventListener('click', () => {
        const query = textarea.value.trim();
        if (query && window.runQuery) {
            window.runQuery(query);
        }
    });
    
    clearBtn.addEventListener('click', () => {
        textarea.value = '';
        textarea.focus();
    });
    
    exampleBtn.addEventListener('click', () => {
        const examples = [
            "SELECT * FROM suspects;",
            "SELECT name, occupation, suspicious_level FROM suspects ORDER BY suspicious_level DESC;",
            "SELECT * FROM timeline ORDER BY timestamp;",
            "SELECT s.name, t.event_description, t.timestamp FROM timeline t JOIN suspects s ON t.suspect_id = s.id ORDER BY t.timestamp;",
            "SELECT l.name, COUNT(*) as events FROM timeline t JOIN locations l ON t.location_id = l.id GROUP BY l.name;"
        ];
        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        textarea.value = randomExample;
    });
    
    textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            runBtn.click();
        }
    });
}

// Setup visual query builder (legacy - for old drag-drop builder)
function setupVisualBuilder() {
    // Check if old builder exists
    const generateBtn = document.getElementById('generate-sql-btn');
    if (!generateBtn) {
        // New accessible builder is being used, skip old setup
        return;
    }
    
    setupDropZones();
    setupStarDraggable();
    
    generateBtn.addEventListener('click', () => {
        generateSQLFromBuilder();
    });
}

// Setup draggable star
function setupStarDraggable() {
    const starElement = document.querySelector('.draggable-star');
    if (starElement) {
        starElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/json', JSON.stringify({
                type: 'star',
                value: '*'
            }));
            starElement.classList.add('dragging');
        });
        
        starElement.addEventListener('dragend', () => {
            starElement.classList.remove('dragging');
        });
    }
}

// Setup drag and drop zones
function setupDropZones() {
    const zones = [
        'select-zone', 'from-zone', 'where-zone', 'orderby-zone',
        'modal-select-zone', 'modal-from-zone', 'modal-where-zone', 'modal-orderby-zone'
    ];
    
    zones.forEach(zoneId => {
        const zone = document.getElementById(zoneId);
        if (!zone) {
            // Silently skip if zone doesn't exist (might be in modal)
            return;
        }
        
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            // Only remove if we're actually leaving the zone
            if (!zone.contains(e.relatedTarget)) {
                zone.classList.remove('drag-over');
            }
        });
        
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('drag-over');
            
            try {
                const dataStr = e.dataTransfer.getData('application/json');
                if (!dataStr) {
                    console.warn('No data in drop event');
                    return;
                }
                const data = JSON.parse(dataStr);
                console.log('Dropped in zone:', zoneId, data); // Debug
                handleDrop(zoneId, data);
            } catch (error) {
                console.error('Error handling drop:', error);
            }
        });
        
        // Make sure zone is visible and accessible
        zone.style.minHeight = '50px';
        zone.style.position = 'relative';
        zone.style.zIndex = '10';
    });
}

// Handle dropped items
function handleDrop(zoneId, data) {
    const zone = document.getElementById(zoneId);
    
    if (zoneId === 'select-zone') {
        // Handle star (*) for select all
        if (data.type === 'star') {
            // Clear existing selects and add star
            currentQuery.select = [{ type: 'star', value: '*' }];
            zone.innerHTML = '';
            addItemToZone(zone, '*', { type: 'star', value: '*' });
        } else if (data.table && data.column) {
            // Remove star if adding specific columns
            currentQuery.select = currentQuery.select.filter(item => item.type !== 'star');
            
            // Add column if not already present
            if (!currentQuery.select.find(item => item.table === data.table && item.column === data.column)) {
                currentQuery.select.push(data);
                addItemToZone(zone, `${data.table}.${data.column}`, data);
            }
        }
    } else if (isFromZone) {
        currentQuery.from = data.table;
        zone.innerHTML = '';
        addItemToZone(zone, data.table, data);
    } else if (isWhereZone) {
        // For WHERE, we'll create a simple condition builder
        if (data.table && data.column) {
            const condition = createConditionBuilder(data);
            currentQuery.where.push(condition);
            addItemToZone(zone, `${data.table}.${data.column} = ?`, condition);
        }
    } else if (isOrderByZone) {
        if (data.table && data.column) {
            currentQuery.orderBy = data;
            zone.innerHTML = '';
            addItemToZone(zone, `${data.table}.${data.column}`, data);
        }
    }
}

// Add item to drop zone
function addItemToZone(zone, label, data) {
    const item = document.createElement('div');
    item.className = 'draggable-item';
    item.textContent = label;
    item.dataset.table = data.table;
    item.dataset.column = data.column;
    
    // Add remove button
    const removeBtn = document.createElement('span');
    removeBtn.textContent = ' ×';
    removeBtn.style.cursor = 'pointer';
    removeBtn.style.marginLeft = '10px';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        item.remove();
        removeFromQuery(zone.id, data);
    });
    
    item.appendChild(removeBtn);
    zone.appendChild(item);
    
    // Remove placeholder if exists
    const placeholder = zone.querySelector('.placeholder');
    if (placeholder) {
        placeholder.remove();
    }
}

// Remove item from query
function removeFromQuery(zoneId, data) {
    if (zoneId === 'select-zone') {
        if (data.type === 'star') {
            currentQuery.select = currentQuery.select.filter(item => item.type !== 'star');
        } else {
            currentQuery.select = currentQuery.select.filter(
                item => !(item.table === data.table && item.column === data.column)
            );
        }
    } else if (zoneId === 'from-zone') {
        currentQuery.from = null;
    } else if (zoneId === 'where-zone') {
        currentQuery.where = currentQuery.where.filter(
            item => !(item.table === data.table && item.column === data.column)
        );
    } else if (zoneId === 'orderby-zone') {
        currentQuery.orderBy = null;
    }
}

// Create condition builder (simplified)
function createConditionBuilder(data) {
    return {
        table: data.table,
        column: data.column,
        operator: '=',
        value: '?'
    };
}

// Generate SQL from visual builder
function generateSQLFromBuilder() {
    if (!currentQuery.from) {
        alert('Please select a table in the FROM clause');
        return;
    }
    
    let sql = 'SELECT ';
    
    if (currentQuery.select.length === 0) {
        sql += '*';
    } else {
        // Check if star is selected
        const hasStar = currentQuery.select.find(item => item.type === 'star');
        if (hasStar) {
            sql += '*';
        } else {
            sql += currentQuery.select.map(item => {
                if (item.table) {
                    return `${item.table}.${item.column}`;
                }
                return item.column || item.value;
            }).join(', ');
        }
    }
    
    sql += ` FROM ${currentQuery.from}`;
    
    if (currentQuery.where.length > 0) {
        sql += ' WHERE ' + currentQuery.where.map(w => `${w.table}.${w.column} ${w.operator} ${w.value}`).join(' AND ');
    }
    
    if (currentQuery.orderBy) {
        sql += ` ORDER BY ${currentQuery.orderBy.table}.${currentQuery.orderBy.column}`;
    }
    
    sql += ';';
    
    // Switch to SQL editor and populate
    const editorTab = document.querySelector('[data-tab="editor"]');
    if (editorTab) {
        editorTab.click();
    }
    if (monacoEditor) {
        monacoEditor.setValue(sql);
        monacoEditor.focus();
    }
}

// Setup draggable table items
function setupTableDraggables() {
    // This will be called from ui.js after tables are rendered
}

// Make table column draggable
function makeColumnDraggable(element, tableName, columnName) {
    element.draggable = true;
    element.classList.add('draggable-item');
    
    // Prevent click events from interfering with drag
    element.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    
    element.addEventListener('dragstart', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({
            table: tableName,
            column: columnName
        }));
        element.classList.add('dragging');
        console.log('Dragging column:', tableName, columnName); // Debug
    });
    
    element.addEventListener('dragend', (e) => {
        element.classList.remove('dragging');
        console.log('Drag ended'); // Debug
    });
    
    // Add visual feedback
    element.addEventListener('dragenter', (e) => {
        e.preventDefault();
    });
}

// Make table name draggable
function makeTableDraggable(element, tableName) {
    element.draggable = true;
    element.classList.add('draggable-item');
    
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            table: tableName,
            column: null
        }));
        element.classList.add('dragging');
    });
    
    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
    });
}

// Make star (*) draggable for selecting all columns
function makeStarDraggable(element, tableName) {
    element.draggable = true;
    element.classList.add('draggable-item');
    
    // Prevent click events from interfering with drag
    element.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });
    
    element.addEventListener('dragstart', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify({
            table: tableName,
            column: '*',
            type: 'star'
        }));
        element.classList.add('dragging');
        console.log('Dragging star for table:', tableName); // Debug
    });
    
    element.addEventListener('dragend', (e) => {
        element.classList.remove('dragging');
        console.log('Star drag ended'); // Debug
    });
    
    // Add visual feedback
    element.addEventListener('dragenter', (e) => {
        e.preventDefault();
    });
}

// Make functions globally available
window.handleDrop = handleDrop;

// Clear query builder
function clearQueryBuilder() {
    currentQuery = {
        select: [],
        from: null,
        where: [],
        orderBy: null
    };
    
    ['select-zone', 'from-zone', 'where-zone', 'orderby-zone'].forEach(zoneId => {
        const zone = document.getElementById(zoneId);
        zone.innerHTML = '<div class="placeholder">Drag items here</div>';
    });
}
