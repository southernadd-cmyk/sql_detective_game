// UI updates and result visualization
let tableData = {};

// Modal Management System
const MODAL_TYPES = {
    WORKSPACE: 'workspace',  // Fullscreen, one at a time
    REFERENCE: 'reference'   // Overlay, can stack
};

// Modal registry with types and z-index priorities
const modalRegistry = {
    'query-builder-modal': { type: MODAL_TYPES.WORKSPACE, priority: 1, zIndex: 100 },
    'query-detail-modal': { type: MODAL_TYPES.WORKSPACE, priority: 1, zIndex: 100 },
    'case-modal': { type: MODAL_TYPES.WORKSPACE, priority: 1, zIndex: 100 },
    'case-image-modal': { type: MODAL_TYPES.WORKSPACE, priority: 1, zIndex: 100 },
    'evidence-modal': { type: MODAL_TYPES.WORKSPACE, priority: 1, zIndex: 100 },
    'schema-modal': { type: MODAL_TYPES.REFERENCE, priority: 2, zIndex: 200 },
    'table-modal': { type: MODAL_TYPES.REFERENCE, priority: 2, zIndex: 200 }
};

// Track currently open modals
const openModals = {
    workspace: null,
    reference: []
};

// Close all workspace modals
function closeAllWorkspaceModals() {
    Object.keys(modalRegistry).forEach(modalId => {
        const modalInfo = modalRegistry[modalId];
        if (modalInfo.type === MODAL_TYPES.WORKSPACE) {
            const modal = safeGetElement(modalId);
            if (modal && modal.style.display === 'block') {
                closeModal(modalId);
            }
        }
    });
    openModals.workspace = null;
}

// Open modal with hierarchy management
function openModal(modalId) {
    const modalInfo = modalRegistry[modalId];
    if (!modalInfo) {
        console.warn(`Modal ${modalId} not found in registry`);
        return;
    }

    const modal = safeGetElement(modalId);
    if (!modal) {
        console.warn(`Modal element ${modalId} not found`);
        return;
    }

    // If opening a workspace modal, close other workspace modals
    if (modalInfo.type === MODAL_TYPES.WORKSPACE) {
        closeAllWorkspaceModals();
        openModals.workspace = modalId;
    } else if (modalInfo.type === MODAL_TYPES.REFERENCE) {
        // Reference modals can stack
        if (!openModals.reference.includes(modalId)) {
            openModals.reference.push(modalId);
        }
    }

    // Set z-index (base z-index from CSS + modal priority)
    const baseZIndex = 2000; // Base modal z-index from CSS
    modal.style.zIndex = baseZIndex + modalInfo.zIndex;

    // Show modal
    modal.style.display = 'block';
}

// Close modal with hierarchy management
function closeModal(modalId) {
    const modalInfo = modalRegistry[modalId];
    if (!modalInfo) {
        // Fallback for modals not in registry
        const modal = safeGetElement(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('half-screen');
        }
        return;
    }
    
    const modal = safeGetElement(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    modal.classList.remove('half-screen');
    
    // Update tracking
    if (modalInfo.type === MODAL_TYPES.WORKSPACE) {
        if (openModals.workspace === modalId) {
            openModals.workspace = null;
        }
    } else if (modalInfo.type === MODAL_TYPES.REFERENCE) {
        const index = openModals.reference.indexOf(modalId);
        if (index > -1) {
            openModals.reference.splice(index, 1);
        }
    }
}

// Null-safe utility functions
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element #${id} not found`);
        return null;
    }
    return element;
}

function safeQuerySelector(parent, selector) {
    if (!parent) return null;
    return parent.querySelector(selector);
}

function safeSetInnerHTML(id, content) {
    const element = safeGetElement(id);
    if (element) {
        element.innerHTML = content;
    }
}

function safeAddEventListener(id, event, handler) {
    const element = safeGetElement(id);
    if (element) {
        element.addEventListener(event, handler);
    }
}

// Initialize component safely
function initComponent(componentName, initFn) {
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initFn);
        } else {
            initFn();
        }
    } catch (error) {
        console.error(`Failed to initialize ${componentName}:`, error);
    }
}

// Initialize UI
function initUI() {
    initComponent('UI', () => {
        setupSchemaModal();
        updateClueDisplay();
        setupModals();
        renderTables(); // Render tables after DOM is ready
    });
}

// Setup schema modal
function setupSchemaModal() {
    const modal = safeGetElement('schema-modal');
    if (!modal) return;
    
    const btn = safeGetElement('show-schema-btn');
    const modalBtn = safeGetElement('modal-show-schema-btn');
    const close = safeQuerySelector(modal, '.close');
    
    // Only add listeners if elements exist (they're optional)
    if (btn) {
        safeAddEventListener('show-schema-btn', 'click', () => showSchemaModal());
    }
    if (modalBtn) {
        safeAddEventListener('modal-show-schema-btn', 'click', () => showSchemaModal());
    }
    
    if (close) {
        close.addEventListener('click', () => {
            closeModal('schema-modal');
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('schema-modal');
        }
    });
}

// Show schema modal
function showSchemaModal() {
    const details = safeGetElement('schema-details');
    if (details) {
        safeSetInnerHTML('schema-details', generateSchemaHTML());
    }
    openModal('schema-modal');
}

const schemaTables = (typeof window !== 'undefined' && window.SCHEMA_TABLES)
    ? window.SCHEMA_TABLES
    : [];

// Generate schema HTML
function generateSchemaHTML() {
    const tables = schemaTables;
    
    let html = '';
    tables.forEach(table => {
        html += `
            <div class="schema-table" style="margin-bottom: 30px; padding: 20px; background: var(--card-bg); border-radius: 8px;">
                <h3 style="color: var(--secondary-color); margin-bottom: 10px;">${table.name}</h3>
                <p style="color: var(--text-muted); margin-bottom: 15px;">${table.description}</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--primary-color);">
                            <th style="padding: 10px; text-align: left;">Column</th>
                            <th style="padding: 10px; text-align: left;">Type</th>
                            <th style="padding: 10px; text-align: left;">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${table.columns.map(col => {
                            const desc = col.description ? col.description : '';
                            return `
                            <tr>
                                <td style="padding: 8px; font-family: monospace; color: var(--secondary-color);">${col.name}</td>
                                <td style="padding: 8px; color: var(--text-muted);">${col.type}</td>
                                <td style="padding: 8px;">${desc}</td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
    
    return html;
}

// Render tables in schema panel
function renderTables() {
    // Get all possible table list containers
    const tableLists = [
        document.getElementById('inline-table-list'),
        document.getElementById('modal-table-list'),
        document.getElementById('table-list')
    ].filter(list => list !== null);
    
    // If no table lists found, try to create one
    if (tableLists.length === 0) {
        // Try inline query builder first
        const inlineQueryBuilder = document.getElementById('query-builder-view');
        if (inlineQueryBuilder) {
            const databaseFiles = inlineQueryBuilder.querySelector('.database-files');
            if (databaseFiles) {
                const listContainer = document.createElement('div');
                listContainer.id = 'inline-table-list';
                listContainer.className = 'table-list';
                databaseFiles.appendChild(listContainer);
                tableLists.push(listContainer);
            }
        }
        
        // Try modal query builder
        if (tableLists.length === 0) {
            const modal = document.getElementById('query-builder-modal');
            if (modal) {
                const databaseFiles = modal.querySelector('.database-files');
                if (databaseFiles) {
                    const listContainer = document.createElement('div');
                    listContainer.id = 'modal-table-list';
                    listContainer.className = 'table-list';
                    databaseFiles.appendChild(listContainer);
                    tableLists.push(listContainer);
                }
            }
        }
    }
    
    // If still no table list, return early
    if (tableLists.length === 0) {
        console.warn('Could not find or create table-list element');
        return;
    }
    
    // Use the first available table list (or render to all if needed)
    const tableList = tableLists[0];
    
    // Get all available tables with their schemas
    const allTables = schemaTables.map(table => ({
        name: table.name,
        description: table.description,
        columns: table.columns.map(column => column.name)
    }));

    // Filter to only show unlocked tables based on current case progress
    // Default to case_files only if case system isn't ready yet
    let unlockedTables = ['case_files'];
    if (window.caseSystem && window.caseSystem.getUnlockedTables) {
        try {
            unlockedTables = window.caseSystem.getUnlockedTables();
        } catch (error) {
            console.warn('Error getting unlocked tables, using default:', error);
        }
    }

    const tables = allTables.filter(table => unlockedTables.includes(table.name));
    
    tableList.innerHTML = '';
    
    tables.forEach(table => {
        const item = document.createElement('div');
        item.className = 'table-item';
        
        const columnList = document.createElement('div');
        columnList.className = 'column-list';
        
        // Add draggable * (star) for selecting all columns
        const starItem = document.createElement('div');
        starItem.className = 'column-item star-item';
        starItem.textContent = '*';
        starItem.dataset.table = table.name;
        starItem.dataset.column = '*';
        starItem.title = `Drag to select all columns from ${table.name}`;
        
        // Make star draggable
        if (window.makeStarDraggable) {
            window.makeStarDraggable(starItem, table.name);
        }
        
        columnList.appendChild(starItem);
        
        table.columns.forEach(column => {
            const columnItem = document.createElement('div');
            columnItem.className = 'column-item';
            columnItem.textContent = column;
            columnItem.dataset.table = table.name;
            columnItem.dataset.column = column;
            
            // Make column draggable
            if (window.makeColumnDraggable) {
                window.makeColumnDraggable(columnItem, table.name, column);
            }
            
            columnList.appendChild(columnItem);
        });
        
        // Create header with click handler to expand/collapse folder
        const header = document.createElement('h3');
        header.textContent = table.name;
        header.style.cursor = 'pointer';
        header.title = 'Click to expand/collapse folder';
        
        // Make header clickable to toggle folder expansion
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            // Toggle expanded class to show/hide columns
            item.classList.toggle('expanded');
        });
        
        const description = document.createElement('p');
        description.textContent = table.description;
        
        item.appendChild(header);
        item.appendChild(description);
        item.appendChild(columnList);
        
        item.dataset.tableName = table.name;
        item.dataset.tableDescription = table.description;
        item.dataset.tableColumns = JSON.stringify(table.columns);
        
        // Make table item draggable for query builder (but not the header/zoom hint)
        if (window.makeTableDraggable) {
            window.makeTableDraggable(item, table.name);
        }
        
        // Prevent drag when clicking header
        header.addEventListener('mousedown', (e) => e.stopPropagation());
        
        // Prevent table click from interfering with column drag
        columnList.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('column-item')) {
                e.stopPropagation();
            }
        });
        
        // Also prevent clicks on the table item itself when clicking columns
        columnList.addEventListener('click', (e) => {
            if (e.target.classList.contains('column-item') || e.target.closest('.column-item')) {
                e.stopPropagation();
            }
        });
        
        tableList.appendChild(item);
    });
    
    // Also render to other table lists if they exist (for consistency)
    if (tableLists.length > 1) {
        const firstListHTML = tableList.innerHTML;
        tableLists.slice(1).forEach(list => {
            list.innerHTML = firstListHTML;
            // Re-setup interactions for cloned items
            list.querySelectorAll('.table-item').forEach(item => {
                const tableName = item.dataset.tableName;
                if (tableName && window.makeTableDraggable) {
                    window.makeTableDraggable(item, tableName);
                }
                
                item.querySelectorAll('.column-item').forEach(col => {
                    const colTable = col.dataset.table;
                    const colName = col.dataset.column;
                    if (colTable && colName) {
                        if (colName === '*' && window.makeStarDraggable) {
                            window.makeStarDraggable(col, colTable);
                        } else if (window.makeColumnDraggable) {
                            window.makeColumnDraggable(col, colTable, colName);
                        }
                    }
                });
            });
        });
    }
}

// Display query results
function displayResults(query, result) {
    // Results always show in main evidence board (not in query builder modal)
    const container = safeGetElement('results-container');
    const info = safeGetElement('query-info');
    
    if (!container) {
        console.warn('Results container not found');
        return;
    }
    
    // Store result for view switching
    window.lastQueryResult = result;
    
    if (!result.success) {
        container.innerHTML = `
            <div class="results-placeholder">
                <p style="color: var(--accent-red);">Error: ${result.error}</p>
            </div>
        `;
        if (info) {
            info.className = 'query-info error';
            info.textContent = `Query failed: ${result.error}`;
        }
        return;
    }
    
    if (!result.result || result.result.length === 0) {
        container.innerHTML = `
            <div class="results-placeholder">
                <p>Query executed successfully but returned no results.</p>
            </div>
        `;
        if (info) {
            info.className = 'query-info success';
            info.textContent = 'Query executed successfully. No rows returned.';
        }
        return;
    }
    
    // Get first result set
    const resultSet = result.result[0];
    const columns = resultSet.columns;
    const values = resultSet.values;
    
    // Check if we're in query builder modal
    const isInQueryBuilder = container.closest('#query-builder-modal') !== null;
    
    // Get current view mode - check in the correct container's parent
    const viewToggleParent = container.closest('.query-results-pane') || container.closest('.board-content');
    const activeViewBtn = viewToggleParent?.querySelector('.view-toggle .view-btn-pixel.active');
    const currentView = activeViewBtn ? activeViewBtn.dataset.view : 'table';
    
    // Render based on current view
    if (currentView === 'chart' && window.renderView) {
        window.renderView('chart', result);
    } else if (currentView === 'evidence' && window.renderView) {
        window.renderView('evidence', result);
    } else {
        // Default to table view or timeline view
        if (columns.includes('timestamp') && columns.includes('event_description')) {
            displayTimelineView(columns, values, container);
        } else {
            displayTableView(columns, values, container);
        }
    }
    
    // Setup view toggle if in query builder
    if (isInQueryBuilder) {
        setupQueryBuilderViewToggle(container);
    }
    
    // Add zoom hint only for main desk (not query builder)
    if (!isInQueryBuilder && !container.querySelector('.zoom-hint') && !container.querySelector('.results-placeholder')) {
        const zoomHint = document.createElement('div');
        zoomHint.className = 'zoom-hint pixel-text-tiny';
        zoomHint.textContent = 'CLICK TO VIEW FULL SCREEN';
        zoomHint.style.marginTop = '10px';
        zoomHint.style.textAlign = 'center';
        container.appendChild(zoomHint);
    }
    
    if (info) {
        info.className = 'query-info success';
        info.textContent = `Query executed successfully. ${values.length} row(s) returned.`;
    }
    
    // Check for clues
    if (window.checkForClues) {
        window.checkForClues(query, result);
    }
    
    // Validate against current case
    if (result.success && typeof window.caseSystem !== 'undefined' && result.result && result.result.length > 0) {
        const currentCase = window.caseSystem.getCurrentCase();
        if (currentCase) {
            // Check if case is already completed - if so, skip validation entirely
            const wasAlreadyCompleted = window.caseSystem.completedCases.has(currentCase.id);
            
            if (!wasAlreadyCompleted) {
                // Pass the first result set (not the array) to validation
                const resultSet = result.result[0];
                const validation = window.caseSystem.validateCaseQuery(currentCase.id, resultSet);
                
                // Only proceed if validation passes AND case is still not completed
                // (validateCaseQuery also checks completion status, but double-check here)
                if (validation.valid && !window.caseSystem.completedCases.has(currentCase.id)) {
                    // Store the case ID before completing to ensure we only alert for state transitions
                    const caseIdToComplete = currentCase.id;
                    
                    // Complete the case BEFORE updating UI
                    window.caseSystem.completeCase(caseIdToComplete);
                    
                    // Verify the case was actually just completed (state transition check)
                    // This ensures we only show the alert when the state actually changes
                    if (window.caseSystem.completedCases.has(caseIdToComplete)) {
                        // Small delay to ensure state is updated
                        setTimeout(() => {
                            if (window.updateCaseDisplay) {
                                window.updateCaseDisplay();
                            }
                            if (window.renderTables) {
                                window.renderTables();
                            }
                            if (window.toast) {
                                window.toast.success(`Case ${caseIdToComplete} completed! ${validation.message}`, 5000);
                            } else {
                                alert(`Case ${caseIdToComplete} completed! ${validation.message}`);
                            }
                        }, 100);
                    }
                } else if (!validation.valid) {
                    // Show validation error (but don't log "already completed" as an error)
                    if (validation.message !== 'Case already completed') {
                        console.log('Case validation failed:', validation.message);
                        const requiredColumns = currentCase.validation?.requiredColumns || [];
                        const resultColumns = resultSet.columns || [];
                        const missingColumns = requiredColumns.filter(col => !resultColumns.includes(col));
                        if (window.toast) {
                            const missingHint = missingColumns.length > 0
                                ? ` Missing columns: ${missingColumns.join(', ')}.`
                                : '';
                            window.toast.warning(`${validation.message}.${missingHint}`, 5000);
                        }
                    }
                }
            }
        }
    }
    
    // Always add successful queries to history (regardless of case validation)
    if (result.success && window.queryHistory && window.queryHistory.add) {
        const currentCase = (typeof window.caseSystem !== 'undefined' && window.caseSystem.getCurrentCase) 
            ? window.caseSystem.getCurrentCase() 
            : null;
        const taskTitle = currentCase ? currentCase.title : 'General Query';
        const caseId = currentCase ? currentCase.id : null;
        window.queryHistory.add(query, result, caseId, taskTitle);
    }
    
    // Always update evidence board after successful query
    if (result.success) {
        // Small delay to ensure query history is saved
        setTimeout(() => {
            if (window.updateEvidenceBoard) {
                window.updateEvidenceBoard();
            }
        }, 200);
    }
}

// Display table view
function displayTableView(columns, values, container) {
    let html = '<table class="results-table"><thead><tr>';
    
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    values.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            const cellValue = cell === null ? '<em>NULL</em>' : escapeHtml(String(cell));
            html += `<td>${cellValue}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Display timeline view
function displayTimelineView(columns, values, container) {
    const timestampIndex = columns.indexOf('timestamp');
    const eventIndex = columns.indexOf('event_description');
    
    // Sort by timestamp
    const sortedValues = [...values].sort((a, b) => {
        const timeA = new Date(a[timestampIndex]);
        const timeB = new Date(b[timestampIndex]);
        return timeA - timeB;
    });
    
    let html = '<div class="timeline-view">';
    
    sortedValues.forEach(row => {
        const timestamp = row[timestampIndex];
        const event = row[eventIndex];
        
        // Get other column values
        let otherInfo = '';
        columns.forEach((col, idx) => {
            if (col !== 'timestamp' && col !== 'event_description' && row[idx] !== null) {
                otherInfo += `<div style="font-size: 0.9em; color: var(--text-muted); margin-top: 5px;">${col}: ${row[idx]}</div>`;
            }
        });
        
        html += `
            <div class="timeline-item">
                <div class="timeline-time">${timestamp}</div>
                <div class="timeline-event">${escapeHtml(event)}</div>
                ${otherInfo}
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Update clue display
// Update case display with current case information
function updateCaseDisplay() {
    if (typeof window.caseSystem === 'undefined') {
        console.warn('Case system not loaded');
        return;
    }
    
    // Ensure progress is loaded before displaying
    if (window.caseSystem.loadProgress) {
        window.caseSystem.loadProgress();
    }
    
    const currentCase = window.caseSystem.getCurrentCase();
    if (!currentCase) {
        // If no current case, check if all cases are completed
        if (window.caseSystem.completedCases.size >= window.caseSystem.cases.length) {
            console.log('All cases completed!');
            // Show a completion message or the last case
            const lastCase = window.caseSystem.cases[window.caseSystem.cases.length - 1];
            if (lastCase) {
                // Display the last case as completed
                const caseTitleEl = safeGetElement('case-title');
                if (caseTitleEl) {
                    caseTitleEl.textContent = `CASE ${lastCase.id}: ${lastCase.title} (COMPLETED)`;
                }
                return;
            }
        }
        console.warn('No current case found. Current index:', window.caseSystem.currentCaseIndex);
        return;
    }
    
    // Update case title
    const caseTitleEl = safeGetElement('case-title');
    if (caseTitleEl) {
        caseTitleEl.textContent = `CASE ${currentCase.id}: ${currentCase.title}`;
    }
    
    // Update case story
    const caseStoryEl = safeGetElement('case-story');
    if (caseStoryEl) {
        caseStoryEl.innerHTML = `<p>${currentCase.story}</p>`;
    }
    
    // Update case task
    const caseTaskEl = safeGetElement('case-task-text');
    if (caseTaskEl) {
        caseTaskEl.textContent = currentCase.task;
    }
    
    // Update progress
    const currentCaseNumEl = safeGetElement('current-case-num');
    if (currentCaseNumEl) {
        currentCaseNumEl.textContent = currentCase.id;
    }
    
    const totalCasesEl = safeGetElement('total-cases');
    if (totalCasesEl) {
        totalCasesEl.textContent = window.caseSystem.cases.length;
    }
    
    const unlockedTablesCountEl = safeGetElement('unlocked-tables-count');
    if (unlockedTablesCountEl) {
        const unlocked = window.caseSystem.getUnlockedTables();
        unlockedTablesCountEl.textContent = unlocked.length;
    }

    // Show case image modal when a new case starts
    // Only show if this is not the initial load (check if we have a previous case)
    if (window.caseSystem && typeof window.showCaseImageModal === 'function') {
        // Show the case image modal with a small delay to ensure UI is updated
        setTimeout(() => {
            window.showCaseImageModal(currentCase.id);
        }, 500);
    }
}

function updateClueDisplay() {
    // Note: clue-count and clue-list elements were removed in the new design
    // This function is kept for compatibility but doesn't need to do anything
    // since we're using case-based progression instead of clue-based
    const clueCount = safeGetElement('clue-count');
    const clueList = safeGetElement('clue-list');
    
    // Only update if elements exist (for backward compatibility)
    if (clueCount && clueList && window.getClueCount) {
        const count = window.getClueCount();
        clueCount.textContent = count;
        
        if (window.getDiscoveredClues) {
            const clues = window.getDiscoveredClues();
            clueList.innerHTML = '';
            clues.forEach(clue => {
                const badge = document.createElement('div');
                badge.className = 'clue-badge';
                badge.textContent = clue.description;
                clueList.appendChild(badge);
            });
        }
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Modal Functions
function showCaseModal() {
    const modal = safeGetElement('case-modal');
    if (!modal) return;
    
    // Get current case information from the case system
    if (typeof window.caseSystem !== 'undefined') {
        const currentCase = window.caseSystem.getCurrentCase();
        if (currentCase) {
            const caseStoryFull = safeGetElement('case-story-full');
            const caseTitleFull = safeGetElement('case-title-full');
            const caseTaskFull = safeGetElement('case-task-full');
            
            if (caseStoryFull) {
                caseStoryFull.innerHTML = `<p>${currentCase.story}</p>`;
            }
            if (caseTitleFull) {
                caseTitleFull.textContent = `CASE ${currentCase.id}: ${currentCase.title}`;
            }
            if (caseTaskFull) {
                caseTaskFull.textContent = currentCase.task;
            }
        }
    } else {
        // Fallback to reading from DOM if case system not available
        const caseStoryEl = safeGetElement('case-story');
        const caseTitleEl = safeGetElement('case-title');
        const caseTaskEl = safeGetElement('case-task-text');
        
        const storyText = caseStoryEl ? caseStoryEl.textContent : 'No case information available';
        const titleText = caseTitleEl ? caseTitleEl.textContent : 'CASE FILE';
        const taskText = caseTaskEl ? caseTaskEl.textContent : 'No task available';
        
        const caseStoryFull = safeGetElement('case-story-full');
        const caseTitleFull = safeGetElement('case-title-full');
        const caseTaskFull = safeGetElement('case-task-full');
        
        if (caseStoryFull) {
            caseStoryFull.textContent = storyText;
        }
        if (caseTitleFull) {
            caseTitleFull.textContent = titleText;
        }
        if (caseTaskFull) {
            caseTaskFull.textContent = taskText;
        }
    }
    
    // Add click handler to dramatically increase font size
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
        // Remove existing listener if any
        modalBody.removeEventListener('click', handleCaseModalClick);
        // Add click handler to increase font size dramatically
        modalBody.addEventListener('click', handleCaseModalClick);
    }
    
    // Update case progress in modal
    const currentCaseNum = safeGetElement('current-case-num');
    const totalCases = safeGetElement('total-cases');
    const unlockedTablesCount = safeGetElement('unlocked-tables-count');
    
    if (currentCaseNum && typeof window.caseSystem !== 'undefined') {
        const currentCase = window.caseSystem.getCurrentCase();
        if (currentCase) {
            const modalCaseNum = safeGetElement('modal-current-case-num');
            const modalTotalCases = safeGetElement('modal-total-cases');
            const modalUnlockedCount = safeGetElement('modal-unlocked-tables-count');
            
            if (modalCaseNum) modalCaseNum.textContent = currentCase.id;
            if (modalTotalCases) modalTotalCases.textContent = window.caseSystem.cases.length;
            if (modalUnlockedCount) {
                const unlocked = window.caseSystem.getUnlockedTables();
                modalUnlockedCount.textContent = unlocked.length;
            }
        }
    }
    
    // Case modal doesn't need half-screen (it's just text)
    openModal('case-modal');
}

// Handle case modal click to increase font size dramatically
function handleCaseModalClick(e) {
    // Don't trigger on close button or other interactive elements
    if (e.target.classList.contains('close') || e.target.closest('.close')) {
        return;
    }
    
    const modal = safeGetElement('case-modal');
    if (!modal) return;
    
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;
    
    // Toggle enlarged state
    const isEnlarged = modalBody.classList.toggle('case-modal-enlarged');
    
    // Apply dramatic font size increase (4x bigger)
    const titleFull = safeGetElement('case-title-full');
    const storyFull = safeGetElement('case-story-full');
    const taskFull = safeGetElement('case-task-full');
    const caseSections = modalBody.querySelectorAll('.case-section');
    
    if (isEnlarged) {
        // Enlarge: 4x bigger
        if (titleFull) titleFull.style.fontSize = '64px'; // 16px * 4
        if (storyFull) {
            storyFull.style.fontSize = '72px'; // 18px * 4
            storyFull.querySelectorAll('p').forEach(p => {
                p.style.fontSize = '72px';
            });
        }
        if (taskFull) taskFull.style.fontSize = '72px'; // 18px * 4
        caseSections.forEach(section => {
            section.querySelectorAll('h3').forEach(h3 => {
                h3.style.fontSize = '64px'; // 16px * 4
            });
            section.querySelectorAll('p').forEach(p => {
                p.style.fontSize = '72px'; // 18px * 4
            });
        });
    } else {
        // Reset to original sizes
        if (titleFull) titleFull.style.fontSize = '';
        if (storyFull) {
            storyFull.style.fontSize = '';
            storyFull.querySelectorAll('p').forEach(p => {
                p.style.fontSize = '';
            });
        }
        if (taskFull) taskFull.style.fontSize = '';
        caseSections.forEach(section => {
            section.querySelectorAll('h3').forEach(h3 => {
                h3.style.fontSize = '';
            });
            section.querySelectorAll('p').forEach(p => {
                p.style.fontSize = '';
            });
        });
    }
}

// Case image descriptions for alt text
const caseImageDescriptions = {
    1: "Detective Conan standing confidently in front of the Mouri Detective Agency office. A mysterious receipt paper flutters on the desk behind him, with a faint impression visible. The office appears chaotic with papers scattered around, suggesting recent activity. Conan looks determined, pointing towards the desk as if discovering an important clue.",
    2: "Conan and Ran sitting at Cafe Poirot, a cozy detective-themed cafe. The detective Amuro Tooru stands behind the counter, looking concerned. Sugar jars on the counter have been mysteriously rearranged, and a note with strange symbols lies nearby. The atmosphere is tense, with Conan appearing thoughtful while Ran looks worried.",
    3: "A group of Detective Boys - Ayumi, Mitsuhiko, Genta, and Conan - gathered around an elementary school locker. Genta looks confused, Ayumi points excitedly, and Mitsuhiko examines the locker door with a magnifying glass. A star-shaped scratch mark is visible on the locker, and the children appear both curious and concerned about this mysterious vandalism.",
    4: "Inspector Megure stands in the Metropolitan Police Department briefing room, looking frustrated with papers in hand. Officer Takagi appears nervous nearby. A lost-and-found umbrella with a mysterious note is prominently displayed. The room has a serious investigative atmosphere with maps and case files scattered around.",
    5: "Inspector Megure and Conan examining evidence in the Metropolitan Police evidence locker. Sato stands protectively nearby while Takagi carefully handles evidence bags. Various items are laid out on a table, with Conan focusing intently on one particular piece of evidence. The locker room is filled with organized evidence containers.",
    6: "Officer Takagi reviewing security footage on a computer screen in a dimly lit room. The footage shows an elevator in an empty building stopping at an unusual hour. Conan stands beside him, looking thoughtful. Various monitors and security equipment surround them, creating a high-tech investigation atmosphere.",
    7: "Conan standing before a large evidence board covered with photos, timelines, and connecting strings. He appears to be analyzing patterns, with his finger tracing connections between different pieces of evidence. The board shows multiple case photos, timelines, and evidence markers, representing the complexity of the investigation.",
    8: "Hattori Heiji dramatically bursting into an investigation room, with Sonoko looking excited and Inspector Megure appearing stern. Conan stands calmly in the center, focused on a suspect database on a computer screen. The room is filled with investigation materials and has a tense, energetic atmosphere.",
    9: "Inspector Megure leaning heavily on his desk, looking exhausted from the investigation. Officer Takagi stands nearby holding documents. Various witness statements and case files are spread across the desk. The atmosphere conveys the weight of responsibility and the complexity of coordinating multiple witness accounts.",
    10: "The final confrontation scene with all main characters gathered - Conan, Inspector Megure, Officer Takagi, Sato, Hattori Heiji, and others. Everyone looks serious and determined. The room appears to be a central command center with evidence boards, computer screens, and investigative materials everywhere. The atmosphere is one of final resolution."
};

function showCaseImageModal(caseId) {
    const modal = safeGetElement('case-image-modal');
    const imageElement = safeGetElement('case-image-display');
    const titleElement = safeGetElement('case-image-title');
    const closeBtn = safeGetElement('case-image-close-btn');

    if (!modal || !imageElement || !titleElement) {
        console.warn('Case image modal elements not found');
        return;
    }

    // Set image source and alt text
    const imagePath = `images/c${caseId}.webp`;
    const altText = caseImageDescriptions[caseId] || `Case ${caseId} investigation briefing image`;

    imageElement.src = imagePath;
    imageElement.alt = altText;

    // Set title
    titleElement.textContent = `CASE ${caseId} BRIEFING`;

    // Setup close button
    if (closeBtn) {
        // Remove existing listener to prevent duplicates
        closeBtn.removeEventListener('click', closeCaseImageModal);
        closeBtn.addEventListener('click', closeCaseImageModal);
    }

    // Setup close button in header
    const closeElements = modal.querySelectorAll('.case-image-close');
    closeElements.forEach(element => {
        element.removeEventListener('click', closeCaseImageModal);
        element.addEventListener('click', closeCaseImageModal);
    });

    // Setup click outside to close
    modal.removeEventListener('click', handleModalBackgroundClick);
    modal.addEventListener('click', handleModalBackgroundClick);

    // Prevent scrollbars immediately
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    // Show modal
    openModal('case-image-modal');

    function closeCaseImageModal() {
        closeModal('case-image-modal');
        document.body.classList.remove('modal-open');

        // Restore scrolling
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        // Trigger onboarding when case image modal closes (only for case 1)
        if (window.caseSystem && window.caseSystem.getCurrentCase) {
            const currentCase = window.caseSystem.getCurrentCase();
            if (currentCase && currentCase.id === 1) {
                // Start onboarding after modal closes
                setTimeout(() => {
                    if (window.onboarding && typeof window.onboarding.init === 'function') {
                        window.onboarding.init(true);
                    }
                }, 500);
            }
        }
    }

    function handleModalBackgroundClick(e) {
        // Disable background click to close for comic panel style
        // Comic panels should only close via explicit buttons
        return;
    }
}

function showEvidenceModal() {
    // Update pinboard before showing modal
    if (window.updateEvidenceBoard) {
        window.updateEvidenceBoard();
    }

    // Modal is already fullscreen via fullscreen-modal class in HTML
    openModal('evidence-modal');
}

// Show table data inline in query builder results pane
function showTableDataInline(table) {
    // Results now show in main evidence board
    const resultsContainer = safeGetElement('results-container');
    const queryInfo = safeGetElement('query-info');
    
    if (!resultsContainer) {
        console.warn('Results container not found');
        // Fallback: show table modal
        showTableModal(table);
        return;
    }
    
    // Show loading state
    resultsContainer.innerHTML = `
        <div class="results-placeholder">
            <p class="pixel-text-tiny">Loading table data...</p>
        </div>
    `;
    
    // Execute query to get table data
    if (window.executeQuery) {
        const query = `SELECT * FROM ${table.name} LIMIT 100;`;
        try {
            const result = window.executeQuery(query);
            
            if (result && result.success) {
                // Display results inline
                displayResultsInQueryBuilder(result, table.name);
            } else {
                resultsContainer.innerHTML = `
                    <div class="results-placeholder">
                        <p style="color: var(--accent-red);">Error loading table data: ${result?.error || 'Unknown error'}</p>
                    </div>
                `;
                if (queryInfo) {
                    queryInfo.className = 'query-info error';
                    queryInfo.textContent = `Failed to load ${table.name}`;
                }
            }
        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="results-placeholder">
                    <p style="color: var(--accent-red);">Error: ${error.message}</p>
                </div>
            `;
            if (queryInfo) {
                queryInfo.className = 'query-info error';
                queryInfo.textContent = `Error loading ${table.name}`;
            }
        }
    } else {
        // Fallback: show table structure
        resultsContainer.innerHTML = `
            <div class="results-placeholder">
                <h4 class="pixel-text-small">TABLE: ${table.name.toUpperCase()}</h4>
                <p class="pixel-text-tiny">${table.description}</p>
                <p class="pixel-text-tiny">Columns: ${table.columns.join(', ')}</p>
                <p class="pixel-text-tiny">Execute a query to view data</p>
            </div>
        `;
        if (queryInfo) {
            queryInfo.textContent = `Table structure: ${table.name}`;
        }
    }
}

// Display results in query builder results pane (now redirects to main evidence board)
function displayResultsInQueryBuilder(result, sourceTable = null) {
    // Results now show in main evidence board
    const container = safeGetElement('results-container');
    const info = safeGetElement('query-info');
    
    if (!container) return;
    
    // Store result for view switching
    window.lastQueryResult = result;
    
    if (!result.success) {
        container.innerHTML = `
            <div class="results-placeholder">
                <p style="color: var(--accent-red);">Error: ${result.error}</p>
            </div>
        `;
        if (info) {
            info.className = 'query-info error';
            info.textContent = `Query failed: ${result.error}`;
        }
        return;
    }
    
    if (!result.result || result.result.length === 0) {
        container.innerHTML = `
            <div class="results-placeholder">
                <p>Query executed successfully but returned no results.</p>
            </div>
        `;
        if (info) {
            info.className = 'query-info success';
            info.textContent = 'Query executed successfully. No rows returned.';
        }
        return;
    }
    
    // Get first result set
    const resultSet = result.result[0];
    const columns = resultSet.columns;
    const values = resultSet.values;
    
    // Get current view mode from main evidence board
    const viewToggleParent = container.closest('.board-content') || container.closest('.evidence-board-frame');
    const activeViewBtn = viewToggleParent?.querySelector('.view-toggle .view-btn-pixel.active');
    const currentView = activeViewBtn ? activeViewBtn.dataset.view : 'table';
    
    // Render based on current view
    if (currentView === 'chart' && window.renderView) {
        window.renderView('chart', result);
    } else if (currentView === 'evidence' && window.renderView) {
        window.renderView('evidence', result);
    } else {
        // Default to table view
        displayTableView(columns, values, container);
    }
    
    if (info) {
        info.className = 'query-info success';
        const rowCount = values.length;
        info.textContent = sourceTable 
            ? `Showing data from ${sourceTable} (${rowCount} rows)`
            : `Query executed successfully. ${rowCount} row(s) returned.`;
    }
}

// Setup view toggle in query builder (now uses main evidence board)
function setupQueryBuilderViewToggle(container) {
    // View toggle is in main evidence board, not query builder
    const viewToggle = container.closest('.board-content')?.querySelector('.view-toggle') || 
                       container.closest('.evidence-board-frame')?.querySelector('.view-toggle');
    if (!viewToggle) return;
    
    viewToggle.querySelectorAll('.view-btn-pixel').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        if (btn && btn.parentNode) {
            btn.parentNode.replaceChild(newBtn, btn);
        }
        
        newBtn.addEventListener('click', function() {
            const view = this.dataset.view;
            viewToggle.querySelectorAll('.view-btn-pixel').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (window.lastQueryResult && window.renderView) {
                window.renderView(view, window.lastQueryResult);
            }
        });
    });
}

// Show table details modal with full table data
function showTableModal(table) {
    const modal = safeGetElement('table-modal');
    const title = safeGetElement('table-modal-title');
    const content = safeGetElement('table-modal-content');
    
    if (!modal || !title || !content) return;
    
    title.textContent = `TABLE: ${table.name.toUpperCase()}`;
    
    // Show loading state
    content.innerHTML = `
        <div class="table-modal-loading">
            <p class="pixel-text-normal">Loading table data...</p>
        </div>
    `;
    
    // Execute query to get table data
    if (window.executeQuery) {
        const query = `SELECT * FROM ${table.name};`;
        try {
            const result = window.executeQuery(query);
            
            if (result && result.success && result.result && result.result.length > 0) {
                const resultSet = result.result[0];
                const columns = resultSet.columns;
                const values = resultSet.values;
                
                // Display full table data
                let html = `
                    <div class="table-modal-description">
                        <p class="pixel-text-tiny">${table.description}</p>
                    </div>
                    <div class="table-modal-data">
                        <div class="table-modal-info pixel-text-tiny">
                            Showing ${values.length} row(s)
                        </div>
                        <div class="table-modal-table-container">
                            <table class="results-table full-width-table">
                                <thead>
                                    <tr>
                `;
                
                columns.forEach(col => {
                    html += `<th>${escapeHtml(col)}</th>`;
                });
                
                html += `
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                values.forEach(row => {
                    html += '<tr>';
                    row.forEach(cell => {
                        const cellValue = cell === null ? '<em>NULL</em>' : escapeHtml(String(cell));
                        html += `<td>${cellValue}</td>`;
                    });
                    html += '</tr>';
                });
                
                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                
                content.innerHTML = html;
            } else {
                // No data or error
                content.innerHTML = `
                    <div class="table-modal-info">
                        <h3 class="pixel-text-medium">DESCRIPTION</h3>
                        <p class="pixel-text-normal">${table.description}</p>
                    </div>
                    <div class="table-modal-columns">
                        <h3 class="pixel-text-medium">COLUMNS</h3>
                        <div class="columns-grid">
                `;
                
                table.columns.forEach(column => {
                    content.innerHTML += `
                        <div class="column-card">
                            <div class="column-name pixel-text-normal">${column}</div>
                        </div>
                    `;
                });
                
                content.innerHTML += `
                        </div>
                    </div>
                    <div class="table-modal-message pixel-text-tiny">
                        Table is empty or could not be loaded.
                    </div>
                `;
            }
        } catch (error) {
            content.innerHTML = `
                <div class="table-modal-error">
                    <p class="pixel-text-normal" style="color: var(--accent-red);">Error loading table: ${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    } else {
        // Fallback to structure view
        let html = `
            <div class="table-modal-info">
                <h3 class="pixel-text-medium">DESCRIPTION</h3>
                <p class="pixel-text-normal">${table.description}</p>
            </div>
            <div class="table-modal-columns">
                <h3 class="pixel-text-medium">COLUMNS</h3>
                <div class="columns-grid">
        `;
        
        table.columns.forEach(column => {
            html += `
                <div class="column-card">
                    <div class="column-name pixel-text-normal">${column}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        content.innerHTML = html;
    }
    
    // Remove half-screen class to make it fullscreen
    modal.classList.remove('half-screen');
    openModal('table-modal');
}

function insertTableQuery(tableName) {
    const editorTab = document.querySelector('[data-tab="editor"]');
    if (editorTab) {
        editorTab.click();
    }
    const textarea = document.getElementById('sql-input');
    if (textarea) {
        textarea.value = `SELECT * FROM ${tableName};`;
        textarea.focus();
    }
    closeModal('table-modal');
}

// closeModal is now defined above in modal management system

// Setup modal close buttons
function setupModals() {
    // Close buttons
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                const modalId = modal.id;
                if (modalId) {
                    closeModal(modalId);
                } else {
                    // Fallback for modals without ID
                    modal.style.display = 'none';
                    modal.classList.remove('half-screen');
                }
            }
        });
    });
    
    // Close on background click (only for reference modals, not workspace)
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                const modalId = this.id;
                const modalInfo = modalRegistry[modalId];
                
                // Only close on background click for reference modals
                // Workspace modals should only close via close button
                if (modalInfo && modalInfo.type === MODAL_TYPES.REFERENCE) {
                    closeModal(modalId);
                }
            }
        });
    });
    
    // Query Builder Button - Show inline instead of modal
    const openQueryBuilderBtn = document.getElementById('open-query-builder-btn');
    if (openQueryBuilderBtn) {
        openQueryBuilderBtn.addEventListener('click', () => {
            showQueryBuilderInline();
        });
    }
    
    // Close Query Builder Button
    const closeQueryBuilderBtn = document.getElementById('close-query-builder-btn');
    if (closeQueryBuilderBtn) {
        closeQueryBuilderBtn.addEventListener('click', () => {
            hideQueryBuilderInline();
        });
    }
    
    // Clickable items
    document.querySelectorAll('.clickable-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('zoom-hint') || e.target.classList.contains('column-item')) {
                return;
            }
            const modalId = this.dataset.modal;
            // Removed case-modal click handler - case files are no longer clickable
            if (modalId === 'evidence-modal') {
                showEvidenceModal();
            }
        });
    });
    
    // Results container is now inline-only, no modal needed
    // Results will always display in the query builder results pane
}

// Update evidence board with query history
function updateEvidenceBoard() {
    // Update both inline and modal pinboards
    const pinboard = document.getElementById('evidence-pinboard');
    const modalPinboard = document.getElementById('evidence-pinboard-modal');
    const targetPinboard = pinboard || modalPinboard;
    
    if (!targetPinboard) {
        console.warn('Evidence pinboard not found');
        return;
    }
    
    // Helper function to create card HTML
    const createCardHTML = (queryEntry, rotation, isModal) => {
        const fontSize = isModal ? '11px' : '16px';
        const queryFontSize = isModal ? '10px' : '14px';
        const rowFontSize = isModal ? '10px' : '14px';
        const btnFontSize = isModal ? '10px' : '14px';
        const btnPadding = isModal ? '6px 8px' : '10px';
        
        const taskTitle = queryEntry.taskTitle || 'Query';
        const queryText = queryEntry.query.length > 100 ? queryEntry.query.substring(0, 100) + '...' : queryEntry.query;
        
        return `
            <div class="pinboard-card" style="--rotation: ${rotation}deg; transform: rotate(${rotation}deg);">
                <div class="pin"></div>
                <div class="pinboard-card-content" style="margin-top: 25px;">
                    <h4 class="pinboard-card-title" style="font-size: ${fontSize} !important; margin-bottom: 12px; font-weight: 700; color: var(--manga-blue); text-transform: uppercase;">${taskTitle}</h4>
                    <p class="pinboard-card-query" style="font-size: ${queryFontSize} !important; margin-bottom: 12px; opacity: 0.85; word-break: break-word; line-height: 1.5; font-family: 'Courier New', monospace;">${queryText}</p>
                    <p class="pinboard-card-rows" style="font-size: ${rowFontSize} !important; margin-bottom: 12px; font-weight: 600;">${queryEntry.rowCount} row(s)</p>
                    <button class="pinboard-card-button btn-pixel btn-secondary" style="font-size: ${btnFontSize} !important; padding: ${btnPadding} !important; width: 100%; font-weight: 700;" data-query-id="${queryEntry.id || index}">VIEW FULL SCREEN</button>
                </div>
            </div>
        `;
    };
    
    // Get query history
    const queries = window.queryHistory && window.queryHistory.getAll ? window.queryHistory.getAll() : [];
    
    if (queries.length === 0) {
        const placeholder = '<div class="pinboard-placeholder pixel-text-tiny">Run successful queries to see them pinned here</div>';
        if (pinboard) pinboard.innerHTML = placeholder;
        if (modalPinboard) modalPinboard.innerHTML = placeholder;
        return;
    }
    
    // Generate random rotations
    const rotations = queries.map(() => (Math.random() - 0.5) * 8);
    
    // Update inline pinboard
    if (pinboard) {
        pinboard.innerHTML = '';
        queries.forEach((queryEntry, index) => {
            const card = document.createElement('div');
            card.className = 'pinboard-card';
            card.style.setProperty('--rotation', rotations[index]);
            card.style.position = 'relative';
            card.style.width = '280px';
            card.style.minHeight = '150px';
            card.style.background = 'var(--paper)';
            card.style.border = 'var(--border-medium)';
            card.style.padding = '15px';
            card.style.boxShadow = '5px 5px 0 rgba(0, 0, 0, 0.2)';
            card.style.cursor = 'pointer';
            card.style.transform = `rotate(${rotations[index]}deg)`;
            card.style.transition = 'transform 0.1s ease-out';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'space-between';
            
            const pin = document.createElement('div');
            pin.className = 'pin';
            pin.style.position = 'absolute';
            pin.style.top = '10px';
            pin.style.left = '50%';
            pin.style.transform = 'translateX(-50%)';
            pin.style.width = '20px';
            pin.style.height = '20px';
            pin.style.background = 'var(--manga-red)';
            pin.style.borderRadius = '50%';
            pin.style.border = '2px solid var(--border-comic)';
            pin.style.boxShadow = 'inset 0 0 5px rgba(0, 0, 0, 0.5)';
            pin.style.zIndex = '10';
            card.appendChild(pin);
            
            const content = document.createElement('div');
            content.className = 'pinboard-card-content';
            content.style.marginTop = '25px';
            
            const taskTitle = document.createElement('h4');
            taskTitle.className = 'pixel-text-tiny';
            taskTitle.textContent = queryEntry.taskTitle || 'Query';
            taskTitle.style.marginBottom = '12px';
            taskTitle.style.fontWeight = '700';
            taskTitle.style.fontSize = '16px';
            taskTitle.style.color = 'var(--manga-blue)';
            taskTitle.style.textTransform = 'uppercase';
            content.appendChild(taskTitle);
            
            const queryPreview = document.createElement('p');
            queryPreview.className = 'pixel-text-tiny';
            const queryText = queryEntry.query.length > 100 ? queryEntry.query.substring(0, 100) + '...' : queryEntry.query;
            queryPreview.textContent = queryText;
            queryPreview.style.marginBottom = '12px';
            queryPreview.style.opacity = '0.85';
            queryPreview.style.fontSize = '14px';
            queryPreview.style.wordBreak = 'break-word';
            queryPreview.style.lineHeight = '1.5';
            queryPreview.style.fontFamily = "'Courier New', monospace";
            content.appendChild(queryPreview);
            
            const rowCount = document.createElement('p');
            rowCount.className = 'pixel-text-tiny';
            rowCount.textContent = `${queryEntry.rowCount} row(s)`;
            rowCount.style.marginBottom = '12px';
            rowCount.style.fontSize = '14px';
            rowCount.style.fontWeight = '600';
            content.appendChild(rowCount);
            
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn-pixel btn-secondary pixel-text-tiny';
            viewBtn.textContent = 'VIEW FULL SCREEN';
            viewBtn.style.width = '100%';
            viewBtn.style.fontSize = '14px';
            viewBtn.style.padding = '10px';
            viewBtn.style.fontWeight = '700';
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showQueryDetail(queryEntry);
            });
            content.appendChild(viewBtn);
            
            card.appendChild(content);
            pinboard.appendChild(card);
        });
    }
    
    // Update modal pinboard with smaller text
    if (modalPinboard) {
        modalPinboard.innerHTML = '';
        queries.forEach((queryEntry, index) => {
            const card = document.createElement('div');
            card.className = 'pinboard-card';
            card.style.setProperty('--rotation', rotations[index]);
            card.style.position = 'relative';
            card.style.width = '280px';
            card.style.minHeight = '150px';
            card.style.background = 'var(--paper)';
            card.style.border = 'var(--border-medium)';
            card.style.padding = '15px';
            card.style.boxShadow = '5px 5px 0 rgba(0, 0, 0, 0.2)';
            card.style.cursor = 'pointer';
            card.style.transform = `rotate(${rotations[index]}deg)`;
            card.style.transition = 'transform 0.1s ease-out';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'space-between';
            
            const pin = document.createElement('div');
            pin.className = 'pin';
            pin.style.position = 'absolute';
            pin.style.top = '10px';
            pin.style.left = '50%';
            pin.style.transform = 'translateX(-50%)';
            pin.style.width = '20px';
            pin.style.height = '20px';
            pin.style.background = 'var(--manga-red)';
            pin.style.borderRadius = '50%';
            pin.style.border = '2px solid var(--border-comic)';
            pin.style.boxShadow = 'inset 0 0 5px rgba(0, 0, 0, 0.5)';
            pin.style.zIndex = '10';
            card.appendChild(pin);
            
            const content = document.createElement('div');
            content.className = 'pinboard-card-content';
            content.style.marginTop = '25px';
            
            // Smaller text for modal
            const taskTitle = document.createElement('h4');
            taskTitle.className = 'pixel-text-tiny';
            taskTitle.textContent = queryEntry.taskTitle || 'Query';
            taskTitle.style.marginBottom = '12px';
            taskTitle.style.fontWeight = '700';
            taskTitle.style.fontSize = '12px'; // Smaller for modal
            taskTitle.style.color = 'var(--manga-blue)';
            taskTitle.style.textTransform = 'uppercase';
            content.appendChild(taskTitle);
            
            const queryPreview = document.createElement('p');
            queryPreview.className = 'pixel-text-tiny';
            const queryText = queryEntry.query.length > 100 ? queryEntry.query.substring(0, 100) + '...' : queryEntry.query;
            queryPreview.textContent = queryText;
            queryPreview.style.marginBottom = '12px';
            queryPreview.style.opacity = '0.85';
            queryPreview.style.fontSize = '10px'; // Smaller for modal
            queryPreview.style.wordBreak = 'break-word';
            queryPreview.style.lineHeight = '1.4';
            queryPreview.style.fontFamily = "'Courier New', monospace";
            queryPreview.style.maxHeight = '80px';
            queryPreview.style.overflow = 'hidden';
            content.appendChild(queryPreview);
            
            const rowCount = document.createElement('p');
            rowCount.className = 'pixel-text-tiny';
            rowCount.textContent = `${queryEntry.rowCount} row(s)`;
            rowCount.style.marginBottom = '12px';
            rowCount.style.fontSize = '10px'; // Smaller for modal
            rowCount.style.fontWeight = '600';
            content.appendChild(rowCount);
            
            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn-pixel btn-secondary pixel-text-tiny';
            viewBtn.textContent = 'VIEW FULL SCREEN';
            viewBtn.style.width = '100%';
            viewBtn.style.fontSize = '10px'; // Smaller for modal
            viewBtn.style.padding = '6px 8px'; // Smaller padding for modal
            viewBtn.style.fontWeight = '700';
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showQueryDetail(queryEntry);
            });
            content.appendChild(viewBtn);
            
            card.appendChild(content);
            modalPinboard.appendChild(card);
        });
    }
}

// Show query detail in fullscreen modal
function showQueryDetail(queryEntry) {
    const modal = safeGetElement('query-detail-modal');
    if (!modal) {
        console.warn('Query detail modal not found');
        return;
    }
    
    // Populate modal with query details
    const modalTitle = modal.querySelector('#query-detail-title');
    const modalQueryEl = modal.querySelector('#query-detail-sql');
    const modalResults = modal.querySelector('#query-detail-results');
    
    if (modalTitle) {
        modalTitle.textContent = queryEntry.taskTitle || 'Query Results';
    }
    
    if (modalQueryEl) {
        const pre = document.createElement('pre');
        pre.className = 'pixel-text-tiny';
        pre.textContent = queryEntry.query;
        modalQueryEl.innerHTML = '';
        modalQueryEl.appendChild(pre);
    }
    
    if (modalResults && queryEntry.result) {
        // Display results as table
        if (queryEntry.result.success && queryEntry.result.result && queryEntry.result.result.length > 0) {
            const resultSet = queryEntry.result.result[0];
            const columns = resultSet.columns;
            const values = resultSet.values;
            
            displayTableView(columns, values, modalResults);
        } else {
            modalResults.innerHTML = '<p class="pixel-text-tiny">No results to display</p>';
        }
    }
    
    openModal('query-detail-modal');
}

// Make functions globally available
window.initUI = initUI;
window.renderTables = renderTables;
window.updateClueDisplay = updateClueDisplay;
window.updateEvidenceBoard = updateEvidenceBoard;
window.displayResults = displayResults;
window.displayTableView = displayTableView;
window.displayTimelineView = displayTimelineView;
window.showCaseModal = showCaseModal;
window.showCaseImageModal = showCaseImageModal;
window.showEvidenceModal = showEvidenceModal;
window.showTableModal = showTableModal;
window.showTableDataInline = showTableDataInline;
window.displayResultsInQueryBuilder = displayResultsInQueryBuilder;
window.setupQueryBuilderViewToggle = setupQueryBuilderViewToggle;
window.insertTableQuery = insertTableQuery;
window.closeModal = closeModal;
window.openModal = openModal;
window.closeAllWorkspaceModals = closeAllWorkspaceModals;
window.setupModals = setupModals;

// Show Query Builder Inline (replaces evidence board)
function showQueryBuilderInline() {
    const evidenceView = document.getElementById('evidence-board-view');
    const queryBuilderView = document.getElementById('query-builder-view');
    
    if (!evidenceView || !queryBuilderView) {
        console.error('Query builder views not found');
        return;
    }
    
    // Hide evidence board, show query builder
    evidenceView.classList.remove('active');
    queryBuilderView.classList.add('active');
    
    // Ensure tables are rendered first
    renderTables();
    
    // Setup inline query builder
    setupInlineQueryBuilder();
}

// Hide Query Builder Inline (show evidence board)
function hideQueryBuilderInline() {
    const evidenceView = document.getElementById('evidence-board-view');
    const queryBuilderView = document.getElementById('query-builder-view');
    
    if (evidenceView) evidenceView.classList.add('active');
    if (queryBuilderView) queryBuilderView.classList.remove('active');
}

// Setup inline query builder (similar to modal setup)
function setupInlineQueryBuilder() {
    // Copy visual builder content from modal to inline
    const modalVisualPanel = document.getElementById('visual-panel');
    const inlineVisualPanel = document.getElementById('inline-visual-panel');

    if (modalVisualPanel && inlineVisualPanel && inlineVisualPanel.innerHTML.trim() === '<!-- Content will be copied from modal -->') {
        // Copy the content from modal to inline
        inlineVisualPanel.innerHTML = modalVisualPanel.innerHTML;
    }

    // Ensure tables are rendered to inline table list
    renderTables();
    
    // Setup table interactions
    const inlineTableList = safeGetElement('inline-table-list');
    if (inlineTableList) {
        inlineTableList.querySelectorAll('.table-item').forEach(item => {
            const tableName = item.dataset.tableName;
            if (tableName && window.makeTableDraggable) {
                window.makeTableDraggable(item, tableName);
            }
            
            // Setup column dragging (including star items)
            item.querySelectorAll('.column-item').forEach(col => {
                const colTable = col.dataset.table;
                const colName = col.dataset.column;
                if (colTable && colName) {
                    // Check if it's a star item
                    if (colName === '*' && window.makeStarDraggable) {
                        window.makeStarDraggable(col, colTable);
                    } else if (window.makeColumnDraggable) {
                        window.makeColumnDraggable(col, colTable, colName);
                    }
                }
            });
        });
    }

    const modalSqlPanel = document.getElementById('sql-panel');
    const inlineSqlPanel = document.getElementById('inline-sql-panel');
    if (modalSqlPanel && inlineSqlPanel) {
        inlineSqlPanel.innerHTML = modalSqlPanel.innerHTML;
    }
    
    // Setup tabs
    const queryBuilderView = document.getElementById('query-builder-view');
    // SQL editor tab removed - tabs no longer needed
    const inlineTabs = queryBuilderView.querySelectorAll('.tab-btn-pixel');
    // Note: Only visual builder is available now
    inlineTabs.forEach(tab => {
        // Remove old listeners by cloning
        const newTab = tab.cloneNode(true);
        if (tab.parentNode) {
            tab.parentNode.replaceChild(newTab, tab);
        }
        
        newTab.addEventListener('click', () => {
            const targetTab = newTab.dataset.tab;
            inlineTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            newTab.classList.add('active');
            newTab.setAttribute('aria-selected', 'true');
            
            // Show/hide panels
            const visualPanel = safeGetElement('inline-visual-panel');
            const sqlPanel = safeGetElement('inline-sql-panel');
            
            if (visualPanel) visualPanel.hidden = targetTab !== 'visual';
            if (sqlPanel) {
                sqlPanel.hidden = targetTab !== 'sql';
                if (targetTab === 'sql' && !sqlPanel.hidden) {
                    // Initialize SQL editor if not already done
                    setTimeout(() => {
                        if (window.setupSQLEditor) {
                            window.setupSQLEditor();
                        }
                    }, 100);
                }
            }
        });
    });
    
    // Setup schema button
    const inlineSchemaBtn = safeGetElement('inline-show-schema-btn');
    if (inlineSchemaBtn) {
        const newSchemaBtn = inlineSchemaBtn.cloneNode(true);
        if (inlineSchemaBtn.parentNode) {
            inlineSchemaBtn.parentNode.replaceChild(newSchemaBtn, inlineSchemaBtn);
        }
        newSchemaBtn.addEventListener('click', () => {
            if (window.showSchemaModal) {
                window.showSchemaModal();
            }
        });
    }
    
    // Re-initialize accessible query builder for inline version
    // Wait a bit for DOM to be ready after copying content
    setTimeout(() => {
        if (window.initAccessibleQueryBuilder) {
            // Reset initialization flag to allow re-setup
            if (window.queryBuilderInitialized !== undefined) {
                window.queryBuilderInitialized = false;
            }
            window.initAccessibleQueryBuilder();
        }
        
        // Also ensure columns are draggable after initialization
        setTimeout(() => {
            const inlineTableList = safeGetElement('inline-table-list');
            if (inlineTableList) {
                inlineTableList.querySelectorAll('.column-item').forEach(col => {
                    const colTable = col.dataset.table;
                    const colName = col.dataset.column;
                    if (colTable && colName) {
                        // Check if it's a star item
                        if (colName === '*' && window.makeStarDraggable) {
                            window.makeStarDraggable(col, colTable);
                        } else if (window.makeColumnDraggable) {
                            window.makeColumnDraggable(col, colTable, colName);
                        }
                    }
                });
            }
        }, 100);
    }, 300);
}

// Show Query Builder Modal (kept for backward compatibility, but redirects to inline)
function showQueryBuilderModal() {
    showQueryBuilderInline();
}

// Legacy function - redirects to inline
function showQueryBuilderModalOld() {
    showQueryBuilderInline();
    return;
    const modal = safeGetElement('query-builder-modal');
    if (!modal) {
        console.error('Query builder modal not found');
        return;
    }
    
    // Ensure tables are rendered first
    renderTables();
    
    // Setup table interactions in modal
    const modalTableList = safeGetElement('modal-table-list');
    if (modalTableList) {
        modalTableList.querySelectorAll('.table-item').forEach(item => {
            const tableName = item.dataset.tableName;
            if (tableName && window.makeTableDraggable) {
                window.makeTableDraggable(item, tableName);
            }
            
            // Setup column dragging (including star items)
            item.querySelectorAll('.column-item').forEach(col => {
                const colTable = col.dataset.table;
                const colName = col.dataset.column;
                if (colTable && colName) {
                    // Check if it's a star item
                    if (colName === '*' && window.makeStarDraggable) {
                        window.makeStarDraggable(col, colTable);
                    } else if (window.makeColumnDraggable) {
                        window.makeColumnDraggable(col, colTable, colName);
                    }
                }
            });
        });
    }
    
    // Setup modal schema button
    const modalSchemaBtn = safeGetElement('modal-show-schema-btn');
    if (modalSchemaBtn) {
        const newBtn = modalSchemaBtn.cloneNode(true);
        if (modalSchemaBtn && modalSchemaBtn.parentNode) {
            modalSchemaBtn.parentNode.replaceChild(newBtn, modalSchemaBtn);
        }
        newBtn.addEventListener('click', () => {
            showSchemaModal();
        });
    }
    
    // Setup modal tabs
    // SQL editor tab removed - tabs no longer needed
    const modalTabs = modal.querySelectorAll('.tab-btn-pixel');
    // Note: Only visual builder is available now
    modalTabs.forEach(tab => {
        const newTab = tab.cloneNode(true);
        if (tab && tab.parentNode) {
            tab.parentNode.replaceChild(newTab, tab);
        }
        newTab.addEventListener('click', () => {
            const targetTab = newTab.dataset.tab;
            modalTabs.forEach(t => t.classList.remove('active'));
            newTab.classList.add('active');
            
            // Use new panel IDs
            const visualPanel = safeGetElement('visual-panel');
            const sqlPanel = safeGetElement('sql-panel');
            
            // Hide all panels
            if (visualPanel) visualPanel.hidden = true;
            if (sqlPanel) sqlPanel.hidden = true;
            
            // Show selected panel
            if (targetTab === 'visual' && visualPanel) {
                visualPanel.hidden = false;
            } else if (targetTab === 'sql' && sqlPanel) {
                sqlPanel.hidden = false;
                // Initialize SQL editor if not already done
                if (window.setupSQLEditor) {
                    window.setupSQLEditor();
                }
            }
        });
    });
    
    // Initialize accessible query builder when modal opens
    if (window.initAccessibleQueryBuilder) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            window.initAccessibleQueryBuilder();
        }, 200);
    } else if (window.setupVisualBuilder) {
        // Fallback to old builder
        window.setupVisualBuilder();
    }
    
    // Setup execute SQL button in modal
    const executeSqlBtn = safeGetElement('execute-sql-btn');
    if (executeSqlBtn) {
        const newExecuteBtn = executeSqlBtn.cloneNode(true);
        if (executeSqlBtn && executeSqlBtn.parentNode) {
            executeSqlBtn.parentNode.replaceChild(newExecuteBtn, executeSqlBtn);
        }
        newExecuteBtn.addEventListener('click', () => {
            // Get query from textarea
            let query = '';
            const textarea = safeGetElement('sql-input');
            if (textarea) {
                query = textarea.value.trim();
            }
            
            if (query && window.runQuery) {
                // Execute query
                window.runQuery(query);
                // Close the modal
                closeModal('query-builder-modal');
            } else if (!query) {
                if (window.toast) {
                    window.toast.warning('Please enter a SQL query.', 3000);
                } else {
                    alert('Please enter a SQL query.');
                }
            }
        });
    }
    
    // Setup clear SQL button
    const clearSqlBtn = safeGetElement('clear-sql-btn');
    if (clearSqlBtn) {
        const newClearBtn = clearSqlBtn.cloneNode(true);
        if (clearSqlBtn && clearSqlBtn.parentNode) {
            clearSqlBtn.parentNode.replaceChild(newClearBtn, clearSqlBtn);
        }
        newClearBtn.addEventListener('click', () => {
            const textarea = safeGetElement('sql-input');
            if (textarea) {
                textarea.value = '';
                textarea.focus();
            }
        });
    }
    
    // Setup format SQL button
    const formatSqlBtn = safeGetElement('format-sql-btn');
    if (formatSqlBtn) {
        const newFormatBtn = formatSqlBtn.cloneNode(true);
        if (formatSqlBtn && formatSqlBtn.parentNode) {
            formatSqlBtn.parentNode.replaceChild(newFormatBtn, formatSqlBtn);
        }
        newFormatBtn.addEventListener('click', () => {
            const textarea = safeGetElement('sql-input');
            if (textarea) {
                // Simple formatting - capitalize keywords
                const value = textarea.value;
                const formatted = value.replace(/\b(select|from|where|join|inner|left|right|outer|on|group|by|order|asc|desc|limit|as|and|or|not|count|sum|avg|max|min|having|distinct)\b/gi, (match) => match.toUpperCase());
                textarea.value = formatted;
            }
        });
    }
    
    // Setup generate SQL button
    const generateBtn = safeGetElement('generate-sql-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (window.generateSQLFromBuilder) {
                window.generateSQLFromBuilder();
            }
        });
    }
    
    openModal('query-builder-modal');
}

window.showQueryBuilderModal = showQueryBuilderModal;
