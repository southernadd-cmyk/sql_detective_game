// Query editor utilities and drag helpers

// Initialize query editor
function initQueryEditor() {
    // Always setup SQL editor (used by both builders)
    setupSQLEditor();
    setupTableDraggables();
}

// Setup SQL editor with textarea
function setupSQLEditor() {
    // Always use textarea editor
    initTextareaFallback();
}

// Textarea editor setup
function initTextareaFallback() {
    // Try sql-editor-container first (query builder modal), then sql-container (main page)
    const container = document.getElementById('sql-editor-container') || document.getElementById('sql-container') || document.getElementById('monaco-container');
    if (!container) {
        return; // Container doesn't exist yet, will be initialized later
    }
    
    // Check if textarea already exists
    let textarea = document.getElementById('sql-input');
    if (!textarea) {
        textarea = document.createElement('textarea');
        textarea.id = 'sql-input';
        textarea.placeholder = 'Write your SQL query here...\n\nExample: SELECT * FROM suspects;';
        textarea.style.cssText = 'width: 100%; height: 100%; background: var(--bg-card); color: var(--text-primary); border: none; padding: 15px; font-family: monospace; resize: none; outline: none;';
        container.innerHTML = '';
        container.appendChild(textarea);
    }
    
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
            "SELECT name, suspicion, motive_hint FROM suspects ORDER BY suspicion DESC;",
            "SELECT * FROM time_logs ORDER BY timestamp;",
            "SELECT cf.case_title, e.item, e.time_found FROM case_files cf JOIN evidence e ON cf.case_id = e.case_id ORDER BY e.time_found;",
            "SELECT l.location_name, COUNT(*) as events FROM time_logs t JOIN locations l ON t.location_code = l.location_code GROUP BY l.location_name;"
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
            "SELECT name, suspicion, motive_hint FROM suspects ORDER BY suspicion DESC;",
            "SELECT * FROM time_logs ORDER BY timestamp;",
            "SELECT cf.case_title, e.item, e.time_found FROM case_files cf JOIN evidence e ON cf.case_id = e.case_id ORDER BY e.time_found;",
            "SELECT l.location_name, COUNT(*) as events FROM time_logs t JOIN locations l ON t.location_code = l.location_code GROUP BY l.location_name;"
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
    });
    
    element.addEventListener('dragend', (e) => {
        element.classList.remove('dragging');
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
