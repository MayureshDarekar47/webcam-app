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
import { FilterManager, FILTER_PRESETS } from './modules/filters.js';
import { PhotoCaptureEngine } from './modules/capture.js';
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

  // Capture / Record Controls
  const btnCaptureShutter = document.getElementById('btn-capture-shutter');
  const btnRecordTrigger = document.getElementById('btn-record-trigger');
  const btnRecordPause = document.getElementById('btn-record-pause');

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

  // Filters Bar
  const filterPresetsBar = document.getElementById('filter-presets-bar');

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

  // Initialize Capture Engine
  const captureEngine = new PhotoCaptureEngine(videoEl, filterManager, {
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
        btnRecordTrigger.classList.add('recording');
        btnRecordPause.classList.remove('hidden', 'paused');
        btnRecordPause.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
        `;
      } else if (state === 'paused') {
        hudPausedPill.classList.remove('hidden');
        btnRecordPause.classList.add('paused');
        btnRecordPause.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        `;
      } else if (state === 'idle') {
        hudRecordingPill.classList.add('hidden');
        hudPausedPill.classList.add('hidden');
        btnRecordTrigger.classList.remove('recording');
        btnRecordPause.classList.add('hidden');
        headerStatusDot.className = cameraController.isStreaming ? 'status-dot active' : 'status-dot';
        headerStatusText.textContent = cameraController.isStreaming ? 'Live Camera Feed' : 'Camera Standby';
      }
    },
    onTimerTick: ({ formatted, isPaused }) => {
      hudRecordTimer.textContent = formatted;
    },
    onError: (err) => {
      showToast('Recording error: ' + err.message, 'error');
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
      updateStorageInfo();
      updateRecentCapturesReel(items);
    }
  });

  // Populate gallery from IndexedDB
  try {
    const existingMedia = await getAllMediaItems();
    galleryManager.setItems(existingMedia);
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
  renderFilterPresets();
  updateGridOverlay(settings.gridType);

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

  function renderFilterPresets() {
    filterPresetsBar.innerHTML = '';
    FILTER_PRESETS.forEach((preset) => {
      const chip = document.createElement('button');
      chip.className = `filter-chip ${settings.activeFilter === preset.id ? 'active' : ''}`;
      chip.textContent = preset.name;
      chip.addEventListener('click', () => {
        filterPresetsBar.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        settings.activeFilter = preset.id;
        filterManager.setPreset(preset.id);
        saveSettings(settings);
      });
      filterPresetsBar.appendChild(chip);
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
      btnCaptureShutter.classList.remove('hidden');
      btnRecordTrigger.classList.add('hidden');
      btnRecordPause.classList.add('hidden');
      if (stageBadgeBurst) stageBadgeBurst.classList.remove('hidden');
    } else if (mode === 'video') {
      modeVideoBtn.classList.add('active');
      btnCaptureShutter.classList.add('hidden');
      btnRecordTrigger.classList.remove('hidden');
      btnRecordPause.classList.add('hidden');
      if (stageBadgeBurst) stageBadgeBurst.classList.add('hidden');
    } else if (mode === 'burst') {
      modeBurstBtn.classList.add('active');
      btnCaptureShutter.classList.remove('hidden');
      btnRecordTrigger.classList.add('hidden');
      btnRecordPause.classList.add('hidden');
      if (stageBadgeBurst) stageBadgeBurst.classList.remove('hidden');
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

  /* Photo Capture Handler */
  async function handlePhotoCapture() {
    if (!cameraController.isStreaming) {
      showToast('Please start the camera first.', 'warning');
      return;
    }

    try {
      btnCaptureShutter.disabled = true;

      // Check countdown
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

  btnCaptureShutter.addEventListener('click', handlePhotoCapture);

  /* Video Recording Handler */
  async function handleVideoToggle() {
    if (!cameraController.isStreaming) {
      showToast('Please start the camera before recording.', 'warning');
      return;
    }

    if (videoRecorder.state === 'idle') {
      // Start recording
      try {
        playRecordStartSound(settings.shutterSound, settings.shutterVolume);
        videoRecorder.startRecording(cameraController.stream, {
          videoBitsPerSecond: 3500000
        });
        showToast('Recording started...', 'info', 1800);
      } catch (err) {
        showToast('Could not start recording: ' + err.message, 'error');
      }
    } else {
      // Stop recording
      try {
        playRecordStopSound(settings.shutterSound, settings.shutterVolume);
        const item = await videoRecorder.stopRecording();
        if (item) {
          await saveMediaItem(item);
          galleryManager.addItem(item);
          showToast(`Recording saved (${item.formattedDuration})!`, 'success');
        }
      } catch (err) {
        console.error('Stop recording error:', err);
        showToast('Error saving recording: ' + err.message, 'error');
      }
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

  btnRecordTrigger.addEventListener('click', handleVideoToggle);
  btnRecordPause.addEventListener('click', handleVideoPauseResume);

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

  btnFlipFacing.addEventListener('click', async () => {
    const facing = await cameraController.flipFacingMode();
    showToast(`Flipped to ${facing === 'user' ? 'Front' : 'Rear'} camera`, 'info', 1800);
  });

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

  /* Quick Deck Buttons: Timer, Burst, and Recent Thumbnail */
  const stageBadgeTimer = document.getElementById('stage-badge-timer');
  if (stageBadgeTimer) {
    stageBadgeTimer.addEventListener('click', () => {
      const delays = [0, 3, 5, 10];
      const cur = parseInt(settings.timerDelay, 10) || 0;
      const idx = delays.indexOf(cur);
      const nextDelay = delays[(idx + 1) % delays.length];
      settings.timerDelay = nextDelay;
      selectTimer.value = String(nextDelay);
      labelTimerVal.textContent = nextDelay === 0 ? 'Off' : `${nextDelay}s`;
      saveSettings(settings);
      showToast(nextDelay === 0 ? 'Timer: Off' : `Timer: ${nextDelay}s`, 'info', 1300);
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
      if (galleryManager.items && galleryManager.items.length > 0) {
        galleryManager.openLightbox(0);
      } else {
        const gallerySec = document.getElementById('gallery');
        if (gallerySec) gallerySec.scrollIntoView({ behavior: 'smooth' });
      }
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
      settings.activeFilter = nextId;
      filterManager.setPreset(nextId);
      renderFilterPresets();
      saveSettings(settings);
      showToast(`Filter: ${nextId}`, 'info', 1500);
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
