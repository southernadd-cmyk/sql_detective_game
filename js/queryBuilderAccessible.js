// Accessible Query Builder - Step-by-step and Guided Methods
// WCAG 2.1 AA Compliant

let accessibleQueryBuilder = {
    currentStep: 1, // Step 1 is now columns (table selection removed)
    selectedColumns: [],
    selectedTables: [], // Auto-selected when columns are dragged
    conditions: [],
    queryState: {
        select: [],
        from: null,
        where: [],
        orderBy: null
    }
};

// Initialize accessible query builder
let queryBuilderInitialized = false;
function initAccessibleQueryBuilder() {
    // Reset query builder state when opening
    accessibleQueryBuilder.currentStep = 1;
    accessibleQueryBuilder.selectedColumns = [];
    accessibleQueryBuilder.selectedTables = [];
    accessibleQueryBuilder.conditions = [];
    
    // Check if we're in inline or modal version
    const inlineVisualPanel = document.getElementById('inline-visual-panel');
    const modalVisualPanel = document.getElementById('visual-panel');
    const isInline = inlineVisualPanel && inlineVisualPanel.offsetParent !== null; // Check if visible
    
    // Always re-initialize if switching between inline and modal, or if not initialized
    if (!queryBuilderInitialized) {
        setupTabNavigation();
        setupVisualBuilderSteps();
        setupGuidedBuilder();
        setupKeyboardNavigation();
        setupFocusManagement();
        
        queryBuilderInitialized = true;
    }
    
    // Always re-setup step navigation and reset UI state
    setTimeout(() => {
        setupStepNavigation();
        // Reset to step 1
        goToStep(1);
        // Clear selected columns display
        updateSelectedColumns();
        // Clear conditions
        const conditionsList = document.getElementById('conditions-list');
        if (conditionsList) {
            conditionsList.innerHTML = '';
        }
        accessibleQueryBuilder.conditions = [];
    }, 200);
}

// Tab Navigation with ARIA
function setupTabNavigation() {
    const tabs = document.querySelectorAll('[role="tab"]');
    const panels = document.querySelectorAll('[role="tabpanel"]');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Update ARIA states
            tabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('active');
            });
            tab.setAttribute('aria-selected', 'true');
            tab.classList.add('active');
            
            // Show/hide panels
            panels.forEach(p => {
                p.hidden = true;
            });
            const targetPanel = document.getElementById(tab.getAttribute('aria-controls'));
            if (targetPanel) {
                targetPanel.hidden = false;
            }
            
            // Focus first element in panel
            setTimeout(() => {
                const firstFocusable = targetPanel.querySelector('button, input, select, textarea, [tabindex="0"]');
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 100);
        });
        
        // Keyboard navigation
        tab.addEventListener('keydown', (e) => {
            let targetTab = null;
            
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const currentIndex = Array.from(tabs).indexOf(tab);
                if (e.key === 'ArrowLeft') {
                    targetTab = tabs[currentIndex - 1] || tabs[tabs.length - 1];
                } else {
                    targetTab = tabs[currentIndex + 1] || tabs[0];
                }
                targetTab.click();
                targetTab.focus();
            } else if (e.key === 'Home') {
                e.preventDefault();
                tabs[0].click();
                tabs[0].focus();
            } else if (e.key === 'End') {
                e.preventDefault();
                tabs[tabs.length - 1].click();
                tabs[tabs.length - 1].focus();
            }
        });
    });
}

// Visual Builder - Step-by-step
function setupVisualBuilderSteps() {
    // Initialize available columns (empty initially, populated when table is selected)
    populateAvailableColumns();
    
    // Setup step navigation buttons
    setupStepNavigation();
    
    // Table selection removed - tables are auto-selected when columns are dragged
    
    // Setup drag and drop zones for columns
    setupColumnDropZones();
    
    // Setup conditions builder
    setupConditionsBuilder();
    
    // Setup review and execute
    setupReviewAndExecute();
}

// Populate available columns from schema (no longer needed - removed from UI)
function populateAvailableColumns() {
    // Available columns section has been removed - columns are only selected via drag and drop
}

// Update available columns based on selected tables
function updateAvailableColumnsForSelectedTables() {
    // Available columns section has been removed - columns are only selected via drag and drop from Database Files
    // This function is kept for compatibility but does nothing
}

// Update selected columns display (only called to sync display, not from checkboxes)
function updateSelectedColumns() {
    const selectedContainer = document.getElementById('selected-columns-list');
    if (!selectedContainer) return;
    
    // Update display based on accessibleQueryBuilder.selectedColumns
    if (accessibleQueryBuilder.selectedColumns.length === 0) {
        selectedContainer.innerHTML = '<p class="pixel-text-tiny placeholder">No columns selected. Drag columns from Database Files to add them.</p>';
    } else {
        selectedContainer.innerHTML = '';
        accessibleQueryBuilder.selectedColumns.forEach(col => {
            const item = document.createElement('div');
            item.className = 'selected-column-item';
            
            const span = document.createElement('span');
            span.textContent = col.fullName;
            span.className = 'pixel-text-tiny';
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.setAttribute('aria-label', `Remove column ${col.fullName}`);
            removeBtn.addEventListener('click', () => {
                // Remove from selected columns
                accessibleQueryBuilder.selectedColumns = accessibleQueryBuilder.selectedColumns.filter(
                    c => !(c.table === col.table && c.column === col.column)
                );
                    updateSelectedColumns();
            });
            
            item.appendChild(span);
            item.appendChild(removeBtn);
            selectedContainer.appendChild(item);
        });
    }
    
    // Announce to screen readers
    const liveRegion = selectedContainer;
    if (liveRegion.getAttribute('aria-live')) {
        // Already has aria-live
    } else {
        liveRegion.setAttribute('aria-live', 'polite');
    }
}

// Setup step navigation
function setupStepNavigation() {
    // Remove existing listeners by cloning buttons (prevents duplicates)
    const buttonIds = [
        'next-to-conditions-btn',
        'next-to-review-btn',
        'back-to-columns-btn',
        'back-to-conditions-btn'
    ];
    
    buttonIds.forEach(btnId => {
        // Check both inline and modal
        let btn = document.getElementById(btnId);
        if (!btn) {
            const inlinePanel = document.getElementById('inline-visual-panel');
            if (inlinePanel) {
                btn = inlinePanel.querySelector(`#${btnId}`);
            }
        }
        if (btn) {
            const newBtn = btn.cloneNode(true);
            if (btn.parentNode) {
                btn.parentNode.replaceChild(newBtn, btn);
            }
        }
    });
    
    // Step 1: Columns -> Step 2: Conditions
    let nextToConditionsBtn = document.getElementById('next-to-conditions-btn');
    if (!nextToConditionsBtn) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            nextToConditionsBtn = inlinePanel.querySelector('#next-to-conditions-btn');
        }
    }
    if (nextToConditionsBtn) {
        nextToConditionsBtn.addEventListener('click', () => {
            if (accessibleQueryBuilder.selectedColumns.length === 0) {
                alert('Please drag at least one column from Database Files to Selected Columns');
                return;
            }
            goToStep(2);
        });
    }
    
    // Step 2: Conditions -> Step 3: Review
    let nextToReviewBtn = document.getElementById('next-to-review-btn');
    if (!nextToReviewBtn) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            nextToReviewBtn = inlinePanel.querySelector('#next-to-review-btn');
        }
    }
    if (nextToReviewBtn) {
        nextToReviewBtn.addEventListener('click', () => {
            goToStep(3);
            generateSQL();
        });
    }
    
    // Back buttons
    let backToColumnsBtn = document.getElementById('back-to-columns-btn');
    if (!backToColumnsBtn) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            backToColumnsBtn = inlinePanel.querySelector('#back-to-columns-btn');
        }
    }
    if (backToColumnsBtn) {
        backToColumnsBtn.addEventListener('click', () => goToStep(1));
    }
    
    let backToConditionsBtn = document.getElementById('back-to-conditions-btn');
    if (!backToConditionsBtn) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            backToConditionsBtn = inlinePanel.querySelector('#back-to-conditions-btn');
        }
    }
    if (backToConditionsBtn) {
        backToConditionsBtn.addEventListener('click', () => goToStep(2));
    }
    
    // Skip buttons removed - no longer needed
    
    // Clear selection button (removed select all since we only use drag and drop)
    document.getElementById('clear-selection-btn')?.addEventListener('click', () => {
        accessibleQueryBuilder.selectedColumns = [];
        updateSelectedColumns();
    });
}

// Navigate to step
function goToStep(step) {
    // Check both inline and modal versions
    let currentStepEl = document.querySelector(`.builder-step[data-step="${accessibleQueryBuilder.currentStep}"]`);
    let nextStepEl = document.querySelector(`.builder-step[data-step="${step}"]`);
    
    // If not found, try inline panel
    if (!currentStepEl || !nextStepEl) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            if (!currentStepEl) {
                currentStepEl = inlinePanel.querySelector(`.builder-step[data-step="${accessibleQueryBuilder.currentStep}"]`);
            }
            if (!nextStepEl) {
                nextStepEl = inlinePanel.querySelector(`.builder-step[data-step="${step}"]`);
            }
        }
    }
    
    if (currentStepEl) {
        currentStepEl.classList.remove('active');
        currentStepEl.hidden = true;
    }
    
    if (nextStepEl) {
        nextStepEl.classList.add('active');
        nextStepEl.hidden = false;
        accessibleQueryBuilder.currentStep = step;
        
        // Clear conditions list when entering step 2 (don't auto-add conditions)
        if (step === 2) {
            // Check both inline and modal versions
            let conditionsList = document.getElementById('conditions-list');
            if (!conditionsList) {
                const inlinePanel = document.getElementById('inline-visual-panel');
                if (inlinePanel) {
                    conditionsList = inlinePanel.querySelector('#conditions-list');
                }
            }
            if (conditionsList) {
                conditionsList.innerHTML = '';
            }
            // Reset conditions array
            accessibleQueryBuilder.conditions = [];
            
            // Re-setup conditions builder when entering step 2
            setTimeout(() => {
                setupConditionsBuilder();
            }, 100);
        }
        
        // Setup execute button when entering step 3
        if (step === 3) {
            // Ensure SQL is generated
            generateSQL();
            
            // Re-setup execute button when entering step 3
            setTimeout(() => {
                setupReviewAndExecute();
            }, 100);
        }
        
        // Focus first element
        setTimeout(() => {
            const firstFocusable = nextStepEl.querySelector('button, input, select, [tabindex="0"]');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);
    }
}

// Setup table selection (multiple tables allowed)
function setupTableSelection() {
    const tables = [
        { name: 'case_files', description: 'Case file records' },
        { name: 'evidence', description: 'Physical evidence' },
        { name: 'suspects', description: 'People of interest' },
        { name: 'witness_statements', description: 'Witness statements' }
    ];
    
    // Check both inline and modal versions
    let container = document.getElementById('table-selection-grid');
    if (!container) {
        // Try to find it in inline visual panel
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            container = inlinePanel.querySelector('#table-selection-grid');
        }
    }
    if (!container) return;
    
    container.innerHTML = '';
    
    tables.forEach(table => {
        const card = document.createElement('label');
        card.className = 'table-card';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = table.name;
        checkbox.id = `table-${table.name}`;
        checkbox.setAttribute('aria-label', `Select table ${table.name}`);
        checkbox.addEventListener('change', () => {
            updateSelectedTables();
            // Update available columns when tables change
            updateAvailableColumnsForSelectedTables();
        });
        
        const content = document.createElement('div');
        content.className = 'table-card-content';
        
        const h4 = document.createElement('h4');
        h4.textContent = table.name;
        h4.className = 'pixel-text-small';
        
        const p = document.createElement('p');
        p.textContent = table.description;
        p.className = 'pixel-text-tiny';
        
        content.appendChild(h4);
        content.appendChild(p);
        card.appendChild(checkbox);
        card.appendChild(content);
        container.appendChild(card);
    });
}

// Update selected tables display
function updateSelectedTables() {
    // Since we removed Step 1 (table selection), tables are now auto-selected via drag and drop
    // This function now just updates the display if there's a display element, but doesn't overwrite selectedTables
    // selectedTables is managed directly by addColumnToSelection and addAllColumnsFromTable
    
    let selectedListEl = document.getElementById('selected-tables-list');
    if (!selectedListEl) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            selectedListEl = inlinePanel.querySelector('#selected-tables-list');
        }
    }
    if (selectedListEl) {
        if (accessibleQueryBuilder.selectedTables.length === 0) {
            selectedListEl.textContent = 'None';
        } else {
            selectedListEl.textContent = accessibleQueryBuilder.selectedTables.join(', ');
        }
    }
}

// Setup drag and drop zones for columns from database files
function setupColumnDropZones() {
    // Setup for both modal and inline versions
    const panels = [
        { id: 'visual-panel', type: 'modal' },
        { id: 'inline-visual-panel', type: 'inline' }
    ];
    
    panels.forEach(({ id, type }) => {
        const visualPanel = document.getElementById(id);
        if (!visualPanel) return;
        
        // Remove old listeners by using a flag or one-time listener
        // Use capture phase to ensure we catch the event
        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        
        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const dataStr = e.dataTransfer.getData('application/json');
                if (!dataStr) return;
                
                const data = JSON.parse(dataStr);
                console.log('Drop event received:', data); // Debug
                
                if (data.table && data.column) {
                    // Handle star (*) - select all columns from table
                    if (data.column === '*' || data.type === 'star') {
                        console.log('Adding all columns from table:', data.table); // Debug
                        addAllColumnsFromTable(data.table);
                    } else {
                        // Add single column to selected columns
                        console.log('Adding column:', data.table, data.column); // Debug
                        addColumnToSelection(data.table, data.column);
                    }
                }
            } catch (error) {
                console.error('Error handling column drop:', error);
            }
        };
        
        // Check if panel drop zone is already set up
        if (visualPanel.dataset.dropZoneSetup !== 'true') {
            visualPanel.dataset.dropZoneSetup = 'true';
            
            // Add new listeners for the panel
            visualPanel.addEventListener('dragover', handleDragOver, false);
            visualPanel.addEventListener('drop', handleDrop, false);
        }
        
        // Also setup selected columns list drop zone (always check this)
        const selectedColumnsList = visualPanel.querySelector('#selected-columns-list');
        if (selectedColumnsList) {
            const handleSelectedDragOver = (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectedColumnsList.classList.add('drag-over');
            };
            
            const handleSelectedDragLeave = (e) => {
                e.preventDefault();
                if (!selectedColumnsList.contains(e.relatedTarget)) {
                    selectedColumnsList.classList.remove('drag-over');
                }
            };
            
            const handleSelectedDrop = (e) => {
                e.preventDefault();
                e.stopPropagation();
                selectedColumnsList.classList.remove('drag-over');
                
                try {
                    const dataStr = e.dataTransfer.getData('application/json');
                    if (!dataStr) return;
                    
                    const data = JSON.parse(dataStr);
                    console.log('Drop on selected columns list:', data); // Debug
                    
                    if (data.table && data.column) {
                        // Handle star (*) - select all columns from table
                        if (data.column === '*' || data.type === 'star') {
                            console.log('Adding all columns from table:', data.table); // Debug
                            addAllColumnsFromTable(data.table);
                        } else {
                            // Add single column to selected columns
                            console.log('Adding column:', data.table, data.column); // Debug
                            addColumnToSelection(data.table, data.column);
                        }
                    }
                } catch (error) {
                    console.error('Error handling column drop:', error);
                }
            };
            
            // Check if selected columns list is already set up
            if (selectedColumnsList.dataset.dropZoneSetup !== 'true') {
                selectedColumnsList.dataset.dropZoneSetup = 'true';
                
                // Add new listeners
                selectedColumnsList.addEventListener('dragover', handleSelectedDragOver, false);
                selectedColumnsList.addEventListener('dragleave', handleSelectedDragLeave, false);
                selectedColumnsList.addEventListener('drop', handleSelectedDrop, false);
            }
        }
    });
}

// Add column to selection when dropped
function addColumnToSelection(tableName, columnName) {
    // Don't handle star here - it should be handled in the drop handler
    if (columnName === '*' || !columnName) {
        console.warn('addColumnToSelection called with star or empty column name');
        return;
    }
    console.log('Adding column:', tableName, columnName); // Debug
    
    // Auto-select the table if not already selected
    if (!accessibleQueryBuilder.selectedTables.includes(tableName)) {
        accessibleQueryBuilder.selectedTables.push(tableName);
        
        // Update table selection UI
        let tableCheckbox = document.getElementById(`table-${tableName}`);
        if (!tableCheckbox) {
            const inlinePanel = document.getElementById('inline-visual-panel');
            if (inlinePanel) {
                tableCheckbox = inlinePanel.querySelector(`#table-${tableName}`);
            }
        }
        if (tableCheckbox) {
            tableCheckbox.checked = true;
        }
        updateSelectedTables();
        
        // Update available columns - this must happen before navigating
        updateAvailableColumnsForSelectedTables();
    }
    
    // We're already on step 1 (columns), so just add the column directly
    addColumnAfterNavigation(tableName, columnName);
}

// Add all columns from a table when star is dropped
function addAllColumnsFromTable(tableName) {
    console.log('Adding all columns from table:', tableName); // Debug
    
    // Auto-select the table if not already selected
    if (!accessibleQueryBuilder.selectedTables.includes(tableName)) {
        accessibleQueryBuilder.selectedTables.push(tableName);
        
        // Update table selection UI
        let tableCheckbox = document.getElementById(`table-${tableName}`);
        if (!tableCheckbox) {
            const inlinePanel = document.getElementById('inline-visual-panel');
            if (inlinePanel) {
                tableCheckbox = inlinePanel.querySelector(`#table-${tableName}`);
            }
        }
        if (tableCheckbox) {
            tableCheckbox.checked = true;
        }
        updateSelectedTables();
        
        // Update available columns - this must happen before navigating
        updateAvailableColumnsForSelectedTables();
    }
    
    // Get all columns for this table
    const tables = {
        'case_files': ['case_id', 'case_title', 'date', 'location', 'lead_detective', 'case_type', 'severity', 'status', 'signature', 'summary'],
        'evidence': ['evidence_id', 'case_id', 'item', 'found_at', 'time_found', 'notes', 'is_key'],
        'suspects': ['suspect_id', 'case_id', 'name', 'connection', 'alibi', 'suspicion', 'motive_hint'],
        'witness_statements': ['statement_id', 'case_id', 'witness_name', 'reliability', 'statement']
    };
    
    const columns = tables[tableName] || [];
    
    // We're already on step 1 (columns), so just add all columns directly
    columns.forEach(col => {
        addColumnAfterNavigation(tableName, col);
    });
}

// Helper to add column after ensuring we're on the right step
function addColumnAfterNavigation(tableName, columnName) {
    // Check if column already exists
    const existing = accessibleQueryBuilder.selectedColumns.find(
        c => c.table === tableName && c.column === columnName
    );
    
    if (existing) {
        return; // Already selected
    }
    
    // Add to selected columns
    accessibleQueryBuilder.selectedColumns.push({
        table: tableName,
        column: columnName,
        fullName: `${tableName}.${columnName}`
    });
    
    // Update the display
    updateSelectedColumnsDisplay();
    
    // Update display after adding column
    updateSelectedColumns();
}

// Update selected columns display
function updateSelectedColumnsDisplay() {
    // Check both inline and modal versions
    let selectedContainer = document.getElementById('selected-columns-list');
    if (!selectedContainer) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            selectedContainer = inlinePanel.querySelector('#selected-columns-list');
        }
    }
    if (!selectedContainer) return;
    
    if (accessibleQueryBuilder.selectedColumns.length === 0) {
        selectedContainer.innerHTML = '<p class="pixel-text-tiny placeholder">No columns selected</p>';
    } else {
        selectedContainer.innerHTML = '';
        accessibleQueryBuilder.selectedColumns.forEach(col => {
            const item = document.createElement('div');
            item.className = 'selected-column-item';
            
            const span = document.createElement('span');
            span.textContent = col.fullName;
            span.style.fontSize = '16px';
            span.style.fontWeight = '600';
            span.style.color = 'var(--text-light)';
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '×';
            removeBtn.setAttribute('aria-label', `Remove column ${col.fullName}`);
            removeBtn.addEventListener('click', () => {
                accessibleQueryBuilder.selectedColumns = accessibleQueryBuilder.selectedColumns.filter(
                    c => !(c.table === col.table && c.column === col.column)
                );
                updateSelectedColumnsDisplay();
            });
            
            item.appendChild(span);
            item.appendChild(removeBtn);
            selectedContainer.appendChild(item);
        });
    }
}

// Setup conditions builder
function setupConditionsBuilder() {
    // Setup for both modal and inline versions
    const panels = [
        { id: 'visual-panel', type: 'modal' },
        { id: 'inline-visual-panel', type: 'inline' }
    ];
    
    panels.forEach(({ id, type }) => {
        const panel = document.getElementById(id);
        if (!panel) return;
        
        // Check if already set up for this panel
        if (panel.dataset.conditionsSetup === 'true') {
            return;
        }
        panel.dataset.conditionsSetup = 'true';
        
        let addBtn = panel.querySelector('#add-condition-btn');
        if (!addBtn) return;
        
        // Remove any existing listeners by cloning the button
        const newBtn = addBtn.cloneNode(true);
        if (addBtn.parentNode) {
            addBtn.parentNode.replaceChild(newBtn, addBtn);
        }
        
        // Add single event listener
        newBtn.addEventListener('click', () => {
            addCondition();
        });
    });
}

function addCondition() {
    // Check both inline and modal versions
    let container = document.getElementById('conditions-list');
    if (!container) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            container = inlinePanel.querySelector('#conditions-list');
        }
    }
    if (!container) return;
    
    const conditionId = `condition-${Date.now()}`;
    const condition = {
        id: conditionId,
        column: '',
        operator: '=',
        value: '',
        connector: 'AND' // Default to AND, but can be changed
    };
    
    accessibleQueryBuilder.conditions.push(condition);
    
    const conditionEl = document.createElement('div');
    conditionEl.className = 'condition-item';
    conditionEl.id = conditionId;
    
    // Connector select (AND/OR) - only show if not the first condition
    if (accessibleQueryBuilder.conditions.length > 1) {
        const connectorSelect = document.createElement('select');
        connectorSelect.className = 'condition-connector';
        connectorSelect.setAttribute('aria-label', 'Select connector (AND or OR)');
        connectorSelect.style.marginRight = '10px';
        connectorSelect.style.fontSize = '14px';
        connectorSelect.style.padding = '6px';
        connectorSelect.style.fontWeight = '700';
        
        const andOption = document.createElement('option');
        andOption.value = 'AND';
        andOption.textContent = 'AND';
        const orOption = document.createElement('option');
        orOption.value = 'OR';
        orOption.textContent = 'OR';
        
        connectorSelect.appendChild(andOption);
        connectorSelect.appendChild(orOption);
        connectorSelect.value = condition.connector;
        
        connectorSelect.addEventListener('change', (e) => {
            condition.connector = e.target.value;
            generateSQL();
        });
        
        conditionEl.appendChild(connectorSelect);
    }
    
    // Column select
    const columnSelect = document.createElement('select');
    columnSelect.setAttribute('aria-label', 'Select column for condition');
    columnSelect.addEventListener('change', (e) => {
        condition.column = e.target.value;
        generateSQL();
    });
    
    // Populate columns from selected table
    const tables = {
        'case_files': ['case_id', 'case_title', 'date', 'location', 'lead_detective', 'case_type', 'severity', 'status', 'signature', 'summary'],
        'evidence': ['evidence_id', 'case_id', 'item', 'found_at', 'time_found', 'notes', 'is_key'], // is_key is a boolean flag (1=yes, 0=no)
        'suspects': ['suspect_id', 'case_id', 'name', 'connection', 'alibi', 'suspicion', 'motive_hint'],
        'witness_statements': ['statement_id', 'case_id', 'witness_name', 'reliability', 'statement']
    };
    
    // Get columns from all selected tables (or use case_files as default)
    const selectedTableNames = accessibleQueryBuilder.selectedTables.length > 0 
        ? accessibleQueryBuilder.selectedTables 
        : ['case_files'];
    
    // Add empty option first
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- Select Column --';
    columnSelect.appendChild(emptyOption);
    
    // Add columns from all selected tables
    selectedTableNames.forEach(tableName => {
        const columns = tables[tableName] || [];
        columns.forEach(col => {
            const option = document.createElement('option');
            option.value = `${tableName}.${col}`;
            option.textContent = `${tableName}.${col}`;
            columnSelect.appendChild(option);
        });
    });
    
    // Operator select
    const operatorSelect = document.createElement('select');
    operatorSelect.setAttribute('aria-label', 'Select operator');
    ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'IN'].forEach(op => {
        const option = document.createElement('option');
        option.value = op;
        option.textContent = op;
        operatorSelect.appendChild(option);
    });
    operatorSelect.addEventListener('change', (e) => {
        condition.operator = e.target.value;
        generateSQL();
    });
    
    // Value input with helper text
    const valueInputContainer = document.createElement('div');
    valueInputContainer.style.display = 'flex';
    valueInputContainer.style.flexDirection = 'column';
    valueInputContainer.style.flex = '1';
    valueInputContainer.style.minWidth = '200px';
    
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.setAttribute('aria-label', 'Enter condition value');
    valueInput.style.width = '100%';
    valueInput.addEventListener('input', (e) => {
        condition.value = e.target.value;
        updateValueHelperText(valueInput, condition, helperText);
        generateSQL();
    });
    
    // Helper text to explain what the system adds
    const helperText = document.createElement('div');
    helperText.className = 'condition-helper-text';
    helperText.style.fontSize = '12px';
    helperText.style.color = 'var(--text-medium)';
    helperText.style.marginTop = '4px';
    helperText.style.fontStyle = 'italic';
    helperText.style.wordWrap = 'break-word';
    helperText.style.maxWidth = '100%';
    
    // Update helper text based on operator
    const updateValueHelperText = (input, cond, helper) => {
        if (cond.operator === 'LIKE') {
            if (input.value && !input.value.includes('%')) {
                helper.textContent = 'Note: System will add % wildcards around your text. Example: "test" becomes "%test%"';
                helper.style.color = 'var(--manga-blue)';
            } else if (input.value.includes('%')) {
                helper.textContent = 'You can add your own % wildcards. System will still wrap with % if needed.';
                helper.style.color = 'var(--text-medium)';
            } else {
                helper.textContent = 'For LIKE: Enter text. System adds % wildcards automatically.';
                helper.style.color = 'var(--text-medium)';
            }
        } else if (cond.operator === 'IN') {
            helper.textContent = 'For IN: Enter comma-separated values. Example: value1, value2, value3';
            helper.style.color = 'var(--text-medium)';
        } else {
            // Check if it's a numeric column
            const numericColumns = ['id', 'case_id', 'evidence_id', 'suspect_id', 'statement_id', 'severity', 'suspicion', 'reliability', 'is_key'];
            const isNumericColumn = numericColumns.some(nc => cond.column.toLowerCase().includes(nc));
            
            if (isNumericColumn) {
                helper.textContent = 'Numeric value: No quotes needed. Enter number directly.';
                helper.style.color = 'var(--manga-green)';
            } else {
                if (input.value) {
                    helper.textContent = 'Text value: System will add quotes around your text automatically.';
                    helper.style.color = 'var(--manga-blue)';
                } else {
                    helper.textContent = 'Text values are automatically quoted. Numbers are not quoted.';
                    helper.style.color = 'var(--text-medium)';
                }
            }
        }
    };
    
    // Initial helper text
    updateValueHelperText(valueInput, condition, helperText);
    
    // Update helper text when operator changes
    operatorSelect.addEventListener('change', () => {
        updateValueHelperText(valueInput, condition, helperText);
    });
    
    valueInputContainer.appendChild(valueInput);
    valueInputContainer.appendChild(helperText);
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'condition-remove-btn pixel-text-tiny';
    removeBtn.textContent = 'REMOVE';
    removeBtn.setAttribute('aria-label', 'Remove condition');
    removeBtn.addEventListener('click', () => {
        accessibleQueryBuilder.conditions = accessibleQueryBuilder.conditions.filter(c => c.id !== conditionId);
        conditionEl.remove();
        // Update connectors on remaining conditions (first shouldn't have one)
        const remainingConditions = container.querySelectorAll('.condition-item');
        remainingConditions.forEach((el, index) => {
            const connector = el.querySelector('.condition-connector');
            if (index === 0 && connector) {
                connector.remove();
            } else if (index > 0 && !connector) {
                // Add connector to this condition
                const cond = accessibleQueryBuilder.conditions.find(c => c.id === el.id);
                if (cond) {
                    const connectorSelect = document.createElement('select');
                    connectorSelect.className = 'condition-connector';
                    connectorSelect.setAttribute('aria-label', 'Select connector (AND or OR)');
                    connectorSelect.style.marginRight = '10px';
                    connectorSelect.style.fontSize = '14px';
                    connectorSelect.style.padding = '6px';
                    connectorSelect.style.fontWeight = '700';
                    
                    const andOption = document.createElement('option');
                    andOption.value = 'AND';
                    andOption.textContent = 'AND';
                    const orOption = document.createElement('option');
                    orOption.value = 'OR';
                    orOption.textContent = 'OR';
                    
                    connectorSelect.appendChild(andOption);
                    connectorSelect.appendChild(orOption);
                    connectorSelect.value = cond.connector || 'AND';
                    
                    connectorSelect.addEventListener('change', (e) => {
                        cond.connector = e.target.value;
                        generateSQL();
                    });
                    
                    el.insertBefore(connectorSelect, el.firstChild);
                }
            }
        });
        generateSQL();
    });
    
    conditionEl.appendChild(columnSelect);
    conditionEl.appendChild(operatorSelect);
    conditionEl.appendChild(valueInputContainer);
    conditionEl.appendChild(removeBtn);
    container.appendChild(conditionEl);
}

// Generate SQL from builder
function generateSQL() {
    let sql = 'SELECT ';
    
    // SELECT clause
    if (accessibleQueryBuilder.selectedColumns.length === 0) {
        sql += '*';
    } else {
        sql += accessibleQueryBuilder.selectedColumns.map(c => c.fullName).join(', ');
    }
    
    // FROM clause - handle single or multiple tables
    if (accessibleQueryBuilder.selectedTables.length === 0) {
        sql += '\nFROM [No table selected]';
    } else if (accessibleQueryBuilder.selectedTables.length === 1) {
        sql += `\nFROM ${accessibleQueryBuilder.selectedTables[0]}`;
    } else {
        // Multiple tables - use JOIN (simplified: INNER JOIN on common id columns)
        sql += `\nFROM ${accessibleQueryBuilder.selectedTables[0]}`;
        for (let i = 1; i < accessibleQueryBuilder.selectedTables.length; i++) {
            sql += `\nINNER JOIN ${accessibleQueryBuilder.selectedTables[i]} ON ${accessibleQueryBuilder.selectedTables[0]}.id = ${accessibleQueryBuilder.selectedTables[i]}.id`;
        }
    }
    
    // WHERE clause - only add if conditions are complete and valid
    if (accessibleQueryBuilder.conditions.length > 0) {
        const validConditions = accessibleQueryBuilder.conditions.filter(c => {
            // Only include conditions that have both column and value filled in (not empty strings)
            return c.column && c.column.trim() !== '' && c.value && c.value.trim() !== '';
        });
        
        // Only add WHERE clause if we have at least one valid condition
        if (validConditions.length > 0) {
            sql += '\nWHERE ';
            
            // Group conditions by connector type for better handling
            // Build condition string with proper grouping
            let conditionStr = '';
            let currentGroup = [];
            let lastConnector = null;
            
            validConditions.forEach((c, index) => {
                let singleCondition = '';
                
                // Handle LIKE operator
                if (c.operator === 'LIKE' && !c.value.includes('%')) {
                    singleCondition = `${c.column} ${c.operator} '%${c.value}%'`;
                }
                // Handle numeric values (don't quote them)
                else if (!isNaN(c.value) && c.value.trim() !== '' && c.operator !== 'LIKE' && c.operator !== 'IN') {
                    const numericColumns = ['id', 'case_id', 'evidence_id', 'suspect_id', 'statement_id', 'severity', 'suspicion', 'reliability', 'is_key'];
                    const isNumericColumn = numericColumns.some(nc => c.column.toLowerCase().includes(nc));
                    if (isNumericColumn) {
                        singleCondition = `${c.column} ${c.operator} ${c.value.trim()}`;
                    } else {
                        singleCondition = `${c.column} ${c.operator} '${c.value.replace(/'/g, "''")}'`;
                    }
                }
                // Handle string values (escape single quotes)
                else if (typeof c.value === 'string' && c.operator !== 'LIKE' && c.operator !== 'IN') {
                    singleCondition = `${c.column} ${c.operator} '${c.value.replace(/'/g, "''")}'`;
                }
                else {
                    singleCondition = `${c.column} ${c.operator} ${c.value}`;
                }
                
                // Handle grouping for AND/OR combinations
                if (index === 0) {
                    // First condition - no connector
                    conditionStr = singleCondition;
                    lastConnector = c.connector || 'AND';
                } else {
                    const currentConnector = c.connector || 'AND';
                    
                    // If connector changes, we need to group previous conditions
                    if (lastConnector !== currentConnector && lastConnector) {
                        // Close previous group if it had multiple items
                        if (currentGroup.length > 1) {
                            conditionStr = `(${conditionStr}) ${currentConnector} ${singleCondition}`;
                            currentGroup = [singleCondition];
                        } else {
                            conditionStr += ` ${currentConnector} ${singleCondition}`;
                            currentGroup = [singleCondition];
                        }
                    } else {
                        // Same connector - continue building
                        conditionStr += ` ${currentConnector} ${singleCondition}`;
                        currentGroup.push(singleCondition);
                    }
                    
                    lastConnector = currentConnector;
                }
            });
            
            sql += conditionStr;
        }
    }
    
    // Display SQL in multiple places for live preview
    // 1. Step 3 (Review) - full SQL
    let sqlDisplay = document.getElementById('generated-sql');
    if (!sqlDisplay) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            sqlDisplay = inlinePanel.querySelector('#generated-sql');
        }
    }
    if (sqlDisplay) {
        sqlDisplay.textContent = sql;
    }
    
    // 2. Live preview in Step 1 and Step 2
    updateLiveSQLPreview(sql);
    
    // Update query state
    accessibleQueryBuilder.queryState = {
        select: accessibleQueryBuilder.selectedColumns,
        from: accessibleQueryBuilder.selectedTable,
        where: accessibleQueryBuilder.conditions,
        orderBy: null
    };
}

// Update live SQL preview in Steps 1 and 2
function updateLiveSQLPreview(sql) {
    // Find all step containers
    const step1 = document.querySelector('[data-step="1"]');
    const step2 = document.querySelector('[data-step="2"]');
    
    // Create or update preview in Step 1
    if (step1) {
        let preview1 = step1.querySelector('.live-sql-preview');
        if (!preview1) {
            preview1 = document.createElement('div');
            preview1.className = 'live-sql-preview';
            preview1.style.marginTop = '15px';
            preview1.style.padding = '12px';
            preview1.style.background = 'var(--paper-yellow)';
            preview1.style.border = '2px solid var(--border-comic)';
            preview1.style.borderRadius = '4px';
            preview1.style.fontSize = '14px';
            preview1.style.fontFamily = 'monospace';
            preview1.style.wordWrap = 'break-word';
            preview1.style.overflowWrap = 'break-word';
            preview1.style.whiteSpace = 'pre-wrap';
            preview1.style.maxWidth = '100%';
            
            const label1 = document.createElement('div');
            label1.textContent = 'Live SQL Preview:';
            label1.style.fontWeight = 'bold';
            label1.style.marginBottom = '8px';
            label1.style.fontSize = '14px';
            preview1.appendChild(label1);
            
            const sqlText1 = document.createElement('div');
            sqlText1.className = 'live-sql-text';
            sqlText1.style.wordWrap = 'break-word';
            sqlText1.style.overflowWrap = 'break-word';
            sqlText1.style.whiteSpace = 'pre-wrap';
            preview1.appendChild(sqlText1);
            
            const stepContent = step1.querySelector('.step-content');
            if (stepContent) {
                stepContent.appendChild(preview1);
            }
        }
        const sqlText1 = preview1.querySelector('.live-sql-text');
        if (sqlText1) {
            sqlText1.textContent = sql || 'SELECT *\nFROM [No table selected]';
        }
    }
    
    // Create or update preview in Step 2
    if (step2) {
        let preview2 = step2.querySelector('.live-sql-preview');
        if (!preview2) {
            preview2 = document.createElement('div');
            preview2.className = 'live-sql-preview';
            preview2.style.marginTop = '15px';
            preview2.style.padding = '12px';
            preview2.style.background = 'var(--paper-yellow)';
            preview2.style.border = '2px solid var(--border-comic)';
            preview2.style.borderRadius = '4px';
            preview2.style.fontSize = '14px';
            preview2.style.fontFamily = 'monospace';
            preview2.style.wordWrap = 'break-word';
            preview2.style.overflowWrap = 'break-word';
            preview2.style.whiteSpace = 'pre-wrap';
            preview2.style.maxWidth = '100%';
            
            const label2 = document.createElement('div');
            label2.textContent = 'Live SQL Preview:';
            label2.style.fontWeight = 'bold';
            label2.style.marginBottom = '8px';
            label2.style.fontSize = '14px';
            preview2.appendChild(label2);
            
            const sqlText2 = document.createElement('div');
            sqlText2.className = 'live-sql-text';
            sqlText2.style.wordWrap = 'break-word';
            sqlText2.style.overflowWrap = 'break-word';
            sqlText2.style.whiteSpace = 'pre-wrap';
            preview2.appendChild(sqlText2);
            
            const stepContent = step2.querySelector('.step-content');
            if (stepContent) {
                stepContent.appendChild(preview2);
            }
        }
        const sqlText2 = preview2.querySelector('.live-sql-text');
        if (sqlText2) {
            sqlText2.textContent = sql || 'SELECT *\nFROM [No table selected]';
        }
    }
}

// Setup review and execute
function setupReviewAndExecute() {
    document.getElementById('copy-sql-btn')?.addEventListener('click', () => {
        const sql = document.getElementById('generated-sql')?.textContent;
        if (sql) {
            navigator.clipboard.writeText(sql).then(() => {
                alert('SQL copied to clipboard!');
            });
        }
    });
    
    // Setup execute query button (check both inline and modal)
    let executeBtn = document.getElementById('execute-query-btn');
    if (!executeBtn) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel) {
            executeBtn = inlinePanel.querySelector('#execute-query-btn');
        }
    }
    if (executeBtn) {
        // Remove existing listener by cloning
        const newExecuteBtn = executeBtn.cloneNode(true);
        if (executeBtn.parentNode) {
            executeBtn.parentNode.replaceChild(newExecuteBtn, executeBtn);
        }
        newExecuteBtn.addEventListener('click', () => {
            // Ensure SQL is generated first
            generateSQL();
            
            let sql = document.getElementById('generated-sql')?.textContent;
            if (!sql) {
                const inlinePanel = document.getElementById('inline-visual-panel');
                if (inlinePanel) {
                    const sqlEl = inlinePanel.querySelector('#generated-sql');
                    sql = sqlEl?.textContent;
                }
            }
            
            console.log('Execute button clicked, SQL:', sql); // Debug
            
            if (!sql || !sql.trim()) {
                alert('No SQL query generated. Please select columns and try again.');
                return;
            }
            
            if (window.runQuery) {
                console.log('Calling runQuery with:', sql); // Debug
                // Execute query (this will display results on evidence board)
                window.runQuery(sql);
                // Hide query builder and show evidence board after executing
                if (window.hideQueryBuilderInline) {
                    window.hideQueryBuilderInline();
                }
            } else {
                console.error('runQuery function not found');
                alert('Query execution function not available. Please refresh the page.');
            }
        });
    }
}

// Guided Builder
function setupGuidedBuilder() {
    const form = document.getElementById('guided-builder-form');
    if (!form) return;
    
    // Column type toggle
    const columnTypeRadios = form.querySelectorAll('input[name="column-type"]');
    const specificColumnsSection = document.getElementById('specific-columns-section');
    
    columnTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'specific') {
                specificColumnsSection.hidden = false;
            } else {
                specificColumnsSection.hidden = true;
            }
        });
    });
    
    // Filter checkbox
    const filterCheckbox = document.getElementById('add-filter-checkbox');
    const filterSection = document.getElementById('filter-section');
    
    filterCheckbox?.addEventListener('change', (e) => {
        filterSection.hidden = !e.target.checked;
    });
    
    // Populate table selects
    populateGuidedTables();
    
    // Add condition button
    document.getElementById('add-guided-condition-btn')?.addEventListener('click', () => {
        addGuidedCondition();
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateGuidedSQL();
    });
}

function populateGuidedTables() {
    const tables = [
        { name: 'suspects', description: 'People of interest' },
        { name: 'locations', description: 'Crime scene locations' },
        { name: 'timeline', description: 'Chronological events' },
        { name: 'witnesses', description: 'Witness statements' },
        { name: 'evidence', description: 'Physical evidence' },
        { name: 'cctv', description: 'Security footage' }
    ];
    
    // Populate FROM table select
    const fromSelect = document.getElementById('from-table-select');
    if (fromSelect) {
        tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table.name;
            option.textContent = `${table.name} - ${table.description}`;
            fromSelect.appendChild(option);
        });
    }
    
    // Populate column table select
    const columnTableSelect = document.getElementById('column-table-select');
    if (columnTableSelect) {
        tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table.name;
            option.textContent = table.name;
            columnTableSelect.appendChild(option);
        });
        
        // Update columns when table changes
        columnTableSelect.addEventListener('change', () => {
            updateGuidedColumns();
        });
    }
    
    // Initial column load
    updateGuidedColumns();
}

function updateGuidedColumns() {
    const tableSelect = document.getElementById('column-table-select');
    const container = document.getElementById('column-checkboxes-list');
    if (!tableSelect || !container) return;
    
    const selectedTable = tableSelect.value;
    const tables = {
        'suspects': ['id', 'name', 'age', 'occupation', 'address', 'alibi', 'motive', 'suspicious_level'],
        'locations': ['id', 'name', 'address', 'location_type', 'description', 'distance_from_crime'],
        'timeline': ['id', 'timestamp', 'event_description', 'location_id', 'suspect_id', 'evidence_type'],
        'witnesses': ['id', 'name', 'statement', 'credibility', 'location_id'],
        'evidence': ['id', 'item_name', 'description', 'found_at_location', 'found_by', 'relevance'],
        'cctv': ['id', 'camera_location', 'timestamp', 'person_seen', 'activity_description', 'location_id']
    };
    
    const columns = tables[selectedTable] || [];
    container.innerHTML = '';
    
    columns.forEach(column => {
        const label = document.createElement('label');
        label.className = 'column-checkbox-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = `${selectedTable}.${column}`;
        checkbox.id = `guided-col-${selectedTable}-${column}`;
        checkbox.setAttribute('aria-label', `Select column ${column}`);
        
        const span = document.createElement('span');
        span.textContent = column;
        span.className = 'pixel-text-tiny';
        
        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

function addGuidedCondition() {
    const container = document.getElementById('guided-conditions-list');
    if (!container) return;
    
    const conditionEl = document.createElement('div');
    conditionEl.className = 'condition-item guided-condition-item';
    
    // Column select
    const columnSelect = document.createElement('select');
    columnSelect.className = 'condition-column';
    columnSelect.setAttribute('aria-label', 'Select column');
    
    // Populate from selected table
    const fromTable = document.getElementById('from-table-select')?.value;
    if (fromTable) {
        const tables = {
            'suspects': ['id', 'name', 'age', 'occupation', 'address', 'alibi', 'motive', 'suspicious_level'],
            'locations': ['id', 'name', 'address', 'location_type', 'description', 'distance_from_crime'],
            'timeline': ['id', 'timestamp', 'event_description', 'location_id', 'suspect_id', 'evidence_type'],
            'witnesses': ['id', 'name', 'statement', 'credibility', 'location_id'],
            'evidence': ['id', 'item_name', 'description', 'found_at_location', 'found_by', 'relevance'],
            'cctv': ['id', 'camera_location', 'timestamp', 'person_seen', 'activity_description', 'location_id']
        };
        
        const columns = tables[fromTable] || [];
        columns.forEach(col => {
            const option = document.createElement('option');
            option.value = `${fromTable}.${col}`;
            option.textContent = `${fromTable}.${col}`;
            columnSelect.appendChild(option);
        });
    }
    
    // Operator
    const operatorSelect = document.createElement('select');
    operatorSelect.className = 'condition-operator';
    operatorSelect.setAttribute('aria-label', 'Select operator');
    ['=', '!=', '<', '>', '<=', '>=', 'LIKE'].forEach(op => {
        const option = document.createElement('option');
        option.value = op;
        option.textContent = op;
        operatorSelect.appendChild(option);
    });
    
    // Value
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'condition-value';
    valueInput.setAttribute('aria-label', 'Enter value');
    
    // Remove
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'condition-remove-btn pixel-text-tiny';
    removeBtn.textContent = 'REMOVE';
    removeBtn.setAttribute('aria-label', 'Remove condition');
    removeBtn.addEventListener('click', () => conditionEl.remove());
    
    conditionEl.appendChild(columnSelect);
    conditionEl.appendChild(operatorSelect);
    conditionEl.appendChild(valueInputContainer);
    conditionEl.appendChild(removeBtn);
    container.appendChild(conditionEl);
}

function generateGuidedSQL() {
    const form = document.getElementById('guided-builder-form');
    if (!form) return;
    
    let sql = 'SELECT ';
    
    // Column selection
    const columnType = form.querySelector('input[name="column-type"]:checked')?.value;
    if (columnType === 'all') {
        sql += '*';
    } else {
        const checkboxes = form.querySelectorAll('#column-checkboxes-list input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            alert('Please drag at least one column from Database Files to Selected Columns');
            return;
        }
        sql += Array.from(checkboxes).map(cb => cb.value).join(', ');
    }
    
    // FROM clause
    const fromTable = form.querySelector('#from-table-select')?.value;
    if (!fromTable) {
        alert('Please select a table');
        return;
    }
    sql += `\nFROM ${fromTable}`;
    
    // WHERE clause
    const addFilter = form.querySelector('#add-filter-checkbox')?.checked;
    if (addFilter) {
        const conditions = Array.from(form.querySelectorAll('.guided-condition-item'))
            .map(item => {
                const column = item.querySelector('.condition-column')?.value;
                const operator = item.querySelector('.condition-operator')?.value;
                const value = item.querySelector('.condition-value')?.value;
                if (column && operator && value) {
                    return `${column} ${operator} '${value}'`;
                }
                return null;
            })
            .filter(c => c !== null);
        
        if (conditions.length > 0) {
            sql += '\nWHERE ' + conditions.join(' AND ');
        }
    }
    
    // Execute query
    if (window.runQuery) {
        window.runQuery(sql);
    }
}

// Keyboard Navigation
function setupKeyboardNavigation() {
    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('query-builder-modal');
            if (modal && modal.style.display === 'block') {
                window.closeModal('query-builder-modal');
            }
        }
    });
}

// Focus Management
function setupFocusManagement() {
    // Trap focus in modal
    const modal = document.getElementById('query-builder-modal');
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccessibleQueryBuilder);
} else {
    initAccessibleQueryBuilder();
}

// Export for global access
window.initAccessibleQueryBuilder = initAccessibleQueryBuilder;
window.accessibleQueryBuilder = accessibleQueryBuilder;
