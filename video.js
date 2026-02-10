// --- 1. ӨЗГӨРМӨЛӨРДҮ АНЫКТОО ---
const v = document.getElementById('mainVid');
const player = document.getElementById('player');
const pArea = document.getElementById('pArea');
const pFill = document.getElementById('pFill');
const touchOverlay = document.getElementById('touchOverlay');
const playIco = document.getElementById('playIco');
const pauseIco = document.getElementById('pauseIco');

let uiTimer;
let dragging = false;

// --- 2. ИНТЕРФЕЙСТИ (UI) БАШКАРУУ ---
function showUI() {
    player.classList.remove('ui-hidden');
    clearTimeout(uiTimer);
    
    // Эгер видео ойноп жатса жана колдонуучу прогрессти жылдырбай жатса, 3 сек кийин жашырат
    if (!v.paused && !dragging) {
        uiTimer = setTimeout(() => {
            player.classList.add('ui-hidden');
        }, 3000);
    }
}

// Экранды басканда интерфейсти алмак-салмак көрсөтүү (Фулскринде иштеши үчүн Click колдонобуз)
touchOverlay.addEventListener('click', (e) => {
    if (dragging) return;
    if (player.classList.contains('ui-hidden')) {
        showUI();
    } else {
        player.classList.add('ui-hidden');
    }
});

v.onplay = () => showUI();
v.onpause = () => showUI();

// --- 3. ПРОГРЕСС БАР (DRAGGING) ---
function sync(e) {
    showUI();
    const rect = pArea.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    pFill.style.width = (pct * 100) + "%";
}

pArea.addEventListener('touchstart', (e) => {
    dragging = true;
    sync(e);
}, { passive: true });

window.addEventListener('touchmove', (e) => { 
    if(dragging) sync(e); 
}, { passive: true });

window.addEventListener('touchend', () => { 
    if(dragging) { 
        dragging = false; 
        showUI(); 
    } 
});

v.ontimeupdate = () => { 
    if(!dragging) pFill.style.width = (v.currentTime/v.duration*100) + "%"; 
};

// --- 4. КНОПКАЛАР (PLAY/FULLSCREEN) ---
document.getElementById('pBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    if(v.paused) {
        v.play();
        playIco.style.display='none';
        pauseIco.style.display='block';
    } else {
        v.pause();
        playIco.style.display='block';
        pauseIco.style.display='none';
    }
    showUI();
});

document.getElementById('fBtn').addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
        if (!document.fullscreenElement) {
            // Маанилүү: Бүтүндөй 'player' контейнерин фулскрин кылабыз
            if (player.requestFullscreen) {
                await player.requestFullscreen();
            } else if (player.webkitRequestFullscreen) {
                await player.webkitRequestFullscreen(); // Safari үчүн
            }
        } else {
            document.exitFullscreen();
        }
    } catch (err) {
        console.error("Фулскрин катасы:", err);
    }
});

document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    document.getElementById('enterFs').style.display = isFs ? 'none' : 'block';
    document.getElementById('exitFs').style.display = isFs ? 'block' : 'none';
    showUI();
});

// --- 5. ПЛЕЙЛИСТ ЛОГИКАСЫ ---
function loadVideo(src, title, element) {
    v.src = src;
    v.load();

    // Кадр жоголбошу үчүн 1-секундага коёбуз
    v.onloadedmetadata = () => {
        v.currentTime = 1;
        v.pause();
        showUI();
    };

    // Плейлистти тазалоо
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('active');
        const oldMark = item.querySelector('.playing-mark');
        if (oldMark) oldMark.remove();
    });

    // Активдүү кылуу (Видеону өчүрбөстөн)
    element.classList.add('active');
    const thumb = element.querySelector('.pl-thumb');
    if (thumb && !thumb.querySelector('.playing-mark')) {
        const mark = document.createElement('span');
        mark.className = 'playing-mark';
        mark.innerText = 'Ойнолууда';
        thumb.appendChild(mark);
    }

    playIco.style.display = 'block';
    pauseIco.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Баракча жүктөлгөндө
document.addEventListener('DOMContentLoaded', () => {
    v.currentTime = 1;
    showUI();
    
    const playlistVideos = document.querySelectorAll('.pl-thumb video');
    playlistVideos.forEach(pv => {
        pv.addEventListener('loadedmetadata', () => {
            pv.currentTime = 1;
        });
    });
});
