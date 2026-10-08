import React from 'react';
import { Image, Upload, Sliders, Moon, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Minus, Plus } from 'lucide-react';
import { useEditorContext } from '../../../context/EditorContext';

export default function LogoInspector() {
  const {
    logoUrl, setLogoUrl,
    logoSize, setLogoSize,
    enableLogoShadow, setEnableLogoShadow,
    logoShadowColor, setLogoShadowColor,
    logoShadowBlur, setLogoShadowBlur,
    logoShadowIntensity, setLogoShadowIntensity,
    imageSettings, previewIndex,
    updateSetting, recordSnapshot
  } = useEditorContext();

  const currentSetting = imageSettings[previewIndex];

  // Quick corner positioning
  const setPositionPreset = (x: number, y: number) => {
    recordSnapshot();
    updateSetting('logoPos', { x, y });
    updateSetting('isLogoPosManual', true);
  };

  // Upload custom logo
  const handleCustomLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      recordSnapshot();
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateSetting('logoUrl', base64, setLogoUrl as any);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleStepSize = (delta: number) => {
    recordSnapshot();
    const curr = currentSetting?.logoSize ?? logoSize;
    const next = Math.max(5, Math.min(50, curr + delta));
    updateSetting('logoSize', next, setLogoSize as any);
  };

  return (
    <div className="space-y-4">
      {/* 1. Logo Preview & Replacement */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">লোগো প্রিভিউ ও রিপ্লেস</h3>
        </div>

        {/* Current Logo Preview */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/60">
          <div className="w-14 h-14 bg-white rounded-lg border border-gray-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
            {(currentSetting?.logoUrl || logoUrl) ? (
              <img
                src={currentSetting?.logoUrl || logoUrl!}
                alt="Logo Preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-[10px] text-gray-400">লোগো নেই</span>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold text-gray-800">
              {currentSetting?.assignedShowroom?.name || 'কাস্টম লোগো'}
            </p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium cursor-pointer transition-all shadow-2xs">
              <Upload className="w-3 h-3" />
              <span>লোগো বদলান</span>
              <input type="file" accept="image/*" onChange={handleCustomLogo} className="hidden" />
            </label>
          </div>
        </div>

        {/* 1-Click Corner Presets */}
        <div className="pt-1">
          <div className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            ১-ক্লিকে কোণায় বসান
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => setPositionPreset(12, 12)}
              className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200/80 rounded-lg text-[10px] font-medium text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowUpLeft className="w-3 h-3" /> উপরে-বামে
            </button>
            <button
              onClick={() => setPositionPreset(88, 12)}
              className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200/80 rounded-lg text-[10px] font-medium text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowUpRight className="w-3 h-3" /> উপরে-ডানে
            </button>
            <button
              onClick={() => setPositionPreset(12, 88)}
              className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200/80 rounded-lg text-[10px] font-medium text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowDownLeft className="w-3 h-3" /> নিচে-বামে
            </button>
            <button
              onClick={() => setPositionPreset(88, 88)}
              className="py-1.5 px-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200/80 rounded-lg text-[10px] font-medium text-gray-700 transition-all flex items-center justify-center gap-1"
            >
              <ArrowDownRight className="w-3 h-3" /> নিচে-ডানে
            </button>
          </div>
        </div>
      </div>

      {/* 2. Logo Size Controls */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">লোগো সাইজ</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStepSize(-2)}
            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 active:scale-95 transition-all shrink-0"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[11px] text-gray-600 font-medium">
              <span>সাইজ</span>
              <span className="text-blue-600 font-semibold">{currentSetting?.logoSize ?? logoSize}%</span>
            </div>
            <input
              type="range" min="5" max="50"
              value={currentSetting?.logoSize ?? logoSize}
              onChange={(e) => updateSetting('logoSize', Number(e.target.value), setLogoSize as any)}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <button
            onClick={() => handleStepSize(2)}
            className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Shadow & Glow Effect */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">লোগোর পেছনের গ্লো / শ্যাডো</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentSetting?.enableLogoShadow ?? enableLogoShadow}
              onChange={(e) => updateSetting('enableLogoShadow', e.target.checked, setEnableLogoShadow as any)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {(currentSetting?.enableLogoShadow ?? enableLogoShadow) && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {/* Shadow Color */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200/60">
              <span className="text-[11px] text-gray-600 font-medium">শ্যাডো রং</span>
              <input
                type="color"
                value={currentSetting?.logoShadowColor ?? logoShadowColor}
                onChange={(e) => updateSetting('logoShadowColor', e.target.value, setLogoShadowColor as any)}
                className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
              />
            </div>

            {/* Shadow Blur */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                <span>ব্লার (Blur)</span>
                <span className="text-blue-600 font-semibold">{currentSetting?.logoShadowBlur ?? logoShadowBlur}px</span>
              </div>
              <input
                type="range" min="1" max="50"
                value={currentSetting?.logoShadowBlur ?? logoShadowBlur}
                onChange={(e) => updateSetting('logoShadowBlur', Number(e.target.value), setLogoShadowBlur as any)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Shadow Intensity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                <span>তীব্রতা (Layers)</span>
                <span className="text-blue-600 font-semibold">{currentSetting?.logoShadowIntensity ?? logoShadowIntensity}x</span>
              </div>
              <input
                type="range" min="1" max="5"
                value={currentSetting?.logoShadowIntensity ?? logoShadowIntensity}
                onChange={(e) => updateSetting('logoShadowIntensity', Number(e.target.value), setLogoShadowIntensity as any)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
