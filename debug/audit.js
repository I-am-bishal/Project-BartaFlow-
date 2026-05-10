/**
 * BartaFlow Page Auditor
 * Scans the DOM for common issues that lead to bugs.
 */

export function runAudit() {
    console.group('🔍 BartaFlow Page Audit');
    
    // 1. Check for duplicate IDs
    const allElements = document.querySelectorAll('*');
    const ids = {};
    const duplicates = [];
    allElements.forEach(el => {
        if (el.id) {
            if (ids[el.id]) duplicates.push(el.id);
            ids[el.id] = true;
        }
    });
    if (duplicates.length > 0) {
        console.error('❌ Duplicate IDs found:', [...new Set(duplicates)]);
    } else {
        console.log('✅ No duplicate IDs.');
    }

    // 2. Check for broken internal links
    const links = document.querySelectorAll('a[href^="#"]');
    const brokenLinks = [];
    links.forEach(link => {
        const id = link.getAttribute('href').substring(1);
        if (id && !document.getElementById(id)) {
            brokenLinks.push(link.getAttribute('href'));
        }
    });
    if (brokenLinks.length > 0) {
        console.error('❌ Broken anchor links (target ID missing):', brokenLinks);
    } else {
        console.log('✅ All internal links are valid.');
    }

    // 3. Check for images without alt tags
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
        console.warn('⚠️ Images missing alt tags:', images);
    } else {
        console.log('✅ All images have alt tags.');
    }

    // 4. Check for potential horizontal overflow
    const docWidth = document.documentElement.offsetWidth;
    const overflowing = [];
    allElements.forEach(el => {
        if (el.offsetWidth > docWidth) {
            overflowing.push(el);
        }
    });
    if (overflowing.length > 0) {
        console.error('❌ Horizontal overflow detected in elements:', overflowing);
    } else {
        console.log('✅ No horizontal overflow detected.');
    }

    // 5. Check for missing script files (simple check)
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(s => {
        fetch(s.src).catch(() => console.error(`❌ Script failed to load: ${s.src}`));
    });

    console.groupEnd();
    return 'Audit Complete.';
}
