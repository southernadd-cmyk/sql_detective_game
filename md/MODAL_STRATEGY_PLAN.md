# Modal Strategy Plan - SQL Detective Game
## Coherent Modal System Design

### Problem Analysis
Currently, there are too many overlapping modals causing confusion:
- **Table Modal**: Opens when clicking tables in schema (shows table details)
- **Results Modal**: Opens for query results (duplicates evidence board)
- **Evidence Modal**: Fullscreen view of evidence board
- **Case Modal**: Fullscreen view of case file
- **Query Builder Modal**: Fullscreen query building workspace
- **Schema Modal**: Database schema reference

**Issues:**
- Table view opens in separate modal when it should be inline
- Results can appear in multiple places (evidence board, results modal, query builder)
- Unclear when to use which modal
- Too many modal layers

---

## Proposed Modal Strategy

### Modal Categories

#### 1. **Workspace Modals** (Fullscreen, Primary Work Areas)
These are the main work areas that take over the screen:

| Modal | Purpose | Size | When to Use |
|-------|---------|------|-------------|
| **Query Builder** | Build and execute queries | Fullscreen (98%) | Click "BUILD QUERY" button |
| **Case File** | View complete case details | Fullscreen (98%) | Click case file on main desk |
| **Evidence Board** | View all evidence/clues | Fullscreen (98%) | Click evidence board on main desk |

**Rules:**
- Only ONE workspace modal open at a time
- Closing one returns to main desk
- These are the primary investigation tools

#### 2. **Reference Modals** (Overlay, Information Only)
These provide reference information without disrupting workflow:

| Modal | Purpose | Size | When to Use |
|-------|---------|------|-------------|
| **Schema Modal** | Database schema reference | Medium (60% width) | Click "SCHEMA" button in query builder |
| **Table Details Modal** | View table structure/details | Medium (60% width) | Click table name in schema panel |

**Rules:**
- Can open OVER workspace modals
- Close independently
- Don't block main workflow

#### 3. **Inline Views** (No Modals)
These should display inline, NOT in modals:

| View | Location | Purpose |
|------|----------|---------|
| **Query Results** | Inside Query Builder Modal (bottom pane) | Show query results immediately |
| **Table Data** | Inside Query Builder Modal (when clicking table) | Show table contents inline |
| **Evidence Updates** | Main desk evidence board | Auto-update as clues discovered |

---

## Detailed Flow

### Main Desk → Query Builder Flow

```
Main Desk
  ├─ Case File (clickable → Case Modal)
  ├─ Evidence Board (clickable → Evidence Modal)
  └─ BUILD QUERY Button → Query Builder Modal (fullscreen)
      ├─ Schema Panel (left 25%)
      │   ├─ Table List
      │   │   ├─ Click table name → Show table data INLINE (right panel)
      │   │   └─ Click "SCHEMA" button → Schema Modal (overlay)
      │   └─ Search/Filter
      └─ Query Editor (right 75%)
          ├─ Visual Builder / SQL Editor (tabs)
          ├─ Execute Button
          └─ Results Pane (bottom 40%)
              ├─ Table View (default)
              ├─ Chart View
              └─ Evidence View
                  └─ Auto-updates Evidence Board on main desk
```

### Key Principles

1. **Results Stay Inline**
   - Query results ALWAYS show in query builder's results pane
   - NO separate results modal
   - Results update evidence board automatically

2. **Table Data Inline**
   - Clicking a table in schema shows its data in the query editor area
   - NO separate table modal for viewing data
   - Table details modal only for structure/metadata

3. **One Primary Modal**
   - Query Builder, Case File, or Evidence Board - only one at a time
   - Reference modals can overlay

4. **Clear Entry/Exit**
   - Always know where you are
   - Clear path back to main desk
   - No nested modal confusion

---

## Implementation Plan

### Phase 1: Remove Confusing Modals

**Remove:**
- ❌ Results Modal (use inline results in query builder)
- ❌ Table Modal for viewing data (use inline view)

**Keep:**
- ✅ Query Builder Modal (fullscreen workspace)
- ✅ Case Modal (fullscreen reference)
- ✅ Evidence Modal (fullscreen reference)
- ✅ Schema Modal (overlay reference)
- ✅ Table Details Modal (overlay, structure only)

### Phase 2: Implement Inline Views

**In Query Builder Modal:**

1. **Table Data View**
   - When clicking table name in schema panel
   - Show table data in right panel (replace query editor temporarily)
   - "Back to Query" button to return
   - OR: Show in results pane below editor

2. **Query Results**
   - Always show in results pane (bottom 40% of right panel)
   - Multiple view modes: Table, Chart, Evidence
   - Auto-scroll to results when query executes
   - Results stay visible while editing next query

### Phase 3: Modal Hierarchy

**Modal Stacking Rules:**
```
Level 1: Main Desk (base)
Level 2: Workspace Modal (Query Builder, Case, Evidence) - fullscreen
Level 3: Reference Modal (Schema, Table Details) - overlay on workspace
```

**Z-Index:**
- Main Desk: z-index: 1
- Workspace Modals: z-index: 100
- Reference Modals: z-index: 200
- Modal Overlay: z-index: 50

### Phase 4: User Experience Flow

**Scenario 1: Viewing Table Data**
1. User in Query Builder Modal
2. Clicks table name in schema panel
3. Table data appears in results pane (or right panel)
4. User can see structure AND data
5. User can drag columns to query builder
6. NO separate modal opens

**Scenario 2: Executing Query**
1. User writes query in Query Builder Modal
2. Clicks "EXECUTE"
3. Results appear in results pane (bottom)
4. Evidence board on main desk auto-updates
5. User can refine query and see new results
6. NO separate results modal

**Scenario 3: Viewing Schema**
1. User in Query Builder Modal
2. Clicks "SCHEMA" button
3. Schema modal opens as overlay (60% width, centered)
4. User can browse schema
5. Closing schema returns to query builder
6. Query builder remains visible behind

---

## Code Structure

### Modal Management

```javascript
// Modal types
const MODAL_TYPES = {
    WORKSPACE: 'workspace',  // Fullscreen, one at a time
    REFERENCE: 'reference'   // Overlay, can stack
};

// Modal registry
const modals = {
    'query-builder-modal': { type: MODAL_TYPES.WORKSPACE, priority: 1 },
    'case-modal': { type: MODAL_TYPES.WORKSPACE, priority: 1 },
    'evidence-modal': { type: MODAL_TYPES.WORKSPACE, priority: 1 },
    'schema-modal': { type: MODAL_TYPES.REFERENCE, priority: 2 },
    'table-modal': { type: MODAL_TYPES.REFERENCE, priority: 2 }
};

// Open modal with hierarchy
function openModal(modalId) {
    const modal = modals[modalId];
    if (modal.type === MODAL_TYPES.WORKSPACE) {
        // Close other workspace modals
        closeAllWorkspaceModals();
    }
    // Open the modal
    showModal(modalId);
}
```

### Inline View Management

```javascript
// Show table data inline in query builder
function showTableDataInline(tableName) {
    // Fetch table data
    const data = fetchTableData(tableName);
    
    // Display in results pane
    const resultsPane = document.getElementById('query-results-pane');
    displayTableView(data, resultsPane);
    
    // Optionally highlight in schema panel
    highlightTableInSchema(tableName);
}

// Show query results inline
function showQueryResultsInline(results) {
    const resultsPane = document.getElementById('query-results-pane');
    displayResults(results, resultsPane);
    
    // Update evidence board on main desk
    updateEvidenceBoard(results);
}
```

---

## Visual Layout

### Query Builder Modal Structure

```
┌─────────────────────────────────────────────────────────────┐
│  QUERY BUILDER                                    [X] Close │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│  SCHEMA      │  QUERY EDITOR                                │
│  (25%)       │  (75%)                                       │
│              │                                               │
│  ┌────────┐ │  ┌─────────────────────────────────────────┐ │
│  │ Tables │ │  │  [Visual Builder] [SQL Editor] (Tabs)    │ │
│  │        │ │  ├─────────────────────────────────────────┤ │
│  │ - sus  │ │  │                                         │ │
│  │ - loc  │ │  │  Editor Area                           │ │
│  │ - tim  │ │  │                                         │ │
│  │        │ │  │                                         │ │
│  │ [SCHEMA]│ │  └─────────────────────────────────────────┘ │
│  └────────┘ │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │  QUERY RESULTS (40% height)             │ │
│              │  │  [Table] [Chart] [Evidence] (Views)     │ │
│              │  │                                         │ │
│              │  │  Results displayed here...              │ │
│              │  │                                         │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

### Table Click Behavior

**Option A: Show in Results Pane**
- Click table → Data appears in results pane
- Query editor remains visible
- Can switch between query results and table data

**Option B: Show in Editor Area**
- Click table → Data replaces editor temporarily
- "Back to Query" button
- Less ideal (hides editor)

**Recommendation: Option A** - Show in results pane

---

## Migration Steps

### Step 1: Remove Results Modal
- Remove `results-modal` from HTML
- Remove `showResultsModal()` function
- Update all result displays to use inline results pane

### Step 2: Update Table Click Behavior
- Remove table modal for data viewing
- Keep table details modal for structure only
- Add inline table data view in query builder

### Step 3: Update Modal System
- Implement modal hierarchy
- Add modal type system
- Update z-index management

### Step 4: Test Flows
- Test query execution → inline results
- Test table click → inline data
- Test schema modal → overlay behavior
- Test evidence board updates

---

## Success Criteria

✅ **No Confusion**
- User always knows where they are
- Clear entry/exit points
- No unexpected modal popups

✅ **Efficient Workflow**
- Results visible while editing
- Table data accessible without leaving query builder
- Schema reference available without losing context

✅ **Consistent Behavior**
- All modals follow same patterns
- Predictable interactions
- Clear visual hierarchy

---

## Next Steps

1. Review and approve this plan
2. Implement Phase 1 (remove confusing modals)
3. Implement Phase 2 (inline views)
4. Test and refine
5. Document final modal system
