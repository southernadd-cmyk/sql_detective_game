// Database setup and initialization for Detective Conan SQL Game
let db = null;
let SQL = null;

// Initialize SQL.js and create database
async function initDatabase() {
    try {
        // Check if initSqlJs is available (from CDN)
        if (typeof initSqlJs === 'undefined') {
            throw new Error('sql.js library not loaded. Please check your internet connection and refresh the page.');
        }
        
        // Load sql.js
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        
        // Create a new database for this user session
        db = new SQL.Database();
        
        // Create schema and populate with data
        createSchema();
        populateData();
        
        console.log('Database initialized successfully!');
        return db;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Create database schema (Detective Conan campaign)
function createSchema() {
    // Drop existing tables if they exist
    db.run(`DROP TABLE IF EXISTS witness_statements`);
    db.run(`DROP TABLE IF EXISTS suspects`);
    db.run(`DROP TABLE IF EXISTS evidence`);
    db.run(`DROP TABLE IF EXISTS case_files`);

    // Case files - main case board
    db.run(`
        CREATE TABLE case_files (
            case_id        INTEGER PRIMARY KEY,
            case_title     TEXT NOT NULL,
            date           TEXT NOT NULL,
            location       TEXT NOT NULL,
            lead_detective TEXT NOT NULL,
            case_type      TEXT NOT NULL,
            severity       INTEGER NOT NULL,
            status         TEXT NOT NULL,
            signature      TEXT NOT NULL,
            summary        TEXT NOT NULL
        )
    `);

    // Evidence - evidence items tied to cases
    db.run(`
        CREATE TABLE evidence (
            evidence_id    INTEGER PRIMARY KEY,
            case_id        INTEGER NOT NULL,
            item           TEXT NOT NULL,
            found_at       TEXT NOT NULL,
            time_found     TEXT NOT NULL,
            notes          TEXT NOT NULL,
            is_key         INTEGER NOT NULL,
            FOREIGN KEY (case_id) REFERENCES case_files(case_id)
        )
    `);

    // Suspects - per-case suspect notes
    db.run(`
        CREATE TABLE suspects (
            suspect_id     INTEGER PRIMARY KEY,
            case_id        INTEGER NOT NULL,
            name           TEXT NOT NULL,
            connection     TEXT NOT NULL,
            alibi          TEXT NOT NULL,
            suspicion      INTEGER NOT NULL,
            motive_hint    TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES case_files(case_id)
        )
    `);

    // Witness statements - used for final JOIN
    db.run(`
        CREATE TABLE witness_statements (
            statement_id   INTEGER PRIMARY KEY,
            case_id        INTEGER NOT NULL,
            witness_name   TEXT NOT NULL,
            reliability    INTEGER NOT NULL,
            statement      TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES case_files(case_id)
        )
    `);
}

// Populate database with Detective Conan campaign data
function populateData() {
    // Case files
    const caseFiles = [
        [1, "The Missing Agency Receipt", "2026-01-10", "Mouri Detective Agency (Beika)", "Kogoro Mouri", "Missing Item", 1, "Open", "NONE", "Kogoro's expense receipt vanished from his desk. Conan thinks it was taken on purpose, not lost. A scribble on the blotter reads 'B7'."],
        [2, "The Poirot Sugar Swap", "2026-01-11", "Cafe Poirot (Beika)", "Conan Edogawa", "Theft", 1, "Open", "NONE", "Amuro notices the sugar jar was swapped after a rush hour. A customer complained their drink tasted salty. The jar label has 'B7' written in marker."],
        [3, "Teitan Locker Rattle", "2026-01-12", "Teitan Elementary", "Conan Edogawa", "Vandalism", 2, "Open", "BLACK_STAR", "A locker door is scratched with a star shape. The Detective Boys find a sticker nearby: a tiny black star."],
        [4, "Beika Station Umbrella Switch", "2026-01-13", "Beika Station", "Inspector Megure", "Theft", 2, "Open", "BLACK_STAR", "During rain, umbrellas were mixed up. One umbrella contains a hidden note. Megure wants it handled quietly."],
        [5, "Sonoko's Gallery Invite Scam", "2026-01-14", "Suzuki Gallery (Beika)", "Ran Mouri", "Fraud", 3, "Open", "BLACK_STAR", "Sonoko receives a fake VIP invite. The QR code leads to a \"membership\" page. Conan suspects a repeat scammer."],
        [6, "The Silent Elevator Ping", "2026-01-15", "Beika Office Tower", "Detective Takagi", "Suspicious Incident", 3, "Open", "BLACK_STAR", "An elevator logs a stop on a locked floor at 03:10. Security swears nobody has access."],
        [7, "Kaitou Kid's 'Almost' Calling Card", "2026-01-16", "Beika Museum", "Heiji Hattori", "Theft", 4, "Open", "BLACK_STAR", "A calling card appears… but it's slightly wrong. Heiji says it's not Kid's style. A black star sticker is on the card."],
        [8, "The Beika Clock Shop Switch", "2026-01-17", "Beika Clock Shop", "Ai Haibara", "Theft", 4, "Open", "BLACK_STAR", "A rare watch is replaced with a fake. The fake's engraving includes a tiny star. Haibara looks unusually tense."],
        [9, "Final Report: Identify the Reliable Witnesses", "2026-01-18", "MPD Interview Room", "Inspector Megure", "Investigation", 5, "Open", "BLACK_STAR", "Megure wants a clean report: case title + the most reliable witness statements. No confusion, no missing names."]
    ];

    const insertCaseFile = db.prepare('INSERT INTO case_files (case_id, case_title, date, location, lead_detective, case_type, severity, status, signature, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    caseFiles.forEach(cf => insertCaseFile.run(cf));
    insertCaseFile.free();

    // Evidence
    const evidence = [
        [101, 1, "Coffee ring photograph", "Kogoro's desk", "09:05", "Ring overlaps the torn corner of the receipt. Someone handled paper after coffee was poured.", 1],
        [102, 1, "Ballpoint pen (blue)", "Desk drawer", "09:06", "Ink matches a scribble found on the desk blotter: 'B-7'.", 0],
        [201, 2, "Salted sugar jar", "Cafe Poirot counter", "18:22", "Sugar jar contains salt crystals. Label on base is newer than the lid.", 1],
        [202, 2, "Order slip #184", "Cash register", "18:25", "Marked 'NO SUGAR' but drink was sweet. Suggests jar swap happened after order.", 0],
        [301, 3, "Black star sticker", "Hallway floor", "12:40", "Sticker size matches those used to seal envelopes.", 1],
        [302, 3, "Scratched locker panel", "Locker 3-B", "12:45", "Star scratch pattern shows three pauses—like someone listened for footsteps.", 0],
        [401, 4, "Umbrella with hidden note", "Station umbrella stand", "07:58", "Inside lining: note says '3:10' and 'B7'.", 1],
        [402, 4, "Platform CCTV timestamp", "Station office", "08:10", "Footage missing for 07:50–08:00 due to 'maintenance'.", 1],
        [501, 5, "Fake VIP QR flyer", "Suzuki Gallery entrance", "14:12", "QR points to lookalike domain. Tiny black star printed near corner.", 1],
        [502, 5, "Receipt for envelopes", "Gallery bin", "14:20", "Envelope pack purchased from Beika Station kiosk.", 0],
        [601, 6, "Elevator log printout", "Security desk", "09:30", "Shows stop at Floor 7 at 03:10. Security claims the printer jammed that night.", 1],
        [602, 6, "Master key sign-out sheet", "Security office", "09:35", "Page for 'Floor 7' torn out cleanly.", 1],
        [701, 7, "Calling card (incorrect)", "Museum display case", "10:05", "Wording is flashy but slightly off-brand. Black star sticker used as seal.", 1],
        [702, 7, "Museum map pamphlet", "Lobby", "10:08", "A route is circled: Service Stairwell -> Floor 7 -> Storage.", 0],
        [801, 8, "Fake watch engraving", "Clock shop counter", "16:40", "Engraving includes a tiny star and letters 'B7'.", 1],
        [802, 8, "Glue residue sample", "Watch backplate", "16:45", "Cheap adhesive used—common in kiosk counterfeit kits.", 0],
        [901, 9, "Consolidated case notes", "MPD folder", "11:00", "Megure requests: list case title + reliable witness statements for case_id 7.", 1]
    ];

    const insertEvidence = db.prepare('INSERT INTO evidence (evidence_id, case_id, item, found_at, time_found, notes, is_key) VALUES (?, ?, ?, ?, ?, ?, ?)');
    evidence.forEach(ev => insertEvidence.run(ev));
    insertEvidence.free();

    // Suspects
    const suspects = [
        [1001, 1, "Kogoro Mouri", "Owner", "Was asleep on sofa. Claims he never touched the receipt after breakfast.", 1, "If it goes missing, he can't claim expenses."],
        [1002, 1, "Ran Mouri", "Family", "At school, then shopping. Returned after 16:00.", 1, "No motive; too responsible."],
        [1003, 1, "Conan Edogawa", "Staying with Mouri family", "At Teitan Elementary. Left for school at 08:10.", 2, "Knows too much about desk layout."],
        [2001, 2, "Rei Furuya (Amuro Tooru)", "Poirot staff", "Working the counter the whole time.", 1, "Wants Poirot reputation intact."],
        [2002, 2, "Customer: 'Ms. Tanaka'", "Customer", "Left quickly after tasting coffee.", 3, "Could have swapped jar to cause a scene."],
        [2003, 2, "Customer: 'Mr. Saito'", "Customer", "In restroom briefly at 18:10.", 2, "Opportunity near counter."],
        [3001, 3, "Genta Kojima", "Detective Boys", "In classroom until lunch bell.", 1, "More likely to investigate than vandalise."],
        [3002, 3, "Mitsuhiko Tsuburaya", "Detective Boys", "Went to library at lunch.", 1, "Unlikely."],
        [3003, 3, "Ayumi Yoshida", "Detective Boys", "With teacher at lunch.", 1, "Unlikely."],
        [3004, 3, "Unknown older student", "Visitor", "Seen near lockers; left before staff questioned them.", 4, "Star scratch seems deliberate, not childish."],
        [4001, 4, "Inspector Megure", "MPD", "Arrived after the umbrella mix-up.", 1, "Wants it quiet; not a suspect."],
        [4002, 4, "Unknown commuter", "Crowd", "No ID; CCTV gap covers their presence.", 5, "CCTV gap + hidden note suggests planning."],
        [5001, 5, "Sonoko Suzuki", "Target", "Was with Ran when the flyer was found.", 1, "Victim of scam."],
        [5002, 5, "Gallery temp staff", "Staff", "Handled flyers at entrance.", 3, "Could have planted fakes."],
        [5003, 5, "Kiosk clerk (Beika Station)", "Vendor", "Says envelopes sold normally.", 2, "Link to envelope trail."],
        [6001, 6, "Officer Takagi", "MPD", "On shift; followed standard procedure.", 1, "Trustworthy."],
        [6002, 6, "Security chief", "Building staff", "Claims keys never left the hook.", 4, "Torn sign-out sheet + printer 'jam' is suspicious."],
        [6003, 6, "Night cleaner", "Contractor", "On-site 02:30–04:00.", 3, "Could have accessed elevator unnoticed."],
        [7001, 7, "Heiji Hattori", "Visiting", "Arrived 09:50, stayed with Conan and Ran.", 1, "Here to help."],
        [7002, 7, "Kaitou Kid (rumour)", "Unknown", "No confirmed sightings.", 2, "Calling card seems wrong."],
        [7003, 7, "Museum curator", "Staff", "Claims card appeared 'by magic'.", 3, "Could be staging publicity."],
        [7004, 7, "Unknown copycat", "Unknown", "Black star sticker on seal.", 5, "Copycat using a calling card style."],
        [8001, 8, "Ai Haibara", "Witness", "Entered shop briefly with Conan.", 1, "Not a suspect; concerned by 'B7'."],
        [8002, 8, "Clock shop owner", "Staff", "Says he never leaves counter.", 3, "Could swap items for profit."],
        [8003, 8, "Beika Station kiosk runner", "Courier", "Seen delivering small parcels.", 4, "Could distribute counterfeit kits."]
    ];

    const insertSuspect = db.prepare('INSERT INTO suspects (suspect_id, case_id, name, connection, alibi, suspicion, motive_hint) VALUES (?, ?, ?, ?, ?, ?, ?)');
    suspects.forEach(sus => insertSuspect.run(sus));
    insertSuspect.free();

    // Witness statements
    const witnessStatements = [
        [9001, 7, "Conan Edogawa", 5, "The wording on the calling card is slightly off. Also, the seal uses a sticker like the one found at Teitan."],
        [9002, 7, "Ran Mouri", 4, "I saw a staff member near the display case earlier, but I didn't think it was strange at the time."],
        [9003, 7, "Sonoko Suzuki", 2, "It HAS to be Kaitou Kid! The drama, the flair—he loves this kind of thing!"],
        [9004, 7, "Heiji Hattori", 5, "That ain't Kid's style. The route on the pamphlet points to Floor 7—someone wants us looking there."],
        [9005, 7, "Inspector Megure", 3, "We have a note mentioning '3:10' and 'B7'. The CCTV gap at the station is… inconvenient."],
        [9101, 4, "Station attendant", 3, "The CCTV was down for maintenance. It happens."],
        [9102, 6, "Night cleaner", 2, "I heard the elevator ding around 3-ish. I didn't go near it."],
        [9103, 8, "Clock shop customer", 3, "A courier dropped a parcel labelled 'B7 Supplies' and left fast."]
    ];

    const insertWitness = db.prepare('INSERT INTO witness_statements (statement_id, case_id, witness_name, reliability, statement) VALUES (?, ?, ?, ?, ?)');
    witnessStatements.forEach(ws => insertWitness.run(ws));
    insertWitness.free();
}

// Execute SQL query
function executeQuery(query) {
    try {
        const result = db.exec(query);
        return {
            success: true,
            result: result
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Get table schema information
function getTableSchema(tableName) {
    try {
        const result = db.exec(`PRAGMA table_info(${tableName})`);
        return result;
    } catch (error) {
        console.error('Error getting schema:', error);
        return null;
    }
}

// Get all table names
function getAllTables() {
    try {
        const result = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        if (result.length > 0) {
            return result[0].values.map(row => row[0]);
        }
        return [];
    } catch (error) {
        console.error('Error getting tables:', error);
        return [];
    }
}

// Export database for persistence (optional)
function exportDatabase() {
    if (db) {
        return db.export();
    }
    return null;
}

// Import database (optional)
function importDatabase(data) {
    if (SQL && data) {
        db = new SQL.Database(data);
    }
}

// Make executeQuery globally available
window.executeQuery = executeQuery;
