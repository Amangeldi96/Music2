(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const searchInput = document.getElementById('searchInput');

    // 1. СТИЛЬ: Буферди (загрузка) даана көрүнө тургандай кылабыз
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
            opacity: 0.25; /* Өтө тунук эмес, даана көрүнөт */
            z-index: 1; 
            transition: width 0.2s ease-out; /* Тезирээк реакция кылат */
            pointer-events: none;
            border-radius: 10px;
        }
        .p-progress-fill { 
            z-index: 2; 
            position: relative; 
            background: var(--accent) !important;
            height: 100%;
            border-radius: 10px;
            transition: width 0.1s linear;
        }
    `;
    document.head.appendChild(style);

    // Буфер элементин түзүү
    const pBuffer = document.createElement('div');
    pBuffer.className = 'p-progress-buffer';
    if (pCont && pFill) {
        pCont.insertBefore(pBuffer, pFill);
    }

    let currentBtn = null;
    let isDragging = false;

    const iconHTML = `<div class="play-pause-icon is-playing"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;

    // 2. ОЙНОТУУ ФУНКЦИЯСЫ
    window.togglePlay = function(btn, src, title, artist) {
        if (!audio) return;
        
        // Ар бир жаңы ырда буферди тазалап туруу
        pBuffer.style.width = "0%";
        pFill.style.width = "0%";

        const icon = btn.querySelector('.play-pause-icon');
        if (currentBtn === btn) { window.toggleMainPlay(); return; }
        
        if (currentBtn) {
            const oldIcon = currentBtn.querySelector('.play-pause-icon');
            if (oldIcon) oldIcon.classList.replace('is-paused', 'is-playing');
        }

        audio.src = src;
        // Музыканы жүктөө башталды
        audio.load(); 
        audio.play().catch(e => console.log("Play error:", e));
        
        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;
        mainPlayBtn.innerHTML = iconHTML.replace('is-playing', 'is-paused');
        icon.classList.replace('is-playing', 'is-paused');
        currentBtn = btn;
    };

    // 3. ЗАГРУЗКА (BUFFER) ЛОГИКАСЫ - ЭҢ МААНИЛҮҮ ЖЕР
    const updateBuffer = () => {
        if (audio.duration > 0) {
            for (let i = 0; i < audio.buffered.length; i++) {
                // Учурдагы ойноп жаткан убакыттын алдындагы жүктөлгөн бөлүктү табабыз
                if (audio.buffered.start(i) <= audio.currentTime) {
                    const bufferedEnd = audio.buffered.end(i);
                    const percent = (bufferedEnd / audio.duration) * 100;
                    pBuffer.style.width = percent + "%";
                }
            }
        }
    };

    // Аудио жүктөлүп жатканда да, ойноп жатканда да текшерип турат
    audio.addEventListener('progress', updateBuffer);
    audio.addEventListener('timeupdate', updateBuffer);

    // 4. ПРОГРЕСС (ОЙНОП ЖАТКАН УБАКЫТ)
    audio.ontimeupdate = () => {
        if (audio.duration && !isDragging) {
            const currentProgress = (audio.currentTime / audio.duration) * 100;
            pFill.style.width = currentProgress + "%";
            // Жүктөлүүнү да кошо текшерип турабыз
            updateBuffer();
        }
    };

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

    // 6. SCRUBBING (ЖЫЛДЫРУУ)
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
    window.addEventListener('mouseup', () => { if (isDragging) { isDragging = false; pFill.style.transition = 'width 0.1s linear'; } });
    pCont.addEventListener('touchstart', (e) => { isDragging = true; scrub(e); }, {passive: false});
    window.addEventListener('touchmove', (e) => { if (isDragging) { scrub(e); e.preventDefault(); } }, {passive: false});
    window.addEventListener('touchend', () => { isDragging = false; });

    // 7. РЕНДЕР ЖАНА БАШКАЛАР
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
 
