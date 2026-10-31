import { useState } from 'react';
import { Phone, Palette, Type, Sliders, AlignCenter, Bold, Italic, Underline, Strikethrough, Space as SpaceIcon, Baseline, ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useEditorContext } from '../../../context/EditorContext';
import { FONTS } from '../../../types';

// 10 Fixed Curated Furniture Studio Color Presets
const FIXED_COLOR_TEMPLATES = [
  { id: 'fixed-1', bg: '#B45309', text: '#FFFFFF', name: 'অ্যাম্বার উড' },
  { id: 'fixed-2', bg: '#0071E3', text: '#FFFFFF', name: 'রয়্যাল ব্লু' },
  { id: 'fixed-3', bg: '#18181B', text: '#FFFFFF', name: 'চারকোল ব্ল্যাক' },
  { id: 'fixed-4', bg: '#FFD700', text: '#111827', name: 'গোল্ডেন ইয়েলো' },
  { id: 'fixed-5', bg: '#059669', text: '#FFFFFF', name: 'এমারেল্ড গ্রিন' },
  { id: 'fixed-6', bg: '#DC2626', text: '#FFFFFF', name: 'ক্রিমসন রেড' },
  { id: 'fixed-7', bg: '#7C3AED', text: '#FFFFFF', name: 'রয়্যাল ভায়োলেট' },
  { id: 'fixed-8', bg: '#D97706', text: '#111827', name: 'ওয়ার্ম সেগুন' },
  { id: 'fixed-9', bg: '#4B5563', text: '#FFFFFF', name: 'স্লেট গ্রে' },
  { id: 'fixed-10', bg: '#F3F4F6', text: '#111827', name: 'ক্লিন লাইট' },
];

// Fallback / Classic BD Furniture Color Presets
const CLASSIC_PALETTES = [
  { name: 'হলুদ-কালো', bg: '#FFD700', text: '#000000' },
  { name: 'রয়্যাল ব্লু', bg: '#0071E3', text: '#FFFFFF' },
  { name: 'প্রিমিয়াম ব্ল্যাক', bg: '#18181B', text: '#F4F4F5' },
  { name: 'ক্রিমসন রেড', bg: '#DC2626', text: '#FFFFFF' },
  { name: 'এমারেল্ড গ্রিন', bg: '#059669', text: '#FFFFFF' },
  { name: 'গোল্ডেন উড', bg: '#B45309', text: '#FFFFFF' },
];

export default function NumberInspector() {
  const {
    numberText, setNumberText,
    numberColor, setNumberColor,
    numberBgColor, setNumberBgColor,
    numberSize, setNumberSize,
    fontFamily, setFontFamily,
    fontWeight, setFontWeight,
    fontStyle, setFontStyle,
    textDecoration, setTextDecoration,
    textTransform, setTextTransform,
    letterSpacing, setLetterSpacing,
    lineHeight, setLineHeight,
    padX, setPadX,
    padY, setPadY,
    customRadius, setCustomRadius,
    numberStyle, setNumberStyle,
    numberOutlineThickness, setNumberOutlineThickness,
    imageSettings, previewIndex,
    updateSetting, updateSettingsBatch, recordSnapshot
  } = useEditorContext();

  const [showClassic, setShowClassic] = useState(false);

  const currentSetting = imageSettings[previewIndex];

  // Quick alignment position presets
  const setPositionPreset = (x: number, y: number) => {
    recordSnapshot();
    updateSetting('numberPos', { x, y });
    updateSetting('isNumberPosManual', true);
  };

  // Apply color pair directly
  const handleApplyPair = (bg: string, text: string) => {
    updateSettingsBatch({
      numberBgColor: bg,
      numberColor: text,
      numberStyle: 'solid'
    }, {
      numberBgColor: setNumberBgColor,
      numberColor: setNumberColor,
      numberStyle: setNumberStyle
    });
  };

  const handleApplyClassicPalette = (bg: string, text: string) => {
    updateSettingsBatch({
      numberBgColor: bg,
      numberColor: text,
      numberStyle: 'solid'
    }, {
      numberBgColor: setNumberBgColor,
      numberColor: setNumberColor,
      numberStyle: setNumberStyle
    });
  };

  const currentBg = currentSetting?.numberBgColor ?? numberBgColor;
  const currentText = currentSetting?.numberColor ?? numberColor;
  const currentBadgeStyle = currentSetting?.numberStyle ?? numberStyle;

  return (
    <div className="space-y-4">
      {/* 1. Phone Number Input */}
      <div className="bg-white/60 backdrop-blur-xl p-4.5 rounded-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.06)] space-y-3.5 transition-all">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-[13px] font-bold text-gray-800 tracking-wide">মোবাইল নম্বর</h3>
        </div>
        <textarea
          rows={2}
          value={currentSetting?.numberText ?? numberText}
          onChange={(e) => updateSetting('numberText', e.target.value, setNumberText as any)}
          placeholder="01873-728219&#10;01322-631984"
          className="w-full p-2.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400 resize-none leading-relaxed"
        />

        {/* Quick Position Presets */}
        <div className="pt-1">
          <div className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <AlignCenter className="w-3 h-3" />
            <span>১-ক্লিকে পজিশন করুন</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => setPositionPreset(18, 88)}
              className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200/80 rounded-lg text-[10px] font-medium text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowDown className="w-2.5 h-2.5" /> বামে
            </button>
            <button
              onClick={() => setPositionPreset(50, 88)}
              className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200/80 rounded-lg text-[10px] font-medium text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowDown className="w-2.5 h-2.5" /> মাঝে
            </button>
            <button
              onClick={() => setPositionPreset(82, 88)}
              className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200/80 rounded-lg text-[10px] font-medium text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowDown className="w-2.5 h-2.5" /> ডানে
            </button>
            <button
              onClick={() => setPositionPreset(50, 12)}
              className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200/80 rounded-lg text-[10px] font-medium text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowUp className="w-2.5 h-2.5" /> ওপরে
            </button>
          </div>
        </div>
      </div>

      {/* 2. Fixed Number Color Templates & Badge Style */}
      <div className="bg-white/60 backdrop-blur-xl p-4.5 rounded-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.06)] space-y-3.5 transition-all">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h3 className="text-[13px] font-bold text-gray-800 tracking-wide">নম্বর কালার টেমপ্লেট</h3>
          </div>

          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
            ১০টি ফিক্সড কালার
          </span>
        </div>

        {/* 10 Distinct Fixed Color Pairs Grid */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>রেডিমেড কালার পেয়ার</span>
            <span className="text-[10px] text-gray-400">পটভূমি + টেক্সট</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {FIXED_COLOR_TEMPLATES.map((pair) => {
              const isActive = (
                currentBg.toLowerCase() === pair.bg.toLowerCase() &&
                currentText.toLowerCase() === pair.text.toLowerCase()
              );

              return (
                <button
                  key={pair.id}
                  type="button"
                  onClick={() => handleApplyPair(pair.bg, pair.text)}
                  className={`group relative flex items-center gap-2 p-2 rounded-xl border text-left transition-all active:scale-95 ${
                    isActive
                      ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-400'
                      : 'bg-white hover:bg-gray-50/90 border-gray-200/90 hover:border-gray-300 shadow-2xs'
                  }`}
                  title={`ব্যাকগ্রাউন্ড: ${pair.bg}, টেক্সট: ${pair.text}`}
                >
                  {/* Visual Aa Pill showing the real look and contrast */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: pair.bg,
                      color: pair.text,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    Aa
                  </div>

                  {/* Clean Visual Color Indicators (Background + Text) */}
                  <div className="flex flex-col min-w-0 flex-1">
                    {/* Background Color Indicator */}
                    <div className="flex items-center gap-1.5" title="ব্যাকগ্রাউন্ড রং">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0 shadow-2xs"
                        style={{ backgroundColor: pair.bg }}
                      />
                      <span className="text-[10px] font-mono font-bold text-gray-800 truncate">
                        {pair.bg}
                      </span>
                    </div>

                    {/* Text Color Indicator */}
                    <div className="flex items-center gap-1.5 mt-0.5" title="টেক্সট রং">
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0 shadow-2xs"
                        style={{ backgroundColor: pair.text }}
                      />
                      <span className="text-[9px] font-mono text-gray-500 truncate">
                        {pair.text === '#FFFFFF' ? 'সাদা' : 'কালো'} ({pair.text})
                      </span>
                    </div>
                  </div>

                  {/* Active Selection Checkmark */}
                  {isActive && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Segmented Control (Solid, Transparent, Outline) */}
        <div className="space-y-1.5 pt-1 border-t border-gray-100">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">ব্যাজ প্রদর্শন স্টাইল</span>
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            {(['solid', 'transparent', 'outline'] as const).map((style) => {
              const labels = { solid: 'ভরাট (Solid)', transparent: 'স্বচ্ছ', outline: 'আউটলাইন' };
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateSetting('numberStyle', style, setNumberStyle as any)}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    currentBadgeStyle === style
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
        {currentBadgeStyle === 'outline' && (
          <div className="space-y-1 pt-1 border-t border-gray-100">
            <div className="flex justify-between text-[11px] text-gray-600 font-medium">
              <span>আউটলাইন পুরুত্ব</span>
              <span className="text-blue-600 font-semibold">{currentSetting?.numberOutlineThickness ?? numberOutlineThickness}px</span>
            </div>
            <input
              type="range" min="1" max="15"
              value={currentSetting?.numberOutlineThickness ?? numberOutlineThickness}
              onChange={(e) => updateSetting('numberOutlineThickness', Number(e.target.value), setNumberOutlineThickness as any)}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        )}

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200/60">
            <span className="text-[11px] text-gray-600 font-medium">ব্যাকগ্রাউন্ড</span>
            <input
              type="color"
              value={currentBg}
              onChange={(e) => updateSetting('numberBgColor', e.target.value, setNumberBgColor as any)}
              className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200/60">
            <span className="text-[11px] text-gray-600 font-medium">টেক্সট রং</span>
            <input
              type="color"
              value={currentText}
              onChange={(e) => updateSetting('numberColor', e.target.value, setNumberColor as any)}
              className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>

        {/* Collapsible Classic Color Presets */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowClassic(!showClassic)}
            className="flex items-center justify-between w-full text-[10px] font-semibold text-gray-500 hover:text-gray-700 py-1 transition-colors"
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
                  onClick={() => handleApplyClassicPalette(palette.bg, palette.text)}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl border border-gray-200/80 hover:bg-white bg-gray-50 text-left transition-all active:scale-95 shadow-2xs"
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: palette.bg }}
                  />
                  <span className="text-[10px] font-medium text-gray-700 truncate">{palette.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Font Style */}
      <div className="bg-white/60 backdrop-blur-xl p-4.5 rounded-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.06)] space-y-3.5 transition-all">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
            <Type className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-[13px] font-bold text-gray-800 tracking-wide">ফন্ট স্টাইল</h3>
        </div>

        {/* Row 1: Font Select (Left) + B / I / U / S (Right) */}
        <div className="flex items-center gap-2">
          <select
            value={currentSetting?.fontFamily ?? fontFamily}
            onChange={(e) => updateSetting('fontFamily', e.target.value, setFontFamily as any)}
            className="w-1/2 p-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-gray-800 cursor-pointer"
          >
            {FONTS.map(f => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>

          <div className="flex flex-1 border border-gray-200 rounded-xl bg-gray-50 overflow-hidden divide-x divide-gray-200">
            <button
              type="button"
              onClick={() => updateSetting('fontWeight', (currentSetting?.fontWeight ?? fontWeight) === 'bold' ? 'normal' : 'bold', setFontWeight as any)}
              className={`flex-1 py-2 flex items-center justify-center transition-all ${
                (currentSetting?.fontWeight ?? fontWeight) === 'bold'
                  ? 'bg-blue-100 text-blue-700 font-bold'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSetting('fontStyle', (currentSetting?.fontStyle ?? fontStyle) === 'italic' ? 'normal' : 'italic', setFontStyle as any)}
              className={`flex-1 py-2 flex items-center justify-center transition-all ${
                (currentSetting?.fontStyle ?? fontStyle) === 'italic'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSetting('textDecoration', (currentSetting?.textDecoration ?? textDecoration) === 'underline' ? 'none' : 'underline', setTextDecoration as any)}
              className={`flex-1 py-2 flex items-center justify-center transition-all ${
                (currentSetting?.textDecoration ?? textDecoration) === 'underline'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => updateSetting('textDecoration', (currentSetting?.textDecoration ?? textDecoration) === 'line-through' ? 'none' : 'line-through', setTextDecoration as any)}
              className={`flex-1 py-2 flex items-center justify-center transition-all ${
                (currentSetting?.textDecoration ?? textDecoration) === 'line-through'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
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
              onClick={() => updateSetting('textTransform', 'uppercase', setTextTransform as any)}
              className={`px-3 py-1.5 flex items-center justify-center text-xs font-bold transition-all ${
                (currentSetting?.textTransform ?? textTransform) === 'uppercase'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="All Caps"
            >
              AA
            </button>
            <button
              type="button"
              onClick={() => updateSetting('textTransform', 'lowercase', setTextTransform as any)}
              className={`px-3 py-1.5 flex items-center justify-center text-xs font-bold transition-all ${
                (currentSetting?.textTransform ?? textTransform) === 'lowercase'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Small Caps"
            >
              aa
            </button>
            <button
              type="button"
              onClick={() => updateSetting('textTransform', 'none', setTextTransform as any)}
              className={`px-3 py-1.5 flex items-center justify-center text-xs font-bold transition-all ${
                (currentSetting?.textTransform ?? textTransform) === 'none'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
              title="Normal"
            >
              Aa
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span title="লাইন হাইট (Line Height)"><SpaceIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" /></span>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.05"
                value={currentSetting?.lineHeight ?? lineHeight}
                onChange={(e) => updateSetting('lineHeight', Number(e.target.value), setLineHeight as any)}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                title={`লাইন হাইট: ${currentSetting?.lineHeight ?? lineHeight}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span title="লেটার স্পেসিং (Letter Spacing)"><Baseline className="w-3.5 h-3.5 text-gray-400 shrink-0" /></span>
              <input
                type="range"
                min="-5"
                max="30"
                step="1"
                value={currentSetting?.letterSpacing ?? letterSpacing}
                onChange={(e) => updateSetting('letterSpacing', Number(e.target.value), setLetterSpacing as any)}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                title={`লেটার স্পেসিং: ${currentSetting?.letterSpacing ?? letterSpacing}px`}
              />
            </div>
          </div>
        </div>

        {/* Font Size Slider */}
        <div className="space-y-1 pt-1 border-t border-gray-100">
          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
            <span>ফন্ট সাইজ</span>
            <span className="text-blue-600 font-semibold">{currentSetting?.numberSize ?? numberSize}px</span>
          </div>
          <input
            type="range" min="20" max="120"
            value={currentSetting?.numberSize ?? numberSize}
            onChange={(e) => updateSetting('numberSize', Number(e.target.value), setNumberSize as any)}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* 4. Badge Shape & Padding */}
      <div className="bg-white/60 backdrop-blur-xl p-4.5 rounded-xl border border-white/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.06)] space-y-3.5 transition-all">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-[13px] font-bold text-gray-800 tracking-wide">প্যাডিং ও রাউন্ড কর্নার</h3>
        </div>

        {/* Radius */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
            <span>রাউন্ড কর্নার (Radius)</span>
            <span className="text-blue-600 font-semibold">{currentSetting?.customRadius ?? customRadius}px</span>
          </div>
          <input
            type="range" min="0" max="40"
            value={currentSetting?.customRadius ?? customRadius}
            onChange={(e) => updateSetting('customRadius', Number(e.target.value), setCustomRadius as any)}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Padding Horizontal */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
            <span>হরাইজন্টাল প্যাডিং (X)</span>
            <span className="text-blue-600 font-semibold">{currentSetting?.padX ?? padX}px</span>
          </div>
          <input
            type="range" min="5" max="60"
            value={currentSetting?.padX ?? padX}
            onChange={(e) => updateSetting('padX', Number(e.target.value), setPadX as any)}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Padding Vertical */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
            <span>ভার্টিকাল প্যাডিং (Y)</span>
            <span className="text-blue-600 font-semibold">{currentSetting?.padY ?? padY}px</span>
          </div>
          <input
            type="range" min="2" max="40"
            value={currentSetting?.padY ?? padY}
            onChange={(e) => updateSetting('padY', Number(e.target.value), setPadY as any)}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}
