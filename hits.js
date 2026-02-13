(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');

    if(!audio) return;
    audio.preload = "metadata";

    // ================= STYLE =================
    const style = document.createElement('style');
    style.innerHTML = `
        .p-progress-container { position: relative; background: rgba(0,0,0,0.1); height: 6px; border-radius: 10px; cursor:pointer; }
        .p-progress-buffer { position: absolute; top:0; left:0; height:100%; background: var(--accent); opacity:0.25; width:0%; border-radius:10px; transition: width 0.2s linear; }
        .p-progress-fill { position: relative; background: var(--accent) !important; height:100%; width:0%; border-radius:10px; }
        .p-handle { position:absolute; top:50%; transform:translateY(-50%); width:14px; height:14px; background:#fff; border-radius:50%; cursor:pointer; z-index:3; }
        .is-loading-circle { animation: rotate 1s linear infinite; border:3px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; width:20px; height:20px; }
        @keyframes rotate { to { transform: rotate(360deg); } }
        .song-info { display:flex; flex-direction:column; margin-left:12px; }
        .song-info span { color:#888; font-size:0.9em; }
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
    let isDragging = false;
    let playRequestId = 0;

    const getPlayIcon = () => `<div class="play-pause-icon is-playing"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;
    const getPauseIcon = () => `<div class="play-pause-icon is-paused"><div class="bar bar-1"></div><div class="bar bar-2"></div></div>`;
    const getLoadingIcon = () => `<div class="is-loading-circle"></div>`;

    function setIcons(state){
        if(!currentBtn) return;
        switch(state){
            case "play": currentBtn.innerHTML = getPlayIcon(); mainPlayBtn.innerHTML = getPlayIcon(); break;
            case "pause": currentBtn.innerHTML = getPauseIcon(); mainPlayBtn.innerHTML = getPauseIcon(); break;
            case "loading": currentBtn.innerHTML = getLoadingIcon(); mainPlayBtn.innerHTML = getLoadingIcon(); break;
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

        if(currentBtn) currentBtn.innerHTML = getPlayIcon();

        currentBtn = btn;
        currentSrc = src;

        pFill.style.width = "0%";
        pBuffer.style.width = "0%";
        handle.style.left = "0%";

        playerBar.classList.add('active');
        document.getElementById('pTitle').innerText = title;
        document.getElementById('pArtist').innerText = artist;

        setIcons("loading"); // дароо спинер

        audio.pause();
        audio.currentTime = 0;
        audio.src = src;
        audio.load();

        audio.addEventListener('canplay', function onCanPlay(){
            if(requestId !== playRequestId) return;
            audio.play().then(()=>{ setIcons("pause"); }).catch(()=>{ setIcons("play"); });
        }, { once:true });
    };

    // ================= MAIN PLAY =================
    window.toggleMainPlay = function(){
        if(!currentSrc) return;
        if(audio.paused){
            setIcons("loading"); // турдурганда да спинер
            audio.play();
        } else {
            audio.pause();
        }
    };

    // ================= AUDIO EVENTS =================
    audio.addEventListener('play', ()=> setIcons("pause"));
    audio.addEventListener('pause', ()=> setIcons("play"));
    audio.addEventListener('waiting', ()=> setIcons("loading"));
    audio.addEventListener('playing', ()=> setIcons("pause"));

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
                setIcons("loading"); // дароо спинер
                togglePlay(btn, song.src, song.title, song.artist);
            };
            listDiv.appendChild(div);
        });
    };

    renderSongs();
})();
