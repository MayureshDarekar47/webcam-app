/**
 * Photo Capture Engine: Single Shot, Burst Mode, Countdown Timers, and Canvas rendering
 */

import { playShutterSound, playCountdownBeep } from './audio.js';

export class PhotoCaptureEngine {
  constructor(videoElement, filterManager, options = {}) {
    this.video = videoElement;
    this.filterManager = filterManager;
    this.lensCanvas = options.lensCanvas || null;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });

    this.onCountdownTick = options.onCountdownTick || null;
    this.onCountdownEnd = options.onCountdownEnd || null;
    this.onFlash = options.onFlash || null;
  }

  /**
   * Capture a single still photo with active filters, zoom, mirror, and crop
   * @param {Object} captureOptions - { format: 'png'|'jpeg'|'webp', quality: 0.92, sound: true, volume: 0.7 }
   */
  async capturePhoto(captureOptions = {}) {
    const video = this.video;
    if (!video || !video.videoWidth || !video.videoHeight) {
      throw new Error('Video stream is not ready for capture.');
    }

    const {
      format = 'png',
      quality = 0.92,
      sound = true,
      volume = 0.7
    } = captureOptions;

    // Trigger visual flash
    if (this.onFlash) {
      this.onFlash();
    }

    // Play synthesized mechanical shutter sound
    playShutterSound(sound, volume);

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    this.canvas.width = videoWidth;
    this.canvas.height = videoHeight;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // Apply active visual filters
    const filterStr = this.filterManager.getFilterString();
    ctx.filter = filterStr === 'none' ? 'none' : filterStr;

    ctx.save();

    // Handle Zoom, Mirror, and Vertical Flip
    const zoom = this.filterManager.zoom;
    const mirror = this.filterManager.mirror;
    const flipV = this.filterManager.flipV;

    ctx.translate(videoWidth / 2, videoHeight / 2);
    ctx.scale(mirror ? -zoom : zoom, flipV ? -zoom : zoom);
    ctx.translate(-videoWidth / 2, -videoHeight / 2);

    // Draw video frame
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();

    // Reset canvas filter
    ctx.filter = 'none';

    // Draw active Snapchat AR Lens overlay if present
    if (this.lensCanvas && this.lensCanvas.width > 0 && this.lensCanvas.height > 0) {
      ctx.drawImage(this.lensCanvas, 0, 0, videoWidth, videoHeight);
    }

    // MIME type selection
    let mimeType = 'image/png';
    let extension = 'png';
    if (format === 'jpeg' || format === 'jpg') {
      mimeType = 'image/jpeg';
      extension = 'jpg';
    } else if (format === 'webp') {
      mimeType = 'image/webp';
      extension = 'webp';
    }

    // Convert canvas to Blob
    const blob = await new Promise((resolve) => {
      this.canvas.toBlob((b) => resolve(b), mimeType, quality);
    });

    const timestamp = Date.now();
    const filename = `webcam-photo-${new Date(timestamp).toISOString().replace(/[:.]/g, '-').slice(0, 19)}.${extension}`;
    const dataUrl = URL.createObjectURL(blob);

    return {
      id: 'img_' + timestamp + '_' + Math.random().toString(36).substring(2, 7),
      type: 'photo',
      blob,
      dataUrl,
      name: filename,
      mimeType,
      extension,
      timestamp,
      width: videoWidth,
      height: videoHeight,
      size: blob.size,
      filter: this.filterManager.activePresetId
    };
  }

  /**
   * Run a countdown timer before snapping
   * @param {number} seconds - 3, 5, or 10
   * @param {boolean} soundEnabled - beep toggle
   * @param {number} volume - beep volume
   */
  async runCountdown(seconds, soundEnabled = true, volume = 0.6) {
    if (seconds <= 0) return true;

    return new Promise((resolve) => {
      let remaining = seconds;

      const tick = () => {
        if (this.onCountdownTick) {
          this.onCountdownTick(remaining);
        }
        playCountdownBeep(remaining === 1, soundEnabled, volume);

        if (remaining <= 0) {
          if (this.onCountdownEnd) {
            this.onCountdownEnd();
          }
          resolve(true);
        } else {
          remaining--;
          setTimeout(tick, 1000);
        }
      };

      tick();
    });
  }

  /**
   * Execute Burst Mode (multiple quick snaps)
   * @param {number} count - number of photos (e.g. 3 or 5)
   * @param {Object} captureOptions
   */
  async captureBurst(count = 3, captureOptions = {}) {
    const results = [];
    const intervalMs = 280;

    for (let i = 0; i < count; i++) {
      const item = await this.capturePhoto(captureOptions);
      results.push(item);
      if (i < count - 1) {
        await new Promise((res) => setTimeout(res, intervalMs));
      }
    }

    return results;
  }
}
