(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const searchInput = document.getElementById('searchInput');

    // СТИЛЬ: Загрузка тилкесин даана жана акцент түскө байлоо
    const style = document.createElement('style');
    style.innerHTML = `
        .p-progress-container { position: relative; overflow: hidden; background: rgba(0,0,0,0.1); height: 6px; border-radius: 10px; }
        .p-progress-buffer { 
            position: absolute; top: 0; left: 0; height: 100%; 
            background: var(--accent); opacity: 0.3; z-index: 1; 
            width: 0%; transition: width 0.2s ease; pointer-events: none;
        }
        .p-progress-fill { z-index: 2; position: relative; background: var(--accent) !important; height: 100%; width: 0%; border-radius: 10px; }
        .loading-pulse { animation: pulse 1.5s infinite; opacity: 0.6; }
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 0.8; } 100% { opacity: 0.4; } }
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

        // 1. Дароо баарын тазалоо (0 кылуу)
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

        // 2. Интерфейсти даярдоо
        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;
        mainPlayBtn.innerHTML = iconHTML.replace('is-playing', 'is-paused');
        mainPlayBtn.classList.add('loading-pulse'); // Жүктөлүп жатканын билдирет

        // 3. Аудиону жүктөө - Vercel үчүн оптималдаштыруу
        audio.pause();
        audio.src = src;
        audio.load(); // Мажбурлап жүктөө
        
        // Ойнотуу аракети
        audio.play().then(() => {
            mainPlayBtn.classList.remove('loading-pulse');
            btn.querySelector('.play-pause-icon').classList.replace('is-playing', 'is-paused');
            currentBtn = btn;
        }).catch(e => console.error("Error playing:", e));
    };

    // БУФЕРДИ ЖАНА ПРОГРЕССТИ ЖАҢЫЛОО
    const updateProgress = () => {
        if (!audio.duration) return;

        // Прогресс (ойноп жаткан жери)
        if (!isDragging) {
            const currentPos = (audio.currentTime / audio.duration) * 100;
            pFill.style.width = currentPos + "%";
        }

        // Жүктөлүү (Buffer)
        if (audio.buffered.length > 0) {
            const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
            const duration = audio.duration;
            const bufferPercent = (bufferedEnd / duration) * 100;
            pBuffer.style.width = bufferPercent + "%";
        }
    };

    // Окуяларды байлоо
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('progress', updateProgress);
    audio.addEventListener('canplay', () => mainPlayBtn.classList.remove('loading-pulse'));
    audio.addEventListener('waiting', () => mainPlayBtn.classList.add('loading-pulse'));

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

    // Тизмени рендерлөө
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
