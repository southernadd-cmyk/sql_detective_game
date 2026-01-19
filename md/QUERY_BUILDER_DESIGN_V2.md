# Query Builder Design V2 - Based on SQLZoo, SQL-Noir, SQL Island

## Research: What Works in Similar Interfaces

### SQLZoo Design Patterns
- **Simple 3-column layout**: Schema | Editor | Results
- **Schema panel**: Compact list of tables, click to expand columns
- **Editor**: Single SQL textarea with syntax highlighting
- **Results**: Table view below editor, always visible
- **No complex modals**: Everything in one view
- **Clear visual hierarchy**: Schema (left), Editor (center), Results (bottom)

### SQL-Noir Design Patterns
- **Detective theme**: Pixel art aesthetic
- **Simple interface**: Schema list + SQL editor + Results
- **No wizard steps**: Direct SQL editing with visual schema reference
- **Results inline**: Always visible below editor
- **Minimal UI**: Focus on content, not navigation

### SQL Island Design Patterns
- **Game-based learning**: Story-driven queries
- **Simple layout**: Question | Editor | Results
- **Guided queries**: Pre-written queries with blanks to fill
- **Immediate feedback**: Results show instantly

## Design Principles (What We Learned)

1. **KISS (Keep It Simple, Stupid)**: No complex wizards or multi-step processes
2. **Single View**: Everything visible at once - no hidden panels
3. **Clear Hierarchy**: Schema → Editor → Results (left to right, top to bottom)
4. **Immediate Feedback**: Results always visible, update on query change
5. **No Modals for Core Features**: Query building happens in main view
6. **Fixed Layout**: Predictable, no dynamic resizing

## Proposed Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    QUERY BUILDER                            │
├──────────────┬──────────────────────────────────────────────┤
│              │  [VISUAL] [SQL] [GUIDED]  (Tabs)             │
│   SCHEMA     │  ┌──────────────────────────────────────┐   │
│   ┌────────┐ │  │                                      │   │
│   │ Tables │ │  │         QUERY EDITOR                  │   │
│   │  -tbl1 │ │  │         (Monaco Editor)              │   │
│   │  -tbl2 │ │  │                                      │   │
│   │  -tbl3 │ │  │                                      │   │
│   │        │ │  │                                      │   │
│   │[SCHEMA]│ │  │                                      │   │
│   └────────┘ │  └──────────────────────────────────────┘   │
│              │  ┌──────────────────────────────────────┐   │
│              │  │         QUERY RESULTS                 │   │
│              │  │  (Table/Chart/Evidence views)        │   │
│              │  │                                      │   │
│              │  └──────────────────────────────────────┘   │
└──────────────┴──────────────────────────────────────────────┘
```

## Detailed Layout Specifications

### Overall Structure
- **Fullscreen modal**: 98vh height, 98% width
- **Grid layout**: 2 columns (25% schema, 75% editor/results)
- **No scrolling on main container**: Only internal panels scroll

### Left Column: Schema Panel (25% width)
- **Fixed height**: 100% of modal body
- **Header**: "DATABASE SCHEMA" + [VIEW FULL SCHEMA] button
- **Table list**: Scrollable list of tables
  - Each table: Name + expandable columns
  - Click table name: Show table data inline in results
  - Click column: Add to query (if visual builder)
- **Scrollable**: Only table list scrolls, header fixed

### Right Column: Editor + Results (75% width)
- **Split vertically**: 60% editor, 40% results
- **Tabs**: VISUAL | SQL | GUIDED (fixed height ~40px)
- **Editor area**: 
  - Visual builder: Step-by-step form (if selected)
  - SQL editor: Monaco editor (if selected)
  - Guided: Form fields (if selected)
- **Results area**: 
  - Always visible
  - Table view (default)
  - Chart/Evidence views (toggleable)
  - Scrollable content

## Component Specifications

### 1. Schema Panel
```
Height: 100% of modal body
Width: 25% of modal body
Layout: Flex column
  - Header: flex: 0 0 auto (fixed)
  - Table list: flex: 1 1 auto (scrollable)
```

### 2. Editor Area
```
Height: 60% of right column
Width: 100% of right column
Layout: Flex column
  - Tabs: flex: 0 0 40px (fixed)
  - Content: flex: 1 1 auto (fills remaining)
```

### 3. Results Area
```
Height: 40% of right column
Width: 100% of right column
Layout: Flex column
  - Header: flex: 0 0 auto (fixed)
  - Content: flex: 1 1 auto (scrollable)
```

## Visual Builder Design (Simplified)

Instead of multi-step wizard, use **single-page form**:

```
┌─────────────────────────────────────────┐
│  VISUAL BUILDER                         │
├─────────────────────────────────────────┤
│  FROM: [Dropdown: Select table(s)]     │
│                                         │
│  SELECT: [Checkboxes: Available cols]  │
│    ☐ column1                           │
│    ☐ column2                           │
│    ☐ column3                           │
│                                         │
│  WHERE: [Add Condition]                │
│    [Column] [Operator] [Value] [X]     │
│                                         │
│  [GENERATE SQL] [EXECUTE]              │
└─────────────────────────────────────────┘
```

**Key Changes**:
- Single form, not steps
- All options visible at once
- Dropdown for table selection (supports multiple)
- Checkbox list for columns
- Add/remove conditions dynamically
- Generate SQL button shows preview
- Execute button runs query

## SQL Editor Design

```
┌─────────────────────────────────────────┐
│  SQL EDITOR                             │
├─────────────────────────────────────────┤
│                                         │
│  [Monaco Editor - full height]         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  [EXECUTE] [CLEAR] [FORMAT]            │
└─────────────────────────────────────────┘
```

- Monaco editor fills available space
- Buttons below editor
- Syntax highlighting, autocomplete
- Error messages inline

## Guided Builder Design

```
┌─────────────────────────────────────────┐
│  GUIDED BUILDER                         │
├─────────────────────────────────────────┤
│  What do you want to find?              │
│  [Text input]                           │
│                                         │
│  From which table(s)?                   │
│  [Multi-select dropdown]               │
│                                         │
│  Filter by:                             │
│  [Column] [Operator] [Value]           │
│                                         │
│  [GENERATE & EXECUTE]                  │
└─────────────────────────────────────────┘
```

- Natural language input (optional)
- Form-based query building
- Generates SQL automatically

## CSS Grid/Flexbox Structure

```css
/* Modal Container */
.query-builder-modal .modal-content {
  height: 98vh;
  display: flex;
  flex-direction: column;
}

/* Modal Body - Main Grid */
.query-builder-body {
  display: grid;
  grid-template-columns: 25% 75%;
  grid-template-rows: 1fr;
  gap: 20px;
  flex: 1 1 auto;
  min-height: 0;
}

/* Left: Schema Panel */
.database-files {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.database-files .files-header {
  flex: 0 0 auto;
}

.database-files .table-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

/* Right: Editor + Results */
.computer-monitor {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.screen-content {
  flex: 0 0 60%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.query-results-pane {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
```

## Key Design Decisions

1. **No overflow: hidden on containers**: Use proper flex sizing
2. **Fixed percentages**: 25/75 split, 60/40 split (no dynamic)
3. **Single scrollable area per section**: Schema list, editor content, results content
4. **No nested scrolling**: Each section has one scroll container
5. **Predictable heights**: Use flex-basis percentages, not min/max-height hacks

## Implementation Steps

1. **Simplify HTML structure**: Remove complex nested divs
2. **Implement proper CSS Grid**: 25/75 split with flex children
3. **Fix flex sizing**: Use flex-basis percentages, min-height: 0
4. **Single scroll containers**: One per section, no nested scrolling
5. **Simplify visual builder**: Single form, not wizard steps
6. **Test layout**: Ensure no scrolling on main container
7. **Test responsiveness**: Works at different screen sizes

## Success Criteria

- ✅ No scrolling on main modal container
- ✅ Schema panel scrolls independently
- ✅ Editor area uses available space
- ✅ Results always visible (40% height)
- ✅ All content fits without overflow hidden hacks
- ✅ Layout is predictable and stable
- ✅ Works like SQLZoo/SQL-Noir: simple, clear, functional
