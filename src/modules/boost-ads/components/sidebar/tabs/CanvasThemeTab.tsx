import React, { useState } from 'react';
import { 
  Move, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Type, 
  Bold, Italic, Underline, Strikethrough, Space as SpaceIcon, 
  Baseline, Sliders, ChevronDown, ChevronUp, Palette, RotateCcw, Tag, Copy
} from 'lucide-react';
import { FONTS } from '../../../../../types';
import type { 
  CardTheme, SelectedElement, BadgeDisplayStyle 
} from '../../../types/boostTypes';

// Classic BD Furniture Color Presets (matching Daily Post Editor)
const CLASSIC_PALETTES = [
  { name: 'হলুদ-কালো', bg: '#FFD700', text: '#000000' },
  { name: 'রয়্যাল ব্লু', bg: '#0071E3', text: '#FFFFFF' },
  { name: 'প্রিমিয়াম ব্ল্যাক', bg: '#18181B', text: '#F4F4F5' },
  { name: 'ক্রিমসন রেড', bg: '#DC2626', text: '#FFFFFF' },
  { name: 'এমারেল্ড গ্রিন', bg: '#059669', text: '#FFFFFF' },
  { name: 'গোল্ডেন উড', bg: '#B45309', text: '#FFFFFF' },
];

interface CanvasThemeTabProps {
  cardPos: { x: number; y: number };
  onCardPosChange: (pos: { x: number; y: number }) => void;
  selectedElement: SelectedElement;
  onSelectCardElement: () => void;
  cardTheme: CardTheme;
  onSelectCardTheme: (theme: CardTheme) => void;
  minimalTextColor: 'dark' | 'light';
  onSelectMinimalTextColor: (color: 'dark' | 'light') => void;
  cardScale: number;
  onCardScaleChange: (scale: number) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  showShowroomName: boolean;
  onToggleShowroomName: (checked: boolean) => void;
  // Badge Display Style & Color Options
  badgeDisplayStyle: BadgeDisplayStyle;
  onSelectBadgeDisplayStyle: (style: BadgeDisplayStyle) => void;
  customBgColor: string;
  onCustomBgColorChange: (color: string) => void;
  customTextColor: string;
  onCustomTextColorChange: (color: string) => void;
  outlineThickness: number;
  onOutlineThicknessChange: (thick: number) => void;
  // Price options on card
  showCutPrice: boolean;
  onToggleCutPrice: (show: boolean) => void;
  showMainPriceInCard: boolean;
  onToggleMainPriceInCard: (show: boolean) => void;
  // Individual element color overrides
  customTitleColor: string;
  onCustomTitleColorChange: (col: string) => void;
  customMLabelColor: string;
  onCustomMLabelColorChange: (col: string) => void;
  customMValueColor: string;
  onCustomMValueColorChange: (col: string) => void;
  customPLabelColor: string;
  onCustomPLabelColorChange: (col: string) => void;
  customCutPriceColor: string;
  onCustomCutPriceColorChange: (col: string) => void;
  customActualPriceColor: string;
  onCustomActualPriceColorChange: (col: string) => void;
  customPhoneColor: string;
  onCustomPhoneColorChange: (col: string) => void;
  onResetElementColors: () => void;
  // Actual price font size multiplier
  actualPriceScale: number;
  onActualPriceScaleChange: (scale: number) => void;
  // Typography Options
  fontWeight: 'normal' | 'bold';
  onFontWeightChange: (weight: 'normal' | 'bold') => void;
  fontStyle: 'normal' | 'italic';
  onFontStyleChange: (style: 'normal' | 'italic') => void;
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase';
  onTextDecorationChange: (dec: 'none' | 'underline' | 'line-through') => void;
  onTextTransformChange: (trans: 'none' | 'uppercase' | 'lowercase') => void;
  lineHeight: number;
  onLineHeightChange: (lh: number) => void;
  letterSpacing: number;
  onLetterSpacingChange: (ls: number) => void;
  // Padding & Radius Options
  customRadius: number;
  onCustomRadiusChange: (rad: number) => void;
  customPadX: number;
  onCustomPadXChange: (px: number) => void;
  customPadY: number;
  onCustomPadYChange: (py: number) => void;
  onApplyCardPosToAll?: () => void;
}

export const CanvasThemeTab: React.FC<CanvasThemeTabProps> = ({
  cardPos,
  onCardPosChange,
  onApplyCardPosToAll,
  selectedElement,
  onSelectCardElement,
  cardTheme,
  onSelectCardTheme,
  minimalTextColor: _unusedMinimalTextColor,
  onSelectMinimalTextColor: _unusedOnSelectMinimalTextColor,
  cardScale,
  onCardScaleChange,
  fontFamily,
  onFontFamilyChange,
  showShowroomName,
  onToggleShowroomName,
  badgeDisplayStyle,
  onSelectBadgeDisplayStyle,
  customBgColor,
  onCustomBgColorChange,
  customTextColor,
  onCustomTextColorChange,
  outlineThickness,
  onOutlineThicknessChange,
  showCutPrice,
  onToggleCutPrice,
  showMainPriceInCard,
  onToggleMainPriceInCard,
  customTitleColor,
  onCustomTitleColorChange,
  customMLabelColor,
  onCustomMLabelColorChange,
  customMValueColor,
  onCustomMValueColorChange,
  customPLabelColor,
  onCustomPLabelColorChange,
  customCutPriceColor,
  onCustomCutPriceColorChange,
  customActualPriceColor,
  onCustomActualPriceColorChange,
  customPhoneColor,
  onCustomPhoneColorChange,
  onResetElementColors,
  actualPriceScale,
  onActualPriceScaleChange,
  fontWeight,
  onFontWeightChange,
  fontStyle,
  onFontStyleChange,
  textDecoration,
  onTextDecorationChange,
  textTransform,
  onTextTransformChange,
  lineHeight,
  onLineHeightChange,
  letterSpacing,
  onLetterSpacingChange,
  customRadius,
  onCustomRadiusChange,
  customPadX,
  onCustomPadXChange,
  customPadY,
  onCustomPadYChange,
}) => {
  const [showClassic, setShowClassic] = useState(false);
  const [showCustomColors, setShowCustomColors] = useState(true);

  return (
    <div className="space-y-4">
      {/* 0. কার্ড থিম — previously this prop was discarded, so the theme
          selector did nothing and the canvas never used cardTheme. */}
      <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
          কার্ড থিম
        </span>
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1 flex-wrap">
          {([
            ['dark-glass', 'ডার্ক গ্লাস'],
            ['luxury-gold', 'লাক্সারি গোল্ড'],
            ['clean-white', 'ক্লিন হোয়াইট'],
            ['brand-blue', 'ব্র্যান্ড ব্লু'],
            ['minimal-transparent', 'মিনিমাল'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onSelectCardTheme(value)}
              className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                cardTheme === value
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400">মিনিমাল বাদে প্রতিটি থিম কার্ডের ব্যাকগ্রাউন্ড ও টেক্সট রং নির্ধারণ করে।</p>
      </div>
      {/* 1. ব্যাজ প্রদর্শন স্টাইল (ভরাট, স্বচ্ছ, আউটলাইন + কালার পিকার) */}
      <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            ব্যাজ প্রদর্শন স্টাইল
          </span>
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {(['solid', 'transparent', 'outline'] as const).map((style) => {
              const labels = { solid: 'ভরাট (Solid)', transparent: 'স্বচ্ছ', outline: 'আউটলাইন' };
              const isSelected = badgeDisplayStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => onSelectBadgeDisplayStyle(style)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    isSelected
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {labels[style]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Outline Thickness Slider (if outline style) */}
        {badgeDisplayStyle === 'outline' && (
          <div className="space-y-1 pt-1 border-t border-gray-100">
            <div className="flex justify-between text-[11px] text-gray-600 font-medium">
              <span>আউটলাইন পুরুত্ব</span>
              <span className="text-blue-600 font-bold">{outlineThickness}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={outlineThickness}
              onChange={(e) => onOutlineThicknessChange(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        )}

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200/60">
            <span className="text-[11px] text-gray-600 font-bold">ব্যাকগ্রাউন্ড</span>
            <input
              type="color"
              value={customBgColor}
              onChange={(e) => onCustomBgColorChange(e.target.value)}
              className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200/60">
            <span className="text-[11px] text-gray-600 font-bold">টেক্সট রং</span>
            <input
              type="color"
              value={customTextColor}
              onChange={(e) => onCustomTextColorChange(e.target.value)}
              className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>

        {/* Collapsible Classic Color Presets */}
        <div className="pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowClassic(!showClassic)}
            className="flex items-center justify-between w-full text-[10px] font-bold text-gray-500 hover:text-gray-700 py-1 transition-colors"
          >
            <span>ক্লাসিক রেডিমেড প্যালেট</span>
            {showClassic ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showClassic && (
            <div className="grid grid-cols-3 gap-1.5 pt-1.5">
              {CLASSIC_PALETTES.map((palette, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onCustomBgColorChange(palette.bg);
                    onCustomTextColorChange(palette.text);
                    onSelectBadgeDisplayStyle('solid');
                  }}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl border border-gray-200/80 hover:bg-white bg-gray-50 text-left transition-all active:scale-95 shadow-2xs"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: palette.bg }}
                  />
                  <span className="text-[10px] font-semibold text-gray-700 truncate">{palette.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. প্রতিটি উপাদানের আলাদা রঙ (Individual Color for Every Item) */}
      <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100/50">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h3 className="text-xs font-bold text-gray-800 tracking-wide">উপাদানসমূহের আলাদা রঙ</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onResetElementColors}
              title="ডিফল্ট রঙে রিসেট করুন"
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors border border-gray-200/60"
            >
              <RotateCcw className="w-3 h-3" />
              <span>রিসেট</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCustomColors(!showCustomColors)}
              className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showCustomColors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showCustomColors && (
          <div className="space-y-2 pt-1 border-t border-gray-100">
            {/* 1. Showroom Name */}
            <div className="flex items-center justify-between p-2 bg-gray-50/80 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-800">🏢 শোরুমের নাম</span>
                <span className="text-[9px] text-gray-400">শীর্ষ শিরোনাম</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customTitleColor || customTextColor || '#FFFFFF'}
                  onChange={(e) => onCustomTitleColorChange(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 bg-transparent p-0.5"
                />
              </div>
            </div>

            {/* 2. Model Label (M:-) */}
            <div className="flex items-center justify-between p-2 bg-gray-50/80 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-800">🏷️ মডেল লেবেল (M:-)</span>
                <span className="text-[9px] text-gray-400">মডেল প্রিফিক্স</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customMLabelColor || '#38BDF8'}
                  onChange={(e) => onCustomMLabelColorChange(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 bg-transparent p-0.5"
                />
              </div>
            </div>

            {/* 3. Model Code */}
            <div className="flex items-center justify-between p-2 bg-gray-50/80 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-800">🔢 মডেল নম্বর/কোড</span>
                <span className="text-[9px] text-gray-400">যেমন: B-119</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customMValueColor || customTextColor || '#FFFFFF'}
                  onChange={(e) => onCustomMValueColorChange(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 bg-transparent p-0.5"
                />
              </div>
            </div>

            {/* 4. Price Label (P:-) */}
            <div className="flex items-center justify-between p-2 bg-gray-50/80 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-800">💲 প্রাইস লেবেল (P:-)</span>
                <span className="text-[9px] text-gray-400">দাম প্রিফিক্স</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customPLabelColor || '#FBBF24'}
                  onChange={(e) => onCustomPLabelColorChange(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 bg-transparent p-0.5"
                />
              </div>
            </div>

            {/* 5. Cut Price */}
            <div className="flex items-center justify-between p-2 bg-gray-50/80 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-red-600">❌ কাটা দাম (পূর্বের মূল্য)</span>
                <span className="text-[9px] text-gray-400">স্ট্রাইক-থ্রু লাইন সহ</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customCutPriceColor || '#EF4444'}
                  onChange={(e) => onCustomCutPriceColorChange(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 bg-transparent p-0.5"
                />
              </div>
            </div>

            {/* 6. Actual Selling Price (Prominent) */}
            <div className="flex items-center justify-between p-2 bg-blue-50/60 rounded-xl border border-blue-200/80 hover:bg-blue-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-blue-900">💰 আসল বিক্রয় মূল্য</span>
                <span className="text-[9px] text-blue-600 font-semibold">বড় ও বোল্ড অক্ষর</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customActualPriceColor || '#FEF08A'}
                  onChange={(e) => onCustomActualPriceColorChange(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-blue-400 bg-transparent p-0.5"
                />
              </div>
            </div>

            {/* 7. Phone Numbers */}
            <div className="flex items-center justify-between p-2 bg-gray-50/80 rounded-xl border border-gray-200/60 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-gray-800">📞 ফোন নম্বরসমূহ</span>
                <span className="text-[9px] text-gray-400">যোগাযোগ নম্বর</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customPhoneColor || customTextColor || '#FFFFFF'}
                  onChange={(e) => onCustomPhoneColorChange(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-gray-300 bg-transparent p-0.5"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. কার্ডে প্রাইস প্রদর্শন অপশন */}
      <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl border border-gray-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100/50">
            <Tag className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 tracking-wide">কার্ডে প্রাইস অপশন</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
          <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200/60 cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={showCutPrice}
              onChange={(e) => onToggleCutPrice(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
            <span className="text-[11px] font-bold text-gray-700">কাটা দাম</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200/60 cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={showMainPriceInCard}
              onChange={(e) => onToggleMainPriceInCard(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
            <span className="text-[11px] font-bold text-gray-700">আসল দাম</span>
          </label>
        </div>

        {/* আসল বিক্রয় মূল্যের সাইজ স্লাইডার, +/- বাটন ও প্রিসেট বাটন */}
        {showMainPriceInCard && (
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center text-[11px] font-medium text-gray-700">
              <span className="font-bold flex items-center gap-1">💰 আসল দামের সাইজ</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onActualPriceScaleChange(Math.max(0.8, parseFloat((actualPriceScale - 0.05).toFixed(2))))}
                  className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-md font-bold text-gray-700 text-sm border border-gray-200 transition-all cursor-pointer"
                  title="আসল দাম ছোট করুন (-)"
                >
                  -
                </button>
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 min-w-[42px] text-center font-mono">
                  {Math.round(actualPriceScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => onActualPriceScaleChange(Math.min(2.5, parseFloat((actualPriceScale + 0.05).toFixed(2))))}
                  className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-md font-bold text-gray-700 text-sm border border-gray-200 transition-all cursor-pointer"
                  title="আসল দাম বড় করুন (+)"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={actualPriceScale}
              onChange={(e) => onActualPriceScaleChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            {/* Quick Size Presets */}
            <div className="flex gap-1 pt-0.5">
              {[
                { label: '১০০% (সাধারণ)', val: 1.0 },
                { label: '১২৫% (মাঝারি)', val: 1.25 },
                { label: '১৪০% (বড়)', val: 1.4 },
                { label: '১৮০% (খুব বড়)', val: 1.8 }
              ].map(preset => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => onActualPriceScaleChange(preset.val)}
                  className={`flex-1 py-1 text-[9px] font-bold rounded-md border transition-all ${
                    Math.abs(actualPriceScale - preset.val) < 0.03
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. ফন্ট স্টাইল (Font Selector + B / I / U / S + AA / aa / Aa + Sliders) */}
      <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl border border-gray-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/50">
            <Type className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 tracking-wide">ফন্ট স্টাইল</h3>
        </div>

        {/* Row 1: Font Select (Left) + B / I / U / S (Right) */}
        <div className="flex items-center gap-2">
          <select
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
            className="w-1/2 p-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-gray-800 cursor-pointer"
          >
            {FONTS.map((f: { name: string; family: string }) => (
              <option key={f.name} value={f.family}>{f.name}</option>
            ))}
          </select>

          <div className="flex flex-1 border border-gray-200 rounded-xl bg-gray-50 overflow-hidden divide-x divide-gray-200">
            <button
              type="button"
              onClick={() => onFontWeightChange(fontWeight === 'bold' ? 'normal' : 'bold')}
              className={`flex-1 py-1.5 flex items-center justify-center transition-all ${
                fontWeight === 'bold' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onFontStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')}
              className={`flex-1 py-1.5 flex items-center justify-center transition-all ${
                fontStyle === 'italic' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onTextDecorationChange(textDecoration === 'underline' ? 'none' : 'underline')}
              className={`flex-1 py-1.5 flex items-center justify-center transition-all ${
                textDecoration === 'underline' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onTextDecorationChange(textDecoration === 'line-through' ? 'none' : 'line-through')}
              className={`flex-1 py-1.5 flex items-center justify-center transition-all ${
                textDecoration === 'line-through' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: AA / aa / Aa (Left) + Line Height & Letter Spacing Sliders (Right) */}
        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-xl bg-gray-50 overflow-hidden divide-x divide-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => onTextTransformChange('uppercase')}
              className={`px-2.5 py-1 flex items-center justify-center text-xs font-bold transition-all ${
                textTransform === 'uppercase' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="All Caps"
            >
              AA
            </button>
            <button
              type="button"
              onClick={() => onTextTransformChange('lowercase')}
              className={`px-2.5 py-1 flex items-center justify-center text-xs font-bold transition-all ${
                textTransform === 'lowercase' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Small Caps"
            >
              aa
            </button>
            <button
              type="button"
              onClick={() => onTextTransformChange('none')}
              className={`px-2.5 py-1 flex items-center justify-center text-xs font-bold transition-all ${
                textTransform === 'none' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Normal"
            >
              Aa
            </button>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span title="লাইন হাইট (Line Height)"><SpaceIcon className="w-3 h-3 text-gray-400 shrink-0" /></span>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.05"
                value={lineHeight}
                onChange={(e) => onLineHeightChange(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                title={`লাইন হাইট: ${lineHeight}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span title="লেটার স্পেসিং (Letter Spacing)"><Baseline className="w-3 h-3 text-gray-400 shrink-0" /></span>
              <input
                type="range"
                min="-5"
                max="25"
                step="1"
                value={letterSpacing}
                onChange={(e) => onLetterSpacingChange(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                title={`লেটার স্পেসিং: ${letterSpacing}px`}
              />
            </div>
          </div>
        </div>

        {/* Font Size / Card Scale Slider with +/- Buttons */}
        <div className="space-y-1.5 pt-1 border-t border-gray-100">
          <div className="flex justify-between items-center text-[11px] text-gray-600 font-medium">
            <span className="font-bold">ফন্ট সাইজ / কার্ড স্কেল</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onCardScaleChange(Math.max(0.1, parseFloat((cardScale - 0.04).toFixed(2))))}
                className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-md font-bold text-gray-700 text-sm border border-gray-200 transition-all cursor-pointer"
                title="সাইজ ছোট করুন (-)"
              >
                -
              </button>
              <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 min-w-[50px] text-center font-mono">
                {Math.round(cardScale * 100)}% ({Math.round(26 * cardScale)}px)
              </span>
              <button
                type="button"
                onClick={() => onCardScaleChange(Math.min(2.0, parseFloat((cardScale + 0.04).toFixed(2))))}
                className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-md font-bold text-gray-700 text-sm border border-gray-200 transition-all cursor-pointer"
                title="সাইজ বড় করুন (+)"
              >
                +
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.02"
            value={cardScale}
            onChange={(e) => onCardScaleChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* 3. প্যাডিং ও রাউন্ড কর্নার (Radius, PadX, PadY) */}
      <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl border border-gray-200/80 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/50">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 tracking-wide">প্যাডিং ও রাউন্ড কর্নার</h3>
        </div>

        {/* Radius */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
            <span>রাউন্ড কর্নার (Radius)</span>
            <span className="text-blue-600 font-bold">{customRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={customRadius}
            onChange={(e) => onCustomRadiusChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Horizontal Padding (X) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
            <span>হরাইজন্টাল প্যাডিং (X)</span>
            <span className="text-blue-600 font-bold">{customPadX}px</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            value={customPadX}
            onChange={(e) => onCustomPadXChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Vertical Padding (Y) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
            <span>ভার্টিক্যাল প্যাডিং (Y)</span>
            <span className="text-blue-600 font-bold">{customPadY}px</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            value={customPadY}
            onChange={(e) => onCustomPadYChange(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* 4. Movement Controls for Card */}
      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-blue-600" /> কার্ড পজিশন ও মুভমেন্ট
          </span>
          <button
            onClick={onSelectCardElement}
            className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${
              selectedElement === 'card' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {selectedElement === 'card' ? 'কার্ড সিলেক্টেড' : 'সিলেক্ট করুন'}
          </button>
        </div>

        {/* Corner Presets */}
        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => {
              onSelectCardElement();
              onCardPosChange({ x: 18, y: 18 });
            }}
            className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
          >
            উপরে বাম
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCardElement();
              onCardPosChange({ x: 50, y: 50 });
            }}
            className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
          >
            মাঝামাঝি
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCardElement();
              onCardPosChange({ x: 82, y: 18 });
            }}
            className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
          >
            উপরে ডান
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCardElement();
              onCardPosChange({ x: 18, y: 82 });
            }}
            className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
          >
            নিচে বাম
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCardElement();
              onCardPosChange({ x: 80, y: 82 });
            }}
            className="py-1 px-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-bold text-center"
          >
            ডিফল্ট
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectCardElement();
              onCardPosChange({ x: 82, y: 82 });
            }}
            className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
          >
            নিচে ডান
          </button>
        </div>

        {/* X and Y Sliders */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[11px] text-gray-600 font-semibold mb-0.5">
              <span>হরাইজন্টাল অবস্থান (X):</span>
              <span className="font-mono text-blue-600 font-bold">{cardPos.x}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={cardPos.x}
              onChange={(e) => onCardPosChange({ ...cardPos, x: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-gray-600 font-semibold mb-0.5">
              <span>ভার্টিক্যাল অবস্থান (Y):</span>
              <span className="font-mono text-blue-600 font-bold">{cardPos.y}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={cardPos.y}
              onChange={(e) => onCardPosChange({ ...cardPos, y: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Nudge Arrow Buttons */}
        <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
          <span className="text-[10px] font-bold text-gray-500">সূক্ষ্ম অ্যারো মুভমেন্ট:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onCardPosChange({ ...cardPos, x: Math.max(0, cardPos.x - 1) })}
              className="w-6 h-6 bg-white hover:bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-700 shadow-xs"
              title="বামে সরান"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onCardPosChange({ ...cardPos, x: Math.min(100, cardPos.x + 1) })}
              className="w-6 h-6 bg-white hover:bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-700 shadow-xs"
              title="ডানে সরান"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onCardPosChange({ ...cardPos, y: Math.max(0, cardPos.y - 1) })}
              className="w-6 h-6 bg-white hover:bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-700 shadow-xs"
              title="উপরে সরান"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onCardPosChange({ ...cardPos, y: Math.min(100, cardPos.y + 1) })}
              className="w-6 h-6 bg-white hover:bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-700 shadow-xs"
              title="নিচে সরান"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Apply Position to All Images Button */}
        {onApplyCardPosToAll && (
          <div className="pt-2 border-t border-blue-200/60">
            <button
              type="button"
              onClick={onApplyCardPosToAll}
              className="w-full py-1.5 px-2 bg-blue-100/70 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-blue-200/80 active:scale-98 shadow-2xs"
              title="বর্তমান ছবির কার্ড পজিশন গ্যালারির সব ছবিতে সেট করুন"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span>এই পজিশন সব ছবিতে প্রয়োগ করুন</span>
            </button>
          </div>
        )}
      </div>

      {/* Showroom Name Toggle */}
      <div className="flex items-center justify-between p-3 bg-white/90 rounded-xl border border-gray-200/80">
        <span className="text-xs font-bold text-gray-700">কার্ডে শোরুমের নাম দেখান</span>
        <input
          type="checkbox"
          checked={showShowroomName}
          onChange={(e) => onToggleShowroomName(e.target.checked)}
          className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
        />
      </div>

    </div>
  );
};
export default CanvasThemeTab;
