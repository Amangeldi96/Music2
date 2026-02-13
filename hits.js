(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    
    if (!audio) return;

    audio.preload = "auto"; // ⚡ preload оптимизация

    const style = document.createElement('style');
    style.innerHTML = `
        .p-progress-container { 
            position: relative; 
            overflow: hidden; 
            background: rgba(0,0,0,0.1); 
            height: 6px; 
            border-radius: 10px; 
            cursor:pointer; 
        }
        .p-progress-buffer { 
            position: absolute; 
            top: 0; 
            left: 0; 
            height: 100%; 
            background: var(--accent); 
            opacity: 0.25; 
            z-index: 1; 
            width: 0%; 
            border-radius: 10px;
            transition: width 0.2s linear;
        }
        .p-progress-fill { 
            z-index: 2; 
            position: relative; 
            background: var(--accent) !important; 
            height: 100%; 
            width: 0%; 
            border-radius: 10px; 
        }

        .is-loading-circle {
            animation: rotate 1s linear infinite;
            border: 3px solid rgba(255,255,255,0.2);
            border-top-color: #fff;
            border-radius: 50%;
            width: 20px; height: 20px;
            display: inline-block;
            vertical-align: middle;
        }
        @keyframes rotate { to { transform: rotate(360deg); } }

        .song-info { display: flex; flex-direction: column; margin-left: 12px; }
        .song-info b { display: block; margin-bottom: 2px; }
        .song-info span { color: #888; font-size: 0.9em; }
    `;
    document.head.appendChild(style);

    const pBuffer = document.createElement('div');
    pBuffer.className = 'p-progress-buffer';
    if (pCont && pFill) pCont.insertBefore(pBuffer, pFill);

    let currentBtn = null;
    let loadingSrc = "";
    let isDragging = false;

    const getPlayIcon = () => `<div class="play-pause-icon is-playing"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;
    const getPauseIcon = () => `<div class="play-pause-icon is-paused"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;
    const getLoadingIcon = () => `<div class="is-loading-circle"></div>`;

    window.togglePlay = function(btn, src, title, artist) {

        if (currentBtn === btn) {
            window.toggleMainPlay();
            return;
        }

        if (currentBtn) currentBtn.innerHTML = getPlayIcon();

        pFill.style.width = "0%";
        pBuffer.style.width = "0%";

        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;

        mainPlayBtn.innerHTML = getLoadingIcon();
        btn.innerHTML = getLoadingIcon();

        currentBtn = btn;
        loadingSrc = src;

        audio.pause();
        audio.src = src;
        audio.load();

        // ⚡ Аз жүктөлсө эле ойнойт
        const tryPlay = () => {
            audio.play().then(() => {
                mainPlayBtn.innerHTML = getPauseIcon();
                btn.innerHTML = getPauseIcon();
                loadingSrc = "";
            }).catch(()=>{});
        };

        audio.addEventListener('canplay', tryPlay, { once: true });
    };

    window.toggleMainPlay = function() {
        if (!currentBtn) return;

        if (audio.paused) {
            audio.play().then(()=>{
                mainPlayBtn.innerHTML = getPauseIcon();
                currentBtn.innerHTML = getPauseIcon();
            }).catch(()=>{});
        } else {
            audio.pause();
            mainPlayBtn.innerHTML = getPlayIcon();
            currentBtn.innerHTML = getPlayIcon();
        }
    };

    audio.addEventListener('waiting', () => {
        mainPlayBtn.innerHTML = getLoadingIcon();
        if(currentBtn) currentBtn.innerHTML = getLoadingIcon();
    });

    audio.addEventListener('playing', () => {
        mainPlayBtn.innerHTML = getPauseIcon();
        if(currentBtn) currentBtn.innerHTML = getPauseIcon();
    });

    // 🎵 Прогресс
    audio.addEventListener('timeupdate', () => {
        if (audio.duration && !isDragging) {
            const percent = (audio.currentTime / audio.duration) * 100;
            pFill.style.width = percent + "%";
        }
    });

    // 📶 Buffer реалдуу жылышы
    audio.addEventListener('progress', () => {
        if (audio.duration && audio.buffered.length > 0) {
            const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
            const percent = (bufferedEnd / audio.duration) * 100;
            pBuffer.style.width = percent + "%";
        }
    });

    // ===== ПЕРЕМОТКА =====
    if (pCont) {

        const seek = (clientX) => {
            if (!audio.duration) return;

            const rect = pCont.getBoundingClientRect();
            let percent = (clientX - rect.left) / rect.width;
            percent = Math.max(0, Math.min(1, percent));

            audio.currentTime = percent * audio.duration;
            pFill.style.width = (percent * 100) + "%";
        };

        pCont.addEventListener('click', (e) => seek(e.clientX));

        pCont.addEventListener('mousedown', (e) => {
            isDragging = true;
            seek(e.clientX);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) seek(e.clientX);
        });

        document.addEventListener('mouseup', () => isDragging = false);

        pCont.addEventListener('touchstart', (e) => {
            isDragging = true;
            seek(e.touches[0].clientX);
        });

        pCont.addEventListener('touchmove', (e) => {
            seek(e.touches[0].clientX);
        });

        pCont.addEventListener('touchend', () => isDragging = false);
    }

    window.renderSongs = function(songsToDisplay = songs) {
        if (!listDiv) return;
        listDiv.innerHTML = "";
        songsToDisplay.forEach((song) => {
            const div = document.createElement('div');
            div.className = 'song-item';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.padding = '10px';
            
            div.innerHTML = `
                <div class="play-icon-circle">${getPlayIcon()}</div>
                <div class="song-info">
                    <b>${song.title}</b>
                    <span>${song.artist}</span>
                </div>
            `;
            const btn = div.querySelector('.play-icon-circle');
            btn.onclick = (e) => { 
                e.stopPropagation(); 
                togglePlay(btn, song.src, song.title, song.artist); 
            };
            listDiv.appendChild(div);
        });
    };

    renderSongs();
})();
