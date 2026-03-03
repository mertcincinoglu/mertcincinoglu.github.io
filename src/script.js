document.addEventListener('DOMContentLoaded', () => {

    // ─── Determine language (URL param > localStorage > browser) ──────────────
    const urlLang = new URLSearchParams(location.search).get('lang');
    const saved = localStorage.getItem('cv-lang');
    const browserLang = (navigator.language || 'en').toLowerCase();
    const lang = urlLang || saved || (browserLang.startsWith('tr') ? 'tr' : 'en');
    const isTR = (lang === 'tr');
    // Sync localStorage with current lang
    localStorage.setItem('cv-lang', lang);

    // If URL has no ?lang=, redirect so URL always shows the language
    if (!urlLang) {
        location.replace(location.pathname + '?lang=' + lang);
        return;
    }

    // Helper: get translation by dot-notation key
    const all = window.CV_TRANSLATIONS || {};
    function t(key) {
        const entry = all[key];
        return entry ? (entry[lang] || entry['en'] || '') : '';
    }

    // ─── Apply translations to DOM ────────────────────────────────────────────
    function setText(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.textContent = val;
    }
    function setHTML(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.innerHTML = val;
    }

    // html lang attr
    document.documentElement.lang = lang;

    // Page titles & Brand
    setText('page-title', t('pageTitle'));
    setText('loader-title', t('loaderTitle'));
    setText('brand-name', t('brandName'));

    // Loader text
    setText('loader-label', t('loader'));

    // Nav
    setText('nav-home', t('nav.home'));
    setText('nav-games', t('nav.games'));
    setText('nav-projects', t('nav.projects'));
    setText('nav-about', t('nav.about'));
    setText('nav-contact', t('nav.contact'));

    // Hero Section
    setText('hero-name-1', t('hero.name1'));
    setText('hero-name-2', t('hero.name2'));
    setText('sub-1', t('hero.sub1'));
    setText('sub-3', t('subtitle3'));
    setHTML('btn-games', t('btnGames'));
    setHTML('btn-github', t('social.github'));
    setHTML('btn-linkedin', t('social.linkedin'));
    setHTML('btn-youtube', t('social.youtube'));
    setHTML('btn-instagram', t('social.instagram'));

    // Stat labels
    setText('stat-exp-lbl', t('stats.level'));
    setText('stat-class-lbl', t('stats.class'));
    setText('stat-exp2-lbl', t('stats.experience'));
    setText('stat-engine-lbl', t('stats.engine'));
    setText('stat-faction-lbl', t('stats.guild'));
    setText('stat-loc-lbl', t('stats.location'));
    setText('stat-status-lbl', t('stats.status'));

    // Simple stat values
    setText('val-class', t('values.class'));
    setText('val-status-text', t('values.statusActive'));
    setText('val-exp', '0'); // Initial value (will count up later)

    // Lang toggle label + checked state
    setText('lang-label', t('langLabel'));
    const toggle = document.getElementById('lang-switch');
    if (toggle) toggle.checked = isTR;

    // ─── Initialize page behavior ─────────────────────────────────────────────
    function initPage() {
        // ─── Loader hide (after bar animation: 1.1s + fade: 0.4s) ────────────────
        const loader = document.getElementById('page-loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('loader-hidden');
                // Start animations AS SOON AS the fade-out begins (no more 1s gap)
                startAnimations();
                setTimeout(() => loader.remove(), 320);
            }, 700);
        } else {
            // No loader? Start immediately
            startAnimations();
        }

        // Language toggle → save + reload
        const langToggle = document.getElementById('lang-switch');
        if (langToggle) {
            langToggle.addEventListener('change', () => {
                const newLang = langToggle.checked ? 'tr' : 'en';
                localStorage.setItem('cv-lang', newLang);
                document.body.style.transition = 'opacity 0.25s';
                document.body.style.opacity = '0';
                setTimeout(() => {
                    location.href = '?lang=' + newLang;
                }, 250);
            });
        }

        function startAnimations() {
            // ─── Typewriter ───────────────────────────────────────────────────────────
            const promptEl = document.getElementById('prompt-text');
            const textToType = t('prompt');
            let i = 0;
            promptEl.textContent = "";

            function typeWriter() {
                if (i < textToType.length) {
                    promptEl.textContent += textToType.charAt(i++);
                    setTimeout(typeWriter, Math.random() * 50 + 30);
                } else {
                    initGlitchEffects();
                }
            }
            // Small extra delay for visual hierarchy
            setTimeout(typeWriter, 100);

            // ─── Title glitch ─────────────────────────────────────────────────────────
            function initGlitchEffects() {
                document.querySelectorAll('.hero-title').forEach(title => {
                    setInterval(() => {
                        if (Math.random() > 0.85) {
                            title.style.transform = `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)`;
                            setTimeout(() => { title.style.transform = 'translate(0,0)'; }, 40);
                        }
                    }, 100);
                });
            }

            // ─── Glitch Burst (Advanced CRT) ──────────────────────────────────────────
            const appWrapper = document.getElementById('app-wrapper');
            function triggerGlitchSpike() {
                if (appWrapper) appWrapper.classList.add('crt-spike');
                // Spike lasts for a random short burst (40ms to 120ms)
                setTimeout(() => {
                    if (appWrapper) appWrapper.classList.remove('crt-spike');
                    // Schedule next spike at a truly random interval (longer stability, short chaos)
                    const nextWait = Math.random() > 0.98 ? Math.random() * 500 : Math.random() * 5000 + 2000;
                    setTimeout(triggerGlitchSpike, nextWait);
                }, Math.random() * 80 + 40);
            }
            // Start the cycle
            triggerGlitchSpike();

            // ─── Age → LEVEL counter ──────────────────────────────────────────────────
            function calculateAge(birth) {
                const today = new Date(), b = new Date(birth);
                let age = today.getFullYear() - b.getFullYear();
                const m = today.getMonth() - b.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
                return age;
            }
            const myLevel = calculateAge("2002-01-04");
            const valExp = document.getElementById('val-exp');
            // Small extra delay for the LEVEL counter specifically to start AFTER the fade
            setTimeout(() => {
                if (valExp) {
                    let c = 0;
                    const iv = setInterval(() => {
                        valExp.textContent = c;
                        if (c++ >= myLevel) { clearInterval(iv); valExp.textContent = myLevel; }
                    }, 80); // Slightly faster for more 'system boot' feel
                }
            }, 320); // Wait for the main fade-out (320ms) to be nearly done
        }
    }

    // Call initPage to start the page logic
    initPage();

    // ─── Experience tooltip ───────────────────────────────────────────────────
    setHTML('val-exp2',
        "<span class='tooltip-container'>" +
        "<span style='color:var(--neon-red);font-size:0.85em;margin-right:8px'>" +
        "<i class=\"bi bi-x-octagon-fill\"></i></span>" + t('tooltips.exp.max') +
        "<span class='tooltip-error'>" + t('tooltips.exp.error') + "</span></span>"
    );

    // ─── Engine tooltip ───────────────────────────────────────────────────────
    setHTML('val-engine',
        "<span class='tooltip-container'>" +
        "<span style='color:var(--neon-amber);font-size:0.85em;margin-right:8px'>" +
        "<i class=\"bi bi-exclamation-triangle-fill\"></i></span>" + t('values.engine') +
        "<span class='tooltip-warning'>" + t('tooltips.engine.warning') + "</span></span>"
    );

    // ─── Faction tooltip ──────────────────────────────────────────────────────
    setHTML('val-faction',
        "<span class='tooltip-container'>" +
        "<span style='color:var(--neon-cyan);font-size:0.85em;margin-right:8px'>" +
        "<i class=\"bi bi-info-circle-fill\"></i></span>" + t('values.faction') +
        "<span class='tooltip-info'>" + t('tooltips.faction.info') + "</span></span>"
    );

    // ─── Matrix Scramble for Location ─────────────────────────────────────────
    const valLoc = document.getElementById('val-loc');
    if (valLoc) {
        const locCoord = t('location.coord');
        const locName = t('location.name');
        const symbols = "!<>-_/[]{}—=+*^?#_█▓▒░╳╲╱◼◻";

        valLoc.textContent = locCoord;
        valLoc.classList.add('loc-matrix-hover');

        function scramble(el, final) {
            let iterations = 0;
            const maxLen = Math.max(el.innerText.length, final.length);
            clearInterval(el._scramble);
            el._scramble = setInterval(() => {
                let out = "";
                for (let j = 0; j < Math.max(final.length, maxLen - Math.floor(iterations)); j++) {
                    if (j < iterations && j < final.length) out += final[j];
                    else if (j < final.length || j < maxLen - Math.floor(iterations))
                        out += symbols[Math.floor(Math.random() * symbols.length)];
                }
                el.innerText = out;
                if (iterations >= Math.max(final.length, maxLen)) {
                    clearInterval(el._scramble); el.innerText = final;
                }
                iterations += 0.5;
            }, 30);
        }

        valLoc.addEventListener('mouseenter', () => {
            valLoc.style.color = '#E94235';
            valLoc.style.textShadow = '0 0 5px rgba(233,66,53,0.5)';
            scramble(valLoc, locName);
        });
        valLoc.addEventListener('mouseleave', () => {
            valLoc.style.color = 'var(--text-white)';
            valLoc.style.textShadow = 'none';
            scramble(valLoc, locCoord);
        });
    }
});
