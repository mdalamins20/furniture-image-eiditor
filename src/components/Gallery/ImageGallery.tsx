import React from 'react';
import { X } from 'lucide-react';
import { useEditorContext } from '../../context/EditorContext';
import type { ImageSetting } from '../../types';

const Thumbnail = React.memo(function Thumbnail({ imageUrl, setting }: { imageUrl: string; setting: ImageSetting | undefined }) {
  const br = setting?.brightness ?? 100;
  const co = setting?.contrast ?? 100;
  const sa = setting?.saturation ?? 100;
  const wa = setting?.warmth ?? 0;

  return (
    <img
      src={imageUrl}
      className="w-full h-full object-cover"
      style={{
        filter: `brightness(${br}%) contrast(${co}%) saturate(${sa}%) sepia(${wa}%)`
      }}
      draggable={false}
      alt="Thumbnail"
      loading="lazy"
    />
  );
});

export default function ImageGallery() {
  const {
    mainImages, previewUrls, imageSettings,
    selectedIndices, setSelectedIndices,
    previewIndex, setPreviewIndex, removeImage
  } = useEditorContext();

  if (mainImages.length === 0) return null;

  return (
    <div className="w-full lg:w-[130px] xl:w-[155px] flex-shrink-0 flex flex-col h-full mt-6 lg:mt-0">
      <div className="bg-white/60 backdrop-blur-xl p-3 rounded-[36px] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.05)] border border-white/50 flex-1 flex flex-col h-full overflow-hidden">
        <div className="text-[11px] font-bold text-gray-800 mb-3 text-center uppercase tracking-widest pt-2">
          গ্যালারি ({mainImages.length})
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2.5 px-1 custom-scrollbar">
          {mainImages.map((_file, idx) => {
            const isSelected = selectedIndices.has(idx);
            const isPreview = previewIndex === idx;
            const setting = imageSettings[idx];
            const showroomName = setting?.assignedShowroom?.name;
            const previewUrl = previewUrls[idx];
            
            return (
              <div 
                key={idx}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    const newSelection = new Set(selectedIndices);
                    if (newSelection.has(idx)) newSelection.delete(idx);
                    else newSelection.add(idx);
                    setSelectedIndices(newSelection);
                    setPreviewIndex(idx);
                  } else {
                    setSelectedIndices(new Set([idx]));
                    setPreviewIndex(idx);
                  }
                }}
                className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all group ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-sm'
                    : isPreview
                    ? 'border-blue-300'
                    : 'border-transparent hover:border-blue-200'
                }`}
              >
                {/* Live preview thumbnail with logo + number */}
                <div className="aspect-square overflow-hidden bg-gray-100 rounded-[10px]">
                  {previewUrl ? (
                    <Thumbnail
                      key={`${idx}-${setting?.brightness}-${setting?.contrast}-${setting?.saturation}-${setting?.warmth}`}
                      imageUrl={previewUrl}
                      setting={setting}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse rounded-[10px]" />
                  )}
                </div>

                {/* Showroom name */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
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
          })}
        </div>
        
        <div className="mt-2 flex gap-1.5">
          <button 
            onClick={() => setSelectedIndices(new Set(mainImages.map((_, i) => i)))}
            className="flex-1 py-1.5 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            সব সিলেক্ট
          </button>
          <button 
            onClick={() => setSelectedIndices(new Set())}
            className="flex-1 py-1.5 text-[10px] font-semibold bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
          >
            বাতিল
          </button>
        </div>
      </div>
    </div>
  );
}
