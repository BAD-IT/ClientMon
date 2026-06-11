# Project Aura - Audit & Observation Tool (Python Edition)

## Overview
A specialized analysis tool for macOS designed to monitor and report on what applications are doing in terms of network activity, file system access, and process behavior. 

Since this is a personal auditing tool, it will be implemented as a **high-fidelity CLI Dashboard**. This allows you to interact with the data directly from your terminal while providing clear, structured views of both "Global" and "Focused" app status.

## Target Architecture
- **Language:** Python 3
- **Primary Library:** `psutil` (for process/network/system metrics)
- **Interface:** Interactive CLI Dashboard (Multi-select/Interactive loops)

## Core Features
1.  **Dashboard View**: A real-time overview of currently active system processes, highlighting their network status and recent file interactions.
2.  **Focus Mode**: An interactive drill-down into a specific selected application, filtering out all noise to show only its private data (Network logs, File paths).
3.  **Audit Report**: Generation of clear summaries that are "not too long, not too short" for the user's review.

## Modules
1.  **CoreEngine (.core)**: Python logic using `psutil` and OS native calls to gather PID info, listener networks, and directory access.
2.  **DataCoordinator**: The bridge that maps raw system metrics into a unified "Observation Object."
3.  **CLI_Dashboard (ui_layer)**: A formatted terminal interface with highlights for new/suspicious behaviors.

## Implementation Phases
1.  **Phase 1: Data Scraping & Pipeline** - Implementing `psutil` integrations and data cleanup logic.
2.  **Phase 2: Dashboard UI Logic** - Building the interactive CLI menu system to select apps and enter "Focus Mode."
3.  **Phase 3: Analysis Polish** - Reporting filters, formatting of IPs/Paths, and summary view generation.
