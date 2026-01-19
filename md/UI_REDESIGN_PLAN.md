# SQL Detective Game - UI Redesign Plan
Based on SQL-Noir, SQL-Island, and SQL learning game best practices

## Executive Summary

This plan restructures the UI to follow proven patterns from successful SQL learning games, addressing current layout issues, null reference errors, and improving overall user experience.

---

## 1. Core UI Principles (From Research)

### Key Conventions from SQL-Noir & SQL-Island:
- **Integrated Schema View**: Always visible alongside query editor (no context switching)
- **Narrative Integration**: Story/clues embedded in main view, not hidden in modals
- **Immediate Feedback**: Query results shown immediately with clear success/error states
- **Minimal Clutter**: Focused panels, clear hierarchy, generous whitespace
- **Progressive Disclosure**: Advanced features available but not overwhelming
- **Visual Query Builder**: Drag-and-drop for beginners, SQL editor for advanced users

---

## 2. Screen Layout Structure

### 2.1 Main Desk (Home Screen)
**Purpose**: Case overview, evidence board, entry point to investigation

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: SQL DETECTIVE | Case: Exeter Graffiti | Progress   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │                  │  │                                  │ │
│  │  CASE FILE       │  │      EVIDENCE BOARD              │ │
│  │  (Narrative)     │  │      (Clues & Findings)          │ │
│  │                  │  │                                  │ │
│  │  - Story text    │  │  - Collected clues              │ │
│  │  - Case details  │  │  - Timeline                     │ │
│  │  - Objectives    │  │  - Suspects                     │ │
│  │                  │  │  - Evidence items               │ │
│  └──────────────────┘  └──────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         [ BUILD QUERY ] - Large, Prominent Button      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Case File Panel** (Left, ~35% width): Story, objectives, current status
- **Evidence Board** (Right, ~65% width): All clues, timeline, suspects, evidence
- **Build Query Button**: Large, centered, always visible

---

### 2.2 Query Builder Modal (Fullscreen)
**Purpose**: Primary workspace for investigation

```
┌─────────────────────────────────────────────────────────────┐
│  QUERY BUILDER                    [X] Close                 │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  SCHEMA      │  QUERY EDITOR                                │
│  PANEL       │                                               │
│  (Left)      │  ┌─────────────────────────────────────────┐ │
│              │  │  [Visual Builder] [SQL Editor] (Tabs)   │ │
│  ┌────────┐  │  ├─────────────────────────────────────────┤ │
│  │ Tables │  │  │                                         │ │
│  │        │  │  │  Visual Builder / SQL Editor            │ │
│  │ - sus  │  │  │                                         │ │
│  │ - loc  │  │  │                                         │ │
│  │ - tim  │  │  │                                         │ │
│  │ - wit  │  │  │                                         │ │
│  │ - evi  │  │  │                                         │ │
│  │ - cctv │  │  │                                         │ │
│  └────────┘  │  └─────────────────────────────────────────┘ │
│              │                                               │
│  Search: [__]│  [ EXECUTE QUERY ] [ CLEAR ]                │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐ │
│              │  │  QUERY RESULTS                           │ │
│              │  │  [Table] [Chart] [Evidence] (Views)     │ │
│              │  │                                         │ │
│              │  │  Results displayed here...               │ │
│              │  │                                         │ │
│              │  └─────────────────────────────────────────┘ │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

**Layout:**
- **Schema Panel** (Left, ~25% width): Tables, columns, always visible, scrollable
- **Query Editor** (Right, ~75% width): 
  - Tabs: Visual Builder | SQL Editor
  - Execute/Clear buttons
  - Results pane below editor (toggleable)

**Key Features:**
- Schema always visible (no hiding)
- Drag-and-drop from schema to builder
- Syntax highlighting in SQL editor
- Immediate results display
- Error messages inline

---

## 3. Component Specifications

### 3.1 Case File Panel
**Location**: Main desk, left side
**Size**: ~35% width, full height
**Content**:
- Case title and description
- Current objectives
- Progress indicators
- Clue count
- Click to expand (full modal)

**Behavior**:
- Always visible on main desk
- Click opens full-screen modal with complete case details
- Updates dynamically as clues are discovered

---

### 3.2 Evidence Board
**Location**: Main desk, right side
**Size**: ~65% width, full height
**Content**:
- Timeline visualization
- Suspect cards
- Evidence items
- Connections/relationships
- Query history summary

**Behavior**:
- Always visible on main desk
- Auto-updates when queries reveal clues
- Click to expand (half-screen modal for detailed view)
- Multiple view modes: Timeline, Grid, Network

---

### 3.3 Schema Panel
**Location**: Query builder modal, left side
**Size**: ~25% width, full height
**Content**:
- Searchable table list
- Expandable table details
- Column names (draggable)
- Table relationships (optional)
- Schema button (opens full schema modal)

**Behavior**:
- Always visible in query builder
- Tables expandable to show columns
- Columns draggable to query builder
- Search/filter functionality
- Click table name to view table data

---

### 3.4 Query Editor
**Location**: Query builder modal, right side
**Size**: ~75% width, full height
**Content**:
- Tab switcher: Visual Builder | SQL Editor
- Visual builder: Drag-and-drop zones
- SQL editor: Monaco editor with syntax highlighting
- Execute/Clear buttons
- Results pane (below editor)

**Behavior**:
- Visual builder is default view
- SQL editor syncs with visual builder
- Syntax validation before execution
- Error messages shown inline
- Query history (optional)

---

### 3.5 Results Display
**Location**: Query builder modal, bottom of right pane
**Size**: ~40% of right pane height (toggleable)
**Content**:
- Table view (default)
- Chart view
- Evidence board view
- Query info (rows returned, execution time)

**Behavior**:
- Auto-displays after query execution
- View toggle buttons
- Expandable to full modal
- Export options (optional)

---

## 4. Layout Specifications

### 4.1 Desktop Layout (>1024px)

**Main Desk:**
```
Grid: 2 columns
- Column 1: 35% (Case File)
- Column 2: 65% (Evidence Board)
- Row below: 100% (Build Query Button)
```

**Query Builder Modal:**
```
Grid: 2 columns
- Column 1: 25% (Schema Panel)
- Column 2: 75% (Query Editor + Results)
  - Editor: 60% height
  - Results: 40% height
```

### 4.2 Tablet Layout (768px - 1024px)

**Main Desk:**
```
Stack vertically:
1. Case File (full width)
2. Evidence Board (full width)
3. Build Query Button
```

**Query Builder Modal:**
```
Stack vertically:
1. Schema Panel (collapsible, top)
2. Query Editor (main area)
3. Results (bottom, collapsible)
```

### 4.3 Mobile Layout (<768px)

**Main Desk:**
```
Stack vertically with tabs:
- Tab 1: Case File
- Tab 2: Evidence Board
- Build Query Button (always visible)
```

**Query Builder Modal:**
```
Full screen with tabs:
- Tab 1: Schema
- Tab 2: Query Editor
- Tab 3: Results
```

---

## 5. Technical Implementation Plan

### 5.1 HTML Structure

```html
<!-- Main Desk -->
<div class="main-desk">
  <header class="game-header">...</header>
  <div class="desk-content">
    <div class="case-panel">...</div>
    <div class="evidence-panel">...</div>
    <button class="build-query-btn">BUILD QUERY</button>
  </div>
</div>

<!-- Query Builder Modal -->
<div id="query-builder-modal" class="modal fullscreen">
  <div class="modal-content">
    <div class="query-builder-layout">
      <aside class="schema-panel">...</aside>
      <main class="query-editor-panel">
        <div class="editor-tabs">...</div>
        <div class="editor-content">...</div>
        <div class="results-panel">...</div>
      </main>
    </div>
  </div>
</div>
```

### 5.2 CSS Grid Layout

```css
/* Main Desk */
.desk-content {
  display: grid;
  grid-template-columns: 35% 65%;
  grid-template-rows: 1fr auto;
  gap: 20px;
  height: calc(100vh - 100px);
}

/* Query Builder */
.query-builder-layout {
  display: grid;
  grid-template-columns: 25% 75%;
  height: 100vh;
}

.query-editor-panel {
  display: grid;
  grid-template-rows: auto 1fr 40%;
  gap: 10px;
}
```

### 5.3 JavaScript Safety Patterns

**Null-Safe Element Access:**
```javascript
function safeGetElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element #${id} not found`);
    return null;
  }
  return element;
}

function safeSetInnerHTML(id, content) {
  const element = safeGetElement(id);
  if (element) {
    element.innerHTML = content;
  }
}

function safeAddEventListener(id, event, handler) {
  const element = safeGetElement(id);
  if (element) {
    element.addEventListener(event, handler);
  }
}
```

**Initialization Pattern:**
```javascript
function initComponent(componentName, initFn) {
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFn);
    } else {
      initFn();
    }
  } catch (error) {
    console.error(`Failed to initialize ${componentName}:`, error);
  }
}
```

---

## 6. User Flow

### 6.1 Game Start Flow
1. User loads game → Main desk appears
2. Case file shows story and objectives
3. Evidence board shows initial clues (if any)
4. User clicks "BUILD QUERY" → Modal opens

### 6.2 Query Building Flow
1. Modal opens with schema visible on left
2. User sees visual builder (default) or switches to SQL
3. User drags tables/columns or types SQL
4. User clicks "EXECUTE"
5. Results appear below editor
6. If clues found → Evidence board updates
7. User can refine query or close modal

### 6.3 Evidence Discovery Flow
1. Query executed successfully
2. Results analyzed for clues
3. Evidence board auto-updates
4. New clues highlighted
5. Case file updates progress
6. User continues investigation

---

## 7. Visual Design Guidelines

### 7.1 Color Scheme
- **Background**: Dark wood/desk texture (#3a2f1f)
- **Panels**: Light paper texture (#f5f1e8)
- **Accents**: Detective theme (browns, golds, dark blues)
- **Text**: Dark on light (#1a1a1a)
- **Highlights**: Gold/yellow for clues (#ffd700)

### 7.2 Typography
- **Headers**: 'Press Start 2P' (pixel font)
- **Body**: System monospace for code, sans-serif for narrative
- **Sizes**: Clear hierarchy (large → small)

### 7.3 Spacing
- **Padding**: Generous (20px minimum)
- **Gaps**: 15-25px between major sections
- **Margins**: Consistent (10px, 20px, 30px scale)

### 7.4 Interactive Elements
- **Buttons**: Clear hover/active states
- **Draggable items**: Visual feedback during drag
- **Drop zones**: Highlight on hover
- **Modals**: Smooth transitions

---

## 8. Error Prevention & Handling

### 8.1 DOM Element Safety
- All DOM queries wrapped in null checks
- Elements created dynamically if missing
- Graceful fallbacks for missing components

### 8.2 Initialization Order
1. Wait for DOM ready
2. Check required elements exist
3. Initialize components in order
4. Handle missing dependencies gracefully

### 8.3 Error Display
- User-friendly error messages
- Console logging for debugging
- Visual indicators for errors
- Recovery suggestions

---

## 9. Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  .desk-content {
    grid-template-columns: 1fr;
  }
  .query-builder-layout {
    grid-template-columns: 1fr;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .desk-content {
    grid-template-columns: 1fr;
  }
  .query-builder-layout {
    grid-template-columns: 30% 70%;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  /* Full layout as specified */
}
```

---

## 10. Implementation Priority

### Phase 1: Core Structure (Critical)
1. Fix null reference errors
2. Implement main desk layout
3. Create query builder modal structure
4. Add schema panel with null-safe rendering

### Phase 2: Functionality (High Priority)
1. Visual query builder integration
2. SQL editor with Monaco
3. Results display system
4. Evidence board updates

### Phase 3: Polish (Medium Priority)
1. Animations and transitions
2. Responsive breakpoints
3. Error handling UI
4. Accessibility improvements

### Phase 4: Enhancements (Low Priority)
1. Query history
2. Export functionality
3. Settings panel
4. Tutorial/help system

---

## 11. Success Metrics

- **No null reference errors** in console
- **Schema always visible** in query builder
- **Evidence board prominent** on main desk
- **Smooth transitions** between states
- **Responsive** on all screen sizes
- **Clear visual hierarchy** throughout

---

## Next Steps

1. Review and approve this plan
2. Create implementation TODO list
3. Begin Phase 1 implementation
4. Test and iterate
5. Move to Phase 2
