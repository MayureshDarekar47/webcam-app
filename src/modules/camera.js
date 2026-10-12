/**
 * Professional Camera Controller using browser MediaDevices API
 */

export class CameraController {
  constructor(videoElement, options = {}) {
    this.video = videoElement;
    this.stream = null;
    this.currentTrack = null;
    this.activeDeviceId = null;
    this.facingMode = 'user'; // 'user' | 'environment'
    this.resolutionPreset = options.preferredResolution || '1080p';
    this.includeAudio = options.includeAudio ?? true;
    this.activeAudioDeviceId = null;
    this.isStreaming = false;

    this.onStreamReady = options.onStreamReady || null;
    this.onStreamStopped = options.onStreamStopped || null;
    this.onDevicesChanged = options.onDevicesChanged || null;
    this.onError = options.onError || null;

    this._setupDeviceChangeListener();
  }

  _setupDeviceChangeListener() {
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
      navigator.mediaDevices.addEventListener('devicechange', async () => {
        const devices = await this.getAvailableDevices();
        if (this.onDevicesChanged) {
          this.onDevicesChanged(devices);
        }
      });
    }
  }

  /**
   * Check if MediaDevices API is supported and in a secure context
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  static isSecureContext() {
    return window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  /**
   * Enumerate available video and audio input devices
   */
  async getAvailableDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return { videoDevices: [], audioDevices: [] };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = [];
      const audioDevices = [];

      let camIndex = 1;
      let micIndex = 1;

      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          let label = device.label || `Camera ${camIndex}`;
          // Detect front vs back hints from label if available
          const lower = label.toLowerCase();
          const isBack = lower.includes('back') || lower.includes('rear') || lower.includes('environment');
          const isFront = lower.includes('front') || lower.includes('user') || lower.includes('facetime');

          videoDevices.push({
            deviceId: device.deviceId,
            groupId: device.groupId,
            label,
            isBack,
            isFront
          });
          camIndex++;
        } else if (device.kind === 'audioinput') {
          audioDevices.push({
            deviceId: device.deviceId,
            groupId: device.groupId,
            label: device.label || `Microphone ${micIndex}`
          });
          micIndex++;
        }
      });

      return { videoDevices, audioDevices };
    } catch (err) {
      console.warn('Error enumerating devices:', err);
      return { videoDevices: [], audioDevices: [] };
    }
  }

  /**
   * Get constraints object based on user options and resolution preset
   */
  _buildConstraints(relaxed = false) {
    const videoConstraints = {};

    if (this.activeDeviceId) {
      videoConstraints.deviceId = { exact: this.activeDeviceId };
    } else if (this.facingMode) {
      videoConstraints.facingMode = { ideal: this.facingMode };
    }

    if (!relaxed) {
      switch (this.resolutionPreset) {
        case '4k':
          videoConstraints.width = { ideal: 3840, min: 1920 };
          videoConstraints.height = { ideal: 2160, min: 1080 };
          break;
        case '1080p':
          videoConstraints.width = { ideal: 1920, min: 1280 };
          videoConstraints.height = { ideal: 1080, min: 720 };
          break;
        case '720p':
          videoConstraints.width = { ideal: 1280, min: 640 };
          videoConstraints.height = { ideal: 720, min: 480 };
          break;
        case '480p':
          videoConstraints.width = { ideal: 640 };
          videoConstraints.height = { ideal: 480 };
          break;
        case 'auto':
        default:
          videoConstraints.width = { ideal: 1920 };
          videoConstraints.height = { ideal: 1080 };
          break;
      }
    }

    // Audio constraints
    let audioConstraints = false;
    if (this.includeAudio) {
      audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      };
      if (this.activeAudioDeviceId) {
        audioConstraints.deviceId = { exact: this.activeAudioDeviceId };
      }
    }

    return {
      video: videoConstraints,
      audio: audioConstraints
    };
  }

  /**
   * Start the camera stream
   */
  async startCamera() {
    if (!CameraController.isSupported()) {
      const err = new Error('Camera access (MediaDevices API) is not supported by this browser.');
      err.code = 'NOT_SUPPORTED';
      if (this.onError) this.onError(err);
      throw err;
    }

    // Stop any existing stream first to avoid leaks
    this.stopCamera();

    let constraints = this._buildConstraints(false);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.warn('Initial getUserMedia failed, attempting fallback constraints:', err);
      // Fallback 1: Relax resolution constraints if OverconstrainedError
      if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
        try {
          constraints = this._buildConstraints(true);
          this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (fallbackErr) {
          // Fallback 2: Basic video only without audio
          try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          } catch (finalErr) {
            this._handleError(finalErr);
            throw finalErr;
          }
        }
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this._handleError(err);
        throw err;
      } else {
        // Try audio-less fallback if audio device was busy/missing
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (audioFallbackErr) {
          this._handleError(audioFallbackErr);
          throw audioFallbackErr;
        }
      }
    }

    this.video.srcObject = this.stream;
    this.isStreaming = true;

    // Attach current track
    const videoTracks = this.stream.getVideoTracks();
    if (videoTracks.length > 0) {
      this.currentTrack = videoTracks[0];
      this.activeDeviceId = this.currentTrack.getSettings().deviceId || this.activeDeviceId;
    }

    return new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        this.video.play().catch((playErr) => console.warn('Video play was delayed:', playErr));
        const details = this.getStreamDetails();
        if (this.onStreamReady) this.onStreamReady(details);
        resolve(details);
      };
    });
  }

  /**
   * Stop all camera and audio tracks completely
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }

    this.currentTrack = null;
    this.isStreaming = false;

    if (this.onStreamStopped) {
      this.onStreamStopped();
    }
  }

  /**
   * Switch to a specific video device ID
   */
  async switchCamera(deviceId) {
    this.activeDeviceId = deviceId;
    if (this.isStreaming) {
      return await this.startCamera();
    }
  }

  /**
   * Toggle front and rear cameras (primarily for mobile)
   */
  async flipFacingMode() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.activeDeviceId = null; // Reset explicit deviceId so facingMode takes precedence
    if (this.isStreaming) {
      return await this.startCamera();
    }
    return this.facingMode;
  }

  /**
   * Change resolution preset ('auto', '4k', '1080p', '720p', '480p')
   */
  async setResolutionPreset(preset) {
    this.resolutionPreset = preset;
    if (this.isStreaming) {
      return await this.startCamera();
    }
  }

  /**
   * Toggle or set audio inclusion
   */
  async setIncludeAudio(include) {
    this.includeAudio = include;
    if (this.isStreaming) {
      return await this.startCamera();
    }
  }

  /**
   * Get metadata details of active camera stream
   */
  getStreamDetails() {
    if (!this.isStreaming || !this.video) {
      return {
        active: false,
        width: 0,
        height: 0,
        aspectRatio: '16:9',
        frameRate: 0,
        deviceName: 'None',
        facingMode: this.facingMode
      };
    }

    const settings = this.currentTrack ? this.currentTrack.getSettings() : {};
    const width = this.video.videoWidth || settings.width || 0;
    const height = this.video.videoHeight || settings.height || 0;
    const frameRate = Math.round(settings.frameRate || 30);
    const label = this.currentTrack ? this.currentTrack.label : 'Active Camera';

    let ratio = '16:9';
    if (width > 0 && height > 0) {
      const calc = (width / height).toFixed(2);
      if (calc === '1.78' || calc === '1.77') ratio = '16:9';
      else if (calc === '1.33') ratio = '4:3';
      else if (calc === '1.00') ratio = '1:1';
      else if (calc === '0.56') ratio = '9:16';
      else ratio = `${width}x${height}`;
    }

    return {
      active: true,
      width,
      height,
      aspectRatio: ratio,
      frameRate,
      deviceName: label,
      facingMode: settings.facingMode || this.facingMode,
      settings
    };
  }

  /**
   * Query track hardware zoom capability if supported by browser
   */
  getHardwareZoomCapabilities() {
    if (this.currentTrack && typeof this.currentTrack.getCapabilities === 'function') {
      const caps = this.currentTrack.getCapabilities();
      if (caps && caps.zoom) {
        return {
          supported: true,
          min: caps.zoom.min || 1,
          max: caps.zoom.max || 1,
          step: caps.zoom.step || 0.1
        };
      }
    }
    return { supported: false };
  }

  async applyHardwareZoom(zoomValue) {
    if (this.currentTrack && typeof this.currentTrack.applyConstraints === 'function') {
      try {
        await this.currentTrack.applyConstraints({
          advanced: [{ zoom: zoomValue }]
        });
        return true;
      } catch (e) {
        console.warn('Hardware zoom apply failed:', e);
      }
    }
    return false;
  }

  _handleError(err) {
    let message = 'Unable to access camera.';
    let troubleshooting = '';

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      message = 'Camera permission was denied.';
      troubleshooting = 'Please click the camera/lock icon in your browser address bar and grant camera access.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      message = 'No camera found on this device.';
      troubleshooting = 'Please make sure a webcam or camera device is connected and recognized by your system.';
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      message = 'Camera is already in use by another application.';
      troubleshooting = 'Please close any other apps using the camera (Zoom, Teams, Skype, OBS, etc.) and try again.';
    } else if (err.name === 'OverconstrainedError') {
      message = 'Camera does not support the requested resolution.';
      troubleshooting = 'Try switching to 720p or Auto resolution in camera controls.';
    } else if (err.name === 'SecurityError') {
      message = 'Camera access blocked due to security restrictions.';
      troubleshooting = 'Webcam access requires HTTPS or localhost in modern browsers.';
    }

    const enhancedError = {
      name: err.name,
      message,
      troubleshooting,
      original: err
    };

    if (this.onError) {
      this.onError(enhancedError);
    }
  }
}
