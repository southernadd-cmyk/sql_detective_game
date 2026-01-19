// Main application entry point
let database = null;

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
        initUI();
        renderTables();
        
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
        alert('Failed to load the game. Please refresh the page.');
    }
}

// Setup query execution
function setupQueryExecution() {
    // This is handled by queryEditor.js for the SQL editor
    // and we'll add a global runQuery function here
}

// Run SQL query
function runQuery(query) {
    if (!database) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }
    
    if (!query || !query.trim()) {
        alert('Please enter a SQL query.');
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
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
            return;
        }
    }
    
    if (startBtn && landingPage && mainGame) {
        startBtn.addEventListener('click', () => {
            // Hide landing page
            landingPage.style.display = 'none';
            // Show main game
            mainGame.style.display = 'block';
            // Initialize the game
            init();
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
    document.addEventListener('DOMContentLoaded', setupLandingPage);
} else {
    setupLandingPage();
}
