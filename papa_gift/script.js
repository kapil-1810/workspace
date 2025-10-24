// Core script for Personal Command Center
// Restores functionality, fixes syntax issues, and adds working Stopwatch, Timer, and World Clock widgets

document.addEventListener('DOMContentLoaded', () => {
    // --- Particle Animation Setup ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    if (canvas && ctx) {
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();

        let particlesArray = [];
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
                this.x += this.directionX;
                this.y += this.directionY;
                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            const numberOfParticles = Math.max(10, Math.floor((canvas.width * canvas.height) / 9000));
            const colors = ['#00f7ff', '#ff00e5', '#fcee0a'];
            for (let i = 0; i < numberOfParticles; i++) {
                const size = (Math.random() * 2) + 1;
                const x = Math.random() * (canvas.width - size * 4) + size * 2;
                const y = Math.random() * (canvas.height - size * 4) + size * 2;
                const directionX = (Math.random() * 0.4) - 0.2;
                const directionY = (Math.random() * 0.4) - 0.2;
                const color = colors[Math.floor(Math.random() * colors.length)];
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) particlesArray[i].update();
        }

        initParticles();
        animateParticles();
        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });
    }

    // --- Main Application ---
    const startButton = document.getElementById('start-button');
    const backgroundMusic = document.getElementById('background-music');
    const terminalContainer = document.getElementById('terminal-container');
    const terminalEl = document.getElementById('terminal');
    const verificationScreen = document.getElementById('verification-screen');
    const accessKeyInput = document.getElementById('access-key-input');
    const verifyButton = document.getElementById('verify-button');
    const errorMessage = document.getElementById('error-message');
    const dashboardEl = document.getElementById('dashboard');
    const resetUserBtn = document.getElementById('reset-user-btn');

    let userName = '';

    if (startButton) {
        startButton.addEventListener('click', () => {
            if (backgroundMusic && backgroundMusic.src) {
                backgroundMusic.volume = 0.3;
                backgroundMusic.play().catch(e => console.error('Audio playback failed:', e));
            }
            const startScreen = document.getElementById('start-screen');
            if (startScreen) startScreen.style.opacity = '0';
            setTimeout(() => {
                if (startScreen) startScreen.classList.add('hidden');
                const savedUser = localStorage.getItem('userName');
                if (savedUser) {
                    userName = savedUser;
                    showDashboard();
                } else {
                    init();
                }
            }, 600);
        });
    }

    async function init() {
        if (terminalContainer) {
            terminalContainer.classList.remove('hidden');
            terminalContainer.classList.add('visible');
        }
        await runIntroSequence();
        showVerificationScreen();
    }

    function type(element, text, speed) {
        return new Promise(resolve => {
            let i = 0;
            element.innerHTML = '';
            element.classList.add('cursor');
            const interval = setInterval(() => {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                } else {
                    clearInterval(interval);
                    element.classList.remove('cursor');
                    resolve();
                }
            }, speed);
        });
    }

    async function runIntroSequence() {
        if (!terminalEl) return;
        const lines = [
            'INITIALIZING PERSONAL OS v6.0...',
            'ENGAGING MULTI-PAGE INTERFACE...',
            'LOADING VIBRANT UI...',
            'AWAITING PERSONALIZATION...'
        ];
        for (const line of lines) {
            const lineEl = document.createElement('div');
            terminalEl.appendChild(lineEl);
            // eslint-disable-next-line no-await-in-loop
            await type(lineEl, line, 40);
            // eslint-disable-next-line no-await-in-loop
            await new Promise(res => setTimeout(res, 300));
        }
    }

    function showVerificationScreen() {
        if (terminalContainer) terminalContainer.classList.add('hidden');
        if (verificationScreen) {
            verificationScreen.classList.remove('hidden');
            verificationScreen.classList.add('visible');
            const input = document.getElementById('access-key-input');
            if (input) input.focus();
        }
    }

    function handleVerification() {
        const inputName = accessKeyInput ? accessKeyInput.value.trim() : '';
        if (inputName) {
            userName = inputName;
            localStorage.setItem('userName', userName);
            if (errorMessage) {
                errorMessage.textContent = 'PERSONALIZATION COMPLETE.';
                errorMessage.style.color = 'var(--primary-color)';
            }
            setTimeout(showDashboard, 1000);
        } else {
            if (errorMessage) errorMessage.textContent = 'NAME CANNOT BE EMPTY.';
            if (accessKeyInput) accessKeyInput.classList.add('input-error');
            setTimeout(() => { if (accessKeyInput) accessKeyInput.classList.remove('input-error'); }, 500);
        }
    }

    if (verifyButton) verifyButton.addEventListener('click', handleVerification);
    if (accessKeyInput) accessKeyInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleVerification(); });

    function showDashboard() {
        if (terminalContainer) terminalContainer.classList.add('hidden');
        if (verificationScreen) {
            verificationScreen.style.transition = 'opacity 1s';
            verificationScreen.style.opacity = '0';
        }
        setTimeout(() => {
            if (verificationScreen) verificationScreen.classList.add('hidden');
            if (dashboardEl) dashboardEl.classList.remove('hidden');
            startDashboardFunctions();
        }, 1000);
    }

    function startDashboardFunctions() {
        initNavigation();
        initAssistant();
        personalizeDashboard();
        updateClockAndDate();
        setInterval(updateClockAndDate, 1000);
        initQuotes();
        initLocationTracker();
        initNotepad();
        initDeviceStatus();
        runSystemChecks();
        initStopwatch();
        initTimer();
        initWorldClock();
    }

    function initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const pages = document.querySelectorAll('.page-section');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetPageId = button.dataset.target;
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                pages.forEach(page => {
                    if (page.id === targetPageId) page.classList.add('active'); else page.classList.remove('active');
                });
            });
        });
    }

    function initAssistant() {
        const chatHistory = document.getElementById('chat-history');
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        if (!chatHistory || !chatInput || !chatSendBtn) return;

        const appendMessage = (text, sender) => {
            const message = document.createElement('div');
            message.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
            message.textContent = text;
            chatHistory.appendChild(message);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        };

        const handleSend = async () => {
            const prompt = chatInput.value.trim();
            if (!prompt) return;
            appendMessage(prompt, 'user');
            chatInput.value = '';
            appendMessage('Eesu is thinking...', 'bot');
            try {
                const reply = await getGeminiResponse(prompt);
                const botMessages = chatHistory.querySelectorAll('.bot-message');
                const lastBot = botMessages[botMessages.length - 1];
                if (lastBot) lastBot.textContent = reply; else appendMessage(reply, 'bot');
            } catch (err) {
                const botMessages = chatHistory.querySelectorAll('.bot-message');
                const lastBot = botMessages[botMessages.length - 1];
                if (lastBot) lastBot.textContent = 'Error: Could not get response.';
                console.error('Assistant send error:', err);
            }
        };

        chatSendBtn.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
    }

    // ----------------------
    // Gemini API Integration (kept in-file for demo; in production use a backend proxy)
    // ----------------------
    const GEMINI_API_KEY = "AIzaSyB01qd-6IOqND5_MT7SOJcLD9FPhU9lSSk"; // <-- Replace or proxy from server
    const GEMINI_MODEL = "gemini-2.5-flash";
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    async function getGeminiResponse(prompt) {
        // If API key isn't supplied, return a mock answer so UI remains functional during local testing
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'REPLACE_WITH_YOUR_KEY') {
            return `(Local stub) I heard: ${prompt}`;
        }

        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: prompt }] }
                    ]
                })
            });
            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                throw new Error(errBody.error?.message || `HTTP error! ${response.status}`);
            }
            const data = await response.json();
            const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ No response text received.';
            return result.trim();
        } catch (error) {
            console.error('Gemini API Error:', error);
            return `Error: ${error.message}`;
        }
    }

    function personalizeDashboard() {
        const dashboardTitle = document.getElementById('dashboard-title');
        const welcomeUser = document.getElementById('welcome-user');
        const briefingContent = document.getElementById('briefing-content');
        const upperCaseName = userName ? userName.toUpperCase() : 'USER';
        const titleText = `${upperCaseName}'S COMMAND CENTER`;
        if (dashboardTitle) {
            dashboardTitle.textContent = titleText;
            dashboardTitle.setAttribute('data-text', titleText);
        }
        if (welcomeUser) welcomeUser.textContent = `Welcome, ${userName || 'Guest'}`;
        const message = `Mission Briefing for ${new Date().toLocaleDateString('en-IN', { weekday: 'long' })}: Your primary objective is to have an outstanding day. All systems are go.`;
        if (briefingContent) type(briefingContent, message, 30);
    }

    if (resetUserBtn) resetUserBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to change the user? This will clear all personalization.')) {
            localStorage.removeItem('userName');
            localStorage.removeItem('homeBase');
            localStorage.removeItem('userNotes');
            window.location.reload();
        }
    });

    function updateClockAndDate() {
        const now = new Date();
        const clockEl = document.getElementById('clock');
        const dateEl = document.getElementById('date');
        if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    async function runSystemChecks() {
        const weatherStatus = document.querySelector('#weather-widget .status-text');
        if (weatherStatus) { await type(weatherStatus, '> Detecting location...', 30); fetchWeather(); }
        const newsStatus = document.querySelector('#news-widget .status-text');
        if (newsStatus) { await type(newsStatus, '> Accessing GNews Intel Feeds...', 30); await new Promise(res => setTimeout(res, 500)); await type(newsStatus, '> Feeds secured. Retrieving headlines...', 30); fetchNews(); }
    }

    function initQuotes() {
    const contentEl = document.getElementById('quotes-content');
    if (!contentEl) return;

    // Create initial container (use button type=button to avoid accidental form submit)
    contentEl.innerHTML = `
        <div id="quotes-inner">
            <button type="button" id="new-quote-btn" class="widget-refresh-btn" title="New quote">↻</button>
            <p id="quote-text">Fetching new quote...</p>
            <p id="quote-author"></p>
        </div>
    `;

    const btn = document.getElementById('new-quote-btn');
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');

    // Local fallback quotes if remote API fails or is blocked
    const FALLBACK_QUOTES = [
        { content: "Make each day your masterpiece.", author: 'John Wooden' },
        { content: "The only limit to our realization of tomorrow is our doubts of today.", author: 'F. D. Roosevelt' },
        { content: "Action is the foundational key to all success.", author: 'Pablo Picasso' }
    ];

    function chooseFallback() {
        return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    }

    // small helper to fetch with timeout
    async function fetchWithTimeout(resource, options = {}) {
        const { timeout = 7000 } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const resp = await fetch(resource, { ...options, signal: controller.signal });
            clearTimeout(id);
            return resp;
        } catch (e) {
            clearTimeout(id);
            throw e;
        }
    }

    async function getNewQuote() {
        try {
            if (quoteText) quoteText.textContent = "Fetching new quote...";
            if (quoteAuthor) quoteAuthor.textContent = "";
            if (btn) btn.disabled = true;

            try {
                const response = await fetchWithTimeout('https://api.quotable.io/random', { cache: 'no-cache', timeout: 7000 });
                if (!response.ok) throw new Error(`Status ${response.status}`);
                const quote = await response.json();
                if (quoteText) quoteText.textContent = `"${quote.content || quote.quote || ''}"`;
                if (quoteAuthor) quoteAuthor.textContent = quote.author ? `- ${quote.author}` : '';
            } catch (err) {
                console.warn('Quote fetch failed, using fallback.', err);
                const fq = chooseFallback();
                if (quoteText) quoteText.textContent = `"${fq.content}"`;
                if (quoteAuthor) quoteAuthor.textContent = `- ${fq.author}`;
            }
        } catch (err) {
            console.error('Unexpected error in getNewQuote:', err);
            if (quoteText) quoteText.textContent = "Could not fetch quote.";
            if (quoteAuthor) quoteAuthor.textContent = "";
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    if (btn) {
        try { btn.addEventListener('click', getNewQuote); } catch (e) { console.warn('Could not bind quote button', e); }
    }

    // Initial load (don't block if element unexpectedly missing)
    try { getNewQuote(); } catch (e) { console.error('Initial quote load failed', e); }
}


    function initLocationTracker() {
        const contentEl = document.getElementById('location-content');
        if (!contentEl) return;
        contentEl.innerHTML = '<p>Initializing GPS...</p><button class="action-btn" id="set-home-btn">Set Home Base</button>';
        document.getElementById('set-home-btn').addEventListener('click', () => {
            navigator.geolocation.getCurrentPosition(pos => {
                localStorage.setItem('homeBase', JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude }));
                alert('Home Base set to current location!');
            });
        });
        navigator.geolocation.watchPosition(pos => {
            const { latitude, longitude } = pos.coords;
            let distance = 'Home base not set.';
            const homeBase = JSON.parse(localStorage.getItem('homeBase'));
            if (homeBase) distance = calculateDistance(homeBase.lat, homeBase.lon, latitude, longitude).toFixed(2) + ' km from home';
            contentEl.innerHTML = `<p>Lat: <span class="highlight">${latitude.toFixed(4)}</span> | Lon: <span class="highlight">${longitude.toFixed(4)}</span></p><h3>${distance}</h3><button class="action-btn" id="set-home-btn">Set Home Base</button>`;
            document.getElementById('set-home-btn').addEventListener('click', () => { localStorage.setItem('homeBase', JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude })); alert('Home Base updated to current location!'); });
        }, () => { contentEl.innerHTML = '<p>Could not retrieve location.</p>'; });
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function initNotepad() {
        const notepad = document.getElementById('notepad');
        if (!notepad) return;
        notepad.value = localStorage.getItem('userNotes') || '';
        notepad.addEventListener('keyup', () => { localStorage.setItem('userNotes', notepad.value); });
    }

    function initDeviceStatus() {
        const contentEl = document.getElementById('device-status-content');
        if (!contentEl) return;
        const updateStatus = () => {
            if ('getBattery' in navigator) {
                navigator.getBattery().then(battery => {
                    contentEl.innerHTML = `<p>Network: <span class="highlight">${navigator.onLine ? 'Online' : 'Offline'}</span></p><p>Battery: <span class="highlight">${Math.floor(battery.level * 100)}% ${battery.charging ? '(Charging)' : ''}</span></p>`;
                });
            } else {
                contentEl.innerHTML = `<p>Network: <span class="highlight">${navigator.onLine ? 'Online' : 'Offline'}</span></p><p>Battery status not available.</p>`;
            }
        };
        updateStatus();
        setInterval(updateStatus, 5000);
    }

    function fetchWeather() {
        const apiKey = 'f73965e893051c1dacc9cac58defc73b';
        const statusEl = document.querySelector('#weather-widget .status-text');
        const dataEl = document.querySelector('#weather-widget .data-text');
        if (!statusEl || !dataEl) return;
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            type(statusEl, '> Location acquired. Fetching data...', 30);
            fetch(url, { cache: 'no-cache' }).then(res => res.json()).then(data => {
                statusEl.classList.add('hidden'); dataEl.classList.remove('hidden');
                if (data.cod === 200) {
                    dataEl.innerHTML = `<h3>${data.name}</h3><h2>${data.main.temp.toFixed(1)}°C</h2><p>Condition: <span class="highlight">${data.weather[0].description}</span></p><p>Humidity: <span class="highlight">${data.main.humidity}%</span></p>`;
                } else {
                    dataEl.innerHTML = `<p>Weather data unavailable.</p>`;
                }
            }).catch(() => { dataEl.innerHTML = `<p>Weather service offline.</p>`; });
        }, error => {
            type(statusEl, '> Location access denied.', 30);
            setTimeout(() => {
                statusEl.classList.add('hidden');
                dataEl.classList.remove('hidden');
                dataEl.innerHTML = `<p>Enable location access to see weather.</p>`;
            }, 2000);
        });
    }

   // This REPLACES your old fetchNews function in script.js

// Fallback: load static file bundled with site (keep this function)
async function loadFallback() {
  try {
    const r = await fetch('news-fallback.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(`Fallback HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.error('Fallback load failed', e);
    return { articles: [] };
  }
}

// Your new, simpler fetchNews function
async function fetchNews() {
  const statusEl = document.querySelector('#news-widget .status-text');
  const dataEl = document.querySelector('#news-widget .data-text');
  if (!statusEl || !dataEl) return;

  statusEl.classList.remove('hidden');
  dataEl.classList.add('hidden');
  // Make sure you have this 'type' function defined elsewhere in your script.js
  if (typeof type === 'function') {
    await type(statusEl, '> Retrieving latest intel...', 30);
  } else {
    statusEl.textContent = '> Retrieving latest intel...';
  }

  let dataEng = { articles: [] };
  let dataHin = { articles: [] };
  let sourceNote = '(Source: Unknown)';

  try {
    // 1. Try serverless function first (this is the ONLY secure way)
    const resp = await fetch('/.netlify/functions/gnews', { cache: 'no-store' });
    
    if (!resp.ok) {
        throw new Error(`Function HTTP ${resp.status}`);
    }
    
    const funcData = await resp.json();

    // Check if the function returned our data structure
    if (funcData && funcData.eng) {
      dataEng = funcData.eng;
      dataHin = funcData.hin;
      sourceNote = '(Source: GNews.io via secure function)';
    } else {
      // If the function returned an error or empty data
      throw new Error('Function returned invalid data');
    }

  } catch (e) {
    // 2. If function fails FOR ANY REASON, use the local fallback file
    console.warn('News function call failed, loading fallback:', e);
    const fallback = await loadFallback();
    dataEng = fallback; // Fallback probably only has English
    dataHin = { articles: [] };
    sourceNote = '(Source: Bundled fallback file)';
  }

  // 3. Render the HTML (this is your original code, which is good)
  statusEl.classList.add('hidden');
  dataEl.classList.remove('hidden');
  
  let html = `<small class="source-note">${sourceNote}</small><button id="refresh-news-btn" class="widget-refresh-btn">↻</button>`;
  html += '<h4>English Headlines</h4><ul>';
  
  if (dataEng.articles && dataEng.articles.length > 0) {
    dataEng.articles.forEach(article => {
      html += `<li><span>${article.title}</span> <a href="${article.url}" class="read-more-link" target="_blank">[Read More]</a></li>`;
    });
  } else {
    html += '<li>English news currently unavailable.</li>';
  }
  
  html += '</ul>';
  html += '<h4>हिन्दी सुर्खियाँ</h4><ul>';
  
  if (dataHin.articles && dataHin.articles.length > 0) {
    dataHin.articles.forEach(article => {
      html += `<li><span>${article.title}</span> <a href="${article.url}" class="read-more-link" target="_blank">[और पढ़ें]</a></li>`;
    });
  } else {
    html += '<li>हिंदी समाचार इस समय उपलब्ध नहीं हैं।</li>';
  }
  html += '</ul>';

  dataEl.innerHTML = html;
  const refreshBtn = document.getElementById('refresh-news-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Good practice to prevent any default click behavior
      fetchNews(); 
    });
  }

  // Clear any auto-refresh
  try { if (window.__newsAutoRefreshId) clearInterval(window.__newsAutoRefreshId); } catch (e) {}
}

// Don't forget to call it to run when the page loads!
fetchNews();
    // ----------------------
    // Stopwatch implementation
    // ----------------------
    function initStopwatch() {
        const display = document.querySelector('#stopwatch-content .display');
        const startBtn = document.getElementById('start-stopwatch');
        const pauseBtn = document.getElementById('pause-stopwatch');
        const resetBtn = document.getElementById('reset-stopwatch');
        const lapBtn = document.getElementById('lap-stopwatch');
        const lapsContainer = document.getElementById('stopwatch-laps');
        if (!display || !startBtn || !pauseBtn || !resetBtn) return;

        let running = false;
        let startTime = 0;
        let elapsed = 0;
        let rafId = null;

        function format(ms) {
            const totalSec = Math.floor(ms / 1000);
            const hrs = Math.floor(totalSec / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function recordLap() {
            if (!lapsContainer) return;
            const now = running ? (elapsed + (performance.now() - startTime)) : elapsed;
            const lapEl = document.createElement('div');
            lapEl.className = 'lap-item';
            lapEl.textContent = `${format(now)}`;
            lapsContainer.prepend(lapEl);
        }

        function tick() {
            const now = performance.now();
            const currentElapsed = elapsed + (now - startTime);
            display.textContent = format(currentElapsed);
            rafId = requestAnimationFrame(tick);
        }

        startBtn.addEventListener('click', () => {
            if (running) return;
            running = true;
            startTime = performance.now();
            rafId = requestAnimationFrame(tick);
        });

        pauseBtn.addEventListener('click', () => {
            if (!running) return;
            running = false;
            elapsed += performance.now() - startTime;
            if (rafId) cancelAnimationFrame(rafId);
        });

        resetBtn.addEventListener('click', () => {
            running = false;
            startTime = 0;
            elapsed = 0;
            if (rafId) cancelAnimationFrame(rafId);
            display.textContent = '00:00:00';
            if (lapsContainer) lapsContainer.innerHTML = '';
        });

        if (lapBtn) {
            lapBtn.addEventListener('click', () => {
                recordLap();
            });
        }
    }

    // ----------------------
    // Timer implementation
    // ----------------------
    function initTimer() {
        const minutesInput = document.getElementById('timer-minutes');
        const display = document.querySelector('#timer-content .display');
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const resetBtn = document.getElementById('reset-timer');
        if (!minutesInput || !display || !startBtn || !pauseBtn || !resetBtn) return;

        let remainingMs = 0;
        let running = false;
        let lastTick = 0;
        let intervalId = null;
        let audioCtx = null;
        let beepBuffer = null;

        function ensureAudio() {
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                return audioCtx;
            } catch (e) {
                return null;
            }
        }

        function playBeep() {
            const ctx = ensureAudio();
            if (!ctx) return;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 880;
            g.gain.value = 0.001;
            o.connect(g);
            g.connect(ctx.destination);
            const now = ctx.currentTime;
            g.gain.setValueAtTime(0.001, now);
            g.gain.linearRampToValueAtTime(0.25, now + 0.02);
            o.start(now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
            o.stop(now + 0.7);
        }

        function format(ms) {
            const totalSec = Math.ceil(ms / 1000);
            if (totalSec <= 0) return '00:00:00';
            const hrs = Math.floor(totalSec / 3600);
            const mins = Math.floor((totalSec % 3600) / 60);
            const secs = totalSec % 60;
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function tick() {
            const now = performance.now();
            const delta = now - lastTick;
            lastTick = now;
            remainingMs = Math.max(0, remainingMs - delta);
            display.textContent = format(remainingMs);
            if (remainingMs <= 0) {
                running = false;
                clearInterval(intervalId);
                intervalId = null;
                // play beep and alert when timer completes
                try { playBeep(); } catch (e) { console.warn('beep failed', e); }
                alert('Timer finished');
            }
        }
        
        startBtn.addEventListener('click', () => {
            if (running) return;
            if (remainingMs <= 0) {
                // parse input: accept MM or MM:SS or HH:MM:SS
                const raw = (minutesInput.value || '').toString().trim();
                remainingMs = 0;
                if (!raw) return;
                const parts = raw.split(':').map(p => parseInt(p, 10));
                if (parts.length === 1) {
                    const mins = Math.max(0, parts[0] || 0);
                    remainingMs = mins * 60 * 1000;
                } else if (parts.length === 2) {
                    const mins = Math.max(0, parts[0] || 0);
                    const secs = Math.max(0, parts[1] || 0);
                    remainingMs = (mins * 60 + secs) * 1000;
                } else if (parts.length === 3) {
                    const hrs = Math.max(0, parts[0] || 0);
                    const mins = Math.max(0, parts[1] || 0);
                    const secs = Math.max(0, parts[2] || 0);
                    remainingMs = (hrs * 3600 + mins * 60 + secs) * 1000;
                }
            }
            if (remainingMs <= 0) return;
            running = true;
            lastTick = performance.now();
            intervalId = setInterval(tick, 250);
            tick();
        });

        pauseBtn.addEventListener('click', () => {
            if (!running) return;
            running = false;
            if (intervalId) { clearInterval(intervalId); intervalId = null; }
        });

        resetBtn.addEventListener('click', () => {
            running = false;
            if (intervalId) { clearInterval(intervalId); intervalId = null; }
            remainingMs = 0;
            display.textContent = '00:00:00';
        });
    }

    // ----------------------
    // World clock implementation
    // ----------------------
    function initWorldClock() {
        const nyEl = document.getElementById('ny-time');
        const ldnEl = document.getElementById('ldn-time');
        const tokEl = document.getElementById('tokyo-time');
        const extraSelect = document.getElementById('extra-tz-select');
        const extraTimeEl = document.getElementById('extra-tz-time');
        if (!nyEl || !ldnEl || !tokEl) return;

        function updateZones() {
            const now = new Date();
            // Using toLocaleString with timeZone
            try {
                nyEl.textContent = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                ldnEl.textContent = now.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                tokEl.textContent = now.toLocaleTimeString('en-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                if (extraSelect && extraTimeEl && extraSelect.value) {
                    extraTimeEl.textContent = `${extraSelect.value}: ` + now.toLocaleTimeString([], { timeZone: extraSelect.value, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                } else if (extraTimeEl) {
                    extraTimeEl.textContent = '';
                }
            } catch (e) {
                // Fallback: show local time if timeZone not supported
                nyEl.textContent = now.toLocaleTimeString();
                ldnEl.textContent = now.toLocaleTimeString();
                tokEl.textContent = now.toLocaleTimeString();
                if (extraTimeEl) extraTimeEl.textContent = '';
            }
        }

        updateZones();
        setInterval(updateZones, 1000);

        // Restore persisted timezone
        try {
            const saved = localStorage.getItem('extraTimezone');
            if (saved && extraSelect) extraSelect.value = saved;
        } catch (e) {}

        if (extraSelect) {
            extraSelect.addEventListener('change', () => {
                try { localStorage.setItem('extraTimezone', extraSelect.value); } catch (e) {}
            });
        }
    }

});
