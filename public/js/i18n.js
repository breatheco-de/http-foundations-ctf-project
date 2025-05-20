const defaultLang = 'en';
let currentLang = defaultLang;
let translations = {};

// Function to set the language and redirect
function setLanguageAndRedirect(lang, redirectUrl) {
    localStorage.setItem('selectedLanguage', lang);
    window.location.href = redirectUrl;
}

document.addEventListener('DOMContentLoaded', async () => {
    const_current_page_path_ = window.location.pathname;
    const_url_params_ = new URLSearchParams(window.location.search);
    const_query_lang_ = const_url_params_.get('lang');

    // If on select-language.html and lang query param exists, set and redirect
    if (const_current_page_path_ === '/' || const_current_page_path_.endsWith('select-language.html')) {
        if (const_query_lang_ && ['en', 'es'].includes(const_query_lang_)) {
            // The backend now handles this redirect if lang is in query param when accessing root.
            // This client-side check is a fallback or for direct navigation to select-language.html with ?lang=
            // To avoid a redirect loop if backend already handled it, we only act if localStorage isn't already set to query_lang
            if (localStorage.getItem('selectedLanguage') !== const_query_lang_) {
                setLanguageAndRedirect(const_query_lang_, '/welcome.html');
                return; // Stop further processing to allow redirect to happen
            }
        }
    }

    const_saved_lang_ = localStorage.getItem('selectedLanguage');

    // Determine language: 1. localStorage, 2. query param, 3. browser default, 4. defaultLang
    const storedLang = localStorage.getItem('hidaLang');
    const queryLang = new URLSearchParams(window.location.search).get('lang');
    const browserLang = navigator.language.split('-')[0]; // Get primary language e.g., 'en' from 'en-US'

    if (queryLang && ['en', 'es'].includes(queryLang)) {
        currentLang = queryLang;
        localStorage.setItem('hidaLang', currentLang); // Store if changed via query
    } else if (storedLang && ['en', 'es'].includes(storedLang)) {
        currentLang = storedLang;
    } else if (['en', 'es'].includes(browserLang)) {
        currentLang = browserLang;
        localStorage.setItem('hidaLang', currentLang); // Store browser default if used
    } else {
        currentLang = defaultLang;
        localStorage.setItem('hidaLang', currentLang); // Store default
    }

    await loadTranslations(currentLang);
    translatePage();
});

async function loadTranslations(lang) {
    try {
        const response = await fetch(`/js/locales/${lang}.json`);
        if (!response.ok) {
            console.error(`Could not load translation file for ${lang}: ${response.status}`);
            // Fallback to default language if the selected one fails to load
            if (lang !== defaultLang) {
                console.warn(`Falling back to ${defaultLang} translations.`);
                await loadTranslations(defaultLang);
                currentLang = defaultLang; // Update currentLang to reflect fallback
                localStorage.setItem('hidaLang', currentLang);
            }
            return;
        }
        translations = await response.json();
        console.log(`Translations loaded for ${lang}:`, translations);
    } catch (error) {
        console.error(`Error fetching or parsing translation file for ${lang}:`, error);
        if (lang !== defaultLang) {
            console.warn(`Falling back to ${defaultLang} translations due to error.`);
            await loadTranslations(defaultLang);
            currentLang = defaultLang;
            localStorage.setItem('hidaLang', currentLang);
        }
    }
}

function translatePage() {
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        const keyAttribute = element.getAttribute('data-i18n-key');
        
        // Check for attribute-specific translation first, e.g., "[alt]key_name"
        if (keyAttribute.startsWith('[') && keyAttribute.includes(']')) {
            const endBracketIndex = keyAttribute.indexOf(']');
            const attributeName = keyAttribute.substring(1, endBracketIndex);
            const translationKey = keyAttribute.substring(endBracketIndex + 1);
            if (translations[translationKey]) {
                element.setAttribute(attributeName, translations[translationKey]);
            }
        } else {
            // Fallback to innerHTML/textContent translation
            if (translations[keyAttribute]) {
                // Use innerHTML because some translations might contain HTML tags like <strong> or <a>
                element.innerHTML = translations[keyAttribute];
            }
        }
    });
    // Also translate the document title if a key is set for it
    // Adjusted to use the general translations object for the title key
    const titleElement = document.querySelector('title');
    const titleKey = titleElement ? titleElement.getAttribute('data-i18n-key') : null; 
    if (titleKey && translations[titleKey]) { 
        document.title = translations[titleKey];
    } else if (translations['document_title_welcome'] && window.location.pathname.includes('welcome.html')) { // Fallback for welcome page if title element itself isn't keyed directly for some reason
        document.title = translations['document_title_welcome'];
    } else if (translations['login_page_title'] && window.location.pathname.includes('login.html')) { // Fallback for login page
        document.title = translations['login_page_title'];
    }
    // Add more specific title fallbacks if needed or ensure all <title> tags have data-i18n-key
}

async function setLanguage(lang) {
    if (!['en', 'es'].includes(lang)) {
        console.warn(`Language ${lang} not supported. Defaulting to ${currentLang}.`);
        return;
    }
    currentLang = lang;
    localStorage.setItem('hidaLang', currentLang);
    loadTranslations(currentLang).then(() => {
        translatePage();
    });
} 