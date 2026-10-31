import React, { type RefObject } from 'react';
import { Store, Phone, ShieldCheck } from 'lucide-react';
import { SHOWROOMS } from '../../../../types';
import type { 
  SidebarTab, AdImageItem, CardTheme, PriceBadgeStyle, SelectedElement, BadgeDisplayStyle 
} from '../../types/boostTypes';
import ShowroomTab from './tabs/ShowroomTab';
import CanvasThemeTab from './tabs/CanvasThemeTab';
import LogoTab from './tabs/LogoTab';

interface BoostSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  // Showroom Tab Props
  activeImage: AdImageItem | null;
  imagesCount: number;
  currentIndex: number;
  activeShowroom: typeof SHOWROOMS[0];
  onUpdateActiveField: (field: 'modelNumber' | 'price' | 'cutPrice', value: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onShowroomNumbersChange?: (numbers: string) => void;
  // Price Toggles on Card
  showCutPrice: boolean;
  onToggleCutPrice: (checked: boolean) => void;
  showMainPriceInCard: boolean;
  onToggleMainPriceInCard: (checked: boolean) => void;
  enableSeparatePrice?: boolean;
  onToggleSeparatePrice?: (checked: boolean) => void;
  selectedElement: SelectedElement;
  onSelectPriceElement?: () => void;
  priceBadgeStyle?: PriceBadgeStyle;
  onSelectPriceBadgeStyle?: (style: PriceBadgeStyle) => void;
  priceScale?: number;
  onPriceScaleChange?: (scale: number) => void;
  onSetPricePosPreset?: (pos: { x: number; y: number }) => void;
  // Card Tab Props
  cardPos: { x: number; y: number };
  onCardPosChange: (pos: { x: number; y: number }) => void;
  onApplyCardPosToAll?: () => void;
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
  // Badge Display Style & Typography
  badgeDisplayStyle: BadgeDisplayStyle;
  onSelectBadgeDisplayStyle: (style: BadgeDisplayStyle) => void;
  customBgColor: string;
  onCustomBgColorChange: (color: string) => void;
  customTextColor: string;
  onCustomTextColorChange: (color: string) => void;
  outlineThickness: number;
  onOutlineThicknessChange: (thick: number) => void;
  // Individual element colors
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
  actualPriceScale: number;
  onActualPriceScaleChange: (scale: number) => void;
  fontWeight: 'normal' | 'bold';
  onFontWeightChange: (weight: 'normal' | 'bold') => void;
  fontStyle: 'normal' | 'italic';
  onFontStyleChange: (style: 'normal' | 'italic') => void;
  textDecoration: 'none' | 'underline' | 'line-through';
  onTextDecorationChange: (dec: 'none' | 'underline' | 'line-through') => void;
  textTransform: 'none' | 'uppercase' | 'lowercase';
  onTextTransformChange: (trans: 'none' | 'uppercase' | 'lowercase') => void;
  lineHeight: number;
  onLineHeightChange: (lh: number) => void;
  letterSpacing: number;
  onLetterSpacingChange: (ls: number) => void;
  customRadius: number;
  onCustomRadiusChange: (rad: number) => void;
  customPadX: number;
  onCustomPadXChange: (px: number) => void;
  customPadY: number;
  onCustomPadYChange: (py: number) => void;
  // Logo Tab Props
  showLogo: boolean;
  onToggleShowLogo: (checked: boolean) => void;
  onSelectLogoElement: () => void;
  logoPos: { x: number; y: number };
  onLogoPosChange: (pos: { x: number; y: number }) => void;
  logoSize: number;
  onLogoSizeChange: (size: number) => void;
  // Logo Shadow Props
  enableLogoShadow?: boolean;
  onToggleLogoShadow?: (checked: boolean) => void;
  logoShadowColor?: string;
  onLogoShadowColorChange?: (color: string) => void;
  logoShadowBlur?: number;
  onLogoShadowBlurChange?: (blur: number) => void;
  logoShadowOffsetY?: number;
  onLogoShadowOffsetYChange?: (offset: number) => void;
  // Multi-Selection info
  selectedCount?: number;
}

export const BoostSidebar: React.FC<BoostSidebarProps> = (props) => {
  const tabs: { id: SidebarTab; label: string; icon: any }[] = [
    { id: 'showroom', label: 'শোরুম ও মডেল', icon: Store },
    { id: 'card', label: 'নম্বর ও কার্ড', icon: Phone },
    { id: 'logo', label: 'লোগো', icon: ShieldCheck },
  ];

  const selCount = props.selectedCount ?? 1;

  return (
    <div className="w-full lg:w-[350px] xl:w-[380px] bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/80 shadow-xs flex flex-col shrink-0 h-auto lg:h-full lg:overflow-hidden">
      {/* Sticky Tab Header */}
      <div className="p-2 border-b border-gray-100 bg-white/90">
        <div className="flex bg-gray-100/90 p-1 rounded-xl gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = props.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => props.onTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Multi-Selection Scope Indicator */}
        <div className="mt-1.5 px-2.5 py-1 rounded-lg text-[10.5px] flex items-center justify-between transition-colors">
          {selCount > 1 ? (
            <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg flex items-center justify-between font-bold shadow-2xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                {selCount}টি ছবি একসাথে এডিট হচ্ছে
              </span>
              <span className="text-[9px] bg-blue-200/80 text-blue-800 px-1.5 py-0.2 rounded font-mono">
                সবগুলো চেঞ্জ হবে
              </span>
            </div>
          ) : (
            <div className="w-full bg-gray-50 border border-gray-200/70 text-gray-600 px-2 py-0.5 rounded-lg flex items-center justify-between text-[10px]">
              <span className="truncate">শুধুমাত্র এই ছবিটি এডিট হচ্ছে (#{props.currentIndex + 1})</span>
              <span className="text-[9px] text-gray-500 font-mono">একক মোড</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content Panel */}
      <div className="flex-1 p-3 sm:p-4 lg:overflow-y-auto custom-scrollbar space-y-4">
        {props.activeTab === 'showroom' && (
          <ShowroomTab
            activeImage={props.activeImage}
            imagesCount={props.imagesCount}
            currentIndex={props.currentIndex}
            activeShowroom={props.activeShowroom}
            onUpdateActiveField={props.onUpdateActiveField}
            fileInputRef={props.fileInputRef}
            onShowroomNumbersChange={props.onShowroomNumbersChange}
          />
        )}

        {props.activeTab === 'card' && (
          <CanvasThemeTab
            cardPos={props.cardPos}
            onCardPosChange={props.onCardPosChange}
            onApplyCardPosToAll={props.onApplyCardPosToAll}
            selectedElement={props.selectedElement}
            onSelectCardElement={props.onSelectCardElement}
            cardTheme={props.cardTheme}
            onSelectCardTheme={props.onSelectCardTheme}
            minimalTextColor={props.minimalTextColor}
            onSelectMinimalTextColor={props.onSelectMinimalTextColor}
            cardScale={props.cardScale}
            onCardScaleChange={props.onCardScaleChange}
            fontFamily={props.fontFamily}
            onFontFamilyChange={props.onFontFamilyChange}
            showShowroomName={props.showShowroomName}
            onToggleShowroomName={props.onToggleShowroomName}
            badgeDisplayStyle={props.badgeDisplayStyle}
            onSelectBadgeDisplayStyle={props.onSelectBadgeDisplayStyle}
            customBgColor={props.customBgColor}
            onCustomBgColorChange={props.onCustomBgColorChange}
            customTextColor={props.customTextColor}
            onCustomTextColorChange={props.onCustomTextColorChange}
            outlineThickness={props.outlineThickness}
            onOutlineThicknessChange={props.onOutlineThicknessChange}
            showCutPrice={props.showCutPrice}
            onToggleCutPrice={props.onToggleCutPrice}
            showMainPriceInCard={props.showMainPriceInCard}
            onToggleMainPriceInCard={props.onToggleMainPriceInCard}
            customTitleColor={props.customTitleColor}
            onCustomTitleColorChange={props.onCustomTitleColorChange}
            customMLabelColor={props.customMLabelColor}
            onCustomMLabelColorChange={props.onCustomMLabelColorChange}
            customMValueColor={props.customMValueColor}
            onCustomMValueColorChange={props.onCustomMValueColorChange}
            customPLabelColor={props.customPLabelColor}
            onCustomPLabelColorChange={props.onCustomPLabelColorChange}
            customCutPriceColor={props.customCutPriceColor}
            onCustomCutPriceColorChange={props.onCustomCutPriceColorChange}
            customActualPriceColor={props.customActualPriceColor}
            onCustomActualPriceColorChange={props.onCustomActualPriceColorChange}
            customPhoneColor={props.customPhoneColor}
            onCustomPhoneColorChange={props.onCustomPhoneColorChange}
            onResetElementColors={props.onResetElementColors}
            actualPriceScale={props.actualPriceScale}
            onActualPriceScaleChange={props.onActualPriceScaleChange}
            fontWeight={props.fontWeight}
            onFontWeightChange={props.onFontWeightChange}
            fontStyle={props.fontStyle}
            onFontStyleChange={props.onFontStyleChange}
            textDecoration={props.textDecoration}
            onTextDecorationChange={props.onTextDecorationChange}
            textTransform={props.textTransform}
            onTextTransformChange={props.onTextTransformChange}
            lineHeight={props.lineHeight}
            onLineHeightChange={props.onLineHeightChange}
            letterSpacing={props.letterSpacing}
            onLetterSpacingChange={props.onLetterSpacingChange}
            customRadius={props.customRadius}
            onCustomRadiusChange={props.onCustomRadiusChange}
            customPadX={props.customPadX}
            onCustomPadXChange={props.onCustomPadXChange}
            customPadY={props.customPadY}
            onCustomPadYChange={props.onCustomPadYChange}
          />
        )}

        {props.activeTab === 'logo' && (
          <LogoTab
            showLogo={props.showLogo}
            onToggleShowLogo={props.onToggleShowLogo}
            selectedElement={props.selectedElement}
            onSelectLogoElement={props.onSelectLogoElement}
            logoPos={props.logoPos}
            onLogoPosChange={props.onLogoPosChange}
            logoSize={props.logoSize}
            onLogoSizeChange={props.onLogoSizeChange}
            activeShowroom={props.activeShowroom}
            enableLogoShadow={props.enableLogoShadow}
            onToggleLogoShadow={props.onToggleLogoShadow}
            logoShadowColor={props.logoShadowColor}
            onLogoShadowColorChange={props.onLogoShadowColorChange}
            logoShadowBlur={props.logoShadowBlur}
            onLogoShadowBlurChange={props.onLogoShadowBlurChange}
            logoShadowOffsetY={props.logoShadowOffsetY}
            onLogoShadowOffsetYChange={props.onLogoShadowOffsetYChange}
          />
        )}
      </div>
    </div>
  );
};
export default BoostSidebar;
