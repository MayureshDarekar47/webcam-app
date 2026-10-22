/**
 * PRO WEBCAM STUDIO - Application Entry Point & Controller Orchestration
 */

import {
  loadSettings,
  saveSettings,
  resetSettings,
  getAllMediaItems,
  saveMediaItem,
  getStorageEstimate
} from './modules/storage.js';

import { CameraController } from './modules/camera.js';
import { VideoRecorder } from './modules/recorder.js';
import { FilterManager, FILTER_PRESETS, FILTER_CATEGORIES } from './modules/filters.js';
import { PhotoCaptureEngine } from './modules/capture.js';
import { SnapLensEngine } from './modules/snapLensEngine.js';
import { GalleryManager } from './modules/gallery.js';
import { ShortcutsManager } from './modules/shortcuts.js';
import { showToast } from './modules/toast.js';
import { playRecordStartSound, playRecordStopSound } from './modules/audio.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Load persistent user settings
  let settings = loadSettings();

  // Elements
  const videoEl = document.getElementById('webcam-video');
  const viewportWrap = document.getElementById('viewport-wrap');
  const placeholderEl = document.getElementById('camera-placeholder');
  const errorBox = document.getElementById('camera-error-box');
  const errorMessage = document.getElementById('error-message');
  const errorTroubleshoot = document.getElementById('error-troubleshoot');
  const btnStartCamera = document.getElementById('btn-start-camera');

  const headerStatusDot = document.getElementById('header-status-dot');
  const headerStatusText = document.getElementById('header-status-text');

  // HUD Elements
  const hudRecordingPill = document.getElementById('hud-recording-pill');
  const hudRecordTimer = document.getElementById('hud-record-timer');
  const hudPausedPill = document.getElementById('hud-paused-pill');
  const hudStreamInfo = document.getElementById('hud-stream-info');
  const hudResolutionText = document.getElementById('hud-resolution-text');
  const hudFpsText = document.getElementById('hud-fps-text');
  const btnQuickStop = document.getElementById('btn-quick-stop');

  // Quick Viewport Buttons
  const btnQuickMirror = document.getElementById('btn-quick-mirror');
  const btnQuickFlipV = document.getElementById('btn-quick-flipv');
  const btnQuickGrid = document.getElementById('btn-quick-grid');
  const btnQuickPip = document.getElementById('btn-quick-pip');
  const btnQuickFullscreen = document.getElementById('btn-quick-fullscreen');
  const gridOverlay = document.getElementById('grid-overlay');
  const shutterFlash = document.getElementById('shutter-flash');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const countdownNumber = document.getElementById('countdown-number');

  // Mode Buttons
  const modePhotoBtn = document.getElementById('mode-photo');
  const modeVideoBtn = document.getElementById('mode-video');
  const modeBurstBtn = document.getElementById('mode-burst');
  let currentMode = 'photo'; // 'photo' | 'video' | 'burst'

  // Capture / Record Controls (Snapchat Shutter & Gesture Elements)
  const btnCaptureShutter = document.getElementById('btn-capture-shutter');
  const btnRecordTrigger = document.getElementById('btn-record-trigger');
  const btnRecordPause = document.getElementById('btn-record-pause');
  const snapLockPill = document.getElementById('snap-lock-pill');
  const lockUnlockedSvg = document.getElementById('lock-unlocked-svg');
  const lockLockedSvg = document.getElementById('lock-locked-svg');
  const lockLabel = document.getElementById('lock-label');
  const lockChevron = document.getElementById('lock-chevron');
  const shutterProgressRing = document.getElementById('shutter-progress-ring');
  const progressRingFill = document.getElementById('progress-ring-fill');

  // Drawer Toggles & Panels
  const btnToggleDevices = document.getElementById('btn-toggle-devices');
  const btnToggleAdjustments = document.getElementById('btn-toggle-adjustments');
  const btnToggleTimer = document.getElementById('btn-toggle-timer');
  const labelTimerVal = document.getElementById('label-timer-val');

  const drawerDevices = document.getElementById('drawer-devices');
  const drawerAdjustments = document.getElementById('drawer-adjustments');
  const drawerTimer = document.getElementById('drawer-timer');

  const selectCamera = document.getElementById('select-camera');
  const btnFlipFacing = document.getElementById('btn-flip-facing');
  const btnQuickFlipCam = document.getElementById('btn-quick-flip-cam');
  const btnFlipFacingDeck = document.getElementById('btn-flip-facing-deck');
  const selectResolution = document.getElementById('select-resolution');
  const selectMic = document.getElementById('select-mic');
  const toggleAudioRecording = document.getElementById('toggle-audio-recording');

  // Adjustments
  const sliderZoom = document.getElementById('slider-zoom');
  const valZoom = document.getElementById('val-zoom');
  const sliderBrightness = document.getElementById('slider-brightness');
  const valBrightness = document.getElementById('val-brightness');
  const sliderContrast = document.getElementById('slider-contrast');
  const valContrast = document.getElementById('val-contrast');
  const sliderSaturation = document.getElementById('slider-saturation');
  const valSaturation = document.getElementById('val-saturation');
  const btnResetAdjustments = document.getElementById('btn-reset-adjustments');
  const quickZoomChips = document.querySelectorAll('.quick-chip');

  function updateQuickZoomActive(currentVal) {
    if (!quickZoomChips) return;
    quickZoomChips.forEach((chip) => {
      const val = parseFloat(chip.dataset.zoom);
      chip.classList.toggle('active', Math.abs(val - currentVal) < 0.08);
    });
  }

  // Timer & Burst
  const selectTimer = document.getElementById('select-timer');
  const selectBurstCount = document.getElementById('select-burst-count');

  // Snapchat Lens Carousel & Effects
  const lensCarouselTrack = document.getElementById('lens-carousel-track');
  const snapchatLensRipple = document.getElementById('snapchat-lens-ripple');
  const lensActiveIndicator = document.getElementById('lens-active-indicator');
  const lensIndicatorIcon = document.getElementById('lens-indicator-icon');
  const lensIndicatorName = document.getElementById('lens-indicator-name');
  const btnExploreLenses = document.getElementById('btn-explore-lenses');

  // Snapchat Lens Explorer Modal
  const modalLensExplorer = document.getElementById('modal-lens-explorer');
  const backdropLensExplorer = document.getElementById('backdrop-lens-explorer');
  const btnCloseLensExplorer = document.getElementById('btn-close-lens-explorer');
  const lensSearchInput = document.getElementById('lens-search-input');
  const btnClearLensSearch = document.getElementById('btn-clear-lens-search');
  const lensCategoriesBar = document.getElementById('lens-categories-bar');
  const lensExplorerGrid = document.getElementById('lens-explorer-grid');

  // Gallery Elements
  const galleryContainer = document.getElementById('gallery-container');
  const tabAll = document.getElementById('tab-all');
  const tabPhotos = document.getElementById('tab-photos');
  const tabVideos = document.getElementById('tab-videos');
  const btnDownloadAll = document.getElementById('btn-download-all');
  const btnClearGallery = document.getElementById('btn-clear-gallery');
  const headerGalleryCount = document.getElementById('header-gallery-count');

  // Modals
  const modalLightbox = document.getElementById('modal-lightbox');
  const modalSettings = document.getElementById('modal-settings');
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const backdropSettings = document.getElementById('backdrop-settings');

  const modalShortcuts = document.getElementById('modal-shortcuts');
  const btnOpenShortcuts = document.getElementById('btn-open-shortcuts');
  const btnCloseShortcuts = document.getElementById('btn-close-shortcuts');
  const backdropShortcuts = document.getElementById('backdrop-shortcuts');

  const modalConfirm = document.getElementById('modal-confirm');
  const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
  const btnConfirmOk = document.getElementById('btn-confirm-ok');
  let confirmCallback = null;

  // Settings Fields
  const settingPhotoFormat = document.getElementById('setting-photo-format');
  const settingPhotoQuality = document.getElementById('setting-photo-quality');
  const valPhotoQuality = document.getElementById('val-photo-quality');
  const settingShutterSound = document.getElementById('setting-shutter-sound');
  const settingSoundVolume = document.getElementById('setting-sound-volume');
  const valSoundVolume = document.getElementById('val-sound-volume');
  const storageUsageText = document.getElementById('storage-usage-text');
  const btnPurgeStorage = document.getElementById('btn-purge-storage');

  // Initialize Filter Manager
  const filterManager = new FilterManager(videoEl);
  filterManager.setMirror(settings.mirrorMode);
  filterManager.setFlipVertical(settings.flipVertical);
  filterManager.setPreset(settings.activeFilter);
  filterManager.setAdjustments({
    brightness: settings.brightness,
    contrast: settings.contrast,
    saturation: settings.saturation
  });
  filterManager.setZoom(settings.zoom);

  // Initialize Snapchat AR Lens Engine
  const snapLensCanvas = document.getElementById('snapchat-lens-canvas');
  const snapLensEngine = new SnapLensEngine(snapLensCanvas, videoEl);
  const initialPreset = filterManager.getPreset(settings.activeFilter);
  if (initialPreset && initialPreset.overlay) {
    snapLensEngine.setOverlay(initialPreset.overlay);
  }

  // Initialize Capture Engine with AR Lens Canvas compositing
  const captureEngine = new PhotoCaptureEngine(videoEl, filterManager, {
    lensCanvas: snapLensCanvas,
    onFlash: () => {
      shutterFlash.classList.remove('flashing');
      // Trigger reflow
      void shutterFlash.offsetWidth;
      shutterFlash.classList.add('flashing');
    },
    onCountdownTick: (num) => {
      countdownNumber.textContent = num;
      countdownOverlay.classList.remove('hidden');
    },
    onCountdownEnd: () => {
      countdownOverlay.classList.add('hidden');
    }
  });

  // Initialize Video Recorder
  const videoRecorder = new VideoRecorder({
    onStateChange: (state) => {
      if (state === 'recording') {
        hudRecordingPill.classList.remove('hidden');
        hudPausedPill.classList.add('hidden');
        headerStatusDot.className = 'status-dot recording';
        headerStatusText.textContent = 'Recording Video';
        btnCaptureShutter.classList.add('recording');
        if (btnRecordTrigger) btnRecordTrigger.classList.add('recording');
        if (btnRecordPause) {
          btnRecordPause.classList.remove('hidden', 'paused');
          btnRecordPause.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          `;
        }
      } else if (state === 'paused') {
        hudPausedPill.classList.remove('hidden');
        if (btnRecordPause) {
          btnRecordPause.classList.add('paused');
          btnRecordPause.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          `;
        }
      } else if (state === 'idle') {
        hudRecordingPill.classList.add('hidden');
        hudPausedPill.classList.add('hidden');
        btnCaptureShutter.classList.remove('recording', 'locked-recording');
        if (btnRecordTrigger) btnRecordTrigger.classList.remove('recording');
        if (btnRecordPause) btnRecordPause.classList.add('hidden');
        headerStatusDot.className = cameraController.isStreaming ? 'status-dot active' : 'status-dot';
        headerStatusText.textContent = cameraController.isStreaming ? 'Live Camera Feed' : 'Camera Standby';
        resetSnapchatShutterUI();
      }
    },
    onTimerTick: ({ seconds, formatted, isPaused }) => {
      hudRecordTimer.textContent = formatted;
      if (progressRingFill) {
        const sec = typeof seconds === 'number' ? seconds : 0;
        const fraction = Math.min(1, sec / 60);
        const offset = 257.6 * (1 - fraction);
        progressRingFill.style.strokeDashoffset = offset.toFixed(1);
      }
      if (typeof seconds === 'number' && seconds >= 60) {
        stopVideoRecordingAndSave();
      }
    },
    onError: (err) => {
      showToast('Recording error: ' + err.message, 'error');
      resetSnapchatShutterUI();
    }
  });

  // Audio VU Meter State
  let audioCtx = null;
  let vuAnimId = null;

  function startAudioVuMeter(stream) {
    const vuFill = document.getElementById('audio-vu-fill');
    const vuText = document.getElementById('audio-vu-text');
    if (!vuFill) return;

    const audioTracks = stream ? stream.getAudioTracks() : [];
    if (!audioTracks || audioTracks.length === 0) {
      if (vuText) vuText.textContent = 'Muted / Off';
      vuFill.style.width = '4%';
      return;
    }

    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      if (vuText) vuText.textContent = 'Active (Live)';

      function updateMeter() {
        if (!cameraController.isStreaming) {
          if (vuFill) vuFill.style.width = '4%';
          if (vuText) vuText.textContent = 'Standby';
          return;
        }
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        const avg = sum / buffer.length;
        const pct = Math.min(100, Math.max(4, Math.round((avg / 128) * 100)));
        if (vuFill) vuFill.style.width = pct + '%';
        vuAnimId = requestAnimationFrame(updateMeter);
      }
      updateMeter();
    } catch (err) {
      console.warn('Audio VU meter error:', err);
      if (vuText) vuText.textContent = 'Active';
    }
  }

  function stopAudioVuMeter() {
    if (vuAnimId) {
      cancelAnimationFrame(vuAnimId);
      vuAnimId = null;
    }
    const vuFill = document.getElementById('audio-vu-fill');
    const vuText = document.getElementById('audio-vu-text');
    if (vuFill) vuFill.style.width = '4%';
    if (vuText) vuText.textContent = 'Standby';
  }

  // Update Inspector Mini Reel
  function updateRecentCapturesReel(items) {
    const reelEl = document.getElementById('recent-thumbs-row');
    if (!reelEl) return;
    const list = (items || []).slice(0, 4);

    if (list.length === 0) {
      reelEl.innerHTML = `<div class="recent-empty-hint">No captures yet</div>`;
      return;
    }

    reelEl.innerHTML = '';
    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'recent-thumb-item';
      const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      card.title = `${item.type.toUpperCase()}: ${item.name} (${time}) — Click to preview`;

      const url = item.dataUrl || (item.blob ? URL.createObjectURL(item.blob) : '');
      if (item.type === 'photo') {
        card.innerHTML = `<img src="${url}" alt="${item.name}" loading="lazy" />`;
      } else {
        card.innerHTML = `<video src="${url}" muted preload="metadata"></video>`;
      }

      card.addEventListener('click', () => {
        const fullIdx = galleryManager.items.indexOf(item);
        if (fullIdx !== -1) {
          galleryManager.openLightbox(fullIdx);
        }
      });

      reelEl.appendChild(card);
    });

    const stageThumbInner = document.getElementById('stage-thumb-inner');
    if (stageThumbInner) {
      if (list.length > 0) {
        const latest = list[0];
        const latestUrl = latest.dataUrl || (latest.blob ? URL.createObjectURL(latest.blob) : '');
        if (latest.type === 'photo') {
          stageThumbInner.innerHTML = `<img src="${latestUrl}" alt="Recent photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
        } else {
          stageThumbInner.innerHTML = `<video src="${latestUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" muted></video>`;
        }
      } else {
        stageThumbInner.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        `;
      }
    }
  }

  // Initialize Gallery
  const galleryManager = new GalleryManager(galleryContainer, modalLightbox, {
    onItemsChanged: (items) => {
      headerGalleryCount.textContent = items.length;
      const deckCount = document.getElementById('deck-gallery-count');
      if (deckCount) deckCount.textContent = items.length;
      updateStorageInfo();
      updateRecentCapturesReel(items);
    }
  });

  // Populate gallery from IndexedDB
  try {
    const existingMedia = await getAllMediaItems();
    galleryManager.setItems(existingMedia);
    const deckCount = document.getElementById('deck-gallery-count');
    if (deckCount) deckCount.textContent = existingMedia.length;
    updateRecentCapturesReel(existingMedia);
  } catch (err) {
    console.warn('Error loading media items from storage:', err);
  }

  // Initialize Camera Controller
  const cameraController = new CameraController(videoEl, {
    preferredResolution: settings.preferredResolution,
    includeAudio: settings.includeAudio,
    onStreamReady: (details) => {
      placeholderEl.classList.add('hidden');
      headerStatusDot.className = 'status-dot active';
      headerStatusText.textContent = 'Live Camera Feed';

      hudStreamInfo.classList.remove('hidden');
      btnQuickStop.classList.remove('hidden');
      hudResolutionText.textContent = `${details.width} × ${details.height}`;
      hudFpsText.textContent = `${details.frameRate} FPS`;

      populateDeviceDropdowns();
      startAudioVuMeter(cameraController.stream);

      // Attach stream to companion video so PiP can run simultaneously with main screen
      const pipVideo = document.getElementById('pip-companion-video');
      if (pipVideo) {
        pipVideo.srcObject = cameraController.stream;
        pipVideo.play().catch(() => {});
      }

      showToast(`Camera active: ${details.width}×${details.height} @ ${details.frameRate}fps`, 'success');
    },
    onStreamStopped: () => {
      placeholderEl.classList.remove('hidden');
      headerStatusDot.className = 'status-dot';
      headerStatusText.textContent = 'Camera Standby';
      hudStreamInfo.classList.add('hidden');
      btnQuickStop.classList.add('hidden');
      hudRecordingPill.classList.add('hidden');
      stopAudioVuMeter();

      const pipVideo = document.getElementById('pip-companion-video');
      if (pipVideo) {
        pipVideo.srcObject = null;
      }
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
    },
    onDevicesChanged: () => {
      populateDeviceDropdowns();
    },
    onError: (err) => {
      errorBox.classList.remove('hidden');
      errorMessage.textContent = err.message;
      errorTroubleshoot.textContent = err.troubleshooting || 'Please check browser device permissions.';
      showToast(err.message, 'error');
    }
  });

  // Apply Initial UI Settings state
  applyStoredSettingsToUI();
  renderSnapchatLensCarousel();
  activateLens(settings.activeFilter || 'none', false);
  updateGridOverlay(settings.gridType);
  initPwaServiceWorker();

  /* Helper Functions */

  function applyStoredSettingsToUI() {
    // Quick toggles
    btnQuickMirror.classList.toggle('active', settings.mirrorMode);
    btnQuickFlipV.classList.toggle('active', settings.flipVertical);

    // Resolution dropdown
    if (selectResolution) selectResolution.value = settings.preferredResolution;
    if (toggleAudioRecording) toggleAudioRecording.checked = settings.includeAudio;

    // Adjustments
    sliderZoom.value = settings.zoom;
    valZoom.textContent = settings.zoom.toFixed(1) + 'x';
    sliderBrightness.value = settings.brightness;
    valBrightness.textContent = settings.brightness + '%';
    sliderContrast.value = settings.contrast;
    valContrast.textContent = settings.contrast + '%';
    sliderSaturation.value = settings.saturation;
    valSaturation.textContent = settings.saturation + '%';

    // Timer & burst
    selectTimer.value = String(settings.timerDelay);
    labelTimerVal.textContent = settings.timerDelay === 0 ? 'Off' : `${settings.timerDelay}s`;
    selectBurstCount.value = String(settings.burstCount);

    const stageBurstCountLabel = document.getElementById('stage-burst-count-label');
    if (stageBurstCountLabel) stageBurstCountLabel.textContent = `${settings.burstCount}x`;
    updateQuickZoomActive(settings.zoom);
    updateScopeLevels(settings.brightness, settings.contrast, settings.saturation);

    // Settings Modal Inputs
    settingPhotoFormat.value = settings.photoFormat;
    settingPhotoQuality.value = Math.round(settings.photoQuality * 100);
    valPhotoQuality.textContent = Math.round(settings.photoQuality * 100) + '%';
    settingShutterSound.checked = settings.shutterSound;
    settingSoundVolume.value = Math.round(settings.shutterVolume * 100);
    valSoundVolume.textContent = Math.round(settings.shutterVolume * 100) + '%';
  }

  function updateScopeLevels(b = settings.brightness, c = settings.contrast, s = settings.saturation) {
    const scopeR = document.getElementById('scope-r');
    const scopeG = document.getElementById('scope-g');
    const scopeB = document.getElementById('scope-b');
    const scopeValR = document.getElementById('scope-val-r');
    const scopeValG = document.getElementById('scope-val-g');
    const scopeValB = document.getElementById('scope-val-b');
    if (!scopeR) return;

    const base = (b / 100) * 72;
    const contrastFactor = (c / 100);
    const satFactor = (s / 100);

    const rPct = Math.min(100, Math.max(8, Math.round(base * 1.02 * contrastFactor * (0.85 + 0.15 * satFactor))));
    const gPct = Math.min(100, Math.max(8, Math.round(base * 1.08 * contrastFactor)));
    const bPct = Math.min(100, Math.max(8, Math.round(base * 1.03 * contrastFactor * (0.88 + 0.12 * satFactor))));

    scopeR.style.width = rPct + '%';
    scopeG.style.width = gPct + '%';
    scopeB.style.width = bPct + '%';

    if (scopeValR) scopeValR.textContent = rPct + '%';
    if (scopeValG) scopeValG.textContent = gPct + '%';
    if (scopeValB) scopeValB.textContent = bPct + '%';
  }

  async function populateDeviceDropdowns() {
    const { videoDevices, audioDevices } = await cameraController.getAvailableDevices();

    // Populate video devices
    selectCamera.innerHTML = '';
    if (videoDevices.length === 0) {
      selectCamera.innerHTML = `<option value="">Default Camera</option>`;
    } else {
      videoDevices.forEach((dev, idx) => {
        const opt = document.createElement('option');
        opt.value = dev.deviceId;
        opt.textContent = dev.label;
        if (cameraController.activeDeviceId === dev.deviceId || (idx === 0 && !cameraController.activeDeviceId)) {
          opt.selected = true;
        }
        selectCamera.appendChild(opt);
      });
    }

    // Populate audio devices
    selectMic.innerHTML = '';
    if (audioDevices.length === 0) {
      selectMic.innerHTML = `<option value="">Default Microphone</option>`;
    } else {
      audioDevices.forEach((dev) => {
        const opt = document.createElement('option');
        opt.value = dev.deviceId;
        opt.textContent = dev.label;
        selectMic.appendChild(opt);
      });
    }
  }

  /* ==========================================================================
     SNAPCHAT LENS CAROUSEL & TRANSITION ENGINE
     ========================================================================== */

  let lensIndicatorTimer = null;

  function activateLens(presetId, animate = true) {
    const preset = filterManager.getPreset(presetId);
    settings.activeFilter = preset.id;
    filterManager.setPreset(preset.id);
    saveSettings(settings);

    // Update real-time AR overlay in SnapLensEngine
    if (snapLensEngine) {
      snapLensEngine.setOverlay(preset.overlay || null);
    }

    // Update active state in carousel track
    if (lensCarouselTrack) {
      lensCarouselTrack.querySelectorAll('.snapchat-lens-btn').forEach((btn) => {
        const isActive = btn.dataset.lensId === preset.id;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        if (isActive && animate) {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }

    // Update active state in explorer grid if open
    if (lensExplorerGrid) {
      lensExplorerGrid.querySelectorAll('.lens-row-card').forEach((card) => {
        const isActive = card.dataset.lensId === preset.id;
        card.classList.toggle('active', isActive);
        const btn = card.querySelector('.lens-row-try-btn');
        if (btn) btn.textContent = isActive ? 'Active' : 'Try Lens';
      });
    }

    // Update shutter inner accent gradient
    const shutterInner = document.getElementById('shutter-inner');
    if (shutterInner) {
      if (preset.id === 'none') {
        shutterInner.style.background = '#f8fafc';
        shutterInner.style.boxShadow = 'none';
      } else {
        shutterInner.style.background = preset.gradient || 'var(--color-primary)';
        shutterInner.style.boxShadow = '0 0 16px rgba(255, 255, 255, 0.45)';
      }
    }

    // Snapchat Lens Switch Viewfinder Animation
    if (animate) {
      if (snapchatLensRipple) {
        snapchatLensRipple.classList.remove('rippling');
        void snapchatLensRipple.offsetWidth; // Force reflow
        snapchatLensRipple.classList.add('rippling');
      }

      if (lensActiveIndicator && lensIndicatorIcon && lensIndicatorName) {
        lensIndicatorIcon.textContent = preset.icon || '✨';
        lensIndicatorName.textContent = preset.name;
        lensActiveIndicator.classList.remove('hidden', 'fade-out');
        lensActiveIndicator.classList.add('pop-in');

        if (lensIndicatorTimer) clearTimeout(lensIndicatorTimer);
        lensIndicatorTimer = setTimeout(() => {
          lensActiveIndicator.classList.add('fade-out');
          setTimeout(() => {
            lensActiveIndicator.classList.add('hidden');
            lensActiveIndicator.classList.remove('pop-in', 'fade-out');
          }, 350);
        }, 1600);
      }
    }
  }

  function renderSnapchatLensCarousel() {
    if (!lensCarouselTrack) return;
    lensCarouselTrack.innerHTML = '';

    FILTER_PRESETS.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `snapchat-lens-btn ${settings.activeFilter === preset.id ? 'active' : ''}`;
      btn.dataset.lensId = preset.id;
      btn.title = `${preset.name} — ${preset.tagline}`;
      btn.setAttribute('aria-label', `Apply ${preset.name} lens`);

      btn.innerHTML = `
        <div class="snapchat-lens-badge" style="background: ${preset.gradient}">
          <span class="lens-badge-icon">${preset.icon}</span>
        </div>
        <span class="lens-badge-label">${preset.name}</span>
      `;

      btn.addEventListener('click', () => {
        activateLens(preset.id, true);
      });

      lensCarouselTrack.appendChild(btn);
    });

    // Center active lens on initial render
    setTimeout(() => {
      const activeBtn = lensCarouselTrack.querySelector('.snapchat-lens-btn.active');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
      }
    }, 120);
  }

  /* ==========================================================================
     SNAPCHAT LENS EXPLORER (SEARCH & ROW-WISE CATALOG)
     ========================================================================== */

  let currentExplorerCategory = 'all';
  let currentExplorerQuery = '';

  function renderLensExplorerCategories() {
    if (!lensCategoriesBar) return;
    lensCategoriesBar.innerHTML = '';

    FILTER_CATEGORIES.forEach((cat) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `lens-cat-chip ${currentExplorerCategory === cat.id ? 'active' : ''}`;
      chip.innerHTML = `<span>${cat.icon}</span> <span>${cat.name}</span>`;
      chip.addEventListener('click', () => {
        currentExplorerCategory = cat.id;
        lensCategoriesBar.querySelectorAll('.lens-cat-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        renderLensExplorerGrid();
      });
      lensCategoriesBar.appendChild(chip);
    });
  }

  function renderLensExplorerGrid() {
    if (!lensExplorerGrid) return;
    lensExplorerGrid.innerHTML = '';

    const query = (currentExplorerQuery || '').toLowerCase().trim();
    const filtered = FILTER_PRESETS.filter((preset) => {
      const matchesCategory = currentExplorerCategory === 'all' || preset.category === currentExplorerCategory;
      const matchesSearch = !query ||
        preset.name.toLowerCase().includes(query) ||
        preset.tagline.toLowerCase().includes(query) ||
        preset.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      lensExplorerGrid.innerHTML = `
        <div class="lens-empty-state">
          <div class="empty-lens-icon">🔍</div>
          <h4>No lenses found</h4>
          <p>We couldn't find any lens matching "<strong>${currentExplorerQuery}</strong>".</p>
          <button class="btn btn-secondary btn-sm" id="btn-reset-lens-search">Show All Lenses</button>
        </div>
      `;
      const btnReset = document.getElementById('btn-reset-lens-search');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          currentExplorerQuery = '';
          currentExplorerCategory = 'all';
          if (lensSearchInput) lensSearchInput.value = '';
          if (btnClearLensSearch) btnClearLensSearch.classList.add('hidden');
          renderLensExplorerCategories();
          renderLensExplorerGrid();
        });
      }
      return;
    }

    filtered.forEach((preset) => {
      const card = document.createElement('div');
      card.className = `lens-row-card ${settings.activeFilter === preset.id ? 'active' : ''}`;
      card.dataset.lensId = preset.id;
      card.innerHTML = `
        <div class="lens-row-icon" style="background: ${preset.gradient}">
          <span>${preset.icon}</span>
        </div>
        <div class="lens-row-info">
          <div class="lens-row-title-row">
            <span class="lens-row-title">${preset.name}</span>
            <span class="lens-row-category">${preset.category.toUpperCase()}</span>
          </div>
          <span class="lens-row-tagline">${preset.tagline}</span>
        </div>
        <button class="lens-row-try-btn" title="Try ${preset.name} lens">
          ${settings.activeFilter === preset.id ? 'Active' : 'Try Lens'}
        </button>
      `;

      card.addEventListener('click', () => {
        activateLens(preset.id, true);
        closeLensExplorer();
        showToast(`Applied ${preset.name} lens!`, 'success', 1500);
      });

      lensExplorerGrid.appendChild(card);
    });
  }

  function openLensExplorer() {
    if (modalLensExplorer) {
      modalLensExplorer.classList.remove('hidden');
      document.body.classList.add('modal-open');
      renderLensExplorerCategories();
      renderLensExplorerGrid();
      if (lensSearchInput) {
        setTimeout(() => lensSearchInput.focus(), 120);
      }
    }
  }

  function closeLensExplorer() {
    if (modalLensExplorer) {
      modalLensExplorer.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }

  if (btnExploreLenses) btnExploreLenses.addEventListener('click', openLensExplorer);
  if (btnCloseLensExplorer) btnCloseLensExplorer.addEventListener('click', closeLensExplorer);
  if (backdropLensExplorer) backdropLensExplorer.addEventListener('click', closeLensExplorer);

  if (lensSearchInput) {
    lensSearchInput.addEventListener('input', (e) => {
      currentExplorerQuery = e.target.value;
      if (btnClearLensSearch) {
        btnClearLensSearch.classList.toggle('hidden', !currentExplorerQuery);
      }
      renderLensExplorerGrid();
    });
  }

  if (btnClearLensSearch) {
    btnClearLensSearch.addEventListener('click', () => {
      currentExplorerQuery = '';
      if (lensSearchInput) {
        lensSearchInput.value = '';
        lensSearchInput.focus();
      }
      btnClearLensSearch.classList.add('hidden');
      renderLensExplorerGrid();
    });
  }

  /* ==========================================================================
     PWA SERVICE WORKER REGISTRATION
     ========================================================================== */
  function initPwaServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('ProCam ServiceWorker active:', reg.scope);
        }).catch((err) => {
          console.warn('PWA registration:', err);
        });
      });
    }

    // Install prompt listener
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      window.deferredPrompt = e;
      console.log('PWA ready for install prompt');
    });
  }

  function updateGridOverlay(type) {
    gridOverlay.innerHTML = '';
    if (type === 'rule-of-thirds') {
      const g = document.createElement('div');
      g.className = 'grid-rule-of-thirds';
      for (let i = 0; i < 9; i++) g.appendChild(document.createElement('div'));
      gridOverlay.appendChild(g);
    } else if (type === 'golden-ratio') {
      const g = document.createElement('div');
      g.className = 'grid-golden-ratio';
      for (let i = 0; i < 9; i++) g.appendChild(document.createElement('div'));
      gridOverlay.appendChild(g);
    } else if (type === 'crosshair') {
      const g = document.createElement('div');
      g.className = 'grid-crosshair';
      gridOverlay.appendChild(g);
    } else if (type === 'square') {
      const g = document.createElement('div');
      g.className = 'grid-square';
      gridOverlay.appendChild(g);
    }
  }

  function cycleGrid() {
    const sequence = ['none', 'rule-of-thirds', 'golden-ratio', 'crosshair', 'square'];
    const currentIdx = sequence.indexOf(settings.gridType);
    const nextType = sequence[(currentIdx + 1) % sequence.length];
    settings.gridType = nextType;
    updateGridOverlay(nextType);
    btnQuickGrid.classList.toggle('active', nextType !== 'none');
    saveSettings(settings);
    showToast(`Grid: ${nextType.replace(/-/g, ' ')}`, 'info', 1600);
  }

  function toggleMirror() {
    settings.mirrorMode = !settings.mirrorMode;
    filterManager.setMirror(settings.mirrorMode);
    btnQuickMirror.classList.toggle('active', settings.mirrorMode);
    saveSettings(settings);
    showToast(settings.mirrorMode ? 'Mirror mode ON' : 'Mirror mode OFF', 'info', 1600);
  }

  function toggleFlipV() {
    settings.flipVertical = !settings.flipVertical;
    filterManager.setFlipVertical(settings.flipVertical);
    btnQuickFlipV.classList.toggle('active', settings.flipVertical);
    saveSettings(settings);
    showToast(settings.flipVertical ? 'Vertical flip ON' : 'Vertical flip OFF', 'info', 1600);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        if (viewportWrap.requestFullscreen) {
          await viewportWrap.requestFullscreen();
        } else if (viewportWrap.webkitRequestFullscreen) {
          await viewportWrap.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
    }
  }

  document.addEventListener('fullscreenchange', () => {
    const isFull = !!document.fullscreenElement;
    btnQuickFullscreen.classList.toggle('active', isFull);
    viewportWrap.classList.toggle('fullscreen-mode', isFull);
  });

  const pipCompanionVideo = document.getElementById('pip-companion-video');

  function updatePipActiveUI(isActive) {
    btnQuickPip.classList.toggle('active', isActive);
  }

  if (pipCompanionVideo) {
    pipCompanionVideo.addEventListener('enterpictureinpicture', () => updatePipActiveUI(true));
    pipCompanionVideo.addEventListener('leavepictureinpicture', () => updatePipActiveUI(false));
  }
  if (videoEl) {
    videoEl.addEventListener('enterpictureinpicture', () => updatePipActiveUI(true));
    videoEl.addEventListener('leavepictureinpicture', () => updatePipActiveUI(false));
  }

  async function togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        updatePipActiveUI(false);
        showToast('Picture-in-Picture closed', 'info', 1500);
        return;
      }

      if (!cameraController.isStreaming || !cameraController.stream) {
        showToast('Please start camera first to open Picture-in-Picture', 'warning');
        return;
      }

      if (!document.pictureInPictureEnabled) {
        showToast('Picture-in-Picture is not supported by your browser', 'warning');
        return;
      }

      // Use companion video element so BOTH the main studio stage AND floating window show live camera!
      if (pipCompanionVideo) {
        if (pipCompanionVideo.srcObject !== cameraController.stream) {
          pipCompanionVideo.srcObject = cameraController.stream;
        }
        await pipCompanionVideo.play().catch(() => {});
        await pipCompanionVideo.requestPictureInPicture();
        updatePipActiveUI(true);
        showToast('PiP Active: Playing on BOTH screens!', 'success', 2500);
      } else {
        await videoEl.requestPictureInPicture();
        updatePipActiveUI(true);
      }
    } catch (e) {
      console.warn('PiP error:', e);
      showToast('Picture-in-Picture: ' + e.message, 'warning');
    }
  }

  async function updateStorageInfo() {
    const estimate = await getStorageEstimate();
    if (storageUsageText) {
      storageUsageText.textContent = `${estimate.formattedUsage} used`;
    }
  }

  function openConfirmation(title, message, onOk) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    confirmCallback = onOk;
    modalConfirm.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeConfirmation() {
    modalConfirm.classList.add('hidden');
    document.body.classList.remove('modal-open');
    confirmCallback = null;
  }

  btnConfirmCancel.addEventListener('click', closeConfirmation);
  btnConfirmOk.addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirmation();
  });

  /* Mode Switching (Photo / Video / Burst) */
  function setMode(mode) {
    currentMode = mode;
    [modePhotoBtn, modeVideoBtn, modeBurstBtn].forEach((btn) => btn.classList.remove('active'));

    const stageBadgeBurst = document.getElementById('stage-badge-burst');

    if (mode === 'photo') {
      modePhotoBtn.classList.add('active');
      if (stageBadgeBurst) stageBadgeBurst.classList.add('hidden');
    } else if (mode === 'video') {
      modeVideoBtn.classList.add('active');
      if (stageBadgeBurst) stageBadgeBurst.classList.add('hidden');
    } else if (mode === 'burst') {
      modeBurstBtn.classList.add('active');
      if (stageBadgeBurst) stageBadgeBurst.classList.remove('hidden');
    }

    if (btnCaptureShutter) {
      btnCaptureShutter.classList.remove('hidden');
    }
    if (btnRecordTrigger) {
      btnRecordTrigger.classList.add('hidden');
    }
    if (btnRecordPause) {
      btnRecordPause.classList.add('hidden');
    }
  }

  modePhotoBtn.addEventListener('click', () => setMode('photo'));
  modeVideoBtn.addEventListener('click', () => setMode('video'));
  modeBurstBtn.addEventListener('click', () => setMode('burst'));

  /* Camera Actions */

  async function handleStartCamera() {
    errorBox.classList.add('hidden');
    try {
      await cameraController.startCamera();
    } catch (e) {
      console.warn('Start camera failed:', e);
    }
  }

  function handleStopCamera() {
    if (videoRecorder.state !== 'idle') {
      videoRecorder.stopRecording();
    }
    cameraController.stopCamera();
    showToast('Camera stream stopped', 'info');
  }

  btnStartCamera.addEventListener('click', handleStartCamera);
  btnQuickStop.addEventListener('click', handleStopCamera);

  /* ==========================================================================
     SNAPCHAT CAMERA SHUTTER: TAP PHOTO, HOLD VIDEO, SLIDE-TO-LOCK
     ========================================================================== */

  let holdTimer = null;
  let isHolding = false;
  let isRecordingActive = false;
  let isLockedHandsFree = false;
  let pointerStartY = 0;
  let activePointerId = null;
  const HOLD_THRESHOLD_MS = 280; // ms threshold to distinguish tap from hold
  const SLIDE_LOCK_DISTANCE_PX = 35; // px upward drag to trigger lock
  const MAX_RECORDING_SECONDS = 60; // 60 seconds snap limit
  const RING_CIRCUMFERENCE = 257.6; // 2 * PI * 41

  function resetSnapchatShutterUI() {
    isHolding = false;
    isRecordingActive = false;
    isLockedHandsFree = false;
    activePointerId = null;

    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }

    if (btnCaptureShutter) {
      btnCaptureShutter.classList.remove('recording', 'locked-recording');
    }
    if (snapLockPill) {
      snapLockPill.classList.add('hidden');
      snapLockPill.classList.remove('locked');
      if (lockLabel) lockLabel.textContent = 'Slide to Lock';
      if (lockUnlockedSvg) lockUnlockedSvg.classList.remove('hidden');
      if (lockLockedSvg) lockLockedSvg.classList.add('hidden');
      if (lockChevron) lockChevron.classList.remove('hidden');
    }

    if (shutterProgressRing) {
      shutterProgressRing.classList.remove('active');
    }
    if (progressRingFill) {
      progressRingFill.style.strokeDashoffset = RING_CIRCUMFERENCE.toString();
    }
  }

  /* Photo Capture Handler (Triggered on Tap) */
  async function handlePhotoCapture() {
    if (!cameraController.isStreaming) {
      showToast('Please start the camera first.', 'warning');
      return;
    }

    try {
      btnCaptureShutter.disabled = true;

      // Check countdown timer
      const delay = parseInt(settings.timerDelay, 10);
      if (delay > 0) {
        await captureEngine.runCountdown(delay, settings.shutterSound, settings.shutterVolume);
      }

      if (currentMode === 'burst') {
        const count = parseInt(settings.burstCount, 10) || 3;
        showToast(`Capturing burst of ${count} photos...`, 'info', 2000);
        const burstItems = await captureEngine.captureBurst(count, {
          format: settings.photoFormat,
          quality: settings.photoQuality,
          sound: settings.shutterSound,
          volume: settings.shutterVolume
        });

        for (const item of burstItems) {
          await saveMediaItem(item);
          galleryManager.addItem(item);
        }
        showToast(`Captured ${count} burst photos!`, 'success');
      } else {
        const item = await captureEngine.capturePhoto({
          format: settings.photoFormat,
          quality: settings.photoQuality,
          sound: settings.shutterSound,
          volume: settings.shutterVolume
        });

        await saveMediaItem(item);
        galleryManager.addItem(item);
        showToast('Photo saved to gallery!', 'success');
      }
    } catch (err) {
      console.error('Photo capture error:', err);
      showToast('Failed to take photo: ' + err.message, 'error');
    } finally {
      btnCaptureShutter.disabled = false;
    }
  }

  let compositeCanvas = null;
  let compositeCtx = null;
  let compositeAnimId = null;

  function getRecordingStream() {
    const currentPreset = filterManager.getPreset(settings.activeFilter);
    if (!currentPreset.overlay || !snapLensCanvas || !cameraController.stream) {
      return cameraController.stream;
    }

    if (!compositeCanvas) {
      compositeCanvas = document.createElement('canvas');
      compositeCtx = compositeCanvas.getContext('2d');
    }

    const vw = videoEl.videoWidth || 1280;
    const vh = videoEl.videoHeight || 720;
    compositeCanvas.width = vw;
    compositeCanvas.height = vh;

    function drawComposite() {
      if (videoRecorder.state === 'idle') {
        if (compositeAnimId) {
          cancelAnimationFrame(compositeAnimId);
          compositeAnimId = null;
        }
        return;
      }

      compositeCtx.save();
      const filterStr = filterManager.getFilterString();
      compositeCtx.filter = filterStr === 'none' ? 'none' : filterStr;
      const zoom = filterManager.zoom;
      const mirror = filterManager.mirror;
      const flipV = filterManager.flipV;

      compositeCtx.translate(vw / 2, vh / 2);
      compositeCtx.scale(mirror ? -zoom : zoom, flipV ? -zoom : zoom);
      compositeCtx.translate(-vw / 2, -vh / 2);
      compositeCtx.drawImage(videoEl, 0, 0, vw, vh);
      compositeCtx.restore();

      compositeCtx.filter = 'none';
      if (snapLensCanvas && snapLensCanvas.width > 0) {
        compositeCtx.drawImage(snapLensCanvas, 0, 0, vw, vh);
      }

      compositeAnimId = requestAnimationFrame(drawComposite);
    }

    drawComposite();

    try {
      const compStream = compositeCanvas.captureStream(30);
      const audioTracks = cameraController.stream.getAudioTracks();
      audioTracks.forEach((t) => compStream.addTrack(t));
      return compStream;
    } catch (e) {
      console.warn('captureStream error, falling back to camera stream:', e);
      return cameraController.stream;
    }
  }

  /* Start Video Recording Session (Triggered on Long-Press / Hold) */
  async function startVideoRecordingSession() {
    if (!cameraController.isStreaming || !cameraController.stream) {
      showToast('Please start the camera before recording.', 'warning');
      resetSnapchatShutterUI();
      return;
    }

    if (videoRecorder.state !== 'idle') return;

    try {
      playRecordStartSound(settings.shutterSound, settings.shutterVolume);
      const streamToRecord = getRecordingStream();
      videoRecorder.startRecording(streamToRecord, {
        videoBitsPerSecond: 3500000
      });
      isRecordingActive = true;
      isLockedHandsFree = false;

      // Update UI for recording
      btnCaptureShutter.classList.add('recording');
      btnCaptureShutter.classList.remove('locked-recording');

      if (snapLockPill) {
        snapLockPill.classList.remove('hidden', 'locked');
        if (lockLabel) lockLabel.textContent = 'Slide to Lock';
        if (lockUnlockedSvg) lockUnlockedSvg.classList.remove('hidden');
        if (lockLockedSvg) lockLockedSvg.classList.add('hidden');
        if (lockChevron) lockChevron.classList.remove('hidden');
      }

      if (shutterProgressRing) {
        shutterProgressRing.classList.add('active');
      }
      if (progressRingFill) {
        progressRingFill.style.strokeDashoffset = RING_CIRCUMFERENCE.toString();
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(40);
      }
      showToast('Holding to record... Slide up to lock!', 'info', 1800);
    } catch (err) {
      console.error('Failed to start recording:', err);
      showToast('Could not start recording: ' + err.message, 'error');
      resetSnapchatShutterUI();
    }
  }

  /* Stop Video Recording & Save to Memories */
  async function stopVideoRecordingAndSave() {
    if (compositeAnimId) {
      cancelAnimationFrame(compositeAnimId);
      compositeAnimId = null;
    }

    if (videoRecorder.state === 'idle') {
      resetSnapchatShutterUI();
      return;
    }

    try {
      playRecordStopSound(settings.shutterSound, settings.shutterVolume);
      const item = await videoRecorder.stopRecording();
      if (item) {
        await saveMediaItem(item);
        galleryManager.addItem(item);
        showToast(`Video saved (${item.formattedDuration})!`, 'success');
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      showToast('Error saving video: ' + err.message, 'error');
    } finally {
      resetSnapchatShutterUI();
    }
  }

  /* Activate Hands-Free Lock (Triggered on Slide Up) */
  function activateHandsFreeLock() {
    if (!isRecordingActive || isLockedHandsFree) return;
    isLockedHandsFree = true;

    // Visual updates
    if (snapLockPill) {
      snapLockPill.classList.add('locked');
      if (lockLabel) lockLabel.textContent = 'Locked (Hands-free)';
      if (lockUnlockedSvg) lockUnlockedSvg.classList.add('hidden');
      if (lockLockedSvg) lockLockedSvg.classList.remove('hidden');
      if (lockChevron) lockChevron.classList.add('hidden');
    }

    btnCaptureShutter.classList.remove('recording');
    btnCaptureShutter.classList.add('locked-recording');

    // Haptic confirmation
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
    showToast('🔒 Video locked hands-free! Tap to stop.', 'success', 2200);
  }

  /* Video Toggle Helper for Keyboard Shortcuts & Video Mode */
  async function handleVideoToggle() {
    if (videoRecorder.state === 'idle') {
      await startVideoRecordingSession();
      activateHandsFreeLock();
    } else {
      await stopVideoRecordingAndSave();
    }
  }

  function handleVideoPauseResume() {
    if (videoRecorder.state === 'recording') {
      videoRecorder.pauseRecording();
      showToast('Recording paused', 'info', 1500);
    } else if (videoRecorder.state === 'paused') {
      videoRecorder.resumeRecording();
      showToast('Recording resumed', 'info', 1500);
    }
  }

  /* Shutter Gesture State Machine (Pointer Events) */
  btnCaptureShutter.addEventListener('pointerdown', (e) => {
    e.preventDefault();

    // If already in locked hands-free recording, tapping stops the recording
    if (isLockedHandsFree || (videoRecorder.state === 'recording' && !isHolding)) {
      stopVideoRecordingAndSave();
      return;
    }

    if (!cameraController.isStreaming) {
      handlePhotoCapture();
      return;
    }

    isHolding = false;
    pointerStartY = e.clientY;
    activePointerId = e.pointerId;

    try {
      btnCaptureShutter.setPointerCapture(e.pointerId);
    } catch (err) {}

    if (holdTimer) clearTimeout(holdTimer);

    holdTimer = setTimeout(() => {
      isHolding = true;
      startVideoRecordingSession();
    }, HOLD_THRESHOLD_MS);
  });

  btnCaptureShutter.addEventListener('pointermove', (e) => {
    if (!isHolding || !isRecordingActive || isLockedHandsFree) return;

    const deltaY = e.clientY - pointerStartY;
    if (deltaY <= -SLIDE_LOCK_DISTANCE_PX) {
      activateHandsFreeLock();
    }
  });

  function handlePointerRelease(e) {
    if (activePointerId !== null && e.pointerId === activePointerId) {
      try {
        btnCaptureShutter.releasePointerCapture(e.pointerId);
      } catch (err) {}
      activePointerId = null;
    }

    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }

    if (!isHolding) {
      // Short tap (< 280ms)
      if (currentMode === 'video') {
        if (videoRecorder.state === 'recording') {
          stopVideoRecordingAndSave();
        } else {
          startVideoRecordingSession();
          activateHandsFreeLock();
        }
      } else {
        handlePhotoCapture();
      }
    } else {
      // Was holding
      if (isRecordingActive) {
        if (!isLockedHandsFree) {
          stopVideoRecordingAndSave();
        }
      }
    }
    isHolding = false;
  }

  btnCaptureShutter.addEventListener('pointerup', handlePointerRelease);
  btnCaptureShutter.addEventListener('pointercancel', handlePointerRelease);

  if (snapLockPill) {
    snapLockPill.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isRecordingActive || videoRecorder.state === 'recording') {
        stopVideoRecordingAndSave();
      }
    });
  }

  if (btnRecordTrigger) btnRecordTrigger.addEventListener('click', handleVideoToggle);
  if (btnRecordPause) btnRecordPause.addEventListener('click', handleVideoPauseResume);

  /* Inspector Studio Tab Switches */
  function switchInspectorTab(tab) {
    drawerDevices.classList.toggle('hidden', tab !== 'devices');
    drawerAdjustments.classList.toggle('hidden', tab !== 'adjustments');
    drawerTimer.classList.toggle('hidden', tab !== 'timer');

    btnToggleDevices.classList.toggle('active', tab === 'devices');
    btnToggleAdjustments.classList.toggle('active', tab === 'adjustments');
    btnToggleTimer.classList.toggle('active', tab === 'timer');

    btnToggleDevices.setAttribute('aria-selected', tab === 'devices');
    btnToggleAdjustments.setAttribute('aria-selected', tab === 'adjustments');
    btnToggleTimer.setAttribute('aria-selected', tab === 'timer');
  }

  btnToggleDevices.addEventListener('click', () => switchInspectorTab('devices'));
  btnToggleAdjustments.addEventListener('click', () => switchInspectorTab('adjustments'));
  btnToggleTimer.addEventListener('click', () => switchInspectorTab('timer'));

  /* Quick Zoom Preset Chips Event Handlers */
  quickZoomChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const z = parseFloat(chip.dataset.zoom);
      sliderZoom.value = z;
      valZoom.textContent = z.toFixed(1) + 'x';
      settings.zoom = z;
      filterManager.setZoom(z);
      saveSettings(settings);
      updateQuickZoomActive(z);
      showToast(`Zoom: ${z.toFixed(1)}x`, 'info', 1200);
    });
  });

  /* Device Controls Listeners */
  selectCamera.addEventListener('change', async (e) => {
    const devId = e.target.value;
    if (devId) {
      await cameraController.switchCamera(devId);
      showToast('Switched camera', 'info', 1500);
    }
  });

  async function handleFlipFacing() {
    const allFlipButtons = [btnFlipFacing, btnQuickFlipCam, btnFlipFacingDeck].filter(Boolean);
    allFlipButtons.forEach((b) => b.classList.add('flipping'));
    try {
      const facing = await cameraController.flipFacingMode();
      showToast(`Flipped to ${facing === 'user' ? 'Front' : 'Rear'} camera`, 'info', 1800);
    } catch (err) {
      console.warn('Flip camera error:', err);
      showToast('Could not switch camera: ' + err.message, 'warning');
    } finally {
      setTimeout(() => {
        allFlipButtons.forEach((b) => b.classList.remove('flipping'));
      }, 400);
    }
  }

  if (btnFlipFacing) btnFlipFacing.addEventListener('click', handleFlipFacing);
  if (btnQuickFlipCam) btnQuickFlipCam.addEventListener('click', handleFlipFacing);
  if (btnFlipFacingDeck) btnFlipFacingDeck.addEventListener('click', handleFlipFacing);

  selectResolution.addEventListener('change', async (e) => {
    settings.preferredResolution = e.target.value;
    saveSettings(settings);
    await cameraController.setResolutionPreset(settings.preferredResolution);
    showToast(`Resolution preset set to ${settings.preferredResolution}`, 'info', 1800);
  });

  toggleAudioRecording.addEventListener('change', async (e) => {
    settings.includeAudio = e.target.checked;
    saveSettings(settings);
    await cameraController.setIncludeAudio(settings.includeAudio);
    showToast(settings.includeAudio ? 'Mic audio enabled' : 'Mic audio disabled', 'info', 1800);
  });

  /* Adjustment Slider Listeners */
  sliderZoom.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valZoom.textContent = val.toFixed(1) + 'x';
    settings.zoom = val;
    filterManager.setZoom(val);
    updateQuickZoomActive(val);
  });

  sliderZoom.addEventListener('change', () => saveSettings(settings));

  sliderBrightness.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    valBrightness.textContent = val + '%';
    settings.brightness = val;
    filterManager.setAdjustments({ brightness: val });
    updateScopeLevels(val, settings.contrast, settings.saturation);
  });
  sliderBrightness.addEventListener('change', () => saveSettings(settings));

  sliderContrast.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    valContrast.textContent = val + '%';
    settings.contrast = val;
    filterManager.setAdjustments({ contrast: val });
    updateScopeLevels(settings.brightness, val, settings.saturation);
  });
  sliderContrast.addEventListener('change', () => saveSettings(settings));

  sliderSaturation.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    valSaturation.textContent = val + '%';
    settings.saturation = val;
    filterManager.setAdjustments({ saturation: val });
    updateScopeLevels(settings.brightness, settings.contrast, val);
  });
  sliderSaturation.addEventListener('change', () => saveSettings(settings));

  btnResetAdjustments.addEventListener('click', () => {
    settings.zoom = 1.0;
    settings.brightness = 100;
    settings.contrast = 100;
    settings.saturation = 100;
    sliderZoom.value = '1.0';
    valZoom.textContent = '1.0x';
    sliderBrightness.value = '100';
    valBrightness.textContent = '100%';
    sliderContrast.value = '100';
    valContrast.textContent = '100%';
    sliderSaturation.value = '100';
    valSaturation.textContent = '100%';
    filterManager.resetAll();
    updateQuickZoomActive(1.0);
    updateScopeLevels(100, 100, 100);
    saveSettings(settings);
    showToast('Adjustments reset', 'info', 1500);
  });

  /* Timer & Burst Listeners */
  selectTimer.addEventListener('change', (e) => {
    settings.timerDelay = parseInt(e.target.value, 10);
    labelTimerVal.textContent = settings.timerDelay === 0 ? 'Off' : `${settings.timerDelay}s`;
    saveSettings(settings);
  });

  selectBurstCount.addEventListener('change', (e) => {
    settings.burstCount = parseInt(e.target.value, 10);
    const stageBurstCountLabel = document.getElementById('stage-burst-count-label');
    if (stageBurstCountLabel) stageBurstCountLabel.textContent = `${settings.burstCount}x`;
    saveSettings(settings);
  });

  // Inspector Quick More Settings button
  const btnInspectorMoreSettings = document.getElementById('btn-inspector-more-settings');
  if (btnInspectorMoreSettings) {
    btnInspectorMoreSettings.addEventListener('click', () => {
      updateStorageInfo();
      modalSettings.classList.remove('hidden');
      document.body.classList.add('modal-open');
    });
  }

  // Smooth Gallery link from inspector
  const linkViewAllGallery = document.getElementById('link-view-all-gallery');
  if (linkViewAllGallery) {
    linkViewAllGallery.addEventListener('click', (e) => {
      e.preventDefault();
      const gallerySec = document.getElementById('gallery');
      if (gallerySec) gallerySec.scrollIntoView({ behavior: 'smooth' });
    });
  }
  /* Studio Tools Slide-out Drawer Controls */
  const studioInspector = document.getElementById('studio-inspector');
  const inspectorBackdrop = document.getElementById('inspector-backdrop');
  const btnOpenTools = document.getElementById('btn-open-tools');
  const btnOpenToolsDeck = document.getElementById('btn-open-tools-deck');
  const btnCloseInspector = document.getElementById('btn-close-inspector');

  function openToolsDrawer(tab = null) {
    if (tab) switchInspectorTab(tab);
    if (studioInspector) {
      studioInspector.classList.remove('drawer-closed');
      studioInspector.classList.add('drawer-open');
    }
    if (inspectorBackdrop) inspectorBackdrop.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeToolsDrawer() {
    if (studioInspector) {
      studioInspector.classList.remove('drawer-open');
      studioInspector.classList.add('drawer-closed');
    }
    if (inspectorBackdrop) inspectorBackdrop.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  if (btnOpenTools) btnOpenTools.addEventListener('click', () => openToolsDrawer());
  if (btnOpenToolsDeck) btnOpenToolsDeck.addEventListener('click', () => openToolsDrawer());
  if (btnCloseInspector) btnCloseInspector.addEventListener('click', closeToolsDrawer);
  if (inspectorBackdrop) inspectorBackdrop.addEventListener('click', closeToolsDrawer);

  const drawerDragHandle = document.querySelector('.drawer-drag-handle');
  if (drawerDragHandle) {
    drawerDragHandle.addEventListener('click', closeToolsDrawer);
    let touchStartY = 0;
    drawerDragHandle.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    drawerDragHandle.addEventListener('touchmove', (e) => {
      const touchCurrentY = e.touches[0].clientY;
      if (touchCurrentY - touchStartY > 45) {
        closeToolsDrawer();
      }
    }, { passive: true });
  }

  /* Snapchat Mobile & Quick Deck Buttons: Timer, Burst, Tools, and Memories */
  const stageBadgeTimer = document.getElementById('stage-badge-timer');
  const btnQuickTimerHud = document.getElementById('btn-quick-timer-hud');
  const hudTimerBadge = document.getElementById('hud-timer-badge');
  const btnQuickToolsHud = document.getElementById('btn-quick-tools-hud');
  const btnCloseGallerySheet = document.getElementById('btn-close-gallery-sheet');
  const gallerySheetHandle = document.getElementById('gallery-sheet-handle');
  const btnJumpGallery = document.getElementById('btn-jump-gallery');

  function cycleTimerDelay() {
    const delays = [0, 3, 5, 10];
    const cur = parseInt(settings.timerDelay, 10) || 0;
    const idx = delays.indexOf(cur);
    const nextDelay = delays[(idx + 1) % delays.length];
    settings.timerDelay = nextDelay;
    selectTimer.value = String(nextDelay);
    const label = nextDelay === 0 ? 'Off' : `${nextDelay}s`;
    labelTimerVal.textContent = label;
    if (hudTimerBadge) {
      hudTimerBadge.textContent = label;
      hudTimerBadge.classList.toggle('active', nextDelay > 0);
    }
    saveSettings(settings);
    showToast(nextDelay === 0 ? 'Timer: Off' : `Timer: ${nextDelay}s`, 'info', 1300);
  }

  if (stageBadgeTimer) {
    stageBadgeTimer.addEventListener('click', cycleTimerDelay);
  }
  if (btnQuickTimerHud) {
    btnQuickTimerHud.addEventListener('click', cycleTimerDelay);
  }
  if (btnQuickToolsHud) {
    btnQuickToolsHud.addEventListener('click', () => openToolsDrawer());
  }

  function openMemoriesSheet() {
    const gallerySec = document.getElementById('gallery');
    if (gallerySec) {
      if (window.innerWidth <= 768) {
        gallerySec.classList.add('gallery-sheet-open');
        document.body.classList.add('modal-open');
      } else {
        gallerySec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  function closeMemoriesSheet() {
    const gallerySec = document.getElementById('gallery');
    if (gallerySec) {
      gallerySec.classList.remove('gallery-sheet-open');
      document.body.classList.remove('modal-open');
    }
  }

  if (btnCloseGallerySheet) btnCloseGallerySheet.addEventListener('click', closeMemoriesSheet);
  if (gallerySheetHandle) gallerySheetHandle.addEventListener('click', closeMemoriesSheet);

  if (btnJumpGallery) {
    btnJumpGallery.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        openMemoriesSheet();
      }
    });
  }

  const stageBadgeBurst = document.getElementById('stage-badge-burst');
  if (stageBadgeBurst) {
    stageBadgeBurst.addEventListener('click', () => {
      const counts = [3, 5, 10];
      const cur = parseInt(settings.burstCount, 10) || 3;
      const idx = counts.indexOf(cur);
      const nextCount = counts[(idx + 1) % counts.length];
      settings.burstCount = nextCount;
      selectBurstCount.value = String(nextCount);
      const stageBurstCountLabel = document.getElementById('stage-burst-count-label');
      if (stageBurstCountLabel) stageBurstCountLabel.textContent = `${nextCount}x`;
      saveSettings(settings);
      showToast(`Burst count: ${nextCount}x`, 'info', 1300);
    });
  }

  const btnStageRecentThumb = document.getElementById('btn-stage-recent-thumb');
  if (btnStageRecentThumb) {
    btnStageRecentThumb.addEventListener('click', () => {
      openMemoriesSheet();
    });
  }

  /* Quick Viewport Buttons */
  btnQuickMirror.addEventListener('click', toggleMirror);
  btnQuickFlipV.addEventListener('click', toggleFlipV);
  btnQuickGrid.addEventListener('click', cycleGrid);
  btnQuickPip.addEventListener('click', togglePiP);
  btnQuickFullscreen.addEventListener('click', toggleFullscreen);

  /* Gallery Tabs */
  tabAll.addEventListener('click', () => {
    [tabAll, tabPhotos, tabVideos].forEach((t) => t.classList.remove('active'));
    tabAll.classList.add('active');
    galleryManager.setFilter('all');
  });

  tabPhotos.addEventListener('click', () => {
    [tabAll, tabPhotos, tabVideos].forEach((t) => t.classList.remove('active'));
    tabPhotos.classList.add('active');
    galleryManager.setFilter('photo');
  });

  tabVideos.addEventListener('click', () => {
    [tabAll, tabPhotos, tabVideos].forEach((t) => t.classList.remove('active'));
    tabVideos.classList.add('active');
    galleryManager.setFilter('video');
  });

  btnDownloadAll.addEventListener('click', () => galleryManager.downloadAll());

  btnClearGallery.addEventListener('click', () => {
    if (galleryManager.items.length === 0) {
      showToast('Gallery is already empty', 'info');
      return;
    }
    openConfirmation(
      'Clear All Media?',
      `This will permanently remove all ${galleryManager.items.length} photos and videos from local storage. This action cannot be undone.`,
      () => galleryManager.clearAll()
    );
  });

  /* Settings Modal Handlers */
  btnOpenSettings.addEventListener('click', () => {
    updateStorageInfo();
    modalSettings.classList.remove('hidden');
    document.body.classList.add('modal-open');
  });

  function closeSettingsModal() {
    modalSettings.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  btnCloseSettings.addEventListener('click', closeSettingsModal);
  backdropSettings.addEventListener('click', closeSettingsModal);

  settingPhotoFormat.addEventListener('change', (e) => {
    settings.photoFormat = e.target.value;
    saveSettings(settings);
  });

  settingPhotoQuality.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    valPhotoQuality.textContent = val + '%';
    settings.photoQuality = val / 100;
  });
  settingPhotoQuality.addEventListener('change', () => saveSettings(settings));

  settingShutterSound.addEventListener('change', (e) => {
    settings.shutterSound = e.target.checked;
    saveSettings(settings);
  });

  settingSoundVolume.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    valSoundVolume.textContent = val + '%';
    settings.shutterVolume = val / 100;
  });
  settingSoundVolume.addEventListener('change', () => saveSettings(settings));

  btnPurgeStorage.addEventListener('click', () => {
    openConfirmation(
      'Purge Storage & Reset All Settings?',
      'All saved media in IndexedDB and saved camera preferences will be erased.',
      async () => {
        await galleryManager.clearAll();
        settings = resetSettings();
        applyStoredSettingsToUI();
        showToast('Storage purged and settings reset to defaults', 'success');
        closeSettingsModal();
      }
    );
  });

  /* Shortcuts Modal Handlers */
  function openShortcutsModal() {
    modalShortcuts.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  function closeShortcutsModal() {
    modalShortcuts.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }

  btnOpenShortcuts.addEventListener('click', openShortcutsModal);
  btnCloseShortcuts.addEventListener('click', closeShortcutsModal);
  backdropShortcuts.addEventListener('click', closeShortcutsModal);

  /* Keyboard Shortcuts Manager */
  new ShortcutsManager({
    onPrimaryAction: () => {
      if (currentMode === 'video') {
        handleVideoToggle();
      } else {
        handlePhotoCapture();
      }
    },
    onToggleRecord: () => {
      if (currentMode !== 'video') setMode('video');
      handleVideoToggle();
    },
    onTogglePause: () => {
      handleVideoPauseResume();
    },
    onToggleMirror: () => toggleMirror(),
    onCycleGrid: () => cycleGrid(),
    onToggleFullscreen: () => toggleFullscreen(),
    onFlipCamera: async () => {
      await cameraController.flipFacingMode();
    },
    onCycleFilter: () => {
      const ids = FILTER_PRESETS.map((p) => p.id);
      const currIdx = ids.indexOf(settings.activeFilter);
      const nextId = ids[(currIdx + 1) % ids.length];
      activateLens(nextId, true);
    },
    onToggleHelp: () => {
      if (modalShortcuts.classList.contains('hidden')) {
        openShortcutsModal();
      } else {
        closeShortcutsModal();
      }
    },
    onModePhoto: () => {
      setMode('photo');
      showToast('Switched to Photo mode', 'info', 1200);
    },
    onModeVideo: () => {
      setMode('video');
      showToast('Switched to Video mode', 'info', 1200);
    },
    onModeBurst: () => {
      setMode('burst');
      showToast('Switched to Burst mode', 'info', 1200);
    },
    onEscape: () => {
      closeSettingsModal();
      closeShortcutsModal();
      closeConfirmation();
      galleryManager.closeLightbox();
    }
  });

  // Handle page unload cleanup
  window.addEventListener('beforeunload', () => {
    cameraController.stopCamera();
  });
});
