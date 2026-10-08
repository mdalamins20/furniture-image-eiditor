/**
 * Robust, production-grade persistent storage helper for Furniture Image Editor
 * Supports localStorage with quota overflow protection and IndexedDB for large assets (custom logos).
 */

export interface PersistedConfig {
  selectedShowroom: string;
  numberText: string;
  logoUrl: string | null;
  defaultLogoPos: { x: number; y: number };
  defaultNumberPos: { x: number; y: number };
  defaultWatermarkPos: { x: number; y: number };
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase';
  numberColor: string;
  numberBgColor: string;
  numberSize: number;
  letterSpacing: number;
  lineHeight: number;
  padX: number;
  padY: number;
  customRadius: number;
  numberStyle: 'solid' | 'transparent' | 'outline';
  numberOutlineThickness: number;
  numberOutlineBlur: number;
  logoSize: number;
  enableLogoShadow: boolean;
  logoShadowColor: string;
  logoShadowBlur: number;
  logoShadowIntensity: number;
  enableWatermark: boolean;
  watermarkText: string;
  watermarkStyle: 'diagonal' | 'grid' | 'horizontal' | 'custom';
  watermarkOpacity: number;
  watermarkSize: number;
  watermarkColor: string;
  watermarkFontFamily: string;
  watermarkFontWeight: 'normal' | 'bold';
  watermarkFontStyle: 'normal' | 'italic';
  watermarkTextDecoration: 'none' | 'underline' | 'line-through';
  watermarkTextTransform: 'none' | 'uppercase' | 'lowercase';
  watermarkLetterSpacing: number;
  watermarkCustomAngle: number;
  watermarkIsGrid: boolean;
  watermarkGridSpacing: number;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  downloadFormat: 'jpeg' | 'png' | 'webp';
}

export const DEFAULT_CONFIG: PersistedConfig = {
  selectedShowroom: '',
  numberText: '',
  logoUrl: null,
  defaultLogoPos: { x: 10, y: 10 },
  defaultNumberPos: { x: 50, y: 88 },
  defaultWatermarkPos: { x: 50, y: 50 },
  fontFamily: 'Montserrat',
  fontWeight: 'bold',
  fontStyle: 'normal',
  textDecoration: 'none',
  textTransform: 'none',
  numberColor: '#FFFFFF',
  numberBgColor: '#B45309',
  numberSize: 48,
  letterSpacing: 0,
  lineHeight: 1.2,
  padX: 25,
  padY: 15,
  customRadius: 12,
  numberStyle: 'solid',
  numberOutlineThickness: 5,
  numberOutlineBlur: 0,
  logoSize: 15,
  enableLogoShadow: false,
  logoShadowColor: '#FFFFFF',
  logoShadowBlur: 15,
  logoShadowIntensity: 1,
  enableWatermark: false,
  watermarkText: '',
  watermarkStyle: 'horizontal',
  watermarkOpacity: 15,
  watermarkSize: 48,
  watermarkColor: '#ffffff',
  watermarkFontFamily: 'Montserrat',
  watermarkFontWeight: 'bold',
  watermarkFontStyle: 'normal',
  watermarkTextDecoration: 'none',
  watermarkTextTransform: 'none',
  watermarkLetterSpacing: 0,
  watermarkCustomAngle: -30,
  watermarkIsGrid: false,
  watermarkGridSpacing: 200,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  downloadFormat: 'jpeg',
};

const STORAGE_KEY = 'furniture_studio_config_v2';
const IDB_LOGO_MARKER = 'idb://custom_logo';
const DB_NAME = 'furniture_editor_store';
const STORE_NAME = 'blobs';

// IndexedDB Helper for safe storage of large Base64 logos (bypasses 5MB localStorage limit)
function openIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveLargeAsset(key: string, data: string): Promise<boolean> {
  const db = await openIDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function getLargeAsset(key: string): Promise<string | null> {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Load persisted configuration synchronously from localStorage with fallback migration
 */
export function loadPersistedConfig(): PersistedConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_CONFIG };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
      };
    }

    // Fallback: migrate from legacy individual keys if present
    const migrated: Partial<PersistedConfig> = {};
    const legacyKeys: (keyof PersistedConfig)[] = [
      'selectedShowroom', 'numberText', 'logoUrl', 'fontFamily',
      'logoSize', 'enableLogoShadow', 'logoShadowColor', 'logoShadowBlur', 'logoShadowIntensity',
      'numberColor', 'numberBgColor', 'numberSize', 'letterSpacing', 'lineHeight',
      'fontWeight', 'fontStyle', 'textDecoration', 'textTransform', 'padX', 'padY',
      'customRadius', 'brightness', 'contrast', 'saturation', 'warmth', 'numberStyle',
      'numberOutlineThickness', 'numberOutlineBlur', 'enableWatermark', 'watermarkText',
      'watermarkStyle', 'watermarkOpacity', 'watermarkSize', 'watermarkColor',
      'watermarkFontFamily', 'watermarkFontWeight', 'watermarkFontStyle',
      'watermarkTextDecoration', 'watermarkTextTransform', 'watermarkLetterSpacing',
      'watermarkCustomAngle', 'watermarkIsGrid', 'watermarkGridSpacing'
    ];

    let foundLegacy = false;
    for (const k of legacyKeys) {
      const val = window.localStorage.getItem(`furniture_editor_${k}`);
      if (val !== null) {
        try {
          (migrated as any)[k] = JSON.parse(val);
          foundLegacy = true;
        } catch {
          // ignore parsing error
        }
      }
    }

    if (foundLegacy) {
      const merged = { ...DEFAULT_CONFIG, ...migrated };
      // Save into new format
      savePersistedConfig(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Error reading persisted config from localStorage:', err);
  }

  return { ...DEFAULT_CONFIG };
}

/**
 * Save configuration safely without crashing on quota limits
 */
export function savePersistedConfig(config: PersistedConfig): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const toSave: any = { ...config };

    // If logoUrl is a huge data URL (base64 > 50KB), offload to IndexedDB
    if (typeof toSave.logoUrl === 'string' && toSave.logoUrl.startsWith('data:') && toSave.logoUrl.length > 50000) {
      saveLargeAsset('custom_logo', toSave.logoUrl).catch(() => {});
      toSave.logoUrl = IDB_LOGO_MARKER;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (err: any) {
    console.warn('LocalStorage save error (attempting quota cleanup):', err);
    try {
      // Emergency quota recovery: purge obsolete legacy keys and retry
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('furniture_editor_') && key !== STORAGE_KEY) {
          window.localStorage.removeItem(key);
        }
      }
      const stripped = { ...config, logoUrl: null };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Resolve logoUrl if stored in IndexedDB
 */
export async function resolvePersistedLogoUrl(url: string | null): Promise<string | null> {
  if (url === IDB_LOGO_MARKER) {
    const idbData = await getLargeAsset('custom_logo');
    return idbData || null;
  }
  return url;
}
