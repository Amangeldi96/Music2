(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const nextBtn = document.getElementById('nextBtn');

    if(!audio) return;
    audio.preload = "metadata";

    // ================= STYLE =================
    const style = document.createElement('style');
    style.innerHTML = `
        .p-progress-container { position: relative; background: rgba(0,0,0,0.1); height: 6px; border-radius: 10px; cursor:pointer; }
        .p-progress-buffer { position: absolute; top:0; left:0; height:100%; background: var(--accent); opacity:0.25; width:0%; border-radius:10px; transition: width 0.2s linear; }
        .p-progress-fill { position: relative; background: var(--accent) !important; height:100%; width:0%; border-radius:10px; }
        .p-handle { position:absolute; top:50%; transform:translateY(-50%); width:14px; height:14px; background:#fff; border-radius:50%; cursor:pointer; z-index:3; }
        .is-loading-circle { animation: rotate 1s linear infinite; border:3px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; width:20px; height:20px; margin: auto; }
        @keyframes rotate { to { transform: rotate(360deg); } }
        .song-info { display:flex; flex-direction:column; margin-left:12px; }
        .song-info span { color:#888; font-size:0.9em; }
        .play-icon-circle svg { display: block; }
    `;
    document.head.appendChild(style);

    // ================= BUFFER & HANDLE =================
    const pBuffer = document.createElement('div');
    pBuffer.className = 'p-progress-buffer';
    if(pCont && pFill) pCont.insertBefore(pBuffer, pFill);

    const handle = document.createElement('div');
    handle.className = 'p-handle';
    if(pCont) pCont.appendChild(handle);

    // ================= STATE =================
    let currentBtn = null;
    let currentSrc = "";
    let currentIndex = -1;
    let isDragging = false;
    let playRequestId = 0;

    // Плей иконкасы (Сиз берген туюк үч бурчтук)
    const getPlayIcon = () => `
        <svg width="24" height="24" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.98047 3.51001C5.43047 4.39001 4.98047 9.09992 4.98047 12.4099C4.98047 15.7199 5.41047 20.4099 7.98047 21.3199C10.6905 22.2499 18.9805 16.1599 18.9805 12.4099C18.9805 8.65991 10.6905 2.58001 7.98047 3.51001Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;

    // Пауза иконкасы (Сиз берген туюк эки тилке)
    const getPauseIcon = () => `
        <svg width="24" height="24" viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6.42004C10 4.76319 8.65685 3.42004 7 3.42004C5.34315 3.42004 4 4.76319 4 6.42004V18.42C4 20.0769 5.34315 21.42 7 21.42C8.65685 21.42 10 20.0769 10 18.42V6.42004Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M20 6.42004C20 4.76319 18.6569 3.42004 17 3.42004C15.3431 3.42004 14 4.76319 14 6.42004V18.42C14 20.0769 15.3431 21.42 17 21.42C18.6569 21.42 20 20.0769 20 18.42V6.42004Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>`;

    const getLoadingIcon = () => `<div class="is-loading-circle"></div>`;

    function setIcons(state){
        if(!currentBtn) return;
        switch(state){
            case "playing": 
                currentBtn.innerHTML = getPauseIcon(); 
                mainPlayBtn.innerHTML = getPauseIcon(); 
                break;
            case "paused": 
                currentBtn.innerHTML = getPlayIcon(); 
                mainPlayBtn.innerHTML = getPlayIcon(); 
                break;
            case "loading": 
                currentBtn.innerHTML = getLoadingIcon(); 
                mainPlayBtn.innerHTML = getLoadingIcon(); 
                break;
        }
    }

    // ================= PLAY SONG =================
    window.togglePlay = function(btn, src, title, artist){
        if(currentSrc === src){
            toggleMainPlay();
            return;
        }

        playRequestId++;
        const requestId = playRequestId;

        // Эски баскычты Play'ге кайтаруу
        if(currentBtn) currentBtn.innerHTML = getPlayIcon();

        currentBtn = btn;
        currentSrc = src;

        if(typeof songs !== "undefined"){
            currentIndex = songs.findIndex(s => s.src === src);
        }

        pFill.style.width = "0%";
        pBuffer.style.width = "0%";
        handle.style.left = "0%";

        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;

        setIcons("loading");

        audio.pause();
        audio.currentTime = 0;
        audio.src = src;
        audio.load();

        audio.addEventListener('canplay', function onCanPlay(){
            if(requestId !== playRequestId) return;
            audio.play().then(()=>{ setIcons("playing"); }).catch(()=>{ setIcons("paused"); });
        }, { once:true });
    };

    // ================= MAIN PLAY =================
    window.toggleMainPlay = function(){
        if(!currentSrc) return;
        if(audio.paused){
            audio.play();
        } else {
            audio.pause();
        }
    };

    // ================= NEXT SONG =================
    function playNext(){
        if(typeof songs === "undefined" || !songs.length) return;
        currentIndex++;
        if(currentIndex >= songs.length) currentIndex = 0;

        const nextSong = songs[currentIndex];
        const songElements = document.querySelectorAll('.play-icon-circle');
        const btn = songElements[currentIndex];

        if(btn){
            togglePlay(btn, nextSong.src, nextSong.title, nextSong.artist);
        }
    }

    if(nextBtn) nextBtn.addEventListener('click', playNext);
    audio.addEventListener('ended', playNext);

    // ================= AUDIO EVENTS =================
    audio.addEventListener('play', ()=> setIcons("playing"));
    audio.addEventListener('pause', ()=> setIcons("paused"));
    audio.addEventListener('waiting', ()=> setIcons("loading"));
    audio.addEventListener('playing', ()=> setIcons("playing"));

    audio.addEventListener('timeupdate', ()=>{
        if(!isDragging && audio.duration){
            const percent = (audio.currentTime/audio.duration)*100;
            pFill.style.width = percent + "%";
            handle.style.left = percent + "%";
        }
        if(audio.duration && audio.buffered.length>0){
            const percent = (audio.buffered.end(audio.buffered.length-1)/audio.duration)*100;
            pBuffer.style.width = percent + "%";
        }
    });

    // ================= SEEK =================
    if(pCont){
        const seek = (clientX)=>{
            if(!audio.duration) return;
            const rect = pCont.getBoundingClientRect();
            let percent = (clientX-rect.left)/rect.width;
            percent = Math.max(0, Math.min(1, percent));
            audio.currentTime = percent*audio.duration;
            pFill.style.width = percent*100 + "%";
            handle.style.left = percent*100 + "%";
        };

        pCont.addEventListener('click', e=>seek(e.clientX));
        const startDrag = e => { isDragging=true; seek(e.clientX); };
        const moveDrag = e => { if(isDragging) seek(e.clientX); };
        const endDrag = ()=>{ isDragging=false; };

        pCont.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);

        pCont.addEventListener('touchstart', e=>{ isDragging=true; seek(e.touches[0].clientX); });
        pCont.addEventListener('touchmove', e=>seek(e.touches[0].clientX));
        pCont.addEventListener('touchend', ()=>{ isDragging=false; });
    }

    // ================= RENDER SONGS =================
    window.renderSongs = function(songsToDisplay = songs){
        if(!listDiv) return;
        listDiv.innerHTML = "";
        songsToDisplay.forEach(song=>{
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
            btn.onclick = e=>{
                e.stopPropagation();
                togglePlay(btn, song.src, song.title, song.artist);
            };
            listDiv.appendChild(div);
        });
    };

    renderSongs();
})();
