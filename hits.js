(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const searchInput = document.getElementById('searchInput');

    // 1. ТЕМАНЫН ТҮСҮНӨ ЫЛАЙЫКТАШКАН СТИЛЬ
    const style = document.createElement('style');
    style.innerHTML = `
        .p-progress-container { 
            position: relative; 
            overflow: hidden; 
            background: rgba(125, 125, 125, 0.1); 
            height: 6px;
            border-radius: 10px;
        }
        .p-progress-buffer { 
            position: absolute; 
            top: 0; left: 0; height: 100%; 
            /* Тандалган темага жараша түс алат */
            background: var(--accent) !important; 
            opacity: 0.3; /* Жүктөлүү экени билинип турушу үчүн тунук */
            z-index: 1; 
            transition: width 0.3s ease;
            pointer-events: none;
            border-radius: 10px;
        }
        .p-progress-fill { 
            z-index: 2; 
            position: relative; 
            background: var(--accent) !important;
            height: 100%;
            border-radius: 10px;
        }
    `;
    document.head.appendChild(style);

    const pBuffer = document.createElement('div');
    pBuffer.className = 'p-progress-buffer';
    if (pCont && pFill) {
        pCont.insertBefore(pBuffer, pFill);
    }

    let currentBtn = null;
    let isDragging = false;

    const iconHTML = `<div class="play-pause-icon is-playing"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;

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

    window.togglePlay = function(btn, src, title, artist) {
        if (!audio) return;
        pBuffer.style.width = "0%";
        pFill.style.width = "0%";
        const icon = btn.querySelector('.play-pause-icon');
        if (currentBtn === btn) { window.toggleMainPlay(); return; }
        if (currentBtn) {
            const oldIcon = currentBtn.querySelector('.play-pause-icon');
            if (oldIcon) oldIcon.classList.replace('is-paused', 'is-playing');
        }
        audio.src = src;
        audio.play().catch(e => console.log("Play error:", e));
        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;
        mainPlayBtn.innerHTML = iconHTML.replace('is-playing', 'is-paused');
        icon.classList.replace('is-playing', 'is-paused');
        currentBtn = btn;
    };

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
    
    // БУФЕРЛӨӨ ЛОГИКАСЫ
    audio.addEventListener('progress', () => {
        if (audio.duration > 0) {
            for (let i = 0; i < audio.buffered.length; i++) {
                if (audio.buffered.start(i) <= audio.currentTime) {
                    const percent = (audio.buffered.end(i) / audio.duration) * 100;
                    if (pBuffer) pBuffer.style.width = percent + "%";
                }
            }
        }
    });

    audio.ontimeupdate = () => {
        if (audio.duration && !isDragging) {
            pFill.style.width = (audio.currentTime / audio.duration) * 100 + "%";
        }
    };

    audio.onended = () => { /* Авто-плей логикасы бул жерде калат */ };

    renderSongs();
})();
