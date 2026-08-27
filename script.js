/**
 * FFMPEG LEGEND - PRESENTATION ENGINE & INTERACTIVE LOGIC
 * Pure Vanilla JavaScript (Zero Build, CDN Ready)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Presenter Notes Data ---
  const PRESENTER_NOTES = {
    1: `<strong>Talking Point:</strong><br>
        Sapa audiens dengan santai. Mulai dengan pertanyaan retoris: "Pernah nggak kalian mikir, kenapa video di HP kalian bisa lancar diputar, dikompres pas dikirim di WA, atau bisa di-upload ke TikTok dalam hitungan detik? Hari ini kita kenalan sama superhero tak terlihat di balik itu semua: FFmpeg."`,
    2: `<strong>Talking Point:</strong><br>
        Beri efek WOW kepada audiens. Sebutkan aplikasi yang mereka pakai tiap hari: WhatsApp, YouTube, Netflix, Discord, VLC.
        Jelaskan bahwa di balik server raksasa mereka, ada engine kecil gratisan bernama FFmpeg yang memproses miliaran jam video setiap hari.`,
    3: `<strong>Talking Point:</strong><br>
        Gunakan analogi "Pisau Swiss Army" atau "Dapur Koki Ajaib".
        Ceritakan bahwa FFmpeg lahir tahun 2000 oleh Fabrice Bellard (programmer jenius).
        Tekankan poin: Software ini 100% gratis dan open-source, tidak ada perusahaan yang memonopoli.`,
    4: `<strong>Talking Point:</strong><br>
        Jawab ketakutan orang awam: "Kok tampilannya cuma layar hitam (CLI) bukan tombol?".
        Analogi: GUI itu mobil keluarga (mudah disetir tapi ada batas kecepatan), CLI itu jet tempur (sekali pencet langsung terbang tembus suara).
        Jelaskan keunggulan CLI: bisa otomatis olah 1.000 video sekaligus sambil ditinggal tidur.`,
    5: `<strong>Talking Point:</strong><br>
        Klik tombol <strong>"Bongkar Kotak MP4"</strong> di slide!
        Jelaskan perbedaan Container vs Codec dengan analogi kotak kado & isi barangnya:
        - Kotak (.mp4, .mkv) = bungkus luar.
        - Video Codec (H.264, AV1) = baju/kado yang dilipat rapi.
        - Audio Codec (AAC, MP3) = rekaman suara.
        Jelaskan kenapa kadang video error: kotaknya bisa dibuka, tapi pemutar videonya nggak kenal bahasa lipatannya.`,
    6: `<strong>Talking Point:</strong><br>
        Bahas 5 jurus paling kepakai orang awam:
        1. Potong video 10 jam dalam 0.1 detik pakai Stream Copy (tanpa render ulang).
        2. Ambil lagu dari video YouTube.
        3. Kompres video jumbo buat kirim email/WA.
        4. Bikin animasi GIF super jernih tanpa watermark situs mencurigakan.`,
    7: `<strong>Live Demo Time!</strong><br>
        Ajak audiens melihat terminal simulator langsung di slide.
        Klik tombol preset satu per satu:
        - Klik <strong>"Kompres WhatsApp"</strong> lalu tunjukkan hasil 1.2GB jadi 24MB.
        - Klik <strong>"Potong Instan"</strong> dan tekankan kecepatannya (0.1 detik!).`,
    8: `<strong>Talking Point:</strong><br>
        Bedah rumus dasar FFmpeg agar audiens tidak takut lagi:
        <code>ffmpeg -i input.mp4 [opsi] output.mp4</code>
        Jelaskan -i artinya input, -c copy artinya fotokopi kilat, -crf artinya slider kualitas kompresi pintar.`,
    9: `<strong>Talking Point:</strong><br>
        Beri tahu cara pasang di Windows/Mac dengan 1 baris terminal.
        Bocorkan rahasia: Kalau mereka tetap malas ngetik terminal, mereka bisa pakai software gratis seperti HandBrake, LosslessCut, atau CapCut yang di dalamnya adalah FFmpeg!`,
    10: `<strong>Penutup:</strong><br>
        Tutup dengan apresiasi kepada komunitas open-source.
        Klik tombol <strong>"🎉 Rayakan!"</strong> untuk meluncurkan efek confetti kembang api!
        Buka sesi tanya jawab dengan audiens.`
  };

  // --- State Management ---
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentSlide = 1;
  let soundEnabled = true;
  let isTerminalRunning = false;

  // --- DOM Elements ---
  const progressFill = document.getElementById('progressFill');
  const hudCounter = document.getElementById('hudCounter');
  const hudSlideTitle = document.getElementById('hudSlideTitle');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnOverview = document.getElementById('btnOverview');
  const btnSound = document.getElementById('btnSound');
  const btnNotes = document.getElementById('btnNotes');
  const btnFullscreen = document.getElementById('btnFullscreen');
  
  const overviewModal = document.getElementById('overviewModal');
  const overviewGrid = document.getElementById('overviewGrid');
  const btnCloseOverview = document.getElementById('btnCloseOverview');

  const notesModal = document.getElementById('notesModal');
  const notesBody = document.getElementById('notesBody');
  const btnCloseNotes = document.getElementById('btnCloseNotes');

  // --- Web Audio Synthesizer (Zero external audio files needed!) ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSlideSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      // Audio fallback silent
    }
  }

  function playSuccessSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.15);
      });
    } catch (e) {}
  }

  // --- Slide Navigation Engine ---
  function goToSlide(targetIndex, playSfx = true) {
    if (targetIndex < 1) targetIndex = 1;
    if (targetIndex > totalSlides) targetIndex = totalSlides;
    if (targetIndex === currentSlide && slides[targetIndex - 1].classList.contains('active')) return;

    slides.forEach((slide, idx) => {
      const slideNum = idx + 1;
      slide.classList.remove('active', 'prev');
      if (slideNum === targetIndex) {
        slide.classList.add('active');
      } else if (slideNum < targetIndex) {
        slide.classList.add('prev');
      }
    });

    currentSlide = targetIndex;
    updateHUD();
    updateNotes();
    updateOverviewActive();
    window.location.hash = `slide-${currentSlide}`;

    if (playSfx) playSlideSound();

    // Auto-fire confetti on Slide 10
    if (currentSlide === totalSlides) {
      triggerConfetti();
    }
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  }

  function updateHUD() {
    // Update Progress Bar
    const percent = ((currentSlide - 1) / (totalSlides - 1 || 1)) * 100;
    if (progressFill) {
      progressFill.style.width = `${Math.max(5, percent)}%`;
    }

    // Update Counter
    if (hudCounter) {
      hudCounter.textContent = `${String(currentSlide).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    }

    // Update Title in HUD
    const activeSlide = slides[currentSlide - 1];
    if (activeSlide && hudSlideTitle) {
      const titleEl = activeSlide.querySelector('.slide-title');
      if (titleEl) {
        hudSlideTitle.textContent = titleEl.textContent.trim().split('\n')[0];
      } else {
        hudSlideTitle.textContent = `Slide ${currentSlide}`;
      }
    }
  }

  function updateNotes() {
    if (notesBody) {
      notesBody.innerHTML = PRESENTER_NOTES[currentSlide] || '<em>Tidak ada catatan khusus untuk slide ini.</em>';
    }
  }

  // --- Build Overview Modal Grid ---
  function buildOverviewGrid() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = '';
    slides.forEach((slide, idx) => {
      const num = idx + 1;
      const titleEl = slide.querySelector('.slide-title');
      const titleText = titleEl ? titleEl.innerText.split('\n')[0] : `Slide ${num}`;

      const thumb = document.createElement('div');
      thumb.className = `overview-thumb ${num === currentSlide ? 'active' : ''}`;
      thumb.dataset.slide = num;
      thumb.innerHTML = `
        <span class="thumb-num">SLIDE ${String(num).padStart(2, '0')}</span>
        <h4 class="thumb-title">${titleText}</h4>
      `;
      thumb.addEventListener('click', () => {
        goToSlide(num);
        toggleOverview(false);
      });
      overviewGrid.appendChild(thumb);
    });
  }

  function updateOverviewActive() {
    if (!overviewGrid) return;
    const thumbs = overviewGrid.querySelectorAll('.overview-thumb');
    thumbs.forEach(thumb => {
      if (parseInt(thumb.dataset.slide, 10) === currentSlide) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  function toggleOverview(forceState) {
    const isOpen = forceState !== undefined ? forceState : !overviewModal.classList.contains('open');
    if (isOpen) {
      buildOverviewGrid();
      overviewModal.classList.add('open');
      btnOverview?.classList.add('active');
    } else {
      overviewModal.classList.remove('open');
      btnOverview?.classList.remove('active');
    }
  }

  function toggleNotes(forceState) {
    const isOpen = forceState !== undefined ? forceState : !notesModal.classList.contains('open');
    if (isOpen) {
      updateNotes();
      notesModal.classList.add('open');
      btnNotes?.classList.add('active');
    } else {
      notesModal.classList.remove('open');
      btnNotes?.classList.remove('active');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      btnFullscreen?.classList.add('active');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        btnFullscreen?.classList.remove('active');
      }
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (btnSound) {
      btnSound.innerHTML = soundEnabled ? '🔊' : '🔇';
      btnSound.title = soundEnabled ? 'Mute Suara (M)' : 'Nyalakan Suara (M)';
      btnSound.classList.toggle('active', soundEnabled);
    }
  }

  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f2fe', '#22c55e', '#f59e0b', '#a855f7', '#ffffff']
      });
    }
  }

  // --- Keyboard Event Listeners ---
  window.addEventListener('keydown', (e) => {
    // If typing in any input field, skip
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'Space':
      case 'PageDown':
      case 'Enter':
      case 'l':
      case 'j':
        e.preventDefault();
        nextSlide();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Backspace':
      case 'PageUp':
      case 'h':
      case 'k':
        e.preventDefault();
        prevSlide();
        break;

      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;

      case 'End':
        e.preventDefault();
        goToSlide(totalSlides);
        break;

      case 'Escape':
      case 'o':
      case 'O':
        e.preventDefault();
        toggleOverview();
        break;

      case 'n':
      case 'N':
      case 'p':
      case 'P':
        e.preventDefault();
        toggleNotes();
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;

      case 'm':
      case 'M':
        e.preventDefault();
        toggleSound();
        break;

      default:
        // Number keys 1-9 for quick jump
        if (e.key >= '1' && e.key <= '9') {
          const target = parseInt(e.key, 10);
          if (target <= totalSlides) {
            goToSlide(target);
          }
        }
        break;
    }
  });

  // --- Touch Gestures for Mobile / Tablet ---
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });

  // --- Button Event Listeners ---
  btnPrev?.addEventListener('click', prevSlide);
  btnNext?.addEventListener('click', nextSlide);
  btnOverview?.addEventListener('click', () => toggleOverview());
  btnCloseOverview?.addEventListener('click', () => toggleOverview(false));
  btnNotes?.addEventListener('click', () => toggleNotes());
  btnCloseNotes?.addEventListener('click', () => toggleNotes(false));
  btnFullscreen?.addEventListener('click', toggleFullscreen);
  btnSound?.addEventListener('click', toggleSound);

  // Global helper for slide action buttons
  window.presenterJump = (index) => goToSlide(index);
  window.fireConfetti = triggerConfetti;

  // --- Interactive Feature 1: Inspect Container & Codec (Slide 5) ---
  const btnInspectPackage = document.getElementById('btnInspectPackage');
  const packageGraphic = document.getElementById('packageGraphic');
  const innerPackageDetails = document.getElementById('innerPackageDetails');

  if (btnInspectPackage) {
    btnInspectPackage.addEventListener('click', () => {
      initAudio();
      const isOpened = packageGraphic?.classList.contains('opened');
      if (isOpened) {
        packageGraphic.classList.remove('opened');
        btnInspectPackage.innerHTML = '🔍 Buka & Bedah Isi Kotak MP4';
        if (innerPackageDetails) {
          innerPackageDetails.innerHTML = '<p style="color:var(--text-dim);font-style:italic;">Klik tombol untuk membuka kardus MP4 dan melihat stream di dalamnya!</p>';
        }
      } else {
        packageGraphic?.classList.add('opened');
        btnInspectPackage.innerHTML = '📦 Tutup Kembali Kotak MP4';
        playSuccessSound();
        if (innerPackageDetails) {
          innerPackageDetails.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:8px;animation:fadeIn 0.3s ease;">
              <div style="background:rgba(0,242,254,0.1);padding:10px;border-radius:8px;border:1px solid rgba(0,242,254,0.3);">
                <strong style="color:var(--accent-cyan);">Stream #0:0 [Video]</strong>: H.264 (High Profile) - 1920x1080 @ 60fps (Bitrate: 8500 kb/s)
              </div>
              <div style="background:rgba(34,197,94,0.1);padding:10px;border-radius:8px;border:1px solid rgba(34,197,94,0.3);">
                <strong style="color:var(--accent-green);">Stream #0:1 [Audio]</strong>: AAC (LC) - Stereo 48.0 kHz (Bitrate: 256 kb/s)
              </div>
              <div style="background:rgba(168,85,247,0.1);padding:10px;border-radius:8px;border:1px solid rgba(168,85,247,0.3);">
                <strong style="color:var(--accent-purple);">Stream #0:2 [Subtitle]</strong>: SubRip (srt) - Bahasa Indonesia
              </div>
            </div>
          `;
        }
      }
    });
  }

  // --- Interactive Feature 2: Live Terminal Simulator (Slide 7) ---
  const PRESETS = {
    compress: {
      name: 'Kompres Video WhatsApp',
      command: 'ffmpeg -i liburan_bali.mp4 -vcodec libx264 -crf 28 -preset fast wa_ready.mp4',
      sizeBefore: '1.24 GB (1240 MB)',
      sizeAfter: '24.8 MB (Hemat 98%!)',
      timeTaken: '4.2 Detik',
      quality: 'Tetap Tajam di Layar HP',
      logs: [
        'Input #0, mov,mp4,m4a, from \'liburan_bali.mp4\':',
        '  Duration: 00:03:45.12, bitrate: 46800 kb/s',
        '  Stream #0:0: Video: h264 (High), yuv420p, 3840x2160 [4K], 60 fps',
        'Stream mapping: Stream #0:0 -> #0:0 (h264 -> libx264)',
        'Output #0, mp4, to \'wa_ready.mp4\':',
        '  CRF 28 applied. Optimizing macroblocks with fast matrix...'
      ]
    },
    cut: {
      name: 'Potong 10 Detik Instan (-c copy)',
      command: 'ffmpeg -ss 00:01:20 -to 00:01:30 -i video_panjang.mp4 -c copy potongan.mp4',
      sizeBefore: '4.50 GB (Full 2 Jam)',
      sizeAfter: '18.2 MB (Tepat 10 Detik)',
      timeTaken: '0.12 Detik (Instan!)',
      quality: '100% Identik (Lossless tanpa render)',
      logs: [
        'Input #0, mov,mp4, from \'video_panjang.mp4\':',
        '  Duration: 02:00:15.00, bitrate: 5200 kb/s',
        'Fast seek to timestamp 00:01:20...',
        'Stream copy mode activated: Skipping re-encode cycle',
        'Copying packet stream 0:0 (video) & stream 0:1 (audio)...',
        'Output #0, mp4, to \'potongan.mp4\''
      ]
    },
    audio: {
      name: 'Ekstrak Lagu MP3 dari Video',
      command: 'ffmpeg -i konser_coldplay.mp4 -vn -c:a libmp3lame -q:a 2 lagu_konser.mp3',
      sizeBefore: '850 MB (Video HD)',
      sizeAfter: '6.4 MB (Audio MP3 High Quality)',
      timeTaken: '1.1 Detik',
      quality: 'Audio Crystal Clear VBR (~190 kbps)',
      logs: [
        'Input #0, mov,mp4, from \'konser_coldplay.mp4\':',
        '  Stream #0:0: Video: h264 (Stripped via -vn)',
        '  Stream #0:1: Audio: aac (LC), 48000 Hz, stereo',
        'Encoding Audio via libmp3lame with VBR Quality 2...',
        'Output #0, mp3, to \'lagu_konser.mp3\''
      ]
    },
    gif: {
      name: 'Bikin Animasi Meme GIF HD',
      command: 'ffmpeg -i meme.mp4 -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" meme_hd.gif',
      sizeBefore: '45 MB (MP4 Clip)',
      sizeAfter: '3.8 MB (GIF HD Tanpa Bintik)',
      timeTaken: '2.4 Detik',
      quality: 'Palet 256 Warna Optimum Lanczos',
      logs: [
        'Input #0, mov,mp4, from \'meme.mp4\':',
        'Phase 1: Generating custom 256 color palette table...',
        'Phase 2: Applying dither matrix paletteuse filter...',
        'Output #0, gif, to \'meme_hd.gif\''
      ]
    }
  };

  const termBody = document.getElementById('termBody');
  const termProgressBar = document.getElementById('termProgressBar');
  const termProgressFill = document.getElementById('termProgressFill');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const simResultContent = document.getElementById('simResultContent');

  function runPresetSimulator(presetKey) {
    if (isTerminalRunning) return;
    const data = PRESETS[presetKey];
    if (!data || !termBody) return;

    isTerminalRunning = true;
    initAudio();

    // Highlight active preset button
    presetButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetKey);
    });

    // Reset Terminal view
    termBody.innerHTML = `
      <div><span class="term-prompt">user@legend-pc:~$</span> <span class="term-cmd" id="typingCmd"></span></div>
    `;
    if (termProgressFill) termProgressFill.style.width = '0%';
    if (termProgressBar) termProgressBar.style.display = 'block';

    const typingCmd = document.getElementById('typingCmd');
    const fullCmd = data.command;
    let charIdx = 0;

    // 1. Simulate fast typing animation
    const typeInterval = setInterval(() => {
      if (charIdx < fullCmd.length) {
        typingCmd.textContent += fullCmd[charIdx];
        charIdx++;
      } else {
        clearInterval(typeInterval);
        startExecutionLogs();
      }
    }, 18);

    function startExecutionLogs() {
      let logIdx = 0;
      const logInterval = setInterval(() => {
        if (logIdx < data.logs.length) {
          const p = document.createElement('div');
          p.className = 'term-output';
          p.textContent = data.logs[logIdx];
          termBody.appendChild(p);
          termBody.scrollTop = termBody.scrollHeight;
          logIdx++;
        } else {
          clearInterval(logInterval);
          startEncodingProgress();
        }
      }, 150);
    }

    function startEncodingProgress() {
      let progress = 0;
      const progressLine = document.createElement('div');
      progressLine.className = 'term-output';
      termBody.appendChild(progressLine);

      const encodeInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 18) + 12;
        if (progress > 100) progress = 100;

        if (termProgressFill) termProgressFill.style.width = `${progress}%`;
        progressLine.innerHTML = `[Encoding] Progress: <strong style="color:var(--accent-cyan)">${progress}%</strong> | speed=${presetKey === 'cut' ? '128x' : '4.8x'}`;
        termBody.scrollTop = termBody.scrollHeight;

        if (progress >= 100) {
          clearInterval(encodeInterval);
          finishExecution();
        }
      }, 100);
    }

    function finishExecution() {
      const doneLine = document.createElement('div');
      doneLine.className = 'term-success';
      doneLine.innerHTML = `✅ [SUCCESS] File berhasil dibuat dalam <strong>${data.timeTaken}</strong>!`;
      termBody.appendChild(doneLine);

      const promptEnd = document.createElement('div');
      promptEnd.innerHTML = `<span class="term-prompt">user@legend-pc:~$</span> <span class="cursor-blink">_</span>`;
      termBody.appendChild(promptEnd);
      termBody.scrollTop = termBody.scrollHeight;

      // Update Visual Result Box
      if (simResultContent) {
        simResultContent.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:6px;font-size:0.85rem;">
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--text-muted);">Ukuran Asli:</span>
              <strong style="color:#ef4444;">${data.sizeBefore}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--text-muted);">Ukuran Output:</span>
              <strong style="color:var(--accent-green);">${data.sizeAfter}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--text-muted);">Waktu Proses:</span>
              <strong style="color:var(--accent-cyan);">${data.timeTaken}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--text-muted);">Kualitas:</span>
              <strong style="color:var(--accent-amber);">${data.quality}</strong>
            </div>
          </div>
        `;
      }

      playSuccessSound();
      isTerminalRunning = false;
    }
  }

  // Bind Preset Click Handlers
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (preset) runPresetSimulator(preset);
    });
  });

  // --- URL Hash Route check on load ---
  function checkHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#slide-')) {
      const num = parseInt(hash.replace('#slide-', ''), 10);
      if (!isNaN(num) && num >= 1 && num <= totalSlides) {
        goToSlide(num, false);
        return;
      }
    }
    goToSlide(1, false);
  }

  // Initialize presentation
  checkHash();
});
