const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Variables
const PLAYER_STORAGE_KEY = 'KAS_PLAYER';

const player = $('.app');
const cd = $('.song-cd');
const songName = $('.song-title .song-name');
const songSinger = $('.song-title .song-singer');
const songThumbnail = $('.song-img');
const songAudio = $('#song-audio');
const playBtn = $('.play-btn');
const progressBar  = $('.song-progress-bar');
const nextBtn = $('.up-btn');
const backBtn = $('.back-btn');
const randomBtn = $('.random-mode');
const repeatBtn = $('.repeat-mode');
const playList = $('.song-list');


// DATABASE
const app = {
   currentIndex: 0,
   isPlaying: false,
   isRandom: false,
   isRepeat: false,
   settings: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
   songs: [ 
      {
         name: 'Vì mẹ anh bắt chia tay',
         singer: 'MIU LÊ x KARIK x CHÂU ĐĂNG KHOA',
         path: '/assets/music/song1.mp3',
         image: '/assets/img/songs/song1.jpg'
      },
      {
         name: 'Dễ đến dễ đi',
         singer: 'Quang Hùng Master D',
         path: '/assets/music/song2.mp3',
         image: '/assets/img/songs/song2.jpg'
      },
      {
         name: 'Sài gòn đau lòng quá',
         singer: 'Hứa Kim Tuyền, Hoàng Duyên',
         path: '/assets/music/song3.mp3',
         image: '/assets/img/songs/song3.jpg'
      },
      {
         name: 'Big Girls Don\'t Cry',
         singer: 'Tóc Tiên',
         path: '/assets/music/song4.mp3',
         image: '/assets/img/songs/song4.jpg'
      },
      {
         name: 'The Playah (Special Performance)',
         singer: 'Soobin Hoàng Sơn, SlimV',
         path: '/assets/music/song5.mp3',
         image: '/assets/img/songs/song5.jpg'
      },
      {
         name: 'Mirror Mirror (Prod. by NINO)',
         singer: 'F.HERO x MILLI Ft. Changbin of Stray Kids',
         path: '/assets/music/song6.mp3',
         image: '/assets/img/songs/song6.png'
      }
   ],
   render: function() {
      const htmls = this.songs.map((song, index) => {
         return `
            <div class="song-list-item ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
               <div class="item-cd">
                  <div class="song-img" style="background-image:url(${song.image});"></div>
               </div>
               <div class="item-title">
                  <span class="item-name">${song.name}</span>
                  <span class="item-singer">${song.singer}</span>
               </div>
            </div>
         `
      })
      playList.innerHTML = htmls.join('');
   },
   handleEvents: function() {
      const _this = this;
      const cdWidth = cd.offsetWidth;

      // Xử lý cd quay/ dừng
      cdAnimation = songThumbnail.animate([
         // keyframes
         {transform: 'rotate(360deg)'}
      ],{
          // timing options
         duration: 10000,
         iterations: Infinity // lần lặp
      });
      cdAnimation.pause(); //pause animation

      // Xử lý phóng to/ thu nhỏ CD khi scroll
      document.onscroll = function() {
         /** 2 cach lay truc Y khi scroll
          * 1. document.documentElement.scrollTop
          * 2. window.scrollY
         */
         const scrollTop = document.documentElement.scrollTop || window.scrollY;
         const newCDWidth = cdWidth - scrollTop;
         cd.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0;
         cd.style.opacity = newCDWidth/cdWidth;
      } 

      // Xử lý play/pause bài hát
      playBtn.onclick = function() {
         if(_this.isPlaying) {
            songAudio.pause();
         } else {
            songAudio.play();
         }

         // Khi nhac dang play
         songAudio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdAnimation.play(); //pause animation
            _this.render();
         }
         // Khi nhac dang pause
         songAudio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdAnimation.pause(); //play animation
         }
      }

      //Xử lý progress bar
      songAudio.ontimeupdate = function() {
         if(songAudio.duration) {
            const progress = Math.floor(songAudio.currentTime / songAudio.duration * 100);
            progressBar.value = progress;
            handleProgressBar();
         }
      }
      // Xử lý khi tua
      progressBar.onchange = function(e) {
         const percent = e.target.value;
         const currentTime = (percent/100) * songAudio.duration;
         songAudio.currentTime = currentTime;
      }

      // Khi next bai hat
      nextBtn.onclick = function() {
         if(_this.isRandom) {
            _this.playRandomSong();
         } else {
            _this.nextSong();
         }
         songAudio.play();
         _this.scrollToActiveSong();
      }
      backBtn.onclick = function() {
         if(_this.isRandom) {
            _this.playRandomSong();
         } else {
            _this.backSong();
         }
         songAudio.play();
         _this.scrollToActiveSong();
      }

      // Xử lý khi chọn random-mode
      randomBtn.onclick = function() {
         _this.isRandom = !_this.isRandom;
         randomBtn.classList.toggle('active', _this.isRandom);
      }

      // Xử lý khi chọn repeat-mode
      repeatBtn.onclick = function() {
         _this.isRepeat = !_this.isRepeat;
         repeatBtn.classList.toggle('active', _this.isRepeat);
      }
      // Xử lý khi nhạc chạy hết
      songAudio.onended = function() {
         if(_this.isRepeat) {
            songAudio.play();
         } else {
            nextBtn.click();
         }
      }

      // Xử lý khi click vào playList
      playList.onclick = function(e) {
         const songElement = e.target.closest('.song-list-item:not(.active)')
         if(songElement)
         {
            _this.currentIndex = Number(songElement.dataset.index);
            _this.loadCurrentSong();
            _this.render();
            songAudio.play();
         }
      }
   },
   defineProperties: function() {
      Object.defineProperty(this, 'currentSong', {
         get: function() {
            return this.songs[this.currentIndex];
         }
      })
   },
   loadCurrentSong: function() {
      songName.textContent = this.currentSong.name;
      songSinger.textContent = this.currentSong.singer;
      songThumbnail.style.backgroundImage = `url('${this.currentSong.image}')`;
      songAudio.src = this.currentSong.path;
   },
   nextSong: function() {
      this.currentIndex++;
      if(this.currentIndex >= this.songs.length) {
         this.currentIndex = 0;
      }
      this.loadCurrentSong();
   },
   backSong: function() {
      this.currentIndex--;
      if(this.currentIndex < 0) {
         this.currentIndex = this.songs.length - 1;
      }
      this.loadCurrentSong();
   },
   scrollToActiveSong: function() {
      if(this.currentIndex === 0 || this.currentIndex === this.songs.length) {
         setTimeout(() => {
            $('.song-list-item.active').scrollIntoView({
               behavior: 'smooth',
               block: 'end'
            })
         } ,100)
      } else {
         setTimeout(() => {
            $('.song-list-item.active').scrollIntoView({
               behavior: 'smooth',
               block: 'nearest'
            })
         }, 500)
      }
   },
   playRandomSong: function() {
      let newIndex
      do {
         newIndex = Math.floor(Math.random() * this.songs.length)
      } while(newIndex == this.currentIndex);

      this.currentIndex = newIndex;
      this.loadCurrentSong();
   },
   start: function() {
      // Định nghĩa các thuộc tính cho object
      this.defineProperties();
      // Lắng nghe/ xử lý sự kiện
      this.handleEvents();
      this.loadCurrentSong();
      // Render playlist
      this.render();
   }
}
// Handle progress bar
function handleProgressBar() {
   const min = progressBar.min;
   const max = progressBar.max;
   const val = progressBar.value;
   progressBar.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
}
progressBar.addEventListener('input', handleProgressBar);

// START APP
app.start();