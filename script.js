// 1. Негизги объекттерди алуу
const audio = document.getElementById('mainAudio');
let currentBtn = null;

// Сториз үчүн өзгөрмөлөр
const storyModal = document.getElementById('storyFullscreen');
const storyVideo = document.getElementById('mainVideo');
const storyStatusBar = document.getElementById('statusBar');
const storyProgressContainer = document.getElementById('progressBarContainer');
let isStoryDragging = false;
let storyAnim;

// Менюну ачуу/жабуу
function toggleMenu() {
    document.body.classList.toggle('menu-open');
}

const iconHTML = `
    <div class="play-pause-icon is-playing">
        <div class="bar bar-1"></div>
        <div class="bar bar-2"></div>
    </div>
`;

// 2. Маалыматтар (Данные)
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

// 3. Универсалдуу ойноо функциясы (Музыка үчүн)
function togglePlay(btn, src) {
    if (storyModal && storyModal.style.display === 'block') {
        closeStory();
    }
    const icon = btn.querySelector('.play-pause-icon');
    if (currentBtn === btn) {
        if (audio.paused) {
            audio.play().catch(e => console.log("Play error:", e));
            icon.classList.replace('is-playing', 'is-paused');
        } else {
            audio.pause();
            icon.classList.replace('is-paused', 'is-playing');
        }
    } else {
        if (currentBtn) {
            const oldIcon = currentBtn.querySelector('.play-pause-icon');
            if (oldIcon) oldIcon.classList.replace('is-paused', 'is-playing');
            const prevCard = currentBtn.closest('.upcoming-card') || currentBtn.closest('.block');
            if (prevCard && prevCard.querySelector('.progress-bg')) {
                prevCard.querySelector('.progress-bg').style.width = '0%';
            }
        }
        audio.src = src;
        audio.load(); 
        audio.play().then(() => {
            icon.classList.replace('is-playing', 'is-paused');
            currentBtn = btn;
        }).catch(e => console.error("Жүктөө катасы:", e));
    }
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

// 5. СТОРИЗ ЛОГИКАСЫ
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
        storyVideo.play().catch(e => console.log("Story error:", e));
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
    storyProgressContainer.classList.remove('active'); // Ичкертүү
    isStoryDragging = false;
}

// Түрдүрүү (Scrubbing) - Басканда жоонотуу функциясы менен
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

// Басканда (Жоонотуу башталат)
const startDragging = (e) => {
    isStoryDragging = true;
    storyProgressContainer.classList.add('active'); // CSS үчүн класс (Жоонотуу)
    storyVideo.pause();
    handleStoryScrub(e);
};

// Койо бергенде (Кайра ичкерип, видео уланат)
const stopDragging = () => {
    if (isStoryDragging) {
        isStoryDragging = false;
        storyProgressContainer.classList.remove('active'); // Кайра ичкертүү
        storyVideo.play();
        storyAnim = requestAnimationFrame(animateStoryProgress);
    }
};

storyProgressContainer.addEventListener('mousedown', startDragging);
storyProgressContainer.addEventListener('touchstart', (e) => {
    startDragging(e);
}, { passive: false });

window.addEventListener('mousemove', (e) => {
    if (isStoryDragging) handleStoryScrub(e);
});
window.addEventListener('touchmove', (e) => {
    if (isStoryDragging) handleStoryScrub(e);
}, { passive: false });

window.addEventListener('mouseup', stopDragging);
window.addEventListener('touchend', stopDragging);

storyVideo.onended = closeStory;

// 6. Тизмелерди экранга чыгаруу
document.addEventListener('DOMContentLoaded', () => {
    // AlbumList, HitList, UpcomingList, ArtistDetail ж.б. (Кодуң өзгөрүүсүз калат)
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

// 7. Көмөкчү функциялар
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
        const icon = currentBtn.querySelector('.play-pause-icon');
        if (icon) icon.classList.replace('is-paused', 'is-playing');
        const activeCard = currentBtn.closest('.upcoming-card') || currentBtn.closest('.block');
        if (activeCard && activeCard.querySelector('.progress-bg')) {
            activeCard.querySelector('.progress-bg').style.width = '0%';
        }
        currentBtn = null;
    }
};
        
