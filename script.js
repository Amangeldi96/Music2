

const audio = document.getElementById('mainAudio');
        let currentBtn = null;

        function toggleMenu() {
            document.body.classList.toggle('menu-open');
        }

        const iconHTML = `
            <div class="play-pause-icon is-playing">
                <div class="bar bar-1"></div>
                <div class="bar bar-2"></div>
            </div>
        `;

        // Сиздин ырларыңыздын тизмеси (өзгөргөн жок)
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
            { name: "Мирбек Атабеков", career: "Актер, певец", bday: "11 Август 1986", age: "38 лет", place: "Талас" },
            { name: "Нурила", career: "Певица", bday: "2000 г.", age: "24", place: "Ош, Өзгөн" },
            { name: "Jax 02.14", career: "Певец", bday: "16 Июнь 1991", age: "33 года", place: "Сокулук" },
            { name: "Ulukmanapo", career: "Репер, певец", bday: "18 Сентябрь 1993", age: "31 лет", place: "Бишкек" },
            { name: "Aftok", career: "Певец", bday: "---", age: "---", place: "Ысык-Көл" },
            { name: "Freeman 996", career: "Певец", bday: "---", age: "---", place: "Балыкчы" }
        ];
    
    const upcomingSongs = [
    {
        artist: "Бакыт Сейитбеков",
        title: "Анатомия",
        cover: "img/upcoming/u1.jpg",
        preview: "assets/preview1.mp3"
    },
    {
        artist: "Ulukmanapo",
        title: "Не сегодния",
        cover: "img/upcoming/u2.jpg",
        preview: "assets/preview2.mp3"
    },
    {
        artist: "Нурила",
        title: "Жай гана",
        cover: "img/upcoming/u3.jpg",
        preview: "assets/preview3.mp3"
    }
];
    
    

const upcomingContainer = document.getElementById("upcomingList");

upcomingSongs.forEach(song => {
    const div = document.createElement("div");
    div.className = "upcoming-card";
    div.innerHTML = `
        <div class="progress-container">
            <div class="progress-bg"></div>
        </div>
        <div class="upcoming-badge">Жакында</div>
        <div class="cover" style="background-image:url('${song.cover}')"></div>
        <div class="card-content">
            <b>${song.artist}</b>
            <p>${song.title}</p>
        </div>
        <div class="upcoming-play" onclick="togglePlay(this, '${song.preview}')">
            ${iconHTML}
        </div>
    `;
    upcomingContainer.appendChild(div);
});

    
    
    
    

        function togglePlay(btn, src) {
            const icon = btn.querySelector('.play-pause-icon');
            if (currentBtn === btn) {
                if (audio.paused) {
                    audio.play();
                    icon.classList.replace('is-playing', 'is-paused');
                } else {
                    audio.pause();
                    icon.classList.replace('is-paused', 'is-playing');
                }
            } else {
                // Башка ойноп жаткан музыканын прогрессин тазалоо
                if (currentBtn) {
                   currentBtn.querySelector('.play-pause-icon').classList.replace('is-paused', 'is-playing');
                   const prevCard = currentBtn.closest('.upcoming-card');
                   if(prevCard) prevCard.querySelector('.progress-bg').style.width = '0%';
                }
                audio.src = src;
                audio.play();
                icon.classList.replace('is-playing', 'is-paused');
                currentBtn = btn;
            }
        }

        // ПРОГРЕСС БАРДЫ ЖЫЛДЫРУУ
        audio.ontimeupdate = () => {
            if (currentBtn && currentBtn.closest('.upcoming-card')) {
                const progressBar = currentBtn.closest('.upcoming-card').querySelector('.progress-bg');
                if (progressBar && audio.duration) {
                    const percentage = (audio.currentTime / audio.duration) * 100;
                    progressBar.style.width = percentage + '%';
                }
            }
        };

        const albumContainer = document.getElementById('albumList');
        songs.slice(0, 5).forEach((song, index) => {
            const div = document.createElement('div');
            div.className = 'block';
            div.innerHTML = `
                <div class="song-image" style="background-image: url('img/home-album/img${index + 1}.jpg');"></div>
                <div class="block-text"><b>${song.artist}</b><p style="font-size:12px">${song.title}</p></div>
                <div class="mini-play" onclick="togglePlay(this, '${song.src}')">${iconHTML}</div>
            `;
            albumContainer.appendChild(div);
        });

        const hitContainer = document.getElementById('hitList');
        songs.slice(5).forEach(song => {
            const div = document.createElement('div');
            div.className = 'song-item';
            div.innerHTML = `
                <div class="play-icon-circle" onclick="togglePlay(this, '${song.src}')">${iconHTML}</div>
                <div class="song-name"><b>${song.title}</b><span>${song.artist}</span></div>
            `;
            hitContainer.appendChild(div);
        });

        const artistDetailContainer = document.getElementById('artistDetailContainer');
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

        audio.onended = () => { 
            if(currentBtn) {
                currentBtn.querySelector('.play-pause-icon').classList.replace('is-paused', 'is-playing');
                const activeCard = currentBtn.closest('.upcoming-card');
                if(activeCard) activeCard.querySelector('.progress-bg').style.width = '0%';
            }
        };
    
    
 // Теманы алмаштыруу функциясы
function changeTheme(themeName) {
    const themes = ['light', 'dark', 'gold', 'green', 'red'];
    
    // Бардык баракчаларда бирдей иштеши үчүн:
    document.body.classList.remove(...themes);
    document.documentElement.classList.remove(...themes); // Кошумча текшерүү
    
    document.body.classList.add(themeName);
    document.documentElement.classList.add(themeName);
    
    // Эс тутумга так ушул ат менен сактайбыз
    localStorage.setItem('selected-app-theme', themeName);
    
    console.log("Тема сакталды: " + themeName); // Текшерүү үчүн
}
