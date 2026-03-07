document.addEventListener('DOMContentLoaded', () => {

    // ─── Strings (English-only) ───────────────────────────────────────────────
    const STRINGS = {
        pageTitle: "Mert Çinçinoğlu - I do some stuff",
        brandName: "> MERT_ÇİNÇİNOĞLU.exe",

        navHome: "// Home",
        navGames: "// Games",
        navProjects: "// Projects",
        navAbout: "// About",
        navContact: "// Contact",

        heroName1: "MERT",
        heroName2: "ÇİNÇİNOĞLU",
        heroSub1: "Game Developer, 3D Artist & Programmer",
        subtitle3: "I like to build and see ideas come to life.",

        btnGames: "EXPLORE_GAMES <i class='bi bi-arrow-up-right ms-1' style='-webkit-text-stroke: 0.5px;'></i><br><span class='btn-subtext'>made by me</span>",
        btnGithub: "<i class='bi bi-github'></i> GitHub",
        btnLinkedin: "<i class='bi bi-linkedin'></i> LinkedIn",
        btnYoutube: "<i class='bi bi-youtube'></i> YouTube",
        btnInstagram: "<i class='bi bi-instagram'></i> Instagram",

        prompt: "C:\\USERS\\MERT\\PORTFOLIO\\Home> ",
        promptAbout: "C:\\USERS\\MERT\\PORTFOLIO\\About> ",
        prompt404: "C:\\ERROR_404\\NULL> ",

        statLevel: "LEVEL:",
        statClass: "CLASS:",
        statExp: "EXPERIENCE:",
        statEngine: "ENGINE:",
        statGuild: "GUILD:",
        statLoc: "LOCATION:",
        statStatus: "STATUS:",

        valClass: "Unknown",
        valEngine: "Based on Unity",
        valFaction: "Solo Player",
        valStatus: "ACTIVE",
        valExpMax: "MAX",

        locCoord: "37°03'58.9\"N 37°22'59.6\"E",
        locName: "Gaziantep, TR",

        ttipExpErr: "ERROR: Memory limit exceeded.",
        ttipEngWarn: "WARNING: May contain unhandled null exceptions.",
        ttipFacInfo: "INFO: No party members detected in sector.",
    };

    // Helper to get a prompt key by element attribute (for typewriter)
    function getPrompt(key) {
        const map = { prompt: STRINGS.prompt, promptAbout: STRINGS.promptAbout, prompt404: STRINGS.prompt404 };
        return map[key] || STRINGS.prompt;
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
    // Wraps leading "//" in a .nav-slash span for CSS animation
    function setNavText(id, val) {
        const el = document.getElementById(id);
        if (!el) return;
        if (val.startsWith('//')) {
            el.innerHTML = `<span class="nav-slash">//</span>${val.slice(2)}`;
        } else {
            el.textContent = val;
        }
    }

    function applyTranslations() {
        setText('page-title', STRINGS.pageTitle);
        setText('brand-name', STRINGS.brandName);

        // Nav
        setNavText('nav-home', STRINGS.navHome);
        setNavText('nav-games', STRINGS.navGames);
        setNavText('nav-projects', STRINGS.navProjects);
        setNavText('nav-about', STRINGS.navAbout);
        setNavText('nav-contact', STRINGS.navContact);

        // Hero Section
        setText('hero-name-1', STRINGS.heroName1);
        setText('hero-name-2', STRINGS.heroName2);
        setText('sub-1', STRINGS.heroSub1);
        setText('sub-3', STRINGS.subtitle3);
        setHTML('btn-games', STRINGS.btnGames);
        setHTML('btn-github', STRINGS.btnGithub);
        setHTML('btn-linkedin', STRINGS.btnLinkedin);
        setHTML('btn-youtube', STRINGS.btnYoutube);
        setHTML('btn-instagram', STRINGS.btnInstagram);

        // Stat labels
        setText('stat-exp-lbl', STRINGS.statLevel);
        setText('stat-class-lbl', STRINGS.statClass);
        setText('stat-exp2-lbl', STRINGS.statExp);
        setText('stat-engine-lbl', STRINGS.statEngine);
        setText('stat-faction-lbl', STRINGS.statGuild);
        setText('stat-loc-lbl', STRINGS.statLoc);
        setText('stat-status-lbl', STRINGS.statStatus);

        // Values
        setText('val-class', STRINGS.valClass);
        setText('val-status-text', STRINGS.valStatus);

        // Tooltips
        injectTooltips();

        // Location - reset to locked/coord state
        const valLoc = document.getElementById('val-loc');
        if (valLoc && !valLoc._scramble) {
            isLocUnlocked = false;
            valLoc.textContent = STRINGS.locCoord;
            valLoc.classList.remove('loc-unlocked');
            const btnLocate = document.getElementById('btn-locate');
            if (btnLocate) {
                btnLocate.classList.remove('unlocked');
                const icon = btnLocate.querySelector('i');
                if (icon) icon.className = 'bi bi-lock-fill';
            }
        }
    }

    function injectTooltips() {
        setHTML('val-exp2',
            "<span class='tooltip-container'>" +
            "<span style='color:var(--neon-red);font-size:0.85em;margin-right:8px'>" +
            "<i class=\"bi bi-x-octagon-fill\"></i></span>" + STRINGS.valExpMax +
            "<span class='tooltip-error'>" + STRINGS.ttipExpErr + "</span></span>"
        );
        setHTML('val-engine',
            "<span class='tooltip-container'>" +
            "<span style='color:var(--neon-amber);font-size:0.85em;margin-right:8px'>" +
            "<i class=\"bi bi-exclamation-triangle-fill\"></i></span>" + STRINGS.valEngine +
            "<span class='tooltip-warning'>" + STRINGS.ttipEngWarn + "</span></span>"
        );
        setHTML('val-faction',
            "<span class='tooltip-container'>" +
            "<span style='color:var(--neon-cyan);font-size:0.85em;margin-right:8px'>" +
            "<i class=\"bi bi-info-circle-fill\"></i></span>" + STRINGS.valFaction +
            "<span class='tooltip-info'>" + STRINGS.ttipFacInfo + "</span></span>"
        );
    }

    // ─── Initialize page behavior ─────────────────────────────────────────────
    let typewriterTimer = null;
    let glitchIntervals = [];
    let spikeTimer = null;
    let randomGlitchTimer = null;
    let levelInterval = null;

    // Global location state
    let isLocUnlocked = false;

    function initPage(isFirstLoad = true) {
        initCursor();
        applyTranslations();

        if (isFirstLoad) {
            setText('val-exp', '0');
            preventRedundantReloads();
        }

        startAnimations();
    }

    // ─── Link Handling ────────────────────────────────────────────────────────
    function preventRedundantReloads() {
        document.addEventListener('click', e => {
            const link = e.target.closest('a');
            if (!link) return;

            // Get absolute URLs for comparison
            const targetUrl = new URL(link.href, window.location.origin);
            const currentUrl = new URL(window.location.href);

            // Ignore cross-origin links
            if (targetUrl.origin !== currentUrl.origin) return;

            // Helper to normalize paths (remove trailing slashes, index.html, etc.)
            const normalize = path => path.replace(/\/$/, '').replace(/\/index\.html$/, '') || '/';

            const targetPath = normalize(targetUrl.pathname);
            const currentPath = normalize(currentUrl.pathname);

            if (targetPath === currentPath) {
                e.preventDefault();
                console.log(`[System] Navigation to ${targetPath} prevented (already on this page).`);
            }
        });
    }

    function initCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor || typeof gsap === 'undefined') return;

        // Check if reduced motion is preferred
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Read last known position from sessionStorage (default to center of screen if none)
        let initialX = window.innerWidth / 2;
        let initialY = window.innerHeight / 2;

        const savedPos = sessionStorage.getItem("customCursorPos");
        if (savedPos) {
            const parsed = JSON.parse(savedPos);
            initialX = parsed.x;
            initialY = parsed.y;
        }

        // Center the cursor drawing and set directly to the last known position
        // Start with autoAlpha: 0 to handle visibility:hidden
        gsap.set(cursor, { xPercent: -50, yPercent: -50, x: initialX, y: initialY, autoAlpha: 0 });

        // Reveal the cursor instantly after mapping its correct position
        gsap.set(cursor, { autoAlpha: 1 });

        // Set initial GSAP quickTo setters for performance
        let xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power3" });
        let yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power3" });

        window.addEventListener("mousemove", e => {
            xTo(e.clientX);
            yTo(e.clientY);
            // Save position so when clicking links, the next page knows where the cursor is
            sessionStorage.setItem("customCursorPos", JSON.stringify({ x: e.clientX, y: e.clientY }));
        }, { passive: true });

        // Add hover effect for clickable elements
        const clickables = document.querySelectorAll('a, button, .btn, .locate-trigger, .social-links a');

        function isClickableChild(el) {
            if (!el) return false;
            for (let clickEl of clickables) {
                if (clickEl.contains(el)) return true;
            }
            return false;
        }

        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });

        // Check initial position on page load to see if it starts over a link
        requestAnimationFrame(() => {
            if (savedPos) {
                const elUnderCursor = document.elementFromPoint(initialX, initialY);
                if (isClickableChild(elUnderCursor)) {
                    cursor.classList.add('hovering');
                }
            }
        });
    }

    function startAnimations() {
        // ─── Typewriter (GSAP TextPlugin) ─────────────────────────────────────────
        const promptEl = document.getElementById('prompt-text');
        const promptKey = promptEl ? (promptEl.getAttribute('data-prompt') || 'prompt') : 'prompt';
        const textToType = getPrompt(promptKey);

        // Clear any existing typewriter timer to avoid overlapping
        if (typewriterTimer) { typewriterTimer.kill(); typewriterTimer = null; }

        if (promptEl) {
            if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
                // Register TextPlugin if not already registered
                if (typeof TextPlugin !== 'undefined') gsap.registerPlugin(TextPlugin);

                promptEl.textContent = '';
                typewriterTimer = gsap.to(promptEl, {
                    duration: textToType.length * 0.055,
                    text: { value: textToType, delimiter: '' },
                    ease: 'none',
                    onComplete: initGlitchEffects
                });
            } else {
                // Fallback: plain JS typewriter
                let i = 0;
                promptEl.textContent = '';
                const tick = () => {
                    if (i < textToType.length) {
                        promptEl.textContent += textToType.charAt(i++);
                        typewriterTimer = setTimeout(tick, Math.random() * 50 + 20);
                    } else {
                        typewriterTimer = null;
                        initGlitchEffects();
                    }
                };
                setTimeout(tick, 100);
            }
        } else {
            // If there's no typewriter element, directly start the next animations
            initGlitchEffects();
        }

        // ─── Title glitch ─────────────────────────────────────────────────────────
        function initGlitchEffects() {
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
        const mainTerminal = document.querySelector('.main-terminal');
        if (spikeTimer) clearTimeout(spikeTimer);

        function triggerGlitchSpike() {
            if (mainTerminal) mainTerminal.classList.add('crt-spike');
            spikeTimer = setTimeout(() => {
                if (mainTerminal) mainTerminal.classList.remove('crt-spike');
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

        // ─── Scroll Indicator ──────────────────────────────────────────────────
        const scrollIndicator = document.getElementById('scroll-indicator');
        if (scrollIndicator) {
            // Only show on pages that actually scroll
            const isScrollable = document.body.scrollHeight > window.innerHeight + 80;
            if (!isScrollable) {
                scrollIndicator.classList.add('hidden');
            } else {
                const hideOnScroll = () => {
                    if (window.scrollY > 40) {
                        scrollIndicator.classList.add('hidden');
                        window.removeEventListener('scroll', hideOnScroll);
                    }
                };
                window.addEventListener('scroll', hideOnScroll, { passive: true });
            }
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

    // ─── Matrix Scramble for Location ─────────────────────────────────────────
    const valLoc = document.getElementById('val-loc');
    if (valLoc) {
        // Use ONLY pure ASCII symbols to prevent monospace fallback width jumps
        const symbols = "ABCDEF0123456789!@#$%^&*()_+";
        valLoc.classList.add('loc-matrix-hover');

        // Helper to precisely measure text width in pixels without affecting layout
        function measureTextWidth(text, el) {
            const span = document.createElement('span');
            span.className = el.className;
            span.style.position = 'absolute';
            span.style.visibility = 'hidden';
            span.style.whiteSpace = 'nowrap';
            // Disable transition so we instantly get the real pixel width
            span.style.transition = 'none';
            span.innerText = text;
            el.parentNode.appendChild(span);
            const width = span.getBoundingClientRect().width;
            el.parentNode.removeChild(span);
            return width;
        }

        function scramble(el, initial, final, onComplete) {
            clearInterval(el._scramble);

            // Measure exact physical bounds beforehand
            const startWidth = measureTextWidth(initial, el);
            const endWidth = measureTextWidth(final, el);

            // Force reset DOM to initial state right now
            el.innerText = initial;

            // CRITICAL: Block all auto-resizing completely.
            el.style.overflow = 'hidden';
            el.style.whiteSpace = 'nowrap';

            const startLen = initial.length;
            const endLen = final.length;
            let step = 0;
            const totalSteps = Math.max(startLen, endLen) * 2.5;

            // Snap to exact starting pixel width
            el.style.width = startWidth + 'px';
            el.style.minWidth = startWidth + 'px';
            el.style.maxWidth = startWidth + 'px';

            el._scramble = setInterval(() => {
                const rawProgress = Math.min(step / totalSteps, 1);
                // Ease-in-out curve for smooth acceleration/deceleration
                const progress = rawProgress < 0.5
                    ? 2 * rawProgress * rawProgress
                    : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;

                const visibleLen = Math.round(startLen + (endLen - startLen) * progress);
                const locked = Math.floor(progress * endLen);

                // Drive all widths in exact PIXELS so container is perfectly smooth 
                const currentWidth = startWidth + (endWidth - startWidth) * progress;
                el.style.width = currentWidth + 'px';
                el.style.minWidth = currentWidth + 'px';
                el.style.maxWidth = currentWidth + 'px';

                let out = "";
                for (let j = 0; j < visibleLen; j++) {
                    if (j < locked) {
                        out += final[j];
                    } else {
                        out += symbols[Math.floor(Math.random() * symbols.length)];
                    }
                }
                el.innerText = out;

                if (locked >= endLen && visibleLen === endLen) {
                    clearInterval(el._scramble);
                    el.innerText = final;
                    el.style.width = '';
                    el.style.minWidth = '';
                    el.style.maxWidth = '';
                    el.style.overflow = '';
                    el.style.whiteSpace = '';
                    delete el._scramble;
                    if (onComplete) onComplete();
                }
                step++;
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
            btnLocate.addEventListener('click', async () => {
                const icon = btnLocate.querySelector('i');
                const mode = !isLocUnlocked;
                const sequencePromise = runTerminalSequence(mode);

                if (mode) {
                    isLocUnlocked = true;
                    btnLocate.classList.add('decrypting');
                    if (icon) icon.className = 'bi bi-unlock-fill';
                    await sequencePromise;
                    btnLocate.classList.add('unlocked');
                    valLoc.classList.add('loc-unlocked');
                    scramble(valLoc, STRINGS.locCoord, STRINGS.locName, () => {
                        btnLocate.classList.remove('decrypting');
                    });
                } else {
                    isLocUnlocked = false;
                    btnLocate.classList.add('decrypting');
                    if (icon) icon.className = 'bi bi-lock-fill';
                    await sequencePromise;
                    btnLocate.classList.remove('unlocked');
                    valLoc.classList.remove('loc-unlocked');
                    scramble(valLoc, STRINGS.locName, STRINGS.locCoord, () => {
                        btnLocate.classList.remove('decrypting');
                    });
                }
            });
        }


    }
});
