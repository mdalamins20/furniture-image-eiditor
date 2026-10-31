import React, { useState, useEffect, useMemo } from 'react';
import { 
  TableProperties, X, Search, Sparkles, RefreshCw, Tag, 
  Trash2, Check, ExternalLink, AlertCircle
} from 'lucide-react';
import type { AdImageItem } from '../types/boostTypes';
import { 
  extractNumericPrice, calculateAutoCutPrice, formatBdNumber, 
  parsePriceFromFilename, generateModelNumber, normalizeDigitsToEnglish 
} from '../utils/priceCalculators';

interface BoostBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: AdImageItem[];
  currentIndex: number;
  onSelectImage: (index: number) => void;
  onSaveBatch: (updatedImages: AdImageItem[]) => void;
  onDeleteImage: (index: number) => void;
  customLowMarkup: number;
  customMidMarkup: number;
  customHighMarkup: number;
  startModelInput: string;
  onStartModelInputChange: (val: string) => void;
}

export const BoostBulkEditModal: React.FC<BoostBulkEditModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onSelectImage,
  onSaveBatch,
  onDeleteImage,
  customLowMarkup,
  customMidMarkup,
  customHighMarkup,
  startModelInput,
  onStartModelInputChange
}) => {
  const [draftImages, setDraftImages] = useState<AdImageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkStartModel, setBulkStartModel] = useState(startModelInput || 'B-100');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync draft images on open
  useEffect(() => {
    if (isOpen) {
      setDraftImages(images.map(img => ({ ...img })));
      setBulkStartModel(startModelInput || 'B-100');
      setIsSavedRecently(false);
    }
  }, [isOpen, images, startModelInput]);

  // Filtered rows for fast searching
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return draftImages;
    const q = searchQuery.toLowerCase();
    return draftImages.filter(img => 
      img.name.toLowerCase().includes(q) || 
      (img.modelNumber && img.modelNumber.toLowerCase().includes(q)) ||
      (img.price && img.price.toLowerCase().includes(q))
    );
  }, [draftImages, searchQuery]);

  if (!isOpen) return null;

  // Update a single draft item
  const handleUpdateField = (index: number, field: 'modelNumber' | 'price' | 'cutPrice', val: string) => {
    setDraftImages(prev => {
      const copy = [...prev];
      const item = { ...copy[index] };
      const normalized = normalizeDigitsToEnglish(val);

      if (field === 'price') {
        item.price = normalized;
        const num = extractNumericPrice(normalized);
        if (num > 0) {
          const autoCut = calculateAutoCutPrice(num, customLowMarkup, customMidMarkup, customHighMarkup);
          item.cutPrice = formatBdNumber(autoCut);
        }
      } else if (field === 'cutPrice') {
        item.cutPrice = normalized;
      } else if (field === 'modelNumber') {
        item.modelNumber = normalized.toUpperCase();
      }

      copy[index] = item;
      return copy;
    });
  };

  // Re-calculate single row cut price
  const handleRecalculateSingleCut = (index: number) => {
    setDraftImages(prev => {
      const copy = [...prev];
      const item = { ...copy[index] };
      const num = extractNumericPrice(item.price);
      if (num > 0) {
        const autoCut = calculateAutoCutPrice(num, customLowMarkup, customMidMarkup, customHighMarkup);
        item.cutPrice = formatBdNumber(autoCut);
      }
      copy[index] = item;
      return copy;
    });
  };

  // Batch action: Apply model series to all images
  const handleApplyModelSeriesAll = () => {
    onStartModelInputChange(bulkStartModel);
    setDraftImages(prev => prev.map((item, idx) => ({
      ...item,
      modelNumber: generateModelNumber(bulkStartModel, idx)
    })));
  };

  // Batch action: Auto detect prices from filenames
  const handleAutoDetectAllPrices = () => {
    setDraftImages(prev => prev.map(item => {
      const detected = parsePriceFromFilename(item.name);
      const actual = detected || item.price || '25,000/-';
      const num = extractNumericPrice(actual);
      const autoCut = formatBdNumber(calculateAutoCutPrice(num, customLowMarkup, customMidMarkup, customHighMarkup));
      return {
        ...item,
        price: actual,
        cutPrice: autoCut
      };
    }));
  };

  // Batch action: Recalculate cut prices
  const handleRecalculateAllCutPrices = () => {
    setDraftImages(prev => prev.map(item => {
      const num = extractNumericPrice(item.price);
      const autoCut = formatBdNumber(calculateAutoCutPrice(num, customLowMarkup, customMidMarkup, customHighMarkup));
      return {
        ...item,
        cutPrice: autoCut
      };
    }));
  };

  // Delete an image from draft & parent
  const handleDeleteRow = (originalIndex: number) => {
    setDraftImages(prev => prev.filter((_, idx) => idx !== originalIndex));
    onDeleteImage(originalIndex);
  };

  // Save changes and apply
  const handleSaveAndClose = () => {
    onSaveBatch(draftImages);
    setIsSavedRecently(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between border-b border-gray-700/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">বাল্ক এডিটর (Bulk Editor)</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-mono font-bold">
                  {draftImages.length} টি ছবি
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                সব ছবির মডেল (M:-), বিক্রয় মূল্য (P:-) এবং কাটা দাম এক টেবিলে সহজে এডিট করুন
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Batch Quick Operations Bar */}
        <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Quick Model Series Set */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-gray-300 shadow-xs">
              <span className="text-xs font-bold text-gray-600">শুরুর মডেল:</span>
              <input 
                type="text"
                value={bulkStartModel}
                onChange={(e) => setBulkStartModel(e.target.value.toUpperCase())}
                placeholder="B-100"
                className="w-20 px-2 py-0.5 text-xs font-mono font-bold text-blue-600 outline-none uppercase"
              />
              <button
                onClick={handleApplyModelSeriesAll}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                title="সব ছবিতে সিরিয়াল মডেল বসান"
              >
                <RefreshCw className="w-3 h-3" />
                <span>সিরিজ বসান</span>
              </button>
            </div>

            <button
              onClick={handleAutoDetectAllPrices}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="সব ছবির ফাইলনেম থেকে অটো প্রাইজ ডিটেক্ট করুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>ফাইল থেকে প্রাইজ ডিটেক্ট</span>
            </button>

            <button
              onClick={handleRecalculateAllCutPrices}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="সব ছবিতে কাটা দাম পুনরায় হিসাব করুন"
            >
              <Tag className="w-3.5 h-3.5 text-rose-600" />
              <span>কাটা দাম রিক্যালকুলেট</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মডেল বা ফাইলের নাম খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-[300px]">
          {filteredImages.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-8 h-8 text-gray-300" />
              <p className="text-sm font-medium">কোনো ছবি পাওয়া যায়নি</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100/90 backdrop-blur sticky top-0 z-10 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 w-20">প্রিভিউ</th>
                  <th className="py-2.5 px-3 min-w-[140px]">ফাইল নেম</th>
                  <th className="py-2.5 px-3 w-36">মডেল (M:-)</th>
                  <th className="py-2.5 px-3 w-40">আসল দাম (P:-)</th>
                  <th className="py-2.5 px-3 w-44">কাটা দাম (লাল)</th>
                  <th className="py-2.5 px-3 w-28 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredImages.map((item) => {
                  const originalIndex = draftImages.findIndex(img => img.id === item.id);
                  const isCurrent = originalIndex === currentIndex;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-blue-50/40 transition-colors ${isCurrent ? 'bg-blue-50/70 font-semibold' : ''}`}
                    >
                      {/* # Index */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-400">
                        {originalIndex + 1}
                      </td>

                      {/* Thumbnail Preview */}
                      <td className="py-2.5 px-3">
                        <div 
                          className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all shadow-2xs"
                          onClick={() => onSelectImage(originalIndex)}
                          title="এই ছবিটিতে যেতে ক্লিক করুন"
                        >
                          <img 
                            src={item.url} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </td>

                      {/* File Name */}
                      <td className="py-2.5 px-3">
                        <div className="max-w-[180px] sm:max-w-xs truncate text-gray-700 font-medium" title={item.name}>
                          {item.name}
                        </div>
                        {isCurrent && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-bold">
                            বর্তমানে ক্যানভাসে সক্রিয়
                          </span>
                        )}
                      </td>

                      {/* Model Input */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-blue-600 shrink-0">M:-</span>
                          <input 
                            type="text"
                            value={item.modelNumber || ''}
                            onChange={(e) => handleUpdateField(originalIndex, 'modelNumber', e.target.value)}
                            placeholder="B-100"
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 uppercase outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </td>

                      {/* Actual Price Input */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-amber-600 shrink-0">P:-</span>
                          <input 
                            type="text"
                            value={item.price || ''}
                            onChange={(e) => handleUpdateField(originalIndex, 'price', e.target.value)}
                            placeholder="19,000/-"
                            className="w-full px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </td>

                      {/* Cut Price Input */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <input 
                            type="text"
                            value={item.cutPrice || ''}
                            onChange={(e) => handleUpdateField(originalIndex, 'cutPrice', e.target.value)}
                            placeholder="23,000"
                            className="w-full px-2 py-1 bg-white border border-red-300 rounded-lg text-xs font-mono font-bold text-red-600 line-through outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          />
                          <button
                            onClick={() => handleRecalculateSingleCut(originalIndex)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors shrink-0"
                            title="প্রাইস অনুযায়ী পুনরায় কাটা দাম হিসাব করুন"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectImage(originalIndex)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            title="ক্যানভাসে এই ছবিটি প্রদর্শন করুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(originalIndex)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="এই ছবিটি তালিকা থেকে বাদ দিন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-gray-500">
            মোট <span className="font-bold text-gray-800">{draftImages.length}</span> টি ছবির তথ্য প্রদর্শিত হচ্ছে
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              বাতিল করুন
            </button>

            <button
              onClick={handleSaveAndClose}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 active:scale-98"
            >
              {isSavedRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>সংরক্ষিত হয়েছে!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>পরিবর্তনগুলো সংরক্ষণ করুন (Save & Apply)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BoostBulkEditModal;
