document.addEventListener("DOMContentLoaded", () => {
    const switcher = document.getElementById("languageSwitcher");

    // Detect language from URL path (/en/, /es/, etc.)
    const pathLang = window.location.pathname.split("/")[1];
    const supportedLangs = ["en", "es", "de", "fr"];
    let initialLang = supportedLangs.includes(pathLang) ? pathLang : "en";

    switcher.value = initialLang;
    loadLanguage(initialLang);

    // Handle manual switching
    switcher.addEventListener("change", (e) => {
        const selectedLang = e.target.value;
        changeLanguage(selectedLang);
    });
});

function changeLanguage(lang) {
    // Update URL without reloading (for SPA behavior)
    const newUrl = `/${lang}/`;
    window.history.pushState({}, "", newUrl);
    loadLanguage(lang);
}

function loadLanguage(lang) {
    Promise.all([
        fetch(`/meta/${lang}.json`).then(res => res.json()),
        fetch(`/locales/${lang}.json`).then(res => res.json())
    ])
    .then(([meta, trans]) => {
        // Update metadata
        document.title = meta.title;
        updateMetaTag("description", meta.description);
        updateMetaTag("keywords", meta.keywords.join(", "));
        document.documentElement.lang = meta.lang;

        // Update text content
        Object.keys(trans).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (Array.isArray(trans[id])) {
                    el.innerHTML = trans[id].map(item => `<li>${item}</li>`).join("");
                } else {
                    el.innerHTML = trans[id];
                }
            }
        });
    })
    .catch(err => console.error(`Error loading ${lang}:`, err));
}

function updateMetaTag(name, content) {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
}
