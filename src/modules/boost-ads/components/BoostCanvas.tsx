import React, { useState, useEffect, type RefObject } from 'react';
import { 
  ChevronLeft, ChevronRight, Undo2, Redo2, ZoomOut, ZoomIn, RotateCcw, 
  Flame, Upload, RefreshCw, Phone, ShieldCheck, Tag
} from 'lucide-react';
import type { AdImageItem, SelectedElement } from '../types/boostTypes';

interface BoostCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  activeImage: AdImageItem | null;
  imagesCount: number;
  currentIndex: number;
  onPrevImage: () => void;
  onNextImage: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoomScale: number;
  panOffset: { x: number; y: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onWheel: (e: React.WheelEvent) => void;
  canvasCursor: 'default' | 'grab' | 'grabbing';
  isDragging: boolean;
  isPanning: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isProcessing: boolean;
  batchProgress: { current: number; total: number } | null;
  selectedElement?: SelectedElement;
  onSelectElement?: (elem: SelectedElement) => void;
  showLogo?: boolean;
  enableSeparatePrice?: boolean;
  cardScale?: number;
  onCardScaleChange?: (scale: number) => void;
  logoSize?: number;
  onLogoSizeChange?: (size: number) => void;
  priceScale?: number;
  onPriceScaleChange?: (scale: number) => void;
}

export const BoostCanvas: React.FC<BoostCanvasProps> = React.memo(({
  canvasRef,
  containerRef,
  activeImage,
  imagesCount,
  currentIndex,
  onPrevImage,
  onNextImage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoomScale,
  panOffset,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onWheel,
  canvasCursor,
  isDragging,
  isPanning,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  fileInputRef,
  isProcessing,
  batchProgress,
  selectedElement,
  onSelectElement,
  showLogo,
  enableSeparatePrice,
  cardScale,
  onCardScaleChange,
  logoSize,
  onLogoSizeChange,
  priceScale,
  onPriceScaleChange,
}) => {
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  // Active element size calculation for +/- buttons on canvas
  const effectiveCardScale = activeImage?.settings?.cardScale ?? cardScale ?? 1.0;
  const effectiveLogoSize = activeImage?.settings?.logoSize ?? logoSize ?? 120;
  const effectivePriceScale = activeImage?.settings?.priceScale ?? priceScale ?? 1.2;

  let currentElementSizeLabel = '';
  let handleDecreaseElementSize: (() => void) | null = null;
  let handleIncreaseElementSize: (() => void) | null = null;

  if (selectedElement === 'logo' && showLogo && onLogoSizeChange) {
    currentElementSizeLabel = `${effectiveLogoSize}px`;
    handleDecreaseElementSize = () => onLogoSizeChange(Math.max(10, effectiveLogoSize - (effectiveLogoSize <= 30 ? 2 : 5)));
    handleIncreaseElementSize = () => onLogoSizeChange(Math.min(260, effectiveLogoSize + (effectiveLogoSize < 30 ? 2 : 5)));
  } else if (selectedElement === 'price' && enableSeparatePrice && onPriceScaleChange) {
    currentElementSizeLabel = `${Math.round(effectivePriceScale * 100)}%`;
    handleDecreaseElementSize = () => onPriceScaleChange(Math.max(0.1, parseFloat((effectivePriceScale - 0.05).toFixed(2))));
    handleIncreaseElementSize = () => onPriceScaleChange(Math.min(2.5, parseFloat((effectivePriceScale + 0.05).toFixed(2))));
  } else if (onCardScaleChange) {
    currentElementSizeLabel = `${Math.round(effectiveCardScale * 100)}%`;
    handleDecreaseElementSize = () => onCardScaleChange(Math.max(0.1, parseFloat((effectiveCardScale - 0.04).toFixed(2))));
    handleIncreaseElementSize = () => onCardScaleChange(Math.min(2.0, parseFloat((effectiveCardScale + 0.04).toFixed(2))));
  }

  useEffect(() => {
    if (!activeImage?.url) {
      setImageAspectRatio(null);
      return;
    }
    let isCurrent = true;
    const img = new Image();
    img.onload = () => {
      if (isCurrent && img.naturalWidth && img.naturalHeight) {
        setImageAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = activeImage.url;
    if (img.complete && img.naturalWidth && img.naturalHeight) {
      setImageAspectRatio(img.naturalWidth / img.naturalHeight);
    }

    return () => {
      isCurrent = false;
    };
  }, [activeImage?.url]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 min-h-[440px] sm:min-h-[520px] lg:min-h-0 bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-xs p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden relative min-w-0"
      onWheel={onWheel}
    >
      {/* Top Control Bar over Canvas: Navigation, Undo/Redo & Zoom */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        
        {/* Left: Image Carousel Navigation & Undo / Redo */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {imagesCount > 1 && (
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200 shadow-md">
              <button
                onClick={onPrevImage}
                disabled={currentIndex === 0}
                className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                title="পূর্ববর্তী ছবি ([)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-gray-800 px-1">
                {currentIndex + 1} / {imagesCount}
              </span>
              <button
                onClick={onNextImage}
                disabled={currentIndex === imagesCount - 1}
                className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                title="পরবর্তী ছবি (])"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Undo / Redo Pills */}
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-md">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 disabled:opacity-30 transition-all active:scale-95"
              title="পূর্বাবস্থায় ফিরুন (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-3.5 bg-gray-200 mx-0.5" />
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 disabled:opacity-30 transition-all active:scale-95"
              title="পুনরায় করুন (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Quick Element Selector (Card / Logo / Price) & Size Stepper */}
        {activeImage && onSelectElement && (
          <div className="hidden sm:flex items-center gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-md">
              <button
                type="button"
                onClick={() => onSelectElement('card')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedElement === 'card'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="নম্বর ও তথ্য কার্ড এডিট (1 / C)"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>নম্বর ও কার্ড</span>
              </button>
              {showLogo && (
                <button
                  type="button"
                  onClick={() => onSelectElement('logo')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedElement === 'logo'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="লোগো এডিট (2 / L)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>লোগো</span>
                </button>
              )}
              {enableSeparatePrice && (
                <button
                  type="button"
                  onClick={() => onSelectElement('price')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedElement === 'price'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title="আলাদা আসল দাম ট্যাগ এডিট (3 / P)"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>প্রাইস</span>
                </button>
              )}
            </div>

            {/* Direct +/- Size Stepper for Selected Element */}
            {handleDecreaseElementSize && handleIncreaseElementSize && (
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-xl border border-gray-200 shadow-md">
                <span className="text-[10px] font-bold text-gray-500">সাইজ:</span>
                <button
                  type="button"
                  onClick={handleDecreaseElementSize}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 font-bold text-sm transition-all cursor-pointer"
                  title="সাইজ ছোট করুন (-)"
                >
                  -
                </button>
                <span className="text-[11px] font-mono font-bold text-blue-600 px-1 min-w-[42px] text-center">
                  {currentElementSizeLabel}
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseElementSize}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 font-bold text-sm transition-all cursor-pointer"
                  title="সাইজ বড় করুন (+)"
                >
                  +
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-md pointer-events-auto">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            title="জুম আউট"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-bold text-gray-800 px-1 min-w-[42px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            title="জুম ইন"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomScale !== 1 && (
            <button
              onClick={onResetZoom}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-blue-600 transition-colors"
              title="জুম রিসেট (১০০%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Active Canvas with Direct Pointer Down / Move / Up & Zoom Transform */}
      {activeImage ? (
        <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden min-h-0 min-w-0 pt-12 pb-2 px-2 sm:px-4">
          <div
            className="flex items-center justify-center m-auto transition-transform w-full h-full max-h-[52vh] xl:max-h-[62vh]"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              transition: isDragging || isPanning ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            <div 
              style={{
                aspectRatio: imageAspectRatio ? `${imageAspectRatio}` : undefined,
                transform: `scale(${zoomScale})`,
                transformOrigin: 'center center',
                transition: isDragging || isPanning ? 'none' : 'transform 0.15s ease-out'
              }}
              className="relative flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-gray-200/80 bg-white max-h-full max-w-full m-auto"
            >
              <canvas
                ref={canvasRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                  cursor: canvasCursor,
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
                className="touch-none select-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">বুস্ট ও স্পন্সরড অ্যাড ক্রিয়েটিভ</h3>
            <p className="text-xs text-gray-500 mt-1">
              একসাথে অনেকগুলো ফার্নিচারের ছবি আপলোড করুন। ক্যানভাসে সরাসরি ড্র্যাগ ও কিবোর্ড অ্যারো কী দিয়ে লোগো ও ইনফো কার্ড নিখুঁতভাবে মুভ করতে পারবেন।
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-red-600/25 transition-all flex items-center gap-2 mx-auto active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>ফার্নিচারের ছবি আপলোড করুন</span>
          </button>
        </div>
      )}

      {/* Progress Modal during Batch ZIP Export */}
      {isProcessing && batchProgress && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 text-center space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-gray-900">বাল্ক ছবি প্রস্তুত হচ্ছে...</h4>
            <p className="text-xs text-gray-500">
              {batchProgress.current} / {batchProgress.total} ছবি সম্পন্ন হয়েছে
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
              <div 
                className="bg-red-600 h-full transition-all duration-200 rounded-full"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
});
export default BoostCanvas;
