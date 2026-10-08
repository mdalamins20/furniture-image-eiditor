import { Droplet, Sliders, Compass } from 'lucide-react';
import { useEditorContext } from '../../../context/EditorContext';

export default function WatermarkInspector() {
  const {
    enableWatermark, setEnableWatermark,
    watermarkText, setWatermarkText,
    watermarkStyle, setWatermarkStyle,
    watermarkOpacity, setWatermarkOpacity,
    watermarkSize, setWatermarkSize,
    watermarkColor, setWatermarkColor,
    watermarkCustomAngle, setWatermarkCustomAngle,
    watermarkGridSpacing, setWatermarkGridSpacing,
    selectedShowroom,
    imageSettings, previewIndex,
    updateSetting, recordSnapshot
  } = useEditorContext();

  const currentSetting = imageSettings[previewIndex];
  const isEnabled = currentSetting?.enableWatermark ?? enableWatermark;

  return (
    <div className="space-y-4">
      {/* 1. Master Toggle & Text */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">জলছাপ (Watermark)</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => updateSetting('enableWatermark', e.target.checked, setEnableWatermark as any)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isEnabled && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-[11px] font-semibold text-gray-600">জলছাপের লেখা</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => {
                recordSnapshot();
                setWatermarkText(e.target.value);
              }}
              placeholder={currentSetting?.assignedShowroom?.name || selectedShowroom || 'শোরুমের নাম'}
              className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800"
            />
          </div>
        )}
      </div>

      {isEnabled && (
        <>
          {/* 2. Watermark Style & Layout */}
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">স্টাইল ও অ্যালাইনমেন্ট</h3>
            </div>

            {/* Style Pills */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'diagonal', label: 'কোণাকুণি (-৪৫°)' },
                { id: 'horizontal', label: 'সোজা (০°)' },
                { id: 'grid', label: 'সম্পূর্ণ গ্রিড' },
                { id: 'custom', label: 'কাস্টম এঙ্গেল' }
              ].map(item => {
                const isSelected = (currentSetting?.watermarkStyle ?? watermarkStyle) === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateSetting('watermarkStyle', item.id as any, setWatermarkStyle as any)}
                    className={`p-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-gray-50 border-gray-200/80 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Angle Slider */}
            {(currentSetting?.watermarkStyle ?? watermarkStyle) === 'custom' && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                  <span>ঘূর্ণন কোণ (Angle)</span>
                  <span className="text-blue-600 font-semibold">{currentSetting?.watermarkCustomAngle ?? watermarkCustomAngle}°</span>
                </div>
                <input
                  type="range" min="-180" max="180"
                  value={currentSetting?.watermarkCustomAngle ?? watermarkCustomAngle}
                  onChange={(e) => updateSetting('watermarkCustomAngle', Number(e.target.value), setWatermarkCustomAngle as any)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}

            {/* Grid Spacing Slider */}
            {(currentSetting?.watermarkStyle ?? watermarkStyle) === 'grid' && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                  <span>গ্রিডের ফাঁকা জায়গা (Spacing)</span>
                  <span className="text-blue-600 font-semibold">{currentSetting?.watermarkGridSpacing ?? watermarkGridSpacing}px</span>
                </div>
                <input
                  type="range" min="80" max="600" step="10"
                  value={currentSetting?.watermarkGridSpacing ?? watermarkGridSpacing}
                  onChange={(e) => updateSetting('watermarkGridSpacing', Number(e.target.value), setWatermarkGridSpacing as any)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}
          </div>

          {/* 3. Opacity & Color */}
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">দৃশ্যমানতা ও সাইজ</h3>
            </div>

            {/* Opacity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                <span>অপাসিটি (স্বচ্ছতা)</span>
                <span className="text-blue-600 font-semibold">{currentSetting?.watermarkOpacity ?? watermarkOpacity}%</span>
              </div>
              <input
                type="range" min="5" max="100"
                value={currentSetting?.watermarkOpacity ?? watermarkOpacity}
                onChange={(e) => updateSetting('watermarkOpacity', Number(e.target.value), setWatermarkOpacity as any)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Size */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                <span>জলছাপের সাইজ</span>
                <span className="text-blue-600 font-semibold">{currentSetting?.watermarkSize ?? watermarkSize}px</span>
              </div>
              <input
                type="range" min="20" max="150"
                value={currentSetting?.watermarkSize ?? watermarkSize}
                onChange={(e) => updateSetting('watermarkSize', Number(e.target.value), setWatermarkSize as any)}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Color */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200/60 pt-1">
              <span className="text-[11px] text-gray-600 font-medium">জলছাপের রং</span>
              <input
                type="color"
                value={currentSetting?.watermarkColor ?? watermarkColor}
                onChange={(e) => updateSetting('watermarkColor', e.target.value, setWatermarkColor as any)}
                className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
