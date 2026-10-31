import React, { type RefObject } from 'react';
import { Trash2, Plus, Images, CheckSquare, Square, Check } from 'lucide-react';
import type { AdImageItem } from '../types/boostTypes';

interface GalleryItemProps {
  item: AdImageItem;
  idx: number;
  isActive: boolean;
  isSelected: boolean;
  isMultiSelectMode: boolean;
  onItemClick: (idx: number, e: React.MouseEvent) => void;
  onToggleItemSelect: (id: string, e: React.MouseEvent) => void;
  onDeleteImage: (idx: number, e: React.MouseEvent) => void;
  itemRef: (el: HTMLDivElement | null) => void;
}

const GalleryItem = React.memo<GalleryItemProps>(({
  item,
  idx,
  isActive,
  isSelected,
  isMultiSelectMode,
  onItemClick,
  onToggleItemSelect,
  onDeleteImage,
  itemRef
}) => {
  return (
    <div
      ref={itemRef}
      onClick={(e) => onItemClick(idx, e)}
      className={`relative group shrink-0 w-28 lg:w-full rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
        isActive 
          ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md scale-[1.01] z-10' 
          : isSelected
            ? 'border-blue-400 bg-blue-50/40 shadow-xs'
            : 'border-gray-200 hover:border-gray-300 opacity-85 hover:opacity-100 bg-gray-50'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative">
        <img 
          src={item.url} 
          alt={item.name} 
          className="w-full h-full object-cover block"
          loading="lazy"
        />

        {/* Top-Left: Checkbox for Multi-Select */}
        <button
          type="button"
          onClick={(e) => onToggleItemSelect(item.id, e)}
          className={`absolute top-1 left-1 w-5 h-5 rounded-md flex items-center justify-center transition-all z-10 shadow-xs cursor-pointer ${
            isSelected
              ? 'bg-blue-600 text-white ring-1 ring-white/80'
              : 'bg-black/50 text-white/40 hover:text-white hover:bg-black/75 ring-1 ring-white/40'
          }`}
          title={isSelected ? "আন-সিলেক্ট করুন" : "সিলেক্ট করুন (Ctrl+Click)"}
        >
          <Check className={`w-3.5 h-3.5 stroke-[3] ${isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-75'}`} />
        </button>

        {/* Top-Center/Right: Index Pill */}
        <div className="absolute top-1 left-7 bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-1 py-0.2 rounded shadow-xs">
          #{idx + 1}
        </div>

        {/* Delete Button on Hover */}
        <button
          type="button"
          onClick={(e) => onDeleteImage(idx, e)}
          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 cursor-pointer"
          title="ছবিটি মুছুন"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom Meta Bar: Original File Name, Model & Price */}
      <div className={`px-1.5 py-1.5 border-t transition-colors ${
        isSelected ? 'bg-blue-50/90 border-blue-200' : 'bg-white/95 border-gray-100'
      }`}>
        {/* Original File Name Badge */}
        <div 
          className="text-[9px] font-mono font-semibold text-gray-700 truncate leading-tight mb-1 flex items-center gap-1 bg-gray-100/90 px-1 py-0.5 rounded border border-gray-200/70"
          title={`আসল ফাইলের নাম: ${item.name}`}
        >
          <span className="text-[10px] leading-none shrink-0 opacity-75">📄</span>
          <span className="truncate text-blue-700 font-bold">{item.name}</span>
        </div>

        <div className="text-[10px] font-bold text-gray-900 truncate leading-tight flex items-center justify-between">
          <span className="truncate">{item.modelNumber || 'মডেল নেই'}</span>
          {isSelected && isMultiSelectMode && (
            <span className="text-[8px] bg-blue-100 text-blue-700 font-semibold px-1 rounded-xs shrink-0">
              সিলেক্টেড
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {item.cutPrice && (
            <span className="text-[9px] text-rose-500 line-through truncate font-medium">
              {item.cutPrice}
            </span>
          )}
          <span className="text-[9px] font-bold text-blue-600 truncate font-mono">
            {item.price || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.idx === next.idx &&
         prev.isActive === next.isActive &&
         prev.isSelected === next.isSelected &&
         prev.isMultiSelectMode === next.isMultiSelectMode &&
         prev.item.id === next.item.id &&
         prev.item.url === next.item.url &&
         prev.item.name === next.item.name &&
         prev.item.modelNumber === next.item.modelNumber &&
         prev.item.price === next.item.price &&
         prev.item.cutPrice === next.item.cutPrice;
});

interface BoostGalleryProps {
  images: AdImageItem[];
  currentIndex: number;
  selectedImageIds: string[];
  onToggleSelectAll: () => void;
  onItemClick: (idx: number, e: React.MouseEvent) => void;
  onToggleItemSelect: (id: string, e: React.MouseEvent) => void;
  onDeleteImage: (idx: number, e: React.MouseEvent) => void;
  appendFileInputRef: RefObject<HTMLInputElement | null>;
}

export const BoostGallery: React.FC<BoostGalleryProps> = React.memo(({
  images,
  currentIndex,
  selectedImageIds,
  onToggleSelectAll,
  onItemClick,
  onToggleItemSelect,
  onDeleteImage,
  appendFileInputRef,
}) => {
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // Automatically scroll active thumbnail into view when switching images
  React.useEffect(() => {
    if (itemRefs.current[currentIndex]) {
      itemRefs.current[currentIndex]?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  if (images.length === 0) return null;

  const isAllSelected = images.length > 0 && selectedImageIds.length === images.length;
  const isPartiallySelected = selectedImageIds.length > 0 && selectedImageIds.length < images.length;
  const isMultiSelectMode = selectedImageIds.length > 1;

  return (
    <div className="w-full lg:w-[155px] xl:w-[180px] bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-xs flex flex-col overflow-hidden shrink-0 h-auto lg:h-full max-h-[175px] lg:max-h-full">
      {/* Header with Title & Add Button */}
      <div className="p-2 sm:p-2.5 border-b border-gray-100 bg-white/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-gray-800">
          <Images className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            গ্যালারি <span className="text-blue-600 font-mono">({images.length})</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => appendFileInputRef.current?.click()}
          className="p-1 px-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
          title="আরও ছবি যোগ করুন"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">যোগ</span>
        </button>
      </div>

      {/* Select All / Multi-Select Control Bar */}
      <div className="px-2 py-1.5 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-700 hover:text-blue-600 transition-colors cursor-pointer select-none"
          title={isAllSelected ? "সিলেকশন বাতিল করুন" : "সব ছবি নির্বাচন করুন"}
        >
          {isAllSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
          ) : isPartiallySelected ? (
            <div className="w-3.5 h-3.5 rounded border-2 border-blue-600 bg-blue-100 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-xs" />
            </div>
          ) : (
            <Square className="w-3.5 h-3.5 text-gray-400" />
          )}
          <span>{isAllSelected ? "সব সিলেক্টেড" : "সব সিলেক্ট"}</span>
        </button>

        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
          isMultiSelectMode 
            ? 'bg-blue-600 text-white shadow-2xs' 
            : 'bg-gray-200/80 text-gray-700'
        }`}>
          {selectedImageIds.length}/{images.length}
        </span>
      </div>

      {/* Vertical / Horizontal Adaptive Scrollable Thumbnail List */}
      <div className="flex-1 p-2 gap-2 custom-scrollbar flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-hidden overflow-y-hidden lg:overflow-y-auto">
        {images.map((item, idx) => (
          <GalleryItem
            key={item.id}
            item={item}
            idx={idx}
            isActive={idx === currentIndex}
            isSelected={selectedImageIds.includes(item.id)}
            isMultiSelectMode={isMultiSelectMode}
            onItemClick={onItemClick}
            onToggleItemSelect={onToggleItemSelect}
            onDeleteImage={onDeleteImage}
            itemRef={(el) => { itemRefs.current[idx] = el; }}
          />
        ))}
      </div>

      {/* Helpful shortcut hint at bottom on desktop */}
      <div className="hidden lg:block px-2 py-1.5 bg-gray-50/90 border-t border-gray-100 text-[9px] text-gray-500 text-center shrink-0">
        টিপ: <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono text-[8px] text-gray-700">Ctrl</kbd> + Click দিয়ে আলাদা সিলেক্ট করুন
      </div>
    </div>
  );
});

export default BoostGallery;
