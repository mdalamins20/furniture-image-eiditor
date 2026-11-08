import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';

interface GalleryCardProps {
  idx: number;
  isSelected: boolean;
  isPreview: boolean;
  previewUrl?: string;
  showroomName?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  warmth?: number;
  onSelect: (idx: number, e: React.MouseEvent) => void;
  onDelete: (idx: number, e: React.MouseEvent) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}

const GalleryCard = React.memo(function GalleryCard({
  idx,
  isSelected,
  isPreview,
  previewUrl,
  showroomName,
  brightness = 100,
  contrast = 100,
  saturation = 100,
  warmth = 0,
  onSelect,
  onDelete,
  cardRef
}: GalleryCardProps) {
  return (
    <div 
      ref={cardRef}
      onClick={(e) => onSelect(idx, e)}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '90px' }}
      className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all group shrink-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-full lg:h-auto ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-sm'
          : isPreview
          ? 'border-blue-300'
          : 'border-transparent hover:border-blue-200'
      }`}
    >
      {/* Live preview thumbnail */}
      <div className="aspect-square overflow-hidden bg-gray-100 rounded-[10px]">
        {previewUrl ? (
          <img
            src={previewUrl}
            className="w-full h-full object-cover"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${warmth}%)`
            }}
            draggable={false}
            alt={`Thumbnail ${idx + 1}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse rounded-[10px]" />
        )}
      </div>

      {/* Showroom name badge */}
      {showroomName ? (
        <div className="bg-white/95 px-1 py-0.5 text-center">
          <p className="text-[8px] font-semibold text-gray-600 leading-tight truncate">{showroomName}</p>
        </div>
      ) : (
        <div className="bg-gray-50 px-1 py-0.5 text-center">
          <p className="text-[8px] text-gray-300 leading-tight truncate">—</p>
        </div>
      )}

      {/* Selected checkmark badge */}
      {isSelected && (
        <div className="absolute top-1 left-1 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center shadow z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )}

      {/* Remove button (X) */}
      <button
        type="button"
        onClick={(e) => onDelete(idx, e)}
        className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
        title="ছবি মুছুন"
      >
        <X className="w-3 h-3" strokeWidth={3} />
      </button>

      {/* Current preview indicator */}
      {isPreview && !isSelected && (
        <div className="absolute top-1 left-1 bg-blue-500/90 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm z-10">
          ▶
        </div>
      )}

      {/* Image number badge */}
      <div className="absolute bottom-[22px] left-1 bg-black/40 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm backdrop-blur-sm">
        {idx + 1}
      </div>
    </div>
  );
});

export default function ImageGallery() {
  const {
    mainImages, previewUrls, imageSettings,
    selectedIndices, setSelectedIndices,
    previewIndex, setPreviewIndex, removeImage
  } = useEditorContext();

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Automatically scroll the gallery to bring the active image thumbnail into view
  useEffect(() => {
    const activeEl = itemRefs.current[previewIndex];
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [previewIndex]);

  const handleSelect = useCallback((idx: number, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedIndices(prev => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
      setPreviewIndex(idx);
    } else {
      setSelectedIndices(new Set([idx]));
      setPreviewIndex(idx);
    }
  }, [setSelectedIndices, setPreviewIndex]);

  const handleDelete = useCallback((idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeImage(idx);
  }, [removeImage]);

  if (mainImages.length === 0) return null;

  return (
    <div className="w-full lg:w-[130px] xl:w-[155px] flex-shrink-0 flex flex-col h-auto lg:h-full mt-2 lg:mt-0">
      <div className="bg-white/60 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.05)] border border-white/50 flex-1 flex flex-col h-auto lg:h-full overflow-hidden">
        <div className="text-[11px] font-bold text-gray-800 mb-3 text-center uppercase tracking-widest pt-2">
          গ্যালারি ({mainImages.length})
        </div>
        
        <div className="flex-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-y-auto gap-2 lg:gap-0 lg:space-y-2.5 px-1 py-1 custom-scrollbar">
          {mainImages.map((_file, idx) => {
            const isSelected = selectedIndices.has(idx);
            const isPreview = previewIndex === idx;
            const setting = imageSettings[idx];
            
            return (
              <GalleryCard
                key={idx}
                idx={idx}
                isSelected={isSelected}
                isPreview={isPreview}
                previewUrl={previewUrls[idx]}
                showroomName={setting?.assignedShowroom?.name}
                brightness={setting?.brightness}
                contrast={setting?.contrast}
                saturation={setting?.saturation}
                warmth={setting?.warmth}
                onSelect={handleSelect}
                onDelete={handleDelete}
                cardRef={(el) => { itemRefs.current[idx] = el; }}
              />
            );
          })}
        </div>
        
        <div className="mt-2 flex gap-1.5">
          <button 
            type="button"
            onClick={() => setSelectedIndices(new Set(mainImages.map((_, i) => i)))}
            className="flex-1 py-1.5 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
          >
            সব সিলেক্ট
          </button>
          <button 
            type="button"
            onClick={() => setSelectedIndices(new Set())}
            className="flex-1 py-1.5 text-[10px] font-semibold bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            বাতিল
          </button>
        </div>
      </div>
    </div>
  );
}
