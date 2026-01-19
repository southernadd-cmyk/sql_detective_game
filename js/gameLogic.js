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
        description: 'Found timeline of events',
        query: 'SELECT * FROM timeline ORDER BY timestamp',
        check: (result) => result && result.length > 0
    },
    {
        id: 'high_suspicion',
        description: 'Identified most suspicious person',
        query: 'SELECT name, suspicious_level FROM suspects ORDER BY suspicious_level DESC LIMIT 1',
        check: (result) => {
            if (!result || result.length === 0) return false;
            const topSuspect = result[0].values[0];
            return topSuspect && topSuspect[1] >= 8;
        }
    },
    {
        id: 'cctv_evidence',
        description: 'Found CCTV footage near crime scene',
        query: 'SELECT * FROM cctv WHERE location_id = 1',
        check: (result) => result && result.length > 0
    },
    {
        id: 'witness_statements',
        description: 'Collected witness statements',
        query: 'SELECT * FROM witnesses',
        check: (result) => result && result.length > 0
    },
    {
        id: 'suspect_timeline',
        description: 'Connected suspect to timeline events',
        query: 'SELECT s.name, t.event_description, t.timestamp FROM timeline t JOIN suspects s ON t.suspect_id = s.id',
        check: (result) => result && result.length > 0
    },
    {
        id: 'location_analysis',
        description: 'Analyzed locations near crime scene',
        query: 'SELECT l.name, COUNT(t.id) as events FROM locations l LEFT JOIN timeline t ON l.id = t.location_id GROUP BY l.name',
        check: (result) => result && result.length > 0
    },
    {
        id: 'motive_found',
        description: 'Found strong motive',
        query: 'SELECT name, motive FROM suspects WHERE suspicious_level >= 7',
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
    // Extract key parts (SELECT, FROM, WHERE, etc.)
    const extractKeyParts = (q) => {
        const parts = {
            select: q.match(/select\s+([^from]+)/i)?.[1] || '',
            from: q.match(/from\s+(\w+)/i)?.[1] || '',
            where: q.match(/where\s+(.+?)(?:\s+order|\s+group|;|$)/i)?.[1] || '',
            order: q.match(/order\s+by\s+([^;]+)/i)?.[1] || ''
        };
        return parts;
    };
    
    const parts1 = extractKeyParts(query1);
    const parts2 = extractKeyParts(query2);
    
    // Check if FROM matches (most important)
    if (parts1.from && parts2.from && parts1.from === parts2.from) {
        // Check if SELECT columns match (simplified)
        if (parts1.select.includes('*') || parts2.select.includes('*')) {
            return true;
        }
        // More sophisticated matching could go here
        return true;
    }
    
    return false;
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
