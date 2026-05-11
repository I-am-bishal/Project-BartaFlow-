/**
 * BartaFlow Backend Connectivity Check
 * Gracefully handles offline state for the demo.
 */
(function() {
    const API_URL = 'http://localhost:5000/api/health';
    let isOffline = false;
    
    async function checkBackend() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                console.log('✅ BartaFlow Backend: Connected');
            } else {
                handleOffline('Server error');
            }
        } catch (error) {
            handleOffline('Backend offline');
        }
    }

    function handleOffline(reason) {
        isOffline = true;
        console.warn(`📡 BartaFlow Backend: ${reason}. Running in Simulation Mode.`);
        
        // Show a subtle indicator instead of a big red bar
        const status = document.createElement('div');
        status.id = 'api-status-indicator';
        status.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(10, 22, 40, 0.8);
            backdrop-filter: blur(8px);
            color: #8b9ab8;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 10px;
            z-index: 9999;
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 6px;
            font-family: 'DM Mono', monospace;
            pointer-events: none;
            transition: opacity 0.3s;
        `;
        status.innerHTML = `<span style="width:6px;height:6px;background:#ff4757;border-radius:50%;display:inline-block;box-shadow:0 0 8px #ff4757"></span> SIMULATION MODE`;
        document.body.appendChild(status);
        
        // Auto-hide after 5 seconds to stay out of the way
        setTimeout(() => {
            if (status) status.style.opacity = '0';
            setTimeout(() => status.remove(), 300);
        }, 5000);
    }

    // Only run on localhost/127.0.0.1
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
        checkBackend();
    }
})();
