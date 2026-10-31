import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import JSZip from 'jszip';
import { SHOWROOMS, type ShowroomItem } from '../../types';
import { subscribeShowrooms, loadShowrooms } from '../../services/showroomService';
import { ShowroomManagerModal } from '../../components/Showroom/ShowroomManagerModal';
import type { 
  AdImageItem, AdImageSettings, CardTheme, SidebarTab, PriceBadgeStyle, SelectedElement, 
  BoundingBox, BoostSnapshot, BadgeDisplayStyle 
} from './types/boostTypes';
import { 
  extractNumericPrice, calculateAutoCutPrice, formatBdNumber, 
  parsePriceFromFilename, generateModelNumber, normalizeDigitsToEnglish 
} from './utils/priceCalculators';
import { renderAdCanvas, clearImageCache, getCachedImage } from './utils/canvasDrawEngine';
import BoostHeader from './components/BoostHeader';
import BoostCanvas from './components/BoostCanvas';
import BoostSidebar from './components/sidebar/BoostSidebar';
import BoostGallery from './components/BoostGallery';
import BoostShortcutsModal from './components/BoostShortcutsModal';
import ImageProcessingOverlay from '../../components/Common/ImageProcessingOverlay';
import { useAuth } from '../../context/AuthContext';

export default function BoostAdsModule() {
  const { user } = useAuth();
  // --- Active Sidebar Tab ---
  const [activeTab, setActiveTab] = useState<SidebarTab>('showroom');

  // --- Bulk Images State ---
  const [images, setImages] = useState<AdImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [startModelInput, setStartModelInput] = useState<string>('B-100');
  
  // --- Gallery Multi-Select State (All Select / Ctrl+Click) ---
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  // --- Showroom & Contact State ---
  const [showrooms, setShowrooms] = useState<ShowroomItem[]>(SHOWROOMS);
  const [selectedShowroomName, setSelectedShowroomName] = useState<string>(SHOWROOMS[0]?.name || '');
  const [isShowroomManagerOpen, setIsShowroomManagerOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeShowrooms(user?.uid || null, (updated) => {
      setShowrooms(updated);
      if (updated.length > 0 && !selectedShowroomName) {
        setSelectedShowroomName(updated[0].name);
      }
    });
    return () => unsub();
  }, [user?.uid, selectedShowroomName]);

  // --- Free Drag & Move Coordinates (Percentage 0-100%) ---
  const [cardPos, setCardPos] = useState<{ x: number; y: number }>({ x: 80, y: 82 });
  const [logoPos, setLogoPos] = useState<{ x: number; y: number }>({ x: 12, y: 12 });
  const [pricePos, setPricePos] = useState<{ x: number; y: number }>({ x: 25, y: 75 });
  const [selectedElement, setSelectedElement] = useState<SelectedElement>('card');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [canvasCursor, setCanvasCursor] = useState<'default' | 'grab' | 'grabbing'>('default');

  // Sync active sidebar tab and selected element (Just like Daily Post Editor)
  const handleTabChange = useCallback((tab: SidebarTab) => {
    setActiveTab(tab);
    if (tab === 'card') setSelectedElement('card');
    else if (tab === 'logo') setSelectedElement('logo');
  }, []);

  const handleSelectElement = useCallback((elem: SelectedElement) => {
    setSelectedElement(elem);
    if (elem === 'card' || elem === 'price') setActiveTab('card');
    else if (elem === 'logo') setActiveTab('logo');
  }, []);

  // --- Individual Element Colors (Independent Customization) ---
  const [customTitleColor, setCustomTitleColor] = useState<string>('');
  const [customMLabelColor, setCustomMLabelColor] = useState<string>('');
  const [customMValueColor, setCustomMValueColor] = useState<string>('');
  const [customPLabelColor, setCustomPLabelColor] = useState<string>('');
  const [customCutPriceColor, setCustomCutPriceColor] = useState<string>('#EF4444');
  const [customActualPriceColor, setCustomActualPriceColor] = useState<string>('');
  const [customPhoneColor, setCustomPhoneColor] = useState<string>('');
  const [actualPriceScale, setActualPriceScale] = useState<number>(1.38);

  const handleResetElementColors = useCallback(() => {
    setCustomTitleColor('');
    setCustomMLabelColor('');
    setCustomMValueColor('');
    setCustomPLabelColor('');
    setCustomCutPriceColor('#EF4444');
    setCustomActualPriceColor('');
    setCustomPhoneColor('');
  }, []);

  // --- Card Styling & Badge Display Controls ---
  const [cardTheme, setCardTheme] = useState<CardTheme>('minimal-transparent');
  const [badgeDisplayStyle, setBadgeDisplayStyle] = useState<BadgeDisplayStyle>('solid');
  const [customBgColor, setCustomBgColor] = useState<string>('#18181B');
  const [customTextColor, setCustomTextColor] = useState<string>('#FFFFFF');
  const [outlineThickness, setOutlineThickness] = useState<number>(2);
  const [minimalTextColor, setMinimalTextColor] = useState<'dark' | 'light'>('dark');
  const [cardScale, setCardScale] = useState<number>(1);
  const [cardOpacity, setCardOpacity] = useState<number>(95);
  const [fontFamily, setFontFamily] = useState<string>('"Hind Siliguri", sans-serif');
  const [showShowroomName, setShowShowroomName] = useState<boolean>(true);
  const [cardMargin, setCardMargin] = useState<number>(36);

  // --- Typography Formatting Controls ---
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textDecoration, setTextDecoration] = useState<'none' | 'underline' | 'line-through'>('none');
  const [textTransform, setTextTransform] = useState<'none' | 'uppercase' | 'lowercase'>('none');
  const [lineHeight, setLineHeight] = useState<number>(1.2);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);

  // --- Padding & Radius Controls ---
  const [customRadius, setCustomRadius] = useState<number>(18);
  const [customPadX, setCustomPadX] = useState<number>(28);
  const [customPadY, setCustomPadY] = useState<number>(24);

  // --- Price Tier Customization State ---
  const [customLowMarkup, setCustomLowMarkup] = useState<number>(10000);
  const [customMidMarkup, setCustomMidMarkup] = useState<number>(12500);
  const [customHighMarkup, setCustomHighMarkup] = useState<number>(16000);
  const [showCutPrice, setShowCutPrice] = useState<boolean>(true);
  const [showMainPriceInCard, setShowMainPriceInCard] = useState<boolean>(true);

  // --- Separate Standalone Main Price Element State ---
  const [enableSeparatePrice, setEnableSeparatePrice] = useState<boolean>(false);
  const [priceScale, setPriceScale] = useState<number>(1.2);
  const [priceBadgeStyle, setPriceBadgeStyle] = useState<PriceBadgeStyle>('pill');

  // --- Logo Controls & Shadow State ---
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [logoSize, setLogoSize] = useState<number>(120);
  const [enableLogoShadow, setEnableLogoShadow] = useState<boolean>(true);
  const [logoShadowColor, setLogoShadowColor] = useState<string>('#000000');
  const [logoShadowBlur, setLogoShadowBlur] = useState<number>(16);
  const [logoShadowOffsetY, setLogoShadowOffsetY] = useState<number>(4);

  // --- Zoom & Pan State ---
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const lastPanPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // --- UI Modals & Processing ---
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStepText, setUploadStepText] = useState<string>('');
  const [uploadTotal, setUploadTotal] = useState<number>(0);
  const [uploadProcessed, setUploadProcessed] = useState<number>(0);
  const [uploadRemaining, setUploadRemaining] = useState<number>(0);
  const [uploadEstimatedSec, setUploadEstimatedSec] = useState<number>(0);
  const [uploadCurrentFileName, setUploadCurrentFileName] = useState<string>('');
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // --- Undo / Redo History Stack ---
  const pastRef = useRef<BoostSnapshot[]>([]);
  const futureRef = useRef<BoostSnapshot[]>([]);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);
  const cardBoxRef = useRef<BoundingBox | null>(null);
  const logoBoxRef = useRef<BoundingBox | null>(null);
  const priceBoxRef = useRef<BoundingBox | null>(null);
  const dragTargetRef = useRef<SelectedElement | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const imagesRef = useRef<AdImageItem[]>(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Clean up all allocated Object URLs and memory caches on unmount
  useEffect(() => {
    return () => {
      imagesRef.current.forEach(item => {
        if (item.url && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
          clearImageCache(item.url);
        }
      });
      clearImageCache();
    };
  }, []);

  // Per-showroom custom phone numbers mapping (persist user custom edits)
  const [customNumbersMap, setCustomNumbersMap] = useState<Record<string, string>>({});

  // Current active showroom object with customized numbers
  const activeShowroom = useMemo((): ShowroomItem => {
    const base = showrooms.find(s => s.name === selectedShowroomName) || showrooms[0];
    if (!base) {
      return {
        id: 'default',
        name: selectedShowroomName || '',
        numbers: customNumbersMap[selectedShowroomName] || ''
      };
    }
    const customNum = customNumbersMap[selectedShowroomName];
    return {
      ...base,
      numbers: customNum !== undefined ? customNum : base.numbers
    };
  }, [showrooms, selectedShowroomName, customNumbersMap]);

  const handleShowroomNumbersChange = useCallback((newNumbers: string) => {
    setCustomNumbersMap(prev => ({
      ...prev,
      [selectedShowroomName]: newNumbers
    }));
  }, [selectedShowroomName]);

  // Current active image item
  const activeImage = images[currentIndex] || null;

  // Synchronize sidebar form values with a specific image's settings
  const syncSidebarToImage = useCallback((targetImage: AdImageItem) => {
    const s = targetImage.settings || {};
    const effectiveCard = targetImage.cardPos || s.cardPos;
    const effectiveLogo = targetImage.logoPos || s.logoPos;
    const effectivePrice = targetImage.pricePos || s.pricePos;

    if (effectiveCard) setCardPos({ ...effectiveCard });
    if (effectiveLogo) setLogoPos({ ...effectiveLogo });
    if (effectivePrice) setPricePos({ ...effectivePrice });

    if (s.cardTheme !== undefined) setCardTheme(s.cardTheme);
    if (s.badgeDisplayStyle !== undefined) setBadgeDisplayStyle(s.badgeDisplayStyle);
    if (s.customBgColor !== undefined) setCustomBgColor(s.customBgColor);
    if (s.customTextColor !== undefined) setCustomTextColor(s.customTextColor);
    if (s.outlineThickness !== undefined) setOutlineThickness(s.outlineThickness);
    if (s.minimalTextColor !== undefined) setMinimalTextColor(s.minimalTextColor);
    if (s.cardScale !== undefined) setCardScale(s.cardScale);
    if (s.cardOpacity !== undefined) setCardOpacity(s.cardOpacity);
    if (s.fontFamily !== undefined) setFontFamily(s.fontFamily);
    if (s.showShowroomName !== undefined) setShowShowroomName(s.showShowroomName);
    if (s.fontWeight !== undefined) setFontWeight(s.fontWeight);
    if (s.fontStyle !== undefined) setFontStyle(s.fontStyle);
    if (s.textDecoration !== undefined) setTextDecoration(s.textDecoration);
    if (s.textTransform !== undefined) setTextTransform(s.textTransform);
    if (s.lineHeight !== undefined) setLineHeight(s.lineHeight);
    if (s.letterSpacing !== undefined) setLetterSpacing(s.letterSpacing);
    if (s.customRadius !== undefined) setCustomRadius(s.customRadius);
    if (s.customPadX !== undefined) setCustomPadX(s.customPadX);
    if (s.customPadY !== undefined) setCustomPadY(s.customPadY);
    if (s.customTitleColor !== undefined) setCustomTitleColor(s.customTitleColor);
    if (s.customMLabelColor !== undefined) setCustomMLabelColor(s.customMLabelColor);
    if (s.customMValueColor !== undefined) setCustomMValueColor(s.customMValueColor);
    if (s.customPLabelColor !== undefined) setCustomPLabelColor(s.customPLabelColor);
    if (s.customCutPriceColor !== undefined) setCustomCutPriceColor(s.customCutPriceColor);
    if (s.customActualPriceColor !== undefined) setCustomActualPriceColor(s.customActualPriceColor);
    if (s.customPhoneColor !== undefined) setCustomPhoneColor(s.customPhoneColor);
    if (s.actualPriceScale !== undefined) setActualPriceScale(s.actualPriceScale);
    if (s.showLogo !== undefined) setShowLogo(s.showLogo);
    if (s.logoSize !== undefined) setLogoSize(s.logoSize);
    if (s.enableLogoShadow !== undefined) setEnableLogoShadow(s.enableLogoShadow);
    if (s.logoShadowColor !== undefined) setLogoShadowColor(s.logoShadowColor);
    if (s.logoShadowBlur !== undefined) setLogoShadowBlur(s.logoShadowBlur);
    if (s.logoShadowOffsetY !== undefined) setLogoShadowOffsetY(s.logoShadowOffsetY);
    if (s.showCutPrice !== undefined) setShowCutPrice(s.showCutPrice);
    if (s.showMainPriceInCard !== undefined) setShowMainPriceInCard(s.showMainPriceInCard);
    if (s.enableSeparatePrice !== undefined) setEnableSeparatePrice(s.enableSeparatePrice);
    if (s.priceScale !== undefined) setPriceScale(s.priceScale);
    if (s.priceBadgeStyle !== undefined) setPriceBadgeStyle(s.priceBadgeStyle);
    if (s.selectedShowroomName !== undefined) setSelectedShowroomName(s.selectedShowroomName);
  }, []);

  // -------------------------------------------------------------
  // UNDO / REDO HISTORY ENGINE
  // -------------------------------------------------------------
  const takeSnapshot = useCallback((): BoostSnapshot => ({
    cardPos: { ...cardPos },
    logoPos: { ...logoPos },
    pricePos: { ...pricePos },
    images: images.map(img => ({
      ...img,
      cardPos: img.cardPos ? { ...img.cardPos } : undefined,
      logoPos: img.logoPos ? { ...img.logoPos } : undefined,
      pricePos: img.pricePos ? { ...img.pricePos } : undefined,
      settings: img.settings ? { ...img.settings } : undefined,
    })),
    selectedImageIds: [...selectedImageIds],
    cardScale,
    logoSize,
    priceScale,
    cardOpacity,
    cardTheme,
    cardMargin,
    showLogo,
    showShowroomName,
    selectedShowroomName,
    fontFamily,
    enableSeparatePrice,
    showMainPriceInCard,
    showCutPrice,
    customLowMarkup,
    customMidMarkup,
    customHighMarkup,
    minimalTextColor,
    priceBadgeStyle,
    badgeDisplayStyle,
    customBgColor,
    customTextColor,
    outlineThickness,
    fontWeight,
    fontStyle,
    textDecoration,
    textTransform,
    lineHeight,
    letterSpacing,
    customRadius,
    customPadX,
    customPadY,
    customTitleColor,
    customMLabelColor,
    customMValueColor,
    customPLabelColor,
    customCutPriceColor,
    customActualPriceColor,
    customPhoneColor,
    actualPriceScale,
    enableLogoShadow,
    logoShadowColor,
    logoShadowBlur,
    logoShadowOffsetY,
  }), [
    cardPos, logoPos, pricePos, cardScale, logoSize, priceScale, cardOpacity,
    cardTheme, cardMargin, showLogo, showShowroomName,
    selectedShowroomName, fontFamily, enableSeparatePrice,
    showMainPriceInCard, showCutPrice, customLowMarkup, customMidMarkup,
    customHighMarkup, minimalTextColor, priceBadgeStyle,
    badgeDisplayStyle, customBgColor, customTextColor, outlineThickness,
    fontWeight, fontStyle, textDecoration, textTransform,
    lineHeight, letterSpacing, customRadius, customPadX, customPadY,
    customTitleColor, customMLabelColor, customMValueColor, customPLabelColor,
    customCutPriceColor, customActualPriceColor, customPhoneColor,
    actualPriceScale, enableLogoShadow, logoShadowColor, logoShadowBlur, logoShadowOffsetY,
    images, selectedImageIds
  ]);

  const recordSnapshot = useCallback(() => {
    const snap = takeSnapshot();
    pastRef.current.push(snap);
    if (pastRef.current.length > 40) pastRef.current.shift();
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [takeSnapshot]);

  // Apply current active card position to ALL images in gallery
  const handleApplyCardPosToAll = useCallback(() => {
    if (images.length === 0) return;
    recordSnapshot();
    const posToApply = activeImage?.cardPos || activeImage?.settings?.cardPos || cardPos;
    setImages(prev => prev.map(img => ({
      ...img,
      cardPos: { ...posToApply },
      settings: {
        ...(img.settings || {}),
        cardPos: { ...posToApply }
      }
    })));
  }, [images.length, activeImage, cardPos, recordSnapshot]);

  const restoreSnapshot = (snap: BoostSnapshot) => {
    if (snap.images && snap.images.length > 0) {
      setImages(snap.images);
      const activeIdx = snap.images[currentIndex] ? currentIndex : 0;
      const targetImg = snap.images[activeIdx];
      if (targetImg) {
        syncSidebarToImage(targetImg);
      }
    }
    if (snap.selectedImageIds && snap.selectedImageIds.length > 0) {
      setSelectedImageIds(snap.selectedImageIds);
    }
    setCardPos(snap.cardPos);
    setLogoPos(snap.logoPos);
    if (snap.pricePos) setPricePos(snap.pricePos);
    setCardScale(snap.cardScale);
    setLogoSize(snap.logoSize);
    if (snap.priceScale) setPriceScale(snap.priceScale);
    setCardOpacity(snap.cardOpacity);
    setCardTheme(snap.cardTheme);
    setCardMargin(snap.cardMargin);
    setShowLogo(snap.showLogo);
    setShowShowroomName(snap.showShowroomName);
    setSelectedShowroomName(snap.selectedShowroomName);
    setFontFamily(snap.fontFamily);
    if (snap.enableSeparatePrice !== undefined) setEnableSeparatePrice(snap.enableSeparatePrice);
    if (snap.showMainPriceInCard !== undefined) setShowMainPriceInCard(snap.showMainPriceInCard);
    if (snap.showCutPrice !== undefined) setShowCutPrice(snap.showCutPrice);
    if (snap.customLowMarkup !== undefined) setCustomLowMarkup(snap.customLowMarkup);
    if (snap.customMidMarkup !== undefined) setCustomMidMarkup(snap.customMidMarkup);
    if (snap.customHighMarkup !== undefined) setCustomHighMarkup(snap.customHighMarkup);
    if (snap.minimalTextColor) setMinimalTextColor(snap.minimalTextColor);
    if (snap.priceBadgeStyle) setPriceBadgeStyle(snap.priceBadgeStyle);
    if (snap.badgeDisplayStyle) setBadgeDisplayStyle(snap.badgeDisplayStyle);
    if (snap.customBgColor) setCustomBgColor(snap.customBgColor);
    if (snap.customTextColor) setCustomTextColor(snap.customTextColor);
    if (snap.outlineThickness !== undefined) setOutlineThickness(snap.outlineThickness);
    if (snap.fontWeight) setFontWeight(snap.fontWeight);
    if (snap.fontStyle) setFontStyle(snap.fontStyle);
    if (snap.textDecoration) setTextDecoration(snap.textDecoration);
    if (snap.textTransform) setTextTransform(snap.textTransform);
    if (snap.lineHeight !== undefined) setLineHeight(snap.lineHeight);
    if (snap.letterSpacing !== undefined) setLetterSpacing(snap.letterSpacing);
    if (snap.customRadius !== undefined) setCustomRadius(snap.customRadius);
    if (snap.customPadX !== undefined) setCustomPadX(snap.customPadX);
    if (snap.customPadY !== undefined) setCustomPadY(snap.customPadY);
    if (snap.customTitleColor !== undefined) setCustomTitleColor(snap.customTitleColor);
    if (snap.customMLabelColor !== undefined) setCustomMLabelColor(snap.customMLabelColor);
    if (snap.customMValueColor !== undefined) setCustomMValueColor(snap.customMValueColor);
    if (snap.customPLabelColor !== undefined) setCustomPLabelColor(snap.customPLabelColor);
    if (snap.customCutPriceColor !== undefined) setCustomCutPriceColor(snap.customCutPriceColor);
    if (snap.customActualPriceColor !== undefined) setCustomActualPriceColor(snap.customActualPriceColor);
    if (snap.customPhoneColor !== undefined) setCustomPhoneColor(snap.customPhoneColor);
    if (snap.actualPriceScale !== undefined) setActualPriceScale(snap.actualPriceScale);
    if (snap.enableLogoShadow !== undefined) setEnableLogoShadow(snap.enableLogoShadow);
    if (snap.logoShadowColor !== undefined) setLogoShadowColor(snap.logoShadowColor);
    if (snap.logoShadowBlur !== undefined) setLogoShadowBlur(snap.logoShadowBlur);
    if (snap.logoShadowOffsetY !== undefined) setLogoShadowOffsetY(snap.logoShadowOffsetY);
    if (snap.images) setImages(snap.images);
  };

  const handleUndo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const current = takeSnapshot();
    const previous = pastRef.current.pop()!;
    futureRef.current.push(current);
    restoreSnapshot(previous);
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);
  }, [takeSnapshot, restoreSnapshot]);

  const handleRedo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const current = takeSnapshot();
    const next = futureRef.current.pop()!;
    pastRef.current.push(current);
    restoreSnapshot(next);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, [takeSnapshot, restoreSnapshot]);

  // Updates settings for only selected image(s) (or all if multiple/all are selected)
  const updateSettingsForSelected = useCallback((patch: Partial<AdImageSettings>) => {
    setImages(prevImages => {
      if (prevImages.length === 0) return prevImages;
      const targetIds = selectedImageIds.length > 0 
        ? selectedImageIds 
        : (prevImages[currentIndex] ? [prevImages[currentIndex].id] : []);
      const targetSet = new Set(targetIds);

      return prevImages.map(img => {
        if (!targetSet.has(img.id)) return img;
        const currentSettings = img.settings || {};
        return {
          ...img,
          cardPos: patch.cardPos !== undefined ? patch.cardPos : (img.cardPos || currentSettings.cardPos),
          logoPos: patch.logoPos !== undefined ? patch.logoPos : (img.logoPos || currentSettings.logoPos),
          pricePos: patch.pricePos !== undefined ? patch.pricePos : (img.pricePos || currentSettings.pricePos),
          settings: {
            ...currentSettings,
            ...patch,
          }
        };
      });
    });
  }, [selectedImageIds, currentIndex]);

  // Master setter for sidebar settings
  const applySettingChange = useCallback(<K extends keyof AdImageSettings>(
    key: K, 
    value: AdImageSettings[K], 
    localSetter?: (v: any) => void
  ) => {
    recordSnapshot();
    if (localSetter) {
      localSetter(value);
    }
    updateSettingsForSelected({ [key]: value });
  }, [recordSnapshot, updateSettingsForSelected]);

  // Helper to update Card Pos for selected image(s)
  const handleCardPosChange = useCallback((newPos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    setImages(prevImages => {
      if (!prevImages[currentIndex]) return prevImages;
      const targetIds = selectedImageIds.length > 0 ? selectedImageIds : [prevImages[currentIndex].id];
      const targetSet = new Set(targetIds);
      const currentItem = prevImages[currentIndex];
      const prevPos = currentItem.cardPos || currentItem.settings?.cardPos || cardPos;
      const resolved = typeof newPos === 'function' ? newPos(prevPos) : newPos;

      return prevImages.map(img => {
        if (!targetSet.has(img.id)) return img;
        return {
          ...img,
          cardPos: resolved,
          settings: {
            ...(img.settings || {}),
            cardPos: resolved
          }
        };
      });
    });
    setCardPos(prev => typeof newPos === 'function' ? newPos(prev) : newPos);
  }, [currentIndex, cardPos, selectedImageIds]);

  const handleLogoPosChange = useCallback((newPos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    setImages(prevImages => {
      if (!prevImages[currentIndex]) return prevImages;
      const targetIds = selectedImageIds.length > 0 ? selectedImageIds : [prevImages[currentIndex].id];
      const targetSet = new Set(targetIds);
      const currentItem = prevImages[currentIndex];
      const prevPos = currentItem.logoPos || currentItem.settings?.logoPos || logoPos;
      const resolved = typeof newPos === 'function' ? newPos(prevPos) : newPos;

      return prevImages.map(img => {
        if (!targetSet.has(img.id)) return img;
        return {
          ...img,
          logoPos: resolved,
          settings: {
            ...(img.settings || {}),
            logoPos: resolved
          }
        };
      });
    });
    setLogoPos(prev => typeof newPos === 'function' ? newPos(prev) : newPos);
  }, [currentIndex, logoPos, selectedImageIds]);

  const handlePricePosChange = useCallback((newPos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
    setImages(prevImages => {
      if (!prevImages[currentIndex]) return prevImages;
      const targetIds = selectedImageIds.length > 0 ? selectedImageIds : [prevImages[currentIndex].id];
      const targetSet = new Set(targetIds);
      const currentItem = prevImages[currentIndex];
      const prevPos = currentItem.pricePos || currentItem.settings?.pricePos || pricePos;
      const resolved = typeof newPos === 'function' ? newPos(prevPos) : newPos;

      return prevImages.map(img => {
        if (!targetSet.has(img.id)) return img;
        return {
          ...img,
          pricePos: resolved,
          settings: {
            ...(img.settings || {}),
            pricePos: resolved
          }
        };
      });
    });
    setPricePos(prev => typeof newPos === 'function' ? newPos(prev) : newPos);
  }, [currentIndex, pricePos, selectedImageIds]);

  // Switch to a new image index and immediately sync that image's saved positions/settings
  const handleSelectImageIndex = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    const target = images[newIndex];
    if (target) {
      setSelectedImageIds([target.id]);
      syncSidebarToImage(target);
    }
  }, [images, syncSidebarToImage]);

  // Gallery multi-selection: Toggle Select All
  const handleToggleSelectAll = useCallback(() => {
    if (images.length === 0) return;
    if (selectedImageIds.length === images.length) {
      // If all are currently selected, reset to only current active image
      if (images[currentIndex]) {
        setSelectedImageIds([images[currentIndex].id]);
      } else {
        setSelectedImageIds([images[0].id]);
      }
    } else {
      // Select All images in gallery
      setSelectedImageIds(images.map(img => img.id));
    }
  }, [images, selectedImageIds.length, currentIndex]);

  // Gallery item click: Regular click selects only that item, Ctrl+Click toggles multi-select
  const handleGalleryItemClick = useCallback((idx: number, e: React.MouseEvent) => {
    const clickedItem = images[idx];
    if (!clickedItem) return;

    if (e.ctrlKey || e.metaKey) {
      // Multi-select toggle with Ctrl / Cmd
      setSelectedImageIds(prev => {
        if (prev.includes(clickedItem.id)) {
          if (prev.length <= 1) return prev; // Keep at least one selected
          return prev.filter(id => id !== clickedItem.id);
        } else {
          return [...prev, clickedItem.id];
        }
      });
      setCurrentIndex(idx);
      syncSidebarToImage(clickedItem);
    } else {
      // Single select: only this image
      setSelectedImageIds([clickedItem.id]);
      setCurrentIndex(idx);
      syncSidebarToImage(clickedItem);
    }
  }, [images, syncSidebarToImage]);

  // Gallery item checkbox click directly
  const handleToggleItemSelect = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
    const targetIdx = images.findIndex(img => img.id === id);
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
      if (images[targetIdx]) {
        syncSidebarToImage(images[targetIdx]);
      }
    }
  }, [images, syncSidebarToImage]);

  // Synchronize current active image's settings when switching images (external triggers)
  const prevIndexRef = useRef<number>(currentIndex);
  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      const target = images[currentIndex];
      if (target) {
        syncSidebarToImage(target);
      }
    }
  }, [currentIndex, images, syncSidebarToImage]);



  // Handle Initial Image Upload (Bulk)
  const processFileList = async (fileList: File[], isAppend: boolean = false) => {
    if (!fileList || fileList.length === 0) return;
    const total = fileList.length;

    setIsProcessing(true);
    setUploadProgress(15);
    setUploadTotal(total);
    setUploadProcessed(0);
    setUploadRemaining(total);
    setUploadEstimatedSec(Math.max(1, Math.round(total * 0.02)));
    setUploadCurrentFileName(fileList[0]?.name || '');
    setUploadStepText('ছবিগুলো ইনপুট ও বিশ্লেষণ করা হচ্ছে...');

    const newItems: AdImageItem[] = [];
    const startIndex = isAppend ? images.length : 0;
    const startTime = Date.now();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const idx = startIndex + i;
      setUploadCurrentFileName(file.name);

      const url = URL.createObjectURL(file);
      const detectedPrice = parsePriceFromFilename(file.name);
      const generatedModel = generateModelNumber(startModelInput, idx);
      // Never invent a price: if the filename has no price, leave it blank
      // for the user to type (the old code silently used 25,000/-).
      const actualPrice = detectedPrice || '';
      const numericVal = extractNumericPrice(actualPrice);
      const autoCut = detectedPrice
        ? formatBdNumber(calculateAutoCutPrice(numericVal, customLowMarkup, customMidMarkup, customHighMarkup))
        : '';

      newItems.push({
        id: `${file.name}-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        url,
        name: file.name,
        modelNumber: generatedModel,
        price: actualPrice,
        cutPrice: autoCut,
        cardPos: { ...cardPos },
        logoPos: { ...logoPos },
        pricePos: { ...pricePos },
        settings: {
          cardPos: { ...cardPos },
          logoPos: { ...logoPos },
          pricePos: { ...pricePos },
          cardScale,
          logoSize,
          priceScale,
          cardOpacity,
          cardTheme,
          badgeDisplayStyle,
          customBgColor,
          customTextColor,
          outlineThickness,
          minimalTextColor,
          fontFamily,
          fontWeight,
          fontStyle,
          textDecoration,
          textTransform,
          lineHeight,
          letterSpacing,
          customRadius,
          customPadX,
          customPadY,
          customTitleColor,
          customMLabelColor,
          customMValueColor,
          customPLabelColor,
          customCutPriceColor,
          customActualPriceColor,
          customPhoneColor,
          actualPriceScale,
          showLogo,
          enableLogoShadow,
          logoShadowColor,
          logoShadowBlur,
          logoShadowOffsetY,
          showShowroomName,
          showCutPrice,
          showMainPriceInCard,
          enableSeparatePrice,
          priceBadgeStyle,
          selectedShowroomName,
        }
      });

      const done = i + 1;
      const remaining = total - done;
      const elapsedSec = (Date.now() - startTime) / 1000;
      const avgPerItem = elapsedSec / done;
      const estLeft = Math.max(0, Math.round(remaining * avgPerItem));

      setUploadProcessed(done);
      setUploadRemaining(remaining);
      setUploadEstimatedSec(estLeft);
      setUploadProgress(Math.min(95, Math.round((done / total) * 90)));
      setUploadStepText(`মডেল ও দাম সাজানো হচ্ছে (${done}/${total})`);

      // Yield with requestAnimationFrame every 12 items for buttery-smooth non-blocking UI
      if (i % 12 === 0 || i === fileList.length - 1) {
        await new Promise(r => requestAnimationFrame(r));
      }
    }

    if (isAppend) {
      setImages(prev => [...prev, ...newItems]);
    } else {
      // Revoke previous blob URLs to prevent memory leaks
      images.forEach(img => {
        if (img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
          clearImageCache(img.url);
        }
      });
      setImages(newItems);
      setCurrentIndex(0);
      setSelectedImageIds(newItems.length > 0 ? [newItems[0].id] : []);
    }

    // Preload first image so canvas is ready before closing overlay
    if (newItems.length > 0) {
      setUploadProgress(100);
      setUploadProcessed(total);
      setUploadRemaining(0);
      setUploadEstimatedSec(0);
      setUploadStepText('সব ছবি প্রস্তুত! ক্যানভাস সাজানো হচ্ছে...');

      getCachedImage(newItems[0].url)
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            setIsProcessing(false);
          }, 150);
        });
    } else {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isAppend: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFileList(Array.from(files), isAppend);
    if (e.target) e.target.value = '';
  };
  // Re-apply Model Number Series Across All Images
  const handleReapplyModelSeries = () => {
    if (images.length === 0) return;
    recordSnapshot();
    setImages(prev => prev.map((item, idx) => ({
      ...item,
      modelNumber: generateModelNumber(startModelInput, idx)
    })));
  };

  // Update Active Image Model, Price or CutPrice (with auto-sync across selected images)
  const updateActiveImageField = (field: 'modelNumber' | 'price' | 'cutPrice', value: string) => {
    if (!activeImage) return;
    const normalizedVal = normalizeDigitsToEnglish(value);
    const targetIds = selectedImageIds.length > 0 ? selectedImageIds : [activeImage.id];
    const targetSet = new Set(targetIds);

    setImages(prev => {
      return prev.map(cur => {
        if (!targetSet.has(cur.id)) return cur;
        let newCutPrice = cur.cutPrice;

        if (field === 'price') {
          const num = extractNumericPrice(normalizedVal);
          if (num > 0) {
            newCutPrice = formatBdNumber(
              calculateAutoCutPrice(num, customLowMarkup, customMidMarkup, customHighMarkup)
            );
          }
        } else if (field === 'cutPrice') {
          newCutPrice = normalizedVal;
        }

        return {
          ...cur,
          [field]: field === 'modelNumber' ? normalizedVal.toUpperCase() : normalizedVal,
          cutPrice: newCutPrice
        };
      });
    });
  };

  // Delete an Image
  const handleDeleteImage = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToDelete = images[indexToDelete];
    if (itemToDelete?.url && itemToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(itemToDelete.url);
      clearImageCache(itemToDelete.url);
    }
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== indexToDelete);
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
    if (itemToDelete) {
      setSelectedImageIds(prev => prev.filter(id => id !== itemToDelete.id));
    }
  };

  // Active coordinates prioritizing the current active image's specific position
  const activeCardPos = activeImage?.cardPos || cardPos;
  const activeLogoPos = activeImage?.logoPos || logoPos;
  const activePricePos = activeImage?.pricePos || pricePos;

  // Current canvas render options
  const canvasOptions = useMemo(() => ({
    cardPos: activeCardPos,
    logoPos: activeLogoPos,
    pricePos: activePricePos,
    selectedElement,
    cardTheme,
    minimalTextColor,
    cardScale,
    cardOpacity,
    fontFamily,
    showShowroomName,
    cardMargin,
    showLogo,
    logoSize,
    enableSeparatePrice,
    priceScale,
    priceBadgeStyle,
    showCutPrice,
    showMainPriceInCard,
    customLowMarkup,
    customMidMarkup,
    customHighMarkup,
    badgeDisplayStyle,
    customBgColor,
    customTextColor,
    outlineThickness,
    fontWeight,
    fontStyle,
    textDecoration,
    textTransform,
    lineHeight,
    letterSpacing,
    customRadius,
    customPadX,
    customPadY,
    customTitleColor,
    customMLabelColor,
    customMValueColor,
    customPLabelColor,
    customCutPriceColor,
    customActualPriceColor,
    customPhoneColor,
    actualPriceScale,
    enableLogoShadow,
    logoShadowColor,
    logoShadowBlur,
    logoShadowOffsetY,
    onBoundingBoxesUpdate: (boxes: { 
      card: BoundingBox | null; 
      logo: BoundingBox | null; 
      price: BoundingBox | null 
    }) => {
      cardBoxRef.current = boxes.card;
      logoBoxRef.current = boxes.logo;
      priceBoxRef.current = boxes.price;
    }
  }), [
    activeCardPos, activeLogoPos, activePricePos, selectedElement, cardTheme, minimalTextColor,
    cardScale, cardOpacity, fontFamily, showShowroomName, cardMargin,
    showLogo, logoSize, enableSeparatePrice, priceScale, priceBadgeStyle,
    showCutPrice, showMainPriceInCard, customLowMarkup, customMidMarkup,
    customHighMarkup,
    badgeDisplayStyle, customBgColor, customTextColor, outlineThickness,
    fontWeight, fontStyle, textDecoration, textTransform,
    lineHeight, letterSpacing, customRadius, customPadX, customPadY,
    customTitleColor, customMLabelColor, customMValueColor, customPLabelColor,
    customCutPriceColor, customActualPriceColor, customPhoneColor,
    actualPriceScale, enableLogoShadow, logoShadowColor, logoShadowBlur, logoShadowOffsetY
  ]);

  // Live Canvas Rendering with requestAnimationFrame (60 FPS)
  useEffect(() => {
    if (!canvasRef.current || !activeImage) return;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      if (canvasRef.current && activeImage) {
        renderAdCanvas(canvasRef.current, activeImage, activeShowroom, canvasOptions);
      }
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeImage, activeShowroom, canvasOptions]);

  // Direct On-Canvas Drag & Drop and Pan Handlers
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !activeImage) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    const pBox = priceBoxRef.current;
    const hitPrice = enableSeparatePrice && pBox && (
      px >= pBox.x1 - 4 && px <= pBox.x2 + 4 &&
      py >= pBox.y1 - 4 && py <= pBox.y2 + 4
    );

    const lBox = logoBoxRef.current;
    const hitLogo = showLogo && lBox && (
      px >= lBox.x1 - 4 && px <= lBox.x2 + 4 &&
      py >= lBox.y1 - 4 && py <= lBox.y2 + 4
    );

    const cBox = cardBoxRef.current;
    const hitCard = cBox && (
      px >= cBox.x1 - 4 && px <= cBox.x2 + 4 &&
      py >= cBox.y1 - 4 && py <= cBox.y2 + 4
    );

    let target: SelectedElement | null = null;
    if (hitPrice) {
      target = 'price';
      handleSelectElement('price');
    } else if (hitLogo) {
      target = 'logo';
      handleSelectElement('logo');
    } else if (hitCard) {
      target = 'card';
      handleSelectElement('card');
    } else {
      target = null;
    }

    if (target) {
      recordSnapshot();
      setIsDragging(true);
      dragTargetRef.current = target;
      setCanvasCursor('grabbing');
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}

      // Compute smooth visual offset without jumping near clamped edges
      const currentBox = target === 'card' ? cBox : target === 'logo' ? lBox : pBox;
      const currentPos = currentBox 
        ? { x: (currentBox.x1 + currentBox.x2) / 2, y: (currentBox.y1 + currentBox.y2) / 2 }
        : (target === 'card' ? activeCardPos : target === 'logo' ? activeLogoPos : activePricePos);

      dragOffsetRef.current = {
        x: px - currentPos.x,
        y: py - currentPos.y
      };
    } else if (zoomScale > 1 || e.button === 1 || e.altKey) {
      // Pan/move the image smoothly with mouse drag when zoomed or on middle click
      setIsPanning(true);
      setCanvasCursor('grabbing');
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !activeImage) return;

    if (isPanning) {
      const dx = e.clientX - lastPanPosRef.current.x;
      const dy = e.clientY - lastPanPosRef.current.y;
      setPanOffset(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const py = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (isDragging && dragTargetRef.current) {
      const targetX = parseFloat(Math.max(0, Math.min(100, px - dragOffsetRef.current.x)).toFixed(2));
      const targetY = parseFloat(Math.max(0, Math.min(100, py - dragOffsetRef.current.y)).toFixed(2));
      if (dragTargetRef.current === 'card') {
        handleCardPosChange({ x: targetX, y: targetY });
      } else if (dragTargetRef.current === 'logo') {
        handleLogoPosChange({ x: targetX, y: targetY });
      } else if (dragTargetRef.current === 'price') {
        handlePricePosChange({ x: targetX, y: targetY });
      }
    } else {
      const pBox = priceBoxRef.current;
      const hitPrice = enableSeparatePrice && pBox && (
        px >= pBox.x1 - 4 && px <= pBox.x2 + 4 && py >= pBox.y1 - 4 && py <= pBox.y2 + 4
      );
      const lBox = logoBoxRef.current;
      const hitLogo = showLogo && lBox && (
        px >= lBox.x1 - 4 && px <= lBox.x2 + 4 && py >= lBox.y1 - 4 && py <= lBox.y2 + 4
      );
      const cBox = cardBoxRef.current;
      const hitCard = cBox && (
        px >= cBox.x1 - 4 && px <= cBox.x2 + 4 && py >= cBox.y1 - 4 && py <= cBox.y2 + 4
      );

      if (hitCard || hitLogo || hitPrice) {
        setCanvasCursor('grab');
      } else if (zoomScale > 1) {
        setCanvasCursor('grab');
      } else {
        setCanvasCursor('default');
      }
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      setCanvasCursor(zoomScale > 1 ? 'grab' : 'default');
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      return;
    }
    if (isDragging) {
      setIsDragging(false);
      dragTargetRef.current = null;
      setCanvasCursor(zoomScale > 1 ? 'grab' : 'default');
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Direct Mouse Wheel Zoom (Without needing Ctrl key)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setZoomScale(prev => {
      const next = Math.max(0.5, Math.min(4, parseFloat((prev + delta).toFixed(2))));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // Native non-passive Wheel listener to guarantee smooth zoom across all browsers
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.12 : 0.12;
      setZoomScale(prev => {
        const next = Math.max(0.5, Math.min(4, parseFloat((prev + delta).toFixed(2))));
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  // Keyboard Shortcuts Engine
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showShortcutsModal) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      // 1. Undo / Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // 2. Select Elements: '1' or 'C' (Card), '2' or 'L' (Logo), '3' or 'P' (Price Tag)
      if (e.key === '1' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleSelectElement('card');
        return;
      }
      if (e.key === '2' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleSelectElement('logo');
        return;
      }
      if (e.key === '3' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (enableSeparatePrice) {
          handleSelectElement('price');
        }
        return;
      }

      // 3. Carousel Navigation: '[' / ']' or '<' / '>'
      if (e.key === '[' || e.key === '<') {
        e.preventDefault();
        handleSelectImageIndex(Math.max(0, currentIndex - 1));
        return;
      }
      if (e.key === ']' || e.key === '>') {
        e.preventDefault();
        handleSelectImageIndex(Math.min(images.length - 1, currentIndex + 1));
        return;
      }

      // 4. Resize Selected Element (+ / - / = / _ / Numpad) or Zoom Canvas (Ctrl + / -)
      const isPlusKey = e.key === '+' || e.key === '=' || e.code === 'NumpadAdd';
      const isMinusKey = e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract';

      if (isPlusKey || isMinusKey) {
        e.preventDefault();
        const isEnlarge = isPlusKey;

        // If Ctrl or Meta is held -> Zoom Canvas in / out
        if (e.ctrlKey || e.metaKey) {
          if (isEnlarge) {
            setZoomScale(z => Math.min(3, parseFloat((z + 0.15).toFixed(2))));
          } else {
            setZoomScale(z => Math.max(0.6, parseFloat((z - 0.15).toFixed(2))));
          }
          return;
        }

        // Otherwise resize the active element (or default to card)
        const targetElement = selectedElement || 'card';

        if (targetElement === 'card') {
          const delta = isEnlarge ? (e.shiftKey ? 0.08 : 0.04) : (e.shiftKey ? -0.08 : -0.04);
          const currentScale = activeImage?.settings?.cardScale ?? cardScale;
          const newScale = Math.max(0.1, Math.min(2.0, parseFloat((currentScale + delta).toFixed(2))));
          applySettingChange('cardScale', newScale, setCardScale);
        } else if (targetElement === 'logo') {
          const delta = isEnlarge ? (e.shiftKey ? 10 : 5) : (e.shiftKey ? -10 : -5);
          const currentSize = activeImage?.settings?.logoSize ?? logoSize;
          const newSize = Math.max(10, Math.min(260, currentSize + delta));
          applySettingChange('logoSize', newSize, setLogoSize);
        } else if (targetElement === 'price') {
          const delta = isEnlarge ? (e.shiftKey ? 0.1 : 0.05) : (e.shiftKey ? -0.1 : -0.05);
          const currentScale = activeImage?.settings?.priceScale ?? priceScale;
          const newScale = Math.max(0.1, Math.min(2.5, parseFloat((currentScale + delta).toFixed(2))));
          applySettingChange('priceScale', newScale, setPriceScale);
        }
        return;
      }

      // 5. Arrow Key Movement (Nudge)
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        recordSnapshot();
        const step = e.shiftKey ? 5 : 1;

        if (e.key === 'ArrowLeft') {
          if (selectedElement === 'card') handleCardPosChange(p => ({ ...p, x: Math.max(0, p.x - step) }));
          else if (selectedElement === 'logo') handleLogoPosChange(p => ({ ...p, x: Math.max(0, p.x - step) }));
          else if (selectedElement === 'price') handlePricePosChange(p => ({ ...p, x: Math.max(0, p.x - step) }));
        } else if (e.key === 'ArrowRight') {
          if (selectedElement === 'card') handleCardPosChange(p => ({ ...p, x: Math.min(100, p.x + step) }));
          else if (selectedElement === 'logo') handleLogoPosChange(p => ({ ...p, x: Math.min(100, p.x + step) }));
          else if (selectedElement === 'price') handlePricePosChange(p => ({ ...p, x: Math.min(100, p.x + step) }));
        } else if (e.key === 'ArrowUp') {
          if (selectedElement === 'card') handleCardPosChange(p => ({ ...p, y: Math.max(0, p.y - step) }));
          else if (selectedElement === 'logo') handleLogoPosChange(p => ({ ...p, y: Math.max(0, p.y - step) }));
          else if (selectedElement === 'price') handlePricePosChange(p => ({ ...p, y: Math.max(0, p.y - step) }));
        } else if (e.key === 'ArrowDown') {
          if (selectedElement === 'card') handleCardPosChange(p => ({ ...p, y: Math.min(100, p.y + step) }));
          else if (selectedElement === 'logo') handleLogoPosChange(p => ({ ...p, y: Math.min(100, p.y + step) }));
          else if (selectedElement === 'price') handlePricePosChange(p => ({ ...p, y: Math.min(100, p.y + step) }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElement, handleUndo, handleRedo, recordSnapshot, images.length,
    enableSeparatePrice, showShortcutsModal, currentIndex, handleCardPosChange,
    handleLogoPosChange, handlePricePosChange, handleSelectImageIndex,
    cardScale, logoSize, priceScale, activeImage, applySettingChange, handleSelectElement
  ]);

  // Download Single Current Image (Safe Blob URL, only Model Number)
  const handleDownloadSingle = async () => {
    if (!canvasRef.current || !activeImage) return;
    setIsProcessing(true);
    try {
      const exportCanvas = document.createElement('canvas');
      const rendered = await renderAdCanvas(exportCanvas, activeImage, activeShowroom, {
        ...canvasOptions,
        isExporting: true
      });
      if (!rendered) {
        alert('ছবি লোড করা যায়নি বলে এক্সপোর্ট করা হয়নি। ছবিটি আবার আপলোড করে চেষ্টা করুন।');
        return;
      }
      const blob = await new Promise<Blob | null>((resolve) => {
        exportCanvas.toBlob(resolve, 'image/jpeg', 0.95);
      });
      if (!blob) return;

      const blobUrl = URL.createObjectURL(blob);
      const cleanModel = (activeImage.modelNumber || 'Photo').trim().replace(/[/\\?%*:|"<>]/g, '-');
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${cleanModel}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Bulk Download: Native Directory Picker if available; Showroom-named ZIP folder if on network IP/fallback
  const handleDownloadAllZip = async () => {
    if (images.length === 0) return;

    const showroomFolderName = (activeShowroom.name || 'Showroom_Ads')
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '_');

    // 1. If Native Directory Picker is supported (Chrome/Edge on localhost or HTTPS), call immediately on user click!
    let rootHandle: any = null;
    const canUseDirectoryPicker = typeof window !== 'undefined' && 
      window.isSecureContext && 
      typeof (window as any).showDirectoryPicker === 'function';

    if (canUseDirectoryPicker) {
      try {
        rootHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'downloads'
        });
      } catch (pickerErr: any) {
        if (pickerErr?.name === 'AbortError') {
          // User clicked Cancel on directory picker
          return;
        }
        console.warn('showDirectoryPicker was denied or unavailable:', pickerErr);
        rootHandle = null;
      }
    }

    const failedBulkExports: string[] = [];
    setIsProcessing(true);
    setBatchProgress({ current: 0, total: images.length });

    try {
      if (rootHandle) {
        // Saved directly into Showroom folder on user's disk without ZIP!
        const folderHandle = await rootHandle.getDirectoryHandle(showroomFolderName, { create: true });
        const offscreenCanvas = document.createElement('canvas');

        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          setBatchProgress({ current: i + 1, total: images.length });

          const rendered = await renderAdCanvas(offscreenCanvas, item, activeShowroom, {
            ...canvasOptions,
            cardPos: item.cardPos || cardPos,
            logoPos: item.logoPos || logoPos,
            pricePos: item.pricePos || pricePos,
            isExporting: true
          });
          if (!rendered) {
            failedBulkExports.push(item.name);
            continue;
          }

          const blob = await new Promise<Blob | null>((resolve) => {
            offscreenCanvas.toBlob(resolve, 'image/jpeg', 0.95);
          });

          if (blob) {
            const cleanModel = (item.modelNumber || `Item_${i + 1}`).trim().replace(/[/\\?%*:|"<>]/g, '-');
            const fileName = `${cleanModel}.jpg`;
            const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
          }
        }

        alert(`সফলভাবে "${activeShowroom.name}" ফোল্ডারে ${images.length}টি ছবি সেভ হয়েছে!`);
        if (failedBulkExports.length > 0) {
          alert(`এই ছবিগুলো লোড করা যায়নি বলে সেভ হয়নি: ${failedBulkExports.join(', ')}`);
        }
      } else {
        // Fallback for network IP (e.g. http://192.168... where Chrome locks showDirectoryPicker)
        // Or if directory picker is not supported:
        // Package inside a neat folder in ZIP so Chrome NEVER blocks it with "Insecure download blocked"!
        const zip = new JSZip();
        const showroomFolder = zip.folder(showroomFolderName) || zip;
        const offscreenCanvas = document.createElement('canvas');

        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          setBatchProgress({ current: i + 1, total: images.length });

          const rendered = await renderAdCanvas(offscreenCanvas, item, activeShowroom, {
            ...canvasOptions,
            cardPos: item.cardPos || cardPos,
            logoPos: item.logoPos || logoPos,
            pricePos: item.pricePos || pricePos,
            isExporting: true
          });
          if (!rendered) {
            failedBulkExports.push(item.name);
            continue;
          }

          const blob = await new Promise<Blob | null>((resolve) => {
            offscreenCanvas.toBlob(resolve, 'image/jpeg', 0.95);
          });

          if (blob) {
            const cleanModel = (item.modelNumber || `Item_${i + 1}`).trim().replace(/[/\\?%*:|"<>]/g, '-');
            showroomFolder.file(`${cleanModel}.jpg`, blob);
          }
        }

        if (failedBulkExports.length > 0) {
          alert(`এই ছবিগুলো লোড করা যায়নি বলে ZIP-এ আসেনি: ${failedBulkExports.join(', ')}`);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${showroomFolderName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      }
    } catch (err) {
      console.error('Bulk folder export error:', err);
      alert('ছবিগুলো সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
      setBatchProgress(null);
    }
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processFileList(Array.from(e.dataTransfer.files), false);
        }
      }}
      className="w-full h-auto lg:h-full bg-[#F5F5F7] flex flex-col p-1.5 sm:p-3 lg:p-4 gap-2.5 sm:gap-3 select-none"
    >
      
      {/* TOP COMMAND BAR */}
      <BoostHeader
        selectedShowroomName={selectedShowroomName}
        onSelectShowroom={(name) => {
          applySettingChange('selectedShowroomName', name, setSelectedShowroomName);
        }}
        activeShowroom={activeShowroom}
        showrooms={showrooms}
        onOpenShowroomManager={() => setIsShowroomManagerOpen(true)}
        startModelInput={startModelInput}
        onStartModelInputChange={setStartModelInput}
        onReapplyModelSeries={handleReapplyModelSeries}
        hasImages={images.length > 0}
        isProcessing={isProcessing}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onDownloadSingle={handleDownloadSingle}
        onDownloadAllZip={handleDownloadAllZip}
        fileInputRef={fileInputRef}
        appendFileInputRef={appendFileInputRef}
        onFileUpload={handleFileUpload}
      />

      {/* MAIN WORKSPACE: Left Tabbed Sidebar + Center Canvas + Right Vertical Gallery */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
        
        {/* LEFT: Structured Tabbed Sidebar */}
        <BoostSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeImage={activeImage}
          imagesCount={images.length}
          currentIndex={currentIndex}
          selectedCount={selectedImageIds.length}
          activeShowroom={activeShowroom}
          onUpdateActiveField={updateActiveImageField}
          fileInputRef={fileInputRef}
          onShowroomNumbersChange={handleShowroomNumbersChange}
          showCutPrice={showCutPrice}
          onToggleCutPrice={(val) => applySettingChange('showCutPrice', val, setShowCutPrice)}
          showMainPriceInCard={showMainPriceInCard}
          onToggleMainPriceInCard={(val) => applySettingChange('showMainPriceInCard', val, setShowMainPriceInCard)}
          enableSeparatePrice={enableSeparatePrice}
          onToggleSeparatePrice={(val) => {
            applySettingChange('enableSeparatePrice', val, setEnableSeparatePrice);
            if (val) handleSelectElement('price');
          }}
          selectedElement={selectedElement}
          onSelectPriceElement={() => handleSelectElement('price')}
          priceBadgeStyle={priceBadgeStyle}
          onSelectPriceBadgeStyle={(style) => applySettingChange('priceBadgeStyle', style, setPriceBadgeStyle)}
          priceScale={priceScale}
          onPriceScaleChange={(scale) => applySettingChange('priceScale', scale, setPriceScale)}
          onSetPricePosPreset={handlePricePosChange}
          cardPos={activeCardPos}
          onCardPosChange={handleCardPosChange}
          onApplyCardPosToAll={handleApplyCardPosToAll}
          onSelectCardElement={() => handleSelectElement('card')}
          cardTheme={cardTheme}
          onSelectCardTheme={(thm) => applySettingChange('cardTheme', thm, setCardTheme)}
          minimalTextColor={minimalTextColor}
          onSelectMinimalTextColor={(col) => applySettingChange('minimalTextColor', col, setMinimalTextColor)}
          cardScale={cardScale}
          onCardScaleChange={(scale) => applySettingChange('cardScale', scale, setCardScale)}
          fontFamily={fontFamily}
          onFontFamilyChange={(f) => applySettingChange('fontFamily', f, setFontFamily)}
          showShowroomName={showShowroomName}
          onToggleShowroomName={(val) => applySettingChange('showShowroomName', val, setShowShowroomName)}
          badgeDisplayStyle={badgeDisplayStyle}
          onSelectBadgeDisplayStyle={(style) => applySettingChange('badgeDisplayStyle', style, setBadgeDisplayStyle)}
          customBgColor={customBgColor}
          onCustomBgColorChange={(color) => applySettingChange('customBgColor', color, setCustomBgColor)}
          customTextColor={customTextColor}
          onCustomTextColorChange={(color) => applySettingChange('customTextColor', color, setCustomTextColor)}
          outlineThickness={outlineThickness}
          onOutlineThicknessChange={(thick) => applySettingChange('outlineThickness', thick, setOutlineThickness)}
          fontWeight={fontWeight}
          onFontWeightChange={(weight) => applySettingChange('fontWeight', weight, setFontWeight)}
          fontStyle={fontStyle}
          onFontStyleChange={(style) => applySettingChange('fontStyle', style, setFontStyle)}
          textDecoration={textDecoration}
          onTextDecorationChange={(dec) => applySettingChange('textDecoration', dec, setTextDecoration)}
          textTransform={textTransform}
          onTextTransformChange={(trans) => applySettingChange('textTransform', trans, setTextTransform)}
          lineHeight={lineHeight}
          onLineHeightChange={(lh) => applySettingChange('lineHeight', lh, setLineHeight)}
          letterSpacing={letterSpacing}
          onLetterSpacingChange={(ls) => applySettingChange('letterSpacing', ls, setLetterSpacing)}
          customRadius={customRadius}
          onCustomRadiusChange={(rad) => applySettingChange('customRadius', rad, setCustomRadius)}
          customPadX={customPadX}
          onCustomPadXChange={(px) => applySettingChange('customPadX', px, setCustomPadX)}
          customPadY={customPadY}
          onCustomPadYChange={(py) => applySettingChange('customPadY', py, setCustomPadY)}
          customTitleColor={customTitleColor}
          onCustomTitleColorChange={(col) => applySettingChange('customTitleColor', col, setCustomTitleColor)}
          customMLabelColor={customMLabelColor}
          onCustomMLabelColorChange={(col) => applySettingChange('customMLabelColor', col, setCustomMLabelColor)}
          customMValueColor={customMValueColor}
          onCustomMValueColorChange={(col) => applySettingChange('customMValueColor', col, setCustomMValueColor)}
          customPLabelColor={customPLabelColor}
          onCustomPLabelColorChange={(col) => applySettingChange('customPLabelColor', col, setCustomPLabelColor)}
          customCutPriceColor={customCutPriceColor}
          onCustomCutPriceColorChange={(col) => applySettingChange('customCutPriceColor', col, setCustomCutPriceColor)}
          customActualPriceColor={customActualPriceColor}
          onCustomActualPriceColorChange={(col) => applySettingChange('customActualPriceColor', col, setCustomActualPriceColor)}
          customPhoneColor={customPhoneColor}
          onCustomPhoneColorChange={(col) => applySettingChange('customPhoneColor', col, setCustomPhoneColor)}
          onResetElementColors={handleResetElementColors}
          actualPriceScale={actualPriceScale}
          onActualPriceScaleChange={(scale) => applySettingChange('actualPriceScale', scale, setActualPriceScale)}
          showLogo={showLogo}
          onToggleShowLogo={(val) => applySettingChange('showLogo', val, setShowLogo)}
          onSelectLogoElement={() => handleSelectElement('logo')}
          logoPos={activeLogoPos}
          onLogoPosChange={handleLogoPosChange}
          logoSize={logoSize}
          onLogoSizeChange={(size) => applySettingChange('logoSize', size, setLogoSize)}
          enableLogoShadow={enableLogoShadow}
          onToggleLogoShadow={(val) => applySettingChange('enableLogoShadow', val, setEnableLogoShadow)}
          logoShadowColor={logoShadowColor}
          onLogoShadowColorChange={(col) => applySettingChange('logoShadowColor', col, setLogoShadowColor)}
          logoShadowBlur={logoShadowBlur}
          onLogoShadowBlurChange={(blur) => applySettingChange('logoShadowBlur', blur, setLogoShadowBlur)}
          logoShadowOffsetY={logoShadowOffsetY}
          onLogoShadowOffsetYChange={(offset) => applySettingChange('logoShadowOffsetY', offset, setLogoShadowOffsetY)}
        />

        {/* CENTER: Interactive Canvas Preview */}
        <BoostCanvas
          canvasRef={canvasRef}
          containerRef={containerRef}
          activeImage={activeImage}
          imagesCount={images.length}
          currentIndex={currentIndex}
          onPrevImage={() => handleSelectImageIndex(Math.max(0, currentIndex - 1))}
          onNextImage={() => handleSelectImageIndex(Math.min(images.length - 1, currentIndex + 1))}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          zoomScale={zoomScale}
          panOffset={panOffset}
          onZoomIn={() => setZoomScale(z => Math.min(3, parseFloat((z + 0.15).toFixed(2))))}
          onZoomOut={() => setZoomScale(z => Math.max(0.6, parseFloat((z - 0.15).toFixed(2))))}
          onResetZoom={() => {
            setZoomScale(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          onWheel={handleWheel}
          canvasCursor={canvasCursor}
          isDragging={isDragging}
          isPanning={isPanning}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          fileInputRef={fileInputRef}
          isProcessing={isProcessing}
          batchProgress={batchProgress}
          selectedElement={selectedElement}
          onSelectElement={handleSelectElement}
          showLogo={showLogo}
          enableSeparatePrice={enableSeparatePrice}
          cardScale={cardScale}
          onCardScaleChange={(scale) => applySettingChange('cardScale', scale, setCardScale)}
          logoSize={logoSize}
          onLogoSizeChange={(size) => applySettingChange('logoSize', size, setLogoSize)}
          priceScale={priceScale}
          onPriceScaleChange={(scale) => applySettingChange('priceScale', scale, setPriceScale)}
        />

        {/* RIGHT COLUMN: Vertical Image Gallery */}
        <BoostGallery
          images={images}
          currentIndex={currentIndex}
          selectedImageIds={selectedImageIds}
          onToggleSelectAll={handleToggleSelectAll}
          onItemClick={handleGalleryItemClick}
          onToggleItemSelect={handleToggleItemSelect}
          onDeleteImage={handleDeleteImage}
          appendFileInputRef={appendFileInputRef}
        />

      </div>

      {/* KEYBOARD SHORTCUTS MODAL */}
      <BoostShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Dynamic Image Import & Arranging Animation Overlay */}
      <ImageProcessingOverlay
        isVisible={isProcessing && !batchProgress}
        title="বুস্ট অ্যাডসের ছবিগুলো প্রস্তুত করা হচ্ছে..."
        subtitle={uploadStepText || "মডেল নম্বর, বিক্রয় মূল্য ও কাটা দাম স্বয়ংক্রিয়ভাবে সাজানো হচ্ছে"}
        progress={uploadProgress}
        totalImages={uploadTotal || images.length}
        processedCount={uploadProcessed}
        remainingCount={uploadRemaining}
        estimatedSeconds={uploadEstimatedSec}
        currentFileName={uploadCurrentFileName}
      />

      {/* Showroom & Brand Manager Modal */}
      <ShowroomManagerModal
        isOpen={isShowroomManagerOpen}
        onClose={() => setIsShowroomManagerOpen(false)}
        showrooms={showrooms}
        currentShowroomName={selectedShowroomName}
        onSelectShowroom={(s) => setSelectedShowroomName(s.name)}
        onShowroomsUpdated={() => loadShowrooms().then(setShowrooms)}
      />

    </div>
  );
}
