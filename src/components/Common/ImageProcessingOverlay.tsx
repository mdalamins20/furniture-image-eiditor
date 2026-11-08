import React from 'react';
import { Sparkles, CheckCircle2, Clock, Image as ImageIcon, Layers } from 'lucide-react';

export interface ImageProcessingOverlayProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
  currentFileName?: string;
  totalImages: number;
  processedCount: number;
  remainingCount: number;
  estimatedSeconds?: number;
  progress: number; // 0 to 100
  onSkip?: () => void;
}

export const ImageProcessingOverlay: React.FC<ImageProcessingOverlayProps> = ({
  isVisible,
  title = 'ছবিগুলো গুছিয়ে প্রস্তুত করা হচ্ছে...',
  subtitle = 'মেঝে, লোগো ও নম্বর নিখুঁত পজিশনে স্বয়ংক্রিয়ভাবে সাজানো হচ্ছে',
  currentFileName,
  totalImages,
  processedCount,
  remainingCount,
  estimatedSeconds = 0,
  progress,
  onSkip
}) => {
  if (!isVisible) return null;

  const isCompleted = progress >= 100 || (totalImages > 0 && processedCount >= totalImages);
  const safeProgress = Math.min(100, Math.max(4, Math.round(progress)));

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-900/30 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      aria-live="polite"
    >
      {/* Soft Ambient Light Glow */}
      <div className="absolute w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Clean White Glass Card */}
      <div className="relative w-full max-w-md bg-white/98 backdrop-blur-2xl rounded-3xl border border-gray-200/90 shadow-[0_25px_70px_rgba(0,0,0,0.14)] p-6 sm:p-7 flex flex-col items-center text-center overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Top Active Shimmer Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />

        {/* Animated Icon */}
        <div className="relative mb-3.5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center shadow-xs">
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-in zoom-in-75 duration-200" />
            ) : (
              <Layers className="w-7 h-7 text-blue-600 animate-bounce duration-1000" />
            )}
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
            <Sparkles className="w-3 h-3 animate-spin duration-3000" />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-base sm:text-[17px] font-bold text-gray-900 tracking-tight mb-1">
          {isCompleted ? '✨ সব ছবি সফলভাবে প্রস্তুত!' : title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-xs">
          {subtitle}
        </p>

        {/* Real-time Live Stats Box (মোট ছবি, প্রসেস হয়েছে, বাকি আছে) */}
        <div className="w-full grid grid-cols-3 gap-2 bg-gray-50/90 rounded-2xl p-2.5 border border-gray-200/80 mb-4">
          {/* Total */}
          <div className="flex flex-col items-center justify-center py-1 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <span className="text-[10px] font-bold text-gray-500 uppercase">মোট ছবি</span>
            <span className="text-sm font-extrabold text-gray-900 font-mono mt-0.5">{totalImages} টি</span>
          </div>

          {/* Processed */}
          <div className="flex flex-col items-center justify-center py-1 bg-white rounded-xl border border-blue-100 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-600 uppercase">প্রসেস হয়েছে</span>
            <span className="text-sm font-extrabold text-blue-600 font-mono mt-0.5">{processedCount} টি</span>
          </div>

          {/* Remaining */}
          <div className="flex flex-col items-center justify-center py-1 bg-white rounded-xl border border-gray-100 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-500 uppercase">বাকি আছে</span>
            <span className="text-sm font-extrabold text-rose-600 font-mono mt-0.5">{remainingCount} টি</span>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-1.5 mb-3.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1.5 truncate max-w-[240px]">
              <ImageIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{currentFileName || 'ছবি প্রসেস হচ্ছে...'}</span>
            </span>
            <span className="text-xs font-mono font-extrabold text-blue-600 shrink-0">
              {safeProgress}%
            </span>
          </div>

          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-200/80">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-200 shadow-xs"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        {/* Bottom Time Estimate Bar */}
        <div className="w-full flex items-center justify-between pt-3 border-t border-gray-100 text-[11px] text-gray-600 font-medium">
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60 font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {isCompleted 
                ? 'ক্যানভাস উন্মোচিত হচ্ছে...' 
                : estimatedSeconds > 0 
                  ? `আর মাত্র ${estimatedSeconds} সেকেন্ড বাকি...` 
                  : 'অল্প কিছুক্ষণ অপেক্ষা করুন...'}
            </span>
          </div>

          <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200/60">
            {isCompleted ? '✓ সম্পন্ন' : '⚡ দ্রুত সাজানো হচ্ছে'}
          </span>
        </div>

        {/* Optional Skip Button for massive bulk uploads */}
        {!isCompleted && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-3.5 w-full py-2 px-3 text-xs font-semibold text-gray-600 hover:text-blue-700 bg-gray-100/80 hover:bg-blue-50 border border-gray-200/80 hover:border-blue-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>স্ক্যানিং বাদ দিয়ে সরাসরি এডিটে যান (Skip)</span>
            <span className="text-[10px] text-gray-400 font-normal">→</span>
          </button>
        )}

      </div>
    </div>
  );
};

export default ImageProcessingOverlay;
