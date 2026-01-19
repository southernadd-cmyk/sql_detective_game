# Query Builder Redesign Plan - Accessible & Student-Focused

## Executive Summary

This plan outlines a complete redesign of the query builder to be:
- **Fully accessible** (WCAG 2.1 AA compliant)
- **Student-friendly** with clear guidance and learning support
- **Multiple input methods** (drag-drop, keyboard, buttons)
- **Pixel art aesthetic** maintained
- **Intuitive and easy to use**

---

## 1. Accessibility Requirements (WCAG 2.1 AA)

### 1.1 Keyboard Navigation
- ✅ All interactive elements keyboard accessible
- ✅ Logical tab order
- ✅ Focus indicators visible (high contrast, pixel art style)
- ✅ Keyboard shortcuts for common actions
- ✅ Escape key closes modals
- ✅ Arrow keys navigate lists
- ✅ Enter/Space activates buttons

### 1.2 Screen Reader Support
- ✅ All elements have ARIA labels
- ✅ Live regions for dynamic content
- ✅ Role attributes (button, listbox, region)
- ✅ State announcements (selected, expanded, etc.)
- ✅ Descriptive labels for all inputs
- ✅ Error messages announced

### 1.3 Visual Accessibility
- ✅ High contrast (4.5:1 minimum)
- ✅ Focus indicators (2px solid border, high contrast)
- ✅ Color not sole indicator of state
- ✅ Text alternatives for icons
- ✅ Resizable text (up to 200% without loss of function)

### 1.4 Motor Accessibility
- ✅ Large click targets (minimum 44x44px)
- ✅ No time limits
- ✅ No hover-only interactions
- ✅ Drag-and-drop with keyboard alternative

---

## 2. Student-Centered Design Principles

### 2.1 Progressive Disclosure
- Start simple (SELECT, FROM)
- Reveal advanced features (WHERE, JOIN, ORDER BY) as needed
- Contextual help appears when relevant

### 2.2 Clear Guidance
- Step-by-step instructions
- Visual indicators of progress
- Examples and templates
- Real-time feedback

### 2.3 Learning Support
- Query explanation mode
- Syntax hints
- Common patterns library
- Error messages with learning tips

### 2.4 Multiple Learning Styles
- Visual (drag-and-drop)
- Textual (SQL editor)
- Interactive (button-based builder)
- Auditory (screen reader support)

---

## 3. New Query Builder Architecture

### 3.1 Three Input Methods

#### Method 1: Visual Builder (Enhanced)
- **Button-based selection** (primary method)
- Drag-and-drop (secondary, optional)
- Clear visual feedback
- Step-by-step wizard interface

#### Method 2: SQL Editor (Enhanced)
- Monaco editor with full accessibility
- Syntax highlighting
- Autocomplete with keyboard navigation
- Query templates

#### Method 3: Guided Builder (New)
- Wizard-style step-by-step interface
- Radio buttons and checkboxes
- Dropdown menus
- Form-based input

### 3.2 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ QUERY BUILDER                    [X] Close              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│ ┌──────────────┐  ┌──────────────────────────────────┐ │
│ │              │  │  [VISUAL] [SQL] [GUIDED]         │ │
│ │  DATABASE    │  │  ──────────────────────────────  │ │
│ │  FILES       │  │                                   │ │
│ │              │  │  [Query Builder Content]         │ │
│ │  [Tables]    │  │                                   │ │
│ │  [Schema]    │  │                                   │ │
│ │              │  │                                   │ │
│ └──────────────┘  └──────────────────────────────────┘ │
│                                                           │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ QUERY RESULTS                                         │ │
│ │ [Table] [Chart] [Board]                              │ │
│ │ ──────────────────────────────────────────────────── │ │
│ │ [Results displayed here]                             │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Visual Builder Redesign

### 4.1 Current Problems
- ❌ Drag-and-drop is hard to discover
- ❌ No keyboard alternative
- ❌ Unclear what to do
- ❌ Poor visual feedback
- ❌ No guidance for students

### 4.2 New Design

#### Step 1: SELECT Columns
```
┌─────────────────────────────────────────┐
│ STEP 1: SELECT COLUMNS                  │
├─────────────────────────────────────────┤
│                                         │
│ Available Columns:                      │
│ ┌─────────────────────────────────────┐ │
│ │ [ ] suspects.name                   │ │
│ │ [ ] suspects.age                    │ │
│ │ [ ] suspects.occupation              │ │
│ │ [✓] suspects.suspicious_level       │ │
│ │ [ ] locations.name                   │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Selected:                                │
│ ┌─────────────────────────────────────┐ │
│ │ [X] suspects.suspicious_level        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [SELECT ALL (*)] [CLEAR]                │
│                                         │
│ [NEXT: Choose Table →]                  │
└─────────────────────────────────────────┘
```

**Accessibility Features:**
- Checkboxes for column selection (keyboard accessible)
- Clear labels and descriptions
- ARIA live region for selection count
- Keyboard shortcuts (Space to toggle, Arrow keys to navigate)

#### Step 2: FROM Table
```
┌─────────────────────────────────────────┐
│ STEP 2: SELECT TABLE                    │
├─────────────────────────────────────────┤
│                                         │
│ Choose a table:                         │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │ suspects │ │locations │ │ timeline  ││
│ │          │ │          │ │          ││
│ │ People of│ │Crime     │ │Chronologic││
│ │ interest │ │locations │ │al events ││
│ └──────────┘ └──────────┘ └──────────┘│
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ │witnesses │ │ evidence │ │   cctv    ││
│ │          │ │          │ │          ││
│ │Witness   │ │Physical   │ │Security  ││
│ │statements│ │evidence   │ │footage   ││
│ └──────────┘ └──────────┘ └──────────┘│
│                                         │
│ Selected: [suspects]                    │
│                                         │
│ [← BACK] [NEXT: Add Conditions →]      │
└─────────────────────────────────────────┘
```

**Accessibility Features:**
- Radio button group (keyboard navigable)
- Card-based selection with clear focus states
- ARIA labels describing each table
- Keyboard navigation (Arrow keys, Enter to select)

#### Step 3: WHERE Conditions (Optional)
```
┌─────────────────────────────────────────┐
│ STEP 3: ADD CONDITIONS (Optional)        │
├─────────────────────────────────────────┤
│                                         │
│ [ADD CONDITION]                          │
│                                         │
│ Conditions:                              │
│ ┌─────────────────────────────────────┐ │
│ │ Column: [suspects.suspicious_level ▼]│ │
│ │ Operator: [> ▼]                      │ │
│ │ Value: [___5___]                      │ │
│ │ [X] Remove                            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [AND] [OR] (between conditions)         │
│                                         │
│ [← BACK] [SKIP] [NEXT: Review →]        │
└─────────────────────────────────────────┘
```

**Accessibility Features:**
- Form inputs with labels
- Dropdown menus (keyboard accessible)
- Clear remove buttons
- ARIA descriptions for operators

#### Step 4: Review & Execute
```
┌─────────────────────────────────────────┐
│ STEP 4: REVIEW QUERY                    │
├─────────────────────────────────────────┤
│                                         │
│ Generated SQL:                          │
│ ┌─────────────────────────────────────┐ │
│ │ SELECT suspicious_level             │ │
│ │ FROM suspects                       │ │
│ │ WHERE suspicious_level > 5          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [EDIT] [COPY SQL]                        │
│                                         │
│ [← BACK] [EXECUTE QUERY]                │
└─────────────────────────────────────────┘
```

**Accessibility Features:**
- Read-only code block with proper ARIA
- Clear action buttons
- Copy to clipboard functionality

---

## 5. Guided Builder (New)

### 5.1 Purpose
- Alternative to visual builder
- Form-based, fully keyboard accessible
- Better for students who prefer structured input
- No drag-and-drop required

### 5.2 Interface
```
┌─────────────────────────────────────────┐
│ GUIDED QUERY BUILDER                    │
├─────────────────────────────────────────┤
│                                         │
│ 1. What do you want to see?            │
│    ○ All columns (*)                    │
│    ● Specific columns                   │
│                                         │
│    If specific columns:                 │
│    Table: [suspects ▼]                  │
│    Columns:                             │
│    [✓] name                             │
│    [✓] age                              │
│    [ ] occupation                       │
│    ...                                  │
│                                         │
│ 2. Which table?                         │
│    [suspects ▼]                         │
│                                         │
│ 3. Filter results? (Optional)         │
│    [ ] Yes, add conditions              │
│                                         │
│    If yes:                              │
│    Column: [suspicious_level ▼]        │
│    Is: [greater than ▼]                │
│    Value: [___5___]                     │
│                                         │
│ [PREVIEW SQL] [EXECUTE]                 │
└─────────────────────────────────────────┘
```

---

## 6. SQL Editor Enhancements

### 6.1 Accessibility Improvements
- Full keyboard navigation
- Screen reader announcements for errors
- Line number announcements
- Autocomplete with keyboard navigation
- Query templates accessible via keyboard

### 6.2 Learning Features
- Syntax explanation on hover/focus
- Common patterns sidebar
- Query history
- Format query button

---

## 7. Implementation Details

### 7.1 HTML Structure
```html
<div id="query-builder-modal" class="modal" role="dialog" aria-labelledby="qb-title" aria-modal="true">
  <div class="modal-content">
    <button class="close" aria-label="Close query builder">×</button>
    <h2 id="qb-title">Query Builder</h2>
    
    <!-- Tab Navigation -->
    <div role="tablist" aria-label="Query builder methods">
      <button role="tab" aria-selected="true" aria-controls="visual-panel">Visual</button>
      <button role="tab" aria-selected="false" aria-controls="sql-panel">SQL</button>
      <button role="tab" aria-selected="false" aria-controls="guided-panel">Guided</button>
    </div>
    
    <!-- Visual Builder Panel -->
    <div role="tabpanel" id="visual-panel" aria-labelledby="visual-tab">
      <!-- Step-by-step wizard -->
    </div>
    
    <!-- SQL Editor Panel -->
    <div role="tabpanel" id="sql-panel" aria-labelledby="sql-tab">
      <!-- Monaco editor with ARIA -->
    </div>
    
    <!-- Guided Builder Panel -->
    <div role="tabpanel" id="guided-panel" aria-labelledby="guided-tab">
      <!-- Form-based builder -->
    </div>
  </div>
</div>
```

### 7.2 ARIA Attributes
- `role="dialog"` for modal
- `aria-modal="true"` for modal
- `aria-labelledby` for titles
- `aria-describedby` for descriptions
- `aria-live="polite"` for dynamic updates
- `aria-expanded` for collapsible sections
- `aria-selected` for tabs
- `aria-controls` for tab panels
- `aria-label` for icon-only buttons

### 7.3 Keyboard Shortcuts
- `Tab` / `Shift+Tab`: Navigate
- `Enter` / `Space`: Activate
- `Escape`: Close modal
- `Arrow keys`: Navigate lists/options
- `Ctrl+Enter`: Execute query
- `Ctrl+/`: Toggle help

### 7.4 Focus Management
- Focus trap in modal
- Focus returns to trigger on close
- Focus moves to first error
- Focus indicators visible (2px solid border)

---

## 8. Visual Design (Pixel Art)

### 8.1 Maintained Elements
- Pixel font (Press Start 2P)
- Pixelated borders
- Retro color scheme
- 3D button effects

### 8.2 New Elements
- Step indicators (progress bar)
- Clear focus indicators
- High contrast focus states
- Accessible color combinations

### 8.3 Color Contrast
- Text: 4.5:1 minimum
- Focus indicators: 3:1 minimum
- Interactive elements: Clear distinction

---

## 9. Testing Checklist

### 9.1 Keyboard Testing
- [ ] All elements keyboard accessible
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Shortcuts work

### 9.2 Screen Reader Testing
- [ ] All content announced
- [ ] States announced
- [ ] Errors announced
- [ ] Navigation clear
- [ ] Labels descriptive

### 9.3 Visual Testing
- [ ] High contrast maintained
- [ ] Focus visible
- [ ] Text resizable
- [ ] Color not sole indicator

### 9.4 Functional Testing
- [ ] All three methods work
- [ ] Query generation correct
- [ ] Results display properly
- [ ] Error handling works

---

## 10. Implementation Phases

### Phase 1: Foundation (Week 1)
1. Update HTML structure with ARIA
2. Implement keyboard navigation
3. Add focus management
4. Create step-by-step visual builder

### Phase 2: Guided Builder (Week 2)
1. Build form-based guided builder
2. Add validation and error handling
3. Implement query generation
4. Test accessibility

### Phase 3: Enhancements (Week 3)
1. Improve SQL editor accessibility
2. Add learning features
3. Implement query templates
4. Polish visual design

### Phase 4: Testing & Refinement (Week 4)
1. Comprehensive accessibility testing
2. User testing with students
3. Fix issues
4. Documentation

---

## 11. Success Metrics

### Accessibility
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation 100%
- ✅ Screen reader compatible
- ✅ No accessibility violations

### Usability
- ✅ Students can build queries in < 2 minutes
- ✅ Error rate < 10%
- ✅ Satisfaction score > 4/5
- ✅ Learning curve < 5 minutes

### Technical
- ✅ All features functional
- ✅ No console errors
- ✅ Performance < 100ms interactions
- ✅ Works on all modern browsers

---

## 12. Next Steps

1. **Review and approve this plan**
2. **Begin Phase 1 implementation**
3. **Set up accessibility testing tools**
4. **Create component library**
5. **Start with visual builder redesign**

---

## Appendix: WCAG 2.1 AA Checklist

- ✅ 1.1.1 Non-text Content (Level A)
- ✅ 1.3.1 Info and Relationships (Level A)
- ✅ 1.4.3 Contrast (Minimum) (Level AA)
- ✅ 2.1.1 Keyboard (Level A)
- ✅ 2.1.2 No Keyboard Trap (Level A)
- ✅ 2.4.3 Focus Order (Level A)
- ✅ 2.4.7 Focus Visible (Level AA)
- ✅ 3.2.1 On Focus (Level A)
- ✅ 4.1.2 Name, Role, Value (Level A)
- ✅ 4.1.3 Status Messages (Level AA)
