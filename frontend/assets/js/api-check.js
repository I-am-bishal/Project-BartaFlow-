/**
 * BartaFlow Backend Connectivity Check
 * Notifies the developer if the backend is offline.
 */
(function() {
    const API_URL = 'http://localhost:5000/api/health';
    
    async function checkBackend() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                console.log('✅ Backend is connected and running.');
            } else {
                showWarning('Backend responded with an error status.');
            }
        } catch (error) {
            showWarning('Backend is offline. Please run "npm run dev" in the backend folder.');
        }
    }

    function showWarning(msg) {
        console.warn('📡 Backend Warning:', msg);
        
        // Optional: Show a small floating badge in dev mode
        const badge = document.createElement('div');
        badge.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #ff4757;
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 9999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: sans-serif;
        `;
        badge.innerHTML = `⚠️ <strong>API Offline:</strong> ${msg}`;
        document.body.appendChild(badge);
        
        setTimeout(() => badge.remove(), 10000);
    }

    // Only run on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        checkBackend();
    }
})();
