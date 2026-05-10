/**
 * BartaFlow Global Error Handler
 * Catches all unhandled JS errors and notifies the user/developer.
 */
window.onerror = function(message, source, lineno, colno, error) {
    const errorDetails = {
        message: message,
        source: source,
        line: lineno,
        column: colno,
        error: error ? error.stack : 'N/A'
    };

    console.error('💥 Global Error Captured:', errorDetails);

    // If showToast exists (from utils.js), notify the user
    if (window.showToast) {
        window.showToast('❌', 'A system error occurred. Check the console for details.');
    }

    // Return true to prevent the default browser error handling (optional)
    return false; 
};

// Catch unhandled promise rejections (e.g. failed fetch)
window.onunhandledrejection = function(event) {
    console.error('⚡ Unhandled Promise Rejection:', event.reason);
    if (window.showToast) {
        window.showToast('📡', 'Network error or failed API call.');
    }
};
