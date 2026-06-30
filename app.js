// 模拟预设电台歌曲数据（支持从你的本地或远程URL直接替换）
const trackList = [
    {
        title: "MineRadio 极客律动",
        artist: "Huber",
        cover: "https://picsum.photos/400/400?random=1",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "赛博复古未来",
        artist: "Electronica",
        cover: "https://picsum.photos/400/400?random=2",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "零度纯净轻音乐",
        artist: "Lofi Ambient",
        cover: "https://picsum.photos/400/400?random=3",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
];

let currentIndex = 0;
let isPlaying = false;
let isLoop = false; // 循环状态

// DOM 节点获取
const audio = document.getElementById('audio-element');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const coverImg = document.getElementById('cover-img');
const bgBlur = document.getElementById('bg-blur');
const disc = document.getElementById('disc');
const progressBar = document.getElementById('progress-bar');
const progressDot = document.getElementById('progress-dot');
const progressWrapper = document.getElementById('progress-wrapper');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const playlistBtn = document.getElementById('playlist-btn');
const playlistDrawer = document.getElementById('playlist-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const closeDrawer = document.getElementById('close-drawer');
const musicListContainer = document.getElementById('music-list');
const playlistCount = document.getElementById('playlist-count');
const playModeBtn = document.getElementById('play-mode');

// 初始化加载歌曲
function loadTrack(index) {
    const track = trackList[index];
    songTitle.innerText = track.title;
    songArtist.innerText = track.artist;
    coverImg.src = track.cover;
    bgBlur.style.backgroundImage = `url(${track.cover})`;
    audio.src = track.url;
    
    // 重置进度条
    progressBar.style.width = '0%';
    progressDot.style.left = '0%';
    
    // 更新列表高亮
    updatePlaylistHighlight();
}

// 播放与暂停控制
function togglePlay() {
    if (isPlaying) {
        audio.pause();
        disc.style.animationPlayState = 'paused';
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audio.play().catch(err => console.log("移动端策略需用户手动交互触发播放"));
        disc.style.animationPlayState = 'running';
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    isPlaying = !isPlaying;
}

// 切歌功能
function prevTrack() {
    currentIndex = (currentIndex - 1 + trackList.length) % trackList.length;
    loadTrack(currentIndex);
    if (isPlaying) { isPlaying = false; togglePlay(); }
}

function nextTrack() {
    currentIndex = (currentIndex + 1) % trackList.length;
    loadTrack(currentIndex);
    if (isPlaying) { isPlaying = false; togglePlay(); }
}

// 进度条跟随更新
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (!duration) return;
    
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    progressDot.style.left = `${progressPercent}%`;
    
    // 转换时间格式
    currentTimeEl.innerText = formatTime(currentTime);
    totalTimeEl.innerText = formatTime(duration);
}

// 格式化时间戳
function formatTime(time) {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// 手势/点击调整进度条位置
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX || (e.touches && e.touches[0].clientX - this.getBoundingClientRect().left);
    const duration = audio.duration;
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
}

// 渲染抽屉播放列表
function renderPlaylist() {
    playlistCount.innerText = trackList.length;
    musicListContainer.innerHTML = '';
    trackList.forEach((track, index) => {
        const li = document.createElement('li');
        li.className = `music-item ${index === currentIndex ? 'active' : ''}`;
        li.innerHTML = `
            <div>
                <div class="title">${track.title}</div>
                <div class="artist">${track.artist}</div>
            </div>
            <i class="fas ${index === currentIndex ? 'fa-volume-up' : ''}"></i>
        `;
        li.addEventListener('click', () => {
            currentIndex = index;
            loadTrack(currentIndex);
            if (!isPlaying) togglePlay();
            closeDrawerFunc();
        });
        musicListContainer.appendChild(li);
    });
}

function updatePlaylistHighlight() {
    const items = musicListContainer.querySelectorAll('.music-item');
    items.forEach((item, index) => {
        if(index === currentIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 抽屉弹窗交互逻辑
function openDrawerFunc() {
    playlistDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
}

function closeDrawerFunc() {
    playlistDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
}

// 事件绑定
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
    if (isLoop) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextTrack();
    }
});

// 模式切换（单曲循环/列表循环）
playModeBtn.addEventListener('click', () => {
    isLoop = !isLoop;
    if (isLoop) {
        playModeBtn.innerHTML = '<i class="fas fa-spin fa-compact-disc"></i>';
        playModeBtn.style.color = '#31c27c';
    } else {
        playModeBtn.innerHTML = '<i class="fas fa-repeat"></i>';
        playModeBtn.style.color = 'rgba(255,255,255,0.8)';
    }
});

// 进度条触摸与点击事件兼容
progressWrapper.addEventListener('click', setProgress);
playlistBtn.addEventListener('click', openDrawerFunc);
closeDrawer.addEventListener('click', closeDrawerFunc);
drawerOverlay.addEventListener('click', closeDrawerFunc);

// 首次启动初始化
window.addEventListener('DOMContentLoaded', () => {
    loadTrack(currentIndex);
    renderPlaylist();
});
