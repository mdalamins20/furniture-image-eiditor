import { SHOWROOMS } from '../../../types';
import type { 
  AdImageItem, CardTheme, PriceBadgeStyle, SelectedElement, BoundingBox, BadgeDisplayStyle 
} from '../types/boostTypes';
import { 
  extractNumericPrice, calculateAutoCutPrice, formatBdNumber, normalizeDigitsToEnglish 
} from './priceCalculators';

export interface CanvasRenderOptions {
  cardPos: { x: number; y: number };
  logoPos: { x: number; y: number };
  pricePos: { x: number; y: number };
  selectedElement: SelectedElement;
  cardTheme: CardTheme;
  minimalTextColor: 'dark' | 'light';
  cardScale: number;
  cardOpacity: number;
  fontFamily: string;
  showShowroomName: boolean;
  cardMargin: number;
  showLogo: boolean;
  logoSize: number;
  enableSeparatePrice: boolean;
  priceScale: number;
  priceBadgeStyle: PriceBadgeStyle;
  showCutPrice: boolean;
  showMainPriceInCard: boolean;
  customLowMarkup: number;
  customMidMarkup: number;
  customHighMarkup: number;
  // Badge Display & Typography Options
  badgeDisplayStyle?: BadgeDisplayStyle;
  customBgColor?: string;
  customTextColor?: string;
  outlineThickness?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  lineHeight?: number;
  letterSpacing?: number;
  customRadius?: number;
  customPadX?: number;
  customPadY?: number;
  // Individual element color overrides
  customTitleColor?: string;
  customMLabelColor?: string;
  customMValueColor?: string;
  customPLabelColor?: string;
  customCutPriceColor?: string;
  customActualPriceColor?: string;
  customPhoneColor?: string;
  actualPriceScale?: number;
  enableLogoShadow?: boolean;
  logoShadowColor?: string;
  logoShadowBlur?: number;
  logoShadowOffsetY?: number;
  isExporting?: boolean;
  onBoundingBoxesUpdate?: (boxes: { 
    card: BoundingBox | null; 
    logo: BoundingBox | null; 
    price: BoundingBox | null 
  }) => void;
}

// High-performance In-Memory Image Cache (avoids GC thrashing & memory leaks)
const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

export function getCachedImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }

  const existingPromise = loadingPromises.get(src);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Bounded cache: previously the module-level Map grew forever.
      if (imageCache.size >= 200) {
        const oldest = imageCache.keys().next().value;
        if (oldest) imageCache.delete(oldest);
      }
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };
    img.onerror = (err) => {
      imageCache.delete(src);
      loadingPromises.delete(src);
      reject(err);
    };
    img.src = src;
  });

  loadingPromises.set(src, promise);
  return promise;
}

export function clearImageCache(src?: string): void {
  if (src) {
    imageCache.delete(src);
    loadingPromises.delete(src);
  } else {
    imageCache.clear();
    loadingPromises.clear();
  }
}

/**
 * High-performance Canvas Renderer for Boost & Sponsored Ads with Rich Typography & Badge Styles
 */
export async function renderAdCanvas(
  targetCanvas: HTMLCanvasElement, 
  imageItem: AdImageItem, 
  showroom: typeof SHOWROOMS[0],
  options: CanvasRenderOptions
): Promise<boolean> {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return false;

  const mergedOptions: CanvasRenderOptions = {
    ...options,
    ...(imageItem.settings || {}),
    cardPos: imageItem.cardPos || imageItem.settings?.cardPos || options.cardPos,
    logoPos: imageItem.logoPos || imageItem.settings?.logoPos || options.logoPos,
    pricePos: imageItem.pricePos || imageItem.settings?.pricePos || options.pricePos,
  };

  const {
    cardPos, logoPos, pricePos, selectedElement, cardTheme,
    cardScale, cardOpacity, fontFamily,
    showShowroomName, showLogo, logoSize,
    enableSeparatePrice, priceScale, priceBadgeStyle,
    showCutPrice, showMainPriceInCard,
    customLowMarkup, customMidMarkup, customHighMarkup,
    badgeDisplayStyle = 'solid',
    customBgColor = '#18181B',
    customTextColor = '#FFFFFF',
    outlineThickness = 2,
    fontWeight = 'bold',
    fontStyle = 'normal',
    textDecoration = 'none',
    textTransform = 'none',
    lineHeight = 1.2,
    letterSpacing = 0,
    customRadius = 18,
    customPadX = 28,
    customPadY = 24,
    customTitleColor,
    customMLabelColor,
    customMValueColor,
    customPLabelColor,
    customCutPriceColor,
    customActualPriceColor,
    customPhoneColor,
    actualPriceScale = 1.38,
    enableLogoShadow = true,
    logoShadowColor = '#000000',
    logoShadowBlur = 16,
    logoShadowOffsetY = 4,
    isExporting = false, onBoundingBoxesUpdate
  } = mergedOptions;

  // Use resolved positions
  const effectiveCardPos = cardPos;
  const effectiveLogoPos = logoPos;
  const effectivePricePos = pricePos;

  let outCardBox: BoundingBox | null = null;
  let outLogoBox: BoundingBox | null = null;
  let outPriceBox: BoundingBox | null = null;

  // Only await font ready if not already loaded to eliminate microtask lag during drag
  if (document.fonts && document.fonts.status !== 'loaded') {
    try {
      await document.fonts.ready;
    } catch {}
  }

  // 1. Load Main Furniture Image (from in-memory cache)
  let img: HTMLImageElement;
  try {
    img = await getCachedImage(imageItem.url);
  } catch (err) {
    console.warn('Failed to load main image from URL:', imageItem.url, err);
    return false;
  }

  // Only resize canvas if dimensions actually changed to prevent GPU context teardown
  const newW = img.naturalWidth || img.width;
  const newH = img.naturalHeight || img.height;
  if (targetCanvas.width !== newW) targetCanvas.width = newW;
  if (targetCanvas.height !== newH) targetCanvas.height = newH;
  const W = newW;
  const H = newH;

  // Clear previous frame and draw base furniture image
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);

  // Dynamic narrow margin based on actual image dimensions (tight, non-overflowing safety edge)
  const dynamicMargin = Math.max(4, Math.round(Math.min(W, H) * 0.008));

  // 2. Render Showroom Logo (if enabled)
  let drawLogoW = 0;
  let drawLogoH = 0;
  let lx = 0;
  let ly = 0;

  if (showLogo && (showroom.logoUrl || showroom.file)) {
    try {
      const logoSrc = showroom.logoUrl || `/logos/${showroom.file}`;
      const logoImg = await getCachedImage(logoSrc);

      const baseLogoW = Math.max(8, (W / 1080) * logoSize * 1.5);
      const logoRatio = logoImg.naturalWidth / logoImg.naturalHeight;
      drawLogoW = baseLogoW;
      drawLogoH = baseLogoW / logoRatio;

      lx = (W * effectiveLogoPos.x) / 100 - (drawLogoW / 2);
      ly = (H * effectiveLogoPos.y) / 100 - (drawLogoH / 2);

      // Lock strictly inside image boundaries with dynamic narrow margin
      lx = Math.max(dynamicMargin, Math.min(W - drawLogoW - dynamicMargin, lx));
      ly = Math.max(dynamicMargin, Math.min(H - drawLogoH - dynamicMargin, ly));

      if (!isExporting) {
        outLogoBox = {
          x1: (lx / W) * 100,
          y1: (ly / H) * 100,
          x2: ((lx + drawLogoW) / W) * 100,
          y2: ((ly + drawLogoH) / H) * 100
        };
      }

      ctx.save();
      if (enableLogoShadow) {
        ctx.shadowColor = logoShadowColor || 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = Math.round(logoShadowBlur * (W / 1080));
        ctx.shadowOffsetY = Math.round(logoShadowOffsetY * (W / 1080));
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      }
      ctx.drawImage(logoImg, lx, ly, drawLogoW, drawLogoH);

      if (!isExporting && selectedElement === 'logo') {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = Math.max(2.5, (W / 1080) * 3.5);
        ctx.strokeRect(lx - 4, ly - 4, drawLogoW + 8, drawLogoH + 8);
      }

      ctx.restore();
    } catch (err) {
      console.warn('Showroom logo failed to load:', showroom.file, err);
    }
  }

  // 3. Render SHOWROOM INFO CARD (Showroom + M:- + P:- + Contact Numbers)
  ctx.save();
  
  const baseScale = (W / 1080) * cardScale;
  
  // All text sizes inside the card are mathematically scaled (guarded for 10% minimum scaling)
  const uniformFontSize = Math.max(4, Math.round(28 * baseScale));
  const titleFontSize = uniformFontSize;
  const modelPriceFontSize = uniformFontSize;
  const phoneFontSize = uniformFontSize;
  // Actual selling price is independently scalable & bolder as requested by Sir
  const actualPriceFontSize = Math.max(4, Math.round(uniformFontSize * actualPriceScale));

  // Apply Text Transform
  const transformText = (str: string): string => {
    if (!str) return '';
    if (textTransform === 'uppercase') return str.toUpperCase();
    if (textTransform === 'lowercase') return str.toLowerCase();
    return str;
  };

  const showroomLine = showShowroomName ? transformText(showroom.name) : '';
  const modelLine = transformText(imageItem.modelNumber || 'N/A');
  const priceLine = imageItem.price ? normalizeDigitsToEnglish(imageItem.price) : 'N/A';
  
  const numActual = extractNumericPrice(imageItem.price);
  const autoCut = calculateAutoCutPrice(numActual, customLowMarkup, customMidMarkup, customHighMarkup);
  
  // Cut price must be strictly greater than actual price and > 0, never "0"
  let cutPriceVal = '';
  if (imageItem.cutPrice && imageItem.cutPrice !== '0') {
    const parsedCut = extractNumericPrice(imageItem.cutPrice);
    if (parsedCut > 0 && parsedCut > numActual) {
      cutPriceVal = formatBdNumber(parsedCut);
    }
  } else if (autoCut > 0 && autoCut > numActual) {
    cutPriceVal = formatBdNumber(autoCut);
  }

  const phoneLines = showroom.numbers ? showroom.numbers.split('\n').filter(Boolean) : [];

  // Font styling helper
  const getFontStyle = (size: number) => {
    return `${fontStyle} ${fontWeight} ${size}px ${fontFamily}`;
  };

  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = `${letterSpacing * baseScale}px`;
  }

  // Measure maximum width of all lines
  ctx.font = getFontStyle(uniformFontSize);
  let maxContentWidth = ctx.measureText(showroomLine).width;

  const mWidth = ctx.measureText(`M:- ${modelLine}`).width;
  maxContentWidth = Math.max(maxContentWidth, mWidth);

  const hasPriceInCard = (showCutPrice && Boolean(cutPriceVal)) || (showMainPriceInCard && Boolean(priceLine));

  let displayActualPrice = priceLine;
  if (displayActualPrice && displayActualPrice.startsWith('P:-')) {
    displayActualPrice = displayActualPrice.slice(3).trim();
  }
  if (displayActualPrice && !displayActualPrice.includes('/-') && /[\d,]+$/.test(displayActualPrice)) {
    displayActualPrice = `${displayActualPrice}/-`;
  }

  // Width of P:- line (if enabled in card)
  if (hasPriceInCard) {
    ctx.font = getFontStyle(uniformFontSize);
    const pLabelMeasure = ctx.measureText('P:-').width;

    const cutMeasure = showCutPrice && cutPriceVal ? ctx.measureText(cutPriceVal).width + (10 * baseScale) : 0;
    ctx.font = `${fontStyle} bold ${actualPriceFontSize}px ${fontFamily}`;
    const mainMeasure = showMainPriceInCard ? ctx.measureText(displayActualPrice).width : 0;

    const pTotalWidth = pLabelMeasure + (6 * baseScale) + cutMeasure + mainMeasure;
    maxContentWidth = Math.max(maxContentWidth, pTotalWidth);
  }

  ctx.font = getFontStyle(uniformFontSize);
  for (const ph of phoneLines) {
    maxContentWidth = Math.max(maxContentWidth, ctx.measureText(ph).width);
  }

  const padX = Math.round(customPadX * baseScale);
  const padY = Math.round(customPadY * baseScale);
  const cardW = Math.round(maxContentWidth + (padX * 2) + (16 * baseScale));
  
  const lineSpacing = Math.round(10 * baseScale * lineHeight);
  const priceRowHeight = Math.max(uniformFontSize, actualPriceFontSize);
  let cardH = padY * 2;
  if (showShowroomName) {
    cardH += uniformFontSize + lineSpacing + (8 * baseScale);
  }
  cardH += uniformFontSize + lineSpacing;
  if (hasPriceInCard) {
    cardH += priceRowHeight + lineSpacing;
  }
  cardH += phoneLines.length * (uniformFontSize + (6 * baseScale * lineHeight));

  const radius = Math.round(customRadius * baseScale);

  // Free Positioning (per-image position)
  let cx = (W * effectiveCardPos.x) / 100 - (cardW / 2);
  let cy = (H * effectiveCardPos.y) / 100 - (cardH / 2);

  // Strict boundary clamp ensuring card never overflows the photo
  cx = Math.max(dynamicMargin, Math.min(W - cardW - dynamicMargin, cx));
  cy = Math.max(dynamicMargin, Math.min(H - cardH - dynamicMargin, cy));

  if (!isExporting) {
    outCardBox = {
      x1: (cx / W) * 100,
      y1: (cy / H) * 100,
      x2: ((cx + cardW) / W) * 100,
      y2: ((cy + cardH) / H) * 100
    };
  }

  // -------------------------------------------------------------
  // CARD THEME & BADGE DISPLAY STYLING (Solid, Transparent, Outline)
  // -------------------------------------------------------------
  // cardTheme was previously discarded by the theme tab: it now drives the
  // card colours, unless the user picks minimal-transparent (custom colours).
  const CARD_THEME_PRESETS: Record<string, { bg: string; text: string }> = {
    'dark-glass': { bg: '#18181B', text: '#FFFFFF' },
    'luxury-gold': { bg: '#3B2A12', text: '#FDE68A' },
    'clean-white': { bg: '#FFFFFF', text: '#111827' },
    'brand-blue': { bg: '#1E40AF', text: '#FFFFFF' },
  };
  const themePreset = cardTheme ? CARD_THEME_PRESETS[cardTheme] : undefined;
  const bgCol = themePreset?.bg || customBgColor || '#18181B';
  const textCol = themePreset?.text || customTextColor || '#FFFFFF';

  // Check if text is dark (e.g. black text on yellow/white background)
  const isDarkText = (
    textCol.toLowerCase() === '#000000' || 
    textCol.toLowerCase() === '#111827' || 
    textCol.toLowerCase() === '#18181b' ||
    textCol.toLowerCase() === '#1f2937'
  );

  let titleColor = textCol;
  let mLabelColor = isDarkText ? '#0284C7' : '#38BDF8';
  let mValueColor = textCol;
  let pLabelColor = isDarkText ? '#D97706' : '#FBBF24';
  let pValueColor = isDarkText ? '#B91C1C' : '#FEF08A';
  let phoneColor = textCol;
  let dividerColor = isDarkText ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.2)';

  if (badgeDisplayStyle === 'solid') {
    // 1. ভরাট (Solid): Solid Background Box with Soft Drop Shadow & Clean Border
    ctx.save();
    ctx.globalAlpha = cardOpacity / 100;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 24 * baseScale;
    ctx.shadowOffsetY = 8 * baseScale;

    ctx.fillStyle = bgCol;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, radius);
    ctx.fill();

    // Subtle edge highlight
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = Math.max(1, 1.5 * baseScale);
    ctx.strokeStyle = isDarkText ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();
    ctx.restore();
  } else if (badgeDisplayStyle === 'outline') {
    // 2. আউটলাইন (Outline): Glowing/Prominent Outline Border around Card Box + Optional Semi-Transparent Tint
    const borderThick = Math.max(2, (outlineThickness || 3) * baseScale);

    ctx.save();
    ctx.globalAlpha = cardOpacity / 100;

    // Slight backdrop tint for readability
    ctx.fillStyle = bgCol.startsWith('#') && bgCol.length === 7 ? `${bgCol}22` : 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, radius);
    ctx.fill();

    // Vibrant Outline Border
    ctx.shadowColor = bgCol;
    ctx.shadowBlur = Math.min(16, 4 * borderThick);
    ctx.lineWidth = borderThick;
    ctx.strokeStyle = bgCol;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, radius);
    ctx.stroke();
    ctx.restore();

    mLabelColor = bgCol;
    pLabelColor = bgCol;
    dividerColor = bgCol.startsWith('#') && bgCol.length === 7 ? `${bgCol}55` : 'rgba(255, 255, 255, 0.25)';
  } else {
    // 3. স্বচ্ছ (Transparent): No Box Fill, No Border
    dividerColor = isDarkText ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)';
    if (!customMLabelColor) mLabelColor = textCol;
    if (!customPLabelColor) pLabelColor = textCol;
    if (!customActualPriceColor) pValueColor = isDarkText ? '#B91C1C' : '#FEF08A';
  }

  // Compute effective individual element colors (custom overrides take top priority)
  const effectiveTitleColor = customTitleColor || titleColor;
  const effectiveMLabelColor = customMLabelColor || mLabelColor;
  const effectiveMValueColor = customMValueColor || mValueColor;
  const effectivePLabelColor = customPLabelColor || pLabelColor;
  const effectiveCutPriceColor = customCutPriceColor || '#EF4444';
  const effectiveActualPriceColor = customActualPriceColor || pValueColor;
  const effectivePhoneColor = customPhoneColor || phoneColor;

  // Highlight selection box
  if (!isExporting && selectedElement === 'card') {
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = Math.max(2, (W / 1080) * 3);
    if (badgeDisplayStyle === 'transparent') {
      ctx.setLineDash([6, 6]);
    }
    ctx.beginPath();
    ctx.roundRect(cx - 3, cy - 3, cardW + 6, cardH + 6, radius + 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.globalAlpha = 1.0;

  let textCursorY = cy + padY;
  const textCursorX = cx + padX;

  // 1. Showroom Name
  // Helper to draw text with outline stroke when outline badge style is active
  const drawTextWithOutline = (text: string, x: number, y: number, color: string) => {
    if (badgeDisplayStyle === 'outline' && (outlineThickness || 0) > 0) {
      ctx.save();
      ctx.strokeStyle = bgCol;
      ctx.lineWidth = Math.max(1.5, Math.round((outlineThickness || 2) * 1.2 * baseScale));
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeText(text, x, y);
      ctx.restore();
    } else if (badgeDisplayStyle === 'transparent') {
      ctx.save();
      ctx.shadowColor = isDarkText ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 8 * baseScale;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.restore();
      return;
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };

  // 1. Showroom Name
  if (showShowroomName) {
    ctx.font = getFontStyle(titleFontSize);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    drawTextWithOutline(showroomLine, textCursorX, textCursorY, effectiveTitleColor);

    if (textDecoration === 'underline') {
      const swW = ctx.measureText(showroomLine).width;
      ctx.strokeStyle = effectiveTitleColor;
      ctx.lineWidth = Math.max(1.5, 2 * baseScale);
      ctx.beginPath();
      ctx.moveTo(textCursorX, textCursorY + titleFontSize + (2 * baseScale));
      ctx.lineTo(textCursorX + swW, textCursorY + titleFontSize + (2 * baseScale));
      ctx.stroke();
    } else if (textDecoration === 'line-through') {
      const swW = ctx.measureText(showroomLine).width;
      ctx.strokeStyle = effectiveTitleColor;
      ctx.lineWidth = Math.max(1.5, 2 * baseScale);
      ctx.beginPath();
      ctx.moveTo(textCursorX, textCursorY + (titleFontSize * 0.55));
      ctx.lineTo(textCursorX + swW, textCursorY + (titleFontSize * 0.55));
      ctx.stroke();
    }

    textCursorY += titleFontSize + (8 * baseScale * lineHeight);

    if (badgeDisplayStyle !== 'transparent') {
      ctx.strokeStyle = dividerColor;
      ctx.lineWidth = 1 * baseScale;
      ctx.beginPath();
      ctx.moveTo(textCursorX, textCursorY);
      ctx.lineTo(textCursorX + cardW - (padX * 2), textCursorY);
      ctx.stroke();
      textCursorY += 8 * baseScale;
    }
  }

  // 2. M:- Model Number Line
  ctx.font = getFontStyle(modelPriceFontSize);
  ctx.textBaseline = 'top';
  drawTextWithOutline('M:-', textCursorX, textCursorY, effectiveMLabelColor);

  let cleanModel = modelLine;
  if (cleanModel.startsWith('M:-')) {
    cleanModel = cleanModel.slice(3).trim();
  }
  const mLabelWidth = ctx.measureText('M:-').width;
  ctx.font = getFontStyle(modelPriceFontSize);
  drawTextWithOutline(cleanModel, textCursorX + mLabelWidth, textCursorY, effectiveMValueColor);
  textCursorY += modelPriceFontSize + (10 * baseScale * lineHeight);

  // 3. P:- Price Line (Only if enabled in card)
  if (hasPriceInCard) {
    const lineCenterY = textCursorY + (priceRowHeight / 2);

    ctx.font = getFontStyle(uniformFontSize);
    ctx.textBaseline = 'middle';
    drawTextWithOutline('P:-', textCursorX, lineCenterY, effectivePLabelColor);
    let curX = textCursorX + ctx.measureText('P:-').width + (6 * baseScale);

    if (showCutPrice && cutPriceVal) {
      ctx.font = getFontStyle(uniformFontSize);
      ctx.textBaseline = 'middle';
      drawTextWithOutline(cutPriceVal, curX, lineCenterY, effectiveCutPriceColor);
      const cutW = ctx.measureText(cutPriceVal).width;

      ctx.save();
      ctx.strokeStyle = effectiveCutPriceColor;
      ctx.lineWidth = Math.max(2, Math.round(2.6 * baseScale));
      ctx.beginPath();
      ctx.moveTo(curX - 2, lineCenterY);
      ctx.lineTo(curX + cutW + 2, lineCenterY);
      ctx.stroke();
      ctx.restore();

      curX += cutW + (12 * baseScale);
    }

    if (showMainPriceInCard && displayActualPrice) {
      // Selling price is distinctly larger and bolder!
      ctx.font = `${fontStyle} bold ${actualPriceFontSize}px ${fontFamily}`;
      ctx.textBaseline = 'middle';
      drawTextWithOutline(displayActualPrice, curX, lineCenterY, effectiveActualPriceColor);
    }
    textCursorY += priceRowHeight + (10 * baseScale * lineHeight);
  }

  // 4. Phone Numbers Lines
  ctx.textBaseline = 'top';
  for (const ph of phoneLines) {
    ctx.font = getFontStyle(phoneFontSize);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    drawTextWithOutline(ph, textCursorX, textCursorY, effectivePhoneColor);

    if (textDecoration === 'underline') {
      const phW = ctx.measureText(ph).width;
      ctx.strokeStyle = effectivePhoneColor;
      ctx.lineWidth = Math.max(1.2, 1.5 * baseScale);
      ctx.beginPath();
      ctx.moveTo(textCursorX, textCursorY + phoneFontSize + (2 * baseScale));
      ctx.lineTo(textCursorX + phW, textCursorY + phoneFontSize + (2 * baseScale));
      ctx.stroke();
    } else if (textDecoration === 'line-through') {
      const phW = ctx.measureText(ph).width;
      ctx.strokeStyle = effectivePhoneColor;
      ctx.lineWidth = Math.max(1.2, 1.5 * baseScale);
      ctx.beginPath();
      ctx.moveTo(textCursorX, textCursorY + (phoneFontSize * 0.55));
      ctx.lineTo(textCursorX + phW, textCursorY + (phoneFontSize * 0.55));
      ctx.stroke();
    }

    textCursorY += phoneFontSize + (6 * baseScale * lineHeight);
  }

  ctx.restore();

  // 6. Render SEPARATE STANDALONE PRICE TAG (If enabled)
  if (enableSeparatePrice && imageItem.price) {
    ctx.save();
    const pScale = (W / 1080) * priceScale;
    const tagFontSize = Math.round(34 * pScale);
    const tagSubtitleFontSize = Math.round(16 * pScale);
    
    const priceText = imageItem.price;
    const subText = 'অফার মূল্য';

    ctx.font = `bold ${tagFontSize}px ${fontFamily}`;
    const priceTextW = ctx.measureText(priceText).width;

    ctx.font = `bold ${tagSubtitleFontSize}px ${fontFamily}`;
    const subTextW = ctx.measureText(subText).width;

    const contentW = Math.max(priceTextW, subTextW);
    const tagPadX = Math.round(24 * pScale);
    const tagPadY = Math.round(16 * pScale);

    const tagW = contentW + (tagPadX * 2);
    const tagH = tagFontSize + tagSubtitleFontSize + (tagPadY * 2) + Math.round(6 * pScale);

    let tx = (W * effectivePricePos.x) / 100 - (tagW / 2);
    let ty = (H * effectivePricePos.y) / 100 - (tagH / 2);

    tx = Math.max(dynamicMargin, Math.min(W - tagW - dynamicMargin, tx));
    ty = Math.max(dynamicMargin, Math.min(H - tagH - dynamicMargin, ty));

    if (!isExporting) {
      outPriceBox = {
        x1: (tx / W) * 100,
        y1: (ty / H) * 100,
        x2: ((tx + tagW) / W) * 100,
        y2: ((ty + tagH) / H) * 100
      };
    }

    if (priceBadgeStyle === 'pill') {
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 18 * pScale;
      ctx.shadowOffsetY = 6 * pScale;

      const grad = ctx.createLinearGradient(tx, ty, tx + tagW, ty + tagH);
      grad.addColorStop(0, '#DC2626');
      grad.addColorStop(1, '#991B1B');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tagW, tagH, Math.round(16 * pScale));
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.lineWidth = Math.max(1.5, 2 * pScale);
      ctx.strokeStyle = '#FEF08A';
      ctx.stroke();

      ctx.fillStyle = '#FEF08A';
      ctx.font = `bold ${tagSubtitleFontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(subText, tx + (tagW / 2), ty + tagPadY);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${tagFontSize}px ${fontFamily}`;
      ctx.fillText(priceText, tx + (tagW / 2), ty + tagPadY + tagSubtitleFontSize + (4 * pScale));
    } else if (priceBadgeStyle === 'tag') {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 20 * pScale;
      ctx.shadowOffsetY = 6 * pScale;

      const grad = ctx.createLinearGradient(tx, ty, tx + tagW, ty);
      grad.addColorStop(0, '#1E293B');
      grad.addColorStop(1, '#0F172A');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tagW, tagH, Math.round(12 * pScale));
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.lineWidth = Math.max(1.5, 2 * pScale);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.stroke();

      ctx.fillStyle = '#FBBF24';
      ctx.font = `bold ${tagSubtitleFontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('SPECIAL OFFER', tx + (tagW / 2), ty + tagPadY);

      ctx.fillStyle = '#FEF08A';
      ctx.font = `bold ${tagFontSize}px ${fontFamily}`;
      ctx.fillText(priceText, tx + (tagW / 2), ty + tagPadY + tagSubtitleFontSize + (4 * pScale));
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 12 * pScale;
      ctx.shadowOffsetY = 3 * pScale;

      ctx.fillStyle = '#EF4444';
      ctx.font = `bold ${tagSubtitleFontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('অফার মূল্য', tx + (tagW / 2), ty);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${tagFontSize}px ${fontFamily}`;
      ctx.fillText(priceText, tx + (tagW / 2), ty + tagSubtitleFontSize + (4 * pScale));
    }

    if (!isExporting && selectedElement === 'price') {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = Math.max(2.5, (W / 1080) * 3.5);
      ctx.beginPath();
      ctx.roundRect(tx - 4, ty - 4, tagW + 8, tagH + 8, Math.round(18 * pScale));
      ctx.stroke();
    }

    ctx.restore();
  }

  if (!isExporting && onBoundingBoxesUpdate) {
    onBoundingBoxesUpdate({
      card: outCardBox,
      logo: outLogoBox,
      price: outPriceBox
    });
  }
  return true;
}
