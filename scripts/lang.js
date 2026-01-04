// Language Switcher Logic
const LANG_KEY = 'heming_lang_pref';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject the OpenCC library if not present (using the light version for common chars)
    if (!document.getElementById('opencc-lib')) {
        const script = document.createElement('script');
        script.id = 'opencc-lib';
        script.src = 'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js';
        script.onload = initLanguageSwitcher;
        document.head.appendChild(script);
    } else {
        initLanguageSwitcher();
    }
});

function initLanguageSwitcher() {
    // Add button to nav if not already there
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && !document.getElementById('lang-toggle')) {
        const btn = document.createElement('button');
        btn.id = 'lang-toggle';
        btn.className = 'lang-btn';
        btn.innerHTML = '繁'; // Default to showing "Switch to Traditional" button
        btn.onclick = toggleLanguage;
        navLinks.appendChild(btn);
    }

    // Apply saved preference
    const savedLang = localStorage.getItem(LANG_KEY);
    if (savedLang === 'tw') {
        convertToTraditional(false); // false = don't toggle, just apply
    }
}

let isTraditional = false;
let s2tCallback = null;
let t2sCallback = null;

async function toggleLanguage() {
    const btn = document.getElementById('lang-toggle');

    if (!isTraditional) {
        // Switch to Traditional
        await convertToTraditional(true);
        btn.innerHTML = '简';
        localStorage.setItem(LANG_KEY, 'tw');
    } else {
        // Switch to Simplified
        await convertToSimplified(true);
        btn.innerHTML = '繁';
        localStorage.setItem(LANG_KEY, 'cn');
    }
}

async function convertToTraditional(updateState) {
    if (!window.OpenCC) return;

    if (!s2tCallback) {
        const converter = window.OpenCC.Converter({ from: 'cn', to: 'tw' });
        s2tCallback = rootNode => {
            const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                // Skip script/style tags
                if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) continue;
                node.nodeValue = converter(node.nodeValue);
            }
        };
    }

    s2tCallback(document.body);
    if (updateState) isTraditional = true;

    // Update button text if simpler way was saved
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.innerHTML = '简';
    isTraditional = true; // Force state
}

async function convertToSimplified(updateState) {
    // Making it fully robust requires storing original text or reverse conversion.
    // For simplicity with OpenCC, simple reverse works well enough for UI.
    // However, T2S can be lossy. A better approach for a "toggle" is reload or simple reverse.
    // Since this is a static site, 'location.reload()' is the cleanest way to reset to Simplified (Original)
    // BUT that is jarring.
    // Let's try reverse conversion.

    if (!window.OpenCC) return;

    if (!t2sCallback) {
        const converter = window.OpenCC.Converter({ from: 'tw', to: 'cn' });
        t2sCallback = rootNode => {
            const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) continue;
                node.nodeValue = converter(node.nodeValue);
            }
        };
    }

    t2sCallback(document.body);
    if (updateState) isTraditional = false;
}
