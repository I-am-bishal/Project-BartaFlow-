# 🐞 Bug Tracker & Debugging Guide

Use this folder to track issues and access debugging tools.

## 📋 Active Bugs
| ID | Issue | Status | Priority | Notes |
|---|---|---|---|---|
| 001 | Example: Mobile menu overlapping logo on iPhone SE | Open | High | Need to adjust CSS breakpoint |

## 🛠️ Debugging Tools

### 1. Persistent Error Logger
The `debug/logger.js` script overrides `console.error` and `console.warn` to store logs in `sessionStorage`. This allows you to see errors even after a page refresh.

**How to use:**
Add this to the `<head>` of your HTML:
```html
<script src="debug/logger.js"></script>
```
Then, in the console, type `getLogs()` to see the captured errors.

### 2. Page Auditor
The `debug/audit.js` script scans the page for common issues like missing IDs, broken links, or inaccessible elements.

**How to use:**
Run this in your browser console:
```javascript
import('debug/audit.js').then(m => m.runAudit())
```

## 🚀 Common Fixes
- **Sticky Scroll:** If the page is stuck and won't scroll, run `document.body.style.overflow = 'auto'`.
- **Z-Index Issues:** Use the inspector to check if a modal overlay is blocking interactions.
