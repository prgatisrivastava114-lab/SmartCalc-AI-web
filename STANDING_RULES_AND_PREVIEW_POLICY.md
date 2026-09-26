# MY FINANCIAL PLAN — STANDING RULE & PREVIEW DEPLOYMENT POLICY

**Effective Date**: 2026-09-26  
**Scope**: All future website, webapp, Flutter app, and backend modification requests.

---

## 📌 MANDATORY DEPLOYMENT RULE

1. **NO UNAPPROVED LIVE PUSHES**:
   - Never push code modifications, feature additions, or UI changes directly to the live GitHub `main` branch or production environment without prior user approval.

2. **PREVIEW FIRST PROCEDURE**:
   - For every feature request or code change, modify the workspace files locally first.
   - Start a live preview server (e.g. `python3 -m http.server 8080`) or local dev process.
   - Present the preview link / port to the user for side-by-side inspection.

3. **EXPLICIT CONFIRMATION REQUIRED**:
   - Present the visual changes, affected files, and preview links.
   - Ask the user: *"Would you like to approve and deploy these changes to live production?"*
   - Execute git commit and push to `main` branch **ONLY AFTER** receiving explicit confirmation and approval from the user.

4. **ROLLBACK CAPABILITY**:
   - Maintain clean local workspace snapshots so any rejected preview can be safely discarded or adjusted without affecting live production.

---

**Status**: ACTIVE & STRICTLY ENFORCED.
