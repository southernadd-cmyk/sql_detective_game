// Case System - Chained Detective Conan SQL Campaign (progressive difficulty)
const caseSystem = {
    currentCaseIndex: 0,
    completedCases: new Set(),
    carriedForwardData: {}, // Store data carried forward between cases
    
    cases: [
        {
            id: 1,
            title: "The Phantom Receipt",
            story: "The Mouri Detective Agency office is in chaos. Kogoro is bellowing about a 'criminal conspiracy' because his precious expense receipt has vanished. Ran tries to calm him down while frantically searching drawers. Conan, however, notices something peculiar on the desk blotter—a faint impression that wasn't there before. It's a code. Written in ink that matches none of the office pens. This isn't random vandalism. This is a message. And Conan's sharp eyes suggest it connects to something much larger lurking in Beika City's shadows.",
            task: "Access the case_files table and locate the entry for case_id = 1. The case summary contains a mysterious code that will be crucial for tracking the BLACK_STAR operative. Extract and display: case_id, case_title, location, and summary columns.",
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
            title: "The Poirot Cipher",
            story: "Conan leads the team to Cafe Poirot, Beika City's unofficial detective crossroads. The atmosphere is tense—Amuro Tooru is polishing glasses with unusual focus. He mentions a recent incident: someone swapped the sugar jars, leaving behind a note with strange symbols. Conan's mind races back to the code from the agency. He doesn't mention sugar. Instead, he asks about patterns. Amuro's eyes narrow as he sets down his glass. 'So you've noticed it too,' he says quietly. 'The BLACK_STAR has been busy.'",
            task: "Using the mysterious code you uncovered in Case 1, search the case_files table for all cases whose summary contains this exact code. This will reveal the pattern the BLACK_STAR operative is following. Display: case_id, case_title, date, location, and summary columns.",
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
            title: "The Star Scratched Locker",
            story: "The Detective Boys are gathered at Teitan Elementary, their usual meeting spot transformed into an impromptu investigation headquarters. Ayumi points excitedly at a locker with a freshly scratched star symbol. Genta dismisses it as vandalism, but Mitsuhiko notices something odd—the scratches form a perfect five-pointed star. Haibara's usual composure cracks when Conan mentions a pattern he's discovered. 'That symbol...' she whispers. 'It's not random. It's a signature. The same one that's been appearing across the city.' The children fall silent. Their games have crossed into something dangerous.",
            task: "Now that you've identified the BLACK_STAR signature pattern, query the case_files table to find all cases that bear this exact signature. This will show the full scope of the operative's activities. Include: case_id, case_title, signature, location, and severity columns.",
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
            title: "The Station Umbrella Gambit",
            story: "Inspector Megure paces the MPD briefing room, his mustache twitching with frustration. 'Patterns mean paperwork,' he grumbles. Officer Takagi presents the latest incident: Beika Station's lost-and-found has been tampered with. Umbrellas that should be paired are now mismatched, and one contains a note with a star symbol. Sato watches Takagi with concern as he nearly spills his coffee. Conan, sitting quietly in the corner, focuses on what matters: among all the BLACK_STAR cases, which one poses the greatest threat? Megure would prioritize by severity. And that's exactly what Conan wants you to do.",
            task: "With the BLACK_STAR signature confirmed, prioritize the threats. Query all cases with this signature, ordered by severity level (highest number first). The most severe case becomes your primary target. Display: case_id, case_title, severity, and location columns.",
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
            title: "The Evidence Vault",
            story: "With clearance granted for the highest-severity BLACK_STAR case, you gain access to the Metropolitan Police evidence locker. Sato hovers protectively as Takagi carefully lays out the evidence bags. Conan examines each item with forensic precision, looking for what criminals always leave behind: a timestamp that can't be faked, a moment in time that betrays their presence. He murmurs something significant, spotting a crucial detail in the evidence log. 'That's when they slipped up.' The evidence table is now unlocked—your analysis begins.",
            task: "Access the newly unlocked evidence table and examine all items for the high-priority case_id you identified in Case 4. Look for temporal clues in the notes column that will reveal the operative's timeline. Include: evidence_id, item, found_at, time_found, notes, and is_key columns.",
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
            title: "The Midnight Elevator",
            story: "Officer Takagi reviews the security footage with growing concern. An elevator in a supposedly empty building stops at an impossible hour—since the building should be locked. Conan's mind connects the dots instantly. The timestamp from the evidence vault isn't isolated. It's a pattern. Criminals try to hide in plain sight, but they can't hide their timeline. Every action leaves a digital footprint. The BLACK_STAR operative's movements are now traceable through this temporal signature. 'They were there,' Conan states flatly. 'At exactly that time.'",
            task: "Using the timestamp you discovered in Case 5, search across all evidence items to find others that mention this exact time. This will reveal the operative's full timeline. Display: evidence_id, case_id, item, time_found, and notes columns.",
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
            title: "The Evidence Pattern",
            story: "Conan stands before the evidence board, marker in hand, but doesn't write yet. He counts silently. The Metropolitan Police calls this 'statistical analysis.' Conan calls it 'common sense.' The 03:10 timestamp appears across multiple cases—not randomly, but with purpose. If the same temporal clue appears repeatedly, it's not coincidence. Someone wants investigators to connect these dots. Or perhaps they're so arrogant they can't help leaving their signature everywhere. Either way, the case with the most 03:10 evidence items becomes the key to unraveling the entire BLACK_STAR operation.",
            task: "Analyze the evidence items you found in Case 6 that share the 03:10 timestamp. Count how many such items exist for each case_id. The case with the highest count of time-linked evidence is your primary target. Return: case_id and COUNT(*) columns.",
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
            title: "The Suspect Matrix",
            story: "Hattori Heiji bursts into the investigation room with his usual dramatic flair, immediately criticizing Kogoro's 'amateur detective style.' Sonoko enthusiastically suggests it's the work of Kaito Kid. Conan ignores both conversations entirely, his attention fixed on the suspect database that has just been unlocked. For the key case you identified—the one with the densest concentration of 03:10 evidence—the suspect board must be examined. Suspicion levels, alibis, connections—all must be analyzed systematically. The BLACK_STAR operative is on this list. And now you have the clearance to find them.",
            task: "Access the newly unlocked suspects table for the key case_id you identified in Case 7. List all suspects ordered by suspicion level (highest first). The primary suspect will be crucial for the final confrontation. Include: name, connection, alibi, suspicion, and motive_hint columns.",
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
            title: "The Witness Network",
            story: "Inspector Megure leans heavily on his desk, the weight of the investigation pressing down. 'This is getting too big for the usual channels,' he admits. The witness statements database has been unlocked, but raw testimony without context is chaos. Criminals thrive in chaos. Conan knows this better than anyone. The key case you've been tracking has witnesses—people who saw something, heard something, know something. But their statements are scattered across the database. You need to connect them to the case context. JOIN the tables. Cross-reference the testimony. Find the reliable witnesses whose statements can be trusted. They're the final pieces of the BLACK_STAR puzzle.",
            task: "With witness statements now accessible, perform your first JOIN operation. Connect the case_files and witness_statements tables for your key case_id from Case 7. Display case title, witness name, reliability rating, and statement content. Sort by reliability (highest first) to prioritize trustworthy testimony. Return: case_title, witness_name, reliability, and statement columns.",
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
            title: "The Black Star Falls",
            story: "The investigation room falls silent as all eyes turn to Conan. This is the moment he's waited for—the 'explains it all' revelation that ties every thread together. The key case from your analysis, the prime suspect you've identified, the crucial evidence items, the reliable witness testimony—all must be woven into a single, undeniable narrative. Megure needs more than theories; he needs proof. A single query that JOINs all the evidence, all the suspects, all the witnesses. One master table that exposes the BLACK_STAR operative's entire operation. Heiji smirks knowingly. This is the part that separates the amateurs from the masters.",
            task: "Execute the final revelation: JOIN all four tables (case_files, evidence, suspects, witness_statements) for your key case_id. Include the case title, prime suspect details, key evidence items (is_key = 1), and reliable witness statements (reliability >= 4). This comprehensive JOIN will expose the complete BLACK_STAR operation. Return: case_title, suspect_name, suspicion, evidence_item, evidence_notes, witness_name, and reliability columns.",
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

            // Re-render tables to show newly unlocked tables
            if (window.renderTables) {
                window.renderTables();
            }

            // Move to next case if this was the current case
            const caseIndex = this.cases.findIndex(c => c.id === caseId);
            if (caseIndex === this.currentCaseIndex) {
                this.currentCaseIndex = Math.min(this.currentCaseIndex + 1, this.cases.length);

                // Update UI immediately to show next case
                if (window.updateCaseDisplay) {
                    window.updateCaseDisplay();
                }
            }
            
            // Save progress
            this.saveProgress();
        }
    },
    
    getUnlockedTables() {
        // Progressive unlocking based on investigation progress
        const unlocked = ['case_files']; // Always available

        // Unlock locations after Case 1 (when we understand the scope)
        if (this.completedCases.has(1) || this.currentCaseIndex >= 1) {
            unlocked.push('locations');
        }

        // Unlock evidence and time_logs after Case 4 (The Station Umbrella Gambit)
        if (this.completedCases.has(4) || this.currentCaseIndex >= 4) {
            unlocked.push('evidence');
            unlocked.push('time_logs');
        }

        // Unlock suspects and connections after Case 7 (The Evidence Pattern)
        if (this.completedCases.has(7) || this.currentCaseIndex >= 7) {
            unlocked.push('suspects');
            unlocked.push('connections');
        }

        // Unlock witness_statements after Case 8 (The Suspect Matrix)
        if (this.completedCases.has(8) || this.currentCaseIndex >= 8) {
            unlocked.push('witness_statements');
        }

        return unlocked;
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
        
        // Reset onboarding progress as well
        if (window.onboarding && typeof window.onboarding.reset === 'function') {
            window.onboarding.reset();
        } else {
            // Fallback: clear localStorage directly
            localStorage.removeItem('onboarding_completed');
            localStorage.removeItem('onboarding_started');
        }
        
        // Reload the page to apply the reset completely
        if (confirm('Hard reset complete! All progress, query history, and onboarding have been cleared. The page will reload to apply the reset.')) {
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
