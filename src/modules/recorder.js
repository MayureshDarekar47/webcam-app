/**
 * Professional Video Recorder using MediaRecorder API
 */

export class VideoRecorder {
  constructor(options = {}) {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.state = 'idle'; // 'idle' | 'recording' | 'paused'
    this.startTime = 0;
    this.pauseStartTime = 0;
    this.totalPausedDuration = 0;
    this.timerInterval = null;
    this.elapsedSeconds = 0;

    this.onStateChange = options.onStateChange || null;
    this.onTimerTick = options.onTimerTick || null;
    this.onError = options.onError || null;
  }

  /**
   * Find best supported MIME type for video recording
   */
  static getBestMimeType() {
    if (!window.MediaRecorder) return null;

    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4'
    ];

    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  static isPauseSupported() {
    return typeof MediaRecorder !== 'undefined' &&
           typeof MediaRecorder.prototype.pause === 'function';
  }

  /**
   * Start recording given a MediaStream
   * @param {MediaStream} stream - The live camera stream
   * @param {Object} recordOptions - bitrate, mimeType
   */
  startRecording(stream, recordOptions = {}) {
    if (!stream || !stream.active) {
      throw new Error('No active stream to record.');
    }

    if (this.state !== 'idle') {
      console.warn('Recorder already active, stopping existing session.');
      this.stopRecording();
    }

    this.recordedChunks = [];
    const mimeType = recordOptions.mimeType || VideoRecorder.getBestMimeType();

    const options = {};
    if (mimeType) {
      options.mimeType = mimeType;
    }
    if (recordOptions.videoBitsPerSecond) {
      options.videoBitsPerSecond = recordOptions.videoBitsPerSecond;
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      console.warn('Failed with requested options, falling back to basic MediaRecorder:', e);
      try {
        this.mediaRecorder = new MediaRecorder(stream);
      } catch (fatal) {
        if (this.onError) this.onError(fatal);
        throw fatal;
      }
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event.error);
      this._stopTimer();
      this._setState('idle');
      if (this.onError) this.onError(event.error);
    };

    // Slice in 1000ms timeslices for smooth data chunk buffering
    this.mediaRecorder.start(1000);
    this.startTime = performance.now();
    this.pauseStartTime = 0;
    this.totalPausedDuration = 0;
    this.elapsedSeconds = 0;

    this._startTimer();
    this._setState('recording');
  }

  /**
   * Pause the active recording
   */
  pauseRecording() {
    if (this.state === 'recording' && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      if (typeof this.mediaRecorder.pause === 'function') {
        this.mediaRecorder.pause();
        this.pauseStartTime = performance.now();
        this._setState('paused');
      }
    }
  }

  /**
   * Resume paused recording
   */
  resumeRecording() {
    if (this.state === 'paused' && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      if (typeof this.mediaRecorder.resume === 'function') {
        this.mediaRecorder.resume();
        this.totalPausedDuration += (performance.now() - this.pauseStartTime);
        this.pauseStartTime = 0;
        this._setState('recording');
      }
    }
  }

  /**
   * Stop recording and resolve with recorded video Blob and metadata
   */
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.state === 'idle') {
        return resolve(null);
      }

      this._stopTimer();

      const finalDuration = this.elapsedSeconds;
      const mime = this.mediaRecorder.mimeType || 'video/webm';

      this.mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(this.recordedChunks, { type: mime });
          const extension = mime.includes('mp4') ? 'mp4' : 'webm';
          const timestamp = Date.now();
          const filename = `webcam-recording-${new Date(timestamp).toISOString().replace(/[:.]/g, '-').slice(0, 19)}.${extension}`;

          const result = {
            id: 'vid_' + timestamp + '_' + Math.random().toString(36).substring(2, 7),
            type: 'video',
            blob,
            dataUrl: URL.createObjectURL(blob),
            name: filename,
            mimeType: mime,
            extension,
            timestamp,
            size: blob.size,
            duration: finalDuration,
            formattedDuration: VideoRecorder.formatSeconds(finalDuration)
          };

          this.recordedChunks = [];
          this.mediaRecorder = null;
          this._setState('idle');
          resolve(result);
        } catch (e) {
          this._setState('idle');
          reject(e);
        }
      };

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch (err) {
        this._setState('idle');
        reject(err);
      }
    });
  }

  _startTimer() {
    this._stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.state === 'recording') {
        const now = performance.now();
        const activeMs = now - this.startTime - this.totalPausedDuration;
        this.elapsedSeconds = Math.max(0, Math.floor(activeMs / 1000));

        if (this.onTimerTick) {
          const formatted = VideoRecorder.formatSeconds(this.elapsedSeconds);
          this.onTimerTick({
            seconds: this.elapsedSeconds,
            formatted,
            isPaused: false
          });
        }
      } else if (this.state === 'paused' && this.onTimerTick) {
        this.onTimerTick({
          seconds: this.elapsedSeconds,
          formatted: VideoRecorder.formatSeconds(this.elapsedSeconds),
          isPaused: true
        });
      }
    }, 250);
  }

  _stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  _setState(newState) {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  /**
   * Format seconds into HH:MM:SS or MM:SS
   */
  static formatSeconds(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }
}
