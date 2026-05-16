/**
 * BartaFlow Component Loader
 * Dynamically loads HTML snippets into the page.
 * This is used for the modular development structure.
 */

async function loadComponent(id, path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        const html = await response.text();
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error(`Error loading component [${id}] from [${path}]:`, error);
    }
}

async function initApp() {
    console.log("🚀 Initializing BartaFlow Modular Shell...");
    
    // Core Elements
    await loadComponent('preloader-root', 'src/core/preloader.html');
    await loadComponent('nav-root', 'src/core/nav.html');
    await loadComponent('footer-root', 'src/core/footer.html');

    // Sections
    await loadComponent('hero-root', 'src/sections/hero.html');
    await loadComponent('marquee-root', 'src/sections/marquee.html');
    await loadComponent('features-root', 'src/sections/features.html');
    await loadComponent('bots-root', 'src/sections/bots.html');
    await loadComponent('voice-root', 'src/sections/voice.html');
    await loadComponent('testimonials-root', 'src/sections/testimonials.html');
    await loadComponent('faq-root', 'src/sections/faq.html');
    await loadComponent('pricing-root', 'src/sections/pricing.html');
    await loadComponent('cta-root', 'src/sections/cta.html');

    // Modals & Overlays
    await loadComponent('auth-root', 'src/modals/auth.html');
    await loadComponent('demo-root', 'src/modals/demo-sched.html');
    await loadComponent('leads-root', 'src/modals/leads-panel.html');
    await loadComponent('chat-root', 'src/modals/chat-widget.html');
    await loadComponent('settings-root', 'src/modals/settings.html');
    await loadComponent('payment-root', 'src/modals/payment.html');
    await loadComponent('email-root', 'src/modals/email.html');
    await loadComponent('legal-root', 'src/modals/legal.html');
    await loadComponent('profile-root', 'src/modals/profile.html');
    await loadComponent('cookie-root', 'src/modals/cookie.html');
    await loadComponent('toast-root', 'src/modals/toast.html');

    console.log("✅ All components loaded.");
    
    // Trigger initializations from other scripts if needed
    // Most scripts run on DOMContentLoaded or have their own init
    if (window.initNav) window.initNav();
    if (window.initTheme) window.initTheme();
}

// Start loading when the script is loaded
// Note: In a production environment, you might want to wait for DOMContentLoaded
// but here we are building the DOM dynamically.
initApp();
