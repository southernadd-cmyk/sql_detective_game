// Case System - Chained Detective Conan SQL Campaign (progressive difficulty)
const caseSystem = {
    currentCaseIndex: 0,
    completedCases: new Set(),
    carriedForwardData: {}, // Store data carried forward between cases
    
    cases: [
        {
            id: 1,
            title: "The Missing Agency Receipt",
            story: "Back at the Mouri Detective Agency, Kogoro roars about a 'criminal conspiracy' because his expense receipt is missing. Ran is embarrassed. Conan calmly checks the desk and finds a blotter scribble Kogoro didn't notice: 'B7'. It looks like a desk note… but Conan's expression says it's a breadcrumb.",
            task: "Find the case file for case_id = 1. The summary should reveal a code (like B7) that appears in the case description. Return these columns: case_id, case_title, location, summary",
            unlockedTables: ['case_files'],
            validation: {
                requiredColumns: ['case_id', 'case_title', 'location', 'summary'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    const row = result.values[0];
                    
                    // Get column names from result
                    const columns = result.columns || [];
                    
                    // Find indices of required columns
                    const caseIdIdx = columns.indexOf('case_id');
                    const summaryIdx = columns.indexOf('summary');
                    
                    // Check case_id = 1 (handle both string and number)
                    const caseId = caseIdIdx >= 0 ? row[caseIdIdx] : row[0];
                    const caseIdValue = typeof caseId === 'string' ? parseInt(caseId) : caseId;
                    
                    if (caseIdValue === 1) {
                        // Extract code like B7 from summary - MUST be in the query results
                        const summary = summaryIdx >= 0 ? row[summaryIdx] : (row[3] || row[row.length - 1]);
                        if (summary && typeof summary === 'string') {
                            const codeMatch = summary.match(/\b([A-Z]\d+)\b/);
                            if (codeMatch) {
                                caseSystem.carriedForwardData.code = codeMatch[1];
                                console.log('Case 1: Extracted code from summary:', caseSystem.carriedForwardData.code);
                                return true;
                            } else {
                                console.warn('Case 1: No code found in summary:', summary);
                                return false; // Code must be in the results
                            }
                        }
                        return false;
                    }
                    return false;
                }
            }
        },
        {
            id: 2,
            title: "The Poirot Sugar Swap",
            story: "Conan heads to Cafe Poirot (because somehow every Beika mystery passes through Poirot eventually). Amuro Tooru mentions a sugar jar swap. Conan doesn't ask about sugar first — he quietly looks for anything connected to the code you found. Amuro's eyes narrow: So you noticed that too.",
            task: "Search the case_files table for any cases whose summary contains the code you discovered in Case 1. The code should appear in the summary column of your results. Return these columns: case_id, case_title, date, location, summary",
            unlockedTables: ['case_files'],
            validation: {
                requiredColumns: ['case_id', 'case_title', 'date', 'location', 'summary'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    // Get column indices
                    const columns = result.columns || [];
                    const summaryIdx = columns.indexOf('summary');
                    
                    // Check that summary contains the code from case 1
                    const code = caseSystem.carriedForwardData.code;
                    if (!code) {
                        console.warn('Case 2: No code found in carriedForwardData. Complete Case 1 first.');
                        return false;
                    }
                    
                    // Verify code appears in at least one result's summary
                    const hasCode = result.values.some(row => {
                        const summary = summaryIdx >= 0 ? row[summaryIdx] : row[4];
                        return summary && typeof summary === 'string' && summary.includes(code);
                    });
                    
                    if (hasCode) {
                        // Extract signature from results - look for BLACK_STAR in signature column
                        const signatureIdx = columns.indexOf('signature');
                        if (signatureIdx >= 0) {
                            const blackStarCase = result.values.find(row => {
                                const sig = row[signatureIdx];
                                return sig && sig.includes('BLACK_STAR');
                            });
                            if (blackStarCase) {
                                caseSystem.carriedForwardData.signature = 'BLACK_STAR';
                                console.log('Case 2: Found BLACK_STAR signature pattern');
                            }
                        }
                    }
                    
                    return hasCode;
                }
            }
        },
        {
            id: 3,
            title: "Teitan Locker Rattle",
            story: "At Teitan, the Detective Boys are buzzing about a scratched star on a locker. Haibara's mood changes when Conan mentions the same 'feel' as the code pattern you found. This doesn't look like random vandalism — it looks like a calling card, the kind a copycat would use.",
            task: "From the case_files table, find all cases that share the same signature pattern you discovered in Case 2. The signature column in your results should show the pattern. Return these columns: case_id, case_title, signature, location, severity",
            unlockedTables: ['case_files'],
            validation: {
                requiredColumns: ['case_id', 'case_title', 'signature', 'location', 'severity'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    // Get column indices
                    const columns = result.columns || [];
                    const signatureIdx = columns.indexOf('signature');
                    
                    // Check for BLACK_STAR signature (should have been discovered in Case 2)
                    const expectedSignature = caseSystem.carriedForwardData.signature || 'BLACK_STAR';
                    const hasSignature = result.values.some(row => {
                        const signature = signatureIdx >= 0 ? row[signatureIdx] : row[2];
                        return signature && signature.includes(expectedSignature);
                    });
                    
                    return hasSignature;
                }
            }
        },
        {
            id: 4,
            title: "Beika Station Umbrella Switch",
            story: "Megure hates patterns because patterns mean paperwork. Takagi brings a rainy-day umbrella incident from Beika Station. Conan cares about one thing: which case with the signature pattern you found is getting more dangerous? He picks the worst one first — exactly how Megure would prioritise.",
            task: "List all cases with the signature pattern you found, ordered by severity (highest first). The severity column in your results will show which case is most dangerous. Take the top case_id as your next target. Return these columns: case_id, case_title, severity, location",
            unlockedTables: ['case_files'],
            validation: {
                requiredColumns: ['case_id', 'case_title', 'severity', 'location'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    // Get column indices
                    const columns = result.columns || [];
                    const caseIdIdx = columns.indexOf('case_id');
                    const severityIdx = columns.indexOf('severity');
                    
                    // Check that results are ordered by severity DESC and store top case_id
                    const firstRow = result.values[0];
                    const caseId = caseIdIdx >= 0 ? firstRow[caseIdIdx] : firstRow[0];
                    const severity = severityIdx >= 0 ? firstRow[severityIdx] : firstRow[2];
                    
                    if (caseId !== undefined && severity !== undefined) {
                        caseSystem.carriedForwardData.targetCaseId = caseId;
                        console.log('Case 4: Stored target case_id:', caseSystem.carriedForwardData.targetCaseId);
                        
                        // Verify ordering (first should be highest)
                        if (result.values.length > 1) {
                            const secondRow = result.values[1];
                            const secondSeverity = severityIdx >= 0 ? secondRow[severityIdx] : secondRow[2];
                            return severity >= secondSeverity;
                        }
                        return true;
                    }
                    return false;
                }
            }
        },
        {
            id: 5,
            title: "Evidence Locker Opened",
            story: "MPD finally lets you see the evidence list for that top-priority case you identified. Sato watches Takagi like he might spill coffee on the report. Conan scans for a detail that can't be faked: a time or a code. That's where criminals slip up.",
            task: "In the evidence table, list all evidence for the target case_id you discovered in Case 4. The notes column in your results should contain a time (like 03:10) that will be important. Return these columns: evidence_id, item, found_at, time_found, notes, is_key",
            unlockedTables: ['case_files', 'evidence'],
            validation: {
                requiredColumns: ['evidence_id', 'item', 'found_at', 'time_found', 'notes', 'is_key'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    const targetCaseId = caseSystem.carriedForwardData.targetCaseId;
                    if (!targetCaseId) {
                        console.warn('Case 5: No targetCaseId found. Complete Case 4 first.');
                        return false;
                    }
                    
                    // Get column indices
                    const columns = result.columns || [];
                    const notesIdx = columns.indexOf('notes');
                    
                    // Extract time from notes (e.g., 03:10) - MUST be in the query results
                    const timeMatch = result.values.find(row => {
                        const notes = notesIdx >= 0 ? row[notesIdx] : row[4];
                        return notes && typeof notes === 'string' && /(\d{2}:\d{2})/.test(notes);
                    });
                    
                    if (timeMatch) {
                        const notes = notesIdx >= 0 ? timeMatch[notesIdx] : timeMatch[4];
                        const timeExtracted = notes.match(/(\d{2}:\d{2})/);
                        if (timeExtracted) {
                            caseSystem.carriedForwardData.time = timeExtracted[1];
                            console.log('Case 5: Extracted time from evidence notes:', caseSystem.carriedForwardData.time);
                            return true;
                        }
                    }
                    
                    console.warn('Case 5: No time found in evidence notes. Time must appear in query results.');
                    return false; // Time must be in the results
                }
            }
        },
        {
            id: 6,
            title: "The Silent Elevator Ping",
            story: "Takagi mentions an elevator log that stopped at an impossible time. Conan's brain locks onto the time you discovered in the evidence notes. He's seen criminals try to hide timelines before — and in Beika, the timeline is everything.",
            task: "Find all evidence items whose notes mention the time you discovered in Case 5. The time should appear in the notes column of your results. Return these columns: evidence_id, case_id, item, time_found, notes",
            unlockedTables: ['case_files', 'evidence'],
            validation: {
                requiredColumns: ['evidence_id', 'case_id', 'item', 'time_found', 'notes'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    const time = caseSystem.carriedForwardData.time;
                    if (!time) {
                        console.warn('Case 6: No time found in carriedForwardData. Complete Case 5 first.');
                        return false;
                    }
                    
                    // Get column indices
                    const columns = result.columns || [];
                    const notesIdx = columns.indexOf('notes');
                    const caseIdIdx = columns.indexOf('case_id');
                    
                    // Check that notes contain the time (from Case 5 results)
                    const hasTime = result.values.some(row => {
                        const notes = notesIdx >= 0 ? row[notesIdx] : row[4];
                        return notes && typeof notes === 'string' && notes.includes(time);
                    });
                    
                    return hasTime;
                }
            }
        },
        {
            id: 7,
            title: "Who Keeps Showing Up?",
            story: "Conan doesn't accuse yet. He counts. The MPD calls it 'analysis'; Conan calls it 'common sense.' If the same clue appears in multiple cases, it's either coincidence… or someone wants you to notice it.",
            task: "Count how many evidence items each case_id has among the time-linked evidence you found in Case 6. Your results should show case_id and the count. The case with the highest count is your key case. Return these columns: case_id, COUNT(*)",
            unlockedTables: ['case_files', 'evidence'],
            validation: {
                requiredColumns: ['case_id'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    // Get column indices
                    const columns = result.columns || [];
                    const caseIdIdx = columns.indexOf('case_id');
                    const countIdx = columns.findIndex(c => c.toLowerCase().includes('count'));
                    
                    // Store case_id with highest count (should be first if ordered DESC)
                    const firstRow = result.values[0];
                    const caseId = caseIdIdx >= 0 ? firstRow[caseIdIdx] : firstRow[0];
                    
                    if (caseId !== undefined) {
                        caseSystem.carriedForwardData.keyCaseId = caseId;
                        console.log('Case 7: Identified key case_id:', caseSystem.carriedForwardData.keyCaseId);
                        return true;
                    }
                    return false;
                }
            }
        },
        {
            id: 8,
            title: "Suspect Board",
            story: "Heiji arrives and immediately insults Kogoro's 'detective style' as usual. Sonoko insists it's Kaito Kid (as usual). Conan ignores both (as usual) and pulls up the suspect board for the key case you identified in Case 7.",
            task: "From the suspects table, list suspects for the case_id you identified in Case 7 (the case with the highest evidence count). Order by suspicion (highest first). The top suspect name in your results will be important. Return these columns: name, connection, alibi, suspicion, motive_hint",
            unlockedTables: ['case_files', 'evidence', 'suspects'],
            validation: {
                requiredColumns: ['name', 'connection', 'alibi', 'suspicion', 'motive_hint'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    const keyCaseId = caseSystem.carriedForwardData.keyCaseId;
                    if (!keyCaseId) {
                        console.warn('Case 8: No keyCaseId found. Complete Case 7 first.');
                        return false;
                    }
                    
                    // Get column indices
                    const columns = result.columns || [];
                    const nameIdx = columns.indexOf('name');
                    const suspicionIdx = columns.indexOf('suspicion');
                    
                    // Check ordering by suspicion DESC and store top suspect
                    const firstRow = result.values[0];
                    const name = nameIdx >= 0 ? firstRow[nameIdx] : firstRow[0];
                    const suspicion = suspicionIdx >= 0 ? firstRow[suspicionIdx] : firstRow[3];
                    
                    if (name && suspicion !== undefined) {
                        caseSystem.carriedForwardData.topSuspect = name;
                        console.log('Case 8: Identified top suspect:', caseSystem.carriedForwardData.topSuspect);
                        
                        // Verify ordering (first should be highest)
                        if (result.values.length > 1) {
                            const secondRow = result.values[1];
                            const secondSuspicion = suspicionIdx >= 0 ? secondRow[suspicionIdx] : secondRow[3];
                            return suspicion >= secondSuspicion;
                        }
                        return true;
                    }
                    return false;
                }
            }
        },
        {
            id: 9,
            title: "The Witness List",
            story: "Now it's official MPD business: Megure needs a report with witness statements. But witness statements without the case context are chaos — and Conan knows chaos is where criminals hide. Time to connect the testimony to the key case you've been tracking.",
            task: "Using a JOIN, produce a witness report for your key case_id (from Case 7). Join case_files with witness_statements to show: case title, witness name, reliability, statement. Sort reliability highest first. The reliable witnesses in your results will be needed for the final reveal. Return these columns: case_title, witness_name, reliability, statement",
            unlockedTables: ['case_files', 'evidence', 'suspects', 'witness_statements'],
            validation: {
                requiredColumns: ['case_title', 'witness_name', 'reliability', 'statement'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    const keyCaseId = caseSystem.carriedForwardData.keyCaseId;
                    if (!keyCaseId) {
                        console.warn('Case 9: No keyCaseId found. Complete Case 7 first.');
                        return false;
                    }
                    
                    // Get column indices
                    const columns = result.columns || [];
                    const reliabilityIdx = columns.indexOf('reliability');
                    
                    // Check that we have joined data (case_title from case_files, witness_name from witness_statements)
                    const firstRow = result.values[0];
                    
                    // Check ordering by reliability DESC
                    if (result.values.length > 1 && reliabilityIdx >= 0) {
                        const firstReliability = firstRow[reliabilityIdx];
                        const secondReliability = result.values[1][reliabilityIdx];
                        return firstReliability >= secondReliability;
                    }
                    return true;
                }
            }
        },
        {
            id: 10,
            title: "The Conan-Style Reveal",
            story: "This is the classic 'Conan explains it all' moment — except you're doing it with SQL. You have: the key case from Case 7, the top suspect from Case 8, key evidence items, and reliable witnesses from Case 9. Megure wants one table-like output that proves the connection: who, what evidence, and which reliable witness backs it up. Heiji smirks because this is the part he enjoys.",
            task: "For your key case_id (from Case 7), generate a final reveal view that includes: case title, top suspect name (from Case 8) + suspicion, key evidence items (is_key = 1), reliable witness statements (reliability >= 4 from Case 9). This requires joining multiple tables. Return these columns: case_title, suspect_name, suspicion, evidence_item, evidence_notes, witness_name, reliability",
            unlockedTables: ['case_files', 'evidence', 'suspects', 'witness_statements'],
            validation: {
                requiredColumns: ['case_title'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    
                    const keyCaseId = caseSystem.carriedForwardData.keyCaseId;
                    const topSuspect = caseSystem.carriedForwardData.topSuspect;
                    
                    if (!keyCaseId) {
                        console.warn('Case 10: No keyCaseId found. Complete previous cases first.');
                        return false;
                    }
                    
                    // Final case - check that we have joined multiple tables
                    // Should have case_title, suspect_name, evidence_item, witness_name
                    const firstRow = result.values[0];
                    const columns = result.columns || [];
                    
                    // Verify we have data from multiple tables
                    const hasCaseTitle = columns.includes('case_title');
                    const hasSuspect = columns.includes('suspect_name');
                    const hasEvidence = columns.includes('evidence_item') || columns.includes('evidence_notes');
                    const hasWitness = columns.includes('witness_name');
                    
                    // Should have at least case_title and one other table's data
                    const tableCount = [hasCaseTitle, hasSuspect, hasEvidence, hasWitness].filter(Boolean).length;
                    return tableCount >= 2 && firstRow.length >= 2;
                }
            }
        }
    ],
    
    getCurrentCase() {
        if (this.currentCaseIndex >= this.cases.length) {
            return null;
        }
        return this.cases[this.currentCaseIndex];
    },
    
    validateCaseQuery(caseId, queryResult) {
        const caseData = this.cases.find(c => c.id === caseId);
        if (!caseData) {
            return { valid: false, message: 'Case not found' };
        }
        
        if (this.completedCases.has(caseId)) {
            return { valid: false, message: 'Case already completed' };
        }
        
        const validation = caseData.validation;
        
        // Check if result has required structure
        if (!queryResult || !queryResult.values) {
            return { valid: false, message: 'Query returned no results or invalid format' };
        }
        
        // Check minimum rows
        if (queryResult.values.length < validation.requiredRows) {
            return { 
                valid: false, 
                message: `Query returned ${queryResult.values.length} rows, but need at least ${validation.requiredRows}` 
            };
        }
        
        // Check if custom validation passes
        if (validation.checkQuery) {
            try {
                const isValid = validation.checkQuery(queryResult);
                if (!isValid) {
                    return { valid: false, message: 'Query results do not match case requirements. Please check your query matches the task.' };
                }
            } catch (error) {
                console.error('Validation error:', error);
                return { valid: false, message: 'Error validating query results.' };
            }
        }
        
        return { 
            valid: true, 
            message: `Case ${caseId} completed successfully! Moving to next case...` 
        };
    },
    
    completeCase(caseId) {
        if (!this.completedCases.has(caseId)) {
            this.completedCases.add(caseId);
            
            // Move to next case if this was the current case
            const caseIndex = this.cases.findIndex(c => c.id === caseId);
            if (caseIndex === this.currentCaseIndex) {
                this.currentCaseIndex = Math.min(this.currentCaseIndex + 1, this.cases.length);
                
                // Update UI immediately to show next case
                if (window.updateCaseDisplay) {
                    window.updateCaseDisplay();
                }
                
                // Render tables with new unlocked tables
                if (window.renderTables) {
                    window.renderTables();
                }
            }
            
            // Save progress
            this.saveProgress();
        }
    },
    
    getUnlockedTables() {
        const currentCase = this.getCurrentCase();
        if (!currentCase) {
            // All cases completed, return all tables
            return ['case_files', 'evidence', 'suspects', 'witness_statements'];
        }
        return currentCase.unlockedTables || [];
    },
    
    saveProgress() {
        try {
            const progress = {
                currentCaseIndex: this.currentCaseIndex,
                completedCases: Array.from(this.completedCases),
                carriedForwardData: this.carriedForwardData
            };
            localStorage.setItem('caseSystemProgress', JSON.stringify(progress));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    },
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('caseSystemProgress');
            if (saved) {
                const progress = JSON.parse(saved);
                const savedIndex = progress.currentCaseIndex;
                const savedCompleted = progress.completedCases || [];
                
                // Restore state
                this.currentCaseIndex = savedIndex !== undefined ? savedIndex : 0;
                this.completedCases = new Set(savedCompleted);
                this.carriedForwardData = progress.carriedForwardData || {};
                
                // Verify: if we have completed cases, ensure currentCaseIndex is correct
                // If all cases up to currentCaseIndex are completed, we should be on the next case
                if (savedCompleted.length > 0) {
                    // Find the highest completed case ID
                    const maxCompletedId = Math.max(...savedCompleted.map(id => parseInt(id)));
                    // Find the index of that case
                    const maxCompletedIndex = this.cases.findIndex(c => c.id === maxCompletedId);
                    // If we completed a case, we should be on the next one
                    if (maxCompletedIndex >= 0 && maxCompletedIndex < this.cases.length - 1) {
                        // Ensure we're on the next case after the highest completed one
                        const expectedIndex = maxCompletedIndex + 1;
                        if (this.currentCaseIndex < expectedIndex) {
                            console.log(`Adjusting currentCaseIndex from ${this.currentCaseIndex} to ${expectedIndex} based on completed cases`);
                            this.currentCaseIndex = expectedIndex;
                            this.saveProgress(); // Save the corrected index
                        }
                    }
                }
                
                console.log('Progress loaded:', {
                    currentCaseIndex: this.currentCaseIndex,
                    currentCase: this.getCurrentCase()?.id,
                    completedCases: Array.from(this.completedCases)
                });
            } else {
                console.log('No saved progress found, starting fresh');
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    },
    
    resetProgress() {
        this.currentCaseIndex = 0;
        this.completedCases = new Set();
        this.carriedForwardData = {};
        // Actually remove from localStorage, not just overwrite
        try {
            localStorage.removeItem('caseSystemProgress');
            console.log('Case progress cleared from localStorage');
        } catch (error) {
            console.error('Failed to clear case progress from localStorage:', error);
        }
    },
    
    // Hard reset - clears ALL game data from localStorage
    hardReset() {
        // Clear case progress
        this.resetProgress();
        
        // Clear query history - do this FIRST before clearing localStorage
        try {
            // Clear in-memory array first - use direct access if available
            if (window.queryHistory) {
                // Directly clear the internal array
                if (window.queryHistory._clearArray) {
                    window.queryHistory._clearArray();
                    console.log('Query history array cleared directly');
                }
                // Also use the clear function
                if (window.queryHistory.clear) {
                    window.queryHistory.clear();
                }
                // Verify it's empty
                const remaining = window.queryHistory.getAll ? window.queryHistory.getAll() : [];
                if (remaining.length > 0) {
                    console.warn(`Warning: ${remaining.length} queries still in memory after clear`);
                    // Force clear again
                    if (window.queryHistory._clearArray) {
                        window.queryHistory._clearArray();
                    }
                }
            }
            
            // Remove from localStorage
            localStorage.removeItem('sql-detective-query-history');
            
            // Double-check: verify it's gone
            const stillExists = localStorage.getItem('sql-detective-query-history');
            if (stillExists) {
                console.warn('Query history still exists in localStorage after removal, forcing clear');
                localStorage.removeItem('sql-detective-query-history');
            }
            
            console.log('Query history cleared from localStorage and memory');
        } catch (error) {
            console.error('Failed to clear query history from localStorage:', error);
        }
        
        // Clear any other game-related localStorage items
        try {
            // List of all localStorage keys used by this game
            const gameKeys = [
                'caseSystemProgress',
                'sql-detective-query-history'
            ];
            
            gameKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`Cleared localStorage key: ${key}`);
                }
            });
            
            // Also check for any keys that start with our game prefix
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
                if (key.startsWith('sql-detective-') || key.startsWith('caseSystem')) {
                    localStorage.removeItem(key);
                    console.log(`Cleared localStorage key: ${key}`);
                }
            });
        } catch (error) {
            console.error('Error during hard reset:', error);
        }
        
        // Clear evidence board display - do this AFTER clearing query history
        try {
            const pinboard = document.getElementById('evidence-pinboard');
            if (pinboard) {
                // Force clear the display
                pinboard.innerHTML = `
                    <div class="pinboard-placeholder pixel-text-tiny">
                        Run successful queries to see them pinned here
                    </div>
                `;
                console.log('Evidence board display cleared');
            }
            
            // Force update evidence board - this will check queryHistory.getAll() which should be empty now
            if (window.updateEvidenceBoard) {
                // Small delay to ensure queryHistory is cleared
                setTimeout(() => {
                    window.updateEvidenceBoard();
                    console.log('Evidence board updated after clear');
                }, 100);
            }
        } catch (error) {
            console.error('Failed to clear evidence board:', error);
        }
        
        console.log('Hard reset complete. All game data cleared from localStorage and evidence board.');
    }
};

// Initialize and load progress
caseSystem.loadProgress();

// Make available globally
window.caseSystem = caseSystem;

// Expose hard reset function globally for console access
window.hardResetGame = function() {
    if (window.caseSystem && window.caseSystem.hardReset) {
        window.caseSystem.hardReset();
        
        // Force clear query history in-memory array directly
        if (window.queryHistory) {
            // Directly clear the internal array first
            if (window.queryHistory._clearArray) {
                window.queryHistory._clearArray();
                console.log('Query history array cleared directly in hardResetGame');
            }
            // Call clear to ensure in-memory array is empty
            if (window.queryHistory.clear) {
                window.queryHistory.clear();
            }
            // Verify it's empty
            const remaining = window.queryHistory.getAll ? window.queryHistory.getAll() : [];
            if (remaining.length > 0) {
                console.warn(`Warning: ${remaining.length} queries still in memory, forcing clear again`);
                if (window.queryHistory._clearArray) {
                    window.queryHistory._clearArray();
                }
            }
            // Re-initialize to ensure it's empty (should load empty array from cleared localStorage)
            if (window.queryHistory.init) {
                window.queryHistory.init();
            }
        }
        
        // Force clear evidence board display
        const pinboard = document.getElementById('evidence-pinboard');
        if (pinboard) {
            pinboard.innerHTML = `
                <div class="pinboard-placeholder pixel-text-tiny">
                    Run successful queries to see them pinned here
                </div>
            `;
        }
        
        // Force update evidence board one more time
        if (window.updateEvidenceBoard) {
            setTimeout(() => {
                window.updateEvidenceBoard();
            }, 100);
        }
        
        // Reload the page to apply the reset completely
        if (confirm('Hard reset complete! All progress and query history have been cleared. The page will reload to apply the reset.')) {
            window.location.reload();
        } else {
            // Even if user cancels reload, ensure evidence board is cleared
            setTimeout(() => {
                if (window.updateEvidenceBoard) {
                    window.updateEvidenceBoard();
                }
            }, 200);
        }
    } else {
        console.error('Hard reset function not available');
    }
};
