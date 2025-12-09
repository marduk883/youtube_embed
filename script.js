document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    loadNote();
    loadNotePosition();
    makeDraggable();
    loadMusicWidget(); 
});

const defaultFavs = [];

function loadFavorites() {
    const grid = document.getElementById('favGrid');
    grid.innerHTML = "";
    
    let favs = JSON.parse(localStorage.getItem('myRetroFavs'));

    if (!favs) {
        favs = defaultFavs;
        localStorage.setItem('myRetroFavs', JSON.stringify(favs));
    }

    favs.forEach((site, index) => {
        const item = document.createElement('div');
        item.className = 'fav-item';

        const colors = ['#FFC0CB', '#ADD8E6', '#90EE90', '#FFFFE0', '#E6E6FA'];
        const randomColor = colors[index % colors.length];
        const firstLetter = site.name.charAt(0).toUpperCase();

        item.innerHTML = `
            <button class="delete-btn" onclick="deleteFavorite(${index}); event.preventDefault();">×</button>
            <a href="${site.url}" target="_blank" style="text-decoration:none; color:inherit; display:flex; flex-direction:column; align-items:center;">
                <div class="pixel-icon" style="background-color: ${randomColor};">${firstLetter}</div>
                <span class="fav-name">${site.name}</span>
            </a>
        `;
        grid.appendChild(item);
    });
}

// Add Favorite
function addFavorite() {
    const nameInput = document.getElementById('newSiteName');
    const urlInput = document.getElementById('newSiteUrl');
    
    let name = nameInput.value.trim();
    let url = urlInput.value.trim();

    if (!name || !url) {
        alert("Please enter both name and URL!");
        return;
    }

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    let favs = JSON.parse(localStorage.getItem('myRetroFavs')) || [];
    favs.push({ name: name, url: url });
    localStorage.setItem('myRetroFavs', JSON.stringify(favs));

    nameInput.value = "";
    urlInput.value = "";
    loadFavorites();
}

// Delete Favorite
function deleteFavorite(index) {
    let favs = JSON.parse(localStorage.getItem('myRetroFavs'));
    favs.splice(index, 1);
    localStorage.setItem('myRetroFavs', JSON.stringify(favs));
    loadFavorites();
}

// Enter key to add
document.getElementById('newSiteUrl').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addFavorite();
    }
});

// STICKY NOTE FUNCTIONS
function toggleStickyNote() {
    const note = document.getElementById('stickyNote');
    const btn = document.getElementById('showNoteBtn');
    
    if (note.style.display === 'none') {
        note.style.display = 'flex';
        btn.style.display = 'none';
    } else {
        note.style.display = 'none';
        btn.style.display = 'block';
    }
}

function loadNote() {
    const savedNote = localStorage.getItem('stickyNote');
    if (savedNote) {
        document.getElementById('noteText').value = savedNote;
    }
}

document.getElementById('noteText').addEventListener('input', function() {
    localStorage.setItem('stickyNote', this.value);
});

function makeDraggable() {
    const note = document.getElementById('stickyNote');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const header = note.querySelector('.sticky-note-header');

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.classList.contains('sticky-note-close')) return;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, note);
        }
    }

    function dragEnd(e) {
        if (isDragging) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            
            saveNotePosition(currentX, currentY);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }
}

function saveNotePosition(x, y) {
    localStorage.setItem('notePosition', JSON.stringify({ x, y }));
}

function loadNotePosition() {
    const savedPosition = localStorage.getItem('notePosition');
    if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        const note = document.getElementById('stickyNote');
        note.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
}


async function loadMusicWidget() {
    const select = document.getElementById('musicCategory');
    const playBtn = document.getElementById('playMusicBtn');
    const stopBtn = document.getElementById('stopMusicBtn');
    const playerWrap = document.getElementById('musicPlayer');
    const ytFrame = document.getElementById('ytPlayer');

    let data = {};
    try {
        const res = await fetch('videolar.json', { cache: 'no-store' });
        data = await res.json();
    } catch (err) {
        console.log("videolar.json yüklenemedi", err);
        return;
    }

    Object.keys(data).forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });

    playBtn.onclick = () => {
        const cat = select.value;
        if (!cat || !data[cat]) return;

        const list = data[cat];
        const random = list[Math.floor(Math.random() * list.length)];

        ytFrame.src = `https://marduk883.github.io/youtube_embed/?v=${random}`;
        playerWrap.style.display = 'block';
    };

    stopBtn.onclick = () => {
        ytFrame.src = "";
        playerWrap.style.display = 'none';
    };
}
