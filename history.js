/* Сториз үчүн гана өзгөрмөлөр - аттарын өзгөрттүк (Conflict болбошу үчүн) */
const storyModal = document.getElementById('storyFullscreen');
const storyVideo = document.getElementById('mainVideo');
const storyStatusBar = document.getElementById('statusBar');
const storyProgressContainer = document.getElementById('progressBarContainer');

let isStoryDragging = false; 

// Сториздерди текшерүү
window.addEventListener('load', () => {
    const viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
    document.querySelectorAll('.story-item').forEach(item => {
        if (viewedStories.includes(item.getAttribute('data-id'))) {
            item.classList.add('viewed');
        }
    });
});

/* Сторизди ачуу */
function viewStory(src, element) {
    // МААНИЛҮҮ: Видео башталганда аудио плеерди токтотуу
    if (typeof audio !== 'undefined' && !audio.paused) {
        audio.pause();
        // Эгер аудио плеердин кнопкасы бар болсо, анын иконкасын 'play' кылып коюу
        if (typeof currentBtn !== 'undefined' && currentBtn) {
            const icon = currentBtn.querySelector('.play-pause-icon');
            if (icon) icon.classList.replace('is-paused', 'is-playing');
        }
    }

    storyVideo.src = src;
    storyModal.style.display = 'block';
    storyVideo.play().catch(e => console.log("Play error:", e));
    
    const id = element.getAttribute('data-id');
    markAsViewed(id);
    element.classList.add('viewed');
}

function markAsViewed(id) {
    let viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
    if (!viewedStories.includes(id)) {
        viewedStories.push(id);
        localStorage.setItem('viewedStories', JSON.stringify(viewedStories));
    }
}

// Видео прогресси
storyVideo.ontimeupdate = () => {
    if (!isStoryDragging && storyVideo.duration) {
        const percentage = (storyVideo.currentTime / storyVideo.duration) * 100;
        storyStatusBar.style.width = percentage + '%';
    }
};

function handleStoryScrub(e) {
    const rect = storyProgressContainer.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    let percent = Math.min(Math.max(0, x / rect.width), 1);
    storyStatusBar.style.width = (percent * 100) + '%';
    if (isStoryDragging) storyVideo.currentTime = percent * storyVideo.duration;
}

const startStoryDrag = (e) => { 
    isStoryDragging = true; 
    storyProgressContainer.classList.add('active'); 
    storyVideo.pause(); 
    handleStoryScrub(e); 
};

const stopStoryDrag = () => { 
    if (isStoryDragging) { 
        isStoryDragging = false; 
        storyProgressContainer.classList.remove('active'); 
        storyVideo.play(); 
    } 
};

const moveStoryDrag = (e) => { 
    if (isStoryDragging) {
        if (e.cancelable) e.preventDefault(); 
        handleStoryScrub(e); 
    } 
};

/* Окуяларды байлоо */
storyProgressContainer.addEventListener('mousedown', startStoryDrag);
storyProgressContainer.addEventListener('touchstart', startStoryDrag, { passive: false });

// Window ордуна модалдык терезеге гана байлайбыз
storyModal.addEventListener('mousemove', moveStoryDrag);
storyModal.addEventListener('touchmove', moveStoryDrag, { passive: false });

window.addEventListener('mouseup', stopStoryDrag);
window.addEventListener('touchend', stopStoryDrag);

// Видео ойнотуу/токтотуу
function toggleStoryPlay() { 
    if (storyVideo.paused) storyVideo.play(); else storyVideo.pause(); 
}

// Сторизди жабуу
function closeStory() { 
    storyModal.style.display = 'none'; 
    storyVideo.pause(); 
    storyVideo.src = ""; 
    storyProgressContainer.classList.remove('active');
    isStoryDragging = false;
}

storyVideo.onended = closeStory;

