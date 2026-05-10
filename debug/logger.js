/**
 * BartaFlow Debug Logger
 * Captures console errors and warnings into sessionStorage for post-refresh analysis.
 */

(function() {
    const LOG_KEY = 'bartaflow_debug_logs';
    
    function saveLog(type, args) {
        let logs = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            type: type,
            message: Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '),
            url: window.location.href
        });
        // Keep only last 50 logs
        if (logs.length > 50) logs.shift();
        sessionStorage.setItem(LOG_KEY, JSON.stringify(logs));
    }

    // Wrap console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = function() {
        saveLog('ERROR', arguments);
        originalError.apply(console, arguments);
    };

    console.warn = function() {
        saveLog('WARN', arguments);
        originalWarn.apply(console, arguments);
    };

    // Helper to retrieve logs
    window.getLogs = function() {
        const logs = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]');
        console.table(logs);
        return logs;
    };

    window.clearLogs = function() {
        sessionStorage.removeItem(LOG_KEY);
        console.log('Debug logs cleared.');
    };

    console.log('🐞 Debug Logger initialized. Type getLogs() to view captured errors.');
})();
