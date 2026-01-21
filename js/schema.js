// Shared schema metadata for UI and query builder
const SCHEMA_TABLES = [
    {
        name: 'case_files',
        description: 'Case file records - main case information',
        columns: [
            { name: 'case_id', type: 'INTEGER', description: 'Primary key' },
            { name: 'case_title', type: 'TEXT', description: 'Case headline/title' },
            { name: 'date', type: 'TEXT', description: 'Case date (YYYY-MM-DD)' },
            { name: 'location', type: 'TEXT', description: 'Location name' },
            { name: 'lead_detective', type: 'TEXT', description: 'Lead investigator' },
            { name: 'case_type', type: 'TEXT', description: 'Incident category' },
            { name: 'severity', type: 'INTEGER', description: 'Severity level (1-5)' },
            { name: 'status', type: 'TEXT', description: 'Case status (Open/Closed)' },
            { name: 'signature', type: 'TEXT', description: 'Perp signature/tag' },
            { name: 'summary', type: 'TEXT', description: 'Narrative summary and clues' }
        ]
    },
    {
        name: 'evidence',
        description: 'Physical evidence collected',
        columns: [
            { name: 'evidence_id', type: 'INTEGER', description: 'Primary key' },
            { name: 'case_id', type: 'INTEGER', description: 'Foreign key to case_files' },
            { name: 'item', type: 'TEXT', description: 'Evidence item name' },
            { name: 'found_at', type: 'TEXT', description: 'Location where found' },
            { name: 'time_found', type: 'TEXT', description: 'Time evidence was found' },
            { name: 'notes', type: 'TEXT', description: 'Observation notes' },
            { name: 'is_key', type: 'INTEGER', description: 'Key evidence flag (0/1)' }
        ]
    },
    {
        name: 'suspects',
        description: 'People of interest in the case',
        columns: [
            { name: 'suspect_id', type: 'INTEGER', description: 'Primary key' },
            { name: 'case_id', type: 'INTEGER', description: 'Foreign key to case_files' },
            { name: 'name', type: 'TEXT', description: 'Suspect name' },
            { name: 'connection', type: 'TEXT', description: 'Connection to case' },
            { name: 'alibi', type: 'TEXT', description: 'Claimed alibi' },
            { name: 'suspicion', type: 'INTEGER', description: 'Suspicion level (1-5)' },
            { name: 'motive_hint', type: 'TEXT', description: 'Possible motive' }
        ]
    },
    {
        name: 'witness_statements',
        description: 'Witness statements for cases',
        columns: [
            { name: 'statement_id', type: 'INTEGER', description: 'Primary key' },
            { name: 'case_id', type: 'INTEGER', description: 'Foreign key to case_files' },
            { name: 'witness_name', type: 'TEXT', description: 'Witness name' },
            { name: 'reliability', type: 'INTEGER', description: 'Reliability rating (1-5)' },
            { name: 'statement', type: 'TEXT', description: 'Witness statement text' }
        ]
    },
    {
        name: 'locations',
        description: 'Location reference data',
        columns: [
            { name: 'location_code', type: 'TEXT', description: 'Primary key (short code)' },
            { name: 'location_name', type: 'TEXT', description: 'Location name' },
            { name: 'district', type: 'TEXT', description: 'District or area' },
            { name: 'coordinates', type: 'TEXT', description: 'Latitude/longitude string' },
            { name: 'description', type: 'TEXT', description: 'Location details' }
        ]
    },
    {
        name: 'time_logs',
        description: 'Activity timestamps and movements',
        columns: [
            { name: 'log_id', type: 'INTEGER', description: 'Primary key' },
            { name: 'timestamp', type: 'TEXT', description: 'Event timestamp' },
            { name: 'location_code', type: 'TEXT', description: 'Foreign key to locations' },
            { name: 'activity', type: 'TEXT', description: 'Activity description' },
            { name: 'person_name', type: 'TEXT', description: 'Person involved' },
            { name: 'notes', type: 'TEXT', description: 'Additional notes' },
            { name: 'case_id', type: 'INTEGER', description: 'Foreign key to case_files' }
        ]
    },
    {
        name: 'connections',
        description: 'Relationships between people and cases',
        columns: [
            { name: 'connection_id', type: 'INTEGER', description: 'Primary key' },
            { name: 'person_a', type: 'TEXT', description: 'First person' },
            { name: 'person_b', type: 'TEXT', description: 'Second person' },
            { name: 'relationship', type: 'TEXT', description: 'Relationship type' },
            { name: 'case_id', type: 'INTEGER', description: 'Foreign key to case_files' },
            { name: 'strength', type: 'INTEGER', description: 'Relationship strength (1-5)' },
            { name: 'notes', type: 'TEXT', description: 'Additional notes' }
        ]
    }
];

if (typeof window !== 'undefined') {
    window.SCHEMA_TABLES = SCHEMA_TABLES;
    window.SCHEMA_RELATIONSHIPS = [
        { left: { table: 'case_files', column: 'case_id' }, right: { table: 'evidence', column: 'case_id' } },
        { left: { table: 'case_files', column: 'case_id' }, right: { table: 'suspects', column: 'case_id' } },
        { left: { table: 'case_files', column: 'case_id' }, right: { table: 'witness_statements', column: 'case_id' } },
        { left: { table: 'case_files', column: 'case_id' }, right: { table: 'time_logs', column: 'case_id' } },
        { left: { table: 'case_files', column: 'case_id' }, right: { table: 'connections', column: 'case_id' } },
        { left: { table: 'time_logs', column: 'location_code' }, right: { table: 'locations', column: 'location_code' } }
    ];
}
