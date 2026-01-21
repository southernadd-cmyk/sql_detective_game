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
        setupVisualBuilderSteps();
        setupRawSqlEditor();
        setupKeyboardNavigation();
        setupFocusManagement();

        queryBuilderInitialized = true;
    }

    // Setup tabs every time (in case we're switching between modal and inline)
    setupTabNavigation();
    
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
    // Check if we're in inline or modal mode
    const isInline = document.getElementById('query-builder-view')?.classList.contains('active');

    const tabSelector = isInline ? '[role="tab"][id^="inline-"]' : '[role="tab"]:not([id^="inline-"])';
    const panelSelector = isInline ? '[role="tabpanel"][id^="inline-"]' : '[role="tabpanel"]:not([id^="inline-"])';

    const tabs = document.querySelectorAll(tabSelector);
    const panels = document.querySelectorAll(panelSelector);


    // Set initial state - first tab active, others inactive
    tabs.forEach((tab, index) => {
        if (index === 0) {
            tab.setAttribute('aria-selected', 'true');
            tab.classList.add('active');
        } else {
            tab.setAttribute('aria-selected', 'false');
            tab.classList.remove('active');
        }
    });

    // Set initial panel visibility
    panels.forEach((panel, index) => {
        if (index === 0) {
            panel.hidden = false;
            panel.style.display = 'block';
        } else {
            panel.hidden = true;
            panel.style.display = 'none';
        }
    });

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent onboarding from interfering

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
                p.style.display = 'none'; // Also set display for extra assurance
            });
            const targetPanel = document.getElementById(tab.getAttribute('aria-controls'));
            if (targetPanel) {
                targetPanel.hidden = false;
                targetPanel.style.display = 'block'; // Also set display for extra assurance
            }

            // Pause/resume onboarding based on active tab
            const isRawSqlTab = tab.id.includes('raw-sql');
            if (window.onboarding) {
                if (isRawSqlTab) {
                    console.log('Pausing onboarding for Raw SQL mode');
                    // Store current onboarding state
                    if (!window.onboarding._paused) {
                        window.onboarding._paused = true;
                        window.onboarding._savedActive = window.onboarding.isActive;
                        window.onboarding.isActive = false;
                        // Hide current toast
                        window.onboarding.removeCurrentToast();
                    }
                } else {
                    console.log('Resuming onboarding for Visual mode');
                    // Resume onboarding if it was paused
                    if (window.onboarding._paused) {
                        window.onboarding._paused = false;
                        window.onboarding.isActive = window.onboarding._savedActive || false;
                        // Re-show current step if onboarding should be active
                        if (window.onboarding.isActive && !window.onboarding.completedSteps.has(window.onboarding.currentStep)) {
                            setTimeout(() => {
                                window.onboarding.showStep(window.onboarding.currentStep);
                            }, 500);
                        }
                    }
                }
            }

            // Reset visual builder state when switching to visual mode
            if (!isRawSqlTab && window.goToStep) {
                // Reset to step 1 when switching back to visual mode
                setTimeout(() => {
                    goToStep(1);
                }, 100);
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
    
    // Initialize SQL preview from step 1
    setTimeout(() => {
        generateSQL();
    }, 100);
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
                // Update SQL preview when column is removed
                generateSQL();
            });
            
            item.appendChild(span);
            item.appendChild(removeBtn);
            selectedContainer.appendChild(item);
        });
    }
    
    // Update SQL preview whenever columns change
    generateSQL();
    
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
                if (window.toast) {
                    window.toast.warning('Please drag at least one column from Database Files to Selected Columns', 4000);
                } else {
                    alert('Please drag at least one column from Database Files to Selected Columns');
                }
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
        
        // Update SQL preview when step changes
        generateSQL();
        
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
                
                if (data.table && data.column) {
                    // Handle star (*) - select all columns from table
                    if (data.column === '*' || data.type === 'star') {
                        addAllColumnsFromTable(data.table);
                    } else {
                        // Add single column to selected columns
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
    
    // Get all columns for this table from shared schema
    const schemaTables = (typeof window !== 'undefined' && window.SCHEMA_TABLES) ? window.SCHEMA_TABLES : [];
    const schemaTable = schemaTables.find(table => table.name === tableName);
    const columns = schemaTable ? schemaTable.columns.map(column => column.name) : [];
    
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
    if (setupConditionsBuilder._delegated) {
        return;
    }
    setupConditionsBuilder._delegated = true;

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#add-condition-btn');
        if (!btn) return;
        const panel = btn.closest('#inline-visual-panel') || btn.closest('#visual-panel');
        addCondition(panel);
    });
}

function addCondition(panel) {
    // Prefer the panel that owns the button, fall back to visible panel
    let container = null;
    if (panel) {
        container = panel.querySelector('#conditions-list');
    }
    if (!container) {
        const inlinePanel = document.getElementById('inline-visual-panel');
        if (inlinePanel && inlinePanel.offsetParent !== null) {
            container = inlinePanel.querySelector('#conditions-list');
        }
    }
    if (!container) {
        const modalPanel = document.getElementById('visual-panel');
        if (modalPanel) {
            container = modalPanel.querySelector('#conditions-list');
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
    const schemaTables = (typeof window !== 'undefined' && window.SCHEMA_TABLES) ? window.SCHEMA_TABLES : [];
    
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
        const schemaTable = schemaTables.find(table => table.name === tableName);
        const columns = schemaTable ? schemaTable.columns.map(column => column.name) : [];
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

// Generate SQL from builder with metadata about what's being changed
function generateSQL() {
    const currentStep = accessibleQueryBuilder.currentStep;
    const sqlParts = {
        select: '',
        from: '',
        where: '',
        isSelectChanging: currentStep === 1,
        isFromChanging: currentStep === 1, // FROM changes when columns are selected
        isWhereChanging: currentStep === 2
    };
    
    // SELECT clause
    if (accessibleQueryBuilder.selectedColumns.length === 0) {
        sqlParts.select = '*';
    } else {
        sqlParts.select = accessibleQueryBuilder.selectedColumns.map(c => c.fullName).join(', ');
    }
    
    // FROM clause - handle single or multiple tables
    if (accessibleQueryBuilder.selectedTables.length === 0) {
        sqlParts.from = '[No table selected]';
    } else if (accessibleQueryBuilder.selectedTables.length === 1) {
        sqlParts.from = accessibleQueryBuilder.selectedTables[0];
    } else {
        // Multiple tables - use known relationships where possible
        const joinDefinitions = (typeof window !== 'undefined' && window.SCHEMA_RELATIONSHIPS)
            ? window.SCHEMA_RELATIONSHIPS
            : [
                { left: { table: 'case_files', column: 'case_id' }, right: { table: 'evidence', column: 'case_id' } },
                { left: { table: 'case_files', column: 'case_id' }, right: { table: 'suspects', column: 'case_id' } },
                { left: { table: 'case_files', column: 'case_id' }, right: { table: 'witness_statements', column: 'case_id' } },
                { left: { table: 'case_files', column: 'case_id' }, right: { table: 'time_logs', column: 'case_id' } },
                { left: { table: 'case_files', column: 'case_id' }, right: { table: 'connections', column: 'case_id' } },
                { left: { table: 'time_logs', column: 'location_code' }, right: { table: 'locations', column: 'location_code' } }
            ];

        const joinForTables = (joinedTable, targetTable) => {
            for (const def of joinDefinitions) {
                if (def.left.table === joinedTable && def.right.table === targetTable) {
                    return `INNER JOIN ${targetTable} ON ${def.left.table}.${def.left.column} = ${def.right.table}.${def.right.column}`;
                }
                if (def.right.table === joinedTable && def.left.table === targetTable) {
                    return `INNER JOIN ${targetTable} ON ${def.right.table}.${def.right.column} = ${def.left.table}.${def.left.column}`;
                }
            }
            return null;
        };

        const tables = accessibleQueryBuilder.selectedTables;
        const baseTable = tables.includes('case_files') ? 'case_files' : tables[0];
        const joinedTables = new Set([baseTable]);
        const remainingTables = tables.filter(t => t !== baseTable);

        let fromClause = baseTable;
        while (remainingTables.length > 0) {
            let joinedThisPass = false;
            for (let i = 0; i < remainingTables.length; i++) {
                const targetTable = remainingTables[i];
                let joinClause = null;
                for (const joinedTable of joinedTables) {
                    joinClause = joinForTables(joinedTable, targetTable);
                    if (joinClause) break;
                }
                if (joinClause) {
                    fromClause += `\n${joinClause}`;
                    joinedTables.add(targetTable);
                    remainingTables.splice(i, 1);
                    joinedThisPass = true;
                    break;
                }
            }
            if (!joinedThisPass) {
                break;
            }
        }

        if (remainingTables.length > 0) {
            const missing = remainingTables.join(', ');
            const message = `Query builder could not infer joins for: ${missing}. Add joins manually in Raw SQL if needed.`;
            if (window.toast) {
                window.toast.warning(message, 5000);
            } else {
                console.warn(message);
            }
        }

        sqlParts.from = fromClause;
    }
    
    // WHERE clause - only add if conditions are complete and valid
    if (accessibleQueryBuilder.conditions.length > 0) {
        const validConditions = accessibleQueryBuilder.conditions.filter(c => {
            // Only include conditions that have both column and value filled in (not empty strings)
            return c.column && c.column.trim() !== '' && c.value && c.value.trim() !== '';
        });
        
        // Only add WHERE clause if we have at least one valid condition
        if (validConditions.length > 0) {
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
            
            sqlParts.where = conditionStr;
        }
    }
    
    // Build full SQL string
    let sql = `SELECT ${sqlParts.select}`;
    sql += `\nFROM ${sqlParts.from}`;
    if (sqlParts.where) {
        sql += `\nWHERE ${sqlParts.where}`;
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
    
    // 2. Live preview in Step 1 and Step 2 with syntax highlighting
    updateLiveSQLPreview(sql, sqlParts);

    // Trigger onboarding step 5 if SQL preview appears and we're at step 4
    if (window.onboarding) {
        if ((window.onboarding.currentStep === 4 || window.onboarding.currentStep === 5) && !window.onboarding.completedSteps.has(5) && !window.onboarding.step5Triggered) {
            console.log('[Onboarding] Triggering step 5 in 1 second');
            window.onboarding.step5Triggered = true; // Prevent multiple triggers
            setTimeout(() => {
                console.log('[Onboarding] Checking if step 5 should still trigger');
                if (window.onboarding && (window.onboarding.currentStep === 4 || window.onboarding.currentStep === 5) && !window.onboarding.completedSteps.has(5)) {
                    console.log('[Onboarding] Showing step 5');
                    window.onboarding.showStep(5);
                } else {
                    console.log('[Onboarding] Step 5 not triggered - conditions changed');
                }
            }, 1000); // Wait for preview to render
        }
    } else {
        console.log('[Onboarding] No onboarding object available');
    }
    
    // Update query state
    accessibleQueryBuilder.queryState = {
        select: accessibleQueryBuilder.selectedColumns,
        from: accessibleQueryBuilder.selectedTables[0] || null,
        where: accessibleQueryBuilder.conditions,
        orderBy: null
    };
}

// Render SQL with syntax highlighting and change indicators
function renderHighlightedSQL(sql, sqlParts) {
    const currentStep = accessibleQueryBuilder.currentStep;
    const html = document.createElement('div');
    html.className = 'sql-highlighted';
    html.style.fontFamily = 'monospace';
    html.style.fontSize = '14px';
    html.style.lineHeight = '1.6';
    html.style.whiteSpace = 'pre-wrap';
    html.style.wordWrap = 'break-word';
    
    // Helper to escape HTML
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    // Helper to create a span with styling
    const createSpan = (text, className, isChanging = false) => {
        const span = document.createElement('span');
        span.textContent = text;
        span.className = className;
        
        if (isChanging) {
            span.style.fontWeight = 'bold';
            span.style.backgroundColor = 'rgba(255, 255, 0, 0.3)'; // Yellow highlight
            span.style.borderBottom = '2px solid #ff6b00'; // Orange underline
            span.style.padding = '2px 4px';
            span.style.borderRadius = '3px';
            span.style.transition = 'all 0.2s ease';
        }
        
        return span;
    };
    
    // Parse SQL and highlight
    const lines = sql.split('\n');
    lines.forEach((line, lineIndex) => {
        const lineDiv = document.createElement('div');
        lineDiv.style.marginBottom = '2px';
        
        if (line.startsWith('SELECT')) {
            // SELECT keyword
            lineDiv.appendChild(createSpan('SELECT', 'sql-keyword', currentStep === 1));
            lineDiv.appendChild(document.createTextNode(' '));
            
            // SELECT columns
            const selectPart = line.substring(7).trim();
            const isSelectChanging = currentStep === 1;
            lineDiv.appendChild(createSpan(selectPart, 'sql-select', isSelectChanging));
        } else if (line.startsWith('FROM')) {
            // FROM keyword
            lineDiv.appendChild(createSpan('FROM', 'sql-keyword', currentStep === 1));
            lineDiv.appendChild(document.createTextNode(' '));
            
            // FROM table
            const fromPart = line.substring(5).trim();
            const isFromChanging = currentStep === 1;
            lineDiv.appendChild(createSpan(fromPart, 'sql-from', isFromChanging));
        } else if (line.startsWith('INNER JOIN') || line.startsWith('LEFT JOIN') || line.startsWith('RIGHT JOIN')) {
            // JOIN clause
            const joinMatch = line.match(/^(INNER JOIN|LEFT JOIN|RIGHT JOIN)\s+(.+?)(\s+ON\s+(.+))?$/);
            if (joinMatch) {
                lineDiv.appendChild(createSpan(joinMatch[1], 'sql-keyword', currentStep === 1));
                lineDiv.appendChild(document.createTextNode(' '));
                lineDiv.appendChild(createSpan(joinMatch[2], 'sql-table', currentStep === 1));
                if (joinMatch[3]) {
                    lineDiv.appendChild(document.createTextNode(' '));
                    lineDiv.appendChild(createSpan('ON', 'sql-keyword', currentStep === 1));
                    lineDiv.appendChild(document.createTextNode(' '));
                    lineDiv.appendChild(createSpan(joinMatch[4], 'sql-join-condition', currentStep === 1));
                }
            } else {
                lineDiv.textContent = line;
            }
        } else if (line.startsWith('WHERE')) {
            // WHERE keyword
            lineDiv.appendChild(createSpan('WHERE', 'sql-keyword', currentStep === 2));
            lineDiv.appendChild(document.createTextNode(' '));
            
            // WHERE conditions
            const wherePart = line.substring(6).trim();
            const isWhereChanging = currentStep === 2;
            lineDiv.appendChild(createSpan(wherePart, 'sql-where', isWhereChanging));
        } else if (line.trim()) {
            // Other lines (continuations, etc.)
            lineDiv.textContent = line;
        }
        
        html.appendChild(lineDiv);
    });
    
    return html;
}

// Update live SQL preview in Steps 1 and 2 with syntax highlighting
function updateLiveSQLPreview(sql, sqlParts) {
    // Find all step containers
    const step1 = document.querySelector('[data-step="1"]');
    const step2 = document.querySelector('[data-step="2"]');
    
    // Default SQL if none provided
    if (!sql) {
        sql = 'SELECT *\nFROM [No table selected]';
    }
    
    // Create or update preview in Step 1
    if (step1) {
        let preview1 = step1.querySelector('.live-sql-preview');
        if (!preview1) {
            preview1 = document.createElement('div');
            preview1.className = 'live-sql-preview';
            preview1.style.marginTop = '20px';
            preview1.style.padding = '15px';
            preview1.style.background = 'var(--paper-yellow)';
            preview1.style.border = '2px solid var(--border-comic)';
            preview1.style.borderRadius = '6px';
            preview1.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
            preview1.style.maxWidth = '100%';
            
            const label1 = document.createElement('div');
            label1.textContent = '📝 LIVE SQL PREVIEW';
            label1.style.fontWeight = 'bold';
            label1.style.marginBottom = '12px';
            label1.style.fontSize = '16px';
            label1.style.color = 'var(--manga-blue)';
            label1.style.textTransform = 'uppercase';
            preview1.appendChild(label1);
            
            const sqlContainer1 = document.createElement('div');
            sqlContainer1.className = 'live-sql-text';
            sqlContainer1.style.background = '#fff';
            sqlContainer1.style.padding = '12px';
            sqlContainer1.style.borderRadius = '4px';
            sqlContainer1.style.border = 'none';
            sqlContainer1.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.1)';
            preview1.appendChild(sqlContainer1);
            
            const stepContent = step1.querySelector('.step-content');
            if (stepContent) {
                // Insert after selected columns fieldset
                const selectedColumnsFieldset = stepContent.querySelector('.selected-columns');
                if (selectedColumnsFieldset && selectedColumnsFieldset.parentNode) {
                    // Insert after the selected columns fieldset
                    selectedColumnsFieldset.parentNode.insertBefore(preview1, selectedColumnsFieldset.nextSibling);
                } else {
                    // Fallback: insert at the end of step content
                    stepContent.appendChild(preview1);
                }
            }
        }
        const sqlContainer1 = preview1.querySelector('.live-sql-text');
        if (sqlContainer1) {
            sqlContainer1.innerHTML = '';
            const highlighted = renderHighlightedSQL(sql, sqlParts);
            sqlContainer1.appendChild(highlighted);
        }
    }
    
    // Create or update preview in Step 2
    if (step2) {
        let preview2 = step2.querySelector('.live-sql-preview');
        if (!preview2) {
            preview2 = document.createElement('div');
            preview2.className = 'live-sql-preview';
            preview2.style.marginTop = '20px';
            preview2.style.padding = '15px';
            preview2.style.background = 'var(--paper-yellow)';
            preview2.style.border = '2px solid var(--border-comic)';
            preview2.style.borderRadius = '6px';
            preview2.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
            preview2.style.maxWidth = '100%';
            
            const label2 = document.createElement('div');
            label2.textContent = '📝 LIVE SQL PREVIEW';
            label2.style.fontWeight = 'bold';
            label2.style.marginBottom = '12px';
            label2.style.fontSize = '16px';
            label2.style.color = 'var(--manga-blue)';
            label2.style.textTransform = 'uppercase';
            preview2.appendChild(label2);
            
            const sqlContainer2 = document.createElement('div');
            sqlContainer2.className = 'live-sql-text';
            sqlContainer2.style.background = '#fff';
            sqlContainer2.style.padding = '12px';
            sqlContainer2.style.borderRadius = '4px';
            sqlContainer2.style.border = 'none';
            sqlContainer2.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.1)';
            preview2.appendChild(sqlContainer2);
            
            const stepContent = step2.querySelector('.step-content');
            if (stepContent) {
                // Insert at the beginning of step content
                stepContent.insertBefore(preview2, stepContent.firstChild);
            }
        }
        const sqlContainer2 = preview2.querySelector('.live-sql-text');
        if (sqlContainer2) {
            sqlContainer2.innerHTML = '';
            const highlighted = renderHighlightedSQL(sql, sqlParts);
            sqlContainer2.appendChild(highlighted);
        }
    }
}

// Setup review and execute
function setupReviewAndExecute() {
    document.getElementById('copy-sql-btn')?.addEventListener('click', () => {
        const sql = document.getElementById('generated-sql')?.textContent;
        if (sql) {
            navigator.clipboard.writeText(sql).then(() => {
                if (window.toast) {
                    window.toast.success('SQL copied to clipboard!', 2000);
                } else {
                    alert('SQL copied to clipboard!');
                }
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
            
            if (!sql || !sql.trim()) {
                if (window.toast) {
                    window.toast.warning('No SQL query generated. Please select columns and try again.', 4000);
                } else {
                    alert('No SQL query generated. Please select columns and try again.');
                }
                return;
            }
            
            if (window.runQuery) {
                // Execute query (this will display results on evidence board)
                window.runQuery(sql);
                // Hide query builder and show evidence board after executing
                if (window.hideQueryBuilderInline) {
                    window.hideQueryBuilderInline();
                }
            } else {
                console.error('runQuery function not found');
                if (window.toast) {
                    window.toast.error('Query execution function not available. Please refresh the page.', 5000);
                } else {
                    alert('Query execution function not available. Please refresh the page.');
                }
            }
        });
    }
}

// Guided Builder
function setupRawSqlEditor() {
    // Handle both modal and inline versions

    // Clear SQL buttons
    ['clear-sql-btn', 'inline-clear-sql-btn'].forEach(btnId => {
        const clearBtn = document.getElementById(btnId);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const textareaId = btnId === 'clear-sql-btn' ? 'raw-sql-textarea' : 'inline-raw-sql-textarea';
                const textarea = document.getElementById(textareaId);
                if (textarea) {
                    textarea.value = '';
                    textarea.focus();
                }
            });
        }
    });

    // Execute raw SQL buttons
    ['execute-raw-sql-btn', 'inline-execute-raw-sql-btn'].forEach(btnId => {
        const executeBtn = document.getElementById(btnId);
        if (executeBtn) {
            executeBtn.addEventListener('click', () => {
                const textareaId = btnId === 'execute-raw-sql-btn' ? 'raw-sql-textarea' : 'inline-raw-sql-textarea';
                const textarea = document.getElementById(textareaId);
                if (textarea && textarea.value.trim()) {
                    executeRawSqlQuery(textarea.value.trim());
                } else {
                    showToast('Please enter a SQL query first.', 'warning');
                }
            });
        }
    });

    // Handle Enter key in textareas (Ctrl+Enter to execute)
    ['raw-sql-textarea', 'inline-raw-sql-textarea'].forEach(textareaId => {
        const textarea = document.getElementById(textareaId);
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    const btnId = textareaId === 'raw-sql-textarea' ? 'execute-raw-sql-btn' : 'inline-execute-raw-sql-btn';
                    const executeBtn = document.getElementById(btnId);
                    executeBtn?.click();
                }
            });
        }
    });
}

function executeRawSqlQuery(sqlQuery) {
    // Use the same runQuery function as the visual builder for consistent behavior
    if (window.runQuery) {
        window.runQuery(sqlQuery);
    } else {
        console.error('runQuery function not available');
        if (window.toast) {
            window.toast.error('Query execution function not available. Please refresh the page.', 5000);
        } else {
            alert('Query execution function not available. Please refresh the page.');
        }
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
