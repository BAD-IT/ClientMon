# Development Progress: Project Aura (Python CLI)

## Current Status
Transitioning from Swift UI to a Robust Python CLI Dashboard.

## Phase 1: Data Scraping & Pipeline
- [x] **Switch Strategy**: Moved to Option 2 (Python/psutil).
- [ ] **Module Setup**: Create `src/` structure for the new Python architecture.
- [ ] **Core Logic**: Implement `ProcessScanner` to monitor active apps and their telemetry.
- [ ] **Data Processing**: Build the "Filter" logic to remove noise from network logs.

## Phase 2: CLI Dashboard Development
- [ ] **Interactive Loop**: Create a menu system for selecting items in terminal. 
- [ ] **View Rendering**: Use rich/tabulate (or standard formatted prints) for clean layouts.
- [ ] **Focus Feature**: Implementation of the "Drill Down" state to view one specific app's data.

## Phase 3: Polish & Review
- [ ] **Alert Highlights**: Highlight "New" or "Unique" entries in a session.
- [ ] **Summary Logic**: Ensure logs are not too long or short.
