import React, { useRef, useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Crop, Undo2, Redo2 } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';
import CropModal from './CropModal';
import type { ImageSetting } from '../../types';
import { SHOWROOMS } from '../../types';

export default function CanvasPreview() {
  const {
    mainImages, setMainImages, previewUrls, setPreviewUrls, previewIndex, setPreviewIndex, setSelectedIndices, imageSettings, updateSetting,
    isProcessing, setIsProcessing,
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
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState('center');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPanMouseRef = useRef({ x: 0, y: 0 });
  const zoomStateRef = useRef({ scale: 1, origin: 'center' });

  useEffect(() => {
    zoomStateRef.current = { scale: zoomScale, origin: zoomOrigin };
  }, [zoomScale, zoomOrigin]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

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



  const currentSetting = imageSettings[previewIndex];

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

      currentPos.x = Math.max(0, Math.min(100, currentPos.x));
      currentPos.y = Math.max(0, Math.min(100, currentPos.y));

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
      
      const halfW = (elRect.width / rect.width) * 100 / 2;
      const halfH = (elRect.height / rect.height) * 100 / 2;

      // Clamp so the element stays entirely within the image
      xPercent = Math.max(halfW, Math.min(100 - halfW, xPercent));
      yPercent = Math.max(halfH, Math.min(100 - halfH, yPercent));

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

    x = Math.max(bgWidth / 2, Math.min(width - bgWidth / 2, x));
    y = Math.max(bgHeight / 2, Math.min(height - bgHeight / 2, y));

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

        const effectiveWatermark = watermarkText.trim() !== ''
          ? watermarkText
          : (currentSetting.assignedShowroom?.name || selectedShowroom || '');

        if (enableWatermark && effectiveWatermark) {
          ctx.save();
          ctx.fillStyle = currentSetting?.watermarkColor ?? watermarkColor;
          ctx.globalAlpha = (currentSetting?.watermarkOpacity ?? watermarkOpacity) / 100;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const wStyle = currentSetting?.watermarkStyle ?? watermarkStyle;

          if (wStyle === 'diagonal' || wStyle === 'horizontal') {
            const wx = (canvas.width * currentSetting.watermarkPos.x) / 100;
            const wy = (canvas.height * currentSetting.watermarkPos.y) / 100;
            ctx.translate(wx, wy);
            if (wStyle === 'diagonal') ctx.rotate(-Math.PI / 4);
            ctx.fillText(effectiveWatermark, 0, 0);
          } else if (wStyle === 'grid') {
            const wx = (canvas.width * currentSetting.watermarkPos.x) / 100;
            const wy = (canvas.height * currentSetting.watermarkPos.y) / 100;
            ctx.translate(wx - canvas.width / 2, wy - canvas.height / 2);
            const stepX = 300 * (canvas.width / 1000);
            const stepY = 200 * (canvas.height / 1000);
            ctx.rotate(-Math.PI / 6);

            for (let x = -canvas.width * 2; x < canvas.width * 3; x += stepX) {
              for (let y = -canvas.height * 2; y < canvas.height * 3; y += stepY) {
                ctx.fillText(effectiveWatermark, x, y);
              }
            }
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

          lx = Math.max(logoW / 2, Math.min(canvas.width - logoW / 2, lx));
          ly = Math.max(logoH / 2, Math.min(canvas.height - logoH / 2, ly));

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


  return (
    <div className="flex-1 lg:h-full flex flex-col z-10 w-full overflow-hidden mt-6 lg:mt-0">
      <div className="relative bg-gradient-to-br from-white/80 via-white/70 to-blue-50/60 backdrop-blur-2xl p-5 sm:p-7 rounded-[36px] shadow-[0_24px_64px_-12px_rgba(0,70,180,0.10)] border border-white/60 flex-1 flex flex-col transition-all h-full max-h-full overflow-hidden">

        {/* Decorative gradient blobs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5 shrink-0 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-2 h-7 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(0,113,227,0.4)]" />
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">লাইভ প্রিভিউ</h2>
            </div>
            <p className="text-xs font-medium text-gray-400 ml-5 flex items-center gap-1.5">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              ড্র্যাগ করে লোগো ও টেক্সট পজিশন করুন
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Undo / Redo Control Pill */}
            <div className="flex items-center self-start sm:self-auto bg-white/80 p-1 rounded-2xl border border-gray-200/80 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-100 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95"
                title="পূর্বাবস্থায় ফিরুন (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">আনডু</span>
              </button>
              <div className="w-[1px] h-4 bg-gray-200" />
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-100 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-all active:scale-95"
                title="পুনরায় করুন (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">রিডু</span>
              </button>
            </div>

            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
              className="px-4 py-3 bg-white/80 border border-gray-200/80 rounded-2xl text-sm font-semibold text-gray-600 outline-none focus:ring-2 focus:ring-blue-400/50 shadow-sm cursor-pointer hover:bg-white hover:border-blue-300 transition-all backdrop-blur-sm"
            >
              <option value="jpeg">.JPG — সেরা মান</option>
              <option value="png">.PNG — ট্রান্সপ্যারেন্ট</option>
              <option value="webp">.WEBP — ছোট সাইজ</option>
            </select>
            <button
              onClick={downloadAll}
              disabled={isProcessing || previewUrls.length === 0}
              className="relative flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-[0_4px_14px_rgba(0,113,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.5)] hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0 overflow-hidden group whitespace-nowrap"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Download className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              {isProcessing ? 'প্রসেসিং...' : 'ডাউনলোড করুন'}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-50/90 to-slate-100/80 rounded-[28px] border border-gray-200/60 flex flex-col items-center justify-center relative shadow-[inset_0_2px_12px_rgba(0,0,0,0.03)] h-full min-h-[400px] overflow-hidden">

          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          {/* Floating Crop Button */}
          {previewUrls.length > 0 && (
            <button
              onClick={() => setIsCropModalOpen(true)}
              className="absolute top-5 right-5 z-20 flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-xl shadow-lg hover:bg-white hover:scale-105 hover:shadow-xl transition-all text-gray-700 hover:text-blue-600 font-semibold text-sm"
            >
              <Crop className="w-4 h-4" />
              <span>ক্রপ করুন</span>
            </button>
          )}

          {previewUrls.length === 0 ? (
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500 zoom-in-95">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl animate-pulse" />
                <div className="relative w-full h-full bg-white border border-gray-100 shadow-xl rounded-3xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
                  <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">স্টুডিও এখন ফাঁকা</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
                বাম পাশের প্যানেল থেকে আপনার ফার্নিচারের ছবি আপলোড করুন অথবা ড্র্যাগ-অ্যান্ড-ড্রপ করুন।
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-600">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                হাই-কোয়ালিটি প্রসেসিং রেডি
              </div>
            </div>
          ) : currentSetting ? (
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
                    transition: isPanningRef.current ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
                      transition: isPanningRef.current ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
                      className={`absolute cursor-move pointer-events-auto rounded ${activeElement === 'number' ? 'ring-2 ring-blue-500 border border-dashed border-blue-400' : 'hover:ring-2 hover:ring-blue-500'}`}
                      style={{
                        left: `${(activeElement === 'number' && localDragPos) ? localDragPos.x : currentSetting.numberPos.x}%`,
                        top: `${(activeElement === 'number' && localDragPos) ? localDragPos.y : currentSetting.numberPos.y}%`,
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
                      className={`absolute cursor-move pointer-events-auto rounded ${activeElement === 'logo' ? 'ring-2 ring-blue-500 border border-dashed border-blue-400' : 'hover:ring-2 hover:ring-blue-500'}`}
                      style={{
                        left: `${(activeElement === 'logo' && localDragPos) ? localDragPos.x : currentSetting.logoPos.x}%`,
                        top: `${(activeElement === 'logo' && localDragPos) ? localDragPos.y : currentSetting.logoPos.y}%`,
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
          ) : (
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center shadow-inner">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18" />
                </svg>
              </div>
              <p className="text-base font-semibold text-gray-400">ছবি আপলোড করুন</p>
              <p className="text-xs text-gray-300">বেসিক ট্যাব থেকে ফার্নিচারের ছবি যোগ করুন</p>
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
    </div>
  );
}
