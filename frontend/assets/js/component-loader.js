/**
 * BartaFlow Component Loader (v2.0 Professional)
 * Handles dynamic injection of HTML modules with dependency management.
 */

const ComponentLoader = {
    // Registry of components to load
    registry: [
        // Core
        { id: 'preloader-root', path: 'src/core/preloader.html' },
        { id: 'nav-root', path: 'src/core/nav.html' },
        
        // Sections
        { id: 'hero-root', path: 'src/sections/hero.html' },
        { id: 'marquee-root', path: 'src/sections/marquee.html' },
        { id: 'features-root', path: 'src/sections/features.html' },
        { id: 'bots-root', path: 'src/sections/bots.html' },
        { id: 'voice-root', path: 'src/sections/voice.html' },
        { id: 'testimonials-root', path: 'src/sections/testimonials.html' },
        { id: 'faq-root', path: 'src/sections/faq.html' },
        { id: 'pricing-root', path: 'src/sections/pricing.html' },
        { id: 'cta-root', path: 'src/sections/cta.html' },
        
        // Footer
        { id: 'footer-root', path: 'src/core/footer.html' },

        // Modals & Overlays
        { id: 'auth-root', path: 'src/modals/auth.html' },
        { id: 'demo-root', path: 'src/modals/scheduler.html' },
        { id: 'leads-root', path: 'src/modals/leads.html' },
        { id: 'chat-root', path: 'src/core/chat-widget.html' },
        { id: 'settings-root', path: 'src/modals/settings.html' },
        { id: 'profile-root', path: 'src/modals/profile.html' },
        { id: 'voice-agent-root', path: 'src/modals/voice-agent.html' },
        { id: 'payment-root', path: 'src/modals/payment.html' },
        { id: 'email-root', path: 'src/modals/email.html' },
        { id: 'legal-root', path: 'src/modals/legal.html' },
        { id: 'cookie-root', path: 'src/modals/cookie.html' },
        { id: 'csv-root', path: 'src/modals/csv-viewer.html' },
        { id: 'industry-demo-root', path: 'src/modals/industry-demo.html' },
        { id: 'toast-root', path: 'src/modals/toast.html' }
    ],

    // Scripts to load after components
    scripts: [
        'assets/js/utils.js',
        'assets/js/theme.js',
        'assets/js/preloader.js',
        'assets/js/nav.js',
        'assets/js/hero.js',
        'assets/js/leads.js',
        'assets/js/auth.js',
        'assets/js/bots.js',
        'assets/js/scheduler.js',
        'assets/js/csv.js',
        'assets/js/voice.js',
        'assets/js/legal.js',
        'assets/js/email.js',
        'assets/js/payment.js',
        'assets/js/cookies.js',
        'assets/js/ui.js',
        'assets/js/api-check.js',
        'assets/js/error-handler.js'
    ],

    async load(comp) {
        try {
            const response = await fetch(comp.path);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();
            const el = document.getElementById(comp.id);
            if (el) el.innerHTML = html;
        } catch (e) {
            console.error(`[ComponentLoader] Failed to load ${comp.id}:`, e);
        }
    },

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    },

    async init() {
        console.time('🚀 BartaFlow Loaded');
        
        // 1. Load all HTML components in parallel
        await Promise.all(this.registry.map(c => this.load(c)));
        
        // 2. Load all scripts sequentially (to respect dependencies)
        for (const src of this.scripts) {
            await this.loadScript(src);
        }
        
        // 3. Signal that everything is ready
        document.body.classList.add('components-ready');
        window.dispatchEvent(new CustomEvent('BartaFlowReady'));
        
        console.timeEnd('🚀 BartaFlow Loaded');
    }
};

// Start initialization
ComponentLoader.init();
