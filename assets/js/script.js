document.addEventListener('DOMContentLoaded', () => {

    // ─── Determine language (URL param > localStorage > browser) ──────────────
    const urlLang = new URLSearchParams(location.search).get('lang');
    const saved = localStorage.getItem('cv-lang');
    const browserLang = (navigator.language || 'en').toLowerCase();
    let lang = urlLang || saved || (browserLang.startsWith('tr') ? 'tr' : 'en');
    let isTR = (lang === 'tr');

    // Sync localStorage with current lang
    localStorage.setItem('cv-lang', lang);

    // Keep the URL clean: do not force ?lang=... on initial load.
    if (urlLang) {
        const url = new URL(window.location.href);
        url.searchParams.delete('lang');
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
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
        if (el && val !== undefined) {
            el.textContent = val;
            el.setAttribute('data-text', val);
        }
    }
    function setHTML(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined) el.innerHTML = val;
    }

    function applyTranslations() {
        document.documentElement.lang = lang;
        setText('page-title', t('pageTitle'));
        setText('loader-title', t('loaderTitle'));
        setText('brand-name', t('brandName'));
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

        // Values
        setText('val-class', t('values.class'));
        setText('val-status-text', t('values.statusActive'));

        // Tooltips (Needs re-injection)
        injectTooltips();

        // Location update if not currently scrambling
        const valLoc = document.getElementById('val-loc');
        if (valLoc && !valLoc._scramble) {
            valLoc.textContent = t('location.coord');
        }

        setText('lang-label', t('langLabel'));
    }

    function injectTooltips() {
        setHTML('val-exp2',
            "<span class='tooltip-container'>" +
            "<span style='color:var(--neon-red);font-size:0.85em;margin-right:8px'>" +
            "<i class=\"bi bi-x-octagon-fill\"></i></span>" + t('tooltips.exp.max') +
            "<span class='tooltip-error'>" + t('tooltips.exp.error') + "</span></span>"
        );
        setHTML('val-engine',
            "<span class='tooltip-container'>" +
            "<span style='color:var(--neon-amber);font-size:0.85em;margin-right:8px'>" +
            "<i class=\"bi bi-exclamation-triangle-fill\"></i></span>" + t('values.engine') +
            "<span class='tooltip-warning'>" + t('tooltips.engine.warning') + "</span></span>"
        );
        setHTML('val-faction',
            "<span class='tooltip-container'>" +
            "<span style='color:var(--neon-cyan);font-size:0.85em;margin-right:8px'>" +
            "<i class=\"bi bi-info-circle-fill\"></i></span>" + t('values.faction') +
            "<span class='tooltip-info'>" + t('tooltips.faction.info') + "</span></span>"
        );
    }

    // ─── Initialize page behavior ─────────────────────────────────────────────
    let typewriterTimer = null;
    let glitchIntervals = [];
    let spikeTimer = null;
    let randomGlitchTimer = null;
    let levelInterval = null;

    function initPage(isFirstLoad = true) {
        const loader = document.getElementById('page-loader');
        applyTranslations();

        if (isFirstLoad) {
            setText('val-exp', '0');
            const toggle = document.getElementById('lang-switch');
            if (toggle) toggle.checked = isTR;
        }

        if (loader) {
            // Ensure loader is visible if not first load
            if (!isFirstLoad) {
                loader.classList.remove('loader-hidden');
                loader.style.display = 'flex';
                // Trigger reflow for CSS animation reset
                const bar = loader.querySelector('.loader-bar-fill');
                if (bar) {
                    bar.style.animation = 'none';
                    void bar.offsetWidth;
                    bar.style.animation = null;
                }
            }

            setTimeout(() => {
                loader.classList.add('loader-hidden');
                startAnimations(!isFirstLoad);
                setTimeout(() => {
                    loader.style.display = 'none';
                    // Re-enable toggle after loader is fully gone
                    const langToggle = document.getElementById('lang-switch');
                    if (langToggle) langToggle.disabled = false;
                }, 400);
            }, 700);
        } else {
            startAnimations(!isFirstLoad);
            const langToggle = document.getElementById('lang-switch');
            if (langToggle) langToggle.disabled = false;
        }
    }

    function startAnimations(isSoftRefresh = false) {
        // ─── Typewriter ───────────────────────────────────────────────────────────
        const promptEl = document.getElementById('prompt-text');
        const textToType = t('prompt');
        let i = 0;

        // Clear any existing typewriter timer to avoid overlapping
        if (typewriterTimer) clearTimeout(typewriterTimer);

        promptEl.textContent = "";

        function typeWriter() {
            if (i < textToType.length) {
                promptEl.textContent += textToType.charAt(i++);
                typewriterTimer = setTimeout(typeWriter, Math.random() * 50 + 20);
            } else {
                typewriterTimer = null;
                if (!isSoftRefresh) initGlitchEffects();
            }
        }
        setTimeout(typeWriter, 100);

        if (!isSoftRefresh) {
            // ─── Title glitch ─────────────────────────────────────────────────────────
            function initGlitchEffects() {
                // Clear existing glitch intervals
                glitchIntervals.forEach(clearInterval);
                glitchIntervals = [];

                document.querySelectorAll('.hero-title').forEach(title => {
                    const id = setInterval(() => {
                        if (Math.random() > 0.85) {
                            title.style.transform = `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)`;
                            setTimeout(() => { title.style.transform = 'translate(0,0)'; }, 40);
                        }
                    }, 100);
                    glitchIntervals.push(id);
                });
            }

            // ─── Glitch Burst (Advanced CRT) ──────────────────────────────────────────
            const appWrapper = document.getElementById('app-wrapper');
            if (spikeTimer) clearTimeout(spikeTimer);

            function triggerGlitchSpike() {
                if (appWrapper) appWrapper.classList.add('crt-spike');
                spikeTimer = setTimeout(() => {
                    if (appWrapper) appWrapper.classList.remove('crt-spike');
                    const nextWait = Math.random() > 0.98 ? Math.random() * 500 : Math.random() * 5000 + 2000;
                    spikeTimer = setTimeout(triggerGlitchSpike, nextWait);
                }, Math.random() * 80 + 40);
            }
            triggerGlitchSpike();

            // ─── Pro-Glitch Stochastic Bursts ────────────────────────────────────────
            if (randomGlitchTimer) clearTimeout(randomGlitchTimer);

            function randomizeGlitches() {
                const glitchElements = document.querySelectorAll('.glitch-hover');
                glitchElements.forEach(el => {
                    if (Math.random() > 0.98) {
                        el.style.filter = `brightness(1.5) contrast(1.2)`;
                        setTimeout(() => el.style.filter = 'none', 50);
                    }
                });
                randomGlitchTimer = setTimeout(randomizeGlitches, Math.random() * 500 + 200);
            }
            randomizeGlitches();
        }

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

        if (valExp) {
            let c = 0;
            if (levelInterval) clearInterval(levelInterval);
            levelInterval = setInterval(() => {
                valExp.textContent = c;
                if (c++ >= myLevel) { clearInterval(levelInterval); levelInterval = null; valExp.textContent = myLevel; }
            }, 40);
        }
    }

    // Initial Start
    initPage(true);

    // Language toggle → In-place transition
    const langToggle = document.getElementById('lang-switch');
    if (langToggle) {
        langToggle.addEventListener('change', () => {
            // Lock toggle to prevent spam
            langToggle.disabled = true;

            lang = langToggle.checked ? 'tr' : 'en';
            isTR = (lang === 'tr');
            localStorage.setItem('cv-lang', lang);

            // Re-run init with loader
            initPage(false);
        });
    }

    // ─── Matrix Scramble for Location ─────────────────────────────────────────
    const valLoc = document.getElementById('val-loc');
    if (valLoc) {
        const symbols = "!<>-_/[]{}—=+*^?#_█▓▒░╳╲╱◼◻";
        valLoc.classList.add('loc-matrix-hover');

        function scramble(el, final, onComplete) {
            let iterations = 0;
            const maxLen = Math.max(el.innerText.length, final.length);
            clearInterval(el._scramble);
            el._scramble = setInterval(() => {
                let out = "";
                const currentThresh = Math.max(final.length, maxLen - Math.floor(iterations));
                for (let j = 0; j < currentThresh; j++) {
                    if (j < iterations && j < final.length) {
                        out += final[j];
                    } else {
                        out += symbols[Math.floor(Math.random() * symbols.length)];
                    }
                }
                el.innerText = out;
                if (iterations >= maxLen) {
                    clearInterval(el._scramble);
                    el.innerText = final;
                    delete el._scramble;
                    if (onComplete) onComplete();
                }
                iterations += 1;
            }, 25);
        }

        const btnLocate = document.getElementById('btn-locate');
        const terminalOverlay = document.getElementById('terminal-overlay');
        const terminalLogs = document.getElementById('terminal-logs');
        const terminalProgress = document.getElementById('terminal-progress');

        async function runTerminalSequence(isDecrypting) {
            terminalOverlay.classList.remove('d-none');
            terminalLogs.innerHTML = '';
            terminalProgress.style.width = '0%';

            const decryptLogs = [
                { text: ">>> INITIATING DECRYPTION PROTOCOL...", type: "system" },
                { text: ">>> ACCESSING SAT-COM GRID 04...", type: "system" },
                { text: "[WARNING] FIREWALL DETECTED. BYPASSING...", type: "warning" },
                { text: ">>> BRUTE-FORCING AES-256 ENCRYPTION...", type: "system" },
                { text: "[SUCCESS] HANDSHAKE COMPLETE.", type: "success" },
                { text: ">>> EXTRACTING GEOLOCATION METADATA...", type: "system" },
                { text: ">>> CLEANING DATA STREAM...", type: "system" },
                { text: ">>> PROTOCOL COMPLETE. REVEALING...", type: "success" }
            ];

            const encryptLogs = [
                { text: ">>> INITIATING SYSTEM LOCKDOWN...", type: "system" },
                { text: ">>> WIPING CACHE /VAR/LOG/LOC...", type: "system" },
                { text: ">>> RE-ENCRYPTING DATA FIELDS...", type: "system" },
                { text: ">>> SYNCING WITH CLOUD VAULT...", type: "system" },
                { text: ">>> ERASING LOCAL TRACES...", type: "warning" },
                { text: "[SUCCESS] SYSTEM SECURED.", type: "success" }
            ];

            const logs = isDecrypting ? decryptLogs : encryptLogs;
            const stepTime = 300;

            for (let i = 0; i < logs.length; i++) {
                const entry = document.createElement('div');
                entry.className = `terminal-log-entry ${logs[i].type || ''}`;
                entry.textContent = logs[i].text;
                terminalLogs.appendChild(entry);
                terminalLogs.scrollTop = terminalLogs.scrollHeight;
                const progress = ((i + 1) / logs.length) * 100;
                terminalProgress.style.width = `${progress}%`;
                await new Promise(r => setTimeout(r, stepTime + Math.random() * 150));
            }
            await new Promise(r => setTimeout(r, 400));
            terminalOverlay.classList.add('d-none');
        }

        if (btnLocate) {
            let isUnlocked = false;
            btnLocate.addEventListener('click', async () => {
                const icon = btnLocate.querySelector('i');
                const mode = !isUnlocked;
                const sequencePromise = runTerminalSequence(mode);

                if (mode) {
                    isUnlocked = true;
                    btnLocate.classList.add('decrypting');
                    if (icon) icon.className = 'bi bi-unlock-fill';
                    await sequencePromise;
                    btnLocate.classList.add('unlocked');
                    scramble(valLoc, t('location.name'), () => {
                        btnLocate.classList.remove('decrypting');
                    });
                } else {
                    isUnlocked = false;
                    btnLocate.classList.add('decrypting');
                    if (icon) icon.className = 'bi bi-lock-fill';
                    await sequencePromise;
                    btnLocate.classList.remove('unlocked');
                    scramble(valLoc, t('location.coord'), () => {
                        btnLocate.classList.remove('decrypting');
                    });
                }
            });
        }
    }
});
