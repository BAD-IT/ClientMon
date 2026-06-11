# ClientMon - Brainstorming & Documentation

## 1. Current State Analysis
ClientMon (Project Aura) is currently a system auditing tool designed to monitor network activity, file system access, and process behavior.
- **Original Implementation:** Began as a Swift/SwiftUI native macOS application (files still exist in `src/Core`, `src/UI`, etc.).
- **Current Direction:** Transitioning to a Python CLI application using `psutil` and macOS `fs_usage` for underlying metrics.
- **Data Scraping:** Working well with `engine.py` using `psutil` and `subprocess` to stream data.

## 2. Brainstorming: The "New GUI" Options
Since the goal is to improve the app and add a "new gui", we have a few potential paths to choose from:

### Option A: Modern Web Dashboard (Recommended)
- **Architecture:** Python backend (FastAPI + WebSockets) + Web Frontend (Vite, HTML/JS/CSS).
- **Pros:** Highly customizable UI, visually impressive (glassmorphism, modern animations), easy to build rich graphs and data tables.
- **Cons:** Requires running a background server.

### Option B: Advanced TUI (Terminal UI)
- **Architecture:** Python using the `Textual` or `Rich` libraries.
- **Pros:** Stays entirely in the terminal, feels like a hacker tool, fast, no separate frontend stack needed.
- **Cons:** Visuals are limited to terminal capabilities.

### Option C: Python Desktop App
- **Architecture:** Python using PyQt, PySide, or CustomTkinter.
- **Pros:** Native desktop window without needing a browser.
- **Cons:** Can be tedious to style to a "premium" standard compared to web tech.

## 3. Brainstorming: New Features
- **Historical Logging:** Save process/network history to a local SQLite database for later auditing, instead of only real-time viewing.
- **Alerting Engine:** Rules engine to alert when an app connects to a new/unknown IP, or writes to a sensitive directory.
- **Visual Graphs:** Time-series charts showing memory/CPU spikes alongside network requests.
- **Filter & Search:** Robust filtering by application name, port, or file path.

## 4. Key Considerations
- **Permissions:** `fs_usage` requires `sudo`. A GUI will need a strategy for elevated privileges (e.g., prompting for password, running a backend service as root).
- **Legacy Code:** We should decide what to do with the old `.swift` files.

---

*(See the implementation plan for the list of questions we need to resolve to move forward.)*
