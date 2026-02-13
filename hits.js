(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    
    // СТИЛЬ: Прогрессти мажбурлап көрсөтүү
    const style = document.createElement('style');
    style.innerHTML = `
        .p-progress-container { position: relative; overflow: hidden; background: rgba(0,0,0,0.1); height: 6px; border-radius: 10px; }
        .p-progress-buffer { 
            position: absolute; top: 0; left: 0; height: 100%; 
            background: var(--accent); opacity: 0.2; z-index: 1; 
            width: 0%; pointer-events: none;
        }
        .p-progress-fill { z-index: 2; position: relative; background: var(--accent) !important; height: 100%; width: 0%; border-radius: 10px; }
        
        /* Жүктөлүп жатканда спиннер эффекти */
        .is-loading-circle {
            animation: rotate 1s linear infinite;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: #fff;
            border-radius: 50%;
            width: 20px; height: 20px;
        }
        @keyframes rotate { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    const pBuffer = document.createElement('div');
    pBuffer.className = 'p-progress-buffer';
    if (pCont && pFill) pCont.insertBefore(pBuffer, pFill);

    let currentBtn = null;
    let isDragging = false;
    const iconHTML = `<div class="play-pause-icon is-playing"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;

    window.togglePlay = function(btn, src, title, artist) {
        if (!audio) return;

        // 1. МҮНӨТТҮК РЕАКЦИЯ: Баарын заматта 0 кылабыз
        pFill.style.width = "0%";
        pBuffer.style.width = "0%";
        
        if (currentBtn === btn) {
            window.toggleMainPlay();
            return;
        }

        if (currentBtn) {
            const oldIcon = currentBtn.querySelector('.play-pause-icon');
            if (oldIcon) oldIcon.classList.replace('is-paused', 'is-playing');
        }

        // Плеерди дароо активдештирүү
        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;
        
        // Жүктөлүү башталганын визуалдык көрсөтүү
        mainPlayBtn.innerHTML = `<div class="is-loading-circle"></div>`;

        // 2. ОПТИМАЛДУУ ЖҮКТӨӨ
        audio.pause();
        audio.src = src;
        audio.preload = "auto"; // Браузерге дароо жүктөөгө уруксат берүү
        audio.load();

        // 3. FAST PLAY: Эң биринчи берилиш келгенде эле ойнотуу
        audio.onloadeddata = () => {
            audio.play().then(() => {
                mainPlayBtn.innerHTML = iconHTML.replace('is-playing', 'is-paused');
                btn.querySelector('.play-pause-icon').classList.replace('is-playing', 'is-paused');
                currentBtn = btn;
            });
        };
    };

    // БУФЕРДИ ЖАНА ПРОГРЕССТИ ЖАҢЫЛОО (0дөн баштап)
    const updateProgress = () => {
        // Эгер duration али белгисиз болсо, кичинекей жасалма прогресс беребиз (0.5%)
        const duration = audio.duration || 100; 
        
        if (!isDragging) {
            const currentPos = (audio.currentTime / duration) * 100;
            pFill.style.width = currentPos + "%";
        }

        if (audio.buffered.length > 0) {
            const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
            const bufferPercent = (bufferedEnd / duration) * 100;
            pBuffer.style.width = bufferPercent + "%";
        }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('progress', updateProgress);
    
    // Эгер интернет үзүлүп калса же катып калса кайра жүктөө
    audio.addEventListener('waiting', () => {
        mainPlayBtn.innerHTML = `<div class="is-loading-circle"></div>`;
    });
    audio.addEventListener('playing', () => {
        mainPlayBtn.innerHTML = iconHTML.replace('is-playing', 'is-paused');
    });

    window.toggleMainPlay = function() {
        if (!currentBtn) return;
        const listIcon = currentBtn.querySelector('.play-pause-icon');
        const barIcon = mainPlayBtn.querySelector('.play-pause-icon');
        if (audio.paused) {
            audio.play();
            listIcon.classList.replace('is-playing', 'is-paused');
            barIcon.innerHTML = iconHTML.replace('is-playing', 'is-paused');
        } else {
            audio.pause();
            listIcon.classList.replace('is-paused', 'is-playing');
            barIcon.innerHTML = iconHTML.replace('is-paused', 'is-playing');
        }
    };

    // Сүйрөө (Scrubbing)
    function scrub(e) {
        if (!audio.duration) return;
        const rect = pCont.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        let percent = Math.min(Math.max(0, x / rect.width), 1);
        pFill.style.width = (percent * 100) + "%";
        audio.currentTime = percent * audio.duration;
    }

    pCont.addEventListener('mousedown', (e) => { isDragging = true; scrub(e); });
    window.addEventListener('mousemove', (e) => { if (isDragging) scrub(e); });
    window.addEventListener('mouseup', () => isDragging = false);
    pCont.addEventListener('touchstart', (e) => { isDragging = true; scrub(e); }, {passive: false});
    window.addEventListener('touchmove', (e) => { if (isDragging) { scrub(e); e.preventDefault(); } }, {passive: false});
    window.addEventListener('touchend', () => isDragging = false);

    function renderSongs(songsToDisplay = songs) {
        if (!listDiv) return;
        listDiv.innerHTML = "";
        songsToDisplay.forEach((song) => {
            const originalIndex = songs.findIndex(s => s.src === song.src);
            const div = document.createElement('div');
            div.className = 'song-item';
            div.setAttribute('data-index', originalIndex); 
            div.innerHTML = `<div class="play-icon-circle">${iconHTML}</div><div class="song-info"><b>${song.title}</b><span>${song.artist}</span></div>`;
            const btn = div.querySelector('.play-icon-circle');
            btn.onclick = (e) => { e.stopPropagation(); togglePlay(btn, song.src, song.title, song.artist); };
            listDiv.appendChild(div);
        });
    }

    renderSongs();
})();
