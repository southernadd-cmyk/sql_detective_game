// Game logic, clue detection, and story progression
let discoveredClues = new Set();
let gameState = {
    cluesFound: 0,
    storyProgress: 0,
    solved: false
};

// Clue definitions - queries that reveal important information
const clues = [
    {
        id: 'suspects_list',
        description: 'Discovered list of suspects',
        query: 'SELECT * FROM suspects',
        check: (result) => result && result.length > 0
    },
    {
        id: 'timeline_start',
        description: 'Found activity timeline',
        query: 'SELECT * FROM time_logs ORDER BY timestamp',
        check: (result) => result && result.length > 0
    },
    {
        id: 'high_suspicion',
        description: 'Identified most suspicious person',
        query: 'SELECT name, suspicion FROM suspects ORDER BY suspicion DESC LIMIT 1',
        check: (result) => {
            if (!result || result.length === 0) return false;
            const topSuspect = result[0].values[0];
            return topSuspect && topSuspect[1] >= 4;
        }
    },
    {
        id: 'cctv_evidence',
        description: 'Found key evidence items',
        query: 'SELECT * FROM evidence WHERE is_key = 1',
        check: (result) => result && result.length > 0
    },
    {
        id: 'witness_statements',
        description: 'Collected witness statements',
        query: 'SELECT * FROM witness_statements',
        check: (result) => result && result.length > 0
    },
    {
        id: 'suspect_timeline',
        description: 'Connected cases to evidence timeline',
        query: 'SELECT cf.case_title, e.item, e.time_found FROM case_files cf JOIN evidence e ON cf.case_id = e.case_id',
        check: (result) => result && result.length > 0
    },
    {
        id: 'location_analysis',
        description: 'Analyzed locations near crime scene',
        query: 'SELECT l.location_name, COUNT(*) as events FROM time_logs t JOIN locations l ON t.location_code = l.location_code GROUP BY l.location_name',
        check: (result) => result && result.length > 0
    },
    {
        id: 'motive_found',
        description: 'Found strong motive',
        query: 'SELECT name, motive_hint FROM suspects WHERE suspicion >= 4',
        check: (result) => result && result.length > 0
    }
];

// Check if query reveals a clue
function checkForClues(query, result) {
    if (!result || !result.success || !result.result || result.result.length === 0) {
        return;
    }
    
    clues.forEach(clue => {
        if (!discoveredClues.has(clue.id)) {
            // Simple check - see if the query matches the clue pattern
            const queryNormalized = query.toLowerCase().replace(/\s+/g, ' ');
            const clueQueryNormalized = clue.query.toLowerCase().replace(/\s+/g, ' ');
            
            // Check if queries are similar (allowing for variations)
            if (isQuerySimilar(queryNormalized, clueQueryNormalized)) {
                // Verify the result matches clue criteria
                if (clue.check(result.result)) {
                    discoverClue(clue);
                }
            }
        }
    });
}

// Simple query similarity check
function isQuerySimilar(query1, query2) {
    const normalizeSql = (q) => q.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedQuery = normalizeSql(query1);
    const normalizedClue = normalizeSql(query2);

    const extractQueryParts = (q) => {
        return {
            select: q.match(/select\s+(.+?)\s+from\s+/i)?.[1] || '',
            from: q.match(/from\s+([a-z_][\w]*)/i)?.[1] || '',
            joins: Array.from(q.matchAll(/join\s+([a-z_][\w]*)/gi)).map(match => match[1]),
            where: q.match(/where\s+(.+?)(?:\s+group|\s+order|\s+limit|;|$)/i)?.[1] || '',
            groupBy: q.match(/group\s+by\s+(.+?)(?:\s+order|\s+limit|;|$)/i)?.[1] || '',
            orderBy: q.match(/order\s+by\s+(.+?)(?:\s+limit|;|$)/i)?.[1] || ''
        };
    };

    const normalizeColumn = (col) => col.replace(/[`"'"]/g, '').trim().toLowerCase();
    const getBaseColumn = (col) => {
        const parts = normalizeColumn(col).split('.');
        return parts[parts.length - 1];
    };

    const parseSelectColumns = (selectPart) => {
        if (!selectPart) return [];
        return selectPart.split(',').map(part => {
            const trimmed = part.trim();
            const withoutAlias = trimmed.split(/\s+as\s+/i)[0].trim();
            return withoutAlias;
        });
    };

    const extractColumnRefs = (clause) => {
        if (!clause) return [];
        const keywords = new Set([
            'select', 'from', 'where', 'join', 'on', 'and', 'or', 'group', 'by',
            'order', 'limit', 'asc', 'desc', 'inner', 'left', 'right', 'outer',
            'is', 'null', 'like', 'in', 'between', 'distinct', 'count', 'sum',
            'avg', 'min', 'max'
        ]);
        const matches = clause.match(/[a-z_][\w]*(?:\.[a-z_][\w]*)?/gi) || [];
        return matches.filter(token => !keywords.has(token));
    };

    const clauseHasRequiredColumns = (queryClause, clueClause) => {
        if (!clueClause) return true;
        if (!queryClause) return false;
        const queryCols = extractColumnRefs(queryClause).map(getBaseColumn);
        const clueCols = extractColumnRefs(clueClause).map(getBaseColumn);
        return clueCols.every(col => queryCols.includes(col));
    };

    const queryParts = extractQueryParts(normalizedQuery);
    const clueParts = extractQueryParts(normalizedClue);

    if (!queryParts.from || !clueParts.from || queryParts.from !== clueParts.from) {
        return false;
    }

    const queryJoins = new Set(queryParts.joins);
    const clueJoins = new Set(clueParts.joins);
    for (const joinTable of clueJoins) {
        if (!queryJoins.has(joinTable)) {
            return false;
        }
    }

    const querySelectCols = parseSelectColumns(queryParts.select);
    const clueSelectCols = parseSelectColumns(clueParts.select);
    const queryHasStar = querySelectCols.some(col => normalizeColumn(col) === '*');
    if (!queryHasStar && clueSelectCols.length > 0) {
        const queryBaseCols = querySelectCols.map(getBaseColumn);
        const clueBaseCols = clueSelectCols.map(getBaseColumn);
        const selectsMatch = clueBaseCols.every(col => queryBaseCols.includes(col));
        if (!selectsMatch) {
            return false;
        }
    }

    if (!clauseHasRequiredColumns(queryParts.where, clueParts.where)) {
        return false;
    }
    if (!clauseHasRequiredColumns(queryParts.groupBy, clueParts.groupBy)) {
        return false;
    }
    if (!clauseHasRequiredColumns(queryParts.orderBy, clueParts.orderBy)) {
        return false;
    }

    return true;
}

// Discover a clue
function discoverClue(clue) {
    if (!discoveredClues.has(clue.id)) {
        discoveredClues.add(clue.id);
        gameState.cluesFound++;
        
        // Update UI
        if (window.updateClueDisplay) {
            window.updateClueDisplay();
        }
        
        // Show clue notification
        showClueNotification(clue.description);
        
        // Check if mystery is solved
        checkMysterySolved();
    }
}

// Show clue notification
function showClueNotification(description) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'clue-notification';
    notification.textContent = `🔍 Clue Discovered: ${description}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Check if mystery is solved
function checkMysterySolved() {
    // Mystery is solved when key clues are found
    const keyClues = ['high_suspicion', 'suspect_timeline', 'cctv_evidence', 'motive_found'];
    const foundKeyClues = keyClues.filter(id => discoveredClues.has(id));
    
    if (foundKeyClues.length >= 3 && !gameState.solved) {
        gameState.solved = true;
        showSolution();
    }
}

// Show solution
function showSolution() {
    const solution = document.createElement('div');
    solution.className = 'solution-modal';
    solution.innerHTML = `
        <div class="solution-content">
            <h2>🎉 Mystery Solved!</h2>
            <p>Based on your investigation, you've identified the culprit!</p>
            <p><strong>Sarah Mitchell</strong> is the most likely suspect based on:</p>
            <ul>
                <li>Highest suspicious level (9/10)</li>
                <li>Strong motive (Failed SQL exam)</li>
                <li>Seen leaving library near the time of the crime</li>
                <li>CCTV footage shows her in the area</li>
            </ul>
            <p>Great detective work! You've successfully used SQL to solve the case!</p>
            <button onclick="this.closest('.solution-modal').remove()">Close</button>
        </div>
    `;
    solution.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
    `;
    solution.querySelector('.solution-content').style.cssText = `
        background: var(--bg-medium);
        padding: 40px;
        border-radius: 15px;
        max-width: 600px;
        text-align: center;
    `;
    document.body.appendChild(solution);
}

// Get discovered clues count
function getClueCount() {
    return discoveredClues.size;
}

// Get all discovered clues
function getDiscoveredClues() {
    return Array.from(discoveredClues).map(id => {
        return clues.find(c => c.id === id);
    }).filter(Boolean);
}

// Reset game
function resetGame() {
    discoveredClues.clear();
    gameState = {
        cluesFound: 0,
        storyProgress: 0,
        solved: false
    };
}
