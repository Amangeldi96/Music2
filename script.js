// 1. Негизги объекттерди алуу
const audio = document.getElementById('mainAudio');
let currentBtn = null;

if (audio) {
    audio.preload = "metadata"; 
}

// Сториз үчүн өзгөрмөлөр
const storyModal = document.getElementById('storyFullscreen');
const storyVideo = document.getElementById('mainVideo');
const storyStatusBar = document.getElementById('statusBar');
const storyProgressContainer = document.getElementById('progressBarContainer');
let isStoryDragging = false;
let storyAnim;

// Play иконкасы - Визуалдык борборго такталган (1.8px оңго жылдырылды)
const iconHTML = `
    <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(1, 0)"> 
            <path d="M7.98047 3.51001C5.43047 4.39001 4.98047 9.09992 4.98047 12.4099C4.98047 15.7199 5.41047 20.4099 7.98047 21.3199C10.6905 22.2499 18.9805 16.1599 18.9805 12.4099C18.9805 8.65991 10.6905 2.58001 7.98047 3.51001Z" fill="#ffffff"></path>
        </g>
    </svg>
`;

// Пауза иконкасы - ичинен бир аз кичирейтилген
const pauseIconHTML = `
    <svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(1.5, 1) scale(0.9)">
            <path d="M10 6.42004C10 4.76319 8.65685 3.42004 7 3.42004C5.34315 3.42004 4 4.76319 4 6.42004V18.42C4 20.0769 5.34315 21.42 7 21.42C8.65685 21.42 10 20.0769 10 18.42V6.42004Z" fill="#ffffff"></path>
            <path d="M20 6.42004C20 4.76319 18.6569 3.42004 17 3.42004C15.3431 3.42004 14 4.76319 14 6.42004V18.42C14 20.0769 15.3431 21.42 17 21.42C18.6569 21.42 20 20.0769 20 18.42V6.42004Z" fill="#ffffff"></path>
        </g>
    </svg>
`;



// Спиннер (Жүктөлүү)
const loadingHTML = `<div class="is-loading-circle"></div>`;

// Стилдерди кошуу (Spinner жана өлчөмдөр үчүн)
const style = document.createElement('style');
style.innerHTML = `
    .is-loading-circle { 
        animation: rotate 1s linear infinite; 
        border: 2px solid rgba(255,255,255,0.2); 
        border-top-color: #fff; 
        border-radius: 50%; 
        width: 18px; height: 18px; 
    }
    @keyframes rotate { to { transform: rotate(360deg); } }
    .play-icon-circle svg, .mini-play svg, .upcoming-play svg { display: block; margin: auto; }
`;
document.head.appendChild(style);

function toggleMenu() {
    document.body.classList.toggle('menu-open');
}

// 2. Маалыматтар (Данные) - Өзгөртүлгөн жок
const songs = [
    { artist: "Ulukmanapo & Sam cosmo", title: "Amoremia", src: "assets/song01.mp3" },
    { artist: "G-VOO & FreeMan996", title: "Сагындым", src: "assets/song02.mp3" },
    { artist: "Азамат Токтокадыров", title: "Жок болдум", src: "assets/song03.mp3" },
    { artist: "Зарлык, Айганыш", title: "Сен үчүн", src: "assets/song04.mp3" },
    { artist: "Gorizont & Ulukmanapo", title: "Таң атканда", src: "assets/song05.mp3" },
    { artist: "Мамбет акын", title: "Маралдайым", src: "assets/song07.mp3" },
    { artist: "JaNa", title: "Сагындым сени", src: "assets/song06.mp3" },
    { artist: "Era", title: "Анда санда", src: "assets/song1.mp3" },
    { artist: "Jax 02.14", title: "Өзгөчө күн", src: "assets/song2.mp3" },
    { artist: "Tural Everest", title: "Родная", src: "assets/song3.mp3" },
    { artist: "Turar", title: "Иіс", src: "assets/song4.mp3" },
    { artist: "Али ахмет", title: "Лилия", src: "assets/song5.mp3" },
    { artist: "Freeman 996", title: "Взлетаю", src: "assets/song6.mp3" },
    { artist: "Oberon.MSY", title: "Жалгыз океан", src: "assets/song7.mp3" },
    { artist: "Alan Walker Style", title: "LOST AND FOUND", src: "assets/song8.mp3" },
    { artist: "David Guetta", title: "When We Were Young", src: "assets/song9.mp3" },
    { artist: "Disturbed", title: "The Sound Of Silence", src: "assets/song10.mp3" },
    { artist: "Jazzdauren", title: "Дарите женщинам цветы", src: "assets/song11.mp3" },
    { artist: "Kenya Grace", title: "Strangers", src: "assets/song12.mp3" },
    { artist: "Munisa Rizayeva", title: "Zolim", src: "assets/song13.mp3" },
    { artist: "Jax 02.14", title: "Жубайыма", src: "assets/song14.mp3" },
    { artist: "Jax 02.14", title: "Бурдершафт", src: "assets/song15.mp3" },
    { artist: "Freeman 996 x Jax 02.14", title: "Асылым", src: "assets/song16.mp3" },
    { artist: "Jax 02.14, Ulukmanapo", title: "Taranchym", src: "assets/song17.mp3" },
    { artist: "Freeman 996 & Jax 02.14", title: "Сагынам", src: "assets/song18.mp3" },
    { artist: "Elnur Nauryzbek", title: "толқын толқын", src: "assets/song19.mp3" },
    { artist: "Ulukmanapo & Bakr", title: "Мало и мало", src: "assets/song20.mp3" },
    { artist: "Topic & A7S", title: "Out my head", src: "assets/song21.mp3" },
    { artist: "Freeman 996", title: "Күтпөгүн", src: "assets/song22.mp3" },
    { artist: "Нурила", title: "Көлдүк жигитке", src: "assets/song23.mp3" },
    { artist: "Sean finn", title: "Give it to me (extended club mix)", src: "assets/song24.mp3" }
];

const artistsInfo = [
    { name: "Мирбек Атабеков", career: "Актер, певец", bday: "11 Август 1986", place: "Талас" },
    { name: "Нурила", career: "Певица", bday: "2000 г.", place: "Ош, Өзгөн" },
    { name: "Jax 02.14", career: "Певец", bday: "16 Июнь 1991", place: "Сокулук" },
    { name: "Ulukmanapo", career: "Репер, певец", bday: "18 Сентябрь 1993", place: "Бишкек" },
    { name: "Aftok", career: "Певец", bday: "---", place: "Ысык-Көл" },
    { name: "Freeman 996", career: "Певец", bday: "---", place: "Балыкчы" }
];

const upcomingSongs = [
    { artist: "Бакыт Сейитбеков", title: "Анатомия", cover: "img/upcoming/u1.jpg", preview: "assets/preview1.mp3" },
    { artist: "Ulukmanapo", title: "Не сегодния", cover: "img/upcoming/u2.jpg", preview: "assets/preview2.mp3" },
    { artist: "Нурила", title: "Жай гана", cover: "img/upcoming/u3.jpg", preview: "assets/preview3.mp3" }
];

// 3. Универсалдуу ойноо функциясы (ТЕЗДЕТИЛГЕН)
function togglePlay(btn, src) {
    if (storyModal && storyModal.style.display === 'block') {
        closeStory();
    }
    
    // Эгер ошол эле ыр болсо
    if (currentBtn === btn) {
        if (audio.paused) {
            audio.play();
            btn.innerHTML = pauseIconHTML;
        } else {
            audio.pause();
            btn.innerHTML = iconHTML;
        }
        return;
    }

    // Жаңы ырды жүктөөдө эски баскычты Play кылуу
    if (currentBtn) {
        currentBtn.innerHTML = iconHTML;
        const prevCard = currentBtn.closest('.upcoming-card') || currentBtn.closest('.block');
        if (prevCard && prevCard.querySelector('.progress-bg')) {
            prevCard.querySelector('.progress-bg').style.width = '0%';
        }
    }

    currentBtn = btn;
    btn.innerHTML = loadingHTML; // Жүктөлүү спиннери

    audio.pause();
    audio.src = src;
    
    audio.oncanplay = () => {
        audio.play().catch(e => console.log(e));
        btn.innerHTML = pauseIconHTML;
        audio.oncanplay = null; 
    };

    audio.load(); 
}

// 4. Музыка прогресс бары
audio.ontimeupdate = () => {
    if (currentBtn && audio.duration) {
        const activeCard = currentBtn.closest('.upcoming-card') || currentBtn.closest('.block');
        if (activeCard) {
            const progressBar = activeCard.querySelector('.progress-bg');
            if (progressBar) {
                const percentage = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = percentage + '%';
            }
        }
    }
};

// 5. СТОРИЗ ЛОГИКАСЫ - Өзгөртүлгөн жок
function animateStoryProgress() {
    if (!isStoryDragging && !storyVideo.paused && storyVideo.duration) {
        const percentage = (storyVideo.currentTime / storyVideo.duration) * 100;
        storyStatusBar.style.width = percentage + '%';
    }
    storyAnim = requestAnimationFrame(animateStoryProgress);
}

function viewStory(src, element) {
    if (audio && !audio.paused) audio.pause();
    storyStatusBar.style.width = '0%';
    storyVideo.src = src;
    storyVideo.load();
    storyModal.style.display = 'block';

    storyVideo.oncanplay = () => {
        storyVideo.play();
        cancelAnimationFrame(storyAnim);
        storyAnim = requestAnimationFrame(animateStoryProgress);
    };
    element.classList.add('viewed');
    markAsViewed(element.getAttribute('data-id'));
}

function closeStory() { 
    storyModal.style.display = 'none'; 
    storyVideo.pause();
    cancelAnimationFrame(storyAnim);
    storyVideo.removeAttribute('src'); 
    storyVideo.load(); 
    storyStatusBar.style.width = '0%';
    if (storyProgressContainer) storyProgressContainer.classList.remove('active');
    isStoryDragging = false;
}

function handleStoryScrub(e) {
    if (!storyVideo.duration) return;
    const rect = storyProgressContainer.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    let percent = Math.min(Math.max(0, x / rect.width), 1);
    
    storyStatusBar.style.width = (percent * 100) + '%';
    if (isStoryDragging) {
        storyVideo.currentTime = percent * storyVideo.duration;
    }
}

const startDragging = (e) => {
    isStoryDragging = true;
    storyProgressContainer.classList.add('active'); 
    storyVideo.pause();
    handleStoryScrub(e);
};

const stopDragging = () => {
    if (isStoryDragging) {
        isStoryDragging = false;
        storyProgressContainer.classList.remove('active'); 
        storyVideo.play();
        storyAnim = requestAnimationFrame(animateStoryProgress);
    }
};

if (storyProgressContainer) {
    storyProgressContainer.addEventListener('mousedown', startDragging);
    storyProgressContainer.addEventListener('touchstart', startDragging, { passive: false });
}

window.addEventListener('mousemove', (e) => { if (isStoryDragging) handleStoryScrub(e); });
window.addEventListener('touchmove', (e) => { if (isStoryDragging) handleStoryScrub(e); }, { passive: false });
window.addEventListener('mouseup', stopDragging);
window.addEventListener('touchend', stopDragging);

storyVideo.onended = closeStory;

// 6. Тизмелерди экранга чыгаруу
document.addEventListener('DOMContentLoaded', () => {
    const albumContainer = document.getElementById('albumList');
    if (albumContainer) {
        songs.slice(0, 5).forEach((song, index) => {
            const div = document.createElement('div');
            div.className = 'block';
            div.innerHTML = `
                <div class="progress-container"><div class="progress-bg"></div></div>
                <div class="song-image" style="background-image: url('img/home-album/img${index + 1}.jpg');"></div>
                <div class="block-text"><b>${song.artist}</b><p style="font-size:12px">${song.title}</p></div>
                <div class="mini-play" onclick="togglePlay(this, '${song.src}')">${iconHTML}</div>
            `;
            albumContainer.appendChild(div);
        });
    }

    const hitContainer = document.getElementById('hitList');
    if (hitContainer) {
        songs.slice(5).forEach(song => {
            const div = document.createElement('div');
            div.className = 'song-item';
            div.innerHTML = `
                <div class="play-icon-circle" onclick="togglePlay(this, '${song.src}')">${iconHTML}</div>
                <div class="song-name"><b>${song.title}</b><span>${song.artist}</span></div>
            `;
            hitContainer.appendChild(div);
        });
    }

    const upcomingContainer = document.getElementById("upcomingList");
    if (upcomingContainer) {
        upcomingSongs.forEach(song => {
            const div = document.createElement("div");
            div.className = "upcoming-card";
            div.innerHTML = `
                <div class="progress-container"><div class="progress-bg"></div></div>
                <div class="upcoming-badge">Жакында</div>
                <div class="cover" style="background-image:url('${song.cover}')"></div>
                <div class="card-content"><b>${song.artist}</b><p>${song.title}</p></div>
                <div class="upcoming-play" onclick="togglePlay(this, '${song.preview}')">${iconHTML}</div>
            `;
            upcomingContainer.appendChild(div);
        });
    }

    const artistDetailContainer = document.getElementById('artistDetailContainer');
    if (artistDetailContainer) {
        artistsInfo.forEach(art => {
            const div = document.createElement('div');
            div.className = 'artist-detail-card';
            div.innerHTML = `
                <b class="artist-name">${art.name}</b>
                <table class="tabl">
                    <tr><td class="tdr">Карера</td><td>${art.career}</td></tr>
                    <tr><td class="tdr">Туулган жылы</td><td>${art.bday}</td></tr>
                    <tr><td class="tdr">Место</td><td>${art.place}</td></tr>
                </table>
            `;
            artistDetailContainer.appendChild(div);
        });
    }
});

function markAsViewed(id) {
    let viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
    if (!viewedStories.includes(id)) {
        viewedStories.push(id);
        localStorage.setItem('viewedStories', JSON.stringify(viewedStories));
    }
}

function changeTheme(themeName) {
    const themes = ['light', 'dark', 'gold', 'green', 'red'];
    document.body.classList.remove(...themes);
    document.documentElement.classList.remove(...themes);
    document.body.classList.add(themeName);
    document.documentElement.classList.add(themeName);
    localStorage.setItem('selected-app-theme', themeName);
}

audio.onended = () => { 
    if (currentBtn) {
        currentBtn.innerHTML = iconHTML;
        const activeCard = currentBtn.closest('.upcoming-card') || currentBtn.closest('.block');
        if (activeCard && activeCard.querySelector('.progress-bg')) {
            activeCard.querySelector('.progress-bg').style.width = '0%';
        }
        currentBtn = null;
    }
};
