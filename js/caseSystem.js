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
            task: "Access the case_files table and locate the entry for case_id = 1. The case summary contains a mysterious code that you must extract. Return: case_id, case_title, location, summary.",
            validation: {
                requiredColumns: ['case_id', 'case_title', 'location', 'summary'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    const row = result.values[0];

                    const columns = result.columns || [];
                    const caseIdIdx = columns.indexOf('case_id');
                    const summaryIdx = columns.indexOf('summary');

                    const caseId = caseIdIdx >= 0 ? row[caseIdIdx] : row[0];
                    const caseIdValue = typeof caseId === 'string' ? parseInt(caseId) : caseId;

                    if (caseIdValue === 1) {
                        const summary = summaryIdx >= 0 ? row[summaryIdx] : (row[3] || row[row.length - 1]);
                        if (summary && typeof summary === 'string') {
                            const codeMatch = summary.match(/\b([A-Z]\d+)\b/);
                            if (codeMatch) {
                                caseSystem.carriedForwardData.code = codeMatch[1];
                                console.log('Case 1: Extracted code from summary:', caseSystem.carriedForwardData.code);
                                return true;
                            } else {
                                console.warn('Case 1: No code found in summary:', summary);
                                return false;
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
            task: "Locations are now unlocked. Using the code you extracted in Case 1, decode it using the locations table. Return: location_code, location_name, district.",
            validation: {
                requiredColumns: ['location_code', 'location_name', 'district'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;

                    const columns = result.columns || [];
                    const codeIdx = columns.indexOf('location_code');
                    const nameIdx = columns.indexOf('location_name');

                    const row = result.values[0];
                    const code = String(codeIdx >= 0 ? row[codeIdx] : row[0] || '').toUpperCase();
                    const name = String(nameIdx >= 0 ? row[nameIdx] : row[1] || '');

                    if (code === 'B7' && name) {
                        caseSystem.carriedForwardData.locationName = name;
                        console.log('Case 2: Decoded B7 as location:', name);
                        return true;
                    }
                    return false;
                }
            }
        },
        {
            id: 3,
            title: "The Star Scratched Locker",
            story: "The Detective Boys are gathered at Teitan Elementary, their usual meeting spot transformed into an impromptu investigation headquarters. Ayumi points excitedly at a locker with a freshly scratched star symbol. Genta dismisses it as vandalism, but Mitsuhiko notices something odd—the scratches form a perfect five-pointed star. Haibara's usual composure cracks when Conan mentions a pattern he's discovered. 'That symbol...' she whispers. 'It's not random. It's a signature. The same one that's been appearing across the city.' The children fall silent. Their games have crossed into something dangerous.",
            task: "Evidence is now unlocked. Using the decoded location from Case 2, find evidence linked to that location. Return: evidence_id, item, found_at, notes.",
            validation: {
                requiredColumns: ['evidence_id', 'item', 'found_at', 'notes'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;

                    const columns = result.columns || [];
                    const foundIdx = columns.indexOf('found_at');
                    const itemIdx = columns.indexOf('item');

                    const locName = (caseSystem.carriedForwardData.locationName || '').toLowerCase();
                    if (!locName) {
                        console.warn('Case 3: Missing carriedForwardData.locationName. Complete Case 2 first.');
                        return false;
                    }

                    const matchRow = result.values.find(row => {
                        const found = String(foundIdx >= 0 ? row[foundIdx] : row[3] || '').toLowerCase();
                        return found.includes('station') || (locName && found.includes(locName.split(' ')[0]));
                    });

                    if (matchRow) {
                        const item = String(itemIdx >= 0 ? matchRow[itemIdx] : matchRow[2] || '');
                        caseSystem.carriedForwardData.keyEvidenceItem = item;
                        // Set the next clue consistently
                        caseSystem.carriedForwardData.timeClue = '03:10';
                        console.log('Case 3: Found station-linked evidence, carrying item + time clue 03:10:', item);
                        return true;
                    }
                    return false;
                }
            }
        },
        {
            id: 4,
            title: "The Station Umbrella Gambit",
            story: "Inspector Megure paces the MPD briefing room, his mustache twitching with frustration. 'Patterns mean paperwork,' he grumbles. Officer Takagi presents the latest incident: Beika Station's lost-and-found has been tampered with. Umbrellas that should be paired are now mismatched, and one contains a note with a star symbol. Sato watches Takagi with concern as he nearly spills his coffee. Conan, sitting quietly in the corner, focuses on what matters: among all the BLACK_STAR cases, which one poses the greatest threat? Megure would prioritize by severity. And that's exactly what Conan wants you to do.",
            task: "Time logs are now unlocked. Using the code and time clue you carried forward, find matching time_logs entries at the correct location around the key time. Return: timestamp, location_code, activity, person_name.",
            validation: {
                requiredColumns: ['timestamp', 'location_code', 'activity', 'person_name'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;

                    const columns = result.columns || [];
                    const tsIdx = columns.indexOf('timestamp');
                    const locIdx = columns.indexOf('location_code');
                    const personIdx = columns.indexOf('person_name');

                    const timeClue = caseSystem.carriedForwardData.timeClue || '03:10';

                    const matchRow = result.values.find(row => {
                        const ts = String(tsIdx >= 0 ? row[tsIdx] : row[1] || '');
                        const loc = String(locIdx >= 0 ? row[locIdx] : row[2] || '').toUpperCase();
                        return ts.includes(timeClue) && loc === 'B7';
                    });

                    if (matchRow) {
                        const person = String(personIdx >= 0 ? matchRow[personIdx] : matchRow[4] || '').trim();
                        if (person) {
                            caseSystem.carriedForwardData.personClue = person;
                            console.log('Case 4: Carried person clue:', person);
                            return true;
                        }
                    }
                    return false;
                }
            }
        },
        {
            id: 5,
            title: "The Evidence Vault",
            story: "With clearance granted for the highest-severity BLACK_STAR case, you gain access to the Metropolitan Police evidence locker. Sato hovers protectively as Takagi carefully lays out the evidence bags. Conan examines each item with forensic precision, looking for what criminals always leave behind: a timestamp that can't be faked, a moment in time that betrays their presence. He murmurs something significant, spotting a crucial detail in the evidence log. 'That's when they slipped up.' The evidence table is now unlocked—your analysis begins.",
            task: "Connections are now unlocked. Using the person_name you discovered in Case 4, query the connections table to find who they are linked to. Return: person_a, person_b, relationship.",
            validation: {
                requiredColumns: ['person_a', 'person_b', 'relationship'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;

                    const columns = result.columns || [];
                    const aIdx = columns.indexOf('person_a');
                    const bIdx = columns.indexOf('person_b');

                    const person = caseSystem.carriedForwardData.personClue;
                    if (!person) {
                        console.warn('Case 5: Missing carriedForwardData.personClue. Complete Case 4 first.');
                        return false;
                    }

                    const matchRow = result.values.find(row => {
                        const a = String(aIdx >= 0 ? row[aIdx] : row[1] || '');
                        const b = String(bIdx >= 0 ? row[bIdx] : row[2] || '');
                        return a === person || b === person;
                    });

                    if (matchRow) {
                        const a = String(aIdx >= 0 ? matchRow[aIdx] : matchRow[1] || '');
                        const b = String(bIdx >= 0 ? matchRow[bIdx] : matchRow[2] || '');
                        const other = (a === person) ? b : a;
                        if (other) {
                            caseSystem.carriedForwardData.connectedPerson = other;
                            console.log('Case 5: Carried connected person:', other);
                            return true;
                        }
                    }
                    return false;
                }
            }
        },
        {
            id: 6,
            title: "The Midnight Elevator",
            story: "Officer Takagi reviews the security footage with growing concern. An elevator in a supposedly empty building stops at an impossible hour—since the building should be locked. Conan's mind connects the dots instantly. The timestamp from the evidence vault isn't isolated. It's a pattern. Criminals try to hide in plain sight, but they can't hide their timeline. Every action leaves a digital footprint. The BLACK_STAR operative's movements are now traceable through this temporal signature. 'They were there,' Conan states flatly. 'At exactly that time.'",
            task: "Suspects are now unlocked. Using the connected person you carried from Case 5, find their suspect entry. Return: case_id, name, suspicion.",
            validation: {
                requiredColumns: ['case_id', 'name', 'suspicion'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;

                    const columns = result.columns || [];
                    const caseIdx = columns.indexOf('case_id');
                    const nameIdx = columns.indexOf('name');

                    const target = caseSystem.carriedForwardData.connectedPerson;
                    if (!target) {
                        console.warn('Case 6: Missing carriedForwardData.connectedPerson. Complete Case 5 first.');
                        return false;
                    }

                    const matchRow = result.values.find(row => {
                        const name = String(nameIdx >= 0 ? row[nameIdx] : row[2] || '');
                        return name === target;
                    });

                    if (matchRow) {
                        const caseId = caseIdx >= 0 ? matchRow[caseIdx] : matchRow[1];
                        const caseIdValue = typeof caseId === 'string' ? parseInt(caseId) : caseId;
                        if (caseIdValue) {
                            caseSystem.carriedForwardData.caseId = caseIdValue;
                            console.log('Case 6: Carried case_id:', caseIdValue);
                            return true;
                        }
                    }
                    return false;
                }
            }
        },
        {
            id: 7,
            title: "The Evidence Pattern",
            story: "Conan stands before the evidence board, marker in hand, but doesn't write yet. He counts silently. The Metropolitan Police calls this 'statistical analysis.' Conan calls it 'common sense.' The 03:10 timestamp appears across multiple cases—not randomly, but with purpose. If the same temporal clue appears repeatedly, it's not coincidence. Someone wants investigators to connect these dots. Or perhaps they're so arrogant they can't help leaving their signature everywhere. Either way, the case with the most 03:10 evidence items becomes the key to unraveling the entire BLACK_STAR operation.",
            task: "Witness statements are now unlocked. Using the case_id you carried from Case 6, list witness statements for that case and include reliability. Return: statement_id, case_id, witness_name, reliability.",
            validation: {
                requiredColumns: ['statement_id', 'case_id', 'witness_name', 'reliability'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;

                    const columns = result.columns || [];
                    const relIdx = columns.indexOf('reliability');
                    const nameIdx = columns.indexOf('witness_name');
                    const caseIdx = columns.indexOf('case_id');

                    const caseId = caseSystem.carriedForwardData.caseId;
                    if (!caseId) {
                        console.warn('Case 7: Missing carriedForwardData.caseId. Complete Case 6 first.');
                        return false;
                    }

                    const rowsForCase = result.values.filter(row => {
                        const cid = caseIdx >= 0 ? row[caseIdx] : row[1];
                        const cidValue = typeof cid === 'string' ? parseInt(cid) : cid;
                        return cidValue === caseId;
                    });

                    if (rowsForCase.length === 0) return false;

                    // pick highest reliability witness to carry
                    let best = null;
                    rowsForCase.forEach(r => {
                        const rel = parseInt(relIdx >= 0 ? r[relIdx] : r[3] || 0);
                        if (!best || rel > best.rel) {
                            best = { rel, name: String(nameIdx >= 0 ? r[nameIdx] : r[2] || '') };
                        }
                    });

                    if (best && best.name) {
                        caseSystem.carriedForwardData.bestWitness = best.name;
                        console.log('Case 7: Carried best witness:', best.name);
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
            task: "Using your carried case_id, JOIN case_files and suspects to return: case_title, name, suspicion (order by suspicion DESC).",
            validation: {
                requiredColumns: ['case_title', 'name', 'suspicion'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    const cols = result.columns || [];
                    const titleIdx = cols.indexOf('case_title');
                    const nameIdx = cols.indexOf('name');
                    const suspIdx = cols.indexOf('suspicion');

                    const caseId = caseSystem.carriedForwardData.caseId;
                    if (!caseId) return false;

                    // Just ensure we got at least one suspect row with a title
                    const row = result.values[0];
                    const title = String(titleIdx >= 0 ? row[titleIdx] : row[0] || '');
                    const name = String(nameIdx >= 0 ? row[nameIdx] : row[1] || '');
                    const susp = parseInt(suspIdx >= 0 ? row[suspIdx] : row[2] || 0);

                    if (title && name && !isNaN(susp)) {
                        caseSystem.carriedForwardData.topSuspect = name;
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
            task: "Using your carried case_id and/or the key evidence clue you carried earlier, list evidence for the case. Return: item, time_found, notes.",
            validation: {
                requiredColumns: ['item', 'time_found', 'notes'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    const cols = result.columns || [];
                    const itemIdx = cols.indexOf('item');
                    const notesIdx = cols.indexOf('notes');

                    const keyItem = (caseSystem.carriedForwardData.keyEvidenceItem || '').toLowerCase();
                    if (!keyItem) return false;

                    const hasKey = result.values.some(row => {
                        const item = String(itemIdx >= 0 ? row[itemIdx] : row[0] || '').toLowerCase();
                        const notes = String(notesIdx >= 0 ? row[notesIdx] : row[2] || '').toLowerCase();
                        return item.includes(keyItem) || notes.includes('b7');
                    });
                    return hasKey;
                }
            }
        },
        {
            id: 10,
            title: "The Black Star Falls",
            story: "The investigation room falls silent as all eyes turn to Conan. This is the moment he's waited for—the 'explains it all' revelation that ties every thread together. The key case from your analysis, the prime suspect you've identified, the crucial evidence items, the reliable witness testimony—all must be woven into a single, undeniable narrative. Megure needs more than theories; he needs proof. A single query that JOINs all the evidence, all the suspects, all the witnesses. One master table that exposes the BLACK_STAR operative's entire operation. Heiji smirks knowingly. This is the part that separates the amateurs from the masters.",
            task: "Final report: produce a single-row summary with aliases: case_title, lead_detective, location_name, top_suspect, best_witness.",
            validation: {
                requiredColumns: ['case_title', 'lead_detective', 'location_name', 'top_suspect', 'best_witness'],
                requiredRows: 1,
                checkQuery: (result) => {
                    if (!result || !result.values || result.values.length === 0) return false;
                    const cols = result.columns || [];

                    const needed = ['case_title', 'lead_detective', 'location_name', 'top_suspect', 'best_witness'];
                    const hasAll = needed.every(c => cols.includes(c));
                    if (!hasAll) return false;

                    // No strict content check; just require a coherent "report" row.
                    return true;
                }
            }
        }
    ]
,
    
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
        // Progressive unlocking: each completed case unlocks the next table
        const unlocked = ['case_files']; // Always available

        // Case 1 complete -> unlock locations
        if (this.completedCases.has(1) || this.currentCaseIndex >= 1) {
            unlocked.push('locations');
        }

        // Case 2 complete -> unlock evidence
        if (this.completedCases.has(2) || this.currentCaseIndex >= 2) {
            unlocked.push('evidence');
        }

        // Case 3 complete -> unlock time_logs
        if (this.completedCases.has(3) || this.currentCaseIndex >= 3) {
            unlocked.push('time_logs');
        }

        // Case 4 complete -> unlock connections
        if (this.completedCases.has(4) || this.currentCaseIndex >= 4) {
            unlocked.push('connections');
        }

        // Case 5 complete -> unlock suspects
        if (this.completedCases.has(5) || this.currentCaseIndex >= 5) {
            unlocked.push('suspects');
        }

        // Case 6 complete -> unlock witness_statements
        if (this.completedCases.has(6) || this.currentCaseIndex >= 6) {
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
