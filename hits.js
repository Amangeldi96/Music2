(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const searchInput = document.getElementById('searchInput');

    // 1. СТИЛЬ: Загрузка тилкесин даана жана плавный кылабыз
    const style = document.createElement('style');
    style.innerHTML = `
        .p-progress-container { 
            position: relative; 
            overflow: hidden; 
            background: rgba(125, 125, 125, 0.15); 
            height: 6px;
            border-radius: 10px;
        }
        .p-progress-buffer { 
            position: absolute; 
            top: 0; left: 0; height: 100%; 
            background: var(--accent); 
            opacity: 0.3; 
            z-index: 1; 
            width: 0%;
            transition: width 0.3s ease;
            pointer-events: none;
            border-radius: 10px;
        }
        .p-progress-fill { 
            z-index: 2; 
            position: relative; 
            background: var(--accent) !important;
            height: 100%;
            width: 0%;
            border-radius: 10px;
            transition: width 0.1s linear;
        }
        /* Жүктөлүп жатканда плеер баскычы бир аз тунук болуп турат */
        .player-loading { opacity: 0.5; pointer-events: none; }
    `;
    document.head.appendChild(style);

    const pBuffer = document.createElement('div');
    pBuffer.className = 'p-progress-buffer';
    if (pCont && pFill) { pCont.insertBefore(pBuffer, pFill); }

    let currentBtn = null;
    let isDragging = false;
    const iconHTML = `<div class="play-pause-icon is-playing"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;

    // 2. ЖҮКТӨӨ ЖАНА ОЙНОТУУ
    window.togglePlay = function(btn, src, title, artist) {
        if (!audio) return;
        
        // Маанилүү: Жаңы ыр башталаар замат баарын НӨЛ кылабыз
        pFill.style.transition = 'none';
        pBuffer.style.width = "0%";
        pFill.style.width = "0%";
        
        const icon = btn.querySelector('.play-pause-icon');
        if (currentBtn === btn) { window.toggleMainPlay(); return; }
        
        if (currentBtn) {
            const oldIcon = currentBtn.querySelector('.play-pause-icon');
            if (oldIcon) oldIcon.classList.replace('is-paused', 'is-playing');
        }

        // Плеерди даярдоо
        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;
        mainPlayBtn.innerHTML = iconHTML.replace('is-playing', 'is-paused');
        
        // Аудиону жүктөө
        audio.pause();
        audio.src = src;
        audio.load(); // Серверден жүктөөнү баштоо
        
        // Жүктөлүп баштаганда индикатор берип турабыз
        mainPlayBtn.classList.add('player-loading');

        // Ойнотуу (браузер уруксат бергенде)
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                mainPlayBtn.classList.remove('player-loading');
                icon.classList.replace('is-playing', 'is-paused');
                currentBtn = btn;
            }).catch(error => {
                console.log("Жүктөө катасы:", error);
            });
        }
    };

    // 3. БУФЕРДИ ТАК ЭСЕПТӨӨ
    const updateBuffer = () => {
        if (audio.duration) {
            const buffered = audio.buffered;
            if (buffered.length > 0) {
                // Учурдагы убакытка эң жакын жүктөлгөн сегментти табабыз
                for (let i = 0; i < buffered.length; i++) {
                    if (buffered.start(i) <= audio.currentTime) {
                        const percent = (buffered.end(i) / audio.duration) * 100;
                        pBuffer.style.width = percent + "%";
                    }
                }
            }
        }
    };

    audio.addEventListener('progress', updateBuffer);
    audio.addEventListener('waiting', () => mainPlayBtn.classList.add('player-loading'));
    audio.addEventListener('playing', () => mainPlayBtn.classList.remove('player-loading'));

    // 4. ПРОГРЕСС ЖАНА 0дөн БАШТАП ЭСЕПТӨӨ
    audio.addEventListener('timeupdate', () => {
        if (audio.duration && !isDragging) {
            pFill.style.transition = 'width 0.1s linear';
            const currentProgress = (audio.currentTime / audio.duration) * 100;
            pFill.style.width = currentProgress + "%";
            updateBuffer();
        }
    });

    // 5. ПАУЗА / ПЛЕЙ
    window.toggleMainPlay = function() {
        if (!currentBtn) return;
        const listIcon = currentBtn.querySelector('.play-pause-icon');
        const barIcon = mainPlayBtn.querySelector('.play-pause-icon');
        if (audio.paused) {
            audio.play();
            listIcon.classList.replace('is-playing', 'is-paused');
            barIcon.classList.replace('is-playing', 'is-paused');
        } else {
            audio.pause();
            listIcon.classList.replace('is-paused', 'is-playing');
            barIcon.classList.replace('is-paused', 'is-playing');
        }
    };

    // 6. SCRUBBING
    function scrub(e) {
        if (!audio.duration) return;
        const rect = pCont.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        let percent = Math.min(Math.max(0, x / rect.width), 1);
        pFill.style.transition = 'none'; 
        pFill.style.width = (percent * 100) + "%";
        audio.currentTime = percent * audio.duration;
    }

    pCont.addEventListener('mousedown', (e) => { isDragging = true; scrub(e); });
    window.addEventListener('mousemove', (e) => { if (isDragging) scrub(e); });
    window.addEventListener('mouseup', () => { if (isDragging) isDragging = false; });
    pCont.addEventListener('touchstart', (e) => { isDragging = true; scrub(e); }, {passive: false});
    window.addEventListener('touchmove', (e) => { if (isDragging) { scrub(e); e.preventDefault(); } }, {passive: false});
    window.addEventListener('touchend', () => { isDragging = false; });

    // Рендер
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
    
