# Git Commit & Contribution Graph Rule

Whenever creating, modifying, committing, or pushing code to GitHub, strictly follow this workflow:

## Required Pre-Push & Post-Commit Protocol

1. **Check Repository & Remote**:
   - `git remote -v`
   - `git branch --show-current`
   - `git status`

2. **Verify Git Author Identity**:
   - Ensure `git config user.name` is configured correctly (e.g., `ashmithai23`).
   - Ensure `git config user.email` matches an email associated with the GitHub account (e.g., `ashmith.ai23@sahyadri.edu.in`).
   - Do NOT use random, system, or AI-generated emails.

3. **Verify Push Branch**:
   - Push to the correct default branch (normally `main`).

4. **Verification & Audit**:
   - Verify local commit exists: `git log -1 --pretty=format:"%h %an <%ae>"`
   - Push to remote branch: `git push origin <branch>`
   - Confirm author email matches GitHub account.

5. **Reporting Template**:
   - Repository: `<remote-url>`
   - Branch: `<branch>`
   - Commit hash: `<hash>`
   - Commit author/email: `<name> <<email>>`
   - Push status: `<status>`
   - Contribution graph visibility note: `<note>`
