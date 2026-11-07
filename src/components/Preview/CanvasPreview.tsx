import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Download, ChevronLeft, ChevronRight, Crop, Undo2, Redo2, Upload, Sparkles } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';
import CropModal from './CropModal';
import ImageProcessingOverlay from '../Common/ImageProcessingOverlay';
import type { ImageSetting } from '../../types';
import { SHOWROOMS } from '../../types';

export default function CanvasPreview() {
  const {
    mainImages, setMainImages, previewUrls, setPreviewUrls, previewIndex, setPreviewIndex, setSelectedIndices, imageSettings, updateSetting,
    isProcessing, setIsProcessing,
    processingProgress, processingStepText,
    processedCount, remainingCount, estimatedSeconds, currentProcessingFile,
    handleUpload, loadDemoSample,
    defaultLogoPos, defaultNumberPos, defaultWatermarkPos,
    logoUrl, logoSize, enableLogoShadow, logoShadowColor, logoShadowBlur, logoShadowIntensity,
    numberText, numberSize, fontFamily, letterSpacing, lineHeight, fontWeight, fontStyle,
    textDecoration, textTransform, padX, padY, customRadius, numberBgColor, numberColor,
    numberStyle, numberOutlineThickness, numberOutlineBlur,
    enableWatermark, watermarkText, watermarkStyle, watermarkOpacity, watermarkSize,
    watermarkColor, watermarkFontFamily, watermarkFontWeight, watermarkFontStyle,
    watermarkTextDecoration, watermarkTextTransform, watermarkLetterSpacing,
    watermarkCustomAngle, watermarkIsGrid, watermarkGridSpacing,
    brightness, contrast, saturation, warmth,
    selectedShowroom,
    canUndo, canRedo, undo, redo, recordSnapshot,
    activeElement, setActiveElement
  } = useEditorContext();

  const [downloadFormat, setDownloadFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [renderedWidth, setRenderedWidth] = useState(1000);
  const [localDragPos, setLocalDragPos] = useState<{ x: number, y: number } | null>(null);
  const dragPosRef = useRef<{ x: number, y: number } | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState('center');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const lastPanMouseRef = useRef({ x: 0, y: 0 });
  const zoomStateRef = useRef({ scale: 1, origin: 'center' });

  useEffect(() => {
    zoomStateRef.current = { scale: zoomScale, origin: zoomOrigin };
  }, [zoomScale, zoomOrigin]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  const numberBadgeRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [badgeHalfPct, setBadgeHalfPct] = useState({ w: 16, h: 5 });
  const [logoHalfPct, setLogoHalfPct] = useState({ w: 10, h: 5 });

  const clampPan = (targetPan: {x: number, y: number}, currentScale: number, currentOrigin: string) => {
    if (currentScale <= 1 || !containerRef.current) return { x: 0, y: 0 };
    
    const parts = currentOrigin.split(' ');
    const xPct = parts[0] === 'center' ? 0.5 : parseFloat(parts[0]) / 100;
    const yPct = (parts[1] || parts[0]) === 'center' ? 0.5 : parseFloat(parts[1] || parts[0]) / 100;

    const W = containerRef.current.offsetWidth;
    const H = containerRef.current.offsetHeight;

    const minX = -W * (1 - xPct) * (currentScale - 1);
    const maxX = W * xPct * (currentScale - 1);
    const minY = -H * (1 - yPct) * (currentScale - 1);
    const maxY = H * yPct * (currentScale - 1);

    return {
      x: Math.min(Math.max(targetPan.x, minX), maxX),
      y: Math.min(Math.max(targetPan.y, minY), maxY)
    };
  };

  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (zoomScale <= 1) return;
    const target = e.target as HTMLElement;
    if (target.closest('.pointer-events-auto')) return;
    
    isPanningRef.current = true;
    setIsPanning(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPanMouseRef.current = { x: clientX, y: clientY };
  };

  const handlePanMove = (e: MouseEvent | TouchEvent) => {
    if (!isPanningRef.current || zoomStateRef.current.scale <= 1) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    
    const dx = clientX - lastPanMouseRef.current.x;
    const dy = clientY - lastPanMouseRef.current.y;
    
    setPanOffset(prev => clampPan({ x: prev.x + dx, y: prev.y + dy }, zoomStateRef.current.scale, zoomStateRef.current.origin));
    lastPanMouseRef.current = { x: clientX, y: clientY };
  };

  const handlePanEnd = () => {
    isPanningRef.current = false;
    setIsPanning(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handlePanMove);
    window.addEventListener('mouseup', handlePanEnd);
    window.addEventListener('touchmove', handlePanMove);
    window.addEventListener('touchend', handlePanEnd);
    return () => {
      window.removeEventListener('mousemove', handlePanMove);
      window.removeEventListener('mouseup', handlePanEnd);
      window.removeEventListener('touchmove', handlePanMove);
      window.removeEventListener('touchend', handlePanEnd);
    };
  }, []);
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomScale(prev => {
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newScale = Math.min(Math.max(1, prev + delta), 5);
      
      let newOrigin = zoomOrigin;
      if (prev === 1 && newScale > 1 && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        newOrigin = `${x}% ${y}%`;
        setZoomOrigin(newOrigin);
      } else if (newScale === 1) {
        newOrigin = 'center';
        setZoomOrigin(newOrigin);
      }

      setPanOffset(prevPan => clampPan(prevPan, newScale, newOrigin));
      return newScale;
    });
  };

  const handleCropSave = (blob: Blob) => {
    const newUrl = URL.createObjectURL(blob);
    const oldFile = mainImages[previewIndex];
    const newFile = new File([blob], oldFile ? oldFile.name : `cropped_${previewIndex}.jpg`, { type: 'image/jpeg' });
    
    setPreviewUrls(prev => {
      const copy = [...prev];
      copy[previewIndex] = newUrl;
      return copy;
    });
    setMainImages(prev => {
      const copy = [...prev];
      copy[previewIndex] = newFile;
      return copy;
    });

    setIsCropModalOpen(false);
  };



  const hasActiveImage = previewUrls.length > 0 && !!previewUrls[previewIndex];

  const currentSetting: ImageSetting = useMemo(() => {
    if (imageSettings[previewIndex]) return imageSettings[previewIndex];
    return {
      logoPos: defaultLogoPos || { x: 12, y: 12 },
      numberPos: defaultNumberPos || { x: 50, y: 88 },
      watermarkPos: defaultWatermarkPos || { x: 50, y: 50 },
      isLogoPosManual: true,
      isNumberPosManual: true,
      isWatermarkPosManual: true,
      logoUrl: logoUrl || undefined,
      logoSize: logoSize || 18,
      enableLogoShadow: enableLogoShadow ?? true,
      logoShadowColor: logoShadowColor || '#000000',
      logoShadowBlur: logoShadowBlur || 15,
      logoShadowIntensity: logoShadowIntensity || 2,
      numberText: numberText || '',
      numberSize: numberSize || 42,
      fontFamily: fontFamily || 'Kalpurush',
      letterSpacing: letterSpacing || 0,
      lineHeight: lineHeight || 1.2,
      fontWeight: fontWeight || 'bold',
      fontStyle: fontStyle || 'normal',
      textDecoration: textDecoration || 'none',
      textTransform: textTransform || 'none',
      padX: padX || 28,
      padY: padY || 10,
      customRadius: customRadius || 18,
      numberColor: numberColor || '#FFFFFF',
      numberBgColor: numberBgColor || '#B45309',
      numberStyle: numberStyle || 'solid',
      numberOutlineThickness: numberOutlineThickness || 4,
      numberOutlineBlur: numberOutlineBlur || 0,
      enableWatermark: enableWatermark ?? false,
      watermarkText: watermarkText || '',
      watermarkStyle: watermarkStyle || 'diagonal',
      watermarkOpacity: watermarkOpacity || 20,
      watermarkSize: watermarkSize || 36,
      watermarkColor: watermarkColor || '#FFFFFF',
      watermarkFontFamily: watermarkFontFamily || 'Kalpurush',
      watermarkFontWeight: watermarkFontWeight || 'bold',
      watermarkFontStyle: watermarkFontStyle || 'normal',
      watermarkTextDecoration: watermarkTextDecoration || 'none',
      watermarkTextTransform: watermarkTextTransform || 'none',
      watermarkLetterSpacing: watermarkLetterSpacing || 2,
      watermarkCustomAngle: watermarkCustomAngle || -45,
      watermarkIsGrid: watermarkIsGrid ?? false,
      watermarkGridSpacing: watermarkGridSpacing || 160,
      brightness: brightness ?? 100,
      contrast: contrast ?? 100,
      saturation: saturation ?? 100,
      warmth: warmth ?? 0,
      assignedShowroom: selectedShowroom ? SHOWROOMS.find(s => s.name === selectedShowroom) : undefined
    };
  }, [
    imageSettings, previewIndex, defaultLogoPos, defaultNumberPos, defaultWatermarkPos,
    logoUrl, logoSize, enableLogoShadow, logoShadowColor, logoShadowBlur, logoShadowIntensity,
    numberText, numberSize, fontFamily, letterSpacing, lineHeight, fontWeight, fontStyle,
    textDecoration, textTransform, padX, padY, customRadius, numberColor, numberBgColor,
    numberStyle, numberOutlineThickness, numberOutlineBlur, enableWatermark, watermarkText,
    watermarkStyle, watermarkOpacity, watermarkSize, watermarkColor, watermarkFontFamily,
    watermarkFontWeight, watermarkFontStyle, watermarkTextDecoration, watermarkTextTransform,
    watermarkLetterSpacing, watermarkCustomAngle, watermarkIsGrid, watermarkGridSpacing,
    brightness, contrast, saturation, warmth, selectedShowroom
  ]);

  useEffect(() => {
    if (!previewImageRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setRenderedWidth(entry.contentRect.width || entry.target.getBoundingClientRect().width);
      }
    });
    observer.observe(previewImageRef.current);
    return () => observer.disconnect();
  }, [previewUrls, previewIndex]);

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const handlePreviewImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
  };

  useEffect(() => {
    document.fonts.ready.then(() => {
      setRenderedWidth(prev => prev + 0.0001);
    });
  }, []);

  // Continuously track rendered dimensions of Badge and Logo to calculate mathematical safe margins
  useEffect(() => {
    const updateDims = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      if (cRect.width <= 0 || cRect.height <= 0) return;

      if (numberBadgeRef.current) {
        const nRect = numberBadgeRef.current.getBoundingClientRect();
        const halfW = (nRect.width / cRect.width) * 50;
        const halfH = (nRect.height / cRect.height) * 50;
        if (halfW > 0 && halfH > 0) {
          setBadgeHalfPct(prev => {
            if (Math.abs(prev.w - halfW) < 0.05 && Math.abs(prev.h - halfH) < 0.05) return prev;
            return { w: halfW, h: halfH };
          });
        }
      }

      if (logoRef.current) {
        const lRect = logoRef.current.getBoundingClientRect();
        const halfW = (lRect.width / cRect.width) * 50;
        const halfH = (lRect.height / cRect.height) * 50;
        if (halfW > 0 && halfH > 0) {
          setLogoHalfPct(prev => {
            if (Math.abs(prev.w - halfW) < 0.05 && Math.abs(prev.h - halfH) < 0.05) return prev;
            return { w: halfW, h: halfH };
          });
        }
      }
    };

    updateDims();
    const frameId = requestAnimationFrame(updateDims);
    const timeoutId = setTimeout(updateDims, 50);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [
    renderedWidth, previewIndex, imageSettings,
    numberText, numberSize, padX, padY, fontFamily, letterSpacing, lineHeight,
    logoSize, logoUrl, aspectRatio
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!activeElement || !imageSettings[previewIndex]) return;

    const step = e.shiftKey ? 2 : 0.5;

    if (e.key === '+' || e.key === '=' || e.key === '-') {
      e.preventDefault();
      recordSnapshot();
      const resizeStep = e.key === '-' ? (e.shiftKey ? -5 : -1) : (e.shiftKey ? 5 : 1);

      if (activeElement === 'logo') {
        const currentSize = imageSettings[previewIndex].logoSize ?? logoSize;
        const newSize = Math.max(5, Math.min(50, currentSize + resizeStep));
        updateSetting('logoSize', newSize);
      } else if (activeElement === 'number') {
        const currentSize = imageSettings[previewIndex].numberSize ?? numberSize;
        const newSize = Math.max(20, Math.min(120, currentSize + resizeStep));
        updateSetting('numberSize', newSize);
      } else if (activeElement === 'watermark') {
        const newSize = Math.max(20, Math.min(150, watermarkSize + resizeStep));
        updateSetting('watermarkSize', newSize);
      }
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      recordSnapshot();
      const key = `${activeElement}Pos` as keyof ImageSetting;
      const currentPos = { ...(imageSettings[previewIndex][key] as { x: number, y: number }) };

      if (e.key === 'ArrowUp') currentPos.y -= step;
      if (e.key === 'ArrowDown') currentPos.y += step;
      if (e.key === 'ArrowLeft') currentPos.x -= step;
      if (e.key === 'ArrowRight') currentPos.x += step;

      // Strictly clamp coordinates with safe margin from image border
      const half = activeElement === 'logo' ? logoHalfPct : (activeElement === 'number' ? badgeHalfPct : { w: 10, h: 5 });
      const margin = 1.8;

      currentPos.x = Math.max(half.w + margin, Math.min(100 - half.w - margin, currentPos.x));
      currentPos.y = Math.max(half.h + margin, Math.min(100 - half.h - margin, currentPos.y));

      updateSetting(key, currentPos);
      if (activeElement === 'logo') updateSetting('isLogoPosManual', true);
      if (activeElement === 'number') updateSetting('isNumberPosManual', true);
      if (activeElement === 'watermark') updateSetting('isWatermarkPosManual', true);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, type: 'logo' | 'number' | 'watermark') => {
    e.preventDefault();
    e.stopPropagation(); // Prevent click-outside from firing
    recordSnapshot();
    setActiveElement(type);
    if (containerRef.current) containerRef.current.focus();

    if (!containerRef.current || !imageSettings[previewIndex]) return;

    const container = containerRef.current;

    if (type === 'logo') updateSetting('isLogoPosManual', true);
    if (type === 'number') updateSetting('isNumberPosManual', true);
    if (type === 'watermark') updateSetting('isWatermarkPosManual', true);

    const targetEl = e.currentTarget as HTMLElement;
    const elRect = targetEl.getBoundingClientRect();

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;

      let xPercent = ((clientX - rect.left) / rect.width) * 100;
      let yPercent = ((clientY - rect.top) / rect.height) * 100;
      
      const halfW = (elRect.width / rect.width) * 50;
      const halfH = (elRect.height / rect.height) * 50;
      const margin = 1.8;

      // Strict clamp so the element stays entirely within the image with safety margin
      xPercent = Math.max(halfW + margin, Math.min(100 - halfW - margin, xPercent));
      yPercent = Math.max(halfH + margin, Math.min(100 - halfH - margin, yPercent));

      const pos = { x: xPercent, y: yPercent };
      dragPosRef.current = pos;
      setLocalDragPos(pos);
    };

    const onEnd = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
      
      if (dragPosRef.current) {
        updateSetting(`${type}Pos`, dragPosRef.current);
        dragPosRef.current = null;
        setLocalDragPos(null);
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
  };

  const loadImage = (src: string | File): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const isFile = typeof src !== 'string';
      const url = isFile ? URL.createObjectURL(src) : src;
      img.onload = () => {
        if (isFile) URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load image`);
        if (isFile) URL.revokeObjectURL(url);
        resolve(new Image());
      }
      img.src = url;
    });
  };

  const drawNumberWithBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, pos: { x: number, y: number }, textToDraw: string, setting: ImageSetting) => {
    const currentNumberSize = setting.numberSize ?? numberSize;
    const currentFontFamily = setting.fontFamily ?? fontFamily;
    const currentLetterSpacing = setting.letterSpacing ?? letterSpacing;
    const currentLineHeight = setting.lineHeight ?? lineHeight;
    const currentFontWeight = setting.fontWeight ?? fontWeight;
    const currentFontStyle = setting.fontStyle ?? fontStyle;
    const currentTextDecoration = setting.textDecoration ?? textDecoration;
    const currentTextTransform = setting.textTransform ?? textTransform;
    const currentPadXSetting = setting.padX ?? padX;
    const currentPadYSetting = setting.padY ?? padY;
    const currentCustomRadius = setting.customRadius ?? customRadius;
    const currentNumberBgColor = setting.numberBgColor ?? numberBgColor;
    const currentNumberColor = setting.numberColor ?? numberColor;
    const currentNumberStyle = setting.numberStyle ?? numberStyle;
    const currentNumberOutlineThickness = setting.numberOutlineThickness ?? numberOutlineThickness;
    const currentNumberOutlineBlur = setting.numberOutlineBlur ?? numberOutlineBlur;
    const scaleRatio = width / 1000;
    const actualSize = currentNumberSize * scaleRatio;

    ctx.font = `${currentFontStyle === 'italic' ? 'italic ' : ''}${currentFontWeight === 'bold' ? 'bold ' : ''}${actualSize}px "${currentFontFamily}", sans-serif`;
    ctx.letterSpacing = `${currentLetterSpacing * scaleRatio}px`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let rawText = textToDraw.trim();
    if (currentTextTransform === 'uppercase') rawText = rawText.toUpperCase();
    if (currentTextTransform === 'lowercase') rawText = rawText.toLowerCase();

    const lines = rawText.split(/[\s,]+/).filter(Boolean);
    if (lines.length === 0) return;

    let maxWidth = 0;
    lines.forEach(line => {
      const w = ctx.measureText(line).width;
      if (w > maxWidth) maxWidth = w;
    });

    const lineHeightPx = actualSize * currentLineHeight;

    const calculatedPadX = currentPadXSetting * scaleRatio;
    const calculatedPadY = currentPadYSetting * scaleRatio;
    const currentRadius = currentCustomRadius * scaleRatio;

    const bgWidth = maxWidth + calculatedPadX * 2;
    const bgHeight = (lines.length * lineHeightPx) + calculatedPadY * 2;

    let x = (width * pos.x) / 100;
    let y = (height * pos.y) / 100;

    const badgeMarginPx = Math.max(16, width * 0.018);
    x = Math.max(bgWidth / 2 + badgeMarginPx, Math.min(width - bgWidth / 2 - badgeMarginPx, x));
    y = Math.max(bgHeight / 2 + badgeMarginPx, Math.min(height - bgHeight / 2 - badgeMarginPx, y));

    ctx.beginPath();
    ctx.roundRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, currentRadius);
    if (currentNumberStyle === 'solid') {
      ctx.fillStyle = currentNumberBgColor;
      ctx.fill();
    }

    const startY = y - (lines.length * lineHeightPx) / 2 + (lineHeightPx / 2);

    if (currentNumberStyle === 'outline') {
      ctx.shadowColor = currentNumberBgColor;
      ctx.shadowBlur = currentNumberOutlineBlur * scaleRatio;
    }

    lines.forEach((line, index) => {
      const lineY = startY + (index * lineHeightPx);
      
      ctx.fillStyle = currentNumberStyle === 'transparent' ? currentNumberBgColor : currentNumberColor;

      if (currentNumberStyle === 'outline' && currentNumberOutlineThickness > 0) {
        ctx.strokeStyle = currentNumberBgColor;
        ctx.lineWidth = currentNumberOutlineThickness * 2 * scaleRatio;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line, x, lineY);
      }
      ctx.fillText(line, x, lineY);

      if (currentTextDecoration !== 'none') {
        const metrics = ctx.measureText(line);
        const textW = metrics.width;
        ctx.beginPath();
        ctx.lineWidth = actualSize * 0.08;
        ctx.strokeStyle = currentNumberColor;
        if (currentTextDecoration === 'underline') {
          const uy = lineY + (actualSize * 0.45);
          ctx.moveTo(x - textW / 2, uy);
          ctx.lineTo(x + textW / 2, uy);
        } else if (currentTextDecoration === 'line-through') {
          const sy = lineY;
          ctx.moveTo(x - textW / 2, sy);
          ctx.lineTo(x + textW / 2, sy);
        }
        ctx.stroke();
      }
    });

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  };

  const downloadAll = async () => {
    if (mainImages.length === 0) return;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      let globalLogoImg: HTMLImageElement | null = null;
      if (logoUrl) {
        globalLogoImg = await loadImage(logoUrl);
      }

      const mimeType = downloadFormat === 'jpeg' ? 'image/jpeg' : (downloadFormat === 'png' ? 'image/png' : 'image/webp');
      const extension = downloadFormat === 'jpeg' ? 'jpg' : downloadFormat;

      let dirHandle: any = null;
      let dateDirHandle: any = null;

      if ('showDirectoryPicker' in window) {
        try {
          dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
          const today = new Date();
          const dateFolder = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
          dateDirHandle = await dirHandle.getDirectoryHandle(dateFolder, { create: true });
        } catch (err: any) {
          setIsProcessing(false);
          if (err.name === 'AbortError') return;
          if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
            alert('ব্রাউজারের সিকিউরিটির কারণে সরাসরি মূল "Downloads" বা "Desktop" ফোল্ডার সিলেক্ট করা যায় না।\n\nদয়া করে Downloads-এর ভেতরে "নতুন একটি ফোল্ডার (New Folder)" তৈরি করে সেটি সিলেক্ট করুন।');
            return;
          }
          console.warn('Directory picker failed, falling back to traditional download', err);
        }
      }

      let globalShowroomName = "Furniture";
      if (selectedShowroom) {
        const showroom = SHOWROOMS.find((s: any) => s.numbers === selectedShowroom);
        if (showroom) globalShowroomName = showroom.name;
      }
      if (globalShowroomName === "Furniture" && numberText) {
        const showroom = SHOWROOMS.find((s: any) => s.numbers.trim() === numberText.trim());
        if (showroom) globalShowroomName = showroom.name;
      }

      for (let i = 0; i < mainImages.length; i++) {
        const mainImg = await loadImage(mainImages[i]);
        const currentSetting: ImageSetting = imageSettings[i] || {
          logoPos: { x: 10, y: 10 },
          numberPos: { x: 50, y: 88 },
          watermarkPos: { x: 50, y: 50 },
          isLogoPosManual: false,
          isNumberPosManual: false,
          isWatermarkPosManual: false,
          brightness: 100,
          contrast: 100,
          saturation: 100,
          warmth: 0
        };

        canvas.width = mainImg.width;
        canvas.height = mainImg.height;

        const effBrightness = currentSetting.brightness ?? brightness ?? 100;
        const effContrast = currentSetting.contrast ?? contrast ?? 100;
        const effSaturation = currentSetting.saturation ?? saturation ?? 100;
        const effWarmth = currentSetting.warmth ?? warmth ?? 0;

        ctx.filter = `brightness(${effBrightness}%) contrast(${effContrast}%) saturate(${effSaturation}%) sepia(${effWarmth}%)`;
        ctx.drawImage(mainImg, 0, 0);
        ctx.filter = 'none';

        const isWatermarkActive = currentSetting?.enableWatermark ?? enableWatermark;
        const rawWatermark = watermarkText.trim() !== ''
          ? watermarkText
          : (currentSetting.assignedShowroom?.name || selectedShowroom || '');

        if (isWatermarkActive && rawWatermark) {
          ctx.save();

          const scaleRatio = canvas.width / 1000;
          const wmSize = (currentSetting?.watermarkSize ?? watermarkSize ?? 36) * scaleRatio;
          const wmFontFamily = currentSetting?.watermarkFontFamily ?? watermarkFontFamily ?? 'Kalpurush';
          const wmFontWeight = (currentSetting?.watermarkFontWeight ?? watermarkFontWeight) === 'normal' ? 'normal' : 'bold';
          const wmFontStyle = currentSetting?.watermarkFontStyle ?? watermarkFontStyle ?? 'normal';
          const wmColor = currentSetting?.watermarkColor ?? watermarkColor ?? '#FFFFFF';
          const wmOpacity = Math.max(5, Math.min(100, currentSetting?.watermarkOpacity ?? watermarkOpacity ?? 20)) / 100;
          const wmLetterSpacing = (currentSetting?.watermarkLetterSpacing ?? watermarkLetterSpacing ?? 0) * scaleRatio;
          const wStyle = currentSetting?.watermarkStyle ?? watermarkStyle ?? 'diagonal';
          const wIsGrid = currentSetting?.watermarkIsGrid ?? watermarkIsGrid ?? false;

          let formattedText = rawWatermark;
          const textTransform = currentSetting?.watermarkTextTransform ?? watermarkTextTransform;
          if (textTransform === 'uppercase') formattedText = formattedText.toUpperCase();
          if (textTransform === 'lowercase') formattedText = formattedText.toLowerCase();

          ctx.font = `${wmFontStyle === 'italic' ? 'italic ' : ''}${wmFontWeight === 'bold' ? 'bold ' : ''}${wmSize}px "${wmFontFamily}", "Hind Siliguri", sans-serif`;
          ctx.fillStyle = wmColor;
          ctx.globalAlpha = wmOpacity;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if ('letterSpacing' in ctx && wmLetterSpacing > 0) {
            (ctx as any).letterSpacing = `${wmLetterSpacing}px`;
          }

          const wx = (canvas.width * (currentSetting.watermarkPos?.x ?? defaultWatermarkPos?.x ?? 50)) / 100;
          const wy = (canvas.height * (currentSetting.watermarkPos?.y ?? defaultWatermarkPos?.y ?? 50)) / 100;

          if (wStyle === 'grid' || (wStyle === 'custom' && wIsGrid)) {
            const gridSpacing = Math.max(60, (currentSetting?.watermarkGridSpacing ?? watermarkGridSpacing ?? 160) * scaleRatio);
            ctx.translate(wx - canvas.width / 2, wy - canvas.height / 2);
            ctx.rotate(-Math.PI / 6); // -30deg matching preview

            const textMetrics = ctx.measureText(formattedText);
            const stepX = Math.max(gridSpacing, textMetrics.width + gridSpacing);
            const stepY = gridSpacing * 1.2;

            for (let x = -canvas.width * 2; x < canvas.width * 3; x += stepX) {
              for (let y = -canvas.height * 2; y < canvas.height * 3; y += stepY) {
                ctx.fillText(formattedText, x, y);
              }
            }
          } else {
            ctx.translate(wx, wy);

            if (wStyle === 'diagonal') {
              ctx.rotate(-Math.PI / 4);
            } else if (wStyle === 'custom') {
              const angleDeg = currentSetting?.watermarkCustomAngle ?? watermarkCustomAngle ?? -45;
              ctx.rotate((angleDeg * Math.PI) / 180);
            }

            ctx.fillText(formattedText, 0, 0);
          }

          ctx.restore();
        }

        let currentLogoImg = globalLogoImg;
        if (currentSetting.logoUrl && currentSetting.logoUrl !== logoUrl) {
          currentLogoImg = await loadImage(currentSetting.logoUrl);
        }

        if (currentLogoImg && currentLogoImg.width > 0) {
          const currentLogoSize = currentSetting.logoSize ?? logoSize;
          const logoMaxWidth = canvas.width * (currentLogoSize / 100);
          const scale = logoMaxWidth / currentLogoImg.width;
          const logoW = currentLogoImg.width * scale;
          const logoH = currentLogoImg.height * scale;

          let lx = (canvas.width * currentSetting.logoPos.x) / 100;
          let ly = (canvas.height * currentSetting.logoPos.y) / 100;

          const logoMarginPx = Math.max(16, canvas.width * 0.018);
          lx = Math.max(logoW / 2 + logoMarginPx, Math.min(canvas.width - logoW / 2 - logoMarginPx, lx));
          ly = Math.max(logoH / 2 + logoMarginPx, Math.min(canvas.height - logoH / 2 - logoMarginPx, ly));

          const currentEnableLogoShadow = currentSetting.enableLogoShadow ?? enableLogoShadow;
          if (currentEnableLogoShadow) {
            ctx.shadowColor = currentSetting.logoShadowColor ?? logoShadowColor;
            ctx.shadowBlur = (currentSetting.logoShadowBlur ?? logoShadowBlur) * (canvas.width / 1000);
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            const intensity = currentSetting.logoShadowIntensity ?? logoShadowIntensity;
            for (let i = 0; i < intensity; i++) {
              ctx.drawImage(currentLogoImg, lx - logoW / 2, ly - logoH / 2, logoW, logoH);
            }
          } else {
            ctx.drawImage(currentLogoImg, lx - logoW / 2, ly - logoH / 2, logoW, logoH);
          }

          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        const currentNumberText = currentSetting.numberText ?? numberText;
        if (currentNumberText) {
          drawNumberWithBackground(ctx, canvas.width, canvas.height, currentSetting.numberPos, currentNumberText, currentSetting);
        }

        const fileName = `${currentSetting.assignedShowroom ? currentSetting.assignedShowroom.name : globalShowroomName}_${i + 1}.${extension}`;

        if (dateDirHandle) {
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mimeType, 0.95));
          if (blob) {
            const fileHandle = await dateDirHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
          }
        } else {
          const dataUrl = canvas.toDataURL(mimeType, 0.95);
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          await new Promise(r => setTimeout(r, 200));
        }
      }

    } finally {
      setIsProcessing(false);
    }
  };

  // Non-negotiable boundary protection: elements can NEVER extend outside image edges
  const BORDER_MARGIN_PCT = 1.8;

  // Safe clamping for Number Badge in DOM Preview
  const safeBadgeMinX = badgeHalfPct.w + BORDER_MARGIN_PCT;
  const safeBadgeMaxX = Math.max(safeBadgeMinX, 100 - badgeHalfPct.w - BORDER_MARGIN_PCT);
  const safeBadgeMinY = badgeHalfPct.h + BORDER_MARGIN_PCT;
  const safeBadgeMaxY = Math.max(safeBadgeMinY, 100 - badgeHalfPct.h - BORDER_MARGIN_PCT);

  const rawNumberX = (activeElement === 'number' && localDragPos) ? localDragPos.x : currentSetting.numberPos.x;
  const rawNumberY = (activeElement === 'number' && localDragPos) ? localDragPos.y : currentSetting.numberPos.y;

  const displayBadgeX = Math.max(safeBadgeMinX, Math.min(safeBadgeMaxX, rawNumberX));
  const displayBadgeY = Math.max(safeBadgeMinY, Math.min(safeBadgeMaxY, rawNumberY));

  // Safe clamping for Brand Logo in DOM Preview
  const curLogoSize = currentSetting?.logoSize ?? logoSize;
  const estLogoHalfW = curLogoSize / 2;
  const effLogoHalfW = Math.max(estLogoHalfW, logoHalfPct.w);
  const effLogoHalfH = logoHalfPct.h > 0 ? logoHalfPct.h : (estLogoHalfW * (aspectRatio || 1));

  const safeLogoMinX = effLogoHalfW + BORDER_MARGIN_PCT;
  const safeLogoMaxX = Math.max(safeLogoMinX, 100 - effLogoHalfW - BORDER_MARGIN_PCT);
  const safeLogoMinY = effLogoHalfH + BORDER_MARGIN_PCT;
  const safeLogoMaxY = Math.max(safeLogoMinY, 100 - effLogoHalfH - BORDER_MARGIN_PCT);

  const rawLogoX = (activeElement === 'logo' && localDragPos) ? localDragPos.x : currentSetting.logoPos.x;
  const rawLogoY = (activeElement === 'logo' && localDragPos) ? localDragPos.y : currentSetting.logoPos.y;

  const displayLogoX = Math.max(safeLogoMinX, Math.min(safeLogoMaxX, rawLogoX));
  const displayLogoY = Math.max(safeLogoMinY, Math.min(safeLogoMaxY, rawLogoY));

  return (
    <div className="flex-1 min-h-[460px] sm:min-h-[540px] lg:min-h-0 lg:h-full flex flex-col z-10 w-full overflow-hidden mt-1 lg:mt-0">
      <div className="relative bg-gradient-to-br from-white/80 via-white/70 to-blue-50/60 backdrop-blur-2xl p-4.5 sm:p-6 rounded-2xl shadow-[0_16px_48px_-12px_rgba(0,70,180,0.08)] border border-white/60 flex-1 flex flex-col transition-all h-full max-h-full overflow-hidden">

        {/* Decorative gradient blobs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 shrink-0 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-6 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(0,113,227,0.4)]" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">লাইভ প্রিভিউ</h2>
            </div>
            <p className="text-xs font-medium text-gray-400 ml-4.5 flex items-center gap-1.5">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ড্র্যাগ করে লোগো ও টেক্সট পজিশন করুন
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Undo / Redo Control Pill */}
            <div className="flex items-center self-start sm:self-auto bg-white/80 p-1 rounded-xl border border-gray-200/80 shadow-xs backdrop-blur-sm">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-100 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95"
                title="পূর্বাবস্থায় ফিরুন (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">আনডু</span>
              </button>
              <div className="w-[1px] h-3.5 bg-gray-200" />
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-100 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95"
                title="পুনরায় করুন (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">রিডু</span>
              </button>
            </div>

            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
              className="px-3.5 py-2 bg-white/80 border border-gray-200/80 rounded-xl text-xs font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-xs cursor-pointer hover:bg-white hover:border-blue-300 transition-all backdrop-blur-sm"
            >
              <option value="jpeg">.JPG — সেরা মান</option>
              <option value="png">.PNG — ট্রান্সপ্যারেন্ট</option>
              <option value="webp">.WEBP — ছোট সাইজ</option>
            </select>
            <button
              onClick={downloadAll}
              disabled={isProcessing || previewUrls.length === 0}
              className="relative flex items-center justify-center gap-2 px-4.5 py-2 bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_14px_rgba(0,113,227,0.3)] hover:shadow-[0_6px_18px_rgba(0,113,227,0.45)] hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0 overflow-hidden group whitespace-nowrap"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Download className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              {isProcessing ? 'প্রসেসিং...' : 'ডাউনলোড করুন'}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-50/90 to-slate-100/80 rounded-2xl border border-gray-200/60 flex flex-col items-center justify-center relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] h-full min-h-[400px] overflow-hidden">

          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          {/* Floating Crop Button */}
          {previewUrls.length > 0 && (
            <button
              onClick={() => setIsCropModalOpen(true)}
              className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-xl shadow-md hover:bg-white hover:scale-105 hover:shadow-lg transition-all text-gray-700 hover:text-blue-600 font-semibold text-xs"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>ক্রপ করুন</span>
            </button>
          )}

          {!hasActiveImage ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsCanvasDragging(true); }}
              onDragLeave={() => setIsCanvasDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsCanvasDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleUpload(Array.from(e.dataTransfer.files));
                }
              }}
              className={`relative z-10 w-full max-w-2xl mx-auto p-6 sm:p-10 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center text-center backdrop-blur-xl ${
                isCanvasDragging
                  ? 'border-blue-500 bg-blue-50/80 shadow-[0_16px_48px_rgba(0,113,227,0.20)] scale-[1.01]'
                  : 'border-blue-200/80 hover:border-blue-400/90 bg-white/70 hover:bg-white/90 shadow-[0_12px_36px_rgba(0,0,0,0.03)]'
              }`}
            >
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleUpload(Array.from(e.target.files));
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />

              {/* Glowing Icon Orb */}
              <div className="relative mb-5 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-[0_10px_28px_rgba(0,113,227,0.30)] group-hover:scale-105 group-hover:shadow-[0_14px_36px_rgba(0,113,227,0.40)] transition-all duration-300">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2] animate-bounce" />
                </div>
                <div className="absolute -inset-2 rounded-full bg-blue-400/20 blur-xl -z-10 group-hover:bg-blue-400/30 transition-all" />
              </div>

              {/* Headline & Subtitle */}
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
                ফার্নিচারের ছবি এখানে ড্রপ করুন
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed font-medium">
                কম্পিউটার থেকে ছবি টেনে আনুন অথবা নিচের বাটনে ক্লিক করে এক বা একাধিক ছবি নির্বাচন করুন
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 w-full justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-[0_6px_18px_rgba(0,113,227,0.3)] hover:shadow-[0_8px_24px_rgba(0,113,227,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>ছবি নির্বাচন করুন (Browse)</span>
                </button>

                <button
                  type="button"
                  onClick={loadDemoSample}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 font-bold text-xs sm:text-sm rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-blue-300 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>স্যাম্পল দিয়ে ট্রাই করুন</span>
                </button>
              </div>

              {/* Feature Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-5 border-t border-gray-200/60">
                <div className="flex flex-col items-center p-2.5 rounded-xl bg-white/60 border border-gray-100 shadow-2xs">
                  <span className="text-sm mb-0.5">⚡</span>
                  <span className="text-xs font-bold text-gray-800">বাল্ক এডিটর</span>
                  <span className="text-[10px] text-gray-400">একাধিক ছবি এক ক্লিকে</span>
                </div>
                <div className="flex flex-col items-center p-2.5 rounded-xl bg-white/60 border border-gray-100 shadow-2xs">
                  <span className="text-sm mb-0.5">🏷️</span>
                  <span className="text-xs font-bold text-gray-800">অটো শোরুম লোগো</span>
                  <span className="text-[10px] text-gray-400">১৭টি শোরুম প্রস্তুত</span>
                </div>
                <div className="flex flex-col items-center p-2.5 rounded-xl bg-white/60 border border-gray-100 shadow-2xs">
                  <span className="text-sm mb-0.5">🎨</span>
                  <span className="text-xs font-bold text-gray-800">স্মার্ট কালার ব্যাজ</span>
                  <span className="text-[10px] text-gray-400">ছবি স্ক্যান করে ম্যাচিং</span>
                </div>
                <div className="flex flex-col items-center p-2.5 rounded-xl bg-white/60 border border-gray-100 shadow-2xs">
                  <span className="text-sm mb-0.5">🔒</span>
                  <span className="text-xs font-bold text-gray-800">কাস্টম জলছাপ</span>
                  <span className="text-[10px] text-gray-400">ডায়াগোনাল ও গ্রিড</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full h-full relative">
              
              {/* Zoom Controls Overlay */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl shadow-lg border border-gray-200/80">
                <button 
                  onClick={() => setZoomScale(p => {
                    const n = Math.max(1, p - 0.2);
                    const orig = n === 1 ? 'center' : zoomOrigin;
                    if (n === 1) setZoomOrigin('center');
                    setPanOffset(prev => clampPan(prev, n, orig));
                    return n;
                  })} 
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" 
                  title="Zoom Out"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <span className="text-xs font-semibold text-gray-700 w-10 text-center">{Math.round(zoomScale * 100)}%</span>
                <button 
                  onClick={() => setZoomScale(p => {
                    const n = Math.min(5, p + 0.2);
                    setPanOffset(prev => clampPan(prev, n, zoomOrigin));
                    return n;
                  })} 
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" 
                  title="Zoom In"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              {/* Image preview area */}
              <div 
                className={`flex-1 flex items-center justify-center w-full h-full max-h-[50vh] xl:max-h-[60vh] p-4 overflow-hidden ${zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onWheel={handleWheel}
                onMouseDown={handlePanStart}
                onTouchStart={handlePanStart}
              >
                <div
                  className="flex items-center justify-center m-auto transition-transform w-full h-full"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                    transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                >
                  <div
                    ref={containerRef}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    onClick={() => setActiveElement(null)}
                    className="relative flex shadow-[0_24px_60px_-12px_rgba(0,0,0,0.20)] select-none touch-none bg-white rounded-2xl overflow-hidden outline-none max-h-full max-w-full m-auto"
                    style={{ 
                      aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto',
                      transform: `scale(${zoomScale})`,
                      transformOrigin: zoomOrigin,
                      transition: isPanning ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                  >
                  <img
                    ref={previewImageRef}
                    src={previewUrls[previewIndex]}
                    alt="Preview"
                    onLoad={handlePreviewImageLoad}
                    className="w-full h-full object-cover block pointer-events-none transition-all"
                    style={{
                      filter: `brightness(${currentSetting?.brightness ?? brightness ?? 100}%) contrast(${currentSetting?.contrast ?? contrast ?? 100}%) saturate(${currentSetting?.saturation ?? saturation ?? 100}%) sepia(${currentSetting?.warmth ?? warmth ?? 0}%)`
                    }}
                    draggable={false}
                  />

                  {/* DOM Watermark Preview Layer */}
                  {(currentSetting?.enableWatermark ?? enableWatermark) && (watermarkText.trim() !== '' ? watermarkText : (currentSetting.assignedShowroom?.name || selectedShowroom || '')) && (
                    <div
                      className={`absolute flex items-center justify-center ${((currentSetting?.watermarkStyle ?? watermarkStyle) !== 'grid' && !((currentSetting?.watermarkStyle ?? watermarkStyle) === 'custom' && (currentSetting?.watermarkIsGrid ?? watermarkIsGrid))) ? `cursor-move pointer-events-auto rounded transition-all ${activeElement === 'watermark' ? 'ring-2 ring-blue-500 border border-dashed border-blue-400' : 'hover:ring-2 hover:ring-blue-500'}` : 'pointer-events-none inset-0 overflow-hidden'}`}
                      style={((currentSetting?.watermarkStyle ?? watermarkStyle) !== 'grid' && !((currentSetting?.watermarkStyle ?? watermarkStyle) === 'custom' && (currentSetting?.watermarkIsGrid ?? watermarkIsGrid))) ? {
                        left: `${(activeElement === 'watermark' && localDragPos) ? localDragPos.x : currentSetting.watermarkPos.x}%`,
                        top: `${(activeElement === 'watermark' && localDragPos) ? localDragPos.y : currentSetting.watermarkPos.y}%`,
                        transform: `translate(-50%, -50%) ${(currentSetting?.watermarkStyle ?? watermarkStyle) === 'diagonal' ? 'rotate(-45deg)' : (currentSetting?.watermarkStyle ?? watermarkStyle) === 'custom' ? `rotate(${currentSetting?.watermarkCustomAngle ?? watermarkCustomAngle}deg)` : ''}`,
                        opacity: (currentSetting?.watermarkOpacity ?? watermarkOpacity) / 100,
                        color: currentSetting?.watermarkColor ?? watermarkColor,
                        fontFamily: `"${currentSetting?.watermarkFontFamily ?? watermarkFontFamily}", sans-serif`,
                        fontWeight: (currentSetting?.watermarkFontWeight ?? watermarkFontWeight) === 'normal' ? 'normal' : '800',
                        fontStyle: currentSetting?.watermarkFontStyle ?? watermarkFontStyle,
                        textDecoration: currentSetting?.watermarkTextDecoration ?? watermarkTextDecoration,
                        letterSpacing: `${(currentSetting?.watermarkLetterSpacing ?? watermarkLetterSpacing) * (renderedWidth / 1000)}px`,
                        textTransform: (currentSetting?.watermarkTextTransform ?? watermarkTextTransform) === 'none' ? 'none' : (currentSetting?.watermarkTextTransform ?? watermarkTextTransform),
                        fontSize: `${(currentSetting?.watermarkSize ?? watermarkSize) * (renderedWidth / 1000)}px`,
                        zIndex: 5,
                        whiteSpace: 'nowrap'
                      } : {
                        left: `${currentSetting.watermarkPos.x - 50}%`,
                        top: `${currentSetting.watermarkPos.y - 50}%`,
                        opacity: (currentSetting?.watermarkOpacity ?? watermarkOpacity) / 100,
                        color: currentSetting?.watermarkColor ?? watermarkColor,
                        fontFamily: `"${currentSetting?.fontFamily ?? fontFamily}", sans-serif`,
                        fontWeight: 'bold',
                        fontSize: `${(currentSetting?.watermarkSize ?? watermarkSize) * (renderedWidth / 1000)}px`,
                        zIndex: 5,
                        width: '100%',
                        height: '100%'
                      }}
                      onMouseDown={(e) => handleDragStart(e, 'watermark')}
                      onTouchStart={(e) => handleDragStart(e, 'watermark')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveElement('watermark');
                      }}
                    >
                      {(() => {
                        const wStyle = currentSetting?.watermarkStyle ?? watermarkStyle;
                        const wIsGrid = currentSetting?.watermarkIsGrid ?? watermarkIsGrid;
                        if (wStyle === 'diagonal' || wStyle === 'horizontal' || (wStyle === 'custom' && !wIsGrid)) {
                          let txt = watermarkText.trim() !== '' ? watermarkText : (currentSetting.assignedShowroom?.name || selectedShowroom || '');
                          if ((currentSetting?.watermarkTextTransform ?? watermarkTextTransform) === 'uppercase') txt = txt.toUpperCase();
                          if ((currentSetting?.watermarkTextTransform ?? watermarkTextTransform) === 'lowercase') txt = txt.toLowerCase();
                          return <div>{txt}</div>;
                        } else {
                          return (
                            <div className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 flex flex-wrap content-start" style={{
                              gap: `${(currentSetting?.watermarkGridSpacing ?? watermarkGridSpacing) * (renderedWidth / 1000)}px`,
                              transform: 'rotate(-30deg) scale(1.5)',
                              transformOrigin: 'center center'
                            }}>
                              {Array.from({ length: 50 }).map((_, i) => {
                                let txt = watermarkText.trim() !== '' ? watermarkText : (currentSetting.assignedShowroom?.name || selectedShowroom || '');
                                if ((currentSetting?.watermarkTextTransform ?? watermarkTextTransform) === 'uppercase') txt = txt.toUpperCase();
                                if ((currentSetting?.watermarkTextTransform ?? watermarkTextTransform) === 'lowercase') txt = txt.toLowerCase();
                                return <span key={i} className="whitespace-nowrap">{txt}</span>;
                              })}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}

                  {/* DOM Number Preview Layer */}
                  {(currentSetting?.numberText ?? numberText) && (
                    <div
                      ref={numberBadgeRef}
                      className={`absolute cursor-move pointer-events-auto rounded ${activeElement === 'number' ? 'ring-2 ring-blue-500 border border-dashed border-blue-400' : 'hover:ring-2 hover:ring-blue-500'}`}
                      style={{
                        left: `${displayBadgeX}%`,
                        top: `${displayBadgeY}%`,
                        transform: 'translate3d(-50%, -50%, 0)',
                        willChange: (activeElement === 'number' && localDragPos) ? 'left, top, transform' : 'auto',
                        transition: (activeElement === 'number' && localDragPos) ? 'none' : 'box-shadow 0.15s ease',
                        backgroundColor: (currentSetting?.numberStyle ?? numberStyle) === 'solid' ? (currentSetting?.numberBgColor ?? numberBgColor) : 'transparent',
                        border: 'none',
                        color: (currentSetting?.numberStyle ?? numberStyle) === 'transparent' ? (currentSetting?.numberBgColor ?? numberBgColor) : (currentSetting?.numberColor ?? numberColor),
                        fontSize: `${(currentSetting?.numberSize ?? numberSize) * (renderedWidth / 1000)}px`,
                        fontFamily: `"${currentSetting?.fontFamily ?? fontFamily}", sans-serif`,
                        letterSpacing: `${(currentSetting?.letterSpacing ?? letterSpacing) * (renderedWidth / 1000)}px`,
                        lineHeight: currentSetting?.lineHeight ?? lineHeight,
                        fontWeight: (currentSetting?.fontWeight ?? fontWeight) === 'normal' ? 'normal' : '800',
                        fontStyle: currentSetting?.fontStyle ?? fontStyle,
                        textDecoration: currentSetting?.textDecoration ?? textDecoration,
                        textTransform: (currentSetting?.textTransform ?? textTransform) === 'none' ? 'none' : (currentSetting?.textTransform ?? textTransform),
                        padding: `${(currentSetting?.padY ?? padY) * (renderedWidth / 1000)}px ${(currentSetting?.padX ?? padX) * (renderedWidth / 1000)}px`,
                        borderRadius: `${(currentSetting?.customRadius ?? customRadius) * (renderedWidth / 1000)}px`,
                        filter: (currentSetting?.numberStyle ?? numberStyle) === 'outline' && (currentSetting?.numberOutlineBlur ?? numberOutlineBlur) > 0
                          ? `drop-shadow(0 0 ${(currentSetting?.numberOutlineBlur ?? numberOutlineBlur) * (renderedWidth / 1000)}px ${currentSetting?.numberBgColor ?? numberBgColor})`
                          : 'none',
                        WebkitTextStroke: (currentSetting?.numberStyle ?? numberStyle) === 'outline' && (currentSetting?.numberOutlineThickness ?? numberOutlineThickness) > 0
                          ? `${(currentSetting?.numberOutlineThickness ?? numberOutlineThickness) * 2 * (renderedWidth / 1000)}px ${currentSetting?.numberBgColor ?? numberBgColor}`
                          : '0px transparent',
                        paintOrder: 'stroke fill',
                        zIndex: 10,
                        whiteSpace: 'pre-wrap',
                        textAlign: 'center',
                        minWidth: 'max-content'
                      }}
                      onMouseDown={(e) => handleDragStart(e, 'number')}
                      onTouchStart={(e) => handleDragStart(e, 'number')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveElement('number');
                      }}
                    >
                      {(currentSetting?.numberText ?? numberText).split('\n').map((line, i, arr) => (
                        <div key={i} style={{ marginBottom: i === arr.length - 1 ? 0 : '0.1em' }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DOM Logo Preview Layer */}
                  {(currentSetting?.logoUrl || logoUrl) && (
                    <div
                      ref={logoRef}
                      className={`absolute cursor-move pointer-events-auto rounded ${activeElement === 'logo' ? 'ring-2 ring-blue-500 border border-dashed border-blue-400' : 'hover:ring-2 hover:ring-blue-500'}`}
                      style={{
                        left: `${displayLogoX}%`,
                        top: `${displayLogoY}%`,
                        transform: 'translate3d(-50%, -50%, 0)',
                        willChange: (activeElement === 'logo' && localDragPos) ? 'left, top, transform' : 'auto',
                        transition: (activeElement === 'logo' && localDragPos) ? 'none' : 'box-shadow 0.15s ease',
                        width: `${currentSetting?.logoSize ?? logoSize}%`,
                        filter: (currentSetting?.enableLogoShadow ?? enableLogoShadow) 
                          ? Array.from({ length: currentSetting?.logoShadowIntensity ?? logoShadowIntensity }).map(() => `drop-shadow(0 0 ${(currentSetting?.logoShadowBlur ?? logoShadowBlur) * (renderedWidth / 1000)}px ${currentSetting?.logoShadowColor ?? logoShadowColor})`).join(' ')
                          : 'none',
                        zIndex: 20
                      }}
                      onMouseDown={(e) => handleDragStart(e, 'logo')}
                      onTouchStart={(e) => handleDragStart(e, 'logo')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveElement('logo');
                      }}
                    >
                      <img
                        src={currentSetting.logoUrl || logoUrl!}
                        alt="Logo"
                        className="w-full h-auto object-contain pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Arrows — outside overflow-hidden */}
              <div className="flex items-center justify-center gap-4 py-4 shrink-0 relative z-10">
                <button
                  onClick={() => {
                    const newIndex = Math.max(0, previewIndex - 1);
                    setPreviewIndex(newIndex);
                    setSelectedIndices(new Set([newIndex]));
                  }}
                  disabled={previewIndex === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-25 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-4 py-1.5 bg-white/80 border border-gray-200/80 rounded-full shadow-sm backdrop-blur-sm">
                  <span className="text-sm font-bold text-gray-700">{previewIndex + 1}</span>
                  <span className="text-xs text-gray-400 mx-1">/</span>
                  <span className="text-sm font-medium text-gray-500">{previewUrls.length}</span>
                </div>
                <button
                  onClick={() => {
                    const newIndex = Math.min(previewUrls.length - 1, previewIndex + 1);
                    setPreviewIndex(newIndex);
                    setSelectedIndices(new Set([newIndex]));
                  }}
                  disabled={previewIndex === previewUrls.length - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-25 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {isCropModalOpen && previewUrls[previewIndex] && (
        <CropModal
          imageUrl={previewUrls[previewIndex]}
          onClose={() => setIsCropModalOpen(false)}
          onSave={handleCropSave}
        />
      )}

      {/* Dynamic Image Import & Arranging Animation Overlay */}
      <ImageProcessingOverlay
        isVisible={isProcessing}
        title="ছবিগুলো গুছিয়ে প্রস্তুত করা হচ্ছে..."
        subtitle={processingStepText || "খালি জায়গা স্ক্যান করে লোগো ও নম্বর নিখুঁত পজিশনে সাজানো হচ্ছে"}
        progress={processingProgress}
        totalImages={mainImages.length}
        processedCount={processedCount}
        remainingCount={remainingCount}
        estimatedSeconds={estimatedSeconds}
        currentFileName={currentProcessingFile}
      />
    </div>
  );
}
