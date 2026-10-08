import React, { createContext, useContext, useState, startTransition, useEffect, useRef, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { ImageSetting, EditorSnapshot } from '../types';
import { loadPersistedConfig, savePersistedConfig, resolvePersistedLogoUrl, DEFAULT_CONFIG, type PersistedConfig } from '../utils/storageHelper';


interface EditorContextType {
  mainImages: File[];
  setMainImages: React.Dispatch<React.SetStateAction<File[]>>;
  previewUrls: string[];
  setPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  imageSettings: ImageSetting[];
  setImageSettings: React.Dispatch<React.SetStateAction<ImageSetting[]>>;
  selectedShowroom: string;
  setSelectedShowroom: React.Dispatch<React.SetStateAction<string>>;
  logo: File | null;
  setLogo: React.Dispatch<React.SetStateAction<File | null>>;
  logoUrl: string | null;
  setLogoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  numberText: string;
  setNumberText: React.Dispatch<React.SetStateAction<string>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  previewIndex: number;
  setPreviewIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedIndices: Set<number>;
  setSelectedIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
  downloadFormat: 'jpeg' | 'png' | 'webp';
  setDownloadFormat: React.Dispatch<React.SetStateAction<'jpeg' | 'png' | 'webp'>>;
  activeTab: 'setup' | 'number' | 'logo' | 'watermark' | 'basic' | 'design';
  setActiveTab: React.Dispatch<React.SetStateAction<'setup' | 'number' | 'logo' | 'watermark' | 'basic' | 'design'>>;
  activeElement: 'logo' | 'number' | 'watermark' | null;
  setActiveElement: (elem: 'logo' | 'number' | 'watermark' | null) => void;
  isFontDropdownOpen: boolean;
  setIsFontDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fontFamily: string;
  setFontFamily: React.Dispatch<React.SetStateAction<string>>;
  logoSize: number;
  setLogoSize: React.Dispatch<React.SetStateAction<number>>;
  enableLogoShadow: boolean;
  setEnableLogoShadow: React.Dispatch<React.SetStateAction<boolean>>;
  logoShadowColor: string;
  setLogoShadowColor: React.Dispatch<React.SetStateAction<string>>;
  logoShadowBlur: number;
  setLogoShadowBlur: React.Dispatch<React.SetStateAction<number>>;
  logoShadowIntensity: number;
  setLogoShadowIntensity: React.Dispatch<React.SetStateAction<number>>;
  numberColor: string;
  setNumberColor: React.Dispatch<React.SetStateAction<string>>;
  numberBgColor: string;
  setNumberBgColor: React.Dispatch<React.SetStateAction<string>>;
  numberSize: number;
  setNumberSize: React.Dispatch<React.SetStateAction<number>>;
  letterSpacing: number;
  setLetterSpacing: React.Dispatch<React.SetStateAction<number>>;
  lineHeight: number;
  setLineHeight: React.Dispatch<React.SetStateAction<number>>;
  fontWeight: 'normal' | 'bold';
  setFontWeight: React.Dispatch<React.SetStateAction<'normal' | 'bold'>>;
  fontStyle: 'normal' | 'italic';
  setFontStyle: React.Dispatch<React.SetStateAction<'normal' | 'italic'>>;
  textDecoration: 'none' | 'underline' | 'line-through';
  setTextDecoration: React.Dispatch<React.SetStateAction<'none' | 'underline' | 'line-through'>>;
  textTransform: 'none' | 'uppercase' | 'lowercase';
  setTextTransform: React.Dispatch<React.SetStateAction<'none' | 'uppercase' | 'lowercase'>>;
  padX: number;
  setPadX: React.Dispatch<React.SetStateAction<number>>;
  padY: number;
  setPadY: React.Dispatch<React.SetStateAction<number>>;
  customRadius: number;
  setCustomRadius: React.Dispatch<React.SetStateAction<number>>;
  brightness: number;
  setBrightness: React.Dispatch<React.SetStateAction<number>>;
  contrast: number;
  setContrast: React.Dispatch<React.SetStateAction<number>>;
  saturation: number;
  setSaturation: React.Dispatch<React.SetStateAction<number>>;
  warmth: number;
  setWarmth: React.Dispatch<React.SetStateAction<number>>;
  numberStyle: 'solid' | 'transparent' | 'outline';
  setNumberStyle: React.Dispatch<React.SetStateAction<'solid' | 'transparent' | 'outline'>>;
  numberOutlineThickness: number;
  setNumberOutlineThickness: React.Dispatch<React.SetStateAction<number>>;
  numberOutlineBlur: number;
  setNumberOutlineBlur: React.Dispatch<React.SetStateAction<number>>;
  enableWatermark: boolean;
  setEnableWatermark: React.Dispatch<React.SetStateAction<boolean>>;
  watermarkText: string;
  setWatermarkText: React.Dispatch<React.SetStateAction<string>>;
  watermarkStyle: 'diagonal' | 'grid' | 'horizontal' | 'custom';
  setWatermarkStyle: React.Dispatch<React.SetStateAction<'diagonal' | 'grid' | 'horizontal' | 'custom'>>;
  watermarkOpacity: number;
  setWatermarkOpacity: React.Dispatch<React.SetStateAction<number>>;
  watermarkSize: number;
  setWatermarkSize: React.Dispatch<React.SetStateAction<number>>;
  watermarkColor: string;
  setWatermarkColor: React.Dispatch<React.SetStateAction<string>>;
  watermarkFontFamily: string;
  setWatermarkFontFamily: React.Dispatch<React.SetStateAction<string>>;
  watermarkFontWeight: 'normal' | 'bold';
  setWatermarkFontWeight: React.Dispatch<React.SetStateAction<'normal' | 'bold'>>;
  watermarkFontStyle: 'normal' | 'italic';
  setWatermarkFontStyle: React.Dispatch<React.SetStateAction<'normal' | 'italic'>>;
  watermarkTextDecoration: 'none' | 'underline' | 'line-through';
  setWatermarkTextDecoration: React.Dispatch<React.SetStateAction<'none' | 'underline' | 'line-through'>>;
  watermarkTextTransform: 'none' | 'uppercase' | 'lowercase';
  setWatermarkTextTransform: React.Dispatch<React.SetStateAction<'none' | 'uppercase' | 'lowercase'>>;
  watermarkLetterSpacing: number;
  setWatermarkLetterSpacing: React.Dispatch<React.SetStateAction<number>>;
  watermarkCustomAngle: number;
  setWatermarkCustomAngle: React.Dispatch<React.SetStateAction<number>>;
  watermarkIsGrid: boolean;
  setWatermarkIsGrid: React.Dispatch<React.SetStateAction<boolean>>;
  watermarkGridSpacing: number;
  setWatermarkGridSpacing: React.Dispatch<React.SetStateAction<number>>;
  defaultLogoPos: { x: number; y: number };
  setDefaultLogoPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  defaultNumberPos: { x: number; y: number };
  setDefaultNumberPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  defaultWatermarkPos: { x: number; y: number };
  setDefaultWatermarkPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isSavedToStorage: boolean;
  resetToDefaults: () => void;
  updateSetting: <K extends keyof ImageSetting>(key: K, value: ImageSetting[K], globalSetter?: Function) => void;
  updateSettingsBatch: (updates: Partial<ImageSetting>, globalSetters?: Record<string, (val: any) => void>) => void;
  removeImage: (indexToRemove: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  recordSnapshot: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial config from persistent storage
  const initialConfig = useMemo(() => loadPersistedConfig(), []);

  const [mainImages, setMainImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageSettings, setImageSettings] = useState<ImageSetting[]>([]);

  const [selectedShowroom, setSelectedShowroom] = useState<string>(initialConfig.selectedShowroom);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialConfig.logoUrl);
  const [numberText, setNumberText] = useState<string>(initialConfig.numberText);

  const [defaultLogoPos, setDefaultLogoPos] = useState<{ x: number; y: number }>(initialConfig.defaultLogoPos);
  const [defaultNumberPos, setDefaultNumberPos] = useState<{ x: number; y: number }>(initialConfig.defaultNumberPos);
  const [defaultWatermarkPos, setDefaultWatermarkPos] = useState<{ x: number; y: number }>(initialConfig.defaultWatermarkPos);

  const [isProcessing, setIsProcessing] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const [downloadFormat, setDownloadFormat] = useState<'jpeg' | 'png' | 'webp'>(initialConfig.downloadFormat);
  const [activeTab, setActiveTabState] = useState<'setup' | 'number' | 'logo' | 'watermark' | 'basic' | 'design'>('setup');
  const [activeElement, setActiveElementState] = useState<'logo' | 'number' | 'watermark' | null>(null);

  const setActiveElement = useCallback((elem: 'logo' | 'number' | 'watermark' | null) => {
    setActiveElementState(elem);
    if (elem === 'number') setActiveTabState('number');
    else if (elem === 'logo') setActiveTabState('logo');
    else if (elem === 'watermark') setActiveTabState('watermark');
    else setActiveTabState('setup');
  }, []);

  const setActiveTab = useCallback((tab: 'setup' | 'number' | 'logo' | 'watermark' | 'basic' | 'design' | ((prev: any) => any)) => {
    if (typeof tab === 'function') {
      setActiveTabState(prev => {
        const next = tab(prev);
        if (next === 'number') setActiveElementState('number');
        else if (next === 'logo') setActiveElementState('logo');
        else if (next === 'watermark') setActiveElementState('watermark');
        else if (next === 'setup' || next === 'basic' || next === 'design') setActiveElementState(null);
        return next;
      });
      return;
    }
    setActiveTabState(tab);
    if (tab === 'number') setActiveElementState('number');
    else if (tab === 'logo') setActiveElementState('logo');
    else if (tab === 'watermark') setActiveElementState('watermark');
    else if (tab === 'setup' || tab === 'basic' || tab === 'design') setActiveElementState(null);
  }, []);

  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  // Global Config States initialized from persistent storage
  const [fontFamily, setFontFamily] = useState(initialConfig.fontFamily);
  const [logoSize, setLogoSize] = useState(initialConfig.logoSize);
  const [enableLogoShadow, setEnableLogoShadow] = useState(initialConfig.enableLogoShadow);
  const [logoShadowColor, setLogoShadowColor] = useState(initialConfig.logoShadowColor);
  const [logoShadowBlur, setLogoShadowBlur] = useState(initialConfig.logoShadowBlur);
  const [logoShadowIntensity, setLogoShadowIntensity] = useState(initialConfig.logoShadowIntensity);
  const [numberColor, setNumberColor] = useState(initialConfig.numberColor);
  const [numberBgColor, setNumberBgColor] = useState(initialConfig.numberBgColor);
  const [numberSize, setNumberSize] = useState(initialConfig.numberSize);
  const [letterSpacing, setLetterSpacing] = useState(initialConfig.letterSpacing);
  const [lineHeight, setLineHeight] = useState(initialConfig.lineHeight);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>(initialConfig.fontWeight);
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>(initialConfig.fontStyle);
  const [textDecoration, setTextDecoration] = useState<'none' | 'underline' | 'line-through'>(initialConfig.textDecoration);
  const [textTransform, setTextTransform] = useState<'none' | 'uppercase' | 'lowercase'>(initialConfig.textTransform);
  const [padX, setPadX] = useState(initialConfig.padX);
  const [padY, setPadY] = useState(initialConfig.padY);
  const [customRadius, setCustomRadius] = useState(initialConfig.customRadius);
  const [brightness, setBrightness] = useState(initialConfig.brightness);
  const [contrast, setContrast] = useState(initialConfig.contrast);
  const [saturation, setSaturation] = useState(initialConfig.saturation);
  const [warmth, setWarmth] = useState(initialConfig.warmth);
  const [numberStyle, setNumberStyle] = useState<'solid' | 'transparent' | 'outline'>(initialConfig.numberStyle);
  const [numberOutlineThickness, setNumberOutlineThickness] = useState(initialConfig.numberOutlineThickness);
  const [numberOutlineBlur, setNumberOutlineBlur] = useState(initialConfig.numberOutlineBlur);

  const [enableWatermark, setEnableWatermark] = useState(initialConfig.enableWatermark);
  const [watermarkText, setWatermarkText] = useState(initialConfig.watermarkText);
  const [watermarkStyle, setWatermarkStyle] = useState<'diagonal' | 'grid' | 'horizontal' | 'custom'>(initialConfig.watermarkStyle);
  const [watermarkOpacity, setWatermarkOpacity] = useState(initialConfig.watermarkOpacity);
  const [watermarkSize, setWatermarkSize] = useState(initialConfig.watermarkSize);
  const [watermarkColor, setWatermarkColor] = useState(initialConfig.watermarkColor);
  const [watermarkFontFamily, setWatermarkFontFamily] = useState(initialConfig.watermarkFontFamily);
  const [watermarkFontWeight, setWatermarkFontWeight] = useState<'normal' | 'bold'>(initialConfig.watermarkFontWeight);
  const [watermarkFontStyle, setWatermarkFontStyle] = useState<'normal' | 'italic'>(initialConfig.watermarkFontStyle);
  const [watermarkTextDecoration, setWatermarkTextDecoration] = useState<'none' | 'underline' | 'line-through'>(initialConfig.watermarkTextDecoration);
  const [watermarkTextTransform, setWatermarkTextTransform] = useState<'none' | 'uppercase' | 'lowercase'>(initialConfig.watermarkTextTransform);
  const [watermarkLetterSpacing, setWatermarkLetterSpacing] = useState(initialConfig.watermarkLetterSpacing);
  const [watermarkCustomAngle, setWatermarkCustomAngle] = useState(initialConfig.watermarkCustomAngle);
  const [watermarkIsGrid, setWatermarkIsGrid] = useState(initialConfig.watermarkIsGrid);
  const [watermarkGridSpacing, setWatermarkGridSpacing] = useState(initialConfig.watermarkGridSpacing);

  const [isSavedToStorage, setIsSavedToStorage] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Asynchronously resolve large logo from IndexedDB if stored there
  useEffect(() => {
    if (initialConfig.logoUrl) {
      resolvePersistedLogoUrl(initialConfig.logoUrl).then(resolved => {
        if (resolved && resolved !== initialConfig.logoUrl) {
          setLogoUrl(resolved);
        }
      });
    }
  }, [initialConfig.logoUrl]);

  // Construct current config payload
  const buildCurrentConfig = useCallback((): PersistedConfig => ({
    selectedShowroom,
    numberText,
    logoUrl,
    defaultLogoPos,
    defaultNumberPos,
    defaultWatermarkPos,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    textTransform,
    numberColor,
    numberBgColor,
    numberSize,
    letterSpacing,
    lineHeight,
    padX,
    padY,
    customRadius,
    numberStyle,
    numberOutlineThickness,
    numberOutlineBlur,
    logoSize,
    enableLogoShadow,
    logoShadowColor,
    logoShadowBlur,
    logoShadowIntensity,
    enableWatermark,
    watermarkText,
    watermarkStyle,
    watermarkOpacity,
    watermarkSize,
    watermarkColor,
    watermarkFontFamily,
    watermarkFontWeight,
    watermarkFontStyle,
    watermarkTextDecoration,
    watermarkTextTransform,
    watermarkLetterSpacing,
    watermarkCustomAngle,
    watermarkIsGrid,
    watermarkGridSpacing,
    brightness,
    contrast,
    saturation,
    warmth,
    downloadFormat,
  }), [
    selectedShowroom, numberText, logoUrl, defaultLogoPos, defaultNumberPos, defaultWatermarkPos,
    fontFamily, fontWeight, fontStyle, textDecoration, textTransform,
    numberColor, numberBgColor, numberSize, letterSpacing, lineHeight,
    padX, padY, customRadius, numberStyle, numberOutlineThickness, numberOutlineBlur,
    logoSize, enableLogoShadow, logoShadowColor, logoShadowBlur, logoShadowIntensity,
    enableWatermark, watermarkText, watermarkStyle, watermarkOpacity, watermarkSize,
    watermarkColor, watermarkFontFamily, watermarkFontWeight, watermarkFontStyle,
    watermarkTextDecoration, watermarkTextTransform, watermarkLetterSpacing,
    watermarkCustomAngle, watermarkIsGrid, watermarkGridSpacing,
    brightness, contrast, saturation, warmth, downloadFormat
  ]);

  // Unified auto-save effect with debounce
  useEffect(() => {
    setIsSavedToStorage(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      savePersistedConfig(buildCurrentConfig());
      setIsSavedToStorage(true);
    }, 250);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [buildCurrentConfig]);

  // Synchronous flush on page exit/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      savePersistedConfig(buildCurrentConfig());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [buildCurrentConfig]);

  // Reset all settings to factory default
  const resetToDefaults = useCallback(() => {
    const d = DEFAULT_CONFIG;
    setSelectedShowroom(d.selectedShowroom);
    setLogoUrl(d.logoUrl);
    setNumberText(d.numberText);
    setDefaultLogoPos(d.defaultLogoPos);
    setDefaultNumberPos(d.defaultNumberPos);
    setDefaultWatermarkPos(d.defaultWatermarkPos);
    setFontFamily(d.fontFamily);
    setFontWeight(d.fontWeight);
    setFontStyle(d.fontStyle);
    setTextDecoration(d.textDecoration);
    setTextTransform(d.textTransform);
    setNumberColor(d.numberColor);
    setNumberBgColor(d.numberBgColor);
    setNumberSize(d.numberSize);
    setLetterSpacing(d.letterSpacing);
    setLineHeight(d.lineHeight);
    setPadX(d.padX);
    setPadY(d.padY);
    setCustomRadius(d.customRadius);
    setNumberStyle(d.numberStyle);
    setNumberOutlineThickness(d.numberOutlineThickness);
    setNumberOutlineBlur(d.numberOutlineBlur);
    setLogoSize(d.logoSize);
    setEnableLogoShadow(d.enableLogoShadow);
    setLogoShadowColor(d.logoShadowColor);
    setLogoShadowBlur(d.logoShadowBlur);
    setLogoShadowIntensity(d.logoShadowIntensity);
    setEnableWatermark(d.enableWatermark);
    setWatermarkText(d.watermarkText);
    setWatermarkStyle(d.watermarkStyle);
    setWatermarkOpacity(d.watermarkOpacity);
    setWatermarkSize(d.watermarkSize);
    setWatermarkColor(d.watermarkColor);
    setWatermarkFontFamily(d.watermarkFontFamily);
    setWatermarkFontWeight(d.watermarkFontWeight);
    setWatermarkFontStyle(d.watermarkFontStyle);
    setWatermarkTextDecoration(d.watermarkTextDecoration);
    setWatermarkTextTransform(d.watermarkTextTransform);
    setWatermarkLetterSpacing(d.watermarkLetterSpacing);
    setWatermarkCustomAngle(d.watermarkCustomAngle);
    setWatermarkIsGrid(d.watermarkIsGrid);
    setWatermarkGridSpacing(d.watermarkGridSpacing);
    setBrightness(d.brightness);
    setContrast(d.contrast);
    setSaturation(d.saturation);
    setWarmth(d.warmth);
    savePersistedConfig(d);
    setIsSavedToStorage(true);
  }, []);

  // History Manager (Undo / Redo)
  const pastRef = useRef<EditorSnapshot[]>([]);
  const futureRef = useRef<EditorSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isRestoringRef = useRef(false);
  const recordSnapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getCurrentSnapshot = useCallback((): EditorSnapshot => ({
    imageSettings: imageSettings.map(s => s ? { ...s, logoPos: { ...s.logoPos }, numberPos: { ...s.numberPos }, watermarkPos: { ...s.watermarkPos } } : s),
    globalState: {
      selectedShowroom,
      logoUrl,
      numberText,
      fontFamily,
      logoSize,
      enableLogoShadow,
      logoShadowColor,
      logoShadowBlur,
      logoShadowIntensity,
      numberColor,
      numberBgColor,
      numberSize,
      letterSpacing,
      lineHeight,
      fontWeight,
      fontStyle,
      textDecoration,
      textTransform,
      padX,
      padY,
      customRadius,
      brightness,
      contrast,
      saturation,
      warmth,
      numberStyle,
      numberOutlineThickness,
      numberOutlineBlur,
      enableWatermark,
      watermarkText,
      watermarkStyle,
      watermarkOpacity,
      watermarkSize,
      watermarkColor,
      watermarkFontFamily,
      watermarkFontWeight,
      watermarkFontStyle,
      watermarkTextDecoration,
      watermarkTextTransform,
      watermarkLetterSpacing,
      watermarkCustomAngle,
      watermarkIsGrid,
      watermarkGridSpacing,
    }
  }), [
    imageSettings, selectedShowroom, logoUrl, numberText, fontFamily, logoSize,
    enableLogoShadow, logoShadowColor, logoShadowBlur, logoShadowIntensity,
    numberColor, numberBgColor, numberSize, letterSpacing, lineHeight,
    fontWeight, fontStyle, textDecoration, textTransform, padX, padY,
    customRadius, brightness, contrast, saturation, warmth, numberStyle,
    numberOutlineThickness, numberOutlineBlur, enableWatermark, watermarkText,
    watermarkStyle, watermarkOpacity, watermarkSize, watermarkColor,
    watermarkFontFamily, watermarkFontWeight, watermarkFontStyle,
    watermarkTextDecoration, watermarkTextTransform, watermarkLetterSpacing,
    watermarkCustomAngle, watermarkIsGrid, watermarkGridSpacing
  ]);

  const getCurrentSnapshotRef = useRef(getCurrentSnapshot);
  useEffect(() => {
    getCurrentSnapshotRef.current = getCurrentSnapshot;
  }, [getCurrentSnapshot]);

  const cloneSnapshot = (snap: EditorSnapshot): EditorSnapshot => ({
    imageSettings: snap.imageSettings.map(s => s ? { ...s, logoPos: { ...s.logoPos }, numberPos: { ...s.numberPos }, watermarkPos: { ...s.watermarkPos } } : s),
    globalState: { ...snap.globalState }
  });

  const recordSnapshot = useCallback(() => {
    if (isRestoringRef.current) return;
    const snap = cloneSnapshot(getCurrentSnapshotRef.current());
    pastRef.current = [...pastRef.current.slice(-29), snap];
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const restoreSnapshot = useCallback((snapshot: EditorSnapshot) => {
    setImageSettings(snapshot.imageSettings);
    const g = snapshot.globalState;
    setSelectedShowroom(g.selectedShowroom);
    setLogoUrl(g.logoUrl);
    setNumberText(g.numberText);
    setFontFamily(g.fontFamily);
    setLogoSize(g.logoSize);
    setEnableLogoShadow(g.enableLogoShadow);
    setLogoShadowColor(g.logoShadowColor);
    setLogoShadowBlur(g.logoShadowBlur);
    setLogoShadowIntensity(g.logoShadowIntensity);
    setNumberColor(g.numberColor);
    setNumberBgColor(g.numberBgColor);
    setNumberSize(g.numberSize);
    setLetterSpacing(g.letterSpacing);
    setLineHeight(g.lineHeight);
    setFontWeight(g.fontWeight);
    setFontStyle(g.fontStyle);
    setTextDecoration(g.textDecoration);
    setTextTransform(g.textTransform);
    setPadX(g.padX);
    setPadY(g.padY);
    setCustomRadius(g.customRadius);
    setBrightness(g.brightness);
    setContrast(g.contrast);
    setSaturation(g.saturation);
    setWarmth(g.warmth);
    setNumberStyle(g.numberStyle);
    setNumberOutlineThickness(g.numberOutlineThickness);
    setNumberOutlineBlur(g.numberOutlineBlur);
    setEnableWatermark(g.enableWatermark);
    setWatermarkText(g.watermarkText);
    setWatermarkStyle(g.watermarkStyle);
    setWatermarkOpacity(g.watermarkOpacity);
    setWatermarkSize(g.watermarkSize);
    setWatermarkColor(g.watermarkColor);
    setWatermarkFontFamily(g.watermarkFontFamily);
    setWatermarkFontWeight(g.watermarkFontWeight);
    setWatermarkFontStyle(g.watermarkFontStyle);
    setWatermarkTextDecoration(g.watermarkTextDecoration);
    setWatermarkTextTransform(g.watermarkTextTransform);
    setWatermarkLetterSpacing(g.watermarkLetterSpacing);
    setWatermarkCustomAngle(g.watermarkCustomAngle);
    setWatermarkIsGrid(g.watermarkIsGrid);
    setWatermarkGridSpacing(g.watermarkGridSpacing);
  }, [
    setSelectedShowroom, setLogoUrl, setNumberText, setFontFamily, setLogoSize,
    setEnableLogoShadow, setLogoShadowColor, setLogoShadowBlur, setLogoShadowIntensity,
    setNumberColor, setNumberBgColor, setNumberSize, setLetterSpacing, setLineHeight,
    setFontWeight, setFontStyle, setTextDecoration, setTextTransform, setPadX, setPadY,
    setCustomRadius, setBrightness, setContrast, setSaturation, setWarmth, setNumberStyle,
    setNumberOutlineThickness, setNumberOutlineBlur, setEnableWatermark, setWatermarkText,
    setWatermarkStyle, setWatermarkOpacity, setWatermarkSize, setWatermarkColor,
    setWatermarkFontFamily, setWatermarkFontWeight, setWatermarkFontStyle,
    setWatermarkTextDecoration, setWatermarkTextTransform, setWatermarkLetterSpacing,
    setWatermarkCustomAngle, setWatermarkIsGrid, setWatermarkGridSpacing
  ]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const currentSnap = cloneSnapshot(getCurrentSnapshotRef.current());
    const previousSnap = pastRef.current.pop()!;
    futureRef.current.push(currentSnap);

    isRestoringRef.current = true;
    restoreSnapshot(previousSnap);
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 100);

    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);
  }, [restoreSnapshot]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const currentSnap = cloneSnapshot(getCurrentSnapshotRef.current());
    const nextSnap = futureRef.current.pop()!;
    pastRef.current.push(currentSnap);

    isRestoringRef.current = true;
    restoreSnapshot(nextSnap);
    setTimeout(() => {
      isRestoringRef.current = false;
    }, 100);

    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, [restoreSnapshot]);

  // Global Keyboard Shortcuts (Ctrl+Z and Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTextInput = target && (
        (target.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'color', 'button'].includes((target as HTMLInputElement).type)) ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if (isTextInput) return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo, redo]);

  // Synchronize individual setting keys to global defaults
  const syncGlobalState = useCallback((key: keyof ImageSetting, value: any) => {
    switch (key) {
      case 'logoPos':
        setDefaultLogoPos(value);
        break;
      case 'numberPos':
        setDefaultNumberPos(value);
        break;
      case 'watermarkPos':
        setDefaultWatermarkPos(value);
        break;
      case 'numberText':
        setNumberText(value);
        break;
      case 'logoUrl':
        setLogoUrl(value);
        break;
      case 'fontFamily':
        setFontFamily(value);
        break;
      case 'logoSize':
        setLogoSize(value);
        break;
      case 'enableLogoShadow':
        setEnableLogoShadow(value);
        break;
      case 'logoShadowColor':
        setLogoShadowColor(value);
        break;
      case 'logoShadowBlur':
        setLogoShadowBlur(value);
        break;
      case 'logoShadowIntensity':
        setLogoShadowIntensity(value);
        break;
      case 'numberColor':
        setNumberColor(value);
        break;
      case 'numberBgColor':
        setNumberBgColor(value);
        break;
      case 'numberSize':
        setNumberSize(value);
        break;
      case 'letterSpacing':
        setLetterSpacing(value);
        break;
      case 'lineHeight':
        setLineHeight(value);
        break;
      case 'fontWeight':
        setFontWeight(value);
        break;
      case 'fontStyle':
        setFontStyle(value);
        break;
      case 'textDecoration':
        setTextDecoration(value);
        break;
      case 'textTransform':
        setTextTransform(value);
        break;
      case 'padX':
        setPadX(value);
        break;
      case 'padY':
        setPadY(value);
        break;
      case 'customRadius':
        setCustomRadius(value);
        break;
      case 'numberStyle':
        setNumberStyle(value);
        break;
      case 'numberOutlineThickness':
        setNumberOutlineThickness(value);
        break;
      case 'numberOutlineBlur':
        setNumberOutlineBlur(value);
        break;
      case 'brightness':
        setBrightness(value);
        break;
      case 'contrast':
        setContrast(value);
        break;
      case 'saturation':
        setSaturation(value);
        break;
      case 'warmth':
        setWarmth(value);
        break;
      case 'enableWatermark':
        setEnableWatermark(value);
        break;
      case 'watermarkText':
        setWatermarkText(value);
        break;
      case 'watermarkStyle':
        setWatermarkStyle(value);
        break;
      case 'watermarkOpacity':
        setWatermarkOpacity(value);
        break;
      case 'watermarkSize':
        setWatermarkSize(value);
        break;
      case 'watermarkColor':
        setWatermarkColor(value);
        break;
      case 'watermarkFontFamily':
        setWatermarkFontFamily(value);
        break;
      case 'watermarkFontWeight':
        setWatermarkFontWeight(value);
        break;
      case 'watermarkFontStyle':
        setWatermarkFontStyle(value);
        break;
      case 'watermarkTextDecoration':
        setWatermarkTextDecoration(value);
        break;
      case 'watermarkTextTransform':
        setWatermarkTextTransform(value);
        break;
      case 'watermarkLetterSpacing':
        setWatermarkLetterSpacing(value);
        break;
      case 'watermarkCustomAngle':
        setWatermarkCustomAngle(value);
        break;
      case 'watermarkIsGrid':
        setWatermarkIsGrid(value);
        break;
      case 'watermarkGridSpacing':
        setWatermarkGridSpacing(value);
        break;
    }
  }, []);

  // Core logic to handle multi-select batch updating with zero input lag
  const updateSetting = <K extends keyof ImageSetting>(key: K, value: ImageSetting[K], globalSetter?: Function) => {
    if (!isRestoringRef.current) {
      if (!recordSnapshotTimerRef.current) {
        const snap = cloneSnapshot(getCurrentSnapshotRef.current());
        pastRef.current = [...pastRef.current.slice(-29), snap];
        futureRef.current = [];
        setCanUndo(true);
        setCanRedo(false);
      }
      if (recordSnapshotTimerRef.current) clearTimeout(recordSnapshotTimerRef.current);
      recordSnapshotTimerRef.current = setTimeout(() => {
        recordSnapshotTimerRef.current = null;
      }, 600);
    }
    if (globalSetter) {
      globalSetter(value);
    }
    // Synchronize to global default state so user preferences are always persisted
    syncGlobalState(key, value);

    setImageSettings(prev => {
      const newSettings = [...prev];
      if (selectedIndices.size > 0) {
        selectedIndices.forEach(idx => {
          newSettings[idx] = { ...(newSettings[idx] || {}), [key]: value } as any;
        });
      } else if (previewIndex >= 0 && previewIndex < newSettings.length) {
        newSettings[previewIndex] = { ...(newSettings[previewIndex] || {}), [key]: value } as any;
      }
      return newSettings;
    });
  };

  const updateSettingsBatch = (updates: Partial<ImageSetting>, globalSetters?: Record<string, (val: any) => void>) => {
    if (!isRestoringRef.current) {
      const snap = cloneSnapshot(getCurrentSnapshotRef.current());
      pastRef.current = [...pastRef.current.slice(-29), snap];
      futureRef.current = [];
      setCanUndo(true);
      setCanRedo(false);
    }

    if (globalSetters) {
      Object.entries(globalSetters).forEach(([k, setter]) => {
        if (k in updates && typeof setter === 'function') {
          setter((updates as any)[k]);
        }
      });
    }

    // Sync all batch keys to global state
    Object.entries(updates).forEach(([k, val]) => {
      syncGlobalState(k as keyof ImageSetting, val);
    });

    setImageSettings(prev => {
      const newSettings = [...prev];
      if (selectedIndices.size > 0) {
        selectedIndices.forEach(idx => {
          newSettings[idx] = { ...(newSettings[idx] || {}), ...updates } as any;
        });
      } else if (previewIndex >= 0 && previewIndex < newSettings.length) {
        newSettings[previewIndex] = { ...(newSettings[previewIndex] || {}), ...updates } as any;
      }
      return newSettings;
    });
  };

  const removeImage = (indexToRemove: number) => {
    startTransition(() => {
      // Release memory for the preview URL
      const urlToRevoke = previewUrls[indexToRemove];
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);

      setMainImages(prev => prev.filter((_, i) => i !== indexToRemove));
      setPreviewUrls(prev => prev.filter((_, i) => i !== indexToRemove));
      setImageSettings(prev => prev.filter((_, i) => i !== indexToRemove));

      setSelectedIndices(prev => {
        const newSet = new Set<number>();
        prev.forEach(idx => {
          if (idx < indexToRemove) newSet.add(idx);
          if (idx > indexToRemove) newSet.add(idx - 1);
        });
        if (newSet.size === 0 && mainImages.length > 1) {
          // If we deleted the only selected image, select the closest one
          const nextIdx = Math.min(indexToRemove, mainImages.length - 2);
          if (nextIdx >= 0) newSet.add(nextIdx);
        }
        return newSet;
      });

      setPreviewIndex(prev => {
        if (prev === indexToRemove) {
          return Math.min(indexToRemove, mainImages.length - 2) >= 0 ? Math.min(indexToRemove, mainImages.length - 2) : 0;
        }
        if (prev > indexToRemove) {
          return prev - 1;
        }
        return prev;
      });
    });
  };

  return (
    <EditorContext.Provider value={{
      mainImages, setMainImages,
      previewUrls, setPreviewUrls,
      imageSettings, setImageSettings,
      selectedShowroom, setSelectedShowroom,
      logo, setLogo,
      logoUrl, setLogoUrl,
      numberText, setNumberText,
      isProcessing, setIsProcessing,
      previewIndex, setPreviewIndex,
      selectedIndices, setSelectedIndices,
      downloadFormat, setDownloadFormat,
      activeTab, setActiveTab,
      activeElement, setActiveElement,
      isFontDropdownOpen, setIsFontDropdownOpen,
      fontFamily, setFontFamily,
      logoSize, setLogoSize,
      enableLogoShadow, setEnableLogoShadow,
      logoShadowColor, setLogoShadowColor,
      logoShadowBlur, setLogoShadowBlur,
      logoShadowIntensity, setLogoShadowIntensity,
      numberColor, setNumberColor,
      numberBgColor, setNumberBgColor,
      numberSize, setNumberSize,
      letterSpacing, setLetterSpacing,
      lineHeight, setLineHeight,
      fontWeight, setFontWeight,
      fontStyle, setFontStyle,
      textDecoration, setTextDecoration,
      textTransform, setTextTransform,
      padX, setPadX,
      padY, setPadY,
      customRadius, setCustomRadius,
      brightness, setBrightness,
      contrast, setContrast,
      saturation, setSaturation,
      warmth, setWarmth,
      numberStyle, setNumberStyle,
      numberOutlineThickness, setNumberOutlineThickness,
      numberOutlineBlur, setNumberOutlineBlur,
      enableWatermark, setEnableWatermark,
      watermarkText, setWatermarkText,
      watermarkStyle, setWatermarkStyle,
      watermarkOpacity, setWatermarkOpacity,
      watermarkSize, setWatermarkSize,
      watermarkColor, setWatermarkColor,
      watermarkFontFamily, setWatermarkFontFamily,
      watermarkFontWeight, setWatermarkFontWeight,
      watermarkFontStyle, setWatermarkFontStyle,
      watermarkTextDecoration, setWatermarkTextDecoration,
      watermarkTextTransform, setWatermarkTextTransform,
      watermarkLetterSpacing, setWatermarkLetterSpacing,
      watermarkCustomAngle, setWatermarkCustomAngle,
      watermarkIsGrid, setWatermarkIsGrid,
      watermarkGridSpacing, setWatermarkGridSpacing,
      defaultLogoPos, setDefaultLogoPos,
      defaultNumberPos, setDefaultNumberPos,
      defaultWatermarkPos, setDefaultWatermarkPos,
      isSavedToStorage,
      resetToDefaults,
      updateSetting,
      updateSettingsBatch,
      removeImage,
      canUndo,
      canRedo,
      undo,
      redo,
      recordSnapshot
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};
