import React from 'react';
import { ShieldCheck, Move, Sparkles, RotateCcw } from 'lucide-react';
import { SHOWROOMS } from '../../../../../types';
import type { SelectedElement } from '../../../types/boostTypes';

interface LogoTabProps {
  showLogo: boolean;
  onToggleShowLogo: (checked: boolean) => void;
  selectedElement: SelectedElement;
  onSelectLogoElement: () => void;
  logoPos: { x: number; y: number };
  onLogoPosChange: (pos: { x: number; y: number }) => void;
  logoSize: number;
  onLogoSizeChange: (size: number) => void;
  activeShowroom?: typeof SHOWROOMS[0];
  // Logo Shadow Controls
  enableLogoShadow?: boolean;
  onToggleLogoShadow?: (checked: boolean) => void;
  logoShadowColor?: string;
  onLogoShadowColorChange?: (color: string) => void;
  logoShadowBlur?: number;
  onLogoShadowBlurChange?: (blur: number) => void;
  logoShadowOffsetY?: number;
  onLogoShadowOffsetYChange?: (offset: number) => void;
}

export const LogoTab: React.FC<LogoTabProps> = ({
  showLogo,
  onToggleShowLogo,
  selectedElement,
  onSelectLogoElement,
  logoPos,
  onLogoPosChange,
  logoSize,
  onLogoSizeChange,
  activeShowroom,
  enableLogoShadow = true,
  onToggleLogoShadow,
  logoShadowColor = '#000000',
  onLogoShadowColorChange,
  logoShadowBlur = 16,
  onLogoShadowBlurChange,
  logoShadowOffsetY = 4,
  onLogoShadowOffsetYChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Showroom Logo Preview Badge */}
      {activeShowroom && activeShowroom.file && (
        <div className="flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden shrink-0 shadow-inner">
            <img 
              src={`/logos/${activeShowroom.file}`} 
              alt={activeShowroom.name} 
              className="max-w-full max-h-full object-contain" 
            />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-gray-900 block truncate">{activeShowroom.name}</span>
            <span className="text-[11px] text-gray-400 font-mono truncate block">{activeShowroom.file}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
        <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> লোগো প্রদর্শন
        </span>
        <input
          type="checkbox"
          checked={showLogo}
          onChange={(e) => onToggleShowLogo(e.target.checked)}
          className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
        />
      </div>

      {showLogo && (
        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-blue-600" /> লোগো মুভমেন্ট ও পজিশন
            </span>
            <button
              onClick={onSelectLogoElement}
              className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${
                selectedElement === 'logo' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {selectedElement === 'logo' ? 'লোগো সিলেক্টেড' : 'সিলেক্ট করুন'}
            </button>
          </div>

          {/* Logo Presets */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => {
                onSelectLogoElement();
                onLogoPosChange({ x: 12, y: 12 });
              }}
              className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
            >
              উপরে বাম (ডিফল্ট)
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectLogoElement();
                onLogoPosChange({ x: 88, y: 12 });
              }}
              className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
            >
              উপরে ডান
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectLogoElement();
                onLogoPosChange({ x: 12, y: 88 });
              }}
              className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
            >
              নিচে বাম
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectLogoElement();
                onLogoPosChange({ x: 88, y: 88 });
              }}
              className="py-1 px-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-md font-semibold text-gray-700 text-center"
            >
              নিচে ডান
            </button>
          </div>

          {/* Logo X & Y Sliders */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-gray-600 font-semibold mb-0.5">
                <span>লোগো X পজিশন:</span>
                <span className="font-mono text-blue-600 font-bold">{logoPos.x}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={logoPos.x}
                onChange={(e) => onLogoPosChange({ ...logoPos, x: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-gray-600 font-semibold mb-0.5">
                <span>লোগো Y পজিশন:</span>
                <span className="font-mono text-blue-600 font-bold">{logoPos.y}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={logoPos.y}
                onChange={(e) => onLogoPosChange({ ...logoPos, y: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Logo Size Control (Supports down to 10% / 10px) */}
          <div className="pt-2 border-t border-blue-200/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-600">লোগোর আকার:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onLogoSizeChange(Math.max(10, logoSize - (logoSize <= 30 ? 2 : 5)))}
                  className="w-7 h-7 bg-white hover:bg-gray-100 active:scale-95 rounded-lg font-bold text-gray-800 border border-gray-200 cursor-pointer text-sm"
                  title="লোগো ছোট করুন (-)"
                >
                  -
                </button>
                <span className="text-xs font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 min-w-[50px] text-center">
                  {logoSize}px
                </span>
                <button
                  type="button"
                  onClick={() => onLogoSizeChange(Math.min(260, logoSize + (logoSize < 30 ? 2 : 5)))}
                  className="w-7 h-7 bg-white hover:bg-gray-100 active:scale-95 rounded-lg font-bold text-gray-800 border border-gray-200 cursor-pointer text-sm"
                  title="লোগো বড় করুন (+)"
                >
                  +
                </button>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="260"
              step="2"
              value={logoSize}
              onChange={(e) => onLogoSizeChange(Number(e.target.value))}
              className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Logo Shadow Control Panel */}
          <div className="pt-2 border-t border-blue-200/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> লোগোর নিচে শ্যাডো
              </span>
              <div className="flex items-center gap-2">
                {enableLogoShadow && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogoShadowColorChange) onLogoShadowColorChange('#000000');
                      if (onLogoShadowBlurChange) onLogoShadowBlurChange(16);
                      if (onLogoShadowOffsetYChange) onLogoShadowOffsetYChange(4);
                    }}
                    title="শ্যাডো রিসেট করুন"
                    className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-gray-500 hover:text-red-600 bg-white rounded border border-gray-200"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>রিসেট</span>
                  </button>
                )}
                <input
                  type="checkbox"
                  checked={enableLogoShadow}
                  onChange={(e) => onToggleLogoShadow && onToggleLogoShadow(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                />
              </div>
            </div>

            {enableLogoShadow && (
              <div className="space-y-2 pt-1">
                {/* Shadow Color */}
                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-200/80">
                  <span className="text-[11px] font-bold text-gray-700">শ্যাডো কালার</span>
                  <input
                    type="color"
                    value={logoShadowColor}
                    onChange={(e) => onLogoShadowColorChange && onLogoShadowColorChange(e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer border-0 bg-transparent"
                  />
                </div>

                {/* Shadow Blur Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-600 font-semibold mb-0.5">
                    <span>শ্যাডো ব্লার (Blur):</span>
                    <span className="font-mono text-blue-600 font-bold">{logoShadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={logoShadowBlur}
                    onChange={(e) => onLogoShadowBlurChange && onLogoShadowBlurChange(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Shadow Offset Y Slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-600 font-semibold mb-0.5">
                    <span>দূরত্ব / অফসেট (Y):</span>
                    <span className="font-mono text-blue-600 font-bold">{logoShadowOffsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={logoShadowOffsetY}
                    onChange={(e) => onLogoShadowOffsetYChange && onLogoShadowOffsetYChange(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default LogoTab;
