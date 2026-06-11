# Gemini Agent Workflow Rules

Welcome to the ClientMon repository! Any AI assistant or agent working on this project must adhere strictly to the following workflows and conventions.

## Tech Stack
- **Backend**: Python 3.14+, Starlette, `psutil`, `uvicorn`.
- **Frontend**: Vanilla TypeScript, Vite, plain CSS (Glassmorphism design).
- **Tooling**: `uv` for Python package management, `npm` for Node.

## Issue-Driven Development Workflow
We follow a strict Issue-Driven Development (IDD) and Test-Driven Development (TDD) workflow for all new features and bug fixes:

1. **Create an Issue**: Use the GitHub CLI to create an issue outlining the requirements.
   ```bash
   gh issue create --title "Feature description" --body "Detailed requirements"
   ```
2. **Branch Out**: Check out a new feature branch tied to the issue number.
   ```bash
   git checkout -b feature/issue-<number>-<short-name>
   ```
3. **Implement**: Write the backend/frontend code according to the Clean Architecture patterns established in the repo.
4. **Test**: Write a `pytest` test in the `tests/` directory to validate the logic. Run it locally via `uv` to ensure everything passes before committing.
   ```bash
   uv run --with pytest pytest
   ```
5. **Commit**: Commit the code with a message that explicitly fixes the issue.
   ```bash
   git commit -m "Fixes #<number>: Brief description of changes"
   ```
6. **Pull Request**: Push the branch and create a PR.
   ```bash
   git push origin feature/issue-<number>-<short-name>
   gh pr create --fill
   ```
7. **Merge**: Merge the PR and delete the remote branch.
   ```bash
   gh pr merge --merge --delete-branch
   ```

## Architectural & Security Rules
- **Non-blocking Backend**: Any heavy scanning (`psutil`, `lsof`) must be optimized ($O(N)$ mappings) or placed in background task loops (`tasks.py`) to prevent CPU spikes.
- **Strict Typing**: The frontend state must be strictly typed and managed via the `state.ts` module. 
- **Security**: Always use the `escapeHTML()` utility located in `utils.ts` when rendering backend strings into the DOM to prevent XSS vulnerabilities.
