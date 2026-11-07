import React, { useState } from 'react';
import { ImageIcon, Settings, ChevronDown, Bold, Italic, Underline, Strikethrough, Space as SpaceIcon } from 'lucide-react';
import { useEditorContext } from '../../../context/EditorContext';
import { FONTS } from '../../../types';

export default function LogoSettings() {
  const {
    imageSettings, previewIndex, updateSetting,
    logoSize, enableLogoShadow, logoShadowColor,
    enableWatermark, setEnableWatermark,
    watermarkText, setWatermarkText,
    watermarkStyle, setWatermarkStyle,
    watermarkOpacity, setWatermarkOpacity,
    watermarkSize, setWatermarkSize,
    watermarkColor, setWatermarkColor,
    watermarkFontFamily, setWatermarkFontFamily,
    watermarkFontWeight, setWatermarkFontWeight,
    watermarkFontStyle, setWatermarkFontStyle,
    watermarkTextDecoration, setWatermarkTextDecoration,
    watermarkTextTransform, setWatermarkTextTransform,
    watermarkLetterSpacing, setWatermarkLetterSpacing,
    watermarkCustomAngle, setWatermarkCustomAngle,
    watermarkIsGrid, setWatermarkIsGrid,
    watermarkGridSpacing, setWatermarkGridSpacing,
    setLogo, setLogoUrl, setLogoSize, setEnableLogoShadow, setLogoShadowColor, setLogoShadowBlur, setLogoShadowIntensity, logoShadowBlur, logoShadowIntensity
  } = useEditorContext();

  const [isWatermarkFontDropdownOpen, setIsWatermarkFontDropdownOpen] = useState(false);
  const currentSetting = imageSettings[previewIndex];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoUrl(base64);
        updateSetting('logoUrl', base64, setLogoUrl);
      };
      reader.readAsDataURL(file);
    }
  };



  const PREMIUM_FONTS = FONTS.map(f => f.name);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Manual Logo Upload & Customization */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/40 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <h2 className="text-lg font-medium mb-5 flex items-center gap-3 text-[#1d1d1f]">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-black/5"><ImageIcon className="w-5 h-5" /></div>
          লোগো আপলোড ও সাইজ
        </h2>
        
        <div className="space-y-6">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl cursor-pointer bg-[#F5F5F7]/80 hover:bg-blue-50/50 transition-all group">
            <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition-colors">কাস্টম লোগো আপলোড</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-3">
              <span>লোগোর সাইজ</span>
              <span className="text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg text-xs font-semibold tracking-tight">{currentSetting?.logoSize ?? logoSize}%</span>
            </label>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={currentSetting?.logoSize ?? logoSize}
              onChange={(e) => updateSetting('logoSize', Number(e.target.value), setLogoSize as any)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
            />
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={currentSetting?.enableLogoShadow ?? enableLogoShadow} 
                onChange={(e) => updateSetting('enableLogoShadow', e.target.checked, setEnableLogoShadow as any)}
                className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600/50 focus:ring-2 cursor-pointer transition-all"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">লোগোর পেছনে শ্যাডো/গ্লো দিন</span>
            </label>

            {(currentSetting?.enableLogoShadow ?? enableLogoShadow) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-xs font-medium text-[#86868b] mb-2">শ্যাডো কালার</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={currentSetting?.logoShadowColor ?? logoShadowColor} 
                    onChange={(e) => updateSetting('logoShadowColor', e.target.value, setLogoShadowColor as any)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-2 border-gray-200 shadow-sm shadow-black/5 bg-transparent p-0"
                  />
                  <span className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">{currentSetting?.logoShadowColor ?? logoShadowColor}</span>
                </div>
                
                <div className="mt-5">
                  <label className="flex justify-between text-xs font-medium text-[#86868b] mb-3">
                    <span>শ্যাডো স্প্রেড/গ্লো (Blur)</span>
                    <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold">{currentSetting?.logoShadowBlur ?? logoShadowBlur}px</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={currentSetting?.logoShadowBlur ?? logoShadowBlur}
                    onChange={(e) => updateSetting('logoShadowBlur', Number(e.target.value), setLogoShadowBlur as any)}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                  />
                </div>
                
                <div className="mt-5">
                  <label className="flex justify-between text-xs font-medium text-[#86868b] mb-3">
                    <span>শ্যাডোর ইনটেনসিটি / গাঢ়তা</span>
                    <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold">{currentSetting?.logoShadowIntensity ?? logoShadowIntensity}x</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={currentSetting?.logoShadowIntensity ?? logoShadowIntensity}
                    onChange={(e) => updateSetting('logoShadowIntensity', Number(e.target.value), setLogoShadowIntensity as any)}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Watermark Customization */}
      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/40 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium flex items-center gap-3 text-[#1d1d1f] cursor-pointer" onClick={() => setEnableWatermark(!enableWatermark)}>
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shadow-black/5">
              <Settings className="w-5 h-5" />
            </div>
            ওয়াটারমার্ক
          </h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={currentSetting?.enableWatermark ?? enableWatermark} onChange={(e) => updateSetting('enableWatermark', e.target.checked, setEnableWatermark as any)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
        
        {enableWatermark && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
              <label className="block text-sm font-medium text-gray-700 mb-2">ওয়াটারমার্ক টেক্সট</label>
              <input 
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="যেমন: আপনার ফার্নিচার বা ব্র্যান্ডের নাম"
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
                <label className="block text-xs font-medium text-[#86868b] mb-2">প্যাটার্ন / স্টাইল</label>
                <select 
                  value={currentSetting?.watermarkStyle ?? watermarkStyle}
                  onChange={(e) => updateSetting('watermarkStyle', e.target.value as any, setWatermarkStyle as any)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none text-sm transition-all"
                >
                  <option value="horizontal">সিঙ্গেল সোজা</option>
                  <option value="diagonal">সিঙ্গেল বাঁকা</option>
                  <option value="grid">পুরো ছবিতে</option>
                  <option value="custom">কাস্টম (Custom)</option>
                </select>

                {watermarkStyle === 'custom' && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4 mt-4 text-left">
                    <div>
                      <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                        <span>বাঁকানো (Angle)</span>
                        <span className="text-blue-600 font-medium">{watermarkCustomAngle}°</span>
                      </label>
                      <input type="range" min="-180" max="180" value={currentSetting?.watermarkCustomAngle ?? watermarkCustomAngle} onChange={(e) => updateSetting('watermarkCustomAngle', Number(e.target.value), setWatermarkCustomAngle as any)} className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">পুরো ছবি জুড়ে রিপিট (Grid)</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={currentSetting?.watermarkIsGrid ?? watermarkIsGrid} onChange={(e) => updateSetting('watermarkIsGrid', e.target.checked, setWatermarkIsGrid as any)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {watermarkIsGrid && (
                      <div>
                        <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                          <span>স্পেসিং (Spacing)</span>
                          <span className="text-blue-600 font-medium">{currentSetting?.watermarkGridSpacing ?? watermarkGridSpacing}px</span>
                        </label>
                        <input type="range" min="100" max="800" step="10" value={currentSetting?.watermarkGridSpacing ?? watermarkGridSpacing} onChange={(e) => updateSetting('watermarkGridSpacing', Number(e.target.value), setWatermarkGridSpacing as any)} className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5 flex flex-col items-center">
                <label className="block text-xs font-medium text-[#86868b] mb-2 text-center">রং (Color)</label>
                <input 
                  type="color" 
                  value={currentSetting?.watermarkColor ?? watermarkColor} 
                  onChange={(e) => updateSetting('watermarkColor', e.target.value, setWatermarkColor as any)}
                  className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-200 shadow-sm shadow-black/5 overflow-hidden appearance-none p-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
                <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                  <span>অপাসিটি</span>
                  <span className="text-blue-600 font-medium">{currentSetting?.watermarkOpacity ?? watermarkOpacity}%</span>
                </label>
                <input type="range" min="5" max="100" value={currentSetting?.watermarkOpacity ?? watermarkOpacity} onChange={(e) => updateSetting('watermarkOpacity', Number(e.target.value), setWatermarkOpacity as any)} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
                <label className="flex justify-between text-xs font-medium text-gray-600 mb-3">
                  <span>সাইজ</span>
                  <span className="text-blue-600 font-medium">{currentSetting?.watermarkSize ?? watermarkSize}px</span>
                </label>
                <input type="range" min="20" max="150" value={currentSetting?.watermarkSize ?? watermarkSize} onChange={(e) => updateSetting('watermarkSize', Number(e.target.value), setWatermarkSize as any)} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm shadow-black/5">
              <label className="block text-xs font-medium text-[#86868b] mb-2">ফন্ট স্টাইল (ওয়াটারমার্ক)</label>
              <div className="flex gap-2 relative">
                <button 
                  onClick={() => setIsWatermarkFontDropdownOpen(!isWatermarkFontDropdownOpen)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500/30 outline-none flex justify-between items-center whitespace-nowrap overflow-hidden"
                  style={{ fontFamily: currentSetting?.watermarkFontFamily ?? watermarkFontFamily }}
                >
                  {currentSetting?.watermarkFontFamily ?? watermarkFontFamily}
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                </button>
                
                {isWatermarkFontDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsWatermarkFontDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto py-1">
                      {PREMIUM_FONTS.map(f => (
                        <button
                          key={f}
                          onClick={() => {
                            updateSetting('watermarkFontFamily', f, setWatermarkFontFamily as any);
                            setIsWatermarkFontDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${(currentSetting?.watermarkFontFamily ?? watermarkFontFamily) === f ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                          style={{ fontFamily: f, fontSize: '15px' }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                <div className="flex border border-gray-200 rounded-xl bg-gray-50 overflow-hidden divide-x divide-gray-200">
                  <button onClick={() => updateSetting('watermarkFontWeight', (currentSetting?.watermarkFontWeight ?? watermarkFontWeight) === 'bold' ? 'normal' : 'bold', setWatermarkFontWeight as any)} className={`px-3 py-2 flex items-center justify-center transition-all ${(currentSetting?.watermarkFontWeight ?? watermarkFontWeight) === 'bold' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Bold">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateSetting('watermarkFontStyle', (currentSetting?.watermarkFontStyle ?? watermarkFontStyle) === 'italic' ? 'normal' : 'italic', setWatermarkFontStyle as any)} className={`px-3 py-2 flex items-center justify-center transition-all ${(currentSetting?.watermarkFontStyle ?? watermarkFontStyle) === 'italic' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Italic">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateSetting('watermarkTextDecoration', (currentSetting?.watermarkTextDecoration ?? watermarkTextDecoration) === 'underline' ? 'none' : 'underline', setWatermarkTextDecoration as any)} className={`px-3 py-2 flex items-center justify-center transition-all ${(currentSetting?.watermarkTextDecoration ?? watermarkTextDecoration) === 'underline' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Underline">
                    <Underline className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateSetting('watermarkTextDecoration', (currentSetting?.watermarkTextDecoration ?? watermarkTextDecoration) === 'line-through' ? 'none' : 'line-through', setWatermarkTextDecoration as any)} className={`px-3 py-2 flex items-center justify-center transition-all ${(currentSetting?.watermarkTextDecoration ?? watermarkTextDecoration) === 'line-through' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Strikethrough">
                    <Strikethrough className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex border border-gray-200 rounded-xl bg-gray-50 overflow-hidden divide-x divide-gray-200">
                  <button onClick={() => updateSetting('watermarkTextTransform', 'uppercase', setWatermarkTextTransform as any)} className={`px-4 py-2 flex items-center justify-center text-sm font-bold transition-all ${(currentSetting?.watermarkTextTransform ?? watermarkTextTransform) === 'uppercase' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="All Caps">
                    AA
                  </button>
                  <button onClick={() => updateSetting('watermarkTextTransform', 'lowercase', setWatermarkTextTransform as any)} className={`px-4 py-2 flex items-center justify-center text-sm font-bold transition-all ${(currentSetting?.watermarkTextTransform ?? watermarkTextTransform) === 'lowercase' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Small Caps">
                    aa
                  </button>
                  <button onClick={() => updateSetting('watermarkTextTransform', 'none', setWatermarkTextTransform as any)} className={`px-4 py-2 flex items-center justify-center text-sm font-bold transition-all ${(currentSetting?.watermarkTextTransform ?? watermarkTextTransform) === 'none' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Normal">
                    Aa
                  </button>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <SpaceIcon className="w-4 h-4 text-gray-400" />
                    <input type="range" min="-10" max="50" value={currentSetting?.watermarkLetterSpacing ?? watermarkLetterSpacing} onChange={(e) => updateSetting('watermarkLetterSpacing', Number(e.target.value), setWatermarkLetterSpacing as any)} className="w-full h-1 bg-gray-200 rounded-lg appearance-none accent-blue-600" title="Letter Spacing" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
