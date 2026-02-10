
const modal = document.getElementById('storyFullscreen');
const mainVideo = document.getElementById('mainVideo');
const statusBar = document.getElementById('statusBar');
const progressContainer = document.getElementById('progressBarContainer');

let isDragging = false;

// Көрүлгөн сториздерди текшерүү
window.addEventListener('load', () => {
    const viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
    document.querySelectorAll('.story-item').forEach(item => {
        if (viewedStories.includes(item.getAttribute('data-id'))) {
            item.classList.add('viewed');
        }
    });
});

function viewStory(src, element) {
    mainVideo.src = src;
    modal.style.display = 'block';
    mainVideo.play().catch(e => console.log("Play error:", e));
    
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

// Прогресс-барды башкаруу
mainVideo.ontimeupdate = () => {
    if (!isDragging && mainVideo.duration) {
        const percentage = (mainVideo.currentTime / mainVideo.duration) * 100;
        statusBar.style.width = percentage + '%';
    }
};

function handleScrub(e) {
    const rect = progressContainer.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    let percent = Math.min(Math.max(0, x / rect.width), 1);
    statusBar.style.width = (percent * 100) + '%';
    if (isDragging) mainVideo.currentTime = percent * mainVideo.duration;
}

const startDragging = (e) => { 
    isDragging = true; 
    progressContainer.classList.add('active'); 
    mainVideo.pause(); 
    handleScrub(e); 
};

const stopDragging = () => { 
    if (isDragging) { 
        isDragging = false; 
        progressContainer.classList.remove('active'); 
        mainVideo.play(); 
    } 
};

const moveDragging = (e) => { if (isDragging) handleScrub(e); };

// Окуяларды байлоо
progressContainer.addEventListener('mousedown', startDragging);
window.addEventListener('mousemove', moveDragging);
window.addEventListener('mouseup', stopDragging);
progressContainer.addEventListener('touchstart', startDragging);
window.addEventListener('touchmove', moveDragging);
window.addEventListener('touchend', stopDragging);

function togglePlay() { mainVideo.paused ? mainVideo.play() : mainVideo.pause(); }
function closeStory() { 
    modal.style.display = 'none'; 
    mainVideo.pause(); 
    mainVideo.src = ""; 
    progressContainer.classList.remove('active');
}
mainVideo.onended = closeStory;

