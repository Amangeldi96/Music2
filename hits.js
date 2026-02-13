(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    
    // СТИЛЬ: Тизмедеги жана плеердеги спиннер үчүн
    const style = document.createElement('style');
    style.innerHTML = `
        .p-progress-container { position: relative; overflow: hidden; background: rgba(0,0,0,0.1); height: 6px; border-radius: 10px; }
        .p-progress-buffer { position: absolute; top: 0; left: 0; height: 100%; background: var(--accent); opacity: 0.2; z-index: 1; width: 0%; }
        .p-progress-fill { z-index: 2; position: relative; background: var(--accent) !important; height: 100%; width: 0%; border-radius: 10px; }
        
        /* Спиннер стили */
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

        /* Тизмедеги баскычтын ичиндеги спиннер үчүн бир аз тууралоо */
        .play-icon-circle .is-loading-circle {
            width: 18px;
            height: 18px;
            border-width: 2px;
        }
    `;
    document.head.appendChild(style);

    const pBuffer = document.createElement('div');
    pBuffer.className = 'p-progress-buffer';
    if (pCont && pFill) pCont.insertBefore(pBuffer, pFill);

    let currentBtn = null;

    // Иконкаларды алуу функциялары
    const getPlayIcon = () => `<div class="play-pause-icon is-playing"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;
    const getPauseIcon = () => `<div class="play-pause-icon is-paused"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;
    const getLoadingIcon = () => `<div class="is-loading-circle"></div>`;

    window.togglePlay = function(btn, src, title, artist) {
        if (!audio) return;

        // Эгер ошол эле ыр басылса - пауза/плей
        if (currentBtn === btn) {
            window.toggleMainPlay();
            return;
        }

        // Мурунку ырдын баскычын Плейге кайтаруу
        if (currentBtn) currentBtn.innerHTML = getPlayIcon();

        pFill.style.width = "0%";
        pBuffer.style.width = "0%";
        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;
        
        // Тизмедеги баскычка жана плеерге спиннерди коюу
        mainPlayBtn.innerHTML = getLoadingIcon();
        btn.innerHTML = getLoadingIcon();
        currentBtn = btn; // Учурдагы баскычты эстеп калуу

        audio.pause();
        audio.src = src;
        audio.load();

        audio.onloadeddata = () => {
            audio.play().then(() => {
                mainPlayBtn.innerHTML = getPauseIcon();
                btn.innerHTML = getPauseIcon();
            });
        };
    };

    window.toggleMainPlay = function() {
        if (!currentBtn) return;
        if (audio.paused) {
            audio.play();
            mainPlayBtn.innerHTML = getPauseIcon();
            currentBtn.innerHTML = getPauseIcon();
        } else {
            audio.pause();
            mainPlayBtn.innerHTML = getPlayIcon();
            currentBtn.innerHTML = getPlayIcon();
        }
    };

    // Окуялар: Интернет жай болсо тизмеде да спиннер айланат
    audio.addEventListener('waiting', () => {
        mainPlayBtn.innerHTML = getLoadingIcon();
        if(currentBtn) currentBtn.innerHTML = getLoadingIcon();
    });

    audio.addEventListener('playing', () => {
        mainPlayBtn.innerHTML = getPauseIcon();
        if(currentBtn) currentBtn.innerHTML = getPauseIcon();
    });

    audio.ontimeupdate = () => {
        if (audio.duration) {
            pFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
            if (audio.buffered.length > 0) {
                const b = audio.buffered.end(audio.buffered.length - 1);
                pBuffer.style.width = (b / audio.duration) * 100 + "%";
            }
        }
    };

    // Тизмени рендерлөө (Render)
    window.renderSongs = function(songsToDisplay = songs) {
        if (!listDiv) return;
        listDiv.innerHTML = "";
        songsToDisplay.forEach((song) => {
            const originalIndex = songs.findIndex(s => s.src === song.src);
            const div = document.createElement('div');
            div.className = 'song-item';
            div.innerHTML = `
                <div class="play-icon-circle">${getPlayIcon()}</div>
                <div class="song-info"><b>${song.title}</b><span>${song.artist}</span></div>
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
