// Onboarding System - Detective Conan Style Tutorial for First Case
// Toast notifications that guide users through their first query

// Immediate test to verify script is loading
console.log('[Onboarding] ===== SCRIPT FILE LOADING =====');
if (typeof window !== 'undefined') {
    console.log('[Onboarding] Window object available');
} else {
    console.error('[Onboarding] Window object NOT available!');
}

// Create onboarding object
const onboarding = {
    currentStep: 0,
    completedSteps: new Set(),
    isActive: false,
    toastContainer: null,
    step3Triggered: false,
    step5Triggered: false,
    listenersAttached: false, // Prevent step 3 from triggering multiple times
    _conditionObserversActive: false,
    _executionObserversActive: false,
    
    // Detective Conan style messages for each step
    messages: [
        {
            id: 1,
            title: "🔍 CASE FILE ANALYSIS",
            message: "First things first, Detective! Read the case notes in the folder on the left. Every detail matters—even the smallest clue can crack the case wide open. Study the story and task carefully before we begin our investigation.",
            target: ".case-file",
            position: "right",
            action: "read_case"
        },
        {
            id: 2,
            title: "⚡ INITIATE QUERY BUILDER",
            message: "Excellent! Now that you've reviewed the case file, it's time to build our query. Click the 'BUILD QUERY' button below the case file. This will open our investigation tools—think of it as opening your detective's toolkit!",
            target: "#open-query-builder-btn",
            position: "right",
            action: "click_build_query"
        },
        {
            id: 3,
            title: "📁 EXPLORE THE DATABASE FILES",
            message: "Perfect! You've opened the query builder. See those folders on the left? Those are our database files—each one contains evidence tables. Click on a folder (like 'case_files') to expand it and see what columns are available. Every column is a potential clue!",
            target: ".database-files",
            position: "right",
            action: "click_folder"
        },
        {
            id: 4,
            title: "🎯 SELECT YOUR EVIDENCE",
            message: "Great detective work! You can see the column names now. Here's the key move: drag a column name (like 'case_id' or 'case_title') from the folder and drop it into the 'Selected Columns' area below. This tells our query which evidence to examine. Try dragging 'case_id' first!",
            target: "#selected-columns-list",
            position: "top",
            action: "drag_column"
        },
        {
            id: 5,
            title: "✨ WITNESS THE MAGIC",
            message: "Brilliant! Notice what happened? As soon as you selected columns, the SQL query appeared below—written automatically! This is your investigation query being built in real-time. Watch how it changes as you add more columns. The truth is being revealed, one column at a time!",
            target: ".live-sql-preview",
            position: "top",
            action: "see_sql_preview"
        },
        {
            id: 6,
            title: "➡️ PROCEED TO CONDITIONS",
            message: "Outstanding! Your query is taking shape. Now we need to narrow down our search. Click the 'NEXT →' button to move to Step 2, where we'll add conditions to filter our results. This is where we separate the relevant evidence from the noise!",
            target: "#next-to-conditions-btn",
            position: "top",
            action: "click_next"
        },
        {
            id: 7,
            title: "🔎 ADD FILTERING CONDITIONS",
            message: "Welcome to Step 2! Here's where we get specific. Click the 'ADD CONDITION' button to create a filter. Conditions help us find exactly what we're looking for—like searching for a specific case_id or filtering by location. Let's add our first condition!",
            target: "#conditions-list",
            position: "top",
            action: "add_condition"
        },
        {
            id: 8,
            title: "🎯 SET THE CONDITION",
            message: "Perfect! You've added a condition row. Now let's set it up: In the first dropdown, select 'case_files.case_id'. In the operator dropdown, choose '='. In the value field, type '1'. This will filter to show only case_id = 1. Watch the SQL update automatically as you make these selections!",
            target: ".condition-item",
            position: "top",
            action: "set_condition"
        },
        {
            id: 9,
            title: "✅ REVIEW & EXECUTE",
            message: "Excellent detective work! Your SQL query should now show: SELECT case_files.case_id FROM case_files WHERE case_files.case_id = 1. This looks correct! Click 'NEXT →' to review, then click 'EXECUTE QUERY' to run your investigation and see the results. The truth awaits!",
            target: "#execute-query-btn",
            position: "top",
            action: "click_execute"
        },
        {
            id: 10,
            title: "🎉 CASE SOLVED!",
            message: "CONGRATULATIONS, Detective! You've successfully completed your first SQL investigation! The results are displayed on the evidence board. Notice how the query found the exact case file you were looking for. You've mastered the basics—now you're ready to tackle more complex mysteries! Keep investigating!",
            target: "#evidence-board-view",
            position: "left",
            action: "see_results"
        }
    ],
    
    // Initialize onboarding system
    init(showFirstStep = true) {
        if (this.isActive) {
            console.log('[Onboarding] Already active - skipping init');
            return;
        }

        console.log('[Onboarding] init called, showFirstStep:', showFirstStep, 'window.caseSystem:', typeof window.caseSystem);

        // Only show onboarding for case 1
        let isCase1 = false;
        
        if (typeof window.caseSystem !== 'undefined' && window.caseSystem.getCurrentCase) {
            const currentCase = window.caseSystem.getCurrentCase();
            console.log('[Onboarding] Current case from caseSystem:', currentCase);
            if (currentCase && currentCase.id === 1) {
                isCase1 = true;
            }
        } else {
            console.log('[Onboarding] Case system not available, checking DOM for case number');
            // Fallback: check DOM for case number
            const caseNumEl = document.getElementById('current-case-num');
            if (caseNumEl) {
                const caseNum = parseInt(caseNumEl.textContent);
                console.log('[Onboarding] Case number from DOM:', caseNum);
                if (caseNum === 1) {
                    isCase1 = true;
                }
            } else {
                console.log('[Onboarding] Case number element not found, waiting...');
                // If case system isn't ready and DOM doesn't have it, wait a bit and try again
                setTimeout(() => {
                    this.init(showFirstStep);
                }, 500);
                return;
            }
        }
        
        if (!isCase1) {
            console.log('[Onboarding] Not case 1, skipping onboarding');
            return; // Not case 1, skip onboarding
        }
        
        // Check if onboarding was already completed
        // Only skip if it was actually completed (not just on first load)
        const onboardingCompleted = localStorage.getItem('onboarding_completed');
        const onboardingStarted = localStorage.getItem('onboarding_started');
        
        // If onboarding was never started, allow it to start
        // Only skip if it was both started AND completed
        if (onboardingCompleted === 'true' && onboardingStarted === 'true') {
            return; // Already completed
        }
        
        // Mark as started (but not completed yet)
        localStorage.setItem('onboarding_started', 'true');
        
        console.log('[Onboarding] About to set isActive = true and create toast container');
        this.isActive = true;
        this.createToastContainer();
        console.log('[Onboarding] About to call setupEventListeners');
        if (!this.listenersAttached) {
            this.setupEventListeners();
        } else {
            console.log('[Onboarding] Event listeners already attached, skipping setup');
        }
        console.log('[Onboarding] setupEventListeners completed');
        
        // Start with step 1 if requested (and after a short delay to ensure DOM is ready)
        if (showFirstStep) {
            // Try multiple times with increasing delays
            const tryShowStep = (attempt = 1) => {
                const caseFile = document.querySelector('.case-file');
                if (caseFile) {
                    this.showStep(1);
                } else if (attempt < 5) {
                    setTimeout(() => tryShowStep(attempt + 1), attempt * 500);
                } else {
                    // Show anyway - will use fallback positioning
                    this.showStep(1);
                }
            };
            
            setTimeout(() => {
                tryShowStep(1);
            }, 500);
        }
    },
    
    // Create toast container
    createToastContainer() {
        console.log('[Onboarding] Creating toast container');
        // Remove existing container if any
        const existing = document.getElementById('onboarding-toast-container');
        if (existing) {
            existing.remove();
        }
        
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'onboarding-toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(this.toastContainer);
        console.log('[Onboarding] Toast container created and added to body');
    },
    
    // Show a specific step
    showStep(stepNumber) {
        console.log('[Onboarding] showStep called for step', stepNumber, 'isActive:', this.isActive, 'completed:', this.completedSteps.has(stepNumber));
        if (!this.isActive) {
            console.log('[Onboarding] Not showing step', stepNumber, '- onboarding not active');
            return;
        }
        if (this.completedSteps.has(stepNumber)) {
            console.log('[Onboarding] Not showing step', stepNumber, '- already completed');
            return;
        }

        const message = this.messages.find(m => m.id === stepNumber);
        if (!message) {
            return;
        }
        
        // Remove any existing toast
        this.removeCurrentToast();
        
        // Ensure container exists
        if (!this.toastContainer) {
            this.createToastContainer();
        }
        
        // Create and show new toast
        const toast = this.createToast(message);
        this.toastContainer.appendChild(toast);
        
        // Position the toast
        this.positionToast(toast, message);
        
        // Force visibility immediately
        toast.style.opacity = '1';
        toast.style.transform = 'scale(1) translateY(0)';
        toast.style.display = 'block';
        toast.style.visibility = 'visible';
        
        // Also add show class for animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 50);
    },
    
    // Create toast element
    createToast(message) {
        const toast = document.createElement('div');
        toast.className = 'onboarding-toast';
        toast.dataset.step = message.id;
        toast.style.cssText = `
            position: fixed !important;
            background: linear-gradient(135deg, #fff9e6 0%, #fffef7 100%) !important;
            border: 3px solid #1d3557 !important;
            border-radius: 8px !important;
            padding: 20px !important;
            max-width: 350px !important;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.2) !important;
            font-family: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif !important;
            opacity: 0 !important;
            transform: scale(0.9) translateY(-10px) !important;
            transition: all 0.3s ease !important;
            pointer-events: auto !important;
            z-index: 10001 !important;
            display: block !important;
            visibility: visible !important;
        `;
        
        // Add Detective Conan character indicator
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 2px solid #1d3557;
        `;
        
        const icon = document.createElement('div');
        icon.textContent = '🔍';
        icon.style.cssText = `
            font-size: 24px;
            filter: drop-shadow(2px 2px 0 rgba(0,0,0,0.2));
        `;
        
        const title = document.createElement('div');
        title.textContent = message.title;
        title.style.cssText = `
            font-weight: 900;
            font-size: 16px;
            color: #1d3557;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-shadow: 1px 1px 0 rgba(0,0,0,0.1);
        `;
        
        header.appendChild(icon);
        header.appendChild(title);
        
        const body = document.createElement('div');
        body.textContent = message.message;
        body.style.cssText = `
            font-size: 15px;
            line-height: 1.6;
            color: #1a1a1a;
            margin-bottom: 15px;
        `;
        
        const footer = document.createElement('div');
        footer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid rgba(26,26,26,0.2);
        `;
        
        const stepIndicator = document.createElement('div');
        stepIndicator.textContent = `Step ${message.id} of ${this.messages.length}`;
        stepIndicator.style.cssText = `
            font-size: 12px;
            color: #4a4a4a;
            font-weight: 700;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✓ Got it!';
        closeBtn.style.cssText = `
            background: #1d3557;
            color: white;
            border: 2px solid #1d3557;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            text-transform: uppercase;
            font-family: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif;
            box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        `;
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.transform = 'translate(1px, 1px)';
            closeBtn.style.boxShadow = '1px 1px 0 rgba(0,0,0,0.2)';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.transform = 'translate(0, 0)';
            closeBtn.style.boxShadow = '2px 2px 0 rgba(0,0,0,0.2)';
        });
        
        closeBtn.addEventListener('click', () => {
            // Close the toast
            this.removeCurrentToast();

            // Check if this step has a UI element trigger
            const hasUITrigger = this.stepHasUITrigger(message.id);

            if (!hasUITrigger) {
                // No UI trigger, so advance to next step when "Got it" is clicked
                this.completeStep(message.id);
            }
            // If it has a UI trigger, don't advance - wait for the UI action
        });
        
        footer.appendChild(stepIndicator);
        footer.appendChild(closeBtn);
        
        toast.appendChild(header);
        toast.appendChild(body);
        toast.appendChild(footer);
        
        return toast;
    },
    
    // Position toast near target element
    positionToast(toast, message) {
        console.log('[Onboarding] Positioning toast for:', message.target, 'position:', message.position);
        const target = document.querySelector(message.target);
        console.log('[Onboarding] Target element found:', target);
        
        if (!target) {
            // Fallback to top-right corner - always visible
            toast.style.position = 'fixed';
            toast.style.top = '20px';
            toast.style.right = '20px';
            toast.style.left = 'auto';
            toast.style.bottom = 'auto';
            toast.style.transform = 'none';
            return;
        }
        
        const targetRect = target.getBoundingClientRect();
        
        // Get toast dimensions
        toast.style.visibility = 'hidden';
        toast.style.display = 'block';
        const toastRect = toast.getBoundingClientRect();
        toast.style.visibility = 'visible';
        
        const spacing = 20;
        let topPos, leftPos;
        
        switch (message.position) {
            case 'right':
                topPos = targetRect.top;
                leftPos = targetRect.right + spacing;
                break;
            case 'left':
                topPos = targetRect.top;
                leftPos = targetRect.left - toastRect.width - spacing;
                break;
            case 'top':
                topPos = targetRect.top - toastRect.height - spacing;
                leftPos = targetRect.left + (targetRect.width / 2) - (toastRect.width / 2);
                break;
            case 'bottom':
                topPos = targetRect.bottom + spacing;
                leftPos = targetRect.left + (targetRect.width / 2) - (toastRect.width / 2);
                break;
            default:
                topPos = targetRect.bottom + spacing;
                leftPos = targetRect.left;
        }
        
        // Ensure toast stays within viewport (using viewport coordinates, not scroll)
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust if off-screen
        if (leftPos + toastRect.width > viewportWidth) {
            leftPos = viewportWidth - toastRect.width - 20;
        }
        if (leftPos < 0) {
            leftPos = 20;
        }
        if (topPos + toastRect.height > viewportHeight) {
            topPos = viewportHeight - toastRect.height - 20;
        }
        if (topPos < 0) {
            topPos = 20;
        }
        
        // Set position using fixed positioning (no scroll offset needed)
        toast.style.position = 'fixed';
        toast.style.top = `${topPos}px`;
        toast.style.left = `${leftPos}px`;
        toast.style.right = 'auto';
        toast.style.bottom = 'auto';
        toast.style.transform = 'none';
    },
    
    // Remove current toast
    removeCurrentToast() {
        const existing = this.toastContainer.querySelector('.onboarding-toast');
        if (existing) {
            existing.classList.remove('show');
            setTimeout(() => {
                existing.remove();
            }, 300);
        }
    },
    
    // Check if a step has a UI element that can trigger it
    stepHasUITrigger(stepNumber) {
        // Steps that have UI triggers (don't need "Got it" to advance):
        // Step 1: Read case notes - NO UI trigger, needs "Got it"
        // Step 2: Click build query - YES, has button
        // Step 3: Click folder - YES, has folder click
        // Step 4: Drag column - YES, has drag action
        // Step 5: Show SQL explanation - NO UI trigger, needs "Got it" to continue
        // Step 6: Click next - YES, has next button
        // Step 7: Click add condition - YES, has add condition button
        // Step 8: Set condition - YES, condition inputs change
        // Step 9: Click execute - YES, has execute button
        // Step 10: See results - YES, results appear automatically

        const stepsWithUITriggers = [2, 3, 4, 6, 7, 8, 9, 10];
        return stepsWithUITriggers.includes(stepNumber);
    },
    
    // Complete a step and move to next
    completeStep(stepNumber) {
        console.log('[Onboarding] completeStep called for step', stepNumber, 'currentStep:', this.currentStep);
        if (this.completedSteps.has(stepNumber)) {
            console.log('[Onboarding] Step', stepNumber, 'already completed');
            return; // Prevent double completion
        }

        this.completedSteps.add(stepNumber);
        this.currentStep = stepNumber;

        if (stepNumber === 6 && this._setupConditionObservers) {
            this._setupConditionObservers();
            this._setupConditionObservers = null;
        }

        if (stepNumber === 8 && this._setupExecutionObservers) {
            this._setupExecutionObservers();
            this._setupExecutionObservers = null;
        }

        // Remove current toast
        this.removeCurrentToast();

        // If this was the last step, mark onboarding as complete
        if (stepNumber === this.messages.length) {
            this.completeOnboarding();
            return;
        }

        // Show next step after a short delay
        setTimeout(() => {
            this.showStep(stepNumber + 1);
        }, 500);
    },
    
    // Complete entire onboarding
    completeOnboarding() {
        this.isActive = false;
        this.step3Triggered = false; // Reset for next time
        this.step5Triggered = false; // Reset for next time
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('onboarding_started', 'true');
        this.removeCurrentToast();
        
        // Show completion message
        const completionToast = document.createElement('div');
        completionToast.className = 'onboarding-toast';
        completionToast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #fff9e6 0%, #fffef7 100%);
            border: 3px solid #1d3557;
            border-radius: 8px;
            padding: 30px;
            max-width: 400px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.2);
            font-family: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif;
            z-index: 10002;
            text-align: center;
        `;
        
        completionToast.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
            <div style="font-weight: 900; font-size: 20px; color: #1d3557; margin-bottom: 15px; text-transform: uppercase;">
                ONBOARDING COMPLETE!
            </div>
            <div style="font-size: 15px; line-height: 1.6; color: #1a1a1a; margin-bottom: 20px;">
                You've mastered the basics, Detective! You're now ready to solve more complex cases. Good luck with your investigations!
            </div>
            <button style="background: #1d3557; color: white; border: 2px solid #1d3557; padding: 10px 20px; border-radius: 4px; font-weight: 700; cursor: pointer; text-transform: uppercase; font-family: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif;">
                Continue Investigation
            </button>
        `;
        
        document.body.appendChild(completionToast);
        
        const button = completionToast.querySelector('button');
        button.addEventListener('click', () => {
            completionToast.remove();
        });
        
        setTimeout(() => {
            if (completionToast.parentNode) {
                completionToast.remove();
            }
        }, 5000);
    },
    
    // Setup event listeners to detect user actions
    setupEventListeners() {
        if (this.listenersAttached) {
            return;
        }
        this.listenersAttached = true;
        console.log('[Onboarding] Setting up event listeners at step:', this.currentStep);
        // Step 1: No UI trigger - will be advanced by "Got it" button
        // Removed timer-based detection - user clicks "Got it" to proceed
        
        // Step 2: Wait for query builder view to actually become visible and UI to be ready
        const queryBuilderView = document.getElementById('query-builder-view');
        if (queryBuilderView) {
            const checkQueryBuilderVisible = () => {
                if (this.currentStep === 1 || this.currentStep === 2) {
                    // Check if view is active AND has content loaded
                    const isActive = queryBuilderView.classList.contains('active');
                    const hasContent = queryBuilderView.querySelector('.database-files, .query-builder-body');
                    const isVisible = queryBuilderView.offsetParent !== null;
                    
                    if (isActive && hasContent && isVisible && !this.completedSteps.has(2)) {
                        // Wait a bit more for UI to fully render (tables, etc.)
                        setTimeout(() => {
                            if (queryBuilderView.classList.contains('active')) {
                                this.completeStep(2);
                            }
                        }, 1200);
                    }
                }
            };
            
            // Watch for class changes
            const observer = new MutationObserver(checkQueryBuilderVisible);
            observer.observe(queryBuilderView, { 
                attributes: true, 
                attributeFilter: ['class'],
                childList: true,
                subtree: true
            });
            
            // Also check on button click
            const buildQueryBtn = document.getElementById('open-query-builder-btn');
            if (buildQueryBtn) {
                buildQueryBtn.addEventListener('click', () => {
                    // Wait longer for view to switch and content to load
                    setTimeout(checkQueryBuilderVisible, 1500);
                });
            }
        }
        
        // Step 3: Wait for folder to actually expand and show columns
        const checkFolderExpanded = () => {
            console.log('[Onboarding] checkFolderExpanded called, currentStep:', this.currentStep);
            if (this.currentStep === 2 || this.currentStep === 3) {
                // Check if any table has expanded columns visible
                const expandedTables = document.querySelectorAll('.table-item.expanded, .table-item[aria-expanded="true"]');
                const visibleColumns = document.querySelectorAll('.table-item .column-item, .table-header + .column-list');
                console.log('[Onboarding] expandedTables:', expandedTables.length, 'visibleColumns:', visibleColumns.length);
                console.log('[Onboarding] completedSteps.has(3):', this.completedSteps.has(3), 'step3Triggered:', this.step3Triggered);
                if ((expandedTables.length > 0 || visibleColumns.length > 0) && !this.completedSteps.has(3) && !this.step3Triggered) {
                    console.log('[Onboarding] Step 3 conditions met - triggering completion');
                    this.step3Triggered = true; // Prevent multiple triggers
                    setTimeout(() => {
                        console.log('[Onboarding] Completing step 3 after delay');
                        if (!this.completedSteps.has(3)) { // Double check
                            this.completeStep(3);
                        } else {
                            console.log('[Onboarding] Step 3 already completed');
                        }
                    }, 500);
                } else {
                    console.log('[Onboarding] Step 3 conditions not met');
                    if (this.completedSteps.has(3)) console.log('  - already completed');
                    if (this.step3Triggered) console.log('  - already triggered');
                    if (expandedTables.length === 0 && visibleColumns.length === 0) console.log('  - no expanded tables or visible columns');
                }
            }
        };

        // Watch for table expansions using mutation observer (more reliable than click events)
        const observeTableExpansions = () => {
            const tableLists = document.querySelectorAll('.table-list, #inline-table-list, #modal-table-list, #table-list');
            tableLists.forEach((tableList) => {
                if (tableList && !tableList._expansionObserver) {
                    const observer = new MutationObserver((mutations) => {
                        if (window.onboarding && (window.onboarding.currentStep === 2 || window.onboarding.currentStep === 3)) {
                            mutations.forEach((mutation) => {
                                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                                    const target = mutation.target;
                                    if (target.classList.contains('table-item') && target.classList.contains('expanded')) {
                                        console.log('[Onboarding] Table expansion detected via mutation observer');
                                        setTimeout(() => {
                                            checkFolderExpanded();
                                        }, 100); // Shorter delay since we know expansion happened
                                    }
                                }
                            });
                        }
                    });

                    observer.observe(tableList, {
                        attributes: true,
                        subtree: true,
                        attributeFilter: ['class']
                    });

                    tableList._expansionObserver = observer;
                    console.log('[Onboarding] Expansion observer attached to table list');
                }
            });
        };

        // Setup expansion observers
        observeTableExpansions();


        // Also watch for Build Query button clicks to ensure step 4 setup happens
        const buildQueryBtn = document.getElementById('open-query-builder-btn');
        if (buildQueryBtn) {
            buildQueryBtn.addEventListener('click', () => {
                // Re-run step 4 setup in case containers weren't available initially
                setTimeout(() => {
                    const selectedLists = document.querySelectorAll('#selected-columns-list');
                    selectedLists.forEach((container) => {
                        if (!container._onboardingObserver) {
                            observeSelectedColumns(container);
                            container._onboardingObserver = true;
                        }
                    });
                }, 1000); // Wait for query builder to load
            });
        }
        
        // Step 4: Detect column drag (works for both modal and inline)
        const observeSelectedColumns = (container) => {
            if (!container) return;

            // The query builder already handles drop events, so we just observe for changes

            const observer = new MutationObserver((mutations) => {
                console.log('[Onboarding] Mutation detected on selected columns container, mutations:', mutations.length);
                // Be more lenient - allow triggering from any step after onboarding starts
                if (window.onboarding && window.onboarding.currentStep >= 2 && window.onboarding.isActive) {
                    const hasColumns = container.querySelector('.selected-column-item');
                    console.log('[Onboarding] Container has columns:', !!hasColumns, 'currentStep:', window.onboarding.currentStep, 'step 4 completed:', window.onboarding.completedSteps.has(4));
                    if (hasColumns && !window.onboarding.completedSteps.has(4)) {
                        console.log('[Onboarding] Completing step 4 from mutation observer');
                        setTimeout(() => {
                            if (window.onboarding) {
                                window.onboarding.completeStep(4);
                            }
                        }, 200);
                    }
                } else {
                    console.log('[Onboarding] Not triggering step 4 - current step:', window.onboarding?.currentStep, 'isActive:', window.onboarding?.isActive);
                }
            });
            observer.observe(container, { childList: true, subtree: true });
        };

        // Observe ALL selected-columns-list containers (both modal and inline)
        console.log('[Onboarding] Setting up step 4 detection');
        const selectedLists = document.querySelectorAll('#selected-columns-list');
        console.log('[Onboarding] Found', selectedLists.length, 'selected-columns-list containers');
        selectedLists.forEach((container, index) => {
            console.log('[Onboarding] Setting up observer for container', index, 'id:', container.id || 'none');
            observeSelectedColumns(container);
        });
        
        // Step 5: Detect SQL preview appearance (works for both modal and inline)
        const checkSQLPreview = () => {
            // Trigger when we're at step 4 or 5 (SQL preview appears after step 4 completes)
            if (this.currentStep === 4 || this.currentStep === 5) {
                const previews = document.querySelectorAll('.live-sql-preview');
                for (const preview of previews) {
                    if (preview && preview.offsetParent !== null && !this.completedSteps.has(5)) {
                        this.showStep(5); // show toast, don't complete it
                        return;
                    }
                }
            }
        };
        
        // Step 5 will be triggered directly from generateSQL when columns are selected
        // No need for mutation observers

        // Step 5 will be triggered by the "Got it" button on step 4
        // No auto-trigger needed
        
        // Step 6: Triggered by "next" button click
        // Use event delegation for next button and add condition button since direct listeners get removed
        const buttonHandler = (e) => {
            // Handle next button
            if (e.target.id === 'next-to-conditions-btn' || e.target.closest('#next-to-conditions-btn')) {
                console.log('[Onboarding] Next button clicked via delegation, currentStep:', this.currentStep, 'completedSteps:', Array.from(this.completedSteps));
                if (this.currentStep === 5 || this.currentStep === 6) {
                    console.log('[Onboarding] Next button clicked at correct step, completing step 6');
                    // Immediately advance when next button is clicked
                    if (!this.completedSteps.has(6)) {
                        console.log('[Onboarding] Calling completeStep(6)');
                        this.completeStep(6);
                    } else {
                        console.log('[Onboarding] Step 6 already completed');
                    }
                } else {
                    console.log('[Onboarding] Next button clicked but not at step 5 or 6, current step is', this.currentStep);
                }
            }

            // Handle add condition button - just check for conditions after a delay
            if (e.target.id === 'add-condition-btn' || e.target.closest('#add-condition-btn')) {
                console.log('[Onboarding] Add condition button clicked via delegation, currentStep:', this.currentStep);
                if (this.currentStep === 6 || this.currentStep === 7) {
                    console.log('[Onboarding] Add condition button clicked, checking for conditions in 1000ms');
                    setTimeout(() => {
                        console.log('[Onboarding] Checking for conditions after button click');
                        checkConditionAdded();
                    }, 1000);
                }
            }
        };

        document.addEventListener('click', buttonHandler);
        
        const setupConditionObservers = () => {
            if (this._conditionObserversActive) {
                return;
            }
            this._conditionObserversActive = true;
            // Step 7: Wait for condition item to actually appear in DOM
        const checkConditionAdded = () => {
            console.log('[Onboarding] checkConditionAdded called, currentStep:', this.currentStep);
            if (this.currentStep === 6 || this.currentStep === 7) {
                const conditionsList = document.getElementById('conditions-list');
                const list = conditionsList;
                console.log('[Onboarding] conditionsList found:', !!conditionsList);

                if (list) {
                    const conditionItems = list.querySelectorAll('.condition-item');
                    console.log('[Onboarding] Found condition items:', conditionItems.length);
                    conditionItems.forEach((item, index) => {
                        console.log(`[Onboarding] Condition item ${index}:`, item.tagName, item.className, item.textContent?.substring(0, 50));
                    });
                }

                if (list) {
                    const conditionItems = list.querySelectorAll('.condition-item');
                    console.log('[Onboarding] conditionItems found:', conditionItems.length, 'completedSteps.has(7):', this.completedSteps.has(7));
                    if (conditionItems.length > 0 && !this.completedSteps.has(7)) {
                        console.log('[Onboarding] Step 7 conditions met - completing step 7 in 800ms');
                        // Wait a bit for the condition item to be fully rendered
                        setTimeout(() => {
                            const finalCount = list.querySelectorAll('.condition-item').length;
                            console.log('[Onboarding] Final condition check - items:', finalCount);
                            if (finalCount > 0) {
                                console.log('[Onboarding] Completing step 7');
                                this.completeStep(7);
                            } else {
                                console.log('[Onboarding] No conditions found in final check');
                            }
                        }, 800);
                    } else {
                        console.log('[Onboarding] Step 7 conditions not met');
                        if (conditionItems.length === 0) console.log('  - no condition items found');
                        if (this.completedSteps.has(7)) console.log('  - step 7 already completed');
                    }
                } else {
                    console.log('[Onboarding] No conditions list found');
                }
            } else {
                console.log('[Onboarding] Not at step 6 or 7, skipping checkConditionAdded');
            }
        };
        
        const setupAddConditionButton = (btn) => {
            if (!btn) {
                console.log('[Onboarding] Add condition button not found for setup');
                return;
            }
            console.log('[Onboarding] Setting up add condition button listener for step 7, button found:', btn.id || 'inline button');
            btn.addEventListener('click', () => {
                console.log('[Onboarding] Add condition button clicked, currentStep:', this.currentStep);
                if (this.currentStep === 6 || this.currentStep === 7) {
                    console.log('[Onboarding] Add condition button clicked at correct step, checking for condition in 1000ms');
                    // Wait longer for condition to be added to DOM
                    setTimeout(() => {
                        console.log('[Onboarding] Calling checkConditionAdded after button click delay');
                        checkConditionAdded();
                    }, 1000);
                } else {
                    console.log('[Onboarding] Add condition button clicked but not at step 6 or 7');
                }
            });
        };

        const mainAddBtn = document.getElementById('add-condition-btn');

        console.log('[Onboarding] Looking for add condition button - main:', !!mainAddBtn);

        setupAddConditionButton(mainAddBtn);
        
        // Watch for condition items being added
        const conditionsList = document.getElementById('conditions-list');
        console.log('[Onboarding] Setting up condition addition observer for step 7, conditionsList found:', !!conditionsList);
        if (conditionsList) {
            const conditionsObserver = new MutationObserver((mutations) => {
                console.log('[Onboarding] Conditions list mutation detected:', mutations.length, 'mutations');
                let hasNewCondition = false;
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        console.log('[Onboarding] Child nodes added to conditions list:', mutation.addedNodes.length);
                        mutation.addedNodes.forEach((node) => {
                            console.log('[Onboarding] Added node:', node.tagName, node.className);
                            if (node.classList && node.classList.contains('condition-item')) {
                                hasNewCondition = true;
                            }
                        });
                    }
                });
                if (hasNewCondition) {
                    console.log('[Onboarding] New condition item detected, checking in 500ms');
                    setTimeout(() => checkConditionAdded(), 500);
                }
            });
            conditionsObserver.observe(conditionsList, { childList: true, subtree: true });
            console.log('[Onboarding] Condition addition observer attached');
        }
        
        // Step 8: Detect condition being set
        const checkConditionSet = () => {
            console.log('[Onboarding] checkConditionSet called, currentStep:', this.currentStep);
            if (this.currentStep === 7 || this.currentStep === 8) {
                console.log('[Onboarding] Checking condition set for step 8');
                const conditionsList = document.getElementById('conditions-list');
                const list = conditionsList;
                console.log('[Onboarding] Checking conditions, list found:', !!list);

                if (list) {
                    const conditionItems = list.querySelectorAll('.condition-item');
                    console.log('[Onboarding] Found condition items for step 8 check:', conditionItems.length);

                    for (const item of conditionItems) {
                        console.log('[Onboarding] Checking condition item:', item.id || 'no-id');

                        // Find column select (first select, or one that has a value with a dot like "case_files.case_id")
                        const selects = item.querySelectorAll('select');
                        console.log('[Onboarding] Found selects in condition item:', selects.length);

                        let columnSelect = null;
                        for (const sel of selects) {
                            // Column selects have values like "case_files.case_id" (with a dot)
                            if (sel.value && sel.value.includes('.')) {
                                columnSelect = sel;
                                break;
                            }
                        }
                        // Fallback: if no select with dot found, use first select
                        if (!columnSelect && selects.length > 0) {
                            columnSelect = selects[0];
                            console.log('[Onboarding] Using fallback column select, value:', columnSelect.value);
                        }

                        // Find value input
                        const valueInput = item.querySelector('input[type="text"]');
                        console.log('[Onboarding] Column select found:', !!columnSelect, 'value:', columnSelect?.value);
                        console.log('[Onboarding] Value input found:', !!valueInput, 'value:', valueInput?.value);

                        // Check if both column and value are set
                        const columnSet = columnSelect && columnSelect.value && columnSelect.value.trim() !== '';
                        const valueSet = valueInput && valueInput.value && valueInput.value.trim() !== '';
                        const notCompleted = !this.completedSteps.has(8);

                        console.log('[Onboarding] Column set:', columnSet, 'Value set:', valueSet, 'Not completed:', notCompleted);

                        if (columnSet && valueSet && notCompleted) {
                            console.log('[Onboarding] Step 8 conditions met - completing immediately');
                            this.completeStep(8);
                            return; // Only complete once
                        } else if (!notCompleted) {
                            console.log('[Onboarding] Step 8 already completed');
                        } else {
                            console.log('[Onboarding] Step 8 conditions not met yet - missing:', columnSet ? '' : 'column ', valueSet ? '' : 'value');
                        }
                    }
                } else {
                    console.log('[Onboarding] Conditions list not found');
                }
            } else {
                console.log('[Onboarding] Not checking condition set - currentStep is', this.currentStep, 'not 7 or 8');
            }
        };
        
        const observeConditions = (container) => {
            if (!container) return;
            
            // Watch for DOM changes
            const conditionObserver = new MutationObserver(checkConditionSet);
            conditionObserver.observe(container, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['value']
            });
            
            // Listen for input and change events on the container and its children
            container.addEventListener('change', (e) => {
                if (e.target.matches('select, input[type="text"]')) {
                    setTimeout(checkConditionSet, 200);
                }
            }, true); // Use capture phase to catch all events

            container.addEventListener('input', (e) => {
                if (e.target.matches('input[type="text"]')) {
                    setTimeout(checkConditionSet, 200);
                }
            }, true); // Use capture phase to catch all events
        };
        
        // Check both modal and inline versions
        const conditionsListForStep8 = document.getElementById('conditions-list');
        console.log('[Onboarding] Setting up condition change detection for step 8, conditionsList found:', !!conditionsListForStep8);
        if (conditionsListForStep8) {
            observeConditions(conditionsListForStep8);
        }

        // Global listeners as fallback for step 8
        document.addEventListener('change', (e) => {
            if (e.target.matches('select, input[type="text"]') && (this.currentStep === 7 || this.currentStep === 8)) {
                setTimeout(checkConditionSet, 200);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="text"]') && (this.currentStep === 7 || this.currentStep === 8)) {
                setTimeout(checkConditionSet, 200);
            }
        });
        
        // Periodic check for step 8 completion as fallback
        const step8CheckInterval = setInterval(() => {
            if (this.currentStep === 7 || this.currentStep === 8) {
                checkConditionSet();
            } else if (this.completedSteps.has(8)) {
                clearInterval(step8CheckInterval);
            }
        }, 1000); // Check every second
        };

        if (this.currentStep >= 6) {
            setupConditionObservers();
        } else {
            this._setupConditionObservers = setupConditionObservers;
        }

        const setupExecutionObservers = () => {
            if (this._executionObserversActive) {
                return;
            }
            this._executionObserversActive = true;

        // Get results container element (declare once in outer scope)
        const resultsContainer = document.getElementById('results-container');
        
        // Step 9: Wait for query to actually execute and results to appear
        const checkQueryExecuted = () => {
            if (this.currentStep === 8 || this.currentStep === 9) {
                // Complete step 9 immediately when execute is clicked
                if (!this.completedSteps.has(9)) {
                    this.completeStep(9);
                }
            }
        };
        
        const setupExecuteButton = (btn) => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (this.currentStep === 8 || this.currentStep === 9) {
                    // Wait for results to appear
                    setTimeout(checkQueryExecuted, 500);
                }
            });
        };
        
        setupExecuteButton(document.getElementById('execute-query-btn'));
        const inlinePanelForExecute = document.getElementById('inline-visual-panel');
        if (inlinePanelForExecute) {
            setupExecuteButton(inlinePanelForExecute.querySelector('#execute-query-btn'));
        }
        
        // Watch for results container changes
        if (resultsContainer) {
            const resultsObserver = new MutationObserver(checkQueryExecuted);
            resultsObserver.observe(resultsContainer, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
        }
        
        // Step 10: Detect results display
        const checkResults = () => {
            if (this.currentStep === 9 || this.currentStep === 10) {
                // Use outer scope variables
                if (resultsContainer && resultsContainer.style.display !== 'none' && 
                    evidenceBoard && evidenceBoard.classList.contains('active') && 
                    !this.completedSteps.has(10)) {
                    this.completeStep(10);
                }
            }
        };
        
        // Get evidence board element (declare once in outer scope)
        const evidenceBoard = document.getElementById('evidence-board-view');
        
        // Watch for results container changes (reuse resultsContainer from step 9)
        if (resultsContainer) {
            const resultsObserverStep10 = new MutationObserver(checkResults);
            resultsObserverStep10.observe(resultsContainer, { 
                childList: true, 
                subtree: true,
                attributes: true, 
                attributeFilter: ['style'] 
            });
        }
        
        // Also watch evidence board view changes
        if (evidenceBoard) {
            const evidenceObserver = new MutationObserver(checkResults);
            evidenceObserver.observe(evidenceBoard, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
        };

        if (this.currentStep >= 8) {
            setupExecutionObservers();
        } else {
            this._setupExecutionObservers = setupExecutionObservers;
        }
    }
};

// Add CSS for toast animations
const onboardingStyle = document.createElement('style');
onboardingStyle.id = 'onboarding-styles';
onboardingStyle.textContent = `
    .onboarding-toast.show {
        opacity: 1 !important;
        transform: scale(1) translateY(0) !important;
    }
    
    .onboarding-toast {
        animation: toastPulse 2s ease-in-out infinite;
    }
    
    @keyframes toastPulse {
        0%, 100% {
            box-shadow: 0 8px 16px rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.2);
        }
        50% {
            box-shadow: 0 8px 16px rgba(29, 53, 87, 0.4), 4px 4px 0 rgba(29, 53, 87, 0.3);
        }
    }
    
    #onboarding-toast-container {
        position: fixed !important;
        z-index: 10000 !important;
        pointer-events: none !important;
    }
`;
// Only add if not already added
if (!document.getElementById('onboarding-styles')) {
    document.head.appendChild(onboardingStyle);
}

// Export onboarding object to window
window.onboarding = onboarding;
console.log('[Onboarding] Onboarding object exported to window');

// Define utility functions directly on window
window.testOnboarding = function() {
    console.log('[Onboarding] testOnboarding called');
    if (window.onboarding) {
        window.onboarding.createToastContainer();
        window.onboarding.isActive = true;
        window.onboarding.showStep(1);
        console.log('[Onboarding] testOnboarding completed');
    } else {
        console.log('[Onboarding] onboarding object not found');
    }
};

window.resetOnboarding = function() {
    console.log('[Onboarding] resetOnboarding called');
    if (window.onboarding && window.onboarding.reset) {
        return window.onboarding.reset();
    }
    console.log('[Onboarding] resetOnboarding completed');
};

window.triggerStep = function(stepNumber) {
    console.log('[Onboarding] triggerStep called with', stepNumber);
    if (window.onboarding && window.onboarding.showStep) {
        window.onboarding.showStep(stepNumber);
    } else {
        console.log('[Onboarding] onboarding.showStep not available');
    }
};

// Simple debug test
window.testOnboardingState = function() {
    alert('Onboarding currentStep: ' + (window.onboarding ? window.onboarding.currentStep : 'undefined'));
    alert('Onboarding isActive: ' + (window.onboarding ? window.onboarding.isActive : 'undefined'));
    alert('Onboarding step3Triggered: ' + (window.onboarding ? window.onboarding.step3Triggered : 'undefined'));
    return 'Test complete';
};

window.debugOnboarding = function() {
    const state = '=== ONBOARDING DEBUG ===\n' +
          'onboarding exists: ' + !!window.onboarding + '\n' +
          'currentStep: ' + (window.onboarding ? window.onboarding.currentStep : 'N/A') + '\n' +
          'isActive: ' + (window.onboarding ? window.onboarding.isActive : 'N/A') + '\n' +
          'step3Triggered: ' + (window.onboarding ? window.onboarding.step3Triggered : 'N/A') + '\n' +
          'completedSteps: ' + (window.onboarding && window.onboarding.completedSteps ? Array.from(window.onboarding.completedSteps).join(', ') : 'none');

    console.log(state);
    return 'Debug complete - check console';
};

// Manual step advancement for testing
window.advanceOnboarding = function(stepNumber) {
    if (window.onboarding && window.onboarding.showStep) {
        alert('Manually showing step ' + stepNumber);
        window.onboarding.showStep(stepNumber);
    } else {
        alert('Onboarding not available');
    }
};

window.forceStartOnboarding = function() {
    console.log('[Onboarding] forceStartOnboarding called');
    if (window.onboarding && typeof window.onboarding.init === 'function') {
        try {
            window.onboarding.init(true);
            console.log('[Onboarding] forceStartOnboarding succeeded');
        } catch (error) {
            console.error('[Onboarding] Error in forceStartOnboarding:', error);
        }
    } else {
        console.log('[Onboarding] onboarding.init not available');
    }
};

console.log('[Onboarding] All utility functions defined on window');

// IMPORTANT: onboarding is started explicitly from main.js.
// Disable fallback auto-init to prevent duplicate listeners.
// initOnboarding();
