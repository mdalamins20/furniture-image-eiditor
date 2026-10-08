import { useState, useMemo } from 'react';
import { Upload, SlidersHorizontal, RotateCcw, Store, Search, Check, Save } from 'lucide-react';
import { useEditorContext } from '../../../context/EditorContext';
import { SHOWROOMS } from '../../../types';
import { analyzeImageForEmptySpace } from '../../../utils/imageAnalyzer';

export default function SetupInspector() {
  const {
    mainImages, setMainImages,
    setPreviewUrls,
    imageSettings, setImageSettings,
    selectedShowroom, setSelectedShowroom,
    previewIndex, setPreviewIndex,
    setSelectedIndices, selectedIndices,
    setIsProcessing,
    brightness, setBrightness,
    contrast, setContrast,
    saturation, setSaturation,
    warmth, setWarmth,
    defaultLogoPos,
    defaultNumberPos,
    defaultWatermarkPos,
    numberText,
    logoUrl,
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    textTransform,
    numberColor,
    numberBgColor,
    numberSize,
    padX,
    padY,
    customRadius,
    numberStyle,
    numberOutlineThickness,
    numberOutlineBlur,
    logoSize,
    enableLogoShadow,
    logoShadowColor,
    logoShadowBlur,
    logoShadowIntensity,
    enableWatermark,
    watermarkText,
    watermarkStyle,
    watermarkOpacity,
    watermarkSize,
    watermarkColor,
    watermarkFontFamily,
    watermarkFontWeight,
    watermarkFontStyle,
    watermarkTextDecoration,
    watermarkTextTransform,
    watermarkLetterSpacing,
    watermarkCustomAngle,
    watermarkIsGrid,
    watermarkGridSpacing,
    isSavedToStorage,
    resetToDefaults,
    updateSetting, updateSettingsBatch, recordSnapshot
  } = useEditorContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const currentSetting = imageSettings[previewIndex];

  // Filter showrooms by search query
  const filteredShowrooms = useMemo(() => {
    if (!searchQuery.trim()) return SHOWROOMS;
    const q = searchQuery.toLowerCase();
    return SHOWROOMS.filter(s => s.name.toLowerCase().includes(q) || s.numbers.includes(q));
  }, [searchQuery]);

  // Handle showroom selection
  const handleSelectShowroom = (showroomName: string) => {
    recordSnapshot();
    const showroom = SHOWROOMS.find(s => s.name === showroomName);
    if (!showroom) return;

    setSelectedShowroom(showroom.name);

    const isAllSelected = selectedIndices.size > 0 && selectedIndices.size === mainImages.length;

    if (isAllSelected || selectedIndices.size === 0) {
      updateSetting('assignedShowroom', showroom);
      updateSetting('numberText', showroom.numbers);
      updateSetting('logoUrl', `/logos/${showroom.file}`);
    } else {
      setImageSettings(prev => {
        const next = [...prev];
        selectedIndices.forEach(idx => {
          next[idx] = {
            ...(next[idx] || {}),
            assignedShowroom: showroom,
            numberText: showroom.numbers,
            logoUrl: `/logos/${showroom.file}`
          } as any;
        });
        return next;
      });
    }
  };

  // Handle file uploads with automatic inheritance of saved preferences
  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    recordSnapshot();
    setIsProcessing(true);

    const newUrls = files.map(file => URL.createObjectURL(file));

    setPreviewUrls(prev => {
      prev.forEach(u => URL.revokeObjectURL(u));
      return newUrls;
    });

    setPreviewIndex(0);
    setSelectedIndices(new Set([0]));

    const newSettings = files.map(file => {
      const fName = file.name.toLowerCase().replace(/\.[^/.]+$/, "").trim();
      let matchedShowroom = SHOWROOMS.find(s => s.name.toLowerCase().trim() === fName);
      if (!matchedShowroom) {
        const fNameStripped = fName.replace(/\s*\(\d+\)\s*$/, "").trim();
        if (fNameStripped.length >= 3) {
          matchedShowroom = SHOWROOMS.find(s => s.name.toLowerCase().trim() === fNameStripped);
        }
      }

      // Base settings inherit from user's current persistent configuration!
      const base: any = {
        logoPos: { ...defaultLogoPos },
        numberPos: { ...defaultNumberPos },
        watermarkPos: { ...defaultWatermarkPos },
        isLogoPosManual: true,
        isNumberPosManual: true,
        isWatermarkPosManual: true,
        numberText: matchedShowroom ? matchedShowroom.numbers : numberText,
        logoUrl: matchedShowroom ? `/logos/${matchedShowroom.file}` : logoUrl,
        assignedShowroom: matchedShowroom || (selectedShowroom ? SHOWROOMS.find(s => s.name === selectedShowroom) : undefined),
        fontFamily,
        fontWeight,
        fontStyle,
        textDecoration,
        textTransform,
        numberColor,
        numberBgColor,
        numberSize,
        padX,
        padY,
        customRadius,
        numberStyle,
        numberOutlineThickness,
        numberOutlineBlur,
        logoSize,
        enableLogoShadow,
        logoShadowColor,
        logoShadowBlur,
        logoShadowIntensity,
        enableWatermark,
        watermarkText,
        watermarkStyle,
        watermarkOpacity,
        watermarkSize,
        watermarkColor,
        watermarkFontFamily,
        watermarkFontWeight,
        watermarkFontStyle,
        watermarkTextDecoration,
        watermarkTextTransform,
        watermarkLetterSpacing,
        watermarkCustomAngle,
        watermarkIsGrid,
        watermarkGridSpacing,
        brightness,
        contrast,
        saturation,
        warmth,
      };

      return base;
    });

    setImageSettings(newSettings);
    setMainImages(files);

    // Fast background analysis for optional empty space detection without overriding manual setup
    Promise.all(files.map(f => analyzeImageForEmptySpace(f)))
      .then(positions => {
        setImageSettings(curr => {
          const updated = [...curr];
          for (let i = 0; i < positions.length; i++) {
            if (updated[i] && !updated[i].isLogoPosManual) {
              updated[i] = {
                ...updated[i],
                logoPos: positions[i].logoPos,
                numberPos: positions[i].numberPos
              };
            }
          }
          return updated;
        });
      })
      .finally(() => setIsProcessing(false));
  };

  // Curated Furniture Studio Presets
  const applyPreset = (settings: { brightness: number; contrast: number; saturation: number; warmth: number }) => {
    updateSettingsBatch(settings, {
      brightness: setBrightness,
      contrast: setContrast,
      saturation: setSaturation,
      warmth: setWarmth
    });
  };

  const handleResetFilters = () => {
    applyPreset({ brightness: 100, contrast: 100, saturation: 100, warmth: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Storage Status & Reset Pill */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
          <span className={`w-2 h-2 rounded-full ${isSavedToStorage ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-amber-500 animate-pulse'}`} />
          <span className="flex items-center gap-1">
            <Save className="w-3.5 h-3.5 text-emerald-600" />
            {isSavedToStorage ? 'সব সেটিংস লোকাল স্টোরেজে সংরক্ষিত' : 'সেভ হচ্ছে...'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('আপনি কি সব সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
              resetToDefaults();
            }
          }}
          className="text-[11px] font-medium text-gray-500 hover:text-rose-600 transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-rose-50"
          title="ডিফল্ট সেটিংসে ফিরিয়ে নিন"
        >
          রিসেট
        </button>
      </div>
      {/* 1. Showroom Quick Selector */}
      <div className="bg-white/60 backdrop-blur-xl p-4.5 rounded-[24px] border border-white/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.06)] space-y-3.5 transition-all">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
              <Store className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="text-[13px] font-bold text-gray-800 tracking-wide">শোরুম সিলেক্টর</h3>
          </div>
          {currentSetting?.assignedShowroom && (
            <span className="text-[10px] font-bold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200/60 shadow-sm">
              {currentSetting.assignedShowroom.name}
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="শোরুমের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] font-medium bg-white/70 border border-gray-200/80 rounded-xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-gray-700 placeholder-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
          />
        </div>

        {/* Quick Tag Pills */}
        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1.5 custom-scrollbar">
          {filteredShowrooms.map(showroom => {
            const isCurrent = (currentSetting?.assignedShowroom?.name || selectedShowroom) === showroom.name;
            return (
              <button
                key={showroom.name}
                onClick={() => handleSelectShowroom(showroom.name)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left rounded-xl text-[13px] transition-all duration-200 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-[0_4px_12px_rgba(0,113,227,0.25)] scale-[1.01]'
                    : 'bg-white/60 hover:bg-white text-gray-700 font-medium border border-gray-200/50 hover:border-gray-300/60 hover:shadow-sm'
                }`}
              >
                <span className="truncate">{showroom.name}</span>
                {isCurrent && <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Photo Upload & Dropzone */}
      <div className="bg-white/60 backdrop-blur-xl p-4.5 rounded-[24px] border border-white/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.06)] space-y-3.5 transition-all">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="text-[13px] font-bold text-gray-800 tracking-wide">ছবি যোগ করুন</h3>
          </div>
          <span className="text-[11px] font-bold text-gray-500 bg-gray-100/80 px-2.5 py-1 rounded-full">
            মোট: {mainImages.length} টি
          </span>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleUpload(Array.from(e.dataTransfer.files));
          }}
          className={`relative border-2 border-dashed rounded-[18px] p-5 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 scale-[0.98]'
              : 'border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/30'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) handleUpload(Array.from(e.target.files));
              e.target.value = '';
            }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isDragging ? 'bg-blue-200 text-blue-700 scale-110' : 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50'}`}>
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[13px] font-bold text-gray-700">ছবি আপলোড করতে ক্লিক করুন</p>
              <p className="text-[11px] text-gray-400 font-medium">বা ছবি টেনে এনে ছেড়ে দিন</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Photo Adjustments & Furniture Color Grading */}
      {(() => {
        const curBrightness = currentSetting?.brightness ?? brightness;
        const curContrast = currentSetting?.contrast ?? contrast;
        const curSaturation = currentSetting?.saturation ?? saturation;
        const curWarmth = currentSetting?.warmth ?? warmth;
        const isFiltered = curBrightness !== 100 || curContrast !== 100 || curSaturation !== 100 || curWarmth !== 0;

        return (
          <div className="bg-white/60 backdrop-blur-xl p-4.5 rounded-[24px] border border-white/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.06)] space-y-4 transition-all">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h3 className="text-[13px] font-bold text-gray-800 tracking-wide">ফটো কালার ও ফিল্টার</h3>
                {isFiltered && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse ring-2 ring-blue-100" title="ফিল্টার সক্রিয়" />
                )}
              </div>
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-red-500 hover:text-red-600 bg-red-50/80 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                  title="সব ফিল্টার রিসেট করুন"
                >
                  <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
                  <span>রিসেট</span>
                </button>
              )}
            </div>

            {/* 1-Click Furniture Studio Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500">স্টুডিও প্রিসেট</span>
                <span className="text-[10px] text-gray-400">১-ক্লিকে কালার গ্রেডিং</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset({ brightness: 102, contrast: 112, saturation: 115, warmth: 14 })}
                  className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/60 text-left transition-all group active:scale-95"
                >
                  <span className="text-base">🪵</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-amber-950 group-hover:text-amber-800 truncate">ন্যাচারাল উড</span>
                    <span className="text-[9px] text-amber-700/80 leading-tight truncate">কাঠের ডিপ টেক্সচার</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset({ brightness: 108, contrast: 116, saturation: 108, warmth: 0 })}
                  className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/60 text-left transition-all group active:scale-95"
                >
                  <span className="text-base">💎</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-blue-950 group-hover:text-blue-800 truncate">স্টুডিও এইচডি</span>
                    <span className="text-[9px] text-blue-700/80 leading-tight truncate">হাই ক্লিয়ারিটি লাইট</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset({ brightness: 102, contrast: 112, saturation: 94, warmth: 0 })}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 text-left transition-all group active:scale-95"
                >
                  <span className="text-base">🛋️</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-slate-900 group-hover:text-slate-700 truncate">মডার্ন কুল</span>
                    <span className="text-[9px] text-slate-600 leading-tight truncate">মিনিমাল ইন্টেরিয়র</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset({ brightness: 104, contrast: 110, saturation: 135, warmth: 4 })}
                  className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/60 text-left transition-all group active:scale-95"
                >
                  <span className="text-base">🎨</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-rose-950 group-hover:text-rose-800 truncate">ভাইব্রেন্ট ফেব্রিক</span>
                    <span className="text-[9px] text-rose-700/80 leading-tight truncate">উজ্জ্বল সোফা ও কাপড়</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="space-y-3 pt-1 border-t border-gray-100">
              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>ব্রাইটনেস (আলো)</span>
                    {curBrightness !== 100 && (
                      <button
                        type="button"
                        onClick={() => updateSetting('brightness', 100, setBrightness as any)}
                        className="text-[9px] text-blue-600 hover:underline"
                      >
                        রিসেট
                      </button>
                    )}
                  </span>
                  <span className="font-semibold text-blue-600">{curBrightness}%</span>
                </div>
                <input
                  type="range" min="50" max="150"
                  value={curBrightness}
                  onChange={(e) => updateSetting('brightness', Number(e.target.value), setBrightness as any)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>কন্ট্রাস্ট (গভীরতা)</span>
                    {curContrast !== 100 && (
                      <button
                        type="button"
                        onClick={() => updateSetting('contrast', 100, setContrast as any)}
                        className="text-[9px] text-blue-600 hover:underline"
                      >
                        রিসেট
                      </button>
                    )}
                  </span>
                  <span className="font-semibold text-blue-600">{curContrast}%</span>
                </div>
                <input
                  type="range" min="50" max="150"
                  value={curContrast}
                  onChange={(e) => updateSetting('contrast', Number(e.target.value), setContrast as any)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>স্যাচুরেশন (রঙের ঘনত্ব)</span>
                    {curSaturation !== 100 && (
                      <button
                        type="button"
                        onClick={() => updateSetting('saturation', 100, setSaturation as any)}
                        className="text-[9px] text-blue-600 hover:underline"
                      >
                        রিসেট
                      </button>
                    )}
                  </span>
                  <span className="font-semibold text-blue-600">{curSaturation}%</span>
                </div>
                <input
                  type="range" min="0" max="200"
                  value={curSaturation}
                  onChange={(e) => updateSetting('saturation', Number(e.target.value), setSaturation as any)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Warmth */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px] text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span>উড ওয়ার্মথ (কাঠের আভা)</span>
                    {curWarmth !== 0 && (
                      <button
                        type="button"
                        onClick={() => updateSetting('warmth', 0, setWarmth as any)}
                        className="text-[9px] text-blue-600 hover:underline"
                      >
                        রিসেট
                      </button>
                    )}
                  </span>
                  <span className="font-semibold text-blue-600">{curWarmth}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={curWarmth}
                  onChange={(e) => updateSetting('warmth', Number(e.target.value), setWarmth as any)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
