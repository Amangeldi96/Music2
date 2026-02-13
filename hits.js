(function() {
    const audio = document.getElementById('mainAudio');
    const listDiv = document.getElementById('allList');
    const playerBar = document.getElementById('playerBar');
    const pFill = document.getElementById('pFill');
    const pCont = document.getElementById('pCont');
    const mainPlayBtn = document.getElementById('mainPlayBtn');
    const searchInput = document.getElementById('searchInput');
    
    let currentBtn = null;
    let isDragging = false;

    const iconHTML = `
        <div class="play-pause-icon is-playing">
            <div class="bar bar-1"></div>
            <div class="bar bar-2"></div>
        </div>
    `;

     // 1. Тизмени рендерлөө
    function renderSongs(songsToDisplay = songs) {
        if (!listDiv) return;
        listDiv.innerHTML = "";

        if (songsToDisplay.length === 0) {
            listDiv.innerHTML = `<p style="text-align:center; color:var(--text-sub); margin-top:20px;">Эч нерсе табылган жок...</p>`;
            return;
        }

        songsToDisplay.forEach((song) => {
            const originalIndex = songs.findIndex(s => s.src === song.src);
            
            const div = document.createElement('div');
            div.className = 'song-item';
            div.setAttribute('data-index', originalIndex); 
            div.innerHTML = `
                <div class="play-icon-circle">${iconHTML}</div>
                <div class="song-info">
                    <b>${song.title}</b>
                    <span>${song.artist}</span>
                </div>
            `;

            // БУЛ ЖЕРДЕ ӨЗГӨРҮҮ:
            // div.onclick эмес, дал ошол кнопканы таап, ага гана чыкылдатууну беребиз
            const btn = div.querySelector('.play-icon-circle');
            btn.onclick = (e) => {
                e.stopPropagation(); // Башка элементтерге таасир этпеши үчүн
                togglePlay(btn, song.src, song.title, song.artist);
            };

            listDiv.appendChild(div);
        });
    }


    // 2. Издөө функциясы (Window'го байланган)
    window.searchSongs = function() {
        const query = searchInput.value.toLowerCase().trim();
        const filteredSongs = songs.filter(song => 
            song.title.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query)
        );
        renderSongs(filteredSongs);
    };

    // 3. Ойнотуу функциясы
    window.togglePlay = function(btn, src, title, artist) {
        if (!audio) return;
        const icon = btn.querySelector('.play-pause-icon');

        if (currentBtn === btn) {
            window.toggleMainPlay();
            return;
        }

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

    // 4. Плей/Пауза
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

          // 5. Прогресс барды башкаруу (Өтө плавно scrubbing)
    function scrub(e) {
        if (!audio.duration) return;

        const rect = pCont.getBoundingClientRect();
        // Чычкан же манжанын координатын алуу
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        
        // Пайызды эсептөө (0дон 1ге чейин)
        let percent = Math.min(Math.max(0, x / rect.width), 1);
        
        // 1. Анимацияны (transition) өчүрөбүз, ошондо катып калбайт
        pFill.style.transition = 'none'; 
        pFill.style.width = (percent * 100) + "%";
        
        // 2. Ырдын убактысын дароо өзгөртөбүз
        audio.currentTime = percent * audio.duration;
    }

    // Окуялар (Events)
    pCont.addEventListener('mousedown', (e) => { 
        isDragging = true; 
        pCont.classList.add('dragging');
        scrub(e); 
    });

    window.addEventListener('mousemove', (e) => { 
        if (isDragging) {
            scrub(e);
        }
    });

    window.addEventListener('mouseup', () => { 
        if (isDragging) {
            isDragging = false; 
            pCont.classList.remove('dragging');
            // Сүйрөп бүткөндө анимацияны кайра иштетебиз
            pFill.style.transition = 'width 0.1s linear';
        }
    });
    
    // Мобилдик телефондор үчүн (Touch)
    pCont.addEventListener('touchstart', (e) => { 
        isDragging = true; 
        pCont.classList.add('dragging');
        scrub(e); 
    }, {passive: false}); // passive: false браузердин катып калуусун алдын алат

    window.addEventListener('touchmove', (e) => { 
        if (isDragging) {
            scrub(e);
            e.preventDefault(); // Экрандын ары-бери жылышын токтотот
        }
    }, {passive: false});

    window.addEventListener('touchend', () => { 
        isDragging = false; 
        pCont.classList.remove('dragging');
        pFill.style.transition = 'width 0.1s linear';
    });

    // Убакыт жаңыланганда (Сүйрөп жатканда бул функция иштебеши керек)
    audio.ontimeupdate = () => {
        if (audio.duration && !isDragging) {
            const progress = (audio.currentTime / audio.duration) * 100;
            pFill.style.transition = 'width 0.1s linear'; // Жумшак жүрүү
            pFill.style.width = progress + "%";
        }
    };



    // 6. Авто-плей (Кийинки ырды автоматтык ойнотуу)
    audio.onended = () => {
        const currentIndex = parseInt(currentBtn.closest('.song-item').getAttribute('data-index'));
        const nextIndex = currentIndex + 1;

        if (nextIndex < songs.length) {
            // Тизмеден кийинки ырдын DOM элементин табуу
            const nextSongItem = document.querySelector(`.song-item[data-index="${nextIndex}"]`);
            
            // Эгер издөөдөн улам кийинки ыр экранда жок болсо, маалыматтан алып ойното берет
            const song = songs[nextIndex];
            
            if (nextSongItem) {
                const nextBtn = nextSongItem.querySelector('.play-icon-circle');
                togglePlay(nextBtn, song.src, song.title, song.artist);
            } else {
                // Экранда жок болсо (издөө учурунда), плеерди жаңыртып ойнотот
                audio.src = song.src;
                audio.play();
                document.getElementById('pTitle').innerText = song.title;
                document.getElementById('pArtist').innerText = song.artist;
            }
        }
    };

    // Баштапкы жүктөө
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => renderSongs());
    } else {
        renderSongs();
    }
})();
