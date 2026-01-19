// Query History System - Track successful queries for evidence board
let queryHistory = [];

// Initialize query history from localStorage
function initQueryHistory() {
    try {
        const saved = localStorage.getItem('sql-detective-query-history');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Only load if it's actually an array with data
            if (Array.isArray(parsed) && parsed.length > 0) {
                queryHistory = parsed;
                console.log(`Loaded ${queryHistory.length} queries from localStorage`);
            } else {
                queryHistory = [];
                // If it's empty or invalid, remove it
                localStorage.removeItem('sql-detective-query-history');
            }
        } else {
            queryHistory = [];
        }
    } catch (error) {
        console.warn('Could not load query history:', error);
        queryHistory = [];
        // If there's corrupted data, remove it
        try {
            localStorage.removeItem('sql-detective-query-history');
        } catch (e) {
            // Ignore
        }
    }
}

// Save query history to localStorage
function saveQueryHistory() {
    try {
        localStorage.setItem('sql-detective-query-history', JSON.stringify(queryHistory));
    } catch (error) {
        console.warn('Could not save query history:', error);
    }
}

// Add a successful query to history
function addQueryToHistory(query, result, caseId = null, taskTitle = null) {
    // Check if query already exists (avoid duplicates)
    const exists = queryHistory.some(q => q.query === query && q.caseId === caseId);
    if (exists) {
        return;
    }
    
    const queryEntry = {
        id: Date.now() + Math.random(), // Unique ID
        query: query,
        result: result,
        caseId: caseId || (window.caseSystem ? window.caseSystem.getCurrentCase()?.id : null),
        taskTitle: taskTitle || (window.caseSystem ? window.caseSystem.getCurrentCase()?.title : 'Unknown Task'),
        timestamp: new Date().toISOString(),
        rowCount: result?.result?.[0]?.values?.length || 0
    };
    
    queryHistory.push(queryEntry);
    saveQueryHistory();
    
    // Force update evidence board display immediately
    setTimeout(() => {
        if (window.updateEvidenceBoard) {
            window.updateEvidenceBoard();
        }
    }, 100);
}

// Get all queries for a specific case
function getQueriesForCase(caseId) {
    return queryHistory.filter(q => q.caseId === caseId);
}

// Get all queries
function getAllQueries() {
    return queryHistory;
}

// Clear query history
function clearQueryHistory() {
    // Clear in-memory array
    queryHistory = [];
    
    // Actually remove from localStorage, not just overwrite
    try {
        localStorage.removeItem('sql-detective-query-history');
        
        // Verify it's actually gone
        const stillExists = localStorage.getItem('sql-detective-query-history');
        if (stillExists) {
            console.warn('Query history still exists after removal, forcing clear');
            localStorage.removeItem('sql-detective-query-history');
        }
        
        console.log('Query history cleared from localStorage and memory');
    } catch (error) {
        console.warn('Could not clear query history from localStorage:', error);
    }
    
    // Update evidence board to show empty state
    if (window.updateEvidenceBoard) {
        window.updateEvidenceBoard();
    }
}

// Initialize on load
if (typeof window !== 'undefined') {
    initQueryHistory();
    
    // Make functions globally available
    window.queryHistory = {
        add: addQueryToHistory,
        getAll: getAllQueries,
        getForCase: getQueriesForCase,
        clear: clearQueryHistory,
        init: initQueryHistory,
        // Expose direct access to the array for hard reset
        _clearArray: function() {
            queryHistory = [];
        },
        _getArray: function() {
            return queryHistory;
        }
    };
}
