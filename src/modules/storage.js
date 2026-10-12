/**
 * IndexedDB and LocalStorage persistence layer for Media and Settings
 */

const DB_NAME = 'WebcamStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_items';

let dbInstance = null;

/**
 * Initializes and returns the IndexedDB instance
 */
export async function getDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

/**
 * Save a media item (photo or video) to IndexedDB
 * @param {Object} item - { id, type ('photo'|'video'), blob, dataUrl, name, mimeType, timestamp, width, height, duration, size }
 */
export async function saveMediaItem(item) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(item);

    request.onsuccess = () => resolve(item);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Retrieve all media items, sorted newest first
 */
export async function getAllMediaItems() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const items = request.result || [];
      items.sort((a, b) => b.timestamp - a.timestamp);
      resolve(items);
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Delete a media item by ID
 */
export async function deleteMediaItem(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Clear all media from IndexedDB
 */
export async function clearAllMedia() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Calculate estimated storage usage
 */
export async function getStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        formattedUsage: formatBytes(estimate.usage || 0),
        formattedQuota: formatBytes(estimate.quota || 0),
        percent: estimate.quota ? Math.round(((estimate.usage || 0) / estimate.quota) * 100) : 0
      };
    } catch (e) {
      console.warn('Storage estimate failed:', e);
    }
  }
  return {
    usage: 0,
    quota: 0,
    formattedUsage: '0 MB',
    formattedQuota: 'Unknown',
    percent: 0
  };
}

/**
 * Helper to format byte counts nicely
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* User Settings via LocalStorage */
const SETTINGS_KEY = 'webcam_studio_settings';

const DEFAULT_SETTINGS = {
  photoFormat: 'png', // 'png' | 'jpeg' | 'webp'
  photoQuality: 0.92,
  includeAudio: true,
  shutterSound: true,
  shutterVolume: 0.7,
  timerDelay: 0, // 0, 3, 5, 10
  mirrorMode: true,
  flipVertical: false,
  gridType: 'none', // 'none' | 'rule-of-thirds' | 'golden-ratio' | 'crosshair' | 'square'
  activeFilter: 'none',
  brightness: 100,
  contrast: 100,
  saturation: 100,
  zoom: 1.0,
  preferredResolution: '1080p', // 'auto' | '4k' | '1080p' | '720p' | '480p'
  burstCount: 3,
};

export function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export function resetSettings() {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (e) {}
  return { ...DEFAULT_SETTINGS };
}
