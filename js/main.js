// Main application entry point
let database = null;

// Test if onboarding script loaded
console.log('[Main] Script loading, checking onboarding...');
setTimeout(() => {
    console.log('[Main] Delayed check - window.onboarding:', window.onboarding);
    if (window.onboarding) {
        console.log('[Main] Onboarding object found!', Object.keys(window.onboarding));
    } else {
        console.error('[Main] Onboarding object NOT found!');
    }
}, 100);

// Initialize application
async function init() {
    try {
        // Show loading message
        console.log('Initializing SQL Detective Game...');
        
        // Ensure case system progress is loaded BEFORE anything else
        if (typeof window.caseSystem !== 'undefined' && window.caseSystem.loadProgress) {
            window.caseSystem.loadProgress();
            console.log('Case progress loaded. Current case index:', window.caseSystem.currentCaseIndex);
            console.log('Completed cases:', Array.from(window.caseSystem.completedCases));
        }
        
        // Initialize database
        database = await initDatabase();
        console.log('Database ready!');
        
        // Initialize UI
        if (window.initUI) {
            window.initUI();
        } else {
            console.error('initUI not found. Make sure ui.js is loaded.');
        }
        if (window.renderTables) {
            window.renderTables();
        }
        
        // Initialize query history
        if (window.queryHistory && window.queryHistory.init) {
            window.queryHistory.init();
        }
        
        // Update evidence board
        if (window.updateEvidenceBoard) {
            window.updateEvidenceBoard();
        }
        
        // Update case display (after progress is loaded)
        if (window.updateCaseDisplay) {
            window.updateCaseDisplay();
        }
        
        // Initialize accessible query builder first (if available)
        if (window.initAccessibleQueryBuilder) {
            window.initAccessibleQueryBuilder();
        }
        
        // Initialize query editor
        initQueryEditor();
        
        // Initialize visualizations
        if (window.initVisualizations) {
            window.initVisualizations();
        }
        
        // Setup query execution
        setupQueryExecution();
        
        // Make functions globally available
        window.runQuery = runQuery;
        window.checkForClues = checkForClues;
        window.getClueCount = getClueCount;
        window.getDiscoveredClues = getDiscoveredClues;
        window.makeTableDraggable = makeTableDraggable;
        window.makeColumnDraggable = makeColumnDraggable;
        window.makeStarDraggable = makeStarDraggable;
        
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        if (window.toast) {
            window.toast.error('Failed to load the game. Please refresh the page.', 5000);
        } else {
            alert('Failed to load the game. Please refresh the page.');
        }
    }
    
    // Return promise for chaining
    return Promise.resolve();
}

// Setup query execution
function setupQueryExecution() {
    // This is handled by queryEditor.js for the SQL editor
    // and we'll add a global runQuery function here
}

// Run SQL query
function runQuery(query) {
    if (!database) {
        if (window.toast) {
            window.toast.error('Database not initialized. Please refresh the page.', 5000);
        } else {
            alert('Database not initialized. Please refresh the page.');
        }
        return;
    }
    
    if (!query || !query.trim()) {
        if (window.toast) {
            window.toast.warning('Please enter a SQL query.', 3000);
        } else {
            alert('Please enter a SQL query.');
        }
        return;
    }
    
    // Execute query (using function from database.js)
    const result = window.executeQuery ? window.executeQuery(query) : executeQuery(query);
    
    // Display results (includes case validation)
    if (window.displayResults) {
        window.displayResults(query, result);
    }
}

// Handle landing page start button
function setupLandingPage() {
    const startBtn = document.getElementById('start-game-btn');
    const landingPage = document.getElementById('landing-page');
    const mainGame = document.getElementById('main-game');
    
    // Check if user has progress - if so, skip landing page
    if (typeof window.caseSystem !== 'undefined' && window.caseSystem.loadProgress) {
        window.caseSystem.loadProgress();
        const hasProgress = window.caseSystem.completedCases.size > 0 || window.caseSystem.currentCaseIndex > 0;
        
        if (hasProgress && landingPage && mainGame) {
            // User has progress, skip landing page and go straight to game
            landingPage.style.display = 'none';
            mainGame.style.display = 'block';
            // Initialize the game (which will load progress again, but that's fine)
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
            init().then(() => {
                // Onboarding will now be triggered when case image modal closes
            });
                });
            } else {
                init().then(() => {
                    // Onboarding will now be triggered when case image modal closes
                });
            }
            return;
        }
    }
    
    if (startBtn && landingPage && mainGame) {
        startBtn.addEventListener('click', () => {
            console.log('[Main] Start button clicked');
            console.log('[Main] window.onboarding:', window.onboarding);
            // Hide landing page
            landingPage.style.display = 'none';
            // Show main game
            mainGame.style.display = 'block';
            // Initialize the game
            init().then(() => {
                // Onboarding will now be triggered when case image modal closes
            }).catch((error) => {
                if (window.toast) {
                    window.toast.error('Error initializing game: ' + error.message, 5000);
                } else {
                    alert('Error initializing game: ' + error.message);
                }
            });
        });
    } else {
        // If landing page elements don't exist, just start the game normally
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
}

// Setup landing page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[Main] DOMContentLoaded, setting up landing page');
        console.log('[Main] window.onboarding at DOMContentLoaded:', window.onboarding);
        setupLandingPage();
    });
} else {
    console.log('[Main] DOM already ready, setting up landing page');
    console.log('[Main] window.onboarding:', window.onboarding);
    setupLandingPage();
}
