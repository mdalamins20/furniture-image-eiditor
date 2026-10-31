import { useState } from 'react';
import { Settings, ChevronDown, Bold, Italic, Underline, Strikethrough, Space as SpaceIcon, Baseline } from 'lucide-react';
import { useEditorContext } from '../../../context/EditorContext';
import { FONTS } from '../../../types';

const COLOR_TEMPLATES = [
  // Row 1 — 10 unique palettes
  { bg: '#FFD700', text: '#1A0A00' }, // Gold on dark brown
  { bg: '#0A0A0A', text: '#FFFFFF' }, // Pure black on white
  { bg: '#FFFFFF', text: '#111111' }, // Pure white on near-black
  { bg: '#EF4444', text: '#FFFFFF' }, // Red on white
  { bg: '#2563EB', text: '#FFFFFF' }, // Royal blue on white
  { bg: '#16A34A', text: '#FFFFFF' }, // Forest green on white
  { bg: '#7C3AED', text: '#FFFFFF' }, // Purple on white
  { bg: '#EA580C', text: '#FFFFFF' }, // Deep orange on white
  { bg: '#0891B2', text: '#FFFFFF' }, // Cyan on white
  { bg: '#DB2777', text: '#FFFFFF' }, // Hot pink on white
  // Row 2 — 10 more unique palettes
  { bg: '#FEF9C3', text: '#713F12' }, // Cream on dark brown
  { bg: '#1E3A5F', text: '#E0F2FE' }, // Navy on light blue
  { bg: '#14532D', text: '#DCFCE7' }, // Dark green on light green
  { bg: '#4C1D95', text: '#EDE9FE' }, // Deep purple on lavender
  { bg: '#7F1D1D', text: '#FEE2E2' }, // Dark red on blush
  { bg: '#134E4A', text: '#CCFBF1' }, // Teal on mint
  { bg: '#78350F', text: '#FEF3C7' }, // Brown on cream
  { bg: '#1F2937', text: '#F9FAFB' }, // Dark gray on off-white
  { bg: '#831843', text: '#FCE7F3' }, // Dark rose on light pink
  { bg: '#064E3B', text: '#D1FAE5' }, // Deep emerald on light mint
];

export default function DesignSettings() {
  const {
    mainImages, isProcessing, imageSettings, previewIndex, updateSetting,
    brightness, contrast, saturation, warmth, numberText, setNumberText,
    numberColor, numberBgColor, numberSize, fontFamily, fontWeight,
    fontStyle, textDecoration, textTransform, letterSpacing, lineHeight,
    padX, padY, customRadius, setBrightness, setContrast, setSaturation, setWarmth,
    numberStyle, numberOutlineThickness, numberOutlineBlur
  } = useEditorContext();

  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const currentSetting = imageSettings[previewIndex];

  // Mock function for auto enhance, will be moved to context or passed down
  const autoEnhanceAll = () => {
    setBrightness(105);
    setContrast(110);
    setSaturation(105);
    setWarmth(5);
    // Ideally this should trigger updateSetting for selectedIndices as well
    updateSetting('brightness', 105, setBrightness as any);
    updateSetting('contrast', 110, setContrast as any);
    updateSetting('saturation', 105, setSaturation as any);
    updateSetting('warmth', 5, setWarmth as any);
  };

  const PREMIUM_FONTS = FONTS.map(f => f.name);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Advanced Image Filters */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/40 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-medium flex items-center gap-3 text-[#1d1d1f]">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-black/5">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
            </div>
            ইমেজ ফিল্টার
          </h2>
          <button 
            onClick={autoEnhanceAll}
            disabled={isProcessing || mainImages.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all disabled:opacity-50 shadow-md shadow-slate-900/20 hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4M3 5h4"/></svg>
            Auto Enhance
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
              <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                <span>ব্রাইটনেস</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{currentSetting?.brightness ?? brightness}%</span>
              </label>
              <input 
                type="range" min="50" max="150" value={currentSetting?.brightness ?? brightness}
                onChange={(e) => updateSetting('brightness', Number(e.target.value), setBrightness as any)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
              />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
              <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                <span>কন্ট্রাস্ট</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{currentSetting?.contrast ?? contrast}%</span>
              </label>
              <input 
                type="range" min="50" max="150" value={currentSetting?.contrast ?? contrast}
                onChange={(e) => updateSetting('contrast', Number(e.target.value), setContrast as any)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
              <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                <span>স্যাচুরেশন</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{currentSetting?.saturation ?? saturation}%</span>
              </label>
              <input 
                type="range" min="0" max="200" value={currentSetting?.saturation ?? saturation}
                onChange={(e) => updateSetting('saturation', Number(e.target.value), setSaturation as any)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
              />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
              <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                <span>ওয়ার্মথ</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{currentSetting?.warmth ?? warmth}%</span>
              </label>
              <input 
                type="range" min="0" max="100" value={currentSetting?.warmth ?? warmth}
                onChange={(e) => updateSetting('warmth', Number(e.target.value), setWarmth as any)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Number & Customization */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/40 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <h2 className="text-lg font-medium mb-5 flex items-center gap-3 text-[#1d1d1f]">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-black/5"><Settings className="w-5 h-5" /></div>
          নাম্বার ও ডিজাইন
        </h2>
        
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm shadow-black/5 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
            <label className="block text-xs font-medium text-[#86868b] mb-2 uppercase tracking-wider">নাম্বার (এডিট করুন)</label>
            <textarea 
              value={currentSetting?.numberText ?? numberText}
              onChange={(e) => {
                setNumberText(e.target.value);
                updateSetting('numberText', e.target.value, setNumberText as any);
              }}
              placeholder="017XX-XXXXXX 016XX-XXXXXX"
              rows={2}
              className="w-full bg-transparent border-0 outline-none resize-none font-medium text-center text-[#1d1d1f] text-lg placeholder:text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5 flex flex-col items-center">
              <label className="block text-xs font-medium text-[#86868b] mb-3 text-center">টেক্সট কালার</label>
              <input 
                type="color" 
                value={currentSetting?.numberColor ?? numberColor}
                onChange={(e) => updateSetting('numberColor', e.target.value)}
                className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 shadow-sm shadow-black/5 overflow-hidden appearance-none p-0"
              />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5 flex flex-col items-center">
              <label className="block text-xs font-medium text-[#86868b] mb-3 text-center">বক্স কালার</label>
              <input 
                type="color" 
                value={currentSetting?.numberBgColor ?? numberBgColor}
                onChange={(e) => updateSetting('numberBgColor', e.target.value)}
                className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 shadow-sm shadow-black/5 overflow-hidden appearance-none p-0"
              />
            </div>
          </div>
          
          {/* Style Options */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm shadow-black/5 space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#86868b] mb-3 uppercase tracking-wider">নাম্বার স্টাইল</label>
              <select 
                value={currentSetting?.numberStyle ?? numberStyle}
                onChange={(e) => updateSetting('numberStyle', e.target.value as any)}
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none cursor-pointer"
              >
                <option value="transparent">ফ্রি নাম্বার (কোনো ব্যাকগ্রাউন্ড নেই)</option>
                <option value="outline">টেক্সট আউটলাইন / গ্লো</option>
                <option value="solid">সলিড ব্যাকগ্রাউন্ড</option>
              </select>
            </div>

            {(currentSetting?.numberStyle ?? numberStyle) === 'outline' && (
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                    <span>আউটলাইনের পুরুত্ব (Thickness)</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{currentSetting?.numberOutlineThickness ?? numberOutlineThickness}px</span>
                  </label>
                  <input 
                    type="range" min="1" max="20" 
                    value={currentSetting?.numberOutlineThickness ?? numberOutlineThickness}
                    onChange={(e) => updateSetting('numberOutlineThickness', Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                    <span>স্মুথনেস / হার্ডনেস (Blur)</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{currentSetting?.numberOutlineBlur ?? numberOutlineBlur}px</span>
                  </label>
                  <input 
                    type="range" min="0" max="30" 
                    value={currentSetting?.numberOutlineBlur ?? numberOutlineBlur}
                    onChange={(e) => updateSetting('numberOutlineBlur', Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color Templates */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
            <label className="block text-xs font-medium text-[#86868b] mb-3 text-center">কালার প্যালেট টেমপ্লেট</label>
            <div className="grid grid-cols-10 gap-2 justify-items-center">
              {COLOR_TEMPLATES.map((palette, i) => (
                <button
                  key={i}
                  onClick={() => {
                    updateSetting('numberBgColor', palette.bg);
                    updateSetting('numberColor', palette.text);
                  }}
                  className="w-8 h-8 rounded-full shadow-sm hover:scale-110 transition-transform flex items-center justify-center border border-gray-200/50 relative overflow-hidden"
                  style={{ backgroundColor: palette.bg }}
                  title={`Text: ${palette.text}, Bg: ${palette.bg}`}
                >
                  <span className="text-[10px] font-bold z-10" style={{ color: palette.text }}>Aa</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5 mt-4">
            <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
              <span>টেক্সট সাইজ</span>
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{currentSetting?.numberSize ?? numberSize}px</span>
            </label>
            <input 
              type="range" 
              min="20" 
              max="120" 
              value={currentSetting?.numberSize ?? numberSize}
              onChange={(e) => updateSetting('numberSize', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
            <label className="block text-xs font-medium text-[#86868b] mb-2">ফন্ট স্টাইল</label>
            <div className="flex gap-2 relative">
              <button 
                onClick={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500/30 outline-none flex justify-between items-center whitespace-nowrap overflow-hidden"
                style={{ fontFamily: currentSetting?.fontFamily ?? fontFamily }}
              >
                {currentSetting?.fontFamily ?? fontFamily}
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
              </button>
              
              {isFontDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFontDropdownOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto py-1">
                    {PREMIUM_FONTS.map(f => (
                      <button
                        key={f}
                        onClick={() => {
                          updateSetting('fontFamily', f);
                          setIsFontDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${(currentSetting?.fontFamily ?? fontFamily) === f ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                        style={{ fontFamily: f, fontSize: '15px' }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </>
              )}
              
              <div className="flex border border-gray-200 rounded-xl bg-gray-50 overflow-hidden divide-x divide-gray-200">
                <button onClick={() => updateSetting('fontWeight', (currentSetting?.fontWeight ?? fontWeight) === 'bold' ? 'normal' : 'bold')} className={`px-3 py-2 flex items-center justify-center transition-all ${(currentSetting?.fontWeight ?? fontWeight) === 'bold' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button onClick={() => updateSetting('fontStyle', (currentSetting?.fontStyle ?? fontStyle) === 'italic' ? 'normal' : 'italic')} className={`px-3 py-2 flex items-center justify-center transition-all ${(currentSetting?.fontStyle ?? fontStyle) === 'italic' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <button onClick={() => updateSetting('textDecoration', (currentSetting?.textDecoration ?? textDecoration) === 'underline' ? 'none' : 'underline')} className={`px-3 py-2 flex items-center justify-center transition-all ${(currentSetting?.textDecoration ?? textDecoration) === 'underline' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Underline">
                  <Underline className="w-4 h-4" />
                </button>
                <button onClick={() => updateSetting('textDecoration', (currentSetting?.textDecoration ?? textDecoration) === 'line-through' ? 'none' : 'line-through')} className={`px-3 py-2 flex items-center justify-center transition-all ${(currentSetting?.textDecoration ?? textDecoration) === 'line-through' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Strikethrough">
                  <Strikethrough className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex border border-gray-200 rounded-xl bg-gray-50 overflow-hidden divide-x divide-gray-200">
                <button onClick={() => updateSetting('textTransform', 'uppercase')} className={`px-4 py-2 flex items-center justify-center text-sm font-bold transition-all ${(currentSetting?.textTransform ?? textTransform) === 'uppercase' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="All Caps">
                  AA
                </button>
                <button onClick={() => updateSetting('textTransform', 'lowercase')} className={`px-4 py-2 flex items-center justify-center text-sm font-bold transition-all ${(currentSetting?.textTransform ?? textTransform) === 'lowercase' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Small Caps">
                  aa
                </button>
                <button onClick={() => updateSetting('textTransform', 'none')} className={`px-4 py-2 flex items-center justify-center text-sm font-bold transition-all ${(currentSetting?.textTransform ?? textTransform) === 'none' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Normal">
                  Aa
                </button>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <SpaceIcon className="w-4 h-4 text-gray-400" />
                  <input type="range" min="-10" max="50" value={currentSetting?.letterSpacing ?? letterSpacing} onChange={(e) => updateSetting('letterSpacing', Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none accent-blue-600" title="Letter Spacing" />
                </div>
                <div className="flex items-center gap-2">
                  <Baseline className="w-4 h-4 text-gray-400" />
                  <input type="range" min="0.5" max="3" step="0.1" value={currentSetting?.lineHeight ?? lineHeight} onChange={(e) => updateSetting('lineHeight', Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none accent-blue-600" title="Line Height" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in duration-300 mt-4">
            <div>
              <label className="flex justify-between text-xs font-medium text-gray-600 mb-2"><span>ডানে-বামে প্যাডিং</span><span className="text-blue-700">{currentSetting?.padX ?? padX}px</span></label>
              <input type="range" min="0" max="100" value={currentSetting?.padX ?? padX} onChange={(e) => updateSetting('padX', Number(e.target.value))} className="w-full h-1 bg-yellow-200 rounded-lg appearance-none accent-blue-600" />
            </div>
            <div>
              <label className="flex justify-between text-xs font-medium text-gray-600 mb-2"><span>উপরে-নিচে প্যাডিং</span><span className="text-blue-700">{currentSetting?.padY ?? padY}px</span></label>
              <input type="range" min="0" max="100" value={currentSetting?.padY ?? padY} onChange={(e) => updateSetting('padY', Number(e.target.value))} className="w-full h-1 bg-yellow-200 rounded-lg appearance-none accent-blue-600" />
            </div>
            <div>
              <label className="flex justify-between text-xs font-medium text-gray-600 mb-2"><span>বর্ডার রেডিয়াস</span><span className="text-blue-700">{currentSetting?.customRadius ?? customRadius}px</span></label>
              <input type="range" min="0" max="150" value={currentSetting?.customRadius ?? customRadius} onChange={(e) => updateSetting('customRadius', Number(e.target.value))} className="w-full h-1 bg-yellow-200 rounded-lg appearance-none accent-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
