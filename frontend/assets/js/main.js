/**
 * main.js — BartaFlow JS entry point
 *
 * Load order matters. Modules are listed by dependency:
 *   utils  → everything else
 *   leads  → auth, scheduler, payment (all call saveLead)
 *   auth   → email (hooks into showAuthSuccess)
 *   scheduler → email (hooks into confirmDemo)
 *   email  → payment (calls showEmailPreview)
 *
 * All modules are loaded as individual <script> tags in index.html in this order.
 * This file is intentionally minimal — it just documents the load order.
 *
 * Load order in index.html:
 *   1. utils.js
 *   2. theme.js
 *   3. preloader.js
 *   4. nav.js
 *   5. hero.js
 *   6. leads.js
 *   7. auth.js
 *   8. bots.js
 *   9. scheduler.js
 *  10. csv.js
 *  11. voice.js
 *  12. legal.js
 *  13. email.js
 *  14. payment.js
 *  15. cookies.js
 *  16. ui.js        ← last (hooks into other modules via ESC handler etc.)
 *  17. admin.js     ← admin panel (separate)
 */
